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
  const diffButtons = document.querySelectorAll('[data-difficulty-filter]');
  const osButtons = document.querySelectorAll('[data-os-filter]');
  const searchInput = document.querySelector('[data-htb-search]');
  const cards = document.querySelectorAll('.htb-card');

  let currentDiff = 'all';
  let currentOS = 'all';
  let currentSearch = '';

  function updateActiveButton(buttons, clickedBtn) {
    buttons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
  }

  function filterGrid() {
    let visibleCount = 0;
    cards.forEach(card => {
      const cardDiff = (card.dataset.difficulty || '').toLowerCase();
      const cardOS = (card.dataset.os || '').toLowerCase();
      const cardTitle = (card.dataset.title || '').toLowerCase();
      const cardTags = (card.dataset.tags || '').toLowerCase();

      const matchDiff = currentDiff === 'all' || cardDiff === currentDiff;
      const matchOS = currentOS === 'all' || cardOS === currentOS;
      const matchSearch = currentSearch === '' ||
        cardTitle.includes(currentSearch) ||
        cardTags.includes(currentSearch) ||
        cardOS.includes(currentSearch);

      if (matchDiff && matchOS && matchSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const noResults = document.querySelector('.no-results');
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentDiff = btn.dataset.difficultyFilter.toLowerCase();
      updateActiveButton(diffButtons, btn);
      filterGrid();
    });
  });

  osButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentOS = btn.dataset.osFilter.toLowerCase();
      updateActiveButton(osButtons, btn);
      filterGrid();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value.trim().toLowerCase();
      filterGrid();
    });
  }
}

// Run immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHTBFilters);
} else {
  initHTBFilters();
}

// 3. CTF FILTERS
function initCTFFilters() {
  const categoryButtons = document.querySelectorAll('[data-ctf-category-filter]');
  const eventButtons = document.querySelectorAll('[data-ctf-event-filter]');
  const searchInput = document.querySelector('[data-ctf-search]');
  const cards = document.querySelectorAll('.ctf-card');

  let currentCategory = 'all';
  let currentEvent = 'all';
  let currentSearch = '';

  function updateActiveButton(buttons, clickedBtn) {
    buttons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
  }

  function filterGrid() {
    let visibleCount = 0;
    cards.forEach(card => {
      const cardCategory = (card.dataset.ctfCategory || '').toLowerCase();
      const cardEvent = (card.dataset.ctfEvent || '').toLowerCase();
      const cardTitle = (card.dataset.title || '').toLowerCase();
      const cardTags = (card.dataset.tags || '').toLowerCase();

      const matchCategory = currentCategory === 'all' || cardCategory === currentCategory;
      const matchEvent = currentEvent === 'all' || cardEvent === currentEvent;
      const matchSearch = currentSearch === '' ||
        cardTitle.includes(currentSearch) ||
        cardTags.includes(currentSearch) ||
        cardCategory.includes(currentSearch) ||
        cardEvent.includes(currentSearch);

      if (matchCategory && matchEvent && matchSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const noResults = document.querySelector('.no-results');
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.ctfCategoryFilter.toLowerCase();
      updateActiveButton(categoryButtons, btn);
      filterGrid();
    });
  });

  eventButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentEvent = btn.dataset.ctfEventFilter.toLowerCase();
      updateActiveButton(eventButtons, btn);
      filterGrid();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value.trim().toLowerCase();
      filterGrid();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCTFFilters);
} else {
  initCTFFilters();
}


