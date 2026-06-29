# KaamSarthi

KaamSarthi is a voice-first, mobile-first employment companion that helps blue-collar workers across India create profiles, discover jobs, build resumes, and improve employability using the simplest possible user experience.

## Run KaamSarthi

From this folder:

```powershell
.\start-kaamsarthi.cmd
```

Then open:

```text
http://localhost:4000
```

This starts:

- the Next.js web app on `http://localhost:4000`
- the private local speech service on `http://127.0.0.1:8765`
- Ollama for the private local AI assistant, when installed

The web app lives in `apps/web`. The generated Expo mobile app lives in `apps/mobile`, but the current styled KaamSarthi experience is in the Next web app.

## Local & Cloud Voice Typing

KaamSarthi uses Faster-Whisper with the multilingual Whisper Small model for local speech-to-text, with native browser speech services as fallbacks.

- **Languages**: English, Hindi, Tamil, Telugu, and Bengali.
- **Auto-proceed & Shortcuts**: When KaamSarthi starts, it opens a Language Setup screen and listens for a language sample. If a language is detected, a 3-second countdown begins before auto-selecting it. If the worker explicitly says the word **"Hindi"**, the system immediately switches to Hindi and proceeds.
- **Processing**: Local CPU only using `int8`.
- **Privacy & Fallbacks**: Works offline. If microphone permission is denied or the local speech service is unavailable, manual typing and browser voice typing remain fully functional.

## Spoken Guidance & Text-To-Speech (TTS)

After language selection, KaamSarthi can speak instructions in the worker's language.

- **Profile & Resume Setup**: New workers are asked simple questions one by one. Spoken answers are transcribed and must be confirmed.
- **Interactive Speech**: When questions are asked, the app reads the questions aloud. When user responses are submitted or the AI responds, the speech engine speaks the text.
- **TTS Toggle**: A speaker icon (🔊/🔇) allows workers to mute or unmute the voice assistant at any time.
- **Supported TTS Languages**: English and Hindi are fully supported with fallback detection for device-installed voices.

## Cloud & Local AI Assistant

KaamSarthi supports dual modes for the AI Assistant:

1. **Cloud AI Assistant (Gemini)**:
   - Powered by Gemini 2.5 Flash via Google AI Studio.
   - Activated by adding `NEXT_PUBLIC_GEMINI_API_KEY=your_key` in `apps/web/.env.local`.
   - Streams responses token-by-token and automatically reads outputs in Hindi or English depending on selected language.
   - Strictly outputs response in the selected application language.
2. **Local AI Assistant (Ollama)**:
   - Runs locally using the `Gemma 3 1B` model.
   - Automatically falls back to rule-based safety responses (for salary, fraud, Aadhaar, OTP questions) if Ollama/Gemini are offline.

## Desktop layout & Sidebars

For desktop users, the app UI displays horizontal developer credit headers on both sides:
- **Developer - KSHITIZ SINGH, email - kshitizsingh422@gmail.com**

## Installed Storage

The downloaded models use approximately:

```text
Whisper Small model: 464 MB
Python speech environment: 302 MB
Gemma 3 1B model: 815 MB
Models and speech environment: about 1.6 GB
```

Whisper is stored under `speech-service`. Gemma is stored in the Ollama model folder. The Ollama Windows application also installs its own local runtime libraries.

## Install On Another Windows Computer

Python 3.12 is required. Then run:

```powershell
cd speech-service
.\install-speech.cmd
```

The installer creates an isolated `.venv` and downloads the model on first use.

## Start Services Separately

Speech service:

```powershell
cd speech-service
.\start-speech.cmd
```

Web app:

```powershell
.\start-web.cmd
```

## Product Rules

See `AGENTS.md` before making product or design changes. Keep the app voice-first, mobile-first, offline-friendly, and simple enough for workers using budget Android phones.
