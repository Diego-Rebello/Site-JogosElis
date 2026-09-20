import { describe, expect, it } from 'vitest';
import { CONQUISTAS } from '../shared/conquistas-descobertas.js';
import {
  ANGULO_MAXIMO,
  ANGULO_MINIMO,
  DURACAO_DO_CHUTE,
  PASSO,
  PASSO_ANGULO,
  QUANTIDADE_DE_CHUTES,
  ajustarAngulo,
  areaDoGol,
  calcularImpactoNoGol,
  defendeu,
  ehGol,
  ehTrave,
  mensagemDoResultado,
  moverGoleiro,
  moverNoCampo,
  resultadoDoChute,
  velocidadeDoGoleiro,
  ALCANCE_DO_MERGULHO,
  ANGULO_DO_ADVERSARIO,
  DURACAO_MINIMA_DO_CHUTE,
  MODOS,
  PASSO_GOLEIRO,
  alcanceDefensivo,
  anguloDoAdversario,
  duracaoDoChuteAdversario,
  ehSucesso,
  mensagemDaDefesa,
  mensagemDoPapel,
  moverGoleiroJogador,
  papelDaVez,
  resultadoDaDefesa,
  resumoDaRodada,
  tituloDoModo,
} from '../rael/chute-a-gol/jogo.js';

