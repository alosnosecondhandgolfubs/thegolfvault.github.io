// ── MOBILE NAV ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ── ACTIVE NAV LINK ──
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── LOAD LISTINGS FROM JSON ──
async function loadListings(containerId, limit = null, filterCategory = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<div class="loading">Loading listings...</div>';

  try {
    const res = await fetch('./listings.json');
    if (!res.ok) throw new Error('Failed to load listings');
    let data = await res.json();

    if (filterCategory && filterCategory !== 'All') {
      data = data.filter(item => item.category === filterCategory);
    }

    if (limit) data = data.slice(0, limit);

    if (data.length === 0) {
      container.innerHTML = '<p class="no-results">No listings found in this category.</p>';
      return;
    }

    container.innerHTML = data.map(item => createCard(item)).join('');

  } catch (err) {
    container.innerHTML = '<p class="no-results">Could not load listings. Please try again later.</p>';
    console.error(err);
  }
}

// ── BUILD A LISTING CARD ──
function createCard(item) {
  const conditionClass = {
    'Excellent': 'condition-excellent',
    'Very Good': 'condition-very-good',
    'Good': 'condition-good'
  }[item.condition] || 'condition-good';

  return `
    <div class="listing-card">
      <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://placehold.co/400x280/1B3A2D/C9A84C?text=Golf+Equipment'">
      <div class="card-body">
        <span class="card-category">${item.category}</span>
        <h3 class="card-title">${item.title}</h3>
        <span class="card-condition ${conditionClass}">${item.condition}</span>
        <p class="card-description">${item.description}</p>
        <div class="card-footer">
          <div class="card-price">$${item.price}<span> aud</span></div>
          <a href="contact.html?item=${encodeURIComponent(item.title)}" class="card-enquire">Enquire →</a>
        </div>
      </div>
    </div>
  `;
}

// ── CATEGORY FILTERS ──
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const container = document.getElementById('listings-container');
  if (!filterBtns.length || !container) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      loadListings('listings-container', null, cat === 'All' ? null : cat);
    });
  });
}

// ── PRE-FILL CONTACT FORM FROM URL PARAM ──
function prefillContact() {
  const params = new URLSearchParams(location.search);
  const item = params.get('item');
  const msgField = document.getElementById('message');
  if (item && msgField) {
    msgField.value = `Hi, I'm interested in the ${decodeURIComponent(item)}. Please let me know if it's still available.`;
  }
}

// ── HANDLE CONTACT FORM ──
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  prefillContact();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const successMsg = document.getElementById('success-msg');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.reset();
        successMsg.style.display = 'block';
        btn.textContent = 'Message Sent!';
      } else {
        throw new Error('Form failed');
      }
    } catch {
      btn.textContent = 'Error — please try again';
      btn.disabled = false;
    }
  });
}

// ── HANDLE TRADE-IN FORM ──
function initTradeInForm() {
  const form = document.getElementById('tradein-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const successMsg = document.getElementById('tradein-success');
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        form.reset();
        successMsg.style.display = 'block';
        btn.textContent = 'Submitted!';
      } else {
        throw new Error();
      }
    } catch {
      btn.textContent = 'Error — please try again';
      btn.disabled = false;
    }
  });
}

// ── INIT ON PAGE LOAD ──
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  initContactForm();
  initTradeInForm();
});
