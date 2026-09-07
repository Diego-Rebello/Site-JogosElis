import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  FIGURAS, TEMAS, caminhoDaFigura, categorias, figura, figurasDoTema, nomeComArtigo,
} from '../shared/catalogo-figuras.js';
import { FIGURINHAS } from '../shared/descobertas.js';

const PASTA = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'figuras');
const arquivos = readdirSync(PASTA).filter(nome => nome.endsWith('.svg'));

describe('catálogo de figuras', () => {
  it('tem o arquivo de cada figura do catálogo', () => {
    const faltando = FIGURAS.filter(item => !arquivos.includes(`${item.id}.svg`));
    expect(faltando.map(item => item.id)).toEqual([]);
  });

  it('não deixa arquivo solto fora do catálogo', () => {
    const conhecidos = new Set(FIGURAS.map(item => `${item.id}.svg`));
    expect(arquivos.filter(nome => !conhecidos.has(nome))).toEqual([]);
  });

  it('guarda a atribuição do OpenMoji junto das figuras', () => {
    const licenca = readFileSync(resolve(PASTA, 'LICENCA.txt'), 'utf8');
    expect(licenca).toMatch(/OpenMoji/);
    expect(licenca).toMatch(/CC BY-SA 4\.0/);
  });

  it('só tem SVG de verdade, sem script dentro', () => {
    arquivos.forEach(nome => {
      const conteudo = readFileSync(resolve(PASTA, nome), 'utf8');
      expect(conteudo).toMatch(/<svg/);
      expect(conteudo).not.toMatch(/<script/i);
    });
  });

  it('não repete id e todo id vira um caminho previsível', () => {
    const ids = FIGURAS.map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(caminhoDaFigura('gato')).toBe('/figuras/gato.svg');
  });

  it('tem nome em português e artigo em toda figura', () => {
    FIGURAS.forEach(item => {
      expect(item.nome.trim()).not.toBe('');
      expect(['o', 'a']).toContain(item.artigo);
      expect(item.categoria.trim()).not.toBe('');
    });
  });

  it('monta o nome com artigo do jeito que a fala precisa', () => {
    expect(nomeComArtigo('gato')).toBe('o gato');
    expect(nomeComArtigo('bola')).toBe('a bola');
    expect(nomeComArtigo('nao-existe')).toBe('');
    expect(figura('nao-existe')).toBeUndefined();
  });

  it('dá pelo menos quatro figuras em cada tema, para caber o modo esperto', () => {
    Object.keys(TEMAS).forEach(tema => {
      expect(figurasDoTema(tema).length).toBeGreaterThanOrEqual(4);
    });
    expect(figurasDoTema('tema-que-nao-existe')).toHaveLength(FIGURAS.length);
  });

  it('só usa categorias que existem nos temas', () => {
    const existentes = new Set(categorias());
    Object.values(TEMAS).forEach(tema => {
      (tema.categorias || []).forEach(nome => expect(existentes).toContain(nome));
    });
  });

  it('tem figura para toda figurinha do álbum', () => {
    const semFigura = FIGURINHAS.filter(id => !figura(id));
    expect(semFigura).toEqual([]);
  });
});
