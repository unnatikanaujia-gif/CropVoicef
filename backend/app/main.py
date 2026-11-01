from __future__ import annotations
import os, json, re, unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
import httpx
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / '.env')
DATA = ROOT / 'data'
SCHEME_DATA_FILE = DATA / 'government_schemes.json'
app = FastAPI(title='CropVoice Backend', version='1.0.0', description='Weather, crop consultancy, and mandi-price API for CropVoice')
# For production, restrict allow_origins to your frontend origin.
origins = [x.strip() for x in os.getenv('CORS_ORIGINS', '*').split(',') if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=False, allow_methods=['*'], allow_headers=['*'])
LANGS = {'en','hi','ta','te','kn','ml'}
CROP_ALIASES = {
 'rice':['rice','paddy','dhan','nel','vari','బియ్యం','వరి','ಅಕ್ಕಿ','ಭತ್ತ','அரிசி','நெல்','അരി','നെല്ല്'],
 'wheat':['wheat','गेहूं','கோதுமை','గోధుమ','ಗೋಧಿ','ഗോതമ്പ്'],
 'maize':['maize','corn','మొక్కజొన్న','மக்காச்சோளம்','ಮೆಕ್ಕೆಜೋಳ','ചോളം'],
 'cotton':['cotton','kapas','பருத்தி','పత్తి','ಹತ್ತಿ','പരുത്തി'],
 'chilli':['chilli','chili','chilli pepper','மிளகாய்','మిరప','ಮೆಣಸಿನಕಾಯಿ','മുളക്'],
 'turmeric':['turmeric','haldi','manjal','pasupu','மஞ்சள்','పసుపు','ಅರಿಶಿನ','മഞ്ഞൾ'],
 'coconut':['coconut','coconut tree','thengai','kobbari','தேங்காய்','కొబ్బరి','ತೆಂಗಿನಕಾಯಿ','തേങ്ങ'],
 'banana':['banana','plantain','வாழை','అరటి','ಬಾಳೆ','വാഴപ്പഴം','വാഴ'],
 'sugarcane':['sugarcane','கரும்பு','చెరకు','ಕಬ್ಬು','കരിമ്പ്'],
 'groundnut':['groundnut','peanut','வேர்க்கடலை','వేరుశనగ','ಕಡಲೆಕಾಯಿ','നിലക്കടല'],
 'tomato':['tomato','தக்காளி','టమాటా','ಟೊಮೇಟೊ','തക്കാളി'],
 'onion':['onion','வெங்காயம்','ఉల్లిపాయ','ಈರುಳ್ಳಿ','ഉള്ളി'],
 'potato':['potato','உருளைக்கிழங்கு','బంగాళాదుంప','ಆಲೂಗಡ್ಡೆ','ഉരുളക്കിഴങ്ങ്'],
 'mango':['mango','மாம்பழம்','మామిడి','ಮಾವು','മാങ്ങ'],
 'ginger':['ginger','இஞ்சி','అల్లం','ಶುಂಠಿ','ഇഞ്ചി'],
 'arecanut':['arecanut','betel nut','பாக்கு','వక్క','ಅಡಿಕೆ','അടയ്ക്ക'],
 'black pepper':['black pepper','pepper','மிளகு','మిరియాలు','ಕಾಳುಮೆಣಸು','കുരുമുളക്'],
 'millet':['millet','millets','ragi','finger millet','கேழ்வரகு','రాగి','ರಾಗಿ','മുത്താറി'],
 'coffee':['coffee','காபி','కాఫీ','ಕಾಫಿ','കാപ്പി'],
 'tea':['tea','தேயிலை','తేయాకు','ಚಹಾ','ചായ'],
 'grapes':['grape','grapes','திராட்சை','ద్రాక్ష','ದ್ರಾಕ್ಷಿ','മുന്തിരി'],
 'pulses':['pulses','pulse crop','legume','legumes','பருப்பு வகைகள்','పప్పుధాన్యాలు','ಬೇಳೆಕಾಳುಗಳು','പയർവർഗ്ഗങ്ങൾ']
}
SYMPTOMS = {
 'yellowing':['yellow','yellowing','turning yellow','पीला','पीली','पीले','पीलापन','மஞ்சள்','மஞ்சளாக','மஞ்சளாகிறது','పసుపు','పసుపు రంగు','పసుపుగా','ಹಳದಿ','ಹಳದಿಯಾಗು','ಹಳದಿಯಾಗುತ್ತಿವೆ','മഞ്ഞ','മഞ്ഞനിറം','മഞ്ഞനിറമാക'],
 'leaf spots':['spot','spots','brown spot','black spot','leaf spot','धब्बा','धब्बे','दाग','புள்ளி','புள்ளிகள்','தழும்பு','మచ్చ','మచ్చలు','చుక్కలు','ಚುಕ್ಕೆ','ಚುಕ್ಕೆಗಳು','ಕಲೆ','പുള്ളി','പുള്ളികൾ','പാടുകൾ'],
 'wilting':['wilt','wilting','drooping','मुरझा','मुरझा रहे','வாட','வாடுகிறது','வாடி','వాడిపో','వాడిపోతు','వాడిపోతున్నాయి','ಬಾಡು','ಬಾಡುತ್ತಿವೆ','ಬಾಡಿದ','വാടൽ','വാടുന്നു','വാടിയ'],
 'curling':['curl','curling','curled','मुड़','मुड़ना','मुड़ रही','சுருள்','சுருண்டு','சுருண்ட','மடங்க','ముడుచు','ముడుచుకు','ముడుచుకుంటు','ಸುರುಳಿ','ಸುರುಳಿಯಾಗು','ಮುಡುಚು','ചുരുള്','ചുരുളുന്നു','ചുരുണ്ട'],
 'rot':['rot','rotting','rotting roots','அழுக','కుళ్ళు','ಕೊಳೆ','ചീയൽ'],
 'powdery growth':['powder','white powder','மாவு','తెల్ల పొడి','ಬಿಳಿ ಪುಡಿ','വെളുത്ത പൊടി'],
 'drying':['dry','drying','dry leaves','सूख','सूखना','सूख रहे','உலர்','காய்ந்து','உலர்ந்து','எండిపో','ఎండిపోతు','ఎండిపోతున్నాయి','ಒಣ','ಒಣಗುತ್ತಿವೆ','ಒಣಗಿದ','ഉണങ്ങ','ഉണങ്ങി','ഉണങ്ങുന്നു']
}

