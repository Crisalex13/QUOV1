// js/config.js
const CONFIG = {
  API_URL: 'https://quov1.onrender.com/escanear',
  HEALTH_URL: 'https://quov1.onrender.com/health'
};

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}