  // Contador animado
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
        if (entry.isIntersecting) { startCounters(); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    
    const counterSection = document.querySelector('.counter-section');
    if (counterSection) observer.observe(counterSection);

    // Back to top
    const backBtn = document.getElementById('back2Top');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) backBtn.classList.add('show');
      else backBtn.classList.remove('show');
    });
    backBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    // Newsletter
    document.getElementById('newsletterBtn')?.addEventListener('click', function() {
      const email = document.getElementById('newsletterEmail').value;
      if(email && email.includes('@')) {
        alert('¡Gracias por suscribirte! Recibirás nuestras novedades.');
        document.getElementById('newsletterEmail').value = '';
      } else {
        alert('Por favor ingresa un correo válido.');
      }
    });

    // View more button
    document.getElementById('viewMoreBtn')?.addEventListener('click', () => {
      alert('Más información sobre nuestra filosofía próximamente. ¡Síguenos en redes!');
    });