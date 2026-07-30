// Lenis smooth scroll import with fallback
let lenis = null;
import('lenis').then((module) => {
  const Lenis = module.default;
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}).catch(() => {
  console.log('Lenis loaded via native smooth scroll mode.');
});

// Constants
const TOTAL_FRAMES = 156;
const FOLDER_NAME = 'ezgif-8ccd6bf6701d89d2-png-split';

// DOM Elements
const canvas = document.getElementById('scroll-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const loader = document.getElementById('loader');
const loaderText = document.getElementById('loader-text');
const progressFill = document.getElementById('progress-fill');
const frameNumDisplay = document.getElementById('frame-num-display');
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const header = document.querySelector('.site-header');

// Project Data Details for Modal
const PROJECT_DETAILS = {
  'nexus-os': {
    title: 'Nexus OS Spatial Engine',
    category: 'Interactive 3D',
    description: 'A WebGL and HTML5 spatial canvas platform designed to scrub through 156 high-definition 3D rendering sequence frames with zero latency. Features particle physics, custom camera dampening, and responsive DPR canvas scaling.',
    tags: ['HTML5 Canvas', 'WebGL', 'Vite', 'Smooth Lerp'],
    link: '#'
  },
  'aura-mono': {
    title: 'Aura Monochrome Commerce',
    category: 'Web Apps',
    description: 'Luxury monochrome e-commerce showcase engineered for high-fashion digital brands. Built with pure CSS glassmorphism, instant page transitions, and smooth momentum scrolling.',
    tags: ['JavaScript', 'Glassmorphism', 'REST API', 'CSS Grid'],
    link: '#'
  },
  'pulse-analytics': {
    title: 'Pulse High-Frequency Analytics',
    category: 'Web Apps',
    description: 'Real-time telemetry dashboard rendering 60,000+ data points per second across dynamic HTML5 Canvas charts with ultra-low latency and zero dropped frames.',
    tags: ['TypeScript', 'WebSockets', 'Canvas2D', 'Performance'],
    link: '#'
  },
  'chronos-studio': {
    title: 'Chronos Audio-Visualizer',
    category: 'Interactive 3D',
    description: 'An interactive sound-reactive canvas matrix that transforms incoming microphone or audio file frequencies into real-time procedural geometric waveforms.',
    tags: ['Web Audio API', 'Canvas 2D', 'Lenis', 'Math Physics'],
    link: '#'
  },
  'vortex-ui': {
    title: 'Vortex Monochrome Component Core',
    category: 'UI Systems',
    description: 'An accessible, dark-mode design system with 40+ modular UI components, CSS design tokens, micro-interaction state models, and WCAG AAA compliance.',
    tags: ['Design Tokens', 'CSS Grid', 'a11y', 'Modular UI'],
    link: '#'
  },
  'kinetix-scroll': {
    title: 'Kinetix Scroll Motion',
    category: 'Interactive 3D',
    description: 'An Apple-inspired product animation engine built for image sequence preloading, memory buffer caching, and smooth frame interpolation during scroll.',
    tags: ['Smooth Scroll', 'Frame Scrub', 'JavaScript', 'Preloader'],
    link: '#'
  }
};

// Canvas & Frame State
const images = [];
let loadedCount = 0;
let currentFrame = 0;
let targetFrame = 0;

// Format frame filename with 3 digits padding (e.g. 001, 012, 156)
function getFramePath(index) {
  const frameNum = String(index + 1).padStart(3, '0');
  return `/${FOLDER_NAME}/ezgif-frame-${frameNum}.png`;
}

// Preload all 156 images
function preloadImages() {
  return new Promise((resolve) => {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      const onImageLoad = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);

        if (loaderText) loaderText.textContent = `Loading ${percent}%`;
        if (progressFill) progressFill.style.width = `${percent}%`;

        if (i === 0) {
          renderFrame(0);
        }

        if (loadedCount === TOTAL_FRAMES) {
          resolve();
        }
      };

      img.onload = onImageLoad;
      img.onerror = () => {
        console.warn(`Failed to load frame: ${getFramePath(i)}`);
        onImageLoad();
      };

      images.push(img);
    }
  });
}

