/* ==========================================================================
   SustainIQ: Green Impact Simulator Module
   ========================================================================== */

(function() {
  
  // Specific action values
  const ACTIONS = {
    "electric-car": { co2: 1500, cost: 800, name: "Switch to Electric Vehicle (EV)" },
    "solar-panels": { co2: 1200, cost: 600, name: "Install Solar Panels" },
    "plant-diet": { co2: 800, cost: 300, name: "Adopt Plant-Based Diet" },
    "zero-waste": { co2: 400, cost: 100, name: "Zero Waste & Composting" }
  };

  let chartInstance = null;
  let activeActions = [];

  window.SustainIQ.simulator = {
    
    // Initializer
    init() {
      setupCheckboxListeners();
      this.recalculateSimulator();
    },

    recalculateSimulator() {
      activeActions = [];
      let totalCO2Reduction = 0;
      let totalCostSavings = 0;

      // Scan checked items
      document.querySelectorAll(".sim-checkbox").forEach(chk => {
        const card = chk.closest(".sim-action-card");
        const actionType = card.getAttribute("data-action");
        
        if (chk.checked) {
          activeActions.push(actionType);
          totalCO2Reduction += ACTIONS[actionType].co2;
          totalCostSavings += ACTIONS[actionType].cost;
          card.style.borderColor = "var(--accent-green)";
          card.style.boxShadow = "var(--shadow-neon-green)";
        } else {
          card.style.borderColor = "var(--border-glass)";
          card.style.boxShadow = "none";
        }
      });

      // Update indicators
      document.getElementById("sim-co2-reduction").innerText = `${totalCO2Reduction.toLocaleString()} kg/year`;
      document.getElementById("sim-cost-savings").innerText = `$${totalCostSavings.toLocaleString()}/year`;

      // Enable/Disable Apply button
      const applyBtn = document.getElementById("sim-apply-btn");
      if (activeActions.length > 0) {
        applyBtn.removeAttribute("disabled");
      } else {
        applyBtn.setAttribute("disabled", "true");
      }

      // Calculations relative to current carbon footprint
      const currentFootprint = window.SustainIQ.state.calculator.totalCO2;
      const reductionTons = totalCO2Reduction / 1000;
      const simulatedFootprint = Math.max(0.2, currentFootprint - reductionTons);

      // Render Comparison Chart
      renderComparisonChart(currentFootprint, simulatedFootprint);
    }
  };

  function setupCheckboxListeners() {
    document.querySelectorAll(".sim-checkbox").forEach(chk => {
      chk.replaceWith(chk.cloneNode(true));
    });

    document.querySelectorAll(".sim-checkbox").forEach(chk => {
      chk.addEventListener("change", () => {
        window.SustainIQ.simulator.recalculateSimulator();
      });
    });

    // Handle button action
    const applyBtn = document.getElementById("sim-apply-btn");
    applyBtn.replaceWith(applyBtn.cloneNode(true));
    document.getElementById("sim-apply-btn").addEventListener("click", commitSimulatedGoals);
  }

  function renderComparisonChart(current, simulated) {
    const ctx = document.getElementById("simulatorCompareChart").getContext("2d");

    if (chartInstance) {
      chartInstance.destroy();
    }

    const isDark = !document.body.classList.contains("light-theme");
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Current Footprint", "Simulated Footprint"],
        datasets: [{
          label: "Carbon Output (Tons CO2e/year)",
          data: [current, simulated],
          backgroundColor: [
            "rgba(239, 68, 68, 0.75)",  // red
            "rgba(16, 185, 129, 0.75)"  // green
          ],
          borderColor: [
            "var(--accent-red)",
            "var(--accent-green)"
          ],
          borderWidth: 1.5,
          borderRadius: 8
        }]
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
                return ` ${context.raw.toFixed(2)} tons CO2e/yr`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textColor,
              font: {
                family: "Inter"
              }
            }
          },
          y: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              font: {
                family: "Inter"
              }
            },
            min: 0
          }
        }
      }
    });

    window.SustainIQ.simulatorChartInstance = chartInstance;
  }

  function commitSimulatedGoals() {
    if (activeActions.length === 0) return;

    const appState = window.SustainIQ.state;
    let goalsAddedCount = 0;

    activeActions.forEach(actKey => {
      const act = ACTIONS[actKey];
      
      // Determine sector
      let category = "energy";
      if (actKey === "electric-car") category = "transport";
      if (actKey === "plant-diet") category = "food";
      if (actKey === "zero-waste") category = "waste";

      // Verify goal is not already added
      const exists = appState.goals.some(g => g.title === act.name);
      if (!exists) {
        appState.goals.push({
          id: "g_" + Date.now() + Math.random().toString(36).substr(2, 4),
          title: act.name,
          category: category,
          timeframe: "yearly",
          target: act.co2,
          current: 0,
          unit: "kg CO2 reduced"
        });
        goalsAddedCount++;
      }
    });

    if (goalsAddedCount > 0) {
      appState.notifications.unshift({
        id: "n_" + Date.now(),
        title: "Action Plan Applied",
        text: `Successfully added ${goalsAddedCount} new items to your Sustainability Goals tracker.`,
        date: "Just now"
      });

      // Award Eco points for taking action
      appState.user.points += 50;

      window.SustainIQ.saveState();

      // Trigger achievement popup if they committed actions
      window.SustainIQ.triggerAchievement("carbon-reducer");

      alert(`Awesome! committed ${goalsAddedCount} simulated habits as active goals. Earned +50 Eco Points.`);
      
      // Reset checkboxes
      document.querySelectorAll(".sim-checkbox").forEach(chk => chk.checked = false);
      
      // Redirect to goals tracker
      window.location.hash = "#goals";
    } else {
      alert("All selected actions are already active goals on your checklist.");
    }
  }

})();
