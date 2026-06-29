import type { Language } from '@/context/AppContext';

export type GuideField =
  | 'name'
  | 'mobile'
  | 'location'
  | 'skills'
  | 'experience'
  | 'workHistory'
  | 'preferredJob';

export type GuideAction = 'resume' | 'jobs' | 'applications' | 'assistant' | 'home';
export type GuideCommand =
  | 'yes'
  | 'no'
  | 'repeat'
  | 'back'
  | 'skip'
  | 'stop'
  | 'continue'
  | GuideAction
  | 'unknown';

export const GUIDE_FIELDS: GuideField[] = [
  'name',
  'mobile',
  'location',
  'skills',
  'experience',
  'workHistory',
  'preferredJob',
];

export const GUIDE_COPY: Record<
  Language,
  {
    offer: string;
    newWelcome: string;
    returningWelcome: (name: string) => string;
    menu: string;
    heard: (answer: string) => string;
    correct: string;
    tryAgain: string;
    continue: string;
    stop: string;
    skip: string;
    repeat: string;
    back: string;
    listening: string;
    waiting: string;
    reviewTitle: string;
    reviewHelp: string;
    saved: string;
    startupLabel: string;
    talkButton: string;
    openAction: Record<GuideAction, string>;
    actionDone: Record<GuideAction, string>;
    fields: Record<GuideField, { label: string; question: string; placeholder: string }>;
  }