// Fit image into canvas with comfortable fit so subject is centered cleanly
function drawImageScaled(img) {
  if (!img || !img.complete || img.naturalWidth === 0 || !ctx) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Clear canvas completely to keep background transparent
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  // Fit scaling to present 3D subject with optimal breathing room
  const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.82;
  const x = (canvasWidth / 2) - (imgWidth / 2) * scale;
  const y = (canvasHeight / 2) - (imgHeight / 2) * scale;

  ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
}

// Resize canvas considering device pixel ratio
function resizeCanvas() {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  renderFrame(Math.round(currentFrame));
}

function renderFrame(index) {
  const boundedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
  const img = images[boundedIndex];
  if (img) {
    drawImageScaled(img);
  }

  if (frameNumDisplay) {
    frameNumDisplay.textContent = String(boundedIndex + 1).padStart(3, '0');
  }
}

// Calculate target frame from window scroll
function updateTargetFrame() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;

  const scrollFraction = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  targetFrame = scrollFraction * (TOTAL_FRAMES - 1);

  // Update header scrolled state
  if (header) {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Adjust canvas opacity slightly on scroll for text legibility & high background clarity
  if (canvas) {
    if (scrollFraction > 0.15 && scrollFraction < 0.85) {
      canvas.style.opacity = '0.45';
    } else {
      canvas.style.opacity = '0.55';
    }
  }
}

// Fluid RAF animation loop with linear lerping
function animate() {
  const delta = targetFrame - currentFrame;
  currentFrame += delta * 0.08; // Ultra smooth lerp factor

  renderFrame(Math.round(currentFrame));
  requestAnimationFrame(animate);
}

/* Custom Magnetic Cursor Logic */
function initCustomCursor() {
  if (!cursorDot || !cursorRing) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states for interactive elements
  const hoverables = document.querySelectorAll('a, button, .project-card, .filter-btn, .feature-card');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
  });
}

/* Mobile Menu Toggle */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
      });
    });
  }
}

/* Project Filter Tabs */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* Project Detail Modal */
function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalDesc = document.getElementById('modal-description');
  const modalTags = document.getElementById('modal-tags');
  const projectCards = document.querySelectorAll('.project-card');

  if (!modal) return;

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const data = PROJECT_DETAILS[id];

      if (data) {
        if (modalTitle) modalTitle.textContent = data.title;
        if (modalCategory) modalCategory.textContent = data.category;
        if (modalDesc) modalDesc.textContent = data.description;

        if (modalTags) {
          modalTags.innerHTML = data.tags.map(t => `<span class="tag">${t}</span>`).join('');
        }

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });
}

/* Copy Email & Contact Form */
function initContactSection() {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailText = document.getElementById('email-address');
  const feedback = document.getElementById('copy-feedback');
  const contactForm = document.getElementById('contact-form');
  const toast = document.getElementById('toast');

  if (copyBtn && emailText && feedback) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(emailText.textContent).then(() => {
        feedback.classList.add('show');
        setTimeout(() => feedback.classList.remove('show'), 2500);
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submit-btn');
      if (submitBtn) {
        submitBtn.innerHTML = `<span>Sending...</span>`;
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (toast) {
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 4000);
        }

        contactForm.reset();
        if (submitBtn) {
          submitBtn.innerHTML = `<span>Send Message</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
          submitBtn.disabled = false;
        }
      }, 1000);
    });
  }
}

/* Live Time Clock */
function initLiveClock() {
  const clockEl = document.getElementById('live-clock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const timeStr = now.toLocaleTimeString('en-US', options);
    clockEl.textContent = `${timeStr} IST`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// App Initialization
async function init() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('scroll', updateTargetFrame, { passive: true });
  updateTargetFrame();

  await preloadImages();

  // Hide loader
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 800);
  }

  // Start smooth RAF loop
  animate();

  // Initialize interactive features
  initCustomCursor();
  initMobileMenu();
  initProjectFilters();
  initProjectModal();
  initContactSection();
  initLiveClock();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
