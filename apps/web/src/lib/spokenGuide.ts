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
    waiting: 'Tap the microphone and speak naturally.',
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
    waiting: 'माइक दबाकर आराम से बोलें।',
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
  ta: {
    offer: 'குரல் வழிகாட்டல் வேண்டுமா? ஆம் அல்லது இல்லை என்பதை அழுத்துங்கள் அல்லது சொல்லுங்கள்.',
    newWelcome: 'உங்கள் சுயவிவரத்தையும் வேலை விவரத்தையும் உருவாக்க உதவுவேன். ஒரு நேரத்தில் ஒரு கேள்வி கேட்பேன்.',
    returningWelcome: (name) =>
      `மீண்டும் வரவேற்கிறேன் ${name}. சுயவிவரம், வேலைகள், விண்ணப்பங்கள், உதவியாளர் அல்லது முகப்பு என்று சொல்லுங்கள்.`,
    menu: 'என்ன செய்ய வேண்டும்? சுயவிவரம், வேலைகள், விண்ணப்பங்கள், உதவியாளர் அல்லது முகப்பு என்று சொல்லுங்கள்.',
    heard: (answer) => `நான் கேட்டது: ${answer}. இது சரியா?`,
    correct: 'ஆம், சரி',
    tryAgain: 'இல்லை, மீண்டும்',
    continue: 'தொடரவும்',
    stop: 'வழிகாட்டலை நிறுத்து',
    skip: 'தவிர்க்கவும்',
    repeat: 'மீண்டும் சொல்லுங்கள்',
    back: 'பின்னால்',
    listening: 'நான் கேட்கிறேன்',
    waiting: 'மைக்ரோஃபோனை அழுத்தி இயல்பாக பேசுங்கள்.',
    reviewTitle: 'எல்லாவற்றையும் சரிபார்க்கவும்',
    reviewHelp: 'எல்லாம் சரியாக இருந்தால் பெரிய தொடரவும் பொத்தானை அழுத்துங்கள்.',
    saved: 'உங்கள் சுயவிவரமும் வேலை விவரமும் இந்த சாதனத்தில் சேமிக்கப்பட்டது.',
    startupLabel: 'செயலி திறக்கும் போது பேசவும்',
    talkButton: 'காம்சாரதியுடன் பேசுங்கள்',
    openAction: { resume: 'சுயவிவர வழிகாட்டியை திறக்கவா?', jobs: 'பொருத்தமான வேலைகளை திறக்கவா?', applications: 'விண்ணப்பங்களை திறக்கவா?', assistant: 'வேலை உதவியாளரை திறக்கவா?', home: 'முகப்புக்கு செல்லவா?' },
    actionDone: { resume: 'உங்கள் சுயவிவரத்தை உருவாக்குவோம்.', jobs: 'பொருத்தமான வேலைகளை முதலில் காட்டியுள்ளேன்.', applications: 'உங்கள் விண்ணப்பங்கள் இங்கே உள்ளன.', assistant: 'வேலை உதவியாளர் திறந்துள்ளது.', home: 'நீங்கள் முகப்பில் உள்ளீர்கள்.' },
    fields: {
      name: { label: 'பெயர்', question: 'உங்கள் முழுப் பெயர் என்ன?', placeholder: 'பெயரை சொல்லுங்கள் அல்லது எழுதுங்கள்' },
      mobile: { label: 'மொபைல்', question: 'உங்கள் மொபைல் எண் என்ன?', placeholder: 'மொபைல் எண்ணை சொல்லுங்கள்' },
      location: { label: 'இடம்', question: 'எந்த நகரம் அல்லது பகுதியில் வசிக்கிறீர்கள்?', placeholder: 'நகரம் அல்லது பகுதியை சொல்லுங்கள்' },
      skills: { label: 'திறன்கள்', question: 'நீங்கள் எந்த வேலைகளை நன்றாக செய்வீர்கள்?', placeholder: 'உதாரணம்: ஓட்டுநர், டெலிவரி, மின்சாரம்' },
      experience: { label: 'அனுபவம்', question: 'எத்தனை ஆண்டுகள் வேலை அனுபவம் உள்ளது?', placeholder: 'உதாரணம்: மூன்று ஆண்டுகள்' },
      workHistory: { label: 'முந்தைய வேலை', question: 'உங்கள் முந்தைய வேலையும் செய்த பணிகளையும் சொல்லுங்கள்.', placeholder: 'முந்தைய வேலையை விவரிக்கவும்' },
      preferredJob: { label: 'விரும்பும் வேலை', question: 'இப்போது எந்த வேலை வேண்டும்?', placeholder: 'உதாரணம்: ஓட்டுநர் வேலை' },
    },
  },
  te: {
    offer: 'మీకు మాట్లాడే మార్గదర్శకం కావాలా? అవును లేదా కాదు నొక్కండి లేదా చెప్పండి.',
    newWelcome: 'మీ ప్రొఫైల్ మరియు రెజ్యూమే తయారు చేయడంలో సహాయం చేస్తాను. ఒక్కసారి ఒక ప్రశ్న అడుగుతాను.',
    returningWelcome: (name) =>
      `మళ్లీ స్వాగతం ${name}. రెజ్యూమే, ఉద్యోగాలు, దరఖాస్తులు, సహాయకుడు లేదా హోమ్ అని చెప్పండి.`,
    menu: 'ఏం చేయాలి? రెజ్యూమే, ఉద్యోగాలు, దరఖాస్తులు, సహాయకుడు లేదా హోమ్ అని చెప్పండి.',
    heard: (answer) => `నేను విన్నది: ${answer}. ఇది సరైనదేనా?`,
    correct: 'అవును, సరైనది',
    tryAgain: 'కాదు, మళ్లీ',
    continue: 'కొనసాగించండి',
    stop: 'మార్గదర్శకం ఆపండి',
    skip: 'దాటవేయండి',
    repeat: 'మళ్లీ చెప్పండి',
    back: 'వెనక్కి',
    listening: 'నేను వింటున్నాను',
    waiting: 'మైక్ నొక్కి సహజంగా మాట్లాడండి.',
    reviewTitle: 'అన్నీ తనిఖీ చేయండి',
    reviewHelp: 'అన్నీ బాగుంటే పెద్ద కొనసాగించండి బటన్ నొక్కండి.',
    saved: 'మీ ప్రొఫైల్ మరియు రెజ్యూమే ఈ పరికరంలో సేవ్ అయ్యాయి.',
    startupLabel: 'యాప్ తెరిచినప్పుడు మాట్లాడండి',
    talkButton: 'కామ్‌సారథితో మాట్లాడండి',
    openAction: { resume: 'రెజ్యూమే మార్గదర్శకం తెరవాలా?', jobs: 'సరిపోయే ఉద్యోగాలు తెరవాలా?', applications: 'దరఖాస్తులు తెరవాలా?', assistant: 'ఉద్యోగ సహాయకుడిని తెరవాలా?', home: 'హోమ్‌కు వెళ్లాలా?' },
    actionDone: { resume: 'మీ ప్రొఫైల్ మరియు రెజ్యూమే తయారు చేద్దాం.', jobs: 'సరిపోయే ఉద్యోగాలను ముందుగా చూపించాను.', applications: 'మీ దరఖాస్తులు ఇవి.', assistant: 'ఉద్యోగ సహాయకుడు తెరిచాడు.', home: 'మీరు హోమ్‌లో ఉన్నారు.' },
    fields: {
      name: { label: 'పేరు', question: 'మీ పూర్తి పేరు ఏమిటి?', placeholder: 'పేరు చెప్పండి లేదా టైప్ చేయండి' },
      mobile: { label: 'మొబైల్', question: 'మీ మొబైల్ నంబర్ ఏమిటి?', placeholder: 'మొబైల్ నంబర్ చెప్పండి' },
      location: { label: 'ప్రాంతం', question: 'మీరు ఏ నగరం లేదా ప్రాంతంలో ఉంటారు?', placeholder: 'నగరం లేదా ప్రాంతం చెప్పండి' },
      skills: { label: 'నైపుణ్యాలు', question: 'మీరు ఏ పనులు బాగా చేస్తారు?', placeholder: 'ఉదాహరణ: డ్రైవింగ్, డెలివరీ, ఎలక్ట్రిషియన్' },
      experience: { label: 'అనుభవం', question: 'మీకు ఎన్ని సంవత్సరాల పని అనుభవం ఉంది?', placeholder: 'ఉదాహరణ: మూడు సంవత్సరాలు' },
      workHistory: { label: 'గత పని', question: 'మీ గత పని మరియు చేసిన పనుల గురించి చెప్పండి.', placeholder: 'గత పనిని వివరించండి' },
      preferredJob: { label: 'కావలసిన ఉద్యోగం', question: 'ఇప్పుడు మీకు ఏ ఉద్యోగం కావాలి?', placeholder: 'ఉదాహరణ: డ్రైవర్ ఉద్యోగం' },
    },
  },
  bn: {
    offer: 'আপনি কি কথায় নির্দেশনা চান? হ্যাঁ বা না চাপুন, অথবা বলুন।',
    newWelcome: 'আমি আপনার প্রোফাইল ও জীবনবৃত্তান্ত তৈরি করতে সাহায্য করব। একবারে একটি প্রশ্ন করব।',
    returningWelcome: (name) =>
      `আবার স্বাগতম ${name}। জীবনবৃত্তান্ত, চাকরি, আবেদন, সহায়ক বা হোম বলুন।`,
    menu: 'আপনি কী করতে চান? জীবনবৃত্তান্ত, চাকরি, আবেদন, সহায়ক বা হোম বলুন।',
    heard: (answer) => `আমি শুনেছি: ${answer}। এটি কি ঠিক?`,
    correct: 'হ্যাঁ, ঠিক',
    tryAgain: 'না, আবার বলুন',
    continue: 'এগিয়ে যান',
    stop: 'নির্দেশনা বন্ধ করুন',
    skip: 'বাদ দিন',
    repeat: 'আবার বলুন',
    back: 'পিছনে যান',
    listening: 'আমি শুনছি',
    waiting: 'মাইক চাপুন এবং স্বাভাবিকভাবে বলুন।',
    reviewTitle: 'সব তথ্য পরীক্ষা করুন',
    reviewHelp: 'সব ঠিক থাকলে বড় এগিয়ে যান বোতাম চাপুন।',
    saved: 'আপনার প্রোফাইল ও জীবনবৃত্তান্ত এই ডিভাইসে সংরক্ষিত হয়েছে।',
    startupLabel: 'অ্যাপ খুললে কথা বলুন',
    talkButton: 'কামসারথির সঙ্গে কথা বলুন',
    openAction: { resume: 'জীবনবৃত্তান্ত নির্দেশনা খুলব?', jobs: 'উপযুক্ত চাকরি খুলব?', applications: 'আপনার আবেদন খুলব?', assistant: 'কর্মসংস্থান সহায়ক খুলব?', home: 'হোমে যাব?' },
    actionDone: { resume: 'আপনার প্রোফাইল ও জীবনবৃত্তান্ত তৈরি করি।', jobs: 'উপযুক্ত চাকরি আগে দেখিয়েছি।', applications: 'এখানে আপনার আবেদন আছে।', assistant: 'কর্মসংস্থান সহায়ক খোলা হয়েছে।', home: 'আপনি হোমে আছেন।' },
    fields: {
      name: { label: 'নাম', question: 'আপনার পুরো নাম কী?', placeholder: 'নাম বলুন বা লিখুন' },
      mobile: { label: 'মোবাইল', question: 'আপনার মোবাইল নম্বর কী?', placeholder: 'মোবাইল নম্বর বলুন' },
      location: { label: 'এলাকা', question: 'আপনি কোন শহর বা এলাকায় থাকেন?', placeholder: 'শহর বা এলাকা বলুন' },
      skills: { label: 'দক্ষতা', question: 'আপনি কোন কাজ ভালো পারেন?', placeholder: 'যেমন চালক, ডেলিভারি, ইলেকট্রিশিয়ান' },
      experience: { label: 'অভিজ্ঞতা', question: 'আপনার কত বছরের কাজের অভিজ্ঞতা আছে?', placeholder: 'যেমন তিন বছর' },
      workHistory: { label: 'আগের কাজ', question: 'আপনার আগের কাজ ও কাজের দায়িত্ব সম্পর্কে বলুন।', placeholder: 'আগের কাজ বর্ণনা করুন' },
      preferredJob: { label: 'পছন্দের চাকরি', question: 'এখন আপনি কী ধরনের চাকরি চান?', placeholder: 'যেমন চালকের চাকরি' },
    },
  },
};

