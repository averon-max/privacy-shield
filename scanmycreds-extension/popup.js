const API = "https://www.scanmycreds.com";
const $ = id => document.getElementById(id);

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

$("openAppBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: API + "/app" });
});

// SCAN
$("scanBtn").addEventListener("click", scanEmail);
$("scanEmail").addEventListener("keydown", e => { if (e.key === "Enter") scanEmail(); });

async function scanEmail() {
  const email = $("scanEmail").value.trim();
  if (!email || !email.includes("@")) {
    $("scanResults").innerHTML = '<div class="card"><div class="status" style="color:#e05c4b">Enter a valid email</div></div>';
    return;
  }
  $("scanResults").innerHTML = '<div class="card"><div class="status">Scanning...</div></div>';

  try {
    const res = await fetch(API + "/api/checkEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, extensionCheck: true }),
    });
    const data = await res.json();

    saveHistory({
      email: email,
      breached: !!data.breached,
      count: data.breachCount || 0,
      sources: data.breachSources || [],
      when: Date.now(),
    });
    renderScan(data, email);
  } catch (err) {
    $("scanResults").innerHTML = '<div class="card"><div class="status" style="color:#e05c4b">Error — please try again</div></div>';
  }
}

function renderScan(data, email) {
  if (!data.breached) {
    $("scanResults").innerHTML = `
      <div class="card">
        <div class="card-accent" style="background:linear-gradient(to right, #6ce4c0, transparent)"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:12px;color:#fff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${email}</span>
          <span class="pill" style="background:rgba(108,228,192,0.12);color:#6ce4c0;border:1px solid rgba(108,228,192,0.3)">
            <span class="pill-dot" style="background:#6ce4c0;box-shadow:0 0 4px #6ce4c0"></span>SAFE
          </span>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3)">No breaches found in any database</div>
      </div>
    `;
    return;
  }

  const sources = data.breachSources || [];
  $("scanResults").innerHTML = `
    <div class="card">
      <div class="card-accent" style="background:linear-gradient(to right, #e05c4b, transparent)"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:12px;color:#fff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${email}</span>
        <span class="pill" style="background:rgba(224,92,75,0.12);color:#e05c4b;border:1px solid rgba(224,92,75,0.3)">
          <span class="pill-dot" style="background:#e05c4b;box-shadow:0 0 4px #e05c4b"></span>BREACHED
        </span>
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:10px">Found in ${data.breachCount} breach${data.breachCount !== 1 ? "es" : ""}</div>
      <div style="margin-bottom:12px">
        ${sources.slice(0, 8).map(s => `<span class="source-tag" style="background:rgba(224,92,75,0.08);color:#e05c4b;border:1px solid rgba(224,92,75,0.2)">${s}</span>`).join("")}
        ${sources.length > 8 ? `<span class="source-tag" style="background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.3)">+${sources.length - 8}</span>` : ""}
      </div>
      <button class="btn btn-ghost" id="viewFullBtn">View full report ↗</button>
    </div>
  `;
  const v = $("viewFullBtn");
  if (v) v.addEventListener("click", () => chrome.tabs.create({ url: API + "/app" }));
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
  $("pwResults").innerHTML = '<div class="card"><div class="status">Checking...</div></div>';

  try {
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
    const issues = [], suggestions = [];
    if (pw.length >= 8) score++; else issues.push("Too short — under 8 characters");
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[A-Z]/.test(pw)) score++; else issues.push("No uppercase letters");
    if (/[a-z]/.test(pw)) score++; else issues.push("No lowercase letters");
    if (/[0-9]/.test(pw)) score++; else issues.push("No numbers");
    if (/[^A-Za-z0-9]/.test(pw)) score++; else issues.push("No special characters");
    if (!/(.)\1{2,}/.test(pw)) score++; else issues.push("Repeated characters");
    if (!/^(password|123456|qwerty)/i.test(pw)) score++; else issues.push("Common pattern");

    if (pw.length < 12) suggestions.push("Use at least 12 characters");
    if (!/[^A-Za-z0-9]/.test(pw)) suggestions.push("Add symbols like @ # $ !");
    if (timesFound > 0) suggestions.push("This password is in breach databases — never reuse it");

    const strengths = ["very-weak","very-weak","weak","fair","fair","strong","strong","very-strong","very-strong","very-strong"];
    const cracks = ["instantly","seconds","minutes","hours","days","weeks","months","years","centuries","centuries"];
    const colors = { "very-weak":"#e05c4b", weak:"#e05c4b", fair:"#c48b20", strong:"#6c9ef7", "very-strong":"#6ce4c0" };
    const widths = { "very-weak":"15%", weak:"30%", fair:"55%", strong:"78%", "very-strong":"100%" };
    const idx = Math.min(score, 9);
    const strength = strengths[idx];
    const color = colors[strength];

    $("pwResults").innerHTML = `
      <div class="card">
        <div class="card-accent" style="background:linear-gradient(to right, ${color}, transparent)"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:10px;letter-spacing:0.1em;color:rgba(255,255,255,0.3);text-transform:uppercase">Strength</span>
          <span style="font-size:11px;color:${color};text-transform:capitalize;font-weight:700">${strength.replace("-", " ")}</span>
        </div>
        <div class="strength-bar">
          <div class="strength-fill" style="background:${color};width:${widths[strength]};box-shadow:0 0 8px ${color}"></div>
        </div>
        <div class="stat-grid">
          <div class="stat-box">
            <div class="stat-label">Compromised</div>
            <div class="stat-value" style="color:${timesFound > 0 ? "#e05c4b" : "#6ce4c0"}">${timesFound > 0 ? "Yes" : "No"}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Times seen</div>
            <div class="stat-value" style="color:#fff">${timesFound.toLocaleString()}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Crack time</div>
            <div class="stat-value" style="color:#fff">${cracks[idx]}</div>
          </div>
        </div>
        ${issues.map(i => `<div class="issue issue-bad">${i}</div>`).join("")}
        ${suggestions.map(s => `<div class="issue issue-info">${s}</div>`).join("")}
      </div>
    `;
  } catch (err) {
    $("pwResults").innerHTML = '<div class="card"><div class="status" style="color:#e05c4b">Error — please try again</div></div>';
  }
}

