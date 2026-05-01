var BASE = "https://www.scanmycreds.com";
var MSGS = ["Connecting to breach database...","Scanning 15B records...","Cross-referencing 600+ sources...","Generating report..."];
var WORDS = ["correct","horse","battery","staple","purple","monkey","dragon","coffee","silver","rocket","forest","ocean","mountain","thunder","castle","river","bridge","winter","summer","falcon","shadow","crystal","copper","velvet","amber","cobalt","crimson","eagle","phoenix","storm","glacier","harbor","jungle","onyx","prism","quartz","titan","vortex","zenith","mosaic","nebula"];

var genOpts = { upper:true, lower:true, nums:true, syms:true, len:16 };
var healthVisible = false;
var progVal = 0;
var msgTimer = null;
var progTimer = null;
var msgIdx = 0;

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {
  loadCounter();
  loadHistory();
  checkScanLimit();

  chrome.storage.local.get(["lastEmail"], function(r) {
    if (r.lastEmail) document.getElementById("emailIn").value = r.lastEmail;
  });

  // Tab buttons
  document.getElementById("t-scan").addEventListener("click", function() { switchTab("scan"); });
  document.getElementById("t-gen").addEventListener("click", function() { switchTab("gen"); });
  document.getElementById("t-health").addEventListener("click", function() { switchTab("health"); });
  document.getElementById("t-dark").addEventListener("click", function() { switchTab("dark"); });
  document.getElementById("t-hist").addEventListener("click", function() { switchTab("hist"); });

  // Subtab buttons
  document.getElementById("st-pwd").addEventListener("click", function() { switchSubtab("pwd"); });
  document.getElementById("st-phrase").addEventListener("click", function() { switchSubtab("phrase"); });

  // Scan
  document.getElementById("scanBtn").addEventListener("click", doScan);
  document.getElementById("emailIn").addEventListener("keydown", function(e) { if (e.key === "Enter") doScan(); });
  document.getElementById("ctaBtn").addEventListener("click", function() { chrome.tabs.create({ url: BASE + "/app" }); });

  // Generator
  document.getElementById("lenSlider").addEventListener("input", function() {
    genOpts.len = parseInt(this.value);
    document.getElementById("lenVal").textContent = this.value;
  });
  document.getElementById("wordSlider").addEventListener("input", function() {
    document.getElementById("wordVal").textContent = this.value;
  });
  document.getElementById("tUpper").addEventListener("click", function() { toggleOpt("upper", this); });
  document.getElementById("tLower").addEventListener("click", function() { toggleOpt("lower", this); });
  document.getElementById("tNums").addEventListener("click", function() { toggleOpt("nums", this); });
  document.getElementById("tSyms").addEventListener("click", function() { toggleOpt("syms", this); });
  document.getElementById("genPwdBtn").addEventListener("click", genPwd);
  document.getElementById("genPhraseBtn").addEventListener("click", genPhrase);
  document.getElementById("pwdCopy").addEventListener("click", function() { copyText("pwdTxt", this); });
  document.getElementById("phraseCopy").addEventListener("click", function() { copyText("phraseTxt", this); });

  // Health
  document.getElementById("healthIn").addEventListener("input", function() { analyzeHealth(this.value); });
  document.getElementById("healthToggle").addEventListener("click", function() {
    healthVisible = !healthVisible;
    document.getElementById("healthIn").type = healthVisible ? "text" : "password";
    this.textContent = healthVisible ? "hide" : "show";
  });

  // Footer
  document.getElementById("openAppBtn").addEventListener("click", function() { chrome.tabs.create({ url: BASE + "/app" }); });
  document.getElementById("clearHistBtn").addEventListener("click", function() {
    chrome.storage.local.remove(["scanHist"], function() { renderHistory([]); });
  });
});

// ── Tabs ──────────────────────────────────────────────────────────────────────
function switchTab(name) {
  var tabs = ["scan","gen","health","dark","hist"];
  tabs.forEach(function(t) {
    document.getElementById("t-" + t).classList.toggle("on", t === name);
    document.getElementById("p-" + t).classList.toggle("on", t === name);
  });
  if (name === "hist") loadHistory();
}

function switchSubtab(name) {
  ["pwd","phrase"].forEach(function(t) {
    document.getElementById("st-" + t).classList.toggle("on", t === name);
    document.getElementById("sp-" + t).classList.toggle("on", t === name);
  });
}

