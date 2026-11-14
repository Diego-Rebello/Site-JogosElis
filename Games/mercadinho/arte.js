import { desejos, produtos } from './dados.js';

export const TAMANHO_CASA = 16;

/** Coordenadas dos recortes de spritesheet caso sejam usados em etapas futuras. */
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

const PALETAS_GONDOLA = {
  mercearia: {
    tampo: '#e07a24',
    tampoClaro: '#f49d4b',
    fundo: '#f5ead9',
    prateleira: '#fffaf2',
    bordaPrat: '#d8c5aa',
    rodape: '#8d5324',
    pacotes: ['#e65100', '#2e7d32', '#1565c0', '#c62828', '#f9a825'],
  },
  limpeza: {
    tampo: '#7856c2',
    tampoClaro: '#9d7fe0',
    fundo: '#efeafa',
    prateleira: '#fcfaff',
    bordaPrat: '#cbc0e6',
    rodape: '#4c328a',
    pacotes: ['#00acc1', '#7cb342', '#ec407a', '#3949ab', '#26a69a'],
  },
  guloseimas: {
    tampo: '#e44b86',
    tampoClaro: '#ff80b0',
    fundo: '#fff0f6',
    prateleira: '#ffffff',
    bordaPrat: '#f2bfd3',
    rodape: '#a62658',
    pacotes: ['#ff4081', '#ffca28', '#29b6f6', '#ab47bc', '#66bb6a'],
  },
};

const itemPorId = new Map([
  ...produtos.map(p => [p.id, p]),
  ...desejos.map(d => [d.id, d]),
]);

function retanguloArredondado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

function semVizinho(vizinhos, lado) {
  return !vizinhos?.[lado];
}

function bordasHorizontais(x, vizinhos) {
  const esq = semVizinho(vizinhos, 'esquerda') ? 0.5 : 0;
  const dir = semVizinho(vizinhos, 'direita') ? 0.5 : 0;
  return { x0: x + esq, larg: TAMANHO_CASA - esq - dir, esq, dir };
}

function desenharPiso(ctx, x, y, vizinhos) {
  const casaX = vizinhos?.casaX ?? Math.floor(x / TAMANHO_CASA);
  const casaY = vizinhos?.casaY ?? Math.floor(y / TAMANHO_CASA);
  const par = (casaX + casaY) % 2 === 0;

  ctx.fillStyle = par ? '#fcf9f3' : '#f4eee3';
  ctx.fillRect(x, y, TAMANHO_CASA, TAMANHO_CASA);

  // Brilho sutil diagonal de porcelanato limpo
  ctx.fillStyle = par ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 1);
  ctx.lineTo(x + 8, y + 1);
  ctx.lineTo(x + 1, y + 8);
  ctx.closePath();
  ctx.fill();

  // Rejunte fino entre ladrilhos
  ctx.fillStyle = '#e5dccb';
  ctx.fillRect(x, y + TAMANHO_CASA - 0.35, TAMANHO_CASA, 0.35);
  ctx.fillRect(x + TAMANHO_CASA - 0.35, y, 0.35, TAMANHO_CASA);

  // Sombra projetada pelo móvel ou parede logo acima
  if (vizinhos?.acimaSolido) {
    const grad = ctx.createLinearGradient(x, y, x, y + 3.2);
    grad.addColorStop(0, 'rgba(65, 48, 36, 0.22)');
    grad.addColorStop(1, 'rgba(65, 48, 36, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, TAMANHO_CASA, 3.2);
  }
}

