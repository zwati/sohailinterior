// Portfolio Page Specific Logic

let projectsData = [];
let activeFilter = 'all';
let cardIntervals = [];

// Inject card slideshow styles dynamically
const slideshowStyles = document.createElement('style');
slideshowStyles.textContent = `
  .project-visual {
    position: relative;
    overflow: hidden;
  }
  .project-visual img.slide, .project-visual video.slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain !important;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  .project-visual img.slide.active, .project-visual video.slide.active {
    position: relative;
    opacity: 1;
  }
  .slideshow-ctrl {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid var(--line);
    color: var(--navy);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    z-index: 10;
    opacity: 1; /* Always visible for accessibility */
    transition: all 0.2s ease;
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
  .slideshow-ctrl.prev {
    left: 12px;
  }
  .slideshow-ctrl.next {
    right: 12px;
  }
  .slideshow-ctrl:hover {
    background: var(--navy);
    color: #fff;
    border-color: var(--navy);
  }
`;
document.head.appendChild(slideshowStyles);

async function loadPortfolioProjects() {
  try {
    const res = await fetch("/api/portfolio-projects");
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const json = await res.json();
    if (json.ok) {
      if (json.projects && json.projects.length > 0) {
        projectsData = json.projects;
      } else {
        console.warn("Portfolio projects from drive are empty.");
        projectsData = [];
      }
    } else {
      throw new Error(json.error || "Unknown server error");
    }
  } catch (err) {
    console.error("Failed to load portfolio projects from Drive:", err);
    projectsData = [];
  }
  renderPortfolioGrid();
}

function renderFilters() {
  const container = document.getElementById('portfolioFilters');
  if (!container) return;

  const categories = [
    { key: 'all', label: 'All Projects' },
    { key: 'residential', label: 'Residential' },
    { key: 'commercial', label: 'Commercial' },
    { key: 'ceiling', label: 'Ceiling Work' }
  ];

  const activeLabel = categories.find(c => c.key === activeFilter)?.label || 'All Projects';

  const desktopHTML = `
    <div class="filter-desktop">
      ${categories.map(cat => {
        const isActive = cat.key === activeFilter;
        return `
          <button class="chip ${isActive ? 'active' : ''}" onclick="filterPortfolio('${cat.key}')">
            ${cat.label}
          </button>
        `;
      }).join('')}
    </div>
  `;

  const mobileHTML = `
    <div class="filter-mobile split-dropdown">
      <div class="split-button-group">
        <button class="split-main" onclick="filterPortfolio('${activeFilter}')">${activeLabel}</button>
        <button class="split-arrow" onclick="toggleFilterMenu(event)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      <div class="split-menu" id="splitMenu">
        ${categories.map(cat => {
          const isActive = cat.key === activeFilter;
          return `
            <button class="split-item ${isActive ? 'active' : ''}" onclick="filterPortfolio('${cat.key}')">
              ${cat.label}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.innerHTML = desktopHTML + mobileHTML;
}

