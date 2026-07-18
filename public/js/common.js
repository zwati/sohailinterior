// Common JavaScript Logic for Sohail Interior

// Global Materials Catalog Data
window.materialsData = [
  { id: 'BLN-01', name: 'Window Blinds', cat: 'blinds', catLabel: 'Blinds', price: 250, priceText: 'Rs.250 - Rs.360 / sqft', texture: 't-blinds', desc: 'Premium window blinds. Available in Roller (Rs.250/sf), Zebra (Rs.360/sf), and Bamboo (Rs.250/sf).', finishes: ['Roller', 'Zebra', 'Bamboo'], colors: ['#eaf2fa', '#c9d6e4', '#aebfd2'] },
  { id: 'CGY-01', name: '2x2 Ceiling', cat: 'ceiling-gypsum', catLabel: '2x2 Ceiling', price: 70, priceText: 'Rs.70 / sqft', texture: 't-gypsum', desc: 'Clean 2x2 celling paneling — moisture-resistant and durable false ceiling.', finishes: ['Standard Grid', 'Slim Line'], colors: ['#f5f8fb', '#e4ecf4', '#d7e2ee'] },
  { id: 'FWP-01', name: 'Fabric Wallpaper', cat: 'fabric-wallpaper', catLabel: 'Fabric Wallpaper', price: 45, priceText: 'Rs.45 / sqft', texture: 't-fabric', desc: 'Woven-texture fabric wallpaper, warm and elegant wall finish.', finishes: ['Plain Weave', 'Textured'], colors: ['#f5f0e6', '#e7d3ae', '#d9c295'] },
  { id: 'FDR-01', name: 'Fiber Door A+', cat: 'fiber-doors', catLabel: 'Fiber Doors', price: 900, priceText: 'Rs.900 / sqft', texture: 't-fiberdoor', desc: 'A+ Grade fiber doors, water-proof and heavy duty construction.', finishes: ['Solid Finish', 'Wood Textured'], colors: ['#12345c', '#2f6fb0', '#7db9e8'] },
  { id: 'PW8-01', name: 'PVC Wall Panel 8 Inch', cat: 'pvc-wall-panel-8', catLabel: 'PVC Wall Panel 8"', price: 700, priceText: 'Rs.700 / sheet', texture: 't-panel8', desc: 'Premium 8-inch width PVC paneling for moisture protection and decor.', finishes: ['Matte', 'Glossy'], colors: ['#dfe8f1', '#c9d6e4', '#b6c4d6'] },
  { id: 'PUC-01', name: 'PVC Updown Ceiling', cat: 'pvc-updown-ceiling', catLabel: 'PVC Updown Ceiling', price: 200, priceText: 'Rs.200 / sqft', texture: 't-pop', desc: 'Modern stepped updown ceiling layout with integrated cove lighting.', finishes: ['Double Layer', 'Stepped Edge'], colors: ['#eef3f8', '#dde7f1', '#cfdcea'] },
  { id: 'PW10-01', name: 'PVC Wall Panel 10 Inch', cat: 'pvc-wall-panel-10', catLabel: 'PVC Wall Panel 10"', price: 430, priceText: 'Rs.430 / sheet', texture: 't-panel10', desc: '10-inch width PVC paneling — bold layout spacing, highly cost-effective.', finishes: ['Matte', 'Woodgrain'], colors: ['#e4ecf4', '#b6c4d6', '#8ea0b5'] }
];

// 1. Dynamic Navbar & Google Drive Categories Loader
window.globalCategories = [];
let mainNav = null;
let mobileNav = null;

const Pagination = {
  generateHTML(currentPage, totalPages, onClickFunction, delta = 1) {
    if (totalPages <= 1) return '';

    let html = `
      <button class="pagination-btn" onclick="${onClickFunction}(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        Back
      </button>
      <div class="pagination-numbers">
    `;

    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    let l;
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          html += `<button class="pagination-number" onclick="${onClickFunction}(${l + 1})">${l + 1}</button>`;
        } else if (i - l !== 1) {
          html += `<span class="pagination-ellipsis">...</span>`;
        }
      }
      html += `
        <button class="pagination-number ${i === currentPage ? 'active' : ''}" onclick="${onClickFunction}(${i})">
          ${i}
        </button>
      `;
      l = i;
    }

    html += `
      </div>
      <button class="pagination-btn" onclick="${onClickFunction}(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        Next
      </button>
    `;

    return html;
  },

  paginate(items, page = 1, itemsPerPage = 8) {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      currentPage,
      totalPages,
      totalItems: items.length,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }
};

