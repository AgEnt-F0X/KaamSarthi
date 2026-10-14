export interface SarvamUsageStats {
  initialCredits: number;
  usedCredits: number;
  remainingCredits: number;
  sttCalls: number;
  ttsCalls: number;
  lastCallType?: 'stt' | 'tts';
  lastCallTime?: string;
}

const STORAGE_KEY = 'kaamsarthi_sarvam_tracker';
const DEFAULT_INITIAL_CREDITS = 500.0; // Typical Sarvam free trial credits
const COST_PER_STT = 0.15; // approx 0.15 credits per STT voice input
const COST_PER_TTS = 0.10; // approx 0.10 credits per TTS playback

export function getSarvamUsage(): SarvamUsageStats {
  if (typeof window === 'undefined') {
    return {
      initialCredits: DEFAULT_INITIAL_CREDITS,
      usedCredits: 0,
      remainingCredits: DEFAULT_INITIAL_CREDITS,
      sttCalls: 0,
      ttsCalls: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        initialCredits: parsed.initialCredits ?? DEFAULT_INITIAL_CREDITS,
        usedCredits: parsed.usedCredits ?? 0,
        remainingCredits: Math.max(0, (parsed.initialCredits ?? DEFAULT_INITIAL_CREDITS) - (parsed.usedCredits ?? 0)),
        sttCalls: parsed.sttCalls ?? 0,
        ttsCalls: parsed.ttsCalls ?? 0,
        lastCallType: parsed.lastCallType,
        lastCallTime: parsed.lastCallTime,
      };
    }
  } catch {
    // Ignore JSON errors
  }

  return {
    initialCredits: DEFAULT_INITIAL_CREDITS,
    usedCredits: 0,
    remainingCredits: DEFAULT_INITIAL_CREDITS,
    sttCalls: 0,
    ttsCalls: 0,
  };
}

export function recordSarvamUsage(type: 'stt' | 'tts'): SarvamUsageStats {
  const current = getSarvamUsage();
  const cost = type === 'stt' ? COST_PER_STT : COST_PER_TTS;
  const newUsed = Number((current.usedCredits + cost).toFixed(2));
  const newRemaining = Number(Math.max(0, current.initialCredits - newUsed).toFixed(2));

  const updated: SarvamUsageStats = {
    initialCredits: current.initialCredits,
    usedCredits: newUsed,
    remainingCredits: newRemaining,
    sttCalls: type === 'stt' ? current.sttCalls + 1 : current.sttCalls,
    ttsCalls: type === 'tts' ? current.ttsCalls + 1 : current.ttsCalls,
    lastCallType: type,
    lastCallTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('sarvam-usage-updated', { detail: updated }));
    } catch {
      // Ignore storage errors
    }
  }

  return updated;
}

export function setSarvamInitialCredits(amount: number): SarvamUsageStats {
  const current = getSarvamUsage();
  const validAmount = Math.max(0, amount);
  const updated: SarvamUsageStats = {
    ...current,
    initialCredits: validAmount,
    remainingCredits: Number(Math.max(0, validAmount - current.usedCredits).toFixed(2)),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('sarvam-usage-updated', { detail: updated }));
    } catch {}
  }

  return updated;
}

export function resetSarvamUsage(): SarvamUsageStats {
  const current = getSarvamUsage();
  const updated: SarvamUsageStats = {
    initialCredits: current.initialCredits,
    usedCredits: 0,
    remainingCredits: current.initialCredits,
    sttCalls: 0,
    ttsCalls: 0,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('sarvam-usage-updated', { detail: updated }));
    } catch {}
  }

  return updated;
}
