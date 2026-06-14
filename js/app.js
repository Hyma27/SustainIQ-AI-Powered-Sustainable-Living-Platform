/* ==========================================================================
   SustainIQ: Core State Engine & Router
   ========================================================================== */

// Global App State Object
window.SustainIQ = {
  // Default Database (preloaded in Demo Mode)
  defaultState: {
    user: {
      name: "Guest Explorer",
      points: 1250,
      savedCO2: 320, // kg CO2e saved this month
      score: 75,
      rank: "Eco Explorer",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SustainIQUser"
    },
    calculator: {
      transport: { vehicle: "petrol", km: 150, flights: 10, transit: 5 },
      energy: { electricity: 300, greenShare: 20, household: 3 },
      food: { diet: "average-meat", waste: "minimal" },
      waste: { bags: 2, recycling: "partial" },
      totalCO2: 4.8 // tons CO2e/year
    },
    history: [
      { month: "Jan", score: 60, emissions: 5.6 },
      { month: "Feb", score: 62, emissions: 5.4 },
      { month: "Mar", score: 65, emissions: 5.2 },
      { month: "Apr", score: 68, emissions: 5.0 },
      { month: "May", score: 72, emissions: 4.9 },
      { month: "Jun", score: 75, emissions: 4.8 }
    ],
    badges: [
      { id: "green-beginner", name: "Green Beginner", desc: "Completed your first carbon assessment.", unlocked: true, icon: "award", reward: 100 },
      { id: "eco-explorer", name: "Eco Explorer", desc: "Switched lifestyle habits to reduce emissions.", unlocked: true, icon: "compass", reward: 150 },
      { id: "sustainability-champion", name: "Sustainability Champion", desc: "Reached a Sustainability Score of 75+.", unlocked: true, icon: "shield", reward: 200 },
      { id: "carbon-reducer", name: "Carbon Reducer", desc: "Successfully saved over 200kg CO2 this month.", unlocked: false, icon: "trending-down", reward: 250 },
      { id: "earth-guardian", name: "Earth Guardian", desc: "Claimed completions on 5 weekly challenges.", unlocked: false, icon: "globe", reward: 500 }
    ],
    challenges: {
      daily: [
        { id: "d1", title: "No Meat Today", points: 20, desc: "Consume plant-based foods for all meals today.", progress: 0, target: 1, claimed: false },
        { id: "d2", title: "Unplug Idle Devices", points: 15, desc: "Shut off power strips and appliance chargers when idle.", progress: 1, target: 1, claimed: true },
        { id: "d3", title: "Active Commute", points: 30, desc: "Swap a short vehicle ride for a walking or cycling commute.", progress: 0, target: 1, claimed: false }
      ],
      weekly: [
        { id: "w1", title: "Zero Plastic Single-Use", points: 80, desc: "Refuse single-use shopping bags, water bottles, and take-out boxes.", progress: 4, target: 7, claimed: false },
        { id: "w2", title: "Compost Household Waste", points: 50, desc: "Separate 100% of organic leftovers for compost piles.", progress: 3, target: 3, claimed: true }
      ]
    },
    goals: [
      { id: "g1", title: "Reduce Car Trips", category: "transport", timeframe: "monthly", target: 50, current: 35, unit: "km reduction" },
      { id: "g2", title: "Clean Grid Percentage", category: "energy", timeframe: "yearly", target: 60, current: 20, unit: "% solar/wind" }
    ],
    notifications: [
      { id: "n1", title: "Calculator Sync Completed", text: "Your carbon footprint score has been synchronized.", date: "Just now" },
      { id: "n2", title: "Badge Earned!", text: "You unlocked 'Sustainability Champion'. Click to view profile.", date: "15m ago" }
    ],
    settings: {
      theme: "dark",
      units: "metric",
      notifyChallenge: true,
      notifyGoal: true,
      notifyReport: true
    }
  },

  // Active Runtime State
  state: {},

  // Save state to Local Storage
  saveState() {
    localStorage.setItem("sustainiq_state", JSON.stringify(this.state));
    this.syncGlobalUI();
  },

  // Load state from Local Storage or preload Default
  loadState() {
    const cached = localStorage.getItem("sustainiq_state");
    if (cached) {
      this.state = JSON.parse(cached);
    } else {
      // By default, load Default Guest State for Demo Mode
      this.state = JSON.parse(JSON.stringify(this.defaultState));
      localStorage.setItem("sustainiq_state", JSON.stringify(this.state));
    }
  },

  // Switch display views based on router hash
  route(hash) {
    if (!hash || hash === "" || hash === "#") hash = "#landing";
    
    // Clear hash for matching page container ids
    const pageId = hash.replace("#", "");
    
    // Handle auth states
    const isLoggedIn = sessionStorage.getItem("sustainiq_logged_in") === "true";
    
    // Pages that require user login. If not logged in, redirect to Landing
    const authRequired = ["dashboard", "calculator", "simulator", "ai-assistant", "challenges", "prediction", "goals", "leaderboard", "learning-hub", "reports", "profile", "settings"];
    
    if (authRequired.includes(pageId) && !isLoggedIn) {
      window.location.hash = "#landing";
      return;
    }

    // Swapping visual overlays
    if (pageId === "landing") {
      document.getElementById("app-shell").classList.add("hidden");
      document.getElementById("landing").classList.remove("hidden");
    } else {
      document.getElementById("landing").classList.add("hidden");
      document.getElementById("app-shell").classList.remove("hidden");
      
      // Deactivate all sections, activate matching
      document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
      const activeSection = document.getElementById(pageId);
      if (activeSection) {
        activeSection.classList.add("active");
      }
      
      // Update sidebar active highlights
      document.querySelectorAll(".sidebar-nav a").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("data-page") === pageId) {
          link.classList.add("active");
        }
      });
      
      // Scroll content body to top
      document.querySelector(".main-content").scrollTop = 0;
    }

    // Trigger page-specific component renders
    this.renderPageSpecific(pageId);
  },

  // Calls initializations in sub-scripts
  renderPageSpecific(pageId) {
    // Re-instantiate Lucide icons for any dynamically generated items
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    if (pageId === "dashboard" && window.SustainIQ.dashboard) {
      window.SustainIQ.dashboard.init();
    } else if (pageId === "calculator" && window.SustainIQ.calculatorInit) {
      window.SustainIQ.calculatorInit();
    } else if (pageId === "simulator" && window.SustainIQ.simulator) {
      window.SustainIQ.simulator.init();
    } else if (pageId === "ai-assistant" && window.SustainIQ.chatbot) {
      window.SustainIQ.chatbot.init();
    } else if (pageId === "challenges" && window.SustainIQ.challenges) {
      window.SustainIQ.challenges.init();
    } else if (pageId === "prediction" && window.SustainIQ.prediction) {
      window.SustainIQ.prediction.init();
    } else if (pageId === "goals" && window.SustainIQ.goals) {
      window.SustainIQ.goals.init();
    } else if (pageId === "leaderboard" && window.SustainIQ.leaderboard) {
      window.SustainIQ.leaderboard.init();
    } else if (pageId === "learning-hub" && window.SustainIQ.learning) {
      window.SustainIQ.learning.init();
    } else if (pageId === "reports" && window.SustainIQ.reports) {
      window.SustainIQ.reports.init();
    } else if (pageId === "profile" && window.SustainIQ.profile) {
      window.SustainIQ.profile.init();
    } else if (pageId === "settings" && window.SustainIQ.settingsInit) {
      window.SustainIQ.settingsInit();
    }
  },

  // Sync core elements in sidebar and top navbar
  syncGlobalUI() {
    const u = this.state.user;
    
    // Sidebar Details
    document.getElementById("sidebar-user-name").innerText = u.name;
    document.getElementById("sidebar-user-points").innerText = u.points.toLocaleString();
    document.getElementById("sidebar-user-saved").innerText = u.savedCO2 + " kg";
    document.getElementById("sidebar-user-rank").innerText = u.rank;
    document.getElementById("sidebar-user-avatar").src = u.avatar;
    
    // Navbar Details
    document.getElementById("navbar-user-name").innerText = u.name;
    document.getElementById("navbar-user-avatar").src = u.avatar;
    
    // Sync Notification badge dot
    const notiBadge = document.getElementById("noti-badge-dot");
    if (this.state.notifications.length > 0) {
      notiBadge.classList.remove("hidden");
    } else {
      notiBadge.classList.add("hidden");
    }
    
    // Render notifications inside dropdown panel
    const listContainer = document.getElementById("notifications-list");
    if (this.state.notifications.length === 0) {
      listContainer.innerHTML = `<div class="empty-noti">No new notifications</div>`;
    } else {
      listContainer.innerHTML = this.state.notifications.map(n => `
        <div class="notification-item">
          <h5>${n.title}</h5>
          <p>${n.text}</p>
          <span style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 4px;">${n.date}</span>
        </div>
      `).join("");
    }

    // Set settings page fields matching state
    const themeCheckbox = document.getElementById("theme-mode-checkbox");
    if (themeCheckbox) {
      themeCheckbox.checked = this.state.settings.theme === "light";
    }
    const unitsSelect = document.getElementById("settings-units");
    if (unitsSelect) {
      unitsSelect.value = this.state.settings.units;
    }
    const chkChallenge = document.getElementById("pref-challenge-notif");
    if (chkChallenge) chkChallenge.checked = this.state.settings.notifyChallenge;
    const chkGoal = document.getElementById("pref-goal-notif");
    if (chkGoal) chkGoal.checked = this.state.settings.notifyGoal;
    const chkReport = document.getElementById("pref-weekly-report");
    if (chkReport) chkReport.checked = this.state.settings.notifyReport;
  },

  // Pop up animated achievement toast
  triggerAchievement(badgeId) {
    const badge = this.state.badges.find(b => b.id === badgeId);
    if (!badge) return;
    
    // If already unlocked, don't show duplicate popup
    if (badge.unlocked) return;
    
    // Unlock badge and reward points
    badge.unlocked = true;
    this.state.user.points += badge.reward;
    
    // Create new Notification item
    this.state.notifications.unshift({
      id: "n_" + Date.now(),
      title: "Badge Unlocked!",
      text: `Earned '${badge.name}' badge +${badge.reward} pts.`,
      date: "Just now"
    });
    
    this.saveState();
    
    // Visual popup trigger
    const toast = document.getElementById("achievement-toast");
    document.getElementById("toast-badge-name").innerText = badge.name;
    document.getElementById("toast-badge-desc").innerText = badge.desc;
    document.getElementById("toast-badge-icon").innerHTML = this.getBadgeSVG(badge.icon);
    
    toast.classList.remove("hidden");
    
    // Automatically close toast after 5 seconds
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
      toast.classList.add("hidden");
    }, 5000);
  },

  // Returns beautiful inline SVGs for badge representations
  getBadgeSVG(iconName) {
    const color = "var(--accent-green)";
    switch (iconName) {
      case "award":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`;
      case "compass":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`;
      case "shield":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
      case "trending-down":
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`;
      case "globe":
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    }
  }
};

// 2. Application Init Logic & Listeners
document.addEventListener("DOMContentLoaded", () => {
  
  // Load State databases
  window.SustainIQ.loadState();
  window.SustainIQ.syncGlobalUI();
  
  // Check default hash router
  window.SustainIQ.route(window.location.hash);
  window.addEventListener("hashchange", () => {
    window.SustainIQ.route(window.location.hash);
  });

  // Mobile navigation sidebar toggle
  const sidebar = document.querySelector(".sidebar");
  const menuToggle = document.getElementById("sidebar-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("show");
      document.getElementById("app-shell").classList.toggle("sidebar-active");
    });
  }

  // Close sidebar on navigation selection (mobile only)
  document.querySelectorAll(".sidebar-nav a").forEach(link => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("show");
      document.getElementById("app-shell").classList.remove("sidebar-active");
    });
  });

  // Toggle dropdown user menus
  const userMenuTrigger = document.getElementById("user-menu-trigger");
  const userDropdownMenu = document.getElementById("user-dropdown-menu");
  if (userMenuTrigger) {
    userMenuTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdownMenu.classList.toggle("hidden");
    });
  }
  
  // Toggle notifications panel
  const notiTrigger = document.getElementById("notifications-toggle");
  const notiPanel = document.getElementById("notifications-panel");
  if (notiTrigger) {
    notiTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      notiPanel.classList.toggle("hidden");
    });
  }

  // Clear notifications list
  const clearNoti = document.getElementById("clear-notifications");
  if (clearNoti) {
    clearNoti.addEventListener("click", () => {
      window.SustainIQ.state.notifications = [];
      window.SustainIQ.saveState();
    });
  }

  // Close drop panels on screen clicks
  document.addEventListener("click", () => {
    if (userDropdownMenu) userDropdownMenu.classList.add("hidden");
    if (notiPanel) notiPanel.classList.add("hidden");
  });

  // Theme Toggler (Settings & Top navbar)
  const quickThemeToggle = document.getElementById("quick-theme-toggle");
  if (quickThemeToggle) {
    quickThemeToggle.addEventListener("click", toggleThemeMode);
  }
  
  const themeModeCheckbox = document.getElementById("theme-mode-checkbox");
  if (themeModeCheckbox) {
    themeModeCheckbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        setThemeLight();
      } else {
        setThemeDark();
      }
    });
  }

  function toggleThemeMode() {
    if (document.body.classList.contains("dark-theme")) {
      setThemeLight();
    } else {
      setThemeDark();
    }
  }

  function setThemeLight() {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    window.SustainIQ.state.settings.theme = "light";
    window.SustainIQ.saveState();
  }

  function setThemeDark() {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    window.SustainIQ.state.settings.theme = "dark";
    window.SustainIQ.saveState();
  }

  // Apply visual theme from cache upon startup
  if (window.SustainIQ.state.settings.theme === "light") {
    setThemeLight();
  } else {
    setThemeDark();
  }

  // Toast Close Button
  const toastClose = document.getElementById("toast-close-btn");
  if (toastClose) {
    toastClose.addEventListener("click", () => {
      document.getElementById("achievement-toast").classList.add("hidden");
    });
  }

  // Landing CTA redirects
  const getStartedBtn = document.getElementById("hero-get-started-btn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => {
      document.getElementById("auth-modal").classList.remove("hidden");
    });
  }
  const landingLoginBtn = document.getElementById("landing-login-btn");
  if (landingLoginBtn) {
    landingLoginBtn.addEventListener("click", () => {
      document.getElementById("auth-modal").classList.remove("hidden");
    });
  }
  
  // Modal Close
  const modalClose = document.getElementById("auth-modal-close");
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      document.getElementById("auth-modal").classList.add("hidden");
    });
  }

  // Auth Card Switches
  const toggleRegisterLink = document.getElementById("toggle-register-link");
  const toggleLoginLink2 = document.getElementById("toggle-login-link-2");
  const toggleLoginLink3 = document.getElementById("toggle-login-link-3");
  const toggleForgotLink = document.getElementById("toggle-forgot-link");
  
  const loginView = document.getElementById("auth-view-login");
  const registerView = document.getElementById("auth-view-register");
  const forgotView = document.getElementById("auth-view-forgot");

  if (toggleRegisterLink) {
    toggleRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      loginView.classList.add("hidden");
      registerView.classList.remove("hidden");
    });
  }
  if (toggleLoginLink2) {
    toggleLoginLink2.addEventListener("click", (e) => {
      e.preventDefault();
      registerView.classList.add("hidden");
      loginView.classList.remove("hidden");
    });
  }
  if (toggleLoginLink3) {
    toggleLoginLink3.addEventListener("click", (e) => {
      e.preventDefault();
      forgotView.classList.add("hidden");
      loginView.classList.remove("hidden");
    });
  }
  if (toggleForgotLink) {
    toggleForgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      loginView.classList.add("hidden");
      forgotView.classList.remove("hidden");
    });
  }

  // Bypasses / Demo Logins
  const triggerDemo = () => {
    sessionStorage.setItem("sustainiq_logged_in", "true");
    document.getElementById("auth-modal").classList.add("hidden");
    window.location.hash = "#dashboard";
  };
  
  const landingDemoBtn = document.getElementById("landing-demo-btn");
  if (landingDemoBtn) landingDemoBtn.addEventListener("click", triggerDemo);

  const heroDemoBtn = document.getElementById("hero-demo-btn");
  if (heroDemoBtn) heroDemoBtn.addEventListener("click", triggerDemo);
  
  const loginDemoBtn = document.getElementById("login-demo-btn");
  if (loginDemoBtn) loginDemoBtn.addEventListener("click", triggerDemo);

  // Submit Buttons triggers (simulated auth)
  const loginBtn = document.getElementById("login-submit-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const email = document.getElementById("login-email").value;
      if (email.trim() === "") {
        alert("Please enter email address.");
        return;
      }
      triggerDemo();
    });
  }
  
  const registerBtn = document.getElementById("register-submit-btn");
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      const name = document.getElementById("register-name").value;
      if (name.trim() === "") {
        alert("Please enter display name.");
        return;
      }
      window.SustainIQ.state.user.name = name;
      window.SustainIQ.saveState();
      triggerDemo();
    });
  }

  const forgotBtn = document.getElementById("forgot-submit-btn");
  if (forgotBtn) {
    forgotBtn.addEventListener("click", () => {
      alert("Simulated reset link sent to your email.");
      forgotView.classList.add("hidden");
      loginView.classList.remove("hidden");
    });
  }

  // Logouts
  const logoutAction = () => {
    sessionStorage.removeItem("sustainiq_logged_in");
    window.location.hash = "#landing";
  };
  
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutAction);

  const dropLogout = document.getElementById("dropdown-logout");
  if (dropLogout) dropLogout.addEventListener("click", (e) => {
    e.preventDefault();
    logoutAction();
  });

  // Settings handlers
  const settingsSave = document.getElementById("settings-save-btn");
  if (settingsSave) {
    settingsSave.addEventListener("click", () => {
      const usernameInput = document.getElementById("settings-username-input").value;
      if (usernameInput.trim() !== "") {
        window.SustainIQ.state.user.name = usernameInput;
      }
      
      const units = document.getElementById("settings-units").value;
      window.SustainIQ.state.settings.units = units;
      
      window.SustainIQ.state.settings.notifyChallenge = document.getElementById("pref-challenge-notif").checked;
      window.SustainIQ.state.settings.notifyGoal = document.getElementById("pref-goal-notif").checked;
      window.SustainIQ.state.settings.notifyReport = document.getElementById("pref-weekly-report").checked;
      
      window.SustainIQ.saveState();
      alert("Settings saved successfully.");
    });
  }

  const settingsReset = document.getElementById("settings-reset-btn");
  if (settingsReset) {
    settingsReset.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all data? This will clean local storage state.")) {
        localStorage.removeItem("sustainiq_state");
        sessionStorage.removeItem("sustainiq_logged_in");
        window.location.hash = "#landing";
        window.location.reload();
      }
    });
  }

  // Global search behavior (filters Learning hub articles)
  const globalSearch = document.getElementById("global-search");
  if (globalSearch) {
    globalSearch.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        window.location.hash = "#learning-hub";
        setTimeout(() => {
          const lSearch = document.getElementById("recycling-guide-search");
          if (lSearch) {
            lSearch.value = globalSearch.value;
            // dispatch input event
            lSearch.dispatchEvent(new Event("input"));
          }
        }, 100);
      }
    });
  }
});

// Settings init trigger
window.SustainIQ.settingsInit = function() {
  const settingsNameInput = document.getElementById("settings-username-input");
  if (settingsNameInput) {
    settingsNameInput.value = window.SustainIQ.state.user.name;
  }
};

// 3. Dashboard View Submodule
window.SustainIQ.dashboard = {
  chartInstance: null,
  
  init() {
    const state = window.SustainIQ.state;
    const u = state.user;
    
    // Set quick stats metrics
    document.getElementById("dash-co2-saved").innerText = u.savedCO2 + " kg";
    
    const trees = (u.savedCO2 / 22).toFixed(1);
    document.getElementById("dash-trees-saved").innerText = trees + " Trees";
    
    // Base estimation factors
    const claimedDailies = state.challenges.daily.filter(c => c.claimed).length;
    const claimedWeeklies = state.challenges.weekly.filter(c => c.claimed).length;
    const waterVal = (claimedDailies + claimedWeeklies) * 120 + 200;
    document.getElementById("dash-water-saved").innerText = waterVal.toLocaleString() + " L";
    
    const energyVal = Math.round(u.savedCO2 * 1.15);
    document.getElementById("dash-energy-saved").innerText = energyVal.toLocaleString() + " kWh";
    
    // Set score dial numbers
    document.getElementById("dash-sustain-score").innerText = u.score;
    document.getElementById("dash-annual-footprint").innerText = state.calculator.totalCO2.toFixed(1) + "t/yr";
    document.getElementById("dash-eco-points").innerText = u.points.toLocaleString();
    
    // Calculate and apply SVG score-circle dashoffset
    // stroke-dasharray is 251.2
    const offset = Math.max(0, Math.min(251.2, 251.2 - (251.2 * u.score / 100)));
    document.getElementById("score-meter-circle").style.strokeDashoffset = offset;
    
    // Verbal summary description
    const evalEl = document.getElementById("dash-score-evaluation");
    if (u.score >= 85) {
      evalEl.innerText = "Exceptional! You are in the top 5% of climate advocates.";
      evalEl.className = "score-verdict text-green";
    } else if (u.score >= 70) {
      evalEl.innerText = "Excellent! You are in the top 15% of sustainable users.";
      evalEl.className = "score-verdict text-green";
    } else if (u.score >= 50) {
      evalEl.innerText = "Good progress! Complete more challenges to boost your score.";
      evalEl.className = "score-verdict text-cyan";
    } else {
      evalEl.innerText = "Action required: Complete your footprint calculator log.";
      evalEl.className = "score-verdict text-yellow";
    }
    
    // Render 4 recent activity alerts
    const activityContainer = document.getElementById("dash-activity-list");
    activityContainer.innerHTML = "";
    
    const recents = state.notifications.slice(0, 4);
    if (recents.length === 0) {
      activityContainer.innerHTML = `<li class="activity-item" style="color:var(--text-muted); justify-content:center;">No recent actions logged.</li>`;
    } else {
      recents.forEach(n => {
        const li = document.createElement("li");
        li.className = "activity-item";
        
        let icon = "activity";
        if (n.title.includes("Badge")) icon = "award";
        if (n.title.includes("Calc") || n.title.includes("Assess")) icon = "calculator";
        if (n.title.includes("Goal")) icon = "target";
        if (n.title.includes("Challenge")) icon = "trophy";
        
        li.innerHTML = `
          <div class="activity-left">
            <i data-lucide="${icon}"></i>
            <div class="activity-info">
              <h5>${n.title}</h5>
              <span>${n.text}</span>
            </div>
          </div>
          <span class="activity-savings">${n.date}</span>
        `;
        activityContainer.appendChild(li);
      });
    }
    
    // Render unlocked badges in widgets
    const badgesContainer = document.getElementById("dash-badges-row");
    badgesContainer.innerHTML = "";
    
    const unlocked = state.badges.filter(b => b.unlocked);
    if (unlocked.length === 0) {
      badgesContainer.innerHTML = `<p style="color:var(--text-muted); padding: 12px; width: 100%; text-align: center;">No achievements claimed. Complete calculator to unlock.</p>`;
    } else {
      unlocked.forEach(b => {
        const item = document.createElement("div");
        item.className = "badge-item badge-unlocked";
        item.innerHTML = `
          <div class="badge-icon-wrap">
            ${window.SustainIQ.getBadgeSVG(b.icon)}
          </div>
          <h5>${b.name}</h5>
        `;
        badgesContainer.appendChild(item);
      });
    }
    
    // Draw Weekly consumption Line Chart
    this.renderWeeklyChart();
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },
  
  renderWeeklyChart() {
    const ctx = document.getElementById("weeklyTrendChart").getContext("2d");
    
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    
    const isDark = !document.body.classList.contains("light-theme");
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    
    this.chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Typical Baseline (kg CO2)",
            data: [13.2, 13.2, 13.2, 13.2, 13.2, 13.2, 13.2],
            borderColor: "rgba(239, 68, 68, 0.4)",
            backgroundColor: "transparent",
            borderWidth: 2,
            borderDash: [4, 4],
            tension: 0.1
          },
          {
            label: "Your Emissions (kg CO2)",
            data: [12.4, 11.2, 9.8, 10.4, 7.8, 8.2, 6.9],
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            fill: true,
            borderWidth: 3,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.raw} kg CO2`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: "Inter" } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: "Inter" } },
            min: 0
          }
        }
      }
    });
    
    window.SustainIQ.dashTrendChartInstance = this.chartInstance;
  }
};