function getNavContainers() {
  if (!mainNav) mainNav = document.getElementById("mainNav");
  if (!mobileNav) mobileNav = document.getElementById("mobileNav");
  return { mainNav, mobileNav };
}

function formatFileName(filename) {
  let name = filename.replace(/\.[^/.]+$/, ""); // strip extension
  name = name.replace(/(?:rs|Rs|RS)\.?\s*\d+\S*/g, ""); // strip Rs price tags
  name = name.replace(/[-_]+/g, " "); // replace separators
  name = name.trim();
  return name.replace(/\b\w/g, c => c.toUpperCase()); // title case
}

function extractPrice(filename) {
  let price = 150;
  let priceText = "Rs.150 / sqft";
  const priceMatch = filename.match(/(?:rs|Rs|RS)\.?\s*(\d+)/i) || filename.match(/(\d+)\s*(?:rs|Rs|RS)/i);
  if (priceMatch) {
    price = parseInt(priceMatch[1], 10);
    const lowerName = filename.toLowerCase();
    let unit = "sqft";
    if (lowerName.includes("sheet")) {
      unit = "sheet";
    } else if (lowerName.includes("piece") || lowerName.includes("pc")) {
      unit = "piece";
    }
    priceText = `Rs.${price} / ${unit}`;
  }
  return { price, priceText };
}

async function loadGlobalNavbar() {
  renderNavbar();
  try {
    const res = await fetch("/api/categories");
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const json = await res.json();
    if (json.ok) {
      globalCategories = json.categories;
      renderNavbar();

      // Dynamically build materialsData from Google Drive categories response
      if (globalCategories && globalCategories.length > 0) {
        const dynamicMaterials = [];
        globalCategories.forEach(cat => {
          cat.items.forEach(file => {
            const cleanName = formatFileName(file.name);
            const { price, priceText } = extractPrice(file.name);

            dynamicMaterials.push({
              id: file.id,
              name: cleanName,
              cat: cat.slug,
              catLabel: cat.name,
              price: price,
              priceText: priceText,
              texture: file.src, // Google Drive stream URL
              desc: `Premium quality ${cleanName} from our ${cat.name} collection. Durable, moisture-resistant, and professionally installed.`,
              finishes: ['Standard Finish', 'Premium Texture'],
              colors: ['#eaf2fa', '#c9d6e4', '#aebfd2', '#f5f0e6', '#e7d3ae']
            });
          });
        });

        if (dynamicMaterials.length > 0) {
          window.materialsData = dynamicMaterials;
        }
      }

      // Dispatch custom event for page-specific scripts that wait for categories
      window.dispatchEvent(new CustomEvent("categoriesLoaded", { detail: globalCategories }));
    } else {
      throw new Error(json.error || "Unknown server error");
    }
  } catch (err) {
    console.error("Failed to load Google Drive categories:", err);
    renderNavbar();
  }
}

function setupSubscribeForm() {
  const form = document.getElementById('subscribeForm');
  const emailInput = document.getElementById('subscribeEmail');
  const statusEl = document.getElementById('subscribeStatus');
  if (!form || !emailInput || !statusEl) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email) {
      statusEl.textContent = 'Please enter a valid email address.';
      statusEl.style.color = 'red';
      return;
    }

    statusEl.textContent = 'Subscribing...';
    statusEl.style.color = 'var(--navy)';

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();

      if (result.ok) {
        statusEl.textContent = 'Thanks! You are now subscribed.';
        statusEl.style.color = 'green';
        form.reset();
      } else {
        statusEl.textContent = result.error || 'Unable to subscribe right now.';
        statusEl.style.color = 'red';
      }
    } catch (err) {
      statusEl.textContent = 'Network error. Please try again later.';
      statusEl.style.color = 'red';
    }
  });
}

