'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SarvamLanguage = 'en-IN' | 'hi-IN' | 'ta-IN' | 'te-IN' | 'bn-IN';

export interface SarvamRealtimeResult {
  transcript: string;
  language_code: string;
  language_probability?: number;
  is_final: boolean;
}

export type SarvamRealtimeStatus =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'transcribing'
  | 'unavailable'
  | 'error';

const SARVAM_WS_URL = 'wss://api.sarvam.ai/speech-to-text-realtime/ws';
const SARVAM_API_KEY = process.env.NEXT_PUBLIC_SARVAM_API_KEY;

interface UseSarvamRealtimeSpeechOptions {
  language?: SarvamLanguage;
  detectLanguage?: boolean;
  maxDurationMs?: number;
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onLanguageDetected?: (result: SarvamRealtimeResult) => void;
}

export function useSarvamRealtimeSpeech(options: UseSarvamRealtimeSpeechOptions) {
  const {
    language,
    detectLanguage = false,
    maxDurationMs = 12_000,
    onInterimTranscript,
    onFinalTranscript,
    onLanguageDetected,
  } = options;

  const [status, setStatus] = useState<SarvamRealtimeStatus>('idle');
  const [error, setError] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(9).fill(0));
  const [hasReceivedVoice, setHasReceivedVoice] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const processorRef = useRef<AudioWorkletNode | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseTextRef = useRef('');
  const isConnectedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
    audioContextRef.current?.close();
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

        const hzPerBin = audioContext.sampleRate / analyser.fftSize;
        const firstBin = Math.max(1, Math.floor(100 / hzPerBin));
        const lastBin = Math.min(frequencies.length - 1, Math.ceil(4000 / hzPerBin));
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

  const sendAudioChunk = useCallback((pcmData: Float32Array) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Convert Float32Array to Int16Array (16-bit PCM)
      const int16Data = new Int16Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        const s = Math.max(-1, Math.min(1, pcmData[i]));
        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      wsRef.current.send(int16Data.buffer);
    }
  }, []);

  const setupAudioWorklet = useCallback(async (stream: MediaStream) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    // Create a simple script processor for capturing audio (fallback for browsers without AudioWorklet)
    if (audioContext.audioWorklet) {
      try {
        // Create a minimal worklet processor inline
        const workletCode = `
          class PcmProcessor extends AudioWorkletProcessor {
            process(inputs) {
              const input = inputs[0];
              if (input.length > 0) {
                this.port.postMessage(input[0]);
              }
              return true;
            }
          }
          registerProcessor('pcm-processor', PcmProcessor);
        `;
        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        await audioContext.audioWorklet.addModule(url);
        URL.revokeObjectURL(url);

        const source = audioContext.createMediaStreamSource(stream);
        const processor = new AudioWorkletNode(audioContext, 'pcm-processor');
        processor.port.onmessage = (event) => {
          sendAudioChunk(event.data);
        };
        source.connect(processor);
        processor.connect(audioContext.destination);
        processorRef.current = processor;
        return;
      } catch {
        // Fall back to ScriptProcessorNode
      }
    }

    // Fallback: ScriptProcessorNode (deprecated but widely supported)
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      sendAudioChunk(new Float32Array(inputData));
    };
    source.connect(processor);
    processor.connect(audioContext.destination);
    processorRef.current = processor as unknown as AudioWorkletNode;
  }, [sendAudioChunk]);

  const connect = useCallback(async () => {
    if (!SARVAM_API_KEY) {
      setError('Sarvam API key not configured. Add NEXT_PUBLIC_SARVAM_API_KEY to .env.local');
      setStatus('unavailable');
      return;
    }

    setStatus('connecting');
    setError('');

    try {
      const wsUrl = `${SARVAM_WS_URL}?api_key=${SARVAM_API_KEY}`;
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        isConnectedRef.current = true;
        setStatus('listening');
        
        // Send config message
        const config = {
          model: 'saaras:v3-realtime',
          language_code: detectLanguage ? 'unknown' : language || 'hi-IN',
          sample_rate: 16000,
          vad_enabled: true,
          vad_config: {
            min_silence_duration_ms: 300,
            speech_pad_ms: 200,
          },
          partial_results: true,
        };
        ws.send(JSON.stringify(config));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'transcript' || data.type === 'partial') {
            const result: SarvamRealtimeResult = {
              transcript: data.transcript || '',
              language_code: data.language_code || '',
              language_probability: data.language_probability,
              is_final: data.type === 'transcript',
            };

            if (result.transcript) {
              const fullText = [baseTextRef.current, result.transcript.trim()].filter(Boolean).join(' ');
              if (result.is_final) {
                baseTextRef.current = fullText;
                onFinalTranscript?.(fullText);
              } else {
                onInterimTranscript?.(fullText);
              }
            }

            if (detectLanguage && result.transcript.trim() && result.language_code) {
              onLanguageDetected?.({
                transcript: result.transcript,
                language_code: result.language_code,
                language_probability: result.language_probability,
                is_final: result.is_final,
              });
            }
          }
        } catch {
          // Ignore parsing errors
        }
      };

      ws.onerror = (err) => {
        console.error('Sarvam WebSocket error:', err);
        setError('Connection error. Please try again.');
        setStatus('error');
      };

      ws.onclose = () => {
        isConnectedRef.current = false;
        if (status !== 'error') {
          setStatus('idle');
        }
      };
    } catch (err) {
      setError('Failed to connect to Sarvam realtime service.');
      setStatus('error');
    }
  }, [detectLanguage, language, onFinalTranscript, onInterimTranscript, onLanguageDetected, status]);

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

    setStatus('connecting');
    setError('');
    setElapsedSeconds(0);
    setAudioLevel(0);
    setAudioLevels(Array(9).fill(0));
    setHasReceivedVoice(false);
    baseTextRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      monitorAudioLevel(stream);
      await setupAudioWorklet(stream);
      await connect();
      
      elapsedRef.current = setInterval(() => setElapsedSeconds((s) => Math.min(s + 1, 30)), 1000);
      timeoutRef.current = setTimeout(() => stop(), maxDurationMs);
    } catch (microphoneError) {
      const denied = microphoneError instanceof DOMException && microphoneError.name === 'NotAllowedError';
      setError(denied ? 'Microphone permission denied. Allow access or continue typing.' : 'Could not open microphone. You can continue by typing.');
      setStatus('error');
      releaseMicrophone();
    }
  }, [connect, maxDurationMs, monitorAudioLevel, releaseMicrophone, setupAudioWorklet]);

  const stop = useCallback(() => {
    clearTimers();
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
      wsRef.current.close();
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    releaseMicrophone();
    setStatus('idle');
  }, [clearTimers, releaseMicrophone]);

  useEffect(() => {
    return () => {
      clearTimers();
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      releaseMicrophone();
    };
  }, [clearTimers, releaseMicrophone]);

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