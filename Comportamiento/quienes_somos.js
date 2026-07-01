/* ============================================ 
   TABLA DE CONTENIDO - QUIENES_SOMOS.JS 
   ============================================ 
   1. EFECTO DE TARJETAS DE EQUIPO (Modal de perfil)
   2. ANIMACIÓN AUTOMÁTICA DE TARJETAS MVO
   3. TARJETAS QUOV - CLIC PARA TODOS
   ============================================ */

// 1. EFECTO DE TARJETAS DE EQUIPO 

function openProfile(name, role, img, desc, facebook, instagram, tiktok) {
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileRole').textContent = role;
  document.getElementById('profileImg').src = img;
  document.getElementById('profileDesc').textContent = desc;
  
  const fbLink = document.getElementById('profileFacebook');
  const igLink = document.getElementById('profileInstagram');
  const ttLink = document.getElementById('profileTiktok');
  
  if (fbLink) {
    fbLink.href = facebook || '#';
    fbLink.style.display = facebook ? 'inline-flex' : 'none';
  }
  if (igLink) {
    igLink.href = instagram || '#';
    igLink.style.display = instagram ? 'inline-flex' : 'none';
  }
  if (ttLink) {
    ttLink.href = tiktok || '#';
    ttLink.style.display = tiktok ? 'inline-flex' : 'none';
  }
  
  document.getElementById('profileModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProfile() {
  document.getElementById('profileModal').classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelectorAll('.team-card-new').forEach(card => {
  // Función para abrir el perfil desde la tarjeta
  const openCardProfile = (e) => {
    // Si el clic fue en el botón, no hacemos nada 
    const isButton = e.target.closest('.card-overlay-new span');
    if (!isButton) {
      // Abrimos el perfil desde los datos de la tarjeta
      openProfile(
        card.dataset.name,
        card.dataset.role,
        card.dataset.img,
        card.dataset.desc,
        card.dataset.facebook,
        card.dataset.instagram,
        card.dataset.tiktok
      );
    }
  };
  
  card.addEventListener('click', openCardProfile);
  
  const btn = card.querySelector('.card-overlay-new span');
  if (btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Evita que se dispare el clic de la tarjeta
      openProfile(
        card.dataset.name,
        card.dataset.role,
        card.dataset.img,
        card.dataset.desc,
        card.dataset.facebook,
        card.dataset.instagram,
        card.dataset.tiktok
      );
    });
  }
});

// Cerrar con tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeProfile();
});

// Cerrar modal al hacer clic en el fondo (blur)
document.getElementById('profileBlur')?.addEventListener('click', closeProfile);

console.log('✅ Tarjetas de equipo: modo táctil mejorado');

// ============================================
// 2. ANIMACIÓN AUTOMÁTICA DE TARJETAS MVO (FLIP AUTOMÁTICO + HOVER)
// ============================================

(function initAutoFlipCards() {
  setTimeout(() => {
    const cards = document.querySelectorAll('.mvo-card');
    
    if (!cards.length) return;
    
    // Agregar clase para identificar que tienen animación automática
    cards.forEach(card => {
      card.classList.add('auto-animating');
    });
    
    let currentIndex = 0;
    let isTransitioning = false;
    let autoFlipInterval;
    
    // Detectar si es móvil para ajustar tiempos
    const isMobile = window.innerWidth <= 768;
    const flipDuration = isMobile ? 3000 : 3000; // 3s móvil, 3s escritorio
    const intervalTime = isMobile ? 4000 : 4000; // 4s móvil, 4s escritorio
    
    // Función para voltear una tarjeta específica
    function flipCard(index) {
      if (isTransitioning) return;
      
      const card = cards[index];
      if (!card) return;
      
      isTransitioning = true;
      card.classList.add('flipped');
      
      // Volver a la normal después de flipDuration
      setTimeout(() => {
        card.classList.remove('flipped');
        setTimeout(() => {
          isTransitioning = false;
        }, 300);
      }, flipDuration);
    }
    
    // Función para iniciar la secuencia automática
    function startAutoSequence() {
      if (autoFlipInterval) clearInterval(autoFlipInterval);
      
      autoFlipInterval = setInterval(() => {
        if (isTransitioning) return;
        
        // Voltear la tarjeta actual
        flipCard(currentIndex);
        
        // Avanzar al siguiente índice
        currentIndex = (currentIndex + 1) % cards.length;
      }, intervalTime);
    }
    
    // Iniciar la secuencia
    startAutoSequence();
    
    // Pausar animación al hacer hover (para que el usuario pueda leer)
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        clearInterval(autoFlipInterval);
      });
      
      card.addEventListener('mouseleave', () => {
        startAutoSequence();
      });
    });
    
    // Reajustar tiempos si la pantalla cambia de tamaño
    window.addEventListener('resize', () => {
      const newIsMobile = window.innerWidth <= 768;
      const newFlipDuration = newIsMobile ? 5000 : 4000;
      const newIntervalTime = newIsMobile ? 6000 : 10000;
      
      // Si los tiempos cambiaron, reiniciar la animación
      if ((newIsMobile && !isMobile) || (!newIsMobile && isMobile)) {
        location.reload(); // Recargar para aplicar nuevos tiempos
      }
    });
    
    console.log(`✅ Animación automática activada (${isMobile ? 'Móvil' : 'Escritorio'}: ${flipDuration/1000}s reverso, cada ${intervalTime/1000}s)`);
  }, 500);
})();

// ============================================
// 3. TARJETAS QUOV - CLIC PARA TODOS 
// ============================================

(function initQuovCards() {
  const quovCards = document.querySelectorAll('.quov-card');
  
  if (!quovCards.length) return;
  
  quovCards.forEach(card => {
    card.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Si esta tarjeta ya está activa, la cerramos
      if (this.classList.contains('active')) {
        this.classList.remove('active');
      } else {
        // Cerramos todas las demás tarjetas
        quovCards.forEach(c => c.classList.remove('active'));
        // Abrimos esta
        this.classList.add('active');
      }
    });
  });
  
  // Cerrar todas las tarjetas al hacer clic fuera
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.quov-card')) {
      quovCards.forEach(card => card.classList.remove('active'));
    }
  });
  
  console.log('✅ Tarjetas QUOV: modo clic (mantiene abierto)');
})();
