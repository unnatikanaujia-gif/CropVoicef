from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

CASES = [
    ("en", "My rice leaves are turning yellow", "rice", "yellowing"),
    ("hi", "मेरे पौधों की पत्तियाँ पीली हो रही हैं", "rice", "yellowing"),
    ("ta", "என் செடியின் இலைகள் மஞ்சளாக மாறுகின்றன", "turmeric", "yellowing"),
    ("te", "నా మొక్క ఆకులు పసుపు రంగులోకి మారుతున్నాయి", "chilli", "yellowing"),
    ("kn", "ನನ್ನ ಗಿಡದ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ", "coconut", "yellowing"),
    ("ml", "എന്റെ ചെടിയുടെ ഇലകൾ മഞ്ഞനിറമാകുന്നു", "banana", "yellowing"),
]


def test_supported_languages_return_localized_fixed_text():
    messages = set()
    for lang, question, crop, symptom in CASES:
        response = client.post("/consultancy", json={"question": question, "crop": crop, "lang": lang})
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == lang
        assert symptom in data["symptoms_detected"]
        assert data["message"]
        assert data["follow_up_questions"]
        assert data["safety_note"]
        messages.add(data["message"])
    assert len(messages) == len(CASES)


def test_unsupported_language_rejected_on_post_and_get():
    post = client.post("/consultancy", json={"question": "My rice leaves are yellow", "crop": "rice", "lang": "xx"})
    get = client.get("/consultancy", params={"question": "My rice leaves are yellow", "crop": "rice", "lang": "xx"})
    assert post.status_code == 422
    assert get.status_code == 422


def test_missing_crop_asks_for_clarification_in_requested_language():
    response = client.post("/consultancy", json={"question": "मेरे पौधे की पत्तियाँ पीली हैं", "lang": "hi"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "need_crop"
    assert data["language"] == "hi"
    assert "कृपया" in data["message"]
    assert len(data["follow_up_questions"]) == 3


def test_question_length_validation():
    assert client.post("/consultancy", json={"question": "a"}).status_code == 422
    assert client.post("/consultancy", json={"question": "a" * 1001}).status_code == 422


def test_existing_endpoints_remain_available():
    assert client.get("/").status_code == 200
    assert client.get("/health").status_code == 200
    crops = client.get("/crops")
    assert crops.status_code == 200
    assert crops.json()["count"] == 22

SYMPTOM_CASES = [
    ("hi", "पत्तियों पर धब्बे हैं", "leaf spots"),
    ("hi", "पौधा मुरझा रहा है", "wilting"),
    ("hi", "पत्तियाँ मुड़ रही हैं", "curling"),
    ("hi", "पत्तियाँ सूख रही हैं", "drying"),
    ("ta", "இலைகளில் புள்ளிகள் உள்ளன", "leaf spots"),
    ("ta", "செடி வாடுகிறது", "wilting"),
    ("ta", "இலைகள் சுருண்டுள்ளன", "curling"),
    ("ta", "இலைகள் காய்ந்து வருகின்றன", "drying"),
    ("te", "ఆకులపై మచ్చలు ఉన్నాయి", "leaf spots"),
    ("te", "మొక్క వాడిపోతోంది", "wilting"),
    ("te", "ఆకులు ముడుచుకుంటున్నాయి", "curling"),
    ("te", "ఆకులు ఎండిపోతున్నాయి", "drying"),
    ("kn", "ಎಲೆಗಳಲ್ಲಿ ಚುಕ್ಕೆಗಳಿವೆ", "leaf spots"),
    ("kn", "ಗಿಡ ಬಾಡುತ್ತಿದೆ", "wilting"),
    ("kn", "ಎಲೆಗಳು ಸುರುಳಿಯಾಗುತ್ತಿವೆ", "curling"),
    ("kn", "ಎಲೆಗಳು ಒಣಗುತ್ತಿವೆ", "drying"),
    ("ml", "ഇലകളിൽ പുള്ളികളുണ്ട്", "leaf spots"),
    ("ml", "ചെടി വാടുന്നു", "wilting"),
    ("ml", "ഇലകൾ ചുരുളുന്നു", "curling"),
    ("ml", "ഇലകൾ ഉണങ്ങുന്നു", "drying"),
]


def test_regional_symptom_recognition():
    for lang, question, expected_symptom in SYMPTOM_CASES:
        response = client.post("/consultancy", json={"question": question, "crop": "rice", "lang": lang})
        assert response.status_code == 200, (lang, question)
        assert expected_symptom in response.json()["symptoms_detected"], (lang, question, response.json())
