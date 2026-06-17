'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from '@/components/motion';
import { useRouter } from 'next/navigation';
import { Briefcase, FileText, Bot, MapPin, Star, ArrowRight } from 'lucide-react';
import { localizeJob } from '@/data/jobTranslations';

export default function HomePage() {
  const { user, t, jobs, applications, language } = useApp();
  const router = useRouter();

  if (!user) {
    router.push('/');
    return null;
  }

  const recentJobs = jobs.slice(0, 3).map((job) => localizeJob(job, language));

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm font-medium">{t.greeting},</p>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
          {user.name.charAt(0)}
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-200 space-y-4"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">
              Professional Profile
            </p>
            <h3 className="text-xl font-bold">{user.skills.join(' • ')}</h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Star size={18} fill="white" />
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-blue-50">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{user.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase size={14} />
            <span>
              {user.experience} {t.years} exp
            </span>
          </div>
        </div>

        <div className="pt-2 flex gap-2 overflow-x-auto no-scrollbar">
          {user.skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold border border-white/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t.applied} value={applications.length.toString()} color="blue" />
        <StatCard label={t.resumeScore} value={`${user.resumeScore}%`} color="green" />
        <StatCard label={t.jobsAvailable} value="50+" color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <ActionButton
          icon={<Briefcase size={20} />}
          label={t.findJobs}
          onClick={() => router.push('/jobs')}
          color="blue"
        />
        <ActionButton
          icon={<FileText size={20} />}
          label={t.resumeBuilder}
          onClick={() => router.push('/resume')}
          color="green"
        />
        <ActionButton
          icon={<Bot size={20} />}
          label={t.aiAssistant}
          onClick={() => router.push('/assistant')}
          color="purple"
        />
      </div>

      {/* Recent Jobs */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-gray-800">{t.recentJobs}</h3>
          <button onClick={() => router.push('/jobs')} className="text-blue-600 text-xs font-bold">
            {t.viewAll}
          </button>
        </div>
        <div className="space-y-3">
          {recentJobs.map((job) => (
            <motion.div
              key={job.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/jobs')}
              className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 text-sm">{job.title}</h4>
                <p className="text-xs text-gray-500 font-medium">{job.company}</p>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                    {job.salary}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <MapPin size={10} /> {job.location}
                  </span>
                </div>
              </div>
              <ArrowRight size={18} className="text-gray-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
  } as any;
  return (
    <div
      className={`${colors[color]} p-3 rounded-xl flex flex-col items-center justify-center text-center space-y-1 border border-white shadow-sm`}
    >
      <span className="text-lg font-black">{value}</span>
      <span className="text-[10px] font-bold opacity-80">{label}</span>
    </div>
  );
};

const ActionButton = ({
  icon,
  label,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}) => {
  const colors = {
    blue: 'text-blue-600 border-blue-100',
    green: 'text-emerald-600 border-emerald-100',
    purple: 'text-purple-600 border-purple-100',
  } as any;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl bg-white border-2 ${colors[color]} space-y-2 active:scale-95 transition-all shadow-sm`}
    >
      {icon}
      <span className="text-[10px] font-bold text-gray-700">{label}</span>
    </button>
  );
};
