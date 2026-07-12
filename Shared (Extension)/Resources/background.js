const CONTENT_SCRIPT_ID_PREFIX = "ad-skip-";

const toScriptId = (site) => `${CONTENT_SCRIPT_ID_PREFIX}${site}`;

const registerSite = async (site) => {
    const id = toScriptId(site);
    const existing = await browser.scripting.getRegisteredContentScripts({ ids: [id] });

    if (existing.length > 0) {
        await browser.scripting.updateContentScripts([{
            id,
            js: [ "content.js" ],
            matches: [ `*://${site}/*` ]
        }]);
        return;
    }

    await browser.scripting.registerContentScripts([{
        id,
        js: [ "content.js" ],
        matches: [ `*://${site}/*` ],
        runAt: "document_idle"
    }]);
};

const unregisterSite = async (site) => {
    const id = toScriptId(site);
    await browser.scripting.unregisterContentScripts({ ids: [id] }).catch(() => {});
};

const registerAllStoredSites = async () => {
    const { sites = [] } = await browser.storage.local.get("sites");

    for (const site of sites) {
        await registerSite(site);
    }
};

browser.runtime.onInstalled.addListener(async () => {
    const { sites } = await browser.storage.local.get("sites");

    if (!sites) {
        await browser.storage.local.set({ sites: [ "kr43.topgirl.co" ] });
    }

    await registerAllStoredSites();
});

browser.runtime.onStartup.addListener(() => {
    registerAllStoredSites();
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "registerSite") {
        return registerSite(request.site).then(() => ({ ok: true }));
    }

    if (request.type === "unregisterSite") {
        return unregisterSite(request.site).then(() => ({ ok: true }));
    }
});
