// Materials Page — Category-Based View
// Each card = one Drive folder; detail = full paginated gallery of all images/videos in that folder.

// ─── Constants ────────────────────────────────────────────────────────────────
const GALLERY_PER_PAGE = 16;   // thumbs per page inside detail view
const CATALOG_PER_PAGE = 12;   // max category cards per catalog page

// ─── State ───────────────────────────────────────────────────────────────────
let categoriesData = [];   // [{slug, name, texture, items:[{id,name,src,type}]}]
let activeCatSlug = null;
let currentGalleryPage = 1;
let currentCatalogPage = 1;
let currentSort = 'best';
let currentQty = 1;    // qty stepper in detail view
let selectedFinish = 'Standard Finish';
let selectedColor = '#eaf2fa';
let activeItem = null; // currently selected file item or category fallback
let currentFilteredItems = []; // filtered items list
let slideshowTimers = {};   // slug → intervalId
let slideshowEnabled = false;

// ─── Static metadata for details & pricing ────────────────────────────────────
const STATIC_METADATA = {
  'blinds': {
    price: 250,
    priceText: 'Rs.250 - Rs.360 / sqft',
    finishPrices: {
      'Roller': 250,
      'Zebra': 360,
      'Bamboo': 250
    },
    unit: 'sqft',
    desc: 'Premium window blinds. Available in Roller (Rs.250/sf), Zebra (Rs.360/sf), and Bamboo (Rs.250/sf).',
    finishes: ['Roller', 'Zebra', 'Bamboo'],
    colors: ['#eaf2fa', '#c9d6e4', '#aebfd2']
  },
  'ceiling-gypsum': {
    price: 70,
    priceText: 'Rs.70 / sqft',
    unit: 'sqft',
    desc: 'Clean 2x2 ceiling paneling — moisture-resistant and durable false ceiling.',
    finishes: ['Standard Grid', 'Slim Line'],
    colors: ['#f5f8fb', '#e4ecf4', '#d7e2ee']
  },
  'fabric-wallpaper': {
    price: 45,
    priceText: 'Rs.45 / sqft',
    unit: 'sqft',
    desc: 'Woven-texture fabric wallpaper, warm and elegant wall finish.',
    finishes: ['Plain Weave', 'Textured'],
    colors: ['#f5f0e6', '#e7d3ae', '#d9c295']
  },
  'fiber-doors': {
    price: 900,
    priceText: 'Rs.900 / sqft',
    unit: 'sqft',
    desc: 'A+ Grade fiber doors, water-proof and heavy duty construction.',
    finishes: ['Solid Finish', 'Wood Textured'],
    colors: ['#12345c', '#2f6fb0', '#7db9e8']
  },
  'pvc-wall-panel-8': {
    price: 700,
    priceText: 'Rs.700 / sheet',
    unit: 'sheet',
    desc: 'Premium 8-inch width PVC paneling for moisture protection and decor.',
    finishes: ['Matte', 'Glossy'],
    colors: ['#dfe8f1', '#c9d6e4', '#b6c4d6']
  },
  'pvc-updown-ceiling': {
    price: 200,
    priceText: 'Rs.200 / sqft',
    unit: 'sqft',
    desc: 'Modern stepped updown ceiling layout with integrated cove lighting.',
    finishes: ['Double Layer', 'Stepped Edge'],
    colors: ['#eef3f8', '#dde7f1', '#cfdcea']
  },
  'pvc-wall-panel-10': {
    price: 430,
    priceText: 'Rs.430 / sheet',
    unit: 'sheet',
    desc: '10-inch width PVC paneling — bold layout spacing, highly cost-effective.',
    finishes: ['Matte', 'Woodgrain'],
    colors: ['#e4ecf4', '#b6c4d6', '#8ea0b5']
  }
};


// ─── Static fallback shown before API loads ───────────────────────────────────
const STATIC_FALLBACK = [
  { slug: 'blinds', name: 'Window Blinds', texture: 't-blinds' },
  { slug: 'ceiling-gypsum', name: '2×2 Ceiling', texture: 't-gypsum' },
  { slug: 'fabric-wallpaper', name: 'Fabric Wallpaper', texture: 't-fabric' },
  { slug: 'fiber-doors', name: 'Fiber Door A+', texture: 't-fiberdoor' },
  { slug: 'pvc-wall-panel-8', name: 'PVC Wall Panel 8"', texture: 't-panel8' },
  { slug: 'pvc-updown-ceiling', name: 'PVC Updown Ceiling', texture: 't-pop' },
  { slug: 'pvc-wall-panel-10', name: 'PVC Wall Panel 10"', texture: 't-panel10' },
];

// Slug → CSS texture class fallback map
const TEXTURE_MAP = {
  'blinds': 't-blinds',
  'ceiling-gypsum': 't-gypsum',
  'fabric-wallpaper': 't-fabric',
  'fiber-doors': 't-fiberdoor',
  'pvc-wall-panel-8': 't-panel8',
  'pvc-updown-ceiling': 't-pop',
  'pvc-wall-panel-10': 't-panel10',
  'vinyl': 't-vinyl',
};

