/* ============================================ 
TABLA DE CONTENIDO - BASICO.JS 
============================================ 
1. MODO DÍA/NOCHE
2. CURSOR PERSONALIZADO
3. BACK TO TOP
4. CHAT IA - Funcionalidad completa
============================================ */

// ============================================ 
// 1. MODO DÍA/NOCHE
// ============================================ 
(function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) return;
  
  const sunIcon = darkModeToggle.querySelector('.sun-icon');
  const moonIcon = darkModeToggle.querySelector('.moon-icon');
  
  // Verificar preferencia guardada
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
  }
  
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('darkMode', 'enabled');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      localStorage.setItem('darkMode', 'disabled');
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  });
})();

// ============================================ 
// 2. CURSOR PERSONALIZADO 
// ============================================

const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

if (cursorDot && cursorRing) {

  let mouseX = 0;
  let mouseY = 0;

  let ringX = 0;
  let ringY = 0;

  // Movimiento del mouse
  document.addEventListener('mousemove', (e) => {

    mouseX = e.clientX;
    mouseY = e.clientY;

    // Punto central
    cursorDot.style.transform =
      `translate(${mouseX - 4}px, ${mouseY - 4}px)`;

  });

  // Animación suave del anillo
  function animateCursor() {

    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    cursorRing.style.transform =
      `translate(${ringX - 17}px, ${ringY - 17}px)`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Elementos interactivos
  const hoverElements = document.querySelectorAll(
    'a, button, .nav-link, .blog_read, .timeline-link, .hero-btn-primary, .hero-btn-secondary, .back2top'
  );

  hoverElements.forEach(el => {

    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });

  });

}

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
  
  // ===== FUNCIÓN PARA OCULTAR HINT =====
  function hideHint() {
    if (chatHint && !isChatOpen) {
      chatHint.style.opacity = '0';
      chatHint.style.visibility = 'hidden';
      chatHint.style.pointerEvents = 'none';
    }
  }
  
  // ===== FUNCIÓN PARA MOSTRAR HINT =====
  function showHint() {
    if (chatHint && !isChatOpen) {
      chatHint.style.opacity = '1';
      chatHint.style.visibility = 'visible';
      chatHint.style.pointerEvents = 'auto';
      chatHint.style.transform = 'translateY(0) scale(1)';
    }
  }
  
  // ===== FUNCIÓN PARA RESETEAR HINT =====
  function resetHint() {
    if (chatHint) {
      chatHint.removeAttribute('style');
    }
  }
  
  // ===== HOVER DEL BOTÓN =====
  chatFab.addEventListener('mouseenter', () => {
    if (!isChatOpen) showHint();
  });
  
  chatFab.addEventListener('mouseleave', () => {
    if (!isChatOpen) hideHint();
  });
  
  // ===== HOVER DEL HINT =====
  if (chatHint) {
    chatHint.addEventListener('mouseenter', () => {
      if (!isChatOpen) showHint();
    });
    
    chatHint.addEventListener('mouseleave', () => {
      if (!isChatOpen) hideHint();
    });
  }
  
  // ===== ABRIR CHAT =====
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
  
  // ===== CERRAR CHAT =====
  function closeChat() {
    if (chatOverlay) {
      chatOverlay.classList.add('hidden');
      chatOverlay.classList.remove('flex');
      
      setTimeout(() => {
        isChatOpen = false;
        resetHint();
        setTimeout(() => {
          if (chatFab.matches(':hover') && !isChatOpen) {
            showHint();
          }
        }, 50);
      }, 150);
    }
  }
  
  if (chatClose) {
    chatClose.addEventListener('click', closeChat);
  }
  
  if (chatOverlay) {
    chatOverlay.addEventListener('click', (e) => {
      if (e.target === chatOverlay) closeChat();
    });
  }
  
  // ===== FUNCIÓN GLOBAL PARA ENVIAR MENSAJES =====
  window.enviarMensaje = function() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Mensaje del usuario
    const userMsg = document.createElement('div');
    userMsg.className = 'max-w-[85%] rounded-2xl bg-black text-white px-4 py-2 ml-auto mb-2';
    userMsg.textContent = message;
    chatMessages.appendChild(userMsg);
    
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Indicador de escritura
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'max-w-[85%] rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2 mb-2';
    typingIndicator.innerHTML = '<span class="inline-block animate-pulse">●</span> <span class="inline-block animate-pulse" style="animation-delay:0.2s">●</span> <span class="inline-block animate-pulse" style="animation-delay:0.4s">●</span>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Respuesta simulada
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
        respuesta = `✨ ¡Hola! Para más información sobre "${message}", escríbenos por <strong>WhatsApp al 55 6744 9830</strong>. ¿Necesitas algo más?`;
      }
      
      botMsg.innerHTML = respuesta;
      chatMessages.appendChild(botMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1200);
  };
})();

// ===== INICIALIZAR REVEAL AL SCROLL =====
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