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
  ta: {
    offer: 'குரல் வழிகாட்டுதல் வேண்டுமா? ஆம் அல்லது இல்லை என்பதைத் தட்டவும், அல்லது ஆம் அல்லது இல்லை என்று சொல்லவும்.',
    newWelcome:
      'உங்கள் விவரக்குறிப்பு மற்றும் சுயவிவரத்தை உருவாக்க நான் உதவுகிறேன். நான் ஒவ்வொரு கேள்வியாகக் கேட்பேன்.',
    returningWelcome: (name) =>
      `மீண்டும் வருக ${name}. நீங்கள் என்ன செய்ய விரும்புகிறீர்கள் என்று சொல்லுங்கள். சுயவிவரம் புதுப்பிக்கவும், வேலைகளைக் காட்டவும், விண்ணப்பங்கள் அல்லது உதவியாளரிடம் கேட்கவும் என நீங்கள் சொல்லலாம்.`,
    menu: 'நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்? சுயவிவரம், வேலைகள், விண்ணப்பங்கள், உதவியாளர் அல்லது முகப்பு என்று சொல்லுங்கள்.',
    heard: (answer) => `நான் கேட்டது: ${answer}. இது சரியானதா?`,
    correct: 'ஆம், சரி',
    tryAgain: 'இல்லை, மீண்டும் சொல்லுங்கள்',
    continue: 'தொடரவும்',
    stop: 'வழிகாட்டுதலை நிறுத்து',
    skip: 'தவிர்',
    repeat: 'மீண்டும் சொல்',
    back: 'பின்னே செல்',
    listening: 'நான் கேட்கிறேன்',
    waiting: 'பேசுவதற்கு மைக்ரோஃபோனை அழுத்திப் பிடிக்கவும்.',
    reviewTitle: 'எல்லாவற்றையும் சரிபார்க்கவும்',
    reviewHelp: 'எல்லாம் சரியாக இருந்தால், பெரிய தொடரவும் பொத்தானைத் தட்டவும்.',
    saved: 'உங்கள் சுயவிவரம் மற்றும் விவரங்கள் இந்த சாதனத்தில் சேமிக்கப்பட்டுள்ளன.',
    startupLabel: 'பயன்பாடு திறக்கும்போது பேசவும்',
    talkButton: 'காம்சாரதியுடன் பேசுங்கள்',
    openAction: {
      resume: 'சுயவிவர வழிகாட்டியைத் திறக்கவா?',
      jobs: 'பொருத்தமான வேலைகளைத் திறக்கவா?',
      applications: 'உங்கள் விண்ணப்பங்களைத் திறக்கவா?',
      assistant: 'வேலைவாய்ப்பு உதவியாளரைத் திறக்கவா?',
      home: 'முகப்புத் திரைக்குச் செல்லவா?',
    },
    actionDone: {
      resume: 'உங்கள் விவரக்குறிப்பு மற்றும் சுயவிவரத்தை உருவாக்குவோம்.',
      jobs: 'வேலைகளைத் திறந்து மிகவும் பொருத்தமான வேலையை முதலில் வைத்துள்ளேன்.',
      applications: 'இதோ உங்கள் வேலை விண்ணப்பங்கள்.',
      assistant: 'வேலைவாய்ப்பு உதவியாளர் திறக்கப்பட்டுள்ளது.',
      home: 'நீங்கள் முகப்புத் திரையில் உள்ளீர்கள்.',
    },
    fields: {
      name: { label: 'பெயர்', question: 'உங்கள் முழு பெயர் என்ன?', placeholder: 'உங்கள் முழு பெயரைச் சொல்லவும் அல்லது எழுதவும்' },
      mobile: { label: 'மொபைல்', question: 'உங்கள் மொபைல் எண் என்ன?', placeholder: 'உங்கள் மொபைல் எண்ணைச் சொல்லவும் அல்லது எழுதவும்' },
      location: { label: 'இடம்', question: 'நீங்கள் எந்த நகரம் அல்லது பகுதியில் வசிக்கிறீர்கள்?', placeholder: 'உங்கள் நகரம் அல்லது பகுதியைச் சொல்லவும்' },
      skills: { label: 'திறன்கள்', question: 'நீங்கள் எந்த வேலையை நன்றாகச் செய்வீர்கள்? ஒன்றுக்கு மேற்பட்ட திறன்களைக் கூறலாம்.', placeholder: 'எடுத்துக்காட்டு: ஓட்டுநர், டெலிவரி, எலக்ட்ரீஷியன்' },
      experience: { label: 'அனுபவம்', question: 'உங்களுக்கு எத்தனை வருட வேலை அனுபவம் உள்ளது?', placeholder: 'எடுத்துக்காட்டு: மூன்று ஆண்டுகள்' },
      workHistory: { label: 'முந்தைய வேலை', question: 'உங்கள் முந்தைய வேலை மற்றும் நீங்கள் செய்த பணிகளைப் பற்றிச் சொல்லுங்கள்.', placeholder: 'உங்கள் முந்தைய வேலையை விவரிக்கவும்' },
      preferredJob: { label: 'விரும்பும் வேலை', question: 'இப்போது நீங்கள் எந்த வகையான வேலையை விரும்புகிறீர்கள்?', placeholder: 'எடுத்துக்காட்டு: ஓட்டுநர் வேலை' },
    },
  },
  te: {
    offer: 'మీకు వాయిస్ మార్గదర్శకత్వం కావాలా? అవును లేదా కాదు అని నొక్కండి, లేదా అవును లేదా కాదు అని చెప్పండి.',
    newWelcome:
      'మీ ప్రొఫైల్ మరియు రెజ్యూమేని రూపొందించడంలో నేను మీకు సహాయం చేస్తాను. నేను ఒకేసారి ఒక ప్రశ్న అడుగుతాను.',
    returningWelcome: (name) =>
      `స్వాగతం ${name}. మీరు ఏమి చేయాలనుకుంటున్నారో చెప్పండి. రెజ్యూమేని అప్‌డేట్ చేయండి, ఉద్యోగాలు చూపించండి, దరఖాస్తులు లేదా సహాయకుడిని అడగండి అని మీరు చెప్పవచ్చు.`,
    menu: 'మీరు ఏమి చేయాలనుకుంటున్నారు? రెజ్యూమే, ఉద్యోగాలు, దరఖాస్తులు, సహాయకుడు లేదా హోమ్ అని చెప్పండి.',
    heard: (answer) => `నేను విన్నది: ${answer}. ఇది సరైనదేనా?`,
    correct: 'అవును, సరైనది',
    tryAgain: 'కాదు, మళ్ళీ చెప్పండి',
    continue: 'కొనసాగించండి',
    stop: 'మార్గదర్శకత్వం ఆపండి',
    skip: 'దాటవేయి',
    repeat: 'మళ్ళీ చెప్పండి',
    back: 'వెనక్కి వెళ్ళండి',
    listening: 'నేను వింటున్నాను',
    waiting: 'మాట్లాడటానికి మైక్ పట్టుకోండి.',
    reviewTitle: 'అన్ని వివరాలను తనిఖీ చేయండి',
    reviewHelp: 'అంతా సరిగ్గా ఉంటే, పెద్ద కొనసాగించండి బటన్‌ను నొక్కండి.',
    saved: 'మీ ప్రొఫైల్ మరియు రెజ్యూమే ఈ పరికరంలో సేవ్ చేయబడ్డాయి.',
    startupLabel: 'యాప్ తెరిచినప్పుడు మాట్లాడండి',
    talkButton: 'కామ్‌సారథితో మాట్లాడండి',
    openAction: {
      resume: 'రెజ్యూమే గైడ్‌ని తెరవాలా?',
      jobs: 'అనుకూలమైన ఉద్యోగాలను తెరవాలా?',
      applications: 'మీ దరఖాస్తులను తెరవాలా?',
      assistant: 'ఉపాధి సహాయకుడిని తెరవాలా?',
      home: 'హోమ్ స్క్రీన్‌కి వెళ్లాలా?',
    },
    actionDone: {
      resume: 'మీ ప్రొఫైల్ మరియు రెజ్యూమేని రూపొందిద్దాం.',
      jobs: 'నేను ఉద్యోగాలను తెరిచాను మరియు అత్యంత అనుకూలమైన పనిని ముందుగా ఉంచాను.',
      applications: 'ఇవి మీ ఉద్యోగ దరఖాస్తులు.',
      assistant: 'ఉపాధి సహాయకుడు తెరవబడింది.',
      home: 'మీరు హోమ్ స్క్రీన్‌లో ఉన్నారు.',
    },
    fields: {
      name: { label: 'పేరు', question: 'మీ పూర్తి పేరు ఏమిటి?', placeholder: 'మీ పూర్తి పేరు చెప్పండి లేదా టైప్ చేయండి' },
      mobile: { label: 'మొబైల్', question: 'మీ మొబైల్ నంబర్ ఏమిటి?', placeholder: 'మీ మొబైల్ నంబర్ చెప్పండి లేదా టైప్ చేయండి' },
      location: { label: 'ప్రదేశం', question: 'మీరు ఏ నగరం లేదా ప్రాంతంలో నివసిస్తున్నారు?', placeholder: 'మీ నగరం లేదా ప్రాంతాన్ని చెప్పండి' },
      skills: { label: 'నైపుణ్యాలు', question: 'మీరు ఏ పని బాగా చేయగలరు? మీరు ఒకటి కంటే ఎక్కువ నైపుణ్యాలను పేర్కొనవచ్చు.', placeholder: 'ఉదాహరణకు: డ్రైవింగ్, డెలివరీ, ఎలక్ట్రీషియన్' },
      experience: { label: 'అనుభవం', question: 'మీకు ఎన్ని సంవత్సరాల పని అనుభవం ఉంది?', placeholder: 'ఉదాహరణకు: మూడు సంవత్సరాలు' },
      workHistory: { label: 'గత పని', question: 'మీ గత పని మరియు మీరు చేసిన పనుల గురించి చెప్పండి.', placeholder: 'మీ గత పనిని వివరించండి' },
      preferredJob: { label: 'కోరుకునే ఉద్యోగం', question: 'ఇప్పుడు మీరు ఎలాంటి ఉద్యోగం చేయాలనుకుంటున్నారు?', placeholder: 'ఉదాహరణకు: డ్రైవర్ ఉద్యోగం' },
    },
  },
  bn: {
    offer: 'আপনি কি মুখে বলে সাহায্য চান? হ্যাঁ বা না চাপুন, অথবা হ্যাঁ বা না বলুন।',
    newWelcome:
      'আমি আপনার প্রোফাইল এবং জীবনবৃত্তান্ত তৈরি করতে সাহায্য করব। আমি একবারে একটি করে প্রশ্ন করব।',
    returningWelcome: (name) =>
      `স্বাগতম ${name}। আপনি কী করতে চান বলুন। আপনি বলতে পারেন রেজিউমে আপডেট করুন, চাকরি দেখান, আবেদন দেখান বা সহায়ককে জিজ্ঞাসা করুন।`,
    menu: 'আপনি কী করতে চান? রেজিউমে, চাকরি, আবেদন, সহায়ক বা হোম বলুন।',
    heard: (answer) => `আমি শুনেছি: ${answer}। এটি কি সঠিক?`,
    correct: 'হ্যাঁ, সঠিক',
    tryAgain: 'না, আবার বলুন',
    continue: 'চালিয়ে যান',
    stop: 'নির্দেশনা বন্ধ করুন',
    skip: 'এড়িয়ে যান',
    repeat: 'আবার বলুন',
    back: 'পেছনে যান',
    listening: 'আমি শুনছি',
    waiting: 'কথা বলতে মাইক চেপে ধরে রাখুন।',
    reviewTitle: 'সব তথ্য যাচাই করুন',
    reviewHelp: 'সব ঠিক থাকলে, নিচের বড় চালিয়ে যান বোতামটি চাপুন।',
    saved: 'আপনার প্রোফাইল এবং রেজিউমে এই ডিভাইসে সংরক্ষিত হয়েছে।',
    startupLabel: 'অ্যাপ খোলার সময় কথা বলুন',
    talkButton: 'কামসারথির সাথে কথা বলুন',
    openAction: {
      resume: 'রেজিউমে গাইড খুলবেন?',
      jobs: 'উপযুক্ত চাকরিগুলো খুলবেন?',
      applications: 'আপনার আবেদনগুলো খুলবেন?',
      assistant: 'কর্মসংস্থান সহায়ক খুলবেন?',
      home: 'হোম স্ক্রিনে যাবেন?',
    },
    actionDone: {
      resume: 'চলুন আপনার প্রোফাইল এবং রেজিউমে তৈরি করি।',
      jobs: 'আমি চাকরিগুলো খুলেছি এবং সবচেয়ে উপযুক্ত কাজ আগে রেখেছি।',
      applications: 'এখানে আপনার চাকরির আবেদনগুলো রয়েছে।',
      assistant: 'কর্মসংস্থান সহায়ক খোলা হয়েছে।',
      home: 'আপনি হোম স্ক্রিনে আছেন।',
    },
    fields: {
      name: { label: 'নাম', question: 'আপনার পুরো নাম কী?', placeholder: 'আপনার পুরো নাম বলুন বা লিখুন' },
      mobile: { label: 'মোবাইল', question: 'আপনার মোবাইল নম্বর কী?', placeholder: 'আপনার মোবাইল নম্বর বলুন বা লিখুন' },
      location: { label: 'অবস্থান', question: 'আপনি কোন শহর বা এলাকায় থাকেন?', placeholder: 'আপনার শহর বা এলাকা বলুন' },
      skills: { label: 'দক্ষতা', question: 'আপনি কোন কাজে পারদর্শী? একাধিক দক্ষতা বলতে পারেন।', placeholder: 'যেমন: ড্রাইভিং, ডেলিভারি, ইলেকট্রিশিয়ান' },
      experience: { label: 'অভিজ্ঞতা', question: 'আপনার কত বছরের কাজের অভিজ্ঞতা আছে?', placeholder: 'যেমন: তিন বছর' },
      workHistory: { label: 'আগের কাজ', question: 'আপনার আগের কাজ এবং করা দায়িত্বগুলো সম্পর্কে বলুন।', placeholder: 'আপনার আগের কাজ বর্ণনা করুন' },
      preferredJob: { label: 'কাঙ্ক্ষিত চাকরি', question: 'এখন আপনি কী ধরনের চাকরি করতে চান?', placeholder: 'যেমন: ড্রাইভারের চাকরি' },
    },
  },
};

