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
  ta: {
    1: { title: 'ஓட்டுநர்', company: 'டெல்லி லாஜிஸ்டிக்ஸ்', location: 'டெல்லி' },
    2: { title: 'டெலிவரி பங்குதாரர்', company: 'ஃபாஸ்ட்கார்ட்', location: 'நொய்டா' },
    3: { title: 'கட்டுமானத் தொழிலாளர்', company: 'பில்ட் இந்தியா கார்ப்', location: 'குருகிராம்' },
    4: { title: 'கிடங்கு உதவியாளர்', company: 'ஸ்மார்ட் வேர்ஹவுசிங்', location: 'டெல்லி' },
    5: { title: 'பாதுகாப்புக் காவலர்', company: 'செக்யூர் இந்தியா', location: 'நொய்டா' },
    6: { title: 'தொழிற்சாலை ஊழியர்', company: 'மேனுடெக் லிமிடெட்', location: 'ஃபரிதாபாத்' },
    7: { title: 'மின்சார உதவியாளர்', company: 'பவர்ஃபிக்ஸ் நிறுவனம்', location: 'டெல்லி' },
    8: { title: 'டெலிவரி நிர்வாகி', company: 'க்விக்ஷிப்', location: 'குருகிராம்' },
    9: { title: 'லாரி ஓட்டுநர்', company: 'நேஷனல் ஃப்ரெய்ட்', location: 'டெல்லி' },
    10: { title: 'தூய்மைப் பணியாளர்', company: 'க்ளீன்ப்ரோ சர்வீசஸ்', location: 'நொய்டா' },
  },
  te: {
    1: { title: 'డ్రైవర్', company: 'ఢిల్లీ లాజిస్టిక్స్', location: 'ఢిల్లీ' },
    2: { title: 'డెలివరీ భాగస్వామి', company: 'ఫాస్ట్‌కార్ట్', location: 'నోయిడా' },
    3: { title: 'నిర్మాణ కార్మికుడు', company: 'బిల్డ్ ఇండియా కార్ప్', location: 'గురుగ్రామ్' },
    4: { title: 'గిడ్డంగి సహాయకుడు', company: 'స్మార్ట్ వేర్‌హౌసింగ్', location: 'ఢిల్లీ' },
    5: { title: 'భద్రతా గార్డు', company: 'సెక్యూర్ ఇండియా', location: 'నోయిడా' },
    6: { title: 'ఫ్యాక్టరీ కార్మికుడు', company: 'మాన్యుటెక్ లిమిటెడ్', location: 'ఫరీదాబాద్' },
    7: { title: 'ఎలక్ట్రీషియన్ సహాయకుడు', company: 'పవర్‌ఫిక్స్ కంపెనీ', location: 'ఢిల్లీ' },
    8: { title: 'డెలివరీ ఉద్యోగి', company: 'క్విక్‌షిప్', location: 'గురుగ్రామ్' },
    9: { title: 'ట్రక్ డ్రైవర్', company: 'నేషనల్ ఫ్రైట్', location: 'ఢిల్లీ' },
    10: { title: 'హౌస్‌కీపింగ్ సిబ్బంది', company: 'క్లీన్‌ప్రో సర్వీసెస్', location: 'నోయిడా' },
  },
  bn: {
    1: { title: 'চালক', company: 'দিল্লি লজিস্টিকস', location: 'দিল্লি' },
    2: { title: 'ডেলিভারি পার্টনার', company: 'ফাস্টকার্ট', location: 'নয়ডা' },
    3: { title: 'নির্মাণ শ্রমিক', company: 'বিল্ড ইন্ডিয়া কর্প', location: 'গুরুগ্রাম' },
    4: { title: 'গুদাম সহকারী', company: 'স্মার্ট ওয়্যারহাউসিং', location: 'দিল্লি' },
    5: { title: 'নিরাপত্তারক্ষী', company: 'সিকিউর ইন্ডিয়া', location: 'নয়ডা' },
    6: { title: 'কারখানা কর্মী', company: 'ম্যানুটেক লিমিটেড', location: 'ফরিদাবাদ' },
    7: { title: 'ইলেকট্রিশিয়ান সহকারী', company: 'পাওয়ারফিক্স কোম্পানি', location: 'দিল্লি' },
    8: { title: 'ডেলিভারি কর্মী', company: 'কুইকশিপ', location: 'গুরুগ্রাম' },
    9: { title: 'ট্রাক চালক', company: 'ন্যাশনাল ফ্রেইট', location: 'দিল্লি' },
    10: { title: 'পরিচ্ছন্নতা কর্মী', company: 'ক্লিনপ্রো সার্ভিসেস', location: 'নয়ডা' },
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
  ta: {
    All: 'அனைத்தும்',
    Driver: 'ஓட்டுநர்',
    Delivery: 'டெலிவரி',
    Construction: 'கட்டுமானம்',
    Warehouse: 'கிடங்கு',
    Factory: 'தொழிற்சாலை',
    Security: 'பாதுகாப்பு',
    Electrician: 'மின்சாரம்',
  },
  te: {
    All: 'అన్నీ',
    Driver: 'డ్రైవర్',
    Delivery: 'డెలివరీ',
    Construction: 'నిర్మాణం',
    Warehouse: 'గిడ్డంగి',
    Factory: 'ఫ్యాక్టరీ',
    Security: 'భద్రత',
    Electrician: 'ఎలక్ట్రీషియన్',
  },
  bn: {
    All: 'সব',
    Driver: 'চালক',
    Delivery: 'ডেলিভারি',
    Construction: 'নির্মাণ',
    Warehouse: 'গুদাম',
    Factory: 'কারখানা',
    Security: 'নিরাপত্তা',
    Electrician: 'ইলেকট্রিশিয়ান',
  },
};

const perMonthText: Record<Language, string> = {
  en: 'month',
  hi: 'माह',
  ta: 'மாதம்',
  te: 'నెల',
  bn: 'মাস',
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

