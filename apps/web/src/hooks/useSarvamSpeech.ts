'use client';

import { useCallback, useRef, useState } from 'react';
import { recordSarvamUsage } from '@/lib/sarvamTracker';

export type SarvamLanguage = 'en-IN' | 'hi-IN' | 'ta-IN' | 'te-IN' | 'bn-IN';

export interface SarvamTranscriptionResult {
  transcript: string;
  language_code: string;
  language_probability?: number;
}

interface UseSarvamSpeechOptions {
  language?: SarvamLanguage;
  detectLanguage?: boolean;
  maxDurationMs?: number;
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onLanguageDetected?: (result: SarvamTranscriptionResult) => void;
}

export type SarvamSpeechStatus =
  | 'idle'
  | 'checking'
  | 'listening'
  | 'transcribing'
  | 'unavailable'
  | 'error';

const SARVAM_API_URL = 'https://api.sarvam.ai/speech-to-text';
const SARVAM_API_KEY = process.env.NEXT_PUBLIC_SARVAM_API_KEY;

function downsampleTo16k(buffer: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) return buffer;
  const ratio = inputSampleRate / 16000;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function encodeWav(samples: Float32Array, sampleRate = 16000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // 1 channel (mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export function useSarvamSpeech(options: UseSarvamSpeechOptions) {
  const {
    language = 'hi-IN',
    detectLanguage = false,
    maxDurationMs = 30_000,
    onInterimTranscript,
    onFinalTranscript,
    onLanguageDetected,
  } = options;

  const [status, setStatus] = useState<SarvamSpeechStatus>('idle');
  const [error, setError] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(9).fill(0));
  const [hasReceivedVoice, setHasReceivedVoice] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    elapsedRef.current = null;
    timeoutRef.current = null;
    silenceTimerRef.current = null;
  }, []);

  const releaseMicrophone = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setAudioLevel(0);
    setAudioLevels(Array(9).fill(0));
  }, []);

  const stop = useCallback(async () => {
    clearTimers();
    const chunks = [...pcmChunksRef.current];
    pcmChunksRef.current = [];
    const sampleRate = audioContextRef.current?.sampleRate || 16000;
    releaseMicrophone();

    if (chunks.length === 0) {
      setStatus('idle');
      return;
    }

    setStatus('transcribing');

    try {
      if (!SARVAM_API_KEY) {
        throw new Error('Sarvam API key not configured. Add NEXT_PUBLIC_SARVAM_API_KEY to .env.local');
      }

      // Merge recorded PCM chunks
      const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
      if (totalLength < 1600) {
        // Less than 100ms of audio, ignore
        setStatus('idle');
        return;
      }

      const allSamples = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        allSamples.set(chunk, offset);
        offset += chunk.length;
      }

      // Downsample to 16kHz and create clean WAV blob
      const samples16k = downsampleTo16k(allSamples, sampleRate);
      const wavBlob = encodeWav(samples16k, 16000);

      const formData = new FormData();
      formData.append('file', wavBlob, 'audio.wav');
      formData.append('model', 'saaras:v4');
      if (detectLanguage) {
        formData.append('language_code', 'unknown');
      } else if (language) {
        formData.append('language_code', language);
      }

      const response = await fetch(SARVAM_API_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const errMsg =
          body?.error?.message ||
          body?.message ||
          body?.detail ||
          `Sarvam STT failed: ${response.status}`;
        throw new Error(errMsg);
      }

      const result = (await response.json()) as SarvamTranscriptionResult;
      const transcript = (result.transcript || '').trim();

      // Track usage
      recordSarvamUsage('stt');

      if (transcript) {
        onFinalTranscript?.(transcript);
        onInterimTranscript?.(transcript);
      }

      if (detectLanguage && transcript) {
        onLanguageDetected?.({
          transcript,
          language_code: result.language_code || language,
          language_probability: result.language_probability,
        });
      }

      setError('');
      setStatus('idle');
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Sarvam voice typing failed.';
      setError(message);
      setStatus('error');
    }
  }, [
    clearTimers,
    detectLanguage,
    language,
    onFinalTranscript,
    onInterimTranscript,
    onLanguageDetected,
    releaseMicrophone,
  ]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot record audio. You can continue by typing.');
      setStatus('unavailable');
      return;
    }

    if (!SARVAM_API_KEY) {
      setError('Sarvam API key not configured. Add NEXT_PUBLIC_SARVAM_API_KEY to .env.local');
      setStatus('unavailable');
      return;
    }

    setStatus('checking');
    setError('');
    setElapsedSeconds(0);
    setAudioLevel(0);
    setAudioLevels(Array(9).fill(0));
    setHasReceivedVoice(false);
    pcmChunksRef.current = [];

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

      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) {
        setError('Web Audio is not supported in this browser.');
        setStatus('unavailable');
        return;
      }

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.minDecibels = -85;
      analyser.maxDecibels = -20;
      analyser.smoothingTimeConstant = 0.55;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Create processor to capture raw PCM
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(inputData));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      processorRef.current = processor;

      // Monitor audio level
      const waveform = new Uint8Array(analyser.fftSize);
      const frequencies = new Uint8Array(analyser.frequencyBinCount);
      let lastVisualUpdate = 0;

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

          const hzPerBin = audioContext.sampleRate / analyser.fftSize;
          const firstBin = Math.max(1, Math.floor(100 / hzPerBin));
          const lastBin = Math.min(frequencies.length - 1, Math.ceil(4000 / hzPerBin));
          const bandWidth = Math.max(1, Math.floor((lastBin - firstBin + 1) / 9));
          const nextLevels = Array.from({ length: 9 }, (_, index) => {
            const s = firstBin + index * bandWidth;
            const e = index === 8 ? lastBin + 1 : Math.min(lastBin + 1, s + bandWidth);
            let total = 0;
            let peak = 0;
            for (let bin = s; bin < e; bin += 1) {
              total += frequencies[bin];
              peak = Math.max(peak, frequencies[bin]);
            }
            const average = total / Math.max(1, e - s);
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

      setStatus('listening');
      elapsedRef.current = setInterval(() => setElapsedSeconds((s) => Math.min(s + 1, 30)), 1000);
      timeoutRef.current = setTimeout(stop, maxDurationMs);
    } catch (microphoneError) {
      const denied =
        microphoneError instanceof DOMException && microphoneError.name === 'NotAllowedError';
      setError(
        denied
          ? 'Microphone permission denied. Allow access or continue typing.'
          : 'Could not open microphone. You can continue by typing.'
      );
      setStatus('error');
      releaseMicrophone();
    }
  }, [clearTimers, releaseMicrophone, stop]);

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