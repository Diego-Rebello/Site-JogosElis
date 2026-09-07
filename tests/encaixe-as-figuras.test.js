import { describe, expect, it } from 'vitest';
import { CENAS, quantidadeDePecas } from '../rael/encaixe-as-figuras/dados.js';
import { criarMontagem, montarCena, montarRodada } from '../rael/encaixe-as-figuras/jogo.js';
import { figura } from '../shared/catalogo-figuras.js';

const semEmbaralhar = lista => [...lista];
const cenaSilhueta = CENAS.find(cena => cena.tipo === 'silhueta');
const cenaSeisPedacos = CENAS.find(cena => quantidadeDePecas(cena) === 6);

describe('cenas cadastradas', () => {
  it('tem doze cenas, todas com id diferente', () => {
    expect(CENAS).toHaveLength(12);
    expect(new Set(CENAS.map(cena => cena.id)).size).toBe(12);
  });

  it('usa só figuras que existem no catálogo', () => {
    const usadas = CENAS.flatMap(cena => (cena.tipo === 'silhueta' ? cena.figuras : [cena.figura]));
    expect(usadas.filter(id => !figura(id))).toEqual([]);
  });

  it('nenhuma cena passa de seis peças', () => {
    CENAS.forEach(cena => {
      expect(quantidadeDePecas(cena)).toBeGreaterThanOrEqual(3);
      expect(quantidadeDePecas(cena)).toBeLessThanOrEqual(6);
    });
  });

  it('nenhuma cena de pedaços tem célula em branco', () => {
    // A medição está no comentário de dados.js: célula vazia viraria peça em
    // branco, e duas peças em branco seriam iguais para a criança.
    CENAS.filter(cena => cena.tipo === 'pedacos').forEach(cena => {
      expect(cena.tintaMinima).toBeGreaterThanOrEqual(10);
    });
  });

  it('toda cena tem instrução falada e silhueta com três figuras diferentes', () => {
    CENAS.forEach(cena => {
      expect(cena.instrucao.trim()).not.toBe('');
      if (cena.tipo === 'silhueta') expect(new Set(cena.figuras).size).toBe(3);
    });
  });
});

describe('montarRodada', () => {
  it('dá três cenas, começando pela mais simples', () => {
    ['facil', 'normal', 'esperto'].forEach(nivel => {
      const rodada = montarRodada(CENAS, { nivel });
      expect(rodada).toHaveLength(3);
      expect(rodada[0].tipo).toBe('silhueta');
      expect(new Set(rodada.map(cena => cena.id)).size).toBe(3);
    });
  });

  it('cresce com o nível: fácil só silhuetas, esperto chega a seis peças', () => {
    expect(montarRodada(CENAS, { nivel: 'facil' }).map(quantidadeDePecas)).toEqual([3, 3, 3]);
    expect(montarRodada(CENAS, { nivel: 'normal' }).map(quantidadeDePecas)).toEqual([3, 3, 4]);
    expect(montarRodada(CENAS, { nivel: 'esperto' }).map(quantidadeDePecas)).toEqual([3, 4, 6]);
  });

  it('nível desconhecido cai no normal', () => {
    expect(montarRodada(CENAS, { nivel: 'turbo' }).map(quantidadeDePecas)).toEqual([3, 3, 4]);
  });
});

describe('montarCena', () => {
  it('na silhueta, cada figura tem um destino só e é a própria sombra', () => {
    const cena = montarCena(cenaSilhueta, { embaralharLista: semEmbaralhar });
    expect(cena.pecas).toHaveLength(3);
    expect(cena.destinos).toHaveLength(3);
    cena.pecas.forEach(peca => {
      expect(peca.destino).toBe(peca.figura);
      expect(cena.destinos.filter(destino => destino.id === peca.destino)).toHaveLength(1);
    });
  });

  it('nos pedaços, recorta a figura na grade sem repetir célula', () => {
    const cena = montarCena(cenaSeisPedacos, { embaralharLista: semEmbaralhar });
    expect(cena.pecas).toHaveLength(6);
    expect(new Set(cena.destinos.map(d => d.id)).size).toBe(6);
    cena.pecas.forEach(peca => {
      expect(peca.coluna).toBeLessThan(cena.colunas);
      expect(peca.linha).toBeLessThan(cena.linhas);
      expect(peca.figura).toBe(cenaSeisPedacos.figura);
    });
  });
});

describe('criarMontagem', () => {
  const cena = montarCena(cenaSilhueta, { embaralharLista: semEmbaralhar });
  const primeira = cena.pecas[0];
  const outra = cena.pecas[1];

  it('encaixa a peça certa e ela fica no lugar', () => {
    const montagem = criarMontagem(cena);
    const resultado = montagem.encaixar(primeira.destino, primeira.id);
    expect(resultado.certo).toBe(true);
    expect(montagem.estado().colocadas[primeira.destino]).toBe(primeira.id);
    expect(montagem.estado().restantes).toBe(2);
  });

  it('a peça errada só volta para a origem, sem tirar nada', () => {
    const montagem = criarMontagem(cena);
    const resultado = montagem.encaixar(outra.destino, primeira.id);
    expect(resultado.certo).toBe(false);
    expect(montagem.estado().colocadas).toEqual({});
    expect(montagem.estado().selecionada).toBe(null);
  });

  it('não deixa dois no mesmo lugar nem tira uma peça já encaixada', () => {
    const montagem = criarMontagem(cena);
    montagem.encaixar(primeira.destino, primeira.id);
    expect(montagem.encaixar(primeira.destino, outra.id).ignorado).toBe(true);
    montagem.selecionar(primeira.id);
    expect(montagem.estado().selecionada).toBe(null);
  });

  it('tocar na peça e depois no lugar dá o mesmo que arrastar', () => {
    const montagem = criarMontagem(cena);
    montagem.selecionar(primeira.id);
    expect(montagem.estado().selecionada).toBe(primeira.id);
    expect(montagem.encaixar(primeira.destino).certo).toBe(true);
  });

  it('tocar de novo na mesma peça desmarca', () => {
    const montagem = criarMontagem(cena);
    montagem.selecionar(primeira.id);
    montagem.selecionar(primeira.id);
    expect(montagem.estado().selecionada).toBe(null);
  });

  it('a cena fica completa quando todas as peças entram', () => {
    const montagem = criarMontagem(cena);
    cena.pecas.forEach(peca => montagem.encaixar(peca.destino, peca.id));
    expect(montagem.estado().completa).toBe(true);
    expect(montagem.proximoEncaixe()).toBe(null);
  });

  it('"me mostra" sempre aponta uma peça que falta', () => {
    const montagem = criarMontagem(cena);
    const primeiroAviso = montagem.proximoEncaixe();
    expect(primeiroAviso.destinoId).toBe(primeiroAviso.peca.destino);
    montagem.encaixar(primeiroAviso.destinoId, primeiroAviso.peca.id);
    expect(montagem.proximoEncaixe().peca.id).not.toBe(primeiroAviso.peca.id);
  });

  it('limpar devolve tudo para o começo', () => {
    const montagem = criarMontagem(cena);
    montagem.encaixar(primeira.destino, primeira.id);
    expect(montagem.limpar()).toMatchObject({ colocadas: {}, restantes: 3, completa: false });
  });
});
