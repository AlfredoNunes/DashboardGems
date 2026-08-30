// Universal Content Script for Chrome Extension
(function() {
  function extractAllGems() {
    try {
      const gems = [];
      const seen = new Set();

      function add(name, desc, url) {
        if (!name || name.length < 2) return;
        const clean = name.trim();
        if (seen.has(clean.toLowerCase())) return;
        seen.add(clean.toLowerCase());

        gems.push({
          name: clean,
          desc: (desc || '').trim(),
          url: url || 'https://gemini.google.com/app',
          icon: getEmojiForTitle(clean)
        });
      }

      function getEmojiForTitle(title) {
        const t = title.toLowerCase();
        if (t.includes('inglês') || t.includes('english') || t.includes('teacher')) return '🇬🇧';
        if (t.includes('espanhol') || t.includes('spanish')) return '🇪🇸';
        if (t.includes('português') || t.includes('portuguese')) return '🇵🇹';
        if (t.includes('engenharia') || t.includes('eng')) return '👷';
        if (t.includes('imobiliario') || t.includes('casa')) return '🏠';
        if (t.includes('geo') || t.includes('geologia')) return '🌍';
        if (t.includes('davinci') || t.includes('video')) return '🎬';
        if (t.includes('code') || t.includes('python') || t.includes('it')) return '💻';
        return '💎';
      }

      // Strategy 1: Scan all text row elements on the page (My Gems list items)
      const rows = document.querySelectorAll('div, li, article, section, [role="listitem"], [role="article"]');
      rows.forEach(r => {
        const txt = r.innerText || '';
        const lines = txt.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        if (lines.length >= 2) {
          const title = lines.find(l => l.length > 2 && !['share', 'edit', 'delete', 'more_vert', 'new gem', 'my gems', 'premade gems', 'show more'].includes(l.toLowerCase()));
          const desc = lines.find(l => l !== title && l.length > 4) || '';
          const link = r.querySelector('a[href]');
          if (title) add(title, desc, link ? link.href : null);
        }
      });

      // Strategy 2: Scan links
      document.querySelectorAll('a[href]').forEach(a => {
        const h = a.href || '';
        if (h.includes('/gems/') || h.includes('gem_id=')) {
          add(a.innerText || 'Gem', '', h);
        }
      });

      if (gems.length > 0) {
        const json = JSON.stringify(gems, null, 2);
        
        // Broadcast via localStorage shared sync
        try {
          localStorage.setItem('gemini_dashboard_shared_sync', json);
        } catch(e) {}

        // Broadcast to open Dashboard tabs via postMessage
        window.postMessage({
          type: 'GEMINI_GEMS_SYNC',
          gems: gems
        }, '*');

        chrome.storage.local.set({ syncedGems: gems, lastSync: Date.now() });
      }
    } catch (e) {
      console.error("Gemini Gems Sync Error:", e);
    }
  }

  // Run on load and periodically
  setTimeout(extractAllGems, 1500);
  setTimeout(extractAllGems, 3500);
  window.addEventListener('load', extractAllGems);
})();
