'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from '@/components/motion';
import { useRouter } from 'next/navigation';
import { Languages, ArrowRight, Briefcase } from 'lucide-react';

export default function LandingPage() {
  const { language, setLanguage, t, login } = useApp();
  const router = useRouter();

  const langs = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
  ] as const;

  const handleDemo = () => {
    login({
      name: 'Arjun Kumar',
      mobile: '9876543210',
      skills: ['Driver', 'Delivery'],
      experience: 3,
      location: 'Delhi',
      resumeText: 'Experienced driver with 3 years in city logistics. Reliable and punctual.',
    });
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
          <Briefcase size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-blue-600 mt-4 tracking-tight">{t.appName}</h1>
        <p className="text-gray-500 font-medium">{t.appTagline}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full space-y-4"
      >
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Languages size={16} />
          <span>Select Language</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {langs.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                language === lang.code
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                  : 'border-gray-100 bg-gray-50 text-gray-600'
              }`}
            >
              <span>
                {lang.flag} {lang.name}
              </span>
              {language === lang.code && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full flex flex-col gap-3"
      >
        <button
          onClick={() => router.push('/register')}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          {t.getStarted}
          <ArrowRight size={20} />
        </button>
        <button
          onClick={handleDemo}
          className="w-full py-4 bg-white text-gray-600 rounded-xl font-bold border-2 border-gray-100 hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          {t.continueDemo}
        </button>
      </motion.div>
    </div>
  );
}
