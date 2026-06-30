/* ============================================ 
   ESCANER.JS - QUOV IA
   ============================================ 
   1. DECLARACIÓN DE VARIABLES
   2. DROP ZONE (ARRASTRAR Y SOLTAR)
   3. MANEJO DE ARCHIVOS
   4. VALIDACIONES Y ERRORES
   5. ANIMACIÓN DE PASOS
   6. ESCANEAR DOCUMENTO (API)
   7. MOSTRAR RESULTADOS
   8. COPIAR RESULTADOS
   9. SUGERENCIAS DE PREGUNTAS
   ============================================ */

// ============================================
// 1. DECLARACIÓN DE VARIABLES
// ============================================

const dropZone      = document.getElementById('dropZone');
const fileInput     = document.getElementById('fileInput');
const filePreview   = document.getElementById('filePreview');
const fileNameEl    = document.getElementById('fileName');
const fileSizeEl    = document.getElementById('fileSize');
const fileTypeIcon  = document.getElementById('fileTypeIcon');
const removeBtn     = document.getElementById('removeBtn');
const scanBtn       = document.getElementById('scanBtn');
const questionInput = document.getElementById('questionInput');
const loadingState  = document.getElementById('loadingState');
const resultArea    = document.getElementById('resultArea');
const resultBody    = document.getElementById('resultBody');
const errorBox      = document.getElementById('errorBox');
const errorText     = document.getElementById('errorText');
const copyBtn       = document.getElementById('copyBtn');

let selectedFile = null;
let fileBase64   = null;

// ============================================
// 2. DROP ZONE (ARRASTRAR Y SOLTAR)
// ============================================

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () =>
  dropZone.classList.remove('drag-over')
);

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

// ============================================
// 3. MANEJO DE ARCHIVOS
// ============================================

function iconoPorTipo(type) {
  if (type === 'application/pdf')   return 'fa-regular fa-file-pdf';
  if (type.startsWith('image/'))    return 'fa-regular fa-file-image';
  return 'fa-regular fa-file-lines';
}

function handleFile(file) {
  const validos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'text/plain'];

  if (!validos.includes(file.type)) {
    mostrarError('Formato no soportado. Usa PDF, JPG, PNG o TXT.');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    mostrarError('El archivo supera los 10 MB.');
    return;
  }

  ocultarError();
  selectedFile = file;

  fileNameEl.textContent  = file.name;
  fileSizeEl.textContent  = (file.size / 1024).toFixed(1) + ' KB';
  fileTypeIcon.className  = iconoPorTipo(file.type);
  filePreview.classList.add('show');

  scanBtn.disabled = false;
  resultArea.classList.remove('show');
  loadingState.classList.remove('show');
  ocultarSugerencias();

  const reader = new FileReader();
  reader.onload = e => {
    fileBase64 = e.target.result.split(',')[1];
  };
  reader.readAsDataURL(file);
}

// ============================================
// 4. VALIDACIONES Y ERRORES
// ============================================

function mostrarError(msg) {
  errorText.textContent = msg;
  errorBox.classList.add('show');
}

function ocultarError() {
  errorBox.classList.remove('show');
}

removeBtn.addEventListener('click', () => {
  selectedFile = null;
  fileBase64 = null;
  filePreview.classList.remove('show');
  scanBtn.disabled = true;
  fileInput.value = '';
  resultArea.classList.remove('show');
  ocultarError();
  ocultarSugerencias();
});

// ============================================
// 5. ANIMACIÓN DE PASOS (LOADING)
// ============================================

