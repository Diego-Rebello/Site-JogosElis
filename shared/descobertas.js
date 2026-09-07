/**
 * descobertas.js — o que a área Primeiras Descobertas (Jogos do Rael) guarda
 * no aparelho: preferências do adulto, rodadas concluídas e álbum de figurinhas.
 *
 * Fica tudo numa chave só, `jogos-elis:descobertas`, separada da chave de
 * progresso da Elis. Assim o Mural de Conquistas continua somando apenas os
 * jogos dela, "Zerar progresso" nas configurações dela não apaga o álbum dele,
 * e o contrário também vale.
 *
 * Aqui não existe estrela nem recorde de propósito (seção 6.0 do MELHORIAS):
 * cada rodada terminada rende uma figurinha, com ajuda ou sem ajuda.
 */

const CHAVE = 'jogos-elis:descobertas';

export const ALTERNATIVAS_VALIDAS = [2, 3, 4];
export const VOZES_VALIDAS = ['auto', 'gravada', 'sintetizada', 'sem-fala'];

const PADRAO = Object.freeze({
  versao: 1,
  nome: 'Rael',
  alternativas: 3,
  tema: 'tudo',
  voz: 'auto',
});

/**
 * As figurinhas do álbum são figuras do catálogo escolhidas por serem
 * bonitas de colecionar. A ordem é a ordem em que vão aparecendo.
 */
export const FIGURINHAS = [
  'dinossauro', 'foguete', 'leao', 'borboleta', 'estrela', 'trator',
  'pinguim', 'tartaruga', 'urso', 'elefante', 'bolo', 'melancia',
  'helicoptero', 'barco', 'arvore', 'coelho', 'macaco', 'trem',
];

function armazenamentoPadrao() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function ler(armazenamento) {
  try {
    const bruto = armazenamento?.getItem(CHAVE);
    if (!bruto) return {};
    const dados = JSON.parse(bruto);
    return dados && typeof dados === 'object' ? dados : {};
  } catch {
    return {};
  }
}

function gravar(dados, armazenamento) {
  try {
    armazenamento?.setItem(CHAVE, JSON.stringify(dados));
    return Boolean(armazenamento);
  } catch {
    return false;
  }
}

/** Só letras, espaço e hífen; até 15 caracteres. Sem sobrenome, sem cadastro. */
function limparNome(valor, anterior) {
  if (typeof valor !== 'string') return anterior;
  const limpo = valor.replace(/[^\p{L}\s-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 15);
  return limpo || anterior;
}

/**
 * Devolve o estado inteiro, sempre completo, mesmo sem nada salvo ou com o
 * armazenamento bloqueado.
 */
export function obterEstado(armazenamento = armazenamentoPadrao()) {
  const salvo = ler(armazenamento);
  const alternativas = Number(salvo.alternativas);
  return {
    versao: PADRAO.versao,
    nome: limparNome(salvo.nome, PADRAO.nome),
    alternativas: ALTERNATIVAS_VALIDAS.includes(alternativas) ? alternativas : PADRAO.alternativas,
    tema: typeof salvo.tema === 'string' && salvo.tema ? salvo.tema : PADRAO.tema,
    voz: VOZES_VALIDAS.includes(salvo.voz) ? salvo.voz : PADRAO.voz,
    atividades: salvo.atividades && typeof salvo.atividades === 'object' ? salvo.atividades : {},
    figurinhas: Array.isArray(salvo.figurinhas) ? salvo.figurinhas.filter(id => typeof id === 'string') : [],
  };
}

/** As preferências do adulto, sem o progresso junto. */
export function obterConfiguracoes(armazenamento = armazenamentoPadrao()) {
  const { nome, alternativas, tema, voz } = obterEstado(armazenamento);
  return { nome, alternativas, tema, voz };
}

/** Salva o que veio, mantém o resto e devolve as preferências que ficaram valendo. */
export function salvarConfiguracoes(novas = {}, armazenamento = armazenamentoPadrao()) {
  const estado = obterEstado(armazenamento);
  const alternativas = Number(novas.alternativas);
  const atualizado = {
    ...estado,
    nome: limparNome(novas.nome, estado.nome),
    alternativas: ALTERNATIVAS_VALIDAS.includes(alternativas) ? alternativas : estado.alternativas,
    tema: typeof novas.tema === 'string' && novas.tema ? novas.tema : estado.tema,
    voz: VOZES_VALIDAS.includes(novas.voz) ? novas.voz : estado.voz,
  };
  gravar(atualizado, armazenamento);
  const { nome, tema, voz } = atualizado;
  return { nome, alternativas: atualizado.alternativas, tema, voz };
}

/**
 * A próxima figurinha do álbum: a primeira da lista que ainda não foi ganha.
 * Com o álbum completo, recomeça do início — colecionar de novo não é problema.
 */
export function proximaFigurinha(armazenamento = armazenamentoPadrao()) {
  const ganhas = new Set(obterEstado(armazenamento).figurinhas);
  return FIGURINHAS.find(id => !ganhas.has(id)) || FIGURINHAS[0];
}

/**
 * Guarda uma rodada concluída e entrega a figurinha. Sem acertos, sem erros e
 * sem estrelas: terminar já basta.
 */
export function registrarRodada(atividade, { figurinha } = {}, armazenamento = armazenamentoPadrao()) {
  const estado = obterEstado(armazenamento);
  const anterior = estado.atividades[atividade] || { rodadas: 0, ultimaEm: null };
  const premio = figurinha || proximaFigurinha(armazenamento);

  estado.atividades[atividade] = {
    rodadas: (Number(anterior.rodadas) || 0) + 1,
    ultimaEm: new Date().toISOString(),
  };
  if (premio && !estado.figurinhas.includes(premio)) estado.figurinhas.push(premio);

  gravar(estado, armazenamento);
  return { figurinha: premio, atividade: estado.atividades[atividade], figurinhas: [...estado.figurinhas] };
}

/** O álbum para a página inicial da etapa. */
export function obterAlbum(armazenamento = armazenamentoPadrao()) {
  const estado = obterEstado(armazenamento);
  const rodadas = Object.values(estado.atividades)
    .reduce((total, item) => total + (Number(item?.rodadas) || 0), 0);
  return {
    figurinhas: estado.figurinhas,
    total: FIGURINHAS.length,
    rodadas,
    atividades: estado.atividades,
  };
}

/** Quantas rodadas uma atividade já teve. */
export function rodadasDe(atividade, armazenamento = armazenamentoPadrao()) {
  return Number(obterEstado(armazenamento).atividades[atividade]?.rodadas) || 0;
}

/** Apaga só o álbum e as rodadas. As preferências do adulto continuam. */
export function zerarAlbum(armazenamento = armazenamentoPadrao()) {
  const estado = obterEstado(armazenamento);
  estado.atividades = {};
  estado.figurinhas = [];
  return gravar(estado, armazenamento);
}
