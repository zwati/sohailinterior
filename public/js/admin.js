// Admin Page Specific Logic

let currentAdminTab = 'gallery'; // 'gallery' | 'portfolio' | 'controls'

// 1. Authenticate and enter dashboard panel
window.enterDashboard = function () {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;
  if (!email || !password) {
    alert("Please fill in both email and password fields.");
    return;
  }
  if (email.trim().toLowerCase() !== "sohail@sohailinteriors.com" || password !== "sohailmughal") {
    alert("Incorrect email or password.");
    return;
  }
  document.getElementById('loginStage').style.display = 'none';
  document.getElementById('dashStage').style.display = 'block';

  // Seed the lock toggle with whatever is saved in localStorage
  syncMaterialsLockUI();

  // Set default active tab
  switchAdminTab('gallery');
};

// Tab switching logic
window.switchAdminTab = function (tab) {
  currentAdminTab = tab;

  const galleryBtn   = document.getElementById('tabGalleryBtn');
  const portfolioBtn = document.getElementById('tabPortfolioBtn');
  const controlsBtn  = document.getElementById('tabControlsBtn');

  const galleryUpload  = document.getElementById('galleryUploadContainer');
  const galleryTable   = document.getElementById('galleryTableContainer');
  const portfolioEdit  = document.getElementById('portfolioEditContainer');
  const portfolioTable = document.getElementById('portfolioTableContainer');
  const siteControls   = document.getElementById('siteControlsContainer');
  const pagination     = document.getElementById('adminPagination');

  // Reset all
  [galleryBtn, portfolioBtn, controlsBtn].forEach(b => b && b.classList.remove('active'));
  [galleryUpload, galleryTable, portfolioEdit, portfolioTable, siteControls].forEach(el => el && (el.style.display = 'none'));

  if (tab === 'gallery') {
    if (galleryBtn) galleryBtn.classList.add('active');
    if (galleryUpload) galleryUpload.style.display = 'block';
    if (galleryTable) galleryTable.style.display  = 'block';
    if (pagination) pagination.style.display = '';
    renderAdminCategoryOptions();
    renderAdminTable();
  } else if (tab === 'portfolio') {
    if (portfolioBtn) portfolioBtn.classList.add('active');
    if (portfolioEdit) portfolioEdit.style.display  = 'block';
    if (portfolioTable) portfolioTable.style.display = 'block';
    if (pagination) pagination.style.display = 'none';
    loadAdminPortfolio(1);
  } else if (tab === 'controls') {
    if (controlsBtn) controlsBtn.classList.add('active');
    if (siteControls) siteControls.style.display = 'block';
    if (pagination) pagination.style.display = 'none';
    syncMaterialsLockUI();
  }
};

// ── Materials Catalog Lock Toggle ─────────────────────────────────────────────

// Sync the toggle UI to match what's in localStorage
function syncMaterialsLockUI() {
  const isLocked = localStorage.getItem('materialsLocked') !== 'false'; // default: locked
  const toggle   = document.getElementById('materialsLockToggle');
  const track    = document.getElementById('materialsLockTrack');
  const thumb    = document.getElementById('materialsLockThumb');
  const label    = document.getElementById('materialsLockStatusText');
  if (!toggle) return;

  toggle.checked = !isLocked; // checked = unlocked
  if (isLocked) {
    track.style.background = '#cbd5e1';
    thumb.style.left = '3px';
    label.textContent = 'LOCKED';
    label.style.color = '#6b7f97';
  } else {
    track.style.background = 'var(--navy, #12345c)';
    thumb.style.left = '23px';
    label.textContent = 'LIVE';
    label.style.color = 'var(--navy, #12345c)';
  }
}