function desenharParede(ctx, x, y, vizinhos) {
  const casaX = vizinhos?.casaX ?? 0;
  const casaY = vizinhos?.casaY ?? 0;
  const ehEntrada = Boolean(vizinhos?.ehPortaEntrada);
  const ehVitrine = casaY === vizinhos?.ultimaLinha && !ehEntrada;

  if (ehEntrada) {
    // Porta automática deslizante de vidro com faixa de entrada
    ctx.fillStyle = '#fcf9f3';
    ctx.fillRect(x, y, TAMANHO_CASA, TAMANHO_CASA);

    ctx.fillStyle = '#dfe7ee';
    ctx.fillRect(x, y + 1.5, TAMANHO_CASA, 11);

    const vidro = ctx.createLinearGradient(x, y + 2, x + TAMANHO_CASA, y + 12);
    vidro.addColorStop(0, '#c8ebf7');
    vidro.addColorStop(0.5, '#eaf8fd');
    vidro.addColorStop(1, '#a9ddf0');
    ctx.fillStyle = vidro;
    ctx.fillRect(x + 1, y + 2.5, TAMANHO_CASA - 2, 9);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2.5);
    ctx.lineTo(x + 6, y + 2.5);
    ctx.lineTo(x + 3.5, y + 11.5);
    ctx.lineTo(x + 1.5, y + 11.5);
    ctx.closePath();
    ctx.fill();

    // Marco metálico inferior e setas verdes de boas-vindas
    ctx.fillStyle = '#78909c';
    ctx.fillRect(x, y + 1.2, TAMANHO_CASA, 1.3);
    ctx.fillRect(x, y + 11.5, TAMANHO_CASA, 1.4);
    ctx.fillStyle = '#43a047';
    ctx.fillRect(x + 4, y + 6.5, TAMANHO_CASA - 8, 1.1);
    ctx.fillStyle = '#d7ccc8';
    ctx.fillRect(x, y + 12.9, TAMANHO_CASA, 3.1);
    return;
  }

  if (ehVitrine) {
    // Fachada frontal iluminada com janelas do mercado e mureta bege
    ctx.fillStyle = '#e7dfd3';
    ctx.fillRect(x, y, TAMANHO_CASA, TAMANHO_CASA);
    ctx.fillStyle = '#9aa8b4';
    ctx.fillRect(x, y + 1.5, TAMANHO_CASA, 9.5);

    const vidro = ctx.createLinearGradient(x, y + 2, x + TAMANHO_CASA, y + 10);
    vidro.addColorStop(0, '#bfe5f5');
    vidro.addColorStop(1, '#e1f4fc');
    ctx.fillStyle = vidro;
    ctx.fillRect(x + 0.8, y + 2.3, TAMANHO_CASA - 1.6, 7.8);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(x + 2, y + 3, 2.2, 6.2);

    ctx.fillStyle = '#c8bca9';
    ctx.fillRect(x, y + 11, TAMANHO_CASA, 5);
    ctx.fillStyle = '#b3a38d';
    ctx.fillRect(x, y + 11, TAMANHO_CASA, 1);

    // Vasinhos decorativos perto dos cantos da fachada
    if (casaX === 1 || casaX === 22) {
      ctx.fillStyle = '#c97a4b';
      ctx.fillRect(x + 5.5, y + 8.8, 5, 3);
      ctx.fillStyle = '#3c9d58';
      ctx.beginPath();
      ctx.arc(x + 8, y + 7.2, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5ec077';
      ctx.beginPath();
      ctx.arc(x + 6.8, y + 6.5, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  // Parede interna clara e acolhedora de supermercado
  const gradParede = ctx.createLinearGradient(x, y, x, y + TAMANHO_CASA);
  gradParede.addColorStop(0, '#f3ece0');
  gradParede.addColorStop(0.7, '#e2d7c6');
  gradParede.addColorStop(1, '#cfc1ac');
  ctx.fillStyle = gradParede;
  ctx.fillRect(x, y, TAMANHO_CASA, TAMANHO_CASA);

  // Rodapé ou moldura superior limpa
  if (casaY === 0) {
    ctx.fillStyle = '#fff9ee';
    ctx.fillRect(x, y, TAMANHO_CASA, 2.5);
    ctx.fillStyle = '#e5a3b8';
    ctx.fillRect(x, y + 11.5, TAMANHO_CASA, 1.8);
    ctx.fillStyle = '#a89985';
    ctx.fillRect(x, y + 15.1, TAMANHO_CASA, 0.9);
  } else {
    ctx.fillStyle = '#d6c8b4';
    ctx.fillRect(x + 0.5, y, TAMANHO_CASA - 1, TAMANHO_CASA);
    ctx.fillStyle = '#efe7da';
    ctx.fillRect(x + 1.5, y, TAMANHO_CASA - 3, TAMANHO_CASA);
  }
}

/**
 * Preenche uma prateleira com embalagens variadas (caixas, garrafas, latas e galões).
 */
function desenharPacotinhos(ctx, x0, larg, yBase, paleta, semente) {
  const passo = 2.45;
  const inicio = x0 + 0.7;
  const fim = x0 + larg - 2.15;
  let idx = 0;

  for (let px = inicio; px <= fim; px += passo) {
    const varIdx = semente + idx;
    const cor = paleta.pacotes[(semente + idx * 3) % paleta.pacotes.length];
    const corAcento = paleta.pacotes[(semente + idx * 3 + 1) % paleta.pacotes.length];
    const formato = varIdx % 4;

    if (formato === 0) {
      // Caixa de cereal / biscoito com faixa frontal
      const alt = 2.25 + (varIdx % 2) * 0.35;
      ctx.fillStyle = cor;
      retanguloArredondado(ctx, px, yBase - alt, 1.9, alt, 0.3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 252, 245, 0.86)';
      ctx.fillRect(px + 0.25, yBase - alt + 0.65, 1.4, alt * 0.42);
      ctx.fillStyle = corAcento;
      ctx.fillRect(px + 0.35, yBase - alt + 0.22, 1.2, 0.28);
    } else if (formato === 1) {
      // Garrafa / frasco com gargalo e tampa
      const cx = px + 0.95;
      const altCorpo = 1.65 + (varIdx % 2) * 0.2;
      ctx.fillStyle = cor;
      retanguloArredondado(ctx, cx - 0.68, yBase - altCorpo, 1.36, altCorpo, 0.35);
      ctx.fill();
      ctx.fillRect(cx - 0.26, yBase - altCorpo - 0.45, 0.52, 0.5);
      ctx.fillStyle = corAcento;
      retanguloArredondado(ctx, cx - 0.3, yBase - altCorpo - 0.7, 0.6, 0.28, 0.1);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.fillRect(cx - 0.5, yBase - altCorpo + 0.42, 1.0, 0.65);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.fillRect(cx - 0.5, yBase - altCorpo + 0.12, 0.24, altCorpo - 0.24);
    } else if (formato === 2) {
      // Lata cilíndrica com aro metálico superior e rótulo
      const alt = 1.75 + (varIdx % 2) * 0.25;
      ctx.fillStyle = cor;
      retanguloArredondado(ctx, px + 0.15, yBase - alt, 1.6, alt, 0.28);
      ctx.fill();
      ctx.fillStyle = '#eceff1';
      ctx.fillRect(px + 0.15, yBase - alt, 1.6, 0.26);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
      ctx.fillRect(px + 0.22, yBase - alt + 0.58, 1.46, 0.52);
    } else {
      // Galão / embalagem com alça lateral e tampa deslocada
      const alt = 2.15 + (varIdx % 2) * 0.25;
      ctx.fillStyle = cor;
      retanguloArredondado(ctx, px, yBase - alt, 1.95, alt, 0.4);
      ctx.fill();
      ctx.fillStyle = corAcento;
      retanguloArredondado(ctx, px + 0.25, yBase - alt - 0.32, 0.58, 0.36, 0.12);
      ctx.fill();
      // Recorte sugerindo a alça e etiqueta central
      ctx.fillStyle = paleta.fundo;
      retanguloArredondado(ctx, px + 1.25, yBase - alt + 0.35, 0.42, 0.72, 0.18);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
      retanguloArredondado(ctx, px + 0.22, yBase - alt + 0.75, 0.9, 0.95, 0.18);
      ctx.fill();
    }
    idx++;
  }
}

function desenharGondolaMercado(ctx, x, y, secao, vizinhos) {
  const paleta = PALETAS_GONDOLA[secao] || PALETAS_GONDOLA.mercearia;
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);
  const topo = semVizinho(vizinhos, 'cima');
  const baixo = semVizinho(vizinhos, 'baixo');
  const casaX = vizinhos?.casaX ?? 0;
  const casaY = vizinhos?.casaY ?? 0;

  // Estrutura externa contínua da gôndola
  ctx.fillStyle = '#9c8c7c';
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);

  // Fundo interno das prateleiras
  ctx.fillStyle = paleta.fundo;
  ctx.fillRect(x0 + esq * 0.6, y + (topo ? 2.4 : 0), larg - (esq + dir) * 0.6, TAMANHO_CASA - (topo ? 2.4 : 0) - (baixo ? 1.5 : 0));

  // Testa colorida no topo da gôndola
  if (topo) {
    ctx.fillStyle = paleta.tampo;
    ctx.fillRect(x0, y, larg, 2.6);
    ctx.fillStyle = paleta.tampoClaro;
    ctx.fillRect(x0 + esq * 0.5, y + 0.35, larg - (esq + dir) * 0.5, 0.9);
  }

  // 3 níveis de prateleiras abastecidas com mercadorias e etiquetas de preço amarelas
  const alturasNiveis = [5.4, 9.6, 13.7];
  alturasNiveis.forEach((offY, nivelIdx) => {
    const yPrat = y + offY;
    desenharPacotinhos(ctx, x0 + esq * 0.5, larg - (esq + dir) * 0.5, yPrat - 0.1, paleta, casaX * 5 + casaY * 3 + nivelIdx);

    ctx.fillStyle = paleta.prateleira;
    ctx.fillRect(x0 + esq * 0.4, yPrat, larg - (esq + dir) * 0.4, 1.3);
    // Faixa amarela porta-etiquetas
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(x0 + esq * 0.4, yPrat + 0.55, larg - (esq + dir) * 0.4, 0.55);
    ctx.fillStyle = paleta.bordaPrat;
    ctx.fillRect(x0 + esq * 0.4, yPrat + 1.1, larg - (esq + dir) * 0.4, 0.35);
  });

  if (baixo) {
    ctx.fillStyle = paleta.rodape;
    ctx.fillRect(x0, y + 14.5, larg, 1.5);
  }
}

function desenharHortifruti(ctx, x, y, vizinhos) {
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);
  const topo = semVizinho(vizinhos, 'cima');
  const baixo = semVizinho(vizinhos, 'baixo');
  const casaY = vizinhos?.casaY ?? 0;

  // Estrutura em madeira de feira / banca inclinada
  ctx.fillStyle = '#6d4019';
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);
  ctx.fillStyle = '#9e5d28';
  ctx.fillRect(x0 + esq * 0.5, y + (topo ? 2.4 : 0), larg - (esq + dir) * 0.5, TAMANHO_CASA - (topo ? 2.4 : 0) - (baixo ? 1.4 : 0));

  // Toldo listrado verde e creme no topo
  if (topo) {
    for (let sx = 0; sx < larg; sx += 2.6) {
      ctx.fillStyle = Math.floor(sx / 2.6) % 2 === 0 ? '#2e9556' : '#fff8ec';
      ctx.fillRect(x0 + sx, y, Math.min(2.6, larg - sx), 2.5);
    }
  }

  // Caixotes de madeira com ripas e forro trançado
  const caixasY = [2.8, 9.2];
  caixasY.forEach((cy, idx) => {
    ctx.fillStyle = '#d49a5c';
    retanguloArredondado(ctx, x + 1.4, y + cy, TAMANHO_CASA - 2.8, 5.2, 0.7);
    ctx.fill();
    ctx.fillStyle = '#b47439';
    ctx.fillRect(x + 1.8, y + cy + 2.3, TAMANHO_CASA - 3.6, 0.45);
    ctx.fillStyle = '#e7c688';
    retanguloArredondado(ctx, x + 2.1, y + cy + 0.6, TAMANHO_CASA - 4.2, 3.8, 0.4);
    ctx.fill();

    // Frutas/legumes coloridos nos caixotes atrás da plaquinha do produto
    const cores = idx === 0
      ? ['#4caf50', '#ff7043', '#8bc34a']
      : ['#ffa726', '#ef5350', '#fdd835'];
    for (let f = 0; f < 4; f++) {
      ctx.fillStyle = cores[(casaY + f) % cores.length];
      ctx.beginPath();
      ctx.arc(x + 3.6 + f * 2.9, y + cy + 2.4 + (f % 2) * 0.5, 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  if (baixo) {
    ctx.fillStyle = '#542f11';
    ctx.fillRect(x0, y + 14.5, larg, 1.5);
  }
}

function desenharGeladeiraLaticinios(ctx, x, y, vizinhos) {
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);

  // Gabinete refrigerado comercial prateado/azul
  ctx.fillStyle = '#6b8299';
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);

  // Testa superior iluminada azul fria
  ctx.fillStyle = '#256fa8';
  ctx.fillRect(x0, y, larg, 2.5);
  ctx.fillStyle = '#74c0fc';
  ctx.fillRect(x0 + esq * 0.4, y + 1.9, larg - (esq + dir) * 0.4, 0.6);

  // Interior LED frio atrás da porta de vidro
  const led = ctx.createLinearGradient(x, y + 2.5, x, y + 14.2);
  led.addColorStop(0, '#e3f6ff');
  led.addColorStop(1, '#c3e7fa');
  ctx.fillStyle = led;
  ctx.fillRect(x0 + esq * 0.5, y + 2.5, larg - (esq + dir) * 0.5, 11.7);

  // Prateleiras brancas com caixinhas de leite/iogurte
  for (const py of [5.8, 9.4, 12.9]) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x0 + 1.2, y + py - 2.1, 2.2, 2.0);
    ctx.fillStyle = '#4dabf7';
    ctx.fillRect(x0 + 4.1, y + py - 1.9, 1.9, 1.8);
    ctx.fillStyle = '#ffd43b';
    ctx.fillRect(x0 + 10.2, y + py - 1.8, 2.2, 1.7);
    ctx.fillStyle = '#90a4ae';
    ctx.fillRect(x0 + esq * 0.4, y + py, larg - (esq + dir) * 0.4, 0.7);
  }

  // Moldura da porta de vidro, puxador metálico e reflexo oblíquo
  ctx.strokeStyle = '#90a4ae';
  ctx.lineWidth = 0.7;
  ctx.strokeRect(x + 0.8, y + 2.8, TAMANHO_CASA - 1.6, 11.1);
  ctx.fillStyle = '#455a64';
  ctx.fillRect(x + TAMANHO_CASA - 2.1, y + 6.5, 0.65, 3.8);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.moveTo(x + 1.8, y + 3.0);
  ctx.lineTo(x + 4.8, y + 3.0);
  ctx.lineTo(x + 2.3, y + 13.5);
  ctx.lineTo(x + 1.2, y + 13.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#546e7a';
  ctx.fillRect(x0, y + 14.2, larg, 1.8);
}

