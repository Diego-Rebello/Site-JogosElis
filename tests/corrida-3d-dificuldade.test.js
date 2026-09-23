import { describe, expect, it } from 'vitest';
import {
  CARRO, DIFICULDADES, DT_MAXIMO, DURACAO_DERRAPAGEM, DURACAO_SINAL_TROCA, GATILHO_TROCA,
  INTERVALO_OLEO, META_ULTRAPASSAGENS, NIVEIS, RIVAIS_DE_AQUECIMENTO, Y_LIBERA_NOVO_RIVAL,
  Y_NASCIMENTO_OLEO, avancarCorrida, criarCorrida, faixaParaPosto, faixaSugerida,
} from '../rael/grande-premio/jogo.js';
import { centroDaFaixa, faixaDoCarro } from '../rael/corrida-do-rael/jogo.js';

const DT = DT_MAXIMO;

function sorteador(sementeInicial) {
  let semente = sementeInicial >>> 0;
  return () => {
    semente = (1664525 * semente + 1013904223) >>> 0;
    return semente / 4294967296;
  };
}

/** Corrida inteira com uma entrada; devolve estado, eventos e segundos simulados. */
function correr({ faixas = 3, dificuldade = 'facil', semente = 1, direcao = () => 0, limite = 1200, aCada = null }) {
  const estado = criarCorrida({ faixas, dificuldade });
  const sortear = sorteador(semente);
  const eventos = [];
  let t = 0;
  while (estado.fase !== 'fim' && t < limite) {
    const passo = avancarCorrida(estado, { dt: DT, direcao: direcao(estado) }, { sortear });
    for (const evento of passo) eventos.push({ ...evento, t });
    aCada?.(estado, passo);
    t += DT;
  }
  return { estado, eventos, t };
}

/** Robô que desvia de rivais (inclusive quem sinaliza) e de óleo, e vai ao posto. */
function desviar(e) {
  const g = e.geometria;
  const c = e.carro;
  const atual = faixaDoCarro(c.x, c.w, g);
  const perigo = f => e.rivais.some(r => !r.saindo && !r.contado
    && (r.faixa === f || r.faixaAnterior === f || (r.troca?.fase === 'sinalizando' && r.troca.para === f))
    && r.y + r.h > c.y - 380 && r.y < c.y + c.h + 10)
    || (e.oleo && !e.oleo.usado && e.oleo.faixa === f && e.oleo.y + e.oleo.h > c.y - 300 && e.oleo.y < c.y + c.h);
  const livres = [...Array(g.faixas).keys()].filter(f => !perigo(f)).sort((a, b) => Math.abs(a - atual) - Math.abs(b - atual));
  let alvo = atual;
  if (perigo(atual) && livres.length) alvo = livres[0];
  if (e.posto && e.posto.y < c.y + c.h && !perigo(e.posto.faixa)) alvo = e.posto.faixa;
  const dx = centroDaFaixa(alvo, g) - (c.x + c.w / 2);
  return Math.abs(dx) < 8 ? 0 : Math.sign(dx);
}

const doTipo = (eventos, tipo) => eventos.filter(e => e.tipo === tipo);

