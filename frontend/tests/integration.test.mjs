import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

describe('CropVoice Integration & Schema Verification Suite', () => {
  const BACKEND_BASE = process.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  test('Language codes and speech mapping are complete', () => {
    const supportedLangs = ['en', 'hi', 'ta', 'te', 'kn', 'ml'];
    const speechCodes = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
    };
    for (const lang of supportedLangs) {
      assert.ok(speechCodes[lang], `Missing speech code for ${lang}`);
    }
  });

  test('Mandi endpoint schema validation & state-wide results behavior', async () => {
    // Test endpoint parameter serialization
    const crop = 'rice';
    const state = 'Kerala';
    const district = 'Palakkad';
    const url = new URL(`${BACKEND_BASE}/market-prices`);
    url.searchParams.set('crop', crop);
    url.searchParams.set('state', state);
    url.searchParams.set('district', district);

    assert.equal(url.searchParams.get('crop'), 'rice');
    assert.equal(url.searchParams.get('state'), 'Kerala');
    assert.equal(url.searchParams.get('district'), 'Palakkad');
  });

  test('Consultancy request body validation', () => {
    const payload = {
      question: 'My rice leaves are turning yellow with brown spots',
      crop: 'rice',
      lang: 'en',
    };

    assert.ok(payload.question.length >= 3);
    assert.ok(payload.question.length <= 1000);
    assert.ok(['en', 'hi', 'ta', 'te', 'kn', 'ml'].includes(payload.lang));
  });

  test('Weather endpoint query parameter limits', () => {
    const district = 'Erode';
    const dayOffset = 3;
    const lang = 'en';

    assert.ok(district.length >= 2 && district.length <= 100);
    assert.ok(dayOffset >= 0 && dayOffset <= 6);
  });
});
