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
    1: { title: 'ஓட்டுநர்', company: 'தெல्हி லஜிஸ்டிக்ஸ்', location: 'தெல्हி' },
    2: { title: 'டெலிவரி பங்குதரர்', company: 'ஃபாஸ்ட் கார்ட்', location: 'நொய்டா' },
    3: { title: 'கட்டுமான ஒழியர்', company: 'பில் இந்தியா கார்ப்', location: 'குருக்ராம்' },
    4: { title: 'கிடங்கு உதவியாளர்', company: 'ஸ்மார்ட் வேர்ஹௌசிங்', location: 'தெல्हி' },
    5: { title: 'பாதுகாப்பு гвар்டு', company: 'சிக்யூர் இந்தியா', location: 'நொய்டா' },
    6: { title: 'தொழிற்சாலை பணியாளர்', company: 'மென்யூ்டெக் லிமிடெட்', location: 'ஃபெரிதாபாத்' },
    7: { title: 'மின்சாரச் சேவையாளர்', company: 'பவர் ஃபிக்ஸ் காங்கeries', location: 'தெல्हி' },
    8: { title: 'டெலிவரி அதிகாரி', company: 'க்விக் ஷிப்', location: 'குருக்ராம்' },
    9: { title: 'தேர் ஓட்டுநர்', company: 'நேசனல் ফ্রைட்', location: 'தெல्हி' },
    10: { title: 'வீட்டு பேணிக்கை பணியாளர்', company: 'கிளீன் ப்ரோ சர்விசஸ்', location: 'நொய்டா' },
  },
  te: {
    1: { title: 'డ్రైవర్', company: 'దెల్హి లాజిస్టిక్స్', location: 'దెల్హి' },
    2: { title: 'డెలివరీiendas', company: 'ఫాస్ట్ కార్ట్', location: 'నోయిడా' },
    3: { title: 'నిర్మాణ మజదూరు', company: 'బిల్డ్ ఇండియా కార్ప్', location: 'గురుಗ್ರామ్' },
    4: { title: 'గోడౌన్ సహాయకుడు', company: 'స్మార్ట్ వేరేహౌజింగ్', location: 'దెల్హి' },
    5: { title: 'సెక్యూరిటి గార్డ్', company: 'సెక్యూర్ ఇండియా', location: 'నోయిడా' },
    6: { title: 'ఫ్యాక్టరీ কর্মचారి', company: 'మానూటెక్ లిమిటెడ్', location: 'ఫరీదాబాద్' },
    7: { title: 'ఎలక్ట్రీషియన్ సహాయకుడు', company: 'పవర్ ఫిక్స్ కంపెనీ', location: 'దెల్హి' },
    8: { title: 'డెలివరీ ఎక్జిక్యూటివ్', company: 'క్విక్ షిప్', location: 'గురుగ్రామ్' },
    9: { title: 'ట్రక్ డ్రైవర్', company: 'నాషనల్ ఫ్రేట్', location: 'దెల్హి' },
    10: { title: 'హౌస్ కీపింగ్ స్టాఫ్', company: 'క్లీన్ ప్రో సర్విసెస్', location: 'నోయిడా' },
  },
  bn: {
    1: { title: 'চালক', company: 'দিল্লি লজিস্টিক্স', location: 'দিল্লি' },
    2: { title: 'ডেলিভারি партনার', company: 'ফাস্টকার্ট', location: 'নয়েডা' },
    3: { title: 'নির্মাণ শ্রমিক', company: 'বিল্ড ইন্ডিয়া কর্প', location: 'গুরুগ্রাম' },
    4: { title: 'গোদাম সহায়ক', company: 'স্মার্ট వేयरহাউজিং', location: 'দিল্লি' },
    5: { title: 'নিরাপত্তা গার্ড', company: 'সিকিউর ইন্ডিয়া', location: 'নয়েডা' },
    6: { title: 'ফ্যাক্টরি কর্মী', company: 'মানুটেক লিমিটেড', location: 'ফরিদাবাদ' },
    7: { title: 'ইলেকট্রিশিয়ান সহায়ক', company: 'পাওয়ার ফিক্স কোম্পানি', location: 'দিল্লি' },
    8: { title: 'ডেলিভারি এক্সিকিউটিভ', company: 'কুইকশিপ', location: 'গুরুগ্রাম' },
    9: { title: 'ট্রাক চালক', company: 'ন্যাশনাল ফ্রেট', location: 'দিল্লি' },
    10: { title: 'হাউসকিপিং স্টাফ', company: 'ক্লিনপ্রো সার্ভিসেস', location: 'নয়েডা' },
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
    All: 'அனைத்து',
    Driver: 'ஓட்டுநர்',
    Delivery: 'டெலிவரி',
    Construction: 'கட்டுமானம்',
    Warehouse: 'கிடங்கு',
    Factory: 'தொழிற்சாலை',
    Security: 'பாதுகாப்பு',
    Electrician: 'மின்சாரம்',
  },
  te: {
    All: 'అన్ని',
    Driver: 'డ్రైవర్',
    Delivery: 'డెలివరీ',
    Construction: 'నిర్మాణం',
    Warehouse: 'గోడౌన్',
    Factory: 'ఫ్యాక్టరీ',
    Security: 'సెక్యూరిటీ',
    Electrician: 'ఎలక్ట్రీషియన్',
  },
  bn: {
    All: 'সব',
    Driver: 'চালক',
    Delivery: 'ডেলিভারি',
    Construction: 'নির্মাণ',
    Warehouse: 'গোদাম',
    Factory: 'ফ্যাক্টরি',
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

