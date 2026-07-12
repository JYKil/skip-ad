const siteInput = document.getElementById("siteInput");
const addButton = document.getElementById("addButton");
const siteList = document.getElementById("siteList");
const errorMessage = document.getElementById("errorMessage");

const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
};

const clearError = () => {
    errorMessage.hidden = true;
};

const normalizeSite = (rawInput) => {
    const trimmed = rawInput.trim();

    if (!trimmed) return null;

    try {
        const withProtocol = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
        const { hostname } = new URL(withProtocol);
        return hostname || null;
    } catch {
        return null;
    }
};

const getSites = async () => {
    const { sites = [] } = await browser.storage.local.get("sites");
    return sites;
};

const setSites = async (sites) => {
    await browser.storage.local.set({ sites });
};

const renderSites = (sites) => {
    siteList.innerHTML = "";

    for (const site of sites) {
        const item = document.createElement("li");

        const label = document.createElement("span");
        label.textContent = site;

        const removeButton = document.createElement("button");
        removeButton.textContent = "삭제";
        removeButton.addEventListener("click", () => removeSite(site));

        item.append(label, removeButton);
        siteList.append(item);
    }
};

const refresh = async () => {
    renderSites(await getSites());
};

const addSite = async () => {
    clearError();

    const site = normalizeSite(siteInput.value);

    if (!site) {
        showError("올바른 사이트 주소를 입력해주세요.");
        return;
    }

    try {
        // 사용자 클릭 제스처가 끊기지 않도록 permissions.request를 가장 먼저 호출한다.
        const granted = await browser.permissions.request({
            origins: [ `*://${site}/*` ]
        });

        if (!granted) {
            showError("권한 허용이 거부되어 사이트를 추가할 수 없습니다.");
            return;
        }

        const sites = await getSites();

        if (sites.includes(site)) {
            showError("이미 등록된 사이트입니다.");
            return;
        }

        await setSites([ ...sites, site ]);
        await browser.runtime.sendMessage({ type: "registerSite", site });

        siteInput.value = "";
        await refresh();
    } catch (error) {
        console.error("Failed to add site:", error);
        showError("사이트 추가 중 오류가 발생했습니다.");
    }
};

const removeSite = async (site) => {
    try {
        const sites = await getSites();

        await setSites(sites.filter((existing) => existing !== site));
        await browser.runtime.sendMessage({ type: "unregisterSite", site });
        await browser.permissions.remove({ origins: [ `*://${site}/*` ] });

        await refresh();
    } catch (error) {
        console.error("Failed to remove site:", error);
        showError("사이트 삭제 중 오류가 발생했습니다.");
    }
};

addButton.addEventListener("click", addSite);
siteInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addSite();
});

refresh();
