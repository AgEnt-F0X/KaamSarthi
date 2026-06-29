'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeechLanguage, SpeechStatus, TranscriptionResult, UseLocalSpeechOptions } from './useLocalSpeech';

export function useCloudSpeech({
  language,
  detectLanguage = false,
  maxDurationMs = 60_000,
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
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const maxDurationTimerRef = useRef<number | null>(null);
  const finalStringRef = useRef('');

  const releaseMicrophone = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    setAudioLevel(0);
    setAudioLevels(Array(9).fill(0));
  }, []);

  const clearTimers = useCallback(() => {
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    if (maxDurationTimerRef.current) window.clearTimeout(maxDurationTimerRef.current);
    timerIntervalRef.current = null;
    maxDurationTimerRef.current = null;
  }, []);

  const monitorAudioLevel = useCallback((stream: MediaStream) => {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
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

        setAudioLevels(nextLevels);
        setAudioLevel(level);
        if (level > 0.05) setHasReceivedVoice(true);
        lastVisualUpdate = timestamp;
      }
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };
    animationFrameRef.current = requestAnimationFrame(updateLevel);
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    } else {
      releaseMicrophone();
      setStatus('idle');
      setIsListening(false);
    }
  }, [clearTimers, releaseMicrophone]);

  const start = useCallback(async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser.');
      setStatus('unavailable');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
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
    finalStringRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      monitorAudioLevel(stream);

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (language === 'en') {
        recognition.lang = 'en-IN';
      } else {
        recognition.lang = 'en-US';
      }
      
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
         let interimTranscript = '';
         let newFinalTranscript = '';
         for (let i = event.resultIndex; i < event.results.length; ++i) {
           if (event.results[i].isFinal) {
             newFinalTranscript += event.results[i][0].transcript;
           } else {
             interimTranscript += event.results[i][0].transcript;
           }
         }
         
         if (newFinalTranscript) {
            finalStringRef.current += (finalStringRef.current ? ' ' : '') + newFinalTranscript;
         }
         
         const fullText = (finalStringRef.current + ' ' + interimTranscript).trim();
         if (fullText) {
             onInterimTranscript?.(fullText);
         }
         
         if (detectLanguage && fullText.trim()) {
            onLanguageDetected?.({
              text: fullText,
              language: language || 'en',
              languageName: language === 'hi' ? 'Hindi' : 'English',
              languageProbability: 1.0,
              supported: true,
              isFinal: false
            });
         }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        setError(`Speech recognition error: ${event.error}`);
        setStatus('error');
        stop();
      };

      recognition.onend = () => {
        releaseMicrophone();
        setStatus('idle');
        setIsListening(false);
        clearTimers();
        
        if (finalStringRef.current) {
            onFinalTranscript?.(finalStringRef.current);
            if (detectLanguage) {
               onLanguageDetected?.({
                  text: finalStringRef.current,
                  language: language || 'en',
                  languageName: language === 'hi' ? 'Hindi' : 'English',
                  languageProbability: 1.0,
                  supported: true,
                  isFinal: true
               });
            }
         }
      };

      recognition.start();
      setStatus('listening');
      setIsListening(true);

      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      maxDurationTimerRef.current = window.setTimeout(() => {
        stop();
      }, maxDurationMs);

    } catch (err) {
      setError('Could not access microphone');
      setStatus('unavailable');
    }
  }, [
    language,
    detectLanguage,
    maxDurationMs,
    monitorAudioLevel,
    onInterimTranscript,
    onFinalTranscript,
    onLanguageDetected,
    stop,
    releaseMicrophone,
    clearTimers
  ]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    start,
    stop,
    status,
    error,
    elapsedSeconds,
    audioLevels,
    hasReceivedVoice,
    isListening,
  };
}
