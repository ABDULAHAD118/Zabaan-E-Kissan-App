// Environment Configuration
export const ENV = {
  API_BASE_URL: 'http://10.165.44.188:8000',
  APP_NAME: 'Zabaan-E-Kisaan',
  APP_VERSION: '1.0.0',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  CITIES: `${ENV.API_BASE_URL}/cities`,
  PRICES: `${ENV.API_BASE_URL}/prices`,
} as const;
