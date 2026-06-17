'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from '@/components/motion';
import {
  Calendar,
  ChevronRight,
  X,
  Trash2,
  CheckCircle2,
  Clock,
  Users,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { localizeJob } from '@/data/jobTranslations';

export default function AppliedJobsPage() {
  const { applications, jobs, language, t, withdrawApplication, updateApplicationStatus } =
    useApp();
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Pending':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Interview':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Selected':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Rejected':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Applied':
        return <CheckCircle2 size={12} />;
      case 'Pending':
        return <Clock size={12} />;
      case 'Interview':
        return <Users size={12} />;
      case 'Selected':
        return <CheckCircle2 size={12} />;
      case 'Rejected':
        return <X size={12} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-5 space-y-6 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900">{t.yourApplications}</h1>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200">
            <ClipboardList size={40} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">{t.noApplications}</p>
          <button
            onClick={() => (window.location.href = '/jobs')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100"
          >
            {t.browseJobs}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {applications.map((app) => {
              const job = jobs.find((item) => item.id === app.jobId);
              const localizedJob = job ? localizeJob(job, language) : null;
              return (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={app.id}
                onClick={() =>
                  setSelectedApp({
                    ...app,
                    jobTitle: localizedJob?.title || app.jobTitle,
                    company: localizedJob?.company || app.company,
                  })
                }
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-gray-900 text-sm">
                      {localizedJob?.title || app.jobTitle}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {localizedJob?.company || app.company}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${getStatusColor(app.status)}`}
                    >
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                      <Calendar size={10} />
                      {app.appliedOn}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Sheet Detail */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[32px] p-6 z-[70] shadow-2xl space-y-6 pb-10"
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto" />

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-gray-900">{selectedApp.jobTitle}</h2>
                    <p className="text-gray-500 font-bold">{selectedApp.company}</p>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 bg-gray-50 rounded-full text-gray-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(selectedApp.status)}`}
                  >
                    {getStatusIcon(selectedApp.status)}
                    {selectedApp.status}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {t.updateStatus}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Applied', 'Pending', 'Interview', 'Selected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          updateApplicationStatus(selectedApp.id, status as any);
                          setSelectedApp({ ...selectedApp, status });
                        }}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                          selectedApp.status === status
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                            : 'bg-white border-gray-100 text-gray-500'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    withdrawApplication(selectedApp.id);
                    setSelectedApp(null);
                    toast.success('Application withdrawn');
                  }}
                  className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-all"
                >
                  <Trash2 size={18} />
                  {t.withdraw}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