def norm(s: str) -> str:
    s=unicodedata.normalize('NFKC', (s or '').lower())
    return re.sub(r'[^\w\s-]', ' ', s).strip()

def find_crop(text: str) -> Optional[str]:
    n=norm(text)
    # prefer longest alias to avoid partial matches
    hits=[]
    for crop, aliases in CROP_ALIASES.items():
        for alias in [crop]+aliases:
            a=norm(alias)
            if a and a in n: hits.append((len(a),crop))
    return max(hits)[1] if hits else None

def load_diseases():
    try:
        obj=json.loads((DATA/'pests_diseases.json').read_text(encoding='utf-8'))
        return obj if isinstance(obj,list) else []
    except Exception: return []
DISEASES=load_diseases()

def load_schemes():
    try:
        obj=json.loads(SCHEME_DATA_FILE.read_text(encoding='utf-8'))
        return obj if isinstance(obj,list) else []
    except Exception:
        return []

SCHEMES=load_schemes()

def language_name(lang):
    return {'en':'English','hi':'Hindi','ta':'Tamil','te':'Telugu','kn':'Kannada','ml':'Malayalam'}.get(lang,'English')

# Localized fixed response text. Disease-record content remains in its verified source language.
LOCALIZED = {
 'en': {
  'need_crop':'Please tell me which crop you are growing and describe the symptoms.',
  'crop_q':'Which crop is affected?', 'symptom_q':'What symptoms do you see?', 'begin_q':'When did the symptoms begin?',
  'disclaimer':'A text description alone cannot confirm a crop disease.',
  'no_match':'Crop recognized, but this starter knowledge set has no sufficiently matched disease record. Please share more symptoms or consult your local KVK.',
  'possible':'These are possible matches only, not a confirmed diagnosis.',
  'part_q':'Which plant part is affected: leaves, stem, roots, fruit, or whole plant?',
  'duration_q':'How long ago did symptoms begin?', 'extent_q':'How much of the field is affected?',
  'safety':'Do not apply pesticides based only on this automated suggestion. Confirm with a qualified agricultural expert or local KVK before treatment.'
 },
 'hi': {
  'need_crop':'कृपया बताएं कि आप कौन-सी फसल उगा रहे हैं और उसमें क्या लक्षण दिखाई दे रहे हैं।',
  'crop_q':'कौन-सी फसल प्रभावित है?', 'symptom_q':'आपको कौन-से लक्षण दिखाई दे रहे हैं?', 'begin_q':'लक्षण कब शुरू हुए?',
  'disclaimer':'केवल लिखित विवरण से फसल की बीमारी की पुष्टि नहीं की जा सकती।',
  'no_match':'फसल की पहचान हुई है, लेकिन उपलब्ध जानकारी में लक्षणों से मेल खाने वाला पर्याप्त रोग रिकॉर्ड नहीं है। कृपया और लक्षण बताएं या स्थानीय कृषि विज्ञान केंद्र (KVK) से सलाह लें।',
  'possible':'ये केवल संभावित मिलान हैं, पक्की बीमारी की पहचान नहीं।',
  'part_q':'पौधे का कौन-सा हिस्सा प्रभावित है: पत्तियां, तना, जड़ें, फल या पूरा पौधा?',
  'duration_q':'लक्षण कितने समय पहले शुरू हुए?', 'extent_q':'खेत का कितना हिस्सा प्रभावित है?',
  'safety':'केवल इस स्वचालित सुझाव के आधार पर कीटनाशक न डालें। उपचार से पहले योग्य कृषि विशेषज्ञ या स्थानीय KVK से पुष्टि करें।'
 },
 'ta': {
  'need_crop':'நீங்கள் எந்தப் பயிரை வளர்க்கிறீர்கள், அதில் என்ன அறிகுறிகள் உள்ளன என்பதைத் தெரிவிக்கவும்.',
  'crop_q':'எந்தப் பயிர் பாதிக்கப்பட்டுள்ளது?', 'symptom_q':'என்ன அறிகுறிகள் தெரிகின்றன?', 'begin_q':'அறிகுறிகள் எப்போது தொடங்கின?',
  'disclaimer':'எழுத்து விளக்கத்தை மட்டும் வைத்து பயிர் நோயை உறுதிப்படுத்த முடியாது.',
  'no_match':'பயிர் அடையாளம் காணப்பட்டது. ஆனால் கிடைக்கும் தகவலில் பொருந்தும் நோய் பதிவு போதுமானதாக இல்லை. மேலும் அறிகுறிகளைப் பகிரவும் அல்லது அருகிலுள்ள KVK-ஐ அணுகவும்.',
  'possible':'இவை சாத்தியமான பொருத்தங்கள் மட்டுமே; உறுதியான நோய் கண்டறிதல் அல்ல.',
  'part_q':'தாவரத்தின் எந்தப் பகுதி பாதிக்கப்பட்டுள்ளது: இலை, தண்டு, வேர், காய்/பழம் அல்லது முழுத் தாவரமா?',
  'duration_q':'அறிகுறிகள் எவ்வளவு நாட்களுக்கு முன் தொடங்கின?', 'extent_q':'வயலின் எவ்வளவு பகுதி பாதிக்கப்பட்டுள்ளது?',
  'safety':'இந்தத் தானியங்கி பரிந்துரையை மட்டும் வைத்து பூச்சிக்கொல்லி பயன்படுத்த வேண்டாம். சிகிச்சைக்கு முன் தகுதியான வேளாண் நிபுணர் அல்லது உள்ளூர் KVK-யிடம் உறுதிப்படுத்தவும்.'
 },
 'te': {
  'need_crop':'మీరు ఏ పంట పండిస్తున్నారో, దానిలో కనిపిస్తున్న లక్షణాలు ఏమిటో చెప్పండి.',
  'crop_q':'ఏ పంట ప్రభావితమైంది?', 'symptom_q':'మీకు ఏ లక్షణాలు కనిపిస్తున్నాయి?', 'begin_q':'లక్షణాలు ఎప్పుడు ప్రారంభమయ్యాయి?',
  'disclaimer':'వచన వివరణ మాత్రమే ఆధారంగా పంట వ్యాధిని నిర్ధారించలేము.',
  'no_match':'పంటను గుర్తించాం, కానీ అందుబాటులో ఉన్న సమాచారంలో సరిపడే వ్యాధి నమోదు లేదు. మరిన్ని లక్షణాలు చెప్పండి లేదా స్థానిక KVKను సంప్రదించండి.',
  'possible':'ఇవి సాధ్యమైన సరిపోలికలు మాత్రమే; నిర్ధారిత వ్యాధి నిర్ధారణ కాదు.',
  'part_q':'మొక్కలో ఏ భాగం ప్రభావితమైంది: ఆకులు, కాండం, వేర్లు, పండు లేదా మొత్తం మొక్క?',
  'duration_q':'లక్షణాలు ఎంతకాలం క్రితం ప్రారంభమయ్యాయి?', 'extent_q':'పొలంలో ఎంత భాగం ప్రభావితమైంది?',
  'safety':'ఈ ఆటోమేటిక్ సూచన ఆధారంగా మాత్రమే పురుగుమందులు వాడకండి. చికిత్సకు ముందు అర్హత కలిగిన వ్యవసాయ నిపుణుడు లేదా స్థానిక KVKతో నిర్ధారించుకోండి.'
 },
 'kn': {
  'need_crop':'ನೀವು ಯಾವ ಬೆಳೆ ಬೆಳೆಯುತ್ತಿದ್ದೀರಿ ಮತ್ತು ಅದರಲ್ಲಿ ಯಾವ ಲಕ್ಷಣಗಳು ಕಾಣಿಸುತ್ತಿವೆ ಎಂದು ತಿಳಿಸಿ.',
  'crop_q':'ಯಾವ ಬೆಳೆ ಬಾಧಿತವಾಗಿದೆ?', 'symptom_q':'ಯಾವ ಲಕ್ಷಣಗಳು ಕಾಣಿಸುತ್ತಿವೆ?', 'begin_q':'ಲಕ್ಷಣಗಳು ಯಾವಾಗ ಆರಂಭವಾದವು?',
  'disclaimer':'ಪಠ್ಯ ವಿವರಣೆಯಿಂದ ಮಾತ್ರ ಬೆಳೆ ರೋಗವನ್ನು ಖಚಿತಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
  'no_match':'ಬೆಳೆಯನ್ನು ಗುರುತಿಸಲಾಗಿದೆ, ಆದರೆ ಲಭ್ಯ ಮಾಹಿತಿಯಲ್ಲಿ ಹೊಂದುವ ರೋಗದ ದಾಖಲೆ ಸಾಕಾಗಿಲ್ಲ. ಇನ್ನಷ್ಟು ಲಕ್ಷಣಗಳನ್ನು ತಿಳಿಸಿ ಅಥವಾ ಸ್ಥಳೀಯ KVK ಅನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  'possible':'ಇವು ಸಾಧ್ಯವಾದ ಹೊಂದಾಣಿಕೆಗಳು ಮಾತ್ರ; ಖಚಿತ ರೋಗನಿರ್ಣಯವಲ್ಲ.',
  'part_q':'ಸಸ್ಯದ ಯಾವ ಭಾಗ ಬಾಧಿತವಾಗಿದೆ: ಎಲೆಗಳು, ಕಾಂಡ, ಬೇರುಗಳು, ಹಣ್ಣು ಅಥವಾ ಸಂಪೂರ್ಣ ಸಸ್ಯ?',
  'duration_q':'ಲಕ್ಷಣಗಳು ಎಷ್ಟು ಸಮಯದ ಹಿಂದೆ ಆರಂಭವಾದವು?', 'extent_q':'ಹೊಲದ ಎಷ್ಟು ಭಾಗ ಬಾಧಿತವಾಗಿದೆ?',
  'safety':'ಈ ಸ್ವಯಂಚಾಲಿತ ಸಲಹೆಯನ್ನು ಮಾತ್ರ ಆಧರಿಸಿ ಕೀಟನಾಶಕ ಬಳಸಬೇಡಿ. ಚಿಕಿತ್ಸೆಗೆ ಮೊದಲು ಅರ್ಹ ಕೃಷಿ ತಜ್ಞರು ಅಥವಾ ಸ್ಥಳೀಯ KVK ಯಿಂದ ದೃಢಪಡಿಸಿಕೊಳ್ಳಿ.'
 },
 'ml': {
  'need_crop':'നിങ്ങൾ ഏത് വിളയാണ് കൃഷി ചെയ്യുന്നതെന്നും അതിൽ കാണുന്ന ലക്ഷണങ്ങൾ എന്താണെന്നും അറിയിക്കുക.',
  'crop_q':'ഏത് വിളയാണ് ബാധിച്ചിരിക്കുന്നത്?', 'symptom_q':'എന്തെല്ലാം ലക്ഷണങ്ങളാണ് കാണുന്നത്?', 'begin_q':'ലക്ഷണങ്ങൾ എപ്പോൾ തുടങ്ങി?',
  'disclaimer':'എഴുത്തിലുള്ള വിവരണം മാത്രം ഉപയോഗിച്ച് വിളരോഗം സ്ഥിരീകരിക്കാനാവില്ല.',
  'no_match':'വിള തിരിച്ചറിഞ്ഞു, എന്നാൽ ലഭ്യമായ വിവരങ്ങളിൽ മതിയായ രോഗരേഖ കണ്ടെത്താനായില്ല. കൂടുതൽ ലക്ഷണങ്ങൾ പങ്കിടുക അല്ലെങ്കിൽ പ്രാദേശിക KVK-യെ ബന്ധപ്പെടുക.',
  'possible':'ഇവ സാധ്യതയുള്ള പൊരുത്തങ്ങൾ മാത്രമാണ്; സ്ഥിരീകരിച്ച രോഗനിർണയം അല്ല.',
  'part_q':'ചെടിയുടെ ഏത് ഭാഗമാണ് ബാധിച്ചത്: ഇലകൾ, തണ്ട്, വേരുകൾ, പഴം, അല്ലെങ്കിൽ മുഴുവൻ ചെടിയോ?',
  'duration_q':'ലക്ഷണങ്ങൾ എത്ര കാലം മുമ്പാണ് തുടങ്ങിയത്?', 'extent_q':'കൃഷിയിടത്തിന്റെ എത്ര ഭാഗമാണ് ബാധിച്ചിരിക്കുന്നത്?',
  'safety':'ഈ സ്വയമേവ ലഭിച്ച നിർദ്ദേശം മാത്രം അടിസ്ഥാനമാക്കി കീടനാശിനി പ്രയോഗിക്കരുത്. ചികിത്സയ്ക്ക് മുമ്പ് യോഗ്യനായ കാർഷിക വിദഗ്ധനെയോ പ്രാദേശിക KVK-യെയോ സമീപിച്ച് ഉറപ്പാക്കുക.'
 }
}

