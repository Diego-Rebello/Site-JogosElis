/**
 * Núcleo compartilhado do Labirinto de Aventuras (J13) e do Meu Primeiro
 * Labirinto (P07). Os dois jogos usam o mesmo gerador, solucionador e regras
 * de movimento; a tela do Rael escolhe tamanhos maiores, obstáculos opcionais
 * e sementes estáveis para oferecer dez desafios diferentes em cada nível.
 *
 * Legenda: C = carrinho, G = garagem, * = estrela, K = chave, S = semáforo,
 * L = alavanca, B = ponte, P = portão, X = obras, . = caminho e # = parede.
 */

export const DIRECOES = Object.freeze({
  cima: Object.freeze({ linha: -1, coluna: 0, nome: 'para cima', tecla: 'ArrowUp' }),
  direita: Object.freeze({ linha: 0, coluna: 1, nome: 'para a direita', tecla: 'ArrowRight' }),
  baixo: Object.freeze({ linha: 1, coluna: 0, nome: 'para baixo', tecla: 'ArrowDown' }),
  esquerda: Object.freeze({ linha: 0, coluna: -1, nome: 'para a esquerda', tecla: 'ArrowLeft' }),
});

export const NIVEL_POR_ETAPA = Object.freeze({ facil: 'facil', normal: 'normal', esperto: 'esperto' });

export const NIVEIS_LABIRINTO_RAEL = Object.freeze({
  facil: Object.freeze({ tamanho: 15, itensObrigatorios: 0, nome: 'Explorar' }),
  normal: Object.freeze({ tamanho: 20, itensObrigatorios: 0, nome: 'Planejar' }),
  esperto: Object.freeze({ tamanho: 25, itensObrigatorios: 0, nome: 'Combinar' }),
});

export const NIVEIS_LABIRINTO_RAEL_CLASSICO = Object.freeze({
  facil: Object.freeze({ tamanho: 9, itensObrigatorios: 0, nome: 'Caminho grande' }),
  normal: Object.freeze({ tamanho: 12, itensObrigatorios: 0, nome: 'Superlabirinto' }),
  esperto: Object.freeze({ tamanho: 15, itensObrigatorios: 1, nome: 'Desafio gigante' }),
});

export const MODOS_LABIRINTO = Object.freeze({
  explorador: Object.freeze({ tamanho: 5, itensObrigatorios: 0, nome: 'Explorador' }),
  aventureiro: Object.freeze({ tamanho: 7, itensObrigatorios: 1, nome: 'Aventureiro' }),
  desafio: Object.freeze({ tamanho: 9, itensObrigatorios: 2, nome: 'Desafio' }),
});

const ITEM_POR_SIMBOLO = Object.freeze({
  '*': 'estrela',
  K: 'chave',
  1: 'item-1',
  2: 'item-2',
});

const OBSTACULO_POR_SIMBOLO = Object.freeze({
  S: 'semaforo',
  L: 'alavanca',
  B: 'ponte',
  P: 'portao',
  X: 'obras',
});

const chave = posicao => `${posicao.linha},${posicao.coluna}`;
const copiar = posicao => ({ linha: posicao.linha, coluna: posicao.coluna });

function encontrar(layout, simbolo) {
  for (let linha = 0; linha < layout.length; linha += 1) {
    const coluna = layout[linha].indexOf(simbolo);
    if (coluna >= 0) return { linha, coluna };
  }
  return null;
}

function encontrarTodos(layout, simbolo) {
  return layout.flatMap((linha, numeroLinha) => [...linha].flatMap((valor, coluna) => (
    valor === simbolo ? [{ linha: numeroLinha, coluna }] : []
  )));
}

