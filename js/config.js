// public/js/config.js
const CONFIG = {
  // Usar la IP localhost en lugar de 127.0.0.1 para evitar problemas de CORS
  API_URL: 'http://localhost:3001/escanear',
  HEALTH_URL: 'http://localhost:3001/health'
};

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}