def validate_lang(lang: str) -> str:
    normalized = (lang or 'en').strip().lower()
    if normalized not in LANGS:
        raise HTTPException(status_code=422, detail='Unsupported language. Supported values: en, hi, ta, te, kn, ml.')
    return normalized


def localized_consultancy(question: str, crop: Optional[str], lang: str):
    lang = validate_lang(lang)
    text = question.strip()
    detected = find_crop(crop or text)
    t = LOCALIZED[lang]
    if is_scheme_question(text):
        scheme_results = scheme_matches(text, crop=detected or crop)
        if not scheme_results:
            scheme_results = scheme_matches('', crop=detected or crop)
        return {'status':'schemes_found' if scheme_results else 'no_schemes_found', 'intent':'government_schemes',
                'crop':detected, 'language':lang, 'message':{'en':'Here are government scheme resources to review. Confirm current eligibility and deadlines on the official portals.',
                'hi':'यहाँ सरकारी योजनाओं की जानकारी के स्रोत हैं। पात्रता और अंतिम तिथि की पुष्टि आधिकारिक पोर्टल पर करें।',
                'ta':'அரசுத் திட்டங்களுக்கான தகவல் ஆதாரங்கள் இங்கே உள்ளன. தகுதி மற்றும் கடைசி தேதியை அதிகாரப்பூர்வ தளத்தில் உறுதிப்படுத்தவும்.',
                'te':'ప్రభుత్వ పథకాల సమాచారం ఇక్కడ ఉంది. అర్హత, చివరి తేదీలను అధికారిక పోర్టల్‌లో నిర్ధారించండి.',
                'kn':'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿ ಮೂಲಗಳು ಇಲ್ಲಿವೆ. ಅರ್ಹತೆ ಮತ್ತು ಕೊನೆಯ ದಿನಾಂಕವನ್ನು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.',
                'ml':'സർക്കാർ പദ്ധതികളുടെ വിവര സ്രോതസ്സുകൾ ഇവിടെയുണ്ട്. യോഗ്യതയും അവസാന തീയതിയും ഔദ്യോഗിക പോർട്ടലിൽ സ്ഥിരീകരിക്കുക.'}[lang],
                'schemes':scheme_results, 'safety_note':'Scheme details may change. CropVoice does not determine official eligibility or guarantee approval.'}
    if not detected:
        return {'status':'need_crop','crop':None,'language':lang,'message':t['need_crop'],
                'follow_up_questions':[t['crop_q'],t['symptom_q'],t['begin_q']],
                'disclaimer':t['disclaimer']}
    n = norm(text)
    matched = []
    for category, aliases in SYMPTOMS.items():
        if any(norm(a) in n for a in aliases):
            matched.append(category)
    candidates = []
    for record in DISEASES:
        rcrop = norm(str(record.get('crop','')))
        if rcrop and (rcrop == norm(detected) or (detected == 'rice' and rcrop in ['rice','paddy'])):
            symptoms = norm(str(record.get('symptoms',''))+' '+str(record.get('name','')))
            score = sum(1 for term in re.findall(r'[a-z]{3,}', n) if term in symptoms)
            score += sum(2 for symptom in matched if any(norm(alias) in symptoms for alias in SYMPTOMS[symptom]))
            candidates.append((score, record))
    candidates.sort(key=lambda x:x[0], reverse=True)
    top = [record for score, record in candidates[:3] if score > 0]
    results = []
    for record in top:
        results.append({'name':record.get('name'),'symptoms':record.get('symptoms'),'prevention':record.get('prevention'),
                        'source':record.get('source_id'),'source_url':record.get('source_url'),
                        'verification_status':record.get('verification_status','unverified')})
    message = (t['possible'] if results else t['no_match'])
    return {'status':'ok','crop':detected,'language':lang,'symptoms_detected':matched,'possible_matches':results,
            'confidence':'low' if len(results) != 1 or not matched else 'preliminary','message':message,
            'follow_up_questions':[t['part_q'],t['duration_q'],t['extent_q']], 'safety_note':t['safety']}

