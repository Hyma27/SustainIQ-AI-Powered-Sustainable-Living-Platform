/* ==========================================================================
   SustainIQ: Reports & Analytics Module
   ========================================================================== */

(function() {

  // Inject print styles dynamically on startup to optimize physical page layouts
  const printStyles = document.createElement("style");
  printStyles.innerHTML = `
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
      }
      .bg-glows, .sidebar, .top-navbar, .reports-control-card, .app-footer, .achievement-toast {
        display: none !important;
      }
      .app-shell {
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .main-content {
        padding: 0 !important;
      }
      .content-body {
        padding: 0 !important;
      }
      .page-title-container {
        display: none !important;
      }
      #printable-report-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100% !important;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        color: #000000 !important;
      }
      .report-header-banner {
        border-bottom: 2px solid #333333 !important;
      }
      .report-logo span, .report-date {
        color: #000000 !important;
      }
      .rep-metric {
        background: #f1f5f9 !important;
        border: 1px solid #cbd5e1 !important;
        color: #000000 !important;
      }
      .rep-metric h3, .rep-metric .lbl {
        color: #000000 !important;
      }
      .report-table th {
        border-bottom: 2px solid #333333 !important;
        color: #333333 !important;
      }
      .report-table td {
        border-bottom: 1px solid #e2e8f0 !important;
        color: #000000 !important;
      }
      .report-highlights-list li {
        color: #333333 !important;
      }
    }
  `;
  document.head.appendChild(printStyles);

  window.SustainIQ.reports = {
    
    // Initializer
    init() {
      generateReportData();
      setupReportButtons();
    }
  };

  function generateReportData() {
    const appState = window.SustainIQ.state;
    const calc = appState.calculator;
    const user = appState.user;

    // Set user metadata details
    document.getElementById("rep-info-username").innerText = user.name;
    document.getElementById("report-generated-date").innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Set footprint values
    const totalCO2 = calc.totalCO2;
    document.getElementById("rep-total-footprint").innerText = `${totalCO2.toFixed(1)} t/yr`;

    // Compute grades based on Eco Score
    const score = user.score;
    let grade = "C";
    if (score >= 90) grade = "A+";
    else if (score >= 80) grade = "A";
    else if (score >= 70) grade = "A-";
    else if (score >= 55) grade = "B+";
    else if (score >= 40) grade = "B";
    
    const gradeEl = document.getElementById("rep-total-grade");
    gradeEl.innerText = grade;
    
    // Color grade indicators
    gradeEl.className = "";
    if (grade.startsWith("A")) gradeEl.className = "text-green";
    else if (grade.startsWith("B")) gradeEl.className = "text-cyan";
    else gradeEl.className = "text-yellow";

    // Goals completed stats
    const totalGoalsCount = appState.goals.length;
    const completedGoalsCount = appState.goals.filter(g => g.current >= g.target).length;
    const goalPercent = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;
    document.getElementById("rep-goals-complete").innerText = `${goalPercent}%`;

    // Math outputs breakdown values
    // Assume average categories allocations from calculator logic
    const transportCO2 = calc.transport.flights * 90 / 1000 + calc.transport.transit * 52 * 0.05 / 1000 + (calc.transport.vehicle !== 'none' ? calc.transport.km * 52 * 0.18 / 1000 : 0);
    // Let's deduce actual metrics from calculator variables
    const energyCO2 = calc.energy.electricity * 12 * (1 - calc.energy.greenShare/100) * 0.42 / 1000 / calc.energy.household;
    const foodCO2 = (calc.food.diet === 'vegan' ? 0.5 : calc.food.diet === 'vegetarian' ? 0.8 : 1.8);
    const wasteCO2 = calc.waste.bags * 1.5 * 52 / 1000 * (calc.waste.recycling === 'high' ? 0.5 : 0.8);

    const categories = [
      { name: "Transportation Sector", value: transportCO2, target: 1.5, desc: "Flights, daily private driving, transit" },
      { name: "Household Energy", value: energyCO2, target: 1.2, desc: "Electricity grid load division" },
      { name: "Diet & Food Waste", value: foodCO2, target: 1.0, desc: "Livestock methane & kitchen disposal" },
      { name: "Waste Management", value: wasteCO2, target: 0.5, desc: "Landfill trash bag dumps" }
    ];

    // Compute sum elements again to balance rounding variances
    let sumVal = categories.reduce((s, c) => s + c.value, 0);
    if (sumVal <= 0) sumVal = 1; // prevent zero division

    // Render table rows
    const tbody = document.getElementById("report-emissions-rows");
    tbody.innerHTML = "";

    categories.forEach(c => {
      const tr = document.createElement("tr");
      const pct = Math.round((c.value / sumVal) * 100);
      
      let status = "Compliant";
      let statusColor = "text-green";
      if (c.value > c.target * 1.2) {
        status = "Excessive";
        statusColor = "text-red";
      } else if (c.value > c.target) {
        status = "Moderate";
        statusColor = "text-yellow";
      }

      tr.innerHTML = `
        <td><strong>${c.name}</strong><br><span style="font-size:11px; color:var(--text-muted)">${c.desc}</span></td>
        <td>${c.value.toFixed(2)} tons CO2/yr</td>
        <td>${pct}%</td>
        <td><span class="${statusColor}" style="font-weight:600">${status}</span></td>
      `;
      tbody.appendChild(tr);
    });

    // Render achievements highlights list
    const highlights = document.getElementById("report-achievements-list");
    highlights.innerHTML = "";

    const unlockedBadges = appState.badges.filter(b => b.unlocked);
    if (unlockedBadges.length === 0) {
      highlights.innerHTML = `<li>No badges unlocked yet. Start completing eco-challenges.</li>`;
    } else {
      unlockedBadges.forEach(b => {
        const li = document.createElement("li");
        li.innerText = `Badge Claimed: '${b.name}' - ${b.desc}`;
        highlights.appendChild(li);
      });
    }

    // Append goals achievement details to highlights
    if (completedGoalsCount > 0) {
      const goalLi = document.createElement("li");
      goalLi.innerHTML = `Completed ${completedGoalsCount} of ${totalGoalsCount} custom sustainability targets in active periods.`;
      highlights.appendChild(goalLi);
    }
  }

  function setupReportButtons() {
    // Print button
    const printBtn = document.getElementById("print-report-btn");
    printBtn.replaceWith(printBtn.cloneNode(true));
    document.getElementById("print-report-btn").addEventListener("click", () => {
      window.print();
    });

    // CSV button
    const csvBtn = document.getElementById("download-csv-btn");
    csvBtn.replaceWith(csvBtn.cloneNode(true));
    document.getElementById("download-csv-btn").addEventListener("click", downloadReportCSV);
  }

  function downloadReportCSV() {
    const appState = window.SustainIQ.state;
    const calc = appState.calculator;
    
    // Compile CSV headers
    let csvContent = "SustainIQ Carbon Statement Report\n";
    csvContent += `Generated Date,${new Date().toLocaleDateString()}\n`;
    csvContent += `User,${appState.user.name}\n`;
    csvContent += `Eco Points Balance,${appState.user.points}\n`;
    csvContent += `Sustain Score,${appState.user.score}\n\n`;
    
    csvContent += "Emission Category,Annual Contribution (Tons CO2e),Unit Variables\n";
    csvContent += `Transport,${calc.totalCO2 * 0.4},Vehicle type: ${calc.transport.vehicle} km: ${calc.transport.km}\n`;
    csvContent += `Household Energy,${calc.totalCO2 * 0.3}, electricity: ${calc.energy.electricity} clean share: ${calc.energy.greenShare}%\n`;
    csvContent += `Diet,${calc.totalCO2 * 0.25},Diet profile: ${calc.food.diet}\n`;
    csvContent += `Waste,${calc.totalCO2 * 0.05},Trash bags: ${calc.waste.bags} Recycling: ${calc.waste.recycling}\n`;
    csvContent += `Total Annual Emissions,${calc.totalCO2.toFixed(2)},Tons CO2e per year\n`;

    // Trigger CSV blob download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SustainIQ_Carbon_Report_${appState.user.name.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

})();
