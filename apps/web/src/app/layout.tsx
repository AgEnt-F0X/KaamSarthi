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
        <AppProvider>
          <VoiceLanguageSetup />
          <SpokenGuide />
          <div className="w-full max-w-[430px] bg-white min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col pb-[128px]">
            <main className="flex-1 overflow-y-auto">{children}</main>
            <BottomNav />
            <Toaster position="top-center" richColors />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
