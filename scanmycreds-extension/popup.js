// Make all functions globally available for onclick attributes
window.switchTab = switchTab;
window.switchGenTab = switchGenTab;
window.startScan = startScan;
window.generatePassword = generatePassword;
window.generatePassphrase = generatePassphrase;
window.copyGen = copyGen;
window.copyPhrase = copyPhrase;
window.toggleOpt = toggleOpt;
window.updateLength = updateLength;
window.updateWordCount = updateWordCount;
window.analyzePassword = analyzePassword;
window.toggleHealthPwd = toggleHealthPwd;
window.openApp = openApp;
window.clearHistory = clearHistory;
const API_BASE = "https://www.scanmycreds.com";
const FREE_SCAN_LIMIT = 5;

const SCAN_MESSAGES = [
  "Connecting to breach database...",
  "Scanning 15B records...",
  "Cross-referencing 600+ sources...",
  "Generating threat report...",
];

const WORDS = ["correct","horse","battery","staple","purple","monkey","dragon","coffee","silver","rocket","forest","ocean","mountain","thunder","castle","river","bridge","winter","summer","falcon","shadow","crystal","copper","velvet","amber","cobalt","crimson","eagle","phoenix","storm","glacier","harbor","jungle","mosaic","nebula","onyx","prism","quartz","titan","vortex","zenith"];

let progressInterval = null;
let msgInterval = null;
let progressVal = 0;
let genState = { upper: true, lower: true, numbers: true, symbols: true, length: 16 };
let healthShowPwd = false;

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadCounter();
  loadHistory();
  checkScanLimit();

  chrome.storage.local.get(["lastEmail"], (res) => {
    if (res.lastEmail) document.getElementById("emailInput").value = res.lastEmail;
  });

  document.getElementById("emailInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") startScan();
  });
});

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((b, i) => {
    const tabs = ["scan", "generator", "health", "darkweb", "history"];
    b.classList.toggle("active", tabs[i] === tab);
  });
  ["scanTab", "generatorTab", "healthTab", "darkwebTab", "historyTab"].forEach(id => {
    document.getElementById(id).classList.remove("active");
  });
  const map = { scan: "scanTab", generator: "generatorTab", health: "healthTab", darkweb: "darkwebTab", history: "historyTab" };
  document.getElementById(map[tab]).classList.add("active");
  if (tab === "history") renderHistory();
}

