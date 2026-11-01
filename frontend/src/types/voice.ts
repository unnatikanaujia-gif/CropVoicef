import { LanguageCode } from './api';

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceError {
  type:
    | 'not_supported'
    | 'permission_denied'
    | 'no_speech'
    | 'network_error'
    | 'language_unsupported'
    | 'insecure_context'
    | 'unknown';
  message: string;
}

export const LANGUAGE_SPEECH_MAP: Record<
  LanguageCode,
  {
    code: string;
    label: string;
    nativeName: string;
    sampleQuestion: string;
    speechLang: string;
  }
> = {
  en: {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    sampleQuestion: 'My rice leaves are turning yellow with brown spots',
    speechLang: 'en-IN',
  },
  hi: {
    code: 'hi',
    label: 'Hindi',
    nativeName: 'हिन्दी',
    sampleQuestion: 'मेरे धान की पत्तियाँ पीली हो रही हैं',
    speechLang: 'hi-IN',
  },
  ta: {
    code: 'ta',
    label: 'Tamil',
    nativeName: 'தமிழ்',
    sampleQuestion: 'என் நெல் செடியின் இலைகள் மஞ்சளாக மாறுகின்றன',
    speechLang: 'ta-IN',
  },
  te: {
    code: 'te',
    label: 'Telugu',
    nativeName: 'తెలుగు',
    sampleQuestion: 'నా వరి మొక్క ఆకులు పసుపు రంగులోకి మారుతున్నాయి',
    speechLang: 'te-IN',
  },
  kn: {
    code: 'kn',
    label: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    sampleQuestion: 'ನನ್ನ ಭತ್ತದ ಗಿಡದ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ',
    speechLang: 'kn-IN',
  },
  ml: {
    code: 'ml',
    label: 'Malayalam',
    nativeName: 'മലയാളം',
    sampleQuestion: 'എന്റെ നെല്ലിന്റെ ഇലകൾ മഞ്ഞനിറമാകുന്നു',
    speechLang: 'ml-IN',
  },
};
