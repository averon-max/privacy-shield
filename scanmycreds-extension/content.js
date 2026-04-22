// Content script — runs on every page
// Detects login forms and warns if the email has been breached

let warningInjected = false;
let lastCheckedEmail = "";

function isLoginPage() {
  const inputs = document.querySelectorAll('input[type="password"]');
  return inputs.length > 0;
}

function getEmailInput() {
  const selectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[id="email"]',
    'input[placeholder*="email" i]',
    'input[autocomplete="email"]',
    'input[autocomplete="username"]',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function injectWarning(emailInput, breachCount) {
  if (warningInjected) return;
  warningInjected = true;

  const warning = document.createElement("div");
  warning.id = "smc-warning";
  warning.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    background: #0a0a0a;
    border: 1px solid rgba(224,92,75,0.5);
    border-radius: 14px;
    padding: 14px 16px;
    max-width: 300px;
    font-family: system-ui, sans-serif;
    box-shadow: 0 0 40px rgba(224,92,75,0.2), 0 8px 32px rgba(0,0,0,0.6);
    animation: slideIn 0.3s ease;
  `;

  warning.innerHTML = `
    <style>
      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      #smc-warning * { box-sizing: border-box; margin: 0; padding: 0; }
    </style>

    <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
      <div style="width:8px;height:8px;border-radius:50%;background:#e05c4b;box-shadow:0 0 8px #e05c4b;flex-shrink:0;margin-top:3px;animation:pulse 2s infinite"></div>
      <div>
        <p style="font-size:13px;font-weight:700;color:#fff;margin-bottom:3px">⚠ Breach Detected</p>
        <p style="font-size:11px;color:rgba(255,255,255,0.45);line-height:1.5">
          This email was found in <strong style="color:#e05c4b">${breachCount} breach${breachCount > 1 ? "es" : ""}</strong>. 
          Your password may be compromised.
        </p>
      </div>
    </div>

    <div style="display:flex;gap:6px">
      <button id="smc-check-btn" style="flex:1;padding:8px;font-size:11px;font-weight:700;color:#000;background:#fff;border:none;border-radius:7px;cursor:pointer;font-family:inherit">
        See full report →
      </button>
      <button id="smc-dismiss-btn" style="padding:8px 10px;font-size:11px;color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:7px;cursor:pointer;font-family:inherit">
        Dismiss
      </button>
    </div>

    <p style="font-size:9px;color:rgba(255,255,255,0.15);margin-top:8px;text-align:center;letter-spacing:0.05em">
      ScanMyCreds · scanmycreds.com
    </p>

    <style>
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    </style>
  `;

  document.body.appendChild(warning);

  document.getElementById("smc-check-btn").addEventListener("click", () => {
    window.open("https://www.scanmycreds.com/app", "_blank");
    warning.remove();
  });

  document.getElementById("smc-dismiss-btn").addEventListener("click", () => {
    warning.style.opacity = "0";
    warning.style.transform = "translateY(10px)";
    warning.style.transition = "all 0.2s";
    setTimeout(() => warning.remove(), 200);
  });

  // Auto dismiss after 10 seconds
  setTimeout(() => {
    if (document.getElementById("smc-warning")) {
      warning.style.opacity = "0";
      warning.style.transition = "opacity 0.5s";
      setTimeout(() => warning.remove(), 500);
    }
  }, 10000);
}

function checkEmailAgainstHistory(email) {
  if (email === lastCheckedEmail) return;
  lastCheckedEmail = email;

  chrome.runtime.sendMessage(
    { type: "EMAIL_DETECTED", email },
    (response) => {
      if (chrome.runtime.lastError) return;
      if (response && response.warned) {
        injectWarning(email, response.breachCount);
      }
    }
  );
}

function watchEmailInputs() {
  if (!isLoginPage()) return;

  const emailInput = getEmailInput();
  if (!emailInput) return;

  // Check on blur
  emailInput.addEventListener("blur", () => {
    const val = emailInput.value.trim();
    if (val && val.includes("@")) {
      checkEmailAgainstHistory(val);
    }
  });

  // Check on autofill
  setTimeout(() => {
    const val = emailInput.value.trim();
    if (val && val.includes("@")) {
      checkEmailAgainstHistory(val);
    }
  }, 1500);
}

// Run on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", watchEmailInputs);
} else {
  watchEmailInputs();
}

// Also watch for dynamic login forms (SPAs)
const observer = new MutationObserver(() => {
  if (!warningInjected && isLoginPage()) {
    watchEmailInputs();
  }
});

observer.observe(document.body, { childList: true, subtree: true });