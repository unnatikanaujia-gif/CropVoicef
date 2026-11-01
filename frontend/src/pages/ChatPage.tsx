import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send,
  Trash2,
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldAlert,
  Sprout,
  Landmark,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useVoice } from '../context/VoiceContext';
import { api } from '../services/api';
import { ConsultancyResponse } from '../types/api';
import { VoiceMicButton } from '../components/VoiceMicButton';
import { AudioPlayerPill } from '../components/AudioPlayerPill';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  data?: ConsultancyResponse;
  isError?: boolean;
}

export const ChatPage: React.FC = () => {
  const { language, t, languages } = useLanguage();
  const {
    status: voiceStatus,
    transcript,
    interimTranscript,
    error: voiceError,
    startVoiceInput,
    stopVoiceInput,
    speakText,
    stopAudio,
    activeSpeakingId,
    autoSpeak,
    isRecognitionSupported,
  } = useVoice();

  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: t.farmerFriendlyBanner,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, interimTranscript]);

  // Handle incoming initial question from Home page navigation
  useEffect(() => {
    if (location.state && (location.state as any).initialQuestion) {
      const q = (location.state as any).initialQuestion;
      // Clear location state to prevent re-submission on refresh
      window.history.replaceState({}, document.title);
      handleSendMessage(q);
    }
  }, [location.state]);

  // Update input text when voice transcript is finalized
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    stopAudio();
    stopVoiceInput();
    setErrorMsg(null);

    const userMessageId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMessageId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.postConsultancy(
        query,
        selectedCrop ? selectedCrop : null,
        language
      );

      const assistantMessageId = `assistant-${Date.now()}`;
      let spokenText = response.message;

      // Enrich spoken text for voice synthesis
      if (response.possible_matches && response.possible_matches.length > 0) {
        const top = response.possible_matches[0];
        spokenText += `. Possible match: ${top.name}. ${top.prevention || ''}`;
      } else if (response.schemes && response.schemes.length > 0) {
        spokenText += `. Found ${response.schemes.length} matching government schemes including ${response.schemes[0].name}.`;
      }

      const assistantMsg: Message = {
        id: assistantMessageId,
        sender: 'assistant',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: response,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Auto-speak if enabled
      if (autoSpeak) {
        speakText(spokenText, assistantMessageId, language);
      }
    } catch (err: any) {
      const errMsgText = err.message || 'Failed to consult agricultural database.';
      setErrorMsg(errMsgText);

      const errorAssistantMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error: ${errMsgText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };

      setMessages((prev) => [...prev, errorAssistantMsg]);
      // Keep question in input so the farmer does not lose their draft
      setInputText(query);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    stopAudio();
    stopVoiceInput();
    setMessages([
      {
        id: 'welcome-cleared',
        sender: 'assistant',
        text: t.farmerFriendlyBanner,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>{t.chatAssistant}</span>
          </h1>
          <p className="text-xs text-stone-500">
            Current language: <span className="font-semibold text-emerald-700">{languages[language]?.nativeName} ({languages[language]?.label})</span> • Session memory only
          </p>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              type="button"
              onClick={clearChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-rose-700 hover:bg-rose-50 border border-stone-300 rounded-lg transition-colors"
              title="Clear conversation messages"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearChat}</span>
            </button>
          )}
        </div>
      </div>

      {/* Voice Status & Error Banner */}
      {voiceError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{voiceError.message}</span>
        </div>
      )}

      {/* Main Chat Messages Container */}
      <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-4 min-h-[460px] max-h-[580px] overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : msg.isError
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-none'
                    : 'bg-white text-stone-900 border border-stone-200 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isUser ? 'text-emerald-100' : 'text-stone-400'}`}>
                    {isUser ? 'Farmer' : 'CropVoice Assistant'}
                  </span>
                  <span className={`text-[10px] ${isUser ? 'text-emerald-200' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Rich Consultancy Response Elements */}
                {msg.data && (
                  <div className="mt-3 pt-3 border-t border-stone-100 space-y-3">
                    {/* Crop Detected & Symptoms Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {msg.data.crop && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                          Crop: {msg.data.crop}
                        </span>
                      )}
                      {msg.data.symptoms_detected?.map((sym, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                          Symptom: {sym}
                        </span>
                      ))}
                      {msg.data.confidence && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[11px]">
                          Confidence: {msg.data.confidence}
                        </span>
                      )}
                    </div>

                    {/* Government Schemes list if intent was schemes */}
                    {msg.data.schemes && msg.data.schemes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-purple-700" />
                          <span>Matching Government Schemes ({msg.data.schemes.length})</span>
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.data.schemes.map((scheme, scIdx) => (
                            <div key={scIdx} className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-purple-950">{scheme.name}</span>
                                {scheme.category && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-200 text-purple-800 font-medium">
                                    {scheme.category}
                                  </span>
                                )}
                              </div>
                              <p className="text-purple-900 text-xs">{scheme.summary}</p>
                              {scheme.portal_url && (
                                <a
                                  href={scheme.portal_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 underline mt-1"
                                >
                                  <span>Official Scheme Portal</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Possible Disease Matches */}
                    {msg.data.possible_matches && msg.data.possible_matches.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-stone-900">
                          Possible Matched Diseases from Knowledge Base:
                        </p>
                        <div className="space-y-2">
                          {msg.data.possible_matches.map((item, dIdx) => (
                            <div key={dIdx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-950 text-sm">{item.name}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  item.verification_status === 'verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {item.verification_status || 'unverified'}
                                </span>
                              </div>
                              <p className="text-stone-700"><strong>Symptoms:</strong> {item.symptoms}</p>
                              <p className="text-stone-700"><strong>Prevention / Management:</strong> {item.prevention}</p>
                              {item.source_url && (
                                <a
                                  href={item.source_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 underline"
                                >
                                  <span>Source: {item.source || 'Extension Advisory'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Questions Suggestions */}
                    {msg.data.follow_up_questions && msg.data.follow_up_questions.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 space-y-1.5">
                        <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          <span>Clarification Questions:</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.data.follow_up_questions.map((fq, fIdx) => (
                            <button
                              key={fIdx}
                              type="button"
                              onClick={() => handleSendMessage(fq)}
                              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors text-left"
                            >
                              {fq}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Safety Warning */}
                    {msg.data.safety_note && (
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-900 text-[11px] flex items-start gap-1.5 border border-amber-200">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{msg.data.safety_note}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Read aloud player pill */}
                {!isUser && !msg.isError && (
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <AudioPlayerPill
                      id={msg.id}
                      text={
                        msg.data?.possible_matches?.length
                          ? `${msg.text}. Possible match: ${msg.data.possible_matches[0].name}. ${msg.data.possible_matches[0].prevention || ''}`
                          : msg.text
                      }
                      lang={language}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Interim Speech Transcription Bubble */}
        {voiceStatus === 'listening' && interimTranscript && (
          <div className="flex items-end justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-none px-4 py-2.5 bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs italic animate-pulse">
              Listening: "{interimTranscript}"
            </div>
          </div>
        )}

        {/* Loading Spinner Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-stone-500 p-2">
            <div className="flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
            </div>
            <span>{t.processing}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice & Text Input Controls */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-md space-y-3">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Voice Mic Button */}
          <VoiceMicButton
            size="md"
            onFinalTranscript={(text) => handleSendMessage(text)}
            showLabel={false}
          />

          {/* Multiline / Single Line Input */}
          <div className="flex-1 relative">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                voiceStatus === 'listening'
                  ? t.listening
                  : t.askPlaceholder
              }
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none max-h-24"
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all shadow-sm"
            aria-label="Send query"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100 px-1 gap-2">
          <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
          <span>Automatic audio readout {autoSpeak ? 'enabled' : 'disabled'}</span>
        </div>
      </div>
    </div>
  );
};
