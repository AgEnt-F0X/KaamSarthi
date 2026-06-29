'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Languages, Loader2, Mic, MicOff, X } from 'lucide-react';
import { useApp, type Language } from '@/context/AppContext';
import { useLocalSpeech } from '@/hooks/useLocalSpeech';
import { VoiceActivityBars } from '@/components/VoiceActivityBars';

const LANGUAGE_OPTIONS: Array<{ code: Language; name: string; nativeName: string }> = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

interface DetectedLanguage {
  code: Language;
  name: string;
  probability: number;
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

  const {
    start,
    stop,
    status,
    error,
    elapsedSeconds,
    audioLevels,
    hasReceivedVoice,
    isListening,
  } = useLocalSpeech({
    // Use local whisper backend for detection: no language hint means it auto-detects
    detectLanguage: true,
    maxDurationMs: 12_000,
    updateIntervalMs: 2_500,  // longer chunks = more accurate language detection
    onInterimTranscript: setSampleText,
    onFinalTranscript: (text) => {
      setSampleText(text);
      // If user explicitly says "Hindi" (case‑insensitive), force Hindi language selection
      if (/\bhindi\b/i.test(text)) {
        // Directly choose Hindi without countdown
        chooseLanguage('hi');
      }
    },
    onLanguageDetected: (result) => {
      if (result.supported && result.isFinal) {
        const code = result.language as Language;
        const option = LANGUAGE_OPTIONS.find((o) => o.code === code);
        if (option) {
          setDetected({ code, name: option.name, probability: result.languageProbability });
          startCountdown(code);
        }
      } else if (result.supported && !result.isFinal) {
        const code = result.language as Language;
        const option = LANGUAGE_OPTIONS.find((o) => o.code === code);
        if (option) {
          setDetected({ code, name: option.name, probability: result.languageProbability });
        }
      }
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
        ? `Listening... ${elapsedSeconds}s`
        : status === 'checking'
          ? 'Starting microphone...'
          : 'Try again';

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
                {hasReceivedVoice ? 'Voice received — keep speaking' : 'Waiting for your voice...'}
              </p>
            </div>
          )}

          {/* What we heard */}
          {sampleText && (
            <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">We heard</p>
              <p className="mt-1 text-sm text-gray-800">{sampleText}</p>
            </div>
          )}

          {/* Detected language + countdown */}
          {detected && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
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

          {/* Error */}
          {error && !isListening && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              Voice detection unavailable. Choose your language below.
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-100" />
            <span className="text-xs text-gray-400 font-semibold">or choose</span>
            <div className="flex-1 border-t border-gray-100" />
          </div>

          {/* Manual language buttons */}
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.code}
                onClick={() => chooseLanguage(option.code)}
                className={`flex flex-col items-center justify-center p-4 min-h-20 rounded-xl border-2 transition-all ${
                  detected?.code === option.code
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-gray-100 bg-white hover:border-blue-300 hover:bg-blue-50 text-gray-950'
                }`}
              >
                <span className="text-xl font-black">{option.nativeName}</span>
                <span className="mt-1 text-xs font-medium text-gray-500">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
