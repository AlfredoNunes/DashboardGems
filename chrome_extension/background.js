// Background Service Worker for Direct Gemini Fetch
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_GEMINI_GEMS_DIRECT') {
    fetchGemsFromGoogleAccount().then(gems => {
      sendResponse({ success: true, gems: gems });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true; // Keep channel open for async response
  }
});

async function fetchGemsFromGoogleAccount() {
  const response = await fetch('https://gemini.google.com/gems/view', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Não foi possível aceder ao Gemini. Certifica-te de que tens o login feito na tua conta Google.');
  }

  const htmlText = await response.text();

  // Parse HTML
  const gems = parseGemsFromHTML(htmlText);
  await chrome.storage.local.set({ syncedGems: gems, lastSync: Date.now() });

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

  // Regex extraction from raw HTML text (handles Angular/Lit SSR & client data)
  // Look for JSON or HTML blocks containing Gem names & descriptions
  const gemIdMatches = html.matchAll(/gems\/view\?gem_id=([a-zA-Z0-9_-]+)/g);
  for (const match of gemIdMatches) {
    const gemId = match[1];
    add('Gem ' + gemId, 'Gemid: ' + gemId, 'https://gemini.google.com/app?gem_id=' + gemId);
  }

  // Parse text using DOMParser if browser DOM available or regex
  // Extract text patterns: Name followed by Description
  const titles = html.match(/"name":"([^"]+)"/g) || [];
  titles.forEach(t => {
    const name = t.replace(/"name":"/, '').replace(/"/, '');
    if (name && name.length > 2 && !name.includes('http')) {
      add(name, 'Sincronizado da conta Google Gemini', 'https://gemini.google.com/app');
    }
  });

  return gems;
}
