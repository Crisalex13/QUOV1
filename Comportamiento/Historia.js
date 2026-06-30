/* ============================================
   HISTORIA.JS - QUOV
   ============================================
   1. SECCIÓN HISTORIA (Reveal on Scroll)
   2. TIMELINE (Navegación suave)
   3. LIBRO INTERACTIVO MEJORADO
   4. ESTILOS DINÁMICOS
   ============================================ */

// ============================================
// 1. SECCIÓN HISTORIA - REVEAL ON SCROLL
// ============================================
(function initReveal() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
  console.log('✅ Reveal observer inicializado');
})();

// ============================================
// 2. TIMELINE - NAVEGACIÓN SUAVE
// ============================================
(function initTimeline() {
  const timelineLinks = document.querySelectorAll('.timeline-link');
  
  if (timelineLinks.length === 0) return;

  timelineLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Remover clase active de todos los enlaces
      timelineLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Navegación suave
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }
    });
  });

  console.log('✅ Timeline inicializado');
})();

// ============================================
// 3. LIBRO INTERACTIVO MEJORADO
// ============================================
(function initInteractiveBook() {
  // Elementos del DOM
  const book = document.getElementById('interactiveBook');
  const bookCover = document.getElementById('bookCover');
  const controls = document.getElementById('bookControls');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnClose = document.getElementById('btnCloseBook');
  const indicator = document.getElementById('pageIndicator');
  
  // Páginas del libro
  const allPages = Array.from(document.querySelectorAll('#interactiveBook .page-enhanced'));
  const totalPages = allPages.length;
  
  // Validar elementos necesarios
  if (totalPages === 0 || !bookCover || !controls) {
    console.warn('⚠️ Elementos del libro no encontrados');
    return;
  }

  // Estado del libro
  let isOpen = false;
  let currentPage = 0;
  let isAnimating = false;

  // ============================================
  // FUNCIONES DEL LIBRO
  // ============================================

  /**
   * Actualiza el indicador de página
   */
  function updateIndicator() {
    if (!indicator) return;
    
    if (isOpen) {
      indicator.innerHTML = `
        <span class="indicator-icon">📖</span>
        <span class="indicator-text">Página ${currentPage + 1} de ${totalPages}</span>
      `;
    } else {
      indicator.innerHTML = `
        <span class="indicator-icon">📖</span>
        <span class="indicator-text">Cerrado</span>
      `;
    }
  }

  /**
   * Muestra una página específica
   * @param {number} pageIndex - Índice de la página a mostrar
   */
  function showPage(pageIndex) {
    for (let i = 0; i < totalPages; i++) {
      const page = allPages[i];
      if (!page) continue;
      
      if (i === pageIndex) {
        // Página actual - visible
        page.classList.remove('turned');
        page.style.display = 'block';
        page.style.zIndex = '20';
        page.style.opacity = '1';
      } else if (i < pageIndex) {
        // Páginas anteriores - volteadas
        page.classList.add('turned');
        page.style.display = 'block';
        page.style.zIndex = '10';
        page.style.opacity = '1';
      } else {
        // Páginas siguientes - ocultas
        page.classList.remove('turned');
        page.style.display = 'none';
        page.style.zIndex = '5';
        page.style.opacity = '0';
      }
    }
    
    // Actualizar estado de botones
    if (btnPrev) btnPrev.disabled = (pageIndex === 0);
    if (btnNext) btnNext.disabled = (pageIndex === totalPages - 1);
    
    updateIndicator();
  }

  /**
   * Abre el libro
   */
  function openBook() {
    if (isOpen || isAnimating) return;
    isOpen = true;
    
    // Voltear portada
    bookCover.style.transform = 'rotateY(-180deg)';
    
    // Mostrar controles
    if (controls) controls.classList.add('visible');
    if (btnClose) btnClose.disabled = false;
    
    // Mostrar todas las páginas
    for (let i = 0; i < totalPages; i++) {
      const page = allPages[i];
      if (page) {
        page.style.display = 'block';
        page.style.opacity = '1';
      }
    }
    
    showPage(currentPage);
  }

  /**
   * Cierra el libro
   */
  function closeBook() {
    if (!isOpen || isAnimating) return;
    isAnimating = true;
    
    currentPage = 0;
    
    // Mostrar todas las páginas temporalmente
    for (let i = 0; i < totalPages; i++) {
      const page = allPages[i];
      if (page) {
        page.style.display = 'block';
        page.style.opacity = '1';
      }
    }
    
    const turnedPages = allPages.filter(p => p && p.classList.contains('turned'));
    
    if (turnedPages.length === 0) {
      // Cerrar directamente si no hay páginas volteadas
      bookCover.style.transform = 'rotateY(0deg)';
      if (controls) controls.classList.remove('visible');
      if (btnClose) btnClose.disabled = true;
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = true;
      isOpen = false;
      isAnimating = false;
      updateIndicator();
    } else {
      // Voltear páginas de vuelta una por una
      turnedPages.forEach((page, idx) => {
        setTimeout(() => {
          if (page) page.classList.remove('turned');
        }, idx * 60);
      });
      
      // Finalizar cierre
      setTimeout(() => {
        bookCover.style.transform = 'rotateY(0deg)';
        if (controls) controls.classList.remove('visible');
        if (btnClose) btnClose.disabled = true;
        if (btnPrev) btnPrev.disabled = true;
        if (btnNext) btnNext.disabled = true;
        isOpen = false;
        isAnimating = false;
        
        // Ocultar páginas excepto la primera
        for (let i = 1; i < totalPages; i++) {
          const page = allPages[i];
          if (page) {
            page.style.display = 'none';
            page.style.opacity = '0';
          }
        }
        if (allPages[0]) {
          allPages[0].style.display = 'block';
          allPages[0].style.opacity = '1';
        }
        updateIndicator();
      }, turnedPages.length * 60 + 100);
    }
  }

  /**
   * Avanza a la siguiente página
   */
  function nextPage() {
    if (!isOpen || isAnimating || currentPage >= totalPages - 1) return;
    
    isAnimating = true;
    
    const currentPageElement = allPages[currentPage];
    if (currentPageElement) {
      currentPageElement.classList.add('turned');
    }
    
    setTimeout(() => {
      currentPage++;
      showPage(currentPage);
      isAnimating = false;
    }, 300);
  }

  /**
   * Retrocede a la página anterior
   */
  function prevPage() {
    if (!isOpen || isAnimating || currentPage <= 0) return;
    
    isAnimating = true;
    
    const newPage = currentPage - 1;
    const prevPageElement = allPages[newPage];
    if (prevPageElement) {
      prevPageElement.classList.remove('turned');
    }
    
    setTimeout(() => {
      currentPage = newPage;
      showPage(currentPage);
      isAnimating = false;
    }, 300);
  }

  // ============================================
  // EVENTOS DEL LIBRO
  // ============================================

  // Click en portada para abrir
  if (bookCover) {
    bookCover.addEventListener('click', openBook);
  }

  // Botones de navegación
  if (btnNext) btnNext.addEventListener('click', nextPage);
  if (btnPrev) btnPrev.addEventListener('click', prevPage);
  if (btnClose) btnClose.addEventListener('click', closeBook);

  // Navegación por teclado
  document.addEventListener('keydown', function(e) {
    if (!isOpen) return;
    
    switch(e.key) {
      case 'ArrowRight':
        e.preventDefault();
        nextPage();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevPage();
        break;
      case 'Escape':
        e.preventDefault();
        closeBook();
        break;
    }
  });

  // ============================================
  // INICIALIZACIÓN DEL LIBRO
  // ============================================

  function initBook() {
    for (let i = 0; i < totalPages; i++) {
      const page = allPages[i];
      if (!page) continue;
      
      if (i === 0) {
        // Primera página visible
        page.classList.remove('turned');
        page.style.display = 'block';
        page.style.zIndex = '20';
        page.style.opacity = '1';
      } else {
        // Resto de páginas ocultas
        page.classList.add('turned');
        page.style.display = 'none';
        page.style.zIndex = '10';
        page.style.opacity = '0';
      }
    }
    
    // Estado inicial de botones
    if (btnPrev) btnPrev.disabled = true;
    if (btnNext) btnNext.disabled = true;
    if (btnClose) btnClose.disabled = true;
    
    updateIndicator();
  }

  initBook();
  console.log('✅ Libro interactivo mejorado de QUOV inicializado');

})();

