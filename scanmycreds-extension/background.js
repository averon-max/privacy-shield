const KNOWN_BREACHED_DOMAINS = [
  "linkedin.com","adobe.com","yahoo.com","myfitnesspal.com","dropbox.com",
  "tumblr.com","lastpass.com","disqus.com","canva.com","quora.com",
  "wattpad.com","mathway.com","sociallarks.com","mybb.com","exploit.in"
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ installed: Date.now() });
});

// Periodic auth refresh every 30 min
chrome.alarms.create("authRefresh", { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "authRefresh") refreshAuth();
});

async function refreshAuth() {
  try {
    const res = await fetch("https://www.scanmycreds.com/api/extension-auth", { credentials: "include" });
    const data = await res.json();
    chrome.storage.local.set({ auth: data, authChecked: Date.now() });
  } catch (e) {
    chrome.storage.local.set({ auth: { authenticated: false }, authChecked: Date.now() });
  }
}

refreshAuth();

// Detect when user navigates to a known-breached site
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;
  try {
    const url = new URL(tab.url);
    const host = url.hostname.replace(/^www\./, "");
    if (KNOWN_BREACHED_DOMAINS.some(d => host.includes(d))) {
      chrome.storage.local.get(["auth"], (data) => {
        if (data?.auth?.isPro) {
          chrome.action.setBadgeText({ text: "!", tabId });
          chrome.action.setBadgeBackgroundColor({ color: "#e05c4b", tabId });
        }
      });
    } else {
      chrome.action.setBadgeText({ text: "", tabId });
    }
  } catch (e) {}
});
