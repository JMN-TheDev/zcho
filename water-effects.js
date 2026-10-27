(() => {
  const hero = document.querySelector('.hero');
  if (!hero || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  let nextX = 70, nextY = 45;
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    nextX = ((event.clientX - bounds.left) / bounds.width) * 100;
    nextY = ((event.clientY - bounds.top) / bounds.height) * 100;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      hero.style.setProperty('--light-x', `${nextX.toFixed(2)}%`);
      hero.style.setProperty('--light-y', `${nextY.toFixed(2)}%`);
      hero.classList.add('has-pointer-light');
      frame = 0;
    });
  }, { passive: true });

  hero.addEventListener('pointerleave', () => hero.classList.remove('has-pointer-light'));
})();
