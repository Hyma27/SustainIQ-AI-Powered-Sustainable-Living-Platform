/* ==========================================================================
   SustainIQ: Carbon Calculator Module
   ========================================================================== */

(function() {
  
  // Emission constants (kg CO2e per unit)
  const CO2_FACTORS = {
    // Transport (kg/km)
    petrol: 0.18,
    diesel: 0.17,
    hybrid: 0.10,
    ev: 0.04,
    publicTransit: 0.05, // kg per hour
    flightHour: 90.0, // kg per hour
    
    // Grid electricity (kg/kWh)
    gridElectricity: 0.42, 
    
    // Food (annual tons per diet)
    diets: {
      "heavy-meat": 2.5,
      "average-meat": 1.8,
      "low-meat": 1.2,
      "vegetarian": 0.8,
      "vegan": 0.5
    },
    foodWasteMultiplier: {
      minimal: 1.0,
      average: 1.15,
      high: 1.30
    },
    
    // Waste (annual tons per bag/recycling rate)
    wasteBagWeekly: 1.5 * 52 / 1000, // tons per bag/year
    recyclingDiscounts: {
      none: 1.0,
      partial: 0.8,
      high: 0.5
    }
  };

  let currentStep = 1;
  let chartInstance = null;

  // Primary calculator entrypoint
  window.SustainIQ.calculatorInit = function() {
    setupFormListeners();
    loadCalculatorInputs();
    calculateFootprint();
  };

  // Pre-populate calculator inputs with existing state
  function loadCalculatorInputs() {
    const calcState = window.SustainIQ.state.calculator;
    
    // Transport
    document.getElementById("calc-vehicle-type").value = calcState.transport.vehicle;
    document.getElementById("calc-car-km").value = calcState.transport.km;
    document.getElementById("calc-flights").value = calcState.transport.flights;
    document.getElementById("calc-public-transit").value = calcState.transport.transit;
    
    // Energy
    document.getElementById("calc-electricity-kwh").value = calcState.energy.electricity;
    document.getElementById("calc-green-energy").value = calcState.energy.greenShare;
    document.getElementById("calc-green-energy").nextElementSibling.value = calcState.energy.greenShare + "%";
    document.getElementById("calc-household-size").value = calcState.energy.household;
    
    // Food
    document.getElementById("calc-diet").value = calcState.food.diet;
    document.getElementById("calc-food-waste").value = calcState.food.waste;
    
    // Waste
    document.getElementById("calc-waste-bags").value = calcState.waste.bags;
    document.getElementById("calc-recycling").value = calcState.waste.recycling;

    // Reset stepper
    currentStep = 1;
    showStep(currentStep);
  }

  // Multi-step tab triggers
  function showStep(stepNum) {
    document.querySelectorAll(".calc-step").forEach(step => step.classList.remove("active"));
    document.querySelectorAll(".calc-tab").forEach(tab => tab.classList.remove("active"));
    
    document.getElementById(`calc-step-${stepNum}`).classList.add("active");
    document.querySelector(`.calc-tab[data-step="${stepNum}"]`).classList.add("active");
    
    // Navigation visibility
    const prevBtn = document.getElementById("calc-prev-btn");
    const nextBtn = document.getElementById("calc-next-btn");
    
    if (stepNum === 1) {
      prevBtn.style.visibility = "hidden";
    } else {
      prevBtn.style.visibility = "visible";
    }
    
    if (stepNum === 4) {
      nextBtn.innerText = "Calculate Details";
    } else {
      nextBtn.innerText = "Next Step";
    }
  }

  // Register form triggers
  function setupFormListeners() {
    // Steppers buttons
    const nextBtn = document.getElementById("calc-next-btn");
    const prevBtn = document.getElementById("calc-prev-btn");
    
    // Remove old listeners to prevent stacking
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    
    document.getElementById("calc-next-btn").addEventListener("click", () => {
      if (currentStep < 4) {
        currentStep++;
        showStep(currentStep);
      } else {
        calculateFootprint();
        alert("Live Footprint breakdown generated! Review charts on the right.");
      }
    });

    document.getElementById("calc-prev-btn").addEventListener("click", () => {
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
    });

    // Handle tab clicks directly
    document.querySelectorAll(".calc-tab").forEach(tab => {
      tab.replaceWith(tab.cloneNode(true));
    });
    
    document.querySelectorAll(".calc-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        currentStep = parseInt(e.currentTarget.getAttribute("data-step"));
        showStep(currentStep);
      });
    });

    // Real-time input updates recalculations
    const inputs = [
      "calc-vehicle-type", "calc-car-km", "calc-flights", "calc-public-transit",
      "calc-electricity-kwh", "calc-green-energy", "calc-household-size",
      "calc-diet", "calc-food-waste", "calc-waste-bags", "calc-recycling"
    ];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", calculateFootprint);
        el.addEventListener("change", calculateFootprint);
      }
    });

    // Save Assessment Button
    const saveBtn = document.getElementById("calc-save-btn");
    saveBtn.replaceWith(saveBtn.cloneNode(true));
    document.getElementById("calc-save-btn").addEventListener("click", saveCalculatorResults);
  }

  // Primary math engine
  function calculateFootprint() {
    // Retrieve Transportation values
    const vehicle = document.getElementById("calc-vehicle-type").value;
    const km = parseFloat(document.getElementById("calc-car-km").value) || 0;
    const flights = parseFloat(document.getElementById("calc-flights").value) || 0;
    const transit = parseFloat(document.getElementById("calc-public-transit").value) || 0;

    // Transport CO2 (tons per year)
    let transportCO2 = 0;
    if (vehicle !== "none") {
      transportCO2 += (km * 52 * CO2_FACTORS[vehicle]) / 1000;
    }
    transportCO2 += (transit * 52 * CO2_FACTORS.publicTransit) / 1000;
    transportCO2 += (flights * CO2_FACTORS.flightHour) / 1000;

    // Retrieve Electricity values
    const electricity = parseFloat(document.getElementById("calc-electricity-kwh").value) || 0;
    const cleanPct = parseFloat(document.getElementById("calc-green-energy").value) || 0;
    const houseMembers = parseFloat(document.getElementById("calc-household-size").value) || 1;

    // Energy CO2 (tons per year, divided by household size)
    const annualKwh = electricity * 12;
    const dirtyKwh = annualKwh * (1 - cleanPct / 100);
    const energyCO2 = (dirtyKwh * CO2_FACTORS.gridElectricity) / 1000 / houseMembers;

    // Retrieve Food values
    const dietType = document.getElementById("calc-diet").value;
    const foodWaste = document.getElementById("calc-food-waste").value;

    // Food CO2 (tons per year)
    const baseDiet = CO2_FACTORS.diets[dietType] || 1.8;
    const foodMultiplier = CO2_FACTORS.foodWasteMultiplier[foodWaste] || 1.0;
    const foodCO2 = baseDiet * foodMultiplier;

    // Retrieve Waste values
    const wasteBags = parseFloat(document.getElementById("calc-waste-bags").value) || 0;
    const recyclingType = document.getElementById("calc-recycling").value;

    // Waste CO2 (tons per year)
    const baseWaste = wasteBags * CO2_FACTORS.wasteBagWeekly;
    const wasteDiscount = CO2_FACTORS.recyclingDiscounts[recyclingType] || 1.0;
    const wasteCO2 = baseWaste * wasteDiscount;

    // Sum total tons
    const totalTons = transportCO2 + energyCO2 + foodCO2 + wasteCO2;
    
    // Update live indicators
    document.getElementById("calc-live-total").innerText = totalTons.toFixed(1);

    // Re-draw Donut breakdown chart
    renderCalculatorChart(
      transportCO2.toFixed(2),
      energyCO2.toFixed(2),
      foodCO2.toFixed(2),
      wasteCO2.toFixed(2)
    );
    
    return {
      transport: parseFloat(transportCO2.toFixed(2)),
      energy: parseFloat(energyCO2.toFixed(2)),
      food: parseFloat(foodCO2.toFixed(2)),
      waste: parseFloat(wasteCO2.toFixed(2)),
      total: parseFloat(totalTons.toFixed(2))
    };
  }

  // Renders the donut breakdown chart
  function renderCalculatorChart(tVal, eVal, fVal, wVal) {
    const ctx = document.getElementById("calcBreakdownChart").getContext("2d");
    
    // Destroy previous Chart instance
    if (chartInstance) {
      chartInstance.destroy();
    }

    const isDark = !document.body.classList.contains("light-theme");
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    chartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Transport", "Household Energy", "Diet/Nutrition", "Waste & Trash"],
        datasets: [{
          data: [tVal, eVal, fVal, wVal],
          backgroundColor: [
            "#10b981", // green
            "#06b6d4", // cyan
            "#f59e0b", // yellow
            "#ef4444"  // red
          ],
          borderColor: isDark ? "#0d1512" : "#ffffff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor,
              font: {
                family: "Inter",
                size: 11
              },
              padding: 12
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.raw} tons CO2e/yr`;
              }
            }
          }
        },
        cutout: "70%"
      }
    });

    // Cache the instance globally for destruction cleanup
    window.SustainIQ.calcBreakdownChartInstance = chartInstance;
  }

  // Writes calculated values to global state database
  function saveCalculatorResults() {
    const res = calculateFootprint();
    const appState = window.SustainIQ.state;

    // Cache inputs inside state
    appState.calculator.transport.vehicle = document.getElementById("calc-vehicle-type").value;
    appState.calculator.transport.km = parseFloat(document.getElementById("calc-car-km").value) || 0;
    appState.calculator.transport.flights = parseFloat(document.getElementById("calc-flights").value) || 0;
    appState.calculator.transport.transit = parseFloat(document.getElementById("calc-public-transit").value) || 0;

    appState.calculator.energy.electricity = parseFloat(document.getElementById("calc-electricity-kwh").value) || 0;
    appState.calculator.energy.greenShare = parseFloat(document.getElementById("calc-green-energy").value) || 0;
    appState.calculator.energy.household = parseFloat(document.getElementById("calc-household-size").value) || 1;

    appState.calculator.food.diet = document.getElementById("calc-diet").value;
    appState.calculator.food.waste = document.getElementById("calc-food-waste").value;

    appState.calculator.waste.bags = parseFloat(document.getElementById("calc-waste-bags").value) || 0;
    appState.calculator.waste.recycling = document.getElementById("calc-recycling").value;

    appState.calculator.totalCO2 = res.total;

    // Update user score relative to emissions
    // Less emission -> higher score. Baseline average is ~5.0 tons.
    // Let's create a dynamic calculation: score = Math.max(10, Math.min(100, Math.round(100 - (res.total * 6))))
    // e.g. 4.8 tons -> 100 - 28.8 = 71 points
    const calculatedScore = Math.max(10, Math.min(100, Math.round(100 - (res.total * 6))));
    appState.user.score = calculatedScore;

    // Update user rank category
    if (calculatedScore >= 85) appState.user.rank = "Earth Guardian";
    else if (calculatedScore >= 70) appState.user.rank = "Sustainability Champion";
    else if (calculatedScore >= 50) appState.user.rank = "Eco Explorer";
    else appState.user.rank = "Green Beginner";

    // Set savings tracker (monthly kg saved)
    // baseline typical carbon is ~6.0 tons. If we are below that, count the savings
    const baseTons = 6.0;
    const savingsKg = Math.max(0, Math.round((baseTons - res.total) * 1000 / 12));
    appState.user.savedCO2 = savingsKg;

    // Append to score history database
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const matchIndex = appState.history.findIndex(h => h.month === currentMonth);
    if (matchIndex !== -1) {
      appState.history[matchIndex].score = calculatedScore;
      appState.history[matchIndex].emissions = res.total;
    } else {
      appState.history.push({ month: currentMonth, score: calculatedScore, emissions: res.total });
      if (appState.history.length > 6) appState.history.shift();
    }

    // Add activity log
    appState.notifications.unshift({
      id: "n_" + Date.now(),
      title: "Assessment Saved",
      text: `Your carbon footprint is registered at ${res.total} tons CO2e/year. Score: ${calculatedScore}.`,
      date: "Just now"
    });

    window.SustainIQ.saveState();
    
    // Check Achievement unlocks
    window.SustainIQ.triggerAchievement("green-beginner");
    if (calculatedScore >= 75) {
      window.SustainIQ.triggerAchievement("sustainability-champion");
    }

    alert("Footprint assessment successfully registered! Dashboard stats updated.");
    
    // Redirect user to dashboard
    window.location.hash = "#dashboard";
  }

})();
