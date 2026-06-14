/* ==========================================================================
   SustainIQ: Eco Challenges Module
   ========================================================================== */

(function() {

  window.SustainIQ.challenges = {
    
    // Initializer
    init() {
      setupTabTriggers();
      renderChallenges();
    }
  };

  function setupTabTriggers() {
    const tabs = document.querySelectorAll(".challenges-tab-btn");
    
    tabs.forEach(tab => {
      tab.replaceWith(tab.cloneNode(true));
    });

    document.querySelectorAll(".challenges-tab-btn").forEach(tab => {
      tab.addEventListener("click", (e) => {
        const tabTarget = e.currentTarget.getAttribute("data-tab");
        
        document.querySelectorAll(".challenges-tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".challenges-tab-content").forEach(c => c.classList.remove("active"));
        
        e.currentTarget.classList.add("active");
        document.getElementById(`challenges-${tabTarget}-tab`).classList.add("active");
      });
    });
  }

  function renderChallenges() {
    const state = window.SustainIQ.state;
    const dailyContainer = document.getElementById("daily-challenges-container");
    const weeklyContainer = document.getElementById("weekly-challenges-container");

    // Clear previous containers
    dailyContainer.innerHTML = "";
    weeklyContainer.innerHTML = "";

    // Render Dailies
    state.challenges.daily.forEach((ch, idx) => {
      const card = document.createElement("div");
      card.className = "challenge-card glass-panel card-glow-green";
      
      const isComplete = ch.progress >= ch.target;
      const progressPercent = Math.min(100, Math.round((ch.progress / ch.target) * 100));

      card.innerHTML = `
        <div class="challenge-header">
          <h4>${ch.title}</h4>
          <span class="points-badge">+${ch.points} pts</span>
        </div>
        <p>${ch.desc}</p>
        <div class="challenge-progress-bar">
          <div class="challenge-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <div class="challenge-footer">
          <span style="font-size: 12px; color: var(--text-secondary)">Progress: ${ch.progress}/${ch.target}</span>
          ${renderChallengeButton(ch, isComplete)}
        </div>
      `;
      dailyContainer.appendChild(card);
    });

    // Render Weeklies
    state.challenges.weekly.forEach((ch, idx) => {
      const card = document.createElement("div");
      card.className = "challenge-card glass-panel card-glow-cyan";
      
      const isComplete = ch.progress >= ch.target;
      const progressPercent = Math.min(100, Math.round((ch.progress / ch.target) * 100));

      card.innerHTML = `
        <div class="challenge-header">
          <h4>${ch.title}</h4>
          <span class="points-badge">+${ch.points} pts</span>
        </div>
        <p>${ch.desc}</p>
        <div class="challenge-progress-bar">
          <div class="challenge-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <div class="challenge-footer">
          <span style="font-size: 12px; color: var(--text-secondary)">Progress: ${ch.progress}/${ch.target}</span>
          ${renderChallengeButton(ch, isComplete)}
        </div>
      `;
      weeklyContainer.appendChild(card);
    });

    // Bind action events
    bindClaimButtons();
  }

  function renderChallengeButton(ch, isComplete) {
    if (ch.claimed) {
      return `<button class="btn btn-sm btn-claimed" disabled>Claimed</button>`;
    }
    if (isComplete) {
      return `<button class="btn btn-sm btn-primary claim-btn" data-id="${ch.id}">Claim Reward</button>`;
    }
    return `<button class="btn btn-sm btn-outline complete-action-btn" data-id="${ch.id}">Mark Done</button>`;
  }

  function bindClaimButtons() {
    // Complete Action Action Buttons
    document.querySelectorAll(".complete-action-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        completeChallengeAction(id);
      });
    });

    // Claim Points Reward Buttons
    document.querySelectorAll(".claim-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        claimPointsReward(id);
      });
    });
  }

  function completeChallengeAction(id) {
    const state = window.SustainIQ.state;
    let ch = state.challenges.daily.find(c => c.id === id);
    if (!ch) ch = state.challenges.weekly.find(c => c.id === id);
    
    if (ch) {
      ch.progress = ch.target;
      window.SustainIQ.saveState();
      renderChallenges();
      alert(`Completed challenge task: "${ch.title}"! You can now claim your reward points.`);
    }
  }

  function claimPointsReward(id) {
    const state = window.SustainIQ.state;
    let ch = state.challenges.daily.find(c => c.id === id);
    if (!ch) ch = state.challenges.weekly.find(c => c.id === id);
    
    if (ch && !ch.claimed) {
      ch.claimed = true;
      state.user.points += ch.points;
      
      // Update global saved carbon metric slightly (e.g. completing vegetarian day offsets 8kg)
      let offsetKg = 5;
      if (id === "d1") offsetKg = 8; // vegetarian diet
      if (id === "d2") offsetKg = 2; // electric standby
      if (id === "d3") offsetKg = 6; // bike commute
      if (id === "w1") offsetKg = 25; // plastic waste
      if (id === "w2") offsetKg = 15; // composting
      
      state.user.savedCO2 += offsetKg;

      // Log activity
      state.notifications.unshift({
        id: "n_" + Date.now(),
        title: "Challenge Claimed",
        text: `Claimed +${ch.points} Eco Points for completing "${ch.title}".`,
        date: "Just now"
      });

      // Boost score slightly for completed challenges
      state.user.score = Math.min(100, state.user.score + 1);

      window.SustainIQ.saveState();
      
      // Check total claimed count for Milestone badges
      checkChallengeBadges();

      renderChallenges();
      alert(`Claimed +${ch.points} Eco Points! Environment saved by another ${offsetKg}kg. Dashboard updated.`);
    }
  }

  function checkChallengeBadges() {
    const state = window.SustainIQ.state;
    const allChallenges = [...state.challenges.daily, ...state.challenges.weekly];
    const claimedCount = allChallenges.filter(c => c.claimed).length;

    // Milestone Badge: Earth Guardian (e.g. if claimed count >= 3)
    if (claimedCount >= 3) {
      window.SustainIQ.triggerAchievement("earth-guardian");
    }
  }

})();
