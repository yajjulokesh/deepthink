/* ==========================================================================
   STUDENT PORTAL — INTERACTIVE APPLICATION LOGIC
   Dual-Engine: Fully responsive client-side state engine with real-time simulations
   ========================================================================== */

(function () {
  // --------------------------------------------------------------------------
  // INITIAL STATE & DEMO DATA
  // --------------------------------------------------------------------------
  const ROLES = {
    STUDENT: { id: 'STUDENT', name: 'Regular Student', color: 'student', desc: 'Discover, Participate, Upvote Issues' },
    REPRESENTATIVE: { id: 'REPRESENTATIVE', name: 'Student Representative', color: 'representative', desc: 'Listen, Raise Issues, Represent Students' },
    MANAGEMENT: { id: 'MANAGEMENT', name: 'College Management', color: 'management', desc: 'Inform, Review, Respond, Resolve Issues' },
    ADMIN: { id: 'ADMIN', name: 'System Administrator', color: 'admin', desc: 'Manage Thresholds, Moderate, View Analytics' },
  };

  const USERS = {
    STUDENT: { id: 'u1', name: 'Alex Johnson', role: 'STUDENT', email: 'alex.j@college.edu' },
    REPRESENTATIVE: { id: 'u2', name: 'Priya Sharma (Student Rep)', role: 'REPRESENTATIVE', email: 'priya.rep@college.edu' },
    MANAGEMENT: { id: 'u3', name: 'Dr. Robert Vance (Dean)', role: 'MANAGEMENT', email: 'management@college.edu' },
    ADMIN: { id: 'u4', name: 'Campus Admin', role: 'ADMIN', email: 'admin@college.edu' },
  };

  let state = {
    currentRole: 'STUDENT',
    currentTab: 'dashboard',
    searchQuery: '',
    upvoteThreshold: 100,
    userVotes: new Set(['issue-1']), // issues voted by current user
    
    // Pillar 1: Lost & Found
    lostFoundPosts: [
      {
        id: 'lf-1',
        title: 'Lost: Black Leather Wristwatch (Fossil)',
        description: 'Lost my black Fossil leather watch near the central library reading room around 2 PM today. Has sentimental value!',
        type: 'LOST',
        category: 'Electronics / Accessories',
        location: 'Central Library, 2nd Floor',
        date: '2026-08-13 14:00',
        status: 'OPEN',
        authorName: 'Alex Johnson',
        authorRole: 'STUDENT',
        comments: [
          { id: 'c1', author: 'Priya Sharma (Student Rep)', content: 'I saw a watch at the main library reception desk around 3:30 PM! Check with Mr. Thomas.', time: '10 mins ago' }
        ]
      },
      {
        id: 'lf-2',
        title: 'Found: Blue Scientific Calculator (FX-991EX)',
        description: 'Found a blue Casio scientific calculator on bench #4 near the Block B Canteen.',
        type: 'FOUND',
        category: 'Stationery',
        location: 'Block B Canteen Benches',
        date: '2026-08-13 12:30',
        status: 'OPEN',
        authorName: 'Samir Patel',
        authorRole: 'STUDENT',
        comments: []
      },
      {
        id: 'lf-3',
        title: 'Lost: Red Water Flask (Hydro Flask)',
        description: 'Left a red insulated water bottle in Auditorium Room 102 during the morning lecture.',
        type: 'LOST',
        category: 'Personal Belongings',
        location: 'Auditorium Room 102',
        date: '2026-08-12 11:15',
        status: 'RESOLVED',
        authorName: 'Emily Chen',
        authorRole: 'STUDENT',
        comments: [
          { id: 'c2', author: 'Auditorium Security', content: 'Returned to owner at campus security desk.', time: '1 day ago' }
        ]
      }
    ],

    // Pillar 2: Official Announcements & Misinformation Clarifications
    announcements: [
      {
        id: 'ann-1',
        title: 'OFFICIAL CLARIFICATION: Tomorrow\'s Examination Schedule',
        content: 'The information circulating on social media regarding the cancellation of tomorrow\'s mid-semester examination is INCORRECT. All examinations will proceed strictly according to the published timetable.',
        priority: 'URGENT',
        isOfficial: true,
        isClarification: true,
        rumorText: '«"Tomorrow\'s examination has been cancelled due to weather."»',
        factText: 'VERIFIED: All examinations proceed according to schedule. Do not rely on unverified WhatsApp circulars.',
        date: '2026-08-13 09:00',
        author: 'College Management Office'
      },
      {
        id: 'ann-2',
        title: 'Campus Annual Innovation & Hackathon Fest 2026',
        content: 'Registrations are now open for the Annual Campus Tech Fest! Project proposals can be submitted through the portal until Friday. Cash prizes and industry mentorship await top teams.',
        priority: 'NORMAL',
        isOfficial: true,
        isClarification: false,
        date: '2026-08-12 16:30',
        author: 'Dean of Student Affairs'
      },
      {
        id: 'ann-3',
        title: 'Library Extended Hours During Examination Week',
        content: 'Central Library reading rooms will remain open until 2:00 AM daily during the mid-semester examination period. Security personnel will be on duty.',
        priority: 'NORMAL',
        isOfficial: true,
        isClarification: false,
        date: '2026-08-10 10:00',
        author: 'Chief Librarian'
      }
    ],

    // Pillar 3: Student Issues & Suggestions
    issues: [
      {
        id: 'issue-1',
        title: 'Unreliable Water Supply & Hot Water Outage in Hostel Block A',
        description: 'Hostel Block A residents have experienced frequent hot water outages during morning hours (6 AM - 9 AM) for the past week. Affects over 400 resident students.',
        category: 'Hostel Facilities',
        status: 'ACTION_PLANNED', // SUBMITTED, UNDER_REVIEW, ACKNOWLEDGED, ACTION_PLANNED, IN_PROGRESS, RESOLVED, REJECTED, DUPLICATE
        currentVotes: 350,
        thresholdReached: true,
        author: 'Priya Sharma (Student Rep)',
        date: '2026-08-11',
        managementResponse: 'Our maintenance engineering team inspected the boiler pressure valve today. Replacement components have been dispatched and repairs will conclude by Friday afternoon.',
        history: [
          { status: 'SUBMITTED', date: '2026-08-11 10:00', note: 'Issue raised by Student Representative' },
          { status: 'UNDER_REVIEW', date: '2026-08-11 14:20', note: 'Support threshold crossed (350 upvotes). Auto-notified Management.' },
          { status: 'ACTION_PLANNED', date: '2026-08-12 11:00', note: 'Boiler parts ordered by campus engineering.' }
        ]
      },
      {
        id: 'issue-2',
        title: 'Block B Classroom Ceiling Fans Faulty & Noisy',
        description: 'Ceiling fans in rooms B-201, B-202, and B-204 are malfunctioning, creating loud noise and poor ventilation during afternoon lectures.',
        category: 'Infrastructure',
        status: 'UNDER_REVIEW',
        currentVotes: 98,
        thresholdReached: false,
        author: 'Priya Sharma (Student Rep)',
        date: '2026-08-12',
        managementResponse: null,
        history: [
          { status: 'SUBMITTED', date: '2026-08-12 09:30', note: 'Issue raised by Student Representative' },
          { status: 'UNDER_REVIEW', date: '2026-08-13 08:00', note: 'Under preliminary review by facility management' }
        ]
      },
      {
        id: 'issue-3',
        title: 'Request for Additional Evening Shuttle Bus at 5:00 PM',
        description: 'The 5:00 PM shuttle bus to the metro station is overcrowded, forcing many commuter students to wait 45 minutes for the next transport.',
        category: 'Transportation',
        status: 'SUBMITTED',
        currentVotes: 64,
        thresholdReached: false,
        author: 'Priya Sharma (Student Rep)',
        date: '2026-08-13',
        managementResponse: null,
        history: [
          { status: 'SUBMITTED', date: '2026-08-13 11:00', note: 'Issue submitted' }
        ]
      },
      {
        id: 'issue-4',
        title: 'Additional Vegetarian & Healthy Options in Canteen',
        description: 'Students are requesting additional fresh salad bars and vegetarian protein meals in the main campus dining hall.',
        category: 'Canteen',
        status: 'RESOLVED',
        currentVotes: 142,
        thresholdReached: true,
        author: 'Priya Sharma (Student Rep)',
        date: '2026-08-05',
        managementResponse: 'Canteen management has updated the daily menu to include two new vegetarian protein options and a fresh salad counter effective Monday.',
        history: [
          { status: 'SUBMITTED', date: '2026-08-05 10:00', note: 'Issue raised' },
          { status: 'IN_PROGRESS', date: '2026-08-07 14:00', note: 'Vendor contract revised' },
          { status: 'RESOLVED', date: '2026-08-10 09:00', note: 'Salad counter operational' }
        ]
      }
    ],

    // Centralized Notifications
    notifications: [
      { id: 'n1', text: 'Threshold Reached: "Hostel Block A Water Supply" has reached 350 upvotes!', time: '2 hours ago', read: false, type: 'threshold' },
      { id: 'n2', text: 'Management Response added to issue "Hostel Block A Water Supply"', time: '1 day ago', read: false, type: 'response' },
      { id: 'n3', text: 'Someone responded to your Lost & Found watch post', time: '10 mins ago', read: true, type: 'comment' }
    ]
  };

  // --------------------------------------------------------------------------
  // RENDER ENGINE
  // --------------------------------------------------------------------------
  const BACKEND_API = 'https://deepthink-lsj5.onrender.com/api/v1';

  async function syncBackendData() {
    try {
      const [issuesRes, ancRes, lfRes] = await Promise.allSettled([
        fetch(`${BACKEND_API}/issues`),
        fetch(`${BACKEND_API}/announcements`),
        fetch(`${BACKEND_API}/lost-found`)
      ]);

      if (issuesRes.status === 'fulfilled' && issuesRes.value.ok) {
        const json = await issuesRes.value.json();
        if (json.data && json.data.issues && json.data.issues.length > 0) {
          state.issues = json.data.issues.map(i => ({
            id: i.id,
            title: i.title,
            description: i.description,
            category: i.category,
            status: i.status || 'SUBMITTED',
            upvotes: i.current_votes || i.upvoteCount || 0,
            createdBy: i.author_id || i.createdBy || 'Student Rep',
            createdAt: new Date(i.created_at || i.createdAt).toLocaleDateString(),
            threshold: 100,
            history: [{ status: i.status || 'SUBMITTED', time: 'Recently', note: 'Logged in system' }]
          }));
        }
      }
      if (typeof renderApp === 'function') renderApp();
    } catch (e) {
      console.log('Backend sync offline, running interactive demo mode');
    }
  }

  function init() {
    bindEvents();
    renderApp();
    syncBackendData();
  }

  function bindEvents() {
    // Role switcher dropdown toggle
    const rolePill = document.getElementById('rolePill');
    const roleDropdown = document.getElementById('roleDropdown');
    
    if (rolePill) {
      rolePill.addEventListener('click', (e) => {
        e.stopPropagation();
        roleDropdown.classList.toggle('show');
      });
    }

    document.addEventListener('click', () => {
      if (roleDropdown) roleDropdown.classList.remove('show');
      const notifPopover = document.getElementById('notifPopover');
      if (notifPopover) notifPopover.classList.remove('show');
    });

    // Role options click
    document.querySelectorAll('.role-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        const role = opt.dataset.role;
        switchRole(role);
      });
    });

    // Notification bell toggle
    const notifBell = document.getElementById('notifBell');
    const notifPopover = document.getElementById('notifPopover');
    if (notifBell) {
      notifBell.addEventListener('click', (e) => {
        e.stopPropagation();
        notifPopover.classList.toggle('show');
      });
    }

    // Navigation links
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        switchTab(tab);
      });
    });

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderCurrentTab();
      });
    }
  }

  function switchRole(roleKey) {
    if (!ROLES[roleKey]) return;
    state.currentRole = roleKey;
    showToast(`Switched view to role: ${ROLES[roleKey].name}`);
    renderApp();
  }

  function switchTab(tabKey) {
    state.currentTab = tabKey;
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.dataset.tab === tabKey) item.classList.add('active');
      else item.classList.remove('active');
    });
    renderCurrentTab();
  }

  function renderApp() {
    renderRolePill();
    renderNotificationBadge();
    renderCurrentTab();
  }

  function renderRolePill() {
    const roleInfo = ROLES[state.currentRole];
    const rolePill = document.getElementById('rolePill');
    if (rolePill) {
      rolePill.innerHTML = `
        <span class="role-dot ${roleInfo.color}"></span>
        <span>${roleInfo.name}</span>
        <i class="fas fa-chevron-down" style="font-size:0.7rem; margin-left:0.25rem;"></i>
      `;
    }

    document.querySelectorAll('.role-option').forEach(opt => {
      if (opt.dataset.role === state.currentRole) opt.classList.add('selected');
      else opt.classList.remove('selected');
    });
  }

  function renderNotificationBadge() {
    const unreadCount = state.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }

    const popoverBody = document.getElementById('popoverBody');
    if (popoverBody) {
      if (state.notifications.length === 0) {
        popoverBody.innerHTML = `<div style="padding:1.5rem; text-align:center; color:var(--text-muted); font-size:0.85rem;">No notifications yet.</div>`;
      } else {
        popoverBody.innerHTML = state.notifications.map(n => `
          <div class="notification-item ${!n.read ? 'unread' : ''}" onclick="window.markNotifRead('${n.id}')">
            <div>${n.text}</div>
            <div class="notification-time">${n.time}</div>
          </div>
        `).join('');
      }
    }
  }

  window.markNotifRead = function(id) {
    const n = state.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      renderNotificationBadge();
    }
  };

  // --------------------------------------------------------------------------
  // TAB ROUTING & PAGES
  // --------------------------------------------------------------------------
  function renderCurrentTab() {
    const container = document.getElementById('tabContainer');
    if (!container) return;

    switch (state.currentTab) {
      case 'dashboard':
        container.innerHTML = renderDashboard();
        break;
      case 'lost-found':
        container.innerHTML = renderLostFoundTab();
        break;
      case 'announcements':
        container.innerHTML = renderAnnouncementsTab();
        break;
      case 'issues':
        container.innerHTML = renderIssuesTab();
        break;
      case 'management':
        container.innerHTML = renderManagementTab();
        break;
      case 'admin':
        container.innerHTML = renderAdminTab();
        break;
      default:
        container.innerHTML = renderDashboard();
    }
  }

  // --------------------------------------------------------------------------
  // 1. DASHBOARD VIEW
  // --------------------------------------------------------------------------
  function renderDashboard() {
    const role = ROLES[state.currentRole];
    const openLostFound = state.lostFoundPosts.filter(p => p.status === 'OPEN').length;
    const activeIssues = state.issues.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED').length;
    const thresholdCount = state.issues.filter(i => i.currentVotes >= state.upvoteThreshold).length;

    return `
      <div class="hero-banner">
        <div class="hero-title">Welcome to the Student Portal 👋</div>
        <div class="hero-subtitle">
          Centralized, trustworthy campus communication platform connecting <strong>Students</strong>, 
          <strong>Student Representatives</strong>, and <strong>College Management</strong>.
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
          <span class="role-pill" style="pointer-events:none;">
            <span class="role-dot ${role.color}"></span>
            <span>Active View: ${role.name} (${role.desc})</span>
          </span>
        </div>
      </div>

      <div class="pillars-grid">
        <!-- Pillar 1 -->
        <div class="pillar-card" onclick="window.navigateToTab('lost-found')">
          <div>
            <div class="pillar-badge lost-found">
              <i class="fas fa-hand-holding-heart"></i> Pillar 1: Student ↔ Student
            </div>
            <div class="pillar-title">Lost & Found</div>
            <div class="pillar-desc">
              Direct peer-to-peer lost belongings reporting and recovery system. Help fellow students find missing items around campus.
            </div>
          </div>
          <div class="pillar-footer">
            <span>${openLostFound} Active Items Reported</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <!-- Pillar 2 -->
        <div class="pillar-card" onclick="window.navigateToTab('announcements')">
          <div>
            <div class="pillar-badge announcements">
              <i class="fas fa-bullhorn"></i> Pillar 2: Management → Students
            </div>
            <div class="pillar-title">Official Announcements</div>
            <div class="pillar-desc">
              Verified management announcements, circulars, and the <strong>Official Misinformation Clarification</strong> system for rumor debunking.
            </div>
          </div>
          <div class="pillar-footer">
            <span>${state.announcements.length} Verified Notices</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>

        <!-- Pillar 3 -->
        <div class="pillar-card" onclick="window.navigateToTab('issues')">
          <div>
            <div class="pillar-badge issues">
              <i class="fas fa-users"></i> Pillar 3: Students → Reps → Management
            </div>
            <div class="pillar-title">Student Issues & Upvotes</div>
            <div class="pillar-desc">
              Representative-submitted issues supported collectively by student upvotes. Automatically escalates to management upon reaching <strong>${state.upvoteThreshold} upvotes</strong>.
            </div>
          </div>
          <div class="pillar-footer">
            <span>${activeIssues} Active (${thresholdCount} Reached Threshold)</span>
            <i class="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>

      <!-- Quick Recent Overview -->
      <div class="section-header">
        <div class="section-title-group">
          <h2>High-Priority Campus Activity</h2>
          <div class="section-subtitle">Real-time updates across official announcements and threshold-exceeded issues</div>
        </div>
      </div>

      <div class="cards-grid">
        ${state.announcements.slice(0, 1).map(renderAnnouncementCard).join('')}
        ${state.issues.filter(i => i.thresholdReached).slice(0, 1).map(renderIssueCard).join('')}
      </div>
    `;
  }

  window.navigateToTab = function(tabKey) {
    switchTab(tabKey);
  };

  // --------------------------------------------------------------------------
  // 2. LOST & FOUND PILLAR (Student ↔ Student)
  // --------------------------------------------------------------------------
  function renderLostFoundTab() {
    let posts = state.lostFoundPosts;

    if (state.searchQuery) {
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(state.searchQuery) ||
        p.description.toLowerCase().includes(state.searchQuery) ||
        p.location.toLowerCase().includes(state.searchQuery)
      );
    }

    return `
      <div class="section-header">
        <div class="section-title-group">
          <h2>Lost & Found Portal</h2>
          <div class="section-subtitle">Students helping students recover lost belongings across campus</div>
        </div>
        <div class="toolbar">
          <button class="btn btn-primary" onclick="window.openCreateLostFoundModal()">
            <i class="fas fa-plus"></i> Report Lost or Found Item
          </button>
        </div>
      </div>

      <div class="cards-grid">
        ${posts.length === 0 ? `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No Lost & Found posts match your search query.</div>` : ''}
        ${posts.map(post => `
          <div class="card">
            <div>
              <div class="card-header">
                <span class="badge ${post.type === 'LOST' ? 'badge-lost' : 'badge-found'}">
                  <i class="fas ${post.type === 'LOST' ? 'fa-search' : 'fa-check-circle'}"></i> ${post.type}
                </span>
                <span class="badge ${post.status === 'RESOLVED' ? 'badge-resolved' : 'badge-open'}">
                  ${post.status}
                </span>
              </div>
              <div class="card-title">${escapeHtml(post.title)}</div>
              <div class="card-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(post.location)}</span> • 
                <span><i class="far fa-clock"></i> ${post.date}</span>
              </div>
              <div class="card-body">${escapeHtml(post.description)}</div>
            </div>

            <div>
              <div class="comments-section">
                <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); margin-bottom:0.5rem;">
                  <i class="far fa-comments"></i> Responses (${post.comments.length})
                </div>
                ${post.comments.map(c => `
                  <div class="comment-item">
                    <div class="comment-author">${escapeHtml(c.author)} • <span style="font-weight:normal; color:var(--text-muted);">${c.time}</span></div>
                    <div>${escapeHtml(c.content)}</div>
                  </div>
                `).join('')}
              </div>

              <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                <input type="text" id="commentInput-${post.id}" class="form-control" style="font-size:0.8rem; padding:0.4rem 0.6rem;" placeholder="Write a response..." />
                <button class="btn btn-secondary btn-sm" onclick="window.addLostFoundComment('${post.id}')">Reply</button>
                ${post.status === 'OPEN' ? `
                  <button class="btn btn-success btn-sm" onclick="window.resolveLostFoundPost('${post.id}')">
                    <i class="fas fa-check"></i> Resolve
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  window.openCreateLostFoundModal = function() {
    const html = `
      <div class="form-group">
        <label class="form-label">Post Type</label>
        <select id="lfType" class="form-control">
          <option value="LOST">I Lost an Item (LOST)</option>
          <option value="FOUND">I Found an Item (FOUND)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Item Title</label>
        <input type="text" id="lfTitle" class="form-control" placeholder="e.g. Lost: Black Leather Wristwatch" />
      </div>
      <div class="form-group">
        <label class="form-label">Campus Location</label>
        <input type="text" id="lfLocation" class="form-control" placeholder="e.g. Central Library, 2nd Floor" />
      </div>
      <div class="form-group">
        <label class="form-label">Detailed Description</label>
        <textarea id="lfDesc" class="form-control" placeholder="Describe the item, color, unique marks, and approximate time..."></textarea>
      </div>
    `;
    showModal('Report Lost / Found Belonging', html, () => {
      const type = document.getElementById('lfType').value;
      const title = document.getElementById('lfTitle').value.trim();
      const location = document.getElementById('lfLocation').value.trim();
      const desc = document.getElementById('lfDesc').value.trim();

      if (!title || !location || !desc) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      state.lostFoundPosts.unshift({
        id: 'lf-' + Date.now(),
        title,
        description: desc,
        type,
        category: 'General',
        location,
        date: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        status: 'OPEN',
        authorName: USERS[state.currentRole].name,
        authorRole: state.currentRole,
        comments: []
      });

      closeModal();
      showToast('Lost & Found item posted successfully!');
      renderCurrentTab();
    });
  };

  window.addLostFoundComment = function(postId) {
    const input = document.getElementById(`commentInput-${postId}`);
    if (!input || !input.value.trim()) return;

    const post = state.lostFoundPosts.find(p => p.id === postId);
    if (post) {
      post.comments.push({
        id: 'c-' + Date.now(),
        author: USERS[state.currentRole].name,
        content: input.value.trim(),
        time: 'Just now'
      });
      showToast('Response added to Lost & Found post');
      renderCurrentTab();
    }
  };

  window.resolveLostFoundPost = function(postId) {
    const post = state.lostFoundPosts.find(p => p.id === postId);
    if (post) {
      post.status = 'RESOLVED';
      showToast('Post marked as RESOLVED!');
      renderCurrentTab();
    }
  };

  // --------------------------------------------------------------------------
  // 3. ANNOUNCEMENTS & MISINFORMATION CLARIFICATION (Management → Students)
  // --------------------------------------------------------------------------
  function renderAnnouncementsTab() {
    let announcements = state.announcements;

    if (state.searchQuery) {
      announcements = announcements.filter(a =>
        a.title.toLowerCase().includes(state.searchQuery) ||
        a.content.toLowerCase().includes(state.searchQuery)
      );
    }

    const isMgmtOrAdmin = state.currentRole === 'MANAGEMENT' || state.currentRole === 'ADMIN';

    return `
      <div class="section-header">
        <div class="section-title-group">
          <h2>Official Announcements & Misinformation Clarifications</h2>
          <div class="section-subtitle">Verified information published directly by College Management</div>
        </div>
        ${isMgmtOrAdmin ? `
          <div class="toolbar">
            <button class="btn btn-primary" onclick="window.openCreateAnnouncementModal()">
              <i class="fas fa-bullhorn"></i> Publish Announcement
            </button>
            <button class="btn btn-danger" onclick="window.openClarificationModal()">
              <i class="fas fa-shield-alt"></i> Publish Misinformation Clarification
            </button>
          </div>
        ` : ''}
      </div>

      <div class="cards-grid">
        ${announcements.map(renderAnnouncementCard).join('')}
      </div>
    `;
  }

  function renderAnnouncementCard(ann) {
    return `
      <div class="card ${ann.isClarification ? 'clarification-card' : ''}">
        <div>
          <div class="card-header">
            <span class="badge badge-verified">
              <i class="fas fa-check-circle"></i> VERIFIED OFFICIAL
            </span>
            ${ann.priority === 'URGENT' ? `<span class="badge badge-clarification"><i class="fas fa-exclamation-triangle"></i> URGENT</span>` : ''}
          </div>

          <div class="card-title">${escapeHtml(ann.title)}</div>
          <div class="card-meta">
            <span><i class="fas fa-user-shield"></i> ${escapeHtml(ann.author)}</span> • 
            <span><i class="far fa-clock"></i> ${ann.date}</span>
          </div>

          ${ann.isClarification ? `
            <div style="margin: 0.75rem 0;">
              <div style="font-size:0.75rem; font-weight:700; color:var(--accent-rose); text-transform:uppercase; margin-bottom:0.25rem;">
                <i class="fas fa-times-circle"></i> False Rumor Circulating:
              </div>
              <div class="rumor-text">${escapeHtml(ann.rumorText)}</div>
              
              <div style="font-size:0.75rem; font-weight:700; color:var(--accent-emerald); text-transform:uppercase; margin-bottom:0.25rem;">
                <i class="fas fa-check-circle"></i> Official Management Fact:
              </div>
              <div class="fact-text">${escapeHtml(ann.factText)}</div>
            </div>
          ` : `
            <div class="card-body">${escapeHtml(ann.content)}</div>
          `}
        </div>
      </div>
    `;
  }

  window.openCreateAnnouncementModal = function() {
    const html = `
      <div class="form-group">
        <label class="form-label">Announcement Title</label>
        <input type="text" id="annTitle" class="form-control" placeholder="e.g. Examination Schedule Announcement" />
      </div>
      <div class="form-group">
        <label class="form-label">Priority Level</label>
        <select id="annPriority" class="form-control">
          <option value="NORMAL">Normal</option>
          <option value="URGENT">Urgent / Emergency Notice</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Announcement Content</label>
        <textarea id="annContent" class="form-control" placeholder="Write full official details for students..."></textarea>
      </div>
    `;
    showModal('Publish Official Management Announcement', html, () => {
      const title = document.getElementById('annTitle').value.trim();
      const priority = document.getElementById('annPriority').value;
      const content = document.getElementById('annContent').value.trim();

      if (!title || !content) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      state.announcements.unshift({
        id: 'ann-' + Date.now(),
        title,
        content,
        priority,
        isOfficial: true,
        isClarification: false,
        date: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        author: USERS[state.currentRole].name
      });

      closeModal();
      showToast('Official announcement published!');
      renderCurrentTab();
    });
  };

  window.openClarificationModal = function() {
    const html = `
      <div class="form-group">
        <label class="form-label">Clarification Header Title</label>
        <input type="text" id="clarTitle" class="form-control" value="OFFICIAL CLARIFICATION: Campus Rumor Debunked" />
      </div>
      <div class="form-group">
        <label class="form-label">Un-verified Rumor Being Circulated</label>
        <input type="text" id="clarRumor" class="form-control" placeholder='e.g. "Tomorrow exams are cancelled due to rain"' />
      </div>
      <div class="form-group">
        <label class="form-label">Official Verified Fact Statement</label>
        <textarea id="clarFact" class="form-control" placeholder='e.g. "The information circulating is INCORRECT. Examinations proceed according to schedule."'></textarea>
      </div>
    `;
    showModal('Debunk Misinformation / Fake News', html, () => {
      const title = document.getElementById('clarTitle').value.trim();
      const rumor = document.getElementById('clarRumor').value.trim();
      const fact = document.getElementById('clarFact').value.trim();

      if (!title || !rumor || !fact) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      state.announcements.unshift({
        id: 'ann-' + Date.now(),
        title,
        content: fact,
        priority: 'URGENT',
        isOfficial: true,
        isClarification: true,
        rumorText: rumor,
        factText: fact,
        date: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        author: USERS[state.currentRole].name
      });

      closeModal();
      showToast('Misinformation clarification published!', 'success');
      renderCurrentTab();
    });
  };

  // --------------------------------------------------------------------------
  // 4. STUDENT ISSUES & UPVOTING PILLAR (Students → Reps → Management)
  // --------------------------------------------------------------------------
  function renderIssuesTab() {
    let issues = state.issues;

    if (state.searchQuery) {
      issues = issues.filter(i =>
        i.title.toLowerCase().includes(state.searchQuery) ||
        i.description.toLowerCase().includes(state.searchQuery) ||
        i.category.toLowerCase().includes(state.searchQuery)
      );
    }

    const isRep = state.currentRole === 'REPRESENTATIVE';

    return `
      <div class="section-header">
        <div class="section-title-group">
          <h2>Student Representation & Issues</h2>
          <div class="section-subtitle">
            Student Representatives raise issues. Students support through upvotes. 
            Reaching <strong>${state.upvoteThreshold} upvotes</strong> triggers auto-notification to Management.
          </div>
        </div>
        <div class="toolbar">
          ${isRep ? `
            <button class="btn btn-primary" onclick="window.openCreateIssueModal()">
              <i class="fas fa-plus"></i> Raise Student Issue (Representative)
            </button>
          ` : `
            <div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem; background:var(--bg-surface); border-radius:var(--radius-md);">
              <i class="fas fa-info-circle"></i> Regular Students support issues via Upvoting. Only Student Representatives can raise new issues.
            </div>
          `}
        </div>
      </div>

      <div class="cards-grid">
        ${issues.map(renderIssueCard).join('')}
      </div>
    `;
  }

  function renderIssueCard(issue) {
    const isVoted = state.userVotes.has(issue.id);
    const progressPercent = Math.min(100, Math.round((issue.currentVotes / state.upvoteThreshold) * 100));
    const isThresholdReached = issue.currentVotes >= state.upvoteThreshold;
    const canManageStatus = state.currentRole === 'MANAGEMENT' || state.currentRole === 'ADMIN';

    const steps = [
      { id: 'SUBMITTED', label: 'Submitted' },
      { id: 'UNDER_REVIEW', label: 'Under Review' },
      { id: 'ACTION_PLANNED', label: 'Action Planned' },
      { id: 'IN_PROGRESS', label: 'In Progress' },
      { id: 'RESOLVED', label: 'Resolved' }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === issue.status);

    return `
      <div class="card">
        <div>
          <div class="card-header">
            <span class="badge" style="background:rgba(139,92,246,0.15); color:var(--accent-purple); border:1px solid rgba(139,92,246,0.3);">
              ${escapeHtml(issue.category)}
            </span>
            ${isThresholdReached ? `
              <span class="badge badge-verified" style="background:rgba(16,185,129,0.2); color:var(--accent-emerald);">
                <i class="fas fa-bell"></i> THRESHOLD REACHED (${issue.currentVotes} Upvotes)
              </span>
            ` : ''}
          </div>

          <div class="card-title">${escapeHtml(issue.title)}</div>
          <div class="card-meta">
            <span><i class="fas fa-user-graduate"></i> Raised by ${escapeHtml(issue.author)}</span> • 
            <span><i class="far fa-clock"></i> ${issue.date}</span>
          </div>

          <div class="card-body">${escapeHtml(issue.description)}</div>

          <!-- Upvote & Threshold Progress Box -->
          <div class="upvote-container">
            <button class="upvote-btn ${isVoted ? 'voted' : ''}" onclick="window.toggleUpvote('${issue.id}')">
              <i class="fas fa-chevron-up" style="font-size:1.2rem;"></i>
              <div class="upvote-count">${issue.currentVotes}</div>
            </button>

            <div class="threshold-progress-box">
              <div class="threshold-header">
                <span>Student Support Progress</span>
                <span>${issue.currentVotes} / ${state.upvoteThreshold} Upvotes (${progressPercent}%)</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${isThresholdReached ? 'reached' : ''}" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
          </div>

          <!-- Status Stepper -->
          <div class="status-stepper">
            ${steps.map((s, idx) => {
              let cls = '';
              if (idx < currentStepIndex || issue.status === 'RESOLVED') cls = 'completed';
              else if (idx === currentStepIndex) cls = 'active';
              return `
                <div class="step-item ${cls}">
                  <div class="step-dot"></div>
                  <div>${s.label}</div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Management Response Block -->
          ${issue.managementResponse ? `
            <div class="management-response-box">
              <div class="response-header">
                <i class="fas fa-university"></i> Official College Management Response:
              </div>
              <div class="response-text">${escapeHtml(issue.managementResponse)}</div>
            </div>
          ` : ''}
        </div>

        ${canManageStatus ? `
          <div style="display:flex; gap:0.5rem; margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--border-color);">
            <button class="btn btn-secondary btn-sm" onclick="window.openUpdateStatusModal('${issue.id}')">
              <i class="fas fa-tasks"></i> Update Status
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.openAddResponseModal('${issue.id}')">
              <i class="fas fa-comment-dots"></i> Add Management Response
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  window.toggleUpvote = function(issueId) {
    const issue = state.issues.find(i => i.id === issueId);
    if (!issue) return;

    if (state.userVotes.has(issueId)) {
      state.userVotes.delete(issueId);
      issue.currentVotes--;
      showToast('Support vote removed');
    } else {
      state.userVotes.add(issueId);
      issue.currentVotes++;
      showToast('Support vote recorded! 👍');

      // Check if threshold just reached
      if (issue.currentVotes >= state.upvoteThreshold && !issue.thresholdReached) {
        issue.thresholdReached = true;
        state.notifications.unshift({
          id: 'n-' + Date.now(),
          text: `Threshold Reached: Issue "${issue.title}" has reached ${issue.currentVotes} votes and notified Management!`,
          time: 'Just now',
          read: false,
          type: 'threshold'
        });
        showToast(`🎉 Threshold Reached (${state.upvoteThreshold} votes)! Management has been automatically notified.`, 'success');
        renderNotificationBadge();
      }
    }

    renderCurrentTab();
  };

  window.openCreateIssueModal = function() {
    const html = `
      <div class="form-group">
        <label class="form-label">Category</label>
        <select id="issueCat" class="form-control">
          <option value="Infrastructure">Infrastructure</option>
          <option value="Hostel Facilities">Hostel Facilities</option>
          <option value="Canteen">Canteen & Dining</option>
          <option value="Transportation">Transportation</option>
          <option value="Academic">Academic</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Issue Title</label>
        <input type="text" id="issueTitle" class="form-control" placeholder="e.g. Hot water unavailable in Hostel Block A" />
      </div>
      <div class="form-group">
        <label class="form-label">Description & Student Impact</label>
        <textarea id="issueDesc" class="form-control" placeholder="Explain the problem clearly on behalf of affected students..."></textarea>
      </div>
    `;
    showModal('Raise Student Issue (Representative)', html, () => {
      const cat = document.getElementById('issueCat').value;
      const title = document.getElementById('issueTitle').value.trim();
      const desc = document.getElementById('issueDesc').value.trim();

      if (!title || !desc) {
        showToast('Please complete all fields', 'error');
        return;
      }

      state.issues.unshift({
        id: 'issue-' + Date.now(),
        title,
        description: desc,
        category: cat,
        status: 'SUBMITTED',
        currentVotes: 1,
        thresholdReached: false,
        author: USERS[state.currentRole].name,
        date: new Date().toISOString().split('T')[0],
        managementResponse: null,
        history: [{ status: 'SUBMITTED', date: 'Just now', note: 'Issue raised by Student Representative' }]
      });

      state.userVotes.add('issue-' + Date.now());

      closeModal();
      showToast('Student Issue submitted for community upvoting!');
      renderCurrentTab();
    });
  };

  window.openUpdateStatusModal = function(issueId) {
    const issue = state.issues.find(i => i.id === issueId);
    if (!issue) return;

    const html = `
      <div class="form-group">
        <label class="form-label">Current Status: <strong>${issue.status}</strong></label>
        <select id="newStatus" class="form-control">
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="ACTION_PLANNED">Action Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
          <option value="DUPLICATE">Duplicate</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Status Update Reason / Note</label>
        <input type="text" id="statusNote" class="form-control" placeholder="e.g. Assigned to campus maintenance team" />
      </div>
    `;
    showModal(`Update Status: ${issue.title}`, html, () => {
      const status = document.getElementById('newStatus').value;
      const note = document.getElementById('statusNote').value.trim();

      issue.status = status;
      issue.history.push({
        status,
        date: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        note: note || 'Status updated by Management'
      });

      closeModal();
      showToast(`Status updated to ${status}`);
      renderCurrentTab();
    });
  };

  window.openAddResponseModal = function(issueId) {
    const issue = state.issues.find(i => i.id === issueId);
    if (!issue) return;

    const html = `
      <div class="form-group">
        <label class="form-label">Official Management Response</label>
        <textarea id="respText" class="form-control" placeholder="Provide official status update or action taken for students...">${issue.managementResponse || ''}</textarea>
      </div>
    `;
    showModal(`Official Response: ${issue.title}`, html, () => {
      const resp = document.getElementById('respText').value.trim();
      if (!resp) return;

      issue.managementResponse = resp;

      state.notifications.unshift({
        id: 'n-' + Date.now(),
        text: `Management posted official response to "${issue.title}"`,
        time: 'Just now',
        read: false,
        type: 'response'
      });
      renderNotificationBadge();

      closeModal();
      showToast('Official Management Response recorded and students notified!');
      renderCurrentTab();
    });
  };

  // --------------------------------------------------------------------------
  // 5. MANAGEMENT DASHBOARD VIEW
  // --------------------------------------------------------------------------
  function renderManagementTab() {
    const thresholdIssues = state.issues.filter(i => i.currentVotes >= state.upvoteThreshold);

    return `
      <div class="section-header">
        <div class="section-title-group">
          <h2>College Management Action Portal</h2>
          <div class="section-subtitle">Dedicated dashboard to quickly identify and respond to high-priority student concerns</div>
        </div>
      </div>

      <div class="analytics-grid">
        <div class="stat-card">
          <div class="stat-label">Issues Requiring Attention</div>
          <div class="stat-value" style="color:var(--accent-amber);">${thresholdIssues.length}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Reached support threshold</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Total Raised Issues</div>
          <div class="stat-value">${state.issues.length}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">From Student Reps</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Resolution Rate</div>
          <div class="stat-value" style="color:var(--accent-emerald);">
            ${Math.round((state.issues.filter(i => i.status === 'RESOLVED').length / state.issues.length) * 100)}%
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Successfully addressed</div>
        </div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <h3 style="margin-bottom:1rem;"><i class="fas fa-exclamation-circle" style="color:var(--accent-amber);"></i> Threshold-Exceeded High Priority Issues</h3>
        <div class="cards-grid">
          ${thresholdIssues.length === 0 ? `<div style="grid-column:1/-1; padding:2rem; text-align:center; color:var(--text-muted);">No issues currently exceed the upvote threshold.</div>` : ''}
          ${thresholdIssues.map(renderIssueCard).join('')}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6. ADMIN DASHBOARD & ANALYTICS
  // --------------------------------------------------------------------------
  function renderAdminTab() {
    const totalIssues = state.issues.length;
    const resolvedIssues = state.issues.filter(i => i.status === 'RESOLVED').length;
    const totalLostFound = state.lostFoundPosts.length;
    const resolvedLostFound = state.lostFoundPosts.filter(p => p.status === 'RESOLVED').length;

    return `
      <div class="section-header">
        <div class="section-title-group">
          <h2>System Administration & Analytics</h2>
          <div class="section-subtitle">System configuration, upvote threshold control, and campus interaction statistics</div>
        </div>
      </div>

      <div class="analytics-grid">
        <div class="stat-card">
          <div class="stat-label">Upvote Alert Threshold</div>
          <div class="stat-value" style="color:var(--primary);">${state.upvoteThreshold}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Required upvotes for auto-notification</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Issue Resolution Rate</div>
          <div class="stat-value" style="color:var(--accent-emerald);">
            ${totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0}%
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${resolvedIssues} of ${totalIssues} resolved</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Lost & Found Recovery Rate</div>
          <div class="stat-value" style="color:var(--accent-cyan);">
            ${totalLostFound > 0 ? Math.round((resolvedLostFound / totalLostFound) * 100) : 0}%
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${resolvedLostFound} of ${totalLostFound} recovered</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">Verified Announcements</div>
          <div class="stat-value" style="color:var(--accent-purple);">${state.announcements.length}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Official notices published</div>
        </div>
      </div>

      <div class="card" style="margin-bottom:2rem;">
        <h3 style="margin-bottom:1rem;"><i class="fas fa-sliders-h"></i> Configure Management Notification Threshold</h3>
        <div style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
          <div style="flex:1; min-width:240px;">
            <label class="form-label">Upvote Threshold (Current: ${state.upvoteThreshold})</label>
            <input type="number" id="thresholdConfigInput" class="form-control" value="${state.upvoteThreshold}" min="1" max="1000" />
          </div>
          <button class="btn btn-primary" style="margin-top:1.25rem;" onclick="window.saveThresholdConfig()">
            <i class="fas fa-save"></i> Save Threshold Setting
          </button>
        </div>
      </div>
    `;
  }

  window.saveThresholdConfig = function() {
    const val = parseInt(document.getElementById('thresholdConfigInput').value, 10);
    if (isNaN(val) || val < 1) {
      showToast('Please enter a valid threshold number', 'error');
      return;
    }
    state.upvoteThreshold = val;
    showToast(`Management upvote notification threshold updated to ${val}!`, 'success');
    renderCurrentTab();
  };

  // --------------------------------------------------------------------------
  // MODALS & TOAST UTILITIES
  // --------------------------------------------------------------------------
  let modalCallback = null;

  function showModal(title, bodyHtml, onConfirm) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    modalCallback = onConfirm;
    document.getElementById('modalOverlay').classList.add('show');
  }

  window.closeModal = function() {
    document.getElementById('modalOverlay').classList.remove('show');
    modalCallback = null;
  };

  window.confirmModal = function() {
    if (modalCallback) modalCallback();
  };

  function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = type === 'error' ? 'var(--accent-rose)' : type === 'success' ? 'var(--accent-emerald)' : 'var(--primary)';
    toast.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${escapeHtml(message)}`;
    
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', init);
})();
