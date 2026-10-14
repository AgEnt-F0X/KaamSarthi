'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleStop,
  ClipboardList,
  FileText,
  Home,
  MessageCircle,
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
  X,
} from 'lucide-react';
import { useApp, type User, type Language } from '@/context/AppContext';
import { useAppSpeech } from '@/hooks/useAppSpeech';
import { useSarvamTTS, type SarvamTTSLanguage } from '@/hooks/useSarvamTTS';
import { VoiceActivityBars } from '@/components/VoiceActivityBars';
import { localizeJob } from '@/data/jobTranslations';
import styles from './SpokenGuide.module.css';
import {
  GUIDE_COPY,
  GUIDE_FIELDS,
  buildResumeSummary,
  detectGuideCommand,
  parseExperience,
  parseSkills,
  type GuideAction,
  type GuideField,
} from '@/lib/spokenGuide';

type Phase =
  | 'closed'
  | 'offer'
  | 'menu'
  | 'action-confirm'
  | 'question'
  | 'answer-confirm'
  | 'review'
  | 'done';

const GUIDE_ENABLED_KEY = 'kaamsarthi-spoken-guide-enabled';
const JOB_FILTER_KEY = 'kaamsarthi-guided-job-filter';

function emptyDraft(user: User | null): Record<GuideField, string> {
  return {
    name: user?.name || '',
    mobile: user?.mobile || '',
    location: user?.location || '',
    skills: user?.skills.join(', ') || '',
    experience: user ? String(user.experience) : '',
    workHistory: user?.resumeText || '',
    preferredJob: user?.preferredJob || '',
  };
}

function normalizeMobile(value: string) {
  const devanagari = '०१२३४५६७८९';
  const bengali = '০১২৩৪৫৬৭৮৯';
  const converted = value
    .split('')
    .map((character) => {
      const hiIndex = devanagari.indexOf(character);
      if (hiIndex >= 0) return String(hiIndex);
      const bnIndex = bengali.indexOf(character);
      return bnIndex >= 0 ? String(bnIndex) : character;
    })
    .join('');
  const digits = converted.replace(/\D/g, '');
  return digits || value.trim();
}