window.toggleFilterMenu = function(e) {
  e.stopPropagation();
  const menu = document.getElementById('splitMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
};

document.addEventListener('click', () => {
  const menu = document.getElementById('splitMenu');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

window.filterPortfolio = function (cat) {
  activeFilter = cat;
  renderFilters(); // Re-render to update active classes and dropdown label
  renderPortfolioGrid();
};

function startCardSlideshows() {
  // Clear any existing intervals
  cardIntervals.forEach(clearInterval);
  cardIntervals = [];

  const cards = document.querySelectorAll('.project-card');
  cards.forEach((card, cardIdx) => {
    const slideshowContainer = card.querySelector('.project-visual');
    if (!slideshowContainer) return;
    const slides = slideshowContainer.querySelectorAll('.slide');
    if (slides.length <= 1) return;

    // Auto cycle slides every 5 seconds as requested
    const interval = setInterval(() => {
      changeCardSlide(cardIdx, 1, slideshowContainer);
    }, 5000);

    cardIntervals.push(interval);
  });
}

window.changeCardSlide = function (projectIdx, dir, explicitContainer = null) {
  const container = explicitContainer || document.getElementById(`slideshow-${projectIdx}`);
  if (!container) return;

  const slides = container.querySelectorAll('.slide');
  if (slides.length <= 1) return;

  let activeIdx = -1;
  slides.forEach((slide, sIdx) => {
    if (slide.classList.contains('active')) {
      activeIdx = sIdx;
    }
  });

  if (activeIdx === -1) return;

  slides[activeIdx].classList.remove('active');

  const nextIdx = (activeIdx + dir + slides.length) % slides.length;
  slides[nextIdx].classList.add('active');

  // If slide is a video, trigger play
  if (slides[nextIdx].tagName === 'VIDEO') {
    slides[nextIdx].play().catch(() => { });
  }
};

function renderPortfolioGrid() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  // Clear any active intervals before redraw
  cardIntervals.forEach(clearInterval);
  cardIntervals = [];

  const filtered = activeFilter === 'all'
    ? projectsData
    : projectsData.filter(p => p.category === activeFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: span 3; text-align:center; padding: 60px; color: #6b7f97;">No projects found. Check back soon.</div>`;
    return;
  }

  grid.innerHTML = filtered.map((p, idx) => {
    const mediaHTML = (p.items || []).map((item, itemIdx) => {
      const isActive = itemIdx === 0 ? 'active' : '';
      if (item.type === 'video') {
        return `<video src="${item.src}" class="slide ${isActive}" muted loop playsinline></video>`;
      } else {
        return `<img src="${item.src}" class="slide ${isActive}" alt="${p.name}" loading="lazy">`;
      }
    }).join('');

    const controlsHTML = p.items && p.items.length > 1
      ? `
        <button class="slideshow-ctrl prev" onclick="event.stopPropagation(); changeCardSlide(${idx}, -1)">&#8592;</button>
        <button class="slideshow-ctrl next" onclick="event.stopPropagation(); changeCardSlide(${idx}, 1)">&#8594;</button>
      `
      : '';

    return `
      <div class="project-card reveal" onclick="openProjectLightbox(${idx})">
        <div class="project-visual fade-load" id="slideshow-${idx}">
          <div class="loading-glass" style="z-index: 5;"></div>
          ${mediaHTML}
          ${controlsHTML}
          <div class="project-category-badge">${p.catLabel}</div>
        </div>
        <div class="project-info">
          <div class="project-location">${p.location}</div>
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="project-footer-tag">
            <span>Completed Installation</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Fade out loader once first image loads
  grid.querySelectorAll('.project-visual.fade-load').forEach(el => {
    const firstImg = el.querySelector('img.slide');
    const glass = el.querySelector('.loading-glass');
    if (!glass) return;

    if (firstImg) {
      if (firstImg.complete) {
        glass.remove();
      } else {
        firstImg.addEventListener('load', () => {
          glass.style.opacity = '0';
          setTimeout(() => glass.remove(), 600);
        });
      }
    } else {
      glass.remove(); // No images (maybe only video), remove immediately
    }
  });

  if (window.revealCheck) {
    window.revealCheck();
  }

  // Trigger setup of auto-slideshows for active cards
  setTimeout(startCardSlideshows, 100);
}

window.openProjectLightbox = function (projectIdx) {
  const filtered = activeFilter === 'all'
    ? projectsData
    : projectsData.filter(p => p.category === activeFilter);

  const project = filtered[projectIdx];
  if (!project || !project.items || project.items.length === 0) return;

  // Find the index of the currently active slide on the card
  let activeSlideIdx = 0;
  const container = document.getElementById(`slideshow-${projectIdx}`);
  if (container) {
    const slides = container.querySelectorAll('.slide');
    slides.forEach((slide, sIdx) => {
      if (slide.classList.contains('active')) {
        activeSlideIdx = sIdx;
      }
    });
  }

  // Map the project's media items to format expected by lightbox slideshow
  const formattedItems = project.items.map(item => ({
    id: item.id,
    name: item.name || project.name,
    type: item.type,
    src: item.src,
    categoryName: project.catLabel
  }));

  if (formattedItems.length > 0 && window.openLightbox) {
    window.openLightbox(activeSlideIdx, formattedItems);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderFilters();
  loadPortfolioProjects();
});
