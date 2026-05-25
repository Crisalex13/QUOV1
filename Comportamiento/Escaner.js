/* ============================================ 
   ESCANER.JS - QUOV IA
   ============================================ 
   1. DECLARACIÓN DE VARIABLES
   2. DROP ZONE (ARRASTRAR Y SOLTAR)
   3. MANEJO DE ARCHIVOS
   4. VALIDACIONES Y ERRORES
   5. ANIMACIÓN DE PASOS
   6. ESCANEAR DOCUMENTO (API)   <--- le cambias aqui para el chat ia propio
   7. MOSTRAR RESULTADOS
   8. COPIAR RESULTADOS
   ============================================ */

// ============================================
// 1. DECLARACIÓN DE VARIABLES
// ============================================

// Elementos del DOM
const dropZone      = document.getElementById('dropZone');      // Área de arrastrar archivo
const fileInput     = document.getElementById('fileInput');     // Input oculto para seleccionar archivo
const filePreview   = document.getElementById('filePreview');   // Contenedor de vista previa
const fileNameEl    = document.getElementById('fileName');      // Nombre del archivo
const fileSizeEl    = document.getElementById('fileSize');      // Tamaño del archivo
const fileTypeIcon  = document.getElementById('fileTypeIcon');  // Ícono según tipo de archivo
const removeBtn     = document.getElementById('removeBtn');     // Botón para eliminar archivo
const scanBtn       = document.getElementById('scanBtn');       // Botón para escanear
const questionInput = document.getElementById('questionInput'); // Input de pregunta opcional
const loadingState  = document.getElementById('loadingState');  // Estado de carga
const resultArea    = document.getElementById('resultArea');    // Área de resultados
const resultBody    = document.getElementById('resultBody');    // Cuerpo del resultado
const errorBox      = document.getElementById('errorBox');      // Caja de errores
const errorText     = document.getElementById('errorText');     // Texto del error
const copyBtn       = document.getElementById('copyBtn');       // Botón para copiar

// Variables de estado
let selectedFile = null;   // Archivo seleccionado actualmente
let fileBase64   = null;   // Archivo convertido a base64

// ============================================
// 2. DROP ZONE (ARRASTRAR Y SOLTAR)
// ============================================

// Click en drop zone abre selector de archivos
dropZone.addEventListener('click', () => fileInput.click());

// Cuando el archivo pasa sobre el área
dropZone.addEventListener('dragover', e => { 
  e.preventDefault();           // Previene comportamiento por defecto
  dropZone.classList.add('drag-over');  // Añade clase visual
});

// Cuando el archivo sale del área
dropZone.addEventListener('dragleave', () => 
  dropZone.classList.remove('drag-over')
);

// Cuando se suelta el archivo
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

// Cuando se selecciona archivo desde el input
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

// ============================================
// 3. MANEJO DE ARCHIVOS
// ============================================

/**
 * Obtiene el ícono correspondiente según el tipo de archivo
 * @param {string} type - Tipo MIME del archivo
 * @returns {string} Clase del ícono de Font Awesome
 */
function iconoPorTipo(type) {
  if (type === 'application/pdf')   return 'fa-regular fa-file-pdf';
  if (type.startsWith('image/'))    return 'fa-regular fa-file-image';
  return 'fa-regular fa-file-lines';
}

/**
 * Procesa el archivo seleccionado
 * - Valida formato y tamaño
 * - Muestra preview
 * - Convierte a base64
 * @param {File} file - Archivo a procesar
 */
function handleFile(file) {
  // Formatos permitidos
  const validos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'text/plain'];
  
  // Validar formato
  if (!validos.includes(file.type)) { 
    mostrarError('Formato no soportado. Usa PDF, JPG, PNG o TXT.'); 
    return; 
  }
  
  // Validar tamaño (máximo 10 MB)
  if (file.size > 10 * 1024 * 1024) { 
    mostrarError('El archivo supera los 10 MB.'); 
    return; 
  }

  // Limpiar errores y guardar archivo
  ocultarError();
  selectedFile = file;
  
  // Actualizar vista previa
  fileNameEl.textContent  = file.name;
  fileSizeEl.textContent  = (file.size / 1024).toFixed(1) + ' KB';
  fileTypeIcon.className  = iconoPorTipo(file.type);
  filePreview.classList.add('show');
  
  // Habilitar botón de escanear y limpiar estados anteriores
  scanBtn.disabled = false;
  resultArea.classList.remove('show');
  loadingState.classList.remove('show');

  // Convertir archivo a base64 para enviar a la API
  const reader = new FileReader();
  reader.onload = e => { 
    fileBase64 = e.target.result.split(',')[1];  // Elimina el prefijo "data:...;base64,"
  };
  reader.readAsDataURL(file);
}

// ============================================
// 4. VALIDACIONES Y ERRORES
// ============================================

/**
 * Muestra un mensaje de error
 * @param {string} msg - Mensaje de error a mostrar
 */
function mostrarError(msg) { 
  errorText.textContent = msg; 
  errorBox.classList.add('show'); 
}

/**
 * Oculta el mensaje de error
 */
function ocultarError() { 
  errorBox.classList.remove('show'); 
}

// Eliminar archivo seleccionado
removeBtn.addEventListener('click', () => {
  selectedFile = null;
  fileBase64 = null;
  filePreview.classList.remove('show');
  scanBtn.disabled = true;
  fileInput.value = '';
  resultArea.classList.remove('show');
  ocultarError();
});

// ============================================
// 5. ANIMACIÓN DE PASOS (LOADING)
// ============================================

