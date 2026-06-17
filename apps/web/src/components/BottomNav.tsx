'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, MessageSquare, ClipboardList, UserCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const BottomNav = () => {
  const pathname = usePathname();
  const { t } = useApp();

  const tabs = [
    { name: t.home, path: '/home', icon: Home },
    { name: t.applied, path: '/applied', icon: ClipboardList },
    { name: t.assistant, path: '/assistant', icon: MessageSquare },
    { name: t.jobs, path: '/jobs', icon: Briefcase },
    { name: t.resume, path: '/resume', icon: UserCircle },
  ];

  if (pathname === '/' || pathname === '/register') return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-[430px] h-[72px] bg-white border-t border-gray-200 flex items-center justify-around px-2 z-50 shadow-[0_-6px_18px_rgba(15,23,42,0.08)]">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <Link
            key={tab.path}
            href={tab.path}
            aria-current={isActive ? 'page' : undefined}
            className="h-full min-w-0 flex flex-col items-center justify-center flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          >
            <div
              className={`relative w-full flex flex-col items-center transition-transform duration-200 ease-out ${
                isActive ? '-translate-y-0.5' : ''
              }`}
            >
              <tab.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              />
              <span
                className={`w-full truncate px-1 text-center text-[10px] mt-1 transition-colors duration-200 ${
                  isActive ? 'font-bold text-blue-600' : 'font-medium text-gray-500'
                }`}
              >
                {tab.name}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-0.5" />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
