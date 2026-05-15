/* ============================================ 
TABLA DE CONTENIDO - QUIENES SOMOS.JS 
============================================ 
1. EFECTO DE TARJETAS DE EQUIPO
============================================ */

 // 1. EFECTO DE TARJETAS DE EQUIPO
    // Modal de perfil con redes sociales personalizadas
    function openProfile(name, role, img, desc, facebook, instagram, tiktok) {
      // Datos básicos
      document.getElementById('profileName').textContent = name;
      document.getElementById('profileRole').textContent = role;
      document.getElementById('profileImg').src = img;
      document.getElementById('profileDesc').textContent = desc;
      
      // Redes Sociales
      const fbLink = document.getElementById('profileFacebook');
      const igLink = document.getElementById('profileInstagram');
      const ttLink = document.getElementById('profileTiktok');
      
      // Actualizar Facebook
      if (fbLink) {
        fbLink.href = facebook || '#';
        fbLink.style.display = facebook ? 'inline-flex' : 'none';
      }
      
      // Actualizar Instagram
      if (igLink) {
        igLink.href = instagram || '#';
        igLink.style.display = instagram ? 'inline-flex' : 'none';
      }
      
      // Actualizar TikTok
      if (ttLink) {
        ttLink.href = tiktok || '#';
        ttLink.style.display = tiktok ? 'inline-flex' : 'none';
      }
      
      // Mostrar modal
      document.getElementById('profileModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeProfile() {
      document.getElementById('profileModal').classList.remove('active');
      document.body.style.overflow = '';
    }

    // Asignar evento a los botones "Ver perfil" con todos los datos
    document.querySelectorAll('.team-card-new').forEach(card => {
      const btn = card.querySelector('.card-overlay-new span');
      if (btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
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

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeProfile();
    });