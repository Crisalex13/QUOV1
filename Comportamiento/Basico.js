/* ============================================ 
TABLA DE CONTENIDO - BASICO.JS 
============================================ 
1. MODO DÍA/NOCHE
2. CURSOR PERSONALIZADO
3. BACK TO TOP
4. REVEAL AL SCROLL
5. EFECTO LATERAL AUTOMÁTICO
6. NAVLINK ACTIVO PARA CATÁLOGO Y DESTACADOS
7. MENÚ HAMBURGUESA PARA MÓVILES
============================================ */

// ============================================ 
// 1. MODO DÍA/NOCHE
// ============================================ 
(function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) return;
  
  const sunIcon = darkModeToggle.querySelector('.sun-icon');
  const moonIcon = darkModeToggle.querySelector('.moon-icon');
  
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
  }
  
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    if (sunIcon) sunIcon.style.display = isDark ? 'none' : 'block';
    if (moonIcon) moonIcon.style.display = isDark ? 'block' : 'none';
  });
})();

// ============================================ 
// 2. CURSOR PERSONALIZADO
// ============================================ 
(function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  
  if (!dot || !ring) return;

  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  function setCursorMode(mode) {
    document.body.classList.toggle('cursor-blue', mode === 'blue');
    document.body.classList.toggle('cursor-white', mode === 'white');
  }

  setCursorMode('blue');

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';

    const target = document.elementFromPoint(mouseX, mouseY);
    if (!target) return;

    let mode = 'blue';
    if (target.closest('[data-cursor="blue"]')) {
      mode = 'blue';
    } else if (target.closest('[data-cursor="white"]')) {
      mode = 'white';
    } else if (target.closest('.hero-section')) {
      mode = 'white';
    } else {
      mode = 'blue';
    }
    setCursorMode(mode);

    const interactive = target.closest('a, button, input, textarea, .search-bar-pro, #chatFab, #chatHint, .nav-link, .back2top, .catalog-btn');
    document.body.classList.toggle('cursor-hover', !!interactive);
  });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-hover');
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  console.log('✨ Cursor personalizado activado');
})();

