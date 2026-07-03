gsap.registerPlugin(ScrollTrigger);

/* ============ LOADER ============ */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    playIntroTimeline();
  }, 1200);
});

/* ============ HERO INTRO TIMELINE ============ */
function playIntroTimeline() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to('.eyebrow', { opacity: 1, y: 0, duration: 1 }, 0.1)
    .fromTo('.hero-title', { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1.3 }, 0.3)
    .fromTo('.hero-sub', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2 }, 0.9)
    .to('.scroll-cue', { opacity: 1, duration: 1 }, 1.6);
}

/* ============ AUDIO ============ */
const bgMusic = document.getElementById('bg-music');
const chimeSound = document.getElementById('chime-sound');
const yesSound = document.getElementById('yes-sound');
const soundToggle = document.getElementById('sound-toggle');
const onIcon = document.getElementById('sound-on-icon');
const offIcon = document.getElementById('sound-off-icon');
bgMusic.volume = 0;
let musicStarted = false;
let musicEnabled = true;

function fadeInMusic() {
  if (musicStarted) return;
  musicStarted = true;
  bgMusic.play().catch(() => {});
  gsap.to(bgMusic, { volume: 0.28, duration: 3, ease: 'power1.in' });
}
// start music on first user interaction (autoplay policies)
['click', 'touchstart', 'scroll'].forEach(evt => {
  window.addEventListener(evt, fadeInMusic, { once: true, passive: true });
});

soundToggle.addEventListener('click', () => {
  musicEnabled = !musicEnabled;
  if (musicEnabled) {
    bgMusic.play().catch(() => {});
    gsap.to(bgMusic, { volume: 0.28, duration: 0.8 });
    onIcon.style.display = 'block';
    offIcon.style.display = 'none';
  } else {
    gsap.to(bgMusic, { volume: 0, duration: 0.5, onComplete: () => bgMusic.pause() });
    onIcon.style.display = 'none';
    offIcon.style.display = 'block';
  }
});

function playChime() {
  try { chimeSound.currentTime = 0; chimeSound.volume = 0.4; chimeSound.play().catch(()=>{}); } catch(e){}
}
function playYesSound() {
  try { yesSound.currentTime = 0; yesSound.volume = 0.55; yesSound.play().catch(()=>{}); } catch(e){}
}

/* ============ SCROLL REVEALS ============ */

// Story lines — line by line fade
gsap.utils.toArray('.story-line').forEach((line, i) => {
  gsap.to(line, {
    opacity: 1, y: 0, duration: 1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: line,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    delay: i * 0.05
  });
});

// Memory card
gsap.to('#memory-card', {
  opacity: 1, duration: 1.2, ease: 'power2.out',
  scrollTrigger: { trigger: '#memory-card', start: 'top 80%', toggleActions: 'play none none reverse' }
});

// Section kickers general fade
gsap.utils.toArray('.section-kicker').forEach(el => {
  gsap.fromTo(el, { opacity: 0, y: 12 }, {
    opacity: 0.85, y: 0, duration: 0.8,
    scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
  });
});

gsap.utils.toArray('.game-title, .prank-title, .proposal-title').forEach(el => {
  gsap.fromTo(el, { opacity: 0, y: 20 }, {
    opacity: 1, y: 0, duration: 1,
    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
  });
});

// Ending
gsap.to('.ending-glow-text', {
  opacity: 1, duration: 1.4,
  scrollTrigger: { trigger: '.ending', start: 'top 70%', toggleActions: 'play none none reverse' }
});
gsap.to('.ending-title', {
  opacity: 1, duration: 1.6, delay: 0.3,
  scrollTrigger: { trigger: '.ending', start: 'top 70%', toggleActions: 'play none none reverse' }
});
gsap.to('.ending-sub', {
  opacity: 0.85, duration: 1.2, delay: 0.8,
  scrollTrigger: { trigger: '.ending', start: 'top 70%', toggleActions: 'play none none reverse' }
});

/* ============ MEMORY CARD 3D TILT ============ */
const memoryCard = document.getElementById('memory-card');
const memoryShine = memoryCard.querySelector('.memory-card-shine');
memoryCard.addEventListener('mousemove', (e) => {
  const rect = memoryCard.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  gsap.to(memoryCard, {
    rotateY: x * 16, rotateX: -y * 16, duration: 0.4, ease: 'power2.out', transformPerspective: 800
  });
  gsap.to(memoryShine, { x: x * 60 + '%', duration: 0.4 });
});
memoryCard.addEventListener('mouseleave', () => {
  gsap.to(memoryCard, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power2.out' });
});
memoryCard.addEventListener('mouseenter', () => {
  gsap.fromTo(memoryShine, { xPercent: -100 }, { xPercent: 200, duration: 1 });
});
// touch tilt fallback
memoryCard.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  const rect = memoryCard.getBoundingClientRect();
  const x = (touch.clientX - rect.left) / rect.width - 0.5;
  const y = (touch.clientY - rect.top) / rect.height - 0.5;
  gsap.to(memoryCard, { rotateY: x * 10, rotateX: -y * 10, duration: 0.3 });
}, { passive: true });

