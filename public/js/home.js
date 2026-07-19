// Home Page Specific Logic

let newestCategorySlugs = [];



let homeCatPage = 0;
const HOME_CAT_PER_PAGE = 10;

function renderHomeDriveCategories(categories) {
  const container = document.querySelector(".cat-triad").parentElement;
  let grid = container.querySelector(".cat-triad");
  if (!grid) return;

  if (!categories || categories.length === 0) {
    grid.innerHTML = `<div style="grid-column: span 5; text-align:center; padding: 40px; color: #6b7f97;">No categories synced. Check back soon.</div>`;
    return;
  }

  // Calculate slice
  const start = homeCatPage * HOME_CAT_PER_PAGE;
  const end = start + HOME_CAT_PER_PAGE;
  const paginatedCats = categories.slice(start, end);

  grid.innerHTML = paginatedCats.map(cat => {
    // Map categories dynamically to correct mock visual textures
    let textureClass = "t-vinyl";
    const nameLower = cat.name.toLowerCase();
    if (nameLower.includes("blind")) textureClass = "t-blinds";
    else if (nameLower.includes("gypsum") || nameLower.includes("ceiling")) textureClass = "t-gypsum";
    else if (nameLower.includes("wallpaper")) textureClass = "t-fabric";
    else if (nameLower.includes("fiber")) textureClass = "t-fiberdoor";
    else if (nameLower.includes("10")) textureClass = "t-panel10";
    else if (nameLower.includes("8")) textureClass = "t-panel8";
    else if (nameLower.includes("updown")) textureClass = "t-pop";

    return `
      <div class="cat-card reveal" onclick="window.location.href='/gallery?category=${cat.slug}'">
        <div class="art" style="background-color: var(--mist); overflow: hidden;">
          <img src="/images/placeholder/${encodeURIComponent(cat.name.trim().toUpperCase())}.jpg" 
               alt="${cat.name}" 
               onerror="this.style.display='none'; this.parentElement.classList.add('${textureClass}');"
               style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="cat-label">${cat.name.toUpperCase()}</div>
      </div>
    `;
  }).join("");

  // Pagination controls
  if (categories.length > HOME_CAT_PER_PAGE) {
    let controls = container.querySelector(".home-cat-pagination");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "home-cat-pagination";
      controls.style.cssText = "display: flex; justify-content: center; gap: 12px; margin-top: 32px;";
      container.appendChild(controls);
    }

    const hasNext = end < categories.length;
    const hasPrev = homeCatPage > 0;

    controls.innerHTML = `
      <button class="btn btn-ghost" onclick="changeHomeCatPage(-1)" ${hasPrev ? '' : 'disabled'} style="padding: 8px 16px;">&larr; Back</button>
      <button class="btn btn-primary" onclick="changeHomeCatPage(1)" ${hasNext ? '' : 'disabled'} style="padding: 8px 16px;">Next &rarr;</button>
    `;
    controls.style.display = "flex";
  } else {
    let controls = container.querySelector(".home-cat-pagination");
    if (controls) controls.style.display = "none";
  }

  if (window.revealCheck) window.revealCheck();
}

window.changeHomeCatPage = function (delta) {
  homeCatPage += delta;
  renderHomeDriveCategories(window.globalCategories || []);
};

