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
  memoria: 'Games/memoria/index.html',
  velha: 'Games/velha/index.html',
  demo: 'shared/demo.html',
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
