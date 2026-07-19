// Materials Page — Category-Based View
// Each card = one Drive folder; detail = full paginated gallery of all images/videos in that folder.

// ─── Constants ────────────────────────────────────────────────────────────────
const GALLERY_PER_PAGE = 16;   // thumbs per page inside detail view
const CATALOG_PER_PAGE = 12;   // max category cards per catalog page

// ─── State ───────────────────────────────────────────────────────────────────
let categoriesData     = [];   // [{slug, name, texture, items:[{id,name,src,type}]}]
let activeCatSlug      = null;
let currentGalleryPage = 1;
let currentCatalogPage = 1;
let currentSort        = 'best';
let currentQty         = 1;    // qty stepper in detail view
let slideshowTimers    = {};   // slug → intervalId
let slideshowEnabled   = false;

// ─── Static fallback shown before API loads ───────────────────────────────────
const STATIC_FALLBACK = [
  { slug: 'blinds',             name: 'Window Blinds',        texture: 't-blinds'    },
  { slug: 'ceiling-gypsum',     name: '2×2 Ceiling',          texture: 't-gypsum'    },
  { slug: 'fabric-wallpaper',   name: 'Fabric Wallpaper',     texture: 't-fabric'    },
  { slug: 'fiber-doors',        name: 'Fiber Door A+',        texture: 't-fiberdoor' },
  { slug: 'pvc-wall-panel-8',   name: 'PVC Wall Panel 8"',    texture: 't-panel8'    },
  { slug: 'pvc-updown-ceiling', name: 'PVC Updown Ceiling',   texture: 't-pop'       },
  { slug: 'pvc-wall-panel-10',  name: 'PVC Wall Panel 10"',   texture: 't-panel10'   },
];

// Slug → CSS texture class fallback map
const TEXTURE_MAP = {
  'blinds':             't-blinds',
  'ceiling-gypsum':     't-gypsum',
  'fabric-wallpaper':   't-fabric',
  'fiber-doors':        't-fiberdoor',
  'pvc-wall-panel-8':   't-panel8',
  'pvc-updown-ceiling': 't-pop',
  'pvc-wall-panel-10':  't-panel10',
  'vinyl':              't-vinyl',
};