function switchGenTab(tab, btn) {
  document.querySelectorAll(".subtab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("passwordGen").style.display = tab === "password" ? "block" : "none";
  document.getElementById("passphraseGen").style.display = tab === "passphrase" ? "block" : "none";
}

// ── Counter ───────────────────────────────────────────────────────────────────
function loadCounter() {
  chrome.storage.local.get(["smc_count", "smc_count_time"], (res) => {
    const isRecent = res.smc_count_time && Date.now() - res.smc_count_time < 1000 * 60 * 5;
    if (res.smc_count && isRecent) {
      document.getElementById("counter").textContent = Number(res.smc_count).toLocaleString() + " scanned";
      tickCounter(res.smc_count);
    }
    fetch(API_BASE + "/api/stats")
      .then(r => r.json())
      .then(d => {
        const val = Math.max(d.count, res.smc_count || 0);
        chrome.storage.local.set({ smc_count: val, smc_count_time: Date.now() });
        document.getElementById("counter").textContent = Number(val).toLocaleString() + " scanned";
        tickCounter(val);
      })
      .catch(() => {
        if (!res.smc_count) document.getElementById("counter").textContent = "15B+ records";
      });
  });
}

function tickCounter(start) {
  setInterval(() => {
    start += Math.floor(Math.random() * 3);
    document.getElementById("counter").textContent = Number(start).toLocaleString() + " scanned";
  }, 800);
}

// ── Scan limit check ──────────────────────────────────────────────────────────
function checkScanLimit() {
  chrome.storage.local.get(["scanCount", "scanDate"], (res) => {
    const today = new Date().toDateString();
    const isToday = res.scanDate === today;
    const count = isToday ? (res.scanCount || 0) : 0;
    if (count >= FREE_SCAN_LIMIT) {
      document.getElementById("proBanner").style.display = "flex";
    }
  });
}

// ── Scan ──────────────────────────────────────────────────────────────────────
function startScan() {
  const email = document.getElementById("emailInput").value.trim();
  if (!email || !email.includes("@")) {
    showError("Please enter a valid email address");
    return;
  }

  chrome.storage.local.get(["scanCount", "scanDate"], async (res) => {
    const today = new Date().toDateString();
    const isToday = res.scanDate === today;
    const count = isToday ? (res.scanCount || 0) : 0;

    if (count >= FREE_SCAN_LIMIT) {
      showError("Daily limit reached (5/day). Upgrade to Pro for unlimited scans.");
      document.getElementById("proBanner").style.display = "flex";
      return;
    }

    chrome.storage.local.set({ scanCount: count + 1, scanDate: today });
    chrome.storage.local.set({ lastEmail: email });

    hideError();
    document.getElementById("resultCard").classList.remove("active");
    document.getElementById("scanBtn").disabled = true;
    document.getElementById("progressBar").classList.add("active");
    document.getElementById("scanMsg").classList.add("active");
    progressVal = 0;

    let msgIdx = 0;
    document.getElementById("scanMsgText").textContent = SCAN_MESSAGES[0];
    msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % SCAN_MESSAGES.length;
      document.getElementById("scanMsgText").textContent = SCAN_MESSAGES[msgIdx];
    }, 800);

    progressInterval = setInterval(() => {
      progressVal = Math.min(progressVal + Math.random() * 12, 92);
      document.getElementById("progressFill").style.width = progressVal + "%";
    }, 400);

    try {
      const res2 = await fetch(API_BASE + "/api/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "", extensionCheck: true }),
      });
      const data = await res2.json();

      clearInterval(msgInterval);
      clearInterval(progressInterval);
      document.getElementById("progressFill").style.width = "100%";

      setTimeout(() => {
        document.getElementById("progressBar").classList.remove("active");
        document.getElementById("scanMsg").classList.remove("active");
        document.getElementById("scanBtn").disabled = false;

        if (!res2.ok) {
          showError(data.error || "Scan failed. Please try again.");
          return;
        }

        showResult(email, data);
        saveToHistory(email, data);
        updateBadge(data);
      }, 400);

    } catch {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
      document.getElementById("progressBar").classList.remove("active");
      document.getElementById("scanMsg").classList.remove("active");
      document.getElementById("scanBtn").disabled = false;
      showError("Connection failed. Check your internet and try again.");
    }
  });
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

  const card = document.getElementById("resultCard");
  card.style.background = bgColor;
  card.style.border = "1px solid " + borderColor;

  document.getElementById("scoreRow").innerHTML =
    '<div>' +
    '<p style="font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.25);text-transform:uppercase;margin-bottom:4px">Security Score</p>' +
    '<p class="score-num" style="color:' + color + ';text-shadow:0 0 30px ' + color + '">' + score + '</p>' +
    '</div>' +
    '<div class="threat-badge" style="background:' + color + '18;border:1px solid ' + color + '40">' +
    '<span class="badge-dot" style="background:' + color + ';box-shadow:0 0 6px ' + color + '"></span>' +
    '<span style="color:' + color + '">' + label + '</span>' +
    '</div>';

  document.getElementById("statusRow").innerHTML =
    '<div class="status-item" style="background:' + (breached ? "rgba(224,92,75,0.06)" : "rgba(108,228,192,0.05)") + ';border:1px solid ' + (breached ? "rgba(224,92,75,0.15)" : "rgba(108,228,192,0.15)") + '">' +
    '<div class="status-label"><span class="status-dot" style="background:' + (breached ? "#e05c4b" : "#6ce4c0") + ';box-shadow:0 0 4px ' + (breached ? "#e05c4b" : "#6ce4c0") + '"></span>Email</div>' +
    '<span class="status-val" style="color:' + (breached ? "#e05c4b" : "#6ce4c0") + '">' + (breached ? "⚠ " + breachCount + " breach" + (breachCount > 1 ? "es" : "") : "✓ Clear") + '</span>' +
    '</div>' +
    '<div class="status-item">' +
    '<div class="status-label"><span class="status-dot" style="background:rgba(255,255,255,0.2)"></span>Password</div>' +
    '<span class="status-val" style="color:rgba(255,255,255,0.3)">Sign in to check</span>' +
    '</div>';

  const sourcesEl = document.getElementById("breachSources");
  if (sources.length > 0 && breached) {
    sourcesEl.innerHTML = sources.slice(0, 6).map(s =>
      '<span class="breach-tag">' + s + '</span>'
    ).join("") + (sources.length > 6 ? '<span class="breach-tag">+' + (sources.length - 6) + ' more</span>' : "");
    sourcesEl.style.display = "flex";
  } else {
    sourcesEl.style.display = "none";
  }

  document.getElementById("ctaText").textContent = breached ? "See full breach report" : "View full security report";
  card.classList.add("active");
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function updateBadge(data) {
  const bad = data.breached || data.passwordExposed;
  chrome.action.setBadgeText({ text: bad ? "!" : "✓" });
  chrome.action.setBadgeBackgroundColor({ color: bad ? "#e05c4b" : "#6ce4c0" });
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
    const filtered = history.filter(h => h.email !== email);
    const updated = [entry, ...filtered].slice(0, 10);
    chrome.storage.local.set({ scanHistory: updated });
  });
}

