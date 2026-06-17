'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp, type Language, type Message } from '@/context/AppContext';
import { motion, AnimatePresence } from '@/components/motion';
import { Bot, Cpu, Send, Sparkles, Trash2 } from 'lucide-react';
import { VoiceInput } from '@/components/VoiceInput';
import { useLocalAI } from '@/hooks/useLocalAI';
import { getRuleBasedAdvice, shouldUseRuleBasedAdvice } from '@/lib/ruleBasedAdvisor';

type AIMode = 'local' | 'rules';

const copy: Record<
  Language,
  {
    title: string;
    intro: string;
    local: string;
    rules: string;
    ready: string;
    checking: string;
    fallback: string;
    thinking: string;
    quickReplies: string[];
  }
> = {
  en: {
    title: 'How can I help you?',
    intro: 'Ask about jobs, skills, resumes, interviews or job safety.',
    local: 'Local AI',
    rules: 'Simple',
    ready: 'Gemma 3 ready',
    checking: 'Checking AI',
    fallback: 'Using simple answers',
    thinking: 'Preparing your answer...',
    quickReplies: ['Find jobs', 'Improve my resume', 'Interview tips', 'Job scam safety'],
  },
  hi: {
    title: 'मैं आपकी कैसे मदद करूं?',
    intro: 'नौकरी, कौशल, रिज्यूमे, इंटरव्यू या नौकरी की सुरक्षा के बारे में पूछें।',
    local: 'लोकल AI',
    rules: 'सरल',
    ready: 'Gemma 3 तैयार',
    checking: 'AI जांच रहा है',
    fallback: 'सरल जवाब चालू',
    thinking: 'आपका जवाब तैयार हो रहा है...',
    quickReplies: ['नौकरी ढूंढें', 'रिज्यूमे सुधारें', 'इंटरव्यू टिप्स', 'नौकरी धोखे से सुरक्षा'],
  },
  ta: {
    title: 'நான் எப்படி உதவலாம்?',
    intro: 'வேலை, திறன், சுயவிவரம், நேர்காணல் அல்லது வேலை பாதுகாப்பு பற்றி கேளுங்கள்.',
    local: 'லோக்கல் AI',
    rules: 'எளியது',
    ready: 'Gemma 3 தயார்',
    checking: 'AI சோதனை',
    fallback: 'எளிய பதில்கள்',
    thinking: 'உங்கள் பதில் தயாராகிறது...',
    quickReplies: ['வேலை தேடுங்கள்', 'சுயவிவரம் மேம்படுத்து', 'நேர்காணல் குறிப்புகள்', 'வேலை மோசடி பாதுகாப்பு'],
  },
  te: {
    title: 'నేను ఎలా సహాయం చేయగలను?',
    intro: 'ఉద్యోగాలు, నైపుణ్యాలు, రెజ్యూమే, ఇంటర్వ్యూ లేదా ఉద్యోగ భద్రత గురించి అడగండి.',
    local: 'లోకల్ AI',
    rules: 'సులభం',
    ready: 'Gemma 3 సిద్ధం',
    checking: 'AI తనిఖీ',
    fallback: 'సులభ జవాబులు',
    thinking: 'మీ జవాబు సిద్ధమవుతోంది...',
    quickReplies: ['ఉద్యోగాలు వెతకండి', 'రెజ్యూమే మెరుగుపరచండి', 'ఇంటర్వ్యూ చిట్కాలు', 'ఉద్యోగ మోసం భద్రత'],
  },
  bn: {
    title: 'আমি কীভাবে সাহায্য করতে পারি?',
    intro: 'চাকরি, দক্ষতা, জীবনবৃত্তান্ত, সাক্ষাৎকার বা চাকরির নিরাপত্তা সম্পর্কে জিজ্ঞাসা করুন।',
    local: 'লোকাল AI',
    rules: 'সহজ',
    ready: 'Gemma 3 প্রস্তুত',
    checking: 'AI পরীক্ষা',
    fallback: 'সহজ উত্তর চালু',
    thinking: 'আপনার উত্তর তৈরি হচ্ছে...',
    quickReplies: ['চাকরি খুঁজুন', 'জীবনবৃত্তান্ত উন্নত করুন', 'সাক্ষাৎকার পরামর্শ', 'চাকরি প্রতারণা নিরাপত্তা'],
  },
};

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

