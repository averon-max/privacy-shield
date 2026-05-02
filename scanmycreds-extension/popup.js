const API = "https://www.scanmycreds.com";

function $(id) { return document.getElementById(id); }

// Tab switching
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    $("tab-" + btn.dataset.tab).classList.add("active");
    if (btn.dataset.tab === "history") loadHistory();
  });
});

// Open app
$("openAppBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: API + "/app" });
});

// SCAN
$("scanBtn").addEventListener("click", scanEmail);
$("scanEmail").addEventListener("keydown", e => { if (e.key === "Enter") scanEmail(); });

async function scanEmail() {
  const email = $("scanEmail").value.trim();
  if (!email || !email.includes("@")) {
    $("scanStatus").textContent = "Enter a valid email";
    return;
  }
  $("scanStatus").textContent = "Scanning...";
  $("scanResults").innerHTML = "";
  try {
    const res = await fetch(API + "/api/checkEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, extensionCheck: true }),
    });
    const data = await res.json();
    saveHistory({ type: "email", value: email, breached: data.breached, count: data.breachCount, when: Date.now() });
    renderScan(data, email);
  } catch (err) {
    $("scanStatus").textContent = "Error — try again";
  }
}

function renderScan(data, email) {
  if (!data.breached) {
    $("scanStatus").innerHTML = '<span style="color:#6ce4c0">✓ Clean — no breaches found</span>';
    $("scanResults").innerHTML = "";
    return;
  }
  $("scanStatus").innerHTML = `<span style="color:#e05c4b">⚠ Found in ${data.breachCount} breach${data.breachCount !== 1 ? "es" : ""}</span>`;
  const sources = (data.breachSources || []).slice(0, 8);
  $("scanResults").innerHTML = `
    <div class="card">
      <div class="card-title">${email}</div>
      <div class="card-meta" style="margin-bottom:6px">Breached in:</div>
      <div>${sources.map(s => `<span class="tag">${s}</span>`).join("")}</div>
    </div>
    <button class="btn btn-blue" id="viewFullBtn">View full report ↗</button>
  `;
  $("viewFullBtn").addEventListener("click", () => chrome.tabs.create({ url: API + "/app" }));
}

// PASSWORD HEALTH
$("pwBtn").addEventListener("click", checkPassword);
$("pwInput").addEventListener("keydown", e => { if (e.key === "Enter") checkPassword(); });

$("pwToggle").addEventListener("click", () => {
  const inp = $("pwInput");
  if (inp.type === "password") { inp.type = "text"; $("pwToggle").textContent = "Hide"; }
  else { inp.type = "password"; $("pwToggle").textContent = "Show"; }
});

async function checkPassword() {
  const pw = $("pwInput").value;
  if (!pw) return;
  $("pwResults").innerHTML = '<div class="empty">Checking...</div>';
  try {
    // SHA-1 in browser
    const enc = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest("SHA-1", enc);
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
    });
    const text = await res.text();
    let timesFound = 0;
    for (const line of text.split("\n")) {
      const [h, c] = line.trim().split(":");
      if (h === suffix) { timesFound = parseInt(c, 10); break; }
    }

    let score = 0;
    const issues = [], sugg = [];
    if (pw.length >= 8) score++; else issues.push("Too short");
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[A-Z]/.test(pw)) score++; else issues.push("No uppercase");
    if (/[a-z]/.test(pw)) score++; else issues.push("No lowercase");
    if (/[0-9]/.test(pw)) score++; else issues.push("No numbers");
    if (/[^A-Za-z0-9]/.test(pw)) score++; else issues.push("No symbols");
    if (!/(.)\1{2,}/.test(pw)) score++; else issues.push("Repeated chars");
    if (!/^(password|123456|qwerty)/i.test(pw)) score++; else issues.push("Common pattern");

    if (pw.length < 12) sugg.push("Use at least 12 characters");
    if (!/[^A-Za-z0-9]/.test(pw)) sugg.push("Add symbols");
    if (timesFound > 0) sugg.push("In breach databases — never reuse");

    const strengths = ["very-weak","very-weak","weak","fair","fair","strong","strong","very-strong","very-strong","very-strong"];
    const cracks = ["instantly","seconds","minutes","hours","days","weeks","months","years","centuries","centuries"];
    const colors = { "very-weak":"#e05c4b", weak:"#e05c4b", fair:"#c48b20", strong:"#6c9ef7", "very-strong":"#6ce4c0" };
    const widths = { "very-weak":"15%", weak:"30%", fair:"55%", strong:"78%", "very-strong":"100%" };
    const idx = Math.min(score, 9);
    const strength = strengths[idx];

    $("pwResults").innerHTML = `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
          <span style="color:#888">Strength</span>
          <span style="color:${colors[strength]};text-transform:capitalize;font-weight:500">${strength.replace("-", " ")}</span>
        </div>
        <div class="bar-wrap"><div class="bar" style="background:${colors[strength]};width:${widths[strength]}"></div></div>
      </div>
      <div class="stat-grid">
        <div class="stat"><div class="stat-l">Compromised</div><div class="stat-v" style="color:${timesFound > 0 ? "#e05c4b" : "#6ce4c0"}">${timesFound > 0 ? "Yes" : "No"}</div></div>
        <div class="stat"><div class="stat-l">Times seen</div><div class="stat-v">${timesFound.toLocaleString()}</div></div>
        <div class="stat"><div class="stat-l">Crack time</div><div class="stat-v">${cracks[idx]}</div></div>
      </div>
      ${issues.map(i => `<div class="issue issue-bad">${i}</div>`).join("")}
      ${sugg.map(s => `<div class="issue issue-good">${s}</div>`).join("")}
    `;
  } catch (err) {
    $("pwResults").innerHTML = '<div class="empty">Error — try again</div>';
  }
}

// GENERATOR
$("genLen").addEventListener("input", e => { $("genLenLabel").textContent = e.target.value; });

$("genBtn").addEventListener("click", () => {
  const len = parseInt($("genLen").value, 10);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  $("genResult").value = out;
});

$("genCopy").addEventListener("click", () => {
  const v = $("genResult").value;
  if (!v) return;
  navigator.clipboard.writeText(v);
  $("genCopy").textContent = "Copied!";
  setTimeout(() => { $("genCopy").textContent = "Copy"; }, 1500);
});

// HISTORY
function saveHistory(item) {
  chrome.storage.local.get(["history"], (data) => {
    const list = data.history || [];
    list.unshift(item);
    chrome.storage.local.set({ history: list.slice(0, 20) });
  });
}

function loadHistory() {
  chrome.storage.local.get(["history"], (data) => {
    const list = data.history || [];
    if (list.length === 0) {
      $("historyResults").innerHTML = '<div class="empty">No scans yet</div>';
      return;
    }
    $("historyResults").innerHTML = list.map(item => {
      const time = new Date(item.when).toLocaleString();
      const status = item.breached
        ? `<span style="color:#e05c4b">⚠ ${item.count} breaches</span>`
        : `<span style="color:#6ce4c0">✓ Clean</span>`;
      return `
        <div class="card">
          <div class="card-title">${item.value}</div>
          <div class="card-meta">${time} · ${status}</div>
        </div>
      `;
    }).join("") + `<button class="btn" id="clearHist" style="background:transparent;color:#666;border:0.5px solid rgba(255,255,255,0.1);margin-top:8px">Clear history</button>`;

    const clr = $("clearHist");
    if (clr) clr.addEventListener("click", () => {
      chrome.storage.local.set({ history: [] }, loadHistory);
    });
  });
}