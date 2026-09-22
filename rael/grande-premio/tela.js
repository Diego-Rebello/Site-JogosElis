/**
 * Grande Prêmio do Rael — tela, Canvas, entrada e fluxo da corrida.
 * Derivado de Pixel Racer (https://github.com/Elomami1976/pixel-racer).
 * Copyright (c) 2026 Tarek Elomami — licença MIT. Cópia em LICENSE-pixel-racer.txt.
 *
 * Etapa 1 do PLANO-GRANDE-PREMIO-DO-RAEL.md: convite e pista parada. O loop,
 * o trânsito, a gasolina e a bandeirada entram nas etapas seguintes.
 */

import { montarCabecalho } from '../../shared/cabecalho.js';
import { tocar } from '../../shared/sons.js';
import { definirPreferencia, preparar } from '../../shared/fala.js';
import { obterConfiguracoes } from '../../shared/descobertas.js';
import { geometriaDaPista, quantidadeDeFaixas } from '../corrida-do-rael/jogo.js';

const LARGURA_CANVAS = 400;
const ALTURA_CANVAS = 700;

export const FASES = Object.freeze({
  CONVITE: 'convite',
  LARGADA: 'largada',
  CORRIDA: 'corrida',
  PAUSA: 'pausa',
  BANDEIRADA: 'bandeirada',
  FIM: 'fim',
});

montarCabecalho('Grande Prêmio do Rael');

const $ = id => document.getElementById(id);

const telas = {
  convite: $('tela-convite'),
  corrida: $('tela-corrida'),
  fim: $('tela-fim'),
};

const canvas = /** @type {HTMLCanvasElement} */ ($('pista'));
const ctx = canvas.getContext('2d');
const btnComecar = /** @type {HTMLButtonElement} */ ($('comecar'));
const avisoVoz = $('aviso-voz');

let faseDaTela = FASES.CONVITE;
let configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
let geometria = geometriaDaPista({ faixas: quantidadeDeFaixas(configuracoes.alternativas) });
let deslocamentoPista = 0;

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, el]) => {
    if (el) el.hidden = chave !== nome;
  });
}

// -----------------------------------------------------------------------------
// Desenho (desenharPista da Corrida do Rael, que veio do drawRoad original)
// -----------------------------------------------------------------------------

function desenharPista() {
  const { inicio, fim, larguraFaixa, faixas } = geometria;

  // Grama nas margens.
  ctx.fillStyle = '#1e7b34';
  ctx.fillRect(0, 0, LARGURA_CANVAS, ALTURA_CANVAS);

  // Asfalto dirigível.
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(inicio, 0, fim - inicio, ALTURA_CANVAS);

  // Linhas brancas de acostamento.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(inicio - 4, 0, 4, ALTURA_CANVAS);
  ctx.fillRect(fim, 0, 4, ALTURA_CANVAS);

  // Divisórias tracejadas entre as faixas.
  const tracejado = 40;
  const ciclo = tracejado * 2;
  for (let i = 1; i < faixas; i++) {
    const xDivisoria = inicio + i * larguraFaixa;
    for (let y = -ciclo; y < ALTURA_CANVAS + ciclo; y += ciclo) {
      const yDesenho = y + deslocamentoPista;
      if (yDesenho + tracejado > 0 && yDesenho < ALTURA_CANVAS) {
        ctx.fillRect(xDivisoria - 2, yDesenho, 4, tracejado);
      }
    }
  }
}

// -----------------------------------------------------------------------------
// Fluxo
// -----------------------------------------------------------------------------

btnComecar.addEventListener('click', async () => {
  if (faseDaTela !== FASES.CONVITE) return;
  tocar('clique');
  btnComecar.disabled = true;

  // Preparar a fala no toque é exigência do iOS.
  const estado = await preparar();
  if (!estado.sinteseDisponivel && !estado.mudo && configuracoes.voz !== 'sem-fala') {
    avisoVoz.textContent = 'Um adulto pode ler as frases da tela.';
    avisoVoz.hidden = false;
  }

  // A quantidade de faixas é lida uma vez por corrida.
  configuracoes = obterConfiguracoes();
  definirPreferencia(configuracoes.voz);
  geometria = geometriaDaPista({ faixas: quantidadeDeFaixas(configuracoes.alternativas) });

  faseDaTela = FASES.LARGADA;
  mostrarTela('corrida');
  desenharPista();
  btnComecar.disabled = false;
});

desenharPista();