function renderNavbar() {
  const { mainNav, mobileNav } = getNavContainers();
  if (!mainNav && !mobileNav) return;

  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const activeCategory = searchParams.get("category");

  // Determine active route
  const isHome = path === "/" || path === "/index.html" || path.endsWith("/home");
  const isMaterials = path.includes("/materials");
  const isPortfolio = path.includes("/portfolio");
  const isGallery = path.includes("/gallery");

  const getActive = (isActive) => isActive ? 'active' : '';

  // Desktop Links
  const homeBtn = `<a href="/" class="${getActive(isHome)}">Home</a>`;
  const materialsBtn = `<a href="/materials" class="${getActive(isMaterials)}">Materials Catalog</a>`;
  const portfolioBtn = `<a href="/portfolio" class="${getActive(isPortfolio)}">Portfolio</a>`;

  // Folders dynamically fetched from Google Drive
  let folderBtns = '';
  for (let i = 0; i < globalCategories.length; i++) {
    const cat = globalCategories[i];
    const isCatActive = isGallery && activeCategory === cat.slug;
    folderBtns += `<a href="/gallery?category=${cat.slug}" class="${getActive(isCatActive)}">${cat.name}</a>`;
  }

  const galleryDropdown = `
    <div class="dropdown">
      <a href="/gallery" class="${getActive(isGallery)}">Gallery ▾</a>
      <div class="dropdown-content">
        <a href="/gallery" class="${getActive(isGallery && !activeCategory)}">All Folders</a>
        ${folderBtns}
      </div>
    </div>
  `;

  const mobileGalleryDropdown = `
    <div class="mobile-split">
      <div class="mobile-split-top">
        <a href="/gallery" class="split-main ${getActive(isGallery && !activeCategory)}">Gallery</a>
        <button class="split-arrow" onclick="toggleMobileGalleryMenu(event)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      <div class="mobile-split-menu" id="mobileGalleryMenu">
        <a href="/gallery" class="${getActive(isGallery && !activeCategory)}">All Folders</a>
        ${folderBtns}
      </div>
    </div>
  `;

  if (mainNav) {
    mainNav.innerHTML = homeBtn + materialsBtn + portfolioBtn + galleryDropdown;
  }
  
  if (mobileNav) {
    mobileNav.innerHTML = homeBtn + materialsBtn + portfolioBtn + mobileGalleryDropdown;
    // Add event listeners to close menu on click for mobile
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if(window.closeMobileMenu) window.closeMobileMenu();
      });
    });
  }
}

window.toggleMobileGalleryMenu = function(e) {
  e.preventDefault();
  e.stopPropagation();
  const menu = document.getElementById('mobileGalleryMenu');
  if (menu) {
    menu.classList.toggle('show');
  }
};

// 2. Global Lightbox Slideshow Implementation
let lightboxItems = [];
let activeLightboxIdx = 0;

window.openLightbox = function (idx, items) {
  lightboxItems = items;
  activeLightboxIdx = idx;
  updateLightbox();
  const lightbox = document.getElementById("lightbox");
  if (lightbox) lightbox.classList.add("active");
};

window.closeLightbox = function () {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) lightbox.classList.remove("active");
  const container = document.getElementById("lightbox-content-box");
  if (container) container.innerHTML = "";
};

window.prevLightboxItem = function () {
  if (lightboxItems.length === 0) return;
  activeLightboxIdx = (activeLightboxIdx - 1 + lightboxItems.length) % lightboxItems.length;
  updateLightbox();
};

window.nextLightboxItem = function () {
  if (lightboxItems.length === 0) return;
  activeLightboxIdx = (activeLightboxIdx + 1) % lightboxItems.length;
  updateLightbox();
};

function updateLightbox() {
  const item = lightboxItems[activeLightboxIdx];
  const contentBox = document.getElementById("lightbox-content-box");
  const caption = document.getElementById("lightbox-caption");
  if (!item || !contentBox || !caption) return;

  if (item.type === "video") {
    contentBox.innerHTML = `<video id="lightbox-media" src="${item.src}" controls autoplay style="max-width: 88vw; max-height: 78vh; border-radius: 12px;"></video>`;
  } else {
    contentBox.innerHTML = `<img id="lightbox-media" src="${item.src}" alt="${item.name}" style="max-width: 88vw; max-height: 78vh; border-radius: 12px; object-fit: contain;">`;
  }
  caption.textContent = `${item.categoryName || 'Gallery'} — ${item.name || 'Sohail Interior'}`;
}

