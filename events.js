/* ==========================================================================
   MILAN '26 - SRMIST 18TH NATIONAL CULTURAL FESTIVAL
   THEME: HARRY POTTER & THE WIZARDING WORLD OF MILAN
   ========================================================================== */

const FEST_CATEGORIES = [
  { id: 'all', label: '🔮 All Magical Events' },
  { id: 'proshow', label: '⚡ Triwizard Star Nights' },
  { id: 'dance', label: '💃 Wand & Choreo Duels' },
  { id: 'music', label: '🎸 Wrock (Battle of Bands)' },
  { id: 'fashion', label: '👗 Yule Ball Runway' },
  { id: 'drama', label: '🎭 Defense Against Dark Arts (Theatre)' },
  { id: 'literary', label: '📜 Ministry Debates & Spells' },
  { id: 'media', label: '📸 Marauder\'s Lens (Film)' },
  { id: 'gaming', label: '🧹 Quidditch Esports' }
];

const FEST_EVENTS = [
  {
    id: 'hp-proshow-inaugural',
    title: 'The Triwizard Yule Ball & Celeb Night',
    category: 'proshow',
    categoryLabel: 'Star Night',
    image: 'assets/yule_ball.png',
    date: 'Feb 19, 2026',
    time: '5:30 PM - 10:30 PM',
    venue: 'Great Hall (TP Ganesan Auditorium)',
    description: 'The grand inaugural Yule Ball of MILAN \'26! Inaugurated by Chief Guest Dr. Sreeleela and Founder-Chancellor Dr. T.R. Paarivendhar with an enchanted live orchestra & magical light spectacle.',
    totalSeats: 6000,
    seatsLeft: 340,
    tiers: [
      { id: 'srm_free', name: 'Hogwarts Student Pass (SRMIST NetID)', price: 0, desc: 'Free entry for valid SRMIST Registration Number holders.' },
      { id: 'triwizard_vip', name: 'Triwizard Champion VIP Front Row', price: 499, desc: 'Stage front reserved seating + Enchanted Goodie Bag & Wand.' },
      { id: 'ministry_delegate', name: 'Ministry Delegate Pass', price: 199, desc: 'Access for verified non-SRM college wizards.' }
    ]
  },
  {
    id: 'hp-proshow-dark-mark',
    title: 'The Dark Mark EDM & Wizard Rock Finale',
    category: 'proshow',
    categoryLabel: 'Star Night',
    image: 'assets/hp_banner.png',
    date: 'Feb 22, 2026',
    time: '6:30 PM - 11:30 PM',
    venue: 'Quidditch Pitch (SRMIST Main Stadium)',
    description: 'The mega finale of MILAN \'26! International EDM DJ headliner, laser dragon fire show, and heavy Wizard Rock performances for 60,000+ cheering wizards.',
    totalSeats: 25000,
    seatsLeft: 1120,
    tiers: [
      { id: 'srm_free', name: 'Hogwarts Student Arena Pass', price: 0, desc: 'Free entry for SRMIST students (NetID required).' },
      { id: 'mosh_vip', name: 'Golden Snitch VIP Pit', price: 799, desc: 'Fast-track gate entry + stage front standing pit + LED Magic Wand.' },
      { id: 'gen_lawn', name: 'General Wizard Lawn Pass', price: 299, desc: 'Standard entry pass for external delegates.' }
    ]
  },
  {
    id: 'hp-dance-choreo-duels',
    title: 'Choreo Duels: The Spellbound Dance Battle',
    category: 'dance',
    categoryLabel: 'Choreo Duels',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80',
    date: 'Feb 21, 2026',
    time: '3:00 PM - 8:30 PM',
    venue: 'Courtyard Open Air Theatre (OAT)',
    description: 'Inter-college wizarding dance duel! High-octane Hip-Hop, Fusion, and Contemporary crews casting dance spells for ₹1,50,000 in Galleons.',
    totalSeats: 3500,
    seatsLeft: 280,
    tiers: [
      { id: 'srm_free', name: 'Hogwarts Student Pass', price: 0, desc: 'Free access for SRMIST students.' },
      { id: 'team_reg', name: 'Dancer Guild Pass (10-25 Wizards)', price: 999, desc: 'Official crew entry pass + back-stage green room.' },
      { id: 'viewer', name: 'Front Row Spectator Pass', price: 149, desc: 'Prime viewing seat near the dueling stage.' }
    ]
  },
  {
    id: 'hp-fashion-yule-runway',
    title: 'Yule Ball Royale: Wizarding Couture Runway',
    category: 'fashion',
    categoryLabel: 'Yule Fashion',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    date: 'Feb 21, 2026',
    time: '6:00 PM - 9:30 PM',
    venue: 'Great Hall Stage (TP Ganesan Auditorium)',
    description: 'Glamour, enchantment, and wizarding robes! College design teams walk the runway with themes inspired by Hogwarts Houses & Dark Arts Glamour.',
    totalSeats: 2000,
    seatsLeft: 140,
    tiers: [
      { id: 'srm_free', name: 'Hogwarts Student Pass', price: 0, desc: 'Free entry for verified SRMIST students.' },
      { id: 'catwalk_vip', name: 'Catwalk VIP Front Seat', price: 399, desc: 'First row seat along the catwalk.' },
      { id: 'intercollege', name: 'External Delegate Pass', price: 199, desc: 'Reserved auditorium seating.' }
    ]
  },
  {
    id: 'hp-music-wrock-battle',
    title: 'Wrock-Fest: Battle of the Wizard Rock Bands',
    category: 'music',
    categoryLabel: 'Wrock Battle',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    date: 'Feb 20, 2026',
    time: '4:00 PM - 9:00 PM',
    venue: 'Astronomy Tower Lawns',
    description: '12 wizard rock & metal bands collide with electrifying guitar solos, drum beats, and magical vocals competing for ₹1,00,000.',
    totalSeats: 4000,
    seatsLeft: 460,
    tiers: [
      { id: 'srm_free', name: 'Hogwarts Student Pass', price: 0, desc: 'Free entry with Student NetID.' },
      { id: 'band_entry', name: 'Wrock Band Pass (Up to 8 Wizards)', price: 799, desc: 'Includes soundcheck & amplifier setup.' },
      { id: 'fan_pit', name: 'Rock Fan Pit Pass', price: 149, desc: 'Stage front standing access.' }
    ]
  },
  {
    id: 'hp-drama-dark-arts',
    title: 'Defense Against Dark Arts: Nukkad Natak',
    category: 'drama',
    categoryLabel: 'Theatre',
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80',
    date: 'Feb 20, 2026',
    time: '10:00 AM - 2:00 PM',
    venue: 'Clock Tower Plaza Circus',
    description: 'Powerful dhol rhythms and theatrical performances highlighting social change & overcoming dark forces through art.',
    totalSeats: 1500,
    seatsLeft: 210,
    tiers: [
      { id: 'srm_free', name: 'Hogwarts Free Pass', price: 0, desc: 'Free entry for SRM students.' },
      { id: 'team_entry', name: 'Troupe Registration (Up to 20 Members)', price: 499, desc: 'Official street play slot.' }
    ]
  },
  {
    id: 'hp-literary-wizengamot',
    title: 'The Wizengamot Parliamentary Debate',
    category: 'literary',
    categoryLabel: 'Debates',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
    date: 'Feb 20, 2026',
    time: '10:30 AM - 4:00 PM',
    venue: 'Ravenclaw Tower Chamber',
    description: '3-on-3 Asian Parliamentary debate addressing magical ethics, AI potion safety, and societal transformation.',
    totalSeats: 500,
    seatsLeft: 64,
    tiers: [
      { id: 'srm_free', name: 'Hogwarts Student Delegate', price: 0, desc: 'Free for SRMIST debaters.' },
      { id: 'debater', name: 'External Team Pass (3 Debaters)', price: 599, desc: 'Includes debate scroll kit & certificate.' }
    ]
  },
  {
    id: 'hp-media-marauders-lens',
    title: 'Marauder\'s Lens: 24-Hour Short Film Fest',
    category: 'media',
    categoryLabel: 'Short Film',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    date: 'Feb 20 - 21, 2026',
    time: '24 Hours Non-Stop',
    venue: 'VisCom Media Sanctum',
    description: 'Script, shoot, and edit a short film inspired by magical realism in 24 hours based on a secret prompt.',
    totalSeats: 300,
    seatsLeft: 38,
    tiers: [
      { id: 'srm_free', name: 'Hogwarts Filmmaker Pass', price: 0, desc: 'Free entry for SRMIST VisCom & Engineering wizards.' },
      { id: 'crew_pass', name: 'Film Crew Pass (Up to 5 Wizards)', price: 499, desc: 'Lab access & screening pass.' }
    ]
  },
  {
    id: 'hp-gaming-quidditch-esports',
    title: 'Quidditch Arena: BGMI & Valorant LAN Cup',
    category: 'gaming',
    categoryLabel: 'Esports',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    date: 'Feb 21, 2026',
    time: '10:00 AM - 7:00 PM',
    venue: 'Tech Park Gaming Dungeon (1200+ PCs)',
    description: 'High-speed LAN esports tournament featuring Valorant 5v5, BGMI Squads, and FIFA 26 on 240Hz Gaming Rigs.',
    totalSeats: 1000,
    seatsLeft: 110,
    tiers: [
      { id: 'srm_free', name: 'Hogwarts Gamer Pass', price: 0, desc: 'Free entry for SRMIST gamers.' },
      { id: 'squad_pass', name: 'Valorant/BGMI Squad Pass (5 Players)', price: 499, desc: 'Guaranteed tournament slot & LAN rig.' }
    ]
  },
  {
    id: 'hp-carnival-diagon-alley',
    title: 'Diagon Alley: Food, Potions & Street Carnival',
    category: 'all',
    categoryLabel: 'Carnival',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    date: 'Feb 19 - 22, 2026',
    time: '10:00 AM - 10:00 PM',
    venue: 'Main Avenue & Food Court Street',
    description: '50+ gourmet food stalls, potion bars, flea markets, escape rooms, and flash mobs running all 4 days.',
    totalSeats: 50000,
    seatsLeft: 12400,
    tiers: [
      { id: 'srm_free', name: 'Open Wizard Pass', price: 0, desc: 'Free entry for all valid ticket holders.' }
    ]
  }
];

