// ================================
// MAIN.JS - UPDATED
// ================================

// 1. MOBILE NAVIGATION
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.querySelector('.nav__mobile');

  if (toggle && menu) {
    // 1. Toggle Button Listener
    toggle.addEventListener('click', (e) => {
      // Prevent the click from bubbling up to the document immediately
      e.stopPropagation();
      
      menu.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    // 2. Document Listener (Handles closing)
    document.addEventListener('click', (e) => {
      // Only close if the menu IS active AND the click is NOT inside the menu
      if (menu.classList.contains('active') && !menu.contains(e.target)) {
        menu.classList.remove('active');
        toggle.classList.remove('active');
      }
    });
  }
})

// 2. ROBUST HTB FILTERS
function initHTBFilters() {
  // Select all buttons
  const diffButtons = document.querySelectorAll('[data-difficulty-filter]');
  const osButtons = document.querySelectorAll('[data-os-filter]');
  const cards = document.querySelectorAll('.htb-card');
  
  console.log(`Found ${diffButtons.length} difficulty buttons`);
  console.log(`Found ${osButtons.length} OS buttons`);
  console.log(`Found ${cards.length} cards`);

  let currentDiff = 'all';
  let currentOS = 'all';

  // Helper to update UI
  function updateActiveButton(buttons, clickedBtn) {
    buttons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
  }

  // Helper to filter cards
  function filterGrid() {
    let visibleCount = 0;
    cards.forEach(card => {
      const cardDiff = (card.dataset.difficulty || '').toLowerCase();
      const cardOS = (card.dataset.os || '').toLowerCase();
      
      // Logic: Match if filter is 'all' OR matches card attribute
      const matchDiff = currentDiff === 'all' || cardDiff === currentDiff;
      const matchOS = currentOS === 'all' || cardOS === currentOS;

      if (matchDiff && matchOS) {
        card.style.display = 'flex'; // or 'block' depending on layout
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Handle "No Results" message
    const noResults = document.querySelector('.no-results');
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Attach Events - Difficulty
  diffButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      console.log('Difficulty clicked:', btn.dataset.difficultyFilter);
      currentDiff = btn.dataset.difficultyFilter.toLowerCase();
      updateActiveButton(diffButtons, btn);
      filterGrid();
    });
  });

  // Attach Events - OS
  osButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      console.log('OS clicked:', btn.dataset.osFilter);
      currentOS = btn.dataset.osFilter.toLowerCase();
      updateActiveButton(osButtons, btn);
      filterGrid();
    });
  });
}

// Run immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHTBFilters);
} else {
  initHTBFilters();
}

// 3. (Optional) Copy Buttons & TOC code here...