> = {
  en: {
    offer: 'Would you like spoken guidance? You can tap Yes or No, or say yes or no.',
    newWelcome:
      'I will help create your profile and resume. I will ask one question at a time.',
    returningWelcome: (name) =>
      `Welcome back ${name}. Tell me what you want to do. You can say update my resume, show jobs, applications, or ask the assistant.`,
    menu: 'What would you like to do? Say resume, jobs, applications, assistant, or home.',
    heard: (answer) => `I heard: ${answer}. Is that correct?`,
    correct: 'Yes, correct',
    tryAgain: 'No, try again',
    continue: 'Continue',
    stop: 'Stop guidance',
    skip: 'Skip',
    repeat: 'Repeat',
    back: 'Go back',
    listening: 'I am listening',
    waiting: 'Hold microphone to speak.',
    reviewTitle: 'Please check everything',
    reviewHelp: 'If everything is good, tap the large Continue button.',
    saved: 'Your profile and resume have been saved on this device.',
    startupLabel: 'Speak when app opens',
    talkButton: 'Talk to KaamSarthi',
    openAction: {
      resume: 'Open the resume guide?',
      jobs: 'Open suitable jobs?',
      applications: 'Open your applications?',
      assistant: 'Open the employment assistant?',
      home: 'Go to the home screen?',
    },
    actionDone: {
      resume: 'Let us build your profile and resume.',
      jobs: 'I opened jobs and placed the most suitable work first.',
      applications: 'Here are your job applications.',
      assistant: 'The employment assistant is open.',
      home: 'You are on the home screen.',
    },
    fields: {
      name: { label: 'Name', question: 'What is your full name?', placeholder: 'Say or type your full name' },
      mobile: { label: 'Mobile', question: 'What is your mobile number?', placeholder: 'Say or type your mobile number' },
      location: { label: 'Location', question: 'Which city or area do you live in?', placeholder: 'Say or type your city or area' },
      skills: { label: 'Skills', question: 'What work are you good at? You can name more than one skill.', placeholder: 'For example: driving, delivery, electrician' },
      experience: { label: 'Experience', question: 'How many years of work experience do you have?', placeholder: 'For example: three years' },
      workHistory: { label: 'Past work', question: 'Tell me about your past work and the tasks you did.', placeholder: 'Describe your past work' },
      preferredJob: { label: 'Wanted job', question: 'What kind of job would you like now?', placeholder: 'For example: driver job' },
    },
  },
  hi: {
    offer: 'क्या आप बोलकर मदद लेना चाहते हैं? हाँ या नहीं दबाएं, या अपनी भाषा में हाँ या नहीं कहें।',
    newWelcome: 'मैं आपकी प्रोफाइल और रिज्यूमे बनाऊंगा। मैं एक बार में एक सवाल पूछूंगा।',
    returningWelcome: (name) =>
      `वापस आने पर स्वागत है ${name}। बताइए क्या करना है। आप कह सकते हैं रिज्यूमे बदलो, नौकरी दिखाओ, आवेदन दिखाओ या सहायक खोलो।`,
    menu: 'आप क्या करना चाहते हैं? रिज्यूमे, नौकरी, आवेदन, सहायक या होम कहें।',
    heard: (answer) => `मैंने सुना: ${answer}। क्या यह सही है?`,
    correct: 'हाँ, सही है',
    tryAgain: 'नहीं, फिर बोलें',
    continue: 'आगे बढ़ें',
    stop: 'बोलकर मदद बंद करें',
    skip: 'छोड़ें',
    repeat: 'फिर बोलें',
    back: 'पीछे जाएं',
    listening: 'मैं सुन रहा हूं',
    waiting: 'बोलने के लिए माइक दबाकर रखें।',
    reviewTitle: 'सारी जानकारी जांचें',
    reviewHelp: 'सब सही है तो नीचे बड़ा आगे बढ़ें बटन दबाएं।',
    saved: 'आपकी प्रोफाइल और रिज्यूमे इसी डिवाइस पर सेव हो गए हैं।',
    startupLabel: 'ऐप खुलने पर बोलें',
    talkButton: 'कामसारथी से बात करें',
    openAction: {
      resume: 'रिज्यूमे बनाने की मदद खोलें?',
      jobs: 'आपके लिए सही नौकरियां खोलें?',
      applications: 'आपके आवेदन खोलें?',
      assistant: 'रोजगार सहायक खोलें?',
      home: 'होम स्क्रीन पर जाएं?',
    },
    actionDone: {
      resume: 'चलिए आपकी प्रोफाइल और रिज्यूमे बनाते हैं।',
      jobs: 'मैंने नौकरियां खोल दी हैं और सही काम पहले रखा है।',
      applications: 'यह आपके नौकरी के आवेदन हैं।',
      assistant: 'रोजगार सहायक खुल गया है।',
      home: 'आप होम स्क्रीन पर हैं।',
    },
    fields: {
      name: { label: 'नाम', question: 'आपका पूरा नाम क्या है?', placeholder: 'अपना पूरा नाम बोलें या लिखें' },
      mobile: { label: 'मोबाइल', question: 'आपका मोबाइल नंबर क्या है?', placeholder: 'मोबाइल नंबर बोलें या लिखें' },
      location: { label: 'स्थान', question: 'आप किस शहर या इलाके में रहते हैं?', placeholder: 'शहर या इलाका बोलें' },
      skills: { label: 'कौशल', question: 'आप कौन-कौन सा काम अच्छा करते हैं?', placeholder: 'जैसे ड्राइविंग, डिलीवरी, बिजली का काम' },
      experience: { label: 'अनुभव', question: 'आपके पास कितने साल का काम का अनुभव है?', placeholder: 'जैसे तीन साल' },
      workHistory: { label: 'पिछला काम', question: 'अपने पिछले काम और किए गए कामों के बारे में बताएं।', placeholder: 'अपने पिछले काम के बारे में बोलें' },
      preferredJob: { label: 'पसंदीदा नौकरी', question: 'अब आप किस तरह की नौकरी चाहते हैं?', placeholder: 'जैसे ड्राइवर की नौकरी' },
    },
  },
};

const commands: Record<Exclude<GuideCommand, 'unknown'>, Record<Language, string[]>> = {
  yes: { en: ['yes', 'yeah', 'okay', 'correct', 'right'], hi: ['हाँ', 'हां', 'जी', 'सही', 'ठीक'] },
  no: { en: ['no', 'nope', 'wrong'], hi: ['नहीं', 'नही', 'गलत'] },
  repeat: { en: ['repeat', 'say again', 'again'], hi: ['फिर बोलो', 'दोबारा', 'फिर से'] },
  back: { en: ['go back', 'back'], hi: ['पीछे', 'वापस'] },
  skip: { en: ['skip', 'leave it'], hi: ['छोड़ो', 'छोड़ दें'] },
  stop: { en: ['stop', 'close', 'enough'], hi: ['बंद', 'रुको', 'बस'] },
  continue: { en: ['continue', 'next', 'go ahead'], hi: ['आगे', 'जारी', 'चलो'] },
  resume: { en: ['resume', 'profile', 'cv'], hi: ['रिज्यूमे', 'बायोडाटा', 'प्रोफाइल'] },
  jobs: { en: ['job', 'work', 'vacancy'], hi: ['नौकरी', 'काम', 'रोजगार'] },
  applications: { en: ['application', 'applied'], hi: ['आवेदन', 'अप्लाई'] },
  assistant: { en: ['assistant', 'advice', 'help'], hi: ['सहायक', 'सलाह', 'मदद'] },
  home: { en: ['home', 'main screen'], hi: ['होम', 'घर'] },
};