// ============================================ 
// 3. BACK TO TOP
// ============================================ 
(function initBackToTop() {
  const back2top = document.getElementById('back2Top');
  if (!back2top) return;
  
  function toggleBackToTop() {
    if (window.scrollY > 300) {
      back2top.classList.add('show');
    } else {
      back2top.classList.remove('show');
    }
  }
  
  window.addEventListener('scroll', toggleBackToTop);
  toggleBackToTop();
  
  back2top.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ============================================ 
// 4. REVEAL AL SCROLL
// ============================================ 
(function initRevealOnScroll() {
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length === 0) return;
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealElements.forEach(el => revealObserver.observe(el));
})();

// ============================================ 
// 5. EFECTO LATERAL AUTOMÁTICO
// ============================================ 
(function initSideEffect() {
  setTimeout(() => {
    const productOverlay = document.getElementById('productOverlay');
    const chatOverlay = document.getElementById('chatOverlay');
    
    if (!productOverlay || !chatOverlay) {
      console.log('⚠️ Modales no encontrados');
      return;
    }
    
    function aplicarEfectoLateral() {
      const isProductVisible = productOverlay && 
        !productOverlay.classList.contains('hidden') && 
        productOverlay.style.display !== 'none';
      
      const isChatVisible = chatOverlay && 
        !chatOverlay.classList.contains('hidden') && 
        chatOverlay.style.display !== 'none';
      
      if (isProductVisible && isChatVisible && window.innerWidth >= 1024) {
        productOverlay.classList.add('side-docked');
        chatOverlay.classList.add('chat-side-mode');
        console.log('✅ Efecto lateral activado');
      } else {
        productOverlay.classList.remove('side-docked');
        chatOverlay.classList.remove('chat-side-mode');
      }
    }
    
    const observer = new MutationObserver(() => {
      setTimeout(aplicarEfectoLateral, 50);
    });
    
    observer.observe(productOverlay, { attributes: true, attributeFilter: ['class'] });
    observer.observe(chatOverlay, { attributes: true, attributeFilter: ['class'] });
    
    window.addEventListener('resize', () => {
      setTimeout(aplicarEfectoLateral, 100);
    });
    
    document.addEventListener('click', () => {
      setTimeout(aplicarEfectoLateral, 100);
    });
    
    setTimeout(aplicarEfectoLateral, 500);
    
    console.log('✅ Efecto lateral automático activado');
  }, 100);
})();

// ============================================ 
// 6. NAVLINK ACTIVO PARA CATÁLOGO Y DESTACADOS
// ============================================ 
(function initActiveNavLink() {
  // Seleccionar TODOS los links (escritorio + móvil)
  const catalogoLinks = document.querySelectorAll('[data-section="catalogo"]');
  const destacadosLinks = document.querySelectorAll('[data-section="destacados"]');
  
  // Si no existen estos elementos, salir
  if (catalogoLinks.length === 0 || destacadosLinks.length === 0) return;
  
  // Función para activar Catálogo en TODOS los links
  function activateCatalogo() {
    catalogoLinks.forEach(link => link.classList.add('active'));
    destacadosLinks.forEach(link => link.classList.remove('active'));
    localStorage.setItem('activeSection', 'catalogo');
  }
  
  // Función para activar Destacados en TODOS los links
  function activateDestacados() {
    destacadosLinks.forEach(link => link.classList.add('active'));
    catalogoLinks.forEach(link => link.classList.remove('active'));
    localStorage.setItem('activeSection', 'destacados');
  }
  
  // Función para actualizar según scroll o hash
  function updateActiveFromScroll() {
    const hash = window.location.hash;
    const scrollPosition = window.scrollY + 150;
    const catalogoSection = document.getElementById('catalogo');
    const destacadosSection = document.getElementById('destacados');
    
    // Prioridad 1: Hash en URL
    if (hash === '#destacados') {
      activateDestacados();
      return;
    } else if (hash === '#catalogo') {
      activateCatalogo();
      return;
    }
    
    // Prioridad 2: Scroll position (si no hay hash)
    if (catalogoSection && destacadosSection) {
      const catalogoTop = catalogoSection.offsetTop;
      const destacadosTop = destacadosSection.offsetTop;
      
      if (scrollPosition >= destacadosTop - 100) {
        activateDestacados();
      } else if (scrollPosition >= catalogoTop - 100) {
        activateCatalogo();
      }
    }
  }
  
  // Evento click para CADA link de Catálogo
  catalogoLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      activateCatalogo();
      
      const target = document.getElementById('catalogo');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      history.pushState(null, null, '#catalogo');
      
      // Cerrar menú móvil
      const mobileMenu = document.getElementById('mobileMenu');
      if (mobileMenu) mobileMenu.classList.remove('active');
    });
  });
  
  // Evento click para CADA link de Destacados
  destacadosLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      activateDestacados();
      
      const target = document.getElementById('destacados');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      history.pushState(null, null, '#destacados');
      
      // Cerrar menú móvil
      const mobileMenu = document.getElementById('mobileMenu');
      if (mobileMenu) mobileMenu.classList.remove('active');
    });
  });
  
  // Escuchar eventos
  window.addEventListener('hashchange', updateActiveFromScroll);
  window.addEventListener('scroll', updateActiveFromScroll);
  
  // Estado inicial
  const initialHash = window.location.hash;
  const savedSection = localStorage.getItem('activeSection');
  
  if (initialHash === '#destacados') {
    activateDestacados();
  } else if (initialHash === '#catalogo') {
    activateCatalogo();
  } else if (savedSection === 'destacados') {
    activateDestacados();
  } else {
    activateCatalogo();
  }
  
  setTimeout(updateActiveFromScroll, 100);
  
  console.log('✅ NavLinks de Catálogo/Destacados activados (responsive)');
})();

// ============================================ 
// 7. MENÚ HAMBURGUESA PARA MÓVILES
// ============================================ 
(function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (!menuToggle || !mobileMenu) return;
  
  // Abrir/cerrar menú al hacer clic
  menuToggle.addEventListener('click', function() {
    mobileMenu.classList.toggle('active');
  });
  
  // Cerrar menú al hacer clic en un enlace
  const mobileLinks = mobileMenu.querySelectorAll('.nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
    });
  });
  
  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', function(event) {
    if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
      mobileMenu.classList.remove('active');
    }
  });
  
  console.log('✅ Menú hamburguesa activado');
})();