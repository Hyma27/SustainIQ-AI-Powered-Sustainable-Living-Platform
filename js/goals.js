/* ==========================================================================
   SustainIQ: Sustainability Goals Module
   ========================================================================== */

(function() {

  window.SustainIQ.goals = {
    
    // Initializer
    init() {
      renderGoalsList();
      setupGoalCreators();
    }
  };

  function renderGoalsList() {
    const list = document.getElementById("active-goals-list");
    const goals = window.SustainIQ.state.goals;

    list.innerHTML = "";

    if (goals.length === 0) {
      list.innerHTML = `<p class="description-text" style="text-align: center; padding: 20px;">No active goals set. Select actions from the Impact Simulator or use the card on the right to set one!</p>`;
      return;
    }

    goals.forEach((g) => {
      const card = document.createElement("div");
      card.className = "goal-item-card";
      
      const pct = Math.min(100, Math.round((g.current / g.target) * 100));
      // SVG circular math
      // circumference = 2 * pi * r = 2 * 3.14159 * 15.9155 = 100
      const strokeDash = `${pct}, 100`;

      // Get icon based on category
      let icon = "target";
      if (g.category === "transport") icon = "car";
      if (g.category === "energy") icon = "zap";
      if (g.category === "food") icon = "utensils";
      if (g.category === "waste") icon = "trash-2";

      card.innerHTML = `
        <div class="goal-item-details" style="display:flex; gap:12px; align-items:center;">
          <div class="card-icon" style="width:36px; height:36px; border-radius:8px; background:rgba(16,185,129,0.1); display:flex; align-items:center; justify-content:center; color:var(--accent-green)">
            <i data-lucide="${icon}"></i>
          </div>
          <div>
            <h4>${g.title}</h4>
            <span>${g.timeframe.toUpperCase()} GOAL • Target: ${g.target} ${g.unit}</span>
          </div>
        </div>
        <div class="goal-progress-box">
          <div class="goal-val-circle-mini">
            <svg viewBox="0 0 36 36">
              <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="circle" stroke-dasharray="${strokeDash}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div class="circle-pct">${pct}%</div>
          </div>
          <button class="btn btn-sm btn-outline log-goal-progress-btn" data-id="${g.id}">+Log</button>
          <button class="btn btn-sm btn-outline text-red delete-goal-btn" data-id="${g.id}" style="border:none; padding:4px 8px;">&times;</button>
        </div>
      `;
      list.appendChild(card);
    });

    bindGoalListActions();
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function bindGoalListActions() {
    // Increment Goal Buttons
    document.querySelectorAll(".log-goal-progress-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        incrementGoalProgress(id);
      });
    });

    // Delete Goal Buttons
    document.querySelectorAll(".delete-goal-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        deleteGoal(id);
      });
    });
  }

  function incrementGoalProgress(id) {
    const goals = window.SustainIQ.state.goals;
    const g = goals.find(goal => goal.id === id);

    if (g) {
      // Determine increment size relative to target scale
      let increment = 1;
      if (g.target >= 100) increment = 10;
      else if (g.target >= 50) increment = 5;

      g.current = Math.min(g.target, g.current + increment);
      
      // Award points slightly for making goal progress
      window.SustainIQ.state.user.points += 10;

      // Log progress activity
      if (g.current === g.target) {
        window.SustainIQ.state.notifications.unshift({
          id: "n_" + Date.now(),
          title: "Goal Completed!",
          text: `Success! You completed the goal: "${g.title}".`,
          date: "Just now"
        });
        window.SustainIQ.state.user.points += 100; // completion bonus
        alert(`Congratulations! Goal "${g.title}" has been completed! Received +100 Eco Points completion bonus.`);
      }

      window.SustainIQ.saveState();
      renderGoalsList();
    }
  }

  function deleteGoal(id) {
    const state = window.SustainIQ.state;
    state.goals = state.goals.filter(g => g.id !== id);
    window.SustainIQ.saveState();
    renderGoalsList();
  }

  function setupGoalCreators() {
    const btn = document.getElementById("create-goal-btn");
    btn.replaceWith(btn.cloneNode(true));
    
    document.getElementById("create-goal-btn").addEventListener("click", () => {
      const title = document.getElementById("goal-title").value.trim();
      const category = document.getElementById("goal-category").value;
      const timeframe = document.getElementById("goal-timeframe").value;
      const target = parseFloat(document.getElementById("goal-target").value) || 0;

      if (title === "") {
        alert("Please specify a goal description.");
        return;
      }
      if (target <= 0) {
        alert("Please set a valid target number.");
        return;
      }

      // Unit suffixes mapping
      let unit = "kg CO2 saved";
      if (category === "transport") unit = "km reduced";
      if (category === "energy") unit = "kWh saved";
      if (category === "food") unit = "vegetarian meals";
      if (category === "waste") unit = "bags recycled";

      const newGoal = {
        id: "g_" + Date.now(),
        title: title,
        category: category,
        timeframe: timeframe,
        target: target,
        current: 0,
        unit: unit
      };

      window.SustainIQ.state.goals.push(newGoal);
      
      window.SustainIQ.state.notifications.unshift({
        id: "n_" + Date.now(),
        title: "New Goal Created",
        text: `Active goal track added: "${title}".`,
        date: "Just now"
      });

      window.SustainIQ.saveState();

      // Reset Inputs
      document.getElementById("goal-title").value = "";
      document.getElementById("goal-target").value = "50";

      renderGoalsList();
      alert(`Successfully added goal: "${title}". Track your progress on the left.`);
    });
  }

})();
