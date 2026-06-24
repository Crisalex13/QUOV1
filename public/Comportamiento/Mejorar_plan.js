/* ============================================
   MEJORAR_PLAN.JS - QUOV IA
   ============================================
   1. MODALES DE PLANES   
   ============================================ */

// ============================================
// 1. MODALES DE PLANES
// ============================================

/*Alterna la visibilidad de la lista de ventajas de un plan*/
function toggleVentajas(btn) {
  const lista = btn.nextElementSibling; // el div.ventajas-inline
  const estaAbierto = lista.classList.contains('abierto');
  const idx = obtenerIndiceTarjeta(btn);
  
  if (estaAbierto) {
    cerrarVentajas(lista, btn, idx);
  } else {
    abrirVentajas(lista, btn, idx);
  }
}

/*Obtiene el índice de la tarjeta actual para asignar el ícono correcto*/
function obtenerIndiceTarjeta(btn) {
  const todasTarjetas = Array.from(document.querySelectorAll('.plan-card'));
  const tarjetaActual = btn.closest('.plan-card');
  return todasTarjetas.indexOf(tarjetaActual);
}

/*Abre la lista de ventajas y actualiza el botón */
function abrirVentajas(lista, btn, idx) {
  const iconosMap = obtenerIconosPorTarjeta();
  
  lista.classList.add('abierto');
  btn.classList.add('abierto');
  
  const span = btn.querySelector('span');
  span.innerHTML = `<i class="${iconosMap[idx]}" style="margin-right:7px;"></i>Ocultar ventajas`;
}

/*Cierra la lista de ventajas y actualiza el botón*/
function cerrarVentajas(lista, btn, idx) {
  const iconosMap = obtenerIconosPorTarjeta();
  
  lista.classList.remove('abierto');
  btn.classList.remove('abierto');
  
  const span = btn.querySelector('span');
  span.innerHTML = `<i class="${iconosMap[idx]}" style="margin-right:7px;"></i>Ver ventajas`;
}

/*Devuelve el mapa de íconos según el tipo de tarjeta */
function obtenerIconosPorTarjeta() {
  return [
    'fa-regular fa-lightbulb',      // Básico
    'fa-regular fa-circle-info',    // Pro
    'fa-regular fa-chart-line'      // Experto
  ];
}

/*Inicializa todos los eventos y configuraciones de la página de planes
 * Se ejecuta automáticamente cuando el DOM está listo*/
function inicializarPlanes() {
  // Verificar que todos los botones tengan la funcionalidad correcta
  const botones = document.querySelectorAll('.btn-ventajas');
  
  if (botones.length > 0) {
    console.log(`✅ Inicializados ${botones.length} planes con ventajas inline`);
  } else {
    console.warn('⚠️ No se encontraron botones de planes en la página');
  }
}
