document.addEventListener("DOMContentLoaded", function () {
  loadRecentAnalyses();

  document.getElementById("symptomForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const symptoms = document.getElementById("symptoms").value.trim();
    const duration = document.getElementById("duration").value.trim();
    const severity = document.getElementById("severity").value;

    const spinner = document.getElementById("spinner");
    const conditionsCard = document.getElementById("conditionsCard");
    const nextStepsCard = document.getElementById("nextStepsCard");
    const conditionsList = document.getElementById("conditionsList");
    const nextStepsList = document.getElementById("nextStepsList");

    // Validate input
    if (symptoms.length < 5) {
      alert("⚠️ Please enter more descriptive symptoms.");
      return;
    }

    // Show loading
    spinner.classList.remove("hidden");

    try {
      const response = await fetch("/check-symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms, duration, severity }),
      });

      const data = await response.json();
      spinner.classList.add("hidden");

      if (!data.reply) {
        conditionsCard.style.display = "none";
        nextStepsCard.style.display = "none";
        alert("❌ Something went wrong. Please try again.");
        return;
      }

      // Parse AI response into structured format
      const parsed = parseAIResponse(data.reply);

      // Display conditions
      conditionsList.innerHTML = "";
      parsed.conditions.forEach(cond => {
        const probClass = cond.probability === "High" ? "high-probability" :
                          cond.probability === "Medium" ? "medium-probability" : "low-probability";

        const card = document.createElement("div");
        card.className = "condition-card";
        card.innerHTML = `
          <h4>${cond.name} <span class="probability-tag ${probClass}">${cond.probability} probability</span></h4>
          <p>${cond.description}</p>
        `;
        conditionsList.appendChild(card);
      });
      conditionsCard.style.display = "block";

      // Display next steps
      nextStepsList.innerHTML = "";
      parsed.nextSteps.forEach(step => {
        const urgencyClass = step.urgency === "High" ? "alert" :
                             step.urgency === "Medium" ? "warning" : "info";

        const icon = step.urgency === "High" ? "⚠️" :
                     step.urgency === "Medium" ? "🕒" : "ℹ️";

        const card = document.createElement("div");
        card.className = `next-step-card ${urgencyClass}`;
        card.innerHTML = `
          <i>${icon}</i>
          <div>
            <h4>${step.title}</h4>
            <p>${step.description}</p>
          </div>
        `;
        nextStepsList.appendChild(card);
      });
      nextStepsCard.style.display = "block";

      // Save to recent analyses
      saveToHistory({ symptoms, duration, severity, reply: data.reply });

    } catch (err) {
      spinner.classList.add("hidden");
      alert("❌ Network error. Please try again.");
    }
  });

  function parseAIResponse(text) {
    // Simple parser - assumes AI output follows a pattern
    const lines = text.split("\n").filter(line => line.trim() !== "");

    let conditions = [];
    let nextSteps = [];

    let currentSection = null;

    for (let line of lines) {
      if (line.includes("Possible Conditions")) {
        currentSection = "conditions";
      } else if (line.includes("Recommended Next Steps")) {
        currentSection = "nextSteps";
      } else if (currentSection === "conditions" && line.startsWith("- ")) {
        const match = line.match(/- (.+?) \((.+?)\)/);
        if (match) {
          const name = match[1].trim();
          const descMatch = line.match(/\((.+?)\)/);
          const description = descMatch ? descMatch[1].trim() : "";
          conditions.push({
            name,
            probability: "High", // Default; improve parsing later
            description
          });
        }
      } else if (currentSection === "nextSteps" && line.startsWith("- ")) {
        const titleMatch = line.match(/- (.+?):/);
        if (titleMatch) {
          const title = titleMatch[1].trim();
          const description = line.replace(/- (.+?):/, "").trim();
          nextSteps.push({
            title,
            urgency: "Medium", // Default
            description
          });
        }
      }
    }

    // Fallback: if no structure found, show raw text
    if (conditions.length === 0 && nextSteps.length === 0) {
      conditions.push({
        name: "AI Response",
        probability: "Unknown",
        description: text
      });
    }

    return { conditions, nextSteps };
  }

  function saveToHistory(entry) {
    let history = JSON.parse(localStorage.getItem('symptomHistory') || '[]');
    const timestamp = new Date().toLocaleString();
    const summary = `${entry.symptoms} (${entry.duration}, ${entry.severity})`;

    history.unshift({
      ...entry,
      summary,
      timestamp
    });

    localStorage.setItem('symptomHistory', JSON.stringify(history.slice(0, 5))); // Keep last 5
    loadRecentAnalyses();
  }

  function loadRecentAnalyses() {
    const container = document.getElementById("recentAnalyses");
    const history = JSON.parse(localStorage.getItem('symptomHistory') || '[]');

    container.innerHTML = "";

    if (history.length === 0) {
      container.innerHTML = "<p>No recent analyses.</p>";
      return;
    }

    history.forEach(item => {
      const div = document.createElement("div");
      div.className = "recent-item";
      div.innerHTML = `
        <p>${item.summary}</p>
        <small>${item.timestamp}</small>
      `;
      div.addEventListener("click", () => {
        document.getElementById("symptoms").value = item.symptoms;
        document.getElementById("duration").value = item.duration;
        document.getElementById("severity").value = item.severity;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      container.appendChild(div);
    });
  }
});