// ─── Grid cols toggle ─────────────────────────────────────────────────────────
window.setGridCols = function(n, btn) {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  grid.className = 'pgrid' + (n !== 4 ? ` cols-${n}` : '');
  document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

// ─── Sort handler ─────────────────────────────────────────────────────────────
window.handleSortChange = function(val) {
  currentSort = val;
  currentCatalogPage = 1;
  renderCatalog();
};

// ─── Catalog page navigation ──────────────────────────────────────────────────
window.changeCatalogPage = function(page) {
  currentCatalogPage = page;
  renderCatalog();
  document.getElementById('materialsPage')?.scrollIntoView({ behavior: 'smooth' });
};

// ─── Slideshow helpers ────────────────────────────────────────────────────────
function clearSlideshows() {
  Object.values(slideshowTimers).forEach(clearInterval);
  slideshowTimers = {};
}

window.toggleSlideshow = function() {
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
  const firstImg   = cat.items.find(it => it.type !== 'video' && it.src);
  const hasRealImg = firstImg && (firstImg.src.startsWith('/') || firstImg.src.startsWith('http'));
  const thumbCls   = hasRealImg
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
  const grid  = document.getElementById('catalogGrid');
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
  grid.innerHTML  = paginated.items.map(catCardHTML).join('');

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

window.toggleMaterialsFilterMenu = function(e) {
  e.stopPropagation();
  document.getElementById('materialsSplitMenu')?.classList.toggle('show');
};
document.addEventListener('click', () =>
  document.getElementById('materialsSplitMenu')?.classList.remove('show')
);

// Clicking a chip on the detail page navigates to that category's detail
window.filterMaterials = function(slug) {
  openDetail(slug);
};

// ─── Open detail (category view) ──────────────────────────────────────────────
window.openDetail = function(slug) {
  const cat = categoriesData.find(c => c.slug === slug);
  if (!cat) return;

  activeCatSlug      = slug;
  currentGalleryPage = 1;

  // Update URL
  window.history.pushState({}, '', `${window.location.pathname}?category=${slug}`);

  // Fill info panel
  document.getElementById('dCrumbName').textContent = cat.name;
  document.getElementById('dName').textContent       = cat.name;
  document.getElementById('dCat').textContent        = cat.name;

  const countEl = document.getElementById('dItemCount');
  if (countEl) {
    countEl.textContent = cat.items.length > 0
      ? `${cat.items.length} items in this collection`
      : 'Collection coming soon';
  }

  document.getElementById('dDesc').textContent =
    `Browse our full ${cat.name} collection. Tap any thumbnail to view full size, or click the main image to open a slideshow.`;

  // Reset qty stepper
  currentQty = 1;
  const qtyEl = document.getElementById('dQty');
  if (qtyEl) qtyEl.textContent = 1;

  // WhatsApp enquiry
  const waBtn = document.getElementById('dWhatsAppBtn');
  if (waBtn) {
    waBtn.onclick = () => {
      const msg = `Hi Sohail Interior, I'm interested in your ${cat.name} collection. Could you share pricing and availability?`;
      window.open(`https://wa.me/923115813505?text=${encodeURIComponent(msg)}`, '_blank');
    };
  }

  // Add to Quote — uses category slug as the cart item ID
  const addQuoteBtn = document.getElementById('dAddQuoteBtn');
  if (addQuoteBtn) {
    addQuoteBtn.onclick = () => {
      window.QuoteCart.add(cat.slug, 'Standard Finish', '#eaf2fa', currentQty);
      window.openCartDrawer();
    };
  }

  // Wishlist Save / Unsave
  const wishBtn = document.getElementById('dWishlistBtn');
  if (wishBtn) {
    const syncWishBtn = () => {
      const saved = window.Wishlist.get();
      if (saved.includes(cat.slug)) {
        wishBtn.textContent = '♥ Saved';
        wishBtn.style.color = '#d9534f';
      } else {
        wishBtn.textContent = '♥ Save';
        wishBtn.style.color = '';
      }
    };
    syncWishBtn();
    wishBtn.onclick = () => {
      window.Wishlist.toggle(cat.slug);
      syncWishBtn();
    };
  }

  // Set main image to the first non-video item (or first item)
  const firstItem = cat.items.find(it => it.type !== 'video') || cat.items[0];
  if (firstItem) {
    setMainItem(firstItem, cat);
  } else {
    const mainImg = document.getElementById('dMainImg');
    if (mainImg) {
      mainImg.className            = `gallery-main ${cat.texture || ''}`;
      mainImg.style.backgroundImage = '';
      mainImg.innerHTML            = '';
      mainImg.onclick              = null;
    }
  }

  // Render the paginated gallery
  renderDetailGallery(cat);

  // Update active chip in filter row
  renderMaterialsFilters();

  // Switch panels
  document.getElementById('materialsPage').style.display = 'none';
  document.getElementById('detailPage').style.display    = 'block';
  window.scrollTo({ top: 0 });
  if (window.revealCheck) window.revealCheck();
};

// Set the large main image/video
function setMainItem(item, cat) {
  const el = document.getElementById('dMainImg');
  if (!el) return;

  if (item.type === 'video') {
    el.innerHTML            = `<video src="${item.src}" controls
      style="width:100%;height:100%;object-fit:cover;border-radius:16px;"></video>`;
    el.style.backgroundImage = '';
    el.className             = 'gallery-main';
    el.style.cursor          = 'default';
    el.onclick               = null;
  } else {
    el.innerHTML                    = '';
    el.className                    = 'gallery-main';
    el.style.backgroundImage        = `url('${item.src}')`;
    el.style.backgroundSize         = 'cover';
    el.style.backgroundPosition     = 'center';
    el.style.cursor                 = 'zoom-in';
    el.onclick = () => {
      if (window.openLightbox) {
        const allItems = cat.items.map(it => ({
          src:          it.src,
          name:         it.name,
          type:         it.type || 'image',
          categoryName: cat.name
        }));
        const idx = cat.items.indexOf(item);
        window.openLightbox(Math.max(0, idx), allItems);
      }
    };
  }
}

// Render paginated gallery grid in detail view
function renderDetailGallery(cat) {
  const gridEl  = document.getElementById('dGalleryGrid');
  const paginEl = document.getElementById('dGalleryPagination');
  if (!gridEl) return;

  const items = cat.items;
  if (items.length === 0) {
    gridEl.innerHTML  = '<div class="gallery-empty">No media available for this category yet.</div>';
    if (paginEl) paginEl.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(items.length / GALLERY_PER_PAGE);
  const page       = Math.max(1, Math.min(currentGalleryPage, totalPages));
  const start      = (page - 1) * GALLERY_PER_PAGE;
  const slice      = items.slice(start, start + GALLERY_PER_PAGE);

  gridEl.innerHTML = slice.map(item => {
    const isVid = item.type === 'video';
    const bg    = isVid
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
window.changeGalleryPage = function(page, slug) {
  currentGalleryPage = page;
  const cat = categoriesData.find(c => c.slug === slug);
  if (cat) {
    renderDetailGallery(cat);
    document.getElementById('dGalleryGrid')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// Select a thumbnail → update main image
window.selectGalleryItem = function(slug, itemId) {
  const cat  = categoriesData.find(c => c.slug === slug);
  if (!cat) return;
  const item = cat.items.find(it => it.id === itemId);
  if (item) setMainItem(item, cat);
};

// ─── Qty stepper ─────────────────────────────────────────────────────────────
window.stepQty = function(delta) {
  currentQty = Math.max(1, currentQty + delta);
  const el = document.getElementById('dQty');
  if (el) el.textContent = currentQty;
};

// ─── Close detail → back to catalog ──────────────────────────────────────────
window.closeDetailView = function() {
  window.history.pushState({}, '', window.location.pathname);
  document.getElementById('detailPage').style.display    = 'none';
  document.getElementById('materialsPage').style.display = 'block';
  activeCatSlug = null;
  window.scrollTo({ top: 0 });
};

// ─── Build categoriesData from API response ───────────────────────────────────
function loadFromGlobalCategories(globalCats) {
  categoriesData = globalCats.map(cat => ({
    slug:    cat.slug,
    name:    cat.name,
    texture: TEXTURE_MAP[cat.slug] || 't-gypsum',
    items:   (cat.items || []).map(it => ({
      id:   it.id,
      name: it.name,
      src:  it.src,
      type: /\.(mp4|mov|avi|webm|mkv)$/i.test(it.name || '') ? 'video' : 'image'
    }))
  }));

  // Sync category entries to window.materialsData so cart/wishlist drawers can render them
  window.materialsData = categoriesData.map(cat => ({
    id:       cat.slug,
    name:     cat.name,
    cat:      cat.slug,
    catLabel: cat.name,
    price:    0,
    priceText:'Contact for pricing',
    texture:  cat.texture || 't-gypsum',
    desc:     `${cat.name} collection from Sohail Interior.`,
    finishes: ['Standard Finish'],
    colors:   ['#eaf2fa', '#c9d6e4', '#aebfd2']
  }));
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (window.globalCategories?.length > 0) {
    loadFromGlobalCategories(window.globalCategories);
  } else {
    // Static fallback (no real images yet)
    categoriesData = STATIC_FALLBACK.map(s => ({ ...s, items: [] }));
    // Sync static fallback to window.materialsData
    window.materialsData = categoriesData.map(cat => ({
      id:       cat.slug,
      name:     cat.name,
      cat:      cat.slug,
      catLabel: cat.name,
      price:    0,
      priceText:'Contact for pricing',
      texture:  cat.texture || 't-gypsum',
      desc:     `${cat.name} collection from Sohail Interior.`,
      finishes: ['Standard Finish'],
      colors:   ['#eaf2fa', '#c9d6e4', '#aebfd2']
    }));
  }

  renderMaterialsFilters();
  renderCatalog();

  // URL routing — open category directly if ?category= in URL
  const params  = new URLSearchParams(window.location.search);
  const catSlug = params.get('category');
  if (catSlug) openDetail(catSlug);
});

// ─── Re-render when API categories arrive ────────────────────────────────────
window.addEventListener('categoriesLoaded', (e) => {
  loadFromGlobalCategories(e.detail);
  renderMaterialsFilters();
  renderCatalog();

  // Re-open if currently on a category detail
  const params  = new URLSearchParams(window.location.search);
  const catSlug = params.get('category');
  if (catSlug) openDetail(catSlug);
});
