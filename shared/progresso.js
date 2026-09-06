/**
 * progresso.js — guarda no navegador quantas partidas a Elis jogou e como foi.
 * Tudo fica em localStorage, só neste aparelho. Nada é enviado para lugar nenhum.
 *
 * Formato:
 * { "forca": { partidas, acertos, erros, melhorEstrelas, ultimaEm } }
 */

const CHAVE = 'jogos-elis:progresso';

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
export function obterProgresso() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return {};
    const dados = JSON.parse(bruto);
    return dados && typeof dados === 'object' ? dados : {};
  } catch {
    return {};
  }
}

function gravar(dados) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
    return true;
  } catch {
    return false;
  }
}

/**
 * Soma uma partida ao histórico do jogo e devolve o registro atualizado.
 * `estrelas` é opcional: sem ele, sai de calcularEstrelas().
 */
export function registrarPartida(jogoId, { acertos = 0, erros = 0, estrelas } = {}) {
  const dados = obterProgresso();
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
  gravar(dados);
  return atualizado;
}

/** Melhor quantidade de estrelas já conquistada no jogo (0 se nunca jogou). */
export function estrelasDe(jogoId) {
  const registro = obterProgresso()[jogoId];
  return registro ? registro.melhorEstrelas || 0 : 0;
}

/** Apaga todo o progresso salvo. */
export function zerarProgresso() {
  try {
    localStorage.removeItem(CHAVE);
    return true;
  } catch {
    return false;
  }
}
