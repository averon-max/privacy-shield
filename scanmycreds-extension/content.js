(function() {
  const KNOWN_BREACHED = [
    "linkedin.com","adobe.com","yahoo.com","myfitnesspal.com","dropbox.com",
    "tumblr.com","lastpass.com","disqus.com","canva.com","quora.com",
    "wattpad.com","mathway.com"
  ];

  const host = location.hostname.replace(/^www\./, "");
  const isBreached = KNOWN_BREACHED.some(d => host.includes(d));
  if (!isBreached) return;

  chrome.storage.local.get(["auth"], (data) => {
    if (!data?.auth?.isPro) return;

    const passwordFields = document.querySelectorAll('input[type="password"]');
    if (passwordFields.length === 0) return;

    if (document.getElementById("smc-breach-warning")) return;

    const banner = document.createElement("div");
    banner.id = "smc-breach-warning";
    banner.innerHTML = `
      <div style="position:fixed;top:0;left:0;right:0;background:linear-gradient(90deg,rgba(224,92,75,0.95),rgba(196,139,32,0.95));backdrop-filter:blur(8px);color:#fff;padding:10px 16px;z-index:2147483647;font-family:system-ui,sans-serif;font-size:13px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:2px solid rgba(255,255,255,0.15);box-shadow:0 4px 24px rgba(0,0,0,0.3)">
        <div style="display:flex;align-items:center;gap:10px;flex:1">
          <span style="width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 8px #fff;animation:smcPulse 1.5s infinite"></span>
          <span style="font-weight:700">⚠ ScanMyCreds Pro: This site has been breached.</span>
          <span style="opacity:0.85">Use a unique password — never one you've reused elsewhere.</span>
        </div>
        <button id="smc-dismiss" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;padding:5px 12px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600">Dismiss</button>
      </div>
      <style>@keyframes smcPulse{0%,100%{opacity:1}50%{opacity:0.4}}</style>
    `;
    document.body.appendChild(banner);

    const dismiss = document.getElementById("smc-dismiss");
    if (dismiss) {
      dismiss.addEventListener("click", () => banner.remove());
    }

    setTimeout(() => { if (banner.parentNode) banner.remove(); }, 12000);
  });
})();
