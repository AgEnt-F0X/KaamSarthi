import os
import tempfile
import threading
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio
from faster_whisper.vad import VadOptions


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

MODEL_NAME = os.getenv("KAAMSARTHI_WHISPER_MODEL", "small")
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
}
LANGUAGE_PROMPTS = {
    "en": (
        "KaamSarthi employment profile. Jobs, driver, delivery, construction, warehouse, "
        "security guard, factory worker, electrician, plumber, housekeeping, salary, resume, "
        "skills, experience, interview, Delhi, Noida, Gurugram, Faridabad."
    ),
    "hi": (
        "कामसारथी रोजगार प्रोफ़ाइल। नौकरी, ड्राइवर, डिलीवरी, निर्माण, गोदाम, सुरक्षा गार्ड, "
        "फैक्ट्री कर्मचारी, इलेक्ट्रीशियन, प्लंबर, सफाई कर्मचारी, वेतन, रिज्यूमे, कौशल, अनुभव, "
        "इंटरव्यू, दिल्ली, नोएडा, गुरुग्राम, फरीदाबाद।"
    ),
    "ta": (
        "காம்சாரதி வேலைவாய்ப்பு சுயவிவரம். வேலை, ஓட்டுநர், டெலிவரி, கட்டுமானம், கிடங்கு, "
        "பாதுகாப்பு காவலர், தொழிற்சாலை, மின்சார உதவியாளர், பிளம்பர், தூய்மை பணியாளர், "
        "சம்பளம், சுயவிவரம், திறன்கள், அனுபவம், நேர்காணல்."
    ),
    "te": (
        "కామ్‌సారథి ఉద్యోగ ప్రొఫైల్. ఉద్యోగం, డ్రైవర్, డెలివరీ, నిర్మాణం, గిడ్డంగి, "
        "భద్రతా గార్డు, ఫ్యాక్టరీ కార్మికుడు, ఎలక్ట్రీషియన్, ప్లంబర్, హౌస్‌కీపింగ్, "
        "జీతం, రెజ్యూమే, నైపుణ్యాలు, అనుభవం, ఇంటర్వ్యూ."
    ),
    "bn": (
        "কামসারথি কর্মসংস্থান প্রোফাইল। চাকরি, চালক, ডেলিভারি, নির্মাণ, গুদাম, "
        "নিরাপত্তারক্ষী, কারখানা কর্মী, ইলেকট্রিশিয়ান, প্লাম্বার, পরিচ্ছন্নতা কর্মী, "
        "বেতন, জীবনবৃত্তান্ত, দক্ষতা, অভিজ্ঞতা, সাক্ষাৎকার।"
    ),
}
MAX_AUDIO_BYTES = 15 * 1024 * 1024

app = FastAPI(title="KaamSarthi Local Speech", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4000",
        "http://127.0.0.1:4000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

_model: WhisperModel | None = None
_model_lock = threading.Lock()


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = WhisperModel(
                    MODEL_NAME,
                    device="cpu",
                    compute_type="int8",
                    cpu_threads=4,
                    num_workers=1,
                    download_root=str(MODEL_DIR),
                )
    return _model


@app.on_event("startup")
def load_model_in_background() -> None:
    threading.Thread(target=get_model, name="whisper-model-loader", daemon=True).start()


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "modelLoaded": _model is not None,
        "supportedLanguages": SUPPORTED_LANGUAGES,
    }


@app.post("/warmup")
def warmup() -> dict[str, str]:
    get_model()
    return {"status": "ready", "model": MODEL_NAME}


@app.post("/transcribe")
async def transcribe(
    audio: Annotated[UploadFile, File()],
    language: Annotated[str | None, Form()] = None,
    detect_language: Annotated[bool, Form()] = False,
    is_final: Annotated[bool, Form()] = False,
) -> dict[str, object]:
    if language and language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail="Unsupported language")

    suffix = Path(audio.filename or "speech.webm").suffix or ".webm"
    audio_bytes = await audio.read(MAX_AUDIO_BYTES + 1)
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="No audio received")
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Recording is too large")

    temp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name

        model = get_model()
        audio_data = decode_audio(temp_path, sampling_rate=16000)
        detected_probability = 1.0

        if detect_language:
            _, _, language_probabilities = model.detect_language(
                audio=audio_data,
                vad_filter=True,
                vad_parameters=VadOptions(min_silence_duration_ms=350),
                language_detection_segments=3,
                language_detection_threshold=0.0,
            )
            supported_probabilities = [
                (code, probability)
                for code, probability in language_probabilities
                if code in SUPPORTED_LANGUAGES
            ]
            if not supported_probabilities:
                raise HTTPException(status_code=422, detail="Could not detect a supported language")
            selected_language, detected_probability = max(
                supported_probabilities, key=lambda item: item[1]
            )
        else:
            selected_language = language

        segments, info = model.transcribe(
            audio_data,
            language=selected_language,
            beam_size=3 if is_final else 1,
            best_of=3 if is_final else 1,
            patience=1.1 if is_final else 1,
            temperature=0,
            condition_on_previous_text=True,
            initial_prompt=LANGUAGE_PROMPTS.get(selected_language or ""),
            vad_filter=True,
            vad_parameters={
                "min_silence_duration_ms": 300,
                "speech_pad_ms": 250,
            },
            no_speech_threshold=0.55,
            log_prob_threshold=-1.0,
        )
        text = " ".join(segment.text.strip() for segment in segments).strip()
        detected_code = selected_language or info.language
        supported = detected_code in SUPPORTED_LANGUAGES

        return {
            "text": text,
            "language": detected_code,
            "languageName": SUPPORTED_LANGUAGES.get(detected_code, "Unsupported language"),
            "languageProbability": round(float(detected_probability), 3),
            "supported": supported,
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {error}") from error
    finally:
        if temp_path:
            try:
                os.remove(temp_path)
            except OSError:
                pass
