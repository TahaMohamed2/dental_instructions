document.addEventListener('DOMContentLoaded', () => {
  // Fix for potential null querySelectorAll error
  const stoneCards = document.querySelectorAll('.stone-card');
  if (stoneCards) {
    stoneCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        const overlay = card.querySelector('.stone-content-overlay');
        if (overlay) {
          overlay.style.transform = 'translateY(0)';
          overlay.style.transition = 'transform 0.3s ease';
        }
      });
      card.addEventListener('mouseleave', () => {
        const overlay = card.querySelector('.stone-content-overlay');
        if (overlay) {
          overlay.style.transform = 'translateY(100%)';
          overlay.style.transition = 'transform 0.3s ease';
        }
      });
    });
  }
});
