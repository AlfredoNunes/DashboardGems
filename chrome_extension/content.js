// Content Script running on BOTH gemini.google.com and the Dashboard pages
(function() {
  const isGeminiPage = window.location.hostname === 'gemini.google.com';

  if (isGeminiPage) {
    // --- SCRAPER RUNNING ON GEMINI PAGE ---
    console.log('Gemini Gems Auto-Sync Extensão: Detetada página do Gemini.');

    // Function to parse the DOM text just like the Dashboard does
    function scrapeAndSendGems() {
      const text = document.body.innerText;
      if (!text || text.length < 50) return;

      const allLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // Find "My Gems" boundary
      let startIdx = 0;
      let foundMyGems = false;
      for (let i = 0; i < allLines.length; i++) {
        const lower = allLines[i].toLowerCase();
        if (lower === 'my gems' || lower === 'os meus gems' || lower === 'meus gems') {
          startIdx = i + 1;
          foundMyGems = true;
          break;
        }
      }

      let endIdx = allLines.length;
      if (foundMyGems) {
        for (let j = startIdx; j < allLines.length; j++) {
          const lwr = allLines[j].toLowerCase();
          if (lwr === 'activity' || lwr === 'atividade' || lwr.startsWith('based on your places')) {
            endIdx = j;
            break;
          }
        }
      }

      const noise = new Set([
        'my gems', 'os meus gems', 'meus gems', 'premade gems', 'premade',
        'show more', 'mostrar mais', 'new gem', '+ new gem', 'novo gem', '+ novo gem',
        'activity', 'atividade', 'share', 'edit', 'delete', 'more_vert',
        'experiment', 'gemini', 'gems', 'new chat', 'nova conversa',
        'search chats', 'pesquisar conversas', 'images', 'imagens', 'videos',
        'library', 'biblioteca', 'notebooks', 'all notebooks', 'new notebook',
        'recents', 'recentes', 'pro', 'update location', 'atualizar localização',
        'storybook', 'productivity planner', 'chess champ', 'brainstormer',
        'create a customized', 'stay on top of your', 'play chess with',
        'find inspiration easily'
      ]);

      const cleanLines = [];
      for (let k = startIdx; k < endIdx; k++) {
        const line = allLines[k];
        const lineLower = line.toLowerCase();

        if (noise.has(lineLower)) continue;
        if (line.length < 3) continue;
        if (line.charAt(0) === '+' && line.length < 25) continue;
        if (lineLower.startsWith('http')) continue;
        if (!foundMyGems && (lineLower.includes('schedule tasks') || lineLower.includes('picture book') || lineLower.includes('chess notati'))) continue;

        cleanLines.push(line);
      }

      const gems = [];
      const seenNames = new Set();
      for (let m = 0; m < cleanLines.length; m += 2) {
        const name = cleanLines[m];
        const desc = (m + 1 < cleanLines.length) ? cleanLines[m + 1] : 'Gem do Google Gemini';

        if (seenNames.has(name.toLowerCase())) continue;
        seenNames.add(name.toLowerCase());

        gems.push({
          name: name,
          desc: desc,
          url: 'https://gemini.google.com/app?gem_name=' + encodeURIComponent(name),
          icon: getEmojiForTitle(name)
        });
      }

      if (gems.length > 0) {
        chrome.runtime.sendMessage({ type: 'GEMS_SCRAPED_FROM_TAB', gems: gems });
      }
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

    // Scrape immediately on load
    setTimeout(scrapeAndSendGems, 2000);
    // Periodically scrape to capture dynamic updates
    setInterval(scrapeAndSendGems, 5000);

  } else {
    // --- BRIDGE RUNNING ON DASHBOARD PAGE ---
    // Listen for requests from Dashboard page
    window.addEventListener('message', async (event) => {
      if (event.data && event.data.type === 'REQUEST_GEMINI_DIRECT_FETCH') {
        chrome.runtime.sendMessage({ type: 'REQUEST_LATEST_GEMS' }, (response) => {
          if (response && response.success) {
            window.postMessage({
              type: 'GEMINI_GEMS_SYNC_RESPONSE',
              success: true,
              gems: response.gems
            }, '*');
          } else {
            window.postMessage({
              type: 'GEMINI_GEMS_SYNC_RESPONSE',
              success: false,
              error: response ? response.error : 'Sem dados sincronizados da extensão'
            }, '*');
          }
        });
      }
    });

    // Receive broadcast updates from background worker and pass to page
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'BROADCAST_GEMINI_GEMS') {
        window.postMessage({
          type: 'GEMINI_GEMS_SYNC',
          gems: message.gems
        }, '*');
      }
    });

    // Notify Dashboard page that Extension is INSTALLED and ACTIVE!
    window.postMessage({ type: 'GEMINI_EXTENSION_INSTALLED', version: '2.1.0' }, '*');
    setInterval(() => {
      window.postMessage({ type: 'GEMINI_EXTENSION_INSTALLED', version: '2.1.0' }, '*');
    }, 1000);
  }
})();