// Called when the toggle is clicked
window.toggleMaterialsLock = function (checked) {
  // checked = true → user wants catalog LIVE (unlocked)
  const isLocked = !checked;
  localStorage.setItem('materialsLocked', isLocked ? 'true' : 'false');

  syncMaterialsLockUI();

  const status = document.getElementById('materialsLockSaveStatus');
  if (status) {
    status.textContent = isLocked
      ? '🔒 Materials catalog is now hidden behind the lock overlay.'
      : '✅ Materials catalog is now live and visible to visitors.';
    setTimeout(() => { status.textContent = ''; }, 4000);
  }
};


// 2. Populate admin category upload dropdown
function renderAdminCategoryOptions() {
  const select = document.getElementById("projectCategory");
  if (!select) return;

  if (!globalCategories || globalCategories.length === 0) {
    select.innerHTML = `<option value="Residential">Residential</option><option value="Commercial">Commercial</option><option value="Ceiling Work">Ceiling Work</option>`;
    return;
  }

  select.innerHTML = globalCategories.map(cat => {
    return `<option value="${cat.name}">${cat.name}</option>`;
  }).join("");
}

// 3. Render asset management tables
let allAdminItems = [];
let filteredAdminItems = null;

function renderAdminTable(page = 1) {
  const container = document.getElementById("galleryTableBody");
  const paginationContainer = document.getElementById("adminPagination");
  if (!container) return;

  // Flatten all items on first render or when categories change
  if (allAdminItems.length === 0 && globalCategories && globalCategories.length > 0) {
    allAdminItems = [];
    globalCategories.forEach(cat => {
      cat.items.forEach(item => {
        allAdminItems.push({ ...item, categoryName: cat.name });
      });
    });
  }

  const listToDisplay = filteredAdminItems !== null ? filteredAdminItems : allAdminItems;

  // Use Pagination.js to get 7 items per page
  const pageData = Pagination.paginate(listToDisplay, page, 7);
  let rows = "";

  pageData.items.forEach(item => {
    rows += `
      <div class="trow">
        <div class="title-cell">
          <div onclick="window.openLightbox(0, [{src: '${item.src}', name: '${item.name.replace(/'/g, "\\'")}', type: '${item.type}', categoryName: '${item.categoryName.replace(/'/g, "\\'")}'}])" style="width:36px; height:36px; border-radius:6px; overflow:hidden; margin-right:12px; flex-shrink:0; cursor:pointer;" title="Click to view full preview">
            ${item.type === 'video'
        ? `<video src="${item.src}" style="width:100%; height:100%; object-fit:cover;" muted></video>`
        : `<img src="${item.src}" style="width:100%; height:100%; object-fit:cover;">`
      }
          </div>
          <div>
            <div style="font-weight: 600;">${item.name}</div>
            <div style="font-size: 11px; color: var(--gray-band); font-family: monospace;">ID: ${item.id}</div>
          </div>
        </div>
        <span>${item.categoryName}</span>
        <span class="status synced">Synced</span>
      </div>
    `;
  });

  container.innerHTML = rows;

  // Render pagination controls
  if (paginationContainer) {
    paginationContainer.innerHTML = Pagination.generateHTML(
      pageData.currentPage,
      pageData.totalPages,
      'renderAdminTable'
    );
  }
}
// Expose to global scope so pagination buttons (onclick) can call it
window.renderAdminTable = renderAdminTable;

// ── Portfolio management logic ────────────────────────────────────────────────
let allPortfolioProjects = [];

async function loadAdminPortfolio(page = 1) {
  const tableBody = document.getElementById("portfolioTableBody");
  const paginationContainer = document.getElementById("adminPagination");
  if (!tableBody) return;

  tableBody.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--gray-band);">Loading projects from Drive...</div>`;
  if (paginationContainer) paginationContainer.innerHTML = "";

  try {
    const res = await fetch("/api/portfolio-projects");
    const json = await res.json();
    if (json.ok) {
      allPortfolioProjects = json.projects || [];
      renderPortfolioTable(page);
    } else {
      tableBody.innerHTML = `<div style="padding: 24px; text-align: center; color: red;">Failed to load portfolio folders: ${json.error}</div>`;
    }
  } catch (err) {
    tableBody.innerHTML = `<div style="padding: 24px; text-align: center; color: red;">Network error. Failed to connect to backend.</div>`;
  }
}

