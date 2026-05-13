/* ============================================ 
TABLA DE CONTENIDO - QUIENES SOMOS.JS 
============================================ 
1. CONTADORES ANIMADOS
2. FORMULARIO DE COMENTARIOS
3. EFECTO DE TARJETAS DE EQUIPO
4. ANIMACIÓN AL SCROLL
============================================ */

// ===== 1. CONTADOR ANIMADO =====
const counters = document.querySelectorAll('.timer');
const startCounters = () => {
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-count'));
    let current = parseInt(counter.innerText);
    let increment = Math.ceil(target / 45);
    const updateCount = () => {
      if (current < target) {
        current += increment;
        if (current > target) current = target;
        counter.innerText = current;
        setTimeout(updateCount, 20);
      }
    };
    updateCount();
  });
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { 
      startCounters(); 
      observer.unobserve(entry.target); 
    }
  });
}, { threshold: 0.5 });

const counterSection = document.querySelector('.counter-section');
if (counterSection) observer.observe(counterSection);

// ===== 2. BOTÓN VIEW MORE =====
const viewMoreBtn = document.getElementById('viewMoreBtn');
if (viewMoreBtn) {
  viewMoreBtn.addEventListener('click', () => {
    alert('Más información sobre nuestra filosofía próximamente. ¡Síguenos en redes!');
  });
}

// ===== 3. FORMULARIO DE COMENTARIOS =====
const commentForm = document.getElementById('commentForm');
const commentStatus = document.getElementById('commentMessageStatus');

if (commentForm) {
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('commentName').value;
    const email = document.getElementById('commentEmail').value;
    const mensaje = document.getElementById('commentMessage').value;
    const tipo = document.getElementById('commentType').value;
    
    const tipoTexto = {
      'sugerencia': '📖 Sugerencia de libro',
      'opinion': '⭐ Opinión sobre un libro',
      'recomendacion': '💡 Recomendación para QUOV',
      'otro': '📝 Otro'
    };
    
    commentStatus.style.display = 'block';
    commentStatus.className = 'comment-status';
    commentStatus.textContent = 'Enviando comentario...';
    commentStatus.style.background = '#e2e3e5';
    commentStatus.style.color = '#383d41';
    
    setTimeout(() => {
      commentStatus.className = 'comment-status success';
      commentStatus.textContent = `✅ ¡Gracias ${nombre}! Hemos recibido tu ${tipoTexto[tipo]}. Pronto lo revisaremos.`;
      commentForm.reset();
      setTimeout(() => {
        commentStatus.style.display = 'none';
      }, 5000);
    }, 1000);
  });
}

// ===== 4. EFECTO DE TARJETAS DE EQUIPO =====
document.querySelectorAll('.team-card').forEach(card => {
  card.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    
    const nombre = card.querySelector('.team-info h3 a')?.textContent || 'miembro';
    const nombreLimpio = nombre.toLowerCase().replace(/\s+/g, '-');
    window.open(`perfil-${nombreLimpio}.html`, '_blank');
  });
});

// ===== 5. EFECTO DE ONDA PARA BOTONES =====
document.querySelectorAll('.btn-more, .btn-badge, .catalog-btn, .hero-btn-primary, .hero-btn-secondary, .accordion-btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ===== 6. ANIMACIÓN AL SCROLL =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observerCards = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observerCards.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.team-card, .counter-item, .award-list li, .accordion-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s ease';
  observerCards.observe(el);
});

// ===== 7. ESTILO DEL RIPPLE =====
const style = document.createElement('style');
style.textContent = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('✨ QUOV - Quiénes Somos: Efectos específicos activados');