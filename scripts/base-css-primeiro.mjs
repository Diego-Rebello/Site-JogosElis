/**
 * No build, o Vite põe o shared/base.css (usado por todas as páginas) num
 * chunk só de CSS e, ao remover esse chunk, injeta o <link> dele DEPOIS do
 * CSS próprio da página. No `npm run dev` a ordem é a do HTML (base.css
 * primeiro). Com a ordem trocada, qualquer regra da página com a mesma
 * especificidade de uma regra do base.css (ex.: `.painel-caixa` contra
 * `.cartao`, `.nivel` contra `.botao`) perdia só em produção.
 *
 * Este plugin devolve a ordem do código-fonte: o <link> do base-*.css passa
 * a ser a primeira folha de estilo da página.
 */

const LINK_CSS = /<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi;
const HREF_BASE = /\bhref=["'][^"']*\/assets\/base-[\w-]+\.css["']/i;

/** Move o <link> do base-*.css para antes das outras folhas de estilo. */
export function colocarBaseCssPrimeiro(html) {
  const links = [...html.matchAll(LINK_CSS)];
  const base = links.find(m => HREF_BASE.test(m[0]));
  if (!base || links[0] === base) return html;
  const primeiro = links[0];
  // a quebra de linha e o recuo antes do link do base viajam junto com ele
  const recuo = html.slice(0, base.index).match(/\n?[ \t]*$/)[0];
  return (
    html.slice(0, primeiro.index)
    + base[0]
    + recuo
    + html.slice(primeiro.index, base.index - recuo.length)
    + html.slice(base.index + base[0].length)
  );
}

/** @returns {import('vite').Plugin} */
export function baseCssPrimeiro() {
  return {
    name: 'jogos-da-elis:base-css-primeiro',
    apply: 'build',
    transformIndexHtml: { order: 'post', handler: colocarBaseCssPrimeiro },
  };
}
