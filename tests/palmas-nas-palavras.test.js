import { describe, expect, it } from 'vitest';
import { MAIS_PEDACOS, PALAVRAS } from '../rael/palmas-nas-palavras/dados.js';
import { criarPalmas, montarRodada, regrasDoNivel, silabasParaFala } from '../rael/palmas-nas-palavras/jogo.js';
import { figura } from '../shared/catalogo-figuras.js';

const semEmbaralhar = lista => [...lista];
const semAcento = texto => texto.normalize('NFD').replace(/[̀-ͯ]/g, '');

describe('as trinta palavras', () => {
  it('são trinta, sem id repetido', () => {
    expect(PALAVRAS).toHaveLength(30);
    expect(new Set(PALAVRAS.map(item => item.id)).size).toBe(30);
  });

  it('todas têm figura no catálogo', () => {
    expect(PALAVRAS.filter(item => !figura(item.id)).map(item => item.id)).toEqual([]);
  });

  it('a divisão em sílabas remonta exatamente a palavra escrita', () => {
    PALAVRAS.forEach(item => {
      expect(item.silabas.join('')).toBe(item.palavra);
      expect(item.palavra).toBe(item.palavra.toUpperCase());
    });
  });

  it('nenhuma sílaba fica vazia e nenhuma palavra passa de quatro pedaços', () => {
    PALAVRAS.forEach(item => {
      expect(item.silabas.length).toBeGreaterThanOrEqual(1);
      expect(item.silabas.length).toBeLessThanOrEqual(MAIS_PEDACOS);
      item.silabas.forEach(silaba => expect(silaba.trim()).not.toBe(''));
    });
  });

  it('toda sílaba tem vogal: é pedaço de palavra falada, não de palavra escrita', () => {
    PALAVRAS.forEach(item => {
      item.silabas.forEach(silaba => {
        expect(semAcento(silaba)).toMatch(/[AEIOU]/);
      });
    });
  });

  it('cobre de uma a quatro sílabas', () => {
    const tamanhos = new Set(PALAVRAS.map(item => item.silabas.length));
    expect([...tamanhos].sort()).toEqual([1, 2, 3, 4]);
  });
});

describe('montarRodada', () => {
  it('dá seis palavras diferentes', () => {
    ['facil', 'normal', 'esperto'].forEach(nivel => {
      const rodada = montarRodada(PALAVRAS, { nivel });
      expect(rodada).toHaveLength(6);
      expect(new Set(rodada.map(item => item.id)).size).toBe(6);
    });
  });

  it('no fácil só entram palavras de dois pedaços', () => {
    const rodada = montarRodada(PALAVRAS, { nivel: 'facil' });
    rodada.forEach(item => expect(item.silabas).toHaveLength(2));
  });

  it('no normal vai até três pedaços, e no esperto até quatro', () => {
    montarRodada(PALAVRAS, { nivel: 'normal' })
      .forEach(item => expect(item.silabas.length).toBeLessThanOrEqual(3));
    const maiores = montarRodada(PALAVRAS, { nivel: 'esperto', quantidade: 30, embaralharLista: semEmbaralhar });
    expect(Math.max(...maiores.map(item => item.silabas.length))).toBe(4);
  });

  it('só o esperto faz a pergunta "quantos pedaços?"', () => {
    expect(regrasDoNivel('facil').pergunta).toBe(false);
    expect(regrasDoNivel('normal').pergunta).toBe(false);
    expect(regrasDoNivel('esperto').pergunta).toBe(true);
  });

  it('no fácil o modelo vem antes; nos outros, só se pedirem', () => {
    expect(regrasDoNivel('facil').modelo).toBe('antes');
    expect(regrasDoNivel('normal').modelo).toBe('sob-pedido');
  });
});

describe('fala das sílabas', () => {
  it('fala LI e VRO como sílabas inteiras, sem enviar siglas em caixa alta', () => {
    const livro = PALAVRAS.find(item => item.id === 'livro');
    expect(silabasParaFala(livro.silabas)).toEqual([{ texto: 'li' }, { texto: 'vro' }]);
  });

  it('preserva os acentos necessários à pronúncia', () => {
    expect(silabasParaFala(['PÃO', 'ÁR'])).toEqual([{ texto: 'pão' }, { texto: 'ár' }]);
  });
});

describe('as palmas', () => {
  const pato = PALAVRAS.find(item => item.id === 'pato');          // PA-TO
  const borboleta = PALAVRAS.find(item => item.id === 'borboleta'); // BOR-BO-LE-TA

  it('conta só os toques, nunca o tempo entre eles', () => {
    const palmas = criarPalmas(pato);
    expect(palmas.bater()).toBe(1);
    expect(palmas.bater()).toBe(2);
    expect(palmas.estado().palmas).toBe(2);
  });

  it('acerta quando as palmas batem com a divisão cadastrada', () => {
    const palmas = criarPalmas(pato);
    palmas.bater();
    palmas.bater();
    expect(palmas.conferir()).toMatchObject({ certo: true, palmas: 2, esperado: 2 });
  });

  it('a primeira tentativa fora da conta só pede para tentar de novo', () => {
    const palmas = criarPalmas(borboleta);
    palmas.bater();
    const primeira = palmas.conferir();
    expect(primeira).toMatchObject({ certo: false, mostrarResposta: false, tentativas: 1 });
  });

  it('na segunda tentativa a divisão é demonstrada e a palavra segue', () => {
    const palmas = criarPalmas(borboleta);
    palmas.bater();
    palmas.conferir();
    palmas.limpar();
    palmas.bater();
    expect(palmas.conferir()).toMatchObject({ certo: false, mostrarResposta: true, tentativas: 2 });
  });

  it('limpar zera os círculos sem contar tentativa', () => {
    const palmas = criarPalmas(pato);
    palmas.bater();
    palmas.bater();
    expect(palmas.limpar()).toBe(0);
    expect(palmas.estado()).toMatchObject({ palmas: 0, tentativas: 0 });
  });

  it('tem teto de palmas, para um toque repetido não virar número enorme', () => {
    const palmas = criarPalmas(pato, { limite: 3 });
    [1, 2, 3, 4, 5].forEach(() => palmas.bater());
    expect(palmas.estado().palmas).toBe(3);
  });

  it('"quantos pedaços?" compara com a divisão, e não com as palmas', () => {
    const palmas = criarPalmas(borboleta);
    palmas.bater();                       // bateu uma vez só
    expect(palmas.responderNumero(4)).toMatchObject({ certo: true, esperado: 4 });
    expect(palmas.responderNumero(1)).toMatchObject({ certo: false, esperado: 4 });
    expect(palmas.responderNumero('4').certo).toBe(true);
  });

  it('palavra de uma sílaba fecha com uma palma só', () => {
    const sol = PALAVRAS.find(item => item.id === 'sol');
    const palmas = criarPalmas(sol);
    palmas.bater();
    expect(palmas.conferir().certo).toBe(true);
  });
});