// ─── Grid cols toggle ─────────────────────────────────────────────────────────
window.setGridCols = function (n, btn) {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  grid.className = 'pgrid' + (n !== 4 ? ` cols-${n}` : '');
  document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

// ─── Sort handler ─────────────────────────────────────────────────────────────
window.handleSortChange = function (val) {
  currentSort = val;
  currentCatalogPage = 1;
  renderCatalog();
};

// ─── Catalog page navigation ──────────────────────────────────────────────────
window.changeCatalogPage = function (page) {
  currentCatalogPage = page;
  renderCatalog();
  document.getElementById('materialsPage')?.scrollIntoView({ behavior: 'smooth' });
};

// ─── Slideshow helpers ────────────────────────────────────────────────────────
function clearSlideshows() {
  Object.values(slideshowTimers).forEach(clearInterval);
  slideshowTimers = {};
}

window.toggleSlideshow = function () {
  slideshowEnabled = !slideshowEnabled;
  const btn = document.getElementById('slideshowToggleBtn');
  if (btn) {
    if (slideshowEnabled) {
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Slideshow: ON`;
      btn.style.background = 'var(--navy)';
      btn.style.color = '#fff';
      btn.style.borderColor = 'var(--navy)';
      // Start slideshows for visible cards
      document.querySelectorAll('.cat-card').forEach(card => {
        const slug = card.dataset.catSlug;
        const cat = categoriesData.find(c => c.slug === slug);
        if (cat) startSlideshow(cat);
      });
    } else {
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-14 9V3z"/></svg> Slideshow: OFF`;
      btn.style.background = '#fff';
      btn.style.color = 'var(--navy)';
      btn.style.borderColor = 'var(--line)';
      clearSlideshows();
    }
  }
};

function startSlideshow(cat) {
  const el = document.getElementById(`slide-${cat.slug}`);
  if (!el) return;
  const imgs = cat.items.filter(it => it.type !== 'video' && it.src);
  if (imgs.length < 2) return;   // nothing to cycle

  // Convert to layer-based slideshow
  el.style.backgroundImage = 'none'; // Remove static bg

  // Ensure count pill stays on top
  const countPill = el.querySelector('.cat-count-pill');
  if (countPill) countPill.style.zIndex = '10';

  // Prevent multiple timers
  if (slideshowTimers[cat.slug]) clearInterval(slideshowTimers[cat.slug]);

  // Initial layer
  const existingLayers = Array.from(el.querySelectorAll('.slide-layer'));
  let currentLayer;

  if (existingLayers.length > 0) {
    currentLayer = existingLayers.pop();
    existingLayers.forEach(l => l.remove());
  } else {
    currentLayer = document.createElement('div');
    currentLayer.className = 'slide-layer';
    currentLayer.style.backgroundImage = `url('${imgs[0].src}')`;
    currentLayer.style.transform = 'translateX(0)';
    el.insertBefore(currentLayer, el.firstChild);
  }

  let idx = 0;
  if (currentLayer.style.backgroundImage) {
    const bgUrlMatch = currentLayer.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/i);
    if (bgUrlMatch && bgUrlMatch[1]) {
      const foundIdx = imgs.findIndex(img => img.src === bgUrlMatch[1]);
      if (foundIdx !== -1) idx = foundIdx;
    }
  }

  slideshowTimers[cat.slug] = setInterval(() => {
    idx = (idx + 1) % imgs.length;

    // Setup new layer entering from right
    let nextLayer = document.createElement('div');
    nextLayer.className = 'slide-layer';
    nextLayer.style.backgroundImage = `url('${imgs[idx].src}')`;
    nextLayer.style.transform = 'translateX(100%)';
    el.insertBefore(nextLayer, countPill ? countPill : null);

    // Force reflow
    void nextLayer.offsetWidth;

    // Trigger transition
    currentLayer.style.transform = 'translateX(-100%)';
    nextLayer.style.transform = 'translateX(0)';

    // Cleanup old layer
    const layerToRemove = currentLayer;
    setTimeout(() => {
      if (layerToRemove.parentNode) {
        layerToRemove.remove();
      }
    }, 600); // matches the 0.6s CSS transition

    currentLayer = nextLayer;
  }, 5000);
}

// ─── Catalog card HTML ────────────────────────────────────────────────────────
function catCardHTML(cat) {
  const firstImg = cat.items.find(it => it.type !== 'video' && it.src);
  const hasRealImg = firstImg && (firstImg.src.startsWith('/') || firstImg.src.startsWith('http'));
  const thumbCls = hasRealImg
    ? 'thumb cat-slideshow fade-load'
    : `thumb cat-slideshow ${cat.texture || 't-gypsum'}`;
  const thumbStyle = hasRealImg
    ? `background-size:cover;background-position:center;`
    : '';
  const dataSrc = hasRealImg ? `data-bg-src="${firstImg.src}"` : '';
  const count = cat.items.length;

  return `
    <div class="pcard cat-card reveal" data-cat-slug="${cat.slug}">
      <div class="${thumbCls}" id="slide-${cat.slug}" style="${thumbStyle}" ${dataSrc}>
        ${hasRealImg ? `<div class="loading-glass"></div>` : ''}
        ${count > 0 ? `<div class="cat-count-pill mono">${count}</div>` : ''}
      </div>
      <div class="pbody">
        <h4>${cat.name}</h4>
        <div class="price">${count > 0 ? `${count} item${count !== 1 ? 's' : ''}` : 'View collection'}</div>
      </div>
    </div>`;
}

