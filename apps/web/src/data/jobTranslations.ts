import type { Language } from '@/context/AppContext';
import { seedJobs } from '@/data/constants';

type Job = (typeof seedJobs)[number];

type JobText = {
  title: string;
  company: string;
  location: string;
};

const jobText: Record<Language, Record<number, JobText>> = {
  en: {
    1: { title: 'Driver', company: 'Delhi Logistics', location: 'Delhi' },
    2: { title: 'Delivery Partner', company: 'FastKart', location: 'Noida' },
    3: { title: 'Construction Worker', company: 'Build India Corp', location: 'Gurugram' },
    4: { title: 'Warehouse Associate', company: 'Smart Warehousing', location: 'Delhi' },
    5: { title: 'Security Guard', company: 'SecureIndia', location: 'Noida' },
    6: { title: 'Factory Worker', company: 'ManuTech Ltd', location: 'Faridabad' },
    7: { title: 'Electrician Helper', company: 'PowerFix Co', location: 'Delhi' },
    8: { title: 'Delivery Executive', company: 'QuickShip', location: 'Gurugram' },
    9: { title: 'Truck Driver', company: 'NationalFreight', location: 'Delhi' },
    10: { title: 'Housekeeping Staff', company: 'CleanPro Services', location: 'Noida' },
  },
  hi: {
    1: { title: 'ड्राइवर', company: 'दिल्ली लॉजिस्टिक्स', location: 'दिल्ली' },
    2: { title: 'डिलीवरी साथी', company: 'फास्टकार्ट', location: 'नोएडा' },
    3: { title: 'निर्माण मजदूर', company: 'बिल्ड इंडिया कॉर्प', location: 'गुरुग्राम' },
    4: { title: 'गोदाम सहायक', company: 'स्मार्ट वेयरहाउसिंग', location: 'दिल्ली' },
    5: { title: 'सुरक्षा गार्ड', company: 'सिक्योर इंडिया', location: 'नोएडा' },
    6: { title: 'फैक्ट्री कर्मचारी', company: 'मैन्यूटेक लिमिटेड', location: 'फरीदाबाद' },
    7: { title: 'इलेक्ट्रीशियन सहायक', company: 'पावरफिक्स कंपनी', location: 'दिल्ली' },
    8: { title: 'डिलीवरी कर्मचारी', company: 'क्विकशिप', location: 'गुरुग्राम' },
    9: { title: 'ट्रक ड्राइवर', company: 'नेशनल फ्रेट', location: 'दिल्ली' },
    10: { title: 'सफाई कर्मचारी', company: 'क्लीनप्रो सर्विसेज', location: 'नोएडा' },
  },
};

const categoryText: Record<Language, Record<string, string>> = {
  en: {
    All: 'All',
    Driver: 'Driver',
    Delivery: 'Delivery',
    Construction: 'Construction',
    Warehouse: 'Warehouse',
    Factory: 'Factory',
    Security: 'Security',
    Electrician: 'Electrician',
  },
  hi: {
    All: 'सभी',
    Driver: 'ड्राइवर',
    Delivery: 'डिलीवरी',
    Construction: 'निर्माण',
    Warehouse: 'गोदाम',
    Factory: 'फैक्ट्री',
    Security: 'सुरक्षा',
    Electrician: 'इलेक्ट्रीशियन',
  },
};

const perMonthText: Record<Language, string> = {
  en: 'month',
  hi: 'माह',
};

export function localizeJob(job: Job, language: Language) {
  const localized = jobText[language][job.id] || jobText.en[job.id];
  const salaryAmount = job.salary.split('/')[0];

  return {
    ...job,
    ...localized,
    salary: `${salaryAmount}/${perMonthText[language]}`,
    categoryLabel: categoryText[language][job.category] || job.category,
  };
}

export function localizeCategory(category: string, language: Language) {
  return categoryText[language][category] || category;
}