// ============================================
// 4. ESTILOS DINÁMICOS
// ============================================
(function injectDynamicStyles() {
  const dynamicStyles = document.createElement('style');
  dynamicStyles.textContent = `
    /* Estilos para timeline activo */
    .timeline-link.active {
      color: #00BFFF;
      font-weight: bold;
    }
    
    /* Estilos para chat overlay */
    .chat-overlay.flex {
      display: flex !important;
    }
    
    .chat-overlay.hidden {
      display: none !important;
    }
    
    /* Estilos para páginas del libro en modo oscuro */
    body.dark-mode .page-enhanced {
      background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
    }
    
    body.dark-mode .page-title-enhanced {
      color: #e8d5b7;
    }
    
    body.dark-mode .page-body {
      color: #cbd5e1;
    }
    
    body.dark-mode .page-number-enhanced {
      color: #4DCFFF;
    }
    
    body.dark-mode .author-name-enhanced {
      color: #e8d5b7;
    }
    
    body.dark-mode .author-bio-enhanced {
      color: #94a3b8;
    }
    
    body.dark-mode .page-indicator-enhanced {
      color: #cbd5e1;
      background: rgba(255,255,255,0.06);
      border-color: rgba(255,255,255,0.06);
    }
  `;
  document.head.appendChild(dynamicStyles);
  console.log('✅ Estilos dinámicos inyectados');
})();

// ============================================
// 5. INICIALIZACIÓN GLOBAL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 QUOV - Historia cargada correctamente');
});