// ─── Render catalog (one card per category) ───────────────────────────────────
function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  const pagEl = document.getElementById('catalogPagination');
  if (!grid) return;

  clearSlideshows();

  let cats = [...categoriesData];
  if (currentSort === 'alphabetical') cats.sort((a, b) => a.name.localeCompare(b.name));

  if (cats.length === 0) {
    grid.innerHTML = `<div style="grid-column:span 4;text-align:center;padding:40px;color:#6b7f97;">No categories available.</div>`;
    if (pagEl) pagEl.innerHTML = '';
    return;
  }

  const paginated = Pagination.paginate(cats, currentCatalogPage, CATALOG_PER_PAGE);
  grid.innerHTML = paginated.items.map(catCardHTML).join('');

  if (pagEl) {
    pagEl.innerHTML = Pagination.generateHTML(paginated.currentPage, paginated.totalPages, 'changeCatalogPage');
  }

  // Event delegation for card clicks
  grid.removeEventListener('click', onCatalogClick);
  grid.addEventListener('click', onCatalogClick);

  // Fade in card images once loaded
  grid.querySelectorAll('.fade-load').forEach(el => {
    const src = el.getAttribute('data-bg-src');
    if (src) {
      const img = new Image();
      img.onload = () => {
        // Only set background if it hasn't been cleared by the slideshow
        if (el.style.backgroundImage !== 'none') {
          el.style.backgroundImage = `url('${src}')`;
        }
        const glass = el.querySelector('.loading-glass');
        if (glass) {
          glass.style.opacity = '0';
          setTimeout(() => glass.remove(), 600);
        }
      };
      img.src = src;
    }
  });

  // Start slideshows for visible cards
  if (slideshowEnabled) {
    paginated.items.forEach(startSlideshow);
  }

  if (window.revealCheck) window.revealCheck();
}

function onCatalogClick(e) {
  const card = e.target.closest('.cat-card');
  if (card && card.dataset.catSlug) openDetail(card.dataset.catSlug);
}

// ─── Filter chips (category nav shown on detail page) ────────────────────────
function renderMaterialsFilters() {
  const filterRow = document.getElementById('materialsFilters');
  if (!filterRow) return;

  const activeLabel = categoriesData.find(c => c.slug === activeCatSlug)?.name || 'Browse Category';
  filterRow.innerHTML = `
    <div class="split-dropdown system-theme">
      <div class="split-button-group">
        <button class="split-main">${activeLabel}</button>
        <button class="split-arrow" onclick="toggleMaterialsFilterMenu(event)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
               stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      <div class="split-menu" id="materialsSplitMenu">
        ${categoriesData.map(cat => `
          <button class="split-item ${cat.slug === activeCatSlug ? 'active' : ''}"
                  onclick="filterMaterials('${cat.slug}')">${cat.name}</button>
        `).join('')}
      </div>
    </div>`;
}

window.toggleMaterialsFilterMenu = function (e) {
  e.stopPropagation();
  document.getElementById('materialsSplitMenu')?.classList.toggle('show');
};
document.addEventListener('click', () =>
  document.getElementById('materialsSplitMenu')?.classList.remove('show')
);

// Clicking a chip on the detail page navigates to that category's detail
window.filterMaterials = function (slug) {
  openDetail(slug);
};

// Bind option selection actions globally
window.selectFinish = function (finishName) {
  selectedFinish = finishName;
  document.querySelectorAll('#dFinishes .opt-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === finishName);
  });

  // Dynamic pricing for blinds
  if (activeCatSlug === 'blinds') {
    const priceEl = document.getElementById('dPrice');
    if (priceEl && STATIC_METADATA['blinds']?.finishPrices?.[finishName]) {
      priceEl.textContent = `Rs.${STATIC_METADATA['blinds'].finishPrices[finishName]} / sqft`;
    }
  }

  // Filter gallery images and update view
  const cat = categoriesData.find(c => c.slug === activeCatSlug);
  if (cat) {
    currentGalleryPage = 1;
    renderDetailGallery(cat);

    // Auto-update activeItem to the first image of the selected finish
    const firstItem = currentFilteredItems.find(it => it.type !== 'video') || currentFilteredItems[0];
    if (firstItem) {
      activeItem = firstItem;
    } else {
      activeItem = {
        id: cat.slug,
        name: cat.name,
        src: '',
        type: 'image'
      };
    }
    syncActiveItemState(cat);
  }
};

