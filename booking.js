/* ==========================================================================
   MILAN '26 - HARRY POTTER WIZARDING TICKET & PASS ENGINE
   ========================================================================== */

const STORAGE_KEY_TICKETS = 'milan26_issued_tickets';

let activeBookingEvent = null;
let selectedTier = null;
let currentBookingQty = 1;
let selectedAddons = [];
let selectedPayMode = 'upi';
let issuedTickets = [];

function initBooking() {
  const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
  if (saved) {
    try {
      issuedTickets = JSON.parse(saved);
    } catch (e) {
      issuedTickets = [];
    }
  }
  updateTicketBadge();
}

function saveTicketsToStorage() {
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(issuedTickets));
  updateTicketBadge();
}

function updateTicketBadge() {
  const badge = document.getElementById('ticket-badge-count');
  if (badge) {
    badge.innerText = issuedTickets.length;
    badge.style.display = issuedTickets.length > 0 ? 'inline-flex' : 'none';
  }
}

function quickBookEvent(eventId) {
  openBookingModal(eventId);
}

function openBookingModal(eventId) {
  const ev = FEST_EVENTS.find(e => e.id === eventId);
  if (!ev) return;

  activeBookingEvent = ev;
  selectedTier = ev.tiers[0];
  currentBookingQty = 1;
  selectedAddons = [];

  document.getElementById('bm-category').innerText = ev.categoryLabel;
  document.getElementById('bm-event-title').innerText = ev.title;
  document.getElementById('bm-date').innerText = ev.date;
  document.getElementById('bm-time').innerText = ev.time;
  document.getElementById('bm-venue').innerText = ev.venue;

  renderTierOptions();
  goToBookingStep(1);

  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.add('hidden');
}

function renderTierOptions() {
  const container = document.getElementById('tier-options-container');
  if (!container || !activeBookingEvent) return;

  const isSrmStudent = currentUser && currentUser.isVerifiedSrmist;

  container.innerHTML = activeBookingEvent.tiers.map(tier => {
    let effectivePrice = tier.price;
    if (isSrmStudent && tier.id === 'srm_free') {
      effectivePrice = 0;
    }

    const isSelected = selectedTier && selectedTier.id === tier.id;

    return `
      <div class="tier-card glass-panel hp-tier-card ${isSelected ? 'active' : ''}" onclick="selectTier('${tier.id}')">
        <div class="tier-header">
          <h4>⚡ ${tier.name}</h4>
          <span class="tier-price">${effectivePrice === 0 ? 'FREE (Accio!)' : '₹' + effectivePrice}</span>
        </div>
        <p class="tier-desc">${tier.desc}</p>
        ${tier.id === 'srm_free' ? '<div class="srm-tag-chip"><i data-lucide="shield-check"></i> SRMIST Hogwarts NetID Unlocked</div>' : ''}
      </div>
    `;
  }).join('');

  document.getElementById('booking-qty-display').innerText = currentBookingQty;
  updateTotalPrice();
  if (window.lucide) lucide.createIcons();
}

function selectTier(tierId) {
  if (!activeBookingEvent) return;
  const found = activeBookingEvent.tiers.find(t => t.id === tierId);
  if (found) {
    selectedTier = found;
    renderTierOptions();
  }
}

function adjustQty(delta) {
  currentBookingQty = Math.max(1, Math.min(10, currentBookingQty + delta));
  document.getElementById('booking-qty-display').innerText = currentBookingQty;
  updateTotalPrice();
}

function updateTotalPrice() {
  if (!selectedTier) return;

  let basePrice = selectedTier.price * currentBookingQty;

  let addonTotal = 0;
  selectedAddons = [];

  const tshirt = document.getElementById('addon-tshirt');
  if (tshirt && tshirt.checked) {
    addonTotal += parseInt(tshirt.value) * currentBookingQty;
    selectedAddons.push('Hogwarts House Robe Hoodie (₹399)');
  }

  const food = document.getElementById('addon-food');
  if (food && food.checked) {
    addonTotal += parseInt(food.value) * currentBookingQty;
    selectedAddons.push('Three Broomsticks Butterbeer Combo (₹199)');
  }

  const afterparty = document.getElementById('addon-afterparty');
  if (afterparty && afterparty.checked) {
    addonTotal += parseInt(afterparty.value) * currentBookingQty;
    selectedAddons.push('VIP Great Hall Lounge Pass (₹499)');
  }

  let finalPrice = basePrice + addonTotal;

  if (currentUser && currentUser.isVerifiedSrmist && selectedTier.id === 'srm_free') {
    finalPrice = addonTotal;
  }

  const p1 = document.getElementById('step1-total-price');
  const p2 = document.getElementById('step2-total-price');
  if (p1) p1.innerText = '₹' + finalPrice;
  if (p2) p2.innerText = '₹' + finalPrice;

  document.getElementById('summary-event-name').innerText = activeBookingEvent ? activeBookingEvent.title : '';
  document.getElementById('summary-tier').innerText = selectedTier ? selectedTier.name : '';
  document.getElementById('summary-qty').innerText = currentBookingQty + ' Wizard Pass(es)';
  document.getElementById('summary-addons').innerText = selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None';
  document.getElementById('summary-final-price').innerText = '₹' + finalPrice;
}

