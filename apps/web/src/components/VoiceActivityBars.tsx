'use client';

import React from 'react';

export function VoiceActivityBars({
  levels,
  active,
  dark = false,
}: {
  levels: number[];
  active: boolean;
  dark?: boolean;
}) {
  const displayLevels = levels.length ? levels : Array(9).fill(0);

  return (
    <div
      aria-label={active ? 'Voice is being received' : 'Waiting for voice'}
      className="h-9 flex items-center justify-center gap-1"
    >
      {displayLevels.map((level, index) => {
        const height = active ? 5 + Math.round(Math.max(0, level) * 29) : 5;
        return (
          <span
            key={index}
            className={`w-1 rounded-full transition-[height,background-color] duration-100 ease-out ${
              dark ? 'bg-white' : active ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
            style={{ height }}
          />
        );
      })}
    </div>
  );
}
