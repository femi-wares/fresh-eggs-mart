/* Fresh Eggs Mart — SPA
 * WA: 0907 257 8907 · 0806 968 2053
 */
const WA_NUMBER = "2349072578907";
const CALL_NUMBER = "09072578907";

const IMG = Object.assign({
  storefront: "https://litter.catbox.moe/ia8dv0.jpg",
  crates: "https://litter.catbox.moe/pd27qu.jpg",
  logo: "https://litter.catbox.moe/3hl03d.jpg",
}, window.FEM_IMGS || {});

const PRODUCTS = [
  { id: 1, name: "Medium Crates", desc: "Farm-fresh medium eggs. Ideal for homes and small resale.", price: 4800, category: "Eggs", unit: "crate", img: IMG.crates },
  { id: 2, name: "Large Crates", desc: "Large farm eggs. Strong shell, consistent size for retail.", price: 5200, category: "Eggs", unit: "crate", img: IMG.crates },
  { id: 3, name: "Extra Large Crates", desc: "Premium extra-large eggs for hotels, bakeries and bulk buyers.", price: 5600, category: "Eggs", unit: "crate", img: IMG.crates },
  { id: 4, name: "Pullet / Small Crates", desc: "Smaller farm eggs. Budget-friendly for daily use and starters.", price: 3800, category: "Eggs", unit: "crate", img: IMG.crates },
  { id: 5, name: "Wholesale Mix (10+)", desc: "Volume pricing from 10 crates. WhatsApp for today's farm rate.", price: 4500, category: "Eggs", unit: "crate", img: IMG.crates },
  { id: 6, name: "Frozen Chicken Parts", desc: "Frozen chicken portions. Clean pack for retail and catering.", price: 8500, category: "Frozen", unit: "pack", img: IMG.storefront },
  { id: 7, name: "Frozen Fish Pack", desc: "Quality frozen fish for homes and food businesses.", price: 7200, category: "Frozen", unit: "pack", img: IMG.storefront },
  { id: 8, name: "Frozen Turkey Parts", desc: "Frozen turkey cuts. Stock up for events and weekly sales.", price: 9800, category: "Frozen", unit: "pack", img: IMG.storefront },
  { id: 9, name: "Assorted Frozen Mix", desc: "Mixed frozen proteins. Ask for availability and current rates.", price: 9000, category: "Frozen", unit: "pack", img: IMG.storefront },
];

const PICKS = [1, 3, 6, 5, 2];
const CATEGORIES = ["All", "Eggs", "Frozen"];
const money = (n) => "₦" + Number(n).toLocaleString("en-NG");

const state = { page: "home", cart: loadCart(), cat: "All", draft: "", query: "", slide: 0, cartOpen: false };
let slideTimer = null;

