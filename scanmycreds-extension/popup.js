const API = "https://www.scanmycreds.com";
const $ = id => document.getElementById(id);

const KNOWN_BREACHED_SITES = {
  "linkedin.com": { name: "LinkedIn", year: "2012, 2021", count: "700M" },
  "adobe.com": { name: "Adobe", year: "2013", count: "153M" },
  "yahoo.com": { name: "Yahoo", year: "2013-2014", count: "3B" },
  "myfitnesspal.com": { name: "MyFitnessPal", year: "2018", count: "144M" },
  "dropbox.com": { name: "Dropbox", year: "2012", count: "68M" },
  "tumblr.com": { name: "Tumblr", year: "2013", count: "65M" },
  "lastpass.com": { name: "LastPass", year: "2022", count: "25M" },
  "disqus.com": { name: "Disqus", year: "2017", count: "17M" },
  "canva.com": { name: "Canva", year: "2019", count: "137M" },
  "quora.com": { name: "Quora", year: "2018", count: "100M" },
  "wattpad.com": { name: "Wattpad", year: "2020", count: "270M" },
  "mathway.com": { name: "Mathway", year: "2020", count: "25M" }
};

// === AUTH FLOW ===
async function init() {
  $("loading").style.display = "flex";

  // Check stored auth first
  const stored = await new Promise(r => chrome.storage.local.get(["auth"], r));
  let auth = stored?.auth;

  // Refresh if older than 5 min
  const lastCheck = stored?.authChecked || 0;
  if (!auth || (Date.now() - lastCheck) > 5 * 60 * 1000) {
    try {
      const res = await fetch(API + "/api/extension-auth", { credentials: "include" });
      auth = await res.json();
      chrome.storage.local.set({ auth, authChecked: Date.now() });
    } catch (e) {
      auth = stored?.auth || { authenticated: false };
    }
  }

  $("loading").style.display = "none";

  if (!auth?.authenticated || !auth?.isPro) {
    showAuthGate(auth);
  } else {
    showMainApp(auth);
  }
}

function showAuthGate(auth) {
  $("authGate").style.display = "block";
  if (!auth?.authenticated) {
    $("authGate").querySelector(".auth-title").textContent = "Sign in to use the extension";
    $("authGate").querySelector(".auth-desc").textContent = "The ScanMyCreds extension requires a Pro or Family subscription.";
    $("loginBtn").textContent = "Sign in →";
    $("loginBtn").style.display = "block";
    $("upgradeBtn").textContent = "View pricing — $4.99/mo";
  }

  $("upgradeBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: API + "/pricing" });
  });
  $("loginBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: API + "/login" });
  });
}

function showMainApp(auth) {
  $("mainApp").style.display = "block";
  if (auth.plan === "family" || auth.plan === "family-member") {
    $("planBadge").textContent = "FAMILY";
    $("planBadge").style.color = "#b47fe8";
    $("planBadge").style.background = "linear-gradient(90deg,rgba(180,127,232,0.15),rgba(108,228,192,0.15))";
    $("planBadge").style.borderColor = "rgba(180,127,232,0.3)";
  }

  $("openAppBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: API + "/app/dashboard" });
  });

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

  initSiteAnalysis();
  initScan();
  initPassword();
  initAlias(auth);
  initGenerator();
}

