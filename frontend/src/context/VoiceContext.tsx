import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LanguageCode } from '../types/api';
import { VoiceStatus, VoiceError } from '../types/voice';
import { speechService } from '../services/speech';
import { useLanguage } from './LanguageContext';

interface VoiceContextType {
  status: VoiceStatus;
  transcript: string;
  interimTranscript: string;
  error: VoiceError | null;
  activeSpeakingId: string | null;
  autoSpeak: boolean;
  setAutoSpeak: (val: boolean) => void;
  speechRate: number;
  setSpeechRate: (val: number) => void;
  selectedVoice: string;
  setSelectedVoice: (name: string) => void;
  isRecognitionSupported: boolean;
  isSynthesisSupported: boolean;
  startVoiceInput: (onFinalTranscript?: (text: string) => void) => void;
  stopVoiceInput: () => void;
  speakText: (text: string, id?: string, overrideLang?: LanguageCode) => void;
  stopAudio: () => void;
  clearError: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<VoiceError | null>(null);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeakState] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem('cropvoice_autospeak');
      return val !== null ? val === 'true' : true;
    } catch {
      return true;
    }
  });
  const [speechRate, setSpeechRateState] = useState<number>(() => {
    try {
      const val = localStorage.getItem('cropvoice_speech_rate');
      return val ? parseFloat(val) : 0.95;
    } catch {
      return 0.95;
    }
  });
  const [selectedVoice, setSelectedVoiceState] = useState<string>(() => {
    try {
      return localStorage.getItem('cropvoice_voice_name') || '';
    } catch {
      return '';
    }
  });

  const setAutoSpeak = (val: boolean) => {
    setAutoSpeakState(val);
    try {
      localStorage.setItem('cropvoice_autospeak', String(val));
    } catch {
      // ignore
    }
  };

  const setSpeechRate = (val: number) => {
    setSpeechRateState(val);
    try {
      localStorage.setItem('cropvoice_speech_rate', String(val));
    } catch {
      // ignore
    }
  };

  const setSelectedVoice = (name: string) => {
    setSelectedVoiceState(name);
    try {
      localStorage.setItem('cropvoice_voice_name', name);
    } catch {
      // ignore
    }
  };

  const isRecognitionSupported = speechService.isRecognitionSupported();
  const isSynthesisSupported = speechService.isSynthesisSupported();

  const clearError = () => setError(null);

  const stopAudio = useCallback(() => {
    speechService.stopSpeaking();
    setActiveSpeakingId(null);
    if (status === 'speaking') {
      setStatus('idle');
    }
  }, [status]);

  const stopVoiceInput = useCallback(() => {
    speechService.stopListening();
    if (status === 'listening') {
      setStatus('idle');
    }
  }, [status]);

  const startVoiceInput = useCallback(
    (onFinalTranscript?: (text: string) => void) => {
      stopAudio();
      setError(null);
      setTranscript('');
      setInterimTranscript('');

      speechService.startListening(language, {
        onStart: () => {
          setStatus('listening');
        },
        onResult: (text: string, isFinal: boolean) => {
          if (isFinal) {
            setTranscript(text);
            setInterimTranscript('');
            onFinalTranscript?.(text);
          } else {
            setInterimTranscript(text);
          }
        },
        onError: (err: VoiceError) => {
          setError(err);
          setStatus('error');
        },
        onEnd: () => {
          setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
        },
      });
    },
    [language, stopAudio]
  );

  const speakText = useCallback(
    (text: string, id?: string, overrideLang?: LanguageCode) => {
      if (!isSynthesisSupported) return;
      stopAudio();

      const langToUse = overrideLang || language;
      setActiveSpeakingId(id || 'generic');
      setStatus('speaking');

      speechService.speak(text, langToUse, {
        voiceName: selectedVoice || undefined,
        rate: speechRate,
        onStart: () => {
          setStatus('speaking');
        },
        onEnd: () => {
          setActiveSpeakingId(null);
          setStatus('idle');
        },
        onError: (err) => {
          setActiveSpeakingId(null);
          setStatus('idle');
          console.warn('Speech synthesis error:', err);
        },
      });
    },
    [language, isSynthesisSupported, selectedVoice, speechRate, stopAudio]
  );

  return (
    <VoiceContext.Provider
      value={{
        status,
        transcript,
        interimTranscript,
        error,
        activeSpeakingId,
        autoSpeak,
        setAutoSpeak,
        speechRate,
        setSpeechRate,
        selectedVoice,
        setSelectedVoice,
        isRecognitionSupported,
        isSynthesisSupported,
        startVoiceInput,
        stopVoiceInput,
        speakText,
        stopAudio,
        clearError,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
