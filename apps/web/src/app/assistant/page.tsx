'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp, type Language, type Message } from '@/context/AppContext';
import { motion, AnimatePresence } from '@/components/motion';
import { Bot, Send, Sparkles, StopCircle, Trash2, Volume2, VolumeX, Zap } from 'lucide-react';
import { VoiceInput } from '@/components/VoiceInput';
import { useGemini } from '@/hooks/useGemini';
import { useSarvamTTS, type SarvamTTSLanguage } from '@/hooks/useSarvamTTS';
import { getRuleBasedAdvice, shouldUseRuleBasedAdvice } from '@/lib/ruleBasedAdvisor';

const copy: Record<
  Language,
  {
    title: string;
    intro: string;
    thinking: string;
    placeholder: string;
    geminiReady: string;
    quickReplies: string[];
  }
> = {
  en: {
    title: 'How can I help you?',
    intro: 'Ask about jobs, resumes, interviews, salary, or job safety.',
    thinking: 'Thinking...',
    placeholder: 'Type or speak your question...',
    geminiReady: 'Gemini AI',
    quickReplies: ['Find jobs for me', 'Improve my resume', 'Interview tips', 'Job scam safety'],
  },
  hi: {
    title: 'मैं आपकी कैसे मदद करूं?',
    intro: 'नौकरी, रिज्यूमे, इंटरव्यू, वेतन या नौकरी की सुरक्षा के बारे में पूछें।',
    thinking: 'सोच रहा हूं...',
    placeholder: 'टाइप करें या बोलें...',
    geminiReady: 'Gemini AI',
    quickReplies: ['मेरे लिए नौकरी ढूंढें', 'रिज्यूमे सुधारें', 'इंटरव्यू टिप्स', 'नौकरी धोखे से सुरक्षा'],
  },
  ta: {
    title: 'நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    intro: 'வேலைகள், சுயவிவரங்கள், நேர்காணல்கள், சம்பளம் அல்லது வேலை பாதுகாப்பு பற்றி கேளுங்கள்।',
    thinking: 'சிந்திக்கிறது...',
    placeholder: 'உங்கள் கேள்வியை தட்டச்சு செய்வது அல்லது பேசுதல்...',
    geminiReady: 'Gemini AI',
    quickReplies: ['எனக்கு வேலை கண்டுபிடிக்கவும்', 'என் சுயவிவரத்தை மேம்படுத்தவும்', 'நேர்காணல் விதிகள்', 'வேலை மோசடி பாதுகாப்பு'],
  },
  te: {
    title: 'నేను మీకు ఎలా సహాయపడగలను?',
    intro: 'ఉద్యోగాలు, రెజ్యూమేలు, ఇంటర్వ్యూలు, జీతం లేదా ఉద్యోగ భద్రత గురించి అడగండి।',
    thinking: 'ఆలోచిస్తోంది...',
    placeholder: 'మీ ప్రశ్నను టైప్ చేయండి లేదా మాట్లాడండి...',
    geminiReady: 'Gemini AI',
    quickReplies: ['నాకు ఉద్యోగం కనుగొనండి', 'నా రెజ్యూమేని మెరుగుపరచండి', 'ఇంటర్వ్యూ చిట్కాలు', 'ఉద్యోగ అపరాధ భద్రత'],
  },
  bn: {
    title: 'আমি আপনাকে কিভাবে সাহায্য করতে পারি?',
    intro: 'চাকরি, রেজিউমে, ইন্টারভিউ, বেতন বা চাকরির নিরাপত্তা নিয়ে প্রশ্ন করুন।',
    thinking: 'চিন্তা করছে...',
    placeholder: 'আপনার প্রশ্ন টাইপ করুন বা বলুন...',
    geminiReady: 'Gemini AI',
    quickReplies: ['আমার জন্য চাকরি খুঁজুন', 'আমার রেজিউমে উন্নত করুন', 'ইন্টারভিউ টিপস', 'চাকরির প্রতারণা থেকে সুরক্ষা'],
  },
};

function toSarvamLanguage(lang: Language): SarvamTTSLanguage {
  const map: Record<Language, SarvamTTSLanguage> = {
    en: 'en-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    bn: 'bn-IN',
  };
  return map[lang] || 'hi-IN';
}

function MessageBubble({ msg }: { msg: Pick<Message, 'role' | 'content' | 'timestamp'> }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(
      new Date(msg.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, [msg.timestamp]);

  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
          msg.role === 'user'
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
        }`}
      >
        <p className="font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        {time && (
          <p
            className={`text-[10px] mt-1.5 opacity-60 font-bold ${
              msg.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            {time}
          </p>
        )}
      </div>
    </div>
  );
}

