// Gallery Page Specific Logic

// Gallery Page States
let activeGalleryCategory = "all";
let currentGalleryPage = 1;
const GALLERY_ITEMS_PER_PAGE = 6;
let galleryItems = [];

// 2. Populate Drive Folder filters dynamically
function renderFilters() {
  const filterRow = document.getElementById("galleryFilters");
  if (!filterRow) return;

  const allChip = `<div class="chip ${activeGalleryCategory === 'all' ? 'active' : ''}" onclick="filterGallery('all', this)">All</div>`;
  const folderChips = globalCategories.map(cat => {
    const isActive = activeGalleryCategory === cat.slug;
    return `<div class="chip ${isActive ? 'active' : ''}" onclick="filterGallery('${cat.slug}', this)">${cat.name}</div>`;
  }).join("");

  filterRow.innerHTML = allChip + folderChips;
}

// 3. Filter category trigger
window.filterGallery = function(cat, chip) {
  // Update state
  activeGalleryCategory = cat;
  currentGalleryPage = 1;

  // Toggle active styling
  document.querySelectorAll('#galleryFilters .chip').forEach(c => c.classList.remove('active'));
  if (chip) {
    chip.classList.add('active');
  } else {
    const match = document.querySelector(`#galleryFilters .chip[onclick*="'${cat}'"]`);
    if (match) match.classList.add('active');
  }

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
        ${itemIndexInFullList < 2 ? '<div class="new-pill mono">New</div>' : ''}
        ${isVideo 
          ? `<video src="${item.src}" muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>` 
          : `<img src="${item.src}" style="width:100%; height:100%; object-fit:cover;">`
        }
        <div class="overlay">
          <div class="cat mono">${item.categoryName}</div>
          <h4>${item.name || 'Sohail Interior'}</h4>
          <div class="meta">Live synced project from Google Drive</div>
        </div>
      </div>
    `;
  }).join("");

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