// ── Counter ───────────────────────────────────────────────────────────────────
function loadCounter() {
  chrome.storage.local.get(["smc_count","smc_count_ts"], function(r) {
    var fresh = r.smc_count_ts && (Date.now() - r.smc_count_ts) < 300000;
    if (r.smc_count && fresh) {
      setCtr(r.smc_count);
      tickCtr(r.smc_count);
    }
    fetch(BASE + "/api/stats").then(function(x) { return x.json(); }).then(function(d) {
      var v = Math.max(d.count || 0, r.smc_count || 0);
      chrome.storage.local.set({ smc_count: v, smc_count_ts: Date.now() });
      setCtr(v);
      tickCtr(v);
    }).catch(function() {
      if (!r.smc_count) document.getElementById("ctr").textContent = "15B+ records";
    });
  });
}

function setCtr(n) { document.getElementById("ctr").textContent = Number(n).toLocaleString() + " scanned"; }
function tickCtr(start) {
  setInterval(function() {
    start += Math.floor(Math.random() * 3);
    document.getElementById("ctr").textContent = Number(start).toLocaleString() + " scanned";
  }, 800);
}

// ── Scan limit ────────────────────────────────────────────────────────────────
function checkScanLimit() {
  chrome.storage.local.get(["scanCount","scanDate"], function(r) {
    var today = new Date().toDateString();
    var count = (r.scanDate === today) ? (r.scanCount || 0) : 0;
    if (count >= 5) document.getElementById("limitBar").classList.add("on");
  });
}

// ── Scan ──────────────────────────────────────────────────────────────────────
function doScan() {
  var email = document.getElementById("emailIn").value.trim();
  if (!email || !email.includes("@")) { showErr("scanErr", "Please enter a valid email address"); return; }

  chrome.storage.local.get(["scanCount","scanDate"], function(r) {
    var today = new Date().toDateString();
    var isToday = r.scanDate === today;
    var count = isToday ? (r.scanCount || 0) : 0;

    if (count >= 5) {
      showErr("scanErr", "Daily limit reached. Upgrade to Pro for unlimited scans.");
      document.getElementById("limitBar").classList.add("on");
      return;
    }

    chrome.storage.local.set({ scanCount: count + 1, scanDate: today, lastEmail: email });
    hideErr("scanErr");
    document.getElementById("resultBox").classList.remove("on");
    document.getElementById("scanBtn").disabled = true;
    document.getElementById("scanProg").classList.add("on");
    document.getElementById("scanMsg").classList.add("on");

    progVal = 0; msgIdx = 0;
    document.getElementById("scanMsgTxt").textContent = MSGS[0];
    msgTimer = setInterval(function() {
      msgIdx = (msgIdx + 1) % MSGS.length;
      document.getElementById("scanMsgTxt").textContent = MSGS[msgIdx];
    }, 800);
    progTimer = setInterval(function() {
      progVal = Math.min(progVal + Math.random() * 10, 90);
      document.getElementById("scanFill").style.width = progVal + "%";
    }, 400);

    fetch(BASE + "/api/checkEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: "", extensionCheck: true })
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      clearInterval(msgTimer);
      clearInterval(progTimer);
      document.getElementById("scanFill").style.width = "100%";
      setTimeout(function() {
        document.getElementById("scanProg").classList.remove("on");
        document.getElementById("scanMsg").classList.remove("on");
        document.getElementById("scanBtn").disabled = false;
        showResult(email, data);
        saveHistory(email, data);
        setBadge(data);
      }, 300);
    }).catch(function() {
      clearInterval(msgTimer);
      clearInterval(progTimer);
      document.getElementById("scanProg").classList.remove("on");
      document.getElementById("scanMsg").classList.remove("on");
      document.getElementById("scanBtn").disabled = false;
      showErr("scanErr", "Connection failed. Check your internet.");
    });
  });
}

