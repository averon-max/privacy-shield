const API_BASE = "https://www.scanmycreds.com";

const scanMessages = [
  "Connecting to breach database...",
  "Scanning 15B records...",
  "Cross-referencing 600+ sources...",
  "Generating threat report...",
];

let progressInterval = null;
let msgInterval = null;
let progressVal = 0;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const emailInput = document.getElementById("emailInput");
const scanBtn = document.getElementById("scanBtn");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const scanMsg = document.getElementById("scanMsg");
const scanMsgText = document.getElementById("scanMsgText");
const resultDiv = document.getElementById("result");
const errorBox = document.getElementById("errorBox");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const counter = document.getElementById("counter");
const openApp = document.getElementById("openApp");
const clearHistoryBtn = document.getElementById("clearHistory");

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadCounter();
  loadHistory();

  // Try to autofill email from storage
  chrome.storage.local.get(["lastEmail"], (res) => {
    if (res.lastEmail) emailInput.value = res.lastEmail;
  });

  emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") startScan();
  });

  scanBtn.addEventListener("click", startScan);

  openApp.addEventListener("click", () => {
    chrome.tabs.create({ url: `${API_BASE}/app` });
  });

  clearHistoryBtn.addEventListener("click", () => {
    chrome.storage.local.remove(["scanHistory"], () => {
      historySection.style.display = "none";
      historyList.innerHTML = "";
    });
  });
});

// ── Counter ───────────────────────────────────────────────────────────────────
function loadCounter() {
  chrome.storage.local.get(["smc_count", "smc_count_time"], (res) => {
    const isRecent = res.smc_count_time && Date.now() - res.smc_count_time < 1000 * 60 * 5;
    if (res.smc_count && isRecent) {
      counter.textContent = Number(res.smc_count).toLocaleString() + " scanned";
      tickCounter(res.smc_count);
    }
    fetch(`${API_BASE}/api/stats`)
      .then(r => r.json())
      .then(d => {
        const val = Math.max(d.count, res.smc_count || 0);
        chrome.storage.local.set({ smc_count: val, smc_count_time: Date.now() });
        counter.textContent = Number(val).toLocaleString() + " scanned";
        tickCounter(val);
      })
      .catch(() => {
        if (!res.smc_count) counter.textContent = "15B+ records";
      });
  });
}

function tickCounter(start) {
  setInterval(() => {
    start += Math.floor(Math.random() * 3);
    counter.textContent = Number(start).toLocaleString() + " scanned";
  }, 800);
}

