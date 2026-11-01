# CropVoice — Farmer Voice Assistant & Agricultural Platform

CropVoice is a full-stack, responsive web application designed for Indian farmers. It enables farmers to speak or type in their regional language to receive verified agricultural intelligence, including:
1. **Live Mandi Prices** from Agmarknet via `data.gov.in`.
2. **7-Day Weather Forecast & Spray Advisories** via Open-Meteo.
3. **Multilingual Crop Consultancy & Pest Diagnosis** across 22 major Indian crops.
4. **National Government Scheme Discovery** (PM-KISAN, PMFBY, KCC, e-NAM, Soil Health Card, etc.).
5. **Browser-Native Voice Interaction** with speech recognition and speech synthesis (Web Speech API) supporting Hindi, Tamil, Telugu, Kannada, Malayalam, and Indian English.

---

## 1. Project Architecture & Directory Layout

```text
CropVoice/
├── backend/                       # Supplied FastAPI backend (100% preserved)
│   ├── app/
│   │   └── main.py                # FastAPI routes, mandi service, weather & consultancy logic
│   ├── data/
│   │   ├── government_schemes.json # Starter catalogue of national welfare schemes
│   │   ├── pests_diseases.json     # Starter pest & disease knowledge base
│   │   └── sources.json            # University and extension publication sources
│   ├── tests/
│   │   └── test_multilingual_consultancy.py # Pytest multilingual validation suite
│   ├── .env.example               # Safe backend configuration template
│   ├── .gitignore
│   └── requirements.txt           # Python dependencies
│
├── frontend/                      # Responsive React + TypeScript website
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── AudioPlayerPill.tsx    # Spoken audio playback and stop controls
│   │   │   ├── BackendStatusBadge.tsx # Live ping status indicator for FastAPI
│   │   │   ├── Footer.tsx             # Agricultural disclaimers and source credits
│   │   │   ├── Navbar.tsx             # Responsive header with language switcher
│   │   │   └── VoiceMicButton.tsx     # Large animated microphone button
│   │   ├── context/
│   │   │   ├── LanguageContext.tsx    # Translations and language state (en, hi, ta, te, kn, ml)
│   │   │   └── VoiceContext.tsx       # Global voice recognition & synthesis state
│   │   ├── pages/
│   │   │   ├── HomePage.tsx           # Hero greeting, quick prompts, service cards
│   │   │   ├── ChatPage.tsx           # Conversational voice assistant interface
│   │   │   ├── MandiPage.tsx          # Agmarknet mandi price browser with spoken summaries
│   │   │   ├── WeatherPage.tsx        # 7-day forecast with spray & irrigation guidance
│   │   │   ├── ConsultancyPage.tsx    # Crop doctor symptom diagnosis & KVK safety advisory
│   │   │   ├── SchemesPage.tsx        # Government welfare schemes discovery catalogue
│   │   │   └── SettingsPage.tsx       # Regional language, voice rate, and API URL settings
│   │   ├── services/
│   │   │   ├── api.ts                 # Centralized API client with timeouts & validation
│   │   │   └── speech.ts              # Web Speech API wrapper (recognition + synthesis)
│   │   ├── types/
│   │   │   ├── api.ts                 # Strict TypeScript schemas mirroring FastAPI responses
│   │   │   └── voice.ts               # Voice state, error types, and language mappings
│   │   ├── App.tsx                    # React Router configuration
│   │   ├── index.css                  # Tailwind CSS styling and accessibility focus
│   │   └── main.tsx                   # React DOM entry point
│   ├── tests/
│   │   └── integration.test.mjs       # Frontend schema & integration test suite
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example                   # Safe frontend configuration template
│   └── .env                           # VITE_API_BASE_URL=http://127.0.0.1:8000
│
└── README.md                      # Complete setup, testing, and deployment manual
```

---

## 2. Prerequisites

- **Operating System:** Windows 10 / 11 (or Linux / macOS).
- **Python:** Python 3.10+ (tested with Python 3.14).
- **Node.js:** Node.js 18+ (tested with Node v24.20.0 and npm 11.19.0).
- **Web Browser:** Google Chrome, Microsoft Edge, or Chromium-based browsers for complete Web Speech API recognition and synthesis support.

---

## 3. Quick Start Guide (Windows PowerShell)

Run the backend in **Terminal 1** and the website frontend in **Terminal 2**.

### Terminal 1 — Backend (FastAPI)

1. Open PowerShell and navigate to the `backend` directory:
   ```powershell
   cd .\backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   *(If script execution is disabled on your system, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

3. Install required Python packages:
   ```powershell
   python -m pip install -r requirements.txt
   ```

4. *(Optional)* Configure live mandi prices by copying `.env.example`:
   ```powershell
   Copy-Item .env.example .env
   ```
   Open `.env` in a text editor to insert your free `DATA_GOV_IN_API_KEY` from [data.gov.in](https://data.gov.in). If left empty, the application will informatively explain that live data configuration is required without fabricating fake prices.

5. Start the FastAPI development server:
   ```powershell
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   The backend API will be live at `http://127.0.0.1:8000`. You can inspect the interactive documentation at `http://127.0.0.1:8000/docs`.

