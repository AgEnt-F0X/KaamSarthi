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
    jobs: 'உங்கள் திறன்கள் மற்றும் இடத்தின் அடிப்படையில் பொருத்தமான வேலையை கண்டறிய உதவ முடியும். வேலை வாய்ப்புகளைத் திறந்து திறன்களுக்கு பொருத்தமானதைத் தேர்வு செய்யுங்கள்.',
    resume: 'உங்கள் முக்கிய திறன்கள், அனுபவ வருடங்கள், முந்தைய வேலை மற்றும் இடத்தைச் சேர்க்கவும். KaamSarthi இந்த விவரங்களை உங்கள் சுயவிவரமாக மாற்ற முடியும்.',
    interview: '10 நிமிடங்களுக்கு முன்னர் பാഠசாலை, சுத்தமான உடைகளை அணியுங்கள், ஆவணங்களை சேர்த்து கொள்ளுங்கள் மற்றும் உங்கள் வேலை அனுபவத்தை ஒரு தெளிவான உதாரணத்துடன் விளக்குங்கள்.',
    salary: 'சம்பளம் வேலை, இடம் மற்றும் அனுபவத்தின் அடிப்படையில் மாறுபடும். பட்டியலில் உள்ள சம்பளத்தைப் பார்க்கவும் மற்றும் பணி நேரத்தை முன்னதாகவும் உறுதிசெய்யவும்.',
    safety: 'வேலைப் பெறுவதற்கு பணம் கொடுக்க tríமார்க்க வேண்டாம். ஆதார் அல்லது வங்கி OTPகளை பகிர்வதில்லை. பணம் கேட்பவரின் மீது புகார் செய்யவும்.',
    general: 'வேலைகள், திறன்கள், சுயவிவரங்கள், நேர்காணல்கள் அல்லது வேலை பாதுகாப்பு பற்றி என்னிடம் கேளுங்கள். நான் படி படியாக வழிநடத்துவேன்.',
  },
  te: {
    jobs: 'మీ నైపుణ్యాలు మరియు స్థానం ఆధారంగా అనుకూలమైన పనిని కనుగొనడంలో నేను మద్దతు ఇవ్వగలను. ఉద్యోగ అవకాశాలను తెరవండి మరియు మీ నైపుణ్యాలకు అనుగుణమైన ఉద్యోగాన్ని ఎంచుకోండి.',
    resume: 'మీ ਮੁ�్య నైపుణ్యాలు, అనుభవ సంవత్సరాలు, טר�డా పని మరియు ప్రదేశాన్ని చేర్చండి. KaamSarthi ఈ వివరాలతో మీ రెజ్యూమేని సృష్టించగలదు.',
    interview: '10 నிமిషాలు ముందు చేరండి, సుఖంగానున్న వస్త్రాలు ధరించండి, పత్రాలను తీసుకోండి మరియు మీ పని అనుభవాన్ని ఒక స్పష్టమైన ఉదాహరణతో వివరించండి.',
    salary: 'జీతం ఉద్యోగం, ప్రదేశం మరియు అనుభవంపై ఆధారపడి ఉంటుంది. పేరు చేయబడిన జీతాన్ని చూడండి మరియు పని घంటలు ముందుగా నిర్ధారించుకోండి.',
    safety: 'ఉద్యోగం కోసం vroegు květटी చలించుకోవద్దు. ఆధార్ లేదా బ్యాంకు OTPలను పంచుకోవద్దు. ఫీస్ అడిగిన వ్యక్తితోargets చేయండి.',
    general: 'ఉద్యోగాలు, నైపుణ్యాలు, రెజ్యూమే, ఇంటర్వ్యూలు లేదా ఉద్యోగ భద్రత గురించి నాకు అడగండి. నేను దశలవారీగా మార్గదర్శకత్వం ఇస్తాను.',
  },
  bn: {
    jobs: 'আপনার দক্ষতা এবং অবস্থানের ভিত্তিতে উপযুক্ত কাজ খুঁজে পেতে আমি সাহায্য করতে পারি। চাকরির সুযোগ খুলুন এবং দক্ষতার সাথে মেলে কাজটি বেছে নিন।',
    resume: 'আপনার প্রধান দক্ষতা, অভিজ্ঞতার বছর, আগের কাজ এবং অবস্থান যোগ করুন। KaamSarthi এই তথ্যগুলো থেকে আপনার রেজিউমে তৈরি করতে পারে।',
    interview: '১০ মিনিট আগে পৌঁছান, পরিষ্কার পোশাক পরুন, ডকুমেন্টগুলো নিয়ে যান এবং আপনার কাজের অভিজ্ঞতা একটি স্পষ্ট উদাহরণ দিয়ে ব্যাখ্যা করুন।',
    salary: 'বেতন চাকরি, অবস্থান এবং অভিজ্ঞতার ওপর নির্ভর করে। তালিকাভুক্ত বেতনটি দেখুন এবং কাজের ঘন্টার আগে নিশ্চিত করুন।',
    safety: 'চাকরি পেতে কখনো টাকা দেবেন না। আধার বা ব্যাংক OTP শেয়ার করবেন না। ফি চেয়ে যাদের বিষয়ে খেজনা করুন।',
    general: 'চাকরি, দক্ষতা, রেজিউমে, ইন্টারভিউ বা চাকরির নিরাপত্তা নিয়ে আমার কাছে প্রশ্ন করুন। আমি ধাপে ধাপে গাইড করব।',
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
