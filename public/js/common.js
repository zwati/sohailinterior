// Common JavaScript Logic for Sohail Interior

// 1. Dynamic Navbar & Google Drive Categories Loader
let globalCategories = [];
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

async function loadGlobalNavbar() {
  renderNavbar();
  try {
    const res = await fetch("/api/categories");
    const json = await res.json();
    if (json.ok) {
      globalCategories = json.categories;
      renderNavbar();

      // Dispatch custom event for page-specific scripts that wait for categories
      window.dispatchEvent(new CustomEvent("categoriesLoaded", { detail: globalCategories }));
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

  if (mainNav) {
    mainNav.innerHTML = homeBtn + materialsBtn + portfolioBtn + galleryDropdown;
  }
  
  if (mobileNav) {
    mobileNav.innerHTML = homeBtn + materialsBtn + portfolioBtn + galleryDropdown;
    // Add event listeners to close menu on click for mobile
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if(window.closeMobileMenu) window.closeMobileMenu();
      });
    });
  }
}

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

// Keyboard shortcuts for Lightbox + mobile sidebar
document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("lightbox");
  if (lightbox && lightbox.classList.contains("active")) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prevLightboxItem();
    if (e.key === "ArrowRight") nextLightboxItem();
  }

  const sidebar = document.getElementById("mobileSidebar");
  if (e.key === "Escape" && sidebar && sidebar.classList.contains("active")) {
    if (window.closeMobileMenu) window.closeMobileMenu();
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
});

// 5. Global Page Loader hide controller
window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('done');
    }, 2600);
  }
});
