/**
 * Núcleo compartilhado do Labirinto de Aventuras (J13) e do Meu Primeiro
 * Labirinto (P07). Os dois jogos usam o mesmo gerador, solucionador e regras
 * de movimento; a tela do Rael escolhe tamanhos maiores e sementes estáveis
 * para oferecer dez desafios diferentes em cada nível.
 *
 * Legenda: C = carrinho, G = garagem, * = estrela, . = caminho e # = parede.
 */

export const DIRECOES = Object.freeze({
  cima: Object.freeze({ linha: -1, coluna: 0, nome: 'para cima', tecla: 'ArrowUp' }),
  direita: Object.freeze({ linha: 0, coluna: 1, nome: 'para a direita', tecla: 'ArrowRight' }),
  baixo: Object.freeze({ linha: 1, coluna: 0, nome: 'para baixo', tecla: 'ArrowDown' }),
  esquerda: Object.freeze({ linha: 0, coluna: -1, nome: 'para a esquerda', tecla: 'ArrowLeft' }),
});

export const NIVEL_POR_ETAPA = Object.freeze({ facil: 'facil', normal: 'normal', esperto: 'esperto' });

export const NIVEIS_LABIRINTO_RAEL = Object.freeze({
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

const chave = posicao => `${posicao.linha},${posicao.coluna}`;
const copiar = posicao => ({ linha: posicao.linha, coluna: posicao.coluna });

function encontrar(layout, simbolo) {
  for (let linha = 0; linha < layout.length; linha += 1) {
    const coluna = layout[linha].indexOf(simbolo);
    if (coluna >= 0) return { linha, coluna };
  }
  return null;
}

/** Devolve dez mapas grandes, reproduzíveis e diferentes para o Rael. */
export function mapasDoNivel(nivel = 'normal') {
  const escolhido = NIVEL_POR_ETAPA[nivel] || 'normal';
  const configuracao = NIVEIS_LABIRINTO_RAEL[escolhido];
  return Array.from({ length: 10 }, (_, indice) => {
    const id = `rael-${escolhido}-${indice + 1}`;
    const mapa = gerarLabirinto({ ...configuracao, semente: id });
    return {
      ...mapa,
      id,
      nivel: escolhido,
      layout: mapa.layout.map(linha => linha.replace('K', '*')),
    };
  });
}

/** Lê e valida a representação compacta usada pelo banco de mapas. */
export function analisarMapa(mapa) {
  const layout = Array.isArray(mapa?.layout) ? mapa.layout : [];
  const tamanho = layout.length;
  if (tamanho < 2 || layout.some(linha => typeof linha !== 'string' || linha.length !== tamanho)) {
    throw new Error('O mapa precisa ser uma grade quadrada.');
  }
  if (layout.some(linha => /[^CG*K12.#]/.test(linha))) throw new Error('O mapa tem um símbolo desconhecido.');
  const inicio = encontrar(layout, 'C');
  const destino = encontrar(layout, 'G');
  const itens = Object.entries(ITEM_POR_SIMBOLO).flatMap(([simbolo, id]) => {
    const posicao = encontrar(layout, simbolo);
    return posicao ? [{ id, simbolo, posicao }] : [];
  });
  const estrela = itens.find(item => item.id === 'estrela')?.posicao || null;
  if (!inicio || !destino) throw new Error('O mapa precisa de carrinho e garagem.');
  if (layout.join('').split('C').length !== 2 || layout.join('').split('G').length !== 2) {
    throw new Error('O mapa precisa de um único carrinho e uma única garagem.');
  }
  const paredes = Array.isArray(mapa.paredes) ? [...new Set(mapa.paredes.filter(item => typeof item === 'string'))] : [];
  return { ...mapa, layout: [...layout], tamanho, inicio, destino, estrela, itens, paredes, paredesSet: new Set(paredes) };
}

export function dentroDoMapa(mapa, posicao) {
  return posicao.linha >= 0 && posicao.coluna >= 0
    && posicao.linha < mapa.tamanho && posicao.coluna < mapa.tamanho;
}

export function podeOcupar(mapa, posicao) {
  return dentroDoMapa(mapa, posicao) && mapa.layout[posicao.linha][posicao.coluna] !== '#';
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

export function podeMover(mapa, origem, destino) {
  return podeOcupar(mapa, origem) && podeOcupar(mapa, destino) && !haParedeEntre(mapa, origem, destino);
}

function coletadosIniciais(mapa, recebidos) {
  if (recebidos === true) return new Set(mapa.estrela ? ['estrela'] : []);
  if (recebidos instanceof Set) return new Set(recebidos);
  if (Array.isArray(recebidos)) return new Set(recebidos);
  return new Set();
}

function itemNaPosicao(mapa, posicao) {
  return mapa.itens.find(item => chave(item.posicao) === chave(posicao));
}

function todosOsItensForamColetados(mapa, coletados) {
  return mapa.itens.every(item => coletados.has(item.id));
}

function chaveDaBusca(posicao, coletados) {
  return `${chave(posicao)}:${[...coletados].sort().join(',')}`;
}

/**
 * Encontra a menor rota válida. No modo esperto, a estrela faz parte do
 * estado da busca: chegar à garagem sem pegá-la não é uma solução.
 */
export function resolverMapa(mapaRecebido, posicaoRecebida, itensJaColetados = false) {
  const mapa = mapaRecebido.tamanho ? mapaRecebido : analisarMapa(mapaRecebido);
  const inicio = posicaoRecebida ? copiar(posicaoRecebida) : copiar(mapa.inicio);
  const coletados = coletadosIniciais(mapa, itensJaColetados);
  const itemInicial = itemNaPosicao(mapa, inicio);
  if (itemInicial) coletados.add(itemInicial.id);
  const fila = [{ posicao: inicio, coletados, rota: [] }];
  const visitados = new Set([chaveDaBusca(inicio, coletados)]);

  while (fila.length) {
    const atual = fila.shift();
    const noDestino = chave(atual.posicao) === chave(mapa.destino);
    if (noDestino && todosOsItensForamColetados(mapa, atual.coletados)) return atual.rota;

    for (const [direcao, delta] of Object.entries(DIRECOES)) {
      const proxima = { linha: atual.posicao.linha + delta.linha, coluna: atual.posicao.coluna + delta.coluna };
      if (!podeMover(mapa, atual.posicao, proxima)) continue;
      const novosColetados = new Set(atual.coletados);
      const item = itemNaPosicao(mapa, proxima);
      if (item) novosColetados.add(item.id);
      const id = chaveDaBusca(proxima, novosColetados);
      if (visitados.has(id)) continue;
      visitados.add(id);
      fila.push({ posicao: proxima, coletados: novosColetados, rota: [...atual.rota, direcao] });
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
    };
  }

  return {
    estado,
    mover(direcao) {
      if (concluida || !DIRECOES[direcao]) return { valido: false, motivo: 'parada', estado: estado() };
      const delta = DIRECOES[direcao];
      const proxima = { linha: posicao.linha + delta.linha, coluna: posicao.coluna + delta.coluna };
      if (!dentroDoMapa(mapa, proxima)) return { valido: false, motivo: 'limite', estado: estado() };
      if (!podeMover(mapa, posicao, proxima)) return { valido: false, motivo: 'parede', estado: estado() };

      posicao = proxima;
      movimentos += 1;
      trilha.push(copiar(posicao));
      const item = itemNaPosicao(mapa, posicao);
      const itemColetado = item && !itensColetados.has(item.id) ? item.id : null;
      if (itemColetado) itensColetados.add(itemColetado);
      const pegouEstrela = itemColetado === 'estrela';
      const chegouSemItens = chave(posicao) === chave(mapa.destino) && !todosOsItensForamColetados(mapa, itensColetados);
      concluida = chave(posicao) === chave(mapa.destino) && todosOsItensForamColetados(mapa, itensColetados);
      return { valido: true, itemColetado, pegouEstrela, chegouSemEstrela: chegouSemItens, chegouSemItens, concluida, estado: estado() };
    },
    dica() {
      if (concluida) return null;
      const rota = resolverMapa(mapa, posicao, itensColetados);
      if (!rota?.length) return null;
      dicas += 1;
      return {
        direcao: rota[0],
        destino: { linha: posicao.linha + DIRECOES[rota[0]].linha, coluna: posicao.coluna + DIRECOES[rota[0]].coluna },
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
  if (!Number.isInteger(tamanho) || tamanho < 3 || tamanho > 15) throw new RangeError('Tamanho de labirinto inválido.');
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
