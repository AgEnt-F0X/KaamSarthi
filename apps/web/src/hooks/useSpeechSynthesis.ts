'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Language } from '@/context/AppContext';

const VOICE_LANGS: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
};

export function useSpeechSynthesis(language: Language) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!('speechSynthesis' in window) || !text.trim()) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const requested = VOICE_LANGS[language];
      utterance.lang = requested;
      utterance.rate = language === 'en' ? 0.88 : 0.82;
      utterance.pitch = 1;

      // Find the best matching voice
      const selectedVoice = 
        voices.find((v) => v.lang.toLowerCase() === requested.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(language)) ||
        (language === 'hi' ? voices.find((v) => v.name.toLowerCase().includes('hindi') || v.lang.toLowerCase().includes('hi')) : undefined);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
    },
    [language, voices]
  );

  return { speak, cancel, isSpeaking, supported: typeof window !== 'undefined' && 'speechSynthesis' in window };
}