function renderPortfolioTable(page = 1) {
  const tableBody = document.getElementById("portfolioTableBody");
  const paginationContainer = document.getElementById("adminPagination");
  if (!tableBody) return;

  if (allPortfolioProjects.length === 0) {
    tableBody.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--gray-band);">No portfolio project folders found in Google Drive folder.</div>`;
    if (paginationContainer) paginationContainer.innerHTML = "";
    return;
  }

  const pageData = Pagination.paginate(allPortfolioProjects, page, 7);
  let rows = "";

  pageData.items.forEach(proj => {
    rows += `
      <div class="trow">
        <div class="title-cell">
          <div style="width:36px; height:36px; border-radius:6px; background:var(--mist); display:flex; align-items:center; justify-content:center; margin-right:12px; flex-shrink:0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <div style="font-weight: 600;">${proj.name}</div>
            <div style="font-size: 11px; color: var(--gray-band);">${proj.location}</div>
          </div>
        </div>
        <span>${proj.catLabel}</span>
        <div>
          <button class="btn btn-ghost" style="padding: 6px 12px; font-size:11px; border-color: var(--line);" onclick="editProjectDetails('${proj.id}')">Edit Details</button>
        </div>
      </div>
    `;
  });

  tableBody.innerHTML = rows;

  if (paginationContainer) {
    paginationContainer.innerHTML = Pagination.generateHTML(
      pageData.currentPage,
      pageData.totalPages,
      'renderPortfolioTable'
    );
  }
}
window.renderPortfolioTable = renderPortfolioTable;

window.editProjectDetails = function (projectId) {
  const proj = allPortfolioProjects.find(p => p.id === projectId);
  if (!proj) return;

  document.getElementById("editProjectId").value = proj.id;
  document.getElementById("editProjectName").value = proj.name;
  document.getElementById("editProjectLocation").value = proj.location || "";
  document.getElementById("editProjectCategory").value = proj.category || "residential";
  document.getElementById("editProjectTexture").value = proj.texture || "t-pop";
  document.getElementById("editProjectDesc").value = proj.desc || "";

  // Enable save button
  const saveBtn = document.getElementById("saveProjectBtn");
  saveBtn.disabled = false;

  // Clear any status message
  const statusEl = document.getElementById("saveProjectStatus");
  statusEl.textContent = "";
};

