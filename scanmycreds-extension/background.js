// Background service worker
// Handles badge state persistence and content script messaging

chrome.runtime.onInstalled.addListener(() => {
  console.log("ScanMyCreds extension installed");
  chrome.action.setBadgeText({ text: "" });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EMAIL_DETECTED") {
    // Content script found an email input on a login page
    // Check storage for cached scan result
    chrome.storage.local.get(["scanHistory"], (res) => {
      const history = res.scanHistory || [];
      const match = history.find(h => h.email === message.email);
      if (match && match.breached) {
        sendResponse({ warned: true, breachCount: match.breachCount });
      } else {
        sendResponse({ warned: false });
      }
    });
    return true; // keep channel open for async
  }
});