export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml';

export interface HealthResponse {
  status: string;
  timestamp: string;
  disease_records: number;
  government_scheme_records: number;
}

export interface CropsResponse {
  count: number;
  crops: string[];
  crop_aliases: Record<string, string[]>;
  languages_supported: LanguageCode[];
  note: string;
}

export interface WeatherDailyItem {
  date: string;
  temp_max_celsius: number | null;
  temp_min_celsius: number | null;
  rain_probability_percent: number | null;
  rainfall_mm: number | null;
  wind_max_kmh: number | null;
  condition: string;
}

export interface WeatherResponse {
  status: 'ok' | 'unresolved_location' | string;
  district?: string;
  state?: string | null;
  country?: string | null;
  temperature_celsius?: number | null;
  humidity_percent?: number | null;
  wind_speed_kmh?: number | null;
  condition?: string;
  rain_probability_percent?: number | null;
  spray_recommendation?: string;
  irrigation_recommendation?: string;
  day_offset?: number;
  forecast_date?: string;
  temp_max_celsius?: number | null;
  temp_min_celsius?: number | null;
  rainfall_mm?: number | null;
  daily?: WeatherDailyItem[];
  source?: string;
  fetched_at?: string;
  language_requested?: string;
  note?: string;
  message?: string;
}

export interface DiseaseRecord {
  name: string;
  symptoms: string;
  prevention: string;
  source?: string;
  source_url?: string;
  verification_status?: 'verified' | 'unverified' | string;
}

export interface SchemeRecord {
  id?: string;
  name: string;
  summary: string;
  category?: string;
  portal_url?: string;
  crops?: string[];
  keywords?: string[];
  requested_state?: string | null;
  crop_context?: string | null;
  eligibility_status?: string;
  [key: string]: any;
}

export interface SchemesResponse {
  status: string;
  count: number;
  schemes: SchemeRecord[];
  language_requested: string;
  note: string;
  catalog_updated_at: string | null;
  source: string;
}

export interface MandiRecord {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  arrival_date?: string;
  min_price?: string | number;
  max_price?: string | number;
  modal_price?: string | number;
  [key: string]: any;
}

export interface MandiPricesResponse {
  status: 'ok' | 'configuration_required' | string;
  crop: string;
  state?: string | null;
  district_input?: string | null;
  district_filter_applied?: boolean;
  records: MandiRecord[];
  count?: number;
  truncated?: boolean;
  source?: string;
  updated_at?: string;
  price_fields?: string[];
  message?: string;
}

export interface ConsultancyResponse {
  status: 'ok' | 'need_crop' | 'schemes_found' | 'no_schemes_found' | string;
  crop?: string | null;
  language: LanguageCode;
  message: string;
  intent?: string;
  symptoms_detected?: string[];
  possible_matches?: DiseaseRecord[];
  confidence?: 'low' | 'preliminary' | string;
  follow_up_questions?: string[];
  safety_note?: string;
  disclaimer?: string;
  schemes?: SchemeRecord[];
}

export interface ConsultRequest {
  question: string;
  crop?: string | null;
  lang: LanguageCode;
}