describe('Chute a Gol (P16) — motor portado do Football-game-in-HTML', () => {
  it('moverNoCampo soma a distância e prende nas bordas, como moveStriker/moveFootball', () => {
    expect(moverNoCampo(100, PASSO, 300)).toBe(110);
    expect(moverNoCampo(100, -PASSO, 300)).toBe(90);
    expect(moverNoCampo(5, -50, 300)).toBe(0);
    expect(moverNoCampo(295, 50, 300)).toBe(300);
  });

  it('moverNoCampo trata valor inválido como zero', () => {
    expect(moverNoCampo(undefined, 10, 300)).toBe(10);
    expect(moverNoCampo(50, NaN, 300)).toBe(50);
  });

  it('areaDoGol é o centro mais e menos metade da largura, como no checkGoal original', () => {
    expect(areaDoGol(200, 100)).toEqual({ inicio: 150, fim: 250 });
  });

  it('ehGol aceita a bola dentro da área e recusa fora dela', () => {
    expect(ehGol(200, 200, 100)).toBe(true);
    expect(ehGol(150, 200, 100)).toBe(true);
    expect(ehGol(250, 200, 100)).toBe(true);
    expect(ehGol(149, 200, 100)).toBe(false);
    expect(ehGol(251, 200, 100)).toBe(false);
  });

  it('defendeu só pega quando o corpo do goleiro cobre a bola', () => {
    expect(defendeu(200, 200, 40)).toBe(true);
    expect(defendeu(181, 200, 40)).toBe(true);
    expect(defendeu(179, 200, 40)).toBe(false);
    expect(defendeu(221, 200, 40)).toBe(false);
  });

  it('ehTrave detecta quando a bola bate nas traves laterais', () => {
    // Gol de 150 a 250 (centro 200, largura 100), traveLargura = 12
    // Trave esquerda: 150 a 162
    // Trave direita: 238 a 250
    expect(ehTrave(150, 200, 100, 12)).toBe(true);
    expect(ehTrave(162, 200, 100, 12)).toBe(true);
    expect(ehTrave(163, 200, 100, 12)).toBe(false); // boca do gol
    expect(ehTrave(237, 200, 100, 12)).toBe(false); // boca do gol
    expect(ehTrave(238, 200, 100, 12)).toBe(true);
    expect(ehTrave(250, 200, 100, 12)).toBe(true);
    // Fora do gol
    expect(ehTrave(140, 200, 100, 12)).toBe(false);
    expect(ehTrave(260, 200, 100, 12)).toBe(false);
    // Sem trave configurada (0)
    expect(ehTrave(150, 200, 100, 0)).toBe(false);
  });

  const gol = { goalpostPos: 200, goalpostLargura: 100, goalkeeperLargura: 40 };

  it('resultadoDoChute devolve gol quando a bola entra longe do goleiro', () => {
    expect(resultadoDoChute({ ...gol, footballPos: 240, goalkeeperPos: 160 })).toBe('gol');
  });

  it('resultadoDoChute devolve defesa quando o goleiro está no caminho', () => {
    expect(resultadoDoChute({ ...gol, footballPos: 200, goalkeeperPos: 195 })).toBe('defesa');
  });

  it('resultadoDoChute devolve trave quando bate na trave lateral', () => {
    expect(resultadoDoChute({ ...gol, footballPos: 155, goalkeeperPos: 200, traveLargura: 12 })).toBe('trave');
    expect(resultadoDoChute({ ...gol, footballPos: 245, goalkeeperPos: 200, traveLargura: 12 })).toBe('trave');
  });

  it('resultadoDoChute devolve fora quando a bola nem entra no gol', () => {
    expect(resultadoDoChute({ ...gol, footballPos: 300, goalkeeperPos: 300 })).toBe('fora');
  });

  it('mensagemDoResultado tem uma frase em pt-BR para cada resultado', () => {
    expect(mensagemDoResultado('gol')).toBe('Golaço do Furacão!');
    expect(mensagemDoResultado('defesa')).toBe('O goleiro pegou!');
    expect(mensagemDoResultado('trave')).toBe('Na trave!');
    expect(mensagemDoResultado('fora')).toBe('Fora!');
  });

  it('moverGoleiro vai e volta dentro da boca do gol, sem escapar', () => {
    let estado = { posicao: 150, direcao: 1, velocidade: 10, inicio: 150, fim: 250 };
    const visitadas = [];
    for (let i = 0; i < 40; i++) {
      const passo = moverGoleiro(estado);
      estado = { ...estado, ...passo };
      visitadas.push(passo.posicao);
    }
    expect(Math.min(...visitadas)).toBeGreaterThanOrEqual(150);
    expect(Math.max(...visitadas)).toBeLessThanOrEqual(250);
    expect(new Set(visitadas).size).toBeGreaterThan(1);
  });

  it('moverGoleiro inverte a direção ao bater nas bordas', () => {
    expect(moverGoleiro({ posicao: 248, direcao: 1, velocidade: 10, inicio: 150, fim: 250 }))
      .toEqual({ posicao: 250, direcao: -1 });
    expect(moverGoleiro({ posicao: 152, direcao: -1, velocidade: 10, inicio: 150, fim: 250 }))
      .toEqual({ posicao: 150, direcao: 1 });
  });

  it('velocidadeDoGoleiro cresce a cada pênalti', () => {
    const velocidades = Array.from({ length: QUANTIDADE_DE_CHUTES }, (_, i) => velocidadeDoGoleiro(i));
    velocidades.forEach((v, i) => {
      if (i > 0) expect(v).toBeGreaterThan(velocidades[i - 1]);
    });
    expect(velocidadeDoGoleiro(0)).toBeGreaterThan(0);
  });

  it('constantes vindas do original e da mira angular', () => {
    expect(PASSO).toBe(10);
    expect(PASSO_ANGULO).toBe(2.5);
    expect(ANGULO_MINIMO).toBe(-35);
    expect(ANGULO_MAXIMO).toBe(35);
    expect(DURACAO_DO_CHUTE).toBe(1000);
    expect(QUANTIDADE_DE_CHUTES).toBe(5);
  });

  it('ajustarAngulo altera o angulo e respeita os limites minimo e maximo', () => {
    expect(ajustarAngulo(0, PASSO_ANGULO)).toBe(2.5);
    expect(ajustarAngulo(0, -PASSO_ANGULO)).toBe(-2.5);
    expect(ajustarAngulo(34, 5)).toBe(35);
    expect(ajustarAngulo(-34, -5)).toBe(-35);
  });

  it('calcularImpactoNoGol calcula deltaX via trigonometria com precisao', () => {
    // Angulo 0: trajeto perfeitamente reto
    expect(calcularImpactoNoGol({ origemX: 200, distanciaY: 150, anguloGraus: 0 })).toBe(200);
    // Angulo positivo: desvia para a direita
    const paraDireita = calcularImpactoNoGol({ origemX: 200, distanciaY: 150, anguloGraus: 20 });
    expect(paraDireita).toBeGreaterThan(200);
    // Angulo negativo: desvia para a esquerda
    const paraEsquerda = calcularImpactoNoGol({ origemX: 200, distanciaY: 150, anguloGraus: -20 });
    expect(paraEsquerda).toBeLessThan(200);
    // Simetria
    expect(paraDireita - 200).toBeCloseTo(200 - paraEsquerda, 5);
  });

  it('a atividade chute-a-gol tem conquistas no catálogo', () => {
    const doChute = CONQUISTAS.filter(c => c.id.includes('chute-a-gol'));
    expect(doChute.length).toBeGreaterThan(0);
  });
});

