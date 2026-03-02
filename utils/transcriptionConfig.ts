/**
 * Speech-to-Text API Configuration
 * Configure your backend API endpoint and settings here
 */
import {API_ENDPOINTS} from "@/env";

// ===== API CONFIGURATION =====

// Your backend transcription API endpoint
// For development: http://127.0.0.1:8000/chat/transcribe
// For production: https://your-production-api.com/chat/transcribe
export const TRANSCRIPTION_API_ENDPOINT = API_ENDPOINTS.TRANSCRIBE

// Default transcription language
// 'ur' for Urdu
// 'en' for English
export const DEFAULT_LANGUAGE = 'ur';

// Transcription timeout (milliseconds)
export const TRANSCRIPTION_TIMEOUT = 30000; // 30 seconds

// ===== LANGUAGE CONFIGURATION =====

// Supported languages and their codes
export const SUPPORTED_LANGUAGES = {
  'ur': { name: 'Urdu', nativeName: 'اردو' },
  'en': { name: 'English', nativeName: 'English' },
  'hi': { name: 'Hindi', nativeName: 'हिन्दी' },
  'ar': { name: 'Arabic', nativeName: 'العربية' },
  'es': { name: 'Spanish', nativeName: 'Español' },
  'fr': { name: 'French', nativeName: 'Français' },
  'pt': { name: 'Portuguese', nativeName: 'Português' },
  'zh': { name: 'Chinese', nativeName: '中文' },
};

// ===== API HELPER FUNCTIONS =====

/**
 * Send audio file to transcription API
 */
export async function sendAudioToAPI(
  audioBlob: Blob,
  language: string = DEFAULT_LANGUAGE
) {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.m4a');
    formData.append('language', language);

    const response = await fetch(TRANSCRIPTION_API_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Extract transcript from API response
 * Handles both 'transcript' and 'text' fields
 */
export function extractTranscript(apiResponse: any): string | null {
  return apiResponse?.transcript || apiResponse?.text || null;
}

/**
 * Check if API is available
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    // You can modify this to call a health endpoint if your API has one
    const response = await fetch(TRANSCRIPTION_API_ENDPOINT, {
      method: 'OPTIONS',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get language code from locale string
 */
export function getLanguageCode(locale: string): string {
  const localeMap: { [key: string]: string } = {
    'en': 'en',
    'ur': 'ur',
    'hi': 'hi',
    'ar': 'ar',
    'es': 'es',
    'fr': 'fr',
    'pt': 'pt',
    'zh': 'zh',
  };

  return localeMap[locale] || DEFAULT_LANGUAGE;
}

/**
 * Get language display name
 */
export function getLanguageName(code: string): string {
  const lang = SUPPORTED_LANGUAGES[code as keyof typeof SUPPORTED_LANGUAGES];
  return lang?.name || 'Unknown';
}

