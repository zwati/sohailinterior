class PageLoader extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute('glass')) {
      return;
    }
    const isGlass = this.hasAttribute('glass');
    this.innerHTML = `
      <div class="loader ${isGlass ? 'glass-loader' : ''}" id="pageLoader" role="status" aria-label="Loading Sohail Interior">
        <div class="loader-stage">
          <div class="lc-word" id="lcWord"><span>Sohail&nbsp;Interior</span></div>
          <div class="lc-rule"></div>
          <div class="lc-caption">Design &amp; Materials</div>
        </div>
      </div>
    `;
  }
}

class AnnounceBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="announce" id="announce">
        Free Site Visit &amp; Material Consultation — Sahiwal &amp; Lahore
        <button aria-label="Close Announcement" id="announceCloseBtn">&minus; close</button>
      </div>
    `;
    const btn = this.querySelector('#announceCloseBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.querySelector('.announce').classList.add('hide');
      });
    }
  }
}

function appendDrawersAndModals() {
  if (document.getElementById('wishlistDrawer')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- Wishlist Drawer -->
    <div class="drawer-overlay" id="wishlistDrawer" role="dialog" aria-modal="true" aria-label="Saved Materials">
      <div class="drawer-box">
        <div class="drawer-header">
          <h3>Saved Materials</h3>
          <button class="close-btn" id="closeWishlistBtn" aria-label="Close Saved Materials">&times;</button>
        </div>
        <div class="drawer-body" id="wishlistItemsContainer">
          <div class="drawer-empty-state">No saved materials yet.</div>
        </div>
      </div>
    </div>

    <!-- Quote Cart Drawer -->
    <div class="drawer-overlay" id="cartDrawer" role="dialog" aria-modal="true" aria-label="Quote List">
      <div class="drawer-box">
        <div class="drawer-header">
          <h3>Quote List</h3>
          <button class="close-btn" id="closeCartBtn" aria-label="Close Quote List">&times;</button>
        </div>
        <div class="drawer-body" id="cartItemsContainer">
          <div class="drawer-empty-state">No items in your quote list yet.</div>
        </div>
        <div class="drawer-footer">
          <div class="cart-total-row">
            <span>Total Items:</span>
            <strong id="cartTotalQty">0</strong>
          </div>
          <button class="btn btn-primary btn-block" id="whatsappQuoteBtn">
            💬 Send Quote Enquiry to WhatsApp
          </button>
        </div>
      </div>
    </div>
  `;

  while (wrapper.firstChild) {
    document.body.appendChild(wrapper.firstChild);
  }

  const closeWishlistBtn = document.getElementById('closeWishlistBtn');
  const wishlistDrawer = document.getElementById('wishlistDrawer');
  if (closeWishlistBtn && wishlistDrawer) {
    closeWishlistBtn.onclick = () => window.closeWishlistDrawer();
    wishlistDrawer.onclick = (e) => {
      if (e.target === wishlistDrawer) window.closeWishlistDrawer();
    };
  }

  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  if (closeCartBtn && cartDrawer) {
    closeCartBtn.onclick = () => window.closeCartDrawer();
    cartDrawer.onclick = (e) => {
      if (e.target === cartDrawer) window.closeCartDrawer();
    };
  }
}

window.openSearchModal = function () {
  const wrapper = document.getElementById('searchWrapper');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  if (!wrapper || !input) return;

  if (wrapper.style.display === 'none' || !wrapper.style.display) {
    wrapper.style.display = 'block';
    setTimeout(() => input.focus(), 100);
  } else {
    wrapper.style.display = 'none';
    if (results) results.style.display = 'none';
  }
};
window.closeSearchModal = function () {
  const wrapper = document.getElementById('searchWrapper');
  const results = document.getElementById('searchResults');
  if (wrapper) wrapper.style.display = 'none';
  if (results) results.style.display = 'none';
};

window.openWishlistDrawer = function () {
  const drawer = document.getElementById('wishlistDrawer');
  if (drawer) {
    drawer.classList.add('active');
    if (window.Wishlist && window.Wishlist.render) {
      window.Wishlist.render();
    }
  }
};
window.closeWishlistDrawer = function () {
  const drawer = document.getElementById('wishlistDrawer');
  if (drawer) drawer.classList.remove('active');
};

window.openCartDrawer = function () {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.classList.add('active');
    if (window.QuoteCart && window.QuoteCart.render) {
      window.QuoteCart.render();
    }
  }
};
window.closeCartDrawer = function () {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) drawer.classList.remove('active');
};

