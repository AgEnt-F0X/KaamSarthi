export type AdvisorLanguage = 'en' | 'hi' | 'ta' | 'te' | 'bn';
type AdviceType = 'jobs' | 'resume' | 'interview' | 'salary' | 'safety' | 'general';

const keywords: Record<AdviceType, string[]> = {
  jobs: ['job', 'work', 'vacancy', 'नौकरी', 'काम', 'வேலை', 'ఉద్యోగం', 'চাকরি', 'কাজ'],
  resume: ['resume', 'cv', 'रिज्यूमे', 'बायोडाटा', 'சுயவிவரம்', 'రెజ్యూమే', 'জীবনবৃত্তান্ত'],
  interview: ['interview', 'इंटरव्यू', 'साक्षात्कार', 'நேர்காணல்', 'ఇంటర్వ్యూ', 'সাক্ষাৎকার'],
  salary: ['salary', 'pay', 'wage', 'वेतन', 'सैलरी', 'சம்பளம்', 'జీతం', 'বেতন'],
  safety: [
    'fraud',
    'scam',
    'fee',
    'धोखा',
    'फीस',
    'शुल्क',
    'மோசடி',
    'கட்டணம்',
    'మోసం',
    'ఫీజు',
    'প্রতারণা',
    'ফি',
  ],
  general: [],
};