// LocalStorage Wishlist Manager
window.Wishlist = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('sohail_wishlist') || '[]');
    } catch (_) {
      return [];
    }
  },
  save(list) {
    localStorage.setItem('sohail_wishlist', JSON.stringify(list));
    this.updateBadges();
  },
  toggle(id) {
    const list = this.get();
    const idx = list.indexOf(id);
    if (idx === -1) {
      list.push(id);
    } else {
      list.splice(idx, 1);
    }
    this.save(list);
    this.render();
  },
  add(id) {
    const list = this.get();
    if (!list.includes(id)) {
      list.push(id);
      this.save(list);
    }
    this.render();
  },
  remove(id) {
    const list = this.get();
    const filtered = list.filter(item => item !== id);
    this.save(filtered);
    this.render();
  },
  updateBadges() {
    const list = this.get();
    const badge = document.getElementById('wishlistBadge');
    if (badge) badge.textContent = list.length;
  },
  render() {
    const container = document.getElementById('wishlistItemsContainer');
    if (!container) return;

    const list = this.get();
    if (list.length === 0) {
      container.innerHTML = '<div class="drawer-empty-state">No saved materials yet.</div>';
      return;
    }

    let html = '';
    list.forEach(id => {
      const item = window.materialsData.find(m => m.id === id);
      if (!item) return;

      html += `
        <div class="drawer-item" data-id="${item.id}">
          <div class="drawer-item-img ${item.texture}"></div>
          <div class="drawer-item-info">
            <h4>${item.name}</h4>
            <p>${item.priceText}</p>
          </div>
          <div class="drawer-item-actions">
            <button class="drawer-remove-btn" onclick="Wishlist.remove('${item.id}')">Remove</button>
            <button class="btn btn-primary" style="padding: 6px 12px; font-size:11px;" onclick="window.location.href='/materials?id=${item.id}'; window.closeWishlistDrawer();">View</button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }
};

// LocalStorage Quote Cart Manager
window.QuoteCart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('sohail_cart') || '[]');
    } catch (_) {
      return [];
    }
  },
  save(cart) {
    localStorage.setItem('sohail_cart', JSON.stringify(cart));
    this.updateBadges();
  },
  add(id, finish, color, qty = 1) {
    const cart = this.get();
    const key = `${id}_${finish}_${color}`.replace(/\s+/g, '_');
    const existing = cart.find(x => x.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ key, id, finish, color, qty });
    }
    this.save(cart);
    this.render();
  },
  remove(key) {
    const cart = this.get();
    const filtered = cart.filter(item => item.key !== key);
    this.save(filtered);
    this.render();
  },
  updateQty(key, delta) {
    const cart = this.get();
    const item = cart.find(x => x.key === key);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
      this.save(cart);
      this.render();
    }
  },
  updateBadges() {
    const cart = this.get();
    const totalQty = cart.reduce((acc, x) => acc + x.qty, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = totalQty;
  },
  render() {
    const container = document.getElementById('cartItemsContainer');
    const totalQtyEl = document.getElementById('cartTotalQty');
    if (!container) return;

    const cart = this.get();
    const totalQty = cart.reduce((acc, x) => acc + x.qty, 0);
    if (totalQtyEl) totalQtyEl.textContent = totalQty;

    if (cart.length === 0) {
      container.innerHTML = '<div class="drawer-empty-state">No items in your quote list yet.</div>';
      return;
    }

    let html = '';
    cart.forEach(cartItem => {
      const item = window.materialsData.find(m => m.id === cartItem.id);
      if (!item) return;

      html += `
        <div class="drawer-item" data-key="${cartItem.key}">
          <div class="drawer-item-img ${item.texture}"></div>
          <div class="drawer-item-info">
            <h4>${item.name}</h4>
            <p style="font-size:12px; color:var(--gray-band); margin-top:2px;">
              Finish: <b>${cartItem.finish}</b><br>
              Tone: <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${cartItem.color}; border:1px solid var(--line); transform:translateY(1px);"></span>
            </p>
          </div>
          <div class="drawer-item-actions">
            <span class="drawer-item-price">${item.priceText}</span>
            <div class="drawer-qty-selector">
              <button onclick="QuoteCart.updateQty('${cartItem.key}', -1)">&minus;</button>
              <span>${cartItem.qty}</span>
              <button onclick="QuoteCart.updateQty('${cartItem.key}', 1)">+</button>
            </div>
            <button class="drawer-remove-btn" onclick="QuoteCart.remove('${cartItem.key}')">Remove</button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  },
  sendWhatsApp() {
    const cart = this.get();
    if (cart.length === 0) return;

    let text = "Hi Sohail Interior, I would like to get a quote for the following materials:\n\n";
    cart.forEach((c, idx) => {
      const item = window.materialsData.find(m => m.id === c.id);
      if (!item) return;
      text += `${idx + 1}. ${item.name} (${item.id})\n`;
      text += `   - Finish: ${c.finish}\n`;
      text += `   - Tone: ${c.color}\n`;
      text += `   - Quantity: ${c.qty}\n\n`;
    });
    text += "Please let me know the pricing and availability. Thank you!";
    
    window.open(`https://wa.me/923115813505?text=${encodeURIComponent(text)}`, '_blank');
  }
};

// Global Search Suggest System
window.setupGlobalSearch = function() {
  const input = document.getElementById('searchInput');
  const resultsBox = document.getElementById('searchResults');
  if (!input || !resultsBox) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      resultsBox.innerHTML = '';
      resultsBox.style.display = 'none';
      return;
    }

    const matches = window.materialsData.filter(m => {
      return m.name.toLowerCase().includes(query) || 
             m.catLabel.toLowerCase().includes(query) || 
             m.desc.toLowerCase().includes(query) ||
             m.id.toLowerCase().includes(query);
    });

    if (matches.length === 0) {
      resultsBox.innerHTML = '<div style="text-align:center; padding: 12px; color: var(--gray-band); font-size: 13px;">No materials found.</div>';
      resultsBox.style.display = 'block';
      return;
    }

    resultsBox.innerHTML = matches.map(m => {
      return `
        <div class="search-result-item" onclick="window.location.href='/materials?id=${m.id}'; window.closeSearchModal();" style="display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 6px; cursor: pointer; transition: background 0.2s ease;">
          <div class="search-result-img ${m.texture}" style="width: 36px; height: 36px; border-radius: 4px; overflow: hidden; background: var(--mist);"></div>
          <div class="search-result-info">
            <h4 style="margin: 0; font-size: 13.5px; color: var(--navy); font-weight: 600;">${m.name}</h4>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: var(--gray-band);">${m.catLabel} &bull; ${m.priceText}</p>
          </div>
        </div>
      `;
    }).join('');
    resultsBox.style.display = 'block';
  });
};

