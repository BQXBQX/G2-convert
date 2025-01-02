chrome.runtime.onInstalled.addListener(() => {
  // Set initial badge
  chrome.action.setBadgeText({ text: "G2" });
  chrome.action.setBadgeBackgroundColor({ color: "#1677FF" }); // Using antd primary blue color
});

// Listen for messages from popup to update badge
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UPDATE_BADGE") {
    chrome.action.setBadgeText({ text: message.text });
    chrome.action.setBadgeBackgroundColor({ color: message.color });
  }
});
