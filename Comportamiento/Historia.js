// ============================================
// HISTORIA.JS - Back to Top + Cursor Personalizado
// ============================================

// ===== BACK TO TOP BUTTON =====
const backBtn = document.getElementById('back2Top');

if (backBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backBtn.classList.add('show');
    } else {
      backBtn.classList.remove('show');
    }
  });
  
  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== CURSOR PERSONALIZADO =====
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

if (cursorDot && cursorRing) {
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursorDot.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
    
    setTimeout(() => {
      ringX = mouseX;
      ringY = mouseY;
      cursorRing.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
    }, 80);
  });
  
  const hoverElements = document.querySelectorAll('a, button, .nav-link, .blog_read, .timeline-link, .hero-btn-primary, .hero-btn-secondary, .back2top');
  
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });
}