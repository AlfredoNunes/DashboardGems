// Content Script Bridge
(function() {
  // Listen for requests from Dashboard page
  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'REQUEST_GEMINI_DIRECT_FETCH') {
      try {
        chrome.runtime.sendMessage({ type: 'FETCH_GEMINI_GEMS_DIRECT' }, (response) => {
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
              error: response ? response.error : 'Erro ao comunicar com a extensão'
            }, '*');
          }
        });
      } catch (e) {
        window.postMessage({
          type: 'GEMINI_GEMS_SYNC_RESPONSE',
          success: false,
          error: e.message
        }, '*');
      }
    }
  });

  // Notify Dashboard page that Extension is INSTALLED and ACTIVE!
  window.postMessage({ type: 'GEMINI_EXTENSION_INSTALLED', version: '2.0.0' }, '*');
  setInterval(() => {
    window.postMessage({ type: 'GEMINI_EXTENSION_INSTALLED', version: '2.0.0' }, '*');
  }, 2000);
})();
