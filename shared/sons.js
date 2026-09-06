/**
 * sons.js — efeitos sonoros gerados na hora com a Web Audio API.
 * Nenhum arquivo de áudio: o site continua leve e funciona offline.
 *
 * O iOS só deixa criar/retomar o AudioContext dentro de um gesto do usuário,
 * por isso ele nasce apenas na primeira chamada de `tocar()`.
 */

const CHAVE_MUDO = 'jogos-elis:mudo';

let contexto = null;

/** localStorage pode falhar (modo privado antigo, iframe bloqueado). */
function lerMudo() {
  try {
    return localStorage.getItem(CHAVE_MUDO) === '1';
  } catch {
    return false;
  }
}

function gravarMudo(valor) {
  try {
    localStorage.setItem(CHAVE_MUDO, valor ? '1' : '0');
  } catch {
    /* sem persistência: o mudo vale só para esta página */
  }
}

export function estaMudo() {
  return lerMudo();
}

export function definirMudo(valor) {
  gravarMudo(valor);
  return valor;
}

/** Alterna e devolve o novo estado (true = mudo). */
export function alternarMudo() {
  return definirMudo(!lerMudo());
}

function obterContexto() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) return null;
  if (!contexto) contexto = new Audio();
  // Depois de um gesto do usuário o contexto suspenso volta a funcionar.
  if (contexto.state === 'suspended') contexto.resume();
  return contexto;
}

/**
 * Toca uma nota. `inicio` é o atraso em segundos a partir de agora,
 * o que permite montar arpejos sem encadear setTimeout.
 */
function nota(ctx, { frequencia, duracao, tipo = 'sine', volume = 0.18, inicio = 0 }) {
  const t0 = ctx.currentTime + inicio;
  const oscilador = ctx.createOscillator();
  const ganho = ctx.createGain();

  oscilador.type = tipo;
  oscilador.frequency.setValueAtTime(frequencia, t0);

  // Envelope curto: sobe rápido e desce até zero, senão o som "estala".
  ganho.gain.setValueAtTime(0.0001, t0);
  ganho.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  ganho.gain.exponentialRampToValueAtTime(0.0001, t0 + duracao);

  oscilador.connect(ganho);
  ganho.connect(ctx.destination);
  oscilador.start(t0);
  oscilador.stop(t0 + duracao + 0.02);
}

// Frequências das notas usadas (em hertz).
const DO5 = 523.25;
const MI5 = 659.25;
const SOL5 = 783.99;
const DO6 = 1046.5;

const RECEITAS = {
  // Tique curtinho de confirmação.
  clique: ctx => nota(ctx, { frequencia: 880, duracao: 0.03, tipo: 'triangle', volume: 0.12 }),

  // Duas notas subindo: dó → mi.
  acerto: ctx => {
    nota(ctx, { frequencia: DO5, duracao: 0.12, inicio: 0 });
    nota(ctx, { frequencia: MI5, duracao: 0.12, inicio: 0.12 });
  },

  // Grave e quadrado, mas baixinho: avisa sem assustar.
  erro: ctx => nota(ctx, { frequencia: 200, duracao: 0.2, tipo: 'square', volume: 0.08 }),

  // Arpejo dó–mi–sol–dó.
  vitoria: ctx => {
    [DO5, MI5, SOL5, DO6].forEach((frequencia, i) => {
      nota(ctx, { frequencia, duracao: 0.1, inicio: i * 0.1, volume: 0.2 });
    });
  },
};

/** Toca 'clique', 'acerto', 'erro' ou 'vitoria'. Não faz nada no mudo. */
export function tocar(nome) {
  if (lerMudo()) return;
  const receita = RECEITAS[nome];
  if (!receita) return;
  try {
    const ctx = obterContexto();
    if (ctx) receita(ctx);
  } catch {
    /* som é enfeite: se falhar, o jogo continua */
  }
}
