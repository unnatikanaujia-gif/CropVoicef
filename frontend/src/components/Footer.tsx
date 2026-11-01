import React from 'react';
import { Sprout, ShieldAlert, ExternalLink, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-100 text-stone-600 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Important Farmer Advisory Warning Box */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-950">
              Important Agricultural Advisory & Safety Warning
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              CropVoice uses automated algorithmic matching from starter university/extension bulletins.
              A text or voice description alone <strong>cannot confirm a crop disease</strong>. Never apply pesticides, fungicides, or chemical treatments solely based on automated output. Always verify with your local <strong>Krishi Vigyan Kendra (KVK)</strong>, State Agricultural University (TNAU, UAS, KAU), or district agriculture extension officer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          {/* Col 1: About */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>CropVoice Agricultural Platform</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed max-w-md">
              A multilingual voice-interactive agricultural platform designed for Indian farmers. Providing verified mandi prices, weather forecasts, pest symptom diagnosis, and national farmer welfare scheme discovery in English, Hindi, Tamil, Telugu, Kannada, and Malayalam.
            </p>
          </div>

          {/* Col 2: Official Sources */}
          <div className="space-y-1.5">
            <p className="font-semibold text-stone-900 text-xs uppercase tracking-wider">
              Official Data Sources
            </p>
            <ul className="space-y-1 text-xs text-stone-500">
              <li>
                <a
                  href="https://data.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <span>Agmarknet (data.gov.in)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://open-meteo.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <span>Open-Meteo Weather</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.myscheme.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <span>myScheme Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://icar.org.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <span>ICAR & Agricultural Universities</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Languages Supported */}
          <div className="space-y-1.5">
            <p className="font-semibold text-stone-900 text-xs uppercase tracking-wider">
              Languages Supported
            </p>
            <p className="text-xs text-stone-500">
              English, हिन्दी (Hindi), தமிழ் (Tamil), తెలుగు (Telugu), ಕನ್ನಡ (Kannada), മലയാളം (Malayalam).
            </p>
            <p className="text-[11px] text-stone-400 pt-1">
              Speech recognition powered by Web Speech API.
            </p>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} CropVoice — Engineered for Indian Farmers.</p>
          <p className="inline-flex items-center gap-1">
            <span>Built with care for sustainable agriculture</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