window.selectColor = function (colorHex) {
  selectedColor = colorHex;
  document.querySelectorAll('#dColors .color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.getAttribute('data-color') === colorHex);
  });
};

// Helpers for filenames and pricing
function formatFileName(filename) {
  let name = filename.replace(/\.[^/.]+$/, ""); // strip extension
  name = name.replace(/(?:rs|Rs|RS)\.?\s*\d+\S*/g, ""); // strip Rs price tags
  name = name.replace(/[-_]+/g, " "); // replace separators
  name = name.trim();
  return name.replace(/\b\w/g, c => c.toUpperCase()); // title case
}

function getFilePriceDetails(file, catSlug) {
  const meta = STATIC_METADATA[catSlug];
  if (!meta) return { price: 0, priceText: 'Contact for pricing' };

  // 1. Check if name contains a price tag
  const name = file.name || '';
  const priceMatch = name.match(/(?:rs|Rs|RS)\.?\s*(\d+)/i) || name.match(/(\d+)\s*(?:rs|Rs|RS)/i);
  if (priceMatch) {
    const price = parseInt(priceMatch[1], 10);
    const unit = name.toLowerCase().includes('sheet') ? 'sheet' : (name.toLowerCase().includes('pc') ? 'piece' : (meta.unit || 'sqft'));
    return { price, priceText: `Rs.${price} / ${unit}` };
  }

  // 2. Blinds dynamic finish price
  if (catSlug === 'blinds') {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('zebra')) {
      return { price: 360, priceText: 'Rs.360 / sqft' };
    } else if (lowerName.includes('roller') || lowerName.includes('bamboo')) {
      return { price: 250, priceText: 'Rs.250 / sqft' };
    }
  }

  // 3. Fallback to category level price
  return { price: meta.price, priceText: meta.priceText };
}

// Synchronize selected active item preview, price, wishlist status, and button actions
function syncActiveItemState(cat) {
  if (!activeItem) return;

  // Retrieve materialsData entry to get the exact priceText
  const materialsItem = window.materialsData.find(m => m.id === activeItem.id) || {
    priceText: 'Contact for pricing'
  };

  // 1. Display Price
  const priceEl = document.getElementById('dPrice');
  if (priceEl) {
    if (cat.slug === 'blinds') {
      if (selectedFinish === 'Zebra') {
        priceEl.textContent = 'Rs.360 / sqft';
      } else {
        priceEl.textContent = 'Rs.250 / sqft';
      }
    } else {
      priceEl.textContent = materialsItem.priceText;
    }
  }

  // 2. Set main preview image
  setMainItem(activeItem, cat);

  // 3. Wishlist button state
  const wishBtn = document.getElementById('dWishlistBtn');
  if (wishBtn) {
    const saved = window.Wishlist.get();
    if (saved.includes(activeItem.id)) {
      wishBtn.textContent = '♥ Saved';
      wishBtn.style.color = '#d9534f';
    } else {
      wishBtn.textContent = '♥ Save';
      wishBtn.style.color = '';
    }
  }

  // 4. Quote click handler
  const addQuoteBtn = document.getElementById('dAddQuoteBtn');
  if (addQuoteBtn) {
    addQuoteBtn.onclick = () => {
      window.QuoteCart.add(activeItem.id, selectedFinish, selectedColor, currentQty);
      if (window.showToast) {
        window.showToast(`"${activeItem.name}" added to quote list successfully!`);
      }
    };
  }

  // 5. WhatsApp click handler
  const waBtn = document.getElementById('dWhatsAppBtn');
  if (waBtn) {
    waBtn.onclick = () => {
      const displayPrice = (cat.slug === 'blinds' && selectedFinish === 'Zebra') ? 'Rs.360 / sqft' : ((cat.slug === 'blinds') ? 'Rs.250 / sqft' : materialsItem.priceText);
      const finishDetail = (selectedFinish && selectedFinish !== 'Standard Finish') ? ` (${selectedFinish} Finish)` : '';
      const msg = `Hi Sohail Interior, I'm interested in your ${cat.name} collection - Item: ${activeItem.name}${finishDetail} (Price: ${displayPrice}). Could you share details?`;
      window.open(`https://wa.me/923115813505?text=${encodeURIComponent(msg)}`, '_blank');
    };
  }
}