/** Devolve os dez mapas antigos, para o adulto poder reduzir o desafio. */
export function mapasClassicosDoNivel(nivel = 'normal') {
  const escolhido = NIVEL_POR_ETAPA[nivel] || 'normal';
  const configuracao = NIVEIS_LABIRINTO_RAEL_CLASSICO[escolhido];
  return Array.from({ length: 10 }, (_, indice) => {
    const id = `rael-classico-${escolhido}-${indice + 1}`;
    const mapa = gerarLabirinto({ ...configuracao, semente: id });
    return {
      ...mapa,
      id,
      nivel: escolhido,
      layout: mapa.layout.map(linha => linha.replace('K', '*')),
    };
  });
}

/** Devolve dez aventuras grandes, reproduzíveis e diferentes para o Rael. */
export function mapasDoNivel(nivel = 'normal', { classico = false } = {}) {
  if (classico) return mapasClassicosDoNivel(nivel);
  const escolhido = NIVEL_POR_ETAPA[nivel] || 'normal';
  const configuracao = NIVEIS_LABIRINTO_RAEL[escolhido];
  return Array.from({ length: 10 }, (_, indice) => gerarMapaDoRael(escolhido, {
    ...configuracao,
    indice,
    semente: `rael-aventura-${escolhido}-${indice + 1}`,
  }));
}

