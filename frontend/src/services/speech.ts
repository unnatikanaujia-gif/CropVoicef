import { LanguageCode } from '../types/api';
import { LANGUAGE_SPEECH_MAP, VoiceError } from '../types/voice';

// Type declarations for browser Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

class SpeechService {
  private recognitionInstance: any = null;
  private isListening: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voicesCache: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.populateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.populateVoices();
      }
    }
  }

  private populateVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.voicesCache = window.speechSynthesis.getVoices();
    } catch {
      this.voicesCache = [];
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voicesCache.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voicesCache = window.speechSynthesis.getVoices();
    }
    return this.voicesCache;
  }

  // Capability checks
  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  public isSecureContext(): boolean {
    if (typeof window === 'undefined') return true;
    return window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  // --- Speech Recognition ---
  public startListening(
    lang: LanguageCode,
    options: {
      onStart?: () => void;
      onResult?: (transcript: string, isFinal: boolean) => void;
      onError?: (error: VoiceError) => void;
      onEnd?: () => void;
    }
  ): () => void {
    if (!this.isRecognitionSupported()) {
      options.onError?.({
        type: 'not_supported',
        message: 'Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or type your question below.',
      });
      return () => {};
    }

    if (!this.isSecureContext()) {
      options.onError?.({
        type: 'insecure_context',
        message: 'Microphone access requires HTTPS or localhost. If opening from a mobile phone, run with HTTPS or use a local tunnel.',
      });
      return () => {};
    }

    // Stop ongoing listening or synthesis
    this.stopListening();
    this.stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      const recognition = new SpeechRecognition();
      this.recognitionInstance = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const langInfo = LANGUAGE_SPEECH_MAP[lang];
      recognition.lang = langInfo ? langInfo.speechLang : 'en-IN';

      let lastFinalTranscript = '';

      recognition.onstart = () => {
        this.isListening = true;
        options.onStart?.();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            lastFinalTranscript = text;
            options.onResult?.(text, true);
          } else {
            interimTranscript += text;
            options.onResult?.(interimTranscript, false);
          }
        }
      };

      recognition.onerror = (event: any) => {
        this.isListening = false;
        let errType: VoiceError['type'] = 'unknown';
        let errMsg = 'An error occurred during speech recognition.';

        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            errType = 'permission_denied';
            errMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings to speak.';
            break;
          case 'no-speech':
            errType = 'no_speech';
            errMsg = 'No speech was detected. Please try speaking again closer to the microphone.';
            break;
          case 'network':
            errType = 'network_error';
            errMsg = 'Network error occurred while contacting the speech recognition service.';
            break;
          case 'language-not-supported':
            errType = 'language_unsupported';
            errMsg = `Your browser speech engine does not support language code ${recognition.lang}. Try English or Hindi.`;
            break;
          default:
            errMsg = `Speech recognition error: ${event.error || 'unknown'}`;
        }

        options.onError?.({ type: errType, message: errMsg });
      };

      recognition.onend = () => {
        this.isListening = false;
        this.recognitionInstance = null;
        options.onEnd?.();
      };

      recognition.start();

      return () => {
        this.stopListening();
      };
    } catch (err: any) {
      this.isListening = false;
      options.onError?.({
        type: 'unknown',
        message: `Failed to initialize speech recognition: ${err.message || err}`,
      });
      return () => {};
    }
  }

  public stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.abort();
      } catch {
        // ignore
      }
      this.recognitionInstance = null;
    }
    this.isListening = false;
  }

  // --- Speech Synthesis (Text to Speech) ---
  public speak(
    text: string,
    lang: LanguageCode,
    options?: {
      voiceName?: string;
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: string) => void;
    }
  ): void {
    if (!this.isSynthesisSupported()) {
      options?.onError?.('Speech synthesis (read aloud) is not supported in this browser.');
      return;
    }

    if (!text || !text.trim()) {
      options?.onEnd?.();
      return;
    }

    // Always stop ongoing speech to prevent overlapping voices
    this.stopSpeaking();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const langInfo = LANGUAGE_SPEECH_MAP[lang];
      utterance.lang = langInfo ? langInfo.speechLang : 'en-IN';
      utterance.rate = options?.rate ?? 0.95; // Slightly slower for clear regional speech
      utterance.pitch = options?.pitch ?? 1.0;

      // Match voice
      const voices = this.getAvailableVoices();
      if (options?.voiceName) {
        const selected = voices.find((v) => v.name === options.voiceName);
        if (selected) utterance.voice = selected;
      } else {
        // Look for language match
        const targetPrefix = utterance.lang.split('-')[0].toLowerCase();
        const bestVoice = voices.find(
          (v) => v.lang.toLowerCase().startsWith(targetPrefix) || v.lang.toLowerCase().replace('_', '-').startsWith(targetPrefix)
        );
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
      }

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          options?.onError?.(`Speech synthesis error: ${e.error}`);
        } else {
          options?.onEnd?.();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      this.currentUtterance = null;
      options?.onError?.(`Failed to play speech: ${err.message || err}`);
    }
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking;
  }
}

export const speechService = new SpeechService();