describe('Chute a Gol — modos chutar, defender e alternado', () => {
  it('MODOS tem os três jeitos de brincar do convite', () => {
    expect(MODOS).toEqual(['chutar', 'defender', 'alternado']);
  });

  it('papelDaVez mantém o papel nos modos fixos', () => {
    for (let i = 0; i < QUANTIDADE_DE_CHUTES; i++) {
      expect(papelDaVez('chutar', i)).toBe('chutar');
      expect(papelDaVez('defender', i)).toBe('defender');
    }
  });

  it('papelDaVez reveza no alternado, começando por chutar', () => {
    const papeis = Array.from({ length: QUANTIDADE_DE_CHUTES }, (_, i) => papelDaVez('alternado', i));
    expect(papeis).toEqual(['chutar', 'defender', 'chutar', 'defender', 'chutar']);
  });

  it('papelDaVez trata índice inválido como o primeiro pênalti', () => {
    expect(papelDaVez('alternado', undefined)).toBe('chutar');
    expect(papelDaVez('alternado', -3)).toBe('chutar');
  });

  it('moverGoleiroJogador anda pela boca do gol e para nas traves', () => {
    expect(moverGoleiroJogador(200, PASSO_GOLEIRO, 150, 250)).toBe(200 + PASSO_GOLEIRO);
    expect(moverGoleiroJogador(200, -PASSO_GOLEIRO, 150, 250)).toBe(200 - PASSO_GOLEIRO);
    expect(moverGoleiroJogador(155, -50, 150, 250)).toBe(150);
    expect(moverGoleiroJogador(245, 50, 150, 250)).toBe(250);
    expect(moverGoleiroJogador(300, 0, 250, 150)).toBe(250);
  });

  it('alcanceDefensivo cresce com o mergulho', () => {
    expect(alcanceDefensivo(40)).toBe(20);
    expect(alcanceDefensivo(40, true)).toBe(20 + ALCANCE_DO_MERGULHO);
    expect(alcanceDefensivo(40, true, 10)).toBe(30);
    expect(alcanceDefensivo(40, true, -10)).toBe(20);
  });

  const gol = { goalpostPos: 200, goalpostLargura: 100, goleiroLargura: 40 };

  it('resultadoDaDefesa pega a bola quando o goleiro está no caminho', () => {
    expect(resultadoDaDefesa({ ...gol, bolaX: 200, goleiroPos: 195 })).toBe('defesa');
  });

  it('resultadoDaDefesa deixa passar quando o goleiro está longe', () => {
    expect(resultadoDaDefesa({ ...gol, bolaX: 240, goleiroPos: 170 })).toBe('gol');
  });

  it('resultadoDaDefesa alcança mais longe quando o goleiro pula', () => {
    const lance = { ...gol, bolaX: 235, goleiroPos: 200 };
    expect(resultadoDaDefesa({ ...lance })).toBe('gol');
    expect(resultadoDaDefesa({ ...lance, mergulhando: true })).toBe('defesa');
  });

  it('resultadoDaDefesa devolve trave e fora sem depender do goleiro', () => {
    expect(resultadoDaDefesa({ ...gol, bolaX: 155, goleiroPos: 200, traveLargura: 12 })).toBe('trave');
    expect(resultadoDaDefesa({ ...gol, bolaX: 300, goleiroPos: 200 })).toBe('fora');
  });

  it('mensagemDaDefesa tem frase acolhedora para cada resultado', () => {
    ['defesa', 'trave', 'fora', 'gol'].forEach(resultado => {
      expect(mensagemDaDefesa(resultado).length).toBeGreaterThan(0);
    });
    expect(mensagemDaDefesa('defesa')).toBe('Que defesaça!');
    expect(mensagemDaDefesa('gol')).not.toMatch(/errou|perdeu/i);
  });

  it('mensagemDoPapel escolhe a frase de quem chuta ou de quem defende', () => {
    expect(mensagemDoPapel('chutar', 'gol')).toBe(mensagemDoResultado('gol'));
    expect(mensagemDoPapel('defender', 'gol')).toBe(mensagemDaDefesa('gol'));
  });

  it('ehSucesso vale gol para quem chuta e tudo que não entrou para quem defende', () => {
    expect(ehSucesso('chutar', 'gol')).toBe(true);
    ['defesa', 'trave', 'fora'].forEach(r => expect(ehSucesso('chutar', r)).toBe(false));
    expect(ehSucesso('defender', 'gol')).toBe(false);
    ['defesa', 'trave', 'fora'].forEach(r => expect(ehSucesso('defender', r)).toBe(true));
  });

  it('anguloDoAdversario cobre a boca do gol sem passar dos limites da mira', () => {
    expect(anguloDoAdversario(0)).toBe(-ANGULO_DO_ADVERSARIO);
    expect(anguloDoAdversario(1)).toBe(ANGULO_DO_ADVERSARIO);
    expect(anguloDoAdversario(0.5)).toBeCloseTo(0, 10);
    for (let i = 0; i <= 20; i++) {
      const angulo = anguloDoAdversario(i / 20);
      expect(angulo).toBeGreaterThanOrEqual(ANGULO_MINIMO);
      expect(angulo).toBeLessThanOrEqual(ANGULO_MAXIMO);
    }
    expect(anguloDoAdversario(9)).toBe(ANGULO_DO_ADVERSARIO);
    expect(anguloDoAdversario(-9)).toBe(-ANGULO_DO_ADVERSARIO);
  });

  it('duracaoDoChuteAdversario dá tempo de reagir e nunca fica abaixo do piso', () => {
    const tempos = Array.from({ length: QUANTIDADE_DE_CHUTES }, (_, i) => duracaoDoChuteAdversario(i));
    tempos.forEach((tempo, i) => {
      expect(tempo).toBeGreaterThanOrEqual(DURACAO_MINIMA_DO_CHUTE);
      if (i > 0) expect(tempo).toBeLessThanOrEqual(tempos[i - 1]);
    });
    expect(duracaoDoChuteAdversario(0)).toBeGreaterThanOrEqual(DURACAO_DO_CHUTE);
    expect(duracaoDoChuteAdversario(99)).toBe(DURACAO_MINIMA_DO_CHUTE);
  });

  it('tituloDoModo nomeia os três modos em pt-BR', () => {
    expect(tituloDoModo('chutar')).toBe('Chutar');
    expect(tituloDoModo('defender')).toBe('Defender');
    expect(tituloDoModo('alternado')).toBe('Alternado');
  });

  it('resumoDaRodada conta o que interessa em cada modo', () => {
    expect(resumoDaRodada({ modo: 'chutar', gols: 3 })).toBe('Você fez 3 de 5 pênaltis');
    expect(resumoDaRodada({ modo: 'defender', defesas: 2 })).toBe('Você defendeu 2 de 5 pênaltis');
    expect(resumoDaRodada({ modo: 'alternado', gols: 1, defesas: 1 }))
      .toBe('Você fez 1 gol e defendeu 1 pênalti');
    expect(resumoDaRodada({ modo: 'alternado', gols: 2, defesas: 2 }))
      .toBe('Você fez 2 gols e defendeu 2 pênaltis');
  });

  it('constantes do modo goleiro', () => {
    expect(PASSO_GOLEIRO).toBeGreaterThan(0);
    expect(ALCANCE_DO_MERGULHO).toBeGreaterThan(0);
    expect(ANGULO_DO_ADVERSARIO).toBeLessThan(ANGULO_MAXIMO);
  });
});
