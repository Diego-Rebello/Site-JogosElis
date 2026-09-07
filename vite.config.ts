import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Projeto Vite único, com uma entrada por página (T23). Antes eram dois
 * projetos npm separados (um por jogo React) mais três jogos em HTML solto
 * que nem passavam pelo bundler.
 *
 * O que NÃO entra aqui e fica em public/, copiado sem alteração:
 * _headers, _redirects, manifest.webmanifest e os ícones. O manifest aponta
 * para os ícones por caminho fixo, então eles não podem ganhar hash.
 * O sw.js é um modelo: quem gera o final é scripts/gerar-service-worker.mjs,
 * rodado logo depois do build (ver o script "build" do package.json).
 */
const paginas = {
  home: 'index.html',
  configuracoes: 'configuracoes.html',
  forca: 'Games/forca/index.html',
  matematica: 'Games/matematica/index.html',
  'm-ou-n': 'Games/m-ou-n/index.html',
  ortografia: 'Games/ortografia/index.html',
  tabuada: 'Games/tabuada/index.html',
  'caca-palavras': 'Games/caca-palavras/index.html',
  'forme-palavra': 'Games/forme-palavra/index.html',
  horas: 'Games/horas/index.html',
  genius: 'Games/genius/index.html',
  sudoku: 'Games/sudoku/index.html',
  dinheirinho: 'Games/dinheirinho/index.html',
  quiz: 'Games/quiz/index.html',
  memoria: 'Games/memoria/index.html',
  velha: 'Games/velha/index.html',
  demo: 'shared/demo.html',
  // Jogos do Rael: o site irmão de pré-alfabetização (seção 6 do MELHORIAS).
  rael: 'rael/index.html',
  'rael-configuracoes': 'rael/configuracoes.html',
  'rael-toque-na-figura': 'rael/toque-na-figura/index.html',
};

export default defineConfig({
  // Caminhos relativos: cada página referencia os assets subindo o quanto
  // for preciso, então o site funciona em qualquer subpasta.
  base: './',
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(paginas).map(([nome, caminho]) => [nome, resolve(__dirname, caminho)]),
      ),
    },
  },
});
