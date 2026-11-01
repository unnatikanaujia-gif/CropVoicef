import React from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useVoice } from '../context/VoiceContext';
import { LanguageCode } from '../types/api';

interface AudioPlayerPillProps {
  text: string;
  id: string;
  lang?: LanguageCode;
  compact?: boolean;
}

export const AudioPlayerPill: React.FC<AudioPlayerPillProps> = ({
  text,
  id,
  lang,
  compact = false,
}) => {
  const { activeSpeakingId, speakText, stopAudio, isSynthesisSupported } = useVoice();
  const isCurrentlySpeaking = activeSpeakingId === id;

  if (!isSynthesisSupported || !text?.trim()) return null;

  return (
    <div className="inline-flex items-center gap-1.5">
      {isCurrentlySpeaking ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            stopAudio();
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300 transition-colors shadow-sm`}
          title="Stop reading aloud"
          aria-label="Stop reading aloud"
        >
          <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <span>Stop Audio</span>
          <span className="flex gap-0.5 items-center ml-1">
            <span className="w-1 h-2 bg-rose-600 animate-pulse rounded-full"></span>
            <span className="w-1 h-3.5 bg-rose-600 animate-pulse delay-75 rounded-full"></span>
            <span className="w-1 h-2 bg-rose-600 animate-pulse delay-150 rounded-full"></span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            speakText(text, id, lang);
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900 border border-stone-300 transition-colors shadow-sm`}
          title="Listen in your selected language"
          aria-label="Read aloud"
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{compact ? 'Listen' : 'Read Aloud'}</span>
        </button>
      )}
    </div>
  );
};
