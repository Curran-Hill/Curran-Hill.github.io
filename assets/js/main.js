// ================================
// MOBILE NAVIGATION
// ================================
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav__toggle');
  const navMobile = document.querySelector('.nav__mobile');
  
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function() {
      navMobile.classList.toggle('active');
      
      // Animate hamburger icon
      const icons = navToggle.querySelectorAll('.nav__toggle-icon');
      if (navMobile.classList.contains('active')) {
        icons[0].style.transform = 'rotate(45deg) translateY(7px)';
        icons[1].style.opacity = '0';
        icons[2].style.transform = 'rotate(-45deg) translateY(-7px)';
      } else {
        icons[0].style.transform = 'none';
        icons[1].style.opacity = '1';
        icons[2].style.transform = 'none';
      }
    });
    
    // Close mobile menu when clicking a link
    const mobileLinks = document.querySelectorAll('.nav__mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        navMobile.classList.remove('active');
        const icons = navToggle.querySelectorAll('.nav__toggle-icon');
        icons[0].style.transform = 'none';
        icons[1].style.opacity = '1';
        icons[2].style.transform = 'none';
      });
    });
  }
});

// ================================
// HTB WRITE-UPS FILTERING
// ================================
function initHTBFilters() {
  const difficultyButtons = document.querySelectorAll('[data-difficulty-filter]');
  const osButtons = document.querySelectorAll('[data-os-filter]');
  const cards = document.querySelectorAll('.htb-card');
  const noResults = document.querySelector('.no-results');
  
  if (cards.length === 0) return;
  
  let activeDifficulty = 'all';
  let activeOS = 'all';
  
  // Difficulty filter
  difficultyButtons.forEach(button => {
    button.addEventListener('click', function() {
      difficultyButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      activeDifficulty = this.dataset.difficultyFilter;
      filterCards();
    });
  });
  
  // OS filter
  osButtons.forEach(button => {
    button.addEventListener('click', function() {
      osButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      activeOS = this.dataset.osFilter;
      filterCards();
    });
  });
  
  function filterCards() {
    let visibleCount = 0;
    
    cards.forEach(card => {
      const cardDifficulty = card.dataset.difficulty;
      const cardOS = card.dataset.os;
      
      const matchesDifficulty = activeDifficulty === 'all' || cardDifficulty === activeDifficulty;
      const matchesOS = activeOS === 'all' || cardOS === activeOS;
      
      if (matchesDifficulty && matchesOS) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Show/hide no results message
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }
}

// Initialize HTB filters when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHTBFilters);
} else {
  initHTBFilters();
}

// ================================
// BLOG SEARCH & FILTERING
// ================================
function initBlogFilters() {
  const searchInput = document.querySelector('[data-blog-search]');
  const categoryButtons = document.querySelectorAll('[data-category-filter]');
  const blogPosts = document.querySelectorAll('.blog-post');
  const noResults = document.querySelector('.no-results');
  
  if (blogPosts.length === 0) return;
  
  let activeCategory = 'all';
  let searchTerm = '';
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      searchTerm = this.value.toLowerCase();
      filterPosts();
    });
  }
  
  // Category filter
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      activeCategory = this.dataset.categoryFilter;
      filterPosts();
    });
  });
  
  function filterPosts() {
    let visibleCount = 0;
    
    blogPosts.forEach(post => {
      const postTitle = post.dataset.title || '';
      const postTags = post.dataset.tags || '';
      const postCategory = post.dataset.category || '';
      
      const matchesSearch = searchTerm === '' || 
                           postTitle.includes(searchTerm) || 
                           postTags.includes(searchTerm);
      
      const matchesCategory = activeCategory === 'all' || postCategory === activeCategory;
      
      if (matchesSearch && matchesCategory) {
        post.style.display = '';
        visibleCount++;
      } else {
        post.style.display = 'none';
      }
    });
    
    // Show/hide no results message
    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }
}

// Initialize blog filters when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogFilters);
} else {
  initBlogFilters();
}

// ================================
// CODE COPY BUTTONS
// ================================
function initCodeCopyButtons() {
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(block => {
    const pre = block.parentElement;
    
    // Create copy button
    const button = document.createElement('button');
    button.className = 'code-copy-btn';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    
    // Position button
    pre.style.position = 'relative';
    pre.appendChild(button);
    
    // Copy functionality
    button.addEventListener('click', async function() {
      const code = block.textContent;
      
      try {
        await navigator.clipboard.writeText(code);
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
          button.textContent = 'Copy';
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        button.textContent = 'Error';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      }
    });
  });
}

// Initialize code copy buttons when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCodeCopyButtons);
} else {
  initCodeCopyButtons();
}

// ================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ================================
document.addEventListener('DOMContentLoaded', function() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Skip if href is just "#"
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// ================================
// TABLE OF CONTENTS GENERATION
// ================================
function generateTableOfContents() {
  const tocContainer = document.querySelector('[data-toc]');
  if (!tocContainer) return;
  
  const content = document.querySelector('.post-content');
  if (!content) return;
  
  const headings = content.querySelectorAll('h2, h3');
  if (headings.length === 0) {
    tocContainer.style.display = 'none';
    return;
  }
  
  const tocList = document.createElement('ul');
  tocList.className = 'toc-list';
  
  headings.forEach((heading, index) => {
    // Add ID to heading if it doesn't have one
    if (!heading.id) {
      heading.id = `heading-${index}`;
    }
    
    const listItem = document.createElement('li');
    listItem.className = heading.tagName === 'H3' ? 'toc-item toc-item--sub' : 'toc-item';
    
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.className = 'toc-link';
    link.textContent = heading.textContent;
    
    listItem.appendChild(link);
    tocList.appendChild(listItem);
  });
  
  tocContainer.appendChild(tocList);
}

// Initialize TOC when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', generateTableOfContents);
} else {
  generateTableOfContents();
}