/**
 * Anima los pasos del proceso de escaneo
 * Cada paso se marca como "completado" con un delay progresivo
 */
function animarPasos() {
  const steps = ['step1', 'step2', 'step3', 'step4'];
  
  steps.forEach((id, index) => {
    const elemento = document.getElementById(id);
    const textoOriginal = elemento.innerText.trim();
    
    // Resetear estado del paso
    elemento.innerHTML = `<i class="fa-regular fa-circle"></i> ${textoOriginal}`;
    
    // Marcar como completado después de un delay
    setTimeout(() => {
      elemento.className = 'done';
      elemento.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${textoOriginal}`;
    }, 700 + index * 600);  // 700ms, 1300ms, 1900ms, 2500ms
  });
}

// ============================================
// 6. ESCANEAR DOCUMENTO (API ANTHROPIC)
// ============================================

/**
 * Envía el documento a la API de Anthropic (Claude)
 * y procesa la respuesta
 */
scanBtn.addEventListener('click', async () => {
  // Validar que haya un archivo seleccionado
  if (!selectedFile || !fileBase64) return;
  
  // Preparar UI para el proceso
  ocultarError();
  scanBtn.disabled = true;
  loadingState.classList.add('show');
  resultArea.classList.remove('show');
  animarPasos();

  try {
    // Obtener pregunta opcional del usuario
    const pregunta = questionInput.value.trim();
    
    // Construir prompt según si hay pregunta o no
    const promptBase = pregunta
      ? `Analiza este documento y responde específicamente: "${pregunta}"\n\nAdemás incluye: tema principal, resumen breve (3-4 oraciones) e ideas clave.`
      : `Analiza este documento y proporciona:\n1. Título o tema principal\n2. Resumen (3-5 oraciones)\n3. Ideas clave (3-5 puntos)\n4. Tipo/género del documento`;

    // Construir mensajes según el tipo de archivo
    let mensajes;
    
    if (selectedFile.type.startsWith('image/')) {
      // Caso: Imagen
      mensajes = [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: selectedFile.type, data: fileBase64 } },
        { type: 'text', text: promptBase }
      ]}];
    } 
    else if (selectedFile.type === 'application/pdf') {
      // Caso: PDF
      mensajes = [{ role: 'user', content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileBase64 } },
        { type: 'text', text: promptBase }
      ]}];
    } 
    else {
      // Caso: TXT - decodificar y enviar como texto plano
      const contenido = decodeURIComponent(escape(atob(fileBase64)));
      mensajes = [{ role: 'user', content: [
        { type: 'text', text: `${promptBase}\n\n---DOCUMENTO---\n${contenido}` }
      ]}];
    }

    // Llamar a la API de Anthropic (Claude)
    const respuesta = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',        // Modelo de IA
        max_tokens: 1000,                         // Máximo de tokens en respuesta
        system: 'Eres QUOV IA, asistente especializado en análisis de documentos y libros de QUOV. Responde siempre en español. Sé claro, estructurado y útil. Usa texto plano sin markdown pesado.',
        messages: mensajes
      })
    });

    const datos = await respuesta.json();
    
    // Manejar errores de la API
    if (datos.error) throw new Error(datos.error.message);

    // Extraer texto de la respuesta
    const textoAnalisis = (datos.content || []).map(bloque => bloque.text || '').join('');
    
    // Ocultar loading y mostrar resultados
    loadingState.classList.remove('show');
    mostrarResultado(textoAnalisis, selectedFile.name);
    resultArea.classList.add('show');

  } 
  catch (error) {
    // Manejar errores (conexión, API, etc.)
    loadingState.classList.remove('show');
    mostrarError('No se pudo procesar el archivo. Verifica tu conexión e inténtalo de nuevo.');
    console.error('Error en escaneo:', error);
  }

  // Reactivar botón
  scanBtn.disabled = false;
});

// ============================================
// 7. MOSTRAR RESULTADOS
// ============================================

/**
 * Renderiza el resultado del análisis en el DOM
 * @param {string} texto - Texto del análisis
 * @param {string} nombre - Nombre del archivo
 */
function mostrarResultado(texto, nombre) {
  const html = `
    <div class="result-section">
      <div class="result-section-label">Archivo analizado</div>
      <span class="result-tag">
        <i class="fa-regular fa-file" style="margin-right:5px;"></i>${nombre}
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
 * Formatea el texto del análisis aplicando estilos HTML
 * - Convierte **texto** en <strong>texto</strong>
 * - Convierte *texto* en <em>texto</em>
 * - Convierte dobles saltos de línea en párrafos
 * - Convierte saltos de línea en <br>
 * @param {string} texto - Texto sin formato
 * @returns {string} Texto formateado con HTML
 */
function formatearTexto(texto) {
  return texto
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')   // Negrita
    .replace(/\*(.*?)\*/g, '<em>$1</em>')               // Cursiva
    .replace(/\n\n/g, '</p><p>')                        // Párrafos
    .replace(/\n/g, '<br>');                            // Saltos de línea
}

// ============================================
// 8. COPIAR RESULTADOS
// ============================================

/**
 * Copia el contenido del resultado al portapapeles
 * Muestra feedback visual temporal
 */
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(resultBody.innerText).then(() => {
    // Cambiar texto y color del botón temporalmente
    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
    copyBtn.style.color = 'var(--quov-blue)';
    
    // Restaurar después de 2.2 segundos
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar';
      copyBtn.style.color = '';
    }, 2200);
  });
});

