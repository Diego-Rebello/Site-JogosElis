/** Registra o PWA somente onde service workers são permitidos. */
(() => {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  if (!('serviceWorker' in navigator) || (!window.isSecureContext && !local)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(erro => {
      console.warn('Não foi possível ativar o modo offline.', erro);
    });
  });
})();
