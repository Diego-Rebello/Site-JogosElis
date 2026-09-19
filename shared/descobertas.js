/**
 * descobertas.js — o que a área Primeiras Descobertas (Jogos do Rael) guarda
 * no aparelho: preferências do adulto, rodadas concluídas e álbum de figurinhas.
 *
 * Fica tudo numa chave só, `jogos-elis:descobertas`, separada da chave de
 * progresso da Elis. Assim o Mural de Conquistas continua somando apenas os
 * jogos dela, "Zerar progresso" nas configurações dela não apaga o álbum dele,
 * e o contrário também vale.
 *
 * Aqui não existe estrela nem recorde de propósito (seção 5.0 do MELHORIAS):
 * cada rodada terminada rende uma figurinha, com ajuda ou sem ajuda. Desde a
 * P15 o álbum também tem conquistas, que reconhecem feitos dentro das
 * brincadeiras; o catálogo e as regras delas ficam em conquistas-descobertas.js.
 *
 * Versão 2 do estado: `marcas` (o resumo acumulado dos feitos) e `conquistas`
 * (`{ id: data em que foi ganha }`). Um estado da versão 1 continua valendo.
 */

import {
  CONQUISTAS, acumularFeitos, avaliarConquistas, limparMarcas, resumirConquista,
} from './conquistas-descobertas.js';

const CHAVE = 'jogos-elis:descobertas';

export const ALTERNATIVAS_VALIDAS = [2, 3, 4];
export const VOZES_VALIDAS = ['auto', 'gravada', 'sintetizada', 'sem-fala'];
export const LABIRINTOS_VALIDOS = ['aventura', 'classico'];
export const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const PADRAO = Object.freeze({
  versao: 2,
  nome: 'Rael',
  alternativas: 3,
  tema: 'tudo',
  voz: 'auto',
  labirinto: 'aventura',
});

/** Vogais, letras do primeiro nome e um pequeno conjunto frequente. */
export function letrasIniciais(nome = PADRAO.nome) {
  const doNome = String(nome).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
    .split('').filter(letra => ALFABETO.includes(letra));
  return [...new Set([...doNome, ...'AEIOU', ...'BMPLS'])];
}

export function normalizarLetras(letras, nome = PADRAO.nome) {
  if (!Array.isArray(letras)) return letrasIniciais(nome);
  const limpas = [...new Set(letras.map(letra => String(letra).toUpperCase())
    .filter(letra => ALFABETO.includes(letra)))];
  return limpas.length >= 2 ? limpas : letrasIniciais(nome);
}

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
  const nome = limparNome(salvo.nome, PADRAO.nome);
  return {
    versao: PADRAO.versao,
    nome,
    alternativas: ALTERNATIVAS_VALIDAS.includes(alternativas) ? alternativas : PADRAO.alternativas,
    tema: typeof salvo.tema === 'string' && salvo.tema ? salvo.tema : PADRAO.tema,
    voz: VOZES_VALIDAS.includes(salvo.voz) ? salvo.voz : PADRAO.voz,
    labirinto: LABIRINTOS_VALIDOS.includes(salvo.labirinto) ? salvo.labirinto : PADRAO.labirinto,
    letras: normalizarLetras(salvo.letras, nome),
    atividades: salvo.atividades && typeof salvo.atividades === 'object' ? salvo.atividades : {},
    figurinhas: Array.isArray(salvo.figurinhas) ? salvo.figurinhas.filter(id => typeof id === 'string') : [],
    marcas: limparMarcas(salvo.marcas),
    conquistas: lerConquistas(salvo),
  };
}

function limparConquistas(conquistas) {
  if (!conquistas || typeof conquistas !== 'object' || Array.isArray(conquistas)) return {};
  return Object.fromEntries(Object.entries(conquistas).filter(([, data]) => typeof data === 'string'));
}

/**
 * Um estado da versão 1 ainda não tem conquistas. Na primeira leitura ele
 * ganha as que dá para deduzir das rodadas e das figurinhas, com a data de
 * agora e sem festa: quem já brincou não começa a coleção do zero. Ids que o
 * catálogo não conhece mais são mantidos; a tela só os ignora.
 */
function lerConquistas(salvo) {
  if (Object.hasOwn(salvo, 'conquistas')) return limparConquistas(salvo.conquistas);
  const contexto = {
    atividades: salvo.atividades && typeof salvo.atividades === 'object' ? salvo.atividades : {},
    marcas: limparMarcas(salvo.marcas),
    figurinhas: Array.isArray(salvo.figurinhas) ? salvo.figurinhas.filter(id => typeof id === 'string') : [],
  };
  const agora = new Date().toISOString();
  return Object.fromEntries(avaliarConquistas(contexto).map(conquista => [conquista.id, agora]));
}

