/* ============================================ 
   LECTOR.JS - QUOV IA
   ============================================ 
   1. CONFIGURACIÓN DE PDF.JS
   2. VARIABLES GLOBALES
   3. DROP ZONE Y CARGA DE PDF
   4. RENDERIZADO DE PDF
   5. EXTRACCIÓN DE TEXTO COMPLETO
   6. CHAT CON IA
   7. SUGERENCIAS Y RESPUESTAS
   8. LIMPIEZA Y RESET
   ============================================ */

// ============================================
// 1. CONFIGURACIÓN DE PDF.JS
// ============================================
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ============================================
// 2. VARIABLES GLOBALES
// ============================================
let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let fullText = '';
let currentFileName = '';
let isProcessing = false;
let chatHistory = [];

// Elementos DOM
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const pdfViewer = document.getElementById('pdfViewer');
const pdfContainer = document.getElementById('pdfContainer');
const pdfLoading = document.getElementById('pdfLoading');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const currentBookName = document.getElementById('currentBookName');
const suggestions = document.getElementById('suggestions');

// ============================================
// 3. DROP ZONE Y CARGA DE PDF
// ============================================
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) loadPDF(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', e => {
  if (e.target.files[0]) loadPDF(e.target.files[0]);
});

function loadPDF(file) {
  if (file.type !== 'application/pdf') {
    mostrarMensaje('error', '❌ Solo se aceptan archivos PDF.');
    return;
  }
  
  if (file.size > 50 * 1024 * 1024) {
    mostrarMensaje('error', '❌ El archivo supera los 50 MB.');
    return;
  }

  currentFileName = file.name;
  currentBookName.textContent = currentFileName;
  
  // Mostrar loading
  pdfLoading.classList.add('show');
  pdfViewer.classList.remove('show');
  dropZone.style.display = 'none';
  
  const reader = new FileReader();
  reader.onload = async function(e) {
    const arrayBuffer = e.target.result;
    try {
      pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      totalPages = pdfDoc.numPages;
      currentPage = 1;
      
      // Extraer texto completo
      fullText = await extractFullText(pdfDoc);
      
      // Renderizar primera página
      await renderPage(currentPage);
      
      // Actualizar controles
      pdfLoading.classList.remove('show');
      pdfViewer.classList.add('show');
      updateControls();
      
      // Habilitar chat
      chatInput.disabled = false;
      sendBtn.disabled = false;
      
      // Mensaje de bienvenida con resumen automático
      await generarResumenAutomatico();
      
    } catch (error) {
      console.error('Error al cargar PDF:', error);
      mostrarMensaje('error', '❌ No se pudo cargar el PDF. Verifica que no esté dañado.');
      resetLector();
    }
  };
  reader.readAsArrayBuffer(file);
}

// ============================================
// 4. RENDERIZADO DE PDF
// ============================================
async function renderPage(pageNum) {
  if (!pdfDoc) return;
  
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({ canvasContext: context, viewport: viewport }).promise;
  
  // Limpiar y agregar canvas
  pdfContainer.innerHTML = '';
  pdfContainer.appendChild(canvas);
  
  currentPage = pageNum;
  pageInfo.textContent = `Página ${pageNum} de ${totalPages}`;
  updateControls();
}

function updateControls() {
  prevPage.disabled = currentPage <= 1;
  nextPage.disabled = currentPage >= totalPages;
}

prevPage.addEventListener('click', () => {
  if (currentPage > 1) renderPage(currentPage - 1);
});

nextPage.addEventListener('click', () => {
  if (currentPage < totalPages) renderPage(currentPage + 1);
});

// ============================================
// 5. EXTRACCIÓN DE TEXTO COMPLETO
// ============================================
async function extractFullText(doc) {
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    text += `\n--- PÁGINA ${i} ---\n${pageText}\n`;
  }
  return text;
}

// ============================================
// 6. CHAT CON IA
// ============================================
sendBtn.addEventListener('click', enviarMensaje);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    enviarMensaje();
  }
});

// Sugerencias
document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chatInput.value = chip.dataset.text;
    enviarMensaje();
  });
});

async function enviarMensaje() {
  const texto = chatInput.value.trim();
  if (!texto || isProcessing || !fullText) return;
  
  chatInput.value = '';
  isProcessing = true;
  sendBtn.disabled = true;
  
  // Mostrar mensaje del usuario
  agregarMensaje('user', texto);
  
  // Mostrar indicador de escritura
  const loadingId = agregarMensajeLoading();
  
  try {
    const respuesta = await consultarIA(texto);
    removerMensajeLoading(loadingId);
    agregarMensaje('ia', respuesta);
  } catch (error) {
    console.error('Error en IA:', error);
    removerMensajeLoading(loadingId);
    agregarMensaje('ia', '❌ Lo siento, hubo un error al procesar tu pregunta. Inténtalo de nuevo.');
  }
  
  isProcessing = false;
  sendBtn.disabled = false;
  chatInput.focus();
  scrollChat();
}

