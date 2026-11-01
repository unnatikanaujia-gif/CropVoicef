import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Search,
  ExternalLink,
  ShieldAlert,
  Tag,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { SchemesResponse, SchemeRecord } from '../types/api';

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'financial support', label: 'Financial Support / Income' },
  { id: 'crop insurance', label: 'Crop Insurance' },
  { id: 'credit', label: 'Credit & Loans' },
  { id: 'market access', label: 'Market Access / Trade' },
  { id: 'soil health', label: 'Soil Health & Nutrients' },
  { id: 'irrigation', label: 'Irrigation & Water' },
  { id: 'solar energy', label: 'Solar & Clean Energy' },
  { id: 'discovery portal', label: 'Scheme Discovery Portal' },
];

export const SchemesPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [query, setQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [crop, setCrop] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<SchemesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.getSchemes(
        query ? query : undefined,
        state ? state : undefined,
        crop ? crop : undefined,
        selectedCategory ? selectedCategory : undefined,
        language
      );
      setData(resp);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch government schemes catalog');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [language, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Landmark className="w-6 h-6 text-purple-600" />
          <span>{t.schemes}</span>
        </h1>
        <p className="text-sm text-stone-500">
          Official national agricultural welfare schemes and verified government portals for Indian farmers.
        </p>
      </div>

      {/* Official Discovery Disclaimer Banner */}
      <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-purple-950 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
        <HelpCircle className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Official Discovery Catalogue Notice</p>
          <p className="text-purple-900 text-xs leading-relaxed">
            {data?.note ||
              'This is a starter catalogue of national schemes and official portals, not a live eligibility decision. State-specific availability, notified crops, deadlines, benefits and eligibility can change. Confirm details on the linked official portal or with the local agriculture department/KVK.'}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Query input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. insurance, subsidy, credit, kisan..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* State context */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              State Context
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Tamil Nadu, Punjab..."
              className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Action button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchSchemes}
              disabled={loading}
              className="w-full h-[42px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{loading ? 'Searching...' : 'Find Schemes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Schemes Grid */}
      {data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>Showing {data.count} official scheme resources</span>
            <span>Source: {data.source}</span>
          </div>

          {data.schemes && data.schemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.schemes.map((scheme, idx) => (
                <div
                  key={scheme.id || idx}
                  className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-stone-900 leading-snug">
                        {scheme.name}
                      </h3>
                      {scheme.category && (
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 capitalize">
                          {scheme.category}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {scheme.summary}
                    </p>

                    {/* Keywords */}
                    {scheme.keywords && scheme.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {scheme.keywords.map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-600"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">
                      Eligibility: {scheme.eligibility_status || 'not_checked'}
                    </span>
                    {scheme.portal_url && (
                      <a
                        href={scheme.portal_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs transition-colors"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-2">
              <p className="text-base font-semibold text-stone-800">No schemes matched your criteria</p>
              <p className="text-xs text-stone-500">
                Try clearing your search query or selecting "All Categories".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
