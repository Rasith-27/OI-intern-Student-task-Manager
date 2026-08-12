/**
 * StudyFlow — Student Task Manager with Frontend Authentication
 * OASIS INFOBYTE SIP — Level 2 Task 3
 * Vanilla JavaScript Application Architecture
 * Author: Mohamed Rasith M
 */

'use strict';

(function () {
  // -------------------------------------------------------------------------
  // 1. Storage Keys & Configuration
  // -------------------------------------------------------------------------
  const STORAGE_USERS = 'studyFlowUsers';
  const STORAGE_SESSION = 'studyFlowSession';
  const STORAGE_TASKS = 'studyFlowTasks';
  const STORAGE_THEME = 'studyFlowTheme';

  const SUBJECT_CONFIG = {
    'Assignment': { icon: 'file-text', class: 'cat-assignment' },
    'Exam Prep': { icon: 'book-open', class: 'cat-exam-prep' },
    'Research': { icon: 'search', class: 'cat-research' },
    'Reading': { icon: 'book-open', class: 'cat-reading' },
    'Project': { icon: 'code', class: 'cat-project' },
    'Lecture Review': { icon: 'graduation-cap', class: 'cat-lecture-review' },
    'General': { icon: 'terminal', class: 'cat-general' }
  };

  const PRIORITY_ORDER = {
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  // Pre-seeded Demo Accounts for immediate testing & isolation verification
  const DEMO_USERS = [
    {
      id: 'user-demo-alex',
      name: 'Alex Morgan',
      email: 'alex@studyflow.edu',
      password: 'StudyFlow123!',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7 // 7 days ago
    },
    {
      id: 'user-demo-sarah',
      name: 'Sarah Jenkins',
      email: 'sarah@studyflow.edu',
      password: 'StudyFlow123!',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 // 5 days ago
    }
  ];

  // Pre-seeded Demo Tasks linked to specific demo user accounts
  const DEMO_TASKS = [
    // Alex's Tasks (Computer Science student)
    {
      id: 'task-alex-1',
      userId: 'user-demo-alex',
      title: 'Complete Computer Networks Lab Assignment (Socket Programming)',
      subject: 'Assignment',
      priority: 'High',
      dueDate: getFutureDate(3),
      completed: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 18,
      completedAt: null
    },
    {
      id: 'task-alex-2',
      userId: 'user-demo-alex',
      title: 'Revise Database Management Systems chapters for midterms',
      subject: 'Exam Prep',
      priority: 'High',
      dueDate: getFutureDate(5),
      completed: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
      completedAt: null
    },
    {
      id: 'task-alex-3',
      userId: 'user-demo-alex',
      title: 'Read IEEE Research Paper on Distributed Consensus Protocols',
      subject: 'Research',
      priority: 'Medium',
      dueDate: getFutureDate(7),
      completed: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 36,
      completedAt: Date.now() - 1000 * 60 * 60 * 6
    },
    {
      id: 'task-alex-4',
      userId: 'user-demo-alex',
      title: 'Submit Final Year Web Project Architecture Proposal',
      subject: 'Project',
      priority: 'Low',
      dueDate: getFutureDate(10),
      completed: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
      completedAt: null
    },

    // Sarah's Tasks (Pre-Med Biology student)
    {
      id: 'task-sarah-1',
      userId: 'user-demo-sarah',
      title: 'Study Cellular Biology Chapter 8 & 9 (Mitochondrial Pathways)',
      subject: 'Reading',
      priority: 'High',
      dueDate: getFutureDate(2),
      completed: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 20,
      completedAt: null
    },
    {
      id: 'task-sarah-2',
      userId: 'user-demo-sarah',
      title: 'Prepare Organic Chemistry Lab Synthesis & Chromatography Report',
      subject: 'Assignment',
      priority: 'High',
      dueDate: getFutureDate(4),
      completed: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
      completedAt: Date.now() - 1000 * 60 * 60 * 8
    },
    {
      id: 'task-sarah-3',
      userId: 'user-demo-sarah',
      title: 'Review Genetics & Molecular Inheritance Lecture Recordings',
      subject: 'Lecture Review',
      priority: 'Medium',
      dueDate: getFutureDate(6),
      completed: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 10,
      completedAt: null
    }
  ];

  function getFutureDate(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  }

  // -------------------------------------------------------------------------
  // 2. Application State
  // -------------------------------------------------------------------------
  let registeredUsers = [];
  let allStoredTasks = [];
  let currentSession = null; // { userId, name, email, loggedInAt, rememberMe }

  let currentFilter = 'all'; // 'all' | 'pending' | 'completed'
  let currentCategory = 'all';
  let currentSearchQuery = '';
  let currentSort = 'newest';
  let currentEditingTaskId = null;
  let activeModalAction = null;

  // -------------------------------------------------------------------------
  // 3. DOM Elements Cache
  // -------------------------------------------------------------------------
  const elements = {
    // Screens
    authScreen: document.getElementById('authScreen'),
    dashboardScreen: document.getElementById('dashboardScreen'),

    // Auth Screen Elements
    authThemeToggleBtn: document.getElementById('authThemeToggleBtn'),
    authThemeLabel: document.getElementById('authThemeLabel'),
    tabLoginBtn: document.getElementById('tabLoginBtn'),
    tabRegisterBtn: document.getElementById('tabRegisterBtn'),
    loginFormContainer: document.getElementById('loginFormContainer'),
    registerFormContainer: document.getElementById('registerFormContainer'),

    // Login Form
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginRememberMe: document.getElementById('loginRememberMe'),
    loginTogglePasswordBtn: document.getElementById('loginTogglePasswordBtn'),
    loginEmailError: document.getElementById('loginEmailError'),
    loginPasswordError: document.getElementById('loginPasswordError'),
    loginFormBanner: document.getElementById('loginFormBanner'),
    forgotPasswordBtn: document.getElementById('forgotPasswordBtn'),
    demoAlexBtn: document.getElementById('demoAlexBtn'),
    demoSarahBtn: document.getElementById('demoSarahBtn'),

    // Register Form
    registerForm: document.getElementById('registerForm'),
    registerName: document.getElementById('registerName'),
    registerEmail: document.getElementById('registerEmail'),
    registerPassword: document.getElementById('registerPassword'),
    registerConfirmPassword: document.getElementById('registerConfirmPassword'),
    registerTogglePasswordBtn: document.getElementById('registerTogglePasswordBtn'),
    registerToggleConfirmPasswordBtn: document.getElementById('registerToggleConfirmPasswordBtn'),
    registerNameError: document.getElementById('registerNameError'),
    registerEmailError: document.getElementById('registerEmailError'),
    registerPasswordError: document.getElementById('registerPasswordError'),
    registerConfirmPasswordError: document.getElementById('registerConfirmPasswordError'),
    registerFormBanner: document.getElementById('registerFormBanner'),

    // Dashboard Header & Profile
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeLabel: document.getElementById('themeLabel'),
    liveClock: document.getElementById('liveClock'),
    userProfileBtn: document.getElementById('userProfileBtn'),
    headerUserAvatar: document.getElementById('headerUserAvatar'),
    headerUserName: document.getElementById('headerUserName'),
    userGreetingName: document.getElementById('userGreetingName'),
    profileDropdown: document.getElementById('profileDropdown'),
    dropdownUserAvatar: document.getElementById('dropdownUserAvatar'),
    dropdownUserName: document.getElementById('dropdownUserName'),
    dropdownUserEmail: document.getElementById('dropdownUserEmail'),
    openProfileModalBtn: document.getElementById('openProfileModalBtn'),
    logoutBtn: document.getElementById('logoutBtn'),

    // Sidebar Navigation
    navDashboard: document.getElementById('navDashboard'),
    navAll: document.getElementById('navAll'),
    navPending: document.getElementById('navPending'),
    navCompleted: document.getElementById('navCompleted'),
    badgeAllCount: document.getElementById('badgeAllCount'),
    badgePendingCount: document.getElementById('badgePendingCount'),
    badgeCompletedCount: document.getElementById('badgeCompletedCount'),
    sidebarSprintRate: document.getElementById('sidebarSprintRate'),
    sidebarProgressBar: document.getElementById('sidebarProgressBar'),
    sidebarStatusText: document.getElementById('sidebarStatusText'),

    // Workspace & Stats
    quickSampleBtn: document.getElementById('quickSampleBtn'),
    statTotal: document.getElementById('statTotal'),
    statPending: document.getElementById('statPending'),
    statCompleted: document.getElementById('statCompleted'),
    statRate: document.getElementById('statRate'),

    // Task Creation Form
    taskForm: document.getElementById('taskForm'),
    taskInput: document.getElementById('taskInput'),
    charCounter: document.getElementById('charCounter'),
    taskCategory: document.getElementById('taskCategory'),
    taskPriority: document.getElementById('taskPriority'),
    taskDueDate: document.getElementById('taskDueDate'),
    formErrorMessage: document.getElementById('formErrorMessage'),

    // Controls: Search, Filters, Sort
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    filterTabAll: document.getElementById('filterTabAll'),
    filterTabPending: document.getElementById('filterTabPending'),
    filterTabCompleted: document.getElementById('filterTabCompleted'),
    filterCategory: document.getElementById('filterCategory'),
    sortBySelect: document.getElementById('sortBySelect'),
    resetSearchFilterBtn: document.getElementById('resetSearchFilterBtn'),

    // Task Sections & Lists
    pendingSection: document.getElementById('pendingSection'),
    pendingTasksList: document.getElementById('pendingTasksList'),
    pendingHeaderCount: document.getElementById('pendingHeaderCount'),
    pendingEmptyState: document.getElementById('pendingEmptyState'),

    completedSection: document.getElementById('completedSection'),
    completedTasksList: document.getElementById('completedTasksList'),
    completedHeaderCount: document.getElementById('completedHeaderCount'),
    completedEmptyState: document.getElementById('completedEmptyState'),
    clearCompletedBtn: document.getElementById('clearCompletedBtn'),
    searchEmptyState: document.getElementById('searchEmptyState'),

    // Modals
    confirmModal: document.getElementById('confirmModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalDescription: document.getElementById('modalDescription'),
    modalTaskPreview: document.getElementById('modalTaskPreview'),
    modalCancelBtn: document.getElementById('modalCancelBtn'),
    modalConfirmBtn: document.getElementById('modalConfirmBtn'),

    forgotPasswordModal: document.getElementById('forgotPasswordModal'),
    closeForgotPasswordModalBtn: document.getElementById('closeForgotPasswordModalBtn'),

    profileModal: document.getElementById('profileModal'),
    closeProfileModalBtn: document.getElementById('closeProfileModalBtn'),
    modalProfileAvatar: document.getElementById('modalProfileAvatar'),
    modalProfileName: document.getElementById('modalProfileName'),
    modalProfileEmail: document.getElementById('modalProfileEmail'),
    modalProfileJoined: document.getElementById('modalProfileJoined'),
    modalProfileTaskCount: document.getElementById('modalProfileTaskCount'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // -------------------------------------------------------------------------
  // 4. Utility Functions
  // -------------------------------------------------------------------------
  
  function generateId(prefix = 'item') {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
  }

  function getInitials(name) {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${dateStr} • ${timeStr}`;
    } catch (e) {
      return '';
    }
  }

  function formatDueDate(dueDateStr) {
    if (!dueDateStr) return '';
    try {
      const date = new Date(dueDateStr + 'T00:00:00');
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return dueDateStr;
    }
  }

  function padZero(num) {
    const val = Number(num) || 0;
    return val < 10 && val >= 0 ? `0${val}` : `${val}`;
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function createSvgIcon(name) {
    const icons = {
      'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
      'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>',
      'search': '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
      'code': '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
      'graduation-cap': '<path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path>',
      'terminal': '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>',
      'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
      'edit': '<path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>',
      'trash': '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>',
      'rotate-ccw': '<polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>',
      'calendar': '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
      'check': '<polyline points="20 6 9 17 4 12"></polyline>',
      'clock': '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'
    };

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.innerHTML = icons[name] || icons['terminal'];
    return svg;
  }

  // -------------------------------------------------------------------------
  // 5. Local Storage Layer
  // -------------------------------------------------------------------------
  function loadStorageData() {
    // 1. Users
    try {
      const storedUsers = localStorage.getItem(STORAGE_USERS);
      if (!storedUsers) {
        registeredUsers = [...DEMO_USERS];
        localStorage.setItem(STORAGE_USERS, JSON.stringify(registeredUsers));
      } else {
        const parsed = JSON.parse(storedUsers);
        registeredUsers = Array.isArray(parsed) ? parsed : [...DEMO_USERS];
      }
    } catch (e) {
      registeredUsers = [...DEMO_USERS];
    }

    // 2. Tasks
    try {
      const storedTasks = localStorage.getItem(STORAGE_TASKS);
      if (!storedTasks) {
        allStoredTasks = [...DEMO_TASKS];
        localStorage.setItem(STORAGE_TASKS, JSON.stringify(allStoredTasks));
      } else {
        const parsed = JSON.parse(storedTasks);
        allStoredTasks = Array.isArray(parsed) ? parsed : [...DEMO_TASKS];
      }
    } catch (e) {
      allStoredTasks = [...DEMO_TASKS];
    }

    // 3. Session
    try {
      const storedSession = localStorage.getItem(STORAGE_SESSION);
      if (storedSession) {
        currentSession = JSON.parse(storedSession);
      } else {
        currentSession = null;
      }
    } catch (e) {
      currentSession = null;
    }
  }

  function saveUsersToStorage() {
    try {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(registeredUsers));
    } catch (e) {
      console.error('StudyFlow: Failed to save users to localStorage.', e);
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem(STORAGE_TASKS, JSON.stringify(allStoredTasks));
    } catch (e) {
      console.error('StudyFlow: Failed to save tasks to localStorage.', e);
      showToast('Error saving tasks to storage.', 'danger');
    }
  }

  function saveSessionToStorage(session) {
    try {
      if (session) {
        localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_SESSION);
      }
    } catch (e) {
      console.error('StudyFlow: Failed to save session.', e);
    }
  }

  // -------------------------------------------------------------------------
  // 6. Theme Engine
  // -------------------------------------------------------------------------
  function initTheme() {
    try {
      const savedTheme = localStorage.getItem(STORAGE_THEME) || 'light';
      applyTheme(savedTheme, false);
    } catch (e) {
      applyTheme('light', false);
    }
  }

  function applyTheme(theme, notify = true) {
    document.documentElement.setAttribute('data-theme', theme);
    const label = theme === 'dark' ? 'Dark' : 'Light';
    if (elements.themeLabel) elements.themeLabel.textContent = label;
    if (elements.authThemeLabel) elements.authThemeLabel.textContent = label;

    try {
      localStorage.setItem(STORAGE_THEME, theme);
    } catch (e) {}

    if (notify) {
      showToast(`Switched to ${label} theme`, 'info');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  }

  // -------------------------------------------------------------------------
  // 7. Live Clock
  // -------------------------------------------------------------------------
  function updateLiveClock() {
    if (!elements.liveClock) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
    elements.liveClock.textContent = `${dateStr}, ${timeStr}`;
  }

  // -------------------------------------------------------------------------
  // 8. Toast Notifications Engine
  // -------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');

    const iconSpan = document.createElement('span');
    iconSpan.className = 'toast-icon';

    if (type === 'success') {
      iconSpan.appendChild(createSvgIcon('check-circle'));
    } else if (type === 'danger') {
      iconSpan.appendChild(createSvgIcon('trash'));
    } else if (type === 'warning') {
      iconSpan.appendChild(createSvgIcon('graduation-cap'));
    } else {
      iconSpan.appendChild(createSvgIcon('terminal'));
    }

    const messageSpan = document.createElement('span');
    messageSpan.className = 'toast-message';
    messageSpan.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(messageSpan);
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  // -------------------------------------------------------------------------
  // 9. Custom Confirmation Modal Engine
  // -------------------------------------------------------------------------
  function openConfirmModal(config) {
    if (!elements.confirmModal) return;

    elements.modalTitle.textContent = config.title || 'Are you sure?';
    elements.modalDescription.textContent = config.description || 'This action cannot be undone.';
    elements.modalConfirmBtn.textContent = config.confirmText || 'Confirm';

    if (config.taskTitle) {
      elements.modalTaskPreview.textContent = config.taskTitle;
      elements.modalTaskPreview.style.display = 'block';
    } else {
      elements.modalTaskPreview.style.display = 'none';
      elements.modalTaskPreview.textContent = '';
    }

    activeModalAction = config.onConfirm;
    elements.confirmModal.style.display = 'flex';
    elements.modalCancelBtn.focus();
  }

  function closeConfirmModal() {
    if (!elements.confirmModal) return;
    elements.confirmModal.style.display = 'none';
    activeModalAction = null;
  }

  // -------------------------------------------------------------------------
  // 10. Authentication & Session Flow
  // -------------------------------------------------------------------------
  
  function checkAuthSession() {
    if (currentSession && currentSession.userId) {
      // Validate that session user exists in users table
      const userExists = registeredUsers.some(u => u.id === currentSession.userId);
      if (userExists) {
        showDashboardScreen();
        return;
      }
    }
    // No active valid session -> show auth screen
    showAuthScreen();
  }

  function showAuthScreen() {
    if (elements.dashboardScreen) elements.dashboardScreen.style.display = 'none';
    if (elements.authScreen) elements.authScreen.style.display = 'flex';
    clearAuthFormErrors();
  }

  function showDashboardScreen() {
    if (elements.authScreen) elements.authScreen.style.display = 'none';
    if (elements.dashboardScreen) elements.dashboardScreen.style.display = 'flex';

    if (currentSession) {
      const initials = getInitials(currentSession.name);
      const firstName = currentSession.name.split(' ')[0] || 'Student';

      if (elements.headerUserAvatar) elements.headerUserAvatar.textContent = initials;
      if (elements.headerUserName) elements.headerUserName.textContent = firstName;
      if (elements.userGreetingName) elements.userGreetingName.textContent = firstName;

      if (elements.dropdownUserAvatar) elements.dropdownUserAvatar.textContent = initials;
      if (elements.dropdownUserName) elements.dropdownUserName.textContent = currentSession.name;
      if (elements.dropdownUserEmail) elements.dropdownUserEmail.textContent = currentSession.email;
    }

    updateAppUI();
  }

  function clearAuthFormErrors() {
    elements.loginEmailError.textContent = '';
    elements.loginPasswordError.textContent = '';
    elements.loginFormBanner.style.display = 'none';
    elements.loginEmail.classList.remove('input-error');
    elements.loginPassword.classList.remove('input-error');

    elements.registerNameError.textContent = '';
    elements.registerEmailError.textContent = '';
    elements.registerPasswordError.textContent = '';
    elements.registerConfirmPasswordError.textContent = '';
    elements.registerFormBanner.style.display = 'none';
    elements.registerName.classList.remove('input-error');
    elements.registerEmail.classList.remove('input-error');
    elements.registerPassword.classList.remove('input-error');
    elements.registerConfirmPassword.classList.remove('input-error');
  }

  function handleLogin(e) {
    if (e) e.preventDefault();
    clearAuthFormErrors();

    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    let hasError = false;

    if (!email) {
      elements.loginEmailError.textContent = 'Please enter your email.';
      elements.loginEmail.classList.add('input-error');
      hasError = true;
    } else if (!isValidEmail(email)) {
      elements.loginEmailError.textContent = 'Please enter a valid email address.';
      elements.loginEmail.classList.add('input-error');
      hasError = true;
    }

    if (!password) {
      elements.loginPasswordError.textContent = 'Password is required.';
      elements.loginPassword.classList.add('input-error');
      hasError = true;
    }

    if (hasError) return;

    // Verify credentials
    const matchingUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchingUser || matchingUser.password !== password) {
      elements.loginFormBanner.textContent = 'Invalid email or password.';
      elements.loginFormBanner.style.display = 'block';
      return;
    }

    // Success -> create session
    currentSession = {
      userId: matchingUser.id,
      name: matchingUser.name,
      email: matchingUser.email,
      loggedInAt: Date.now(),
      rememberMe: elements.loginRememberMe.checked
    };

    saveSessionToStorage(currentSession);
    showDashboardScreen();
    showToast(`Welcome back, ${matchingUser.name.split(' ')[0]}! 👋`, 'success');
  }

  function handleRegister(e) {
    if (e) e.preventDefault();
    clearAuthFormErrors();

    const name = elements.registerName.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    const confirmPassword = elements.registerConfirmPassword.value;
    let hasError = false;

    if (!name) {
      elements.registerNameError.textContent = 'Full Name is required.';
      elements.registerName.classList.add('input-error');
      hasError = true;
    }

    if (!email) {
      elements.registerEmailError.textContent = 'Email is required.';
      elements.registerEmail.classList.add('input-error');
      hasError = true;
    } else if (!isValidEmail(email)) {
      elements.registerEmailError.textContent = 'Please enter a valid email address.';
      elements.registerEmail.classList.add('input-error');
      hasError = true;
    } else {
      const emailExists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        elements.registerEmailError.textContent = 'An account with this email already exists.';
        elements.registerEmail.classList.add('input-error');
        hasError = true;
      }
    }

    if (!password) {
      elements.registerPasswordError.textContent = 'Password is required.';
      elements.registerPassword.classList.add('input-error');
      hasError = true;
    } else if (password.length < 6) {
      elements.registerPasswordError.textContent = 'Password must be at least 6 characters.';
      elements.registerPassword.classList.add('input-error');
      hasError = true;
    }

    if (!confirmPassword) {
      elements.registerConfirmPasswordError.textContent = 'Please confirm your password.';
      elements.registerConfirmPassword.classList.add('input-error');
      hasError = true;
    } else if (password !== confirmPassword) {
      elements.registerConfirmPasswordError.textContent = 'Passwords do not match.';
      elements.registerConfirmPassword.classList.add('input-error');
      hasError = true;
    }

    if (hasError) return;

    // Create user
    const newUser = {
      id: generateId('user'),
      name: name,
      email: email,
      password: password,
      createdAt: Date.now()
    };

    registeredUsers.push(newUser);
    saveUsersToStorage();

    // Create session
    currentSession = {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      loggedInAt: Date.now(),
      rememberMe: true
    };

    saveSessionToStorage(currentSession);
    showDashboardScreen();
    showToast(`Account created! Welcome to StudyFlow, ${name.split(' ')[0]}! 🎓`, 'success');
  }

  function handleLogout() {
    currentSession = null;
    saveSessionToStorage(null);
    closeProfileDropdown();
    showAuthScreen();
    showToast('Logged out successfully.', 'info');
  }

  function quickLoginDemoUser(email, password) {
    elements.loginEmail.value = email;
    elements.loginPassword.value = password;
    handleLogin();
  }

  function togglePasswordVisibility(inputEl, btnEl) {
    const isPass = inputEl.type === 'password';
    inputEl.type = isPass ? 'text' : 'password';

    const showIcon = btnEl.querySelector('.eye-show');
    const hideIcon = btnEl.querySelector('.eye-hide');

    if (showIcon && hideIcon) {
      showIcon.style.display = isPass ? 'none' : 'block';
      hideIcon.style.display = isPass ? 'block' : 'none';
    }
  }

  function toggleProfileDropdown() {
    if (!elements.profileDropdown) return;
    const isHidden = elements.profileDropdown.style.display === 'none';
    elements.profileDropdown.style.display = isHidden ? 'flex' : 'none';
    elements.userProfileBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  }

  function closeProfileDropdown() {
    if (elements.profileDropdown) {
      elements.profileDropdown.style.display = 'none';
      elements.userProfileBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function openProfileModal() {
    closeProfileDropdown();
    if (!currentSession || !elements.profileModal) return;

    const userObj = registeredUsers.find(u => u.id === currentSession.userId) || currentSession;
    const initials = getInitials(userObj.name);
    const userTasks = getUserTasks();

    elements.modalProfileAvatar.textContent = initials;
    elements.modalProfileName.textContent = userObj.name;
    elements.modalProfileEmail.textContent = userObj.email;
    elements.modalProfileJoined.textContent = userObj.createdAt ? new Date(userObj.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 12, 2026';
    elements.modalProfileTaskCount.textContent = `${userTasks.length} Active Tasks`;

    elements.profileModal.style.display = 'flex';
  }

  // -------------------------------------------------------------------------
  // 11. User-Specific Task Actions (Data Isolation by userId)
  // -------------------------------------------------------------------------
  
  function getUserTasks() {
    if (!currentSession || !currentSession.userId) return [];
    return allStoredTasks.filter(t => t.userId === currentSession.userId);
  }

  function handleAddTask(e) {
    if (e) e.preventDefault();
    if (!currentSession) return;

    const titleInput = elements.taskInput;
    const rawTitle = titleInput.value;
    const trimmedTitle = rawTitle.trim();

    // Data Validation
    if (!trimmedTitle) {
      titleInput.classList.add('input-error');
      elements.formErrorMessage.textContent = 'Please enter a valid task title (cannot be empty or whitespace).';
      elements.formErrorMessage.style.display = 'block';
      titleInput.focus();
      return;
    }

    // Check duplicate among pending tasks for this user
    const userTasks = getUserTasks();
    const isDuplicate = userTasks.some(t => !t.completed && t.title.toLowerCase() === trimmedTitle.toLowerCase());
    if (isDuplicate) {
      titleInput.classList.add('input-error');
      elements.formErrorMessage.textContent = 'A pending task with this exact title already exists.';
      elements.formErrorMessage.style.display = 'block';
      titleInput.focus();
      return;
    }

    titleInput.classList.remove('input-error');
    elements.formErrorMessage.style.display = 'none';

    const subject = elements.taskCategory.value || 'Assignment';
    const priority = elements.taskPriority.value || 'Medium';
    const dueDate = elements.taskDueDate.value || null;

    const newTask = {
      id: generateId('task'),
      userId: currentSession.userId,
      title: trimmedTitle,
      subject: subject,
      priority: priority,
      dueDate: dueDate,
      completed: false,
      createdAt: Date.now(),
      completedAt: null
    };

    allStoredTasks.unshift(newTask);
    saveTasksToStorage();

    titleInput.value = '';
    elements.taskDueDate.value = '';
    updateCharCounter();

    updateAppUI();
    showToast('Task added successfully', 'success');
  }

  function completeTask(taskId) {
    const task = allStoredTasks.find(t => t.id === taskId && t.userId === currentSession.userId);
    if (!task) return;

    task.completed = true;
    task.completedAt = Date.now();

    saveTasksToStorage();
    updateAppUI();
    showToast('Task completed! Great progress! 🎉', 'success');
  }

  function restoreTask(taskId) {
    const task = allStoredTasks.find(t => t.id === taskId && t.userId === currentSession.userId);
    if (!task) return;

    task.completed = false;
    task.completedAt = null;

    saveTasksToStorage();
    updateAppUI();
    showToast('Task restored to Pending', 'info');
  }

  function requestDeleteTask(taskId) {
    const task = allStoredTasks.find(t => t.id === taskId && t.userId === currentSession.userId);
    if (!task) return;

    openConfirmModal({
      title: 'Delete this task?',
      description: 'This task will be permanently removed from your workspace.',
      confirmText: 'Delete Task',
      taskTitle: task.title,
      onConfirm: () => {
        allStoredTasks = allStoredTasks.filter(t => t.id !== taskId);
        saveTasksToStorage();
        updateAppUI();
        showToast('Task deleted', 'danger');
      }
    });
  }

  function requestClearCompleted() {
    const userTasks = getUserTasks();
    const completedCount = userTasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    openConfirmModal({
      title: 'Clear All Completed Tasks?',
      description: `You are about to permanently remove ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}.`,
      confirmText: 'Clear Completed',
      taskTitle: `${completedCount} completed items`,
      onConfirm: () => {
        allStoredTasks = allStoredTasks.filter(t => !(t.userId === currentSession.userId && t.completed));
        saveTasksToStorage();
        updateAppUI();
        showToast('Completed tasks cleared', 'danger');
      }
    });
  }

  function startInlineEdit(taskId) {
    currentEditingTaskId = taskId;
    renderTasks();
  }

  function saveInlineEdit(taskId, newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      showToast('Task title cannot be empty.', 'warning');
      return;
    }

    const task = allStoredTasks.find(t => t.id === taskId && t.userId === currentSession.userId);
    if (!task) return;

    task.title = trimmed;
    currentEditingTaskId = null;
    saveTasksToStorage();
    updateAppUI();
    showToast('Task updated', 'success');
  }

  function cancelInlineEdit() {
    currentEditingTaskId = null;
    renderTasks();
  }

  // -------------------------------------------------------------------------
  // 12. Filtering, Search & Sorting Logic
  // -------------------------------------------------------------------------
  function getFilteredAndSortedTasks() {
    let userTasks = getUserTasks();

    // 1. Status Filter
    if (currentFilter === 'pending') {
      userTasks = userTasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      userTasks = userTasks.filter(t => t.completed);
    }

    // 2. Category / Subject Filter
    if (currentCategory !== 'all') {
      userTasks = userTasks.filter(t => (t.subject || '').toLowerCase() === currentCategory.toLowerCase());
    }

    // 3. Search Query (matches title or subject)
    if (currentSearchQuery) {
      const query = currentSearchQuery.toLowerCase();
      userTasks = userTasks.filter(t => {
        return (t.title && t.title.toLowerCase().includes(query)) ||
               (t.subject && t.subject.toLowerCase().includes(query));
      });
    }

    // 4. Sorting
    userTasks.sort((a, b) => {
      if (currentSort === 'newest') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      } else if (currentSort === 'oldest') {
        return (a.createdAt || 0) - (b.createdAt || 0);
      } else if (currentSort === 'due-date') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else if (currentSort === 'priority-desc') {
        const pA = PRIORITY_ORDER[a.priority] || 2;
        const pB = PRIORITY_ORDER[b.priority] || 2;
        if (pB !== pA) return pB - pA;
        return (b.createdAt || 0) - (a.createdAt || 0);
      } else if (currentSort === 'priority-asc') {
        const pA = PRIORITY_ORDER[a.priority] || 2;
        const pB = PRIORITY_ORDER[b.priority] || 2;
        if (pA !== pB) return pA - pB;
        return (b.createdAt || 0) - (a.createdAt || 0);
      } else if (currentSort === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return userTasks;
  }

  // -------------------------------------------------------------------------
  // 13. UI Rendering Engine
  // -------------------------------------------------------------------------
  function createTaskCardElement(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'is-completed' : ''}`;
    card.setAttribute('data-id', task.id);
    card.setAttribute('data-priority', task.priority || 'Medium');

    // Inline Editing Mode
    if (currentEditingTaskId === task.id) {
      card.classList.add('is-editing');

      const form = document.createElement('form');
      form.className = 'edit-task-form';
      form.onsubmit = (e) => {
        e.preventDefault();
        saveInlineEdit(task.id, editInput.value);
      };

      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'edit-task-input';
      editInput.value = task.title;
      editInput.maxLength = 150;
      editInput.setAttribute('aria-label', 'Edit task title');

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'edit-task-actions';

      const saveBtn = document.createElement('button');
      saveBtn.type = 'submit';
      saveBtn.className = 'btn-primary btn-sm';
      saveBtn.textContent = 'Save';

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn-secondary btn-sm';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.onclick = cancelInlineEdit;

      actionsDiv.appendChild(saveBtn);
      actionsDiv.appendChild(cancelBtn);
      form.appendChild(editInput);
      form.appendChild(actionsDiv);
      card.appendChild(form);

      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cancelInlineEdit();
      });

      setTimeout(() => {
        editInput.focus();
        editInput.select();
      }, 50);
      return card;
    }

    // 1. Status Check Button
    const checkBtn = document.createElement('button');
    checkBtn.className = 'task-check-btn';
    checkBtn.setAttribute('aria-label', task.completed ? 'Mark task pending' : 'Mark task completed');
    checkBtn.title = task.completed ? 'Mark Pending' : 'Mark Complete';
    checkBtn.appendChild(createSvgIcon('check'));
    checkBtn.addEventListener('click', () => {
      if (task.completed) {
        restoreTask(task.id);
      } else {
        completeTask(task.id);
      }
    });

    // 2. Task Body
    const body = document.createElement('div');
    body.className = 'task-body';

    // Title (Safe textContent)
    const titleEl = document.createElement('div');
    titleEl.className = 'task-title';
    titleEl.textContent = task.title;

    // Metadata Row
    const metaEl = document.createElement('div');
    metaEl.className = 'task-meta';

    // Subject Badge
    const subjectName = task.subject || 'General';
    const subConfig = SUBJECT_CONFIG[subjectName] || SUBJECT_CONFIG['General'];
    const subBadge = document.createElement('span');
    subBadge.className = `category-badge ${subConfig.class}`;
    subBadge.appendChild(createSvgIcon(subConfig.icon));
    const subText = document.createElement('span');
    subText.textContent = subjectName;
    subBadge.appendChild(subText);
    metaEl.appendChild(subBadge);

    // Priority Indicator
    const priorityPill = document.createElement('span');
    const priorityLower = (task.priority || 'medium').toLowerCase();
    priorityPill.className = `priority-pill priority-${priorityLower}`;
    const priorityDot = document.createElement('span');
    priorityDot.className = 'priority-dot';
    priorityPill.appendChild(priorityDot);
    const priorityText = document.createElement('span');
    priorityText.textContent = `${task.priority} Priority`;
    priorityPill.appendChild(priorityText);
    metaEl.appendChild(priorityPill);

    // Optional Due Date Pill
    if (task.dueDate) {
      const duePill = document.createElement('span');
      duePill.className = 'due-date-pill';
      duePill.appendChild(createSvgIcon('calendar'));
      const dueTxt = document.createElement('span');
      dueTxt.textContent = `Due: ${formatDueDate(task.dueDate)}`;
      duePill.appendChild(dueTxt);
      metaEl.appendChild(duePill);
    }

    // Timestamp
    const timeSpan = document.createElement('span');
    timeSpan.className = 'task-timestamp';
    timeSpan.appendChild(createSvgIcon('clock'));
    const timeText = document.createElement('span');
    if (task.completed && task.completedAt) {
      timeText.textContent = `Completed: ${formatTimestamp(task.completedAt)}`;
    } else {
      timeText.textContent = `Created: ${formatTimestamp(task.createdAt)}`;
    }
    timeSpan.appendChild(timeText);
    metaEl.appendChild(timeSpan);

    body.appendChild(titleEl);
    body.appendChild(metaEl);

    // 3. Action Buttons
    const actionsEl = document.createElement('div');
    actionsEl.className = 'task-actions';

    if (!task.completed) {
      // Edit Button
      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn btn-edit-action';
      editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
      editBtn.title = 'Edit Task';
      editBtn.appendChild(createSvgIcon('edit'));
      const editTxt = document.createElement('span');
      editTxt.textContent = 'Edit';
      editBtn.appendChild(editTxt);
      editBtn.addEventListener('click', () => startInlineEdit(task.id));
      actionsEl.appendChild(editBtn);

      // Complete Button
      const compBtn = document.createElement('button');
      compBtn.className = 'action-btn btn-complete-action';
      compBtn.setAttribute('aria-label', `Complete task: ${task.title}`);
      compBtn.title = 'Mark Complete';
      compBtn.appendChild(createSvgIcon('check-circle'));
      const compTxt = document.createElement('span');
      compTxt.textContent = 'Complete';
      compBtn.appendChild(compTxt);
      compBtn.addEventListener('click', () => completeTask(task.id));
      actionsEl.appendChild(compBtn);
    } else {
      // Restore Button
      const restBtn = document.createElement('button');
      restBtn.className = 'action-btn btn-restore-action';
      restBtn.setAttribute('aria-label', `Restore task: ${task.title}`);
      restBtn.title = 'Restore to Pending';
      restBtn.appendChild(createSvgIcon('rotate-ccw'));
      const restTxt = document.createElement('span');
      restTxt.textContent = 'Restore';
      restBtn.appendChild(restTxt);
      restBtn.addEventListener('click', () => restoreTask(task.id));
      actionsEl.appendChild(restBtn);
    }

    // Delete Button
    const delBtn = document.createElement('button');
    delBtn.className = 'action-btn btn-delete-action';
    delBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
    delBtn.title = 'Delete Task';
    delBtn.appendChild(createSvgIcon('trash'));
    const delTxt = document.createElement('span');
    delTxt.textContent = 'Delete';
    delBtn.appendChild(delTxt);
    delBtn.addEventListener('click', () => requestDeleteTask(task.id));
    actionsEl.appendChild(delBtn);

    card.appendChild(checkBtn);
    card.appendChild(body);
    card.appendChild(actionsEl);

    return card;
  }

  function renderTasks() {
    const userTasks = getUserTasks();
    const visibleTasks = getFilteredAndSortedTasks();
    const pendingTasks = visibleTasks.filter(t => !t.completed);
    const completedTasks = visibleTasks.filter(t => t.completed);

    const totalFiltered = visibleTasks.length;
    const isSearchingOrFiltering = currentSearchQuery !== '' || currentCategory !== 'all' || currentFilter !== 'all';

    // 1. Pending Section
    elements.pendingTasksList.innerHTML = '';
    if (pendingTasks.length > 0) {
      elements.pendingSection.style.display = currentFilter === 'completed' ? 'none' : 'flex';
      elements.pendingEmptyState.style.display = 'none';
      pendingTasks.forEach(task => {
        elements.pendingTasksList.appendChild(createTaskCardElement(task));
      });
    } else {
      if (currentFilter === 'completed' || (isSearchingOrFiltering && totalFiltered === 0)) {
        elements.pendingSection.style.display = 'none';
      } else {
        elements.pendingSection.style.display = 'flex';
        const allPending = userTasks.filter(t => !t.completed).length;
        elements.pendingEmptyState.style.display = allPending === 0 ? 'flex' : 'none';
      }
    }

    // 2. Completed Section
    elements.completedTasksList.innerHTML = '';
    if (completedTasks.length > 0) {
      elements.completedSection.style.display = currentFilter === 'pending' ? 'none' : 'flex';
      elements.completedEmptyState.style.display = 'none';
      completedTasks.forEach(task => {
        elements.completedTasksList.appendChild(createTaskCardElement(task));
      });
    } else {
      if (currentFilter === 'pending' || (isSearchingOrFiltering && totalFiltered === 0)) {
        elements.completedSection.style.display = 'none';
      } else {
        elements.completedSection.style.display = 'flex';
        const allCompleted = userTasks.filter(t => t.completed).length;
        elements.completedEmptyState.style.display = allCompleted === 0 ? 'flex' : 'none';
      }
    }

    // 3. Search / Filter Empty State
    if (totalFiltered === 0 && (isSearchingOrFiltering || userTasks.length === 0)) {
      elements.searchEmptyState.style.display = 'flex';
      if (userTasks.length === 0) {
        elements.pendingSection.style.display = 'none';
        elements.completedSection.style.display = 'none';
      }
    } else {
      elements.searchEmptyState.style.display = 'none';
    }

    // 4. Clear Completed Button Visibility
    const actualCompletedCount = userTasks.filter(t => t.completed).length;
    if (elements.clearCompletedBtn) {
      elements.clearCompletedBtn.style.display = actualCompletedCount > 0 ? 'inline-flex' : 'none';
    }
  }

  function updateStatistics() {
    const userTasks = getUserTasks();
    const totalCount = userTasks.length;
    const pendingCount = userTasks.filter(t => !t.completed).length;
    const completedCount = userTasks.filter(t => t.completed).length;
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Stat Cards
    elements.statTotal.textContent = padZero(totalCount);
    elements.statPending.textContent = padZero(pendingCount);
    elements.statCompleted.textContent = padZero(completedCount);
    elements.statRate.textContent = `${rate}%`;

    // Section Header Badges
    elements.pendingHeaderCount.textContent = pendingCount;
    elements.completedHeaderCount.textContent = completedCount;

    // Sidebar Badges
    elements.badgeAllCount.textContent = totalCount;
    elements.badgePendingCount.textContent = pendingCount;
    elements.badgeCompletedCount.textContent = completedCount;
    elements.sidebarSprintRate.textContent = `${rate}%`;
    elements.sidebarProgressBar.style.width = `${rate}%`;

    // Sidebar dynamic caption
    if (totalCount === 0) {
      elements.sidebarStatusText.textContent = 'Ready for new study tasks.';
    } else if (rate === 100) {
      elements.sidebarStatusText.textContent = 'All study tasks done! Excellent work!';
    } else if (rate >= 50) {
      elements.sidebarStatusText.textContent = 'More than half way done!';
    } else {
      elements.sidebarStatusText.textContent = `${pendingCount} study tasks remaining.`;
    }
  }

  function updateCharCounter() {
    if (!elements.taskInput || !elements.charCounter) return;
    elements.charCounter.textContent = `${elements.taskInput.value.length}/150`;
  }

  function updateAppUI() {
    updateStatistics();
    renderTasks();
  }

  // -------------------------------------------------------------------------
  // 14. Event Listeners & Interaction Wiring
  // -------------------------------------------------------------------------
  function setupEventListeners() {
    // 1. Auth Form Tab Switching
    elements.tabLoginBtn.addEventListener('click', () => {
      elements.tabLoginBtn.classList.add('active');
      elements.tabLoginBtn.setAttribute('aria-selected', 'true');
      elements.tabRegisterBtn.classList.remove('active');
      elements.tabRegisterBtn.setAttribute('aria-selected', 'false');

      elements.loginFormContainer.style.display = 'flex';
      elements.registerFormContainer.style.display = 'none';
      clearAuthFormErrors();
    });

    elements.tabRegisterBtn.addEventListener('click', () => {
      elements.tabRegisterBtn.classList.add('active');
      elements.tabRegisterBtn.setAttribute('aria-selected', 'true');
      elements.tabLoginBtn.classList.remove('active');
      elements.tabLoginBtn.setAttribute('aria-selected', 'false');

      elements.loginFormContainer.style.display = 'none';
      elements.registerFormContainer.style.display = 'flex';
      clearAuthFormErrors();
    });

    // 2. Auth Form Submissions
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);

    // 3. Password Visibility Toggles
    elements.loginTogglePasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(elements.loginPassword, elements.loginTogglePasswordBtn);
    });

    elements.registerTogglePasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(elements.registerPassword, elements.registerTogglePasswordBtn);
    });

    elements.registerToggleConfirmPasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(elements.registerConfirmPassword, elements.registerToggleConfirmPasswordBtn);
    });

    // 4. Demo Account Quick Buttons
    elements.demoAlexBtn.addEventListener('click', () => {
      quickLoginDemoUser('alex@studyflow.edu', 'StudyFlow123!');
    });

    elements.demoSarahBtn.addEventListener('click', () => {
      quickLoginDemoUser('sarah@studyflow.edu', 'StudyFlow123!');
    });

    // 5. Forgot Password Modal
    elements.forgotPasswordBtn.addEventListener('click', () => {
      elements.forgotPasswordModal.style.display = 'flex';
    });

    elements.closeForgotPasswordModalBtn.addEventListener('click', () => {
      elements.forgotPasswordModal.style.display = 'none';
    });

    // 6. Theme Toggles
    elements.authThemeToggleBtn.addEventListener('click', toggleTheme);
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // 7. Profile Menu & Logout
    elements.userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleProfileDropdown();
    });

    document.addEventListener('click', (e) => {
      if (!elements.profileDropdown.contains(e.target) && !elements.userProfileBtn.contains(e.target)) {
        closeProfileDropdown();
      }
    });

    elements.openProfileModalBtn.addEventListener('click', openProfileModal);
    elements.closeProfileModalBtn.addEventListener('click', () => {
      elements.profileModal.style.display = 'none';
    });

    elements.logoutBtn.addEventListener('click', handleLogout);

    // 8. Task Form Submission
    elements.taskForm.addEventListener('submit', handleAddTask);
    elements.taskInput.addEventListener('input', () => {
      updateCharCounter();
      if (elements.taskInput.classList.contains('input-error')) {
        elements.taskInput.classList.remove('input-error');
        elements.formErrorMessage.style.display = 'none';
      }
    });

    // 9. Sample Tasks Loader
    elements.quickSampleBtn.addEventListener('click', () => {
      if (!currentSession) return;
      // Load user-specific sample tasks
      const sampleTasks = [
        {
          id: generateId('task'),
          userId: currentSession.userId,
          title: 'Prepare presentation slides for Seminar',
          subject: 'Assignment',
          priority: 'High',
          dueDate: getFutureDate(3),
          completed: false,
          createdAt: Date.now(),
          completedAt: null
        },
        {
          id: generateId('task'),
          userId: currentSession.userId,
          title: 'Complete textbook chapter review questions',
          subject: 'Reading',
          priority: 'Medium',
          dueDate: getFutureDate(5),
          completed: false,
          createdAt: Date.now(),
          completedAt: null
        },
        {
          id: generateId('task'),
          userId: currentSession.userId,
          title: 'Review class notes and formulate study flashcards',
          subject: 'Lecture Review',
          priority: 'Low',
          dueDate: getFutureDate(7),
          completed: true,
          createdAt: Date.now() - 1000 * 60 * 60 * 12,
          completedAt: Date.now() - 1000 * 60 * 60 * 2
        }
      ];

      allStoredTasks.unshift(...sampleTasks);
      saveTasksToStorage();
      updateAppUI();
      showToast('Sample academic tasks added', 'info');
    });

    // 10. Real-time Search
    elements.searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      elements.clearSearchBtn.style.display = currentSearchQuery ? 'block' : 'none';
      renderTasks();
    });

    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      currentSearchQuery = '';
      elements.clearSearchBtn.style.display = 'none';
      elements.searchInput.focus();
      renderTasks();
    });

    // 11. Status Filter Tabs
    const filterTabs = [elements.filterTabAll, elements.filterTabPending, elements.filterTabCompleted];
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        currentFilter = tab.getAttribute('data-filter');
        syncSidebarWithFilter(currentFilter);
        renderTasks();
      });
    });

    // 12. Sidebar Navigation Links
    const sidebarNavLinks = [elements.navDashboard, elements.navAll, elements.navPending, elements.navCompleted];
    sidebarNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        sidebarNavLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const view = link.getAttribute('data-view');
        if (view === 'dashboard' || view === 'all') {
          currentFilter = 'all';
        } else if (view === 'pending') {
          currentFilter = 'pending';
        } else if (view === 'completed') {
          currentFilter = 'completed';
        }

        filterTabs.forEach(t => {
          if (t.getAttribute('data-filter') === currentFilter) {
            t.classList.add('active');
            t.setAttribute('aria-selected', 'true');
          } else {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          }
        });

        renderTasks();
        if (window.innerWidth <= 768) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    // 13. Subject Filter Dropdown
    elements.filterCategory.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      renderTasks();
    });

    // 14. Sort Dropdown
    elements.sortBySelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderTasks();
    });

    // 15. Reset Search & Filters
    elements.resetSearchFilterBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      currentSearchQuery = '';
      elements.clearSearchBtn.style.display = 'none';

      elements.filterCategory.value = 'all';
      currentCategory = 'all';

      currentFilter = 'all';
      filterTabs.forEach(t => {
        if (t.getAttribute('data-filter') === 'all') {
          t.classList.add('active');
          t.setAttribute('aria-selected', 'true');
        } else {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        }
      });
      syncSidebarWithFilter('all');
      renderTasks();
      showToast('Filters cleared', 'info');
    });

    // 16. Clear Completed Button
    elements.clearCompletedBtn.addEventListener('click', requestClearCompleted);

    // 17. Modals Global Events
    elements.modalCancelBtn.addEventListener('click', closeConfirmModal);
    elements.modalConfirmBtn.addEventListener('click', () => {
      if (typeof activeModalAction === 'function') {
        activeModalAction();
      }
      closeConfirmModal();
    });

    // Close Modals on Backdrop Click & Escape
    [elements.confirmModal, elements.forgotPasswordModal, elements.profileModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeConfirmModal();
        elements.forgotPasswordModal.style.display = 'none';
        elements.profileModal.style.display = 'none';
        closeProfileDropdown();
      }
    });
  }

  function syncSidebarWithFilter(filter) {
    [elements.navDashboard, elements.navAll, elements.navPending, elements.navCompleted].forEach(l => l.classList.remove('active'));
    if (filter === 'pending') {
      elements.navPending.classList.add('active');
    } else if (filter === 'completed') {
      elements.navCompleted.classList.add('active');
    } else {
      elements.navDashboard.classList.add('active');
    }
  }

  // -------------------------------------------------------------------------
  // 15. App Initialization
  // -------------------------------------------------------------------------
  function init() {
    initTheme();
    loadStorageData();
    setupEventListeners();
    updateLiveClock();
    setInterval(updateLiveClock, 1000);
    checkAuthSession();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
