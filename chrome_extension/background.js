// Background Service Worker for Gemini Gems Auto-Sync
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GEMS_SCRAPED_FROM_TAB') {
    // 1. Update cache with Gems scraped directly from the active Gemini tab
    const gems = message.gems;
    chrome.storage.local.set({ syncedGems: gems, lastSync: Date.now() }, () => {
      console.log('Auto-Sync: Guardados', gems.length, 'Gems da página ativa.');
      // 2. Broadcast to all open Dashboard tabs
      broadcastToDashboards(gems);
    });
  }

  if (message.type === 'REQUEST_LATEST_GEMS') {
    // Return cached Gems from local storage
    chrome.storage.local.get(['syncedGems'], (result) => {
      const gems = result.syncedGems || [];
      sendResponse({ success: true, gems: gems });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'FETCH_GEMINI_GEMS_DIRECT') {
    // Fallback: direct background fetch (may hit CORS or cookie limits depending on browser state)
    fetchGemsFromGoogleAccount().then(gems => {
      sendResponse({ success: true, gems: gems });
    }).catch(err => {
      // If direct background fetch fails, we return cached gems if available
      chrome.storage.local.get(['syncedGems'], (result) => {
        const gems = result.syncedGems || [];
        if (gems.length > 0) {
          sendResponse({ success: true, gems: gems, warning: 'Lido da cache local.' });
        } else {
          sendResponse({ success: false, error: err.message });
        }
      });
    });
    return true; // Keep channel open for async response
  }
});

// Helper function to broadcast new gems to all open Dashboard tabs
function broadcastToDashboards(gems) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      const url = tab.url || '';
      // Match typical dashboard URLs
      if (url.includes('localhost') || url.includes('github.io') || url.startsWith('file://')) {
        chrome.tabs.sendMessage(tab.id, { type: 'BROADCAST_GEMINI_GEMS', gems: gems }, () => {
          // Ignore connection errors for unrelated tabs
          if (chrome.runtime.lastError) { /* quiet */ }
        });
      }
    });
  });
}

// Background fetch helper (remains as secondary fallback option)
async function fetchGemsFromGoogleAccount() {
  const response = await fetch('https://gemini.google.com/gems/view', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Não foi possível aceder ao Gemini. Certifica-te de que tens o login feito na tua conta Google.');
  }

  const htmlText = await response.text();
  const gems = parseGemsFromHTML(htmlText);
  
  if (gems.length > 0) {
    await chrome.storage.local.set({ syncedGems: gems, lastSync: Date.now() });
  }
  return gems;
}

function parseGemsFromHTML(html) {
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

  // Regex parser fallback for raw HTML
  const titles = html.match(/"name":"([^"]+)"/g) || [];
  titles.forEach(t => {
    const name = t.replace(/"name":"/, '').replace(/"/, '');
    if (name && name.length > 2 && !name.includes('http')) {
      add(name, 'Sincronizado da conta Google Gemini', 'https://gemini.google.com/app');
    }
  });

  return gems;
}
