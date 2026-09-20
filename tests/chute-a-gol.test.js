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
  desfechoDaRodada,
  mensagemDaDefesa,
  mensagemDoPapel,
  moverGoleiroJogador,
  nomeDoAdversario,
  ordemDoPapel,
  papelDaVez,
  penaltisDoModo,
  placarDaRodada,
  resultadoDaDefesa,
  resumoDaRodada,
  textoDoDesfecho,
  tituloDoDesfecho,
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
    const papeis = Array.from({ length: penaltisDoModo('alternado') }, (_, i) => papelDaVez('alternado', i));
    expect(papeis).toEqual([
      'chutar', 'defender', 'chutar', 'defender', 'chutar',
      'defender', 'chutar', 'defender', 'chutar', 'defender',
    ]);
  });

  it('penaltisDoModo dobra a rodada no alternado', () => {
    expect(penaltisDoModo('chutar')).toBe(QUANTIDADE_DE_CHUTES);
    expect(penaltisDoModo('defender')).toBe(QUANTIDADE_DE_CHUTES);
    expect(penaltisDoModo('alternado')).toBe(QUANTIDADE_DE_CHUTES * 2);
  });

  it('o alternado dá 5 chutes e 5 defesas', () => {
    const papeis = Array.from({ length: penaltisDoModo('alternado') }, (_, i) => papelDaVez('alternado', i));
    expect(papeis.filter(p => p === 'chutar')).toHaveLength(QUANTIDADE_DE_CHUTES);
    expect(papeis.filter(p => p === 'defender')).toHaveLength(QUANTIDADE_DE_CHUTES);
  });

  it('ordemDoPapel numera cada papel de 0 a 4 no alternado', () => {
    const chutes = [0, 2, 4, 6, 8].map(i => ordemDoPapel('alternado', i));
    const defesas = [1, 3, 5, 7, 9].map(i => ordemDoPapel('alternado', i));
    expect(chutes).toEqual([0, 1, 2, 3, 4]);
    expect(defesas).toEqual([0, 1, 2, 3, 4]);
  });

  it('ordemDoPapel segue o índice nos modos fixos', () => {
    for (let i = 0; i < QUANTIDADE_DE_CHUTES; i++) {
      expect(ordemDoPapel('chutar', i)).toBe(i);
      expect(ordemDoPapel('defender', i)).toBe(i);
    }
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
      .toBe('Você fez 1 de 5 gols e defendeu 1 de 5 pênaltis');
    expect(resumoDaRodada({ modo: 'alternado', gols: 5, defesas: 4 }))
      .toBe('Você fez 5 de 5 gols e defendeu 4 de 5 pênaltis');
  });

  it('no alternado o placar é gol contra gol: os seus e os que passaram', () => {
    expect(placarDaRodada({ modo: 'alternado', gols: 3, defesas: 4 }))
      .toEqual({ jogador: 3, adversario: 1 });
    expect(placarDaRodada({ modo: 'alternado', gols: 5, defesas: 5 }))
      .toEqual({ jogador: 5, adversario: 0 });
    expect(placarDaRodada({ modo: 'alternado', gols: 0, defesas: 0 }))
      .toEqual({ jogador: 0, adversario: 5 });
  });

  it('nos modos de um papel só, o placar é o duelo do pênalti', () => {
    expect(placarDaRodada({ modo: 'chutar', gols: 3 })).toEqual({ jogador: 3, adversario: 2 });
    expect(placarDaRodada({ modo: 'defender', defesas: 1 })).toEqual({ jogador: 1, adversario: 4 });
  });

  it('placarDaRodada nunca passa dos pênaltis batidos por cada lado', () => {
    MODOS.forEach(modo => {
      const total = penaltisDoModo(modo);
      const porPapel = modo === 'alternado' ? total / 2 : total;
      for (let gols = 0; gols <= QUANTIDADE_DE_CHUTES + 2; gols++) {
        for (let defesas = 0; defesas <= QUANTIDADE_DE_CHUTES + 2; defesas++) {
          const placar = placarDaRodada({ modo, gols, defesas, total });
          expect(placar.jogador).toBeGreaterThanOrEqual(0);
          expect(placar.adversario).toBeGreaterThanOrEqual(0);
          expect(placar.jogador).toBeLessThanOrEqual(porPapel);
          expect(placar.adversario).toBeLessThanOrEqual(porPapel);
        }
      }
    });
  });

  it('placarDaRodada ignora o que não pertence ao modo', () => {
    expect(placarDaRodada({ modo: 'chutar', gols: 2, defesas: 5 })).toEqual({ jogador: 2, adversario: 3 });
    expect(placarDaRodada({ modo: 'defender', gols: 5, defesas: 2 })).toEqual({ jogador: 2, adversario: 3 });
  });

  it('desfechoDaRodada compara o placar do jogador com o do adversário', () => {
    expect(desfechoDaRodada({ jogador: 3, adversario: 2 })).toBe('vitoria');
    expect(desfechoDaRodada({ jogador: 2, adversario: 3 })).toBe('derrota');
    expect(desfechoDaRodada({ jogador: 5, adversario: 5 })).toBe('empate');
    expect(desfechoDaRodada()).toBe('empate');
  });

  it('a rodada é ganha com mais da metade dos pênaltis', () => {
    const vencer = (modo, gols, defesas) =>
      desfechoDaRodada(placarDaRodada({ modo, gols, defesas }));
    expect(vencer('chutar', 3, 0)).toBe('vitoria');
    expect(vencer('chutar', 2, 0)).toBe('derrota');
    expect(vencer('defender', 0, 3)).toBe('vitoria');
    expect(vencer('defender', 0, 2)).toBe('derrota');
    expect(vencer('alternado', 3, 3)).toBe('vitoria');
    expect(vencer('alternado', 3, 2)).toBe('empate');
    expect(vencer('alternado', 2, 2)).toBe('derrota');
    // 3 gols contra 5 menos 4 defesas: 3 a 1 para o Furacão.
    expect(vencer('alternado', 3, 4)).toBe('vitoria');
  });

  it('nomeDoAdversario diz quem está do outro lado em cada modo', () => {
    expect(nomeDoAdversario('chutar')).toBe('Goleiro');
    expect(nomeDoAdversario('defender')).toBe('Batedor');
    expect(nomeDoAdversario('alternado')).toBe('Adversário');
  });

  it('tituloDoDesfecho comemora a vitória e acolhe empate e derrota', () => {
    expect(tituloDoDesfecho('vitoria', 'chutar')).toBe('Festa no Caldeirão!');
    expect(tituloDoDesfecho('vitoria', 'defender')).toBe('Muralha do Furacão!');
    expect(tituloDoDesfecho('vitoria', 'alternado')).toBe('Craque completo!');
    MODOS.forEach(modo => {
      expect(tituloDoDesfecho('empate', modo)).toBe('Empate no Caldeirão!');
      expect(tituloDoDesfecho('derrota', modo)).toBe('Quase, Furacão!');
    });
  });

  it('textoDoDesfecho anuncia o placar sem cobrar a criança', () => {
    expect(textoDoDesfecho('vitoria', { jogador: 3, adversario: 2 }, 'chutar'))
      .toBe('Você ganhou do goleiro por 3 a 2!');
    expect(textoDoDesfecho('empate', { jogador: 5, adversario: 5 }, 'alternado'))
      .toBe('Empate com o adversário: 5 a 5!');
    expect(textoDoDesfecho('derrota', { jogador: 2, adversario: 3 }, 'defender'))
      .toBe('O batedor ganhou por 3 a 2. Bora jogar de novo!');
  });

  it('constantes do modo goleiro', () => {
    expect(PASSO_GOLEIRO).toBeGreaterThan(0);
    expect(ALCANCE_DO_MERGULHO).toBeGreaterThan(0);
    expect(ANGULO_DO_ADVERSARIO).toBeLessThan(ANGULO_MAXIMO);
  });
});
