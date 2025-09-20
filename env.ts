// Environment Configuration
export const ENV = {
  API_BASE_URL: 'https://price-scrapping-api.vercel.app',
  APP_NAME: 'Zabaan-E-Kisaan',
  APP_VERSION: '1.0.0',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  CITIES: `${ENV.API_BASE_URL}/cities`,
  PRICES: `${ENV.API_BASE_URL}/prices`,
  CHAT: `${ENV.API_BASE_URL}/chat`,
} as const;
