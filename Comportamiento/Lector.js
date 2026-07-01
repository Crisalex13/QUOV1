/* ============================================ 
   LECTOR.JS - QUOV IA
   ============================================ 
   1. CONFIGURACIÓN DE PDF.JS
   2. VARIABLES GLOBALES
   3. DROP ZONE Y CARGA DE PDF
   4. RENDERIZADO DE PDF
   5. EXTRACCIÓN DE TEXTO + DETECCIÓN DE CAPÍTULOS
   6. SUBRAYADO AUTOMÁTICO SOBRE LA PÁGINA
   7. CHAT CON IA
   8. ADJUNTAR IMAGEN A UNA PREGUNTA
   9. SUGERENCIAS Y MENSAJES
   10. QUITAR / CAMBIAR PDF
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
let pageTexts = [];
let chapterMap = [];
let currentFileName = '';
let isProcessing = false;
let chatHistory = [];
let currentPageTextContent = null;
let attachedImage = null;

// Elementos DOM
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const pdfViewer = document.getElementById('pdfViewer');
const pdfContainer = document.getElementById('pdfContainer');
const pdfLoading = document.getElementById('pdfLoading');
const pdfLoadingText = document.getElementById('pdfLoadingText');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const currentBookName = document.getElementById('currentBookName');
const suggestions = document.getElementById('suggestions');

const pdfToolbar = document.getElementById('pdfToolbar');
const pdfToolbarName = document.getElementById('pdfToolbarName');
const pdfToolbarMeta = document.getElementById('pdfToolbarMeta');
const changePdfBtn = document.getElementById('changePdfBtn');
const removePdfBtn = document.getElementById('removePdfBtn');

const attachImageBtn = document.getElementById('attachImageBtn');
const imageInput = document.getElementById('imageInput');
const attachmentPreview = document.getElementById('attachmentPreview');
const attachmentThumb = document.getElementById('attachmentThumb');
const attachmentName = document.getElementById('attachmentName');
const removeAttachmentBtn = document.getElementById('removeAttachmentBtn');

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
    agregarMensaje('ia', '❌ Solo se aceptan archivos PDF.');
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    agregarMensaje('ia', '❌ El archivo supera los 50 MB.');
    return;
  }

  currentFileName = file.name;
  currentBookName.textContent = currentFileName;

  pdfLoadingText.textContent = 'Cargando libro...';
  pdfLoading.classList.add('show');
  pdfViewer.classList.remove('show');
  dropZone.style.display = 'none';
  pdfToolbar.classList.remove('show');

  const reader = new FileReader();
  reader.onload = async function (e) {
    const arrayBuffer = e.target.result;
    try {
      pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      totalPages = pdfDoc.numPages;
      currentPage = 1;

      pdfLoadingText.textContent = 'Leyendo todas las páginas...';
      await extractFullText(pdfDoc);
      detectarCapitulos();

      await renderPage(currentPage);

      pdfLoading.classList.remove('show');
      pdfViewer.classList.add('show');
      updateControls();

      pdfToolbarName.textContent = currentFileName;
      pdfToolbarMeta.textContent = `${totalPages} páginas` + (chapterMap.length ? ` · ${chapterMap.length} capítulos detectados` : '');
      pdfToolbar.classList.add('show');

      chatInput.disabled = false;
      sendBtn.disabled = false;
      attachImageBtn.disabled = false;

      await generarResumenAutomatico();

    } catch (error) {
      console.error('Error al cargar PDF:', error);
      agregarMensaje('ia', '❌ No se pudo cargar el PDF. Verifica que no esté dañado.');
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

  const textContent = await page.getTextContent();
  currentPageTextContent = { items: textContent.items, viewport };

  pdfContainer.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'pdf-page-wrap';
  wrap.appendChild(canvas);

  const hl = document.createElement('div');
  hl.className = 'highlight-layer';
  hl.id = 'highlightLayer';
  wrap.appendChild(hl);

  pdfContainer.appendChild(wrap);

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
// 5. EXTRACCIÓN DE TEXTO + DETECCIÓN DE CAPÍTULOS
// ============================================
async function extractFullText(doc) {
  let text = '';
  pageTexts = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    pageTexts.push(pageText);
    text += `\n--- PÁGINA ${i} ---\n${pageText}\n`;
  }
  fullText = text;
}

function romanoANumero(roman) {
  const valores = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  const s = roman.toUpperCase();
  for (let i = 0; i < s.length; i++) {
    const actual = valores[s[i]];
    const siguiente = valores[s[i + 1]];
    if (!actual) return null;
    if (siguiente && actual < siguiente) total -= actual;
    else total += actual;
  }
  return total || null;
}

function detectarCapitulos() {
  chapterMap = [];
  const regex = /cap[ií]tulo\s+([0-9]+|[ivxlcdm]+)\b/i;

  pageTexts.forEach((texto, idx) => {
    const match = regex.exec(texto);
    if (!match) return;
    let num = parseInt(match[1], 10);
    if (isNaN(num)) num = romanoANumero(match[1]);
    if (!num) return;

    const yaExiste = chapterMap.some(c => c.num === num);
    if (!yaExiste) {
      chapterMap.push({ num, page: idx + 1 });
    }
  });

  chapterMap.sort((a, b) => a.page - b.page);
}

function capituloActualEstimado(pagina) {
  if (chapterMap.length > 0) {
    let ultimo = null;
    for (const c of chapterMap) {
      if (c.page <= pagina) ultimo = c;
      else break;
    }
    return ultimo ? ultimo.num : (chapterMap[0] ? 0 : null);
  }
  return Math.max(1, Math.ceil(pagina / 10));
}

// ============================================
// 6. SUBRAYADO AUTOMÁTICO SOBRE LA PÁGINA
// ============================================
function normalizar(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function subrayarEnPaginaActual(textoBuscado) {
  const layer = document.getElementById('highlightLayer');
  if (!layer || !currentPageTextContent) return false;

  layer.innerHTML = '';

  const { items, viewport } = currentPageTextContent;
  const objetivo = normalizar(textoBuscado);
  if (!objetivo) return false;

  let concat = '';
  const mapaItem = [];
  items.forEach((item, i) => {
    const txt = normalizar(item.str) + ' ';
    for (let c = 0; c < txt.length; c++) mapaItem.push(i);
    concat += txt;
  });

  let inicio = concat.indexOf(objetivo);

  if (inicio === -1) {
    const palabras = objetivo.split(' ').filter(w => w.length > 2).slice(0, 6).join(' ');
    if (palabras) inicio = concat.indexOf(palabras);
  }
  if (inicio === -1) return false;

  const fin = Math.min(inicio + objetivo.length, mapaItem.length - 1);
  const itemsAfectados = new Set();
  for (let i = inicio; i <= fin; i++) {
    if (mapaItem[i] !== undefined) itemsAfectados.add(mapaItem[i]);
  }

  itemsAfectados.forEach(i => {
    const item = items[i];
    const rect = obtenerRectDeItem(item, viewport);
    const mark = document.createElement('div');
    mark.className = 'highlight-mark';
    mark.style.left = rect.left + 'px';
    mark.style.top = rect.top + 'px';
    mark.style.width = rect.width + 'px';
    mark.style.height = rect.height + 'px';
    layer.appendChild(mark);
  });

  return itemsAfectados.size > 0;
}

function obtenerRectDeItem(item, viewport) {
  const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
  const fontHeight = Math.hypot(tx[2], tx[3]);
  const scaleX = Math.hypot(viewport.transform[0], viewport.transform[1]);
  return {
    left: tx[4],
    top: tx[5] - fontHeight,
    width: item.width * scaleX,
    height: fontHeight * 1.15
  };
}

async function irYSubrayar(pagina, texto) {
  if (pagina < 1 || pagina > totalPages) return false;
  if (pagina !== currentPage) {
    await renderPage(pagina);
  }
  return subrayarEnPaginaActual(texto);
}

// ============================================
// 7. CHAT CON IA
// ============================================
sendBtn.addEventListener('click', enviarMensaje);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    enviarMensaje();
  }
});

document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chatInput.value = chip.dataset.text;
    enviarMensaje();
  });
});

async function enviarMensaje() {
  const texto = chatInput.value.trim();
  if ((!texto && !attachedImage) || isProcessing || !fullText) return;

  chatInput.value = '';
  isProcessing = true;
  sendBtn.disabled = true;

  agregarMensajeUsuario(texto, attachedImage);

  const imagenParaEnviar = attachedImage;
  limpiarAdjunto();

  const confirmacion = revisarConfirmacionCapitulo(texto);
  if (confirmacion) {
    agregarMensaje('ia', confirmacion, true);
    isProcessing = false;
    sendBtn.disabled = false;
    chatInput.focus();
    return;
  }

  const loadingId = agregarMensajeLoading();

  try {
    const respuestaCruda = await consultarIA(texto, imagenParaEnviar);
    removerMensajeLoading(loadingId);

    const { textoVisible, accion } = extraerAccionDeSubrayado(respuestaCruda);
    const bubble = agregarMensaje('ia', textoVisible);

    if (accion) {
      const ok = await irYSubrayar(accion.pagina, accion.texto);
      const tag = document.createElement('button');
      tag.className = 'action-tag';
      tag.type = 'button';
      tag.innerHTML = ok
        ? `<i class="fa-solid fa-highlighter"></i> Subrayado en la página ${accion.pagina}`
        : `<i class="fa-solid fa-circle-exclamation"></i> No pude ubicar el texto exacto en la página ${accion.pagina}`;
      tag.addEventListener('click', () => renderPage(accion.pagina));
      bubble.querySelector('.message-bubble').appendChild(tag);
    }

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

function revisarConfirmacionCapitulo(pregunta) {
  const match = /cap[ií]tulo\s+(\d+|[ivxlcdm]+)/i.exec(pregunta);
  if (!match) return null;

  let capituloPedido = parseInt(match[1], 10);
  if (isNaN(capituloPedido)) capituloPedido = romanoANumero(match[1]);
  if (!capituloPedido) return null;

  const capituloActual = capituloActualEstimado(currentPage);
  if (capituloActual !== null && capituloPedido > capituloActual + 1) {
    return `⚠️ ¿Estás seguro? Según tu posición actual (página ${currentPage}) apenas vas como en el capítulo ${capituloActual}.

Te recomiendo seguir leyendo hasta el capítulo ${capituloPedido} para que el resumen tenga sentido y no se te adelanten cosas de la trama.

¿Quieres que te haga mejor un resumen del capítulo ${capituloActual} en su lugar?`;
  }
  return null;
}

function extraerAccionDeSubrayado(respuesta) {
  const regex = /\[HIGHLIGHT\s+p[aá]gina=(\d+)\]([\s\S]*?)\[\/HIGHLIGHT\]/i;
  const match = regex.exec(respuesta);
  if (!match) return { textoVisible: respuesta, accion: null };

  const pagina = parseInt(match[1], 10);
  const texto = match[2].trim();
  const textoVisible = respuesta.replace(match[0], '').trim();
  return { textoVisible, accion: { pagina, texto } };
}

async function consultarIA(pregunta, imagen) {
  const capituloActual = capituloActualEstimado(currentPage);

  const systemPrompt = `Eres QUOV IA, un asistente especializado en análisis literario.
Has leído completamente el libro "${currentFileName}" (${totalPages} páginas).
Tienes acceso a todo el texto del libro, marcado por páginas con el formato "--- PÁGINA N ---".
El lector va actualmente en la página ${currentPage}${capituloActual ? ` (aproximadamente el capítulo ${capituloActual})` : ''}.

REGLAS:
1. Responde siempre en español, de forma clara y útil.
2. Usa el contexto completo del libro para responder.
3. Si preguntan por un capítulo específico, usa el texto de ese capítulo.
4. Si detectas que el usuario pregunta sobre capítulos que aún no ha leído (más allá de su página actual), adviértelo amablemente antes de revelar la trama.
5. Si el usuario te pide SUBRAYAR, MARCAR, RESALTAR o DESTACAR algo (una idea, una frase, "esta página", etc.):
   a) Elige el fragmento EXACTO y literal del libro (cópialo tal cual aparece en el texto, máximo 200 caracteres) que mejor representa lo pedido.
   b) Identifica el número de página donde aparece ese fragmento (usa los marcadores "--- PÁGINA N ---").
   c) Al FINAL de tu respuesta (después de tu explicación normal en lenguaje natural), agrega en una línea aparte, exactamente con este formato:
      [HIGHLIGHT página=N]fragmento exacto del libro[/HIGHLIGHT]
   d) No uses esta etiqueta si el usuario no pidió subrayar/marcar/resaltar nada.
6. Si te envían una imagen junto con la pregunta, analízala como parte del contexto (por ejemplo, una foto de una página, una nota, o algo relacionado con el libro) y respóndela en conjunto con el contenido del libro.
7. Sé detallado y preciso, pero conciso cuando sea posible.`;

  const contenido = [];
  if (imagen) {
    contenido.push({
      type: 'image',
      source: { type: 'base64', media_type: imagen.mediaType, data: imagen.base64 }
    });
  }

  contenido.push({
    type: 'text',
    text: `Pregunta del usuario: "${pregunta || '(el usuario solo envió una imagen, respóndele en relación al libro)'}"

Texto completo del libro:
${fullText}

Responde a la pregunta del usuario basándote en el texto del libro${imagen ? ' y en la imagen adjunta' : ''}.`
  });

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 900,
        system: systemPrompt,
        messages: [{ role: 'user', content: contenido }]
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
// 8. ADJUNTAR IMAGEN A UNA PREGUNTA
// ============================================
attachImageBtn.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    agregarMensaje('ia', '❌ Solo se aceptan imágenes (JPG, PNG, etc.).');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    agregarMensaje('ia', '❌ La imagen supera los 10 MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = ev => {
    attachedImage = {
      base64: ev.target.result.split(',')[1],
      mediaType: file.type,
      name: file.name
    };
    attachmentThumb.src = ev.target.result;
    attachmentName.textContent = file.name;
    attachmentPreview.classList.add('show');
    attachImageBtn.classList.add('active');
  };
  reader.readAsDataURL(file);
  imageInput.value = '';
});

removeAttachmentBtn.addEventListener('click', limpiarAdjunto);

function limpiarAdjunto() {
  attachedImage = null;
  attachmentPreview.classList.remove('show');
  attachmentThumb.src = '';
  attachImageBtn.classList.remove('active');
}

// ============================================
// 9. SUGERENCIAS Y MENSAJES
// ============================================
async function generarResumenAutomatico() {
  const mensajeBienvenida = `📚 He leído completamente "${currentFileName}".

El libro tiene ${totalPages} páginas${chapterMap.length ? ` y detecté ${chapterMap.length} capítulos` : ''}.

¿Qué te gustaría saber?
• Hazme un resumen del capítulo 1
• ¿De qué trata este libro?
• Subraya la idea principal de esta página
• ¿Qué personajes destacan?

¡Pregúntame lo que quieras! 📖`;

  agregarMensaje('ia', mensajeBienvenida);
}

function agregarMensaje(tipo, texto, esConfirmacion) {
  const div = document.createElement('div');
  div.className = `message ${tipo}`;

  let contenido = texto
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  let avatarHtml = '';
  if (tipo === 'user') {
    avatarHtml = `
      <div class="message-avatar">
        <span class="avatar-icon">👤</span>
      </div>
    `;
  } else {
    avatarHtml = `
      <div class="message-avatar">
        <img src="../img/logo.png" alt="QUOV IA" class="avatar-img">
      </div>
    `;
  }

  div.innerHTML = `
    ${avatarHtml}
    <div class="message-bubble${esConfirmacion ? ' confirm-msg' : ''}">${contenido}</div>
  `;

  chatMessages.appendChild(div);
  scrollChat();
  return div;
}

function agregarMensajeUsuario(texto, imagen) {
  const div = document.createElement('div');
  div.className = 'message user';

  let imgHtml = '';
  if (imagen) {
    imgHtml = `<img class="msg-image" src="data:${imagen.mediaType};base64,${imagen.base64}" alt="${imagen.name}" />`;
  }

  const contenido = (texto || '').replace(/\n/g, '<br>');

  div.innerHTML = `
    <div class="message-avatar">
      <span class="avatar-icon">👤</span>
    </div>
    <div class="message-bubble">${imgHtml}${contenido}</div>
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
    <div class="message-avatar">
      <img src="../img/logo.png" alt="QUOV IA" class="avatar-img">
    </div>
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

// ============================================
// 10. QUITAR / CAMBIAR PDF
// ============================================
clearChatBtn.addEventListener('click', () => {
  if (confirm('¿Limpiar toda la conversación?')) {
    chatMessages.innerHTML = '';
    agregarMensaje('ia', '💬 Conversación reiniciada. ¿En qué más puedo ayudarte?');
  }
});

changePdfBtn.addEventListener('click', () => fileInput.click());

removePdfBtn.addEventListener('click', () => {
  if (confirm('¿Quitar este PDF? Perderás el contexto de lectura actual.')) {
    resetLector();
    chatMessages.innerHTML = '';
    agregarMensaje('ia', '📚 PDF eliminado. Sube otro libro cuando quieras y seguimos leyendo juntos.');
  }
});

function resetLector() {
  pdfDoc = null;
  fullText = '';
  pageTexts = [];
  chapterMap = [];
  currentFileName = '';
  currentPageTextContent = null;
  limpiarAdjunto();

  pdfViewer.classList.remove('show');
  pdfLoading.classList.remove('show');
  pdfToolbar.classList.remove('show');
  dropZone.style.display = 'block';
  pdfContainer.innerHTML = '';
  currentBookName.textContent = 'ningún libro';

  chatInput.disabled = true;
  sendBtn.disabled = true;
  attachImageBtn.disabled = true;
  fileInput.value = '';

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