// Global listener for closing inline search on click outside
document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('searchWrapper');
  const searchBtn = document.getElementById('searchBtn');
  const results = document.getElementById('searchResults');
  if (wrapper && searchBtn && wrapper.style.display !== 'none') {
    if (!wrapper.contains(e.target) && !searchBtn.contains(e.target)) {
      wrapper.style.display = 'none';
      if (results) results.style.display = 'none';
    }
  }
});

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-header">
        <div class="header-inner">
          <div class="header-row" style="display: flex; justify-content: space-between; align-items: center;">
            
            <!-- Left: Mobile menu and Socials -->
            <div class="header-left" style="flex: 0 0 auto; display: flex; align-items: center; gap: 8px;">
              <button class="icon-btn hamburger-btn" id="hamburgerBtn" title="Menu" aria-label="Menu" type="button" aria-controls="mobileSidebar" aria-expanded="false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div class="social-icons" style="display: flex; gap: 8px;">
                <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
                <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
                <a href="#" aria-label="TikTok"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.46-.24-2.42.74-4.82 2.61-6.32 1.53-1.26 3.51-1.84 5.46-1.55.04 1.44.02 2.89.04 4.34-1.07-.37-2.31-.22-3.23.44-1.01.76-1.55 2.06-1.31 3.27.32 1.51 1.76 2.59 3.32 2.53 1.37-.08 2.57-.96 2.96-2.26.17-.6.2-1.24.2-1.87-.01-5.26-.01-10.51-.01-15.77h-.01Z"/></svg></a>
              </div>
            </div>

            <!-- Center: Brand (Logo + Text) -->
            <div class="header-center" style="flex: 1; display: flex; justify-content: center;">
              <div class="brand" onclick="window.location.href='/'" style="display: flex; flex-direction: row; align-items: center; gap: 10px; text-align: left;">
                <img src="/logo/SI_square.png" alt="Sohail Interior Logo" class="brand-mark" style="object-fit: contain; width: 36px; height: 36px;">
                <div>
                  <div class="brand-name" style="letter-spacing: 1px;">SOHAIL INTERIOR</div>
                  <div class="brand-sub mono" style="font-size: 10px; margin-top: 2px;">Design &amp; Materials</div>
                </div>
              </div>
            </div>
 
            <!-- Right: Actions -->
            <div class="header-right" style="flex: 0 0 auto; display: flex; justify-content: flex-end;">
              <div class="header-actions" style="position: relative; display: flex; align-items: center; gap: 8px;">
                <div class="search-wrapper" id="searchWrapper" style="display: none; position: relative;">
                  <input type="text" id="searchInput" placeholder="Search materials..." autocomplete="off" style="padding: 6px 12px; border-radius: 20px; border: 1px solid var(--line); outline: none; font-size: 13px; width: 180px; background: var(--mist);">
                  <div class="search-suggestions" id="searchResults" style="position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border: 1px solid var(--line); border-radius: 8px; box-shadow: var(--shadow); width: 280px; max-height: 250px; overflow-y: auto; z-index: 1000; display: none;"></div>
                </div>
                <button class="icon-btn" id="searchBtn" title="Search" aria-label="Search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
                <button class="icon-btn" title="Admin Dashboard" aria-label="Admin" onclick="window.location.href='/admin'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
                </button>
                <button class="icon-btn" id="wishlistBtn" title="Saved materials" aria-label="Saved materials">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
                  <span class="badge" id="wishlistBadge">0</span>
                </button>
                <button class="icon-btn" id="cartBtn" title="Quote list" aria-label="Quote list">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  <span class="badge" id="cartBadge">0</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

        <div class="nav-row" style="display: flex; justify-content: center; padding: 12px 0; border-top: 1px solid var(--line); background: #fff;">
          <nav class="main-nav" id="mainNav">
            <a href="/">Home</a>
            <a href="/materials" class="locked-nav-link" onclick="event.preventDefault(); return false;" title="Materials Catalog — Coming Soon" aria-disabled="true"><svg class="nav-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Materials Catalog</a>
            <a href="/portfolio">Portfolio</a>
            <div class="dropdown">
              <a href="/gallery" class="locked-nav-link" title="Gallery — Coming Soon" aria-disabled="true"><svg class="nav-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Gallery ▾</a>
              <div class="dropdown-content">
                <a href="/gallery" onclick="event.preventDefault(); return false;" style="cursor: not-allowed; opacity: 0.55;">All Folders</a>
              </div>
            </div>
          </nav>
        </div>
 
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
        <div class="mobile-sidebar" id="mobileSidebar">
          <div class="sidebar-header">
            <div class="brand">
              <img src="/logo/SI_square.png" alt="Sohail Interior Logo" class="brand-mark" style="object-fit: contain; width:24px; height:24px;">
              <div class="brand-name" style="font-size: 16px;">Sohail Interior</div>
            </div>
            <button class="close-sidebar" id="closeSidebar" aria-label="Close Menu">&times;</button>
          </div>
          <nav class="mobile-nav" id="mobileNav">
            <a href="/">Home</a>
            <a href="/materials" class="locked-nav-link" onclick="event.preventDefault(); return false;" title="Materials Catalog — Coming Soon" aria-disabled="true"><svg class="nav-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Materials Catalog</a>
            <a href="/portfolio">Portfolio</a>
            <div class="dropdown">
              <a href="/gallery" class="locked-nav-link" title="Gallery — Coming Soon" aria-disabled="true"><svg class="nav-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Gallery ▾</a>

              <div class="dropdown-content">
                <a href="/gallery" onclick="event.preventDefault(); return false;" style="cursor: not-allowed; opacity: 0.55;">All Folders</a>
              </div>
            </div>

          </nav>
        </div>
    `;

    // Bind Hamburger Logic
    const hamburgerBtn = this.querySelector('#hamburgerBtn');
    const closeBtn = this.querySelector('#closeSidebar');
    const overlay = this.querySelector('#sidebarOverlay');
    const sidebar = this.querySelector('#mobileSidebar');
    const mobileNav = this.querySelector('#mobileNav');

    sidebar.setAttribute('aria-hidden', 'true');
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-label', 'Mobile navigation menu');

    const openMenu = () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
      sidebar.setAttribute('aria-hidden', 'false');
    };

    const closeMenu = () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
      sidebar.setAttribute('aria-hidden', 'true');
    };

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    if (mobileNav) {
      mobileNav.addEventListener('click', (event) => {
        const anchor = event.target.closest('a');
        if (anchor) closeMenu();
      });
    }

    // Bind search/wishlist/cart handlers
    const searchBtn = this.querySelector('#searchBtn');
    const wishlistBtn = this.querySelector('#wishlistBtn');
    const cartBtn = this.querySelector('#cartBtn');

    if (searchBtn) searchBtn.addEventListener('click', () => window.openSearchModal());
    if (wishlistBtn) wishlistBtn.addEventListener('click', () => window.openWishlistDrawer());
    if (cartBtn) cartBtn.addEventListener('click', () => window.openCartDrawer());

    appendDrawersAndModals();

    // Global function so common.js can close menu after link clicks or Escape
    window.closeMobileMenu = closeMenu;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer">
        <div class="footer-grid">
          <div>
            <h5>Get in touch</h5>
            <div class="contact-line">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Farid Town, Sahiwal, Punjab, Pakistan
            </div>
            <div class="contact-line">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m4 4 8 8 8-8"/></svg>
              hello@sohailinterior.pk
            </div>
            <div class="contact-line">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c1 .3 2 .5 3 .6a2 2 0 0 1 1.7 2Z"/></svg>
              0311-581-35-05
            </div>
          </div>
          <div class="footer-links">
            <h5>Information</h5>
            <a href="/portfolio">Portfolio</a>
            <a href="/gallery">Gallery</a>
            <a href="/admin">Admin Sign In</a>
            <a href="#">About Sohail Interior</a>
            <a href="#">Contact Us</a>
          </div>
          <div>
            <h5>Newsletter Signup</h5>
            <p style="font-size:12.5px; color:#3c5470; margin:0 0 4px; line-height: 1.5;">Get new material drops and finished projects, straight to your inbox.</p>
            <form action="https://formsubmit.co/abdullahramzan8942@gmail.com" method="POST" class="newsletter-row" target="_blank">
              <input type="hidden" name="_next" value="https://sohailinterior.pk/">
              <input type="hidden" name="_captcha" value="false">
              <input name="email" type="email" placeholder="Your email address" aria-label="Email address" required>
              <button type="submit">Subscribe</button>
            </form>
          </div>
          <div class="footer-map">
            <h5>Our Location</h5>
            <a href="https://maps.app.goo.gl/uCmiaGv23uXGmtD89?g_st=awb" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; height: 160px; border-radius: 10px; overflow: hidden; position: relative;">
              <iframe
                src="https://maps.google.com/maps?q=Sohail%20Interior,%20Farid%20Town,%20Sahiwal&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style="border:0; filter: contrast(1.1) saturate(1.1); pointer-events: none;"
                allowfullscreen=""
                loading="lazy">
              </iframe>
              <div style="position: absolute; inset: 0; background: transparent; z-index: 10;"></div>
            </a>
          </div>
        </div>
        <div class="footer-bottom">&copy; 2026 Sohail Interior. All rights reserved. &mdash; Sahiwal, Pakistan</div>
      </footer>
    `;
  }
}

class WhatsAppFloat extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="wa-float">
        <div class="wa-tip">We are here!</div>
        <a href="https://wa.me/923115813505" target="_blank" rel="noopener noreferrer" class="wa-btn" title="Chat on WhatsApp" aria-label="Chat on WhatsApp">
          <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.3A10 10 0 1 0 12 2Zm5.4 14.2c-.2.6-1.3 1.2-1.9 1.3-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.6-.6-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5.2.6.8 2 .9 2.1.1.2.1.4 0 .6-.1.2-.2.3-.4.5l-.5.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.7-.1.3.1 1.9.9 2.2 1 .3.2.5.2.6.4.1.2.1.9-.1 1.5Z"/></svg>
        </a>
      </div>
    `;
  }
}

customElements.define('page-loader', PageLoader);
customElements.define('announce-bar', AnnounceBar);
customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
customElements.define('whatsapp-float', WhatsAppFloat);
