export type AdvisorLanguage = 'en' | 'hi';
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
