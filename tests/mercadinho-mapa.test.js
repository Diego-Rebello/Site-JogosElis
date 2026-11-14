import { describe, expect, it } from 'vitest';
import { desejos, produtos } from '../Games/mercadinho/dados.js';
import {
  ALTURA,
  AREAS_EXTRAS,
  LARGURA,
  MAPA,
  SECOES,
  caminho,
  casaDoDesejo,
  casasDe,
  celulaEm,
  entrada,
  podeAndar,
  prateleirasVizinhas,
  secaoMaisProxima,
  vizinhaLivre,
} from '../Games/mercadinho/mapa.js';

describe('Mercadinho — mapa da loja', () => {
  it('tem 16 linhas de 24 colunas e contagem exata de cada símbolo', () => {
    expect(ALTURA).toBe(16);
    expect(LARGURA).toBe(24);
    expect(MAPA).toHaveLength(16);

    const contagem = {};
    for (const linha of MAPA) {
      expect(linha).toHaveLength(24);
      for (const simbolo of linha) {
        contagem[simbolo] = (contagem[simbolo] || 0) + 1;
      }
    }

    expect(contagem.H).toBe(11);
    expect(contagem.P).toBe(7);
    expect(contagem.L).toBe(8);
    expect(contagem.M).toBe(11);
    expect(contagem.A).toBe(3);
    expect(contagem.B).toBe(4);
    expect(contagem.Z).toBe(5);
    expect(contagem.G).toBe(12);
    expect(contagem.K).toBe(3);
    expect(contagem.E).toBe(1);
    expect((contagem['.'] || 0) + contagem.E).toBe(244);
  });

  it('tem todas as 244 casas de piso alcançáveis a partir da entrada', () => {
    const inicio = entrada();
    expect(inicio).toEqual({ x: 3, y: 14 });
    expect(podeAndar(inicio.x, inicio.y)).toBe(true);

    let pisos = 0;
    for (let y = 0; y < ALTURA; y++) {
      for (let x = 0; x < LARGURA; x++) {
        if (!podeAndar(x, y)) continue;
        pisos += 1;
        const rota = caminho(inicio, { x, y });
        expect(rota).not.toBeNull();
      }
    }
    expect(pisos).toBe(244);
  });

  it('oferece pelo menos uma casa de piso vizinha para toda prateleira, guloseima e caixa', () => {
    const inicio = entrada();
    for (let y = 0; y < ALTURA; y++) {
      for (let x = 0; x < LARGURA; x++) {
        const cel = celulaEm(x, y);
        if (cel.tipo === 'produto' || cel.tipo === 'desejo' || cel.tipo === 'caixa') {
          const viz = vizinhaLivre(inicio, { x, y });
          expect(viz).not.toBeNull();
          expect(Math.abs(viz.x - x) + Math.abs(viz.y - y)).toBe(1);
        }
      }
    }
  });

  it('encontra caminho mínimo válido por passos ortogonais e devolve null para parede', () => {
    expect(caminho({ x: 3, y: 14 }, { x: 3, y: 14 })).toEqual([]);
    expect(caminho({ x: 3, y: 14 }, { x: 0, y: 0 })).toBeNull();
    expect(caminho({ x: 0, y: 0 }, { x: 3, y: 14 })).toBeNull();

    // Corredor livre horizontal na linha y = 2 (x de 1 a 22)
    const de = { x: 2, y: 2 };
    const para = { x: 18, y: 2 };
    const rota = caminho(de, para);
    expect(rota).not.toBeNull();
    expect(rota).toHaveLength(16);
    expect(rota.at(-1)).toEqual(para);

    let anterior = de;
    for (const passo of rota) {
      expect(podeAndar(passo.x, passo.y)).toBe(true);
      expect(Math.abs(passo.x - anterior.x) + Math.abs(passo.y - anterior.y)).toBe(1);
      anterior = passo;
    }
  });

  it('casa exatamente uma casa única para cada um dos 49 produtos e 12 guloseimas', () => {
    const posicoesProdutos = new Set();
    for (const p of produtos) {
      const pos = casasDe(p.id);
      expect(pos).not.toBeNull();
      const cel = celulaEm(pos.x, pos.y);
      expect(cel).toEqual({ tipo: 'produto', id: p.id, secao: p.secao });
      posicoesProdutos.add(`${pos.x},${pos.y}`);
    }
    expect(posicoesProdutos.size).toBe(49);

    const posicoesDesejos = new Set();
    for (const d of desejos) {
      const pos = casaDoDesejo(d.id);
      expect(pos).not.toBeNull();
      const cel = celulaEm(pos.x, pos.y);
      expect(cel).toEqual({ tipo: 'desejo', id: d.id });
      posicoesDesejos.add(`${pos.x},${pos.y}`);
    }
    expect(posicoesDesejos.size).toBe(12);
  });

  it('informa prateleiras vizinhas e seção mais próxima', () => {
    const vizLaticinio = vizinhaLivre(entrada(), casasDe('leite'));
    const vizinhas = prateleirasVizinhas(vizLaticinio);
    expect(vizinhas.some(v => v.tipo === 'produto' && v.id === 'leite')).toBe(true);

    expect(secaoMaisProxima({ x: 2, y: 2 })).toEqual(SECOES.L);
    expect(secaoMaisProxima({ x: 2, y: 8 })).toEqual(SECOES.H);
    expect(secaoMaisProxima({ x: 20, y: 2 })).toEqual(SECOES.B);
    expect(secaoMaisProxima({ x: 10, y: 12 })).toEqual(AREAS_EXTRAS.G);
    expect(secaoMaisProxima({ x: 12, y: 14 })).toEqual(AREAS_EXTRAS.K);
  });
});
