/* ==========================================================================
   MILAN '26 - HARRY POTTER WIZARDING WORLD AUTHENTICATION MODULE
   ========================================================================== */

const STORAGE_KEY_USER = 'milan26_current_user';

let currentUser = null;

const HOGWARTS_HOUSES = [
  { id: 'gryffindor', name: 'Gryffindor', icon: '🦁', color: '#900c3f' },
  { id: 'slytherin', name: 'Slytherin', icon: '🐍', color: '#0f5236' },
  { id: 'ravenclaw', name: 'Ravenclaw', icon: '🦅', color: '#1a365d' },
  { id: 'hufflepuff', name: 'Hufflepuff', icon: '🦡', color: '#d4af37' }
];

function initAuth() {
  const saved = localStorage.getItem(STORAGE_KEY_USER);
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
    } catch (e) {
      currentUser = null;
    }
  } else {
    // Default Demo SRMIST Student User
    currentUser = {
      name: 'Aravind K',
      email: 'aravind_k@srmist.edu.in',
      role: 'student',
      college: 'SRM Institute of Science and Technology (KTR)',
      rollNumber: 'RA2211003010482',
      phone: '9840123456',
      house: 'gryffindor',
      isVerifiedSrmist: true
    };
    saveUserToStorage();
  }
  renderAuthUI();
}

function saveUserToStorage() {
  if (currentUser) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
}

function renderAuthUI() {
  const container = document.getElementById('auth-actions');
  if (!container) return;

  if (currentUser) {
    const houseObj = HOGWARTS_HOUSES.find(h => h.id === currentUser.house) || HOGWARTS_HOUSES[0];
    const badgeText = currentUser.isVerifiedSrmist ? `${houseObj.icon} SRMIST ${houseObj.name}` : `${houseObj.icon} Delegate`;

    container.innerHTML = `
      <div class="user-profile-widget hp-user-widget" onclick="openUserProfileModal()">
        <div class="user-avatar hp-avatar">
          <span>${houseObj.icon}</span>
        </div>
        <div class="user-details">
          <span class="user-name">${currentUser.name}</span>
          <span class="user-role-badge badge-srm">${badgeText}</span>
        </div>
        <button class="btn-logout" title="Sign Out" onclick="event.stopPropagation(); handleLogout();">
          <i data-lucide="log-out"></i>
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="btn btn-secondary btn-sm hp-btn-subtle" onclick="openAuthModal('login')">
        <i data-lucide="log-in"></i> Sign In
      </button>
      <button class="btn btn-primary btn-sm glow-btn hp-btn-primary" onclick="openAuthModal('signup')">
        <i data-lucide="sparkles"></i> SRMIST / Delegate Reg
      </button>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('hidden');
    switchAuthTab(tab);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('hidden');
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const formLogin = document.getElementById('login-form');
  const formSignup = document.getElementById('signup-form');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    formLogin.classList.remove('hidden');
    formSignup.classList.add('hidden');
  } else {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    formSignup.classList.remove('hidden');
    formLogin.classList.add('hidden');
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const identifier = document.getElementById('login-identifier').value.trim();
  const isSrm = identifier.toLowerCase().includes('srmist.edu.in') || /^ra\d+/i.test(identifier);

  currentUser = {
    name: identifier.includes('@') ? identifier.split('@')[0].replace('.', ' ') : 'SRM Wizard (' + identifier + ')',
    email: identifier.includes('@') ? identifier : identifier + '@srmist.edu.in',
    role: isSrm ? 'student' : 'guest',
    college: isSrm ? 'SRM Institute of Science and Technology (KTR)' : 'External Wizard Academy',
    rollNumber: /^ra\d+/i.test(identifier) ? identifier.toUpperCase() : 'RA2211003010482',
    house: 'gryffindor',
    isVerifiedSrmist: isSrm
  };

  saveUserToStorage();
  renderAuthUI();
  closeAuthModal();
  showToast(`⚡ Accio Pass! Welcome back, ${currentUser.name}! ${isSrm ? 'SRMIST Free Pass Unlocked.' : ''}`, 'success');
}

function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const role = document.getElementById('signup-role').value;
  const house = document.getElementById('signup-house')?.value || 'gryffindor';
  const college = document.getElementById('signup-college')?.value.trim() || 'SRMIST Kattankulathur';
  const rollNumber = document.getElementById('signup-roll')?.value.trim() || 'RA2211003010482';

  const isSrm = role === 'student' || email.toLowerCase().includes('srmist.edu.in') || /^ra\d+/i.test(rollNumber);

  currentUser = {
    name,
    email,
    phone,
    role,
    house,
    college: isSrm ? 'SRM Institute of Science and Technology (KTR)' : college,
    rollNumber: isSrm ? rollNumber : rollNumber,
    isVerifiedSrmist: isSrm
  };

  saveUserToStorage();
  renderAuthUI();
  closeAuthModal();
  showToast(`✨ Sorting Hat Ceremony Complete! Welcome ${name} of ${house.toUpperCase()}!`, 'success');
}

function fillDemoStudent() {
  document.getElementById('login-identifier').value = 'RA2211003010482';
  document.getElementById('login-password').value = 'alohomora2026';
}

function fillDemoGuest() {
  document.getElementById('login-identifier').value = 'wizard@durmstrang.edu';
  document.getElementById('login-password').value = 'milan2026';
}

function toggleCollegeRollInput(role) {
  const row = document.getElementById('college-details-row');
  if (row) {
    row.style.display = (role === 'guest') ? 'none' : 'flex';
  }
}

function handleLogout() {
  currentUser = null;
  saveUserToStorage();
  renderAuthUI();
  showToast('Mischief Managed! Signed out successfully.', 'info');
}

function openUserProfileModal() {
  if (!currentUser) return;
  alert(`MILAN '26 Wizarding Delegate Profile:\n\nName: ${currentUser.name}\nHouse: ${currentUser.house.toUpperCase()}\nInstitution: ${currentUser.college}\nReg / Student ID: ${currentUser.rollNumber}\nCategory: ${currentUser.isVerifiedSrmist ? 'SRMIST Host Student (Free Passes Eligible)' : 'External Wizard Delegate'}`);
}