// ─── Open detail (category view) ──────────────────────────────────────────────
window.openDetail = function (slug, targetItemId) {
  const cat = categoriesData.find(c => c.slug === slug);
  if (!cat) return;

  activeCatSlug = slug;
  currentGalleryPage = 1;

  // Update URL (preserve specific file ID if passed)
  const newUrl = targetItemId
    ? `${window.location.pathname}?id=${targetItemId}`
    : `${window.location.pathname}?category=${slug}`;
  window.history.pushState({}, '', newUrl);

  // Fill info panel
  document.getElementById('dCrumbName').textContent = cat.name;
  document.getElementById('dName').textContent = cat.name;
  document.getElementById('dCat').textContent = cat.name;

  const countEl = document.getElementById('dItemCount');
  if (countEl) {
    countEl.textContent = cat.items.length > 0
      ? `${cat.items.length} items in this collection`
      : 'Collection coming soon';
  }

  // Get item metadata for pricing & options
  const materialsItem = window.materialsData.find(m => m.id === slug);
  const meta = STATIC_METADATA[slug] || (materialsItem ? {
    price: materialsItem.price,
    priceText: materialsItem.priceText,
    desc: materialsItem.desc,
    finishes: materialsItem.finishes,
    colors: materialsItem.colors
  } : {
    price: 0,
    priceText: 'Contact for pricing',
    desc: `Premium quality ${cat.name} collection.`,
    finishes: ['Standard Finish'],
    colors: ['#eaf2fa']
  });

  // Display Price
  const priceEl = document.getElementById('dPrice');
  if (priceEl) {
    priceEl.textContent = meta.priceText;
  }

  // Setup Options & Selections
  selectedFinish = meta.finishes && meta.finishes.length > 0 ? meta.finishes[0] : 'Standard Finish';
  selectedColor = meta.colors && meta.colors.length > 0 ? meta.colors[0] : '#eaf2fa';

  const finishArea = document.getElementById('dFinishArea');
  const finishesContainer = document.getElementById('dFinishes');
  if (finishArea && finishesContainer) {
    if (meta.finishes && meta.finishes.length > 0) {
      finishArea.style.display = 'block';
      finishesContainer.innerHTML = meta.finishes.map(f => `
        <button class="opt-btn ${f === selectedFinish ? 'active' : ''}" onclick="selectFinish('${f}')">${f}</button>
      `).join('');
    } else {
      finishArea.style.display = 'none';
    }
  }

  const colorArea = document.getElementById('dColorArea');
  const colorsContainer = document.getElementById('dColors');
  if (colorArea && colorsContainer) {
    if (meta.colors && meta.colors.length > 0) {
      colorArea.style.display = 'block';
      colorsContainer.innerHTML = meta.colors.map(c => `
        <span class="color-dot ${c === selectedColor ? 'active' : ''}" style="background:${c};" data-color="${c}" onclick="selectColor('${c}')"></span>
      `).join('');
    } else {
      colorArea.style.display = 'none';
    }
  }

  document.getElementById('dDesc').textContent = meta.desc ||
    `Browse our full ${cat.name} collection. Tap any thumbnail to view full size, or click the main image to open a slideshow.`;

  // Reset qty stepper
  currentQty = 1;
  const qtyEl = document.getElementById('dQty');
  if (qtyEl) qtyEl.textContent = 1;

  // Render the paginated gallery first (sets up currentFilteredItems)
  renderDetailGallery(cat);

  // Set activeItem
  let firstItem = null;
  if (targetItemId) {
    firstItem = cat.items.find(it => it.id === targetItemId);
  }
  if (!firstItem) {
    firstItem = currentFilteredItems.find(it => it.type !== 'video') || currentFilteredItems[0];
  }

  if (firstItem) {
    activeItem = firstItem;
  } else {
    activeItem = {
      id: cat.slug,
      name: cat.name,
      src: '',
      type: 'image'
    };
  }

  // Setup/bind click handlers and states for the activeItem
  syncActiveItemState(cat);

  // Setup wishlist save button click
  const wishBtn = document.getElementById('dWishlistBtn');
  if (wishBtn) {
    wishBtn.onclick = () => {
      window.Wishlist.toggle(activeItem.id);
      syncActiveItemState(cat);
    };
  }

  // Update active chip in filter row
  renderMaterialsFilters();

  // Switch panels
  document.getElementById('materialsPage').style.display = 'none';
  document.getElementById('detailPage').style.display = 'block';
  window.scrollTo({ top: 0 });
  if (window.revealCheck) window.revealCheck();
};