// === SITE ANALYSIS (NEW Pro feature) ===
async function initSiteAnalysis() {
  const tabs = await new Promise(r => chrome.tabs.query({ active: true, currentWindow: true }, r));
  const tab = tabs[0];
  if (!tab?.url) {
    $("siteResults").innerHTML = '<div class="empty">Cannot analyze this tab</div>';
    return;
  }

  let host;
  try {
    host = new URL(tab.url).hostname.replace(/^www\./, "");
  } catch {
    $("siteResults").innerHTML = '<div class="empty">Invalid URL</div>';
    return;
  }

  if (host.startsWith("chrome:") || host.includes("scanmycreds")) {
    $("siteResults").innerHTML = '<div class="empty"><div class="empty-icon">i</div>Open this on a website to scan it</div>';
    return;
  }

  const breached = Object.keys(KNOWN_BREACHED_SITES).find(d => host.includes(d));
  const info = breached ? KNOWN_BREACHED_SITES[breached] : null;

  let html = "";

  if (info) {
    html += `
      <div class="site-status danger">
        <span class="pill-dot" style="background:#e05c4b;box-shadow:0 0 6px #e05c4b;width:8px;height:8px;border-radius:50%"></span>
        <div style="flex:1">
          <p style="font-size:13px;font-weight:700;color:#e05c4b;margin-bottom:2px">${info.name} has been breached</p>
          <p style="font-size:11px;color:rgba(255,255,255,0.5)">${info.count} records · ${info.year}</p>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="site-status safe">
        <span class="pill-dot" style="background:#6ce4c0;box-shadow:0 0 6px #6ce4c0;width:8px;height:8px;border-radius:50%"></span>
        <div style="flex:1">
          <p style="font-size:13px;font-weight:700;color:#6ce4c0;margin-bottom:2px">No known breaches for ${host}</p>
          <p style="font-size:11px;color:rgba(255,255,255,0.5)">Site not in our breach database</p>
        </div>
      </div>
    `;
  }

  html += `
    <div class="section-label" style="margin-top:14px">Quick actions</div>
    <div class="quick-action" id="actionAddWatchlist">
      <span style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="color:#6c9ef7">+</span>Add this domain to watchlist</span>
      <span style="color:rgba(255,255,255,0.3);font-size:14px">→</span>
    </div>
    <div class="quick-action" id="actionGenAlias">
      <span style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="color:#b47fe8">@</span>Generate alias for ${host}</span>
      <span style="color:rgba(255,255,255,0.3);font-size:14px">→</span>
    </div>
    <div class="quick-action" id="actionRiskScore">
      <span style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="color:#c48b20">⚖</span>See risk score for ${host}</span>
      <span style="color:rgba(255,255,255,0.3);font-size:14px">→</span>
    </div>
  `;

  $("siteResults").innerHTML = html;

  $("actionAddWatchlist").addEventListener("click", () => {
    chrome.tabs.create({ url: API + "/app/watchlist" });
  });
  $("actionGenAlias").addEventListener("click", () => {
    document.querySelector('[data-tab="alias"]').click();
    $("aliasService").value = host.split(".")[0];
  });
  $("actionRiskScore").addEventListener("click", () => {
    chrome.tabs.create({ url: API + "/app/risk-check" });
  });
}

// === EMAIL SCAN ===
function initScan() {
  $("scanBtn").addEventListener("click", scanEmail);
  $("scanEmail").addEventListener("keydown", e => { if (e.key === "Enter") scanEmail(); });
}
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
    saveHistory({ email, breached: !!data.breached, count: data.breachCount || 0, sources: data.breachSources || [], when: Date.now() });
    renderScan(data, email);
  } catch (err) {
    $("scanResults").innerHTML = '<div class="card"><div class="status" style="color:#e05c4b">Error</div></div>';
  }
}
function renderScan(data, email) {
  if (!data.breached) {
    $("scanResults").innerHTML = `<div class="card"><div class="card-accent" style="background:linear-gradient(to right,#6ce4c0,transparent)"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><span style="font-size:12px;color:#fff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${email}</span><span class="pill" style="background:rgba(108,228,192,0.12);color:#6ce4c0;border:1px solid rgba(108,228,192,0.3)"><span class="pill-dot" style="background:#6ce4c0"></span>SAFE</span></div><div style="font-size:11px;color:rgba(255,255,255,0.3)">No breaches found</div></div>`;
    return;
  }
  const sources = data.breachSources || [];
  $("scanResults").innerHTML = `<div class="card"><div class="card-accent" style="background:linear-gradient(to right,#e05c4b,transparent)"></div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:12px;color:#fff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${email}</span><span class="pill" style="background:rgba(224,92,75,0.12);color:#e05c4b;border:1px solid rgba(224,92,75,0.3)"><span class="pill-dot" style="background:#e05c4b"></span>BREACHED</span></div><div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:10px">Found in ${data.breachCount} breach${data.breachCount !== 1 ? "es" : ""}</div><div style="margin-bottom:12px">${sources.slice(0,8).map(s => `<span class="source-tag" style="background:rgba(224,92,75,0.08);color:#e05c4b;border:1px solid rgba(224,92,75,0.2)">${s}</span>`).join("")}${sources.length > 8 ? `<span class="source-tag">+${sources.length - 8}</span>` : ""}</div><button class="btn btn-ghost" id="viewFullBtn">View full report ↗</button></div>`;
  const v = $("viewFullBtn");
  if (v) v.addEventListener("click", () => chrome.tabs.create({ url: API + "/app" }));
}

