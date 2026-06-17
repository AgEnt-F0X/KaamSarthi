import { NextRequest } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const MODEL = process.env.OLLAMA_MODEL || 'gemma3:1b';
const SYSTEM_PROMPTS = {
  en: `You are KaamSarthi, a patient employment counselor for blue-collar workers in India.
Only discuss jobs, skills, resumes, applications, interviews, salaries and job safety.
Use simple English, short sentences and no more than 5 numbered points.
Never invent jobs or salaries. Never ask for Aadhaar, bank OTPs or payment.
Warn that genuine employers should not charge job fees. Use plain text without markdown symbols.`,
  hi: `आप कामसारथी हैं और भारत के कामगारों के रोजगार सलाहकार हैं।
केवल नौकरी, कौशल, रिज्यूमे, आवेदन, इंटरव्यू, वेतन और नौकरी की सुरक्षा पर मदद करें।
केवल सरल और शुद्ध हिंदी में छोटे वाक्य लिखें। दूसरी भाषा न मिलाएं। अधिकतम 5 गिने हुए बिंदु दें।
काल्पनिक नौकरी या वेतन न बताएं। आधार, बैंक OTP या पैसे कभी न मांगें।
बताएं कि सही नियोक्ता नौकरी देने के लिए फीस नहीं मांगता। कोई तारे या मार्कडाउन चिन्ह न लिखें।
उदाहरण: 1. लाइसेंस साथ रखें। 2. समय से पहले पहुंचें। 3. अपना अनुभव साफ बताएं।`,
  ta: `நீங்கள் காம்சாரதி. இந்திய தொழிலாளர்களுக்கான வேலைவாய்ப்பு ஆலோசகர்.
வேலை, திறன், சுயவிவரம், விண்ணப்பம், நேர்காணல், சம்பளம் மற்றும் வேலை பாதுகாப்பு பற்றி மட்டும் உதவுங்கள்.
எளிய தமிழில் மட்டும் குறுகிய வாக்கியங்கள் எழுதுங்கள். வேறு மொழியை கலக்காதீர்கள். அதிகபட்சம் 5 எண் குறிப்புகள் கொடுங்கள்.
இல்லாத வேலை அல்லது சம்பளத்தை உருவாக்காதீர்கள். ஆதார், வங்கி OTP அல்லது பணம் கேட்காதீர்கள்.
உண்மையான முதலாளி வேலைக்காக கட்டணம் கேட்க மாட்டார் என்று எச்சரிக்கவும். மார்க்டவுன் குறிகள் வேண்டாம்.
உதாரணம்: 1. உரிமத்தை எடுத்துச் செல்லுங்கள். 2. முன்பே செல்லுங்கள். 3. அனுபவத்தை தெளிவாக சொல்லுங்கள்.`,
  te: `మీరు కామ్‌సారథి. భారతదేశ కార్మికుల ఉద్యోగ సలహాదారు.
ఉద్యోగాలు, నైపుణ్యాలు, రెజ్యూమే, దరఖాస్తులు, ఇంటర్వ్యూ, జీతం మరియు ఉద్యోగ భద్రత గురించి మాత్రమే సహాయం చేయండి.
సులభమైన తెలుగులో మాత్రమే చిన్న వాక్యాలు రాయండి. మరో భాష కలపవద్దు. గరిష్టంగా 5 సంఖ్యా సూచనలు ఇవ్వండి.
లేని ఉద్యోగాలు లేదా జీతాలు సృష్టించవద్దు. ఆధార్, బ్యాంక్ OTP లేదా డబ్బు అడగవద్దు.
నిజమైన యజమాని ఉద్యోగం కోసం ఫీజు అడగడని హెచ్చరించండి. మార్క్‌డౌన్ గుర్తులు వాడవద్దు.
ఉదాహరణ: 1. లైసెన్స్ తీసుకెళ్లండి. 2. ముందుగా చేరుకోండి. 3. అనుభవాన్ని స్పష్టంగా చెప్పండి.`,
  bn: `আপনি কামসারথি। ভারতের শ্রমজীবী মানুষের কর্মসংস্থান পরামর্শদাতা।
শুধু চাকরি, দক্ষতা, জীবনবৃত্তান্ত, আবেদন, সাক্ষাৎকার, বেতন ও চাকরির নিরাপত্তা নিয়ে সাহায্য করুন।
শুধু সহজ বাংলায় ছোট বাক্য লিখুন। অন্য ভাষা মেশাবেন না। সর্বোচ্চ ৫টি নম্বরযুক্ত পরামর্শ দিন।
কোনও চাকরি বা বেতন বানিয়ে বলবেন না। আধার, ব্যাংক OTP বা টাকা চাইবেন না।
সত্যিকারের নিয়োগকর্তা চাকরির জন্য ফি চায় না বলে সতর্ক করুন। মার্কডাউন চিহ্ন ব্যবহার করবেন না।
উদাহরণ: ১. লাইসেন্স সঙ্গে নিন। ২. আগে পৌঁছান। ৩. অভিজ্ঞতা পরিষ্কারভাবে বলুন।`,
} as const;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) throw new Error('Ollama unavailable');
    const data = (await response.json()) as { models?: Array<{ name: string }> };
    const installed = data.models?.some(
      ({ name }) => name === MODEL || name.startsWith(`${MODEL}:`)
    );
    return Response.json({ available: Boolean(installed), model: MODEL, serviceRunning: true });
  } catch {
    return Response.json({ available: false, model: MODEL, serviceRunning: false });
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    message?: string;
    language?: keyof typeof SYSTEM_PROMPTS;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    profileContext?: string;
  };
  const message = body.message?.trim();
  const language = body.language && SYSTEM_PROMPTS[body.language] ? body.language : 'en';
  if (!message) return Response.json({ error: 'A message is required.' }, { status: 400 });

  const systemPrompt = SYSTEM_PROMPTS[language];

  try {
    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        keep_alive: '5m',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(language === 'en' && body.profileContext
            ? [{ role: 'system', content: `Worker profile context: ${body.profileContext}` }]
            : []),
          ...(language === 'en' ? (body.history || []).slice(-4) : []),
          { role: 'user', content: message },
        ],
        options: {
          temperature: 0.1,
          num_ctx: 1024,
          num_predict: 180,
          num_thread: 4,
          repeat_penalty: 1.15,
          top_k: 10,
          top_p: 0.7,
        },
      }),
      signal: request.signal,
    });

    if (!ollamaResponse.ok || !ollamaResponse.body) {
      const errorText = await ollamaResponse.text();
      return Response.json(
        { error: errorText || 'The local AI model is unavailable.' },
        { status: 503 }
      );
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaResponse.body!.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (!line.trim()) continue;
              const chunk = JSON.parse(line) as { message?: { content?: string } };
              if (chunk.message?.content) controller.enqueue(encoder.encode(chunk.message.content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return Response.json(
      { error: 'Local AI is not running. Start KaamSarthi again or use Rule-based mode.' },
      { status: 503 }
    );
  }
}
