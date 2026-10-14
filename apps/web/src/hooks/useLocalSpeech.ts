'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechLanguage = 'en' | 'hi' | 'ta' | 'te' | 'bn';
export type SpeechStatus =
  | 'idle'
  | 'checking'
  | 'listening'
  | 'transcribing'
  | 'unavailable'
  | 'error';

export interface TranscriptionResult {
  text: string;
  language: string;
  languageName: string;
  languageProbability: number;
  supported: boolean;
  isFinal: boolean;
}

export interface UseLocalSpeechOptions {
  language?: SpeechLanguage;
  detectLanguage?: boolean;
  maxDurationMs?: number;
  updateIntervalMs?: number;
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onLanguageDetected?: (result: TranscriptionResult) => void;
}

const SPEECH_API_URL =
  process.env.NEXT_PUBLIC_SPEECH_API_URL || 'http://127.0.0.1:8765';

function preferredMimeType() {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  return options.find((type) => MediaRecorder.isTypeSupported(type)) || '';
}

import { useCloudSpeech } from './useCloudSpeech';

export function useLocalSpeech(options: UseLocalSpeechOptions) {
  const isCloudSupported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const cloud = useCloudSpeech(options);
  const local = useLocalSpeechBackend(options);
  return isCloudSupported ? cloud : local;
}