function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] p-4 rounded-2xl text-sm shadow-sm bg-white text-gray-800 border border-gray-100 rounded-bl-none">
        <p className="font-medium leading-relaxed whitespace-pre-wrap">{text}</p>
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-600 rounded-sm animate-pulse align-middle" />
      </div>
    </div>
  );
}

export default function AssistantPage() {
  const { chatHistory, appendChatMessage, clearChat, t, language, user } = useApp();
  const { generate, cancel, status: geminiStatus } = useGemini({ language });
  const sarvamLang = toSarvamLanguage(language);
  const { speak, cancel: stopSpeaking, isSpeaking } = useSarvamTTS();
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const ttsEnabledRef = useRef(ttsEnabled);
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const languageCopy = copy[language];
  const isGenerating = geminiStatus === 'thinking' || geminiStatus === 'streaming';
  const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);

  const handleToggleMute = () => {
    setTtsEnabled((prev) => {
      const next = !prev;
      ttsEnabledRef.current = next;
      if (!next) {
        stopSpeaking();
      }
      return next;
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatHistory, streamingText]);

  const handleSend = async (message = input) => {
    const cleanMessage = message.trim();
    if (!cleanMessage || isGenerating) return;

    const previousHistory = chatHistory.map(({ role, content }) => ({ role, content }));
    appendChatMessage('user', cleanMessage);
    setInput('');
    setStreamingText('');

    // Always use rule-based for critical safety topics
    if (shouldUseRuleBasedAdvice(cleanMessage)) {
      const advice = getRuleBasedAdvice(cleanMessage, language);
      appendChatMessage('assistant', advice);
      if (ttsEnabledRef.current) speak(advice, { language: sarvamLang });
      return;
    }

    if (!hasApiKey) {
      const advice = getRuleBasedAdvice(cleanMessage, language);
      appendChatMessage('assistant', advice);
      if (ttsEnabledRef.current) speak(advice, { language: sarvamLang });
      return;
    }

    const profileContext = user
      ? `Name: ${user.name || 'not provided'}; skills: ${user.skills.join(', ') || 'not provided'}; experience: ${user.experience} years; location: ${user.location || 'not provided'}.`
      : '';

    try {
      setStreamingText(languageCopy.thinking);
      const answer = await generate({
        message: cleanMessage,
        history: previousHistory,
        profileContext,
        onToken: setStreamingText,
      });
      if (answer) {
        appendChatMessage('assistant', answer);
        if (ttsEnabledRef.current) speak(answer, { language: sarvamLang });
      }
    } catch {
      const advice = getRuleBasedAdvice(cleanMessage, language);
      appendChatMessage('assistant', advice);
      if (ttsEnabledRef.current) speak(advice, { language: sarvamLang });
    } finally {
      setStreamingText('');
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-128px)] bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900">{t.voiceAssistant}</h1>
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-emerald-500 fill-emerald-500" />
              <span className="text-[10px] text-gray-500 font-bold">
                {hasApiKey ? languageCopy.geminiReady : 'Simple mode'}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={clearChat}
          aria-label={t.clearChat}
          title={t.clearChat}
          className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={ttsEnabled ? 'Mute voice' : 'Enable voice'}
          title={ttsEnabled ? 'Mute voice' : 'Enable voice'}
          className={`p-2 transition-colors ${ttsEnabled ? 'text-blue-600' : 'text-gray-400'}`}
        >
          {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {chatHistory.length === 0 && !streamingText && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-[85%] mx-auto py-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-violet-50 rounded-2xl flex items-center justify-center">
              <Sparkles className="text-blue-600" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">{languageCopy.title}</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                {languageCopy.intro}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              {languageCopy.quickReplies.map((reply) => (
                <button
                  type="button"
                  key={reply}
                  onClick={() => void handleSend(reply)}
                  className="min-h-11 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-blue-600 shadow-sm active:scale-[0.98] transition-transform"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {chatHistory.map((msg) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={msg.id}
            >
              <MessageBubble msg={msg} />
            </motion.div>
          ))}
        </AnimatePresence>

        {streamingText && <StreamingBubble text={streamingText} />}
      </div>

      {/* Input bar */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleSend();
              }}
              disabled={isGenerating}
              className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium disabled:opacity-60"
              placeholder={languageCopy.placeholder}
            />
            {isGenerating ? (
              <button
                type="button"
                onClick={cancel}
                aria-label="Stop"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-rose-500"
              >
                <StopCircle size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!input.trim()}
                aria-label="Send"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 disabled:text-gray-300"
              >
                <Send size={20} />
              </button>
            )}
          </div>
          <VoiceInput
            language={language}
            appendTo={input}
            onInterimTranscript={setInput}
            onTranscript={setInput}
          />
        </div>
      </div>
    </div>
  );
}
