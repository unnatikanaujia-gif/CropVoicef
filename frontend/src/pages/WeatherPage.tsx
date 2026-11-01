import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Search,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import { api } from '../services/api';
import { WeatherResponse } from '../types/api';
import { AudioPlayerPill } from '../components/AudioPlayerPill';

const POPULAR_DISTRICTS = [
  'Erode',
  'Coimbatore',
  'Thanjavur',
  'Nashik',
  'Pune',
  'Guntur',
  'Warangal',
  'Mandya',
  'Ludhiana',
  'Karnal',
  'Varanasi',
];

export const WeatherPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { speakText } = useVoice();

  const [district, setDistrict] = useState<string>('Erode');
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (targetDistrict?: string, offset: number = dayOffset) => {
    const loc = (targetDistrict || district).trim();
    if (!loc) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.getWeather(loc, language, offset);
      if (data.status === 'unresolved_location') {
        setError(data.message || 'Location could not be resolved. Please try a nearby town or district name.');
        setWeatherData(null);
      } else {
        setWeatherData(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather forecast');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Erode', 0);
  }, [language]);

  const handleSelectDay = (offset: number) => {
    setDayOffset(offset);
    fetchWeather(district, offset);
  };

  const weatherSpokenSummary = weatherData
    ? `Weather advisory for ${weatherData.district || district}, ${weatherData.state || ''}. Current temperature is ${weatherData.temperature_celsius}°C with ${weatherData.condition}. Rain probability is ${weatherData.rain_probability_percent}%. Spray advisory: ${weatherData.spray_recommendation}. Irrigation advisory: ${weatherData.irrigation_recommendation}.`
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-sky-600" />
            <span>{t.weather}</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Real-time district weather forecasting and agricultural spraying advisories.
          </p>
        </div>

        {weatherData && weatherSpokenSummary && (
          <AudioPlayerPill
            id="weather-summary"
            text={weatherSpokenSummary}
            lang={language}
          />
        )}
      </div>

      {/* Search Bar & Quick Picks */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchWeather();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <MapPin className="w-5 h-5 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Enter district name (e.g. Erode, Nashik, Guntur)..."
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !district.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-medium text-sm transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{loading ? 'Searching...' : 'Check Weather'}</span>
          </button>
        </form>

        {/* Quick District Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
          <span className="font-semibold text-stone-700">Popular Agricultural Districts:</span>
          {POPULAR_DISTRICTS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDistrict(d);
                setDayOffset(0);
                fetchWeather(d, 0);
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-sky-50 hover:text-sky-800 text-stone-700 transition-colors"
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Weather Lookup Issue</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Weather Content */}
      {weatherData && (
        <div className="space-y-6">
          {/* Main Today's Summary Card */}
          <div className="bg-gradient-to-br from-sky-900 via-sky-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-700/50 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-300" />
                  <h2 className="text-2xl font-bold tracking-tight">
                    {weatherData.district}, {weatherData.state || weatherData.country}
                  </h2>
                </div>
                <p className="text-xs text-sky-200/80 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Forecast for: <strong>{weatherData.forecast_date}</strong> (Day offset: {weatherData.day_offset})</span>
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {weatherData.temperature_celsius !== null ? `${weatherData.temperature_celsius}°C` : '-'}
                </span>
                <p className="text-xs text-sky-200 font-medium capitalize mt-0.5">
                  {weatherData.condition}
                </p>
              </div>
            </div>

            {/* Weather Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-sky-200 text-xs font-medium">
                  <Thermometer className="w-4 h-4 text-amber-300" />
                  <span>Max / Min Temp</span>
                </div>
                <p className="text-lg font-bold">
                  {weatherData.temp_max_celsius}°C / {weatherData.temp_min_celsius}°C
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-sky-200 text-xs font-medium">
                  <Droplets className="w-4 h-4 text-sky-300" />
                  <span>Rain Probability</span>
                </div>
                <p className="text-lg font-bold">
                  {weatherData.rain_probability_percent !== null ? `${weatherData.rain_probability_percent}%` : '-'}
                </p>
                {weatherData.rainfall_mm !== null && (
                  <p className="text-[11px] text-sky-200/70">Sum: {weatherData.rainfall_mm} mm</p>
                )}
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-sky-200 text-xs font-medium">
                  <Wind className="w-4 h-4 text-emerald-300" />
                  <span>Wind Speed</span>
                </div>
                <p className="text-lg font-bold">
                  {weatherData.wind_speed_kmh !== null ? `${weatherData.wind_speed_kmh} km/h` : '-'}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-sky-200 text-xs font-medium">
                  <Droplets className="w-4 h-4 text-indigo-300" />
                  <span>Relative Humidity</span>
                </div>
                <p className="text-lg font-bold">
                  {weatherData.humidity_percent !== null ? `${weatherData.humidity_percent}%` : '-'}
                </p>
              </div>
            </div>

            {/* Farm Management Recommendations (Spray & Irrigation) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-950/60 border border-emerald-400/30 p-4 rounded-2xl space-y-1 text-emerald-100">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Spray Advisory</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {weatherData.spray_recommendation}
                </p>
              </div>

              <div className="bg-blue-950/60 border border-blue-400/30 p-4 rounded-2xl space-y-1 text-blue-100">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-300">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>Irrigation Guidance</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {weatherData.irrigation_recommendation}
                </p>
              </div>
            </div>

            {/* Data Source Disclaimer */}
            <div className="text-[11px] text-sky-300/70 pt-2 border-t border-sky-800/50 flex flex-wrap justify-between gap-2">
              <span>Source: {weatherData.source}</span>
              <span>Fetched at: {weatherData.fetched_at ? new Date(weatherData.fetched_at).toLocaleTimeString() : 'Recent'}</span>
            </div>
          </div>

          {/* 7-Day Forecast Horizon Cards */}
          {weatherData.daily && weatherData.daily.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                <span>7-Day Agricultural Forecast Horizon</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {weatherData.daily.map((day, idx) => {
                  const isSelected = dayOffset === idx;
                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => handleSelectDay(idx)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300 shadow-xs'
                          : 'bg-stone-50 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                      }`}
                    >
                      <p className="text-[11px] font-bold text-stone-700">
                        {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : `Day ${idx + 1}`}
                      </p>
                      <p className="text-[10px] text-stone-400 mb-1">{day.date}</p>
                      <p className="text-xs font-extrabold text-stone-900">
                        {day.temp_max_celsius}°C
                      </p>
                      <p className="text-[10px] text-stone-500">
                        Min {day.temp_min_celsius}°C
                      </p>
                      <div className="mt-2 pt-1 border-t border-stone-200/60 text-[10px] text-sky-700 font-medium">
                        🌧️ {day.rain_probability_percent}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
