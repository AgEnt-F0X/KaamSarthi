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

## Local Voice Typing

KaamSarthi uses Faster-Whisper with the multilingual Whisper Small model.

- Languages: English, Hindi, Tamil, Telugu, and Bengali
- Processing: local CPU only, using `int8`
- Recording limit: 30 seconds
- Live updates: approximately every 6 seconds
- Privacy: temporary audio is deleted after every transcription request
- Offline use: works without internet after the initial model download

Whenever KaamSarthi opens, it immediately requests microphone access and starts listening for a short language sample. Browsers require the worker to press **Allow** the first time microphone permission is requested. After permission is granted, the detected language is selected automatically. A manual language choice is always available.

Moving sound bars show when the microphone is receiving the worker's voice. Weak or silent interim guesses are not used to select the language; selection happens only after the completed recording contains transcribed speech.

If microphone permission is denied or the speech service is unavailable, all normal typing and selection controls continue to work.

## Spoken Guidance

After language selection, KaamSarthi can speak instructions in the worker's language.

- On first use, the worker can tap or say yes/no to spoken guidance.
- New workers are asked one simple profile and resume question at a time.
- Every spoken answer is read back and must be confirmed.
- Nothing is saved until the worker checks the final summary and presses the large Continue button.
- Casual commands include repeat, go back, skip, stop, resume, jobs, applications, assistant, and home.
- Asking for jobs opens the Jobs tab, prioritizes matching categories, and reads suitable jobs aloud.
- Returning workers can enable or disable automatic spoken welcome using the toggle.
- The floating `Talk to KaamSarthi` button reopens guidance from any screen.

Speech playback uses the device's installed browser/Windows voices, so it does not require another downloaded AI model. Profile, resume, preferences, and guide progress remain local.

## Local AI Assistant

KaamSarthi uses the free, open-source `Gemma 3 1B` model through Ollama.

- Runs locally; prompts and answers are not sent to a cloud AI service
- Responds in English, Hindi, Tamil, Telugu, or Bengali
- Streams words onto the screen while the answer is generated
- Uses short employment-counselor instructions instead of acting like a general chatbot
- Caches up to 30 repeated answers in `localStorage`
- Uses vetted rule-based answers for salary, fraud, fees, Aadhaar, and OTP questions
- Automatically falls back to rules when Ollama is unavailable

The Assistant screen has a `Local AI` / `Simple` switch. The choice is remembered on the device.

To prepare AI on another Windows computer, install Ollama and run:

```powershell
.\install-ai.cmd
```

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
.\speech-service\start-speech.cmd
```

Web app:

```powershell
.\start-web.cmd
```

## Product Rules

See `AGENTS.md` before making product or design changes. Keep the app voice-first, mobile-first, offline-friendly, and simple enough for workers using budget Android phones.
