/* Este arquivo é um modelo. build-all.sh injeta a versão e a lista de arquivos. */
const VERSAO = '__VERSAO__';
const CACHE_ATUAL = `jogos-da-elis-${VERSAO}`;
const ARQUIVOS_PRECACHE = __ARQUIVOS_PRECACHE__;

self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_ATUAL)
      .then(cache => cache.addAll(ARQUIVOS_PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves
        .filter(chave => chave.startsWith('jogos-da-elis-') && chave !== CACHE_ATUAL)
        .map(chave => caches.delete(chave))))
      .then(() => self.clients.claim()),
  );
});

async function buscarNoCache(requisicao) {
  const cache = await caches.open(CACHE_ATUAL);
  const direta = await cache.match(requisicao, { ignoreSearch: true });
  if (direta) return direta;

  // O Netlify pode normalizar /Games/ para /games/. Esta comparação mantém o
  // cache offline funcionando sem duplicar arquivos ou alterar hashes.
  const caminho = new URL(requisicao.url).pathname.toLowerCase();
  const equivalente = (await cache.keys()).find(item => new URL(item.url).pathname.toLowerCase() === caminho);
  return equivalente ? cache.match(equivalente) : undefined;
}

async function paginaComRedePrimeiro(requisicao) {
  const cache = await caches.open(CACHE_ATUAL);
  try {
    const resposta = await fetch(requisicao);
    if (resposta.ok) await cache.put(requisicao, resposta.clone());
    return resposta;
  } catch {
    return (await buscarNoCache(requisicao)) || buscarNoCache(new Request('/index.html'));
  }
}

self.addEventListener('fetch', evento => {
  const requisicao = evento.request;
  if (requisicao.method !== 'GET' || new URL(requisicao.url).origin !== self.location.origin) return;

  const caminho = new URL(requisicao.url).pathname;
  const pagina = requisicao.mode === 'navigate' || caminho.endsWith('/') || caminho.endsWith('.html');
  evento.respondWith(pagina
    ? paginaComRedePrimeiro(requisicao)
    : buscarNoCache(requisicao).then(resposta => resposta || fetch(requisicao)));
});
