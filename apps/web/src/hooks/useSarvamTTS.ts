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
  const isCancelledRef = useRef<boolean>(false);

  const fallbackToBrowserTTS = useCallback((text: string, language?: SarvamTTSLanguage) => {
    if (isCancelledRef.current || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language?.replace('-IN', '-IN') || 'hi-IN';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    isCancelledRef.current = true;
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {}
      abortControllerRef.current = null;
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      } catch {}
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string, options: SarvamTTSOptions = {}) => {
      if (!text.trim()) return;

      // Stop any current speech and clear cancellation flag for new utterance
      cancel();
      isCancelledRef.current = false;

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

        if (isCancelledRef.current) return;

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.detail || `Sarvam TTS failed: ${response.status}`);
        }

        const data = await response.json();
        if (isCancelledRef.current) return;

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

        if (isCancelledRef.current) {
          URL.revokeObjectURL(audioUrl);
          return;
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          if (audioRef.current === audio) audioRef.current = null;
        };
        
        audio.onerror = () => {
          setError('Failed to play audio');
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          if (audioRef.current === audio) audioRef.current = null;
        };

        if (isCancelledRef.current) {
          URL.revokeObjectURL(audioUrl);
          return;
        }

        await audio.play();
      } catch (err) {
        if (isCancelledRef.current) {
          // Expected when cancelled/muted
          setIsSpeaking(false);
          return;
        }
        if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('aborted'))) {
          setIsSpeaking(false);
          return;
        }
        const message = err instanceof Error ? err.message : 'Sarvam TTS failed';
        setError(message);
        setIsSpeaking(false);
        
        if (!isCancelledRef.current) {
          console.warn('Sarvam TTS failed, falling back to browser SpeechSynthesis:', message);
          fallbackToBrowserTTS(text, options.language);
        }
      }
    },
    [cancel, fallbackToBrowserTTS]
  );

  return {
    speak,
    cancel,
    isSpeaking,
    error,
  };
}