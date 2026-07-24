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

// 4. Hero 4-Slide Sequence System (Hero Video + 3 Slideshow Images)
const slidesData = [
  {
    type: 'video',
    title: 'Introducing <em>PVC Updown</em><br>Ceiling',
    description: 'A layered updown ceiling profile with hidden lighting channels — now available across all Sohail Interior projects.',
    btnText: 'View Material',
    btnLink: '/materials',
    duration: 8000
  },
  {
    type: 'image',
    imageSrc: '/images/hero/hero-slideshow-1.jpg',
    title: 'Crafted <em>Interior Finishes</em>',
    description: 'Bespoke architectural wall and ceiling paneling engineered for modern aesthetic living in Sahiwal & Lahore.',
    btnText: 'Explore Gallery',
    btnLink: '/gallery',
    duration: 6000
  },
  {
    type: 'image',
    imageSrc: '/images/hero/hero-slideshow-2.jpg',
    title: 'Premium <em>Material Collections</em>',
    description: 'Waterproof fiber doors, acoustic 2x2 ceiling grids, and designer wallpaper textures crafted to last.',
    btnText: 'Browse Catalog',
    btnLink: '/materials',
    duration: 6000
  },
  {
    type: 'image',
    imageSrc: '/images/hero/hero-slideshow-3.jpg',
    title: 'Signature <em>Design & Execution</em>',
    description: 'Full site consultation, custom measurement, and professional guaranteed installation for your space.',
    btnText: 'Book Consultation',
    btnLink: '/portfolio',
    duration: 6000
  }
];

let currentSlideIdx = 0;
let slideTimeoutId = null;
let videoReadyHandled = false;

function initializeDots() {
  const dotsEl = document.getElementById("heroDots");
  if (!dotsEl) return;
  dotsEl.innerHTML = slidesData.map((_, idx) => {
    return `<span class="${idx === 0 ? 'active' : ''}" onclick="setSlide(${idx})" aria-label="Slide ${idx + 1}"></span>`;
  }).join("");
}

function triggerTextEffects(slide) {
  const copyEl = document.getElementById("heroCopy");
  if (!copyEl) return;

  // Force DOM re-trigger of animations by updating HTML
  copyEl.innerHTML = `
    <div class="eyebrow mono" style="animation: fadeUp 0.6s ease 0.05s forwards; opacity: 0;"><span class="dot"></span>New This Season</div>
    <h1 style="animation: wipeIn 0.7s ease 0.15s forwards; opacity: 0;">${slide.title}</h1>
    <p style="animation: popUp 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.25s forwards; opacity: 0;">${slide.description}</p>
    <div class="btn-row" style="margin-top: 24px; animation: fadeIn 0.7s ease 0.35s forwards; opacity: 0;">
      <button class="btn btn-primary" onclick="window.location.href='${slide.btnLink || '/materials'}'">
        ${slide.btnText}
      </button>
    </div>
  `;
}

function renderSlide(slideIdx, immediate = false) {
  const nextIdx = (slideIdx + slidesData.length) % slidesData.length;
  const copyEl = document.getElementById("heroCopy");
  const bgImg = document.getElementById("heroBgImg");
  const bgVideo = document.getElementById("heroBgVideo");

  const performDOMUpdate = () => {
    currentSlideIdx = nextIdx;
    const slide = slidesData[currentSlideIdx];
    const dots = document.querySelectorAll("#heroDots span");

    if (slide.type === 'video') {
      if (bgVideo && (bgVideo.readyState >= 2 || videoReadyHandled)) {
        bgVideo.classList.add("active-media");
        bgVideo.loop = false; // Video plays ONCE
        try {
          bgVideo.currentTime = 0;
          bgVideo.play();
        } catch (_) {}
      } else if (bgImg) {
        bgImg.style.backgroundImage = "url('/images/hero/hero-img.png')";
      }
    } else {
      if (bgVideo) bgVideo.classList.remove("active-media");
      if (bgImg && slide.imageSrc) {
        bgImg.style.backgroundImage = `url('${slide.imageSrc}')`;
      }
    }

    // Update dots indicator
    dots.forEach((dot, i) => {
      if (i === currentSlideIdx) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    // Re-trigger text copy & entrance effects
    triggerTextEffects(slide);

    // Clear closing transition classes
    if (copyEl) copyEl.classList.remove("copy-closing");

    // Restart slider timer
    startSliderTimer();
  };

  if (immediate) {
    performDOMUpdate();
  } else {
    // Closing phase: fade out copy
    if (copyEl) copyEl.classList.add("copy-closing");

    setTimeout(performDOMUpdate, 320);
  }
}


function startSliderTimer() {
  if (slideTimeoutId) clearTimeout(slideTimeoutId);
  const currentSlide = slidesData[currentSlideIdx];
  const duration = currentSlide.duration || 6000;

  slideTimeoutId = setTimeout(() => {
    // If on video slide (0), transition to first image slide (1);
    // If on image slides (1, 2, 3), circulate across image slides (1 -> 2 -> 3 -> 1...)
    const nextIdx = (currentSlideIdx === 0 || currentSlideIdx >= slidesData.length - 1)
      ? 1
      : currentSlideIdx + 1;

    renderSlide(nextIdx);
  }, duration);
}

window.setSlide = function (index) {
  renderSlide(index);
};

function setupVideoReadyListener() {
  const bgVideo = document.getElementById("heroBgVideo");
  if (!bgVideo) return;

  bgVideo.loop = false;
  bgVideo.onended = () => {
    // When video finishes playing once, transition to first image slide
    if (currentSlideIdx === 0) {
      renderSlide(1);
    }
  };

  const onVideoReady = () => {
    if (videoReadyHandled) return;
    videoReadyHandled = true;

    // Transition to video background when ready
    bgVideo.classList.add("active-media");

    // If currently on slide 0 (video slide), re-trigger text effects & entrance as requested
    if (currentSlideIdx === 0) {
      renderSlide(0, true);
    }
  };

  if (bgVideo.readyState >= 3) {
    onVideoReady();
  } else {
    bgVideo.addEventListener("canplay", onVideoReady, { once: true });
    bgVideo.addEventListener("playing", onVideoReady, { once: true });
  }
}

// Startup
document.addEventListener("DOMContentLoaded", () => {
  renderFeaturedGrid();
  initializeDots();
  renderSlide(0, true); // Immediately displays hero-img.png + starting text effects
  setupVideoReadyListener(); // Fades in video when loaded, plays once, then transitions to circulating images
});




// Event listener from common.js categories fetcher
window.addEventListener("categoriesLoaded", (e) => {
  const cats = e.detail || [];
  const sortedCats = [...cats].sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
  newestCategorySlugs = sortedCats.slice(0, 2).map(c => c.slug);

  renderHomeDriveCategories(cats);
  renderFeaturedGrid();
});
