'use client';

import React from 'react';
import './global.css';
import { AppProvider } from '@/context/AppContext';
import { Toaster } from 'sonner';
import BottomNav from '@/components/BottomNav';
import VoiceLanguageSetup from '@/components/VoiceLanguageSetup';
import SpokenGuide from '@/components/SpokenGuide';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>KaamSarthi - Voice Job Assistant</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
      </head>
      <body className="bg-slate-900 antialiased min-h-screen flex justify-center items-stretch">
        {/* Left developer credit sidebar */}
        <div className="hidden lg:flex flex-col items-center justify-center flex-1 select-none pointer-events-none p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl xl:text-2xl font-black text-white tracking-widest uppercase opacity-90">Developer</span>
            <span className="text-2xl xl:text-3xl font-black text-emerald-400 tracking-widest uppercase opacity-90">KSHITIZ SINGH</span>
            <span className="text-sm xl:text-base font-bold text-slate-400 tracking-wide opacity-80 mt-1">kshitizsingh422@gmail.com</span>
          </div>
        </div>

        <AppProvider>
          <VoiceLanguageSetup />
          <SpokenGuide />
          <div className="w-full max-w-[430px] bg-white min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col pb-[128px]">
            <main className="flex-1 overflow-y-auto">{children}</main>
            <BottomNav />
            <Toaster position="top-center" richColors />
          </div>
        </AppProvider>

        {/* Right developer credit sidebar */}
        <div className="hidden lg:flex flex-col items-center justify-center flex-1 select-none pointer-events-none p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl xl:text-2xl font-black text-white tracking-widest uppercase opacity-90">Developer</span>
            <span className="text-2xl xl:text-3xl font-black text-emerald-400 tracking-widest uppercase opacity-90">KSHITIZ SINGH</span>
            <span className="text-sm xl:text-base font-bold text-slate-400 tracking-wide opacity-80 mt-1">kshitizsingh422@gmail.com</span>
          </div>
        </div>
      </body>
    </html>
  );
}
