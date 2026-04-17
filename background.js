// background.js

// A storage object in memory for active tabs so we don't hit the disk constantly
const tabData = {};
let globalBytes = 0;

// Load global bytes from storage when service worker starts
chrome.storage.local.get(["globalBytes"], (result) => {
    if (result.globalBytes) {
        globalBytes = result.globalBytes;
    }
});

function getDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        return null;
    }
}

// Check green hosting status with the Green Web Foundation API
async function checkGreenHost(domain, tabId) {
    if (!domain) return;
    try {
        const response = await fetch(`https://api.thegreenwebfoundation.org/greencheck/${domain}`);
        const data = await response.json();
        
        if (tabData[tabId]) {
            tabData[tabId].isGreen = data.green;
            tabData[tabId].hostedBy = data.hostedby || "Unknown";
            saveData(tabId);
        }
    } catch (error) {
        console.error("Error fetching green host data:", error);
    }
}

// Helper to persist tab data and global stats to local storage
function saveData(tabId) {
    if (tabData[tabId]) {
        chrome.storage.local.set({
            [tabId.toString()]: tabData[tabId],
            globalBytes: globalBytes
        });
    }
}

// Listen to web requests to calculate data transfer size
chrome.webRequest.onCompleted.addListener(
    (details) => {
        const tabId = details.tabId;
        
        // We only track requests originating from an actual tab, not background requests
        if (tabId === -1) return;

        // Initialize tabData array for a new tab
        if (!tabData[tabId]) {
            tabData[tabId] = {
                bytes: 0,
                domain: null,
                isGreen: null,
                hostedBy: null
            };
        }

        // Find the Content-Length header to determine size of downloaded asset
        let contentLength = 0;
        if (details.responseHeaders) {
            for (let i = 0; i < details.responseHeaders.length; i++) {
                if (details.responseHeaders[i].name.toLowerCase() === 'content-length') {
                    contentLength = parseInt(details.responseHeaders[i].value, 10);
                    break;
                }
            }
        }

        if (contentLength > 0) {
            tabData[tabId].bytes += contentLength;
            globalBytes += contentLength;
            saveData(tabId);
        }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);

// Listen to tab updates (page loads) to fetch the domain and green status
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        const domain = getDomain(tab.url);
        
        // Reset bytes on new page load if it's not a single-page app navigation
        if (tabData[tabId] && tabData[tabId].domain !== domain) {
            tabData[tabId] = {
                bytes: 0,
                domain: domain,
                isGreen: null,
                hostedBy: null
            };
        } else if (!tabData[tabId]) {
             tabData[tabId] = {
                bytes: 0,
                domain: domain,
                isGreen: null,
                hostedBy: null
            };
        }

        tabData[tabId].domain = domain;
        checkGreenHost(domain, tabId);
    }
});

// Clean up memory when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabData[tabId]) {
        delete tabData[tabId];
        chrome.storage.local.remove(tabId.toString());
    }
});
