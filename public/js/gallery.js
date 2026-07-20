// Gallery Page Specific Logic

// Gallery Page States
let activeGalleryCategory = "all";
let currentGalleryPage = 1;
const GALLERY_ITEMS_PER_PAGE = 40;
let galleryItems = [];

// 2. Populate Drive Folder filters dynamically
function renderFilters() {
  const filterRow = document.getElementById("galleryFilters");
  if (!filterRow) return;

  const categories = [{ slug: 'all', name: 'All' }, ...globalCategories];
  const activeLabel = categories.find(c => c.slug === activeGalleryCategory)?.name || 'All';

  filterRow.innerHTML = `
    <div class="split-dropdown system-theme">
      <div class="split-button-group">
        <button class="split-main" onclick="filterGallery('${activeGalleryCategory}')">${activeLabel}</button>
        <button class="split-arrow" onclick="toggleGalleryFilterMenu(event)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      <div class="split-menu" id="gallerySplitMenu">
        ${categories.map(cat => {
          const isActive = cat.slug === activeGalleryCategory;
          return `
            <button class="split-item ${isActive ? 'active' : ''}" onclick="filterGallery('${cat.slug}')">
              ${cat.name}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

window.toggleGalleryFilterMenu = function(e) {
  e.stopPropagation();
  const menu = document.getElementById('gallerySplitMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
};

document.addEventListener('click', () => {
  const menu = document.getElementById('gallerySplitMenu');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

// 3. Filter category trigger
window.filterGallery = function(cat) {
  // Update state
  activeGalleryCategory = cat;
  currentGalleryPage = 1;

  renderFilters();

  // Update history query parameter
  const searchParams = new URLSearchParams(window.location.search);
  if (cat === 'all') {
    searchParams.delete('category');
  } else {
    searchParams.set('category', cat);
  }
  const queryStr = searchParams.toString();
  const cleanUrl = window.location.pathname + (queryStr ? '?' + queryStr : '');
  window.history.pushState({ path: cleanUrl }, '', cleanUrl);

  // Redraw grid
  renderGalleryGrid();
};

window.changeGalleryPage = function(page) {
  currentGalleryPage = page;
  renderGalleryGrid();
  document.getElementById("galleryPage").scrollIntoView({ behavior: "smooth" });
};

// 4. Render Grid Items matching active category
function renderGalleryGrid() {
  const grid = document.getElementById("galleryGrid");
  const paginationContainer = document.getElementById("galleryPagination");
  if (!grid || !paginationContainer) return;

  let items = [];
  if (activeGalleryCategory === "all") {
    globalCategories.forEach(cat => {
      cat.items.forEach(item => {
        items.push({ ...item, categoryName: cat.name });
      });
    });
  } else {
    const matchedCat = globalCategories.find(c => c.slug === activeGalleryCategory);
    if (matchedCat) {
      items = matchedCat.items.map(item => ({ ...item, categoryName: matchedCat.name }));
    }
  }

  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column: span 3; text-align:center; padding: 60px; color: #6b7f97;">No media files found in this category.</div>`;
    paginationContainer.innerHTML = "";
    return;
  }

  // Apply Pagination
  const paginated = Pagination.paginate(items, currentGalleryPage, GALLERY_ITEMS_PER_PAGE);

  galleryItems = items;
  grid.innerHTML = paginated.items.map((item, idx) => {
    const isVideo = item.type === "video";
    const itemIndexInFullList = (paginated.currentPage - 1) * GALLERY_ITEMS_PER_PAGE + idx;

    return `
      <div class="gcard reveal" data-lightbox-index="${itemIndexInFullList}">
        ${item.isNew ? '<div class="new-pill mono">New</div>' : ''}
        <div class="loading-glass"></div>
        ${isVideo
          ? `<video src="${item.src}" muted playsinline></video>`
          : `<img src="${item.src}" alt="${item.name || 'Sohail Interior'}">`
        }
        <div class="overlay">
          <div class="cat mono">${item.categoryName}</div>
          <h4>${item.name || 'Sohail Interior'}</h4>
          <div class="meta">Live synced project from Google Drive</div>
        </div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll('.gcard').forEach(card => {
    const glass = card.querySelector('.loading-glass');
    const media = card.querySelector('img, video');
    if (!glass || !media) return;

    const onReady = () => {
      media.classList.add('loaded');
      glass.style.opacity = '0';
      setTimeout(() => glass.remove(), 500);
    };

    if (media.tagName === 'IMG') {
      if (media.complete && media.naturalWidth > 0) {
        onReady();
      } else {
        media.addEventListener('load', onReady, { once: true });
        media.addEventListener('error', onReady, { once: true });
      }
    } else if (media.readyState >= 2) {
      onReady();
    } else {
      media.addEventListener('loadeddata', onReady, { once: true });
      media.addEventListener('error', onReady, { once: true });
    }
  });

  // Paginated navigation links
  paginationContainer.innerHTML = Pagination.generateHTML(paginated.currentPage, paginated.totalPages, "changeGalleryPage");

  bindGalleryClicks();
  if (window.revealCheck) window.revealCheck();
}

function bindGalleryClicks() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  grid.removeEventListener('click', onGalleryItemClick);
  grid.addEventListener('click', onGalleryItemClick);
}

function onGalleryItemClick(event) {
  const card = event.target.closest('.gcard');
  if (!card) return;
  const index = Number(card.dataset.lightboxIndex);
  if (!Number.isFinite(index)) return;
  openLightbox(index, galleryItems);
}

// Check category parameters on startup
function checkURLParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category');
  if (cat) {
    activeGalleryCategory = cat;
  }
}

// Initial startup tasks
function init() {
  checkURLParams();
  if (globalCategories && globalCategories.length > 0) {
    renderFilters();
    renderGalleryGrid();
  }
}

document.addEventListener("DOMContentLoaded", init);

// Listen to common.js categories fetcher loading completion
window.addEventListener("categoriesLoaded", (e) => {
  renderFilters();
  renderGalleryGrid();
});