function animarPasos() {
  const steps = ['step1', 'step2', 'step3', 'step4'];

  steps.forEach((id, index) => {
    const elemento = document.getElementById(id);
    const textoOriginal = elemento.innerText.trim();

    elemento.innerHTML = `<i class="fa-regular fa-circle"></i> ${textoOriginal}`;

    setTimeout(() => {
      elemento.className = 'done';
      elemento.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${textoOriginal}`;
    }, 700 + index * 600);
  });
}

// ============================================
// 6. ESCANEAR DOCUMENTO (API ANTHROPIC)
// ============================================

/**
 * Sistema de prompts para QUOV IA:
 * - Primero detecta si el documento ES un libro.
 * - Si no es un libro, rechaza el análisis con un mensaje claro.
 * - Si sí es un libro, genera reseña completa + responde pregunta del usuario.
 */
scanBtn.addEventListener('click', async () => {
  if (!selectedFile || !fileBase64) return;

  ocultarError();
  scanBtn.disabled = true;
  loadingState.classList.add('show');
  resultArea.classList.remove('show');
  ocultarSugerencias();
  animarPasos();

  try {
    const pregunta = questionInput.value.trim();

    // --- SYSTEM PROMPT ---
    // Le damos instrucciones claras al modelo sobre su rol y restricciones.
    const systemPrompt = `Eres QUOV IA, el asistente especializado en libros de la librería de segunda mano QUOV (Ciudad de México).

TU ÚNICA ESPECIALIDAD SON LOS LIBROS.

REGLAS ESTRICTAS:
1. Primero determina si el documento es un libro (novela, cuento, ensayo, poesía, manual académico, etc.) o un fragmento/extracto de libro.
2. Si el documento NO es un libro (factura, currículum, contrato, artículo de noticias, receta, código, tarea escolar, etc.), responde ÚNICAMENTE con:
   "NO_ES_LIBRO: [motivo breve de por qué no es un libro, máximo 1 oración]"
   No digas nada más en ese caso.
3. Si SÍ es un libro o fragmento de libro, genera el análisis completo en español con el formato indicado.
4. Nunca analices documentos que no sean libros, aunque el usuario insista.
5. Usa texto plano sin markdown pesado. Puedes usar **negrita** para títulos de sección.`;

    // --- USER PROMPT ---
    // Pedimos detección + reseña + respuesta a pregunta del usuario.
    const promptBase = pregunta
      ? `Analiza este documento y haz lo siguiente:

**PASO 1 - VERIFICACIÓN:** ¿Es este documento un libro o fragmento de libro? Si NO lo es, responde solo con "NO_ES_LIBRO: [motivo]".

**PASO 2 - Si SÍ es un libro, genera este análisis completo:**

**📖 Identificación del libro**
- Título (o título probable)
- Autor (si se puede identificar)
- Género literario
- Época o período aproximado

**✍️ Reseña**
Escribe una reseña de 4-6 oraciones que capture la esencia del libro: su atmósfera, estilo narrativo, temas principales y a quién le podría interesar leerlo.

**💡 Ideas y temas clave**
Lista 4-6 ideas, temas o reflexiones centrales del texto.

**⭐ Valoración QUOV**
Dame una valoración del 1 al 5 con una justificación breve (1-2 oraciones) sobre la calidad o relevancia literaria.

**🎯 ¿Para quién es este libro?**
Describe en 2-3 oraciones el perfil del lector ideal.

**❓ Respuesta a tu pregunta**
El usuario preguntó: "${pregunta}"
Responde esta pregunta de forma específica y detallada basándote en el contenido del documento.`

      : `Analiza este documento y haz lo siguiente:

**PASO 1 - VERIFICACIÓN:** ¿Es este documento un libro o fragmento de libro? Si NO lo es, responde solo con "NO_ES_LIBRO: [motivo]".

**PASO 2 - Si SÍ es un libro, genera este análisis completo:**

**📖 Identificación del libro**
- Título (o título probable)
- Autor (si se puede identificar)
- Género literario
- Época o período aproximado

**✍️ Reseña**
Escribe una reseña de 4-6 oraciones que capture la esencia del libro: su atmósfera, estilo narrativo, temas principales y a quién le podría interesar leerlo.

**💡 Ideas y temas clave**
Lista 4-6 ideas, temas o reflexiones centrales del texto.

**⭐ Valoración QUOV**
Dame una valoración del 1 al 5 con una justificación breve (1-2 oraciones) sobre la calidad o relevancia literaria.

**🎯 ¿Para quién es este libro?**
Describe en 2-3 oraciones el perfil del lector ideal.

**📚 Libros similares**
Menciona 2-3 títulos que un lector de este libro también podría disfrutar.`;

    // Construir mensajes según tipo de archivo
    let mensajes;

    if (selectedFile.type.startsWith('image/')) {
      mensajes = [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: selectedFile.type, data: fileBase64 } },
        { type: 'text', text: promptBase }
      ]}];
    } else if (selectedFile.type === 'application/pdf') {
      mensajes = [{ role: 'user', content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } },
        { type: 'text', text: promptBase }
      ]}];
    } else {
      const contenido = decodeURIComponent(escape(atob(fileBase64)));
      mensajes = [{ role: 'user', content: [
        { type: 'text', text: `${promptBase}\n\n---DOCUMENTO---\n${contenido}` }
      ]}];
    }

    // Llamada a la API
    const respuesta = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: systemPrompt,
        messages: mensajes
      })
    });

    const datos = await respuesta.json();
    if (datos.error) throw new Error(datos.error.message);

    const textoAnalisis = (datos.content || []).map(b => b.text || '').join('');

    loadingState.classList.remove('show');

    // ¿Es un libro o no?
    if (textoAnalisis.startsWith('NO_ES_LIBRO:')) {
      const motivo = textoAnalisis.replace('NO_ES_LIBRO:', '').trim();
      mostrarRechazado(motivo, selectedFile.name);
    } else {
      mostrarResultado(textoAnalisis, selectedFile.name);
      mostrarSugerencias(pregunta);
    }

    resultArea.classList.add('show');

  } catch (error) {
    loadingState.classList.remove('show');
    mostrarError('No se pudo procesar el archivo. Verifica tu conexión e inténtalo de nuevo.');
    console.error('Error en escaneo:', error);
  }

  scanBtn.disabled = false;
});

// ============================================
// 7. MOSTRAR RESULTADOS
// ============================================

/**
 * Muestra el análisis completo cuando el documento ES un libro.
 */
function mostrarResultado(texto, nombre) {
  const html = `
    <div class="result-section">
      <div class="result-section-label">Archivo analizado</div>
      <span class="result-tag">
        <i class="fa-regular fa-file" style="margin-right:5px;"></i>${nombre}
      </span>
      <span class="result-tag" style="background:rgba(0,191,255,0.18);">
        <i class="fa-solid fa-book-open" style="margin-right:5px;"></i>Libro detectado ✓
      </span>
    </div>
    <div class="result-section">
      <div class="result-section-label">Análisis de QUOV IA</div>
      <div class="result-highlight">
        ${formatearTexto(texto)}
      </div>
    </div>
  `;
  resultBody.innerHTML = html;
}

/**
 * Muestra un mensaje de rechazo cuando el documento NO es un libro.
 */
function mostrarRechazado(motivo, nombre) {
  const html = `
    <div class="result-section">
      <div class="result-section-label">Archivo analizado</div>
      <span class="result-tag">
        <i class="fa-regular fa-file" style="margin-right:5px;"></i>${nombre}
      </span>
    </div>
    <div class="result-section">
      <div class="result-section-label">Resultado</div>
      <div class="result-highlight result-rechazado">
        <div style="font-size:2rem; margin-bottom:12px;">📚</div>
        <p style="font-weight:700; margin-bottom:8px; color:var(--text-primary);">
          Este documento no es un libro
        </p>
        <p style="color:var(--text-secondary); font-size:0.88rem; margin-bottom:16px;">
          ${motivo}
        </p>
        <p style="color:var(--text-secondary); font-size:0.85rem; line-height:1.6;">
          QUOV IA está especializada exclusivamente en el análisis de libros.<br>
          Sube un libro, novela, ensayo, poemario o cualquier obra literaria para obtener reseñas, resúmenes y más.
        </p>
      </div>
    </div>
  `;
  resultBody.innerHTML = html;
}

/**
 * Formatea el texto aplicando estilos HTML básicos.
 */
function formatearTexto(texto) {
  return texto
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// ============================================
// 8. COPIAR RESULTADOS
// ============================================

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(resultBody.innerText).then(() => {
    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
    copyBtn.style.color = 'var(--quov-blue)';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar';
      copyBtn.style.color = '';
    }, 2200);
  });
});

// ============================================
// 9. SUGERENCIAS DE PREGUNTAS
// ============================================

/**
 * Preguntas sugeridas que el usuario puede hacerle a QUOV IA
 * sobre el libro ya escaneado.
 */
const PREGUNTAS_SUGERIDAS = [
  '¿Cuál es el mensaje principal del libro?',
  '¿Qué simbolismo usa el autor?',
  '¿Cómo termina la historia?',
  '¿Cuáles son los personajes más importantes?',
  '¿Qué época o contexto histórico refleja?',
  '¿Es apto para jóvenes o adultos?',
  '¿Qué hace especial el estilo del autor?',
  '¿Cuánto tiempo lleva leerlo aproximadamente?',
];

function mostrarSugerencias(preguntaActual) {
  // Si ya hay un contenedor, lo eliminamos
  ocultarSugerencias();

  const contenedor = document.createElement('div');
  contenedor.id = 'sugerenciasBox';
  contenedor.className = 'sugerencias-box';
  contenedor.innerHTML = `
    <p class="sugerencias-label">
      <i class="fa-regular fa-lightbulb"></i> Pregúntale más a QUOV IA sobre este libro:
    </p>
    <div class="sugerencias-chips">
      ${PREGUNTAS_SUGERIDAS
        .filter(p => p !== preguntaActual)
        .slice(0, 5)
        .map(p => `<button class="chip-sugerencia" type="button">${p}</button>`)
        .join('')}
    </div>
  `;

  // Insertar debajo del área de resultado
  resultArea.insertAdjacentElement('afterend', contenedor);

  // Al hacer clic en una sugerencia, la pone en el textarea y hace scroll
  contenedor.querySelectorAll('.chip-sugerencia').forEach(btn => {
    btn.addEventListener('click', () => {
      questionInput.value = btn.textContent;
      questionInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      questionInput.focus();
    });
  });
}

function ocultarSugerencias() {
  const existente = document.getElementById('sugerenciasBox');
  if (existente) existente.remove();
}