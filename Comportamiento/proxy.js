/* ============================================
   QUOV IA — PROXY SERVIDOR (Node.js)
   ============================================
   Ejecutar con: node proxy.js
   Requiere:     npm install express cors
   ============================================ */

const express = require('express');
const cors    = require('cors');
const https   = require('https');

const app  = express();
const PORT = 3001;

// API KEY 
const ANTHROPIC_API_KEY = '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';

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.post('/escanear', (req, res) => {
  const body = JSON.stringify(req.body);

  const options = {
    hostname: 'api.anthropic.com',
    path:     '/v1/messages',
    method:   'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length':    Buffer.byteLength(body)
    }
  };

  const apiReq = https.request(options, apiRes => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch {
        res.status(500).json({ error: { message: 'Respuesta inválida de la API' } });
      }
    });
  });

  apiReq.on('error', err => {
    console.error('Error proxy:', err.message);
    res.status(500).json({ error: { message: err.message } });
  });

  apiReq.write(body);
  apiReq.end();
});

app.listen(PORT, () => {
  console.log(`✅ QUOV Proxy corriendo en http://localhost:${PORT}`);
  console.log(`   Endpoint: POST http://localhost:${PORT}/escanear`);
});