// 3. Render Featured Materials
function renderFeaturedGrid() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  // Render placeholders if globalCategories is not yet loaded
  if (!window.globalCategories || window.globalCategories.length === 0) {
    grid.innerHTML = `<div style="grid-column: span 4; text-align:center; padding: 40px; color: #6b7f97;">Loading featured materials...</div>`;
    return;
  }

  // The requested featured categories
  const featuredSlugs = ['fabric-wallpaper', 'fiber-doors', 'pvc-wall-panel-10', 'vinyl', 'blinds'];

  grid.innerHTML = featuredSlugs.map(slug => {
    const cat = window.globalCategories.find(c => c.slug === slug);
    if (!cat) return '';

    const firstImg = (cat.items || []).find(it => it.type !== 'video' && it.src);
    const hasRealImg = !!firstImg;
    const thumbStyle = hasRealImg ? `background-size:cover; background-position:center;` : '';
    const dataSrc = hasRealImg ? `data-bg-src="${firstImg.src}"` : '';

    let textureClass = 't-gypsum';
    if (slug === 'vinyl') textureClass = 't-vinyl';
    if (slug === 'fiber-doors') textureClass = 't-fiberdoor';
    if (slug === 'fabric-wallpaper') textureClass = 't-fabric';
    if (slug === 'pvc-wall-panel-10') textureClass = 't-panel10';
    if (slug === 'blinds') textureClass = 't-blinds';

    const thumbCls = hasRealImg ? 'thumb cat-slideshow fade-load' : `thumb cat-slideshow ${textureClass}`;
    const count = (cat.items || []).length;
    const isNew = newestCategorySlugs.includes(slug);

    return `
      <div class="pcard cat-card reveal" onclick="window.location.href='/materials?category=${cat.slug}'">
        <div class="${thumbCls}" style="${thumbStyle}" ${dataSrc}>
          ${hasRealImg ? '<div class="loading-glass"></div>' : ''}
          ${isNew ? '<div class="new-pill mono">New</div>' : ''}
          ${count > 0 ? `<div class="cat-count-pill mono">${count}</div>` : ''}
        </div>
        <div class="pbody">
          <h4>${cat.name}</h4>
          <div class="price">${count > 0 ? `${count} item${count !== 1 ? 's' : ''}` : 'View collection'}</div>
        </div>
      </div>
    `;
  }).join("");

  // Fade in card images once loaded
  grid.querySelectorAll('.fade-load').forEach(el => {
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

  if (window.revealCheck) window.revealCheck();
}

// 4. Hero Slideshow logic (playing video slides with constant time)
const slidesData = [
  {
    title: 'Introducing <em>PVC Updown</em><br>Ceiling',
    description: 'A layered updown ceiling profile with hidden lighting channels — now available across all Sohail Interior projects.',
    btnText: 'View Material →',
    btnLink: '/materials?category=pvc-updown-ceiling',
    mediaHTML: `<video src="/videos/1.mp4" autoplay loop muted playsinline></video>`,
    duration: 12000, // 12 seconds for video 1
    isVideo: true
  },
  {
    title: 'Premium <em>Window</em><br>Blinds',
    description: 'Elegant Roller, Zebra, and Bamboo blinds to control light and add privacy to your rooms.',
    btnText: 'View Material →',
    btnLink: '/materials?category=blinds',
    mediaHTML: `<video src="/videos/2.mp4" autoplay loop muted playsinline></video>`,
    duration: 8000, // 8 seconds for video 2
    isVideo: true
  }
];

const slideSequence = [0, 1];
let currentSequenceIdx = 0;
let currentSlideIdx = 0;
let slideTimeoutId = null;

function initializeDots() {
  const dotsEl = document.getElementById("heroDots");
  if (!dotsEl) return;
  dotsEl.innerHTML = slidesData.map((_, idx) => {
    return `<span class="${idx === 0 ? 'active' : ''}" onclick="setSlide(${idx})" aria-label="Slide ${idx + 1}"></span>`;
  }).join("");
}

let isFirstLoad = true;

function renderSlide(slideIdx) {
  const banner = document.querySelector(".hero-banner");
  const copyEl = document.getElementById("heroCopy");
  const dots = document.querySelectorAll("#heroDots span");
  if (!copyEl) return;

  currentSlideIdx = (slideIdx + slidesData.length) % slidesData.length;
  const slide = slidesData[currentSlideIdx];

  const updateDOM = () => {
    // Render text copy
    copyEl.innerHTML = `
      <div class="eyebrow mono" style="animation: fadeUp 0.8s ease 3s forwards; opacity: 0;"><span class="dot"></span>New This Season</div>
      <h1 style="animation: wipeIn 0.8s ease 3.2s forwards; opacity: 0;">${slide.title}</h1>
      <p style="animation: popUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 3.4s forwards; opacity: 0;">${slide.description}</p>
      <div class="btn-row" style="margin-top: 24px; animation: fadeIn 0.8s ease 3.6s forwards; opacity: 0;">
        <button class="btn btn-primary" onclick="window.location.href='${slide.btnLink}'">${slide.btnText}</button>
        
      </div>
    `;

    // Remove animation class to restart it
    banner.classList.remove("reveal");





    // Render dot states
    dots.forEach((dot, i) => {
      if (i === currentSlideIdx) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  };

  if (isFirstLoad) {
    updateDOM();
    isFirstLoad = false;
  } else {
    // Blur out visual only
    visualEl.style.transition = 'filter 0.4s ease, opacity 0.4s ease';
    visualEl.style.filter = 'blur(16px) brightness(0.8)';
    visualEl.style.opacity = '0.5';

    setTimeout(() => {
      updateDOM();
      // Blur in visual only
      visualEl.style.filter = 'blur(0px) brightness(1)';
      visualEl.style.opacity = '1';

      // Cleanup filter after transition completes
      setTimeout(() => {
        visualEl.style.filter = '';
      }, 400);
    }, 400);
  }
}

function advanceSequence() {
  currentSequenceIdx = (currentSequenceIdx + 1) % slideSequence.length;
  renderSlide(slideSequence[currentSequenceIdx]);
}

function startSliderTimer() {
  if (slideTimeoutId) clearTimeout(slideTimeoutId);

  const currentSlide = slidesData[currentSlideIdx];
  const duration = currentSlide.duration || 4000;

  slideTimeoutId = setTimeout(() => {
    advanceSequence();
    startSliderTimer();
  }, duration);
}

window.setSlide = function (index) {
  // Sync the sequence if user manually clicks a dot
  const foundSeqIdx = slideSequence.indexOf(index);
  if (foundSeqIdx !== -1) {
    currentSequenceIdx = foundSeqIdx;
  }
  renderSlide(index);
  startSliderTimer(); // Reset timer interval
};

// Startup
document.addEventListener("DOMContentLoaded", () => {
  renderFeaturedGrid();
  initializeDots();
  renderSlide(0);
  startSliderTimer();
});

// Event listener from common.js categories fetcher
window.addEventListener("categoriesLoaded", (e) => {
  const cats = e.detail || [];
  const sortedCats = [...cats].sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
  newestCategorySlugs = sortedCats.slice(0, 2).map(c => c.slug);

  renderHomeDriveCategories(cats);
  renderFeaturedGrid();
});