const commands: Record<Exclude<GuideCommand, 'unknown'>, Record<Language, string[]>> = {
  yes: { en: ['yes', 'yeah', 'okay', 'correct', 'right'], hi: ['हाँ', 'हां', 'जी', 'सही', 'ठीक'], ta: ['ஆம்', 'ஆமா', 'சரி'], te: ['అవును', 'సరే', 'సరి'], bn: ['হ্যাঁ', 'হ্যা', 'ঠিক', 'আচ্ছা'] },
  no: { en: ['no', 'nope', 'wrong'], hi: ['नहीं', 'नही', 'गलत'], ta: ['இல்லை', 'வேண்டாம்', 'தவறு'], te: ['కాదు', 'వద్దు', 'తప్పు'], bn: ['না', 'ভুল'] },
  repeat: { en: ['repeat', 'say again', 'again'], hi: ['फिर बोलो', 'दोबारा', 'फिर से'], ta: ['மீண்டும்', 'திரும்ப சொல்லு'], te: ['మళ్లీ', 'మరలా చెప్పు'], bn: ['আবার বলুন', 'আবার'] },
  back: { en: ['go back', 'back'], hi: ['पीछे', 'वापस'], ta: ['பின்னால்', 'திரும்ப'], te: ['వెనక్కి', 'తిరిగి'], bn: ['পিছনে', 'ফিরে যান'] },
  skip: { en: ['skip', 'leave it'], hi: ['छोड़ो', 'छोड़ दें'], ta: ['தவிர்', 'விடு'], te: ['దాటవేయి', 'వదిలేయి'], bn: ['বাদ দিন', 'ছেড়ে দিন'] },
  stop: { en: ['stop', 'close', 'enough'], hi: ['बंद', 'रुको', 'बस'], ta: ['நிறுத்து', 'போதும்'], te: ['ఆపు', 'చాలు'], bn: ['বন্ধ', 'থামুন'] },
  continue: { en: ['continue', 'next', 'go ahead'], hi: ['आगे', 'जारी', 'चलो'], ta: ['தொடரவும்', 'அடுத்து'], te: ['కొనసాగించు', 'తర్వాత'], bn: ['এগিয়ে', 'পরের'] },
  resume: { en: ['resume', 'profile', 'cv'], hi: ['रिज्यूमे', 'बायोडाटा', 'प्रोफाइल'], ta: ['சுயவிவரம்', 'ரெஸ்யூம்'], te: ['రెజ్యూమే', 'ప్రొఫైల్'], bn: ['জীবনবৃত্তান্ত', 'রেজুমে', 'প্রোফাইল'] },
  jobs: { en: ['job', 'work', 'vacancy'], hi: ['नौकरी', 'काम', 'रोजगार'], ta: ['வேலை'], te: ['ఉద్యోగం', 'పని'], bn: ['চাকরি', 'কাজ'] },
  applications: { en: ['application', 'applied'], hi: ['आवेदन', 'अप्लाई'], ta: ['விண்ணப்பம்'], te: ['దరఖాస్తు'], bn: ['আবেদন'] },
  assistant: { en: ['assistant', 'advice', 'help'], hi: ['सहायक', 'सलाह', 'मदद'], ta: ['உதவியாளர்', 'உதவி'], te: ['సహాయకుడు', 'సహాయం'], bn: ['সহায়ক', 'সাহায্য'] },
  home: { en: ['home', 'main screen'], hi: ['होम', 'घर'], ta: ['முகப்பு'], te: ['హోమ్'], bn: ['হোম'] },
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
    ta: `${data.name} அவர்களுக்கு ${years} ஆண்டுகள் வேலை அனுபவம் உள்ளது. திறன்கள்: ${skillText}. ${data.workHistory} ${data.location} பகுதியில் ${data.preferredJob} வேலை விரும்புகிறார்.`,
    te: `${data.name}కు ${years} సంవత్సరాల పని అనుభవం ఉంది. నైపుణ్యాలు: ${skillText}. ${data.workHistory} ${data.location}లో ${data.preferredJob} ఉద్యోగం కావాలి.`,
    bn: `${data.name}-এর ${years} বছরের কাজের অভিজ্ঞতা আছে। দক্ষতা: ${skillText}। ${data.workHistory} এখন ${data.location} এলাকায় ${data.preferredJob} কাজ চান।`,
  };
  return pieces[language].replace(/\s+/g, ' ').trim();
}

