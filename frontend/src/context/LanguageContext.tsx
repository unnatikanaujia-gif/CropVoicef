import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../types/api';
import { LANGUAGE_SPEECH_MAP } from '../types/voice';

export interface Translations {
  appName: string;
  tagline: string;
  home: string;
  chatAssistant: string;
  mandiPrices: string;
  weather: string;
  cropDoctor: string;
  schemes: string;
  settings: string;
  askPlaceholder: string;
  askButton: string;
  listening: string;
  processing: string;
  speaking: string;
  stopSpeaking: string;
  replaySpeech: string;
  clearChat: string;
  farmerFriendlyBanner: string;
  disclaimer: string;
  kvkWarning: string;
  selectLanguage: string;
  tryAsking: string;
  quickServices: string;
  liveStatus: string;
  backendConnected: string;
  backendDisconnected: string;
  viewMandi: string;
  checkWeather: string;
  diagnoseCrop: string;
  exploreSchemes: string;
}

const UI_STRINGS: Record<LanguageCode, Translations> = {
  en: {
    appName: 'CropVoice',
    tagline: 'Farmer Voice Assistant & Agricultural Intelligence',
    home: 'Home',
    chatAssistant: 'Voice Assistant',
    mandiPrices: 'Mandi Prices',
    weather: 'Weather Advisory',
    cropDoctor: 'Crop Doctor',
    schemes: 'Govt Schemes',
    settings: 'Settings',
    askPlaceholder: 'Ask in your voice or type your farming question...',
    askButton: 'Ask Question',
    listening: 'Listening to your voice...',
    processing: 'Consulting agricultural records...',
    speaking: 'CropVoice is speaking...',
    stopSpeaking: 'Stop Audio',
    replaySpeech: 'Replay Audio',
    clearChat: 'Clear Conversation',
    farmerFriendlyBanner: 'Ask crop diseases, mandi rates, weather forecast, or government subsidies in your mother tongue.',
    disclaimer: 'Automated advisory. Please confirm diagnosis and treatments with your local KVK or agricultural officer.',
    kvkWarning: 'Do not spray chemicals solely based on automated results.',
    selectLanguage: 'Language',
    tryAsking: 'Try asking:',
    quickServices: 'Agricultural Services',
    liveStatus: 'Backend Status',
    backendConnected: 'Connected to CropVoice API',
    backendDisconnected: 'Backend Offline',
    viewMandi: 'View Mandi Prices',
    checkWeather: 'Check Weather Forecast',
    diagnoseCrop: 'Diagnose Crop Disease',
    exploreSchemes: 'Find Govt Schemes',
  },
  hi: {
    appName: 'क्रॉपवॉइस',
    tagline: 'किसान आवाज़ सहायक एवं कृषि जानकारी',
    home: 'होम',
    chatAssistant: 'वॉइस सहायक',
    mandiPrices: 'मंडी भाव',
    weather: 'मौसम सलाह',
    cropDoctor: 'फसल डॉक्टर',
    schemes: 'सरकारी योजनाएं',
    settings: 'सेटिंग्स',
    askPlaceholder: 'बोलकर या लिखकर अपना कृषि प्रश्न पूछें...',
    askButton: 'प्रश्न पूछें',
    listening: 'आपकी आवाज़ सुन रहे हैं...',
    processing: 'कृषि रिकॉर्ड में खोज रहे हैं...',
    speaking: 'क्रॉपवॉइस बोल रहा है...',
    stopSpeaking: 'ऑडियो रोकें',
    replaySpeech: 'फिर से सुनें',
    clearChat: 'बातचीत साफ़ करें',
    farmerFriendlyBanner: 'अपनी भाषा में फसल रोग, मंडी भाव, मौसम पूर्वानुमान और सरकारी सब्सिडी की जानकारी पाएं।',
    disclaimer: 'स्वचालित सुझाव। कृपया उपचार से पहले स्थानीय कृषि विज्ञान केंद्र (KVK) से सलाह लें।',
    kvkWarning: 'केवल स्वचालित सुझाव पर कीटनाशक न डालें।',
    selectLanguage: 'भाषा चुनें',
    tryAsking: 'यह पूछकर देखें:',
    quickServices: 'कृषि सेवाएं',
    liveStatus: 'सर्वर स्थिति',
    backendConnected: 'क्रॉपवॉइस सर्वर से जुड़ा है',
    backendDisconnected: 'सर्वर ऑफ़लाइन है',
    viewMandi: 'मंडी भाव देखें',
    checkWeather: 'मौसम पूर्वानुमान देखें',
    diagnoseCrop: 'फसल रोग पहचानें',
    exploreSchemes: 'सरकारी योजनाएं खोजें',
  },
  ta: {
    appName: 'கிராப்வாய்ஸ்',
    tagline: 'விவசாயிகளுக்கான குரல் உதவியாளர்',
    home: 'முகப்பு',
    chatAssistant: 'குரல் உதவியாளர்',
    mandiPrices: 'மண்டி விலைகள்',
    weather: 'வானிலை ஆலோசனை',
    cropDoctor: 'பயிர் மருத்துவர்',
    schemes: 'அரசுத் திட்டங்கள்',
    settings: 'அமைப்புகள்',
    askPlaceholder: 'குரல் மூலமாகவோ அல்லது தட்டச்சு செய்தோ கேட்கவும்...',
    askButton: 'கேள்வி கேட்க',
    listening: 'உங்கள் குரலைக் கேட்கிறது...',
    processing: 'வேளாண் பதிவுகளைத் தேடுகிறது...',
    speaking: 'பதில் வாசிக்கப்படுகிறது...',
    stopSpeaking: 'நிறுத்து',
    replaySpeech: 'மீண்டும் கேள்',
    clearChat: 'உரையாடலை அழிக்க',
    farmerFriendlyBanner: 'பயிர் நோய்கள், மண்டி விலை, வானிலை மற்றும் அரசு மானியங்கள் குறித்த தகவல்களைத் தமிழில் பெறுங்கள்.',
    disclaimer: 'தானியங்கி பரிந்துரை. சிகிச்சைக்கு முன் அருகிலுள்ள KVK வேளாண் அதிகாரியை அணுகவும்.',
    kvkWarning: 'தானியங்கி பரிந்துரையை மட்டும் வைத்து பூச்சிக்கொல்லி பயன்படுத்த வேண்டாம்.',
    selectLanguage: 'மொழி',
    tryAsking: 'இதை கேட்கலாம்:',
    quickServices: 'வேளாண் சேவைகள்',
    liveStatus: 'சேவையக நிலை',
    backendConnected: 'இணைக்கப்பட்டுள்ளது',
    backendDisconnected: 'இணைப்பில்லை',
    viewMandi: 'மண்டி விலை பார்க்க',
    checkWeather: 'வானிலை பார்க்க',
    diagnoseCrop: 'பயிர் நோய் அறிய',
    exploreSchemes: 'அரசுத் திட்டங்கள் காண',
  },
  te: {
    appName: 'క్రాప్‌వాయిస్',
    tagline: 'రైతు వాయిస్ సహాయకుడు మరియు వ్యవసాయ సమాచారం',
    home: 'హోమ్',
    chatAssistant: 'వాయిస్ అసిస్టెంట్',
    mandiPrices: 'మండీ ధరలు',
    weather: 'వాతావరణ సలహా',
    cropDoctor: 'పంట డాక్టర్',
    schemes: 'ప్రభుత్వ పథకాలు',
    settings: 'సెట్టింగ్‌లు',
    askPlaceholder: 'మీ గొంతుతో లేదా టైప్ చేసి ప్రశ్న అడగండి...',
    askButton: 'ప్రశ్న అడగండి',
    listening: 'మీ మాటలను వింటోంది...',
    processing: 'వ్యవసాయ సమాచారం వెతుకుతోంది...',
    speaking: 'సమాధానం వినిపిస్తోంది...',
    stopSpeaking: 'ఆడియో ఆపండి',
    replaySpeech: 'మళ్లీ వినండి',
    clearChat: 'చాట్ తొలగించు',
    farmerFriendlyBanner: 'మీ పంట సమస్యలు, మార్కెట్ ధరలు, వాతావరణం మరియు ప్రభుత్వ పథకాల సమాచారం తెలుసుకోండి.',
    disclaimer: 'ఆటోమేటిక్ సలహా. చికిత్సకు ముందు స్థానిక KVK వ్యవసాయ నిపుణుడిని సంప్రదించండి.',
    kvkWarning: 'కేవలం ఆటోమేటిక్ సూచనపై పురుగుమందులు వాడకండి.',
    selectLanguage: 'భాష',
    tryAsking: 'ఇలా అడగండి:',
    quickServices: 'వ్యవసాయ సేవలు',
    liveStatus: 'సర్వర్ స్థితి',
    backendConnected: 'కనెక్ట్ చేయబడింది',
    backendDisconnected: 'డిస్‌కనెక్ట్ అయింది',
    viewMandi: 'మండీ ధరలు చూడండి',
    checkWeather: 'వాతావరణం చూడండి',
    diagnoseCrop: 'పంట వ్యాధిని గుర్తించండి',
    exploreSchemes: 'పథకాలు కనుగొనండి',
  },
  kn: {
    appName: 'ಕ್ರಾಪ್‌ವಾಯ್ಸ್',
    tagline: 'ರೈತರ ಧ್ವನಿ ಸಹಾಯಕ ಮತ್ತು ಕೃಷಿ ಮಾಹಿತಿ',
    home: 'ಮುಖಪುಟ',
    chatAssistant: 'ಧ್ವನಿ ಸಹಾಯಕ',
    mandiPrices: 'ಮಾರುಕಟ್ಟೆ ದರಗಳು',
    weather: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
    cropDoctor: 'ಬೆಳೆ ವೈದ್ಯ',
    schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    settings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    askPlaceholder: 'ಧ್ವನಿಯಲ್ಲಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ ಕೃಷಿ ಪ್ರಶ್ನೆ ಕೇಳಿ...',
    askButton: 'ಪ್ರಶ್ನೆ ಕೇಳಿ',
    listening: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
    processing: 'ಮಾಹಿತಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
    speaking: 'ಧ್ವನಿ ಓದಲಾಗುತ್ತಿದೆ...',
    stopSpeaking: 'ಆಡಿಯೋ ನಿಲ್ಲಿಸಿ',
    replaySpeech: 'ಮತ್ತೆ ಆಲಿಸಿ',
    clearChat: 'ಸಂಭಾಷಣೆ ಅಳಿಸಿ',
    farmerFriendlyBanner: 'ಬೆಳೆ ರೋಗ, ಮಾರುಕಟ್ಟೆ ದರ, ಹವಾಮಾನ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ಪಡೆಯಿರಿ.',
    disclaimer: 'ಸ್ವಯಂಚಾಲಿತ ಸಲಹೆ. ಚಿಕಿತ್ಸೆಗೆ ಮುನ್ನ ಸ್ಥಳೀಯ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ (KVK) ಸಂಪರ್ಕಿಸಿ.',
    kvkWarning: 'ಸ್ವಯಂಚಾಲಿತ ಸಲಹೆಯನ್ನೇ ನಂಬಿ ಕೀಟನಾಶಕ ಬಳಸಬೇಡಿ.',
    selectLanguage: 'ಭಾಷೆ',
    tryAsking: 'ಹೀಗೆ ಕೇಳಿ ನೋಡಿ:',
    quickServices: 'ಕೃಷಿ ಸೇವೆಗಳು',
    liveStatus: 'ಸರ್ವರ್ ಸ್ಥಿತಿ',
    backendConnected: 'ಸಂಪರ್ಕಗೊಂಡಿದೆ',
    backendDisconnected: 'ಆಫ್‌ಲೈನ್ ಆಗಿದೆ',
    viewMandi: 'ಮಾರುಕಟ್ಟೆ ದರ ನೋಡಿ',
    checkWeather: 'ಹವಾಮಾನ ನೋಡಿ',
    diagnoseCrop: 'ಬೆಳೆ ರೋಗ ಪತ್ತೆಹಚ್ಚಿ',
    exploreSchemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆ ನೋಡಿ',
  },
  ml: {
    appName: 'ക്രോപ്പ്വോയ്സ്',
    tagline: 'കർഷക ശബ്ദ സഹായിയും കാർഷിക വിവരങ്ങളും',
    home: 'ഹോം',
    chatAssistant: 'വോയ്സ് അസിസ്റ്റന്റ്',
    mandiPrices: 'മാർക്കറ്റ് വിലകൾ',
    weather: 'കാലാവസ്ഥ മുന്നറിയിപ്പ്',
    cropDoctor: 'വിള ഡോക്ടർ',
    schemes: 'സർക്കാർ പദ്ധതികൾ',
    settings: 'സെറ്റിംഗ്സ്',
    askPlaceholder: 'സംസാരിച്ചോ ടൈപ്പ് ചെയ്തോ കൃഷി ചോദ്യം ചോദിക്കുക...',
    askButton: 'ചോദ്യം ചോദിക്കുക',
    listening: 'കേൾക്കുന്നു...',
    processing: 'വിവരങ്ങൾ ശേഖരിക്കുന്നു...',
    speaking: 'മറുപടി പറയുന്നു...',
    stopSpeaking: 'ഓഡിയോ നിർത്തുക',
    replaySpeech: 'വീണ്ടും കേൾക്കുക',
    clearChat: 'ചാറ്റ് മായ്ക്കുക',
    farmerFriendlyBanner: 'വിള രോഗങ്ങൾ, വിപണി നിരക്കുകൾ, കാലാവസ്ഥ, സർക്കാർ സബ്‌സിഡികൾ എന്നിവ മലയാളത്തിൽ അറിയാം.',
    disclaimer: 'സ്വയമേവയുള്ള നിർദ്ദേശം. ചികിത്സയ്ക്ക് മുമ്പ് പ്രാദേശിക KVK-യുമായി ബന്ധപ്പെടുക.',
    kvkWarning: 'ഈ നിർദ്ദേശം മാത്രം അടിസ്ഥാനമാക്കി കീടനാശിനി പ്രയോഗിക്കരുത്.',
    selectLanguage: 'ഭാഷ',
    tryAsking: 'ഇങ്ങനെ ചോദിച്ചുനോക്കൂ:',
    quickServices: 'കാർഷിക സേവനങ്ങൾ',
    liveStatus: 'സെർവർ നില',
    backendConnected: 'കണക്റ്റ് ചെയ്തു',
    backendDisconnected: 'ഓഫ്‌ലൈൻ',
    viewMandi: 'വിപണി വിലകൾ കാണുക',
    checkWeather: 'കാലാവസ്ഥ പരിശോധിക്കുക',
    diagnoseCrop: 'വിള രോഗം കണ്ടെത്തുക',
    exploreSchemes: 'പദ്ധതികൾ കാണുക',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  languages: typeof LANGUAGE_SPEECH_MAP;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('cropvoice_lang') as LanguageCode;
      if (saved && UI_STRINGS[saved]) return saved;
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('cropvoice_lang', lang);
    } catch {
      // ignore
    }
  };

  const t = UI_STRINGS[language] || UI_STRINGS.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGE_SPEECH_MAP }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
