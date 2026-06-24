/* ============================================
   HISTORIA.JS - QUOV (
   ============================================
   1. SECCIÓN HISTORIA
   2. LIBRO INTERACTIVO 
   3. TIMELINE 
   4. ESTILOS DINÁMICOS
   ============================================ */

// ============================================
// 1. SECCIÓN HISTORIA
// ============================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// ============================================
// 2. TIMELINE 
// ============================================
const timelineLinks = document.querySelectorAll('.timeline-link');
if (timelineLinks.length > 0) {
  timelineLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      timelineLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
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

// ============================================
// 3. LIBRO INTERACTIVO 
// ============================================
(function() {
  const book = document.getElementById('interactiveBook');
  const bookCover = document.getElementById('bookCover');
  const controls = document.getElementById('bookControls');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnClose = document.getElementById('btnCloseBook');
  const indicator = document.getElementById('pageIndicator');
  
  const allPages = Array.from(document.querySelectorAll('#interactiveBook .page'));
  const totalPages = allPages.length;
  
  // Si no hay páginas o elementos del libro, salir
  if (totalPages === 0 || !bookCover || !controls) return;
  
  let isOpen = false;
  let currentPage = 0;
  let isAnimating = false;
  
  function showPage(pageIndex) {
    for (let i = 0; i < totalPages; i++) {
      const page = allPages[i];
      
      if (i === pageIndex) {
        page.classList.remove('turned');
        page.style.display = 'block';
        page.style.zIndex = '20';
      } else if (i < pageIndex) {
        page.classList.add('turned');
        page.style.display = 'block';
        page.style.zIndex = '10';
      } else {
        page.classList.remove('turned');
        page.style.display = 'none';
        page.style.zIndex = '5';
      }
    }
    
    if (indicator) indicator.textContent = `Página ${pageIndex + 1} de ${totalPages}`;
    if (btnPrev) btnPrev.disabled = (pageIndex === 0);
    if (btnNext) btnNext.disabled = (pageIndex === totalPages - 1);
  }
  
  function openBook() {
    if (isOpen || isAnimating) return;
    isOpen = true;
    
    bookCover.style.transform = 'rotateY(-180deg)';
    if (controls) controls.classList.add('visible');
    if (btnClose) btnClose.disabled = false;
    
    showPage(currentPage);
  }
  
  function closeBook() {
    if (!isOpen || isAnimating) return;
    isAnimating = true;
    
    currentPage = 0;
    
    for (let i = 0; i < totalPages; i++) {
      allPages[i].style.display = 'block';
    }
    
    const turnedPages = allPages.filter(p => p.classList.contains('turned'));
    
    if (turnedPages.length === 0) {
      bookCover.style.transform = 'rotateY(0deg)';
      if (controls) controls.classList.remove('visible');
      if (btnClose) btnClose.disabled = true;
      if (indicator) indicator.textContent = 'Cerrado';
      isOpen = false;
      isAnimating = false;
    } else {
      turnedPages.forEach((page, idx) => {
        setTimeout(() => {
          page.classList.remove('turned');
        }, idx * 60);
      });
      
      setTimeout(() => {
        bookCover.style.transform = 'rotateY(0deg)';
        if (controls) controls.classList.remove('visible');
        if (btnClose) btnClose.disabled = true;
        if (btnPrev) btnPrev.disabled = true;
        if (btnNext) btnNext.disabled = true;
        if (indicator) indicator.textContent = 'Cerrado';
        isOpen = false;
        isAnimating = false;
        
        for (let i = 1; i < totalPages; i++) {
          allPages[i].style.display = 'none';
        }
        allPages[0].style.display = 'block';
      }, turnedPages.length * 60 + 100);
    }
  }
  
  function nextPage() {
    if (!isOpen || isAnimating || currentPage >= totalPages - 1) return;
    
    isAnimating = true;
    
    const currentPageElement = allPages[currentPage];
    if (currentPageElement) {
      currentPageElement.classList.add('turned');
    }
    
    setTimeout(() => {
      currentPage++;
      showPage(currentPage);
      isAnimating = false;
    }, 300);
  }
  
  function prevPage() {
    if (!isOpen || isAnimating || currentPage <= 0) return;
    
    isAnimating = true;
    
    const newPage = currentPage - 1;
    const prevPageElement = allPages[newPage];
    if (prevPageElement) {
      prevPageElement.classList.remove('turned');
    }
    
    setTimeout(() => {
      currentPage = newPage;
      showPage(currentPage);
      isAnimating = false;
    }, 300);
  }
  
  // Eventos
  if (bookCover) bookCover.addEventListener('click', openBook);
  if (btnNext) btnNext.addEventListener('click', nextPage);
  if (btnPrev) btnPrev.addEventListener('click', prevPage);
  if (btnClose) btnClose.addEventListener('click', closeBook);
  
  // Inicializar: solo mostrar primera página
  for (let i = 0; i < totalPages; i++) {
    if (i === 0) {
      allPages[i].classList.remove('turned');
      allPages[i].style.display = 'block';
      allPages[i].style.zIndex = '20';
    } else {
      allPages[i].classList.add('turned');
      allPages[i].style.display = 'none';
      allPages[i].style.zIndex = '10';
    }
  }
  
  console.log('✅ Libro interactivo de QUOV inicializado');
})();

// ============================================
// 4. ESTILOS DINÁMICOS
// ============================================
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
  .timeline-link.active {
    color: #00BFFF;
    font-weight: bold;
  }
  
  .chat-overlay.flex {
    display: flex !important;
  }
  
  .chat-overlay.hidden {
    display: none !important;
  }
`;
document.head.appendChild(dynamicStyles);