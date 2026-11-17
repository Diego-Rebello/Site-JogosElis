import { describe, expect, it } from 'vitest';
import { colocarBaseCssPrimeiro } from '../scripts/base-css-primeiro.mjs';

// Trecho do <head> como o Vite gera no build (antes do plugin, o base vinha por último).
const head = links => `<head>
  <title>Mercadinho</title>
  <script type="module" crossorigin src="../../assets/mercadinho-Aol0gwZN.js"></script>
${links.map(l => `  ${l}`).join('\n')}
</head>`;

const pagina = '<link rel="stylesheet" crossorigin href="../../assets/mercadinho-Ht4R2UqF.css">';
const outra = '<link rel="stylesheet" crossorigin href="../../assets/catalogo-figuras-D_41D9Nz.css">';
const base = '<link rel="stylesheet" crossorigin href="../../assets/base-woxaF6_b.css">';

describe('build — base.css antes do CSS da página', () => {
  it('move o base.css para a primeira folha de estilo, mantendo a ordem das outras', () => {
    expect(colocarBaseCssPrimeiro(head([pagina, base]))).toBe(head([base, pagina]));
    expect(colocarBaseCssPrimeiro(head([outra, pagina, base]))).toBe(head([base, outra, pagina]));
  });

  it('não mexe quando o base.css já é o primeiro ou não existe', () => {
    expect(colocarBaseCssPrimeiro(head([base, pagina]))).toBe(head([base, pagina]));
    expect(colocarBaseCssPrimeiro(head([pagina]))).toBe(head([pagina]));
    expect(colocarBaseCssPrimeiro(head([]))).toBe(head([]));
  });

  it('só reconhece o arquivo base-<hash>.css da pasta assets', () => {
    const parecido = '<link rel="stylesheet" href="../../assets/database-x1.css">';
    expect(colocarBaseCssPrimeiro(head([pagina, parecido]))).toBe(head([pagina, parecido]));
  });
});
