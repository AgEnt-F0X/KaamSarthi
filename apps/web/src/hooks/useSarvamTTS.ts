'use client';

import { useCallback, useRef, useState } from 'react';
import { recordSarvamUsage } from '@/lib/sarvamTracker';

export type SarvamTTSLanguage = 'en-IN' | 'hi-IN' | 'ta-IN' | 'te-IN' | 'bn-IN' | 'gu-IN' | 'kn-IN' | 'ml-IN' | 'mr-IN' | 'od-IN' | 'pa-IN';

export interface SarvamTTSOptions {
  language?: SarvamTTSLanguage;
  speaker?: string;
  pace?: number;
  pitch?: number;
  loudness?: number;
  sampleRate?: number;
  model?: 'bulbul:v3' | 'bulbul:v2';
}

const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';
const SARVAM_API_KEY = process.env.NEXT_PUBLIC_SARVAM_API_KEY;

// Default speakers per language for bulbul:v3
const DEFAULT_SPEAKERS: Record<SarvamTTSLanguage, string> = {
  'en-IN': 'shubh',
  'hi-IN': 'shubh',
  'ta-IN': 'shubh',
  'te-IN': 'shubh',
  'bn-IN': 'shubh',
  'gu-IN': 'shubh',
  'kn-IN': 'shubh',
  'ml-IN': 'shubh',
  'mr-IN': 'shubh',
  'od-IN': 'shubh',
  'pa-IN': 'shubh',
};

export function useSarvamTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const speak = useCallback(
    async (text: string, options: SarvamTTSOptions = {}) => {
      if (!text.trim()) return;

      // Stop any current speech
      cancel();

      if (!SARVAM_API_KEY) {
        setError('Sarvam API key not configured. Add NEXT_PUBLIC_SARVAM_API_KEY to .env.local');
        return;
      }

      setError('');
      setIsSpeaking(true);

      const language = options.language || 'hi-IN';
      const speaker = options.speaker || DEFAULT_SPEAKERS[language] || 'shubh';

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch(SARVAM_TTS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': SARVAM_API_KEY,
          },
          body: JSON.stringify({
            text,
            language_code: language,
            speaker,
            model: options.model || 'bulbul:v3',
            pace: options.pace ?? 1.0,
            speech_sample_rate: options.sampleRate || 24000,
            output_audio_codec: 'mp3',
            temperature: 0.6,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.detail || `Sarvam TTS failed: ${response.status}`);
        }

        const data = await response.json();
        const audioBase64 = data.audios?.[0];
        
        if (!audioBase64) {
          throw new Error('No audio data received from Sarvam TTS');
        }

        // Track usage
        recordSarvamUsage('tts');

        // Convert base64 to blob and play
        const binaryString = atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(blob);

        audioRef.current = new Audio(audioUrl);
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audioRef.current.onerror = () => {
          setError('Failed to play audio');
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audioRef.current.play();
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Expected when cancelled
          return;
        }
        const message = err instanceof Error ? err.message : 'Sarvam TTS failed';
        setError(message);
        setIsSpeaking(false);
        
        // Fallback to browser TTS
        console.warn('Sarvam TTS failed, falling back to browser SpeechSynthesis:', message);
        fallbackToBrowserTTS(text, options.language);
      }
    },
    []
  );

  const fallbackToBrowserTTS = useCallback((text: string, language?: SarvamTTSLanguage) => {
    if (!('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language?.replace('-IN', '-IN') || 'hi-IN';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    error,
  };
}