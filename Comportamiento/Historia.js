// Back to top button
    const backBtn = document.getElementById('back2Top');
    
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