@app.get('/')
def root(): return {'name':'CropVoice Backend','status':'ok','docs':'/docs','endpoints':['/health','/weather','/crops','/consultancy','/schemes','/market-prices']}
@app.get('/health')
def health(): return {'status':'ok','timestamp':datetime.now(timezone.utc).isoformat(),'disease_records':len(DISEASES),'government_scheme_records':len(SCHEMES)}

@app.get('/crops')
def crops():
    return {'count':len(CROP_ALIASES),'crops':sorted(CROP_ALIASES.keys()),'crop_aliases':CROP_ALIASES,'languages_supported':['en','hi','ta','te','kn','ml'],'note':'Crop recognition identifies crop names and aliases; it does not guarantee disease records for every crop.'}

@app.get('/weather')
async def weather(district: str=Query(...,min_length=2,max_length=100), lang: str='en', day_offset: int=Query(0,ge=0,le=6)):
    lang=validate_lang(lang)
    try:
        async with httpx.AsyncClient(timeout=12, follow_redirects=True) as client:
            geo=await client.get('https://geocoding-api.open-meteo.com/v1/search',params={'name':district,'count':5,'language':'en','format':'json'})
            geo.raise_for_status(); results=geo.json().get('results') or []
            # Prefer India if multiple same-name places
            place=next((x for x in results if x.get('country_code')=='IN'), results[0] if results else None)
            if not place: return {'status':'unresolved_location','district':district,'message':'Location not found. Try a nearby town or district.'}
            params={'latitude':place['latitude'],'longitude':place['longitude'],'current':'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m','daily':'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max','forecast_days':7,'timezone':'auto'}
            resp=await client.get('https://api.open-meteo.com/v1/forecast',params=params); resp.raise_for_status(); data=resp.json()
        cur=data.get('current') or {}; daily=data.get('daily') or {}; dates=daily.get('time') or []
        if not dates: raise ValueError('Forecast response did not contain daily dates')
        i=min(day_offset,len(dates)-1)
        days=[]
        codes={0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Fog',51:'Light drizzle',53:'Drizzle',55:'Dense drizzle',61:'Light rain',63:'Moderate rain',65:'Heavy rain',80:'Rain showers',81:'Rain showers',82:'Heavy rain showers',95:'Thunderstorm',96:'Thunderstorm with hail',99:'Thunderstorm with hail'}
        for j,date in enumerate(dates):
            code=(daily.get('weather_code') or [None]*len(dates))[j]
            def val(key):
                arr=daily.get(key) or []
                return arr[j] if j<len(arr) else None
            days.append({'date':date,'temp_max_celsius':val('temperature_2m_max'),'temp_min_celsius':val('temperature_2m_min'),'rain_probability_percent':val('precipitation_probability_max'),'rainfall_mm':val('precipitation_sum'),'wind_max_kmh':val('wind_speed_10m_max'),'condition':codes.get(code,'Unknown')})
        selected=days[i]
        return {'status':'ok','district':place.get('name',district),'state':place.get('admin1'),'country':place.get('country'),'temperature_celsius':cur.get('temperature_2m'),'humidity_percent':cur.get('relative_humidity_2m'),'wind_speed_kmh':cur.get('wind_speed_10m'),'condition':codes.get(cur.get('weather_code'),'Unknown'),'rain_probability_percent':selected['rain_probability_percent'],'spray_recommendation':'Check wind speed and follow the product label before spraying. Rain probability is elevated; consider postponing if conditions are unsuitable.' if (selected.get('rain_probability_percent') or 0)>=40 else 'Check wind speed and follow the product label before spraying.','irrigation_recommendation':'Use crop stage, soil moisture, and local guidance; do not irrigate solely from rain probability.','day_offset':day_offset,'forecast_date':selected['date'],'temp_max_celsius':selected['temp_max_celsius'],'temp_min_celsius':selected['temp_min_celsius'],'rainfall_mm':selected['rainfall_mm'],'daily':days,'source':'Open-Meteo forecast; not an official IMD warning','fetched_at':datetime.now(timezone.utc).isoformat(),'language_requested':lang,'note':'Weather measurements are returned as structured data; localize the user-facing summary in the frontend.'}
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502,detail=f'Weather provider request failed: {type(e).__name__}. Please retry.')
    except (ValueError, KeyError, TypeError) as e:
        raise HTTPException(status_code=502,detail='Weather provider returned an invalid forecast response.')

