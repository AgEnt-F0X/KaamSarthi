'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from '@/components/motion';
import { useRouter } from 'next/navigation';
import { VoiceInput } from '@/components/VoiceInput';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { t, language, login } = useApp();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    experience: 0,
    location: '',
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const skillOptions = [
    'Driver',
    'Delivery',
    'Construction',
    'Warehouse',
    'Security',
    'Factory',
    'Electrician',
    'Plumber',
    'Housekeeping',
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.mobile) {
      toast.error('Please fill name and mobile number');
      return;
    }
    login({
      ...formData,
      skills: selectedSkills,
    });
    toast.success(t.profileSaved);
    router.push('/home');
  };

  return (
    <div className="p-6 pb-24 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-gray-900">{t.createProfile}</h1>
        <p className="text-gray-500 text-sm">Tell us about yourself to find the best jobs</p>
      </motion.div>

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">{t.yourName}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter full name"
            />
            <VoiceInput
              language={language}
              onInterimTranscript={(text) => setFormData({ ...formData, name: text })}
              onTranscript={(text) => setFormData({ ...formData, name: text })}
            />
          </div>
        </div>

        {/* Mobile */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">{t.mobileNumber}</label>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="10 digit number"
          />
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">{t.selectSkills}</label>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  selectedSkills.includes(skill)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-100 text-gray-600'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700">{t.experience}</label>
            <span className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg text-sm">
              {formData.experience} {t.years}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">{t.preferredLocation}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="City or area"
            />
            <VoiceInput
              language={language}
              onInterimTranscript={(text) => setFormData({ ...formData, location: text })}
              onTranscript={(text) => setFormData({ ...formData, location: text })}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        {t.createProfile}
        <CheckCircle2 size={20} />
      </button>
    </div>
  );
}
