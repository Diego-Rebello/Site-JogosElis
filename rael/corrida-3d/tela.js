/**
 * Corrida 3D — entrada da tela e cena estática da Etapa 1.
 * Estrutura adaptada do Grande Prêmio do Rael, derivado de Pixel Racer.
 * Copyright (c) 2026 Tarek Elomami — MIT; cópia em LICENSE-pixel-racer.txt.
 * A projeção do javascript-racer (Jake Gordon, MIT) entra na Etapa 2.
 */
import { montarCabecalho } from '../../shared/cabecalho.js';
import { ALTURA_CANVAS, LARGURA_CANVAS, criarCorrida } from '../grande-premio/jogo.js';
import { obterConfiguracoes } from '../../shared/descobertas.js';

montarCabecalho('Corrida 3D');

const convite = document.getElementById('tela-convite');
const telaCorrida = document.getElementById('tela-corrida');
const comecar = document.getElementById('comecar');
const voltar = document.getElementById('voltar-previa');
const canvas = document.getElementById('pista');
const ctx = canvas.getContext('2d');

/** Desenho provisório: a projeção pura e o renderizador vêm nas Etapas 2 e 3. */
function desenharCenaInicial(estado) {
  const horizonte = 170;
  const centro = LARGURA_CANVAS / 2;
  const { inicio, fim } = estado.geometria;

  ctx.clearRect(0, 0, LARGURA_CANVAS, ALTURA_CANVAS);
  ctx.fillStyle = '#7dd3fc';
  ctx.fillRect(0, 0, LARGURA_CANVAS, horizonte);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(0, horizonte, LARGURA_CANVAS, ALTURA_CANVAS - horizonte);

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(centro - 22, horizonte);
  ctx.lineTo(centro + 22, horizonte);
  ctx.lineTo(fim + 18, ALTURA_CANVAS);
  ctx.lineTo(inicio - 18, ALTURA_CANVAS);
  ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(centro - 18, horizonte);
  ctx.lineTo(centro + 18, horizonte);
  ctx.lineTo(fim, ALTURA_CANVAS);
  ctx.lineTo(inicio, ALTURA_CANVAS);
  ctx.fill();

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 3;
  for (let faixa = 1; faixa < estado.faixas; faixa++) {
    ctx.beginPath();
    ctx.moveTo(centro - 18 + faixa * 36 / estado.faixas, horizonte);
    ctx.lineTo(inicio + faixa * (fim - inicio) / estado.faixas, ALTURA_CANVAS);
    ctx.stroke();
  }

  // O carro está na faixa inicial escolhida pelo motor importado.
  const carroX = estado.carro.x + estado.carro.w / 2;
  const carroY = 630;
  ctx.fillStyle = '#0f5aa8';
  ctx.fillRect(carroX - 30, carroY - 34, 60, 44);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(carroX - 22, carroY - 25, 44, 13);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(carroX - 3, carroY - 34, 6, 44);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(carroX - 28, carroY + 3, 10, 6);
  ctx.fillRect(carroX + 18, carroY + 3, 10, 6);
}

comecar.addEventListener('click', () => {
  const estado = criarCorrida({ faixas: obterConfiguracoes().alternativas });
  desenharCenaInicial(estado);
  convite.hidden = true;
  telaCorrida.hidden = false;
  voltar.focus();
});

voltar.addEventListener('click', () => {
  telaCorrida.hidden = true;
  convite.hidden = false;
  comecar.focus();
});