function desenharAcougue(ctx, x, y, vizinhos) {
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);

  ctx.fillStyle = '#9aa8b4';
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);

  // Toldo listrado vermelho e branco clássico de açougue
  for (let sx = 0; sx < larg; sx += 2.6) {
    ctx.fillStyle = Math.floor(sx / 2.6) % 2 === 0 ? '#d9383a' : '#fffaf8';
    ctx.fillRect(x0 + sx, y, Math.min(2.6, larg - sx), 2.8);
  }

  // Vitrine refrigerada com bandejas brancas e reflexo de vidro
  ctx.fillStyle = '#fff5f5';
  ctx.fillRect(x0 + esq * 0.5, y + 2.8, larg - (esq + dir) * 0.5, 8.8);
  ctx.fillStyle = '#ef9a9a';
  ctx.fillRect(x + 2.2, y + 4.4, 4.2, 2.8);
  ctx.fillRect(x + 9.4, y + 4.8, 4.2, 2.5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(x + 1.2, y + 3.2, TAMANHO_CASA - 2.4, 1.3);

  // Balcão frontal em inox e faixa vermelha
  ctx.fillStyle = '#cfd8dc';
  ctx.fillRect(x0, y + 11.6, larg, 2.7);
  ctx.fillStyle = '#c94a4a';
  ctx.fillRect(x0, y + 14.3, larg, 1.7);
}

