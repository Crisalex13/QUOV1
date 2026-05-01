    // 1 .- Modo Día/Noche
    const darkModeToggle = document.getElementById('darkModeToggle');
    const sunIcon = darkModeToggle.querySelector('.sun-icon');
    const moonIcon = darkModeToggle.querySelector('.moon-icon');
    
    // Verificar preferencia guardada
    if (localStorage.getItem('darkMode') === 'enabled') {
      document.body.classList.add('dark-mode');
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
    
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      } else {
        localStorage.setItem('darkMode', 'disabled');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    });

      // 2 .- ia modo videojuego cambio
    const chatFab = document.getElementById('chatFab');
    const chatHint = document.getElementById('chatHint');
    const chatOverlay = document.getElementById('chatOverlay');
    const chatClose = document.getElementById('chatClose');
    
    // Variable para controlar si el chat está abierto
    let isChatOpen = false;

    // ===== FUNCIÓN PARA OCULTAR HINT (PERO NO PERMANENTEMENTE) =====
    function hideHint() {
      if (chatHint && !isChatOpen) {
        chatHint.style.opacity = '0';
        chatHint.style.visibility = 'hidden';
      }
    }

    function showHint() {
      if (chatHint && !isChatOpen) {
        chatHint.style.opacity = '1';
        chatHint.style.visibility = 'visible';
      }
    }

    // ===== HOVER DEL BOTÓN =====
    chatFab.addEventListener('mouseenter', () => {
      if (!isChatOpen) {
        showHint();
      }
    });

    chatFab.addEventListener('mouseleave', () => {
      if (!isChatOpen) {
        hideHint();
      }
    });

    // ===== HOVER DEL HINT (para que no desaparezca al mover el mouse) =====
    if (chatHint) {
      chatHint.addEventListener('mouseenter', () => {
        if (!isChatOpen) {
          showHint();
        }
      });
      
      chatHint.addEventListener('mouseleave', () => {
        if (!isChatOpen) {
          hideHint();
        }
      });
    }

    // ===== ABRIR CHAT =====
    chatFab.addEventListener('click', () => {
      if (chatOverlay) {
        isChatOpen = true;
        // Ocultar hint completamente mientras el chat está abierto
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
        isChatOpen = false;
        chatOverlay.classList.add('hidden');
        chatOverlay.classList.remove('flex');
        // Restaurar hint solo si el mouse sigue sobre el botón
        setTimeout(() => {
          if (chatFab.matches(':hover') && !isChatOpen) {
            showHint();
          }
        }, 100);
      }
    }

    if (chatClose) {
      chatClose.addEventListener('click', closeChat);
    }

    // Cerrar al hacer clic fuera del modal
    chatOverlay.addEventListener('click', (e) => {
      if (e.target === chatOverlay) {
        closeChat();
      }
    });

    // ===== FUNCIÓN DEL CHAT =====
    function enviarMensaje() {
      const input = document.getElementById('chatInput');
      const message = input.value.trim();
      if (!message) return;
      
      const chatMessages = document.getElementById('chatMessages');
      
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
      
      // Respuesta de IA
      setTimeout(() => {
        typingIndicator.remove();
        const botMsg = document.createElement('div');
        botMsg.className = 'max-w-[85%] rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-4 py-2 mb-2';
        botMsg.innerHTML = `✨ ¡Hola! Para comprar "${message}", escríbenos por WhatsApp al <strong>55 6744 9830</strong>. ¿Necesitas algo más?`;
        chatMessages.appendChild(botMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1200);
    }