/* =========================================
   CAFE COZY — script.js (v2)
   ========================================= */

/* ---- Navbar scroll ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---- Mobile hamburger ---- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    closeAllModals();
  }
});

/* ---- Active nav highlight ---- */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  sections.forEach(section => {
    const top    = section.offsetTop - 100;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) link.style.color = (scrollY >= top && scrollY < bottom) ? 'var(--caramel)' : '';
  });
});

/* ---- Parallax blobs ---- */
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  const b1 = document.querySelector('.blob1');
  const b2 = document.querySelector('.blob2');
  if (b1) b1.style.transform = `translateY(${sy * 0.12}px)`;
  if (b2) b2.style.transform = `translateY(${sy * -0.08}px)`;
});

/* ---- Toast ---- */
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* =============================================
   ORDER SYSTEM
   ============================================= */
let order     = {};
let tableName = '';
let tableSet  = false;

const tableModal     = document.getElementById('tableModal');
const billModal      = document.getElementById('billModal');
const tableNameInput = document.getElementById('tableNameInput');
const confirmTableBtn = document.getElementById('confirmTableBtn');

function openModal(el)  { el.classList.add('open');    document.body.style.overflow = 'hidden'; }
function closeModal(el) { el.classList.remove('open'); document.body.style.overflow = ''; }
function closeAllModals() {
  closeModal(tableModal);
  closeModal(billModal);
}

[tableModal, billModal].forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m); });
});
document.getElementById('tableModalClose').addEventListener('click', () => closeModal(tableModal));
document.getElementById('billModalClose').addEventListener('click',  () => closeModal(billModal));

confirmTableBtn.addEventListener('click', () => {
  const val = tableNameInput.value.trim();
  if (!val) { tableNameInput.focus(); return; }
  tableName = val;
  tableSet  = true;
  closeModal(tableModal);
  showToast(`Welcome, ${tableName}! 🎉 Now add your order.`);
});

/* ---- Qty controls ---- */
document.querySelectorAll('.menu-card').forEach(card => {
  const minusBtn = card.querySelector('.qty-minus');
  const plusBtn  = card.querySelector('.qty-plus');
  const qtyVal   = card.querySelector('.qty-val');

  minusBtn.addEventListener('click', () => {
    let v = parseInt(qtyVal.textContent);
    if (v > 0) { v--; qtyVal.textContent = v; }
  });
  plusBtn.addEventListener('click', () => {
    let v = parseInt(qtyVal.textContent);
    qtyVal.textContent = v + 1;
  });
});

/* ---- Add to Order ---- */
document.querySelectorAll('.btn-order').forEach(btn => {
  btn.addEventListener('click', () => {
    const card  = btn.closest('.menu-card');
    const name  = card.dataset.name;
    const price = parseInt(card.dataset.price);
    const qtyEl = card.querySelector('.qty-val');
    const qty   = parseInt(qtyEl.textContent);

    if (!tableSet) { openModal(tableModal); return; }
    if (qty === 0) { showToast('Choose quantity first! Use + to add.'); return; }

    if (order[name]) { order[name].qty += qty; }
    else             { order[name] = { qty, price }; }

    qtyEl.textContent = 0;
    btn.textContent   = 'Added ✓';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = 'Add to Order'; btn.classList.remove('added'); }, 2000);

    showToast(`${qty}× ${name} added! ☕`);
    updateOrderBar();
  });
});

/* ---- Order bar ---- */
const orderBar     = document.getElementById('orderBar');
const orderBarText = document.getElementById('orderBarText');
const viewBillBtn  = document.getElementById('viewBillBtn');
const navBillBtn   = document.getElementById('navBillBtn');

function getOrderTotals() {
  let items = 0, subtotal = 0;
  Object.values(order).forEach(({ qty, price }) => { items += qty; subtotal += qty * price; });
  return { items, subtotal };
}

function updateOrderBar() {
  const { items, subtotal } = getOrderTotals();
  if (items === 0) {
    orderBar.classList.remove('visible');
  } else {
    orderBar.classList.add('visible');
    orderBarText.textContent = `${items} item${items > 1 ? 's' : ''} · ₹${subtotal}`;
  }
}

viewBillBtn.addEventListener('click', openBillModal);
navBillBtn.addEventListener('click', e => { e.preventDefault(); openBillModal(); });

