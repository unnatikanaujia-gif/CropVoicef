import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Volume2,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import { api } from '../services/api';
import { MandiPricesResponse, MandiRecord } from '../types/api';
import { AudioPlayerPill } from '../components/AudioPlayerPill';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala', // Maps to Keralam in backend
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const COMMON_CROPS = [
  'rice',
  'wheat',
  'maize',
  'cotton',
  'chilli',
  'turmeric',
  'coconut',
  'banana',
  'sugarcane',
  'groundnut',
  'tomato',
  'onion',
  'potato',
  'mango',
  'ginger',
  'black pepper',
  'millet',
  'coffee',
  'tea',
  'grapes',
  'pulses',
];

export const MandiPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { speakText } = useVoice();

  const [crop, setCrop] = useState<string>('rice');
  const [state, setState] = useState<string>('Tamil Nadu');
  const [district, setDistrict] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<MandiPricesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    if (!crop.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await api.getMarketPrices(
        crop.trim(),
        state.trim() ? state.trim() : null,
        district.trim() ? district.trim() : null,
        1000
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch mandi prices');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  // Compute farmer-friendly spoken summary based on real returned records
  const generateSpokenSummary = (records: MandiRecord[], cropName: string, stateName: string): string => {
    if (!records || records.length === 0) {
      return `No market price records found for ${cropName} in ${stateName || 'the requested state'}.`;
    }

    const prices = records
      .map((r) => parseFloat(String(r.modal_price || r.min_price || 0)))
      .filter((p) => !isNaN(p) && p > 0);

    if (prices.length === 0) {
      return `Found ${records.length} market entries for ${cropName} in ${stateName || 'the state'}.`;
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    return `Mandi price report for ${cropName} across ${stateName || 'the state'}. Checked ${records.length} market records. Lowest rate is ₹${min} per quintal. Highest rate is ₹${max} per quintal. Average modal rate is ₹${avg} per quintal.`;
  };

  const spokenSummary = result?.records?.length
    ? generateSpokenSummary(result.records, crop, result.state || state)
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <span>{t.mandiPrices}</span>
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Direct Agmarknet mandi commodity rates via the data.gov.in official resource.
            </p>
          </div>

          {result?.records && result.records.length > 0 && spokenSummary && (
            <button
              type="button"
              onClick={() => speakText(spokenSummary, 'mandi-summary', language)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen to Mandi Audio Summary</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Crop Selector / Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Crop / Commodity
            </label>
            <div className="relative">
              <input
                type="text"
                list="crop-options"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. rice, tomato, onion"
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
              />
              <datalist id="crop-options">
                {COMMON_CROPS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* State Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              State (All Indian States)
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All States</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s} {s === 'Kerala' ? '(Keralam)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Optional District Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                District (Optional)
              </label>
              <span
                className="text-[10px] text-stone-400 hover:text-stone-600 cursor-help"
                title="Results cover the whole state. For Tamil Nadu districts, the state is inferred automatically."
              >
                ⓘ State-wide
              </span>
            </div>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Erode, Madurai"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Search Action */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchPrices}
              disabled={loading || !crop.trim()}
              className="w-full h-[42px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{loading ? 'Searching...' : 'Search Mandis'}</span>
            </button>
          </div>
        </div>

        {/* State-wide Result Policy Explainer */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>State-Wide Mandi Policy:</strong> Mandi queries return all matching markets across the selected state so you can compare prices between districts. The optional district input is accepted for compatibility, but state-wide results are preserved.
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Mandi Service Error</p>
            <p className="text-xs text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Configuration Required Banner */}
      {result?.status === 'configuration_required' && (
        <div className="p-6 bg-amber-50/80 border border-amber-300 rounded-2xl text-amber-900 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-base text-amber-950">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>Mandi Live Data Integration — Setup Required</span>
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            {result.message}
          </p>
          <div className="bg-white/80 p-4 rounded-xl border border-amber-200 text-xs font-mono space-y-1 text-stone-800">
            <p className="font-bold text-amber-900">How to activate live mandi rates in CropVoice:</p>
            <p>1. Open <code>backend/.env</code> in your project.</p>
            <p>2. Set your free API key from <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">data.gov.in</a>:</p>
            <p className="text-emerald-800 font-semibold">DATA_GOV_IN_API_KEY=your_registered_api_key</p>
            <p>3. Restart the FastAPI backend.</p>
          </div>
          <p className="text-xs text-stone-600">
            CropVoice is designed with data integrity: <strong>no synthetic or fake prices</strong> are fabricated when the official API key is absent.
          </p>
        </div>
      )}

      {/* Live Data Results Table */}
      {result?.status === 'ok' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-4">
          {/* Summary Metadata Header */}
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-stone-800">
                Official Agmarknet Records: {result.count} markets found
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                Crop: {result.crop}
              </span>
              {result.state && (
                <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 font-medium">
                  State: {result.state}
                </span>
              )}
            </div>

            <div className="text-stone-500 text-[11px]">
              Source: {result.source || 'data.gov.in'} • {result.updated_at ? new Date(result.updated_at).toLocaleDateString() : 'Live'}
            </div>
          </div>

          {/* Results Table */}
          {result.records && result.records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-100 text-stone-700 uppercase tracking-wider text-[11px] border-b border-stone-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Market</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">Commodity</th>
                    <th className="px-4 py-3">Variety</th>
                    <th className="px-4 py-3 text-right">Min Price (₹)</th>
                    <th className="px-4 py-3 text-right">Max Price (₹)</th>
                    <th className="px-4 py-3 text-right font-bold">Modal Price (₹)</th>
                    <th className="px-4 py-3">Arrival Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {result.records.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-emerald-950 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{rec.market || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{rec.district || '-'}</td>
                      <td className="px-4 py-3 capitalize">{rec.commodity || crop}</td>
                      <td className="px-4 py-3 text-stone-600">{rec.variety || '-'}</td>
                      <td className="px-4 py-3 text-right text-stone-600 font-mono">
                        {rec.min_price ? `₹${rec.min_price}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-stone-600 font-mono">
                        {rec.max_price ? `₹${rec.max_price}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700 font-mono text-sm">
                        {rec.modal_price ? `₹${rec.modal_price}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                        {rec.arrival_date ? (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>{rec.arrival_date}</span>
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-2">
              <p className="text-base font-semibold text-stone-800">No mandi records found</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                No arrival records were reported for <strong>{crop}</strong> in {state || 'the selected state'} on data.gov.in today. Try searching for a different crop or state.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
