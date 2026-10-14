'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Languages, Loader2, Mic, MicOff, X } from 'lucide-react';
import { useApp, type Language } from '@/context/AppContext';
import { useSarvamSpeech, type SarvamTranscriptionResult } from '@/hooks/useSarvamSpeech';
import { VoiceActivityBars } from '@/components/VoiceActivityBars';

const LANGUAGE_OPTIONS: Array<{ code: Language; name: string; nativeName: string }> = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

interface DetectedLanguage {
  code: Language;
  name: string;
  probability: number;
}

function detectLanguageFromText(text: string): Language | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;

  // 1. Script checks
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi)
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali

  // 2. Greetings and vocabulary keywords
  // Hindi
  if (
    /\b(namaste|namaskar|namaskaar|hindi|hindee|kaam|kam|naukri|naukari|chahiye|mera|meri|mujhe|aap|kaisa|kaise|shukriya|dhanyavad)\b/i.test(
      normalized
    )
  ) {
    return 'hi';
  }
  // Tamil
  if (
    /\b(vanakkam|vanakam|tamil|thamizh|velai|veley|enakku|venum|vendum|eppadi|nandri)\b/i.test(
      normalized
    )
  ) {
    return 'ta';
  }
  // Telugu
  if (
    /\b(namaskaram|namaskaramu|telugu|pani|udyogam|udhyogam|naaku|kavali|ela|dhanyavadalu)\b/i.test(
      normalized
    )
  ) {
    return 'te';
  }
  // Bengali
  if (
    /\b(nomoshkar|nomoskar|bangla|bengali|chakri|cakri|kaj|amar|chai|kemon|achen|dhonnobad)\b/i.test(
      normalized
    )
  ) {
    return 'bn';
  }
  // English
  if (/\b(hello|english|job|jobs|work|resume|find|looking|want|help)\b/i.test(normalized)) {
    return 'en';
  }

  return null;
}

export default function VoiceLanguageSetup() {
  const { setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [sampleText, setSampleText] = useState('');
  const [detected, setDetected] = useState<DetectedLanguage | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStartedRef = useRef(false);

  const chooseLanguage = useCallback(
    (language: Language) => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setLanguage(language);
      setIsOpen(false);
      window.dispatchEvent(
        new CustomEvent('kaamsarthi-language-ready', { detail: { language } })
      );
    },
    [setLanguage]
  );

  const startCountdown = useCallback(
    (lang: Language) => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(3);
      let remaining = 3;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setCountdown(null);
          chooseLanguage(lang);
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    },
    [chooseLanguage]
  );

  const handleProcessDetected = useCallback(
    (transcript: string, sarvamLangCode?: string) => {
      const clean = transcript.trim();
      if (!clean) return;
      setSampleText(clean);

      // 1. Text / keyword / script matching (instant)
      const textMatchedCode = detectLanguageFromText(clean);

      // 2. Sarvam acoustic LID code
      let acousticCode: Language | null = null;
      if (sarvamLangCode) {
        const lower = sarvamLangCode.toLowerCase();
        if (lower.startsWith('hi')) acousticCode = 'hi';
        else if (lower.startsWith('ta')) acousticCode = 'ta';
        else if (lower.startsWith('te')) acousticCode = 'te';
        else if (lower.startsWith('bn')) acousticCode = 'bn';
        else if (lower.startsWith('en')) acousticCode = 'en';
      }

      const finalCode = textMatchedCode || acousticCode;
      if (finalCode) {
        const option = LANGUAGE_OPTIONS.find((o) => o.code === finalCode);
        if (option) {
          setDetected({ code: finalCode, name: option.name, probability: 0.95 });
          startCountdown(finalCode);
        }
      }
    },
    [startCountdown]
  );

  const {
    start,
    stop,
    status,
    error,
    elapsedSeconds,
    audioLevels,
    hasReceivedVoice,
    isListening,
  } = useSarvamSpeech({
    detectLanguage: true,
    maxDurationMs: 8_000,
    onInterimTranscript: setSampleText,
    onFinalTranscript: (text) => {
      handleProcessDetected(text);
    },
    onLanguageDetected: (result: SarvamTranscriptionResult) => {
      handleProcessDetected(result.transcript, result.language_code);
    },
  });

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen || autoStartedRef.current) return;
    autoStartedRef.current = true;
    const timer = window.setTimeout(() => void start(), 500);
    return () => window.clearTimeout(timer);
  }, [isOpen, start]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const micLabel =
    status === 'transcribing'
      ? 'Detecting language...'
      : isListening
        ? `Listening... ${elapsedSeconds}s (tap to finish)`
        : status === 'checking'
          ? 'Starting microphone...'
          : 'Tap and speak in your language';

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950/70 p-4 flex items-end sm:items-center justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-language-title"
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start gap-3">
          <div className="size-11 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
            <Languages size={22} />
          </div>
          <div>
            <h2 id="voice-language-title" className="text-base font-black text-gray-950">
              Choose your language / भाषा चुनें
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 leading-snug">
              Speak naturally or tap a button below
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Mic button */}
          <button
            type="button"
            onClick={isListening ? stop : () => void start()}
            className={`w-full min-h-14 flex items-center justify-center gap-3 rounded-xl font-bold text-sm transition-all ${
              isListening || status === 'transcribing' || status === 'checking'
                ? 'bg-red-500 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            {status === 'transcribing' ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isListening ? (
              <MicOff size={20} />
            ) : (
              <Mic size={20} />
            )}
            {micLabel}
          </button>

          {/* Audio visualization */}
          {(isListening || status === 'checking') && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
              <VoiceActivityBars levels={audioLevels} active={hasReceivedVoice} />
              <p className="mt-1.5 text-xs font-semibold text-blue-700">
                {hasReceivedVoice ? 'Voice received — tap mic when done' : 'Waiting for your voice...'}
              </p>
            </div>
          )}

          {/* What we heard */}
          {sampleText && (
            <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">We heard</p>
              <p className="mt-1 text-sm text-gray-800 font-medium">{sampleText}</p>
            </div>
          )}

          {/* Detected language + countdown */}
          {detected && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Check size={16} />
                  <p className="font-bold text-sm">
                    Detected: <span className="text-emerald-700">{detected.name}</span>
                  </p>
                </div>
                {countdown !== null && (
                  <span className="size-8 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                    {countdown}
                  </span>
                )}
              </div>
              {countdown !== null && (
                <p className="mt-1.5 text-xs text-emerald-700">
                  Selecting automatically in {countdown}s — tap below to change
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 text-center font-medium bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Divider */}
          <div className="relative text-center">
            <span className="bg-white px-2 text-xs text-gray-400 relative z-10">or choose</span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
          </div>

          {/* Language grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = detected?.code === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => chooseLanguage(opt.code)}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30'
                      : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <p className="font-bold text-base text-gray-900">{opt.nativeName}</p>
                  <p className="text-xs text-gray-400">{opt.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