describe('Corrida 3D — dificuldades do motor compartilhado', () => {
  it('fácil é o padrão e reproduz a corrida sem a opção: mesmos estados, eventos e sorteios', () => {
    expect(criarCorrida().dificuldade).toBe('facil');
    expect(criarCorrida({ dificuldade: 'inventada' }).dificuldade).toBe('facil');
    for (const faixas of [2, 3, 4]) {
      const a = criarCorrida({ faixas });
      const b = criarCorrida({ faixas, dificuldade: 'facil' });
      const sa = sorteador(faixas);
      const sb = sorteador(faixas);
      for (let i = 0; i < 4000 && a.fase !== 'fim'; i++) {
        const direcao = (i % 90) < 30 ? -1 : (i % 90) < 60 ? 1 : 0;
        expect(avancarCorrida(a, { dt: DT, direcao }, { sortear: sa }))
          .toEqual(avancarCorrida(b, { dt: DT, direcao }, { sortear: sb }));
      }
      expect(a).toEqual(b);
      expect(sa()).toBe(sb());
      // Nada de óleo, troca ou derrapagem no fácil.
      expect(a.oleosNascidos).toBe(0);
      expect(a.derrapagens).toBe(0);
    }
  });

  it('médio e difícil aceleram o cruzeiro e encurtam os intervalos; aquecimento sem dupla', () => {
    const cruzeiroNo = (dificuldade, ultrapassagens) => {
      const e = criarCorrida({ dificuldade });
      e.ultrapassagens = ultrapassagens;
      avancarCorrida(e, { dt: DT }, { sortear: () => 0.5 });
      return e.velocidade;
    };
    for (const [indice, ultrapassagens] of [[0, 0], [1, 5], [2, 15], [3, 25]]) {
      expect(cruzeiroNo('facil', ultrapassagens)).toBeCloseTo(NIVEIS[indice].cruzeiro);
      expect(cruzeiroNo('medio', ultrapassagens)).toBeCloseTo(NIVEIS[indice].cruzeiro * DIFICULDADES.medio.fatorCruzeiro);
      expect(cruzeiroNo('dificil', ultrapassagens)).toBeCloseTo(NIVEIS[indice].cruzeiro * DIFICULDADES.dificil.fatorCruzeiro);
    }
    for (const dificuldade of ['medio', 'dificil']) {
      const { eventos } = correr({ faixas: 4, dificuldade, semente: 3, direcao: desviar });
      const nascimentos = doTipo(eventos, 'rival-apareceu');
      expect(nascimentos.slice(0, RIVAIS_DE_AQUECIMENTO).every(e => e.faixas.length === 1)).toBe(true);
      expect(nascimentos.every(e => e.faixas.length < 4)).toBe(true);
    }
  });

  it('médio: dupla já pode aparecer no nível 1 (3 a 9 ultrapassagens); fácil nunca', () => {
    const duplasNoNivel1 = dificuldade => {
      let total = 0;
      for (let semente = 1; semente <= 20; semente++) {
        correr({
          faixas: 3, dificuldade, semente, direcao: desviar, limite: 200,
          aCada: (e, passo) => {
            if (e.ultrapassagens >= 3 && e.ultrapassagens <= 9) {
              total += doTipo(passo, 'rival-apareceu').filter(ev => ev.faixas.length === 2).length;
            }
          },
        });
      }
      return total;
    };
    expect(duplasNoNivel1('facil')).toBe(0);
    expect(duplasNoNivel1('medio')).toBeGreaterThan(0);
  });

  it.each([2, 3, 4])('difícil com %i faixas: termina sem tocar e desviando, com óleo e trocas', faixas => {
    let oleos = 0;
    let trocas = 0;
    for (let semente = 1; semente <= 12; semente++) {
      for (const direcao of [() => 0, desviar]) {
        const { estado, eventos } = correr({ faixas, dificuldade: 'dificil', semente, direcao });
        expect(estado.fase).toBe('fim');
        expect(estado.ultrapassagens).toBe(META_ULTRAPASSAGENS);
        expect(doTipo(eventos, 'bandeirada')).toHaveLength(1);
        oleos += estado.oleosNascidos;
        trocas += doTipo(eventos, 'rival-mudou-faixa').length;
      }
    }
    expect(oleos).toBeGreaterThan(0);
    expect(trocas).toBeGreaterThan(0);
  });
});