// Set the large main image/video
function setMainItem(item, cat) {
  const el = document.getElementById('dMainImg');
  if (!el) return;

  if (item.type === 'video') {
    el.innerHTML = `<video src="${item.src}" controls
      style="width:100%;height:100%;object-fit:cover;border-radius:16px;"></video>`;
    el.style.backgroundImage = '';
    el.style.opacity = '';
    el.className = 'gallery-main';
    el.style.cursor = 'default';
    el.onclick = null;
  } else if (item.src) {
    // Has a real image — fade it in smoothly
    el.innerHTML = '';
    el.className = 'gallery-main';
    el.style.cursor = 'zoom-in';
    el.style.opacity = '0.4';
    el.style.transition = 'opacity 0.35s ease';

    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url('${item.src}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.opacity = '1';
    };
    img.src = item.src;

    el.onclick = () => {
      if (window.openLightbox) {
        const allItems = cat.items.map(it => ({
          src: it.src,
          name: it.name,
          type: it.type || 'image',
          categoryName: cat.name
        }));
        const idx = cat.items.indexOf(item);
        window.openLightbox(Math.max(0, idx), allItems);
      }
    };
  } else {
    // No image src — show texture class as fallback
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;opacity:0.45;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span style="font-size:13px;font-family:'Inter',sans-serif;">Images loading…</span>
      </div>`;
    const textureCls = TEXTURE_MAP[cat.slug] || 't-gypsum';
    el.className = `gallery-main ${textureCls}`;
    el.style.backgroundImage = '';
    el.style.opacity = '1';
    el.style.cursor = 'default';
    el.onclick = null;
  }
}

// Render paginated gallery grid in detail view
function renderDetailGallery(cat) {
  const gridEl = document.getElementById('dGalleryGrid');
  const paginEl = document.getElementById('dGalleryPagination');
  if (!gridEl) return;

  const items = cat.items;
  // THIS is what openDetail relies on to pick the first real image for the main panel
  currentFilteredItems = items;

  if (items.length === 0) {
    gridEl.innerHTML = '<div class="gallery-empty">No media available for this category yet.</div>';
    if (paginEl) paginEl.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(items.length / GALLERY_PER_PAGE);
  const page = Math.max(1, Math.min(currentGalleryPage, totalPages));
  const start = (page - 1) * GALLERY_PER_PAGE;
  const slice = items.slice(start, start + GALLERY_PER_PAGE);

  gridEl.innerHTML = slice.map(item => {
    const isVid = item.type === 'video';
    const bg = isVid
      ? 'background:#0d2340'
      : `background-size:cover;background-position:center`;
    return `
      <div class="gal-thumb fade-load" style="${bg}" data-bg-src="${isVid ? '' : item.src}"
           onclick="selectGalleryItem('${cat.slug}','${item.id}')">
        ${!isVid ? `<div class="loading-glass" style="border-radius: 8px;"></div>` : ''}
        ${isVid ? '<span class="vid-play">▶</span>' : ''}
      </div>`;
  }).join('');

  if (paginEl) {
    paginEl.innerHTML = totalPages > 1 ? `
      <button class="pgal-btn"
              onclick="changeGalleryPage(${page - 1},'${cat.slug}')"
              ${page === 1 ? 'disabled' : ''}>← Prev</button>
      <span class="pgal-info">${page} / ${totalPages}</span>
      <button class="pgal-btn"
              onclick="changeGalleryPage(${page + 1},'${cat.slug}')"
              ${page === totalPages ? 'disabled' : ''}>Next →</button>
    ` : '';
  }

  // Fade in detail images once loaded
  gridEl.querySelectorAll('.fade-load').forEach(el => {
    const src = el.getAttribute('data-bg-src');
    if (src) {
      const img = new Image();
      img.onload = () => {
        if (el.style.backgroundImage !== 'none') {
          el.style.backgroundImage = `url('${src}')`;
        }
        const glass = el.querySelector('.loading-glass');
        if (glass) {
          glass.style.opacity = '0';
          setTimeout(() => glass.remove(), 600);
        }
      };
      img.src = src;
    }
  });
}

// Change gallery page (prev / next)
window.changeGalleryPage = function (page, slug) {
  currentGalleryPage = page;
  const cat = categoriesData.find(c => c.slug === slug);
  if (cat) {
    renderDetailGallery(cat);
    document.getElementById('dGalleryGrid')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

let modalQty = 1;

window.selectGalleryItem = function (slug, itemId) {
  const cat = categoriesData.find(c => c.slug === slug);
  if (!cat) return;
  const item = cat.items.find(it => it.id === itemId);
  if (item) {
    activeItem = item;
    modalQty = 1; // Reset stepper qty in modal
    openItemModal(cat, item);
  }
};

function openItemModal(cat, item) {
  const modal = document.getElementById("itemModal");
  if (!modal) return;

  // 1. Populate Name and item count details
  document.getElementById("mName").textContent = cat.name;
  
  const countEl = document.getElementById("mItemCount");
  if (countEl) {
    countEl.textContent = cat.items.length > 0
      ? `${cat.items.length} items in this collection`
      : 'Collection coming soon';
  }

  // 2. Load Item pricing details dynamically
  const materialsItem = window.materialsData.find(m => m.id === item.id) || {
    priceText: 'Contact for pricing'
  };

  const meta = STATIC_METADATA[cat.slug] || {};
  const priceEl = document.getElementById("mPrice");
  if (priceEl) {
    if (cat.slug === 'blinds') {
      priceEl.textContent = selectedFinish === 'Zebra' ? 'Rs.360 / sqft' : 'Rs.250 / sqft';
    } else {
      priceEl.textContent = materialsItem.priceText || meta.priceText || 'Contact for pricing';
    }
  }

  // Setup category name and item descriptions
  document.getElementById("mCat").textContent = cat.name;
  document.getElementById("mDesc").textContent = meta.desc || `Premium quality ${cat.name} collection from Sohail Interior.`;

  // 3. Render Media Image / Video
  const mediaEl = document.getElementById("mMainMedia");
  if (mediaEl) {
    if (item.type === 'video') {
      mediaEl.innerHTML = `<video src="${item.src}" controls autoplay muted style="width:100%;height:100%;object-fit:cover;border-radius:14px;"></video>`;
      mediaEl.style.backgroundImage = '';
    } else {
      mediaEl.innerHTML = '';
      mediaEl.style.backgroundImage = `url('${item.src}')`;
      mediaEl.style.backgroundSize = 'cover';
      mediaEl.style.backgroundPosition = 'center';
    }
  }

  // 4. Populate Finishes options
  const finishArea = document.getElementById("mFinishArea");
  const finishesContainer = document.getElementById("mFinishes");
  if (finishArea && finishesContainer) {
    if (meta.finishes && meta.finishes.length > 0) {
      finishArea.style.display = 'block';
      finishesContainer.innerHTML = meta.finishes.map(f => `
        <button class="opt-btn ${f === selectedFinish ? 'active' : ''}" onclick="selectModalFinish(this, '${f}', '${cat.slug}', '${item.id}')">${f}</button>
      `).join('');
    } else {
      finishArea.style.display = 'none';
    }
  }

  // 5. Quantity Stepper
  const qtyEl = document.getElementById("mQty");
  if (qtyEl) qtyEl.textContent = modalQty;

  // 6. Bind Wishlist Button State
  const wishBtn = document.getElementById("mWishlistBtn");
  const updateWishButtonState = () => {
    if (wishBtn) {
      const saved = window.Wishlist.get();
      if (saved.includes(item.id)) {
        wishBtn.textContent = '♥ Saved';
        wishBtn.style.color = '#d9534f';
      } else {
        wishBtn.textContent = '♥ Save';
        wishBtn.style.color = '';
      }
    }
  };
  updateWishButtonState();

  if (wishBtn) {
    wishBtn.onclick = () => {
      window.Wishlist.toggle(item.id);
      updateWishButtonState();
    };
  }

  // 7. Bind Quote click
  const addQuoteBtn = document.getElementById("mAddQuoteBtn");
  if (addQuoteBtn) {
    addQuoteBtn.onclick = () => {
      window.QuoteCart.add(item.id, selectedFinish, selectedColor, modalQty);
      if (window.showToast) {
        window.showToast(`"${item.name}" added to quote list successfully!`);
      }
    };
  }

  // 8. Bind WhatsApp click handler
  const waBtn = document.getElementById("mWhatsAppBtn");
  if (waBtn) {
    waBtn.onclick = () => {
      const displayPrice = (cat.slug === 'blinds' && selectedFinish === 'Zebra') ? 'Rs.360 / sqft' : ((cat.slug === 'blinds') ? 'Rs.250 / sqft' : (materialsItem.priceText || meta.priceText || 'Contact for pricing'));
      const finishDetail = (selectedFinish && selectedFinish !== 'Standard Finish') ? ` (${selectedFinish} Finish)` : '';
      const cleanName = formatFileName(item.name);
      const msg = `Hi Sohail Interior, I'm interested in your ${cat.name} collection - Item: ${cleanName}${finishDetail} (Price: ${displayPrice}). Could you share details?`;
      window.open(`https://wa.me/923115813505?text=${encodeURIComponent(msg)}`, '_blank');
    };
  }

  // Show Modal Overlay
  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; // disable background scroll
}