// 4. Profile View Submodule
window.SustainIQ.profile = {
  chartInstance: null,
  
  init() {
    const state = window.SustainIQ.state;
    const u = state.user;
    
    // Bind texts
    document.getElementById("profile-display-name").innerText = u.name;
    document.getElementById("profile-level").innerText = `Level ${Math.floor(u.points/400) + 1} Carbon Saver`;
    document.getElementById("profile-points").innerText = u.points.toLocaleString();
    document.getElementById("profile-house-size").innerText = `${state.calculator.energy.household} Members`;
    
    // Capitalize vehicle type for transit label
    const transit = state.calculator.transport.vehicle;
    const transitLabel = transit === "petrol" ? "Petrol Car" :
                         transit === "diesel" ? "Diesel Car" :
                         transit === "hybrid" ? "Hybrid Vehicle" :
                         transit === "ev" ? "Electric EV" : "Public Transit";
    document.getElementById("profile-transit-mode").innerText = transitLabel;
    
    // Taglines
    let tag = "Green Pioneer";
    if (u.score >= 85) tag = "Earth Guardian";
    else if (u.score >= 70) tag = "Sustainability Champion";
    else if (u.score >= 50) tag = "Eco Explorer";
    document.getElementById("profile-tagline").innerText = tag;
    
    // Challenge completion rates computation
    const totalDailies = state.challenges.daily.length;
    const claimedDailies = state.challenges.daily.filter(c => c.claimed).length;
    const dailyPct = totalDailies > 0 ? Math.round((claimedDailies / totalDailies) * 100) : 0;
    
    const totalWeeklies = state.challenges.weekly.length;
    const claimedWeeklies = state.challenges.weekly.filter(c => c.claimed).length;
    const weeklyPct = totalWeeklies > 0 ? Math.round((claimedWeeklies / totalWeeklies) * 100) : 0;
    
    // Update SVG progress dials
    document.getElementById("profile-daily-challenges-txt").innerText = `${dailyPct}%`;
    document.getElementById("profile-weekly-challenges-txt").innerText = `${weeklyPct}%`;
    
    // Dial stroke circumference is approx 100
    document.getElementById("profile-daily-challenges-dial").setAttribute("stroke-dasharray", `${dailyPct}, 100`);
    document.getElementById("profile-weekly-challenges-dial").setAttribute("stroke-dasharray", `${weeklyPct}, 100`);
    
    // Render full list of badges (unlocked and locked)
    const badgesGrid = document.getElementById("profile-badges-grid");
    badgesGrid.innerHTML = "";
    
    state.badges.forEach(b => {
      const item = document.createElement("div");
      item.className = `badge-item ${b.unlocked ? 'badge-unlocked' : 'badge-locked'}`;
      
      item.innerHTML = `
        <div class="badge-icon-wrap">
          ${window.SustainIQ.getBadgeSVG(b.icon)}
        </div>
        <h5>${b.name}</h5>
        <span style="font-size: 10px; color:var(--text-muted); display:block; margin-top:2px;">${b.desc}</span>
      `;
      badgesGrid.appendChild(item);
    });
    
    // Draw Score history Chart
    this.renderHistoryChart();
  },
  
  renderHistoryChart() {
    const ctx = document.getElementById("scoreHistoryChart").getContext("2d");
    
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    
    const state = window.SustainIQ.state;
    const labels = state.history.map(h => h.month);
    const scores = state.history.map(h => h.score);
    const emissions = state.history.map(h => h.emissions);
    
    const isDark = !document.body.classList.contains("light-theme");
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    
    this.chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sustainability Score",
            data: scores,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            yAxisID: "y-score",
            borderWidth: 3,
            tension: 0.3
          },
          {
            label: "Emissions (tons CO2e)",
            data: emissions,
            borderColor: "#06b6d4",
            backgroundColor: "rgba(6, 182, 212, 0.1)",
            yAxisID: "y-emissions",
            borderWidth: 2,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
              font: { family: "Inter", size: 10 }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: "Inter" } }
          },
          "y-score": {
            type: "linear",
            position: "left",
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: "Inter" } },
            title: { display: true, text: "Eco Score", color: textColor }
          },
          "y-emissions": {
            type: "linear",
            position: "right",
            min: 0,
            max: 10,
            grid: { display: false },
            ticks: { color: textColor, font: { family: "Inter" } },
            title: { display: true, text: "CO2e (tons)", color: textColor }
          }
        }
      }
    });
    
    window.SustainIQ.profileChartInstance = this.chartInstance;
  }
};