---

### Terminal 2 — Frontend (React + Vite)

1. Open a second PowerShell window and navigate to the `frontend` directory:
   ```powershell
   cd .\frontend
   ```

2. Install Node.js dependencies:
   ```powershell
   npm install
   ```

3. Configure the backend URL (already pre-configured in `.env`):
   ```powershell
   Copy-Item .env.example .env
   ```
   Verify that `VITE_API_BASE_URL=http://127.0.0.1:8000`.

4. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   The website will launch at `http://localhost:5173`. Open this URL in Google Chrome or Microsoft Edge.

5. To run the production build:
   ```powershell
   npm run build
   ```

---

## 4. Derived Backend Endpoint Inventory

All frontend components integrate directly with these exact endpoints exposed by the backend:

| HTTP Method | Path | Parameters / Request Body | Response Shape | Notes |
|:---|:---|:---|:---|:---|
| `GET` | `/` | None | `{"name", "status", "docs", "endpoints"}` | Root status and API sitemap |
| `GET` | `/health` | None | `{"status", "timestamp", "disease_records", "government_scheme_records"}` | Live health ping & record counts |
| `GET` | `/crops` | None | `{"count", "crops", "crop_aliases", "languages_supported", "note"}` | 22 supported crops and regional alias map |
| `GET` | `/weather` | Query: `district` (str, 2-100), `lang` (str, default 'en'), `day_offset` (int, 0-6) | `{"status", "district", "temperature_celsius", "humidity_percent", "wind_speed_kmh", "condition", "rain_probability_percent", "spray_recommendation", "irrigation_recommendation", "daily": [...]}` | Geocodes via Open-Meteo; returns spray and irrigation rules |
| `GET` | `/consultancy` | Query: `question` (str, 3-1000), `crop` (optional str), `lang` (str, default 'en') | `{"status", "crop", "language", "message", "symptoms_detected", "possible_matches", "confidence", "follow_up_questions", "safety_note"}` | Multilingual symptom query and disease matching |
| `POST` | `/consultancy` | JSON: `{"question": "...", "crop": "...", "lang": "..."}` | Same as `GET /consultancy` or scheme list if question matches scheme intent | Primary endpoint used by voice assistant |
| `GET` | `/schemes` | Query: `query` (optional str), `state` (optional str), `crop` (optional str), `category` (optional str), `lang` (str) | `{"status", "count", "schemes": [{"name", "summary", "category", "portal_url", "keywords"}], "source"}` | Official national welfare scheme resource catalogue |
| `GET` | `/market-prices` | Query: `crop` (str), `state` (optional str), `district` (optional str), `limit` (int, default 1000) | `{"status": "ok" / "configuration_required", "crop", "state", "records": [{"market", "district", "min_price", "max_price", "modal_price", "arrival_date"}], "count"}` | Preserves state-wide results, handles Kerala/Keralam mapping |

---

## 5. Frontend-to-Backend Integration Mapping

| Web Page / Feature | Component / Service | Target Endpoint | Functionality & Truthful Behavior |
|:---|:---|:---|:---|
| **Home Page Voice Ask** | `HomePage.tsx` -> `ChatPage.tsx` | `POST /consultancy` | Accepts voice or typed query; routes question to `/chat` and queries backend |
| **Backend Status Badge** | `BackendStatusBadge.tsx` | `GET /health` | Polls backend every 30 seconds; displays live green dot or offline warning |
| **Voice Chat Assistant** | `ChatPage.tsx` | `POST /consultancy` | Submits recognized speech, renders disease records or schemes, triggers TTS read-aloud |
| **Mandi Price Search** | `MandiPage.tsx` | `GET /market-prices` | Queries Agmarknet data; displays real records or setup instructions if key is absent |
| **Mandi Spoken Summary**| `MandiPage.tsx` | Browser SpeechSynthesis | Computes lowest, highest, and modal prices across returned markets and speaks them aloud |
| **Weather Advisory** | `WeatherPage.tsx` | `GET /weather` | Fetches 7-day temperature, rain probability, spray advisory, and irrigation rules |
| **Crop Doctor** | `ConsultancyPage.tsx` | `POST /consultancy` | Interactive symptom tag toggles, disease records with university source links & safety notice |
| **Government Schemes** | `SchemesPage.tsx` | `GET /schemes` | Filter by query and category; direct links to official portals (myScheme, PM-KISAN, etc.) |
| **Settings & Test Ping** | `SettingsPage.tsx` | `GET /health` | Allows testing custom backend URLs and selecting regional system speech voices |

---

## 6. Browser Voice Interaction & Mobile HTTPS Requirements

### Browser Compatibility
- **Google Chrome / Microsoft Edge (Desktop & Android):** Full speech recognition (`webkitSpeechRecognition`) and full speech synthesis (`speechSynthesis`) supported for Hindi (`hi-IN`), Tamil (`ta-IN`), Telugu (`te-IN`), Kannada (`kn-IN`), Malayalam (`ml-IN`), and English (`en-IN`).
- **Safari / iOS:** Speech synthesis is supported. Speech recognition on iOS Safari is subject to Apple WebKit speech limits.
- **Mozilla Firefox:** Speech synthesis is supported. Native Web Speech recognition is disabled by default in Firefox; CropVoice automatically displays a notification and enables typed text input.

