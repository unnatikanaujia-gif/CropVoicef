import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HealthResponse } from '../types/api';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const BackendStatusBadge: React.FC<{ showDetails?: boolean }> = ({ showDetails = false }) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Cannot reach backend');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health && !error) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
        <RefreshCw className="w-3 h-3 animate-spin text-stone-400" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
        onClick={checkHealth}
        title={`Click to retry. ${error || 'Backend not responding'}`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>Backend Offline</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            checkHealth();
          }}
          className="ml-1 hover:text-amber-900"
          aria-label="Retry connection"
        >
          <RefreshCw className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
      title={`CropVoice Backend healthy at ${api.getBaseUrl()}`}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>Backend Live</span>
      {showDetails && (
        <span className="text-emerald-700/80 font-normal ml-0.5">
          ({health.disease_records} diseases, {health.government_scheme_records} schemes)
        </span>
      )}
    </div>
  );
};