export default function SpokenGuide() {
  const { language, user, jobs, login, updateProfile } = useApp();
  const router = useRouter();
  const copy = GUIDE_COPY[language] || GUIDE_COPY.en;
  const [phase, setPhase] = useState<Phase>('closed');
  const [startupEnabled, setStartupEnabled] = useState(true);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [draft, setDraft] = useState<Record<GuideField, string>>(() => emptyDraft(user));
  const [typedAnswer, setTypedAnswer] = useState('');
  const [pendingAnswer, setPendingAnswer] = useState('');
  const [pendingAction, setPendingAction] = useState<GuideAction | null>(null);
  const [spokenPrompt, setSpokenPrompt] = useState('');
  const [heardText, setHeardText] = useState('');
  const [languageReady, setLanguageReady] = useState(false);
  const [returnToReview, setReturnToReview] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const startListeningRef = useRef<() => void>(() => {});
  const handleVoiceTextRef = useRef<(text: string) => void>(() => {});
  const openingHandledRef = useRef(false);
  const speechSequenceRef = useRef(0);
  const closeTimerRef = useRef<number | null>(null);

  const {
    start,
    stop,
    status,
    error,
    audioLevels,
    hasReceivedVoice,
    isListening,
  } = useAppSpeech({
    language,
    detectLanguage: false,
    maxDurationMs: 20_000,
    onInterimTranscript: setHeardText,
    onFinalTranscript: (text) => handleVoiceTextRef.current(text),
  });

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

  const sarvamLang = toSarvamLanguage(language);

  const { speak, cancel: stopSpeaking, isSpeaking, error: ttsError } =
    useSarvamTTS();

  const speakPrompt = useCallback(
    (text: string, listenAfter = false) => {
      stop();
      const sequence = ++speechSequenceRef.current;
      setSpokenPrompt(text);
      setHeardText('');
      speak(text, { language: sarvamLang });
      if (listenAfter && speechSequenceRef.current === sequence) {
        window.setTimeout(() => startListeningRef.current(), 250);
      }
    },
    [speak, stop, sarvamLang]
  );

  const askField = useCallback(
    (index: number) => {
      const safeIndex = Math.max(0, Math.min(GUIDE_FIELDS.length - 1, index));
      setCurrentFieldIndex(safeIndex);
      setTypedAnswer('');
      setPendingAnswer('');
      setPhase('question');
      speakPrompt(copy.fields[GUIDE_FIELDS[safeIndex]].question, true);
    },
    [copy, speakPrompt]
  );

  const openMenu = useCallback(() => {
    setPhase('menu');
    setPendingAction(null);
    speakPrompt(copy.menu, true);
  }, [copy, speakPrompt]);

  const startResumeGuide = useCallback(() => {
    setDraft(emptyDraft(user));
    setReturnToReview(false);
    speakPrompt(copy.actionDone.resume);
    window.setTimeout(() => askField(0), 500);
  }, [askField, copy, speakPrompt, user]);

  const requestAction = useCallback(
    (action: GuideAction) => {
      setPendingAction(action);
      setPhase('action-confirm');
      speakPrompt(copy.openAction[action], true);
    },
    [copy, speakPrompt]
  );

  const closeGuide = useCallback(() => {
    speechSequenceRef.current += 1;
    stop();
    stopSpeaking();
    setHeardText('');
    setTypedAnswer('');
    setIsClosing(true);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setPhase('closed');
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 180);
  }, [stop, stopSpeaking]);

  const speakSuitableJobs = useCallback(() => {
    const skills = new Set((user?.skills || []).map((skill) => skill.toLocaleLowerCase()));
    const preferred = user?.preferredJob?.toLocaleLowerCase() || '';
    const ranked = [...jobs]
      .sort((first, second) => {
        const score = (job: (typeof jobs)[number]) => {
          const category = job.category.toLocaleLowerCase();
          return Number(skills.has(category)) * 2 + Number(preferred.includes(category));
        };
        return score(second) - score(first);
      })
      .slice(0, 3)
      .map((job) => localizeJob(job, language));
    const summary = ranked
      .map((job, index) => `${index + 1}. ${job.title}, ${job.company}, ${job.salary}`)
      .join('. ');
    speakPrompt(`${copy.actionDone.jobs} ${summary}`);
  }, [copy, jobs, language, speakPrompt, user]);

  const executeAction = useCallback(
    (action: GuideAction) => {
      setPendingAction(null);
      if (action === 'resume') {
        startResumeGuide();
        return;
      }

      const routes: Record<Exclude<GuideAction, 'resume'>, string> = {
        jobs: '/jobs',
        applications: '/applied',
        assistant: '/assistant',
        home: '/home',
      };
      if (action === 'jobs') {
        const skills = new Set((user?.skills || []).map((skill) => skill.toLocaleLowerCase()));
        const preferred = user?.preferredJob?.toLocaleLowerCase() || '';
        const matchingJob = jobs.find((job) => {
          const category = job.category.toLocaleLowerCase();
          return skills.has(category) || preferred.includes(category);
        });
        localStorage.setItem(JOB_FILTER_KEY, matchingJob?.category || 'All');
      }
      router.push(routes[action]);
      setPhase('done');
      if (action === 'jobs') {
        window.setTimeout(speakSuitableJobs, 350);
      } else {
        speakPrompt(copy.actionDone[action]);
      }
    },
    [
      copy,
      jobs,
      router,
      speakPrompt,
      speakSuitableJobs,
      startResumeGuide,
      user,
    ]
  );

  const acceptAnswer = useCallback(() => {
    const field = GUIDE_FIELDS[currentFieldIndex];
    const answer = pendingAnswer.trim();
    setDraft((previous) => ({
      ...previous,
      [field]: field === 'mobile' ? normalizeMobile(answer) : answer,
    }));
    if (returnToReview) {
      setReturnToReview(false);
      setPhase('review');
      setPendingAnswer('');
      speakPrompt(copy.reviewHelp);
      return;
    }
    const nextIndex = currentFieldIndex + 1;
    if (nextIndex >= GUIDE_FIELDS.length) {
      setPhase('review');
      setPendingAnswer('');
      speakPrompt(copy.reviewHelp);
    } else {
      askField(nextIndex);
    }
  }, [
    askField,
    copy,
    currentFieldIndex,
    pendingAnswer,
    returnToReview,
    speakPrompt,
  ]);

  const acceptGuidance = useCallback(() => {
    localStorage.setItem(GUIDE_ENABLED_KEY, 'true');
    setStartupEnabled(true);
    if (user) {
      setPhase('menu');
      speakPrompt(copy.returningWelcome(user.name), true);
    } else {
      speakPrompt(copy.newWelcome);
      window.setTimeout(startResumeGuide, 500);
    }
  }, [copy, speakPrompt, startResumeGuide, user]);

  const rejectGuidance = useCallback(() => {
    localStorage.setItem(GUIDE_ENABLED_KEY, 'false');
    setStartupEnabled(false);
    closeGuide();
  }, [closeGuide]);

  const skipCurrentField = useCallback(() => {
    const nextIndex = currentFieldIndex + 1;
    if (returnToReview || nextIndex >= GUIDE_FIELDS.length) {
      setReturnToReview(false);
      setPhase('review');
      speakPrompt(copy.reviewHelp);
    } else {
      askField(nextIndex);
    }
  }, [
    askField,
    copy,
    currentFieldIndex,
    returnToReview,
    speakPrompt,
  ]);

  const submitAnswer = useCallback(
    (answer: string) => {
      const cleanAnswer = answer.trim();
      if (!cleanAnswer) return;
      setPendingAnswer(cleanAnswer);
      setTypedAnswer('');
      setHeardText(cleanAnswer);
      setPhase('answer-confirm');
      speakPrompt(copy.heard(cleanAnswer), true);
    },
    [copy, speakPrompt]
  );

  const saveGuidedProfile = useCallback(() => {
    const resumeText = buildResumeSummary(language, draft);
    const profile = {
      name: draft.name.trim() || user?.name || 'KaamSarthi Worker',
      mobile: normalizeMobile(draft.mobile),
      location: draft.location.trim(),
      skills: parseSkills(draft.skills),
      experience: parseExperience(draft.experience),
      resumeText,
      preferredJob: draft.preferredJob.trim(),
    };
    if (user) updateProfile(profile);
    else login(profile);
    setPhase('done');
    router.push('/resume');
    speakPrompt(copy.saved);
  }, [copy, draft, language, login, router, speakPrompt, updateProfile, user]);

  const handleVoiceText = useCallback(
    (text: string) => {
      const command = detectGuideCommand(text, language);
      setHeardText(text);

      if (command === 'stop') {
        closeGuide();
        return;
      }
      if (command === 'repeat') {
        speakPrompt(spokenPrompt, true);
        return;
      }
      if (phase === 'offer') {
        if (command === 'yes') {
          acceptGuidance();
        } else if (command === 'no') {
          rejectGuidance();
        } else {
          speakPrompt(copy.offer, true);
        }
        return;
      }
      if (phase === 'menu' || phase === 'done') {
        if (['resume', 'jobs', 'applications', 'assistant', 'home'].includes(command)) {
          requestAction(command as GuideAction);
        } else {
          speakPrompt(copy.menu, true);
        }
        return;
      }
      if (phase === 'action-confirm') {
        if ((command === 'yes' || command === 'continue') && pendingAction) {
          executeAction(pendingAction);
        } else if (command === 'no' || command === 'back') {
          openMenu();
        } else {
          speakPrompt(pendingAction ? copy.openAction[pendingAction] : copy.menu, true);
        }
        return;
      }
      if (phase === 'question') {
        if (command === 'back') {
          askField(currentFieldIndex - 1);
        } else if (command === 'skip') {
          skipCurrentField();
        } else {
          submitAnswer(text);
        }
        return;
      }
      if (phase === 'answer-confirm') {
        if (command === 'yes' || command === 'continue') {
          acceptAnswer();
        } else if (command === 'no' || command === 'back') {
          askField(currentFieldIndex);
        } else {
          speakPrompt(copy.heard(pendingAnswer), true);
        }
      }
    },
    [
      acceptAnswer,
      acceptGuidance,
      askField,
      closeGuide,
      copy,
      currentFieldIndex,
      executeAction,
      language,
      openMenu,
      pendingAction,
      pendingAnswer,
      phase,
      requestAction,
      rejectGuidance,
      skipCurrentField,
      speakPrompt,
      spokenPrompt,
      startResumeGuide,
      user,
    ]
  );

  handleVoiceTextRef.current = handleVoiceText;
  startListeningRef.current = () => {
    if (!isSpeaking && !isListening) void start();
  };

  useEffect(() => {
    const languageReadyHandler = () => {
      setLanguageReady(true);
      openingHandledRef.current = false;
    };
    window.addEventListener('kaamsarthi-language-ready', languageReadyHandler);
    const openGuideHandler = () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setIsClosing(false);
      setLanguageReady(true);
      if (user) {
        setPhase('menu');
        window.setTimeout(() => speakPrompt(copy.returningWelcome(user.name), true), 150);
      } else {
        setPhase('menu');
        window.setTimeout(() => speakPrompt(copy.menu, true), 150);
      }
    };
    window.addEventListener('kaamsarthi-open-guide', openGuideHandler);
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      window.removeEventListener('kaamsarthi-language-ready', languageReadyHandler);
      window.removeEventListener('kaamsarthi-open-guide', openGuideHandler);
    };
  }, [copy, speakPrompt, user]);

  useEffect(() => {
    if (!languageReady || openingHandledRef.current) return;
    openingHandledRef.current = true;
    const storedPreference = localStorage.getItem(GUIDE_ENABLED_KEY);
    setStartupEnabled(storedPreference !== 'false');
    window.setTimeout(() => {
      if (storedPreference === null) {
        setPhase('offer');
        speakPrompt(copy.offer, true);
      } else if (storedPreference === 'true') {
        if (user) {
          setPhase('menu');
          speakPrompt(copy.returningWelcome(user.name), true);
        } else {
          setPhase('question');
          speakPrompt(copy.newWelcome);
          window.setTimeout(() => askField(0), 500);
        }
      }
    }, 350);
  }, [askField, copy, languageReady, speakPrompt, user]);

  useEffect(() => {
    setDraft(emptyDraft(user));
  }, [user]);

  const setStartupPreference = (enabled: boolean) => {
    setStartupEnabled(enabled);
    localStorage.setItem(GUIDE_ENABLED_KEY, String(enabled));
  };

  if (phase === 'closed') {
    return (
      <div
        data-testid="spoken-guide-dock"
        className={`${styles.dock} fixed bottom-[72px] inset-x-0 mx-auto z-40 w-full max-w-[430px] h-14 px-4 bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(15,23,42,0.06)] flex items-center`}
      >
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent('kaamsarthi-open-guide'))
          }
          className="w-full h-10 px-4 bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 font-bold text-sm active:scale-[0.98]"
        >
          <Mic size={20} />
          {copy.talkButton}
        </button>
      </div>
    );
  }

  const field = GUIDE_FIELDS[currentFieldIndex];
  const actionButtons: Array<{ action: GuideAction; icon: React.ReactNode }> = [
    { action: 'resume', icon: <FileText size={22} /> },
    { action: 'jobs', icon: <BriefcaseBusiness size={22} /> },
    { action: 'applications', icon: <ClipboardList size={22} /> },
    { action: 'assistant', icon: <MessageCircle size={22} /> },
    { action: 'home', icon: <Home size={22} /> },
  ];

  return (
    <div
      className={`${styles.backdrop} fixed inset-0 z-[90] bg-gray-950/60 flex items-end sm:items-center justify-center ${
        isClosing ? `${styles.backdropExit} pointer-events-none` : ''
      }`}
    >
      <section
        data-testid="spoken-guide-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={copy.talkButton}
        className={`${styles.surface} w-full max-w-[430px] max-h-[94vh] overflow-y-auto overscroll-contain bg-white rounded-t-2xl sm:rounded-lg shadow-2xl ${
          isClosing ? styles.surfaceExit : ''
        }`}
      >
        <header className="sticky top-0 z-10 bg-white p-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-11 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                <Volume2 size={23} />
              </div>
              <div>
                <h2 className="font-black text-gray-950">{copy.talkButton}</h2>
                <p className="text-xs text-gray-500">
                  {isSpeaking ? 'Speaking...' : isListening ? copy.listening : copy.waiting}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeGuide}
              aria-label={copy.stop}
              title={copy.stop}
              className="size-11 flex items-center justify-center text-gray-500 bg-gray-100 rounded-lg"
            >
              <X size={22} />
            </button>
          </div>

          <label className="mt-3 flex items-center justify-between gap-3 text-sm font-bold text-gray-700">
            <span>{copy.startupLabel}</span>
            <input
              type="checkbox"
              checked={startupEnabled}
              onChange={(event) => setStartupPreference(event.target.checked)}
              className="size-5 accent-emerald-600"
            />
          </label>
        </header>

        <div key={phase} className={`${styles.phase} p-5 space-y-5`}>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-base font-bold leading-7 text-emerald-950">{spokenPrompt}</p>
            {ttsError && (
              <p className="mt-2 text-xs text-amber-800">
                Voice playback unavailable: {ttsError}. The written guide still works.
              </p>
            )}
          </div>

          {(isListening || status === 'transcribing') && (
            <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 text-center">
              <VoiceActivityBars levels={audioLevels} active={hasReceivedVoice} />
              <p className="mt-2 font-bold text-sm text-gray-800">
                {hasReceivedVoice ? copy.listening : copy.waiting}
              </p>
              {heardText && <p className="mt-2 text-sm text-blue-700">{heardText}</p>}
            </div>
          )}

          {error && (
            <p className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
              {error}
            </p>
          )}

          {(phase === 'question' || phase === 'menu') && (
            <div className="space-y-3">
              {phase === 'question' && (
                <label className="block text-sm font-bold text-gray-700">
                  {copy.fields[field].label}
                </label>
              )}
              <div className="flex gap-2">
                <input
                  value={typedAnswer}
                  onChange={(event) => setTypedAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      if (phase === 'question') submitAnswer(typedAnswer);
                      else handleVoiceText(typedAnswer);
                    }
                  }}
                  placeholder={
                    phase === 'question' ? copy.fields[field].placeholder : copy.menu
                  }
                  className="min-w-0 flex-1 h-14 px-4 bg-gray-50 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (phase === 'question') submitAnswer(typedAnswer);
                    else handleVoiceText(typedAnswer);
                  }}
                  disabled={!typedAnswer.trim()}
                  aria-label={copy.continue}
                  className="size-14 shrink-0 bg-blue-600 text-white rounded-lg flex items-center justify-center disabled:bg-gray-300"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}

          {(phase === 'offer' || phase === 'question' || phase === 'menu' || phase === 'answer-confirm' || phase === 'action-confirm') && (
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stop();
                } else {
                  stopSpeaking();
                  void start();
                }
              }}
              className={`w-full min-h-16 rounded-lg text-white font-black flex items-center justify-center gap-3 ${
                isListening ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {isListening ? <MicOff size={26} /> : <Mic size={26} />}
              {isListening ? copy.listening : 'Tap to speak'}
            </button>
          )}

          {phase === 'offer' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={acceptGuidance}
                className="min-h-14 bg-blue-600 text-white rounded-lg font-black"
              >
                {copy.correct}
              </button>
              <button
                type="button"
                onClick={rejectGuidance}
                className="min-h-14 bg-gray-100 text-gray-800 rounded-lg font-black"
              >
                {copy.tryAgain.split(',')[0]}
              </button>
            </div>
          )}

          {phase === 'menu' && (
            <div className="grid grid-cols-2 gap-3">
              {actionButtons.map(({ action, icon }) => (
                <button
                  type="button"
                  key={action}
                  onClick={() => requestAction(action)}
                  className="min-h-20 p-3 border-2 border-gray-100 bg-white rounded-lg text-gray-800 font-bold flex flex-col items-center justify-center gap-2"
                >
                  <span className="text-blue-600">{icon}</span>
                  {copy.openAction[action].replace(/[?？]$/, '')}
                </button>
              ))}
            </div>
          )}

          {phase === 'answer-confirm' && (
            <div className="space-y-3">
              <div className="p-4 border-2 border-blue-100 bg-blue-50 rounded-lg">
                <p className="text-xs font-bold text-blue-600 uppercase">{copy.fields[field].label}</p>
                <p className="mt-1 text-base font-bold text-gray-950">{pendingAnswer}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={acceptAnswer}
                  className="min-h-14 bg-blue-600 text-white rounded-lg font-black flex items-center justify-center gap-2"
                >
                  <Check size={21} />
                  {copy.correct}
                </button>
                <button
                  type="button"
                  onClick={() => askField(currentFieldIndex)}
                  className="min-h-14 bg-gray-100 text-gray-800 rounded-lg font-black flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  {copy.tryAgain}
                </button>
              </div>
            </div>
          )}

          {phase === 'action-confirm' && pendingAction && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => executeAction(pendingAction)}
                className="min-h-14 bg-blue-600 text-white rounded-lg font-black"
              >
                {copy.continue}
              </button>
              <button
                type="button"
                onClick={openMenu}
                className="min-h-14 bg-gray-100 text-gray-800 rounded-lg font-black"
              >
                {copy.back}
              </button>
            </div>
          )}

          {phase === 'question' && (
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => askField(currentFieldIndex - 1)} disabled={currentFieldIndex === 0} className="min-h-12 rounded-lg bg-gray-100 font-bold text-xs disabled:opacity-40 flex items-center justify-center gap-1">
                <ArrowLeft size={16} /> {copy.back}
              </button>
              <button type="button" onClick={() => speakPrompt(copy.fields[field].question, true)} className="min-h-12 rounded-lg bg-gray-100 font-bold text-xs flex items-center justify-center gap-1">
                <RotateCcw size={16} /> {copy.repeat}
              </button>
              <button type="button" onClick={skipCurrentField} className="min-h-12 rounded-lg bg-gray-100 font-bold text-xs">
                {copy.skip}
              </button>
            </div>
          )}

          {phase === 'review' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-gray-950">{copy.reviewTitle}</h3>
                <p className="mt-1 text-sm text-gray-600">{copy.reviewHelp}</p>
              </div>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {GUIDE_FIELDS.map((reviewField, index) => (
                  <button
                    type="button"
                    key={reviewField}
                    onClick={() => {
                      setReturnToReview(true);
                      askField(index);
                    }}
                    className="w-full p-4 text-left bg-white flex justify-between gap-3"
                  >
                    <span>
                      <span className="block text-xs font-bold text-gray-500">
                        {copy.fields[reviewField].label}
                      </span>
                      <span className="block mt-1 text-sm font-bold text-gray-950">
                        {draft[reviewField] || '-'}
                      </span>
                    </span>
                    <ChevronRight size={20} className="text-gray-300 shrink-0" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={saveGuidedProfile}
                className="w-full min-h-16 bg-blue-600 text-white rounded-lg font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
              >
                <Check size={25} />
                {copy.continue}
              </button>
            </div>
          )}

          {phase === 'done' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={openMenu}
                className="min-h-14 bg-blue-600 text-white rounded-lg font-black"
              >
                {copy.talkButton}
              </button>
              <button
                type="button"
                onClick={closeGuide}
                className="min-h-14 bg-gray-100 text-gray-800 rounded-lg font-black flex items-center justify-center gap-2"
              >
                <CircleStop size={20} />
                {copy.stop}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
