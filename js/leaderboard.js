/* ==========================================================================
   SustainIQ: Leaderboard & Community Impact Module
   ========================================================================== */

(function() {

  // Standing Mock user database
  const MOCK_LEADERS = [
    { name: "EcoSage_Sarah", score: 99, badges: 5, points: 3450, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EcoSage" },
    { name: "GreenGladiator", score: 92, badges: 4, points: 2800, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Gladiator" },
    { name: "PlanetSaver_Max", score: 84, badges: 3, points: 2150, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=PlanetSaver" },
    { name: "CarbonCutter", score: 78, badges: 3, points: 1680, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CarbonCutter" },
    { name: "EcoJoe", score: 65, badges: 2, points: 980, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EcoJoe" }
  ];

  let activeRange = "global";

  window.SustainIQ.leaderboard = {
    
    // Initializer
    init() {
      setupLeaderboardTabs();
      renderLeaderboard();
      updateCommunityImpactCounters();
    }
  };

  function setupLeaderboardTabs() {
    const tabs = document.querySelectorAll(".leaderboard-table-card .tab-btn");
    
    tabs.forEach(tab => {
      tab.replaceWith(tab.cloneNode(true));
    });

    document.querySelectorAll(".leaderboard-table-card .tab-btn").forEach(tab => {
      tab.addEventListener("click", (e) => {
        activeRange = e.currentTarget.getAttribute("data-range");
        
        document.querySelectorAll(".leaderboard-table-card .tab-btn").forEach(b => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        
        renderLeaderboard();
      });
    });
  }

  function renderLeaderboard() {
    const container = document.getElementById("leaderboard-entries");
    const appState = window.SustainIQ.state;
    const user = appState.user;

    container.innerHTML = "";

    // Synthesize full list incorporating active user
    const userBadgesCount = appState.badges.filter(b => b.unlocked).length;
    
    // Active User Object inside array
    const activeUserStanding = {
      name: user.name + " (You)",
      score: user.score,
      badges: userBadgesCount,
      points: user.points,
      avatar: user.avatar,
      isCurrentUser: true
    };

    // Construct array of leaders
    let standings = [...MOCK_LEADERS];
    
    // Weekly filter shifts mock numbers slightly to simulate real rotation
    if (activeRange === "weekly") {
      standings = standings.map(s => ({
        ...s,
        points: Math.round(s.points * 0.35)
      }));
      // scale user points down to weekly estimated portion
      standings.push({
        ...activeUserStanding,
        points: Math.round(user.points * 0.4)
      });
    } else {
      standings.push(activeUserStanding);
    }

    // Sort by points descending
    standings.sort((a, b) => b.points - a.points);

    // Render elements
    standings.forEach((item, index) => {
      const tr = document.createElement("tr");
      if (item.isCurrentUser) {
        tr.style.background = "rgba(16, 185, 129, 0.08)";
        tr.style.borderLeft = "3px solid var(--accent-green)";
      }
      
      const rank = index + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : "";

      tr.innerHTML = `
        <td><span class="rank-number ${rankClass}">${rank}</span></td>
        <td>
          <div class="leaderboard-user">
            <img src="${item.avatar}" alt="Avatar" class="leaderboard-avatar">
            <span style="font-weight: ${item.isCurrentUser ? '700' : '500'}">${item.name}</span>
          </div>
        </td>
        <td>${item.score}</td>
        <td>${item.badges} Badges</td>
        <td><span class="leaderboard-points text-green">${item.points.toLocaleString()} pts</span></td>
      `;
      container.appendChild(tr);
    });
  }

  function updateCommunityImpactCounters() {
    const appState = window.SustainIQ.state;
    const user = appState.user;

    // Baseline platform-wide constants
    const BASE_CO2 = 1425820;
    const BASE_CHALLENGES = 42850;
    const BASE_TREES = 64810;
    const BASE_WATER = 980450;

    // Calculate user additions
    const totalCO2Claimed = BASE_CO2 + user.savedCO2;
    
    // Calculate claimed challenges count
    const claimedDailies = appState.challenges.daily.filter(c => c.claimed).length;
    const claimedWeeklies = appState.challenges.weekly.filter(c => c.claimed).length;
    const claimedTotal = BASE_CHALLENGES + claimedDailies + claimedWeeklies;

    // Trees equivalents (approx 22kg per tree absorption annually)
    // user's saved carbon translates to tree offsets
    const userTrees = parseFloat((user.savedCO2 / 22).toFixed(1));
    const totalTrees = Math.round(BASE_TREES + userTrees);

    // Water saved calculations (liters)
    // Assume each claimed composting or eco challenge saves water
    const userWaterSaved = (claimedDailies + claimedWeeklies) * 120 + 200; // estimated water saved
    const totalWater = BASE_WATER + userWaterSaved;

    // Render values
    document.getElementById("community-co2-total").innerText = `${totalCO2Claimed.toLocaleString()} kg`;
    document.getElementById("community-challenges-total").innerText = claimedTotal.toLocaleString();
    document.getElementById("community-trees-total").innerText = totalTrees.toLocaleString();
    document.getElementById("community-water-total").innerText = `${totalWater.toLocaleString()} L`;
  }

})();
