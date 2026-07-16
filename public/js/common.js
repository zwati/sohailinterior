// Common JavaScript Logic for Sohail Interior

// 1. Dynamic Navbar & Google Drive Categories Loader
let globalCategories = [];

async function loadGlobalNavbar() {
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
    // Render static navbar fallback
    renderNavbar();
  }
}

function renderNavbar() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;

  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const activeCategory = searchParams.get("category");

  // Determine active route
  const isHome = path === "/" || path === "/index.html" || path.endsWith("/home");
  const isMaterials = path.includes("/materials");
  const isPortfolio = path.includes("/portfolio");
  const isGallery = path.includes("/gallery");

  const homeBtn = `<a href="/" class="${isHome ? 'active' : ''}">Home</a>`;
  const materialsBtn = `<a href="/materials" class="${isMaterials ? 'active' : ''}">Materials Catalog</a>`;
  const portfolioBtn = `<a href="/portfolio" class="${isPortfolio ? 'active' : ''}">Portfolio</a>`;

  // Folders dynamically fetched from Google Drive
  const folderBtns = globalCategories.map(cat => {
    const isCatActive = isGallery && activeCategory === cat.slug;
    return `<a href="/gallery?category=${cat.slug}" class="${isCatActive ? 'active' : ''}">${cat.name}</a>`;
  }).join("");

  const galleryDropdown = `
    <div class="dropdown">
      <a href="/gallery" class="${isGallery ? 'active' : ''}">Gallery ▾</a>
      <div class="dropdown-content">
        <a href="/gallery" class="${isGallery && !activeCategory ? 'active' : ''}">All Folders</a>
        ${folderBtns}
      </div>
    </div>
  `;

  nav.innerHTML = homeBtn + materialsBtn + portfolioBtn + galleryDropdown;
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

// Keyboard shortcuts for Lightbox
document.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("lightbox");
  if (lightbox && lightbox.classList.contains("active")) {
    if (e.key === "Escape") closeLightbox();
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
  window.revealCheck();

  // Close Announcement Bar Handler
  const announceCloseBtn = document.querySelector(".announce button");
  if (announceCloseBtn) {
    announceCloseBtn.addEventListener("click", () => {
      document.getElementById("announce").classList.add("hide");
    });
  }
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
