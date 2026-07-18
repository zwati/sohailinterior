// Materials Page Specific Logic

// 2. Dynamic Materials Dataset with static fallback
let materialsData = window.materialsData || [
  {id:'BLN-01', name:'Window Blinds', cat:'blinds', catLabel:'Blinds', price: 250, priceText:'Rs.250 - Rs.360 / sqft', texture:'t-blinds', desc:'Premium window blinds. Available in Roller (Rs.250/sf), Zebra (Rs.360/sf), and Bamboo (Rs.250/sf).', finishes:['Roller','Zebra','Bamboo'], colors:['#eaf2fa','#c9d6e4','#aebfd2']},
  {id:'CGY-01', name:'2x2 Ceiling', cat:'ceiling-gypsum', catLabel:'2x2 Ceiling', price: 70, priceText:'Rs.70 / sqft', texture:'t-gypsum', desc:'Clean 2x2 celling paneling — moisture-resistant and durable false ceiling.', finishes:['Standard Grid','Slim Line'], colors:['#f5f8fb','#e4ecf4','#d7e2ee']},
  {id:'FWP-01', name:'Fabric Wallpaper', cat:'fabric-wallpaper', catLabel:'Fabric Wallpaper', price: 45, priceText:'Rs.45 / sqft', texture:'t-fabric', desc:'Woven-texture fabric wallpaper, warm and elegant wall finish.', finishes:['Plain Weave','Textured'], colors:['#f5f0e6','#e7d3ae','#d9c295']},
  {id:'FDR-01', name:'Fiber Door A+', cat:'fiber-doors', catLabel:'Fiber Doors', price: 900, priceText:'Rs.900 / sqft', texture:'t-fiberdoor', desc:'A+ Grade fiber doors, water-proof and heavy duty construction.', finishes:['Solid Finish','Wood Textured'], colors:['#12345c','#2f6fb0','#7db9e8']},
  {id:'PW8-01', name:'PVC Wall Panel 8 Inch', cat:'pvc-wall-panel-8', catLabel:'PVC Wall Panel 8"', price: 700, priceText:'Rs.700 / sheet', texture:'t-panel8', desc:'Premium 8-inch width PVC paneling for moisture protection and decor.', finishes:['Matte','Glossy'], colors:['#dfe8f1','#c9d6e4','#b6c4d6']},
  {id:'PUC-01', name:'PVC Updown Ceiling', cat:'pvc-updown-ceiling', catLabel:'PVC Updown Ceiling', price: 200, priceText:'Rs.200 / sqft', texture:'t-pop', desc:'Modern stepped updown ceiling layout with integrated cove lighting.', finishes:['Double Layer','Stepped Edge'], colors:['#eef3f8','#dde7f1','#cfdcea']},
  {id:'PW10-01', name:'PVC Wall Panel 10 Inch', cat:'pvc-wall-panel-10', catLabel:'PVC Wall Panel 10"', price: 430, priceText:'Rs.430 / sheet', texture:'t-panel10', desc:'10-inch width PVC paneling — bold layout spacing, highly cost-effective.', finishes:['Matte','Woodgrain'], colors:['#e4ecf4','#b6c4d6','#8ea0b5']}
];

// Page States
let currentFilter = 'all';
let currentSort = 'best';
let currentCatalogPage = 1;
const CATALOG_ITEMS_PER_PAGE = 8;
let currentQty = 1;

