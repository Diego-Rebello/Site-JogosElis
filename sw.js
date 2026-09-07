/* Este arquivo é um modelo. build-all.sh injeta a versão e a lista de arquivos. */
const VERSAO = '__VERSAO__';
const CACHE_ATUAL = `jogos-da-elis-${VERSAO}`;
const ARQUIVOS_PRECACHE = __ARQUIVOS_PRECACHE__;

/**
 * Guarda a resposta no cache tirando a marca de "redirecionada".
 *
 * O Netlify responde /Games/forca/ com um 301 para /games/forca/. O fetch
 * segue o desvio e traz o conteúdo certo, mas a resposta fica marcada como
 * redirecionada — e o navegador se recusa a usar uma resposta assim para
 * uma navegação. Era isso que deixava os cinco jogos fora do ar no modo
 * avião, enquanto a página inicial (que não redireciona) abria normal.
 * Recriar a Response descarta essa marca.
 */
async function guardarSemDesvio(cache, endereco, resposta) {
  if (!resposta.ok) return false;
  const limpa = resposta.redirected
    ? new Response(await resposta.blob(), {
        status: resposta.status,
        statusText: resposta.statusText,
        headers: resposta.headers,
      })
    : resposta;
  await cache.put(endereco, limpa);
  return true;
}

/**
 * Baixa um endereço de cada vez em vez de usar cache.addAll: com addAll,
 * um único endereço com problema derruba a instalação inteira e o site
 * fica sem modo offline nenhum.
 */
async function precarregar() {
  const cache = await caches.open(CACHE_ATUAL);
  const resultados = await Promise.allSettled(ARQUIVOS_PRECACHE.map(async endereco => {
    const resposta = await fetch(endereco, { cache: 'reload' });
    if (!await guardarSemDesvio(cache, endereco, resposta)) {
      throw new Error(`${endereco} respondeu ${resposta.status}`);
    }
  }));
  const falhas = resultados.filter(r => r.status === 'rejected');
  if (falhas.length) console.warn('[sw] ficaram fora do cache:', falhas.map(f => f.reason.message));
}

self.addEventListener('install', evento => {
  evento.waitUntil(precarregar().then(() => self.skipWaiting()));
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
    // clone() porque o corpo só pode ser lido uma vez.
    if (resposta.ok) await guardarSemDesvio(cache, requisicao, resposta.clone());
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
