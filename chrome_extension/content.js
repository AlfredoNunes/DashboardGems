// Content script that runs on gemini.google.com to extract Gems automatically
(function() {
  function extractAndSyncGems() {
    try {
      const cards = document.querySelectorAll('a[href*="/app/gems/"], a[href*="/gems/"]');
      if (!cards || cards.length === 0) return;

      const gems = [];
      cards.forEach((card, i) => {
        const href = card.href;
        const nameEl = card.querySelector('div, span, h3');
        const name = nameEl ? nameEl.innerText.split('\n')[0] : 'Gem ' + (i + 1);
        const descEl = card.querySelector('p');
        const desc = descEl ? descEl.innerText : 'Sincronizado da conta Google Gemini';

        if (href && name) {
          gems.push({
            name: name.trim(),
            url: href,
            desc: desc.trim(),
            icon: '💎'
          });
        }
      });

      if (gems.length > 0) {
        // Save to chrome storage
        chrome.storage.local.set({ syncedGems: gems, lastSync: Date.now() });

        // Broadcast to open Dashboard tabs
        window.postMessage({
          type: 'GEMINI_GEMS_SYNC',
          gems: gems
        }, '*');
      }
    } catch (e) {
      console.error("Gemini Gems Sync Error:", e);
    }
  }

  // Run on page load and on dynamic changes
  setTimeout(extractAndSyncGems, 2000);
  window.addEventListener('load', extractAndSyncGems);
})();
