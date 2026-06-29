'use client';

import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useLocalSpeech, type SpeechLanguage } from '@/hooks/useLocalSpeech';
import { VoiceActivityBars } from '@/components/VoiceActivityBars';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  language: SpeechLanguage;
  appendTo?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onInterimTranscript,
  language,
  appendTo,
  className = '',
}) => {
  const baseTextRef = React.useRef('');
  const withBaseText = React.useCallback((text: string) => {
    return [baseTextRef.current, text.trim()].filter(Boolean).join(' ');
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
    language,
    onInterimTranscript: (text) =>
      (onInterimTranscript || onTranscript)(withBaseText(text)),
    onFinalTranscript: (text) => onTranscript(withBaseText(text)),
  });

  const label =
    status === 'transcribing'
      ? 'Writing your words...'
      : isListening
        ? `Listening ${elapsedSeconds}s`
        : '';

  return (
    <div className={`relative flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (isListening) {
            stop();
          } else {
            baseTextRef.current = appendTo?.trim() || '';
            void start();
          }
        }}
        aria-label={isListening ? 'Stop voice typing' : 'Tap to voice type'}
        title={isListening ? 'Stop voice typing' : 'Tap to voice type'}
        className={`size-12 shrink-0 rounded-full flex items-center justify-center transition-colors ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
        }`}
      >
        {isListening ? <MicOff size={21} /> : <Mic size={21} />}
      </button>

      {label && (
        <div className="absolute bottom-[calc(100%+8px)] right-0 min-w-40 bg-gray-950 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
          <VoiceActivityBars levels={audioLevels} active={hasReceivedVoice} dark />
          <p className="text-center whitespace-nowrap">{label}</p>
        </div>
      )}

      {error && (
        <div className="fixed left-4 right-4 bottom-24 z-50 mx-auto max-w-sm bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium p-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};
