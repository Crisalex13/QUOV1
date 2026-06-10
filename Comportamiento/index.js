/* ============================================
   TABLA DE CONTENIDO - INICIO.JS
   ============================================
   1. ANIMACIÓN DE ESTRELLAS (TESTIMONIOS)
   2. EFECTO PARALLAX EN HERO
   3. OBSERVADOR DE ANIMACIONES AL SCROLL
   4. EFECTO GLOW EN BOTONES
   ============================================ */

// ========== 1. ANIMACIÓN DE ESTRELLAS (TESTIMONIOS) ==========
/**
 * Efecto de escala progresiva en las estrellas al hacer hover
 * Cada estrella se escala de forma secuencial (efecto ola)
 */
function initStarAnimation() {
  const starContainers = document.querySelectorAll('.stars');
  
  starContainers.forEach(container => {
    const stars = container.querySelectorAll('.fa-star');
    
    // Mouse enter - animación progresiva
    container.addEventListener('mouseenter', () => {
      stars.forEach((star, index) => {
        setTimeout(() => {
          star.style.transform = 'scale(1.2)';
          star.style.transition = 'transform 0.2s ease';
        }, index * 50);
      });
    });
    
    // Mouse leave - resetear animación
    container.addEventListener('mouseleave', () => {
      stars.forEach(star => {
        star.style.transform = 'scale(1)';
      });
    });
  });
}

// ========== 2. EFECTO PARALLAX EN HERO ==========
/**
 * Efecto de movimiento suave del fondo del hero al hacer scroll
 * El fondo se mueve más lento que el contenido
 */
function initParallaxEffect() {
  const heroSection = document.querySelector('.hero-simple');
  
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      heroSection.style.backgroundPosition = `center ${scrolled * 0.3}px`;
    });
  }
}

// ========== 3. OBSERVADOR DE ANIMACIONES AL SCROLL ==========
/**
 * Anima los elementos cuando entran en el viewport
 * Usa Intersection Observer para detectar cuándo son visibles
 */
function initScrollObserver() {
  const observerOptions = {
    threshold: 0.2,           // 20% del elemento visible
    rootMargin: '0px 0px -50px 0px'  // Margen negativo para activar antes
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Activar animación cuando el elemento es visible
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target); // Dejar de observar después de animar
      }
    });
  }, observerOptions);
  
  // Elementos a observar
  const elementsToAnimate = document.querySelectorAll('.feature-card, .testimonial-card');
  
  elementsToAnimate.forEach(el => {
    // Configurar estado inicial (oculto)
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ========== 4. EFECTO GLOW EN BOTONES ==========
/**
 * Asegura transiciones suaves en los botones principales
 * Mejora la experiencia de hover
 */
function initButtonEffects() {
  const btns = document.querySelectorAll('.btn-primary, .btn-inicio');
  
  btns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'all 0.3s ease';
    });
  });
}
