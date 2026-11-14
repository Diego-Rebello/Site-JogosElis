import { desejos, produtos } from './dados.js';

export const TAMANHO_CASA = 16;

/** Coordenadas dos recortes das folhas da Kenney (preenchido na Etapa 4). */
export const RECORTES = {
  piso: { folha: 'cidade', coluna: 0, linha: 0 },
  parede: { folha: 'cidade', coluna: 0, linha: 0 },
  gondola: { folha: 'interiores', coluna: 0, linha: 0 },
  geladeira: { folha: 'interiores', coluna: 0, linha: 0 },
  balcao: { folha: 'interiores', coluna: 0, linha: 0 },
  banca: { folha: 'interiores', coluna: 0, linha: 0 },
  guloseimas: { folha: 'interiores', coluna: 0, linha: 0 },
  caixa: { folha: 'interiores', coluna: 0, linha: 0 },
  porta: { folha: 'cidade', coluna: 0, linha: 0 },
  personagem: { folha: 'urbano', coluna: 0, linha: 0 },
};

const PALETAS_SECAO = {
  hortifruti: { topo: '#42b870', corpo: '#2e9556', frente: '#1e6b3d', bandeja: '#d9f5e3' },
  padaria: { topo: '#df9d56', corpo: '#c67d3b', frente: '#8f521e', bandeja: '#fae5cf' },
  laticinios: { topo: '#73bdf2', corpo: '#3a86c8', frente: '#245d8f', bandeja: '#dff2ff' },
  mercearia: { topo: '#f0b24d', corpo: '#d48b28', frente: '#9c6014', bandeja: '#fff0d1' },
  acougue: { topo: '#e57373', corpo: '#c94a4a', frente: '#8f2c2c', bandeja: '#fde3e3' },
  bebidas: { topo: '#5bc8db', corpo: '#2b9eb3', frente: '#1b6d7d', bandeja: '#dbf7fc' },
  limpeza: { topo: '#a685e2', corpo: '#7e57c2', frente: '#55368f', bandeja: '#ede4fc' },
};

const PALETA_GULOSEIMA = {
  topo: '#ff85b3',
  corpo: '#e04882',
  frente: '#a8275a',
  bandeja: '#ffe3ee',
};

const SETAS_DIRECAO = {
  cima: [[8, 4], [11, 8.5], [5, 8.5]],
  baixo: [[8, 12], [11, 7.5], [5, 7.5]],
  esquerda: [[4, 8], [8.5, 5], [8.5, 11]],
  direita: [[12, 8], [7.5, 5], [7.5, 11]],
};

const itemPorId = new Map([
  ...produtos.map(p => [p.id, p]),
  ...desejos.map(d => [d.id, d]),
]);

function desenharMovel(ctx, x, y, paleta) {
  ctx.fillStyle = '#2b2b3a';
  ctx.fillRect(x, y, TAMANHO_CASA, TAMANHO_CASA);

  ctx.fillStyle = paleta.topo;
  ctx.fillRect(x + 1, y + 1, 14, 3);

  ctx.fillStyle = paleta.corpo;
  ctx.fillRect(x + 1, y + 4, 14, 8);

  ctx.fillStyle = paleta.bandeja;
  ctx.fillRect(x + 2, y + 3, 12, 9);

  ctx.fillStyle = paleta.frente;
  ctx.fillRect(x + 1, y + 12, 14, 3);
}

/** Carrega os recursos gráficos da loja (versão provisória resolve na hora). */
export function carregarArte() {
  return Promise.resolve({ provisoria: true });
}

/** Desenha uma casa do mapa em coordenadas lógicas (16×16). */
export function desenharCasa(ctx, celula, x, y) {
  if (celula.tipo === 'parede') {
    ctx.fillStyle = '#3b2d54';
    ctx.fillRect(x, y, TAMANHO_CASA, TAMANHO_CASA);
    ctx.fillStyle = '#534173';
    ctx.fillRect(x, y, TAMANHO_CASA, 2);
    ctx.fillStyle = '#291e3b';
    ctx.fillRect(x, y + 13, TAMANHO_CASA, 3);
    ctx.fillRect(x + 7, y + 2, 1, 11);
    return;
  }

  if (celula.tipo === 'produto') {
    const paleta = PALETAS_SECAO[celula.secao] || PALETAS_SECAO.mercearia;
    desenharMovel(ctx, x, y, paleta);
    return;
  }

  if (celula.tipo === 'desejo') {
    desenharMovel(ctx, x, y, PALETA_GULOSEIMA);
    return;
  }

  if (celula.tipo === 'caixa') {
    ctx.fillStyle = '#2b2b3a';
    ctx.fillRect(x, y, TAMANHO_CASA, TAMANHO_CASA);
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(x + 1, y + 1, 14, 10);
    ctx.fillStyle = '#37474f';
    ctx.fillRect(x + 1, y + 11, 14, 4);
    // Esteira verde e registradora dourada
    ctx.fillStyle = '#1b7a45';
    ctx.fillRect(x + 2, y + 3, 5, 6);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x + 8, y + 3, 6, 6);
    ctx.fillStyle = '#2b2b3a';
    ctx.fillRect(x + 9, y + 4, 4, 2);
    return;
  }

  // Piso em ladrilhos suaves alternados
  const casaX = Math.floor(x / TAMANHO_CASA);
  const casaY = Math.floor(y / TAMANHO_CASA);
  ctx.fillStyle = (casaX + casaY) % 2 === 0 ? '#faf6ed' : '#f3ede0';
  ctx.fillRect(x, y, TAMANHO_CASA, TAMANHO_CASA);
  ctx.fillStyle = '#e7dfc9';
  ctx.fillRect(x, y + 15, TAMANHO_CASA, 1);
  ctx.fillRect(x + 15, y, 1, TAMANHO_CASA);
}

/** Desenha o produto ou guloseima sobre a prateleira em (x, y). */
export function desenharProduto(ctx, produtoId, _opcaoId, x, y) {
  const item = itemPorId.get(produtoId);
  if (!item) return;

  ctx.save();
  ctx.font = '10px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.emoji, x + 8, y + 8);
  ctx.restore();
}

/** Desenha a personagem em (x, y) lógicos com direção e passo de caminhada. */
export function desenharPersonagem(ctx, direcao = 'baixo', quadro = 0, x = 0, y = 0) {
  const salto = quadro % 2 === 1 ? -1 : 0;

  ctx.save();
  // Sombra no chão
  ctx.fillStyle = 'rgba(43, 43, 58, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x + 8, y + 13.5, 4.8, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Corpo circular com borda clara e contorno escuro
  ctx.fillStyle = '#d81b7f';
  ctx.beginPath();
  ctx.arc(x + 8, y + 8 + salto, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Seta indicando a direção voltada
  const pontos = SETAS_DIRECAO[direcao] || SETAS_DIRECAO.baixo;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x + pontos[0][0], y + pontos[0][1] + salto);
  ctx.lineTo(x + pontos[1][0], y + pontos[1][1] + salto);
  ctx.lineTo(x + pontos[2][0], y + pontos[2][1] + salto);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Cria ícone DOM para os painéis (versão provisória usa emoji em <span>). */
export function criarIcone(produtoId, _opcaoId = null, escala = 2) {
  const item = itemPorId.get(produtoId);
  const span = document.createElement('span');
  span.className = 'icone-produto';
  span.setAttribute('aria-hidden', 'true');
  span.textContent = item ? item.emoji : '🛒';
  if (escala > 2) {
    span.dataset.escala = String(escala);
  }
  return span;
}