function goToBookingStep(stepNum) {
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`booking-step-${i}`);
    const ind = document.getElementById(`step-indicator-${i}`);
    if (el) {
      if (i === stepNum) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
    if (ind) {
      if (i <= stepNum) ind.classList.add('active');
      else ind.classList.remove('active');
    }
  }

  if (stepNum === 2 || stepNum === 3) {
    updateTotalPrice();
  }
}

function selectPayMode(mode) {
  selectedPayMode = mode;
  document.querySelectorAll('.pay-option').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

function confirmPaymentAndIssueTicket() {
  if (!activeBookingEvent || !selectedTier) return;

  const ticketId = 'HP-MILAN-' + Math.floor(100000 + Math.random() * 900000);
  const userName = currentUser ? currentUser.name : 'SRM Wizard';
  const userCollege = currentUser ? currentUser.college : 'SRMIST Kattankulathur';
  const userRoll = currentUser ? currentUser.rollNumber : 'RA2211003010482';
  const userHouse = currentUser ? (currentUser.house || 'gryffindor').toUpperCase() : 'GRYFFINDOR';

  let addonTotal = 0;
  if (document.getElementById('addon-tshirt')?.checked) addonTotal += 399 * currentBookingQty;
  if (document.getElementById('addon-food')?.checked) addonTotal += 199 * currentBookingQty;
  if (document.getElementById('addon-afterparty')?.checked) addonTotal += 499 * currentBookingQty;

  const basePrice = (currentUser && currentUser.isVerifiedSrmist && selectedTier.id === 'srm_free') ? 0 : selectedTier.price;
  const totalPrice = (basePrice * currentBookingQty) + addonTotal;

  const newTicket = {
    id: ticketId,
    eventId: activeBookingEvent.id,
    eventTitle: activeBookingEvent.title,
    categoryLabel: activeBookingEvent.categoryLabel,
    venue: activeBookingEvent.venue,
    date: activeBookingEvent.date,
    time: activeBookingEvent.time,
    tierName: selectedTier.name,
    quantity: currentBookingQty,
    addons: selectedAddons,
    totalPaid: totalPrice,
    holderName: userName,
    holderCollege: userCollege,
    holderRoll: userRoll,
    house: userHouse,
    issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    qrData: `https://srmist.edu.in/milan26/pass/${ticketId}`
  };

  issuedTickets.unshift(newTicket);
  saveTicketsToStorage();

  if (window.confetti) {
    confetti({
      particleCount: 150,
      spread: 90,
      colors: ['#d4af37', '#900c3f', '#0f5236', '#1a365d'],
      origin: { y: 0.6 }
    });
  }

  closeBookingModal();
  openDigitalTicketModal(newTicket);
  showToast(`⚡ Accio Gate Pass! Reference: ${ticketId}`, 'success');
}

function openDigitalTicketModal(ticket) {
  const wrapper = document.getElementById('printable-ticket-wrapper');
  if (!wrapper) return;

  wrapper.innerHTML = `
    <div class="milan-eticket glass-panel hp-eticket">
      <div class="eticket-header">
        <div class="et-brand">
          <span class="et-fest-name">MILAN <span>'26</span> 🔮</span>
          <small>Hogwarts & SRMIST 18th Wizarding Cultural Fest</small>
        </div>
        <div class="et-badge hp-wax-seal">
          <span>OFFICIAL GATE PASS</span>
          <strong>${ticket.tierName}</strong>
        </div>
      </div>

      <div class="eticket-body">
        <div class="et-event-details">
          <h2 class="hp-title">${ticket.eventTitle}</h2>
          <div class="et-meta-grid">
            <div><i data-lucide="calendar"></i> <strong>Date:</strong> ${ticket.date}</div>
            <div><i data-lucide="clock"></i> <strong>Time:</strong> ${ticket.time}</div>
            <div><i data-lucide="map-pin"></i> <strong>Venue:</strong> ${ticket.venue}</div>
            <div><i data-lucide="ticket"></i> <strong>Quantity:</strong> ${ticket.quantity} Pass(es)</div>
          </div>

          <div class="et-holder-info hp-holder-info">
            <div class="holder-box">
              <span class="info-label">Wizard Name</span>
              <strong>${ticket.holderName}</strong>
            </div>
            <div class="holder-box">
              <span class="info-label">House</span>
              <strong style="color: var(--accent-gold);">${ticket.house}</strong>
            </div>
            <div class="holder-box">
              <span class="info-label">Reg / Student ID</span>
              <span class="code-text">${ticket.holderRoll}</span>
            </div>
          </div>
        </div>

        <div class="et-qr-section">
          <div id="qrcode-container" class="qr-canvas"></div>
          <span class="ticket-id-display">${ticket.id}</span>
          <small class="scan-instructions">Scan at Hogwarts Gate 1 & Venue</small>
        </div>
      </div>

      <div class="eticket-footer">
        <span>"I Solemnly Swear That I Am Up To Good" • SRMIST Kattankulathur</span>
      </div>
    </div>
  `;

  const modal = document.getElementById('ticket-modal');
  if (modal) modal.classList.remove('hidden');

  setTimeout(() => {
    const qrDiv = document.getElementById('qrcode-container');
    if (qrDiv && window.QRCode) {
      qrDiv.innerHTML = '';
      new QRCode(qrDiv, {
        text: ticket.qrData,
        width: 140,
        height: 140,
        colorDark: "#110626",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  }, 100);

  if (window.lucide) lucide.createIcons();
}

function closeTicketModal() {
  const modal = document.getElementById('ticket-modal');
  if (modal) modal.classList.add('hidden');
}

function printTicketPass() {
  window.print();
}

function openMyTicketsPage() {
  const page = document.getElementById('my-tickets-page');
  const main = document.getElementById('app-content');
  if (page && main) {
    main.classList.add('hidden');
    page.classList.remove('hidden');
    renderMyTicketsGrid();
  }
}

function closeMyTicketsPage() {
  const page = document.getElementById('my-tickets-page');
  const main = document.getElementById('app-content');
  if (page && main) {
    page.classList.add('hidden');
    main.classList.remove('hidden');
  }
}

function renderMyTicketsGrid() {
  const container = document.getElementById('my-tickets-container');
  if (!container) return;

  if (issuedTickets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="wand-2" class="empty-icon"></i>
        <h3>No Wizard Passes Issued Yet</h3>
        <p>Use "Accio Pass" on your favorite MILAN '26 events.</p>
        <button class="btn btn-primary btn-md hp-btn-primary" onclick="closeMyTicketsPage(); scrollToSection('events-section');">
          Explore MILAN '26 Wizard Lineup
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = issuedTickets.map(t => `
    <div class="ticket-card glass-panel hp-card">
      <div class="tc-header">
        <div>
          <span class="tag-badge hp-badge">${t.categoryLabel}</span>
          <h3 class="tc-title hp-title">${t.eventTitle}</h3>
        </div>
        <span class="tc-id">${t.id}</span>
      </div>
      <div class="tc-body">
        <p><i data-lucide="calendar"></i> ${t.date} • ${t.time}</p>
        <p><i data-lucide="map-pin"></i> ${t.venue}</p>
        <p><i data-lucide="user"></i> ${t.holderName} (${t.house || 'GRYFFINDOR'})</p>
        <div class="tc-tier-row">
          <span><strong>Pass:</strong> ${t.tierName} (${t.quantity} Qty)</span>
          <span class="tc-price">${t.totalPaid === 0 ? 'FREE (SRMIST)' : 'Paid: ₹' + t.totalPaid}</span>
        </div>
      </div>
      <div class="tc-actions">
        <button class="btn btn-secondary btn-sm hp-btn-subtle" onclick='openDigitalTicketModal(${JSON.stringify(t)})'>
          <i data-lucide="qr-code"></i> View Gate Pass QR
        </button>
        <button class="btn btn-outline-danger btn-sm" onclick="cancelTicketPass('${t.id}')">
          <i data-lucide="trash-2"></i> Cancel
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function cancelTicketPass(ticketId) {
  if (confirm('Cancel this Harry Potter MILAN \'26 Gate Pass?')) {
    issuedTickets = issuedTickets.filter(t => t.id !== ticketId);
    saveTicketsToStorage();
    renderMyTicketsGrid();
    showToast('Wizard pass cancelled.', 'info');
  }
}
