import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { desejos, produtos, temas } from '../Games/mercadinho/dados.js';
import {
  FIGURA_DO_PRODUTO,
  ICONES_DA_INTERFACE,
  ICONE_DO_TEMA,
  MOLDES,
  SECOES_VISUAIS,
  coresDaMarca,
} from '../Games/mercadinho/figuras.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_ICONES = resolve(RAIZ, 'public/figuras/mercadinho/icones');
const ARQUIVO_LICENCA = resolve(RAIZ, 'public/figuras/mercadinho/LICENCA.txt');

const MOLDES_ESPERADOS = [
  'caixa',
  'pacote',
  'lata',
  'garrafa',
  'pote',
  'caixa-papelao',
  'bandeja',
  'frasco',
  'barra',
  'saquinho',
];

function luminanciaRelativa(hex) {
  const [r, g, b] = [1, 3, 5]
    .map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrasteComBranco(hex) {
  const l = luminanciaRelativa(hex);
  return 1.05 / (l + 0.05);
}

describe('Mercadinho — figuras, ícones e marcas (v2)', () => {
  it('importa figuras.js no Node sem depender de document', () => {
    expect(typeof globalThis.document).toBe('undefined');
    expect(typeof MOLDES).toBe('object');
  });

  it('FIGURA_DO_PRODUTO cobre exatamente todos os 49 produtos e 12 desejos', () => {
    const idsEsperados = [...produtos, ...desejos].map(item => item.id).sort();
    const idsMapa = Object.keys(FIGURA_DO_PRODUTO).sort();

    expect(idsEsperados).toHaveLength(61);
    expect(idsMapa).toEqual(idsEsperados);
  });

  it('MOLDES tem os 10 moldes exatos e cada item usa solto ou um molde válido', () => {
    expect(Object.keys(MOLDES).sort()).toEqual([...MOLDES_ESPERADOS].sort());

    for (const [id, [molde, icone]] of Object.entries(FIGURA_DO_PRODUTO)) {
      const valido = molde === 'solto' || Object.hasOwn(MOLDES, molde);
      expect(valido, `${id}: molde desconhecido ${molde}`).toBe(true);
      expect(typeof icone).toBe('string');
      expect(icone.length).toBeGreaterThan(0);
    }
  });

  it('ICONE_DO_TEMA cobre todos os 10 temas do jogo', () => {
    const idsTemas = temas.map(t => t.id).sort();
    expect(idsTemas).toHaveLength(10);
    expect(Object.keys(ICONE_DO_TEMA).sort()).toEqual(idsTemas);
  });

  it('todos os ícones referenciados existem e não há .svg sobrando em public/figuras/mercadinho/icones', () => {
    const usados = new Set([
      ...Object.values(FIGURA_DO_PRODUTO).map(([, icone]) => icone),
      ...Object.values(SECOES_VISUAIS).map(s => s.icone),
      ...Object.values(ICONE_DO_TEMA),
      ...ICONES_DA_INTERFACE,
    ]);

    for (const nome of usados) {
      const caminho = resolve(PASTA_ICONES, `${nome}.svg`);
      expect(existsSync(caminho), `Falta o ícone ${nome}.svg`).toBe(true);
    }

    const arquivos = readdirSync(PASTA_ICONES).filter(arq => !arq.startsWith('.'));
    expect(arquivos.every(arq => arq.endsWith('.svg'))).toBe(true);

    const nomesEmDisco = arquivos.map(arq => arq.slice(0, -4)).sort();
    expect(nomesEmDisco).toEqual([...usados].sort());
  });

  it('todos os arquivos .svg em public/figuras/mercadinho/icones/ estão listados em LICENCA.txt', () => {
    const licenca = readFileSync(ARQUIVO_LICENCA, 'utf8');
    const arquivos = readdirSync(PASTA_ICONES).filter(arq => arq.endsWith('.svg'));

    expect(arquivos.length).toBeGreaterThan(0);
    for (const arq of arquivos) {
      expect(licenca, `${arq} ausente em LICENCA.txt`).toContain(arq);
    }
  });

  it('coresDaMarca retorna pares #rrggbb válidos e distintos entre opções de cada produto', () => {
    const hexValido = /^#[0-9a-f]{6}$/i;

    for (const p of produtos) {
      const pares = p.opcoes.map((op, i) => {
        const par = coresDaMarca(op.rotulo, i);
        expect(par).toHaveLength(2);
        expect(par[0]).toMatch(hexValido);
        expect(par[1]).toMatch(hexValido);
        return `${par[0]}|${par[1]}`;
      });
      expect(new Set(pares).size, `${p.id}: cores repetidas`).toBe(p.opcoes.length);
    }

    for (const d of desejos) {
      const par = coresDaMarca(d.marca, 0);
      expect(par).toHaveLength(2);
      expect(par[0]).toMatch(hexValido);
      expect(par[1]).toMatch(hexValido);
    }

    const fallback = coresDaMarca('Marca Desconhecida Qualquer', 2);
    expect(fallback).toHaveLength(2);
    expect(fallback[0]).toMatch(hexValido);
    expect(fallback[1]).toMatch(hexValido);
    expect(coresDaMarca('Marca Desconhecida Qualquer', 2)).toEqual(fallback);
  });

  it('placas de seção têm contraste WCAG >= 4.5 entre branco e o fundo colorido', () => {
    for (const [letra, secao] of Object.entries(SECOES_VISUAIS)) {
      const razao = contrasteComBranco(secao.cor);
      expect(razao, `Seção ${letra} (${secao.nome}) = ${razao.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