function useLocalSpeechBackend({
  language,
  detectLanguage = false,
  maxDurationMs = 30_000,
  updateIntervalMs = 6_000,
  onInterimTranscript,
  onFinalTranscript,
  onLanguageDetected,
}: UseLocalSpeechOptions) {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const [error, setError] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(9).fill(0));
  const [hasReceivedVoice, setHasReceivedVoice] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestInFlightRef = useRef(false);
  const pendingSnapshotRef = useRef(false);
  const finalRequestedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    elapsedRef.current = null;
    timeoutRef.current = null;
  }, []);

  const releaseMicrophone = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    setAudioLevel(0);
    setAudioLevels(Array(9).fill(0));
  }, []);

  const monitorAudioLevel = useCallback((stream: MediaStream) => {
    const AudioContextClass =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 512;
    analyser.minDecibels = -85;
    analyser.maxDecibels = -20;
    analyser.smoothingTimeConstant = 0.55;
    const waveform = new Uint8Array(analyser.fftSize);
    const frequencies = new Uint8Array(analyser.frequencyBinCount);
    let lastVisualUpdate = 0;
    source.connect(analyser);
    audioContextRef.current = audioContext;

    const updateLevel = (timestamp: number) => {
      analyser.getByteTimeDomainData(waveform);
      let sumSquares = 0;
      for (const sample of waveform) {
        const normalized = (sample - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / waveform.length);
      const level = Math.min(1, rms * 7);

      if (timestamp - lastVisualUpdate >= 33) {
        analyser.getByteFrequencyData(frequencies);

        // Human speech is concentrated roughly between 100 Hz and 4 kHz.
        const hzPerBin = audioContext.sampleRate / analyser.fftSize;
        const firstBin = Math.max(1, Math.floor(100 / hzPerBin));
        const lastBin = Math.min(
          frequencies.length - 1,
          Math.ceil(4000 / hzPerBin)
        );
        const bandWidth = Math.max(1, Math.floor((lastBin - firstBin + 1) / 9));
        const nextLevels = Array.from({ length: 9 }, (_, index) => {
          const start = firstBin + index * bandWidth;
          const end = index === 8 ? lastBin + 1 : Math.min(lastBin + 1, start + bandWidth);
          let total = 0;
          let peak = 0;
          for (let bin = start; bin < end; bin += 1) {
            total += frequencies[bin];
            peak = Math.max(peak, frequencies[bin]);
          }
          const average = total / Math.max(1, end - start);
          const spectralLevel = (average * 0.65 + peak * 0.35) / 255;
          return Math.min(1, spectralLevel * 1.65 + level * 0.3);
        });

        setAudioLevel(level);
        setAudioLevels(nextLevels);
        if (level > 0.055 || Math.max(...nextLevels) > 0.14) {
          setHasReceivedVoice(true);
        }
        lastVisualUpdate = timestamp;
      }
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    animationFrameRef.current = requestAnimationFrame(updateLevel);
  }, []);

  const sendSnapshot = useCallback(
    async (isFinal: boolean) => {
      if (chunksRef.current.length === 0) return;
      if (requestInFlightRef.current) {
        pendingSnapshotRef.current = true;
        if (isFinal) finalRequestedRef.current = true;
        return;
      }

      requestInFlightRef.current = true;
      pendingSnapshotRef.current = false;
      setStatus('transcribing');

      try {
        const mimeType = recorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const extension = mimeType.includes('ogg') ? 'ogg' : 'webm';
        const formData = new FormData();
        formData.append('audio', audioBlob, `speech.${extension}`);
        formData.append('detect_language', String(detectLanguage));
        formData.append('is_final', String(isFinal));
        if (language && !detectLanguage) formData.append('language', language);

        const response = await fetch(`${SPEECH_API_URL}/transcribe`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.detail || 'Local speech service could not transcribe the audio.');
        }

        const result = (await response.json()) as TranscriptionResult;
        if (result.text) {
          if (isFinal) onFinalTranscript?.(result.text);
          else onInterimTranscript?.(result.text);
        }
        if (detectLanguage && result.text.trim()) {
          onLanguageDetected?.({ ...result, isFinal });
        }
        setError('');
        setStatus(recorderRef.current?.state === 'recording' ? 'listening' : 'idle');
      } catch (requestError) {
        const message =
          requestError instanceof Error ? requestError.message : 'Local voice typing failed.';
        setError(message);
        setStatus('error');
      } finally {
        requestInFlightRef.current = false;
        const shouldSendAgain = pendingSnapshotRef.current;
        const shouldBeFinal = finalRequestedRef.current;
        pendingSnapshotRef.current = false;
        finalRequestedRef.current = false;
        if (shouldSendAgain) void sendSnapshot(shouldBeFinal);
      }
    },
    [
      detectLanguage,
      language,
      onFinalTranscript,
      onInterimTranscript,
      onLanguageDetected,
    ]
  );

  const stop = useCallback(() => {
    clearTimers();
    const recorder = recorderRef.current;
    if (recorder?.state === 'recording') {
      recorder.stop();
    } else {
      releaseMicrophone();
      setStatus('idle');
    }
  }, [clearTimers, releaseMicrophone]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('This browser cannot record audio. You can continue by typing.');
      setStatus('unavailable');
      return;
    }

    setStatus('checking');
    setError('');
    setElapsedSeconds(0);
    setAudioLevel(0);
    setAudioLevels(Array(9).fill(0));
    setHasReceivedVoice(false);
    chunksRef.current = [];

    try {
      const healthResponse = await fetch(`${SPEECH_API_URL}/health`, {
        signal: AbortSignal.timeout(2500),
      });
      if (!healthResponse.ok) throw new Error('Speech service unavailable');
    } catch {
      setError('Local voice typing is not running. Start KaamSarthi with start-kaamsarthi.cmd.');
      setStatus('unavailable');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      monitorAudioLevel(stream);
      const mimeType = preferredMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        clearTimers();
        releaseMicrophone();
        setError('The microphone stopped unexpectedly. You can continue by typing.');
        setStatus('error');
      };
      recorder.onstop = () => {
        clearTimers();
        releaseMicrophone();
        void sendSnapshot(true);
      };

      recorder.start(1000);
      setStatus('listening');
      intervalRef.current = setInterval(() => void sendSnapshot(false), updateIntervalMs);
      elapsedRef.current = setInterval(
        () => setElapsedSeconds((seconds) => Math.min(seconds + 1, 30)),
        1000
      );
      timeoutRef.current = setTimeout(stop, maxDurationMs);
    } catch (microphoneError) {
      const denied =
        microphoneError instanceof DOMException && microphoneError.name === 'NotAllowedError';
      setError(
        denied
          ? 'Microphone permission was denied. Allow microphone access or continue by typing.'
          : 'The microphone could not be opened. You can continue by typing.'
      );
      setStatus('error');
      releaseMicrophone();
    }
  }, [
    clearTimers,
    maxDurationMs,
    monitorAudioLevel,
    releaseMicrophone,
    sendSnapshot,
    stop,
    updateIntervalMs,
  ]);

  useEffect(
    () => () => {
      clearTimers();
      const recorder = recorderRef.current;
      if (recorder?.state === 'recording') recorder.stop();
      releaseMicrophone();
    },
    [clearTimers, releaseMicrophone]
  );

  return {
    start,
    stop,
    status,
    error,
    elapsedSeconds,
    audioLevel,
    audioLevels,
    hasReceivedVoice,
    isListening: status === 'listening' || status === 'transcribing',
  };
}
