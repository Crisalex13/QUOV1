/* ============================================ 
TABLA DE CONTENIDO - HISTORIA.JS 
============================================ 
1. EFECTOS DE TIMELINE 
2. ANIMACIONES ESPECÍFICAS DE ARTÍCULOS
============================================ */

// ===== Ejemplo: Efecto de resaltado al hacer clic en timeline =====
const timelineLinks = document.querySelectorAll('.timeline-link');
if (timelineLinks.length > 0) {
  timelineLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Remover clase active de todos
      timelineLinks.forEach(l => l.classList.remove('active'));
      // Agregar clase active al actual
      this.classList.add('active');
      
      // Pequeña animación de scroll suave al destino
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

// ===== Efecto de aparición de artículos al hacer scroll =====
const blogPosts = document.querySelectorAll('.iner_blog');
if (blogPosts.length > 0) {
  const postObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('post-visible');
        postObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  blogPosts.forEach(post => {
    post.style.opacity = '0';
    post.style.transform = 'translateY(30px)';
    post.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    postObserver.observe(post);
  });
}

// Estilo para posts visibles
const style = document.createElement('style');
style.textContent = `
  .iner_blog.post-visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
  .timeline-link.active {
    color: #00BFFF;
    font-weight: bold;
  }
`;
document.head.appendChild(style);

console.log('✨ QUOV - Historia: Efectos específicos activados');