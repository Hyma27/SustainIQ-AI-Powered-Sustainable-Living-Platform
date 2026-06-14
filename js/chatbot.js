/* ==========================================================================
   SustainIQ: AI Sustainability Assistant (SustainAI)
   ========================================================================== */

(function() {

  // Daily eco tips database
  const DAILY_TIPS = [
    "Switching your home lightbulb fixtures to LEDs uses up to 85% less energy and lasts 25 times longer than incandescent bulbs.",
    "Composting food scraps keeps them out of landfills, where they decay anaerobically and produce methane, a greenhouse gas 28x more potent than CO2.",
    "Phantom Loads: Electronics in standby mode account for roughly 10% of household electricity bills. Route entertainment hubs to smart power strips.",
    "Inflating car tires to their recommended PSI improves fuel mileage by up to 3% while extending tire tread lifespans.",
    "Eating vegetarian or vegan just one day a week saves roughly 3,000 liters of water and offsets 8kg of CO2 equivalent emissions.",
    "A typical shower runs at 9.5 liters of water per minute. Shortening shower times by just 2 minutes saves up to 7,000 liters annually.",
    "Heating wash loads in cold water instead of hot saves up to 90% of the energy consumed by typical household washing machine cycles.",
    "Recycling one single aluminum can saves enough energy to power a computer or TV screen for approximately three hours."
  ];

  // Pre-programmed Q&A pairs based on user query keywords
  const CHAT_RESPONSES = {
    transport: "Transportation accounts for 27% of global greenhouse emissions. You can optimize this by mapping shorter commutes, switching to hybrids or EVs, taking public transit, or consolidating flight schedules. Try testing these out in the <strong>Green Impact Simulator</strong> page!",
    energy: "Household energy efficiency starts with minor shifts: configure smart thermostats to 20°C in winter / 25°C in summer, convert to LEDs, and unplug standby charges (phantom load). If you own your property, installing <strong>solar arrays</strong> can cut annual home emissions by up to 1.2 tons.",
    diet: "A plant-based vegan or vegetarian diet is one of the most effective personal actions to offset greenhouse gases. Livestock farming is highly resource-intensive and generates high methane volumes. Try replacing beef or dairy with beans, grains, and nuts.",
    waste: "Zero-waste lifestyles emphasize composting organic materials, rinsing plastic containers prior to recycling, and buying products in bulk to eliminate packaging. Check out our <strong>Learning Hub Guide Finder</strong> for sorting instructions!",
    goal: "SustainIQ allows you to set custom monthly and yearly goals for carbon savings. You can also commit simulated habits directly from the <strong>Impact Simulator</strong> to your active checklist.",
    challenge: "Completing daily and weekly challenges boosts your Eco Points! When you finish tasks like 'Unplug Idle Devices' or 'No Meat Today', claim your points on the <strong>Challenges</strong> tab to unlock badges."
  };

  let tipIndex = 0;

  window.SustainIQ.chatbot = {
    
    // Initializer
    init() {
      setupTipCarousel();
      setupChatInterface();
    }
  };

  function setupTipCarousel() {
    renderTip();
    
    const nextBtn = document.getElementById("btn-next-tip");
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    document.getElementById("btn-next-tip").addEventListener("click", () => {
      tipIndex = (tipIndex + 1) % DAILY_TIPS.length;
      renderTip();
    });
  }

  function renderTip() {
    const container = document.getElementById("daily-tip-container");
    container.style.opacity = 0;
    setTimeout(() => {
      container.innerText = DAILY_TIPS[tipIndex];
      container.style.opacity = 1;
    }, 200);
  }

  function setupChatInterface() {
    const messagesBox = document.getElementById("chat-messages");
    
    // Pre-populate with initial bot greeting if empty
    if (messagesBox.children.length === 0) {
      appendChatBubble("bot", "Hello! I am SustainAI, your personal eco coach. Ask me anything about carbon reduction, composting, energy saving, or how to get the most out of the SustainIQ platform!");
    }

    // Input handlers
    const sendBtn = document.getElementById("chat-send-btn");
    const inputField = document.getElementById("chat-input-field");
    
    sendBtn.replaceWith(sendBtn.cloneNode(true));
    document.getElementById("chat-send-btn").addEventListener("click", handleUserMessage);
    
    inputField.replaceWith(inputField.cloneNode(true));
    document.getElementById("chat-input-field").addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleUserMessage();
    });

    // Quick prompt buttons
    document.querySelectorAll(".quick-prompt-btn").forEach(btn => {
      btn.replaceWith(btn.cloneNode(true));
    });
    
    document.querySelectorAll(".quick-prompt-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const query = e.currentTarget.getAttribute("data-query");
        document.getElementById("chat-input-field").value = query;
        handleUserMessage();
      });
    });
  }

  function handleUserMessage() {
    const inputField = document.getElementById("chat-input-field");
    const query = inputField.value.trim();
    if (query === "") return;

    // Append user message
    appendChatBubble("user", query);
    inputField.value = "";

    // Show simulated bot typing
    const typingBubble = appendChatBubble("bot", "<span class='animated-pulse'>SustainAI is thinking...</span>");
    
    // Parse keywords and reply after short delay
    setTimeout(() => {
      typingBubble.remove();
      const botResponse = generateBotResponse(query);
      appendChatBubble("bot", botResponse);
    }, 1200);
  }

  function appendChatBubble(sender, text) {
    const container = document.getElementById("chat-messages");
    const bubble = document.createElement("div");
    
    bubble.className = `chat-bubble bubble-${sender}`;
    
    const avatarSeed = sender === "bot" ? "SustainAIBot" : "SustainIQUser";
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

    bubble.innerHTML = `
      <img src="${avatarUrl}" alt="Avatar" class="bubble-avatar">
      <div class="bubble-content">
        <p>${text}</p>
      </div>
    `;

    container.appendChild(bubble);
    
    // Auto scroll chat to bottom
    container.scrollTop = container.scrollHeight;
    
    return bubble;
  }

  function generateBotResponse(query) {
    const text = query.toLowerCase();
    
    if (text.includes("car") || text.includes("vehicle") || text.includes("electric") || text.includes("transit") || text.includes("flight") || text.includes("travel")) {
      return CHAT_RESPONSES.transport;
    }
    if (text.includes("solar") || text.includes("electricity") || text.includes("energy") || text.includes("power") || text.includes("bulb") || text.includes("thermostat")) {
      return CHAT_RESPONSES.energy;
    }
    if (text.includes("diet") || text.includes("food") || text.includes("meat") || text.includes("vegetarian") || text.includes("vegan") || text.includes("meal")) {
      return CHAT_RESPONSES.diet;
    }
    if (text.includes("compost") || text.includes("waste") || text.includes("recycle") || text.includes("trash") || text.includes("plastic")) {
      return CHAT_RESPONSES.waste;
    }
    if (text.includes("goal") || text.includes("milestone") || text.includes("target")) {
      return CHAT_RESPONSES.goal;
    }
    if (text.includes("challenge") || text.includes("points") || text.includes("reward")) {
      return CHAT_RESPONSES.challenge;
    }
    
    // Fallback general response
    return "That is a great sustainability question! Small shifts like switching to energy-efficient appliances, reducing food waste, composting, and biking instead of driving can collectively make a massive impact. I recommend completing the <strong>Carbon Footprint Calculator</strong> first to see where your footprint is highest, and then exploring custom goals!";
  }

})();
