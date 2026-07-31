// ==========================================
// 💖 APP LOGIC & INTERACTION - HBD SURPRISE WEB APP
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------
  // 1. STATE MANAGEMENT
  // ------------------------------------------
  let currentStage = 1;
  let enteredPasscode = "";
  let currentMemoryIndex = 0;
  let isCakeBlown = false;
  let isAudioPlaying = false;
  let bgmAudio = null;
  let confettiAnimationFrame = null;

  // DOM Elements
  const stages = {
    1: document.getElementById('stage-1'),
    2: document.getElementById('stage-2'),
    3: document.getElementById('stage-3'),
    4: document.getElementById('stage-4')
  };

  // ------------------------------------------
  // 2. INITIALIZATION
  // ------------------------------------------
  initApp();

  function initApp() {
    createParticles();
    initStage1();
    initStage2();
    initStage3();
    initStage4();
    initAudio();
  }

  // ------------------------------------------
  // 3. BACKGROUND PARTICLES (HEARTS & STARS)
  // ------------------------------------------
  function createParticles() {
    const container = document.getElementById('particles-container');
    const icons = ['💖', '✨', '🌸', '💕', '⭐', '🎈'];
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      particle.innerText = icons[Math.floor(Math.random() * icons.length)];
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${5 + Math.random() * 7}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.fontSize = `${1.2 + Math.random() * 1}rem`;
      container.appendChild(particle);
    }
  }

  // ------------------------------------------
  // 4. AUDIO CONTROL
  // ------------------------------------------
  function initAudio() {
    bgmAudio = new Audio(HBD_CONFIG.bgmUrl);
    bgmAudio.loop = true;

    const musicBtn = document.getElementById('music-toggle-btn');

    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        toggleMusic();
      });
    }
  }

  function toggleMusic() {
    const musicDisc = document.getElementById('music-disc');
    if (!bgmAudio) return;

    if (isAudioPlaying) {
      bgmAudio.pause();
      isAudioPlaying = false;
      if (musicDisc) musicDisc.classList.remove('playing');
    } else {
      bgmAudio.play().then(() => {
        isAudioPlaying = true;
        if (musicDisc) musicDisc.classList.add('playing');
      }).catch(err => {
        console.log("Audio autoplay prevented or error:", err);
      });
    }
  }

  function playMusicIfAllowed() {
    if (!isAudioPlaying && bgmAudio) {
      bgmAudio.play().then(() => {
        isAudioPlaying = true;
        const musicDisc = document.getElementById('music-disc');
        if (musicDisc) musicDisc.classList.add('playing');
      }).catch(() => {});
    }
  }

  // ------------------------------------------
  // 5. STAGE NAVIGATION
  // ------------------------------------------
  window.goToStage = function(stageNum) {
    if (stages[currentStage]) {
      stages[currentStage].classList.remove('active');
    }

    currentStage = stageNum;

    setTimeout(() => {
      if (stages[currentStage]) {
        stages[currentStage].classList.add('active');
      }

      // Action on specific stage enter
      if (stageNum === 2) {
        playMusicIfAllowed();
      } else if (stageNum === 4) {
        startTypewriterLetter();
      }
    }, 300);
  };

  // ------------------------------------------
  // 6. STAGE 1: PASSCODE LOCK
  // ------------------------------------------
  function initStage1() {
    const digitBoxes = [
      document.getElementById('digit-1'),
      document.getElementById('digit-2'),
      document.getElementById('digit-3'),
      document.getElementById('digit-4')
    ];
    const hintText = document.getElementById('hint-text');
    if (hintText) hintText.innerText = HBD_CONFIG.passcodeHint;

    const keyBtns = document.querySelectorAll('.key-btn');
    keyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        if (val === 'del') {
          handleDeleteKey();
        } else if (val === '❤️') {
          showToast("❤️ ส่งความรักให้เธอทุกวันน้า!");
        } else if (val !== null && enteredPasscode.length < 4) {
          handleDigitKey(val);
        }
      });
    });

    function handleDigitKey(digit) {
      enteredPasscode += digit;
      updateDigitBoxes();

      if (enteredPasscode.length === 4) {
        setTimeout(verifyPasscode, 200);
      }
    }

    function handleDeleteKey() {
      if (enteredPasscode.length > 0) {
        enteredPasscode = enteredPasscode.slice(0, -1);
        updateDigitBoxes();
      }
    }

    function updateDigitBoxes() {
      digitBoxes.forEach((box, idx) => {
        if (idx < enteredPasscode.length) {
          box.innerText = "●";
          box.classList.add('filled');
        } else {
          box.innerText = "";
          box.classList.remove('filled');
        }
        box.classList.remove('error');
      });
    }

    function verifyPasscode() {
      if (enteredPasscode === HBD_CONFIG.passcode) {
        showToast("✨ ถูกต้องแล้วครับสุดที่รัก! ปลดล็อคความทรงจำ 💕");
        playMusicIfAllowed();
        setTimeout(() => {
          goToStage(2);
        }, 1000);
      } else {
        digitBoxes.forEach(box => box.classList.add('error'));
        showToast("❌ รหัสไม่ถูกต้องน้า ลองใหม่อีกครั้งครับ ❤️");
        setTimeout(() => {
          enteredPasscode = "";
          updateDigitBoxes();
        }, 600);
      }
    }
  }

  // ------------------------------------------
  // 7. STAGE 2: MEMORIES GALLERY
  // ------------------------------------------
  function initStage2() {
    renderMemoryCard(0);
    renderDots();

    const prevBtn = document.getElementById('prev-memory-btn');
    const nextBtn = document.getElementById('next-memory-btn');
    const toStage3Btn = document.getElementById('to-stage3-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentMemoryIndex > 0) {
          currentMemoryIndex--;
          renderMemoryCard(currentMemoryIndex);
          updateDots();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentMemoryIndex < HBD_CONFIG.memories.length - 1) {
          currentMemoryIndex++;
          renderMemoryCard(currentMemoryIndex);
          updateDots();
        }
      });
    }

    if (toStage3Btn) {
      toStage3Btn.addEventListener('click', () => {
        goToStage(3);
      });
    }
  }

  function renderMemoryCard(index) {
    const memory = HBD_CONFIG.memories[index];
    if (!memory) return;

    const imgEl = document.getElementById('polaroid-img');
    const titleEl = document.getElementById('polaroid-title');
    const captionEl = document.getElementById('polaroid-caption');

    if (imgEl) imgEl.src = memory.image;
    if (titleEl) titleEl.innerText = memory.title;
    if (captionEl) captionEl.innerText = memory.caption;
  }

  function renderDots() {
    const dotsContainer = document.getElementById('dots-container');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";

    HBD_CONFIG.memories.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `dot ${idx === currentMemoryIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        currentMemoryIndex = idx;
        renderMemoryCard(idx);
        updateDots();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      if (idx === currentMemoryIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // ------------------------------------------
  // 8. STAGE 3: INTERACTIVE BIRTHDAY CAKE & CONFETTI
  // ------------------------------------------
  function initStage3() {
    const blowBtn = document.getElementById('blow-candle-btn');
    const cakeBox = document.querySelector('.cake-stage-box');
    const toStage4Btn = document.getElementById('to-stage4-btn');

    if (blowBtn) blowBtn.addEventListener('click', blowCandles);
    if (cakeBox) cakeBox.addEventListener('click', blowCandles);

    if (toStage4Btn) {
      toStage4Btn.addEventListener('click', () => {
        goToStage(4);
      });
    }
  }

  function blowCandles() {
    if (isCakeBlown) return;
    isCakeBlown = true;

    const flames = document.querySelectorAll('.flame');
    const smokes = document.querySelectorAll('.smoke');
    const blowBtn = document.getElementById('blow-candle-btn');
    const toStage4Btn = document.getElementById('to-stage4-btn');

    flames.forEach(flame => flame.classList.add('extinguished'));
    smokes.forEach(smoke => smoke.classList.add('active'));

    showToast("🎉 สุขสันต์วันเกิดนะคนดี! ขอให้คำอธิษฐานเป็นจริงทุกประการ 💕✨");

    // Launch Confetti
    launchConfetti();

    if (blowBtn) blowBtn.style.display = 'none';
    if (toStage4Btn) toStage4Btn.style.display = 'inline-flex';
  }

  // Confetti Particle System
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (confettiAnimationFrame) {
      cancelAnimationFrame(confettiAnimationFrame);
    }

    const confettiPieces = [];
    const colors = ['#ff758c', '#ff7eb3', '#ffd700', '#b5ead7', '#c7ceea', '#ffc3a0'];

    for (let i = 0; i < 120; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiPieces.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (confettiPieces.some(p => p.y < canvas.height)) {
        confettiAnimationFrame = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();
  }

  // ------------------------------------------
  // 9. STAGE 4: LOVE LETTER & COUPONS
  // ------------------------------------------
  function initStage4() {
    renderCoupons();

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        isCakeBlown = false;
        const flames = document.querySelectorAll('.flame');
        const smokes = document.querySelectorAll('.smoke');
        const blowBtn = document.getElementById('blow-candle-btn');
        const toStage4Btn = document.getElementById('to-stage4-btn');

        flames.forEach(f => f.classList.remove('extinguished'));
        smokes.forEach(s => s.classList.remove('active'));
        if (blowBtn) blowBtn.style.display = 'inline-flex';
        if (toStage4Btn) toStage4Btn.style.display = 'none';

        goToStage(1);
      });
    }
  }

  function startTypewriterLetter() {
    const salutationEl = document.getElementById('letter-salutation');
    const bodyEl = document.getElementById('letter-body');
    const senderEl = document.getElementById('letter-sender');

    if (salutationEl) salutationEl.innerText = HBD_CONFIG.letter.salutation;
    if (senderEl) senderEl.innerText = `${HBD_CONFIG.letter.closing}\n${HBD_CONFIG.letter.sender}`;

    if (!bodyEl) return;
    bodyEl.innerHTML = "";

    const fullTextList = HBD_CONFIG.letter.bodyParagraphs;
    let paragraphIdx = 0;

    function typeNextParagraph() {
      if (paragraphIdx >= fullTextList.length) return;

      const pText = fullTextList[paragraphIdx];
      const p = document.createElement('p');
      p.className = 'letter-text';
      bodyEl.appendChild(p);

      let charIdx = 0;
      const timer = setInterval(() => {
        if (charIdx < pText.length) {
          p.innerText += pText.charAt(charIdx);
          charIdx++;
        } else {
          clearInterval(timer);
          paragraphIdx++;
          setTimeout(typeNextParagraph, 300);
        }
      }, 35);
    }

    typeNextParagraph();
  }

  function renderCoupons() {
    const couponsContainer = document.getElementById('coupons-list');
    if (!couponsContainer) return;
    couponsContainer.innerHTML = "";

    HBD_CONFIG.coupons.forEach(coupon => {
      const card = document.createElement('div');
      card.className = 'coupon-card';
      card.innerHTML = `
        <div class="coupon-icon">${coupon.icon}</div>
        <div class="coupon-info">
          <h4>${coupon.title}</h4>
          <p>${coupon.description}</p>
        </div>
        <div class="coupon-stamp">ใช้งานแล้ว 💖</div>
      `;

      card.addEventListener('click', () => {
        if (!card.classList.contains('redeemed')) {
          card.classList.add('redeemed');
          showToast(`🎁 ใช้ "${coupon.title}" เรียบร้อยแล้ว!`);
          launchConfetti();
        } else {
          showToast(`✨ คูปองนี้ใช้ไปแล้ว แต่ยังขอเพิ่มได้ตลอดนะ! ❤️`);
        }
      });

      couponsContainer.appendChild(card);
    });
  }

  // ------------------------------------------
  // 10. TOAST NOTIFICATION UTILITY
  // ------------------------------------------
  function showToast(message) {
    const toast = document.getElementById('toast-msg');
    if (!toast) return;

    toast.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
});