describe('Corrida 3D — rival que muda de faixa (difícil)', () => {
  it('sinaliza antes de mudar, vai só para a faixa vizinha e termina longe do carro', () => {
    for (const faixas of [2, 3, 4]) {
      for (let semente = 1; semente <= 15; semente++) {
        const sinais = new Map();
        correr({
          faixas, dificuldade: 'dificil', semente, direcao: desviar,
          aCada: (e, passo) => {
            for (const ev of doTipo(passo, 'rival-sinalizou')) {
              const rival = e.rivais.find(r => r.id === ev.rivalId);
              expect(Math.abs(ev.para - ev.de)).toBe(1);
              expect(rival.y).toBeGreaterThanOrEqual(GATILHO_TROCA[0]);
              expect(rival.comAjuda).toBe(false);
              sinais.set(ev.rivalId, e.tempo);
            }
            for (const ev of doTipo(passo, 'rival-mudou-faixa')) {
              // O pisca-pisca fica aceso por DURACAO_SINAL_TROCA antes de qualquer movimento.
              expect(e.tempo - sinais.get(ev.rivalId)).toBeGreaterThanOrEqual(DURACAO_SINAL_TROCA - 1e-6);
            }
            for (const r of e.rivais) {
              if (r.troca?.fase === 'feita' && !r.medido) {
                r.medido = true;
                expect(r.x).toBeCloseTo(centroDaFaixa(r.faixa, e.geometria) - CARRO.w / 2);
                // Mais de 1,2 s de reação até a frente do carro, mesmo no nível mais rápido.
                expect(e.carro.y - (r.y + r.h)).toBeGreaterThan(200);
              }
            }
          },
        });
      }
    }
  });

  it('só rival sozinho troca, já desde o aquecimento; dupla e ajuda nunca', () => {
    let trocasNoAquecimento = 0;
    for (let semente = 1; semente <= 20; semente++) {
      correr({
        faixas: 4, dificuldade: 'dificil', semente, direcao: () => 0,
        aCada: (e, passo) => {
          for (const ev of doTipo(passo, 'rival-apareceu')) {
            const novos = e.rivais.slice(-ev.faixas.length);
            if (ev.faixas.length > 1) expect(novos.every(r => !r.troca)).toBe(true);
            if (novos.some(r => r.comAjuda)) expect(novos.every(r => !r.troca)).toBe(true);
            if (ev.aquecimento && novos.some(r => r.troca)) trocasNoAquecimento++;
          }
        },
      });
    }
    expect(trocasNoAquecimento).toBeGreaterThan(0);
  });

  it('cancela a troca quando a faixa de destino está ocupada perto do rival', () => {
    const e = criarCorrida({ faixas: 3, dificuldade: 'dificil' });
    const rival = (id, faixa, y, extra = {}) => ({
      id, faixa, x: centroDaFaixa(faixa, e.geometria) - CARRO.w / 2, y, w: CARRO.w, h: CARRO.h,
      velocidade: 100, cor: '#ef4444', contado: false, saindo: false, alfa: 1, comAjuda: false, ...extra,
    });
    e.rivais = [
      rival(1, 0, 10, { troca: { para: 1, gatilho: 0, fase: 'aguardando', tempo: 0 } }),
      rival(2, 1, 30),
    ];
    e.tempoAteProximoRival = 99;
    const eventos = avancarCorrida(e, { dt: DT }, { sortear: () => 0.5 });
    expect(doTipo(eventos, 'rival-sinalizou')).toHaveLength(0);
    expect(e.rivais[0].troca.fase).toBe('cancelada');
    expect(e.rivais[0].faixa).toBe(0);
  });

  it('durante a troca o rival ocupa as duas faixas para a seta e para o posto', () => {
    const e = criarCorrida({ faixas: 3, dificuldade: 'dificil' });
    const x = (centroDaFaixa(1, e.geometria) + centroDaFaixa(2, e.geometria)) / 2 - CARRO.w / 2;
    e.rivais = [{
      id: 1, faixa: 2, faixaAnterior: 1, x, y: 400, w: CARRO.w, h: CARRO.h, velocidade: 100,
      cor: '#ef4444', contado: false, saindo: false, alfa: 1, comAjuda: false,
      troca: { para: 2, gatilho: 0, fase: 'mudando', tempo: 0 },
    }];
    // Jogador na faixa 1: ameaçado pelo rival que ainda está saindo dela; a seta vai para a 0.
    expect(faixaSugerida(e)).toBe(0);
    expect(faixaParaPosto({ estado: e, preferirFaixa: 1, sortear: () => 0 })).toBe(0);
  });
});