window.stepModalQty = function (delta) {
  modalQty = Math.max(1, modalQty + delta);
  const el = document.getElementById("mQty");
  if (el) el.textContent = modalQty;
};

window.selectModalFinish = function (btn, finish, slug, itemId) {
  selectedFinish = finish;
  const buttons = btn.parentElement.querySelectorAll(".opt-btn");
  buttons.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  if (slug === 'blinds') {
    const priceEl = document.getElementById("mPrice");
    if (priceEl) {
      priceEl.textContent = finish === 'Zebra' ? 'Rs.360 / sqft' : 'Rs.250 / sqft';
    }
  }
};

window.closeItemModal = function () {
  const modal = document.getElementById("itemModal");
  if (modal) {
    modal.style.display = "none";
    // Pause any playing modal video
    const video = modal.querySelector("video");
    if (video) video.pause();
  }
  document.body.style.overflow = ""; // restore scroll
};

// Bind click outside modal-container to close
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("itemModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        window.closeItemModal();
      }
    });
  }
});


// ─── Qty stepper ─────────────────────────────────────────────────────────────
window.stepQty = function (delta) {
  currentQty = Math.max(1, currentQty + delta);
  const el = document.getElementById('dQty');
  if (el) el.textContent = currentQty;
};

// ─── Close detail → back to catalog ──────────────────────────────────────────
window.closeDetailView = function () {
  window.history.pushState({}, '', window.location.pathname);
  document.getElementById('detailPage').style.display = 'none';
  document.getElementById('materialsPage').style.display = 'block';
  activeCatSlug = null;
  window.scrollTo({ top: 0 });
};

