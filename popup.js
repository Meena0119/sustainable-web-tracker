const FACTOR_G_CO2_PER_MB = 0.5;

async function init() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;

    if (!tabId) return;

    chrome.storage.local.get(["globalBytes", tabId.toString()], (result) => {
        const globalBytes = result.globalBytes || 0;
        const tabData = result[tabId.toString()] || { bytes: 0, isGreen: false, hostedBy: null };

        updateUI(tabData, globalBytes);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === "local") {
            let updateNeeded = false;
            let newTabData = null;
            let newGlobalBytes = null;

            if (changes["globalBytes"]) {
                newGlobalBytes = changes["globalBytes"].newValue;
                updateNeeded = true;
            }
            if (changes[tabId.toString()]) {
                newTabData = changes[tabId.toString()].newValue;
                updateNeeded = true;
            }

            if (updateNeeded) {
                chrome.storage.local.get(["globalBytes", tabId.toString()], (result) => {
                    const latestGlobalBytes = newGlobalBytes !== null ? newGlobalBytes : (result.globalBytes || 0);
                    const latestTabData = newTabData !== null ? newTabData : (result[tabId.toString()] || { bytes: 0, isGreen: false, hostedBy: null });
                    updateUI(latestTabData, latestGlobalBytes);
                });
            }
        }
    });
}

function updateUI(tabData, globalBytes) {
    const tabMb = (tabData.bytes / (1024 * 1024)).toFixed(2);
    const tabCo2 = (tabMb * FACTOR_G_CO2_PER_MB).toFixed(2);
    
    const globalMb = (globalBytes / (1024 * 1024)).toFixed(2);
    const globalCo2 = (globalMb * FACTOR_G_CO2_PER_MB).toFixed(2);

    const pageCo2El = document.getElementById("pageCo2");
    const pageDataEl = document.getElementById("pageData");
    const totalCo2El = document.getElementById("totalCo2");
    const mainContainer = document.getElementById("mainContainer");
    const hostInfoEl = document.getElementById("hostInfo");
    const ecoBadgeEl = document.getElementById("ecoBadge");

    pageCo2El.innerText = tabCo2;
    pageDataEl.innerText = tabMb;
    totalCo2El.innerText = globalCo2;

    if (tabCo2 > 2.0 && !tabData.isGreen) {
        mainContainer.classList.add("theme-red");
        mainContainer.classList.remove("theme-green");
    } else if (tabData.isGreen) {
        mainContainer.classList.add("theme-green");
        mainContainer.classList.remove("theme-red");
    } else {
        mainContainer.classList.remove("theme-green");
        mainContainer.classList.remove("theme-red");
    }

    if (tabData.isGreen === true) {
        hostInfoEl.innerText = "Hosted by: " + (tabData.hostedBy || "Eco-friendly Host");
        hostInfoEl.style.color = "#a8e063";
        ecoBadgeEl.style.display = "block";
    } else if (tabData.isGreen === false) {
        let domain = "";
        try {
            if (tabData.domain) domain = ` (${tabData.domain})`;
        } catch(e){}
        hostInfoEl.innerText = "Standard Host" + domain + " (Not Verified Green)";
        hostInfoEl.style.color = "#ffcccc";
        ecoBadgeEl.style.display = "none";
    } else {
        hostInfoEl.innerText = "Checking Host...";
        ecoBadgeEl.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", init);