describe('Corrida 3D — óleo e derrapagem (difícil)', () => {
  it('só nasce no difícil, depois do aquecimento, fora da reserva e longe do posto', () => {
    for (const dificuldade of ['facil', 'medio']) {
      expect(correr({ faixas: 3, dificuldade, semente: 4, direcao: desviar }).estado.oleosNascidos).toBe(0);
    }
    for (let semente = 1; semente <= 15; semente++) {
      correr({
        faixas: 3, dificuldade: 'dificil', semente, direcao: desviar,
        aCada: (e, passo) => {
          if (doTipo(passo, 'oleo-apareceu').length) {
            expect(e.ultrapassagens).toBeGreaterThanOrEqual(RIVAIS_DE_AQUECIMENTO);
            expect(e.reserva).toBe(false);
            expect(e.oleo.y).toBe(Y_NASCIMENTO_OLEO);
            if (e.posto) expect(e.posto.faixa).not.toBe(e.oleo.faixa);
          }
          // Nenhum rival nasce enquanto o óleo está na fileira de nascimento.
          if (doTipo(passo, 'rival-apareceu').length && e.oleo) {
            expect(e.oleo.y).toBeGreaterThanOrEqual(Y_LIBERA_NOVO_RIVAL);
          }
          if (doTipo(passo, 'posto-apareceu').length && e.oleo) expect(e.posto.faixa).not.toBe(e.oleo.faixa);
        },
      });
    }
  });

  it('derrapagem leva o carro ao centro da faixa vizinha, ignora a direção e não conta batida', () => {
    const e = criarCorrida({ faixas: 3, dificuldade: 'dificil' });
    e.tempoAteProximoRival = 99;
    e.ultrapassagens = RIVAIS_DE_AQUECIMENTO;
    e.tempoAteProximoOleo = 99;
    const faixaInicial = faixaDoCarro(e.carro.x, e.carro.w, e.geometria);
    e.oleo = { faixa: faixaInicial, x: e.carro.x, y: e.carro.y - 20, w: 44, h: 34, usado: false };
    const velocidadeAntes = e.velocidade;
    const eventos = avancarCorrida(e, { dt: DT, direcao: 0 }, { sortear: () => 0.9 });
    const [derrapou] = doTipo(eventos, 'derrapou');
    expect(derrapou).toMatchObject({ primeira: true });
    expect([-1, 1]).toContain(derrapou.lado);
    expect(e.oleo.usado).toBe(true); // uma mancha escorrega uma vez só
    // A direção contrária é ignorada até o fim da derrapagem, que dura DURACAO_DERRAPAGEM.
    let passos = 0;
    while (e.derrapagem && passos < 100) {
      const passo = avancarCorrida(e, { dt: DT, direcao: -derrapou.lado }, { sortear: () => 0.9 });
      expect(doTipo(passo, 'derrapou')).toHaveLength(0);
      passos++;
    }
    expect(passos * DT).toBeCloseTo(DURACAO_DERRAPAGEM);
    expect(e.carro.x).toBeCloseTo(centroDaFaixa(faixaInicial + derrapou.lado, e.geometria) - CARRO.w / 2);
    expect(e.batidas).toBe(0);
    expect(e.tempoDesdeBatida).toBeNull();
    expect(e.velocidade).toBeGreaterThanOrEqual(velocidadeAntes);
    expect(e.derrapagens).toBe(1);
  });

  it('não escorrega para cima de um rival ao lado; sem lado seguro, fica no lugar', () => {
    const e = criarCorrida({ faixas: 3, dificuldade: 'dificil' });
    e.tempoAteProximoRival = 99;
    const lado = (id, faixa) => ({
      id, faixa, x: centroDaFaixa(faixa, e.geometria) - CARRO.w / 2, y: e.carro.y, w: CARRO.w, h: CARRO.h,
      velocidade: e.velocidade, cor: '#ef4444', contado: false, saindo: false, alfa: 1, comAjuda: false,
    });
    e.rivais = [lado(1, 0), lado(2, 2)];
    e.oleo = { faixa: 1, x: e.carro.x, y: e.carro.y - 20, w: 44, h: 34, usado: false };
    const [derrapou] = doTipo(avancarCorrida(e, { dt: DT }, { sortear: () => 0.9 }), 'derrapou');
    expect(derrapou.lado).toBe(0);
    const x = e.carro.x;
    for (let t = 0; t < DURACAO_DERRAPAGEM; t += DT) avancarCorrida(e, { dt: DT, direcao: 1 }, { sortear: () => 0.9 });
    expect(e.carro.x).toBeCloseTo(x);
  });

  it('intervalo entre manchas fica em INTERVALO_OLEO e só uma mancha existe por vez', () => {
    for (let semente = 1; semente <= 10; semente++) {
      let anterior = null;
      correr({
        faixas: 4, dificuldade: 'dificil', semente, direcao: desviar,
        aCada: (e, passo) => {
          if (doTipo(passo, 'oleo-apareceu').length) {
            if (anterior !== null) expect(e.tempo - anterior).toBeGreaterThanOrEqual(INTERVALO_OLEO[0] - 1e-6);
            anterior = e.tempo;
          }
        },
      });
    }
  });
});
