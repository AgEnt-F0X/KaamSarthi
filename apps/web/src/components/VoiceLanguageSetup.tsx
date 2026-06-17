'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Languages, Mic, MicOff, ShieldCheck } from 'lucide-react';
import { useApp, type Language } from '@/context/AppContext';
import { useLocalSpeech } from '@/hooks/useLocalSpeech';
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
  isFinal: boolean;
}

export default function VoiceLanguageSetup() {
  const { setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [sampleText, setSampleText] = useState('');
  const [detected, setDetected] = useState<DetectedLanguage | null>(null);
  const [detectionMessage, setDetectionMessage] = useState('');
  const autoStartedRef = useRef(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

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
    detectLanguage: true,
    maxDurationMs: 15_000,
    updateIntervalMs: 6_000,
    onInterimTranscript: setSampleText,
    onFinalTranscript: setSampleText,
    onLanguageDetected: (result) => {
      if (result.supported) {
        const nextLanguage = {
          code: result.language as Language,
          name: result.languageName,
          probability: result.languageProbability,
          isFinal: result.isFinal,
        };
        setDetected(nextLanguage);
        setDetectionMessage('');
        if (result.isFinal && result.text.trim().length >= 2) {
          window.setTimeout(() => chooseLanguage(nextLanguage.code), 650);
        }
      } else {
        setDetected(null);
        if (result.isFinal) {
          setDetectionMessage(
            'Please speak in English, Hindi, Tamil, Telugu, or Bengali, or choose below.'
          );
        }
      }
    },
  });

  const chooseLanguage = (language: Language) => {
    setLanguage(language);
    setIsOpen(false);
    window.dispatchEvent(
      new CustomEvent('kaamsarthi-language-ready', {
        detail: { language },
      })
    );
  };

  useEffect(() => {
    if (!isOpen || autoStartedRef.current) return;
    autoStartedRef.current = true;
    const timer = window.setTimeout(() => void start(), 500);
    return () => window.clearTimeout(timer);
  }, [isOpen, start]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950/60 p-4 flex items-center justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-language-title"
        className="w-full max-w-sm max-h-[92vh] overflow-y-auto bg-white rounded-lg shadow-2xl"
      >
        <div className="p-5 border-b border-gray-100">
          <div className="size-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4">
            <Languages size={24} />
          </div>
          <h2 id="voice-language-title" className="text-xl font-bold text-gray-950">
            Speak to choose your language
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Microphone activation starts automatically. Speak one clear sentence in English,
            Hindi, Tamil, Telugu, or Bengali.
          </p>
        </div>

        <div className="p-5 space-y-5">
          <button
            type="button"
            onClick={isListening ? stop : start}
            className={`w-full min-h-16 flex items-center justify-center gap-3 rounded-lg font-bold text-base ${
              isListening ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            {status === 'transcribing'
              ? 'Detecting language...'
              : isListening
                ? `Listening automatically ${elapsedSeconds}s`
                : status === 'checking'
                  ? 'Starting microphone...'
                  : 'Start microphone again'}
          </button>

          {(isListening || status === 'checking') && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <VoiceActivityBars levels={audioLevels} active={hasReceivedVoice} />
              <p
                className={`mt-1 text-sm font-bold ${
                  hasReceivedVoice ? 'text-emerald-700' : 'text-gray-600'
                }`}
              >
                {hasReceivedVoice ? 'Voice is being received' : 'Waiting for you to speak'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Speak naturally for a few seconds. The language will be selected automatically.
              </p>
            </div>
          )}

          {sampleText && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-bold text-gray-500 uppercase">We heard</p>
              <p className="mt-1 text-sm text-gray-900">{sampleText}</p>
            </div>
          )}

          {detected && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-800">
                <Check size={18} />
                <p className="font-bold">
                  {detected.isFinal ? 'Detected' : 'Possible language'}: {detected.name}
                </p>
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                Confidence: {Math.round(detected.probability * 100)}%
              </p>
              {detected.isFinal && (
                <p className="mt-2 text-sm font-bold text-emerald-800">
                  Selecting {detected.name} automatically...
                </p>
              )}
            </div>
          )}

          {detectionMessage && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
              {detectionMessage}
            </div>
          )}

          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
              <p className="font-bold">Voice setup is unavailable</p>
              <p className="mt-1">{error}</p>
              <p className="mt-2">Choose your language below. You can still type normally.</p>
            </div>
          )}

          <div>
            <p className="text-sm font-bold text-gray-800 mb-3">Or choose manually</p>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.code}
                  onClick={() => chooseLanguage(option.code)}
                  className="min-h-14 px-3 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 focus:border-blue-500"
                >
                  <span className="block font-bold text-gray-900">{option.nativeName}</span>
                  {option.nativeName !== option.name && (
                    <span className="block text-xs text-gray-500">{option.name}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 text-xs leading-5 text-gray-500">
            <ShieldCheck size={18} className="shrink-0 text-emerald-600" />
            <p>Your recording stays on this computer and is deleted after transcription.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
