'use client';

import { useCallback, useRef } from 'react';
import type { Language } from '@/context/AppContext';
import { useCloudSpeech } from './useCloudSpeech';
import { useSarvamSpeech, type SarvamLanguage } from './useSarvamSpeech';

export interface UseAppSpeechOptions {
  language: Language;
  detectLanguage?: boolean;
  maxDurationMs?: number;
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onLanguageDetected?: (result: any) => void;
}

function toSarvamLanguage(lang: Language): SarvamLanguage {
  const map: Record<Language, SarvamLanguage> = {
    en: 'en-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    bn: 'bn-IN',
  };
  return map[lang] || 'hi-IN';
}

export function useAppSpeech(options: UseAppSpeechOptions) {
  const { language } = options;
  // English uses Google's built-in Web Speech API (zero latency, instant live typing).
  // Hindi, Tamil, Telugu, and Bengali use Sarvam AI STT cloud API (Saaras:v4).
  const isSarvamPrimary = language !== 'en';

  const cloud = useCloudSpeech({
    ...options,
    language: language as any,
  });

  const sarvam = useSarvamSpeech({
    ...options,
    language: toSarvamLanguage(language),
  });

  // If Sarvam is primary for the current language, use Sarvam; otherwise use Cloud (Google Web Speech)
  const activeHook = isSarvamPrimary ? sarvam : cloud;

  return activeHook;
}
