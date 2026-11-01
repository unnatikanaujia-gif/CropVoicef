import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  CloudSun,
  ShieldAlert,
  Landmark,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import { VoiceMicButton } from '../components/VoiceMicButton';

export const HomePage: React.FC = () => {
  const { language, t, languages } = useLanguage();
  const { isRecognitionSupported } = useVoice();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');

  const currentLang = languages[language];

  const handleAsk = (questionText?: string) => {
    const textToSubmit = (questionText || inputText).trim();
    if (!textToSubmit) return;
    navigate('/chat', { state: { initialQuestion: textToSubmit } });
  };

  const sampleQuestions: Record<string, string[]> = {
    en: [
      'My rice leaves are turning yellow with brown spots',
      'What are the symptoms of tomato leaf curl?',
      'Tell me about PM-Kisan scheme',
      'Banana plant leaves are wilting and drooping',
    ],
    hi: [
      'मेरे धान की पत्तियाँ पीली हो रही हैं और धब्बे हैं',
      'टमाटर की पत्तियाँ मुड़ रही हैं, क्या उपाय है?',
      'पीएम किसान सम्मान निधि योजना क्या है?',
      'कपास के पौधे सूख रहे हैं',
    ],
    ta: [
      'என் நெல் செடியின் இலைகள் மஞ்சளாக மாறுகின்றன',
      'தக்காளி இலைகள் சுருண்டுள்ளன, என்ன காரணம்?',
      'பிரதமர் பயிர் காப்பீட்டுத் திட்டம் பற்றி சொல்லுங்கள்',
      'வாழை செடி வாடுகிறது என்ன செய்வது?',
    ],
    te: [
      'నా వరి మొక్క ఆకులు పసుపు రంగులోకి మారుతున్నాయి',
      'టమాటా ఆకులు ముడుచుకుంటున్నాయి',
      'పీఎం కిసాన్ పథకం వివరాలు ఏమిటి?',
      'మిరప పంటలో మచ్చలు కనిపిస్తున్నాయి',
    ],
    kn: [
      'ನನ್ನ ಭತ್ತದ ಗಿಡದ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ',
      'ಟೊಮೇಟೊ ಎಲೆಗಳು ಸುರುಳಿಯಾಗುತ್ತಿವೆ',
      'ಪಿಎಂ ಕಿಸಾನ್ ಯೋಜನೆ ಬಗ್ಗೆ ತಿಳಿಸಿ',
      'ತೆಂಗಿನ ಮರದಲ್ಲಿ ರೋಗ ಲಕ್ಷಣಗಳಿವೆ',
    ],
    ml: [
      'എന്റെ നെല്ലിന്റെ ഇലകൾ മഞ്ഞനിറമാകുന്നു',
      'തക്കാളി ഇലകൾ ചുരുളുന്നു',
      'പിഎം കിസാൻ പദ്ധതിയെക്കുറിച്ച് പറയുക',
      'വാഴയിലകൾ വാടുന്നു',
    ],
  };

  const questionsForLang = sampleQuestions[language] || sampleQuestions.en;

  const quickServices = [
    {
      title: t.mandiPrices,
      desc: 'Check state-wide live commodity rates from Agmarknet across registered mandis.',
      icon: TrendingUp,
      to: '/mandi',
      color: 'from-amber-500 to-orange-600',
      badge: 'Live Data',
    },
    {
      title: t.weather,
      desc: 'District-wise 7-day temperature, rain probability, spray, and irrigation guidance.',
      icon: CloudSun,
      to: '/weather',
      color: 'from-sky-500 to-blue-600',
      badge: '7-Day Advisory',
    },
    {
      title: t.cropDoctor,
      desc: 'Identify pest and disease symptoms in 22 crops with non-chemical prevention advice.',
      icon: ShieldAlert,
      to: '/consultancy',
      color: 'from-emerald-600 to-green-700',
      badge: 'Multilingual',
    },
    {
      title: t.schemes,
      desc: 'Discover official portals and guidelines for PM-KISAN, PMFBY, KCC, and e-NAM.',
      icon: Landmark,
      to: '/schemes',
      color: 'from-purple-600 to-indigo-700',
      badge: 'Govt Portals',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-stone-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl">
        {/* Background decorative agricultural patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Voice-First Agriculture for Indian Farmers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t.appName} — {t.tagline}
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/90 max-w-2xl mx-auto font-light leading-relaxed">
            {t.farmerFriendlyBanner}
          </p>

          {/* Central Voice & Text Input Box */}
          <div className="max-w-2xl mx-auto pt-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl text-stone-900 border border-stone-200 space-y-4">
              {/* Mic Icon Center */}
              <div className="flex flex-col items-center justify-center py-2">
                <VoiceMicButton
                  size="hero"
                  onFinalTranscript={(text) => handleAsk(text)}
                  showLabel={true}
                />
              </div>

              {/* Text Input Fallback */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                  placeholder={t.askPlaceholder}
                  className="w-full pl-4 pr-12 py-3.5 text-sm sm:text-base bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => handleAsk()}
                  disabled={!inputText.trim()}
                  className="absolute right-2 p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-colors"
                  aria-label="Send Question"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Speech support alert if disabled */}
              {!isRecognitionSupported && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-left">
                  Note: Web Speech recognition is not available in your current browser. You can type your question above or open CropVoice in Google Chrome / Microsoft Edge.
                </p>
              )}
            </div>

            {/* Clickable Quick Prompts */}
            <div className="space-y-2 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200/80 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t.tryAsking} ({currentLang.nativeName})</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {questionsForLang.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAsk(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-emerald-800/60 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/40 transition-colors text-left"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              {t.quickServices}
            </h2>
            <p className="text-sm text-stone-500">
              Reliable agricultural tools powered by the CropVoice FastAPI backend.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickServices.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(service.to)}
                className="group relative bg-white rounded-2xl p-6 border border-stone-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                      {service.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 gap-1">
                  <span>Open Service</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Real Capabilities & Truthful Boundaries Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-100 rounded-3xl p-6 sm:p-8 border border-stone-200 space-y-6">
          <div className="max-w-3xl space-y-2">
            <h3 className="text-xl font-bold text-stone-900">
              Platform Integrity & Genuine Backend Capabilities
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              CropVoice strictly presents verified data provided by the connected FastAPI backend without fabricating agricultural information or synthetic prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Verified Features in CropVoice</span>
              </div>
              <ul className="text-xs text-stone-600 space-y-2 list-disc pl-5">
                <li><strong>Multilingual Crop Doctor:</strong> 22 major Indian crops recognized across Hindi, Tamil, Telugu, Kannada, Malayalam, and English.</li>
                <li><strong>Regional Symptom Extraction:</strong> Understands terms like yellowing (పీలా/मஞ்சள்), leaf spots, wilting, curling, drying.</li>
                <li><strong>Weather & Spray Recommendations:</strong> 7-day forecast via Open-Meteo with specific spray suitability and irrigation cautions.</li>
                <li><strong>Government Schemes:</strong> Starter national welfare catalogue for PM-KISAN, PMFBY, KCC, e-NAM, and myScheme.</li>
                <li><strong>State-Wide Mandi Prices:</strong> Integrated with data.gov.in Agmarknet resource, preserving full state results.</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Truthful Boundaries & Farmer Safety</span>
              </div>
              <ul className="text-xs text-stone-600 space-y-2 list-disc pl-5">
                <li><strong>No Fabricated Prices:</strong> When <code>DATA_GOV_IN_API_KEY</code> is not configured, the app clearly notifies you to set the key rather than displaying fake prices.</li>
                <li><strong>Official Portal Verification:</strong> Government scheme entries provide direct official government links; they are not a live eligibility guarantee.</li>
                <li><strong>Expert KVK Consultation:</strong> Automated diagnoses are preliminary matching suggestions. Never purchase or apply pesticides without KVK or agricultural officer verification.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
