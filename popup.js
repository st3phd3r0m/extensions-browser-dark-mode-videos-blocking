const darkBtn = document.getElementById("toggleDark");
const invertBtn = document.getElementById("toggleInvert");
const blockLoadBtn = document.getElementById("toggleBlockLoad");
const blockAutoPlayBtn = document.getElementById("toggleBlockAutoPlay");

async function updateUI() {
  const { darkMode, inverted, blockLoadVideos, blockAutoPlayVideos } = await browser.storage.local.get(
    ["darkMode", "inverted", "blockLoadVideos", "blockAutoPlayVideos"]
  );
  darkBtn.textContent = darkMode ? "Désactiver mode sombre" : "Activer mode sombre";
  invertBtn.textContent = inverted ? "Désactiver inversion" : "Activer inversion";
  blockLoadBtn.textContent = blockLoadVideos ? "Débloquer chargement vidéos" : "Bloquer chargement vidéos";
  blockAutoPlayBtn.textContent = blockAutoPlayVideos ? "Autoriser autoplay vidéos" : "Bloquer autoplay vidéos";
}

async function toggleOption(key, styleId, href, type, payload = {}) {
  const current = (await browser.storage.local.get(key))[key];
  const newValue = !current;
  await browser.storage.local.set({ [key]: newValue });

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  if (type === "TOGGLE_STYLE") {
    browser.tabs.sendMessage(tab.id, {
      type,
      styleId,
      href,
      enable: newValue,
      ...payload,
    });
  } else if (type === "TOGGLE_BLOCK_VIDEOS") {
    browser.tabs.sendMessage(tab.id, {
      type,
      enable: newValue,
      ...payload,
    });
  }

  updateUI();
}

darkBtn.addEventListener("click", () => toggleOption("darkMode", "dark-mode-style", "dark.css", "TOGGLE_STYLE"));
invertBtn.addEventListener("click", () => toggleOption("inverted", "invert-style", "invert.css", "TOGGLE_STYLE"));
blockLoadBtn.addEventListener("click", () => toggleOption("blockLoadVideos", null, null, "TOGGLE_BLOCK_VIDEOS", { mode: "load" }));
blockAutoPlayBtn.addEventListener("click", () => toggleOption("blockAutoPlayVideos", null, null, "TOGGLE_BLOCK_VIDEOS", { mode: "autoplay" }));

updateUI();
