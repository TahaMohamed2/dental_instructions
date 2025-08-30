document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.button-container');
  const buttons = Array.from(container.querySelectorAll('button'));
  const visibleCount = 5;
  const isRTL = document.documentElement.dir === 'rtl';

  // Initialize state
  let currentStartIndex = 0;

  // Function to update button positions and visibility
  function updateButtons() {
    const total = buttons.length;
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;

    buttons.forEach((btn, index) => {
      btn.style.position = 'absolute';
      btn.style.transition = 'all 0.5s ease';
      btn.style.borderRadius = '15px';
      btn.style.padding = '10px';
      btn.style.fontSize = '1rem';
      btn.style.textAlign = 'center';
      btn.style.lineHeight = '1.2';
      btn.style.whiteSpace = 'normal';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.flexDirection = 'column';

      // Calculate relative index in visible window
      let relativeIndex = (index - currentStartIndex + total) % total;

      if (relativeIndex < visibleCount) {
        // Horizontal stacked card layout from right
        const cardWidth = 160;
        const cardHeight = 100;
        const offsetX = 30; // horizontal offset between stacked cards
        const scaleStep = 0.05; // scale difference between stacked cards

        const totalWidth = (visibleCount - 1) * offsetX + cardWidth;
        const startX = container.clientWidth - totalWidth;
        const y = (container.clientHeight - cardHeight) / 2;
        const x = startX + offsetX * relativeIndex;
        const scale = 1 - (scaleStep * relativeIndex);

        btn.style.width = cardWidth + 'px';
        btn.style.height = cardHeight + 'px';
        btn.style.opacity = '1';
        btn.style.zIndex = 100 - relativeIndex; // higher zIndex for top cards
        btn.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      } else {
        // Minimized buttons at top or bottom
        btn.style.width = '50px';
        btn.style.height = '50px';
        btn.style.lineHeight = '1.1';
        btn.style.fontSize = '0.6rem';
        btn.style.borderRadius = '25px';
        btn.style.padding = '3px';

        // Determine if minimized at top or bottom
        if (relativeIndex < visibleCount + Math.floor((total - visibleCount) / 2)) {
          // Top minimized row
          const topIndex = relativeIndex - visibleCount;
          const spacing = container.clientWidth / (Math.ceil((total - visibleCount) / 2) + 1);
          const x = spacing * (topIndex + 1) - 25; // 25 = half minimized width
          const y = 15;
          btn.style.transform = `translate(${x}px, ${y}px) scale(0.7)`;
          btn.style.opacity = '0.7';
          btn.style.zIndex = '5';
        } else {
          // Bottom minimized row
          const bottomIndex = relativeIndex - visibleCount - Math.floor((total - visibleCount) / 2);
          const spacing = container.clientWidth / (Math.ceil((total - visibleCount) / 2) + 1);
          const x = spacing * (bottomIndex + 1) - 0;
          const y = container.clientHeight - 0;
          btn.style.transform = `translate(${x}px, ${y}px) scale(0.7)`;
          btn.style.opacity = '0.7';
          btn.style.zIndex = '5';
        }
      }
    });
  }

  // Initial update
  updateButtons();

  // Force re-layout after short delay to fix initial rendering issues
  setTimeout(updateButtons, 100);

  // Handle window resize
  window.addEventListener('resize', updateButtons);

  // Auto-rotate functionality (optional)
  let rotationInterval = setInterval(() => {
    currentStartIndex = (currentStartIndex + 1) % buttons.length;
    updateButtons();
  }, 5000);

  // Stop rotation on user interaction
  container.addEventListener('mouseenter', () => {
    clearInterval(rotationInterval);
  });

  container.addEventListener('mouseleave', () => {
    rotationInterval = setInterval(() => {
      currentStartIndex = (currentStartIndex + 1) % buttons.length;
      updateButtons();
    }, 5000);
  });

  // Manual navigation (optional)
  // Removed prev/next buttons for scroll-based navigation

  // Scroll-based navigation with max 5 buttons change per scroll
  let scrollTimeout;
  let scrollDeltaAccumulator = 0;
  const maxScrollChange = 5;
  container.addEventListener('wheel', (event) => {
    event.preventDefault();
    clearTimeout(scrollTimeout);
    scrollDeltaAccumulator += event.deltaY;

    // Calculate how many steps to move, limited to maxScrollChange
    let steps = Math.floor(scrollDeltaAccumulator / 100); // 100 is scroll threshold per step
    if (steps > maxScrollChange) steps = maxScrollChange;
    if (steps < -maxScrollChange) steps = -maxScrollChange;

    if (steps !== 0) {
      currentStartIndex = (currentStartIndex + steps + buttons.length) % buttons.length;
      updateButtons();
      scrollDeltaAccumulator = 0; // reset after applying steps
    }

    // Throttle scroll events to avoid rapid changes
    scrollTimeout = setTimeout(() => {}, 200);
  }, { passive: false });
});
