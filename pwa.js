/* Homepage installation promotion; native installation always follows a user tap. */
(() => {
  const panel = document.getElementById('install-panel');
  const instructions = document.getElementById('install-instructions');
  const install = document.getElementById('install-app');
  const shortcut = document.getElementById('show-install');
  const dismissKey = 'eduGames.installDismissed.v1';
  const standalone = window.matchMedia('(display-mode: standalone)');
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && window.matchMedia('(max-width: 1366px)').matches);
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferredPrompt;
  let dismissed = false;
  try { dismissed = Date.now() - Number(localStorage.getItem(dismissKey)) < 7 * 24 * 60 * 60 * 1000; } catch {}
  function isInstalled() { return standalone.matches || navigator.standalone === true; }
  function show() {
    if (!mobile || isInstalled()) return;
    panel.hidden = false;
    install.hidden = !deferredPrompt;
    instructions.textContent = deferredPrompt
      ? 'Install Educational Games for quick access from your home screen.'
      : ios
        ? 'Open the browser’s Share menu, choose Add to Home Screen, then tap Add. If the option is unavailable, open this page in Safari.'
        : 'Open your browser’s menu and choose Install app or Add to Home screen, then follow the prompts.';
  }
  function hideInstalled() { if (isInstalled()) { panel.hidden = true; shortcut.hidden = true; } }
  shortcut.hidden = !mobile || isInstalled();
  shortcut.addEventListener('click', show);
  document.getElementById('dismiss-install').addEventListener('click', () => {
    panel.hidden = true; dismissed = true;
    try { localStorage.setItem(dismissKey, String(Date.now())); } catch {}
  });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); deferredPrompt = event;
    if (!dismissed) show();
  });
  install.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    const prompt = deferredPrompt; deferredPrompt = null; install.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') { panel.hidden = true; shortcut.hidden = true; }
      else { panel.hidden = true; }
    } catch { show(); }
    finally { install.disabled = false; install.hidden = true; }
  });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; panel.hidden = true; shortcut.hidden = true; });
  standalone.addEventListener('change', hideInstalled);
  if (!dismissed) show();
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Offline support unavailable:', error));
  }
})();