// Controller logic
let currentSelectedCategory = 'all';
let currentSearchQuery = '';
let currentHouseFilter = 'all';

function renderCategories() {
  const container = document.getElementById('category-filters');
  if (!container) return;

  container.innerHTML = FEST_CATEGORIES.map(cat => `
    <button class="pill-btn ${cat.id === currentSelectedCategory ? 'active' : ''}" onclick="filterByCategory('${cat.id}')">
      ${cat.label}
    </button>
  `).join('');
}

function filterByCategory(categoryId) {
  currentSelectedCategory = categoryId;
  renderCategories();
  renderEvents();
}

function handleSearch(query) {
  currentSearchQuery = query.toLowerCase().trim();
  renderEvents();
}

function renderEvents() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  let filtered = FEST_EVENTS.filter(ev => {
    const matchesCategory = currentSelectedCategory === 'all' || ev.category === currentSelectedCategory;
    const matchesSearch = !currentSearchQuery || 
      ev.title.toLowerCase().includes(currentSearchQuery) ||
      ev.description.toLowerCase().includes(currentSearchQuery) ||
      ev.venue.toLowerCase().includes(currentSearchQuery) ||
      ev.categoryLabel.toLowerCase().includes(currentSearchQuery);

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i data-lucide="wand-2" class="empty-icon"></i>
        <h3>No wizarding events found matching your spell search</h3>
        <p>Try searching for "Yule Ball", "Choreo", "Wrock", or "Quidditch".</p>
        <button class="btn btn-secondary btn-sm" onclick="filterByCategory('all')">Reset Spell Filters</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(ev => `
    <div class="event-card glass-panel hp-card">
      <div class="card-image-wrapper">
        <img src="${ev.image}" alt="${ev.title}" loading="lazy" class="card-img" onerror="this.src='assets/hp_banner.png'">
        <span class="category-badge hp-badge"><i data-lucide="sparkles"></i> ${ev.categoryLabel}</span>
        <div class="seats-left-pill ${ev.seatsLeft < 150 ? 'seats-urgent' : ''}">
          <i data-lucide="flame"></i> ${ev.seatsLeft} Passes Left
        </div>
      </div>

      <div class="card-body">
        <div class="card-meta">
          <span><i data-lucide="calendar"></i> ${ev.date}</span>
          <span><i data-lucide="clock"></i> ${ev.time}</span>
        </div>
        <h3 class="card-title hp-title">${ev.title}</h3>
        <p class="card-venue"><i data-lucide="map-pin"></i> ${ev.venue}</p>
        <p class="card-desc">${ev.description}</p>
        
        <div class="srmist-free-tag hp-free-tag">
          <i data-lucide="shield-check"></i> FREE for SRMIST Students (Hogwarts NetID)
        </div>

        <div class="card-footer">
          <div class="price-range">
            <small>Entry Pass</small>
            <strong>${ev.tiers[0].price === 0 ? 'FREE (Accio!)' : '₹' + ev.tiers[0].price}</strong>
          </div>
          <button class="btn btn-primary btn-sm hp-btn" onclick="openBookingModal('${ev.id}')">
            <i data-lucide="wand-2"></i> Claim Pass
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}
