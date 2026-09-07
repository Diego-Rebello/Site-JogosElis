/**
 * jogo.js — a lógica de Encaixe as Figuras (P02), sem nada de tela.
 *
 * Regras da seção 6.0 e da P02 que moram aqui:
 * - três cenas por rodada, escolhidas pelo nível que o adulto deixou marcado;
 * - cada peça tem um destino só, e destino nenhum aceita duas peças;
 * - peça encaixada fica; tentativa errada só devolve a peça, sem tirar nada;
 * - a rodada termina quando as três cenas estão montadas, com ajuda ou sem.
 */
import { embaralhar } from '../../shared/texto.js';
import { quantidadeDePecas } from './dados.js';

/**
 * As cenas de uma rodada, na ordem em que aparecem: começa sempre pela mais
 * simples. O nível decide até onde a rodada vai.
 *
 *   facil   → três cenas de silhueta
 *   normal  → duas de silhueta e uma de quatro pedaços
 *   esperto → uma de silhueta, uma de quatro e uma de seis pedaços
 */
export function montarRodada(cenas, { nivel = 'normal', embaralharLista = embaralhar } = {}) {
  const silhuetas = embaralharLista(cenas.filter(cena => cena.tipo === 'silhueta'));
  const quatro = embaralharLista(cenas.filter(cena => cena.tipo === 'pedacos' && quantidadeDePecas(cena) === 4));
  const seis = embaralharLista(cenas.filter(cena => cena.tipo === 'pedacos' && quantidadeDePecas(cena) === 6));

  const receitas = {
    facil: [silhuetas[0], silhuetas[1], silhuetas[2]],
    normal: [silhuetas[0], silhuetas[1], quatro[0]],
    esperto: [silhuetas[0], quatro[0], seis[0]],
  };
  return (receitas[nivel] || receitas.normal).filter(Boolean);
}

/**
 * Prepara uma cena para a tela: peças embaralhadas de um lado, destinos do
 * outro. Cada peça guarda o id do destino que a aceita.
 */
export function montarCena(cena, { embaralharLista = embaralhar } = {}) {
  if (cena.tipo === 'silhueta') {
    const destinos = embaralharLista(cena.figuras).map(figura => ({ id: figura, figura }));
    const pecas = embaralharLista(cena.figuras).map(figura => ({ id: figura, figura, destino: figura }));
    return { ...cena, colunas: cena.figuras.length, linhas: 1, pecas, destinos };
  }

  const celulas = [];
  for (let linha = 0; linha < cena.linhas; linha += 1) {
    for (let coluna = 0; coluna < cena.colunas; coluna += 1) {
      celulas.push({
        id: `c${coluna}-l${linha}`,
        figura: cena.figura,
        coluna,
        linha,
        colunas: cena.colunas,
        linhas: cena.linhas,
      });
    }
  }
  return {
    ...cena,
    destinos: celulas,                                        // na ordem da grade
    pecas: embaralharLista(celulas).map(celula => ({ ...celula, destino: celula.id })),
  };
}

/**
 * A montagem de uma cena. Aceita os dois jeitos de jogar: tocar na peça e
 * depois no destino, ou arrastar (a tela chama encaixar() direto).
 */
export function criarMontagem(cena) {
  const colocadas = new Map();        // destinoId → pecaId
  let selecionada = null;

  const destinoDe = pecaId => cena.pecas.find(peca => peca.id === pecaId)?.destino;
  const jaColocada = pecaId => [...colocadas.values()].includes(pecaId);

  function estado() {
    return {
      selecionada,
      colocadas: Object.fromEntries(colocadas),
      restantes: cena.pecas.length - colocadas.size,
      completa: colocadas.size === cena.pecas.length,
    };
  }

  return {
    estado,

    /** Toca numa peça. Tocar na mesma de novo desmarca; peça já encaixada não sai. */
    selecionar(pecaId) {
      if (jaColocada(pecaId)) return estado();
      selecionada = selecionada === pecaId ? null : pecaId;
      return estado();
    },

    /**
     * Tenta encaixar. Sem `pecaId`, usa a peça selecionada.
     * Devolve `certo: false` sem consequência nenhuma quando não é ali.
     */
    encaixar(destinoId, pecaId = selecionada) {
      if (!pecaId || colocadas.has(destinoId) || jaColocada(pecaId)) {
        return { ...estado(), certo: false, ignorado: true };
      }
      const certo = destinoDe(pecaId) === destinoId;
      if (certo) {
        colocadas.set(destinoId, pecaId);
        selecionada = null;
      } else {
        selecionada = null;       // a peça volta para a origem
      }
      return { ...estado(), certo, pecaId, ignorado: false };
    },

    /** A próxima peça que falta e onde ela vai. É o que a demonstração mostra. */
    proximoEncaixe() {
      const usadas = new Set(colocadas.values());
      const peca = cena.pecas.find(item => !usadas.has(item.id));
      return peca ? { peca, destinoId: peca.destino } : null;
    },

    /** Recomeça a cena do zero. */
    limpar() {
      colocadas.clear();
      selecionada = null;
      return estado();
    },
  };
}
