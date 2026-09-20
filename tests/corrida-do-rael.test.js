import { describe, expect, it } from 'vitest';
import {
  ALTURA_CANVAS,
  LARGURA_CANVAS,
  QUANTIDADE_DE_TRECHOS,
  RESPOSTA_POSTO,
  VELOCIDADE_DA_PISTA,
  VELOCIDADE_DO_CARRO,
  centroDaFaixa,
  faixaDoCarro,
  geometriaDaPista,
  montarTrechos,
  moverCarro,
  progressoDoTanque,
  quantidadeDeFaixas,
  resultadoDoEncontro,
  retangulosSeSobrepoem,
} from '../rael/corrida-do-rael/jogo.js';
import { criarSessao } from '../shared/rodada.js';


/**
 * Embaralhador determinístico baseado em gerador linear congruencial (LCG),
 * garantindo independência total de Math.random nos testes.
 */
function criarEmbaralhador(sementeInicial = 123456789) {
  let semente = sementeInicial;
  function proximoFloat() {
    semente = (semente * 1664525 + 1013904223) % 4294967296;
    return semente / 4294967296;
  }
  return function embaralharPseudo(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(proximoFloat() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  };
}

describe('Corrida do Rael (P17) — Motor puro (jogo.js)', () => {
  // ---------------------------------------------------------------------------
  // Grupo 1: Constantes
  // ---------------------------------------------------------------------------
  describe('Constantes geométricas e de jogo', () => {
    it('LARGURA_CANVAS é 400 e ALTURA_CANVAS é 700', () => {
      expect(LARGURA_CANVAS).toBe(400);
      expect(ALTURA_CANVAS).toBe(700);
    });

    it('QUANTIDADE_DE_TRECHOS é 6', () => {
      expect(QUANTIDADE_DE_TRECHOS).toBe(6);
    });

    it('VELOCIDADE_DA_PISTA é 110 e VELOCIDADE_DO_CARRO é 220', () => {
      expect(VELOCIDADE_DA_PISTA).toBe(110);
      expect(VELOCIDADE_DO_CARRO).toBe(220);
    });

    it('RESPOSTA_POSTO é "posto"', () => {
      expect(RESPOSTA_POSTO).toBe('posto');
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 2: quantidadeDeFaixas
  // ---------------------------------------------------------------------------
  describe('quantidadeDeFaixas', () => {
    it('aceita números válidos 2, 3 e 4', () => {
      expect(quantidadeDeFaixas(2)).toBe(2);
      expect(quantidadeDeFaixas(3)).toBe(3);
      expect(quantidadeDeFaixas(4)).toBe(4);
    });

    it('converte string numérica válida ("2", "3", "4")', () => {
      expect(quantidadeDeFaixas('2')).toBe(2);
      expect(quantidadeDeFaixas('3')).toBe(3);
      expect(quantidadeDeFaixas('4')).toBe(4);
    });

    it('converte zero para o padrão 3', () => {
      expect(quantidadeDeFaixas(0)).toBe(3);
    });

    it('converte números negativos para o padrão 3', () => {
      expect(quantidadeDeFaixas(-1)).toBe(3);
      expect(quantidadeDeFaixas(-10)).toBe(3);
    });

    it('converte NaN para o padrão 3', () => {
      expect(quantidadeDeFaixas(NaN)).toBe(3);
    });

    it('converte valores acima de 4 para o padrão 3', () => {
      expect(quantidadeDeFaixas(5)).toBe(3);
      expect(quantidadeDeFaixas(10)).toBe(3);
    });

    it('converte valores ausentes, undefined e null para o padrão 3', () => {
      expect(quantidadeDeFaixas()).toBe(3);
      expect(quantidadeDeFaixas(undefined)).toBe(3);
      expect(quantidadeDeFaixas(null)).toBe(3);
    });

    it('converte strings não numéricas ou objetos para o padrão 3', () => {
      expect(quantidadeDeFaixas('cinco')).toBe(3);
      expect(quantidadeDeFaixas({})).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 3: geometriaDaPista
  // ---------------------------------------------------------------------------
  describe('geometriaDaPista', () => {
    it('calcula geometria padrão com largura 400, margem 36 e 3 faixas', () => {
      const geo = geometriaDaPista();
      expect(geo.inicio).toBe(36);
      expect(geo.fim).toBe(364);
      expect(geo.largura).toBe(400);
      expect(geo.faixas).toBe(3);
      expect(geo.larguraFaixa).toBeCloseTo((364 - 36) / 3, 5);
    });

    it('preserva soma das faixas igual à largura útil para 2, 3 e 4 faixas', () => {
      for (const f of [2, 3, 4]) {
        const geo = geometriaDaPista({ largura: 400, margem: 36, faixas: f });
        expect(geo.faixas).toBe(f);
        expect(geo.inicio).toBe(36);
        expect(geo.fim).toBe(364);
        expect(geo.larguraFaixa * f).toBeCloseTo(328, 5);
      }
    });

    it('retorna sempre um objeto novo a cada invocação', () => {
      const geo1 = geometriaDaPista();
      const geo2 = geometriaDaPista();
      expect(geo1).toEqual(geo2);
      expect(geo1).not.toBe(geo2);
    });

    it('trata valores inválidos ou negativos de largura e margem com fallbacks seguros', () => {
      const geoInvalida = geometriaDaPista({ largura: -500, margem: NaN, faixas: 'invalido' });
      expect(geoInvalida.largura).toBe(400);
      expect(geoInvalida.inicio).toBe(36);
      expect(geoInvalida.fim).toBe(364);
      expect(geoInvalida.faixas).toBe(3);
    });

    it('margem excessiva maior que metade da largura é tratada com segurança', () => {
      const geo = geometriaDaPista({ largura: 400, margem: 250 });
      expect(geo.inicio).toBe(36);
      expect(geo.fim).toBe(364);
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 4: centroDaFaixa
  // ---------------------------------------------------------------------------
  describe('centroDaFaixa', () => {
    it('calcula centro da primeira faixa (índice 0)', () => {
      const geo2 = geometriaDaPista({ faixas: 2 });
      // inicio 36, larguraFaixa 164 -> centro: 36 + 82 = 118
      expect(centroDaFaixa(0, geo2)).toBe(118);
    });

    it('calcula centro de faixa intermediária', () => {
      const geo3 = geometriaDaPista({ faixas: 3 });
      // 3 faixas: inicio 36, larguraFaixa 328/3 -> centro faixa 1: 36 + 1.5 * (328/3) = 200
      expect(centroDaFaixa(1, geo3)).toBeCloseTo(200, 5);
    });

    it('calcula centro da última faixa', () => {
      const geo4 = geometriaDaPista({ faixas: 4 });
      // 4 faixas: larguraFaixa 82 -> centro faixa 3: 36 + 3.5 * 82 = 36 + 287 = 323
      expect(centroDaFaixa(3, geo4)).toBe(323);
    });

    it('limita índice negativo ao centro da primeira faixa (índice 0)', () => {
      const geo2 = geometriaDaPista({ faixas: 2 });
      expect(centroDaFaixa(-1, geo2)).toBe(118);
      expect(centroDaFaixa(-99, geo2)).toBe(118);
    });

    it('limita índice maior ou igual a faixas ao centro da última faixa', () => {
      const geo2 = geometriaDaPista({ faixas: 2 });
      expect(centroDaFaixa(2, geo2)).toBe(282);
      expect(centroDaFaixa(10, geo2)).toBe(282);
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 5: faixaDoCarro
  // ---------------------------------------------------------------------------
  describe('faixaDoCarro', () => {
    it('identifica a faixa quando o centro do carro está dentro de cada faixa', () => {
      const geo2 = geometriaDaPista({ faixas: 2 });
      const larguraCarro = 44;
      // centro da faixa 0 é 118 -> x = 118 - 22 = 96
      expect(faixaDoCarro(96, larguraCarro, geo2)).toBe(0);
      // centro da faixa 1 é 282 -> x = 282 - 22 = 260
      expect(faixaDoCarro(260, larguraCarro, geo2)).toBe(1);
    });

    it('identifica a faixa correta quando o centro do carro coincide com a divisória', () => {
      const geo2 = geometriaDaPista({ faixas: 2 });
      const larguraCarro = 44;
      // divisória em 36 + 164 = 200 -> x = 200 - 22 = 178
      expect(faixaDoCarro(178, larguraCarro, geo2)).toBe(1);
    });

    it('limita carro posicionado antes da borda esquerda à faixa 0', () => {
      const geo = geometriaDaPista({ faixas: 3 });
      expect(faixaDoCarro(-50, 44, geo)).toBe(0);
      expect(faixaDoCarro(0, 44, geo)).toBe(0);
    });

    it('limita carro posicionado além da borda direita à última faixa', () => {
      const geo = geometriaDaPista({ faixas: 3 });
      expect(faixaDoCarro(500, 44, geo)).toBe(2);
      expect(faixaDoCarro(370, 44, geo)).toBe(2);
    });

    it('trata coordenada x inválida de forma segura', () => {
      const geo = geometriaDaPista({ faixas: 3 });
      expect(faixaDoCarro(NaN, 44, geo)).toBe(0);
      expect(faixaDoCarro(undefined, 44, geo)).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 6: moverCarro
  // ---------------------------------------------------------------------------
  describe('moverCarro', () => {
    it('move para a direita quando direção é positiva (+1)', () => {
      const x = moverCarro({ x: 100, direcao: 1, velocidade: 220, dt: 0.1, inicio: 36, fim: 364, largura: 44 });
      expect(x).toBeCloseTo(100 + 220 * 0.1, 5); // 122
    });

    it('move para a esquerda quando direção é negativa (-1)', () => {
      const x = moverCarro({ x: 100, direcao: -1, velocidade: 220, dt: 0.1, inicio: 36, fim: 364, largura: 44 });
      expect(x).toBeCloseTo(100 - 220 * 0.1, 5); // 78
    });

    it('permanece parado quando direção é zero', () => {
      const x = moverCarro({ x: 100, direcao: 0, velocidade: 220, dt: 0.1 });
      expect(x).toBe(100);
    });

    it('normaliza direções com magnitude diferente de 1', () => {
      const xDir = moverCarro({ x: 100, direcao: 5, velocidade: 220, dt: 0.1, inicio: 36, fim: 364, largura: 44 });
      expect(xDir).toBeCloseTo(122, 5);

      const xEsq = moverCarro({ x: 100, direcao: -3, velocidade: 220, dt: 0.1, inicio: 36, fim: 364, largura: 44 });
      expect(xEsq).toBeCloseTo(78, 5);
    });

    it('prende o carro no limite esquerdo dirigível (inicio)', () => {
      const x = moverCarro({ x: 40, direcao: -1, velocidade: 220, dt: 1.0, inicio: 36, fim: 364, largura: 44 });
      expect(x).toBe(36);
    });

    it('prende o carro no limite direito dirigível (fim - largura)', () => {
      const x = moverCarro({ x: 300, direcao: 1, velocidade: 220, dt: 1.0, inicio: 36, fim: 364, largura: 44 });
      expect(x).toBe(320); // 364 - 44 = 320
    });

    it('dt igual a 0, negativo ou NaN mantém o carro parado', () => {
      expect(moverCarro({ x: 100, direcao: 1, dt: 0 })).toBe(100);
      expect(moverCarro({ x: 100, direcao: 1, dt: -0.1 })).toBe(100);
      expect(moverCarro({ x: 100, direcao: 1, dt: NaN })).toBe(100);
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 7: retangulosSeSobrepoem
  // ---------------------------------------------------------------------------
  describe('retangulosSeSobrepoem', () => {
    const a = { x: 100, y: 100, w: 44, h: 64 };

    it('detecta sobreposição entre retângulos coincidentes ou intersectados', () => {
      const b = { x: 110, y: 110, w: 44, h: 64 };
      expect(retangulosSeSobrepoem(a, b)).toBe(true);
    });

    it('retorna false quando separados no eixo X', () => {
      const b = { x: 200, y: 100, w: 44, h: 64 };
      expect(retangulosSeSobrepoem(a, b)).toBe(false);
    });

    it('retorna false quando separados no eixo Y', () => {
      const b = { x: 100, y: 250, w: 44, h: 64 };
      expect(retangulosSeSobrepoem(a, b)).toBe(false);
    });

    it('retorna false quando estão encostados na borda', () => {
      // a: x=100..144 com margem 4 -> caixa efetiva x=104..140
      // b encostando exatamente: x=140 - 4 = 136 -> caixa efetiva x=140..176
      const b = { x: 136, y: 100, w: 44, h: 64 };
      expect(retangulosSeSobrepoem(a, b, 4)).toBe(false);
    });

    it('respeita margem configurável', () => {
      const b = { x: 140, y: 100, w: 44, h: 64 };
      // com margem 0, tocam-se em x=140..144 -> sobrepõem-se
      expect(retangulosSeSobrepoem(a, b, 0)).toBe(true);
      // com margem 4, não se sobrepõem
      expect(retangulosSeSobrepoem(a, b, 4)).toBe(false);
    });

    it('não muta os retângulos fornecidos', () => {
      const cloneA = { ...a };
      const b = { x: 110, y: 110, w: 44, h: 64 };
      const cloneB = { ...b };
      retangulosSeSobrepoem(a, b);
      expect(a).toEqual(cloneA);
      expect(b).toEqual(cloneB);
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 8: montarTrechos
  // ---------------------------------------------------------------------------
  describe('montarTrechos', () => {
    it('gera 6 trechos por padrão com IDs sequenciais trecho-1 a trecho-6', () => {
      const trechos = montarTrechos();
      expect(trechos).toHaveLength(6);
      trechos.forEach((t, i) => {
        expect(t.id).toBe(`trecho-${i + 1}`);
      });
    });

    it('devolve array vazio quando quantidade é zero ou negativa', () => {
      expect(montarTrechos({ quantidade: 0 })).toEqual([]);
      expect(montarTrechos({ quantidade: -5 })).toEqual([]);
    });

    it('funciona para 2, 3 e 4 faixas com índices válidos', () => {
      for (const f of [2, 3, 4]) {
        const trechos = montarTrechos({ faixas: f });
        expect(trechos).toHaveLength(6);
        trechos.forEach(t => {
          expect(t.postoFaixa).toBeGreaterThanOrEqual(0);
          expect(t.postoFaixa).toBeLessThan(f);
          expect(t.oleoFaixa).toBeGreaterThanOrEqual(0);
          expect(t.oleoFaixa).toBeLessThan(f);
        });
      }
    });

    it('respostaId é sempre RESPOSTA_POSTO', () => {
      const trechos = montarTrechos();
      trechos.forEach(t => {
        expect(t.respostaId).toBe(RESPOSTA_POSTO);
      });
    });

    it('postoFaixa e oleoFaixa nunca são iguais em nenhum trecho', () => {
      const trechos = montarTrechos();
      trechos.forEach(t => {
        expect(t.postoFaixa).not.toBe(t.oleoFaixa);
      });
    });

    it('primeiro trecho começa com posto adjacente à posição inicial do carro', () => {
      // 3 faixas: carro inicia na faixa 1 -> adjacentes são 0 ou 2
      const trechos3 = montarTrechos({ faixas: 3 });
      expect([0, 2]).toContain(trechos3[0].postoFaixa);

      // 2 faixas: carro inicia na faixa 0 -> adjacente é 1
      const trechos2 = montarTrechos({ faixas: 2 });
      expect(trechos2[0].postoFaixa).toBe(1);
    });

    it('o posto não aparece três vezes seguidas na mesma faixa', () => {
      // Cria embaralhador determinístico que sempre prefere o primeiro elemento
      const embaralhadorIdentico = lista => lista;
      const trechos = montarTrechos({ faixas: 3, quantidade: 10, embaralharLista: embaralhadorIdentico });
      for (let i = 2; i < trechos.length; i++) {
        const trinca = trechos[i].postoFaixa === trechos[i - 1].postoFaixa &&
                       trechos[i].postoFaixa === trechos[i - 2].postoFaixa;
        expect(trinca).toBe(false);
      }
    });

    it('é determinístico e reproduzível com a mesma função injetada', () => {
      const emb1 = criarEmbaralhador(42);
      const emb2 = criarEmbaralhador(42);
      const t1 = montarTrechos({ faixas: 3, embaralharLista: emb1 });
      const t2 = montarTrechos({ faixas: 3, embaralharLista: emb2 });
      expect(t1).toEqual(t2);
    });

    it('não muta arrays nem objetos passados', () => {
      const listaOriginal = [0, 1, 2];
      const emb = lista => {
        expect(lista).not.toBe(listaOriginal);
        return [...lista];
      };
      montarTrechos({ faixas: 3, embaralharLista: emb });
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 9: resultadoDoEncontro
  // ---------------------------------------------------------------------------
  describe('resultadoDoEncontro', () => {
    const carro = { x: 100, y: 580, w: 44, h: 64 };
    const postoColidindo = { x: 110, y: 580, w: 44, h: 64 };
    const postoLonge = { x: 300, y: 580, w: 44, h: 64 };
    const oleoColidindo = { x: 110, y: 580, w: 44, h: 30 };
    const oleoLonge = { x: 300, y: 580, w: 44, h: 30 };

    it('retorna "posto" ao colidir com o posto', () => {
      const res = resultadoDoEncontro({ carro, posto: postoColidindo, oleo: oleoLonge });
      expect(res).toBe('posto');
    });

    it('retorna "oleo" ao colidir com o óleo', () => {
      const res = resultadoDoEncontro({ carro, posto: postoLonge, oleo: oleoColidindo });
      expect(res).toBe('oleo');
    });

    it('prioriza "posto" se ambas as AABBs colidirem no mesmo frame', () => {
      const res = resultadoDoEncontro({ carro, posto: postoColidindo, oleo: oleoColidindo });
      expect(res).toBe('posto');
    });

    it('retorna "passou" quando itensPassaram é explicitamente true', () => {
      const res = resultadoDoEncontro({ carro, posto: postoLonge, oleo: oleoLonge, itensPassaram: true });
      expect(res).toBe('passou');
    });

    it('retorna "passou" quando ambos os itens ultrapassam a borda inferior do carro', () => {
      // fundoCarro = 580 + 64 = 644
      const postoPassado = { x: 300, y: 650, w: 44, h: 64 };
      const oleoPassado = { x: 50, y: 650, w: 44, h: 30 };
      const res = resultadoDoEncontro({ carro, posto: postoPassado, oleo: oleoPassado });
      expect(res).toBe('passou');
    });

    it('retorna null enquanto o encontro ainda está ativo e repetidas chamadas são estáveis', () => {
      const res1 = resultadoDoEncontro({ carro, posto: postoLonge, oleo: oleoLonge, itensPassaram: false });
      const res2 = resultadoDoEncontro({ carro, posto: postoLonge, oleo: oleoLonge, itensPassaram: false });
      expect(res1).toBeNull();
      expect(res2).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 10: progressoDoTanque
  // ---------------------------------------------------------------------------
  describe('progressoDoTanque', () => {
    it('retorna 0 quando nenhum trecho foi concluído', () => {
      expect(progressoDoTanque(0)).toBe(0);
    });

    it('retorna o valor correto para conclusões intermediárias', () => {
      expect(progressoDoTanque(1)).toBe(1);
      expect(progressoDoTanque(3)).toBe(3);
      expect(progressoDoTanque(5)).toBe(5);
    });

    it('retorna 6 quando todos os 6 trechos foram concluídos', () => {
      expect(progressoDoTanque(6)).toBe(6);
    });

    it('converte valores negativos para 0 e valores acima do total para o total', () => {
      expect(progressoDoTanque(-3)).toBe(0);
      expect(progressoDoTanque(10)).toBe(6);
      expect(progressoDoTanque(10, 4)).toBe(4);
    });

    it('trata total inválido ou negativo com fallback para QUANTIDADE_DE_TRECHOS', () => {
      expect(progressoDoTanque(4, NaN)).toBe(4);
      expect(progressoDoTanque(4, -10)).toBe(4);
      expect(progressoDoTanque(10, -10)).toBe(6);
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 11: Propriedades, Invariantes e Não-Mutação (A2.8 e A2.9)
  // ---------------------------------------------------------------------------
  describe('Testes de propriedade e imutabilidade', () => {
    it('A2.8: Congelar um trecho devolvido e chamar helpers não gera erro nem mutação', () => {
      const trechos = montarTrechos({ faixas: 3 });
      const trecho = trechos[0];
      Object.freeze(trecho);

      const copiaProfunda = JSON.parse(JSON.stringify(trecho));

      const geo = geometriaDaPista({ faixas: 3 });
      const centroPosto = centroDaFaixa(trecho.postoFaixa, geo);
      const centroOleo = centroDaFaixa(trecho.oleoFaixa, geo);

      expect(centroPosto).toBeGreaterThan(0);
      expect(centroOleo).toBeGreaterThan(0);
      expect(trecho).toEqual(copiaProfunda);
    });

    it('A2.9: 200 rodadas em 2 faixas respeitam todas as invariantes sem trincas', () => {
      const emb = criarEmbaralhador(1001);
      for (let rodada = 0; rodada < 200; rodada++) {
        const trechos = montarTrechos({ faixas: 2, quantidade: 6, embaralharLista: emb });
        expect(trechos).toHaveLength(6);
        for (let i = 0; i < trechos.length; i++) {
          const t = trechos[i];
          expect(t.postoFaixa).not.toBe(t.oleoFaixa);
          expect(t.postoFaixa).toBeGreaterThanOrEqual(0);
          expect(t.postoFaixa).toBeLessThan(2);
          expect(t.oleoFaixa).toBeGreaterThanOrEqual(0);
          expect(t.oleoFaixa).toBeLessThan(2);

          if (i >= 2) {
            const trinca = t.postoFaixa === trechos[i - 1].postoFaixa &&
                           t.postoFaixa === trechos[i - 2].postoFaixa;
            expect(trinca).toBe(false);
          }
        }
      }
    });

    it('A2.9: 200 rodadas em 3 faixas respeitam todas as invariantes sem trincas', () => {
      const emb = criarEmbaralhador(2002);
      for (let rodada = 0; rodada < 200; rodada++) {
        const trechos = montarTrechos({ faixas: 3, quantidade: 6, embaralharLista: emb });
        expect(trechos).toHaveLength(6);
        for (let i = 0; i < trechos.length; i++) {
          const t = trechos[i];
          expect(t.postoFaixa).not.toBe(t.oleoFaixa);
          expect(t.postoFaixa).toBeGreaterThanOrEqual(0);
          expect(t.postoFaixa).toBeLessThan(3);
          expect(t.oleoFaixa).toBeGreaterThanOrEqual(0);
          expect(t.oleoFaixa).toBeLessThan(3);

          if (i >= 2) {
            const trinca = t.postoFaixa === trechos[i - 1].postoFaixa &&
                           t.postoFaixa === trechos[i - 2].postoFaixa;
            expect(trinca).toBe(false);
          }
        }
      }
    });

    it('A2.9: 200 rodadas em 4 faixas respeitam todas as invariantes sem trincas', () => {
      const emb = criarEmbaralhador(3003);
      for (let rodada = 0; rodada < 200; rodada++) {
        const trechos = montarTrechos({ faixas: 4, quantidade: 6, embaralharLista: emb });
        expect(trechos).toHaveLength(6);
        for (let i = 0; i < trechos.length; i++) {
          const t = trechos[i];
          expect(t.postoFaixa).not.toBe(t.oleoFaixa);
          expect(t.postoFaixa).toBeGreaterThanOrEqual(0);
          expect(t.postoFaixa).toBeLessThan(4);
          expect(t.oleoFaixa).toBeGreaterThanOrEqual(0);
          expect(t.oleoFaixa).toBeLessThan(4);

          if (i >= 2) {
            const trinca = t.postoFaixa === trechos[i - 1].postoFaixa &&
                           t.postoFaixa === trechos[i - 2].postoFaixa;
            expect(trinca).toBe(false);
          }
        }
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Grupo 11: Integração com criarSessao (Etapa 4)
  // ---------------------------------------------------------------------------
  describe('Integração com criarSessao (Etapa 4)', () => {
    it('A4.2: Seis postos de primeira completam a rodada com semAjuda: 6 e comAjuda: 0', () => {
      const trechos = montarTrechos({ faixas: 3, quantidade: 6 });
      const sessao = criarSessao({ desafios: trechos, tentativasAteDemonstrar: 2 });

      for (let i = 0; i < 6; i++) {
        const resp = sessao.responder('posto');
        expect(resp.certo).toBe(true);
        expect(resp.fase).toBe('acertou');
        sessao.avancar();
      }

      expect(sessao.resumo()).toEqual({
        total: 6,
        semAjuda: 6,
        comAjuda: 0,
        concluida: true,
      });
    });

    it('A4.3: Seis conclusões com ajuda completam a rodada com semAjuda: 0 e comAjuda: 6', () => {
      const trechos = montarTrechos({ faixas: 3, quantidade: 6 });
      const sessao = criarSessao({ desafios: trechos, tentativasAteDemonstrar: 2 });

      for (let i = 0; i < 6; i++) {
        // 1ª tentativa falha
        const r1 = sessao.responder('oleo');
        expect(r1.certo).toBe(false);
        expect(r1.fase).toBe('pergunta');

        // 2ª tentativa falha -> atinge o limite e transiciona para demonstrando
        const r2 = sessao.responder('passou');
        expect(r2.certo).toBe(false);
        expect(r2.fase).toBe('demonstrando');

        // Conclui ajuda e avança sem chamar responder() novamente
        sessao.avancar();
      }

      expect(sessao.resumo()).toEqual({
        total: 6,
        semAjuda: 0,
        comAjuda: 6,
        concluida: true,
      });
    });

    it('A4.6: Todas as combinações de falha em 2 tentativas acionam fase demonstrando', () => {
      const combinacoes = [
        ['oleo', 'passou'],
        ['passou', 'oleo'],
        ['oleo', 'oleo'],
        ['passou', 'passou'],
      ];

      for (const [tentativa1, tentativa2] of combinacoes) {
        const trechos = montarTrechos({ faixas: 3, quantidade: 2 });
        const sessao = criarSessao({ desafios: trechos, tentativasAteDemonstrar: 2 });

        const r1 = sessao.responder(tentativa1);
        expect(r1.certo).toBe(false);
        expect(r1.fase).toBe('pergunta');
        expect(r1.tentativas).toBe(1);

        const r2 = sessao.responder(tentativa2);
        expect(r2.certo).toBe(false);
        expect(r2.fase).toBe('demonstrando');
        expect(r2.tentativas).toBe(2);

        // Avança uma única vez
        const aposAvancar = sessao.avancar();
        expect(aposAvancar.indice).toBe(1);
        expect(aposAvancar.fase).toBe('pergunta');
        expect(aposAvancar.tentativas).toBe(0);
      }
    });
  });
});
