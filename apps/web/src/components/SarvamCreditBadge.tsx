'use client';

import React, { useEffect, useState } from 'react';
import { Activity, ChevronDown, ChevronUp, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import {
  getSarvamUsage,
  setSarvamInitialCredits,
  resetSarvamUsage,
  type SarvamUsageStats,
} from '@/lib/sarvamTracker';
import { useApp } from '@/context/AppContext';

export default function SarvamCreditBadge() {
  const { language } = useApp();
  const [stats, setStats] = useState<SarvamUsageStats>(getSarvamUsage);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    setStats(getSarvamUsage());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SarvamUsageStats>;
      if (customEvent.detail) {
        setStats(customEvent.detail);
      } else {
        setStats(getSarvamUsage());
      }
    };

    window.addEventListener('sarvam-usage-updated', handleUpdate);
    return () => window.removeEventListener('sarvam-usage-updated', handleUpdate);
  }, []);

  const totalCalls = stats.sttCalls + stats.ttsCalls;
  const percentLeft = Math.max(
    0,
    Math.min(100, Math.round((stats.remainingCredits / Math.max(1, stats.initialCredits)) * 100))
  );

  const handleSaveBalance = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      const updated = setSarvamInitialCredits(parsed);
      setStats(updated);
    }
    setIsEditing(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset Sarvam session call count?')) {
      const updated = resetSarvamUsage();
      setStats(updated);
    }
  };

  const currentEngine = language === 'en' ? 'Google Speech (Free)' : 'Sarvam Saaras:v4';

  return (
    <div
      data-testid="sarvam-credit-badge"
      className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 select-none font-sans text-xs"
    >
      {/* Compact Mini Pill */}
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          title="Click to view Sarvam API credit details"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-950 text-slate-200 border border-slate-700/80 shadow-md backdrop-blur transition-all active:scale-95"
        >
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span className="font-semibold text-[11px] text-slate-100">
            Sarvam: ~₹{stats.remainingCredits.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-1.5 hidden xs:inline">
            {percentLeft}%
          </span>
          <ChevronUp size={12} className="text-slate-400 ml-0.5" />
        </button>
      ) : (
        /* Expanded Detail Card */
        <div className="w-72 bg-slate-900/95 text-slate-100 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-xs text-white">Sarvam AI Credits</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          <div className="py-2.5 space-y-2">
            {/* Credit balance row */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Est. Remaining:</span>
              <div className="flex items-center gap-1.5">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      className="w-16 px-1.5 py-0.5 bg-slate-800 text-white border border-slate-600 rounded text-[11px] text-right"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={String(stats.remainingCredits)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveBalance}
                      className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                    >
                      Set
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-emerald-400 text-sm">
                      ~₹{stats.remainingCredits.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditValue(String(stats.remainingCredits));
                        setIsEditing(true);
                      }}
                      title="Adjust initial credit balance to match your dashboard"
                      className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                    >
                      edit
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  percentLeft > 30 ? 'bg-emerald-500' : percentLeft > 10 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentLeft}%` }}
              />
            </div>

            {/* Usage Breakdown */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <div className="bg-slate-800/60 rounded p-1.5 border border-slate-700/50">
                <span className="text-slate-400 block text-[10px]">STT (Voice Input)</span>
                <span className="font-semibold text-slate-200">{stats.sttCalls} calls</span>
              </div>
              <div className="bg-slate-800/60 rounded p-1.5 border border-slate-700/50">
                <span className="text-slate-400 block text-[10px]">TTS (Voice Guide)</span>
                <span className="font-semibold text-slate-200">{stats.ttsCalls} calls</span>
              </div>
            </div>

            {/* Active Engine */}
            <div className="bg-slate-800/40 rounded p-1.5 border border-slate-700/40 text-[10px] flex items-center justify-between">
              <span className="text-slate-400">Current STT:</span>
              <span className="font-medium text-slate-200">{currentEngine}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <a
              href="https://dashboard.sarvam.ai/settings/billing"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              Dashboard <ExternalLink size={10} />
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-400 hover:text-slate-300 flex items-center gap-1"
            >
              <RefreshCw size={10} /> Reset counter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