/** As preferências do adulto, sem o progresso junto. */
export function obterConfiguracoes(armazenamento = armazenamentoPadrao()) {
  const { nome, alternativas, tema, voz, labirinto, letras } = obterEstado(armazenamento);
  return { nome, alternativas, tema, voz, labirinto, letras };
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
    labirinto: LABIRINTOS_VALIDOS.includes(novas.labirinto) ? novas.labirinto : estado.labirinto,
  };
  if (Object.hasOwn(novas, 'letras')) {
    atualizado.letras = normalizarLetras(novas.letras, atualizado.nome);
  }
  gravar(atualizado, armazenamento);
  const { nome, tema, voz, labirinto, letras } = atualizado;
  return { nome, alternativas: atualizado.alternativas, tema, voz, labirinto, letras };
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
 *
 * `feitos` é opcional e diz o que aconteceu na rodada (hoje só o labirinto
 * manda). A resposta traz `conquistasNovas`: as que esta rodada acabou de
 * alcançar, prontas para a tela de fim celebrar.
 */
export function registrarRodada(atividade, { figurinha, feitos } = {}, armazenamento = armazenamentoPadrao()) {
  const estado = obterEstado(armazenamento);
  const anterior = estado.atividades[atividade] || { rodadas: 0, ultimaEm: null };
  const premio = figurinha || proximaFigurinha(armazenamento);

  estado.atividades[atividade] = {
    rodadas: (Number(anterior.rodadas) || 0) + 1,
    ultimaEm: new Date().toISOString(),
  };
  if (premio && !estado.figurinhas.includes(premio)) estado.figurinhas.push(premio);

  estado.marcas = acumularFeitos(atividade, estado.marcas, feitos);
  const contexto = contextoDe(estado);
  const agora = new Date().toISOString();
  const novas = avaliarConquistas(contexto, estado.conquistas);
  novas.forEach(conquista => { estado.conquistas[conquista.id] = agora; });

  gravar(estado, armazenamento);
  return {
    figurinha: premio,
    atividade: estado.atividades[atividade],
    figurinhas: [...estado.figurinhas],
    conquistasNovas: novas.map(conquista => resumirConquista(conquista, contexto, estado.conquistas)),
  };
}

function contextoDe(estado) {
  return { atividades: estado.atividades, marcas: estado.marcas, figurinhas: estado.figurinhas };
}

/** O catálogo inteiro com progresso e data, para o álbum e as configurações. */
function conquistasDoEstado(estado) {
  const contexto = contextoDe(estado);
  return CONQUISTAS.map(conquista => resumirConquista(conquista, contexto, estado.conquistas));
}

/** O álbum para a página inicial da etapa. */
export function obterAlbum(armazenamento = armazenamentoPadrao()) {
  const estado = obterEstado(armazenamento);
  const rodadas = Object.values(estado.atividades)
    .reduce((total, item) => total + (Number(item?.rodadas) || 0), 0);
  const conquistas = conquistasDoEstado(estado);
  return {
    figurinhas: estado.figurinhas,
    total: FIGURINHAS.length,
    rodadas,
    atividades: estado.atividades,
    conquistas,
    conquistasGanhas: conquistas.filter(conquista => conquista.ganha).length,
    totalConquistas: conquistas.length,
  };
}

/** As conquistas de uma brincadeira, para a faixa da tela de convite. */
export function conquistasDaAtividade(atividade, armazenamento = armazenamentoPadrao()) {
  return conquistasDoEstado(obterEstado(armazenamento)).filter(conquista => conquista.atividade === atividade);
}

/**
 * O botão de dificuldade da etapa é um só: o número de alternativas.
 * Nas atividades que não são de escolher entre figuras (Encaixe as Figuras,
 * Palmas nas Palavras, Meu Nome), ele é lido como nível. Assim o adulto mexe
 * num lugar só e nada vira desbloqueio obrigatório.
 */
export function nivelDaEtapa(armazenamento = armazenamentoPadrao()) {
  const { alternativas } = obterEstado(armazenamento);
  if (alternativas <= 2) return 'facil';
  return alternativas >= 4 ? 'esperto' : 'normal';
}

/** Quantas rodadas uma atividade já teve. */
export function rodadasDe(atividade, armazenamento = armazenamentoPadrao()) {
  return Number(obterEstado(armazenamento).atividades[atividade]?.rodadas) || 0;
}

/** Apaga o álbum, as rodadas e as conquistas. As preferências do adulto continuam. */
export function zerarAlbum(armazenamento = armazenamentoPadrao()) {
  const estado = obterEstado(armazenamento);
  estado.atividades = {};
  estado.figurinhas = [];
  estado.marcas = {};
  estado.conquistas = {};
  return gravar(estado, armazenamento);
}