@app.get('/consultancy')
def consultancy(question: str=Query(...,min_length=3,max_length=1000), crop: Optional[str]=None, lang: str='en'):
    return localized_consultancy(question=question, crop=crop, lang=lang)

SCHEME_TERMS = ['scheme','schemes','subsidy','subsidies','government benefit','government support','yojana','sarkari','pm-kisan','pm kisan','fasal bima','crop insurance','kisan credit card','kcc','திட்டம்','மானியம்','పథకం','సబ్సిడీ','ಯೋಜನೆ','ಸಬ್ಸಿಡಿ','പദ്ധതി','സബ്സിഡി','योजना','सब्सिडी']

def scheme_matches(query: str = '', state: Optional[str] = None, crop: Optional[str] = None, category: Optional[str] = None):
    q=norm(query); st=norm(state or ''); cr=norm(crop or '') ; cat=norm(category or '')
    results=[]
    for item in SCHEMES:
        hay=norm(' '.join([item.get('name',''),item.get('summary',''),item.get('category',''),' '.join(item.get('keywords',[]))]))
        if q and not any(term in hay for term in re.findall(r'[\w-]+',q)) and not any(norm(k) in q for k in item.get('keywords',[])):
            continue
        if cat and cat not in norm(item.get('category','')): continue
        # Current starter catalog contains national schemes only. State is returned as context, not treated as proof of state-specific eligibility.
        if cr and item.get('crops') and not any(norm(c) in cr for c in item.get('crops',[])): continue
        result=dict(item)
        result['requested_state']=state
        result['crop_context']=crop
        result['eligibility_status']='not_checked'
        results.append(result)
    return results

