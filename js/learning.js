/* ==========================================================================
   SustainIQ: Sustainability Learning Hub Module
   ========================================================================== */

(function() {

  // Fact database
  const ECO_FACTS = [
    "A single mature tree absorbs approximately 22 kilograms of carbon dioxide per year, helping to offset urban heating emissions.",
    "Up to 40% of food produced in the United States goes uneaten, translating to 135 million tons of greenhouse gas landfill output.",
    "Making paper from recycled materials uses 60% less energy and creates 95% less air pollution than using virgin wood pulp.",
    "Recycling glass reduces related air pollution by 20% and water pollution by 50% compared to creating new glass from raw sand.",
    "Electric vehicles produce up to 3 times fewer lifecycle greenhouse gas emissions than conventional petrol engine cars.",
    "A leaking faucet dripping at one drip per second can waste over 11,000 liters of clean water in a single year."
  ];

  // Recycling database
  const RECYCLE_GUIDE = [
    {
      name: "PETE Plastic (Plastic #1)",
      items: "Water bottles, soda bottles, salad dressing containers",
      instructions: "Rinse thoroughly to remove food residue. You can compress the bottle, but ensure the plastic cap is screwed back on.",
      bin: "Plastic Recycling Bin"
    },
    {
      name: "HDPE Plastic (Plastic #2)",
      items: "Milk jugs, detergent bottles, shampoo dispensers",
      instructions: "Rinse and remove any pump-sprayer tops (they contain metal springs). Standard caps are recyclable if attached.",
      bin: "Plastic Recycling Bin"
    },
    {
      name: "Cardboard & Paperboard",
      items: "Shipping boxes, cereal boxes, cardboard tubing",
      instructions: "Flatten completely to conserve space. Remove any heavy packing tape or bubble wraps. Keep dry; wet cardboard jams mills.",
      bin: "Paper/Cardboard Recycling"
    },
    {
      name: "Aluminum Cans",
      items: "Soda cans, sparkling water cans, food cans",
      instructions: "Rinse clean. Do not crush cans flat (curved cans are easier for mechanical recycling sorting rollers to process).",
      bin: "Metal Recycling Bin"
    },
    {
      name: "Glass Jars & Bottles",
      items: "Beverage glass, condiment jars, pasta sauce containers",
      instructions: "Rinse. Metal lids are recyclable but should be detached and tossed in the metal bin separately. Avoid breaking glass.",
      bin: "Glass Recycling Container"
    },
    {
      name: "Alkaline & Lithium Batteries",
      items: "AA, AAA, 9V, cell phone batteries",
      instructions: "CAUTION: Never place batteries in standard household bins. They present severe fire risks. Drop off at retail collection kiosks.",
      bin: "Designated Battery Drop Station"
    },
    {
      name: "Fluorescent Lightbulbs",
      items: "CFL compact bulbs, long fluorescent tubes",
      instructions: "WARNING: Fluorescents contain mercury vapor. Tape contacts if damaged. Bring to home improvement retailers for recovery.",
      bin: "Hardware Retailer Recycling Station"
    }
  ];

  let factIndex = 0;

  window.SustainIQ.learning = {
    
    // Initializer
    init() {
      setupFactCarousel();
      setupRecycleSearch();
    }
  };

  function setupFactCarousel() {
    renderFact();

    const nextBtn = document.getElementById("next-eco-fact-btn");
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    document.getElementById("next-eco-fact-btn").addEventListener("click", () => {
      factIndex = (factIndex + 1) % ECO_FACTS.length;
      renderFact();
    });
  }

  function renderFact() {
    const textEl = document.getElementById("learning-eco-fact");
    if (textEl) {
      textEl.style.opacity = 0;
      setTimeout(() => {
        textEl.innerText = ECO_FACTS[factIndex];
        textEl.style.opacity = 1;
      }, 200);
    }
  }

  function setupRecycleSearch() {
    const searchField = document.getElementById("recycling-guide-search");
    
    // Initial render all
    renderRecycleList("");

    searchField.replaceWith(searchField.cloneNode(true));
    
    document.getElementById("recycling-guide-search").addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      renderRecycleList(query);
    });
  }

  function renderRecycleList(query) {
    const container = document.getElementById("recycling-guide-results");
    container.innerHTML = "";

    const filtered = RECYCLE_GUIDE.filter(g => {
      return g.name.toLowerCase().includes(query) ||
             g.items.toLowerCase().includes(query) ||
             g.instructions.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="glass-panel" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No materials matching search query found. Try typing 'plastic', 'glass', or 'battery'.</div>`;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement("div");
      card.className = "recycle-result-card glass-panel";
      
      let binColor = "var(--accent-green)";
      if (item.bin.includes("Metal")) binColor = "var(--accent-cyan)";
      if (item.bin.includes("Drop") || item.bin.includes("Station")) binColor = "var(--accent-yellow)";

      card.innerHTML = `
        <h4>
          <span>${item.name}</span>
          <span style="font-size: 10px; color: ${binColor}; border: 1px solid ${binColor}; padding: 2px 6px; border-radius: 4px; font-weight: 700; height: fit-content;">${item.bin}</span>
        </h4>
        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Typical items: ${item.items}</p>
        <p>${item.instructions}</p>
      `;
      container.appendChild(card);
    });
  }

})();