export function detectGuideCommand(text: string, language: Language): GuideCommand {
  const normalized = text.trim().toLocaleLowerCase();
  const order: Array<Exclude<GuideCommand, 'unknown'>> = [
    'stop',
    'repeat',
    'back',
    'skip',
    'yes',
    'no',
    'continue',
    'resume',
    'jobs',
    'applications',
    'assistant',
    'home',
  ];
  return (
    order.find((command) =>
      commands[command][language].some((phrase) =>
        normalized.includes(phrase.toLocaleLowerCase())
      )
    ) || 'unknown'
  );
}

const numberWords: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5, पाँच: 5, छह: 6, सात: 7, आठ: 8, नौ: 9, दस: 10,
  ஒன்று: 1, இரண்டு: 2, மூன்று: 3, நான்கு: 4, ஐந்து: 5,
  ఒకటి: 1, రెండు: 2, మూడు: 3, నాలుగు: 4, ఐదు: 5,
  এক: 1, দুই: 2, তিন: 3, চার: 4, পাঁচ: 5,
};

export function parseExperience(text: string): number {
  const digit = text.match(/\d+/);
  if (digit) return Math.min(50, Number(digit[0]));
  const normalized = text.toLocaleLowerCase();
  const match = Object.entries(numberWords).find(([word]) => normalized.includes(word));
  return match?.[1] ?? 0;
}

const skillMap: Array<{ skill: string; words: string[] }> = [
  { skill: 'Driver', words: ['driver', 'driving', 'ड्राइवर', 'ड्राइविंग', 'ஓட்டுநர்', 'డ్రైవర్', 'চালক'] },
  { skill: 'Delivery', words: ['delivery', 'डिलीवरी', 'டெலிவரி', 'డెలివరీ', 'ডেলিভারি'] },
  { skill: 'Construction', words: ['construction', 'mason', 'निर्माण', 'मिस्त्री', 'கட்டுமானம்', 'నిర్మాణం', 'নির্মাণ'] },
  { skill: 'Warehouse', words: ['warehouse', 'गोदाम', 'கிடங்கு', 'గిడ్డంగి', 'গুদাম'] },
  { skill: 'Security', words: ['security', 'guard', 'सुरक्षा', 'गार्ड', 'பாதுகாப்பு', 'భద్రత', 'নিরাপত্তা'] },
  { skill: 'Factory', words: ['factory', 'फैक्ट्री', 'தொழிற்சாலை', 'ఫ్యాక్టరీ', 'কারখানা'] },
  { skill: 'Electrician', words: ['electrician', 'electric', 'इलेक्ट्रीशियन', 'बिजली', 'மின்சாரம்', 'ఎలక్ట్రీషియన్', 'ইলেকট্রিশিয়ান'] },
  { skill: 'Plumber', words: ['plumber', 'plumbing', 'प्लंबर', 'பிளம்பர்', 'ప్లంబర్', 'প্লাম্বার'] },
  { skill: 'Housekeeping', words: ['housekeeping', 'cleaning', 'सफाई', 'தூய்மை', 'హౌస్‌కీపింగ్', 'পরিচ্ছন্নতা'] },
];

export function parseSkills(text: string): string[] {
  const normalized = text.toLocaleLowerCase();
  const matched = skillMap
    .filter(({ words }) => words.some((word) => normalized.includes(word.toLocaleLowerCase())))
    .map(({ skill }) => skill);
  if (matched.length) return matched;
  return text
    .split(/,|;| and | और | மற்றும் | మరియు | এবং /i)
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export function buildResumeSummary(
  language: Language,
  data: Record<GuideField, string>
): string {
  const years = parseExperience(data.experience);
  const skillText = parseSkills(data.skills).join(', ');
  const pieces: Record<Language, string> = {
    en: `${data.name} has ${years} years of work experience. Skills: ${skillText}. ${data.workHistory} Looking for ${data.preferredJob} work in ${data.location}.`,
    hi: `${data.name} के पास ${years} साल का काम का अनुभव है। कौशल: ${skillText}। ${data.workHistory} अब ${data.location} में ${data.preferredJob} का काम चाहते हैं।`,
  };
  return pieces[language].replace(/\s+/g, ' ').trim();
}