// === PASSWORD ===
function initPassword() {
  $("pwBtn").addEventListener("click", checkPassword);
  $("pwInput").addEventListener("keydown", e => { if (e.key === "Enter") checkPassword(); });
  $("pwToggle").addEventListener("click", () => {
    const inp = $("pwInput");
    inp.type = inp.type === "password" ? "text" : "password";
    $("pwToggle").textContent = inp.type === "password" ? "Show" : "Hide";
  });
}
async function checkPassword() {
  const pw = $("pwInput").value;
  if (!pw) return;
  $("pwResults").innerHTML = '<div class="card"><div class="status">Checking...</div></div>';
  try {
    const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(pw));
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const res = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0,5)}`, { headers: { "Add-Padding": "true" } });
    const text = await res.text();
    let timesFound = 0;
    for (const line of text.split("\n")) {
      const [h, c] = line.trim().split(":");
      if (h === hash.slice(5)) { timesFound = parseInt(c, 10); break; }
    }
    let score = 0;
    const issues = [];
    if (pw.length >= 8) score++; else issues.push("Too short");
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[A-Z]/.test(pw)) score++; else issues.push("No uppercase");
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++; else issues.push("No numbers");
    if (/[^A-Za-z0-9]/.test(pw)) score++; else issues.push("No symbols");
    const strengths = ["very-weak","very-weak","weak","fair","fair","strong","strong","very-strong"];
    const colors = { "very-weak":"#e05c4b", weak:"#e05c4b", fair:"#c48b20", strong:"#6c9ef7", "very-strong":"#6ce4c0" };
    const widths = { "very-weak":"15%", weak:"30%", fair:"55%", strong:"78%", "very-strong":"100%" };
    const strength = strengths[Math.min(score, 7)];
    const color = colors[strength];
    $("pwResults").innerHTML = `<div class="card"><div class="card-accent" style="background:linear-gradient(to right,${color},transparent)"></div><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:10px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase">Strength</span><span style="font-size:11px;color:${color};font-weight:700;text-transform:capitalize">${strength.replace("-"," ")}</span></div><div class="strength-bar"><div class="strength-fill" style="background:${color};width:${widths[strength]}"></div></div><div class="stat-grid"><div class="stat-box"><div class="stat-label">Compromised</div><div class="stat-value" style="color:${timesFound > 0 ? "#e05c4b" : "#6ce4c0"}">${timesFound > 0 ? "Yes" : "No"}</div></div><div class="stat-box"><div class="stat-label">Times seen</div><div class="stat-value" style="color:#fff">${timesFound.toLocaleString()}</div></div></div>${issues.map(i => `<div class="issue issue-bad">${i}</div>`).join("")}</div>`;
  } catch (err) {
    $("pwResults").innerHTML = '<div class="card"><div class="status" style="color:#e05c4b">Error</div></div>';
  }
}

