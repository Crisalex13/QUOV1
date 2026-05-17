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
  const catalogoLink = document.getElementById('catalogoNavLink');
  const destacadosLink = document.getElementById('destacadosNavLink');
  
  // Si no existen estos elementos, salir
  if (!catalogoLink || !destacadosLink) return;
  
  // Función para activar el link correcto según la URL o scroll
  function updateActiveLink() {
    const hash = window.location.hash;
    const scrollPosition = window.scrollY + 150;
    const catalogoSection = document.getElementById('catalogo');
    const destacadosSection = document.getElementById('destacados');
    
    // Primero, verificar por hash en la URL (#catalogo o #destacados)
    if (hash === '#destacados') {
      catalogoLink.classList.remove('active');
      destacadosLink.classList.add('active');
      return;
    } else if (hash === '#catalogo') {
      catalogoLink.classList.add('active');
      destacadosLink.classList.remove('active');
      return;
    }
    
    // Segundo, verificar por scroll (si no hay hash)
    if (catalogoSection && destacadosSection) {
      const destacadosTop = destacadosSection.offsetTop;
      const catalogoTop = catalogoSection.offsetTop;
      
      if (scrollPosition >= destacadosTop && scrollPosition < catalogoTop) {
        catalogoLink.classList.remove('active');
        destacadosLink.classList.add('active');
      } else if (scrollPosition >= catalogoTop) {
        catalogoLink.classList.add('active');
        destacadosLink.classList.remove('active');
      } else {
        catalogoLink.classList.add('active');
        destacadosLink.classList.remove('active');
      }
    }
  }
  
  // Evento click: cambiar manualmente el active y guardar
  function setActiveAndSave(activeLink) {
    catalogoLink.classList.remove('active');
    destacadosLink.classList.remove('active');
    activeLink.classList.add('active');
    localStorage.setItem('activeNavLink', activeLink.id);
  }
  
  catalogoLink.addEventListener('click', function() {
    setActiveAndSave(catalogoLink);
  });
  
  destacadosLink.addEventListener('click', function() {
    setActiveAndSave(destacadosLink);
  });
  
  // Escuchar cambios en el hash
  window.addEventListener('hashchange', updateActiveLink);
  window.addEventListener('scroll', updateActiveLink);
  
  // Restaurar el último estado guardado o usar el hash actual
  const savedActive = localStorage.getItem('activeNavLink');
  const currentHash = window.location.hash;
  
  if (currentHash === '#destacados') {
    destacadosLink.classList.add('active');
    catalogoLink.classList.remove('active');
  } else if (currentHash === '#catalogo') {
    catalogoLink.classList.add('active');
    destacadosLink.classList.remove('active');
  } else if (savedActive === 'destacadosNavLink') {
    destacadosLink.classList.add('active');
    catalogoLink.classList.remove('active');
  } else {
    catalogoLink.classList.add('active');
    destacadosLink.classList.remove('active');
  }
  
  // Ejecutar al cargar
  setTimeout(updateActiveLink, 100);
  
  console.log('✅ NavLinks de Catálogo/Destacados activados');
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