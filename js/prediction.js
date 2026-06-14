/* ==========================================================================
   SustainIQ: Carbon Emission Prediction & Forecasts
   ========================================================================== */

(function() {

  let chartInstance = null;

  window.SustainIQ.prediction = {
    
    // Initializer
    init() {
      calculateAndRenderForecast();
    }
  };

  function calculateAndRenderForecast() {
    const appState = window.SustainIQ.state;
    const history = appState.history;
    const currentCO2 = appState.calculator.totalCO2;

    // Compile historical variables for prediction logic
    const labels = [];
    const historyData = [];
    
    history.forEach(h => {
      labels.push(h.month);
      historyData.push(h.emissions);
    });

    // Generate upcoming 6 months labels
    const futureMonths = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const forecastLabels = [...labels, ...futureMonths];

    // Forecast Models calculations
    // 1. Business as Usual (BAU): maintains linear projections, potentially fluctuating upwards slightly
    const bauData = [...historyData];
    // 2. SustainIQ Optimized Path: slopes downwards based on target goals completion
    const greenData = [...historyData];

    // Simple Linear Regression extrapolation: emissions = m * x + b
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = historyData.length;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += historyData[i];
      sumXY += i * historyData[i];
      sumXX += i * i;
    }
    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Project forward 6 months
    for (let i = 0; i < 6; i++) {
      const x = n + i;
      const predictedBAU = Math.max(0.5, m * x + b + (Math.sin(i) * 0.1)); // slight variance
      bauData.push(parseFloat(predictedBAU.toFixed(2)));

      // Green Plan assumes a 5% monthly compounding decrease starting from current month
      const previousGreen = greenData[greenData.length - 1];
      const predictedGreen = Math.max(0.4, previousGreen * 0.95);
      greenData.push(parseFloat(predictedGreen.toFixed(2)));
    }

    // Render predictive chart
    renderPredictionChart(forecastLabels, historyData.length, bauData, greenData);

    // Update AI Insights textual overlays
    updateRecommendationContent(m, currentCO2);
  }

  function renderPredictionChart(labels, historyLength, bauData, greenData) {
    const ctx = document.getElementById("predictionForecastChart").getContext("2d");

    if (chartInstance) {
      chartInstance.destroy();
    }

    const isDark = !document.body.classList.contains("light-theme");
    const textColor = isDark ? "#94a3b8" : "#475569";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    // Split datasets to show solid history vs dotted prediction line
    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Business as Usual (Trend)",
            data: bauData,
            borderColor: "rgba(239, 68, 68, 0.8)",
            backgroundColor: "transparent",
            borderWidth: 2,
            borderDash: [5, 5],
            segment: {
              borderDash: ctx => ctx.p1DataIndex < historyLength - 1 ? [] : [5, 5]
            },
            tension: 0.3
          },
          {
            label: "SustainIQ Plan (Tapering)",
            data: greenData,
            borderColor: "rgba(16, 185, 129, 0.8)",
            backgroundColor: "transparent",
            borderWidth: 2,
            segment: {
              borderDash: ctx => ctx.p1DataIndex < historyLength - 1 ? [] : [4, 4]
            },
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
              font: {
                family: "Inter"
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${context.raw} tons CO2e`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: gridColor
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
            title: {
              display: true,
              text: "Emissions (Tons CO2e/year)",
              color: textColor
            }
          }
        }
      }
    });

    window.SustainIQ.predictionChartInstance = chartInstance;
  }

  function updateRecommendationContent(slope, currentCO2) {
    const heading = document.getElementById("predict-summary-heading");
    const summary = document.getElementById("predict-summary-text");
    const recList = document.getElementById("prediction-recommendations-list");
    const statusIcon = document.getElementById("predict-status-icon");

    // Clean old suggestions
    recList.innerHTML = "";

    const isImproving = slope < 0;
    
    if (isImproving) {
      heading.innerText = "Trend Projection: Optimizing";
      heading.className = "text-green";
      statusIcon.className = "text-green";
      statusIcon.setAttribute("data-lucide", "check-circle");
      summary.innerText = `Great work! Your historical footprint gradient is sloping downwards. Your current 4.8t/year carbon rate is projected to shrink to ${Math.max(0.5, currentCO2 * 0.7).toFixed(1)}t by December.`;
    } else {
      heading.innerText = "Trend Projection: Elevating";
      heading.className = "text-yellow";
      statusIcon.className = "text-yellow";
      statusIcon.setAttribute("data-lucide", "alert-triangle");
      summary.innerText = `Warning: Your carbon footprint is projected to hover steady or rise slightly. Your current 4.8t/year carbon rate is projected to climb to ${(currentCO2 * 1.05).toFixed(1)}t by December unless actions are implemented.`;
    }

    // Dynamic recommendations list
    const recommendations = [
      { icon: "zap", txt: "PHANTOM LOADS: Unplugging home chargers can drop utilities emissions by 150kg annually." },
      { icon: "car", txt: "CARPOOLING: Sharing a ride twice a week chops transport carbon output by 400kg/year." },
      { icon: "refresh-cw", txt: "UPCYCLING: Diverting cardboard packaging to compost piles shaves waste bills by $50/year." }
    ];

    recommendations.forEach(r => {
      const item = document.createElement("li");
      item.className = "predicted-action-item";
      item.innerHTML = `
        <i data-lucide="${r.icon}"></i>
        <span>${r.txt}</span>
      `;
      recList.appendChild(item);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

})();
