import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sprout,
  HelpCircle,
  ExternalLink,
  Volume2,
  AlertTriangle,
  Send,
  RefreshCw,
  Search,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import { api } from '../services/api';
import { ConsultancyResponse, DiseaseRecord } from '../types/api';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { AudioPlayerPill } from '../components/AudioPlayerPill';

const CROPS_LIST = [
  'rice', 'wheat', 'maize', 'cotton', 'chilli', 'turmeric',
  'coconut', 'banana', 'sugarcane', 'groundnut', 'tomato',
  'onion', 'potato', 'mango', 'ginger', 'arecanut',
  'black pepper', 'millet', 'coffee', 'tea', 'grapes', 'pulses'
];

const SYMPTOM_TAGS = [
  { id: 'yellowing', label: 'Yellowing / पीला / மஞ்சள் / పసుపు' },
  { id: 'leaf spots', label: 'Leaf Spots / धब्बे / புள்ளிகள் / మచ్చలు' },
  { id: 'wilting', label: 'Wilting / मुरझाना / வாடுதல் / వాడిపోవు' },
  { id: 'curling', label: 'Curling / मुड़ना / சுருளுதல் / ముడుచు' },
  { id: 'rot', label: 'Rot / सड़न / அழுகல் / కుళ్ళు' },
  { id: 'powdery growth', label: 'Powdery Growth / पाउडर / வெள்ளை பொடி' },
  { id: 'drying', label: 'Drying / सूखना / காய்ந்து / ఎండిపో' },
];

export const ConsultancyPage: React.FC = () => {
  const { language, t, languages } = useLanguage();
  const { speakText } = useVoice();

  const [crop, setCrop] = useState<string>('rice');
  const [question, setQuestion] = useState<string>('My rice leaves are turning yellow with brown spots');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['yellowing']);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ConsultancyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (symId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symId) ? prev.filter((s) => s !== symId) : [...prev, symId]
    );
  };

  const handleConsult = async (customQuestion?: string) => {
    const q = (customQuestion || question).trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.postConsultancy(
        q,
        crop ? crop : null,
        language
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Consultancy request failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleConsult();
  }, [language]);

  const spokenAdvice = result?.possible_matches?.length
    ? `${result.message}. Top match: ${result.possible_matches[0].name}. ${result.possible_matches[0].prevention || ''}`
    : result?.message || '';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-600" />
            <span>{t.cropDoctor}</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Multilingual symptom matching and non-chemical pest prevention guidance.
          </p>
        </div>

        {result && spokenAdvice && (
          <AudioPlayerPill
            id="consultancy-advice"
            text={spokenAdvice}
            lang={language}
          />
        )}
      </div>

      {/* Query Form & Input Box */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Crop Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Affected Crop
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
            >
              <option value="">Auto-detect from text</option>
              {CROPS_LIST.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Symptom Chips */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Observed Symptoms (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_TAGS.map((tag) => {
                const active = selectedSymptoms.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      toggleSymptom(tag.id);
                      setQuestion((prev) =>
                        prev.includes(tag.id) ? prev : `${prev} ${tag.id}`
                      );
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                      active
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-medium'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Text Area + Voice Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            Describe symptoms in your words or voice
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. My tomato plants have yellow leaves with brown spots..."
              className="w-full p-4 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none shadow-inner"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <VoiceMicButton
                size="sm"
                onFinalTranscript={(text) => {
                  setQuestion(text);
                  handleConsult(text);
                }}
                showLabel={false}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleConsult()}
            disabled={loading || !question.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Consulting Records...' : 'Diagnose Symptoms'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Consultancy Request Failed</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Main Status & Message Banner */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900">Diagnosis Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  result.status === 'ok'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {result.status}
                </span>
                {result.crop && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs">
                    Crop: <strong>{result.crop}</strong>
                  </span>
                )}
                {result.confidence && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-xs">
                    Confidence: <strong>{result.confidence}</strong>
                  </span>
                )}
              </div>

              <div className="text-xs text-stone-500">
                Language: {languages[result.language]?.nativeName || result.language}
              </div>
            </div>

            <p className="text-sm text-stone-800 leading-relaxed font-medium">
              {result.message}
            </p>

            {/* Symptoms Detected */}
            {result.symptoms_detected && result.symptoms_detected.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-stone-600">Extracted Symptoms:</span>
                <div className="flex flex-wrap gap-1">
                  {result.symptoms_detected.map((sym, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900">
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Questions */}
            {result.follow_up_questions && result.follow_up_questions.length > 0 && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <p className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clarification Questions to Refine Diagnosis:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.follow_up_questions.map((fq, fIdx) => (
                    <button
                      key={fIdx}
                      type="button"
                      onClick={() => {
                        setQuestion(`${question}. ${fq}`);
                        handleConsult(`${question}. ${fq}`);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-emerald-500 text-stone-800 transition-colors"
                    >
                      {fq}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Note */}
            {result.safety_note && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{result.safety_note}</span>
              </div>
            )}
          </div>

          {/* Matched Disease Cards */}
          {result.possible_matches && result.possible_matches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-stone-900">
                Matched Disease Records ({result.possible_matches.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.possible_matches.map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-emerald-950">{item.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.verification_status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.verification_status || 'unverified'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        <strong className="text-stone-800">Symptoms:</strong> {item.symptoms}
                      </p>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        <strong className="text-stone-800">Management & Prevention:</strong> {item.prevention}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span>Source: {item.source || 'University Extension'}</span>
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-medium underline"
                        >
                          <span>Official Record</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
