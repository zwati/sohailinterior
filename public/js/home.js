// Home Page Specific Logic

// 1. Static Materials Data for Featured Section
const materialsData = [
  { id: 'BLN-01', name: 'Window Blinds', cat: 'blinds', catLabel: 'Blinds', price: 'Rs.250 - Rs.360 / sqft', texture: 't-blinds', desc: 'Premium window blinds. Available in Roller (Rs.250/sf), Zebra (Rs.360/sf), and Bamboo (Rs.250/sf).', finishes: ['Roller', 'Zebra', 'Bamboo'], colors: ['#eaf2fa', '#c9d6e4', '#aebfd2'] },
  { id: 'CGY-01', name: '2x2 Ceiling', cat: 'ceiling-gypsum', catLabel: '2x2 Ceiling', price: 'Rs.70 / sqft', texture: 't-gypsum', desc: 'Clean 2x2 celling paneling — moisture-resistant and durable false ceiling.', finishes: ['Standard Grid', 'Slim Line'], colors: ['#f5f8fb', '#e4ecf4', '#d7e2ee'] },
  { id: 'FWP-01', name: 'Fabric Wallpaper', cat: 'fabric-wallpaper', catLabel: 'Fabric Wallpaper', price: 'Rs.45 / sqft', texture: 't-fabric', desc: 'Woven-texture fabric wallpaper, warm and elegant wall finish.', finishes: ['Plain Weave', 'Textured'], colors: ['#f5f0e6', '#e7d3ae', '#d9c295'] },
  { id: 'FDR-01', name: 'Fiber Door A+', cat: 'fiber-doors', catLabel: 'Fiber Doors', price: 'Rs.900 / sqft', texture: 't-fiberdoor', desc: 'A+ Grade fiber doors, water-proof and heavy duty construction.', finishes: ['Solid Finish', 'Wood Textured'], colors: ['#12345c', '#2f6fb0', '#7db9e8'] },
  { id: 'PW8-01', name: 'PVC Wall Panel 8 Inch', cat: 'pvc-wall-panel-8', catLabel: 'PVC Wall Panel 8"', price: 'Rs.700 / sheet', texture: 't-panel8', desc: 'Premium 8-inch width PVC paneling for moisture protection and decor.', finishes: ['Matte', 'Glossy'], colors: ['#dfe8f1', '#c9d6e4', '#b6c4d6'] },
  { id: 'PUC-01', name: 'PVC Updown Ceiling', cat: 'pvc-updown-ceiling', catLabel: 'PVC Updown Ceiling', price: 'Rs.200 / sqft', texture: 't-pop', desc: 'Modern stepped updown ceiling layout with integrated cove lighting.', finishes: ['Double Layer', 'Stepped Edge'], colors: ['#eef3f8', '#dde7f1', '#cfdcea'] },
  { id: 'PW10-01', name: 'PVC Wall Panel 10 Inch', cat: 'pvc-wall-panel-10', catLabel: 'PVC Wall Panel 10"', price: 'Rs.430 / sheet', texture: 't-panel10', desc: '10-inch width PVC paneling — bold layout spacing, highly cost-effective.', finishes: ['Matte', 'Woodgrain'], colors: ['#e4ecf4', '#b6c4d6', '#8ea0b5'] }
];

// Helper to generate catalog product card HTML
function getProductCardHTML(m) {
  if (!m) return '';
  const isNew = ['PW8-01', 'PUC-01'].includes(m.id);
  const swatchHTML = m.colors.map(c => `<span style="background:${c}"></span>`).join('');
  return `
    <div class="pcard reveal" onclick="window.location.href='/materials?id=${m.id}'">
      <div class="thumb ${m.texture}">
        ${isNew ? '<div class="new-pill mono">New</div>' : ''}
      </div>
      <div class="pbody">
        <h4>${m.name}</h4>
        <div class="price">${m.price}</div>
        <div class="swatch-dots">${swatchHTML}</div>
      </div>
    </div>
  `;
}

// 2. Render Categories on Home Page (fetching Google Drive dynamically)
function renderHomeDriveCategories(categories) {
  const grid = document.querySelector(".cat-triad");
  if (!grid) return;

  if (!categories || categories.length === 0) {
    grid.innerHTML = `<div style="grid-column: span 3; text-align:center; padding: 40px; color: #6b7f97;">No categories synced. Check back soon.</div>`;
    return;
  }

  grid.innerHTML = categories.map(cat => {
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
        <div class="art" style="background: var(--mist); overflow: hidden;">
          <img src="/images/placeholder/${encodeURIComponent(cat.name.toUpperCase())}.jpg" 
               alt="${cat.name}" 
               onerror="this.style.display='none'; this.parentElement.classList.add('${textureClass}');"
               style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="cat-label">${cat.name.toUpperCase()}</div>
      </div>
    `;
  }).join("");

  if (window.revealCheck) window.revealCheck();
}

// 3. Render Featured Materials
function renderFeaturedGrid() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  const featuredIds = ['PUC-01', 'FWP-01', 'PW8-01', 'FDR-01'];
  grid.innerHTML = featuredIds
    .map(id => {
      const match = materialsData.find(m => m.id === id);
      return getProductCardHTML(match);
    })
    .join("");

  if (window.revealCheck) window.revealCheck();
}

// 4. Hero Slideshow logic (playing video slides with constant time)
const slidesData = [
  {
    title: 'Introducing <em>PVC Updown</em><br>Ceiling',
    description: 'A layered updown ceiling profile with hidden lighting channels — now available across all Sohail Interior projects.',
    btnText: 'View Material →',
    btnLink: '/materials?id=PUC-01',
    mediaHTML: `<video src="/videos/1.mp4" autoplay loop muted playsinline></video>`,
    duration: 12000, // 12 seconds for video 1
    isVideo: true
  },
  {
    title: 'Premium <em>Window</em><br>Blinds',
    description: 'Elegant Roller, Zebra, and Bamboo blinds to control light and add privacy to your rooms.',
    btnText: 'View Material →',
    btnLink: '/materials?id=BLN-01',
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
  const visualEl = document.getElementById("heroVisual");
  const dots = document.querySelectorAll("#heroDots span");
  if (!copyEl || !visualEl) return;

  currentSlideIdx = (slideIdx + slidesData.length) % slidesData.length;
  const slide = slidesData[currentSlideIdx];

  const updateDOM = () => {
    // Render text copy
    copyEl.innerHTML = `
      <div class="eyebrow mono"><span class="dot"></span>New This Season</div>
      <h1>${slide.title}</h1>
      <p>${slide.description}</p>
    `;

    // Render media
    visualEl.innerHTML = slide.mediaHTML;

    // Force play video on mobile screens
    const video = visualEl.querySelector("video");
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.play().catch(err => {
        const playFallback = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', playFallback);
          document.removeEventListener('click', playFallback);
        };
        document.addEventListener('touchstart', playFallback, { passive: true });
        document.addEventListener('click', playFallback, { passive: true });
      });
    }

    // Toggle background video layout class
    if (banner) {
      if (slide.isVideo) {
        banner.classList.add("has-bg-video");
      } else {
        banner.classList.remove("has-bg-video");
      }
    }

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
  renderHomeDriveCategories(e.detail);
});