// === ALIAS ===
function initAlias(auth) {
  if (auth?.email) $("aliasBase").value = auth.email;
  chrome.storage.local.get(["aliasBaseEmail"], data => {
    if (data.aliasBaseEmail && !$("aliasBase").value) $("aliasBase").value = data.aliasBaseEmail;
  });
  $("aliasBase").addEventListener("change", () => {
    chrome.storage.local.set({ aliasBaseEmail: $("aliasBase").value.trim() });
  });
  $("aliasBtn").addEventListener("click", generateAlias);
  $("aliasService").addEventListener("keydown", e => { if (e.key === "Enter") generateAlias(); });
}
function generateAlias() {
  const base = $("aliasBase").value.trim();
  const service = $("aliasService").value.trim();
  if (!base.includes("@") || !service) return;
  chrome.storage.local.set({ aliasBaseEmail: base });
  const [name, domain] = base.split("@");
  const slug = service.toLowerCase().replace(/[^a-z0-9]/g, "");
  const alias = `${name}+${slug}@${domain}`;
  saveAlias({ alias, service, when: Date.now() });
  $("aliasResults").innerHTML = `<div class="card"><div class="card-accent" style="background:linear-gradient(to right,#b47fe8,transparent)"></div><div style="font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">Generated for ${service}</div><div class="alias-output">${alias}</div><button class="btn btn-primary" id="aliasCopyBtn">Copy alias</button></div>`;
  const c = $("aliasCopyBtn");
  if (c) c.addEventListener("click", () => { navigator.clipboard.writeText(alias); c.textContent = "Copied!"; setTimeout(() => c.textContent = "Copy alias", 1500); });
}
function saveAlias(item) {
  chrome.storage.local.get(["aliases"], data => {
    const list = Array.isArray(data.aliases) ? data.aliases : [];
    list.unshift(item);
    chrome.storage.local.set({ aliases: list.slice(0, 30) });
  });
}

// === GENERATOR ===
function initGenerator() {
  $("genLen").addEventListener("input", e => $("genLenLabel").textContent = e.target.value);
  $("genBtn").addEventListener("click", () => {
    const len = parseInt($("genLen").value);
    let chars = "";
    if ($("optUpper").checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if ($("optLower").checked) chars += "abcdefghijklmnopqrstuvwxyz";
    if ($("optNum").checked) chars += "0123456789";
    if ($("optSym").checked) chars += "!@#$%^&*()_+-=";
    if (!chars) return;
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let out = "";
    for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
    $("genResult").value = out;
  });
  $("genCopy").addEventListener("click", () => {
    if (!$("genResult").value) return;
    navigator.clipboard.writeText($("genResult").value);
    $("genCopy").textContent = "Copied!";
    setTimeout(() => $("genCopy").textContent = "Copy", 1500);
  });
}

// === HISTORY ===
function saveHistory(item) {
  chrome.storage.local.get(["history"], data => {
    const list = Array.isArray(data.history) ? data.history : [];
    list.unshift(item);
    chrome.storage.local.set({ history: list.slice(0, 20) });
  });
}
function loadHistory() {
  chrome.storage.local.get(["history", "aliases"], data => {
    const scans = (data.history || []).filter(i => i?.email);
    const aliases = data.aliases || [];
    let html = "";
    if (scans.length > 0) {
      html += '<div class="section-label" style="margin-top:4px">Recent scans</div>';
      html += scans.map(i => {
        const status = i.breached ? `<span style="color:#e05c4b">⚠ ${i.count}</span>` : `<span style="color:#6ce4c0">✓ Clean</span>`;
        return `<div class="hist-row"><div class="hist-email">${i.email}</div><div class="hist-meta"><span>${new Date(i.when).toLocaleDateString()}</span>${status}</div></div>`;
      }).join("");
    }
    if (aliases.length > 0) {
      html += '<div class="section-label" style="margin-top:14px">Recent aliases</div>';
      html += aliases.slice(0, 10).map(i => `<div class="hist-row"><div class="hist-email" style="color:#b47fe8;font-family:monospace;font-size:10px">${i.alias}</div><div class="hist-meta"><span>${i.service}</span><span>${new Date(i.when).toLocaleDateString()}</span></div></div>`).join("");
    }
    if (!html) html = '<div class="empty"><div class="empty-icon">▣</div>No scans yet</div>';
    else html += '<button class="btn btn-ghost" id="clearHist" style="margin-top:12px">Clear all</button>';
    $("historyResults").innerHTML = html;
    const clr = $("clearHist");
    if (clr) clr.addEventListener("click", () => chrome.storage.local.set({ history: [], aliases: [] }, loadHistory));
  });
}

init();