function showResult(email, data) {
  var breached = data.breached || false;
  var pwdExp = data.passwordExposed || false;
  var count = data.breachCount || 0;
  var sources = data.breachSources || [];

  var score, color, label, bg, border;
  if (breached && pwdExp) { score=12; color="#e05c4b"; label="Critical"; bg="rgba(224,92,75,0.08)"; border="rgba(224,92,75,0.3)"; }
  else if (breached) { score=35; color="#e05c4b"; label="High Risk"; bg="rgba(224,92,75,0.06)"; border="rgba(224,92,75,0.2)"; }
  else if (pwdExp) { score=52; color="#c48b20"; label="Medium"; bg="rgba(196,139,32,0.08)"; border="rgba(196,139,32,0.3)"; }
  else { score=98; color="#6ce4c0"; label="Secure"; bg="rgba(108,228,192,0.06)"; border="rgba(108,228,192,0.2)"; }

  var box = document.getElementById("resultBox");
  box.style.background = bg;
  box.style.border = "1px solid " + border;
  box.style.borderRadius = "10px";

  document.getElementById("scoreArea").innerHTML =
    '<div><p style="font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.25);text-transform:uppercase;margin-bottom:3px">Score</p>' +
    '<p class="score-num" style="color:' + color + ';text-shadow:0 0 24px ' + color + '">' + score + '</p></div>' +
    '<div class="badge" style="background:' + color + '18;border:1px solid ' + color + '40">' +
    '<span class="badge-dot" style="background:' + color + ';box-shadow:0 0 5px ' + color + '"></span>' +
    '<span style="color:' + color + '">' + label + '</span></div>';

  document.getElementById("statsArea").innerHTML =
    '<div class="stat" style="background:' + (breached ? "rgba(224,92,75,0.06)" : "rgba(108,228,192,0.05)") + ';border:1px solid ' + (breached ? "rgba(224,92,75,0.15)" : "rgba(108,228,192,0.15)") + '">' +
    '<span class="stat-left"><span class="sdot" style="background:' + (breached?"#e05c4b":"#6ce4c0") + ';box-shadow:0 0 4px ' + (breached?"#e05c4b":"#6ce4c0") + '"></span>Email</span>' +
    '<span class="stat-val" style="color:' + (breached?"#e05c4b":"#6ce4c0") + '">' + (breached ? "⚠ " + count + " breach" + (count!==1?"es":"") + " found" : "✓ Clear") + '</span></div>' +
    '<div class="stat"><span class="stat-left"><span class="sdot" style="background:rgba(255,255,255,0.2)"></span>Password</span>' +
    '<span class="stat-val" style="color:rgba(255,255,255,0.3)">Sign in to check</span></div>';

  var srcs = document.getElementById("srcsArea");
  if (breached && sources.length > 0) {
    srcs.innerHTML = sources.slice(0,6).map(function(s) {
      return '<span class="src">' + s + '</span>';
    }).join("") + (sources.length > 6 ? '<span class="src">+' + (sources.length-6) + '</span>' : "");
  } else { srcs.innerHTML = ""; }

  document.getElementById("ctaTxt").textContent = breached ? "See full breach report" : "View full security report";
  box.classList.add("on");
}

function setBadge(data) {
  var bad = data.breached || data.passwordExposed;
  chrome.action.setBadgeText({ text: bad ? "!" : "✓" });
  chrome.action.setBadgeBackgroundColor({ color: bad ? "#e05c4b" : "#6ce4c0" });
}

// ── Generator ─────────────────────────────────────────────────────────────────
function toggleOpt(opt, btn) {
  genOpts[opt] = !genOpts[opt];
  btn.classList.toggle("on", genOpts[opt]);
}

function genPwd() {
  var chars = "";
  if (genOpts.upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (genOpts.lower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (genOpts.nums)  chars += "0123456789";
  if (genOpts.syms)  chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) return;
  var arr = new Uint32Array(genOpts.len);
  crypto.getRandomValues(arr);
  var pwd = Array.from(arr, function(n) { return chars[n % chars.length]; }).join("");
  var el = document.getElementById("pwdTxt");
  el.textContent = pwd; el.className = "";
  document.getElementById("pwdCopy").style.display = "block";
  document.getElementById("pwdCopy").textContent = "Copy";
  var s = 0;
  if (pwd.length >= 12) s++; if (pwd.length >= 16) s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) s++;
  var cols = ["#e05c4b","#c48b20","#6c9ef7","#6ce4c0"];
  var labs = ["Weak","Fair","Good","Strong"];
  var ws = ["25%","50%","75%","100%"];
  var i = Math.max(0, s-1);
  var f = document.getElementById("strFill");
  f.style.width = ws[i]; f.style.background = cols[i]; f.style.boxShadow = "0 0 5px " + cols[i];
  var l = document.getElementById("strLbl");
  l.textContent = labs[i]; l.style.color = cols[i];
}

function genPhrase() {
  var count = parseInt(document.getElementById("wordSlider").value);
  var arr = new Uint32Array(count);
  crypto.getRandomValues(arr);
  var phrase = Array.from(arr, function(n) { return WORDS[n % WORDS.length]; }).join("-");
  var el = document.getElementById("phraseTxt");
  el.textContent = phrase; el.className = "";
  document.getElementById("phraseCopy").style.display = "block";
  document.getElementById("phraseCopy").textContent = "Copy";
}

function copyText(id, btn) {
  var t = document.getElementById(id).textContent;
  navigator.clipboard.writeText(t);
  btn.textContent = "Copied";
  setTimeout(function() { btn.textContent = "Copy"; }, 2000);
}

