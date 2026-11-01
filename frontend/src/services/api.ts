import {
  HealthResponse,
  CropsResponse,
  WeatherResponse,
  ConsultancyResponse,
  SchemesResponse,
  MandiPricesResponse,
  LanguageCode,
  ConsultRequest,
} from '../types/api';

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiClient {
  private customBaseUrl: string | null = null;

  constructor() {
    // Check localStorage for user-overridden URL if any
    try {
      const stored = localStorage.getItem('cropvoice_api_base_url');
      if (stored) {
        this.customBaseUrl = stored;
      }
    } catch {
      // ignore
    }
  }

  public getBaseUrl(): string {
    return (this.customBaseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
  }

  public setBaseUrl(url: string | null): void {
    this.customBaseUrl = url;
    try {
      if (url) {
        localStorage.setItem('cropvoice_api_base_url', url);
      } else {
        localStorage.removeItem('cropvoice_api_base_url');
      }
    } catch {
      // ignore
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = 15000
  ): Promise<T> {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (options.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(id);

      if (!res.ok) {
        let errDetail = `Server responded with status ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson && errJson.detail) {
            errDetail = typeof errJson.detail === 'string'
              ? errJson.detail
              : JSON.stringify(errJson.detail);
          }
        } catch {
          // Response was not JSON
        }
        throw new Error(errDetail);
      }

      const data = await res.json();
      return data as T;
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs / 1000} seconds. Please verify the backend is running at ${this.getBaseUrl()}`);
      }
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error(`Cannot connect to CropVoice backend at ${this.getBaseUrl()}. Ensure FastAPI server is running with CORS enabled.`);
      }
      throw err;
    }
  }

  // --- Endpoints ---

  public async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  public async getCrops(): Promise<CropsResponse> {
    return this.request<CropsResponse>('/crops');
  }

  public async getWeather(
    district: string,
    lang: LanguageCode = 'en',
    dayOffset: number = 0
  ): Promise<WeatherResponse> {
    const query = new URLSearchParams({
      district: district.trim(),
      lang,
      day_offset: dayOffset.toString(),
    });
    return this.request<WeatherResponse>(`/weather?${query.toString()}`);
  }

  public async getConsultancy(
    question: string,
    crop?: string | null,
    lang: LanguageCode = 'en'
  ): Promise<ConsultancyResponse> {
    const params: Record<string, string> = {
      question: question.trim(),
      lang,
    };
    if (crop) {
      params.crop = crop.trim();
    }
    const query = new URLSearchParams(params);
    return this.request<ConsultancyResponse>(`/consultancy?${query.toString()}`);
  }

  public async postConsultancy(
    question: string,
    crop?: string | null,
    lang: LanguageCode = 'en'
  ): Promise<ConsultancyResponse> {
    const payload: ConsultRequest = {
      question: question.trim(),
      crop: crop ? crop.trim() : null,
      lang,
    };
    return this.request<ConsultancyResponse>('/consultancy', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getSchemes(
    query?: string,
    state?: string,
    crop?: string,
    category?: string,
    lang: LanguageCode = 'en'
  ): Promise<SchemesResponse> {
    const params: Record<string, string> = { lang };
    if (query?.trim()) params.query = query.trim();
    if (state?.trim()) params.state = state.trim();
    if (crop?.trim()) params.crop = crop.trim();
    if (category?.trim()) params.category = category.trim();

    const qs = new URLSearchParams(params);
    return this.request<SchemesResponse>(`/schemes?${qs.toString()}`);
  }

  public async getMarketPrices(
    crop: string,
    state?: string | null,
    district?: string | null,
    limit: number = 1000
  ): Promise<MandiPricesResponse> {
    const params: Record<string, string> = {
      crop: crop.trim(),
      limit: Math.min(Math.max(limit, 1), 1000).toString(),
    };
    if (state?.trim()) params.state = state.trim();
    if (district?.trim()) params.district = district.trim();

    const qs = new URLSearchParams(params);
    return this.request<MandiPricesResponse>(`/market-prices?${qs.toString()}`);
  }
}

export const api = new ApiClient();