function desenharBebidas(ctx, x, y, vizinhos) {
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);

  ctx.fillStyle = '#185b69';
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);

  // Letreiro superior azul-turquesa
  ctx.fillStyle = '#0e7c90';
  ctx.fillRect(x0, y, larg, 2.5);
  ctx.fillStyle = '#80deea';
  ctx.fillRect(x0 + esq * 0.4, y + 1.8, larg - (esq + dir) * 0.4, 0.6);

  // Interior resfriado
  ctx.fillStyle = '#dff6fa';
  ctx.fillRect(x0 + esq * 0.5, y + 2.5, larg - (esq + dir) * 0.5, 11.7);

  // Fileiras de garrafas e latinhas coloridas
  const coresGarrafas = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#00acc1'];
  for (const [linhaIdx, py] of [6.0, 9.8, 13.4].entries()) {
    for (let px = x + 1.6; px <= x + 13.0; px += 2.2) {
      const cor = coresGarrafas[(Math.round(px) + linhaIdx) % coresGarrafas.length];
      ctx.fillStyle = cor;
      retanguloArredondado(ctx, px, y + py - 2.4, 1.5, 2.2, 0.45);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 0.45, y + py - 2.7, 0.6, 0.35);
    }
    ctx.fillStyle = '#607d8b';
    ctx.fillRect(x0 + esq * 0.4, y + py, larg - (esq + dir) * 0.4, 0.65);
  }

  ctx.fillStyle = '#134e5a';
  ctx.fillRect(x0, y + 14.2, larg, 1.8);
}