const commands: Record<Exclude<GuideCommand, 'unknown'>, Record<Language, string[]>> = {
  yes: { 
    en: ['yes', 'yeah', 'okay', 'correct', 'right'], 
    hi: ['हाँ', 'हां', 'जी', 'सही', 'ठीक'],
    ta: ['ஆம்', 'சரி', 'தகுந்து'],
    te: ['అవును', 'సರಿ', 'చెచ్చు'],
    bn: ['হ্যাঁ', 'ঠিক', 'সঠিক'],
  },
  no: { 
    en: ['no', 'nope', 'wrong'], 
    hi: ['नहीं', 'नही', 'गलत'],
    ta: ['இல்லை', 'தவறு'],
    te: ['లేదు', 'తప్పు'],
    bn: ['না', 'ভুল'],
  },
  repeat: { 
    en: ['repeat', 'say again', 'again'], 
    hi: ['फिर बोलो', 'दोबारा', 'फिर से'],
    ta: ['மீண்டும் பேசு', 'மீண்டும் சொல்லு'],
    te: ['మళ్లీ మాట్లాడండి', 'మళ్లీ చెప్పండి'],
    bn: ['আবার বলুন', 'আবার বলুন'],
  },
  back: { 
    en: ['go back', 'back'], 
    hi: ['पीछे', 'वापस'],
    ta: ['பின்னால் செல்', 'திரும்பு'],
    te: ['వెనక్కి వెళ్ళండి', 'విరివ��ా'],
    bn: ['পেছনে যান', 'ফিরে যান'],
  },
  skip: { 
    en: ['skip', 'leave it'], 
    hi: ['छोड़ो', 'छोड़ दें'],
    ta: ['விட்டு விடு', 'விடு'],
    te: ['తప్పించండి', 'తప్పించు'],
    bn: ['ছেড়ে দিন', 'বাদ দিন'],
  },
  stop: { 
    en: ['stop', 'close', 'enough'], 
    hi: ['बंद', 'रुको', 'बस'],
    ta: ['நிறுத்து', 'முடி'],
    te: ['ఆపండి', 'ఆపు'],
    bn: ['বন্ধ করুন', 'থামান'],
  },
  continue: { 
    en: ['continue', 'next', 'go ahead'], 
    hi: ['आगे', 'जारी', 'चलो'],
    ta: ['தொடரவும்', 'அடுத்தது'],
    te: ['తరవాత', 'కొనసాగించండి'],
    bn: ['চালিয়ে যান', 'পরবর্তী'],
  },
  resume: { 
    en: ['resume', 'profile', 'cv'], 
    hi: ['रिज्यूमे', 'बायोडाटा', 'प्रोफाइल'],
    ta: ['சுயவிவரம்', 'ரெசுமே', 'புரொஃபைல்'],
    te: ['రెజ్యూమే', 'ప్రొఫైల్', 'సీవీ'],
    bn: ['রেজিউমে', 'প্রোফাইল', 'সিভি'],
  },
  jobs: { 
    en: ['job', 'work', 'vacancy'], 
    hi: ['नौकरी', 'काम', 'रोजगार'],
    ta: ['வேலை', 'தொழில்', 'வேலை வாய்ப்பு'],
    te: ['ఉద్యోగం', 'పని', 'వాకన్సీ'],
    bn: ['চাকরি', 'কাজ', 'খালি জায়গা'],
  },
  applications: { 
    en: ['application', 'applied'], 
    hi: ['आवेदन', 'अप्लाई'],
    ta: ['விண்ணப்பம்', 'விண்ணப்பித்துள்ள'],
    te: ['దరఖాస్తు', 'అప్లై'],
    bn: ['আবেদন', 'আবেদন করলাম'],
  },
  assistant: { 
    en: ['assistant', 'advice', 'help'], 
    hi: ['सहायक', 'सलाह', 'मदद'],
    ta: ['உதவியாளர்', 'பரামரிசு', 'உதவி'],
    te: ['సహాయకరణీ', 'సలహా', 'సహాయం'],
    bn: ['সহায়ক', 'পরামর্শ', 'সাহায্য'],
  },
  home: { 
    en: ['home', 'main screen'], 
    hi: ['होम', 'घर'],
    ta: ['முகப்பு', 'முக்கத்திரை'],
    te: ['హోమ్', 'మêta స్క్రీన్'],
    bn: ['হোম', 'মূল স্ক্রিন'],
  },
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
    ta: `${data.name}-க்குள் ${years} ஆண்டுகள் வேலை அனுபவம் உள்ளது. திறன்கள்: ${skillText}. ${data.workHistory} ${data.location}-இல் ${data.preferredJob} வேலை தேடுகிறேன்.`,
    te: `${data.name}కి ${years} సంవత్సరాల పని అనుభవం ఉంది. నైపుణ్యాలు: ${skillText}. ${data.workHistory} ${data.location}లో ${data.preferredJob} ఉద్యోగాన్ని కోరుకుంటున్నాను.`,
    bn: `${data.name}-র ${years} বছরের কাজের অভিজ্ঞতা রয়েছে। দক্ষতা: ${skillText}। ${data.workHistory} ${data.location}-এ ${data.preferredJob} চাকরি চাই।`,
  };
  return pieces[language].replace(/\s+/g, ' ').trim();
}