/* ---- Bill modal ---- */
function openBillModal() {
  const { items, subtotal } = getOrderTotals();
  if (items === 0) { showToast('Your order is empty! Add items first. ☕'); return; }

  const gst   = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  document.getElementById('billTableName').textContent =
    tableName ? `Table: ${tableName}` : '';

  const billItems = document.getElementById('billItems');
  billItems.innerHTML = '';
  Object.entries(order).forEach(([name, { qty, price }]) => {
    const row = document.createElement('div');
    row.className = 'bill-item-row';
    row.innerHTML = `
      <span>
        <span class="bill-item-name">${name}</span>
        <span class="bill-item-qty">×${qty}</span>
      </span>
      <span class="bill-item-price">₹${qty * price}</span>
    `;
    billItems.appendChild(row);
  });

  const now     = new Date();
  const timeStr = now.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  document.querySelector('.bill-sub').textContent =
    `Srikakulam, Andhra Pradesh · ${timeStr}`;
  document.getElementById('billSubtotal').textContent = `₹${subtotal}`;
  document.getElementById('billGst').textContent      = `₹${gst}`;
  document.getElementById('billTotal').textContent    = `₹${total}`;

  openModal(billModal);
}

document.getElementById('printBillBtn').addEventListener('click', () => window.print());

document.getElementById('clearBillBtn').addEventListener('click', () => {
  order = {};
  updateOrderBar();
  closeModal(billModal);
  showToast('Order cleared. Start fresh! ☕');
});

/* =============================================
   RESERVATION CALENDAR
   ============================================= */
const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
let calYear, calMonth, selectedDate = null;

function initCalendar() {
  const now = new Date();
  calYear   = now.getFullYear();
  calMonth  = now.getMonth();
  renderCalendar();
}

function renderCalendar() {
  document.getElementById('calMonthLabel').textContent =
    `${monthNames[calMonth]} ${calYear}`;

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today       = new Date();
  today.setHours(0, 0, 0, 0);

  const container = document.getElementById('calDays');
  container.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day cal-day-empty';
    container.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell     = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = d;

    const cellDate = new Date(calYear, calMonth, d);
    cellDate.setHours(0, 0, 0, 0);

    if (cellDate < today) {
      cell.classList.add('cal-day-past');
    } else {
      if (cellDate.getTime() === today.getTime()) cell.classList.add('cal-day-today');
      if (
        selectedDate &&
        selectedDate.getDate()     === d &&
        selectedDate.getMonth()    === calMonth &&
        selectedDate.getFullYear() === calYear
      ) {
        cell.classList.add('cal-day-selected');
      }
      cell.addEventListener('click', () => selectDate(cellDate, d));
    }
    container.appendChild(cell);
  }
}

function selectDate(dateObj, d) {
  selectedDate = dateObj;
  renderCalendar();
  const label = `${d} ${monthNames[calMonth]} ${calYear}`;
  document.getElementById('resDateDisplay').textContent = label;
  document.getElementById('reservationForm').style.display = 'block';
  document.getElementById('reservationForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.getElementById('calPrev').addEventListener('click', () => {
  const now = new Date();
  if (calMonth === 0) { calMonth = 11; calYear--; }
  else calMonth--;
  if (calYear < now.getFullYear() ||
     (calYear === now.getFullYear() && calMonth < now.getMonth())) {
    calMonth = now.getMonth();
    calYear  = now.getFullYear();
  }
  renderCalendar();
});

document.getElementById('calNext').addEventListener('click', () => {
  if (calMonth === 11) { calMonth = 0; calYear++; }
  else calMonth++;
  renderCalendar();
});

document.getElementById('confirmResBtn').addEventListener('click', () => {
  const name   = document.getElementById('resName').value.trim();
  const time   = document.getElementById('resTime').value;
  const guests = document.getElementById('resGuests').value;

  if (!name) { document.getElementById('resName').focus(); showToast('Please enter your name!'); return; }

  const resSuccess = document.getElementById('resSuccess');
  resSuccess.textContent =
    `Confirmed! ${name} · ${guests} guest${guests !== '1' ? 's' : ''} · ${time} on ${document.getElementById('resDateDisplay').textContent} ☕`;
  resSuccess.classList.add('visible');
  document.getElementById('resName').value = '';

  setTimeout(() => {
    resSuccess.classList.remove('visible');
    document.getElementById('reservationForm').style.display = 'none';
    selectedDate = null;
    renderCalendar();
  }, 5000);
});

/* =============================================
   CONTACT FORM
   ============================================= */
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) { showToast('Please fill in all fields!'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Enter a valid email.'); return; }

  const btn    = contactForm.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled    = true;

  setTimeout(() => {
    document.getElementById('formSuccess').classList.add('visible');
    contactForm.reset();
    btn.textContent = 'Send Message ☕';
    btn.disabled    = false;
    setTimeout(() => document.getElementById('formSuccess').classList.remove('visible'), 5000);
  }, 1200);
});

/* =============================================
   SCROLL REVEAL
   ============================================= */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay) || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.menu-card').forEach(card => cardObserver.observe(card));

['.section-header', '.about-visual', '.about-text',
 '.contact-info', '.contact-form', '.gallery-item',
 '.contact-card', '.reservation-section'].forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.06}s`;
    revealObserver.observe(el);
  });
});

/* ---- Init ---- */
initCalendar();
console.log('%cCafe Cozy ☕', 'color:#A0522D;font-family:serif;font-size:1.4rem;font-weight:bold;');