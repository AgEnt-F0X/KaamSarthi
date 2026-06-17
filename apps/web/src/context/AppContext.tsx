'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, seedJobs } from '../data/constants';
import { toast } from 'sonner';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn';

export interface User {
  id: string;
  name: string;
  mobile: string;
  skills: string[];
  experience: number;
  location: string;
  resumeText: string;
  preferredJob?: string;
  resumeScore: number;
  createdAt: string;
}

interface Application {
  id: string;
  jobId: number;
  jobTitle: string;
  company: string;
  status: 'Applied' | 'Pending' | 'Interview' | 'Selected' | 'Rejected';
  appliedOn: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoggedIn: boolean;
  user: User | null;
  jobs: typeof seedJobs;
  applications: Application[];
  chatHistory: Message[];
  t: (typeof translations)['en'];
  login: (userData: Partial<User>) => void;
  logout: () => void;
  applyForJob: (jobId: number) => void;
  updateApplicationStatus: (appId: string, status: Application['status']) => void;
  withdrawApplication: (appId: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  appendChatMessage: (role: Message['role'], content: string) => string;
  sendMessage: (content: string) => void;
  clearChat: () => void;
  calculateResumeScore: (userData: User) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState(seedJobs);
  const [applications, setApplications] = useState<Application[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('kaamsarthi');
    if (stored) {
      const data = JSON.parse(stored);
      setLanguageState(data.language || 'en');
      setIsLoggedIn(data.isLoggedIn || false);
      setUser(data.user || null);
      setApplications(data.applications || []);
      setChatHistory(data.chatHistory || []);
    } else {
      const initialDate = '12 Jan 2025';
      const initialApplications: Application[] = [
        {
          id: 'app-1',
          jobId: 1,
          jobTitle: seedJobs[0].title,
          company: seedJobs[0].company,
          status: 'Applied',
          appliedOn: initialDate,
        },
        {
          id: 'app-2',
          jobId: 2,
          jobTitle: seedJobs[1].title,
          company: seedJobs[1].company,
          status: 'Pending',
          appliedOn: initialDate,
        },
        {
          id: 'app-3',
          jobId: 5,
          jobTitle: seedJobs[4].title,
          company: seedJobs[4].company,
          status: 'Interview',
          appliedOn: initialDate,
        },
      ];
      setApplications(initialApplications);
      const initialData = {
        language: 'en',
        isLoggedIn: false,
        user: null,
        applications: initialApplications,
        chatHistory: [],
      };
      localStorage.setItem('kaamsarthi', JSON.stringify(initialData));
    }
  }, []);