// GENERATOR
$("genLen").addEventListener("input", e => { $("genLenLabel").textContent = e.target.value; });

$("genBtn").addEventListener("click", () => {
  const len = parseInt($("genLen").value, 10);
  let chars = "";
  if ($("optUpper").checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if ($("optLower").checked) chars += "abcdefghijklmnopqrstuvwxyz";
  if ($("optNum").checked) chars += "0123456789";
  if ($("optSym").checked) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) { $("genResult").value = ""; return; }

  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
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
  chrome.storage.local.get(["history"], data => {
    const list = Array.isArray(data.history) ? data.history : [];
    list.unshift(item);
    chrome.storage.local.set({ history: list.slice(0, 20) });
  });
}

function loadHistory() {
  chrome.storage.local.get(["history"], data => {
    const list = Array.isArray(data.history) ? data.history : [];
    const valid = list.filter(item => item && item.email);

    if (valid.length === 0) {
      $("historyResults").innerHTML = '<div class="empty"><div class="empty-icon">📋</div>No scans yet</div>';
      return;
    }

    $("historyResults").innerHTML = valid.map(item => {
      const time = new Date(item.when || Date.now()).toLocaleString();
      const status = item.breached
        ? `<span style="color:#e05c4b">⚠ ${item.count || 0} breach${(item.count || 0) !== 1 ? "es" : ""}</span>`
        : `<span style="color:#6ce4c0">✓ Clean</span>`;
      return `
        <div class="hist-row">
          <div class="hist-email">${item.email}</div>
          <div class="hist-meta">
            <span>${time}</span>
            ${status}
          </div>
        </div>
      `;
    }).join("") + `<button class="btn btn-ghost" id="clearHist" style="margin-top:8px">Clear history</button>`;

    const clr = $("clearHist");
    if (clr) clr.addEventListener("click", () => {
      chrome.storage.local.set({ history: [] }, loadHistory);
    });
  });
}