// ── Scan ──────────────────────────────────────────────────────────────────────
async function startScan() {
  const email = emailInput.value.trim();
  if (!email || !email.includes("@")) {
    showError("Please enter a valid email address");
    return;
  }

  // Save last email
  chrome.storage.local.set({ lastEmail: email });

  // Reset UI
  hideError();
  resultDiv.classList.remove("active");
  resultDiv.innerHTML = "";
  scanBtn.disabled = true;
  progressBar.classList.add("active");
  scanMsg.classList.add("active");
  progressVal = 0;

  // Animate progress
  let msgIdx = 0;
  scanMsgText.textContent = scanMessages[0];
  msgInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % scanMessages.length;
    scanMsgText.textContent = scanMessages[msgIdx];
  }, 800);

  progressInterval = setInterval(() => {
    progressVal = Math.min(progressVal + Math.random() * 12, 92);
    progressFill.style.width = progressVal + "%";
  }, 400);

  try {
    // Call the public check endpoint — no auth needed for basic check
    const res = await fetch(`${API_BASE}/api/checkEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "", extensionCheck: true }),
    });

    const data = await res.json();

    clearInterval(msgInterval);
    clearInterval(progressInterval);
    progressFill.style.width = "100%";

    setTimeout(() => {
      progressBar.classList.remove("active");
      scanMsg.classList.remove("active");
      scanBtn.disabled = false;

      if (!res.ok) {
        showError(data.error || "Scan failed. Please try again.");
        return;
      }

      showResult(email, data);
      saveToHistory(email, data);
      updateBadge(data);
    }, 400);

  } catch (err) {
    clearInterval(msgInterval);
    clearInterval(progressInterval);
    progressBar.classList.remove("active");
    scanMsg.classList.remove("active");
    scanBtn.disabled = false;
    showError("Connection failed. Check your internet and try again.");
  }
}

// ── Show Result ───────────────────────────────────────────────────────────────
function showResult(email, data) {
  const breached = data.breached || false;
  const pwdExposed = data.passwordExposed || false;
  const breachCount = data.breachCount || 0;
  const sources = data.breachSources || [];

  let score, color, label, bgColor, borderColor;

  if (breached && pwdExposed) {
    score = 12; color = "#e05c4b"; label = "Critical";
    bgColor = "rgba(224,92,75,0.08)"; borderColor = "rgba(224,92,75,0.3)";
  } else if (breached) {
    score = 35; color = "#e05c4b"; label = "High Risk";
    bgColor = "rgba(224,92,75,0.06)"; borderColor = "rgba(224,92,75,0.25)";
  } else if (pwdExposed) {
    score = 52; color = "#c48b20"; label = "Medium";
    bgColor = "rgba(196,139,32,0.08)"; borderColor = "rgba(196,139,32,0.3)";
  } else {
    score = 98; color = "#6ce4c0"; label = "Secure";
    bgColor = "rgba(108,228,192,0.06)"; borderColor = "rgba(108,228,192,0.25)";
  }

  resultDiv.style.background = bgColor;
  resultDiv.style.border = `1px solid ${borderColor}`;

  let sourcesHTML = "";
  if (sources.length > 0) {
    const shown = sources.slice(0, 8);
    const more = sources.length - 8;
    sourcesHTML = `
      <div class="breach-sources">
        ${shown.map(s => `<span class="breach-tag">${s}</span>`).join("")}
        ${more > 0 ? `<span class="breach-tag">+${more} more</span>` : ""}
      </div>
    `;
  }

  resultDiv.innerHTML = `
    <div class="score-row">
      <div>
        <p style="font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.25);text-transform:uppercase;margin-bottom:4px">Security Score</p>
        <p class="score-num" style="color:${color};text-shadow:0 0 40px ${color}">${score}</p>
      </div>
      <div class="badge" style="background:${color}18;border:1px solid ${color}40">
        <span class="badge-dot" style="background:${color};box-shadow:0 0 6px ${color}"></span>
        <span style="color:${color}">${label}</span>
      </div>
    </div>

    <div class="status-row">
      <div class="status-item" style="background:${breached ? "rgba(224,92,75,0.06)" : "rgba(108,228,192,0.05)"};border:1px solid ${breached ? "rgba(224,92,75,0.15)" : "rgba(108,228,192,0.15)"}">
        <div class="status-left">
          <span class="dot" style="background:${breached ? "#e05c4b" : "#6ce4c0"};box-shadow:0 0 4px ${breached ? "#e05c4b" : "#6ce4c0"}"></span>
          Email
        </div>
        <span class="status-val" style="color:${breached ? "#e05c4b" : "#6ce4c0"}">
          ${breached ? `⚠ ${breachCount} breach${breachCount > 1 ? "es" : ""}` : "✓ Clear"}
        </span>
      </div>
      <div class="status-item" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06)">
        <div class="status-left">
          <span class="dot" style="background:rgba(255,255,255,0.2)"></span>
          Password
        </div>
        <span class="status-val" style="color:rgba(255,255,255,0.3)">— Sign in to check</span>
      </div>
    </div>

    ${sourcesHTML}

    <div class="cta-link" id="ctaLink">
      <div class="cta-left">
        <span></span>
        <p>${breached ? "See full breach report →" : "View full security report →"}</p>
      </div>
      <span class="cta-arrow">→</span>
    </div>
  `;

  resultDiv.classList.add("active");

  document.getElementById("ctaLink").addEventListener("click", () => {
    chrome.tabs.create({ url: `${API_BASE}/app` });
  });
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function updateBadge(data) {
  const breached = data.breached || data.passwordExposed;
  chrome.action.setBadgeText({ text: breached ? "!" : "✓" });
  chrome.action.setBadgeBackgroundColor({
    color: breached ? "#e05c4b" : "#6ce4c0",
  });
}

// ── History ───────────────────────────────────────────────────────────────────
function saveToHistory(email, data) {
  chrome.storage.local.get(["scanHistory"], (res) => {
    const history = res.scanHistory || [];
    const entry = {
      email,
      breached: data.breached || false,
      passwordExposed: data.passwordExposed || false,
      breachCount: data.breachCount || 0,
      date: new Date().toLocaleDateString(),
    };
    // Keep last 5, dedupe by email
    const filtered = history.filter(h => h.email !== email);
    const updated = [entry, ...filtered].slice(0, 5);
    chrome.storage.local.set({ scanHistory: updated });
    renderHistory(updated);
  });
}

function loadHistory() {
  chrome.storage.local.get(["scanHistory"], (res) => {
    if (res.scanHistory && res.scanHistory.length > 0) {
      renderHistory(res.scanHistory);
    }
  });
}

function renderHistory(history) {
  if (!history || history.length === 0) {
    historySection.style.display = "none";
    return;
  }
  historySection.style.display = "block";
  historyList.innerHTML = history.map(h => {
    const color = (h.breached || h.passwordExposed) ? "#e05c4b" : "#6ce4c0";
    const label = h.breached ? "Breached" : h.passwordExposed ? "Exposed" : "Safe";
    return `
      <div class="history-item">
        <span class="history-email">${h.email}</span>
        <span class="history-status" style="color:${color}">${label}</span>
      </div>
    `;
  }).join("");
}

// ── Error ─────────────────────────────────────────────────────────────────────
function showError(msg) {
  errorBox.textContent = "⚠ " + msg;
  errorBox.classList.add("active");
}

function hideError() {
  errorBox.classList.remove("active");
}