  const saveToStorage = useCallback((data: any) => {
    const currentStr = localStorage.getItem('kaamsarthi') || '{}';
    const current = JSON.parse(currentStr);
    localStorage.setItem('kaamsarthi', JSON.stringify({ ...current, ...data }));
  }, []);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      saveToStorage({ language: lang });
    },
    [saveToStorage]
  );

  const calculateResumeScore = useCallback((userData: User) => {
    let score = 0;
    if (userData.name) score += 20;
    if (userData.skills && userData.skills.length > 0) score += 20;
    if (userData.experience >= 0) score += 20;
    if (userData.location) score += 20;
    if (userData.resumeText && userData.resumeText.length > 20) score += 20;
    return score;
  }, []);

  const login = useCallback(
    (userData: Partial<User>) => {
      const now = new Date(); // Only called on event
      const newUser: User = {
        id: `user-${now.getTime()}`,
        name: userData.name || '',
        mobile: userData.mobile || '',
        skills: userData.skills || [],
        experience: userData.experience || 0,
        location: userData.location || '',
        resumeText: userData.resumeText || '',
        preferredJob: userData.preferredJob || '',
        resumeScore: 0,
        createdAt: now.toISOString(),
        ...userData,
      };
      newUser.resumeScore = calculateResumeScore(newUser);
      setUser(newUser);
      setIsLoggedIn(true);
      saveToStorage({ isLoggedIn: true, user: newUser });
    },
    [calculateResumeScore, saveToStorage]
  );

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    saveToStorage({ isLoggedIn: false, user: null });
  }, [saveToStorage]);

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      setUser((prev) => {
        if (!prev) return null;
        const updatedUser = { ...prev, ...updates };
        updatedUser.resumeScore = calculateResumeScore(updatedUser);
        saveToStorage({ user: updatedUser });
        return updatedUser;
      });
    },
    [calculateResumeScore, saveToStorage]
  );

  const applyForJob = useCallback(
    (jobId: number) => {
      const job = seedJobs.find((j) => j.id === jobId);
      if (!job) return;

      setApplications((prev) => {
        if (prev.some((app) => app.jobId === jobId)) {
          toast.error('Already applied!');
          return prev;
        }

        const now = new Date();
        const newApp: Application = {
          id: `app-${now.getTime()}`,
          jobId,
          jobTitle: job.title,
          company: job.company,
          status: 'Applied',
          appliedOn: now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        };

        const newApps = [newApp, ...prev];
        saveToStorage({ applications: newApps });
        toast.success('Application submitted! 🎉');
        return newApps;
      });
    },
    [saveToStorage]
  );

  const updateApplicationStatus = useCallback(
    (appId: string, status: Application['status']) => {
      setApplications((prev) => {
        const newApps = prev.map((app) => (app.id === appId ? { ...app, status } : app));
        saveToStorage({ applications: newApps });
        return newApps;
      });
    },
    [saveToStorage]
  );

  const withdrawApplication = useCallback(
    (appId: string) => {
      setApplications((prev) => {
        const newApps = prev.filter((app) => app.id !== appId);
        saveToStorage({ applications: newApps });
        return newApps;
      });
    },
    [saveToStorage]
  );

  const sendMessage = useCallback(
    (content: string) => {
      const now = new Date();
      const userMsg: Message = {
        id: `msg-user-${now.getTime()}`,
        role: 'user',
        content,
        timestamp: now.toISOString(),
      };

      let aiResponse = '';
      const lower = content.toLowerCase();
      if (
        lower.includes('job') ||
        lower.includes('नौकरी') ||
        lower.includes('வேலை') ||
        lower.includes('ఉద్యోగం') ||
        lower.includes('চাকরি')
      ) {
        aiResponse =
          'I can help you find jobs in Driver, Delivery, Factory, and more categories. Visit the Jobs tab to browse all open positions!';
      } else if (
        lower.includes('resume') ||
        lower.includes('रिज्यूमे') ||
        lower.includes('சுயவிவரம்') ||
        lower.includes('రెజ్యూమె') ||
        lower.includes('রেজুমে')
      ) {
        aiResponse =
          'To improve your resume score, make sure to add your skills and experience. Using the Voice Recorder can make it faster!';
      } else if (
        lower.includes('interview') ||
        lower.includes('साक्षात्कार') ||
        lower.includes('நேர்காணல்') ||
        lower.includes('ఇంటర్వ్యూ') ||
        lower.includes('সাক্ষাৎকার')
      ) {
        aiResponse =
          'Be confident! Wear clean clothes, reach on time, and talk clearly about your past work experience.';
      } else if (
        lower.includes('salary') ||
        lower.includes('वेतन') ||
        lower.includes('சம்பளம்') ||
        lower.includes('జీతం') ||
        lower.includes('বেতন')
      ) {
        aiResponse =
          'Blue-collar jobs in your area typically pay between ₹15,000 to ₹25,000 per month depending on experience.';
      } else {
        aiResponse =
          'I am KaamSarthi AI. Ask me about jobs, resumes, or interview tips in your preferred language!';
      }

      const aiMsg: Message = {
        id: `msg-ai-${now.getTime() + 1}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: now.toISOString(),
      };

      setChatHistory((prev) => {
        const newHistory = [...prev, userMsg, aiMsg];
        saveToStorage({ chatHistory: newHistory });
        return newHistory;
      });
    },
    [saveToStorage]
  );

  const clearChat = useCallback(() => {
    setChatHistory([]);
    saveToStorage({ chatHistory: [] });
  }, [saveToStorage]);

  const appendChatMessage = useCallback(
    (role: Message['role'], content: string) => {
      const now = new Date();
      const id = `msg-${role}-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`;
      const message: Message = {
        id,
        role,
        content,
        timestamp: now.toISOString(),
      };
      setChatHistory((previous) => {
        const next = [...previous, message];
        saveToStorage({ chatHistory: next });
        return next;
      });
      return id;
    },
    [saveToStorage]
  );

  const t = translations[language];

  if (!isMounted) return null;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        isLoggedIn,
        user,
        jobs,
        applications,
        chatHistory,
        t,
        login,
        logout,
        applyForJob,
        updateApplicationStatus,
        withdrawApplication,
        updateProfile,
        appendChatMessage,
        sendMessage,
        clearChat,
        calculateResumeScore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
