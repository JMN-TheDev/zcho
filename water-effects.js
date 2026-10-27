(() => {
  const hero = document.querySelector('.hero');
  if (!hero || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  let nextX = 70, nextY = 45;
  let ringX = 70, ringY = 45;
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    nextX = ((event.clientX - bounds.left) / bounds.width) * 100;
    nextY = ((event.clientY - bounds.top) / bounds.height) * 100;
    hero.style.setProperty('--light-x', `${nextX.toFixed(2)}%`);
    hero.style.setProperty('--light-y', `${nextY.toFixed(2)}%`);
    hero.classList.add('has-pointer-light');
    if (frame) return;
    const followPointer = () => {
      ringX += (nextX - ringX) * 0.095;
      ringY += (nextY - ringY) * 0.095;
      hero.style.setProperty('--ring-x', `${ringX.toFixed(2)}%`);
      hero.style.setProperty('--ring-y', `${ringY.toFixed(2)}%`);
      if (Math.abs(nextX - ringX) > 0.025 || Math.abs(nextY - ringY) > 0.025) {
        frame = requestAnimationFrame(followPointer);
      } else {
        ringX = nextX;
        ringY = nextY;
        hero.style.setProperty('--ring-x', `${ringX.toFixed(2)}%`);
        hero.style.setProperty('--ring-y', `${ringY.toFixed(2)}%`);
        frame = 0;
      }
    };
    frame = requestAnimationFrame(followPointer);
  }, { passive: true });

  hero.addEventListener('pointerleave', () => hero.classList.remove('has-pointer-light'));
})();
