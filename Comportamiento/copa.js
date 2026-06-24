(function() {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    canvas.width = 780;
    canvas.height = 440;

    // ---------- CONSTANTES ----------
    const W = 780, H = 440;
    const CX = W / 2;      // 390
    const CY = H / 2;      // 220

    // Posición de las líneas (ajustadas ligeramente hacia arriba para mejor equilibrio visual)
    const GOLD_Y  = CY - 14;
    const WHITE_Y = CY + 2;

    // Escala de la copa (ligeramente reducida para dar más espacio)
    const CUP_SCALE = 0.68;
    
    // RANGO DE LÍNEAS
    const LINE_START_X = -480;
    const LINE_END_X   = W + 480;
    const TRAIL_LEN = 580;
    
    // ---------- EASING ----------
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
    const easeInCubic = t => t * t * t;
    const easeInOutQuad = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const easeOutBack = t => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    const easeOutElastic = t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    
    // ---------- DIBUJO DE LA COPA ----------
    function traceTrophyPath(ctx) {
      ctx.beginPath();
      ctx.moveTo(-62, -88);
      ctx.quadraticCurveTo(-58, -30, -38, 5);
      ctx.quadraticCurveTo(0, 18, 38, 5);
      ctx.quadraticCurveTo(58, -30, 62, -88);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-62, -88);
      ctx.lineTo(62, -88);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-56, -72);
      ctx.bezierCurveTo(-100, -90, -105, -20, -60, -10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(56, -72);
      ctx.bezierCurveTo(100, -90, 105, -20, 60, -10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-22, 8);
      ctx.lineTo(-16, 38);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(22, 8);
      ctx.lineTo(16, 38);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-32, 38);
      ctx.lineTo(32, 38);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-32, 38); ctx.lineTo(-40, 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(32, 38); ctx.lineTo(40, 50); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-40, 50);
      ctx.lineTo(40, 50);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-40, 50); ctx.lineTo(-50, 62); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, 50); ctx.lineTo(50, 62); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-50, 62);
      ctx.lineTo(50, 62);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-50, 62); ctx.lineTo(-50, 74); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(50, 62); ctx.lineTo(50, 74); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-50, 74);
      ctx.lineTo(50, 74);
      ctx.stroke();
    }

    function drawTrophy(alpha, fillT, sparkT, extraGlow = 0) {
      ctx.save();
      ctx.translate(CX, CY - 22);
      ctx.scale(CUP_SCALE, CUP_SCALE);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (extraGlow > 0.2) {
        ctx.shadowColor = '#FFCC66';
        ctx.shadowBlur = 28 + 12 * Math.sin(Date.now() * 0.012);
      } else {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 16;
      }
      
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3.4;
      traceTrophyPath(ctx);

      ctx.strokeStyle = 'rgba(255, 250, 200, 0.8)';
      ctx.lineWidth = 1.4;
      ctx.shadowBlur = 9;
      traceTrophyPath(ctx);
      
      if (fillT > 0.008) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(-62, -88);
        ctx.quadraticCurveTo(-58, -30, -38, 5);
        ctx.quadraticCurveTo(0, 20, 38, 5);
        ctx.quadraticCurveTo(58, -30, 62, -88);
        ctx.closePath();
        ctx.clip();

        const topY = -88;
        const bottomY = 8;
        const curTop = lerp(bottomY, topY, fillT);
        const gradFill = ctx.createLinearGradient(0, bottomY, 0, curTop);
        gradFill.addColorStop(0, 'rgba(200, 100, 10, 0.98)');
        gradFill.addColorStop(0.5, 'rgba(255, 170, 30, 0.95)');
        gradFill.addColorStop(1, 'rgba(255, 215, 70, 0.85)');
        ctx.fillStyle = gradFill;
        ctx.shadowBlur = 22;
        ctx.shadowColor = '#FFAA33';
        ctx.globalAlpha = alpha * 0.97;
        ctx.fillRect(-65, curTop, 130, bottomY - curTop);
        ctx.restore();
      }

      ctx.restore();
    }
    
    // ---------- ESTRELLAS DECORATIVAS ENCIMA DE LA COPA ----------
    function drawStarsAroundCup(sparkT, cupAlpha) {
      if (sparkT <= 0.05 || cupAlpha < 0.5) return;
      
      ctx.save();
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.015);
      const intensity = Math.min(sparkT * 1.2, 1) * cupAlpha;
      ctx.globalAlpha = intensity * 0.85;
      ctx.shadowBlur = 14;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Posiciones relativas a la copa (coordenadas canvas)
      const cupCenterX = CX;
      const cupCenterY = CY - 22;
      
      // Estrellas girando alrededor de la copa
      const time = Date.now() * 0.003;
      const starCount = 16;
      
      for (let i = 0; i < starCount; i++) {
        const angle = time + (i / starCount) * Math.PI * 2;
        const radius = 52 + Math.sin(time * 2 + i) * 8;
        const x = cupCenterX + Math.cos(angle) * radius;
        const y = cupCenterY - 15 + Math.sin(angle) * radius * 0.7;
        
        const size = 10 + Math.sin(time * 3 + i) * 3;
        const colors = ['#FFE55C', '#FFD700', '#FFF4B0', '#FFCC55', '#FFE8A5'];
        const color = colors[i % colors.length];
        
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.font = `${size}px "Segoe UI", "Arial", sans-serif`;
        ctx.fillText('✦', x, y);
      }
      
      // Estrellas adicionales aleatorias alrededor
      for (let i = 0; i < 12; i++) {
        const angle2 = time * 1.5 + i * 0.8;
        const radius2 = 68 + Math.sin(time * 1.2 + i) * 10;
        const x = cupCenterX + Math.cos(angle2) * radius2;
        const y = cupCenterY - 20 + Math.sin(angle2 * 1.2) * radius2 * 0.6;
        const size = 8 + Math.sin(time * 4 + i) * 2;
        ctx.fillStyle = '#FFEC80';
        ctx.font = `${size}px "Segoe UI", "Arial", sans-serif`;
        ctx.fillText('✦', x, y);
      }
      
      // Chispitas pequeñas (puntos brillantes)
      ctx.globalAlpha = intensity * 0.6;
      for (let i = 0; i < 24; i++) {
        const angle3 = time * 2 + i * 0.5;
        const radius3 = 40 + Math.sin(time * 3 + i) * 12;
        const x = cupCenterX + Math.cos(angle3) * radius3;
        const y = cupCenterY - 18 + Math.sin(angle3 * 1.5) * radius3 * 0.5;
        ctx.fillStyle = `hsl(${45 + i * 15}, 100%, 65%)`;
        ctx.font = `6px sans-serif`;
        ctx.fillText('•', x, y);
      }
      
      ctx.restore();
    }

    // ---------- LÍNEAS ----------
    function drawLines(lineProgress) {
      const frontX = lerp(LINE_START_X, LINE_END_X, clamp(lineProgress));
      
      const goldStart = frontX - TRAIL_LEN;
      const goldEnd   = frontX;
      
      const goldGrad = ctx.createLinearGradient(goldStart, 0, goldEnd, 0);
      goldGrad.addColorStop(0,    'rgba(255, 200, 20, 0)');
      goldGrad.addColorStop(0.2,  'rgba(255, 210, 30, 0.55)');
      goldGrad.addColorStop(0.6,  '#FFDD66');
      goldGrad.addColorStop(0.85, '#FFE88C');
      goldGrad.addColorStop(1,    'rgba(255, 230, 100, 0.4)');
      
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 4.5;
      ctx.shadowColor = '#FFCC44';
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.moveTo(goldStart, GOLD_Y);
      ctx.lineTo(goldEnd, GOLD_Y);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(255, 250, 170, 0.9)';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(Math.max(goldStart, goldEnd - 130), GOLD_Y);
      ctx.lineTo(goldEnd, GOLD_Y);
      ctx.stroke();
      
      const OFFSET = 38;
      const whiteStart = frontX - TRAIL_LEN - OFFSET;
      const whiteEnd   = frontX - OFFSET;
      
      const whiteGrad = ctx.createLinearGradient(whiteStart, 0, whiteEnd, 0);
      whiteGrad.addColorStop(0,    'rgba(160, 210, 255, 0)');
      whiteGrad.addColorStop(0.2,  'rgba(170, 220, 255, 0.6)');
      whiteGrad.addColorStop(0.6,  '#C5E5FF');
      whiteGrad.addColorStop(0.85, '#E9F4FF');
      whiteGrad.addColorStop(1,    'rgba(210, 235, 255, 0.45)');
      
      ctx.strokeStyle = whiteGrad;
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#AADDFF';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(whiteStart, WHITE_Y);
      ctx.lineTo(whiteEnd, WHITE_Y);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(255, 255, 250, 0.95)';
      ctx.lineWidth = 1.3;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(Math.max(whiteStart, whiteEnd - 85), WHITE_Y);
      ctx.lineTo(whiteEnd, WHITE_Y);
      ctx.stroke();
      
      ctx.restore();
    }
    
    // ---------- TEXTO PRINCIPAL QUOV (SIN CUADRO DE FONDO) ----------
    function drawQuovTitle(cupAlpha, intensity) {
      let quovAlpha = clamp(cupAlpha * 0.9 + intensity * 0.2, 0.2, 0.98);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 52px "Inter", system-ui, "Segoe UI", monospace`;
      ctx.globalAlpha = quovAlpha;
      
      // Contorno oscuro grueso (sin fondo de rectángulo)
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#0a0e1a';
      ctx.strokeText("Q U O V", CX, CY - 125);
      
      // Texto dorado brillante
      ctx.fillStyle = "#FFE484";
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#FFB347";
      ctx.fillText("Q U O V", CX, CY - 125);
      ctx.restore();
    }
    
    // ---------- TEXTO CON FONDO Y BUENA LEGIBILIDAD (frases inspiradoras) ----------
    function drawStyledText(text, x, y, fontSize, color, shadowColor, alpha) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `600 ${fontSize}px "Inter", system-ui, "Segoe UI", monospace`;
      ctx.globalAlpha = alpha;
      
      // Fondo semitransparente para mejorar legibilidad
      ctx.shadowBlur = 0;
      const textWidth = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(8, 12, 24, 0.7)';
      ctx.fillRect(x - textWidth/2 - 15, y - fontSize/2 - 4, textWidth + 30, fontSize + 8);
      
      // Contorno oscuro
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0a0e1a';
      ctx.strokeText(text, x, y);
      
      // Texto principal con sombra de color
      ctx.fillStyle = color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = shadowColor;
      ctx.fillText(text, x, y);
      ctx.restore();
    }
    
    // ---------- SECUENCIA DE FRASES SIN SUPERPOSICIÓN ----------
    function drawSequentialMessages(cupAlpha, intensity, cyclePhase) {
      if (cupAlpha < 0.2 && intensity < 0.05) return;
      
      // QUOV siempre visible (sin cuadro de fondo)
      drawQuovTitle(cupAlpha, intensity);
      
      // ==============================================
      // FRASE 1: "CRECER ES COMPARTIR SABER · CADA LIBRO SUMA"
      // Aparece entre 0.30 - 0.42, desaparece gradualmente hasta 0.48
      // ==============================================
      let phrase1Alpha = 0;
      if (cyclePhase >= 0.30 && cyclePhase < 0.42) {
        let t = (cyclePhase - 0.30) / 0.12;
        phrase1Alpha = easeOutCubic(Math.min(t, 1));
      } else if (cyclePhase >= 0.42 && cyclePhase < 0.48) {
        phrase1Alpha = 1 - (cyclePhase - 0.42) / 0.06;
        phrase1Alpha = Math.max(0, Math.min(1, phrase1Alpha));
      }
      
      // ==============================================
      // FRASE 2: "EL CONOCIMIENTO TRANSFORMA VIDAS"
      // Aparece entre 0.52 - 0.64, desaparece hasta 0.70
      // ==============================================
      let phrase2Alpha = 0;
      if (cyclePhase >= 0.52 && cyclePhase < 0.64) {
        let t = (cyclePhase - 0.52) / 0.12;
        phrase2Alpha = easeOutCubic(Math.min(t, 1));
      } else if (cyclePhase >= 0.64 && cyclePhase < 0.70) {
        phrase2Alpha = 1 - (cyclePhase - 0.64) / 0.06;
        phrase2Alpha = Math.max(0, Math.min(1, phrase2Alpha));
      }
      
      // ==============================================
      // FRASE 3: "CADA DÍA APRENDEMOS ALGO NUEVO"
      // Aparece entre 0.74 - 0.86, desaparece hasta 0.92
      // ==============================================
      let phrase3Alpha = 0;
      if (cyclePhase >= 0.74 && cyclePhase < 0.86) {
        let t = (cyclePhase - 0.74) / 0.12;
        phrase3Alpha = easeOutCubic(Math.min(t, 1));
      } else if (cyclePhase >= 0.86 && cyclePhase < 0.92) {
        phrase3Alpha = 1 - (cyclePhase - 0.86) / 0.06;
        phrase3Alpha = Math.max(0, Math.min(1, phrase3Alpha));
      }
      
      phrase1Alpha = clamp(phrase1Alpha, 0, 0.96);
      phrase2Alpha = clamp(phrase2Alpha, 0, 0.96);
      phrase3Alpha = clamp(phrase3Alpha, 0, 0.96);
      
      // Dibujar cada frase (todas en la misma posición Y, una por una)
      if (phrase1Alpha > 0.05) {
        drawStyledText("🌱 CRECER ES COMPARTIR SABER · CADA LIBRO SUMA 🌱", 
          CX, CY + 115, 14, "#E8D594", "#D4A030", phrase1Alpha);
      }
      
      if (phrase2Alpha > 0.05) {
        drawStyledText("✨ EL CONOCIMIENTO TRANSFORMA VIDAS ✨", 
          CX, CY + 115, 14, "#AAD4FF", "#3399FF", phrase2Alpha);
      }
      
      if (phrase3Alpha > 0.05) {
        drawStyledText("📚 CADA DÍA APRENDEMOS ALGO NUEVO · SIGAMOS CRECIENDO 📚", 
          CX, CY + 115, 13, "#FFB5A0", "#FF7744", phrase3Alpha);
      }
      
      // Mensaje base sutil cuando no hay frases activas
      let baseAlpha = 0;
      if ((cyclePhase < 0.30 && cyclePhase > 0.20) || 
          (cyclePhase >= 0.48 && cyclePhase < 0.52) ||
          (cyclePhase >= 0.70 && cyclePhase < 0.74) ||
          (cyclePhase >= 0.92 && cyclePhase < 0.98)) {
        baseAlpha = cupAlpha * 0.3;
        baseAlpha = clamp(baseAlpha, 0, 0.4);
        if (baseAlpha > 0.1) {
          ctx.save();
          ctx.globalAlpha = baseAlpha;
          ctx.font = "500 11px monospace";
          ctx.fillStyle = "#A8924F";
          ctx.shadowBlur = 0;
          ctx.textAlign = "center";
          ctx.fillText("CREE & CRECE", CX, CY + 115);
          ctx.restore();
        }
      }
    }
    
    const CYCLE_DURATION = 28000; // 28 segundos
    
    function getAnimationState(relativeTime) {
      let t = (relativeTime % CYCLE_DURATION) / CYCLE_DURATION;
      
      // PROGRESO DE LÍNEAS
      let lineProgress;
      if (t < 0.24) {
        lineProgress = lerp(0, 0.36, easeOutCubic(t / 0.24));
      } 
      else if (t < 0.48) {
        lineProgress = lerp(0.36, 0.47, (t - 0.24) / 0.24);
      }
      else {
        const exitT = (t - 0.48) / 0.52;
        lineProgress = lerp(0.47, 1.0, easeOutCubic(exitT));
      }
      lineProgress = clamp(lineProgress, 0, 1);
      
      // ALFA DE LA COPA
      let cupAlpha = 0;
      if (t >= 0.18 && t < 0.27) {
        cupAlpha = easeOutBack((t - 0.18) / 0.09);
      } 
      else if (t >= 0.27 && t < 0.72) {
        cupAlpha = 1.0;
      }
      else if (t >= 0.72 && t < 0.82) {
        cupAlpha = lerp(1.0, 0, easeInCubic((t - 0.72) / 0.10));
      }
      cupAlpha = clamp(cupAlpha, 0, 1);
      
      // LLENADO
      let fillT = 0;
      if (t >= 0.25 && t < 0.40) {
        fillT = easeOutCubic((t - 0.25) / 0.15);
      }
      else if (t >= 0.40 && t < 0.58) {
        fillT = 1.0;
      }
      else if (t >= 0.58 && t < 0.68) {
        fillT = lerp(1.0, 0, easeInOutQuad((t - 0.58) / 0.10));
      }
      fillT = clamp(fillT, 0, 1);
      
      // DESTELLOS + intensidad
      let sparkT = 0;
      let quovIntensity = 0;
      if (t >= 0.38 && t < 0.64) {
        let peak = (t - 0.38) / 0.26;
        if (peak <= 1) sparkT = easeOutElastic(peak);
        else sparkT = 1 - easeOutCubic((t - 0.64) / 0.1);
        sparkT = clamp(sparkT, 0, 1);
        if (t >= 0.44 && t < 0.64) {
          let sub = (t - 0.44) / 0.20;
          if (sub <= 1) quovIntensity = easeOutBack(sub);
          else quovIntensity = 1 - (t - 0.64) / 0.07;
          quovIntensity = clamp(quovIntensity, 0, 1.2);
        }
        sparkT = Math.min(sparkT * (0.9 + 0.2 * Math.sin(t * 25)), 1);
      }
      
      // Brillo extra
      let extraGlow = 0;
      if (t >= 0.42 && t < 0.64) {
        extraGlow = Math.sin((t - 0.42) / 0.22 * Math.PI) * 0.85;
      }
      
      return { lineProgress, cupAlpha, fillT, sparkT, quovIntensity, extraGlow, cyclePhase: t };
    }
    
    // ---------- FONDO CON ESTRELLAS ----------
    function drawBackground() {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0c1124');
      grad.addColorStop(0.6, '#050814');
      grad.addColorStop(1, '#02040c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      
      for (let i = 0; i < 220; i++) {
        if (i % 3 === 0 && i > 20) continue;
        const brightness = 0.2 + 0.45 * Math.sin(Date.now() * 0.0018 + i * 0.5);
        ctx.fillStyle = `rgba(255, 225, 160, ${brightness * 0.45})`;
        ctx.beginPath();
        ctx.arc( (i * 31) % W, (i * 17 + 13) % H, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#FFDD99';
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc( (i * 73) % W, (i * 41) % H, 2.2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    
    // ---------- LOOP PRINCIPAL ----------
    let startTimestamp = null;
    let animFrame = null;
    
    function animate(nowMs) {
      if (!startTimestamp) startTimestamp = nowMs;
      const elapsed = nowMs - startTimestamp;
      
      const { lineProgress, cupAlpha, fillT, sparkT, quovIntensity, extraGlow, cyclePhase } = getAnimationState(elapsed);
      
      drawBackground();
      drawLines(lineProgress);
      
      if (cupAlpha > 0.01) {
        drawTrophy(cupAlpha, fillT, sparkT, extraGlow);
      }
      
      // ESTRELLAS DECORATIVAS ALREDEDOR DE LA COPA (efecto mágico)
      if (sparkT > 0.2 && cupAlpha > 0.5) {
        drawStarsAroundCup(sparkT, cupAlpha);
      }
      
      // Textos secuenciales (QUOV limpio y frases abajo)
      if (quovIntensity > 0.03 || cupAlpha > 0.25) {
        drawSequentialMessages(cupAlpha, quovIntensity, cyclePhase);
      }
      
      // Resplandor en copa llena
      if (fillT > 0.95 && cupAlpha > 0.9) {
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.filter = 'blur(10px)';
        ctx.fillStyle = '#FFDD88';
        ctx.beginPath();
        ctx.ellipse(CX, CY - 32, 50, 34, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.filter = 'none';
        ctx.restore();
      }
      
      animFrame = requestAnimationFrame(animate);
    }
    
    startTimestamp = null;
    animFrame = requestAnimationFrame(animate);
    
    window.addEventListener('beforeunload', () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    });
  })();