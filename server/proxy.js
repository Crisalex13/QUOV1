// server/proxy.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

// LEER API KEY DESDE VARIABLE DE ENTORNO
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ERROR: Falta ANTHROPIC_API_KEY en .env');
  console.error('   Crea server/.env con: ANTHROPIC_API_KEY=tu-clave');
  process.exit(1);
}

app.use(cors({
  origin: '*',  // Permite cualquier origen (SOLO PARA DESARROLLO)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '20mb' }));

app.post('/escanear', (req, res) => {
  console.log(`📥 Solicitud recibida: ${new Date().toISOString()}`);
  
  if (!req.body) {
    return res.status(400).json({ 
      error: { message: 'Body de la solicitud vacío' } 
    });
  }

  const body = JSON.stringify(req.body);

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => data += chunk);
    apiRes.on('end', () => {
      try {
        const jsonResponse = JSON.parse(data);
        res.json(jsonResponse);
        console.log('✅ Respuesta enviada al cliente');
      } catch (error) {
        console.error('❌ Error al parsear respuesta:', error.message);
        res.status(500).json({ 
          error: { message: 'Respuesta inválida de la API' } 
        });
      }
    });
  });

  apiReq.on('error', (error) => {
    console.error('❌ Error en proxy:', error.message);
    res.status(500).json({ 
      error: { message: error.message } 
    });
  });

  apiReq.write(body);
  apiReq.end();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'QUOV Proxy funcionando correctamente'
  });
});

// Agregar esta ruta para la raíz
app.get('/', (req, res) => {
  res.json({
    message: '✅ QUOV Proxy funcionando correctamente',
    endpoints: {
      health: '/health',
      scan: '/escanear (POST)'
    },
    status: 'OK'
  });
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log(`✅ QUOV Proxy en http://localhost:${PORT}`);
  console.log(`   POST /escanear`);
  console.log(`   GET  /health`);
  console.log('========================================');
});