async function consultarIA(pregunta) {
  // Sistema de detección de capítulos
  const esResumenCapitulo = /resumen del capítulo (\d+)/i.exec(pregunta);
  if (esResumenCapitulo) {
    const capitulo = parseInt(esResumenCapitulo[1]);
    // Verificar si el usuario va en ese capítulo (basado en la página actual)
    if (capitulo > Math.ceil(currentPage / 10) + 1) {
      return `⚠️ ¿Estás seguro? Apenas vas en la página ${currentPage} (aproximadamente capítulo ${Math.ceil(currentPage / 10)}). 
      
Te recomiendo leer primero hasta el capítulo ${capitulo} para que el resumen tenga más sentido.

¿Quieres que te haga un resumen del capítulo ${Math.ceil(currentPage / 10)} en su lugar?`;
    }
  }
  
  // Construir prompt para la IA
  const systemPrompt = `Eres QUOV IA, un asistente especializado en análisis literario. 
Has leído completamente el libro "${currentFileName}". 
Tienes acceso a todo el texto del libro (${fullText.length} caracteres).
Puedes identificar patrones, temas, personajes, estructura narrativa y estilo del autor.

REGLAS:
1. Responde siempre en español.
2. Usa el contexto completo del libro para responder.
3. Si preguntan por un capítulo específico, usa el texto de ese capítulo.
4. Si la pregunta es sobre un tema, busca todas las menciones en el libro.
5. Sé detallado y preciso.
6. Destaca patrones literarios, simbolismos y temas recurrentes.
7. Si detectas que el usuario pregunta sobre capítulos que no ha leído, adviértelo amablemente.`;

  const userPrompt = `Pregunta del usuario: "${pregunta}"

Texto completo del libro:
${fullText}

Responde a la pregunta del usuario basándote en el texto del libro.`;

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return (data.content || []).map(b => b.text || '').join('') || 'No pude generar una respuesta.';
    
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

// ============================================
// 7. SUGERENCIAS Y RESPUESTAS
// ============================================
async function generarResumenAutomatico() {
  const mensajeBienvenida = `📚 He leído completamente "${currentFileName}". 

El libro tiene ${totalPages} páginas.

¿Qué te gustaría saber?
• Hazme un resumen del capítulo 1
• ¿De qué trata este libro?
• ¿Cuáles son los temas principales?
• ¿Qué personajes destacan?

¡Pregúntame lo que quieras! 📖`;

  agregarMensaje('ia', mensajeBienvenida);
}

function agregarMensaje(tipo, texto) {
  const div = document.createElement('div');
  div.className = `message ${tipo}`;
  
  // Procesar formato básico
  let contenido = texto
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '• ');
  
  div.innerHTML = `
    <div class="message-avatar">${tipo === 'user' ? '👤' : '🤖'}</div>
    <div class="message-bubble">${contenido}</div>
  `;
  
  chatMessages.appendChild(div);
  scrollChat();
  return div;
}

function agregarMensajeLoading() {
  const div = document.createElement('div');
  div.className = 'message ia loading-message';
  div.id = 'loadingMsg';
  div.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-bubble">
      <span class="loading-dots">Pensando<span>.</span><span>.</span><span>.</span></span>
    </div>
  `;
  chatMessages.appendChild(div);
  scrollChat();
  return 'loadingMsg';
}

function removerMensajeLoading(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function scrollChat() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function mostrarMensaje(tipo, texto) {
  agregarMensaje(tipo === 'error' ? 'ia' : 'ia', texto);
}

// ============================================
// 8. LIMPIEZA Y RESET
// ============================================
clearChatBtn.addEventListener('click', () => {
  if (confirm('¿Limpiar toda la conversación?')) {
    chatMessages.innerHTML = '';
    agregarMensaje('ia', '💬 Conversación reiniciada. ¿En qué más puedo ayudarte?');
  }
});

function resetLector() {
  pdfDoc = null;
  fullText = '';
  currentFileName = '';
  pdfViewer.classList.remove('show');
  pdfLoading.classList.remove('show');
  dropZone.style.display = 'block';
  pdfContainer.innerHTML = '';
  currentBookName.textContent = 'ningún libro';
  chatInput.disabled = true;
  sendBtn.disabled = true;
  pageInfo.textContent = 'Página 0 de 0';
  prevPage.disabled = true;
  nextPage.disabled = true;
}

// Cargar estilos de loading dots
const style = document.createElement('style');
style.textContent = `
  .loading-dots span {
    animation: dotPulse 1.4s infinite;
    opacity: 0;
  }
  .loading-dots span:nth-child(1) { animation-delay: 0s; }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPulse {
    0%, 60%, 100% { opacity: 0; }
    30% { opacity: 1; }
  }
  .loading-message .message-bubble {
    background: var(--message-ia-bg);
    border: 1px solid var(--border-light);
  }
`;
document.head.appendChild(style);