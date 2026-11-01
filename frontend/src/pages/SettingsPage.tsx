import React, { useState, useEffect } from 'react';
import {
  Settings,
  Languages,
  Volume2,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import { api } from '../services/api';
import { speechService } from '../services/speech';
import { LanguageCode, HealthResponse } from '../types/api';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, t, languages } = useLanguage();
  const {
    autoSpeak,
    setAutoSpeak,
    speechRate,
    setSpeechRate,
    selectedVoice,
    setSelectedVoice,
    speakText,
    isRecognitionSupported,
    isSynthesisSupported,
  } = useVoice();

  const [apiUrl, setApiUrl] = useState<string>(api.getBaseUrl());
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; data?: HealthResponse } | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setVoices(speechService.getAvailableVoices());
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      // Temporarily set to test
      api.setBaseUrl(apiUrl.trim());
      const health = await api.getHealth();
      setTestResult({
        ok: true,
        message: `Successfully connected to CropVoice Backend at ${api.getBaseUrl()}`,
        data: health,
      });
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || 'Connection failed',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleResetApiUrl = () => {
    api.setBaseUrl(null);
    setApiUrl(api.getBaseUrl());
    setTestResult(null);
  };

  const handleTestSpeech = () => {
    const testPhrases: Record<LanguageCode, string> = {
      en: 'Welcome to CropVoice. Your agricultural voice assistant is working properly.',
      hi: 'क्रॉपवॉइस में आपका स्वागत है। आपका कृषि वॉइस सहायक ठीक से काम कर रहा है।',
      ta: 'கிராப்வாய்ஸுக்கு வரவேற்கிறோம். உங்கள் குரல் உதவியாளர் சரியாக இயங்குகிறது.',
      te: 'క్రాప్‌వాయిస్‌కు స్వాగతం. మీ వాయిస్ అసిస్టెంట్ సరిగ్గా పనిచేస్తోంది.',
      kn: 'ಕ್ರಾಪ್‌ವಾಯ್ಸ್‌ಗೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಧ್ವನಿ ಸಹಾಯಕ ಸರಿಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.',
      ml: 'ക്രോപ്പ്വോയ്സിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ വോയ്സ് അസിസ്റ്റന്റ് പ്രവർത്തിക്കുന്നുണ്ട്.',
    };
    speakText(testPhrases[language] || testPhrases.en, 'test-voice', language);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-1">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-stone-700" />
          <span>{t.settings}</span>
        </h1>
        <p className="text-sm text-stone-500">
          Configure preferred language, speech synthesis audio parameters, and backend connectivity.
        </p>
      </div>

      {/* 1. Language Preferences */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-bold border-b border-stone-100 pb-3">
          <Languages className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base">Regional Language Selection</h2>
        </div>

        <p className="text-xs text-stone-600">
          Choose your native regional language. Both user interface prompts and voice speech synthesis will adapt to this selection.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(languages).map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code as LanguageCode)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 shadow-xs'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-900">{lang.nativeName}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <span className="text-xs text-stone-500">{lang.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Voice & Audio Output Settings */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-stone-900 font-bold border-b border-stone-100 pb-3">
          <Volume2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base">Voice & Speech Synthesis Audio</h2>
        </div>

        {/* Auto-readout switch */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-semibold text-stone-800">Automatic Audio Readout</p>
            <p className="text-xs text-stone-500">
              Automatically read assistant diagnosis and responses aloud when received.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Speech Rate Slider */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span>Speech Reading Speed</span>
            <span className="text-emerald-700 font-mono">{speechRate}x</span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.05"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>Slower (0.75x)</span>
            <span>Normal (1.0x)</span>
            <span>Faster (1.25x)</span>
          </div>
        </div>

        {/* Browser Voice Picker */}
        {voices.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-stone-100">
            <label className="text-xs font-semibold text-stone-700">
              Installed Browser Speech Synthesis Voice (Optional)
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Auto-select best voice for {languages[language].label}</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Test Speech Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleTestSpeech}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>Test Speech Output</span>
          </button>
        </div>
      </div>

      {/* 3. Backend API Connection */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-bold border-b border-stone-100 pb-3">
          <Server className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base">FastAPI Backend Connection</h2>
        </div>

        <p className="text-xs text-stone-600">
          The centralized API client communicates with your running CropVoice Python FastAPI server.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            Backend API Base URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="flex-1 px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection || !apiUrl.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
              <span>Test Connection</span>
            </button>
            <button
              type="button"
              onClick={handleResetApiUrl}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
              title="Reset to default URL"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Connection Test Result */}
        {testResult && (
          <div
            className={`p-4 rounded-xl text-xs space-y-1 ${
              testResult.ok
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{testResult.message}</span>
            </div>
            {testResult.data && (
              <p className="text-emerald-700">
                Health check confirmed: {testResult.data.disease_records} crop disease records and {testResult.data.government_scheme_records} scheme records loaded.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 4. Mobile & Browser Voice Permissions Explainer */}
      <div className="bg-stone-100 rounded-2xl p-6 border border-stone-200 space-y-3 text-xs text-stone-700">
        <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>Mobile Device & Secure Context (HTTPS) Guidance</span>
        </div>
        <p className="leading-relaxed">
          Modern web browsers (Chrome, Edge, Safari) restrict <strong>Microphone Access</strong> strictly to <strong>Secure Contexts</strong>:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Localhost:</strong> Accessing <code>http://localhost:5173</code> or <code>http://127.0.0.1:5173</code> is treated as a secure context and grants microphone permission automatically.</li>
          <li><strong>Local Network / Phone:</strong> If you open <code>http://192.168.x.x:5173</code> on a phone over standard HTTP, modern browsers disable the Web Speech API and microphone permissions because the connection is unencrypted.</li>
          <li><strong>How to use voice on phone:</strong> Use local port forwarding via USB, run Vite with HTTPS (<code>--https</code>), or deploy with an SSL certificate. The typed text fallback remains 100% operational on any device.</li>
        </ul>
      </div>
    </div>
  );
};