/** Lê e valida a representação compacta usada pelo banco de mapas. */
export function analisarMapa(mapa) {
  const layout = Array.isArray(mapa?.layout) ? mapa.layout : [];
  const tamanho = layout.length;
  if (tamanho < 2 || layout.some(linha => typeof linha !== 'string' || linha.length !== tamanho)) {
    throw new Error('O mapa precisa ser uma grade quadrada.');
  }
  if (layout.some(linha => /[^CG*K12SLBPX.#]/.test(linha))) throw new Error('O mapa tem um símbolo desconhecido.');
  const inicio = encontrar(layout, 'C');
  const destino = encontrar(layout, 'G');
  const itens = Object.entries(ITEM_POR_SIMBOLO).flatMap(([simbolo, id]) => (
    encontrarTodos(layout, simbolo).map((posicao, indice) => ({
      id: indice ? `${id}-${indice + 1}` : id, simbolo, posicao,
    }))
  ));
  const obstaculos = Object.entries(OBSTACULO_POR_SIMBOLO).flatMap(([simbolo, tipo]) => (
    encontrarTodos(layout, simbolo).map(posicao => ({ id: chave(posicao), simbolo, tipo, posicao }))
  ));
  const estrela = itens.find(item => item.id === 'estrela')?.posicao || null;
  if (!inicio || !destino) throw new Error('O mapa precisa de carrinho e garagem.');
  if (layout.join('').split('C').length !== 2 || layout.join('').split('G').length !== 2) {
    throw new Error('O mapa precisa de um único carrinho e uma única garagem.');
  }
  const paredes = Array.isArray(mapa.paredes) ? [...new Set(mapa.paredes.filter(item => typeof item === 'string'))] : [];
  return {
    ...mapa, layout: [...layout], tamanho, inicio, destino, estrela, itens, obstaculos,
    paredes, paredesSet: new Set(paredes),
  };
}

export function dentroDoMapa(mapa, posicao) {
  return posicao.linha >= 0 && posicao.coluna >= 0
    && posicao.linha < mapa.tamanho && posicao.coluna < mapa.tamanho;
}

export function podeOcupar(mapa, posicao) {
  return dentroDoMapa(mapa, posicao) && !['#', 'X'].includes(mapa.layout[posicao.linha][posicao.coluna]);
}

function chaveAresta(a, b) {
  return [chave(a), chave(b)].sort().join('|');
}

export function haParedeEntre(mapa, origem, destino) {
  const distancia = Math.abs(origem.linha - destino.linha) + Math.abs(origem.coluna - destino.coluna);
  if (distancia !== 1 || !podeOcupar(mapa, destino)) return true;
  const paredes = mapa.paredesSet || new Set(mapa.paredes || []);
  return paredes.has(chaveAresta(origem, destino));
}

function conjunto(valor) {
  if (valor instanceof Set) return valor;
  return new Set(Array.isArray(valor) ? valor : []);
}

function simboloNaPosicao(mapa, posicao) {
  return dentroDoMapa(mapa, posicao) ? mapa.layout[posicao.linha][posicao.coluna] : '#';
}

function motivoDoBloqueio(mapa, destino, estado = {}) {
  const simbolo = simboloNaPosicao(mapa, destino);
  const id = chave(destino);
  if (simbolo === 'S' && !conjunto(estado.semaforosVerdes).has(id)) return 'semaforo';
  if (simbolo === 'B' && !conjunto(estado.pontesBaixadas).has(id)) return 'ponte';
  if (simbolo === 'P' && !conjunto(estado.portoesAbertos).has(id)
    && !conjunto(estado.itensColetados).has('chave')) return 'portao';
  if (simbolo === 'X') return 'obras';
  return null;
}

export function podeMover(mapa, origem, destino, estado = {}) {
  return podeOcupar(mapa, origem) && podeOcupar(mapa, destino)
    && !haParedeEntre(mapa, origem, destino) && !motivoDoBloqueio(mapa, destino, estado);
}

function itemNaPosicao(mapa, posicao) {
  return mapa.itens.find(item => chave(item.posicao) === chave(posicao));
}

function todosOsItensForamColetados(mapa, coletados) {
  return mapa.itens.every(item => coletados.has(item.id));
}

function estadoInicialDaBusca(itensJaColetados = false, recebido = {}) {
  return {
    coletados: itensJaColetados instanceof Set ? new Set(itensJaColetados)
      : new Set(Array.isArray(itensJaColetados) ? itensJaColetados : []),
    semaforosVerdes: new Set(recebido.semaforosVerdes || []),
    pontesBaixadas: new Set(recebido.pontesBaixadas || []),
    alavancasAcionadas: new Set(recebido.alavancasAcionadas || []),
    portoesAbertos: new Set(recebido.portoesAbertos || []),
  };
}

function copiarEstadoDaBusca(estado) {
  return Object.fromEntries(Object.entries(estado).map(([id, valores]) => [id, new Set(valores)]));
}

function chaveDaBusca(posicao, estado) {
  return `${chave(posicao)}:${Object.values(estado)
    .map(valores => [...valores].sort().join(',')).join(':')}`;
}

function adjacentesComSimbolo(mapa, posicao, simbolo) {
  return vizinhosDaGrade(posicao, mapa.tamanho).filter(vizinho => (
    simboloNaPosicao(mapa, vizinho) === simbolo && !haParedeEntre(mapa, posicao, vizinho)
  ));
}

function transicoesDeAcao(mapa, posicao, estado) {
  const transicoes = [];
  adjacentesComSimbolo(mapa, posicao, 'S').forEach(semaforo => {
    const id = chave(semaforo);
    if (estado.semaforosVerdes.has(id)) return;
    const proximo = copiarEstadoDaBusca(estado);
    proximo.semaforosVerdes.add(id);
    transicoes.push({ passo: `esperar:${id}`, estado: proximo });
  });
  adjacentesComSimbolo(mapa, posicao, 'L').forEach(alavanca => {
    const id = chave(alavanca);
    if (estado.alavancasAcionadas.has(id)) return;
    const proximo = copiarEstadoDaBusca(estado);
    proximo.alavancasAcionadas.add(id);
    mapa.obstaculos.filter(item => item.tipo === 'ponte')
      .forEach(item => proximo.pontesBaixadas.add(item.id));
    transicoes.push({ passo: `acionar:${id}`, estado: proximo });
  });
  return transicoes;
}

/**
 * Encontra a menor rota válida. No modo esperto, a estrela faz parte do
 * estado da busca: chegar à garagem sem pegá-la não é uma solução.
 */
export function resolverMapa(mapaRecebido, posicaoRecebida, itensJaColetados = false, estadoRecebido = {}) {
  const mapa = mapaRecebido.tamanho ? mapaRecebido : analisarMapa(mapaRecebido);
  const inicio = posicaoRecebida ? copiar(posicaoRecebida) : copiar(mapa.inicio);
  const busca = estadoInicialDaBusca(itensJaColetados, estadoRecebido);
  if (itensJaColetados === true && mapa.estrela) busca.coletados.add('estrela');
  const itemInicial = itemNaPosicao(mapa, inicio);
  if (itemInicial) busca.coletados.add(itemInicial.id);
  const fila = [{ posicao: inicio, busca, rota: [] }];
  const visitados = new Set([chaveDaBusca(inicio, busca)]);

  while (fila.length) {
    const atual = fila.shift();
    const noDestino = chave(atual.posicao) === chave(mapa.destino);
    if (noDestino && todosOsItensForamColetados(mapa, atual.busca.coletados)) return atual.rota;

    for (const transicao of transicoesDeAcao(mapa, atual.posicao, atual.busca)) {
      const id = chaveDaBusca(atual.posicao, transicao.estado);
      if (visitados.has(id)) continue;
      visitados.add(id);
      fila.push({ posicao: copiar(atual.posicao), busca: transicao.estado, rota: [...atual.rota, transicao.passo] });
    }

    for (const [direcao, delta] of Object.entries(DIRECOES)) {
      const proxima = { linha: atual.posicao.linha + delta.linha, coluna: atual.posicao.coluna + delta.coluna };
      if (!podeMover(mapa, atual.posicao, proxima, {
        ...atual.busca, itensColetados: atual.busca.coletados,
      })) continue;
      const proximaBusca = copiarEstadoDaBusca(atual.busca);
      const item = itemNaPosicao(mapa, proxima);
      if (item) proximaBusca.coletados.add(item.id);
      if (simboloNaPosicao(mapa, proxima) === 'P') proximaBusca.portoesAbertos.add(chave(proxima));
      const id = chaveDaBusca(proxima, proximaBusca);
      if (visitados.has(id)) continue;
      visitados.add(id);
      fila.push({ posicao: proxima, busca: proximaBusca, rota: [...atual.rota, direcao] });
    }
  }
  return null;
}

/** Máquina de uma partida. Toda mutação fica aqui, não na camada de tela. */
export function criarPartida(mapaRecebido) {
  const mapa = analisarMapa(mapaRecebido);
  if (!resolverMapa(mapa)) throw new Error(`O mapa ${mapa.id || ''} não tem solução.`);

  let posicao = copiar(mapa.inicio);
  let itensColetados = new Set();
  let concluida = false;
  let movimentos = 0;
  let dicas = 0;
  let trilha = [copiar(posicao)];
  let semaforosVerdes = new Set();
  let pontesBaixadas = new Set();
  let alavancasAcionadas = new Set();
  let portoesAbertos = new Set();
  let rotaPlanejada = [];

  function estado() {
    return {
      mapa,
      posicao: copiar(posicao),
      coletouEstrela: itensColetados.has('estrela'),
      itensColetados: [...itensColetados],
      concluida,
      movimentos,
      dicas,
      trilha: trilha.map(copiar),
      semaforosVerdes: [...semaforosVerdes],
      pontesBaixadas: [...pontesBaixadas],
      alavancasAcionadas: [...alavancasAcionadas],
      portoesAbertos: [...portoesAbertos],
    };
  }

  function estadoParaRegras() {
    return { itensColetados, semaforosVerdes, pontesBaixadas, alavancasAcionadas, portoesAbertos };
  }

  function acaoDisponivel() {
    const semaforo = adjacentesComSimbolo(mapa, posicao, 'S')
      .find(item => !semaforosVerdes.has(chave(item)));
    if (semaforo) return { tipo: 'esperar', alvo: copiar(semaforo), id: chave(semaforo) };
    const alavanca = adjacentesComSimbolo(mapa, posicao, 'L')
      .find(item => !alavancasAcionadas.has(chave(item)));
    if (alavanca) return { tipo: 'acionar', alvo: copiar(alavanca), id: chave(alavanca) };
    return null;
  }

  return {
    estado,
    mover(direcao) {
      if (concluida || !DIRECOES[direcao]) return { valido: false, motivo: 'parada', estado: estado() };
      const delta = DIRECOES[direcao];
      const proxima = { linha: posicao.linha + delta.linha, coluna: posicao.coluna + delta.coluna };
      if (!dentroDoMapa(mapa, proxima)) return { valido: false, motivo: 'limite', estado: estado() };
      if (simboloNaPosicao(mapa, proxima) === 'X') {
        return { valido: false, motivo: 'obras', alvo: copiar(proxima), estado: estado() };
      }
      if (haParedeEntre(mapa, posicao, proxima)) return { valido: false, motivo: 'parede', estado: estado() };
      const bloqueio = motivoDoBloqueio(mapa, proxima, estadoParaRegras());
      if (bloqueio) return { valido: false, motivo: bloqueio, alvo: copiar(proxima), estado: estado() };

      posicao = proxima;
      if (rotaPlanejada[0] === direcao) rotaPlanejada.shift();
      else rotaPlanejada = [];
      movimentos += 1;
      trilha.push(copiar(posicao));
      const item = itemNaPosicao(mapa, posicao);
      const itemColetado = item && !itensColetados.has(item.id) ? item.id : null;
      if (itemColetado) itensColetados.add(itemColetado);
      const pegouEstrela = itemColetado === 'estrela';
      const abriuPortao = simboloNaPosicao(mapa, posicao) === 'P' && !portoesAbertos.has(chave(posicao));
      if (abriuPortao) portoesAbertos.add(chave(posicao));
      const chegouSemItens = chave(posicao) === chave(mapa.destino) && !todosOsItensForamColetados(mapa, itensColetados);
      concluida = chave(posicao) === chave(mapa.destino) && todosOsItensForamColetados(mapa, itensColetados);
      return {
        valido: true, itemColetado, pegouEstrela, abriuPortao,
        chegouSemEstrela: chegouSemItens, chegouSemItens, concluida, estado: estado(),
      };
    },
    acaoDisponivel,
    agir(tipoRecebido) {
      if (concluida) return { valido: false, motivo: 'parada', estado: estado() };
      const acao = acaoDisponivel();
      if (!acao || (tipoRecebido && tipoRecebido !== acao.tipo)) {
        return { valido: false, motivo: 'sem-acao', estado: estado() };
      }
      if (acao.tipo === 'esperar') semaforosVerdes.add(acao.id);
      if (acao.tipo === 'acionar') {
        alavancasAcionadas.add(acao.id);
        mapa.obstaculos.filter(item => item.tipo === 'ponte').forEach(item => pontesBaixadas.add(item.id));
      }
      const passoExecutado = `${acao.tipo}:${acao.id}`;
      if (rotaPlanejada[0] === passoExecutado) rotaPlanejada.shift();
      else rotaPlanejada = [];
      movimentos += 1;
      return { valido: true, acao: acao.tipo, alvo: acao.alvo, estado: estado() };
    },
    dica() {
      if (concluida) return null;
      if (!rotaPlanejada.length) {
        rotaPlanejada = resolverMapa(mapa, posicao, itensColetados, estadoParaRegras()) || [];
      }
      if (!rotaPlanejada.length) return null;
      dicas += 1;
      const [passo] = rotaPlanejada;
      if (!DIRECOES[passo]) {
        const [acao, id] = passo.split(':');
        const [linha, coluna] = id.split(',').map(Number);
        return { acao, destino: { linha, coluna }, estado: estado() };
      }
      return {
        direcao: passo,
        destino: { linha: posicao.linha + DIRECOES[passo].linha, coluna: posicao.coluna + DIRECOES[passo].coluna },
        estado: estado(),
      };
    },
    reiniciar() {
      posicao = copiar(mapa.inicio);
      itensColetados = new Set();
      concluida = false;
      movimentos = 0;
      dicas = 0;
      trilha = [copiar(posicao)];
      semaforosVerdes = new Set();
      pontesBaixadas = new Set();
      alavancasAcionadas = new Set();
      portoesAbertos = new Set();
      rotaPlanejada = [];
      return estado();
    },
  };
}

export function direcaoEntre(origem, destino) {
  return Object.entries(DIRECOES).find(([, delta]) => (
    origem.linha + delta.linha === destino.linha && origem.coluna + delta.coluna === destino.coluna
  ))?.[0] || null;
}

function sementeNumerica(semente) {
  if (Number.isFinite(Number(semente))) return Number(semente) >>> 0;
  return [...String(semente)].reduce((valor, caractere) => Math.imul(valor ^ caractere.charCodeAt(0), 16777619), 2166136261) >>> 0;
}

/** Gerador pseudoaleatório determinístico para testes e mapas reproduzíveis. */
export function criarGerador(semente = Date.now()) {
  let estado = sementeNumerica(semente) || 0x6d2b79f5;
  return () => {
    estado += 0x6d2b79f5;
    let valor = estado;
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1);
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61);
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
  };
}

function embaralharCom(lista, aleatorio) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function vizinhosDaGrade(posicao, tamanho) {
  return Object.values(DIRECOES).map(delta => ({
    linha: posicao.linha + delta.linha,
    coluna: posicao.coluna + delta.coluna,
  })).filter(item => item.linha >= 0 && item.coluna >= 0 && item.linha < tamanho && item.coluna < tamanho);
}

function todasAsArestas(tamanho) {
  const arestas = [];
  for (let linha = 0; linha < tamanho; linha += 1) {
    for (let coluna = 0; coluna < tamanho; coluna += 1) {
      const atual = { linha, coluna };
      if (coluna + 1 < tamanho) arestas.push(chaveAresta(atual, { linha, coluna: coluna + 1 }));
      if (linha + 1 < tamanho) arestas.push(chaveAresta(atual, { linha: linha + 1, coluna }));
    }
  }
  return arestas;
}

function distanciasNoLabirinto(tamanho, passagens, inicio) {
  const distancias = new Map([[chave(inicio), 0]]);
  const fila = [inicio];
  while (fila.length) {
    const atual = fila.shift();
    for (const vizinho of vizinhosDaGrade(atual, tamanho)) {
      if (!passagens.has(chaveAresta(atual, vizinho)) || distancias.has(chave(vizinho))) continue;
      distancias.set(chave(vizinho), distancias.get(chave(atual)) + 1);
      fila.push(vizinho);
    }
  }
  return distancias;
}

/**
 * Gera um labirinto perfeito por busca em profundidade: todas as células são
 * alcançáveis e existe um único caminho simples entre cada par de células.
 */
export function gerarLabirinto({ tamanho = 7, itensObrigatorios = 1, semente = Date.now() } = {}) {
  if (!Number.isInteger(tamanho) || tamanho < 3 || tamanho > 30) throw new RangeError('Tamanho de labirinto inválido.');
  if (![0, 1, 2].includes(itensObrigatorios)) throw new RangeError('Use zero, um ou dois itens obrigatórios.');
  const aleatorio = criarGerador(semente);
  const inicio = { linha: 0, coluna: 0 };
  const visitados = new Set([chave(inicio)]);
  const pilha = [inicio];
  const passagens = new Set();

  while (pilha.length) {
    const atual = pilha[pilha.length - 1];
    const livres = embaralharCom(vizinhosDaGrade(atual, tamanho), aleatorio)
      .filter(vizinho => !visitados.has(chave(vizinho)));
    if (!livres.length) { pilha.pop(); continue; }
    const proximo = livres[0];
    visitados.add(chave(proximo));
    passagens.add(chaveAresta(atual, proximo));
    pilha.push(proximo);
  }

  const distancias = distanciasNoLabirinto(tamanho, passagens, inicio);
  const celulas = Array.from({ length: tamanho * tamanho }, (_, indice) => ({
    linha: Math.floor(indice / tamanho), coluna: indice % tamanho,
  }));
  const destino = [...celulas].sort((a, b) => distancias.get(chave(b)) - distancias.get(chave(a)))[0];
  const candidatas = embaralharCom(celulas.filter(item => chave(item) !== chave(inicio) && chave(item) !== chave(destino)), aleatorio);
  const itens = candidatas.slice(0, itensObrigatorios);
  const simbolos = itensObrigatorios === 1 ? ['K'] : ['1', '2'];
  const layout = Array.from({ length: tamanho }, () => Array(tamanho).fill('.'));
  layout[inicio.linha][inicio.coluna] = 'C';
  layout[destino.linha][destino.coluna] = 'G';
  itens.forEach((item, indice) => { layout[item.linha][item.coluna] = simbolos[indice]; });
  const paredes = todasAsArestas(tamanho).filter(aresta => !passagens.has(aresta));
  return {
    id: `gerado-${semente}`,
    layout: layout.map(linha => linha.join('')),
    paredes,
    semente,
  };
}

export function posicoesDaRota(mapa, rota, inicio = mapa.inicio) {
  const posicoes = [copiar(inicio)];
  rota.forEach(direcao => {
    const anterior = posicoes[posicoes.length - 1];
    const delta = DIRECOES[direcao];
    if (delta) posicoes.push({ linha: anterior.linha + delta.linha, coluna: anterior.coluna + delta.coluna });
  });
  return posicoes;
}

function trocarSimbolo(layout, posicao, simbolo) {
  const linhas = layout.map(linha => [...linha]);
  linhas[posicao.linha][posicao.coluna] = simbolo;
  return linhas.map(linha => linha.join(''));
}

function alcanceSemCasa(mapa, bloqueada) {
  const visitados = new Set([chave(mapa.inicio)]);
  const fila = [mapa.inicio];
  while (fila.length) {
    const atual = fila.shift();
    vizinhosDaGrade(atual, mapa.tamanho).forEach(vizinho => {
      if (chave(vizinho) === chave(bloqueada) || visitados.has(chave(vizinho))
        || !podeOcupar(mapa, vizinho) || haParedeEntre(mapa, atual, vizinho)) return;
      visitados.add(chave(vizinho));
      fila.push(vizinho);
    });
  }
  return visitados;
}

function casaDeDesvio(mapa, barreira, rota, usadas, aleatorio) {
  const alcancaveis = alcanceSemCasa(mapa, barreira);
  const daRota = new Set(rota.map(chave));
  const candidatas = [];
  for (let linha = 0; linha < mapa.tamanho; linha += 1) {
    for (let coluna = 0; coluna < mapa.tamanho; coluna += 1) {
      const posicao = { linha, coluna };
      const id = chave(posicao);
      if (alcancaveis.has(id) && !daRota.has(id) && !usadas.has(id)
        && simboloNaPosicao(mapa, posicao) === '.') candidatas.push(posicao);
    }
  }
  return embaralharCom(candidatas, aleatorio)[0]
    || rota.find(posicao => !usadas.has(chave(posicao)) && chave(posicao) !== chave(mapa.inicio));
}

function adicionarObrasComDesvio(mapaRecebido, aleatorio) {
  const mapa = analisarMapa(mapaRecebido);
  const rota = posicoesDaRota(mapa, resolverMapa(mapa));
  const inicio = Math.max(2, Math.floor(rota.length * 0.25));
  const fim = Math.min(rota.length - 2, Math.floor(rota.length * 0.7));
  const candidatas = [];
  for (let indice = inicio; indice < fim; indice += 1) {
    const anterior = rota[indice - 1];
    const atual = rota[indice];
    const proxima = rota[indice + 1];
    if (anterior.linha === proxima.linha || anterior.coluna === proxima.coluna) continue;
    const alternativa = { linha: anterior.linha, coluna: proxima.coluna };
    if (mesmaPosicao(alternativa, atual) || simboloNaPosicao(mapa, alternativa) !== '.') continue;
    candidatas.push({ atual, anterior, proxima, alternativa });
  }
  const escolhida = embaralharCom(candidatas, aleatorio)[0];
  if (!escolhida) return mapaRecebido;
  const abrir = new Set([
    chaveAresta(escolhida.anterior, escolhida.alternativa),
    chaveAresta(escolhida.alternativa, escolhida.proxima),
  ]);
  return {
    ...mapaRecebido,
    layout: trocarSimbolo(mapa.layout, escolhida.atual, 'X'),
    paredes: mapa.paredes.filter(parede => !abrir.has(parede)),
  };
}

function mesmaPosicao(a, b) {
  return a.linha === b.linha && a.coluna === b.coluna;
}

/** Banco determinístico de aventuras P14, sem alterar as regras do jogo da Elis. */
export function gerarMapaDoRael(nivel = 'normal', {
  tamanho = NIVEIS_LABIRINTO_RAEL[nivel]?.tamanho || 20,
  semente = `rael-aventura-${nivel}`,
  indice = 0,
} = {}) {
  const escolhido = NIVEL_POR_ETAPA[nivel] || 'normal';
  const aleatorio = criarGerador(`${semente}-obstaculos`);
  let mapa = gerarLabirinto({ tamanho, itensObrigatorios: 0, semente });
  const usaObras = escolhido === 'esperto' && indice % 2 === 1;
  if (usaObras) mapa = adicionarObrasComDesvio(mapa, aleatorio);

  let analisado = analisarMapa(mapa);
  let rota = posicoesDaRota(analisado, resolverMapa(analisado));
  const usadas = new Set([chave(analisado.inicio), chave(analisado.destino)]);
  const colocarNaRota = (proporcao, simbolo) => {
    let indiceDaRota = Math.min(rota.length - 2, Math.max(1, Math.floor(rota.length * proporcao)));
    while (usadas.has(chave(rota[indiceDaRota])) && indiceDaRota < rota.length - 2) indiceDaRota += 1;
    const posicao = rota[indiceDaRota];
    mapa.layout = trocarSimbolo(mapa.layout, posicao, simbolo);
    usadas.add(chave(posicao));
    return posicao;
  };
  const atualizar = () => {
    analisado = analisarMapa(mapa);
    rota = posicoesDaRota(analisado, resolverMapa(analisado));
  };

  if (escolhido === 'facil') {
    colocarNaRota(0.48, 'S');
  } else if (escolhido === 'normal') {
    colocarNaRota(0.25, 'S');
    const ponte = colocarNaRota(0.7, 'B');
    const alavanca = casaDeDesvio(analisado, ponte, rota, usadas, aleatorio);
    mapa.layout = trocarSimbolo(mapa.layout, alavanca, 'L');
  } else {
    if (!usaObras) colocarNaRota(0.15, 'S');
    const portao = colocarNaRota(0.34, 'P');
    const chaveDoPortao = casaDeDesvio(analisado, portao, rota, usadas, aleatorio);
    mapa.layout = trocarSimbolo(mapa.layout, chaveDoPortao, 'K');
    usadas.add(chave(chaveDoPortao));
    atualizar();
    const ponte = colocarNaRota(0.7, 'B');
    const alavanca = casaDeDesvio(analisado, ponte, rota, usadas, aleatorio);
    mapa.layout = trocarSimbolo(mapa.layout, alavanca, 'L');
    usadas.add(chave(alavanca));
    atualizar();
    colocarNaRota(0.86, '*');
  }

  return { ...mapa, id: `rael-aventura-${escolhido}-${indice + 1}`, nivel: escolhido, aventura: true };
}

export function gerarMapaDoModo(modo = 'aventureiro', { semente = Date.now() } = {}) {
  const configuracao = MODOS_LABIRINTO[modo] || MODOS_LABIRINTO.aventureiro;
  return { ...gerarLabirinto({ ...configuracao, semente }), modo, nomeDoModo: configuracao.nome };
}

/** No J13 terminar sempre vale uma estrela; pedir pouca ou nenhuma dica vale mais. */
export function calcularEstrelasLabirinto(dicas = 0, mapasConcluidos = 3) {
  if (mapasConcluidos < 3) return 0;
  if (dicas === 0) return 3;
  if (dicas <= 3) return 2;
  return 1;
}
