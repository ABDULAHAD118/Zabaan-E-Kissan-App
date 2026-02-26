// Environment Configuration
export const ENV = {
  // API_BASE_URL: 'http://10.0.2.2:8000',
  // SOCKET_URL:'ws://10.0.2.2:8000',
  API_BASE_URL: 'https://api.zabaan-e-kissan.me',
  SOCKET_URL: 'wss://api.zabaan-e-kissan.me',
  APP_NAME: 'Zabaan-E-Kisaan',
  APP_VERSION: '1.0.0',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  CITIES: `${ENV.API_BASE_URL}/cities`,
  PRICES: `${ENV.API_BASE_URL}/prices`,
  CHAT: `${ENV.API_BASE_URL}/chat`,
  CROPS: `${ENV.API_BASE_URL}/crops`,
} as const;