// ─── Build categoriesData from API response ───────────────────────────────────
function loadFromGlobalCategories(globalCats) {
  categoriesData = globalCats.map(cat => ({
    slug: cat.slug,
    name: cat.name,
    texture: TEXTURE_MAP[cat.slug] || 't-gypsum',
    items: (cat.items || []).map(it => ({
      id: it.id,
      name: it.name,
      src: it.src,
      type: /\.(mp4|mov|avi|webm|mkv)$/i.test(it.name || '') ? 'video' : 'image'
    }))
  }));

  // Sync category entries to window.materialsData so cart/wishlist drawers can render them
  const categoryMaterials = categoriesData.map(cat => {
    const meta = STATIC_METADATA[cat.slug] || {
      price: 0,
      priceText: 'Contact for pricing',
      desc: `${cat.name} collection from Sohail Interior.`,
      finishes: ['Standard Finish'],
      colors: ['#eaf2fa', '#c9d6e4', '#aebfd2']
    };
    return {
      id: cat.slug,
      name: cat.name,
      cat: cat.slug,
      catLabel: cat.name,
      price: meta.price,
      priceText: meta.priceText,
      finishPrices: meta.finishPrices,
      texture: cat.texture || 't-gypsum',
      desc: meta.desc,
      finishes: meta.finishes,
      colors: meta.colors
    };
  });

  // Also include the individual files from categories so search and wishlist are still supported!
  const fileMaterials = [];
  categoriesData.forEach(cat => {
    const catMeta = STATIC_METADATA[cat.slug] || {
      finishes: ['Standard Finish'],
      colors: ['#eaf2fa']
    };
    cat.items.forEach(file => {
      const cleanName = formatFileName(file.name);
      const { price, priceText } = getFilePriceDetails(file, cat.slug);

      fileMaterials.push({
        id: file.id,
        name: cleanName,
        cat: cat.slug,
        catLabel: cat.name,
        price: price,
        priceText: priceText,
        texture: file.src, // Google Drive stream URL
        desc: `Premium quality ${cleanName} from our ${cat.name} collection. Durable, moisture-resistant, and professionally installed.`,
        finishes: catMeta.finishes,
        colors: catMeta.colors
      });
    });
  });

  window.materialsData = [...categoryMaterials, ...fileMaterials];
}

// Helper to handle routing query parameters
function handleURLRouting() {
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('category') || params.get('id');
  if (targetId) {
    let slug = targetId;
    if (slug.startsWith('BLN') || slug === 'BLN-01') slug = 'blinds';
    else if (slug.startsWith('CGY') || slug === 'CGY-01') slug = 'ceiling-gypsum';
    else if (slug.startsWith('FWP') || slug === 'FWP-01') slug = 'fabric-wallpaper';
    else if (slug.startsWith('FDR') || slug === 'FDR-01') slug = 'fiber-doors';
    else if (slug.startsWith('PW8') || slug === 'PW8-01') slug = 'pvc-wall-panel-8';
    else if (slug.startsWith('PUC') || slug === 'PUC-01') slug = 'pvc-updown-ceiling';
    else if (slug.startsWith('PW10') || slug === 'PW10-01') slug = 'pvc-wall-panel-10';

    const directCat = categoriesData.find(c => c.slug === slug);
    if (directCat) {
      openDetail(slug);
    } else {
      // Find the file-based item to locate its category
      const fileItem = window.materialsData.find(m => m.id === targetId);
      if (fileItem) {
        openDetail(fileItem.cat, targetId);
      }
    }
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (window.globalCategories?.length > 0) {
    // Drive data already in-hand (fast load or cached) — use it immediately
    loadFromGlobalCategories(window.globalCategories);
    renderMaterialsFilters();
    renderCatalog();
    handleURLRouting();
  } else {
    // API hasn't responded yet — show a loading spinner and wait for categoriesLoaded.
    // Do NOT render STATIC_FALLBACK cards; real Drive cards will appear once ready.
    const grid = document.getElementById('catalogGrid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;gap:16px;color:var(--navy,#12345c);opacity:0.5;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:loader-spin 1s linear infinite;">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span style="font-size:13px;font-family:'Inter',sans-serif;letter-spacing:.04em;">Loading catalog…</span>
        </div>`;
    }
    // NOTE: handleURLRouting() intentionally NOT called here.
    // categoriesLoaded will call openDetail() once real images are ready.
  }
});

// ─── Re-render when API categories arrive ────────────────────────────────────
window.addEventListener('categoriesLoaded', (e) => {
  loadFromGlobalCategories(e.detail);
  renderMaterialsFilters();
  renderCatalog();

  // If the detail panel is already open (e.g. page was slow to load Drive data),
  // re-open the current category so the main image updates with real Drive images.
  const detailPage = document.getElementById('detailPage');
  if (activeCatSlug && detailPage && detailPage.style.display !== 'none') {
    openDetail(activeCatSlug);
  } else {
    handleURLRouting();
  }
});

// Reactive update when wishlist drawer removes or toggles items
window.addEventListener('wishlistUpdated', () => {
  const cat = categoriesData.find(c => c.slug === activeCatSlug);
  if (cat) {
    syncActiveItemState(cat);
  }
});