// Keyboard shortcuts for Lightbox + Drawers + Modals + mobile sidebar
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const lightbox = document.getElementById("lightbox");
    if (lightbox && lightbox.classList.contains("active")) {
      closeLightbox();
      return;
    }

    const searchModal = document.getElementById("searchModal");
    if (searchModal && searchModal.classList.contains("active")) {
      window.closeSearchModal();
      return;
    }

    const wishlistDrawer = document.getElementById("wishlistDrawer");
    if (wishlistDrawer && wishlistDrawer.classList.contains("active")) {
      window.closeWishlistDrawer();
      return;
    }

    const cartDrawer = document.getElementById("cartDrawer");
    if (cartDrawer && cartDrawer.classList.contains("active")) {
      window.closeCartDrawer();
      return;
    }

    const sidebar = document.getElementById("mobileSidebar");
    if (sidebar && sidebar.classList.contains("active")) {
      if (window.closeMobileMenu) window.closeMobileMenu();
      return;
    }
  }

  const lightbox = document.getElementById("lightbox");
  if (lightbox && lightbox.classList.contains("active")) {
    if (e.key === "ArrowLeft") prevLightboxItem();
    if (e.key === "ArrowRight") nextLightboxItem();
  }
});

// 3. Reveal on Scroll Animation Loader
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in');
  });
}, { threshold: 0.12 });

window.revealCheck = function () {
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
};

// 4. Initial Startup Tasks
document.addEventListener("DOMContentLoaded", () => {
  loadGlobalNavbar();
  setupSubscribeForm();
  window.revealCheck();

  // Initialize wishlist, cart badges & search suggest
  window.Wishlist.updateBadges();
  window.QuoteCart.updateBadges();
  window.setupGlobalSearch();

  // Bind quote submit
  const sendQuoteBtn = document.getElementById('whatsappQuoteBtn');
  if (sendQuoteBtn) {
    sendQuoteBtn.onclick = () => window.QuoteCart.sendWhatsApp();
  }
});

// 5. Global Page Loader hide controller
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    const isGlass = loader.classList.contains('glass-loader');
    const delay = isGlass ? 800 : 2600;
    
    if (isGlass) {
      loader.style.transition = 'opacity 0.4s cubic-bezier(.4, 0, .2, 1), filter 0.4s ease';
    }
    
    setTimeout(() => {
      loader.classList.add('done');
    }, delay);
  }
});

// Intercept navigation triggers to show the loader during page changes
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', (e) => {
    // 1. Check for standard anchor link clicks
    const anchor = e.target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('/#') && !href.includes('#') && !anchor.hasAttribute('download') && anchor.target !== '_blank') {
        const loader = document.getElementById('pageLoader');
        if (loader) {
          loader.classList.remove('done');
        }
      }
    }
    
    // 2. Check for inline JavaScript redirect triggers (e.g. brand logo click)
    const clickable = e.target.closest('[onclick]');
    if (clickable) {
      const onclickAttr = clickable.getAttribute('onclick') || '';
      if (onclickAttr.includes('window.location') || onclickAttr.includes('location.href')) {
        const loader = document.getElementById('pageLoader');
        if (loader) {
          loader.classList.remove('done');
        }
      }
    }
  });
});
