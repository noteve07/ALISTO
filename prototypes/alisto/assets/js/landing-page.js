/* Behavior: carousel + basic interactions + smooth scroll */
document.addEventListener('DOMContentLoaded', () => {
  // Add smooth scroll behavior to all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL without jumping
        history.pushState(null, '', targetId);
      }
    });
  });

  // Handle navigation to sections from external URLs with hash
  if (window.location.hash) {
    const targetElement = document.querySelector(window.location.hash);
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }
  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-to]'));
  const startBtn = document.getElementById('start-monitoring');
  let active = 0;
  let timer = null;

  function setActive(index) {
    if (!slides.length) return;
    index = (index + slides.length) % slides.length;
    slides.forEach((s, i) => {
      s.classList.toggle('hidden', i !== index);
      s.classList.toggle('visible', i === index);
    });
    dots.forEach((d, i) => {
      d.classList.toggle('bg-white/60', i === index);
      d.classList.toggle('bg-white/30', i !== index);
    });
    active = index;
  }

  // attach dot events
  dots.forEach(d => d.addEventListener('click', (e) => {
    const idx = Number(e.currentTarget.getAttribute('data-to'));
    setActive(idx);
    resetTimer();
  }));

  // optional: auto-advance
  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => setActive(active + 1), 6000);
  }

  // Start button behaviour placeholder
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      // TODO: wire to actual monitoring page / open map modal
      console.log('Start Monitoring clicked');
    });
  }

  // initialize
  setActive(0);
  resetTimer();
});