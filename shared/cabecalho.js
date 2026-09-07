/*
 * cabecalho.js — a barra de cima com "🏠 Início", o título do jogo e o botão
 * de som. Módulo ES:
 *
 *   import { montarCabecalho } from '../../shared/cabecalho.js';
 *   montarCabecalho('Jogo da Forca');
 *
 * Até a T22 era um <script> clássico que lia o próprio data-titulo por
 * document.currentScript. Virou módulo na T23 por dois motivos: o Vite não
 * empacota script clássico (o arquivo simplesmente não ia para o dist/), e
 * document.currentScript é sempre null dentro de um módulo. De quebra, o
 * import de sons.js deixou de precisar ser dinâmico.
 *
 * Os jogos em React não usam este arquivo: eles têm o componente Cabecalho,
 * com o mesmo HTML e as mesmas classes.
 */
import { alternarMudo, estaMudo, tocar } from './sons.js';

/**
 * Descobre o caminho da página inicial a partir de onde o jogo está.
 * Serve tanto para Games/forca/ quanto para Games/memoria/, e o /i cobre o
 * Netlify, que publica a pasta como /games/ em minúsculas.
 */
function caminhoDoInicio() {
  const caminho = location.pathname;
  if (/\/games\//i.test(caminho)) {
    return caminho.replace(/\/games\/.*$/i, '/index.html');
  }
  // Fora do padrão (a demo de shared/, por exemplo): sobe um nível.
  return '../index.html';
}

/** Injeta o cabeçalho no topo do <body>. Chamar mais de uma vez não duplica. */
export function montarCabecalho(titulo = document.title) {
  if (document.querySelector('.cabecalho')) return;

  const cabecalho = document.createElement('header');
  cabecalho.className = 'cabecalho';

  const inicio = document.createElement('a');
  inicio.className = 'cabecalho__inicio';
  inicio.href = caminhoDoInicio();
  inicio.innerHTML = '🏠 <span class="cabecalho__inicio-texto">Início</span>';
  // O nome acessível precisa conter o texto visível (WCAG 2.5.3, T22).
  inicio.setAttribute('aria-label', 'Início: voltar para a página inicial');

  const h1 = document.createElement('h1');
  h1.className = 'cabecalho__titulo';
  h1.textContent = titulo;

  const mudo = document.createElement('button');
  mudo.type = 'button';
  mudo.className = 'cabecalho__mudo';

  function pintarBotao(estaMudoAgora) {
    mudo.textContent = estaMudoAgora ? '🔇' : '🔊';
    mudo.setAttribute('aria-pressed', String(estaMudoAgora));
    mudo.setAttribute('aria-label', estaMudoAgora ? 'Ligar o som' : 'Desligar o som');
    mudo.title = estaMudoAgora ? 'Ligar o som' : 'Desligar o som';
  }
  pintarBotao(estaMudo());

  mudo.addEventListener('click', () => {
    const agoraMudo = alternarMudo();
    pintarBotao(agoraMudo);
    if (!agoraMudo) tocar('clique');
  });

  cabecalho.append(inicio, h1, mudo);
  document.body.insertBefore(cabecalho, document.body.firstChild);
}
