// Admin Page Specific Logic

// 1. Authenticate and enter dashboard panel
window.enterDashboard = function() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;
  if (!email || !password) {
    alert("Please fill in both email and password fields.");
    return;
  }
  document.getElementById('loginStage').style.display = 'none';
  document.getElementById('dashStage').style.display = 'block';
  renderAdminCategoryOptions();
  renderAdminTable();
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

function renderAdminTable(page = 1) {
  const container = document.getElementById("adminTableContainer");
  const paginationContainer = document.getElementById("adminPagination");
  if (!container) return;

  const thead = `
    <div class="thead">
      <span>Article</span>
      <span>Category</span>
      <span>Status</span>
    </div>
  `;
  
  // Flatten all items on first render or when categories change
  if (allAdminItems.length === 0 && globalCategories && globalCategories.length > 0) {
    globalCategories.forEach(cat => {
      cat.items.forEach(item => {
        allAdminItems.push({ ...item, categoryName: cat.name });
      });
    });
  }

  // Use Pagination.js to get 7 items per page
  const pageData = Pagination.paginate(allAdminItems, page, 7);
  let rows = "";

  pageData.items.forEach(item => {
    rows += `
      <div class="trow">
        <div class="title-cell">
          <div style="width:36px; height:36px; border-radius:6px; overflow:hidden; margin-right:12px; flex-shrink:0;">
            ${item.type === 'video' 
              ? `<video src="${item.src}" style="width:100%; height:100%; object-fit:cover;" muted></video>`
              : `<img src="${item.src}" style="width:100%; height:100%; object-fit:cover;">`
            }
          </div>
          ${item.name}
        </div>
        <span>${item.categoryName}</span>
        <span class="status synced">Synced</span>
      </div>
    `;
  });

  container.innerHTML = thead + rows;

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
window.uploadArticle = async function() {
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
  const dashStage = document.getElementById("dashStage");
  // Only redraw dashboard panels if the user has logged in and dashboard is active
  if (dashStage && dashStage.style.display !== 'none') {
    renderAdminCategoryOptions();
    renderAdminTable();
  }
});
