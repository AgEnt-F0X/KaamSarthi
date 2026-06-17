'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from '@/components/motion';
import { Search, MapPin, X, CheckCircle, Briefcase } from 'lucide-react';
import { VoiceInput } from '@/components/VoiceInput';
import { localizeCategory, localizeJob } from '@/data/jobTranslations';

export default function JobsPage() {
  const { jobs, t, language, applyForJob, applications } = useApp();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const guidedFilter = localStorage.getItem('kaamsarthi-guided-job-filter');
    if (guidedFilter) {
      setActiveFilter(guidedFilter);
      localStorage.removeItem('kaamsarthi-guided-job-filter');
    }
  }, []);

  const filters = [
    'All',
    'Driver',
    'Delivery',
    'Construction',
    'Warehouse',
    'Factory',
    'Security',
    'Electrician',
  ];

  const localizedJobs = jobs.map((job) => localizeJob(job, language));

  const filteredJobs = localizedJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.categoryLabel.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || job.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-5 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{t.findJobs}</h1>

        {/* Search Bar */}
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              placeholder={t.searchPlaceholder}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <VoiceInput
            language={language}
            onInterimTranscript={setSearch}
            onTranscript={setSearch}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border-2 transition-all ${
                activeFilter === filter
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white border-gray-100 text-gray-500'
              }`}
            >
              {localizeCategory(filter, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
          {filteredJobs.length} {t.jobsAvailable}
        </p>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job) => {
              const isApplied = applications.some((app) => app.jobId === job.id);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={job.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{job.title}</h3>
                      <p className="text-sm text-gray-500 font-medium">{job.company}</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                      <Briefcase size={20} className="text-blue-600" />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={14} className="text-gray-400" />
                      {job.location}
                    </div>
                  </div>

                  <button
                    disabled={isApplied}
                    onClick={() => applyForJob(job.id)}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      isApplied
                        ? 'bg-blue-50 text-blue-600 border border-blue-100 cursor-not-allowed'
                        : 'bg-blue-600 text-white shadow-lg shadow-blue-100 active:scale-[0.98]'
                    }`}
                  >
                    {isApplied ? <CheckCircle size={18} /> : null}
                    {isApplied ? t.alreadyApplied : t.applyNow}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