window.saveProjectMetadata = async function () {
  const folderId = document.getElementById("editProjectId").value;
  const name = document.getElementById("editProjectName").value.trim();
  const location = document.getElementById("editProjectLocation").value.trim();
  const category = document.getElementById("editProjectCategory").value;
  const texture = document.getElementById("editProjectTexture").value;
  const desc = document.getElementById("editProjectDesc").value.trim();

  const statusEl = document.getElementById("saveProjectStatus");
  const saveBtn = document.getElementById("saveProjectBtn");

  if (!folderId || !name) {
    statusEl.style.color = "red";
    statusEl.textContent = "Project Title/Name is required.";
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving to Google Drive...";
  statusEl.style.color = "inherit";
  statusEl.textContent = "Writing metadata.json to Google Drive folder...";

  try {
    const res = await fetch(`/api/portfolio-projects/${folderId}/metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, location, desc, texture })
    });
    const json = await res.json();
    if (json.ok) {
      statusEl.style.color = "green";
      statusEl.textContent = "✓ Success! Project details saved to Google Drive!";

      // Reload portfolio data
      await loadAdminPortfolio(1);
    } else {
      statusEl.style.color = "red";
      statusEl.textContent = "Error: " + (json.error || "Save failed");
    }
  } catch (err) {
    statusEl.style.color = "red";
    statusEl.textContent = "Network error. Please try again.";
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Details to Drive";
  }
};

// 4. Drag & Drop Previews Handler
let selectedFiles = [];

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");

if (dropzone && fileInput) {
  dropzone.onclick = () => fileInput.click();
  fileInput.onchange = (e) => handleFileSelect(e.target.files);

  dropzone.ondragover = (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--blue)";
    dropzone.style.background = "var(--mist)";
    dropzone.style.color = "var(--blue)";
  };

  dropzone.ondragleave = () => {
    dropzone.style.borderColor = "var(--line)";
    dropzone.style.background = "transparent";
    dropzone.style.color = "#7c92ab";
  };

  dropzone.ondrop = (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--line)";
    dropzone.style.background = "transparent";
    dropzone.style.color = "#7c92ab";
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };
}

function handleFileSelect(files) {
  selectedFiles = Array.from(files);
  const container = document.getElementById("filePreviews");
  if (!container) return;

  container.innerHTML = selectedFiles.map(f => {
    const url = URL.createObjectURL(f);
    return `<div style="position:relative; width:48px; height:48px; border-radius:6px; overflow:hidden; border:1px solid var(--line);">
      <img src="${url}" style="width:100%; height:100%; object-fit:cover;">
    </div>`;
  }).join('');
}

// 5. Submit Upload to Drive Endpoint
window.uploadArticle = async function () {
  const title = document.getElementById("projectTitle").value;
  const category = document.getElementById("projectCategory").value;
  const statusEl = document.getElementById("uploadStatus");

  if (!title || selectedFiles.length === 0) {
    statusEl.style.color = "red";
    statusEl.textContent = "Please provide a title and choose photos.";
    return;
  }

  const btn = document.getElementById("uploadBtn");
  btn.disabled = true;
  btn.textContent = "Publishing to Drive...";
  statusEl.style.color = "inherit";
  statusEl.textContent = "Connecting to Google Drive...";

  try {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("category", category);
    selectedFiles.forEach(file => fd.append("images", file));

    const res = await fetch("/api/designs", {
      method: "POST",
      body: fd
    });
    const json = await res.json();
    if (json.ok) {
      statusEl.style.color = "green";
      statusEl.textContent = "✓ Success! Article published to Google Drive!";

      // Clear forms
      document.getElementById("projectTitle").value = "";
      selectedFiles = [];
      document.getElementById("filePreviews").innerHTML = "";

      // Reload navbar categories & update UI panels
      if (window.loadGlobalNavbar) {
        await window.loadGlobalNavbar();
      }
    } else {
      statusEl.style.color = "red";
      statusEl.textContent = "Error: " + (json.error || "Upload failed");
    }
  } catch (err) {
    statusEl.style.color = "red";
    statusEl.textContent = "Network error. Please try again.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Publish to Gallery";
  }
};

// Listen to dynamic categories load updates
window.addEventListener("categoriesLoaded", () => {
  allAdminItems = []; // Clear so it re-flattens fresh categories on next render
  const dashStage = document.getElementById("dashStage");
  // Only redraw dashboard panels if the user has logged in and dashboard is active
  if (dashStage && dashStage.style.display !== 'none') {
    if (currentAdminTab === 'gallery') {
      renderAdminCategoryOptions();
      renderAdminTable();
    } else {
      loadAdminPortfolio(1);
    }
  }
});

window.searchAdminItemById = function () {
  const query = document.getElementById("adminSearchId")?.value.trim().toLowerCase();
  if (!query) {
    filteredAdminItems = null;
    renderAdminTable(1);
    return;
  }

  filteredAdminItems = allAdminItems.filter(item =>
    (item.id || '').toLowerCase().includes(query)
  );
  renderAdminTable(1);
};

window.clearAdminSearch = function () {
  const input = document.getElementById("adminSearchId");
  if (input) input.value = "";
  filteredAdminItems = null;
  renderAdminTable(1);
};

// Bind enter key
const adminSearchInput = document.getElementById("adminSearchId");
if (adminSearchInput) {
  adminSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchAdminItemById();
    }
  });
}