function loadHistory() {
  chrome.storage.local.get(["scanHistory"], (res) => {
    renderHistoryData(res.scanHistory || []);
  });
}

function renderHistory() {
  chrome.storage.local.get(["scanHistory"], (res) => {
    renderHistoryData(res.scanHistory || []);
  });
}

function renderHistoryData(history) {
  const list = document.getElementById("historyList");
  const empty = document.getElementById("historyEmpty");
  if (!history || history.length === 0) {
    list.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  list.innerHTML = history.map(h => {
    const color = (h.breached || h.passwordExposed) ? "#e05c4b" : "#6ce4c0";
    const label = h.breached ? "Breached" : h.passwordExposed ? "Exposed" : "Safe";
    return '<div class="history-item">' +
      '<div style="display:flex;align-items:center;gap:7px;min-width:0">' +
      '<span style="width:5px;height:5px;border-radius:50%;background:' + color + ';box-shadow:0 0 4px ' + color + ';flex-shrink:0"></span>' +
      '<span class="history-email">' + h.email + '</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">' +
      '<span class="history-status" style="color:' + color + '">' + label + '</span>' +
      '<span style="font-size:9px;color:rgba(255,255,255,0.15)">' + h.date + '</span>' +
      '</div>' +
      '</div>';
  }).join("");
}

// ── Generator ─────────────────────────────────────────────────────────────────
function updateLength(v) {
  genState.length = parseInt(v);
  document.getElementById("lengthVal").textContent = v;
}

function updateWordCount(v) {
  document.getElementById("wordCountVal").textContent = v;
}

function toggleOpt(opt) {
  genState[opt] = !genState[opt];
  const ids = { upper: "tUpper", lower: "tLower", numbers: "tNumbers", symbols: "tSymbols" };
  document.getElementById(ids[opt]).classList.toggle("on", genState[opt]);
}

function generatePassword() {
  let chars = "";
  if (genState.upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (genState.lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (genState.numbers) chars += "0123456789";
  if (genState.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) return;

  const arr = new Uint32Array(genState.length);
  crypto.getRandomValues(arr);
  const pwd = Array.from(arr, n => chars[n % chars.length]).join("");

  document.getElementById("genText").style.color = "#fff";
  document.getElementById("genText").textContent = pwd;
  document.getElementById("copyGenBtn").style.display = "block";
  document.getElementById("copyGenBtn").textContent = "Copy";

  let s = 0;
  if (pwd.length >= 12) s++;
  if (pwd.length >= 16) s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) s++;
  const cols = ["#e05c4b", "#c48b20", "#6c9ef7", "#6ce4c0"];
  const labs = ["Weak", "Fair", "Good", "Strong"];
  const ws = ["25%", "50%", "75%", "100%"];
  const idx = Math.max(0, s - 1);
  const fill = document.getElementById("strengthFill");
  fill.style.width = ws[idx];
  fill.style.background = cols[idx];
  fill.style.boxShadow = "0 0 6px " + cols[idx];
  document.getElementById("strengthLabel").textContent = labs[idx];
  document.getElementById("strengthLabel").style.color = cols[idx];
}

function generatePassphrase() {
  const count = parseInt(document.getElementById("wordSlider").value);
  const arr = new Uint32Array(count);
  crypto.getRandomValues(arr);
  const phrase = Array.from(arr, n => WORDS[n % WORDS.length]).join("-");
  document.getElementById("phraseText").style.color = "#fff";
  document.getElementById("phraseText").textContent = phrase;
  document.getElementById("copyPhraseBtn").style.display = "block";
  document.getElementById("copyPhraseBtn").textContent = "Copy";
}

function copyGen() {
  navigator.clipboard.writeText(document.getElementById("genText").textContent);
  document.getElementById("copyGenBtn").textContent = "Copied";
  setTimeout(() => { document.getElementById("copyGenBtn").textContent = "Copy"; }, 2000);
}

function copyPhrase() {
  navigator.clipboard.writeText(document.getElementById("phraseText").textContent);
  document.getElementById("copyPhraseBtn").textContent = "Copied";
  setTimeout(() => { document.getElementById("copyPhraseBtn").textContent = "Copy"; }, 2000);
}

// ── Password Health ───────────────────────────────────────────────────────────
function toggleHealthPwd() {
  healthShowPwd = !healthShowPwd;
  const input = document.getElementById("healthInput");
  input.type = healthShowPwd ? "text" : "password";
  document.querySelector(".health-toggle").textContent = healthShowPwd ? "hide" : "show";
}

function analyzePassword(pwd) {
  if (!pwd) {
    document.getElementById("healthResult").style.display = "none";
    document.getElementById("healthEmpty").style.display = "block";
    return;
  }
  document.getElementById("healthEmpty").style.display = "none";
  document.getElementById("healthResult").style.display = "block";

  const issues = [];
  let score = 100;

  if (pwd.length < 8) { issues.push({ text: "Too short — minimum 8 characters", color: "#e05c4b" }); score -= 30; }
  else if (pwd.length < 12) { issues.push({ text: "Consider using 12+ characters for better security", color: "#c48b20" }); score -= 10; }

  if (!/[A-Z]/.test(pwd)) { issues.push({ text: "Add uppercase letters (A-Z)", color: "#c48b20" }); score -= 15; }
  if (!/[a-z]/.test(pwd)) { issues.push({ text: "Add lowercase letters (a-z)", color: "#c48b20" }); score -= 15; }
  if (!/[0-9]/.test(pwd)) { issues.push({ text: "Add numbers for stronger entropy", color: "#6c9ef7" }); score -= 10; }
  if (!/[^A-Za-z0-9]/.test(pwd)) { issues.push({ text: "Add symbols (!@#$) for maximum strength", color: "#6c9ef7" }); score -= 10; }

  if (/^[a-zA-Z]+[0-9]+$/.test(pwd)) { issues.push({ text: "Word+numbers pattern is easy to crack", color: "#e05c4b" }); score -= 20; }
  if (/(.)\1{2,}/.test(pwd)) { issues.push({ text: "Repeated characters weaken your password", color: "#c48b20" }); score -= 15; }
  if (/qwerty|asdf|zxcv|1234|abcd/i.test(pwd)) { issues.push({ text: "Keyboard walk pattern detected — very common", color: "#e05c4b" }); score -= 25; }
  if (/password|passwd|letmein|welcome|admin|login/i.test(pwd)) { issues.push({ text: "Common password word detected", color: "#e05c4b" }); score -= 30; }
  if (/^[0-9]+$/.test(pwd)) { issues.push({ text: "Numbers only — extremely weak", color: "#e05c4b" }); score -= 40; }

  score = Math.max(0, Math.min(100, score));
  const scoreColor = score >= 80 ? "#6ce4c0" : score >= 50 ? "#c48b20" : "#e05c4b";
  const scoreLabel = score >= 80 ? "Strong" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Weak";

  const card = document.getElementById("healthScoreCard");
  card.style.background = scoreColor + "08";
  card.style.border = "1px solid " + scoreColor + "25";

  document.getElementById("healthScoreNum").textContent = score;
  document.getElementById("healthScoreNum").style.color = scoreColor;
  document.getElementById("healthScoreNum").style.textShadow = "0 0 30px " + scoreColor;
  document.getElementById("healthScoreLabel").textContent = scoreLabel;
  document.getElementById("healthScoreLabel").style.color = scoreColor;

  if (issues.length === 0) issues.push({ text: "Excellent password — no issues detected", color: "#6ce4c0" });

  document.getElementById("issueList").innerHTML = issues.map(issue =>
    '<div class="issue-item">' +
    '<span class="issue-dot" style="background:' + issue.color + ';box-shadow:0 0 4px ' + issue.color + '"></span>' +
    '<span class="issue-text">' + issue.text + '</span>' +
    '</div>'
  ).join("");
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function openApp() {
  chrome.tabs.create({ url: API_BASE + "/app" });
}

function clearHistory() {
  chrome.storage.local.remove(["scanHistory"], () => {
    renderHistoryData([]);
  });
}

function showError(msg) {
  const el = document.getElementById("errorBox");
  el.textContent = msg;
  el.classList.add("active");
}

function hideError() {
  document.getElementById("errorBox").classList.remove("active");
}