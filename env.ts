// Environment Configuration
export const ENV = {
    // API_BASE_URL: 'http://192.168.1.11:8000',
    // SOCKET_URL:'ws://192.168.1.11:8000',
    API_BASE_URL: 'https://api.zabaan-e-kissan.me',
    SOCKET_URL: 'wss://api.zabaan-e-kissan.me',
    APP_NAME: 'Zabaan-E-Kisaan',
    APP_VERSION: '1.0.0',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    CITIES: `${ENV.API_BASE_URL}/crop/cities`,
    PRICES: `${ENV.API_BASE_URL}/crop/prices`,
    CHAT: `${ENV.API_BASE_URL}/chat`,
    TRANSCRIBE: `${ENV.API_BASE_URL}/transcribe`,
    CROPS: `${ENV.API_BASE_URL}/crop/crops`,
    PREDICT: `${ENV.API_BASE_URL}/disease/predict`,
    CLASSES: `${ENV.API_BASE_URL}/disease/classes`,
} as const;
