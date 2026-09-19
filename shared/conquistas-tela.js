/**
 * conquistas-tela.js — as peças de tela das conquistas do Rael (P15):
 * o cartão da conquista no álbum, a faixa da tela de convite e o anúncio
 * "Conquista nova!" na tela de fim de cada brincadeira.
 *
 * A lógica (o que conta, quando se ganha) fica em conquistas-descobertas.js;
 * aqui só se desenha e se fala. Tudo funciona sem leitura: tocar numa
 * conquista diz o nome dela ou como ganhar.
 */

import { tocar } from './sons.js';

const escapar = texto => String(texto).replace(/[&<>"]/g, letra => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[letra]);

/** Até dez bolinhas; acima de dez metas, as bolinhas andam proporcionalmente. */
function bolinhas(conquista) {
  if (conquista.ganha || conquista.meta <= 1) return '';
  const quantas = Math.min(conquista.meta, 10);
  const cheias = conquista.meta <= 10
    ? conquista.progresso
    : Math.floor((conquista.progresso / conquista.meta) * 10);
  const pontos = Array.from({ length: quantas }, (_, indice) =>
    `<i class="conquista__bolinha${indice < cheias ? ' conquista__bolinha--cheia' : ''}"></i>`).join('');
  const conta = conquista.meta > 10 ? `<span class="conquista__conta">${conquista.progresso}/${conquista.meta}</span>` : '';
  return `<span class="conquista__bolinhas" aria-hidden="true">${pontos}</span>${conta}`;
}

/** Nome acessível: ganho e falta não dependem só de cor nem da moldura. */
export function rotuloDaConquista(conquista) {
  if (conquista.ganha) return `${conquista.nome}, conquista ganha`;
  const progresso = conquista.meta > 1 ? ` Já tem ${conquista.progresso} de ${conquista.meta}.` : '';
  return `Conquista ainda não ganha: ${conquista.comoGanhar}${progresso}`;
}

/** O que falar quando a criança toca numa conquista. */
export function falasDaConquista(conquista) {
  if (conquista.ganha) return [{ texto: `${conquista.nome}!` }, { texto: conquista.parabens }];
  const falas = [{ texto: conquista.comoGanhar }];
  if (conquista.meta > 1 && conquista.progresso > 0) {
    falas.push({ texto: `Já foram ${conquista.progresso} de ${conquista.meta}.` });
  }
  return falas;
}

/** Um item de lista com o botão da conquista. `compacta` esconde o nome (faixa do convite). */
export function cartaoDaConquista(conquista, { compacta = false } = {}) {
  const estado = conquista.ganha ? 'conquista--ganha' : 'conquista--falta';
  const nome = conquista.ganha && !compacta ? `<span class="conquista__nome">${escapar(conquista.nome)}</span>` : '';
  return `<li class="conquistas__item">
    <button class="conquista ${estado}${compacta ? ' conquista--compacta' : ''}" type="button"
      data-conquista="${escapar(conquista.id)}" aria-label="${escapar(rotuloDaConquista(conquista))}">
      <span class="conquista__moldura"><img class="conquista__figura" src="${escapar(conquista.figura)}" alt="" width="64" height="64" loading="lazy"></span>
      ${nome}${compacta ? '' : bolinhas(conquista)}
    </button>
  </li>`;
}

/**
 * Liga o toque das conquistas dentro de `container` à fala. `dizer(itens)`
 * é a função de fala da página (fala.js, roteiro do adulto etc.).
 */
export function ligarFalaDasConquistas(container, conquistas, dizer) {
  const porId = new Map(conquistas.map(conquista => [conquista.id, conquista]));
  container.addEventListener('click', evento => {
    const botao = evento.target.closest('[data-conquista]');
    const conquista = botao && porId.get(botao.dataset.conquista);
    if (!conquista) return;
    tocar('clique');
    dizer(falasDaConquista(conquista));
  });
}

/**
 * Mostra "Conquista nova!" logo depois de `depoisDe` (o texto da figurinha
 * na tela de fim) e devolve as falas da primeira conquista, para a tela
 * emendar na fala da figurinha. Sem conquista nova, esconde o cartão e
 * devolve []. Mais de uma: tocar no cartão passa para a próxima.
 */
export function anunciarConquistas(novas, { depoisDe, dizer, linkAlbum = '../index.html#conquistas' } = {}) {
  let caixa = depoisDe?.parentElement?.querySelector('.conquista-nova');
  if (!caixa && depoisDe) {
    caixa = document.createElement('div');
    caixa.className = 'conquista-nova';
    caixa.setAttribute('role', 'status');
    depoisDe.insertAdjacentElement('afterend', caixa);
  }
  if (!caixa) return [];
  if (!novas?.length) {
    caixa.hidden = true;
    caixa.innerHTML = '';
    return [];
  }

  let indice = 0;
  const falasDe = conquista => [{ texto: `E uma conquista nova: ${conquista.nome}!` }, { texto: conquista.parabens }];

  function pintar() {
    const conquista = novas[indice];
    const restantes = novas.length - indice - 1;
    caixa.innerHTML = `
      <span class="conquista-nova__titulo">🏅 Conquista nova!</span>
      <button class="conquista-nova__cartao" type="button"
        aria-label="Conquista nova: ${escapar(conquista.nome)}. ${restantes ? 'Toque para ver a próxima.' : 'Toque para ouvir de novo.'}">
        <span class="conquista__moldura conquista__moldura--grande"><img src="${escapar(conquista.figura)}" alt="" width="96" height="96"></span>
        <span class="conquista-nova__nome">${escapar(conquista.nome)}</span>
        ${restantes ? `<span class="conquista-nova__mais">e mais ${restantes} ➜</span>` : ''}
      </button>
      <a class="botao botao--secundario conquista-nova__album" href="${escapar(linkAlbum)}">📖 Ver meu álbum</a>`;
    caixa.querySelector('.conquista-nova__cartao').addEventListener('click', () => {
      if (indice < novas.length - 1) indice += 1;
      pintar();
      tocar('acerto');
      dizer?.(falasDe(novas[indice]));
    });
  }

  pintar();
  caixa.hidden = false;
  setTimeout(() => tocar('acerto'), 900);
  return falasDe(novas[0]);
}