function loadCart() {
  try { const raw = localStorage.getItem("fem-cart"); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function saveCart() { localStorage.setItem("fem-cart", JSON.stringify(state.cart)); }
function openWA(text) {
  const url = "https://wa.me/" + WA_NUMBER + (text ? "?text=" + encodeURIComponent(text) : "");
  window.open(url, "_blank", "noopener,noreferrer");
}
function cartCount() { return state.cart.reduce((n, i) => n + i.qty, 0); }
function cartTotal() { return state.cart.reduce((s, i) => s + i.price * i.qty, 0); }
function addToCart(product) {
  const row = state.cart.find((x) => x.id === product.id);
  if (row) row.qty += 1;
  else state.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1, category: product.category, unit: product.unit || "item", img: product.img });
  saveCart(); state.cartOpen = true; syncChrome(); renderCart();
}
function changeQty(id, delta) {
  const row = state.cart.find((x) => x.id === id);
  if (!row) return;
  row.qty += delta;
  if (row.qty <= 0) state.cart = state.cart.filter((x) => x.id !== id);
  saveCart(); syncChrome(); renderCart();
}
function clearCart() {
  if (!state.cart.length) return;
  if (!window.confirm("Clear your list?")) return;
  state.cart = []; saveCart(); state.cartOpen = false; syncChrome(); renderCart();
}
function checkoutWA() {
  if (!state.cart.length) return;
  const lines = state.cart.map((i) => "• " + i.qty + "x " + i.name + " (" + i.category + ") – " + money(i.price * i.qty));
  openWA("Hello Fresh Eggs Mart\n\nI would like to order:\n\n" + lines.join("\n") + "\n\nTotal: " + money(cartTotal()) + "\n\nPlease confirm. Thank you.");
}
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function productCard(p) {
  return '<article class="product-card"><div class="thumb"><img src="' + p.img + '" alt="' + escapeHtml(p.name) + '" loading="lazy" /></div><div class="body"><span class="cat">' + escapeHtml(p.category) + '</span><h3>' + escapeHtml(p.name) + '</h3><p class="desc">' + escapeHtml(p.desc) + '</p><div class="row"><span class="price">' + money(p.price) + '<small> / ' + escapeHtml(p.unit) + '</small></span><button type="button" class="btn btn-primary btn-sm" data-add="' + p.id + '">Add</button></div></div></article>';
}
function homePage() {
  const featured = PRODUCTS.filter((p) => [1, 3, 6, 5].includes(p.id));
  return '<section class="hero"><div class="hero-inner"><div><p class="hero-kicker">Fresh Eggs Mart · Aba</p><h1>Good Eggs. Good Life.</h1><p>Farm-fresh eggs and frozen foods — wholesale and retail at farm prices. Reliable supply for homes, resellers and kitchens.</p><div class="hero-actions"><a href="#/shop" class="btn btn-accent" data-nav="shop">Shop now</a><button type="button" class="btn btn-outline hero-wa" id="heroWa">Chat on WhatsApp</button></div><div class="pill-row"><span class="pill">Wholesale</span><span class="pill">Retail</span><span class="pill">Farm Fresh</span><span class="pill">Frozen Foods</span><span class="pill">Delivery</span></div></div><div class="hero-media"><img src="' + IMG.storefront + '" alt="Fresh Eggs Mart shop frontage, Aba" /></div></div></section><section class="section"><div class="section-head"><div><h2>Today\'s picks</h2><p class="muted">Auto-rotating highlights from the floor.</p></div></div><div class="carousel" id="carousel"></div></section><section class="section"><div class="section-head"><div><h2>Why shop with us</h2><p class="muted">Built for steady supply at scale.</p></div></div><div class="feature-grid"><div class="feature-card"><div class="feature-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg></div><h3>Farm prices</h3><p class="muted">Competitive crate rates for retail and bulk buyers.</p></div><div class="feature-card"><div class="feature-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18"/><path d="M6 7v13"/><path d="M18 7v13"/><path d="M3 20h18"/></svg></div><h3>Wholesale ready</h3><p class="muted">Volume stock for resellers, hotels and production.</p></div><div class="feature-card"><div class="feature-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg></div><h3>Frozen foods</h3><p class="muted">Chicken, fish, turkey and more — stocked for demand.</p></div><div class="feature-card"><div class="feature-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div><h3>Aba location</h3><p class="muted">No. 2 Garden Avenue, off Okigwe Road, Aba.</p></div></div></section><section class="section"><div class="section-head"><div><h2>Shop the floor</h2><p class="muted">Eggs by size and frozen packs.</p></div><a href="#/shop" class="muted" data-nav="shop">Full shop →</a></div><div class="product-grid">' + featured.map(productCard).join("") + '</div></section><section class="cta-band"><div class="cta-inner"><h2>Need crates today?</h2><p>WhatsApp your order or call the shop line. Wholesale and retail welcome.</p><div class="hero-actions"><button type="button" class="btn btn-accent" id="ctaWa">Order on WhatsApp</button><a class="btn btn-outline cta-call" href="tel:' + CALL_NUMBER + '">Call ' + CALL_NUMBER + '</a></div></div></section>';
}
function shopPage() {
  const q = state.query.toLowerCase();
  const list = PRODUCTS.filter((p) => {
    if (state.cat !== "All" && p.category !== state.cat) return false;
    if (!q) return true;
    return (p.name + " " + p.desc + " " + p.category).toLowerCase().includes(q);
  });
  return '<section class="page-banner"><p class="hero-kicker" style="opacity:.85">Shop</p><h1>Eggs &amp; frozen foods</h1><p style="opacity:.9;max-width:36ch;margin:0.5rem auto 0">Type full words, then search. Wholesale rates on request.</p></section><section class="section"><form class="search-row" id="searchForm"><input type="search" id="searchInput" placeholder="search items..." value="' + escapeHtml(state.draft) + '" autocomplete="off" enterkeyhint="search" /><button type="submit" class="btn btn-primary search-btn">Search</button></form><div class="filters">' + CATEGORIES.map((c) => '<button type="button" class="chip' + (state.cat === c ? ' active' : '') + '" data-cat="' + c + '">' + c + '</button>').join('') + '</div>' + (list.length ? '<div class="product-grid">' + list.map(productCard).join('') + '</div>' : '<p class="empty-state">No matches. Try another word or category.</p>') + '</section><section class="cta-band"><div class="cta-inner"><h2>Bulk order?</h2><p>Message us for crate rates from 10 upwards.</p><button type="button" class="btn btn-accent" id="shopCtaWa">WhatsApp wholesale</button></div></section>';
}
function aboutPage() {
  return '<section class="page-banner"><p class="hero-kicker" style="opacity:.85">About</p><h1>Fresh Eggs Mart</h1><p style="opacity:.9">Good Eggs. Good Life.</p></section><section class="section about-solo"><img class="about-logo" src="' + IMG.logo + '" alt="Fresh Eggs Mart logo" /><div><h2>Farm-fresh supply in Aba</h2><p class="muted">We supply and sell farm-fresh eggs at farm prices — wholesale and retail — with frozen foods for homes, kitchens and resellers who need steady stock.</p><p class="muted">Our floor is organised for volume: crates on hand, clear pricing by size, and delivery where arranged. Visit us at No. 2 Garden Avenue, off Okigwe Road, Aba, Abia State.</p><p class="muted">Whether you need a single crate or a van load, we are built to move product cleanly and fast.</p><a href="#/shop" class="btn btn-primary" data-nav="shop">Browse products</a></div></section>';
}
function contactPage() {
  const mapQ = encodeURIComponent('No 2 Garden Avenue off Okigwe Road, Aba, Abia State, Nigeria');
  return '<section class="page-banner"><p class="hero-kicker" style="opacity:.85">Contact</p><h1>Order or visit</h1><p style="opacity:.9">Wholesale enquiries, retail pickups and delivery</p></section><section class="section contact-grid"><div class="contact-card"><h2>Visit / call</h2><p><strong>Address</strong><br />No. 2 Garden Avenue, off Okigwe Road, Aba, Abia State</p><p class="muted">Wholesale · Retail · Farm fresh · Quality eggs · Frozen foods</p><div class="contact-actions"><a class="btn btn-primary" href="tel:' + CALL_NUMBER + '">Call ' + CALL_NUMBER + '</a><button type="button" class="btn btn-outline" id="contactWa">WhatsApp</button></div></div><form class="form-card" id="contactForm"><label>Name<input name="name" required placeholder="Your name" /></label><label>Message<textarea name="message" required placeholder="Order size, delivery area, or enquiry"></textarea></label><button type="submit" class="btn btn-primary" style="width:100%">Send on WhatsApp</button></form></section><section class="section"><h2 class="map-title">Find the shop</h2><div class="map-wrap"><iframe title="Fresh Eggs Mart map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + mapQ + '&z=16&output=embed"></iframe></div></section>';
}
function renderCarousel() {
  const el = document.getElementById('carousel');
  if (!el) return;
  const slides = PICKS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  if (!slides.length) return;
  if (state.slide >= slides.length) state.slide = 0;
  const s = slides[state.slide];
  el.innerHTML = '<div class="carousel-slide"><div class="carousel-img"><img src="' + s.img + '" alt="' + escapeHtml(s.name) + '" /></div><div class="carousel-copy"><span class="tag">Today\'s picks</span><h3>' + escapeHtml(s.name) + '</h3><p>' + escapeHtml(s.desc) + '</p><p class="carousel-price">' + money(s.price) + ' / ' + escapeHtml(s.unit) + '</p><button type="button" class="btn btn-accent carousel-add" data-add="' + s.id + '">Add to list</button></div></div><div class="carousel-controls"><button type="button" class="carousel-nav" id="slidePrev" aria-label="Previous">‹</button><div class="carousel-dots">' + slides.map((_, i) => '<button type="button" class="' + (i === state.slide ? 'active' : '') + '" data-slide="' + i + '" aria-label="Slide ' + (i + 1) + '"></button>').join('') + '</div><button type="button" class="carousel-nav" id="slideNext" aria-label="Next">›</button></div>';
}
function startCarousel() {
  stopCarousel();
  slideTimer = setInterval(function () {
    if (state.page !== 'home') return;
    state.slide = (state.slide + 1) % PICKS.length;
    renderCarousel();
  }, 4000);
}
function stopCarousel() { if (slideTimer) { clearInterval(slideTimer); slideTimer = null; } }
function renderPage() {
  const app = document.getElementById('app');
  stopCarousel();
  if (state.page === 'home') { app.innerHTML = homePage(); renderCarousel(); startCarousel(); }
  else if (state.page === 'shop') app.innerHTML = shopPage();
  else if (state.page === 'about') app.innerHTML = aboutPage();
  else app.innerHTML = contactPage();
  bindPageEvents(); syncNav(); window.scrollTo(0, 0);
}
function bindPageEvents() {
  document.querySelectorAll('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const id = Number(btn.getAttribute('data-add'));
      const p = PRODUCTS.find(function (x) { return x.id === id; });
      if (p) addToCart(p);
    });
  });
  document.querySelectorAll('[data-slide]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.slide = Number(btn.getAttribute('data-slide'));
      renderCarousel(); startCarousel();
    });
  });
  const prev = document.getElementById('slidePrev');
  const next = document.getElementById('slideNext');
  if (prev) prev.addEventListener('click', function () { state.slide = (state.slide - 1 + PICKS.length) % PICKS.length; renderCarousel(); startCarousel(); });
  if (next) next.addEventListener('click', function () { state.slide = (state.slide + 1) % PICKS.length; renderCarousel(); startCarousel(); });
  const heroWa = document.getElementById('heroWa');
  if (heroWa) heroWa.addEventListener('click', function () { openWA('Hello Fresh Eggs Mart, I would like to order.'); });
  const ctaWa = document.getElementById('ctaWa');
  if (ctaWa) ctaWa.addEventListener('click', function () { openWA('Hello Fresh Eggs Mart, I would like to order.'); });
  const shopCtaWa = document.getElementById('shopCtaWa');
  if (shopCtaWa) shopCtaWa.addEventListener('click', function () { openWA('Hello Fresh Eggs Mart, I need wholesale rates.'); });
  const contactWa = document.getElementById('contactWa');
  if (contactWa) contactWa.addEventListener('click', function () { openWA('Hello Fresh Eggs Mart, I have an enquiry.'); });
  const searchForm = document.getElementById('searchForm');
  if (searchForm) searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const input = document.getElementById('searchInput');
    state.draft = input ? input.value : '';
    state.query = state.draft.trim();
    renderPage();
  });
  document.querySelectorAll('[data-cat]').forEach(function (btn) {
    btn.addEventListener('click', function () { state.cat = btn.getAttribute('data-cat'); renderPage(); });
  });
  const contactForm = document.getElementById('contactForm');
  if (contactForm) contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const fd = new FormData(contactForm);
    openWA('Hello Fresh Eggs Mart\n\nName: ' + String(fd.get('name') || '').trim() + '\n\nMessage: ' + String(fd.get('message') || '').trim());
  });
}
function syncNav() {
  document.querySelectorAll('[data-nav]').forEach(function (el) {
    el.classList.toggle('active', el.getAttribute('data-nav') === state.page);
  });
}
function syncChrome() {
  const badge = document.getElementById('cartBadge');
  const n = cartCount();
  if (badge) { badge.hidden = n === 0; badge.textContent = String(n); }
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer) { drawer.classList.toggle('open', state.cartOpen); drawer.setAttribute('aria-hidden', state.cartOpen ? 'false' : 'true'); }
  if (overlay) overlay.hidden = !state.cartOpen;
}
function renderCart() {
  const body = document.getElementById('cartBody');
  const total = document.getElementById('cartTotal');
  if (!body) return;
  if (!state.cart.length) body.innerHTML = '<p class="cart-empty">Nothing added yet.</p>';
  else {
    body.innerHTML = state.cart.map(function (i) {
      const thumb = i.img || IMG.crates;
      return '<div class="cart-item"><img class="cart-thumb" src="' + thumb + '" alt="" /><div class="meta"><strong>' + escapeHtml(i.name) + '</strong><span class="muted">' + escapeHtml(i.category) + ' · ' + money(i.price) + '</span><div class="cart-line-total">' + money(i.price * i.qty) + '</div></div><div class="qty-row"><button type="button" data-qty="' + i.id + '" data-d="-1" aria-label="Decrease">−</button><span>' + i.qty + '</span><button type="button" data-qty="' + i.id + '" data-d="1" aria-label="Increase">+</button></div></div>';
    }).join('');
    body.querySelectorAll('[data-qty]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        changeQty(Number(btn.getAttribute('data-qty')), Number(btn.getAttribute('data-d')));
      });
    });
  }
  if (total) total.textContent = money(cartTotal());
  syncChrome();
}
function routeFromHash() {
  const hash = (location.hash || '#/').replace(/^#\/?/, '');
  const page = (hash.split('?')[0] || 'home').toLowerCase();
  state.page = ['home', 'shop', 'about', 'contact'].includes(page) ? page : 'home';
  renderPage();
}
function initNavHide() {
  let last = 0;
  const nav = document.getElementById('bottomNav');
  window.addEventListener('scroll', function () {
    if (!nav || window.innerWidth >= 768) return;
    const y = window.scrollY;
    nav.classList.toggle('hide', y > last && y > 80);
    last = y;
  }, { passive: true });
}
function init() {
  var openCart = document.getElementById('openCart');
  if (openCart) openCart.addEventListener('click', function () { state.cartOpen = true; renderCart(); });
  var closeCart = document.getElementById('closeCart');
  if (closeCart) closeCart.addEventListener('click', function () { state.cartOpen = false; syncChrome(); });
  var overlay = document.getElementById('cartOverlay');
  if (overlay) overlay.addEventListener('click', function () { state.cartOpen = false; syncChrome(); });
  var clearBtn = document.getElementById('clearCart');
  if (clearBtn) clearBtn.addEventListener('click', clearCart);
  var checkout = document.getElementById('checkoutWa');
  if (checkout) checkout.addEventListener('click', checkoutWA);
  document.body.addEventListener('click', function (e) {
    var a = e.target.closest('[data-nav]');
    if (!a) return;
    var page = a.getAttribute('data-nav');
    if (!page) return;
    if (a.tagName === 'A') e.preventDefault();
    location.hash = '#/' + (page === 'home' ? '' : page);
  });
  window.addEventListener('hashchange', routeFromHash);
  initNavHide();
  routeFromHash();
  renderCart();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(function () {});
}
document.addEventListener('DOMContentLoaded', init);
