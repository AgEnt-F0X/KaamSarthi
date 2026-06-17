'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Language, Message } from '@/context/AppContext';

type Availability = 'checking' | 'ready' | 'unavailable';

interface GenerateOptions {
  message: string;
  language: Language;
  history?: Pick<Message, 'role' | 'content'>[];
  profileContext?: string;
  onToken?: (completeText: string) => void;
}

const CACHE_KEY = 'kaamsarthi-ai-cache-v2';

function cacheId(message: string, language: Language, profileContext = '') {
  let hash = 2166136261;
  const value = `${language}|${profileContext}|${message.trim().toLocaleLowerCase()}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `gemma3-1b-native-${(hash >>> 0).toString(16)}`;
}

function readCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function useLocalAI() {
  const [availability, setAvailability] = useState<Availability>('checking');
  const [isGenerating, setIsGenerating] = useState(false);

  const checkAvailability = useCallback(async () => {
    setAvailability('checking');
    try {
      const response = await fetch('/api/local-ai', {
        cache: 'no-store',
        signal: AbortSignal.timeout(3500),
      });
      const data = (await response.json()) as { available?: boolean };
      setAvailability(data.available ? 'ready' : 'unavailable');
      return Boolean(data.available);
    } catch {
      setAvailability('unavailable');
      return false;
    }
  }, []);

  useEffect(() => {
    void checkAvailability();
  }, [checkAvailability]);

  const generate = useCallback(async (options: GenerateOptions) => {
    const id = cacheId(options.message, options.language, options.profileContext);
    const cached = readCache()[id];
    if (cached) {
      options.onToken?.(cached);
      return cached;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/local-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (!response.ok || !response.body) throw new Error('Local AI is unavailable.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completeText = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        completeText += decoder.decode(value, { stream: true });
        options.onToken?.(completeText);
      }
      completeText = completeText.trim();
      if (!completeText) throw new Error('Local AI returned an empty answer.');

      const cache = readCache();
      cache[id] = completeText;
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(Object.fromEntries(Object.entries(cache).slice(-30)))
      );
      setAvailability('ready');
      return completeText;
    } catch (error) {
      setAvailability('unavailable');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { availability, isGenerating, checkAvailability, generate };
}