### Secure Context (HTTPS) Rules for Mobile Phones
Modern browsers enforce a strict security policy: **Microphone access is permitted only in a Secure Context (HTTPS or localhost)**.
- If you access the website locally on your computer via `http://localhost:5173` or `http://127.0.0.1:5173`, the microphone functions without HTTPS.
- If you open `http://192.168.x.x:5173` on your smartphone connected to the same Wi-Fi network, mobile browsers **will block microphone permissions** because the connection is unencrypted HTTP.
- **To enable voice on mobile devices:**
  1. Use USB port forwarding via Chrome Remote Debugging (`chrome://inspect`) mapping `localhost:5173` directly to your phone.
  2. Or run Vite with HTTPS: install `@vitejs/plugin-basic-ssl` and run `npm run dev -- --https`.
  3. Or deploy to a staging host with SSL (e.g. Vercel, Netlify, Cloudflare).
- **Typed input is always available** on all devices regardless of microphone permissions.

---

## 7. Protected Backend Verification (SHA256 Hashes)

As required, all 8 original backend files remain 100% untouched and match their original hashes:

| File Path | SHA256 Hash | Status |
|:---|:---|:---|
| `backend/app/main.py` | `75BA066CB7A8B66B65379086DAE974B2D176CC8C04DC93492D5478F680BB7171` | **Unchanged (MATCH)** |
| `backend/data/government_schemes.json` | `F2D2EC41E8585D9E89E23CC4FA8983E7EED82CDF28F44ACAEB476C441A7B8ADD` | **Unchanged (MATCH)** |
| `backend/data/pests_diseases.json` | `4C931CEF298D1889DC67AD49A44A48CD127AD37E5D730ADA6F0C044C296CE714` | **Unchanged (MATCH)** |
| `backend/data/sources.json` | `FAB76E833EF3A0A3556A22971A9BE7532B904483E6BC242504A2AE99D6314D8D` | **Unchanged (MATCH)** |
| `backend/tests/test_multilingual_consultancy.py` | `F32B0A3742DE61C0E784232C823AE3A06A5BF2CE39BB81832AA45D5157F07806` | **Unchanged (MATCH)** |
| `backend/.env.example` | `DBDA7C5EE7E3E4DADF057A0E1FF700375E68B409790BB9FA10D4DFF43D0F0C44` | **Unchanged (MATCH)** |
| `backend/.gitignore` | `783D4DF5049F5224A8D71D8F0B1C85121047BEF036D05E4A04EB4C45C38AA859` | **Unchanged (MATCH)** |
| `backend/requirements.txt` | `77FD5D6A586F9F4FEC7DA453F6B4F8936D2CF4EC57D2A79F139887015E550D1D` | **Unchanged (MATCH)** |

---

## 8. Test Execution Results

### Backend Automated Pytest Suite
```powershell
$env:PYTHONPATH = "backend"; .\backend\.venv\Scripts\pytest.exe .\backend\tests -q
```
**Results:** `6 passed in 2.02s`
- `test_supported_languages_return_localized_fixed_text`: Passed (English, Hindi, Tamil, Telugu, Kannada, Malayalam).
- `test_unsupported_language_rejected_on_post_and_get`: Passed (422 validation error).
- `test_missing_crop_asks_for_clarification_in_requested_language`: Passed (`need_crop` status).
- `test_question_length_validation`: Passed (minimum 3, maximum 1000 characters).
- `test_existing_endpoints_remain_available`: Passed (`/`, `/health`, `/crops`).
- `test_regional_symptom_recognition`: Passed (20 regional multilingual symptom test cases).

### Frontend Automated Test Suite
```powershell
npm --prefix frontend test
```
**Results:** `4 passed, 0 failed in 263ms`
- Language codes and speech mapping completeness.
- Mandi endpoint parameter serialization & state-wide filtering preservation.
- Consultancy request body validation.
- Weather query parameter bounds (2-100 characters, day offset 0-6).

### Frontend Build & Type Check
```powershell
npm --prefix frontend run build
```
**Results:** `1601 modules transformed. Built cleanly in 27.15s with 0 errors.`

---

## 9. Troubleshooting

- **CORS Error in Browser Console:**
  Ensure `backend/.env` has `CORS_ORIGINS=*` (or `http://localhost:5173,http://127.0.0.1:5173`). By default, the backend allows all origins.
- **Mandi prices say "configuration_required":**
  Set `DATA_GOV_IN_API_KEY` in `backend/.env` with your free key from data.gov.in and restart FastAPI.
- **Backend Offline in Badge:**
  Verify that the FastAPI process is running on port 8000. Test with `curl http://127.0.0.1:8000/health` or click "Test Connection" on the Settings page.
- **Voice Mic Does Not Turn On:**
  Check whether your browser has granted microphone permissions. If accessing via a phone IP address on Wi-Fi, remember browsers disable the microphone on unencrypted HTTP.
