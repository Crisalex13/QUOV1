/* ============================================ 
TABLA DE CONTENIDO - BASICO.JS 
============================================ 
1. MODO DÍA/NOCHE
2. CURSOR PERSONALIZADO (basado en app.js)
3. BACK TO TOP
4. CHAT IA - Funcionalidad completa
5. DETECTAR SECCIÓN VISIBLE Y MARCAR PESTAÑA ACTIVA 
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
// 2. CURSOR PERSONALIZADO (VERSIÓN SUAVE - basada en app.js)
// ============================================ 
(function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  
  if (!dot || !ring) return;

  // Detectar si es dispositivo táctil
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    return;
  }

  // Posiciones iniciales
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  // Cambiar color del cursor según el elemento
  function setCursorMode(mode) {
    document.body.classList.toggle('cursor-blue', mode === 'blue');
    document.body.classList.toggle('cursor-white', mode === 'white');
  }

  setCursorMode('blue');

  // Mover el punto (sigue inmediatamente al mouse)
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Usamos left/top para el punto (más suave)
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';

    // Detectar el color del cursor según el elemento debajo
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

    // Efecto hover en elementos interactivos
    const interactive = target.closest('a, button, input, textarea, [data-id], .search-bar-pro, #chatFab, #chatHint, .nav-link, .back2top, .accordion-btn, .btn-more, .btn-badge, .catalog-btn, .blog_read, .timeline-link, .team-card, .book-card, .featured-card');
    document.body.classList.toggle('cursor-hover', !!interactive);
  });

  // Salir del hover si el mouse sale de la ventana
  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-hover');
  });

  // Animar el anillo (efecto suave con requestAnimationFrame)
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  console.log('✨ Cursor personalizado (versión suave) activado');
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
// 4. CHAT IA - Funcionalidad completa
// ============================================ 
(function initChat() {
  const chatFab = document.getElementById('chatFab');
  const chatHint = document.getElementById('chatHint');
  const chatOverlay = document.getElementById('chatOverlay');
  const chatClose = document.getElementById('chatClose');
  
  if (!chatFab) return;
  
  let isChatOpen = false;
  
  function hideHint() {
    if (chatHint && !isChatOpen) {
      chatHint.style.opacity = '0';
      chatHint.style.visibility = 'hidden';
      chatHint.style.pointerEvents = 'none';
    }
  }
  
  function showHint() {
    if (chatHint && !isChatOpen) {
      chatHint.style.opacity = '1';
      chatHint.style.visibility = 'visible';
      chatHint.style.pointerEvents = 'auto';
      chatHint.style.transform = 'translateY(0) scale(1)';
    }
  }
  
  function resetHint() {
    if (chatHint) chatHint.removeAttribute('style');
  }
  
  chatFab.addEventListener('mouseenter', () => { if (!isChatOpen) showHint(); });
  chatFab.addEventListener('mouseleave', () => { if (!isChatOpen) hideHint(); });
  
  if (chatHint) {
    chatHint.addEventListener('mouseenter', () => { if (!isChatOpen) showHint(); });
    chatHint.addEventListener('mouseleave', () => { if (!isChatOpen) hideHint(); });
  }
  
  chatFab.addEventListener('click', () => {
    if (chatOverlay) {
      isChatOpen = true;
      if (chatHint) {
        chatHint.style.opacity = '0';
        chatHint.style.visibility = 'hidden';
      }
      chatOverlay.classList.remove('hidden');
      chatOverlay.classList.add('flex');
    }
  });
  
  function closeChat() {
    if (chatOverlay) {
      chatOverlay.classList.add('hidden');
      chatOverlay.classList.remove('flex');
      setTimeout(() => {
        isChatOpen = false;
        resetHint();
        setTimeout(() => {
          if (chatFab.matches(':hover') && !isChatOpen) showHint();
        }, 50);
      }, 150);
    }
  }
  
  if (chatClose) chatClose.addEventListener('click', closeChat);
  if (chatOverlay) {
    chatOverlay.addEventListener('click', (e) => {
      if (e.target === chatOverlay) closeChat();
    });
  }
  
  window.enviarMensaje = function() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const userMsg = document.createElement('div');
    userMsg.className = 'max-w-[85%] rounded-2xl bg-black text-white px-4 py-2 ml-auto mb-2';
    userMsg.textContent = message;
    chatMessages.appendChild(userMsg);
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'max-w-[85%] rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2 mb-2';
    typingIndicator.innerHTML = '<span class="inline-block animate-pulse">●</span> <span class="inline-block animate-pulse" style="animation-delay:0.2s">●</span> <span class="inline-block animate-pulse" style="animation-delay:0.4s">●</span>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    setTimeout(() => {
      typingIndicator.remove();
      const botMsg = document.createElement('div');
      botMsg.className = 'max-w-[85%] rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2 mb-2';
      let respuesta = '';
      const msgLower = message.toLowerCase();
      if (msgLower.includes('precio') || msgLower.includes('cuesta')) {
        respuesta = '💰 Los precios de nuestros libros van desde <strong>$150 MXN</strong>. ¿Te gustaría que te comparta el catálogo?';
      } else if (msgLower.includes('disponible') || msgLower.includes('hay')) {
        respuesta = '📚 Para conocer la disponibilidad exacta de un libro, por favor contáctanos por <strong>WhatsApp al 55 6744 9830</strong>.';
      } else if (msgLower.includes('comprar') || msgLower.includes('quiero')) {
        respuesta = '🛍️ ¡Excelente! Para comprar, escríbenos directamente a <strong>WhatsApp: 55 6744 9830</strong>. Te atenderemos enseguida.';
      } else {
        respuesta = '✨ ¡Hola! Para más información sobre "' + message + '", escríbenos por <strong>WhatsApp al 55 6744 9830</strong>. ¿Necesitas algo más?';
      }
      botMsg.innerHTML = respuesta;
      chatMessages.appendChild(botMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1200);
  };
})();

// ===== REVEAL AL SCROLL =====
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
// ===== 5. DETECTAR SECCIÓN VISIBLE Y MARCAR PESTAÑA ACTIVA
// ============================================ 

(function initActiveNavOnScroll() {
  const catalogLink = document.querySelector('a[href="#catalogo"]');
  const destacadosLink = document.querySelector('a[href="#destacados"]');
  
  if (!catalogLink || !destacadosLink) return;
  
  const catalogSection = document.getElementById('catalogo');
  const destacadosSection = document.getElementById('destacados');
  
  function updateActiveNav() {
    const scrollPos = window.scrollY + 150;
    
    if (catalogSection && destacadosSection) {
      const catalogTop = catalogSection.offsetTop;
      const destacadosTop = destacadosSection.offsetTop;
      
      // Si estamos en la sección de destacados (más arriba)
      if (scrollPos >= destacadosTop && scrollPos < catalogTop) {
        destacadosLink.classList.add('active');
        catalogLink.classList.remove('active');
      } 
      // Si estamos en catálogo o más abajo
      else if (scrollPos >= catalogTop) {
        catalogLink.classList.add('active');
        destacadosLink.classList.remove('active');
      }
      // Si estamos al inicio (hero)
      else {
        destacadosLink.classList.remove('active');
        catalogLink.classList.remove('active');
      }
    }
  }
  
  window.addEventListener('scroll', updateActiveNav);
  window.addEventListener('load', updateActiveNav);
  updateActiveNav();
})();