/* ============ MINI GAME: HEART CATCHER ============ */
(() => {
  const stage = document.getElementById('game-stage');
  const scoreVal = document.getElementById('score-val');
  const startBtn = document.getElementById('game-start');
  const unlockPanel = document.getElementById('game-unlock');
  const TARGET = 15;
  let score = 0;
  let spawnInterval = null;
  let playing = false;

  const emojiPool = ['❤','💖','💕','💗'];

  function spawnHeart() {
    if (!playing) return;
    const heart = document.createElement('div');
    heart.className = 'game-heart';
    heart.textContent = emojiPool[Math.floor(Math.random()*emojiPool.length)];
    const stageWidth = stage.clientWidth;
    const startX = 20 + Math.random() * (stageWidth - 40);
    heart.style.left = startX + 'px';
    stage.appendChild(heart);

    const duration = 3.2 + Math.random() * 1.6;
    const drift = (Math.random() - 0.5) * 80;

    const tween = gsap.to(heart, {
      bottom: stage.clientHeight + 60,
      x: drift,
      rotation: (Math.random()-0.5) * 60,
      duration,
      ease: 'power1.out',
      onComplete: () => heart.remove()
    });

    function catchHeart() {
      if (heart.classList.contains('popped')) return;
      heart.classList.add('popped');
      tween.kill();
      score++;
      scoreVal.textContent = score;
      playChime();
      if (score >= TARGET) {
        endGame();
      }
      setTimeout(() => heart.remove(), 400);
    }
    heart.addEventListener('pointerdown', catchHeart);
  }

  function endGame() {
    playing = false;
    clearInterval(spawnInterval);
    stage.querySelectorAll('.game-heart').forEach(h => h.remove());
    unlockPanel.classList.add('show');
    playYesSound();
  }

  startBtn.addEventListener('click', () => {
    if (playing) return;
    score = 0;
    scoreVal.textContent = 0;
    unlockPanel.classList.remove('show');
    stage.querySelectorAll('.game-heart').forEach(h => h.remove());
    playing = true;
    startBtn.textContent = 'Restart';
    spawnInterval = setInterval(spawnHeart, 550);
  });
})();

/* ============ PRANK "NO" BUTTON ============ */
(() => {
  const noBtn = document.getElementById('prank-no');
  const msgEl = document.getElementById('prank-msg');
  const container = document.querySelector('.prank-buttons');
  const messages = ['Are you sure? 🥺', 'Think again ❤', "You can't escape my love 😏", 'Try again, jaan 💫'];
  let msgIndex = 0;

  function dodge() {
    const containerRect = container.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const maxX = containerRect.width - btnRect.width;
    const maxY = 40;
    const newX = (Math.random() - 0.5) * Math.min(maxX, 220);
    const newY = (Math.random() - 0.5) * maxY;
    gsap.to(noBtn, { x: newX, y: newY, duration: 0.35, ease: 'back.out(2)' });
    msgEl.textContent = messages[msgIndex % messages.length];
    msgIndex++;
  }

  noBtn.addEventListener('mouseenter', dodge);
  noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); dodge(); }, { passive: false });
  noBtn.addEventListener('click', (e) => { e.preventDefault(); dodge(); });

  document.getElementById('prank-yes').addEventListener('click', () => {
    msgEl.textContent = 'That\'s what I thought ❤️ I love you endlessly, Mehak.';
    playChime();
  });
})();

/* ============ PROPOSAL FLOW ============ */
(() => {
  const openBtn = document.getElementById('open-heart-btn');
  const pre = document.getElementById('proposal-pre');
  const scene = document.getElementById('proposal-scene');
  const heartCanvas = document.getElementById('heart-canvas');
  const question = document.getElementById('proposal-question');
  const success = document.getElementById('proposal-success');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const buttonsWrap = document.querySelector('.proposal-buttons');

  openBtn.addEventListener('click', () => {
    pre.classList.add('hide');
    scene.classList.add('active');
    playChime();

    HeartTrailScene.start(heartCanvas);

    setTimeout(() => {
      question.classList.add('show');
    }, 2200);
  });

  // "No" button escapes playfully, same pattern as prank
  function dodgeNo() {
    const wrapRect = buttonsWrap.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();
    const maxX = Math.min(wrapRect.width - btnRect.width, 200);
    const newX = (Math.random() - 0.5) * maxX;
    const newY = (Math.random() - 0.5) * 50;
    gsap.to(btnNo, { x: newX, y: newY, duration: 0.35, ease: 'back.out(2)' });
  }
  btnNo.addEventListener('mouseenter', dodgeNo);
  btnNo.addEventListener('touchstart', (e) => { e.preventDefault(); dodgeNo(); }, { passive: false });
  btnNo.addEventListener('click', (e) => { e.preventDefault(); dodgeNo(); });

  btnYes.addEventListener('click', () => {
    question.classList.remove('show');
    playYesSound();
    HeartTrailScene.stop();

    setTimeout(() => {
      success.classList.add('show');
      launchHeartBurst();
    }, 300);
  });

  function launchHeartBurst() {
    const container = document.getElementById('success-burst');
    const emojis = ['❤','💖','💕','✨','💫'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      el.style.position = 'absolute';
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.fontSize = (14 + Math.random()*22) + 'px';
      el.style.pointerEvents = 'none';
      container.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 300;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      gsap.to(el, {
        x, y,
        opacity: 0,
        scale: 0.3 + Math.random()*1.2,
        rotation: (Math.random()-0.5) * 180,
        duration: 1.8 + Math.random()*1.2,
        ease: 'power2.out',
        onComplete: () => el.remove()
      });
    }
  }

  window.addEventListener('resize', () => {
    if (heartCanvas) HeartTrailScene.resize(heartCanvas);
  });
})();

