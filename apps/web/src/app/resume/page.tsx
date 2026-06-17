'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from '@/components/motion';
import { Mic, Share2, Copy, MapPin, Briefcase, Phone } from 'lucide-react';
import { VoiceInput } from '@/components/VoiceInput';
import { toast } from 'sonner';

export default function ResumePage() {
  const { user, t, language, updateProfile } = useApp();
  const [resumeText, setResumeText] = useState(user?.resumeText || '');
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  const handleSave = () => {
    updateProfile({ resumeText });
    setIsEditing(false);
    toast.success(t.resumeSaved);
  };

  const copyToClipboard = () => {
    const text = `KaamSarthi Resume\n\nName: ${user.name}\nSkills: ${user.skills.join(', ')}\nExperience: ${user.experience} years\nLocation: ${user.location}\n\nSummary: ${resumeText}`;
    navigator.clipboard.writeText(text);
    toast.success(t.copiedClipboard);
  };

  const shareWhatsApp = () => {
    const text = `*KaamSarthi Resume*\n\n*Name:* ${user.name}\n*Skills:* ${user.skills.join(', ')}\n*Exp:* ${user.experience} years\n*Location:* ${user.location}\n\n*About:* ${resumeText}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-5 space-y-6 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t.resume}</h1>
        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs">
          Score: {user.resumeScore}%
        </div>
      </div>

      {/* Progress Ring Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6"
      >
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-100"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * user.resumeScore) / 100 }}
              className="text-blue-600"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xl font-black text-gray-900">{user.resumeScore}%</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-gray-800 text-sm">{t.resumeCompletion}</h3>
          <p className="text-xs text-gray-500 font-medium">
            Add details to improve your score and get better jobs.
          </p>
        </div>
      </motion.div>

      {/* Voice Recorder Section */}
      <div className="bg-blue-600 rounded-3xl p-6 text-white space-y-4 shadow-xl shadow-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Mic size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider">{t.voiceRecorder}</h3>
            <p className="text-xs text-blue-100 font-medium">{t.tapToSpeak}</p>
          </div>
        </div>

        <div className="flex justify-center py-4">
          <VoiceInput
            language={language}
            appendTo={resumeText}
            onInterimTranscript={(text) => {
              setResumeText(text);
              setIsEditing(true);
            }}
            onTranscript={(text) => {
              setResumeText(text);
              setIsEditing(true);
            }}
            className="scale-125"
          />
        </div>
      </div>

      {/* Editor Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.about}</h3>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="text-blue-600 text-xs font-bold">
              {t.editProfile}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 text-xs font-bold"
              >
                {t.cancel}
              </button>
              <button onClick={handleSave} className="text-blue-600 text-xs font-bold">
                {t.saveChanges}
              </button>
            </div>
          )}
        </div>
        <div className="p-4">
          {isEditing ? (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-32 p-3 bg-gray-50 border-none focus:ring-0 text-sm font-medium rounded-xl resize-none"
              placeholder="Tell employers about your work experience..."
            />
          ) : (
            <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
              {resumeText ||
                'No summary added. Use the voice recorder above to tell us about your past work!'}
            </p>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-black">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">{user.name}</h2>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
              <Phone size={10} /> {user.mobile}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase">{t.location}</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <MapPin size={12} className="text-blue-500" /> {user.location}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase">{t.experience}</p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <Briefcase size={12} className="text-blue-500" /> {user.experience} Years
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase">{t.skills}</p>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Share Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={shareWhatsApp}
          className="py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
        >
          <Share2 size={18} />
          {t.shareWhatsApp}
        </button>
        <button
          onClick={copyToClipboard}
          className="py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Copy size={18} />
          {t.copyResume}
        </button>
      </div>

      {/* Profile Logout */}
      <button
        onClick={() => {
          localStorage.removeItem('kaamsarthi');
          window.location.href = '/';
        }}
        className="w-full py-4 text-gray-400 font-bold text-sm hover:text-rose-500 transition-colors mt-4"
      >
        {t.logout}
      </button>
    </div>
  );
}
