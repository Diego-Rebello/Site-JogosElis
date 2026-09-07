import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [modelo, destino, pastaDoSite] = process.argv.slice(2);
if (!modelo || !destino || !pastaDoSite) throw new Error('Informe modelo, destino e pasta do site.');

async function listarArquivos(pasta, prefixo = '') {
  const itens = await readdir(pasta, { withFileTypes: true });
  const arquivos = [];
  for (const item of itens) {
    const relativo = path.posix.join(prefixo, item.name);
    if (item.isDirectory()) arquivos.push(...await listarArquivos(path.join(pasta, item.name), relativo));
    else arquivos.push(relativo);
  }
  return arquivos;
}

const ignorados = new Set(['sw.js', '_headers', '_redirects']);
const arquivos = (await listarArquivos(pastaDoSite)).filter(arquivo => !ignorados.has(arquivo));
const urls = new Set(arquivos.map(arquivo => `/${arquivo}`));

for (const arquivo of arquivos.filter(item => item.endsWith('/index.html') || item === 'index.html')) {
  const pasta = path.posix.dirname(`/${arquivo}`);
  urls.add(pasta === '/' ? '/' : `${pasta}/`);
}

const versao = (process.env.COMMIT_REF || 'local').replace(/[^a-zA-Z0-9._-]/g, '-');
const conteudo = (await readFile(modelo, 'utf8'))
  .replace('__VERSAO__', versao)
  .replace('__ARQUIVOS_PRECACHE__', JSON.stringify([...urls].sort(), null, 2));

await writeFile(destino, conteudo);
console.log(`Service worker ${versao}: ${urls.size} endereços no precache.`);
