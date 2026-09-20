/**
 * Motor do Chute a Gol.
 *
 * Portado de https://github.com/hackingstar124/Football-game-in-HTML (ani.js),
 * de hackingstar124, licenca Apache 2.0 (copia em LICENSE-Football-game-in-HTML.txt).
 * Aqui as contas do ani.js viram funcoes puras, sem DOM, para dar para testar:
 * moveStriker/moveFootball -> moverNoCampo, checkGoal -> ehGol/resultadoDoChute.
 *
 * Mudancas em relacao ao original:
 * - o original lia `footballPos` sem declarar dentro do setInterval do goleiro
 *   (ReferenceError a cada 25 ms); aqui o goleiro vai e volta pela boca do gol,
 *   que e o que a animacao goalkeeperMove do ev.css fazia de fato;
 * - checkGoal ignorava o goleiro; aqui a defesa conta.
 */

/** Passo de cada toque em A/D, como no original (10 px). */
export const PASSO = 10;

/** Passo em graus para cada toque de mira. */
export const PASSO_ANGULO = 2.5;

/** Limites do ângulo de mira (em graus), cobrindo a boca do gol, as traves e para fora. */
export const ANGULO_MINIMO = -35;
export const ANGULO_MAXIMO = 35;

/** Penaltis por rodada. */
export const QUANTIDADE_DE_CHUTES = 5;

/** Tempo da animacao do chute, em ms (o `shoot 1s` do ev.css). */
export const DURACAO_DO_CHUTE = 1000;

/**
 * Ajusta o ângulo de mira dentro dos limites permitidos.
 */
export function ajustarAngulo(anguloAtual, delta, min = ANGULO_MINIMO, max = ANGULO_MAXIMO) {
  const atual = Number(anguloAtual) || 0;
  const d = Number(delta) || 0;
  return Math.max(min, Math.min(max, atual + d));
}

/**
 * Calcula a posição horizontal (X) onde a bola cruzará a linha do gol com base no ângulo.
 */
export function calcularImpactoNoGol({ origemX, distanciaY, anguloGraus }) {
  const x = Number(origemX) || 0;
  const y = Math.max(0, Number(distanciaY) || 0);
  const angulo = Number(anguloGraus) || 0;
  const radianos = (angulo * Math.PI) / 180;
  const deltaX = y * Math.tan(radianos);
  return x + deltaX;
}

/**
 * moveStriker/moveFootball do original: soma a distancia e prende nas bordas.
 * O original usava window.innerWidth; aqui entra a largura do campo.
 */
export function moverNoCampo(posicao, distancia, largura) {
  const atual = Number(posicao) || 0;
  const passo = Number(distancia) || 0;
  const limite = Math.max(0, Number(largura) || 0);
  return Math.max(0, Math.min(limite, atual + passo));
}

/**
 * checkGoal do original: a area de gol vai de goalpostPos - metade da largura
 * ate goalpostPos + metade da largura.
 */
export function areaDoGol(goalpostPos, goalpostLargura) {
  const centro = Number(goalpostPos) || 0;
  const meia = (Number(goalpostLargura) || 0) * 0.5;
  return { inicio: centro - meia, fim: centro + meia };
}

/** A mesma condicao do checkGoal original, isolada. */
export function ehGol(footballPos, goalpostPos, goalpostLargura) {
  const { inicio, fim } = areaDoGol(goalpostPos, goalpostLargura);
  const bola = Number(footballPos) || 0;
  return bola >= inicio && bola <= fim;
}

/** O goleiro pega quando o corpo dele cobre o ponto onde a bola entrou. */
export function defendeu(footballPos, goalkeeperPos, goalkeeperLargura) {
  const bola = Number(footballPos) || 0;
  const goleiro = Number(goalkeeperPos) || 0;
  const meia = Math.max(0, Number(goalkeeperLargura) || 0) * 0.5;
  return bola >= goleiro - meia && bola <= goleiro + meia;
}

/**
 * A bola acerta a trave quando atinge as extremidades laterais da armação do gol.
 */
export function ehTrave(footballPos, goalpostPos, goalpostLargura, traveLargura = 0) {
  const t = Math.max(0, Number(traveLargura) || 0);
  if (t <= 0) return false;
  const { inicio, fim } = areaDoGol(goalpostPos, goalpostLargura);
  const bola = Number(footballPos) || 0;
  return (bola >= inicio && bola <= inicio + t) || (bola >= fim - t && bola <= fim);
}

/**
 * Resultado de um chute: 'gol', 'defesa', 'trave' ou 'fora'.
 * Fora tem prioridade: se a bola nem entrou na área do gol, não é gol nem trave.
 * Em seguida, verifica se pegou na trave (não entra no placar).
 * Se entrou na boca livre, o goleiro tem chance de defender.
 */
export function resultadoDoChute({
  footballPos,
  goalpostPos,
  goalpostLargura,
  goalkeeperPos,
  goalkeeperLargura,
  traveLargura = 0,
}) {
  if (!ehGol(footballPos, goalpostPos, goalpostLargura)) {
    return 'fora';
  }
  if (ehTrave(footballPos, goalpostPos, goalpostLargura, traveLargura)) {
    return 'trave';
  }
  if (defendeu(footballPos, goalkeeperPos, goalkeeperLargura)) {
    return 'defesa';
  }
  return 'gol';
}

/** displayGoalMessage do original, com as frases em pt-BR. */
export function mensagemDoResultado(resultado) {
  if (resultado === 'gol') return 'Golaço do Furacão!';
  if (resultado === 'defesa') return 'O goleiro pegou!';
  if (resultado === 'trave') return 'Na trave!';
  return 'Fora!';
}

/**
 * Vaivem do goleiro pela boca do gol (a animacao goalkeeperMove do ev.css,
 * agora em JS para o jogo saber onde ele esta na hora do chute).
 * Devolve a posicao nova e a direcao nova, batendo nas bordas.
 */
export function moverGoleiro({ posicao, direcao, velocidade, inicio, fim }) {
  const min = Math.min(inicio, fim);
  const max = Math.max(inicio, fim);
  let dir = direcao >= 0 ? 1 : -1;
  let nova = (Number(posicao) || 0) + dir * (Number(velocidade) || 0);

  if (nova <= min) {
    nova = min;
    dir = 1;
  } else if (nova >= max) {
    nova = max;
    dir = -1;
  }

  return { posicao: nova, direcao: dir };
}

/** O goleiro fica mais rapido a cada chute da rodada. */
export function velocidadeDoGoleiro(chute = 0, base = 2.4, acrescimo = 0.35) {
  const n = Math.max(0, Number(chute) || 0);
  return base + n * acrescimo;
}
