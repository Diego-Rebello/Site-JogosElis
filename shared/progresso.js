/**
 * progresso.js — guarda no navegador quantas partidas a Elis jogou e como foi.
 * Tudo fica em localStorage, só neste aparelho. Nada é enviado para lugar nenhum.
 *
 * Formato:
 * { "forca": { partidas, acertos, erros, melhorEstrelas, ultimaEm } }
 */

const CHAVE = 'jogos-elis:progresso';
const CHAVE_CONFIGURACOES = 'jogos-elis:configuracoes';

function armazenamentoPadrao() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

const CONFIGURACOES_PADRAO = Object.freeze({
  nomeCrianca: 'Elis',
  niveis: Object.freeze({
    forca: 'normal',
    matematica: '3',
    'm-ou-n': 'normal',
    memoria: '16',
    velha: 'PVC',
  }),
});

/**
 * Estrelas de uma rodada:
 * 3 se acertou 90% ou mais, 2 se acertou 70% ou mais, 1 por ter terminado.
 */
export function calcularEstrelas(acertos, erros) {
  const total = acertos + erros;
  if (total === 0) return 1;
  const proporcao = acertos / total;
  if (proporcao >= 0.9) return 3;
  if (proporcao >= 0.7) return 2;
  return 1;
}

/** Devolve o objeto inteiro; {} se ainda não houver nada ou se der erro. */
export function obterProgresso(armazenamento = armazenamentoPadrao()) {
  try {
    const bruto = armazenamento?.getItem(CHAVE);
    if (!bruto) return {};
    const dados = JSON.parse(bruto);
    return dados && typeof dados === 'object' ? dados : {};
  } catch {
    return {};
  }
}

function gravar(dados, armazenamento = armazenamentoPadrao()) {
  try {
    armazenamento?.setItem(CHAVE, JSON.stringify(dados));
    if (!armazenamento) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Soma uma partida ao histórico do jogo e devolve o registro atualizado.
 * `estrelas` é opcional: sem ele, sai de calcularEstrelas().
 */
export function registrarPartida(jogoId, { acertos = 0, erros = 0, estrelas } = {}, armazenamento = armazenamentoPadrao()) {
  const dados = obterProgresso(armazenamento);
  const anterior = dados[jogoId] || {
    partidas: 0,
    acertos: 0,
    erros: 0,
    melhorEstrelas: 0,
    ultimaEm: null,
  };
  const estrelasDaRodada = estrelas ?? calcularEstrelas(acertos, erros);

  const atualizado = {
    partidas: anterior.partidas + 1,
    acertos: anterior.acertos + acertos,
    erros: anterior.erros + erros,
    melhorEstrelas: Math.max(anterior.melhorEstrelas || 0, estrelasDaRodada),
    ultimaEm: new Date().toISOString(),
  };

  dados[jogoId] = atualizado;
  gravar(dados, armazenamento);
  return atualizado;
}

/** Melhor quantidade de estrelas já conquistada no jogo (0 se nunca jogou). */
export function estrelasDe(jogoId, armazenamento = armazenamentoPadrao()) {
  const registro = obterProgresso(armazenamento)[jogoId];
  return registro ? registro.melhorEstrelas || 0 : 0;
}

/** Apaga todo o progresso salvo. */
export function zerarProgresso(armazenamento = armazenamentoPadrao()) {
  try {
    armazenamento?.removeItem(CHAVE);
    if (!armazenamento) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Preferencias do adulto. Cada leitura devolve um objeto completo, mesmo se
 * ainda nao houver configuracao salva ou se o armazenamento estiver bloqueado.
 */
export function obterConfiguracoes() {
  let salvas = {};
  try {
    const bruto = localStorage.getItem(CHAVE_CONFIGURACOES);
    const dados = bruto ? JSON.parse(bruto) : {};
    if (dados && typeof dados === 'object') salvas = dados;
  } catch {
    /* Usa os valores padrao. */
  }

  const niveisSalvos = salvas.niveis && typeof salvas.niveis === 'object'
    ? salvas.niveis
    : {};

  return {
    nomeCrianca: typeof salvas.nomeCrianca === 'string' && salvas.nomeCrianca.trim()
      ? salvas.nomeCrianca.trim().slice(0, 40)
      : CONFIGURACOES_PADRAO.nomeCrianca,
    niveis: { ...CONFIGURACOES_PADRAO.niveis, ...niveisSalvos },
  };
}

/** Salva preferencias validas e devolve o objeto completo que ficou em uso. */
export function salvarConfiguracoes(novasConfiguracoes = {}) {
  const atuais = obterConfiguracoes();
  const nomeInformado = typeof novasConfiguracoes.nomeCrianca === 'string'
    ? novasConfiguracoes.nomeCrianca.trim().slice(0, 40)
    : atuais.nomeCrianca;
  const niveisInformados = novasConfiguracoes.niveis && typeof novasConfiguracoes.niveis === 'object'
    ? novasConfiguracoes.niveis
    : {};
  const atualizadas = {
    nomeCrianca: nomeInformado || CONFIGURACOES_PADRAO.nomeCrianca,
    niveis: { ...atuais.niveis, ...niveisInformados },
  };

  try {
    localStorage.setItem(CHAVE_CONFIGURACOES, JSON.stringify(atualizadas));
  } catch {
    /* As preferencias continuam valendo nesta chamada, mesmo sem persistir. */
  }
  return atualizadas;
}

/** Atalho para personalizar mensagens sem repetir a leitura defensiva. */
export function nomeDaCrianca() {
  return obterConfiguracoes().nomeCrianca;
}