const responses: Record<AdvisorLanguage, Record<AdviceType, string>> = {
  en: {
    jobs: 'I can help you find suitable work. Open Job Opportunities and choose jobs matching your skills and location.',
    resume: 'Add your main skills, years of experience, previous work and location. KaamSarthi can turn these details into your resume.',
    interview: 'Reach 10 minutes early, wear clean clothes, carry your documents and explain your work experience with one clear example.',
    salary: 'Salary depends on the job, location and experience. Check the listed salary and confirm working hours before accepting.',
    safety: 'Never pay money to get a job. Do not share Aadhaar or bank OTPs. Report anyone asking for job fees.',
    general: 'Ask me about jobs, skills, resumes, interviews or job safety. I will guide you step by step.',
  },
  hi: {
    jobs: 'मैं आपके कौशल और जगह के अनुसार काम ढूंढने में मदद कर सकता हूं। नौकरी के अवसर खोलें और सही नौकरी चुनें।',
    resume: 'अपने मुख्य कौशल, अनुभव के वर्ष, पिछला काम और स्थान जोड़ें। कामसारथी इन जानकारियों से आपका रिज्यूमे बना सकता है।',
    interview: '10 मिनट पहले पहुंचें, साफ कपड़े पहनें, दस्तावेज साथ रखें और अपने काम का एक साफ उदाहरण बताएं।',
    salary: 'वेतन नौकरी, स्थान और अनुभव पर निर्भर करता है। दिया गया वेतन देखें और काम के घंटे पहले पूछें।',
    safety: 'नौकरी पाने के लिए कभी पैसे न दें। आधार या बैंक OTP साझा न करें। फीस मांगने वाले की शिकायत करें।',
    general: 'मुझसे नौकरी, कौशल, रिज्यूमे, इंटरव्यू या नौकरी की सुरक्षा के बारे में पूछें। मैं कदम-कदम पर मदद करूंगा।',
  },
  ta: {
    jobs: 'உங்கள் திறன் மற்றும் இடத்திற்கு ஏற்ற வேலையை கண்டுபிடிக்க உதவுவேன். வேலை வாய்ப்புகளை திறந்து பொருத்தமான வேலையை தேர்வு செய்யுங்கள்.',
    resume: 'முக்கிய திறன்கள், அனுபவ ஆண்டுகள், முந்தைய வேலை மற்றும் இடத்தை சேர்க்கவும். காம்சாரதி உங்கள் சுயவிவரத்தை உருவாக்கும்.',
    interview: '10 நிமிடம் முன்னதாக செல்லுங்கள், சுத்தமான உடை அணியுங்கள், ஆவணங்களை எடுத்துச் செல்லுங்கள், அனுபவத்தை ஒரு உதாரணத்துடன் சொல்லுங்கள்.',
    salary: 'சம்பளம் வேலை, இடம் மற்றும் அனுபவத்தை பொறுத்தது. வேலை நேரத்தையும் சம்பளத்தையும் ஏற்கும் முன் உறுதி செய்யுங்கள்.',
    safety: 'வேலை பெற பணம் கொடுக்காதீர்கள். ஆதார் அல்லது வங்கி OTP-ஐ பகிராதீர்கள். கட்டணம் கேட்பவரை புகாரளிக்கவும்.',
    general: 'வேலை, திறன், சுயவிவரம், நேர்காணல் அல்லது வேலை பாதுகாப்பு பற்றி கேளுங்கள். படிப்படியாக உதவுவேன்.',
  },
  te: {
    jobs: 'మీ నైపుణ్యాలు మరియు ప్రాంతానికి సరిపోయే పనిని కనుగొనడంలో సహాయం చేస్తాను. ఉద్యోగ అవకాశాలు తెరిచి సరైన ఉద్యోగాన్ని ఎంచుకోండి.',
    resume: 'ప్రధాన నైపుణ్యాలు, అనుభవం, గత పని మరియు ప్రాంతాన్ని జోడించండి. కామ్‌సారథి మీ రెజ్యూమే తయారు చేస్తుంది.',
    interview: '10 నిమిషాలు ముందుగా వెళ్లండి, శుభ్రమైన దుస్తులు ధరించండి, పత్రాలు తీసుకెళ్లండి, అనుభవాన్ని ఒక ఉదాహరణతో చెప్పండి.',
    salary: 'జీతం ఉద్యోగం, ప్రాంతం మరియు అనుభవంపై ఆధారపడుతుంది. చేరే ముందు పని గంటలు మరియు జీతాన్ని నిర్ధారించండి.',
    safety: 'ఉద్యోగం కోసం ఎప్పుడూ డబ్బు చెల్లించవద్దు. ఆధార్ లేదా బ్యాంక్ OTP పంచుకోవద్దు. ఫీజు అడిగేవారిని నివేదించండి.',
    general: 'ఉద్యోగాలు, నైపుణ్యాలు, రెజ్యూమే, ఇంటర్వ్యూ లేదా ఉద్యోగ భద్రత గురించి అడగండి. దశలవారీగా సహాయం చేస్తాను.',
  },
  bn: {
    jobs: 'আপনার দক্ষতা ও এলাকার সঙ্গে মানানসই কাজ খুঁজতে সাহায্য করব। চাকরির সুযোগ খুলে উপযুক্ত কাজ বেছে নিন।',
    resume: 'প্রধান দক্ষতা, অভিজ্ঞতার বছর, আগের কাজ ও এলাকা যোগ করুন। কামসারথি আপনার জীবনবৃত্তান্ত তৈরি করবে।',
    interview: '১০ মিনিট আগে পৌঁছান, পরিষ্কার পোশাক পরুন, কাগজপত্র নিন এবং একটি উদাহরণ দিয়ে কাজের অভিজ্ঞতা বলুন।',
    salary: 'বেতন কাজ, এলাকা ও অভিজ্ঞতার উপর নির্ভর করে। যোগ দেওয়ার আগে কাজের সময় ও বেতন নিশ্চিত করুন।',
    safety: 'চাকরি পাওয়ার জন্য কখনও টাকা দেবেন না। আধার বা ব্যাংকের OTP শেয়ার করবেন না। ফি চাইলে রিপোর্ট করুন।',
    general: 'চাকরি, দক্ষতা, জীবনবৃত্তান্ত, সাক্ষাৎকার বা চাকরির নিরাপত্তা নিয়ে প্রশ্ন করুন। ধাপে ধাপে সাহায্য করব।',
  },
};

export function getRuleBasedAdvice(message: string, language: AdvisorLanguage): string {
  const normalized = message.toLocaleLowerCase();
  const type =
    (Object.keys(keywords) as AdviceType[]).find(
      (candidate) =>
        candidate !== 'general' &&
        keywords[candidate].some((keyword) => normalized.includes(keyword.toLocaleLowerCase()))
    ) || 'general';
  return responses[language][type];
}

export function shouldUseRuleBasedAdvice(message: string): boolean {
  const normalized = message.toLocaleLowerCase();
  return [...keywords.safety, ...keywords.salary, 'aadhaar', 'आधार', 'otp'].some((keyword) =>
    normalized.includes(keyword.toLocaleLowerCase())
  );
}