// 3. Grid Columns Selector
window.setGridCols = function(n, btn) {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  grid.className = 'pgrid cols-' + (n === 4 ? '' : n);
  document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

let filterCategories = [
  { filter: 'all', label: 'All' },
  { filter: 'blinds', label: 'Blinds' },
  { filter: 'ceiling-gypsum', label: 'Ceiling Gypsum' },
  { filter: 'fabric-wallpaper', label: 'Fabric Wallpaper' },
  { filter: 'fiber-doors', label: 'Fiber Doors' },
  { filter: 'pvc-wooden-door', label: 'PVC Wooden Style Door' },
  { filter: 'pvc-wall-panel-8', label: 'PVC Wall Panel 8"' },
  { filter: 'pvc-updown-ceiling', label: 'PVC Updown Ceiling' },
  { filter: 'pvc-wall-panel-10', label: 'PVC Wall Panel 10"' },
  { filter: 'vinyl', label: 'Vinyl' }
];

function updateFiltersList(categories) {
  if (!categories || categories.length === 0) return;
  filterCategories = [{ filter: 'all', label: 'All' }];
  categories.forEach(cat => {
    filterCategories.push({ filter: cat.slug, label: cat.name });
  });
}

function renderMaterialsFilters() {
  const filterRow = document.getElementById("materialsFilters");
  if (!filterRow) return;

  const activeLabel = filterCategories.find(c => c.filter === currentFilter)?.label || 'All';

  const desktopHTML = `
    <div class="filter-desktop">
      ${filterCategories.map(cat => {
        const isActive = currentFilter === cat.filter;
        return `<div class="chip ${isActive ? 'active' : ''}" onclick="filterMaterials('${cat.filter}')">${cat.label}</div>`;
      }).join('')}
    </div>
  `;

  const mobileHTML = `
    <div class="filter-mobile split-dropdown">
      <div class="split-button-group">
        <button class="split-main" onclick="filterMaterials('${currentFilter}')">${activeLabel}</button>
        <button class="split-arrow" onclick="toggleMaterialsFilterMenu(event)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      <div class="split-menu" id="materialsSplitMenu">
        ${filterCategories.map(cat => {
          const isActive = cat.filter === currentFilter;
          return `
            <button class="split-item ${isActive ? 'active' : ''}" onclick="filterMaterials('${cat.filter}')">
              ${cat.label}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;

  filterRow.innerHTML = desktopHTML + mobileHTML;
}

window.toggleMaterialsFilterMenu = function(e) {
  e.stopPropagation();
  const menu = document.getElementById('materialsSplitMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
};

document.addEventListener('click', () => {
  const menu = document.getElementById('materialsSplitMenu');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

// 4. Category Filter Selector
window.filterMaterials = function(cat) {
  currentFilter = cat;
  currentCatalogPage = 1;
  renderMaterialsFilters();
  renderCatalog();
};

// 5. Sorting Selector
window.handleSortChange = function(criteria) {
  currentSort = criteria;
  currentCatalogPage = 1;
  renderCatalog();
};

// 6. Pagination Page Selector
window.changeCatalogPage = function(page) {
  currentCatalogPage = page;
  renderCatalog();
  document.getElementById("materialsPage").scrollIntoView({ behavior: "smooth" });
};

// Helper card rendering
function pcardHTML(m) {
  const isNew = ['PW8-01', 'PUC-01'].includes(m.id);
  const swatchHTML = m.colors.map(c => `<span style="background:${c}"></span>`).join('');
  
  const isUrl = m.texture.startsWith('/') || m.texture.startsWith('http');
  const thumbStyle = isUrl ? `style="background-image: url('${m.texture}'); background-size: cover; background-position: center;"` : '';
  const thumbClass = isUrl ? 'thumb' : `thumb ${m.texture}`;

  return `
    <div class="pcard reveal" data-material-id="${m.id}">
      <div class="${thumbClass}" ${thumbStyle}>
        ${isNew ? '<div class="new-pill mono">New</div>' : ''}
      </div>
      <div class="pbody">
        <h4>${m.name}</h4>
        <div class="price">${m.priceText}</div>
        <div class="swatch-dots">${swatchHTML}</div>
      </div>
    </div>
  `;
}

// 7. Render Catalog Items
function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  const paginationContainer = document.getElementById('catalogPagination');
  if (!grid || !paginationContainer) return;

  // Filter items
  let items = currentFilter === 'all' 
    ? [...materialsData] 
    : materialsData.filter(m => m.cat === currentFilter);

  // Sort items
  if (currentSort === 'low-high') {
    items.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'high-low') {
    items.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'alphabetical') {
    items.sort((a, b) => a.name.localeCompare(b.name));
  } // 'best' preserves original sorting array

  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column: span 4; text-align:center; padding: 40px; color: #6b7f97;">No products match criteria.</div>`;
    paginationContainer.innerHTML = '';
    return;
  }

  // Paginate items
  const paginated = Pagination.paginate(items, currentCatalogPage, CATALOG_ITEMS_PER_PAGE);

  grid.innerHTML = paginated.items.map(pcardHTML).join('');
  
  // Pagination navigation links
  paginationContainer.innerHTML = Pagination.generateHTML(paginated.currentPage, paginated.totalPages, "changeCatalogPage");
  bindCatalogClicks();
  
  if (window.revealCheck) window.revealCheck();
}

// 8. Detailed View Panel Handling
window.openDetail = function(id) {
  const m = materialsData.find(x => x.id === id);
  if (!m) return;

  // Update history query parameter for link sharing
  const newUrl = `${window.location.pathname}?id=${id}`;
  window.history.pushState({ path: newUrl }, '', newUrl);

  // Bind properties to DOM elements
  document.getElementById('dCrumbName').textContent = m.name;
  document.getElementById('dName').textContent = m.name;
  document.getElementById('dPrice').textContent = m.priceText;
  document.getElementById('dDesc').textContent = m.desc;
  document.getElementById('dSku').textContent = m.id;
  document.getElementById('dCat').textContent = m.catLabel;
  const mainImg = document.getElementById('dMainImg');
  if (mainImg) {
    if (m.texture.startsWith('/') || m.texture.startsWith('http')) {
      mainImg.className = 'gallery-main';
      mainImg.style.backgroundImage = `url('${m.texture}')`;
      mainImg.style.backgroundSize = 'cover';
      mainImg.style.backgroundPosition = 'center';
    } else {
      mainImg.className = 'gallery-main ' + m.texture;
      mainImg.style.backgroundImage = '';
    }
  }
  
  // Set images thumbnails from category items
  const siblingItems = materialsData.filter(x => x.cat === m.cat).slice(0, 3);
  document.getElementById('dThumbs').innerHTML = siblingItems
    .map((thItem, i) => {
      const isUrl = thItem.texture.startsWith('/') || thItem.texture.startsWith('http');
      const thumbStyle = isUrl 
        ? `style="background-image: url('${thItem.texture}'); background-size: cover; background-position: center;"`
        : `style="opacity:${1 - i * 0.15}"`;
      const thumbClass = isUrl ? 'th' : `th ${thItem.texture}`;
      return `<div class="${thumbClass} ${thItem.id === m.id ? 'active' : ''}" ${thumbStyle} onclick="highlightThumb(this); swapDetailImage('${thItem.texture}')"></div>`;
    })
    .join('');

  // Set detailed finishes selector
  document.getElementById('dFinishes').innerHTML = m.finishes
    .map((f, i) => `<button class="opt-btn ${i === 0 ? 'active' : ''}" onclick="selectOpt(this, 'finish')">${f}</button>`)
    .join('');

  // Set tones color selector
  document.getElementById('dColors').innerHTML = m.colors
    .map((c, i) => `<div class="color-dot ${i === 0 ? 'active' : ''}" style="background:${c}" onclick="selectOpt(this, 'color')"></div>`)
    .join('');

  // Reset Quantity
  currentQty = 1;
  document.getElementById('dQty').textContent = 1;

  // Setup WhatsApp Enquiry details
  const waBtn = document.getElementById('dWhatsAppBtn');
  if (waBtn) {
    waBtn.onclick = () => {
      const selectedFinish = document.querySelector('#dFinishes .opt-btn.active')?.textContent || 'Standard';
      const colorEl = document.querySelector('#dColors .color-dot.active');
      const selectedTone = colorEl ? colorEl.style.backgroundColor || colorEl.style.background : 'Default';
      const msg = `Hi Sohail Interior, I am interested in the ${m.name} (${m.id}) in finish: ${selectedFinish} and tone: ${selectedTone}. Quantity: ${currentQty}.`;
      window.open(`https://wa.me/923115813505?text=${encodeURIComponent(msg)}`, '_blank');
    };
  }

  // Setup Add to Quote local cart
  const addQuoteBtn = document.getElementById('dAddQuoteBtn');
  if (addQuoteBtn) {
    addQuoteBtn.onclick = () => {
      const selectedFinish = document.querySelector('#dFinishes .opt-btn.active')?.textContent || 'Standard';
      const colorEl = document.querySelector('#dColors .color-dot.active');
      const selectedTone = colorEl ? colorEl.style.backgroundColor || colorEl.style.background : 'Default';
      window.QuoteCart.add(m.id, selectedFinish, selectedTone, currentQty);
      window.openCartDrawer();
    };
  }

  // Setup Save to Wishlist local wishlist
  const wishlistBtn = document.getElementById('dWishlistBtn');
  if (wishlistBtn) {
    const updateWishlistBtnText = () => {
      const saved = window.Wishlist.get();
      if (saved.includes(m.id)) {
        wishlistBtn.textContent = '♥ Saved';
        wishlistBtn.style.color = '#d9534f';
      } else {
        wishlistBtn.textContent = '♥ Save';
        wishlistBtn.style.color = '';
      }
    };
    updateWishlistBtnText();

    wishlistBtn.onclick = () => {
      window.Wishlist.toggle(m.id);
      updateWishlistBtnText();
    };
  }

  // Populate Related items list
  const related = materialsData.filter(x => x.cat === m.cat && x.id !== m.id).slice(0, 4);
  const fill = related.length < 4 
    ? materialsData.filter(x => x.id !== m.id && !related.includes(x)).slice(0, 4 - related.length) 
    : [];
  
  document.getElementById('relatedGrid').innerHTML = [...related, ...fill].map(pcardHTML).join('');

  // Swap pages display
  document.getElementById('materialsPage').style.display = 'none';
  document.getElementById('detailPage').style.display = 'block';
  window.scrollTo({ top: 0 });
  
  if (window.revealCheck) window.revealCheck();
};

window.closeDetailView = function() {
  // Strip URL query parameter
  const cleanUrl = window.location.pathname;
  window.history.pushState({ path: cleanUrl }, '', cleanUrl);

  // Swap panels
  document.getElementById('detailPage').style.display = 'none';
  document.getElementById('materialsPage').style.display = 'block';
  window.scrollTo({ top: 0 });
};

window.selectOpt = function(el, type) {
  const parent = el.parentElement;
  parent.querySelectorAll(type === 'finish' ? '.opt-btn' : '.color-dot').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
};

window.highlightThumb = function(el) {
  document.querySelectorAll('.gallery-thumbs .th').forEach(th => th.classList.remove('active'));
  el.classList.add('active');
};

window.stepQty = function(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById('dQty').textContent = currentQty;
};

function bindCatalogClicks() {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  grid.removeEventListener('click', onCatalogItemClick);
  grid.addEventListener('click', onCatalogItemClick);
}

function onCatalogItemClick(event) {
  const card = event.target.closest('.pcard');
  if (!card) return;
  const id = card.dataset.materialId;
  if (id) openDetail(id);
}

window.swapDetailImage = function(src) {
  const mainImg = document.getElementById('dMainImg');
  if (!mainImg) return;
  if (src.startsWith('/') || src.startsWith('http')) {
    mainImg.className = 'gallery-main';
    mainImg.style.backgroundImage = `url('${src}')`;
  } else {
    mainImg.className = 'gallery-main ' + src;
    mainImg.style.backgroundImage = '';
  }
};

// Initial startup tasks
document.addEventListener("DOMContentLoaded", () => {
  // If categories are already fetched (resolves fast cache race condition)
  if (window.globalCategories && window.globalCategories.length > 0) {
    materialsData = window.materialsData;
    updateFiltersList(window.globalCategories);
  }

  renderMaterialsFilters();
  renderCatalog();

  // Route check by query parameters
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const catFilter = params.get('category');
  
  if (productId) {
    openDetail(productId);
  } else if (catFilter) {
    filterMaterials(catFilter);
  }
});

// Update when categories are loaded from Google Drive API
window.addEventListener("categoriesLoaded", (e) => {
  materialsData = window.materialsData;
  updateFiltersList(e.detail);
  renderMaterialsFilters();
  renderCatalog();

  // Route check by query parameters again to open dynamic product if matched
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (productId) {
    openDetail(productId);
  }
});