function desenharPadaria(ctx, x, y, vizinhos) {
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);
  const topo = semVizinho(vizinhos, 'cima');
  const baixo = semVizinho(vizinhos, 'baixo');

  // Ilha de madeira dourada acolhedora
  ctx.fillStyle = '#80471c';
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);
  ctx.fillStyle = '#b97338';
  ctx.fillRect(x0 + esq * 0.5, y + (topo ? 2.4 : 0), larg - (esq + dir) * 0.5, TAMANHO_CASA - (topo ? 2.4 : 0) - (baixo ? 1.5 : 0));

  if (topo) {
    ctx.fillStyle = '#d98a3f';
    ctx.fillRect(x0, y, larg, 2.4);
    ctx.fillStyle = '#ffdf9e';
    ctx.fillRect(x0 + esq * 0.4, y + 1.8, larg - (esq + dir) * 0.4, 0.55);
  }

  // Cestas de vime com iluminação âmbar e pães ao fundo
  for (const cy of [3.0, 9.0]) {
    ctx.fillStyle = '#e7bd74';
    retanguloArredondado(ctx, x + 1.3, y + cy, TAMANHO_CASA - 2.6, 5.1, 0.8);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    retanguloArredondado(ctx, x + 1.9, y + cy + 0.6, TAMANHO_CASA - 3.8, 3.8, 0.5);
    ctx.fill();

    // Pãezinhos assados na cesta
    ctx.fillStyle = '#d48b35';
    for (let px = x + 3.2; px <= x + 12.2; px += 3.0) {
      ctx.beginPath();
      ctx.ellipse(px, y + cy + 2.5, 1.25, 0.85, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (baixo) {
    ctx.fillStyle = '#633513';
    ctx.fillRect(x0, y + 14.5, larg, 1.5);
  }
}

function desenharCaixa(ctx, x, y, vizinhos) {
  const casaX = vizinhos?.casaX ?? Math.floor(x / TAMANHO_CASA);
  const numeroCaixa = casaX <= 9 ? '1' : casaX <= 13 ? '2' : '3';

  // Balcão moderno do caixa com esteira rolante e registradora
  ctx.fillStyle = '#455a64';
  retanguloArredondado(ctx, x + 0.6, y + 1.0, TAMANHO_CASA - 1.2, 14.2, 1.2);
  ctx.fill();

  // Tampo claro do balcão
  ctx.fillStyle = '#eceff1';
  retanguloArredondado(ctx, x + 1.2, y + 2.2, TAMANHO_CASA - 2.4, 10.6, 0.8);
  ctx.fill();

  // Esteira preta com divisórias e separador vermelho
  ctx.fillStyle = '#263238';
  retanguloArredondado(ctx, x + 2.0, y + 3.0, 5.4, 8.8, 0.5);
  ctx.fill();
  ctx.fillStyle = '#37474f';
  for (let ry = 4.2; ry < 11.2; ry += 1.6) {
    ctx.fillRect(x + 2.3, y + ry, 4.8, 0.4);
  }
  ctx.fillStyle = '#ef5350';
  ctx.fillRect(x + 2.4, y + 6.9, 4.6, 0.75);

  // Leitor de código de barras (janela azul brilhante)
  ctx.fillStyle = '#80deea';
  ctx.fillRect(x + 8.0, y + 8.5, 2.2, 1.6);

  // Caixa registradora e visor verde
  ctx.fillStyle = '#f5f0e6';
  retanguloArredondado(ctx, x + 9.4, y + 2.8, 4.8, 5.0, 0.5);
  ctx.fill();
  ctx.fillStyle = '#1b4332';
  ctx.fillRect(x + 10.0, y + 3.3, 3.6, 1.8);
  ctx.fillStyle = '#52e088';
  ctx.fillRect(x + 10.4, y + 3.7, 2.8, 0.9);

  // Atendente simpático atrás da bancada (cabeça e uniforme verde/rosa)
  ctx.fillStyle = '#2e9556';
  ctx.beginPath();
  ctx.arc(x + 11.8, y + 2.1, 2.4, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#f4b897';
  ctx.beginPath();
  ctx.arc(x + 11.8, y + 1.8, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b5e20';
  ctx.beginPath();
  ctx.arc(x + 11.8, y + 1.2, 1.75, Math.PI, 0);
  ctx.fill();

  // Plaquinha numérica do caixa (1, 2 ou 3)
  ctx.fillStyle = '#2e9556';
  retanguloArredondado(ctx, x + 8.4, y + 10.6, 5.8, 3.5, 0.7);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 2.8px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`CX ${numeroCaixa}`, x + 11.3, y + 12.45);
}

/** Carrega os recursos gráficos da loja. */
export function carregarArte() {
  return Promise.resolve({ altaResolucao: true });
}

/** Desenha uma casa do mapa em coordenadas lógicas (16×16). */
export function desenharCasa(ctx, celula, x, y, vizinhos = null) {
  if (celula.tipo === 'parede') {
    desenharParede(ctx, x, y, vizinhos);
    return;
  }

  if (celula.tipo === 'produto') {
    switch (celula.secao) {
      case 'hortifruti':
        desenharHortifruti(ctx, x, y, vizinhos);
        return;
      case 'laticinios':
        desenharGeladeiraLaticinios(ctx, x, y, vizinhos);
        return;
      case 'acougue':
        desenharAcougue(ctx, x, y, vizinhos);
        return;
      case 'bebidas':
        desenharBebidas(ctx, x, y, vizinhos);
        return;
      case 'padaria':
        desenharPadaria(ctx, x, y, vizinhos);
        return;
      default:
        desenharGondolaMercado(ctx, x, y, celula.secao || 'mercearia', vizinhos);
        return;
    }
  }

  if (celula.tipo === 'desejo') {
    desenharGondolaMercado(ctx, x, y, 'guloseimas', vizinhos);
    return;
  }

  if (celula.tipo === 'caixa') {
    desenharPiso(ctx, x, y, vizinhos);
    desenharCaixa(ctx, x, y, vizinhos);
    return;
  }

  desenharPiso(ctx, x, y, vizinhos);
}

/** Desenha o produto em destaque sobre a prateleira com plaquinha nítida em alta resolução. */
/**
 * Desenha o medalhão compacto do produto exibido sobre a prateleira/vitrine.
 */
export function desenharProduto(ctx, produtoId, _opcaoId, x, y) {
  const item = itemPorId.get(produtoId);
  if (!item) return;

  ctx.save();
  // Medalhão translúcido compacto sobre a prateleira para leitura imediata sem tampar o móvel
  ctx.fillStyle = 'rgba(55, 40, 30, 0.22)';
  ctx.beginPath();
  ctx.arc(x + 8, y + 9.1, 4.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 253, 248, 0.94)';
  ctx.strokeStyle = 'rgba(90, 68, 52, 0.38)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(x + 8, y + 8.6, 4.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = '7.2px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.emoji, x + 8, y + 8.8);
  ctx.restore();
}

function desenharItensNoCarrinho(ctx, quantidade, rx, ry, rw, rh) {
  const qtd = Math.min(4, Math.max(0, Number(quantidade) || 0));
  if (!qtd) return;

  const itensVisuais = [
    { dx: 0.22, dy: 0.35, w: 1.5, h: 1.5, cor: '#ff7043' },
    { dx: 0.58, dy: 0.30, w: 1.4, h: 1.8, cor: '#42a5f5' },
    { dx: 0.38, dy: 0.55, w: 1.7, h: 1.3, cor: '#66bb6a' },
    { dx: 0.66, dy: 0.58, w: 1.3, h: 1.4, cor: '#ffca28' },
  ];

  for (let i = 0; i < qtd; i++) {
    const it = itensVisuais[i];
    ctx.fillStyle = it.cor;
    retanguloArredondado(ctx, rx + rw * it.dx, ry + rh * it.dy, it.w, it.h, 0.35);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fillRect(rx + rw * it.dx + 0.25, ry + rh * it.dy + 0.2, it.w - 0.5, 0.35);
  }
}

function desenharGradeCarrinho(ctx, x, y, w, h, topScale = 1.0) {
  const xTopEsq = x + ((1 - topScale) * w) / 2;
  const xTopDir = x + w - ((1 - topScale) * w) / 2;

  ctx.fillStyle = 'rgba(235, 245, 255, 0.62)';
  ctx.beginPath();
  ctx.moveTo(xTopEsq, y);
  ctx.lineTo(xTopDir, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#607d8b';
  ctx.lineWidth = 0.55;
  ctx.stroke();

  // Arames da grade metálica
  ctx.strokeStyle = '#90a4ae';
  ctx.lineWidth = 0.32;
  ctx.beginPath();
  for (let f = 1; f <= 3; f++) {
    const frac = f / 4;
    const vx = x + w * frac;
    const tx = xTopEsq + (xTopDir - xTopEsq) * frac;
    ctx.moveTo(tx, y);
    ctx.lineTo(vx, y + h);
  }
  for (let r = 1; r <= 2; r++) {
    const ry = y + (h * r) / 3;
    const xl = xTopEsq + (x - xTopEsq) * (r / 3);
    const xr = xTopDir + (x + w - xTopDir) * (r / 3);
    ctx.moveTo(xl, ry);
    ctx.lineTo(xr, ry);
  }
  ctx.stroke();
}

function desenharPersonagemLateral(ctx, passo, balanco, itensNoCarrinho) {
  // Perfil voltado para a direita (esquerda usa espelho horizontal no contexto)
  // 1. Sombra no chão sob a Elis e o carrinho
  ctx.fillStyle = 'rgba(55, 40, 30, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0.4, 5.6, 7.2, 2.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Rodinhas traseira e dianteira do carrinho
  for (const wx of [1.4, 5.6]) {
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.arc(wx, 5.1, 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.arc(wx, 5.1, 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Estrutura cromada inferior e cabo rosa
  ctx.strokeStyle = '#78909c';
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.moveTo(1.2, 4.4);
  ctx.lineTo(5.8, 4.4);
  ctx.moveTo(1.4, 4.4);
  ctx.lineTo(0.4, -0.6);
  ctx.lineTo(-0.9, -0.8);
  ctx.stroke();

  // 4. Cesta aramada inclinada + itens recolhidos
  ctx.fillStyle = 'rgba(235, 245, 255, 0.65)';
  ctx.beginPath();
  ctx.moveTo(0.7, -0.3);
  ctx.lineTo(7.1, 0.2);
  ctx.lineTo(6.1, 3.6);
  ctx.lineTo(1.2, 3.6);
  ctx.closePath();
  ctx.fill();

  desenharItensNoCarrinho(ctx, itensNoCarrinho, 1.4, 0.1, 4.6, 3.1);

  ctx.strokeStyle = '#607d8b';
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  ctx.moveTo(0.7, -0.3);
  ctx.lineTo(7.1, 0.2);
  ctx.lineTo(6.1, 3.6);
  ctx.lineTo(1.2, 3.6);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#90a4ae';
  ctx.lineWidth = 0.32;
  ctx.beginPath();
  for (let gx = 2.1; gx <= 5.9; gx += 1.2) {
    ctx.moveTo(gx, -0.1);
    ctx.lineTo(gx - 0.3, 3.5);
  }
  ctx.moveTo(0.95, 1.6);
  ctx.lineTo(6.6, 1.9);
  ctx.stroke();

  // Alça rosa do carrinho
  ctx.fillStyle = '#d81b7f';
  retanguloArredondado(ctx, -1.3, -1.2, 1.3, 0.85, 0.35);
  ctx.fill();

  // 5. Pernas e tênis da Elis andando
  const peFrenteX = -3.1 + passo * 1.35;
  const peTrasX = -3.8 - passo * 1.35;

  ctx.fillStyle = '#5c4033';
  ctx.fillRect(peTrasX - 0.5, 2.2, 1.1, 2.4);
  ctx.fillStyle = '#e91e63';
  retanguloArredondado(ctx, peTrasX - 0.6, 4.3, 2.0, 1.15, 0.45);
  ctx.fill();

  ctx.fillStyle = '#f4b897';
  ctx.fillRect(peFrenteX - 0.5, 2.2, 1.1, 2.5);
  ctx.fillStyle = '#ff4081';
  retanguloArredondado(ctx, peFrenteX - 0.6, 4.4, 2.2, 1.2, 0.45);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(peFrenteX - 0.5, 5.2, 2.0, 0.4);

  // 6. Corpo: blusinha amarela e jardineira rosa
  ctx.fillStyle = '#ffd54f';
  retanguloArredondado(ctx, -5.0, -2.0 + balanco, 3.3, 3.2, 1.0);
  ctx.fill();

  ctx.fillStyle = '#ec407a';
  retanguloArredondado(ctx, -5.1, -0.7 + balanco, 3.5, 3.4, 0.9);
  ctx.fill();

  // Braço estendido segurando a alça do carrinho
  ctx.strokeStyle = '#f4b897';
  ctx.lineWidth = 1.25;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-2.7, -1.0 + balanco);
  ctx.lineTo(-0.8, -0.75);
  ctx.stroke();

  // 7. Cabeça, cabelo castanho, rabinho e laço rosa
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.arc(-6.0, -3.9 + balanco * 1.2, 1.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff80ab';
  ctx.beginPath();
  ctx.arc(-5.3, -4.4 + balanco * 1.2, 0.75, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f4b897';
  ctx.beginPath();
  ctx.arc(-3.2, -4.3 + balanco, 2.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.arc(-3.5, -4.7 + balanco, 2.55, Math.PI * 0.72, Math.PI * 1.95);
  ctx.fill();

  // Olho, bochecha rosada e sorriso
  ctx.fillStyle = '#2b2b3a';
  ctx.beginPath();
  ctx.arc(-1.85, -4.2 + balanco, 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 118, 154, 0.65)';
  ctx.beginPath();
  ctx.arc(-2.1, -3.3 + balanco, 0.55, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Desenha a Elis olhando para baixo com rosto visível acima da alça e carrinho cromado à frente.
 */
function desenharPersonagemBaixo(ctx, passo, balanco, itensNoCarrinho) {
  // Sombra suave sob personagem e carrinho
  ctx.fillStyle = 'rgba(55, 40, 30, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 5.7, 5.1, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tênis alternando o passo visíveis sob o chassi do carrinho
  const peEsqY = 4.9 + passo * 0.6;
  const peDirY = 4.9 - passo * 0.6;
  ctx.fillStyle = '#e91e63';
  retanguloArredondado(ctx, -2.5, peEsqY, 1.55, 1.25, 0.45);
  ctx.fill();
  ctx.fillStyle = '#ff4081';
  retanguloArredondado(ctx, 0.95, peDirY, 1.55, 1.25, 0.45);
  ctx.fill();

  // Tronco (blusa amarela + jardineira rosa) posicionado acima da barra do carrinho
  ctx.fillStyle = '#ffd54f';
  retanguloArredondado(ctx, -2.6, -2.65 + balanco, 5.2, 2.55, 1.0);
  ctx.fill();
  ctx.fillStyle = '#ec407a';
  retanguloArredondado(ctx, -2.15, -1.9 + balanco, 4.3, 1.7, 0.65);
  ctx.fill();
  ctx.fillRect(-1.8, -2.6 + balanco, 0.7, 0.85);
  ctx.fillRect(1.1, -2.6 + balanco, 0.7, 0.85);

  // Braços estendidos segurando a barra rosa (y = -0.6)
  ctx.strokeStyle = '#f4b897';
  ctx.lineWidth = 1.15;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-2.35, -1.75 + balanco);
  ctx.lineTo(-2.6, -0.35);
  ctx.moveTo(2.35, -1.75 + balanco);
  ctx.lineTo(2.6, -0.35);
  ctx.stroke();

  // Cabelo atrás + lacinho rosa no topo
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.arc(0, -4.85 + balanco, 2.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff80ab';
  ctx.beginPath();
  ctx.arc(-1.65, -7.05 + balanco, 0.82, 0, Math.PI * 2);
  ctx.arc(1.65, -7.05 + balanco, 0.82, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ec407a';
  ctx.beginPath();
  ctx.arc(0, -6.95 + balanco, 0.48, 0, Math.PI * 2);
  ctx.fill();

  // Rosto simpático claramente visível acima da alça
  ctx.fillStyle = '#f4b897';
  ctx.beginPath();
  ctx.arc(0, -4.35 + balanco, 2.35, 0, Math.PI * 2);
  ctx.fill();

  // Franja, olhos, bochechas e sorriso
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.arc(0, -4.95 + balanco, 2.35, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#2b2b3a';
  ctx.beginPath();
  ctx.arc(-0.88, -4.25 + balanco, 0.36, 0, Math.PI * 2);
  ctx.arc(0.88, -4.25 + balanco, 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 118, 154, 0.65)';
  ctx.beginPath();
  ctx.arc(-1.42, -3.62 + balanco, 0.48, 0, Math.PI * 2);
  ctx.arc(1.42, -3.62 + balanco, 0.48, 0, Math.PI * 2);
  ctx.fill();

  // Hastes traseiras cromadas + alça rosa do carrinho em y = -0.6
  ctx.strokeStyle = '#90a4ae';
  ctx.lineWidth = 0.72;
  ctx.beginPath();
  ctx.moveTo(-3.55, -0.35);
  ctx.lineTo(-3.95, 0.35);
  ctx.moveTo(3.55, -0.35);
  ctx.lineTo(3.95, 0.35);
  ctx.stroke();

  ctx.fillStyle = '#d81b7f';
  retanguloArredondado(ctx, -3.6, -0.8, 7.2, 0.75, 0.34);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.fillRect(-3.1, -0.68, 6.2, 0.22);

  // 4 rodízios externos com garfo metálico (traseiros laterais + dianteiros salientes)
  for (const [wx, wy, raio] of [
    [-4.15, 0.95, 0.68],
    [4.15, 0.95, 0.68],
    [-4.35, 5.15, 0.86],
    [4.35, 5.15, 0.86],
  ]) {
    ctx.fillStyle = '#78909c';
    ctx.fillRect(wx - 0.32, wy - raio - 0.25, 0.64, 0.45);
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(wx, wy, raio, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.arc(wx, wy, raio * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }

  // Contorno 3D alargado da cesta aramada (y = +0.1..+5.3) + protetores frontais vermelhos
  ctx.strokeStyle = '#78909c';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-4.0, 0.15);
  ctx.lineTo(-4.5, 5.15);
  ctx.lineTo(4.5, 5.15);
  ctx.lineTo(4.0, 0.15);
  ctx.closePath();
  ctx.stroke();

  desenharGradeCarrinho(ctx, -4.15, 0.25, 8.3, 4.75, 0.86);
  desenharItensNoCarrinho(ctx, itensNoCarrinho, -3.15, 0.75, 6.3, 3.4);

  for (const bx of [-4.45, 4.45]) {
    ctx.fillStyle = '#e53935';
    retanguloArredondado(ctx, bx - 0.42, 4.7, 0.84, 0.65, 0.24);
    ctx.fill();
  }
}

/**
 * Desenha a Elis de costas empurrando o carrinho claramente à frente sem sobreposição.
 */
function desenharPersonagemCima(ctx, passo, balanco, itensNoCarrinho) {
  // Sombra
  ctx.fillStyle = 'rgba(55, 40, 30, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 4.5, 5.0, 2.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4 rodízios giratórios externos do carrinho empurrado à frente
  for (const [wx, wy, raio] of [
    [-4.35, -6.55, 0.82],
    [4.35, -6.55, 0.82],
    [-4.1, -2.35, 0.68],
    [4.1, -2.35, 0.68],
  ]) {
    ctx.fillStyle = '#78909c';
    ctx.fillRect(wx - 0.3, wy - 0.2, 0.6, raio + 0.3);
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(wx, wy, raio, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cfd8dc';
    ctx.beginPath();
    ctx.arc(wx, wy, raio * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }

  // Estrutura externa cromada alargada à frente (y = -6.9..-2.0) + batentes vermelhos
  ctx.strokeStyle = '#78909c';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-4.5, -6.75);
  ctx.lineTo(4.5, -6.75);
  ctx.lineTo(4.0, -2.05);
  ctx.lineTo(-4.0, -2.05);
  ctx.closePath();
  ctx.stroke();

  desenharGradeCarrinho(ctx, -4.15, -6.65, 8.3, 4.5, 0.86);
  desenharItensNoCarrinho(ctx, itensNoCarrinho, -3.15, -6.05, 6.3, 3.25);

  for (const bx of [-4.45, 4.45]) {
    ctx.fillStyle = '#e53935';
    retanguloArredondado(ctx, bx - 0.42, -7.0, 0.84, 0.62, 0.24);
    ctx.fill();
  }

  // Hastes cromadas + barra de empurrar rosa em y = -1.7
  ctx.strokeStyle = '#90a4ae';
  ctx.lineWidth = 0.72;
  ctx.beginPath();
  ctx.moveTo(-3.95, -2.05);
  ctx.lineTo(-3.55, -1.6);
  ctx.moveTo(3.95, -2.05);
  ctx.lineTo(3.55, -1.6);
  ctx.stroke();

  ctx.fillStyle = '#d81b7f';
  retanguloArredondado(ctx, -3.6, -2.05, 7.2, 0.72, 0.34);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.fillRect(-3.1, -1.94, 6.2, 0.2);

  // Braços estendidos da Elis até a alça (y = -1.7)
  ctx.strokeStyle = '#f4b897';
  ctx.lineWidth = 1.15;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-2.45, 1.9 + balanco);
  ctx.lineTo(-2.6, -1.6);
  ctx.moveTo(2.45, 1.9 + balanco);
  ctx.lineTo(2.6, -1.6);
  ctx.stroke();

  // Tênis alternando o passo claramente atrás (+4.4..+6.0)
  const peEsqY = 4.5 + passo * 0.65;
  const peDirY = 4.5 - passo * 0.65;
  ctx.fillStyle = '#e91e63';
  retanguloArredondado(ctx, -2.4, peEsqY, 1.55, 1.25, 0.45);
  ctx.fill();
  ctx.fillStyle = '#ff4081';
  retanguloArredondado(ctx, 0.85, peDirY, 1.55, 1.25, 0.45);
  ctx.fill();

  // Blusa amarela e jardineira rosa vistas de costas (+1.5..+4.1)
  ctx.fillStyle = '#ffd54f';
  retanguloArredondado(ctx, -2.55, 1.45 + balanco, 5.1, 1.45, 0.75);
  ctx.fill();
  ctx.fillStyle = '#ec407a';
  retanguloArredondado(ctx, -2.75, 2.05 + balanco, 5.5, 2.25, 0.9);
  ctx.fill();

  // Cabeça centrada em y = 0.0, bem separada da cesta do carrinho
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.arc(0, 0.0 + balanco, 2.35, 0, Math.PI * 2);
  ctx.fill();

  // Lacinho e rabinho de cabelo vistos de costas
  ctx.fillStyle = '#ff80ab';
  retanguloArredondado(ctx, -1.05, 1.55 + balanco, 2.1, 0.85, 0.35);
  ctx.fill();
  ctx.fillStyle = '#4e342e';
  ctx.beginPath();
  ctx.ellipse(0, 2.55 + balanco, 1.15, 0.88, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Desenha a Elis empurrando um carrinho de compras em (x, y) lógicos.
 * @param {CanvasRenderingContext2D} ctx
 * @param {'cima'|'baixo'|'esquerda'|'direita'} direcao
 * @param {number} quadro
 * @param {number} x
 * @param {number} y
 * @param {{ itensNoCarrinho?: number, fasePasso?: number }} [opcoes]
 */
export function desenharPersonagem(
  ctx,
  direcao = 'baixo',
  quadro = 0,
  x = 0,
  y = 0,
  opcoes = {},
) {
  const itensNoCarrinho = opcoes?.itensNoCarrinho || 0;
  const fasePasso = typeof opcoes?.fasePasso === 'number'
    ? opcoes.fasePasso
    : (quadro % 2 === 1 ? Math.PI * 0.5 : 0);
  const passo = Math.sin(fasePasso);
  const balanco = -Math.abs(passo) * 0.45;

  ctx.save();
  ctx.translate(x + 8, y + 8);

  if (direcao === 'direita') {
    desenharPersonagemLateral(ctx, passo, balanco, itensNoCarrinho);
  } else if (direcao === 'esquerda') {
    ctx.scale(-1, 1);
    desenharPersonagemLateral(ctx, passo, balanco, itensNoCarrinho);
  } else if (direcao === 'cima') {
    desenharPersonagemCima(ctx, passo, balanco, itensNoCarrinho);
  } else {
    desenharPersonagemBaixo(ctx, passo, balanco, itensNoCarrinho);
  }

  ctx.restore();
}

/** Cria ícone DOM nítido para os cartões de prateleira/guloseima. */
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
