function addStyle(id, href) {
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = browser.runtime.getURL(href);
      document.head.appendChild(link);
    }
  }
  
  function removeStyle(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
  
  let mutationObserver = null;
  
  function blockVideoLoading() {
    // Supprime les vidéos et observe les ajouts pour les retirer aussi
    const removeVideos = () => {
      document.querySelectorAll("video, iframe[src*='youtube'], iframe[src*='vimeo']").forEach(el => el.remove());
    };
    removeVideos();
  
    if (mutationObserver) mutationObserver.disconnect();
  
    mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.tagName && (node.tagName === "VIDEO" || node.tagName === "IFRAME")) {
            node.remove();
          }
        });
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
  
  function unblockVideoLoading() {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
  }
  
  function disableAutoplay() {
    const stopAutoplay = video => {
      video.autoplay = false;
      video.pause();
    };
  
    document.querySelectorAll("video").forEach(stopAutoplay);
  
    if (mutationObserver) mutationObserver.disconnect();
  
    mutationObserver = new MutationObserver(() => {
      document.querySelectorAll("video").forEach(stopAutoplay);
    });
  
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
  
  function enableAutoplay() {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
  }
  
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === "TOGGLE_STYLE") {
      const { styleId, href, enable } = message;
      if (enable) addStyle(styleId, href);
      else removeStyle(styleId);
    } else if (message.type === "TOGGLE_BLOCK_VIDEOS") {
      if (message.enable) {
        if (message.mode === "load") {
          blockVideoLoading();
        } else if (message.mode === "autoplay") {
          disableAutoplay();
        }
      } else {
        if (message.mode === "load") {
          unblockVideoLoading();
        } else if (message.mode === "autoplay") {
          enableAutoplay();
        }
      }
    }
  });
  
  // Appliquer les options actives au chargement de la page
  (async () => {
    const { darkMode, inverted, blockLoadVideos, blockAutoPlayVideos } = await browser.storage.local.get([
      "darkMode",
      "inverted",
      "blockLoadVideos",
      "blockAutoPlayVideos",
    ]);
  
    if (darkMode) addStyle("dark-mode-style", "dark.css");
    if (inverted) addStyle("invert-style", "invert.css");
    if (blockLoadVideos) blockVideoLoading();
    if (blockAutoPlayVideos) disableAutoplay();
  })();
  