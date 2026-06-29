'use client';

import { useCallback, useRef, useState } from 'react';
import type { Language } from '@/context/AppContext';

export type GeminiStatus = 'idle' | 'thinking' | 'streaming' | 'error';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent';

function buildSystemPrompt(language: Language, profileContext?: string) {
  const langInstruction = language === 'hi'
    ? 'CRITICAL: You MUST respond ONLY in Hindi (हिन्दी). Never switch to English in your response, even if the question was typed in English. Always use Hindi script.'
    : 'CRITICAL: You MUST respond ONLY in English. Never switch to Hindi in your response, even if the user name sounds Indian.';

  const base = `You are KaamSaarthi (कामसारथी), a friendly, practical employment assistant built to help blue-collar and informal sector workers in India find jobs, build resumes, prepare for interviews, and stay safe from job scams.

${langInstruction}

Key principles:
- Be warm, encouraging, and speak simply (avoid jargon)
- Keep answers concise and actionable — these are busy workers on mobile devices
- Focus on practical, real-world advice relevant to India
- Never ask for money. Warn against any job that asks for fees upfront
- When the user profile is provided, personalize your advice to their skills, location, and experience
- If asked about something unrelated to employment, gently redirect to job-related topics
- For safety topics (scams, fraud, fake jobs), be clear and urgent

You can help with: finding jobs, improving resumes/CVs, interview preparation, salary negotiation, understanding labor rights, and identifying job scams.`;

  return profileContext ? `${base}\n\nUser profile: ${profileContext}` : base;
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface UseGeminiOptions {
  language: Language;
}

export function useGemini({ language }: UseGeminiOptions) {
  const [status, setStatus] = useState<GeminiStatus>('idle');
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async ({
      message,
      history,
      profileContext,
      onToken,
    }: {
      message: string;
      history: Array<{ role: string; content: string }>;
      profileContext?: string;
      onToken?: (text: string) => void;
    }): Promise<string> => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API key is not configured.');

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('thinking');
      setError('');

      // Build conversation history for Gemini format
      const contents: GeminiMessage[] = history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      // Build language-aware system prompt with optional profile context
      const systemInstruction = buildSystemPrompt(language, profileContext);

      // Add the current user message
      contents.push({ role: 'user', parts: [{ text: message }] });

      const body = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
          topK: 40,
          topP: 0.95,
        },
      };

      try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}&alt=sse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API error ${response.status}: ${errText}`);
        }

        setStatus('streaming');
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // SSE lines start with "data: "
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const token: string =
                parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
              if (token) {
                fullText += token;
                onToken?.(fullText);
              }
            } catch {
              // ignore parse errors on partial chunks
            }
          }
        }

        setStatus('idle');
        return fullText || (language === 'hi'
          ? 'मुझे खेद है, मैं अभी जवाब नहीं दे पा रहा। कृपया फिर से पूछें।'
          : 'Sorry, I could not generate a response. Please try again.');
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setStatus('idle');
          return '';
        }
        const msg = (err as Error).message;
        setError(msg);
        setStatus('error');
        throw err;
      }
    },
    [language]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
  }, []);

  return { generate, cancel, status, error };
}
