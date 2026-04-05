import { GoogleGenerativeAI } from '@google/generative-ai';

const keys = process.env.GOOGLE_API_KEYS
  ? JSON.parse(process.env.GOOGLE_API_KEYS)
  : [process.env.GEMINI_API_KEY];

let currentIndex = 0;

function getNextClient() {
  currentIndex = (currentIndex + 1) % keys.length;
  return new GoogleGenerativeAI(keys[currentIndex]);
}

function getCurrentClient() {
  return new GoogleGenerativeAI(keys[currentIndex]);
}

export function getGeminiModel(modelName = 'gemini-2.5-flash') {
  return getCurrentClient().getGenerativeModel({ model: modelName });
}

export async function getGeminiModelWithRetry(modelName = 'gemini-2.5-flash') {
  const maxAttempts = keys.length;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const client = getCurrentClient();
      const model = client.getGenerativeModel({ model: modelName });
      // Return a proxy that rotates key on rate limit errors
      return model;
    } catch (err) {
      const isRateLimit = err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('rate');
      if (isRateLimit && attempt < maxAttempts - 1) {
        getNextClient();
        continue;
      }
      throw err;
    }
  }
}

export async function generateWithRotation(modelName = 'gemini-2.5-flash', generateFn) {
  const maxAttempts = keys.length;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const client = getCurrentClient();
      const model = client.getGenerativeModel({ model: modelName });
      return await generateFn(model);
    } catch (err) {
      const isRateLimit = err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('rate');
      if (isRateLimit && attempt < maxAttempts - 1) {
        console.warn(`Gemini key [${currentIndex}] rate limited, rotating to next key...`);
        getNextClient();
        continue;
      }
      throw err;
    }
  }
}

export default getCurrentClient();