def is_scheme_question(question: str) -> bool:
    q=norm(question)
    return any(norm(term) in q for term in SCHEME_TERMS)

@app.get('/schemes')
def government_schemes(
    query: Optional[str] = Query(None, min_length=1, max_length=300),
    state: Optional[str] = Query(None, max_length=100),
    crop: Optional[str] = Query(None, max_length=100),
    category: Optional[str] = Query(None, max_length=100),
    lang: str = 'en',
):
    lang=validate_lang(lang)
    results=scheme_matches(query or '', state, crop, category)
    return {'status':'ok','count':len(results),'schemes':results,'language_requested':lang,
            'note':'This is a starter catalogue of national schemes and official portals, not a live eligibility decision. State-specific availability, notified crops, deadlines, benefits and eligibility can change. Confirm details on the linked official portal or with the local agriculture department/KVK.',
            'catalog_updated_at':None,'source':'Official government portals linked per scheme'}

@app.get('/market-prices')
async def market_prices(
    crop: str = Query(..., min_length=2, max_length=100),
    state: Optional[str] = Query(None, max_length=100),
    district: Optional[str] = Query(None, max_length=100),
    limit: int = Query(1000, ge=1, le=1000),
):
    """Return live mandi prices for a crop across the requested state.

    `district` is accepted for compatibility with the existing client, but is
    intentionally not used as a filter: results cover the whole state.
    The provider may paginate results, so fetch pages up to the requested cap.
    """
    api_key = os.getenv('DATA_GOV_IN_API_KEY', '').strip()
    resource = os.getenv('DATA_GOV_IN_RESOURCE_ID', '').strip() or '9ef84268-d588-465a-a308-a864a43d0070'
    if not api_key:
        return {
            'status': 'configuration_required', 'crop': crop, 'state': state,
            'records': [],
            'message': 'Set DATA_GOV_IN_API_KEY in backend/.env to fetch live mandi prices. No sample prices are shown as real data.'
        }

    state_aliases = {'kerala': 'Keralam', 'keralam': 'Keralam'}
    requested_state = state.strip() if state else None
    if requested_state:
        requested_state = state_aliases.get(requested_state.casefold(), requested_state)

    # If a Tamil Nadu district is provided without a state, infer Tamil Nadu;
    # the district still does not narrow the returned mandi list.
    tamil_nadu_districts = {
        'ariyalur','chengalpattu','chennai','coimbatore','cuddalore','dharmapuri',
        'dindigul','erode','kallakurichi','kancheepuram','karur','krishnagiri',
        'madurai','mayiladuthurai','nagapattinam','namakkal','nilgiris','perambalur',
        'pudukkottai','ramanathapuram','ranipet','salem','sivaganga','tenkasi',
        'thanjavur','theni','thoothukudi','tiruchirappalli','tirunelveli',
        'tirupathur','tiruppur','tiruvallur','tiruvannamalai','tiruvarur',
        'vellore','viluppuram','virudhunagar'
    }
    if not requested_state and district and district.strip().casefold() in tamil_nadu_districts:
        requested_state = 'Tamil Nadu'

    page_size = 100
    max_records = min(limit, 1000)
    records = []
    seen = set()
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            offset = 0
            while len(records) < max_records:
                page_limit = min(page_size, max_records - len(records))
                params = {
                    'api-key': api_key,
                    'format': 'json',
                    'limit': page_limit,
                    'offset': offset,
                    'filters[commodity]': crop.strip(),
                }
                if requested_state:
                    params['filters[state]'] = requested_state
                # Deliberately do not send filters[district]: the user wants
                # all matching mandis across the selected state.
                response = await client.get(f'https://api.data.gov.in/resource/{resource}', params=params)
                response.raise_for_status()
                payload = response.json()
                page = payload.get('records', [])
                if not isinstance(page, list) or not page:
                    break
                for record in page:
                    identity = tuple(str(record.get(k, '')) for k in (
                        'state','district','market','commodity','variety','grade',
                        'arrival_date','min_price','max_price','modal_price'
                    ))
                    if identity not in seen:
                        seen.add(identity)
                        records.append(record)
                        if len(records) >= max_records:
                            break
                if len(page) < page_limit:
                    break
                offset += len(page)
        return {
            'status': 'ok', 'crop': crop,
            'state': requested_state,
            'district_input': district,
            'district_filter_applied': False,
            'records': records, 'count': len(records),
            'truncated': len(records) >= max_records,
            'source': 'data.gov.in',
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'price_fields': ['market', 'district', 'commodity', 'arrival_date', 'min_price', 'max_price', 'modal_price'],
        }
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        raise HTTPException(status_code=502, detail=f'Market price provider returned HTTP {status_code}. Check API key, resource ID, and rate limit.')
    except (httpx.HTTPError, ValueError) as e:
        raise HTTPException(status_code=502, detail=f'Market price provider request failed: {type(e).__name__}.')

class ConsultRequest(BaseModel):
    question: str = Field(min_length=3,max_length=1000)
    crop: Optional[str] = None
    lang: str = 'en'

@app.post('/consultancy')
def consultancy_post(req: ConsultRequest):
    return localized_consultancy(question=req.question, crop=req.crop, lang=req.lang)
