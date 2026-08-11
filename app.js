/* ==========================================================================
   MILAN '26 - HARRY POTTER WIZARDING WORLD APP ENGINE & RESPONSIVE NAV
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  if (typeof initAuth === 'function') initAuth();
  if (typeof renderCategories === 'function') renderCategories();
  if (typeof renderEvents === 'function') renderEvents();
  if (typeof initBooking === 'function') initBooking();

  startMilanCountdown();
});

// Countdown Timer to MILAN '26 Opening (Feb 19, 2026 09:00:00)
function startMilanCountdown() {
  const festStartDate = new Date('2026-02-19T09:00:00+05:30').getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = festStartDate - now;

    if (distance < 0) {
      const ids = ['timer-days', 'timer-hours', 'timer-mins', 'timer-secs'];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = '00';
      });
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dEl = document.getElementById('timer-days');
    const hEl = document.getElementById('timer-hours');
    const mEl = document.getElementById('timer-mins');
    const sEl = document.getElementById('timer-secs');

    if (dEl) dEl.innerText = String(days).padStart(2, '0');
    if (hEl) hEl.innerText = String(hours).padStart(2, '0');
    if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
    if (sEl) sEl.innerText = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Navigation & Mobile Responsiveness Controls
function toggleMobileNav() {
  const nav = document.getElementById('mobile-nav-menu');
  if (nav) {
    nav.classList.toggle('active');
  }
}

function closeMobileNav() {
  const nav = document.getElementById('mobile-nav-menu');
  if (nav) {
    nav.classList.remove('active');
  }
}

function switchTab(tabName) {
  closeMobileNav();
  if (tabName === 'home') {
    closeMyTicketsPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function scrollToSection(sectionId) {
  closeMobileNav();
  closeMyTicketsPage();
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function openPassInfoModal() {
  const modal = document.getElementById('pass-info-modal');
  if (modal) modal.classList.remove('hidden');
}

function closePassInfoModal() {
  const modal = document.getElementById('pass-info-modal');
  if (modal) modal.classList.add('hidden');
}

// Toast Notifications System
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} glass-panel hp-toast`;

  let iconName = 'wand-2';
  if (type === 'success') iconName = 'sparkles';
  if (type === 'warning') iconName = 'flame';
  if (type === 'error') iconName = 'zap-off';

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="toast-icon"></i>
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 4200);
}