// ── Password Health ───────────────────────────────────────────────────────────
function analyzeHealth(pwd) {
  if (!pwd) {
    document.getElementById("healthResult").style.display = "none";
    document.getElementById("healthEmpty").style.display = "block";
    return;
  }
  document.getElementById("healthEmpty").style.display = "none";
  document.getElementById("healthResult").style.display = "block";
  var issues = [];
  var score = 100;
  if (pwd.length < 8)   { issues.push({ t:"Too short — use at least 8 characters", c:"#e05c4b" }); score -= 30; }
  else if (pwd.length < 12) { issues.push({ t:"Consider 12+ characters", c:"#c48b20" }); score -= 10; }
  if (!/[A-Z]/.test(pwd)) { issues.push({ t:"Add uppercase letters", c:"#c48b20" }); score -= 15; }
  if (!/[a-z]/.test(pwd)) { issues.push({ t:"Add lowercase letters", c:"#c48b20" }); score -= 15; }
  if (!/[0-9]/.test(pwd)) { issues.push({ t:"Add numbers", c:"#6c9ef7" }); score -= 10; }
  if (!/[^A-Za-z0-9]/.test(pwd)) { issues.push({ t:"Add symbols for max strength", c:"#6c9ef7" }); score -= 10; }
  if (/^[a-zA-Z]+[0-9]+$/.test(pwd)) { issues.push({ t:"Word+numbers pattern is easy to crack", c:"#e05c4b" }); score -= 20; }
  if (/(.)\1{2,}/.test(pwd)) { issues.push({ t:"Repeated characters weaken it", c:"#c48b20" }); score -= 15; }
  if (/qwerty|asdf|1234|abcd/i.test(pwd)) { issues.push({ t:"Keyboard walk pattern detected", c:"#e05c4b" }); score -= 25; }
  if (/password|passwd|letmein|welcome/i.test(pwd)) { issues.push({ t:"Common password word detected", c:"#e05c4b" }); score -= 30; }
  if (/^[0-9]+$/.test(pwd)) { issues.push({ t:"Numbers only — extremely weak", c:"#e05c4b" }); score -= 40; }
  score = Math.max(0, Math.min(100, score));
  var sc = score >= 80 ? "#6ce4c0" : score >= 50 ? "#c48b20" : "#e05c4b";
  var sl = score >= 80 ? "Strong" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Weak";
  var box = document.getElementById("healthBox");
  box.style.background = sc + "08"; box.style.border = "1px solid " + sc + "25"; box.style.borderRadius = "10px";
  var num = document.getElementById("healthNum");
  num.textContent = score; num.style.color = sc; num.style.textShadow = "0 0 24px " + sc;
  var lbl = document.getElementById("healthLbl");
  lbl.textContent = sl; lbl.style.color = sc;
  if (issues.length === 0) issues.push({ t:"Excellent — no issues detected", c:"#6ce4c0" });
  document.getElementById("issueList").innerHTML = issues.map(function(x) {
    return '<div class="issue"><span class="issue-dot" style="background:' + x.c + ';box-shadow:0 0 4px ' + x.c + '"></span><span class="issue-text">' + x.t + '</span></div>';
  }).join("");
}

// ── History ───────────────────────────────────────────────────────────────────
function saveHistory(email, data) {
  chrome.storage.local.get(["scanHist"], function(r) {
    var hist = r.scanHist || [];
    var entry = { email:email, breached:data.breached||false, pwdExp:data.passwordExposed||false, count:data.breachCount||0, date:new Date().toLocaleDateString() };
    var filtered = hist.filter(function(h) { return h.email !== email; });
    var updated = [entry].concat(filtered).slice(0, 10);
    chrome.storage.local.set({ scanHist: updated });
  });
}

function loadHistory() {
  chrome.storage.local.get(["scanHist"], function(r) { renderHistory(r.scanHist || []); });
}

function renderHistory(hist) {
  var list = document.getElementById("histList");
  var empty = document.getElementById("histEmpty");
  if (!hist || hist.length === 0) {
    list.innerHTML = ""; empty.style.display = "block"; return;
  }
  empty.style.display = "none";
  list.innerHTML = hist.map(function(h) {
    var c = (h.breached || h.pwdExp) ? "#e05c4b" : "#6ce4c0";
    var lbl = h.breached ? "Breached" : h.pwdExp ? "Exposed" : "Safe";
    return '<div class="hist-row"><span class="hist-email"><span class="hdot" style="background:' + c + ';box-shadow:0 0 4px ' + c + '"></span>' + h.email + '</span><div class="hist-r"><span class="hist-s" style="color:' + c + '">' + lbl + '</span><span class="hist-d">' + h.date + '</span></div></div>';
  }).join("");
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function showErr(id, msg) { var el = document.getElementById(id); el.textContent = msg; el.classList.add("on"); }
function hideErr(id) { document.getElementById(id).classList.remove("on"); }