export default function AssistantPage() {
  const { chatHistory, appendChatMessage, clearChat, t, language, user } = useApp();
  const { availability, isGenerating, checkAvailability, generate } = useLocalAI();
  const [input, setInput] = useState('');
  const [draftResponse, setDraftResponse] = useState('');
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<AIMode>('local');
  const scrollRef = useRef<HTMLDivElement>(null);
  const languageCopy = copy[language];

  useEffect(() => {
    setMounted(true);
    setMode((localStorage.getItem('kaamsarthi-ai-mode') as AIMode) || 'local');
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chatHistory, draftResponse]);

  const changeMode = (nextMode: AIMode) => {
    setMode(nextMode);
    localStorage.setItem('kaamsarthi-ai-mode', nextMode);
    if (nextMode === 'local') void checkAvailability();
  };

  const handleSend = async (message = input) => {
    const cleanMessage = message.trim();
    if (!cleanMessage || isGenerating) return;
    const previousHistory = chatHistory.map(({ role, content }) => ({ role, content }));
    appendChatMessage('user', cleanMessage);
    setInput('');

    if (mode === 'rules' || shouldUseRuleBasedAdvice(cleanMessage)) {
      appendChatMessage('assistant', getRuleBasedAdvice(cleanMessage, language));
      return;
    }

    setDraftResponse(languageCopy.thinking);
    const profileContext = user
      ? `Name: ${user.name || 'not provided'}; skills: ${user.skills.join(', ') || 'not provided'}; experience: ${user.experience} years; location: ${user.location || 'not provided'}.`
      : '';

    try {
      const available = availability === 'ready' || (await checkAvailability());
      if (!available) throw new Error('Local model unavailable');
      const answer = await generate({
        message: cleanMessage,
        language,
        history: previousHistory,
        profileContext,
        onToken: setDraftResponse,
      });
      appendChatMessage('assistant', answer);
    } catch {
      appendChatMessage('assistant', getRuleBasedAdvice(cleanMessage, language));
    } finally {
      setDraftResponse('');
    }
  };

  if (!mounted) return null;

  const statusText =
    mode === 'rules'
      ? languageCopy.fallback
      : availability === 'ready'
        ? languageCopy.ready
        : availability === 'checking'
          ? languageCopy.checking
          : languageCopy.fallback;

  return (
    <div className="flex flex-col h-[calc(100vh-128px)] bg-slate-50">
      <div className="bg-white p-4 border-b border-gray-100 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-gray-900">{t.voiceAssistant}</h1>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    mode === 'local' && availability === 'ready'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="text-[10px] text-gray-500 font-bold">{statusText}</span>
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
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg" role="group">
          <button
            type="button"
            onClick={() => changeMode('local')}
            className={`h-9 rounded-md text-xs font-bold flex items-center justify-center gap-2 ${
              mode === 'local' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Cpu size={15} />
            {languageCopy.local}
          </button>
          <button
            type="button"
            onClick={() => changeMode('rules')}
            className={`h-9 rounded-md text-xs font-bold ${
              mode === 'rules' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            {languageCopy.rules}
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {chatHistory.length === 0 && !draftResponse && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-[85%] mx-auto py-10">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
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
                  className="min-h-11 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-blue-600 shadow-sm active:scale-[0.98] transition-transform"
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

        {draftResponse && (
          <MessageBubble
            msg={{
              role: 'assistant',
              content: draftResponse,
              timestamp: new Date().toISOString(),
            }}
          />
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
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
              placeholder={t.typeQuestion}
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!input.trim() || isGenerating}
              aria-label="Send"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 disabled:text-gray-300"
            >
              <Send size={20} />
            </button>
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
