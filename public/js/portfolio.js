// Portfolio Page Specific Logic

const projectsData = [
  {
    id: 'proj-01',
    name: 'Stepped PVC Updown Ceiling',
    category: 'ceiling',
    catLabel: 'Ceiling Work',
    location: 'Farid Town, Sahiwal',
    desc: 'Installed a layered double PVC updown false ceiling with integrated profile warm cove lighting channels.',
    previewUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop',
    texture: 't-pop',
    src: '/videos/1.mp4',
    type: 'video'
  },
  {
    id: 'proj-02',
    name: 'Premium Window Roller Blinds',
    category: 'residential',
    catLabel: 'Residential',
    location: 'Farid Town, Sahiwal',
    desc: 'Semi-opaque grey fabric roller blinds installed in bedroom windows to control light and glare.',
    previewUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop',
    texture: 't-blinds',
    src: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'proj-03',
    name: 'Woven Fabric Wallpaper Accent Wall',
    category: 'residential',
    catLabel: 'Residential',
    location: 'Farid Town, Sahiwal',
    desc: 'Woven textured premium wallpaper finish on bed accent wall with gold profile trims.',
    previewUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop',
    texture: 't-fabric',
    src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'proj-04',
    name: 'Premium Commercial Fiber Doors',
    category: 'commercial',
    catLabel: 'Commercial',
    location: 'Farid Town, Sahiwal',
    desc: 'A+ heavy duty water-proof wood textured fiber doors installed in boardroom and office cabins.',
    previewUrl: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop',
    texture: 't-fiberdoor',
    src: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=1600&auto=format&fit=crop',
    type: 'image'
  },
  {
    id: 'proj-05',
    name: '8 Inch Matte PVC Paneling',
    category: 'commercial',
    catLabel: 'Commercial',
    location: 'Farid Town, Sahiwal',
    desc: 'Moisture protection and wall decor using 8-inch wide matte grey PVC cladding in passage areas.',
    previewUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop',
    texture: 't-panel8',
    src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop',
    type: 'image'
  }
];

let activeFilter = 'all';

function renderFilters() {
  const container = document.getElementById('portfolioFilters');
  if (!container) return;

  const categories = [
    { key: 'all', label: 'All Projects' },
    { key: 'residential', label: 'Residential' },
    { key: 'commercial', label: 'Commercial' },
    { key: 'ceiling', label: 'Ceiling Work' }
  ];

  container.innerHTML = categories.map(cat => {
    const isActive = cat.key === activeFilter;
    return `
      <button class="chip ${isActive ? 'active' : ''}" onclick="filterPortfolio('${cat.key}', this)">
        ${cat.label}
      </button>
    `;
  }).join('');
}

window.filterPortfolio = function(cat, btn) {
  activeFilter = cat;
  
  // Toggle chips styling
  document.querySelectorAll('#portfolioFilters .chip').forEach(c => c.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  }

  renderPortfolioGrid();
};

function renderPortfolioGrid() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  const filtered = activeFilter === 'all'
    ? projectsData
    : projectsData.filter(p => p.category === activeFilter);

  grid.innerHTML = filtered.map((p, idx) => {
    return `
      <div class="project-card reveal" onclick="openProjectLightbox(${idx})">
        <div class="project-visual">
          <img src="${p.previewUrl}" alt="${p.name}" loading="lazy">
          <div class="project-category-badge">${p.catLabel}</div>
        </div>
        <div class="project-info">
          <div class="project-location">${p.location}</div>
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="project-footer-tag">
            <span>Completed Installation</span>
            <span style="color: var(--blue);">View Gallery &rarr;</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.revealCheck) {
    window.revealCheck();
  }
}

window.openProjectLightbox = function(idx) {
  const filtered = activeFilter === 'all'
    ? projectsData
    : projectsData.filter(p => p.category === activeFilter);

  const formattedItems = filtered.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    src: p.src,
    categoryName: p.catLabel
  }));

  if (window.openLightbox) {
    window.openLightbox(idx, formattedItems);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderFilters();
  renderPortfolioGrid();
});
