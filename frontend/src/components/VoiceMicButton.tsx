import React from 'react';
import { Mic, MicOff, Volume2, Square } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';
import { useLanguage } from '../context/LanguageContext';

interface VoiceMicButtonProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  onFinalTranscript?: (text: string) => void;
  className?: string;
  showLabel?: boolean;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  size = 'md',
  onFinalTranscript,
  className = '',
  showLabel = true,
}) => {
  const { status, startVoiceInput, stopVoiceInput, stopAudio, isRecognitionSupported } = useVoice();
  const { t } = useLanguage();

  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';

  const handleClick = () => {
    if (isListening) {
      stopVoiceInput();
    } else if (isSpeaking) {
      stopAudio();
    } else {
      startVoiceInput(onFinalTranscript);
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-18 h-18',
    hero: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    hero: 'w-12 h-12 sm:w-14 sm:h-14',
  };

  if (!isRecognitionSupported) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <button
          type="button"
          disabled
          className={`${sizeClasses[size]} rounded-full bg-stone-200 text-stone-400 flex items-center justify-center cursor-not-allowed border border-stone-300`}
          title="Speech recognition is not supported in this browser. Please use Chrome or Edge."
        >
          <MicOff className={iconSizes[size]} />
        </button>
        {showLabel && (
          <span className="text-xs text-stone-500 font-medium text-center">
            Voice mic unavailable
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center gap-2 select-none ${className}`}>
      {/* Animated Ripple for Listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping -z-10" />
          <span className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-pulse-slow -z-10" />
        </>
      )}

      {/* Animated Ripple for Speaking */}
      {isSpeaking && (
        <span className="absolute -inset-2 rounded-full bg-amber-500/20 animate-pulse -z-10" />
      )}

      <button
        type="button"
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 shadow-md focus:outline-none focus:ring-4 ${
          isListening
            ? 'bg-rose-600 hover:bg-rose-700 text-white ring-rose-300 scale-105 shadow-rose-500/40'
            : isSpeaking
            ? 'bg-amber-600 hover:bg-amber-700 text-white ring-amber-300 shadow-amber-500/40'
            : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white ring-emerald-300 shadow-emerald-700/30'
        }`}
        aria-label={
          isListening
            ? t.listening
            : isSpeaking
            ? t.stopSpeaking
            : t.askButton
        }
      >
        {isListening ? (
          <Square className={iconSizes[size]} />
        ) : isSpeaking ? (
          <Volume2 className={`${iconSizes[size]} animate-bounce`} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </button>

      {showLabel && (
        <div className="flex flex-col items-center">
          <span
            className={`text-xs sm:text-sm font-semibold tracking-wide transition-colors ${
              isListening
                ? 'text-rose-600 animate-pulse'
                : isSpeaking
                ? 'text-amber-700'
                : 'text-stone-700'
            }`}
          >
            {isListening
              ? t.listening
              : isSpeaking
              ? t.speaking
              : 'Tap to Speak'}
          </span>
          {isListening && (
            <span className="text-[11px] text-stone-500 font-normal">
              Tap again to stop
            </span>
          )}
        </div>
      )}
    </div>
  );
};
