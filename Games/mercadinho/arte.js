import { desejos, produtos } from './dados.js';

export const TAMANHO_CASA = 16;

/** Coordenadas dos recortes nas folhas CC0 da Kenney (tiles 16×16, passo 17 px). */
export const RECORTES = {
  piso: { folha: 'cidade', coluna: 6, linha: 0 },
  parede: { folha: 'cidade', coluna: 0, linha: 13 },
  gondola: { folha: 'cidade', coluna: 19, linha: 11 },
  geladeira: { folha: 'cidade', coluna: 21, linha: 11 },
  balcao: { folha: 'interiores', coluna: 11, linha: 11 },
  banca: { folha: 'cidade', coluna: 16, linha: 13 },
  guloseimas: { folha: 'cidade', coluna: 20, linha: 11 },
  caixa: { folha: 'interiores', coluna: 13, linha: 11 },
  porta: { folha: 'cidade', coluna: 8, linha: 15 },
  personagem: { folha: 'urbano', coluna: 24, linha: 0 },
};

export const FOLHAS_ARQUIVOS = Object.freeze({
  cidade: 'kenney-cidade.png',
  interiores: 'kenney-interiores.png',
  urbano: 'kenney-urbano.png',
});

/**
 * 10 moldes 16×16 de embalagem genérica recoloridos por marca:
 * . transparente · o contorno (#2b2b3a) · a cor principal
 * b principal 25% mais escura · c cor do rótulo · w brilho (#ffffff)
 */
export const MOLDES = Object.freeze({
  'caixa-longa-vida': [
    '......oooo......',
    '.....owwwwo.....',
    '...oaaaaaaaao...',
    '..oaaaaaaaaaao..',
    '..obbbbbbbbbbo..',
    '..oaaaaaaaaaao..',
    '..oawwaaaaabbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oaaaaaaaabbo..',
    '..oaaaaaaaabbo..',
    '..obbbbbbbbbbo..',
    '...oooooooooo...',
    '................',
  ],
  pacote: [
    '................',
    '..oooooooooooo..',
    '..oabbbbbbbbao..',
    '...oaaaaaaaao...',
    '..oaawwaaaabbo..',
    '..oaaaaaaaabbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oaaaaaaaabbo..',
    '..obbbbbbbbbbo..',
    '...oaaaaaaaao...',
    '..oabbbbbbbbao..',
    '..oooooooooooo..',
    '................',
  ],
  lata: [
    '................',
    '...oooooooooo...',
    '..owwwwwwwwwwo..',
    '..obbbbbbbbbbo..',
    '..oawwaaaaabbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oaaaaaaaabbo..',
    '..obbbbbbbbbbo..',
    '..owwwwwwwwwwo..',
    '...oooooooooo...',
    '................',
    '................',
  ],
  garrafa: [
    '......oooo......',
    '.....occcco.....',
    '.....occcco.....',
    '......oooo......',
    '.....oaaaao.....',
    '....oaaaaabo....',
    '...oawwaaabbo...',
    '...oaaaaaaabo...',
    '...oacccccbbo...',
    '...oacccccbbo...',
    '...oacccccbbo...',
    '...oaaaaaaabo...',
    '...oaaaaaaabo...',
    '...obbbbbbbbo...',
    '....oooooooo....',
    '................',
  ],
  pote: [
    '................',
    '..oooooooooooo..',
    '.ooccccccccccbo.',
    '.oowwwwwwwwwwbo.',
    '..oooooooooooo..',
    '..oaawwaaaabbo..',
    '..oaaaaaaaabbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oacccccccbbo..',
    '..oaaaaaaaabbo..',
    '...oaaaaaabbo...',
    '...obbbbbbbbo...',
    '....oooooooo....',
    '................',
    '................',
  ],
  'caixa-papelao': [
    '................',
    '....oooooooooo..',
    '...oaaaaaaaabo..',
    '..owwwwwwwwabbo.',
    '.ooooooooooabbo.',
    '.oaaaaaaaaoabbo.',
    '.oawwaaaaoaabbo.',
    '.oaccccccoaabbo.',
    '.oaccccccoaabbo.',
    '.oaccccccoabbbo.',
    '.oaaaaaaaoabbbo.',
    '.obbbbbbboabbo..',
    '.obbbbbbboabo...',
    '.ooooooooooo....',
    '................',
    '................',
  ],
  bandeja: [
    '................',
    '................',
    '................',
    '...oooooooooo...',
    '..oowwwwwwwwoo..',
    '.oaaaaccccaaabo.',
    '.oawwaccccaabbo.',
    '.oaaaaccccaabbo.',
    '.oaaaaaaaaaabbo.',
    '.obbbbbbbbbbbbo.',
    '..oaaaaaaaaabo..',
    '..obbbbbbbbbbo..',
    '...oooooooooo...',
    '................',
    '................',
    '................',
  ],
  frasco: [
    '.......oo.......',
    '......owwo......',
    '.....occcco.....',
    '......oooo......',
    '....ooaaaaoo....',
    '...oawwaaabbo...',
    '..oaaaaaaabbo...',
    '..oaaaaaaabbbo..',
    '..oacccccbbbo...',
    '..oacccccbbbo...',
    '..oacccccbbbo...',
    '...oaaaaabbbo...',
    '...oaaaaabbbo...',
    '...obbbbbbbbo...',
    '....oooooooo....',
    '................',
  ],
  barra: [
    '................',
    '................',
    '................',
    '..oo........oo..',
    '.oaooooooooooao.',
    '.oaowwaaaaaobbo.',
    '.oboaccccccobbo.',
    '.oboaccccccobbo.',
    '.oboaccccccobbo.',
    '.obobbbbbbbobbo.',
    '.oaooooooooooao.',
    '..oo........oo..',
    '................',
    '................',
    '................',
    '................',
  ],
  saquinho: [
    '................',
    '...oooooooooo...',
    '..occccccccccbo.',
    '..oaaaaaaaaaabo.',
    '..oawwaaaaaabbo.',
    '.oaaaaaaaaaaabbo',
    '.oaaacccccaaabbo',
    '.oaaacccccaaabbo',
    '.oaaacccccaaabbo',
    '.oaaaaaaaaaaabbo',
    '..oaaaaaaaabbbo.',
    '..oaaaaaaaabbbo.',
    '..obbbbbbbbbbo..',
    '...oooooooooo...',
    '................',
    '................',
  ],
});

/** Relaciona todos os 49 produtos e as 12 guloseimas a um dos 10 moldes genéricos. */
export const MOLDE_DO_PRODUTO = Object.freeze({
  // Caixa longa vida
  leite: 'caixa-longa-vida',
  'leite-condensado': 'caixa-longa-vida',
  suco: 'caixa-longa-vida',
  'suco-caixinha': 'caixa-longa-vida',
  toddynho: 'caixa-longa-vida',

  // Pacote
  'pao-de-forma': 'pacote',
  bisnaguinha: 'pacote',
  'pao-de-hot-dog': 'pacote',
  cafe: 'pacote',
  arroz: 'pacote',
  feijao: 'pacote',
  macarrao: 'pacote',
  acucar: 'pacote',
  farinha: 'pacote',
  'queijo-ralado': 'pacote',

  // Lata
  'molho-de-tomate': 'lata',
  fermento: 'lata',
  milho: 'lata',

  // Garrafa
  oleo: 'garrafa',
  refrigerante: 'garrafa',
  agua: 'garrafa',

  // Pote ou copo
  achocolatado: 'pote',
  iogurte: 'pote',
  manteiga: 'pote',
  margarina: 'pote',
  requeijao: 'pote',

  // Caixa de papelão
  'biscoito-recheado': 'caixa-papelao',
  'cream-cracker': 'caixa-papelao',
  'sabao-em-po': 'caixa-papelao',
  'creme-dental': 'caixa-papelao',
  bis: 'caixa-papelao',
  gibi: 'caixa-papelao',

  // Bandeja
  banana: 'bandeja',
  maca: 'bandeja',
  laranja: 'bandeja',
  tomate: 'bandeja',
  alface: 'bandeja',
  cenoura: 'bandeja',
  batata: 'bandeja',
  cebola: 'bandeja',
  mamao: 'bandeja',
  uva: 'bandeja',
  morango: 'bandeja',
  queijo: 'bandeja',
  presunto: 'bandeja',
  ovos: 'bandeja',
  frango: 'bandeja',
  'carne-moida': 'bandeja',
  salsicha: 'bandeja',

  // Frasco
  detergente: 'frasco',

  // Barra
  sabonete: 'barra',
  batom: 'barra',
  trident: 'barra',
  kitkat: 'barra',
  lacta: 'barra',

  // Saquinho
  'papel-higienico': 'saquinho',
  mms: 'saquinho',
  picole: 'saquinho',
  fini: 'saquinho',
  ruffles: 'saquinho',
  'kinder-ovo': 'saquinho',
});

/** Duas cores genéricas [principal, rótulo] por marca ou tipo para diferenciar opções na prateleira. */
export const CORES_DA_MARCA = Object.freeze({
  // Hortifrúti
  Nanica: ['#fdd835', '#fffde7'],
  Prata: ['#fbc02d', '#5d4037'],
  Orgânica: ['#558b2f', '#f1f8e9'],
  Gala: ['#e53935', '#fff8e1'],
  Fuji: ['#c62828', '#ffebee'],
  Pera: ['#fb8c00', '#fff3e0'],
  Lima: ['#9ccc65', '#fffde7'],
  Baía: ['#ef6c00', '#ffe082'],
  Salada: ['#ef5350', '#ffffff'],
  Italiano: ['#b71c1c', '#e8f5e9'],
  Orgânico: ['#43a047', '#fff9c4'],
  Crespa: ['#66bb6a', '#ffffff'],
  Americana: ['#2e7d32', '#dcedc8'],
  Hidropônica: ['#00897b', '#e0f2f1'],
  Comum: ['#f57c00', '#fff3e0'],
  Lavada: ['#d7b878', '#fff8e1'],
  Asterix: ['#c25e68', '#fce4ec'],
  Branca: ['#e6d3a7', '#6d4c41'],
  Roxa: ['#7b1fa2', '#f3e5f5'],
  Papaia: ['#ff8f00', '#e8f5e9'],
  Formosa: ['#e65100', '#fff8e1'],
  Niágara: ['#8e24aa', '#f3e5f5'],
  'Sem semente': ['#7cb342', '#e8f5e9'],

  // Padaria e matinais
  Panco: ['#e53935', '#fff59d'],
  Pullman: ['#1565c0', '#ffca28'],
  Wickbold: ['#2e7d32', '#fff8e1'],
  'Seven Boys': ['#ef6c00', '#ffffff'],
  Passatempo: ['#1e88e5', '#ffeb3b'],
  Trakinas: ['#e53935', '#ffca28'],
  Oreo: ['#0d47a1', '#ffffff'],
  Marilan: ['#d32f2f', '#ffffff'],
  Bauducco: ['#f9a825', '#4e342e'],
  Piraquê: ['#ad1457', '#fffde7'],
  Toddy: ['#d84315', '#ffeb3b'],
  Nescau: ['#e53935', '#6d4c41'],
  Ovomaltine: ['#ef6c00', '#1e88e5'],
  Caboclo: ['#6d4c41', '#ffe0b2'],
  Pilão: ['#c62828', '#fffde7'],
  Melitta: ['#2e7d32', '#ffca28'],

  // Laticínios e frios
  Italac: ['#d62828', '#ffffff'],
  Piracanjuba: ['#ef6c00', '#fff9c4'],
  Ninho: ['#f9a825', '#c62828'],
  Batavo: ['#1565c0', '#ffebee'],
  Nestlé: ['#c62828', '#ffe082'],
  Danone: ['#ec407a', '#ffffff'],
  Itambé: ['#1976d2', '#fff8e1'],
  Aviação: ['#d84315', '#fff3e0'],
  Primor: ['#ef5350', '#fffde7'],
  Delícia: ['#00897b', '#fff59d'],
  Qualy: ['#fdd835', '#1565c0'],
  Seara: ['#b71c1c', '#ffccbc'],
  Sadia: ['#d84315', '#ffca28'],
  Tirolez: ['#1565c0', '#ffd54f'],
  Perdigão: ['#1976d2', '#ffeb3b'],
  Vigor: ['#0277bd', '#ffffff'],
  Catupiry: ['#c62828', '#fff8e1'],
  Brancos: ['#f5efe6', '#8d6e63'],
  Vermelhos: ['#d79c6d', '#fff8e1'],
  Caipiras: ['#7cb342', '#fff8e1'],

  // Mercearia
  Camil: ['#d32f2f', '#fff3e0'],
  'Prato Fino': ['#6a1b9a', '#fff8e1'],
  'Tio João': ['#fbc02d', '#b71c1c'],
  Kicaldo: ['#2e7d32', '#fff9c4'],
  'Broto Legal': ['#8d6e63', '#e8f5e9'],
  Galo: ['#1e88e5', '#ffd54f'],
  Adria: ['#e53935', '#fff8e1'],
  Barilla: ['#0d47a1', '#e53935'],
  Quero: ['#e53935', '#ffe082'],
  Pomarola: ['#c62828', '#66bb6a'],
  Heinz: ['#b71c1c', '#ffffff'],
  Coamo: ['#2e7d32', '#fffde7'],
  Soya: ['#fbc02d', '#2e7d32'],
  Liza: ['#f57c00', '#fff8e1'],
  Caravelas: ['#0288d1', '#ffffff'],
  Guarani: ['#43a047', '#fffde7'],
  União: ['#1565c0', '#e53935'],
  Sol: ['#f9a825', '#ffffff'],
  Renata: ['#1976d2', '#ffeb3b'],
  'Dona Benta': ['#c62828', '#fff3e0'],
  Royal: ['#d32f2f', '#ffca28'],
  Moça: ['#fff8e1', '#1565c0'],
  'Faixa Azul': ['#1a237e', '#ffca28'],
  Predilecta: ['#388e3c', '#ffca28'],
  Bonduelle: ['#00796b', '#fff59d'],

  // Açougue
  Acém: ['#c62828', '#ffe0e0'],
  Patinho: ['#8e2424', '#fff8e1'],

  // Bebidas
  Maguary: ['#6a1b9a', '#fff59d'],
  'Del Valle': ['#43a047', '#ffffff'],
  'Natural One': ['#fb8c00', '#2e7d32'],
  Kapo: ['#00897b', '#fff59d'],
  Tial: ['#e65100', '#fff8e1'],
  Dolly: ['#2e7d32', '#ffffff'],
  'Guaraná Antarctica': ['#1b5e20', '#ffca28'],
  'Coca-Cola': ['#c62828', '#ffffff'],
  Crystal: ['#29b6f6', '#ffffff'],
  Bonafont: ['#ec407a', '#e1f5fe'],
  Minalba: ['#1565c0', '#e3f2fd'],

  // Limpeza e higiene
  Limpol: ['#fdd835', '#0288d1'],
  Minuano: ['#00acc1', '#ffffff'],
  Ypê: ['#2e7d32', '#fff176'],
  'Tixan Ypê': ['#1e88e5', '#ffeb3b'],
  Brilhante: ['#00838f', '#fff8e1'],
  Omo: ['#1565c0', '#ef5350'],
  Mili: ['#29b6f6', '#fffde7'],
  Personal: ['#ab47bc', '#ffffff'],
  Neve: ['#0277bd', '#e1f5fe'],
  Sorriso: ['#e53935', '#ffffff'],
  Colgate: ['#c62828', '#ffe0e0'],
  'Oral-B': ['#1565c0', '#80deea'],
  Lux: ['#ec407a', '#fce4ec'],
  Protex: ['#0288d1', '#ffffff'],
  Dove: ['#1976d2', '#fff8e1'],

  // Guloseimas
  Garoto: ['#6d4c41', '#ffca28'],
  Trident: ['#00acc1', '#ffffff'],
  "M&M's": ['#fbc02d', '#5d4037'],
  Kibon: ['#e53935', '#ffffff'],
  Fini: ['#e91e63', '#ffeb3b'],
  Lacta: ['#1565c0', '#ffffff'],
  'Elma Chips': ['#0277bd', '#ffd54f'],
  Panini: ['#e53935', '#ffeb3b'],
  Kinder: ['#d84315', '#ffffff'],
});

const PALETA_RESERVA = [
  ['#e53935', '#fff8e1'],
  ['#1e88e5', '#ffffff'],
  ['#43a047', '#fffde7'],
  ['#fb8c00', '#fff8e1'],
  ['#8e24aa', '#f3e5f5'],
  ['#00897b', '#e0f2f1'],
  ['#d81b60', '#fce4ec'],
  ['#f9a825', '#3e2723'],
];

/** Devolve duas cores estáveis [principal, rótulo] para qualquer nome de marca. */
export function coresDaMarca(marca = '', indiceOpcao = 0) {
  const chave = String(marca || '').trim();
  if (CORES_DA_MARCA[chave]) {
    return CORES_DA_MARCA[chave];
  }
  let hash = 2166136261 + indiceOpcao * 131;
  for (let i = 0; i < chave.length; i++) {
    hash ^= chave.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return PALETA_RESERVA[(hash >>> 0) % PALETA_RESERVA.length];
}

function ajustarCor(hex, fator) {
  const limpo = String(hex || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(limpo)) return '#607d8b';
  const canais = [0, 2, 4].map(i => {
    const val = parseInt(limpo.slice(i, i + 2), 16);
    const novo = fator >= 0
      ? Math.min(255, Math.round(val + (255 - val) * fator))
      : Math.max(0, Math.round(val * (1 + fator)));
    return novo.toString(16).padStart(2, '0');
  });
  return `#${canais.join('')}`;
}

function escurecerCor(hex, fator = 0.25) {
  return ajustarCor(hex, -Math.abs(fator));
}

function clarearCor(hex, fator = 0.25) {
  return ajustarCor(hex, Math.abs(fator));
}

function resolverMarcaDoItem(item, opcaoId) {
  if (!item) return '';
  if (item.opcoes) {
    const escolhida = opcaoId ? item.opcoes.find(o => o.id === opcaoId) : null;
    const padrao = item.opcoes[Math.min(1, item.opcoes.length - 1)] || item.opcoes[0];
    return (escolhida || padrao)?.rotulo || item.nome;
  }
  return item.marca || item.nome;
}

function coresOpcoesDoItem(item, opcaoId) {
  if (!item) return [PALETA_RESERVA[0]];
  if (opcaoId || !item.opcoes?.length) {
    return [coresDaMarca(resolverMarcaDoItem(item, opcaoId))];
  }
  return item.opcoes.map((op, i) => coresDaMarca(op.rotulo, i));
}

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

const GONDOLA_ANDARES = [4.95, 9.35, 13.75];
const GELADEIRA_ANDARES = [5.15, 9.25, 13.45];
const HORTIFRUTI_CAIXAS = [
  { cy: 2.55, h: 5.25 },
  { cy: 8.55, h: 5.35 },
];

const TEMAS_GELADEIRA = {
  laticinios: {
    moldura: '#6b8299',
    testaTop: '#1f5e92',
    testaBase: '#2c7cb9',
    led: '#90e0ef',
    fundoTopo: '#e8f6ff',
    fundoBase: '#c6e8fc',
    prateleira: '#cfd8dc',
    bordaPrat: '#90a4ae',
    rodape: '#4a6070',
  },
  bebidas: {
    moldura: '#1c6371',
    testaTop: '#0b6b7d',
    testaBase: '#1291a8',
    led: '#80deea',
    fundoTopo: '#e0f8fb',
    fundoBase: '#b8ecf3',
    prateleira: '#cfd8dc',
    bordaPrat: '#78909c',
    rodape: '#134e5a',
  },
};

const BASE_MOLDE_EMBALAGEM = {
  'caixa-longa-vida': 0.89,
  pacote: 0.90,
  lata: 0.90,
  garrafa: 0.89,
  pote: 0.88,
  'caixa-papelao': 0.89,
  bandeja: 0.86,
  frasco: 0.89,
  barra: 0.77,
  saquinho: 0.89,
};

function desenharToldoListrado(ctx, x0, larg, y, cor1, cor2, altura = 2.2) {
  const larguraFaixa = 2.2;
  for (let sx = 0; sx < larg; sx += larguraFaixa) {
    const wFaixa = Math.min(larguraFaixa, larg - sx);
    const par = Math.floor(sx / larguraFaixa) % 2 === 0;
    ctx.fillStyle = par ? cor1 : cor2;
    ctx.fillRect(x0 + sx, y, wFaixa + 0.05, altura - 0.35);

    ctx.fillStyle = par ? escurecerCor(cor1, 0.14) : escurecerCor(cor2, 0.08);
    ctx.beginPath();
    ctx.arc(x0 + sx + wFaixa / 2, y + altura - 0.38, wFaixa / 2, 0, Math.PI);
    ctx.fill();
  }
  const sombra = ctx.createLinearGradient(x0, y + altura - 0.2, x0, y + altura + 0.65);
  sombra.addColorStop(0, 'rgba(35, 22, 12, 0.28)');
  sombra.addColorStop(1, 'rgba(35, 22, 12, 0)');
  ctx.fillStyle = sombra;
  ctx.fillRect(x0, y + altura - 0.2, larg, 0.85);
}

function desenharGondolaMercado(ctx, x, y, secao, vizinhos) {
  const paleta = PALETAS_GONDOLA[secao] || PALETAS_GONDOLA.mercearia;
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);
  const topo = semVizinho(vizinhos, 'cima');
  const baixo = semVizinho(vizinhos, 'baixo');

  // Colunas metálicas laterais e estrutura externa da gôndola
  ctx.fillStyle = '#8b7c6e';
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);
  if (esq) {
    ctx.fillStyle = '#a89888';
    ctx.fillRect(x0, y, 0.35, TAMANHO_CASA);
  }
  if (dir) {
    ctx.fillStyle = '#6f6154';
    ctx.fillRect(x0 + larg - 0.35, y, 0.35, TAMANHO_CASA);
  }

  // Fundo slatwall texturizado
  const yInicioFundo = y + (topo ? 2.05 : 0);
  const yFimFundo = y + (baixo ? 14.9 : TAMANHO_CASA);
  ctx.fillStyle = paleta.fundo;
  ctx.fillRect(x0 + esq * 0.55, yInicioFundo, larg - (esq + dir) * 0.55, yFimFundo - yInicioFundo);

  ctx.fillStyle = 'rgba(70, 52, 36, 0.07)';
  for (let sy = yInicioFundo + 0.7; sy < yFimFundo; sy += 1.05) {
    ctx.fillRect(x0 + esq * 0.55, sy, larg - (esq + dir) * 0.55, 0.22);
  }

  // Testeira superior em 2.5D com LED embutido
  if (topo) {
    const gradTampo = ctx.createLinearGradient(x0, y, x0, y + 2.05);
    gradTampo.addColorStop(0, paleta.tampoClaro);
    gradTampo.addColorStop(0.55, paleta.tampo);
    gradTampo.addColorStop(1, escurecerCor(paleta.tampo, 0.18));
    ctx.fillStyle = gradTampo;
    ctx.fillRect(x0, y, larg, 2.05);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.fillRect(x0 + esq * 0.4, y + 0.22, larg - (esq + dir) * 0.4, 0.26);

    const led = ctx.createLinearGradient(x0, y + 2.05, x0, y + 2.75);
    led.addColorStop(0, 'rgba(255, 248, 220, 0.65)');
    led.addColorStop(1, 'rgba(255, 248, 220, 0)');
    ctx.fillStyle = led;
    ctx.fillRect(x0 + esq * 0.55, y + 2.05, larg - (esq + dir) * 0.55, 0.7);
  }

  // 3 prateleiras 2.5D com superfície de apoio, trilho amarelo e etiquetinhas de preço
  const pxInner = x0 + esq * 0.4;
  const wInner = larg - (esq + dir) * 0.4;
  for (const offY of GONDOLA_ANDARES) {
    const yPrat = y + offY;

    ctx.fillStyle = '#fdf9f2';
    ctx.fillRect(pxInner, yPrat - 0.5, wInner, 0.5);

    ctx.fillStyle = paleta.prateleira;
    ctx.fillRect(pxInner, yPrat, wInner, 0.55);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(pxInner, yPrat, wInner, 0.16);

    // Trilho amarelo de preços com etiquetinhas brancas espaçadas
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(pxInner, yPrat + 0.48, wInner, 0.52);
    ctx.fillStyle = paleta.bordaPrat;
    ctx.fillRect(pxInner, yPrat + 0.98, wInner, 0.18);

    for (let tx = x + 1.3; tx <= x + 13.0; tx += 3.45) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tx, yPrat + 0.55, 1.45, 0.36);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(tx + 0.2, yPrat + 0.67, 1.05, 0.12);
    }

    const sombraPrat = ctx.createLinearGradient(x0, yPrat + 1.12, x0, yPrat + 1.82);
    sombraPrat.addColorStop(0, 'rgba(55, 38, 24, 0.18)');
    sombraPrat.addColorStop(1, 'rgba(55, 38, 24, 0)');
    ctx.fillStyle = sombraPrat;
    ctx.fillRect(pxInner, yPrat + 1.12, wInner, 0.7);
  }

  if (baixo) {
    ctx.fillStyle = paleta.rodape;
    ctx.fillRect(x0, y + 14.9, larg, 1.1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(x0, y + 14.9, larg, 0.24);
  }
}

function desenharHortifruti(ctx, x, y, vizinhos) {
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);
  const topo = semVizinho(vizinhos, 'cima');
  const baixo = semVizinho(vizinhos, 'baixo');

  // Bancada rústica de madeira maciça com frisos
  const gradMadeira = ctx.createLinearGradient(x0, y, x0 + larg, y);
  gradMadeira.addColorStop(0, '#5a3112');
  gradMadeira.addColorStop(0.5, '#7a441a');
  gradMadeira.addColorStop(1, '#5a3112');
  ctx.fillStyle = gradMadeira;
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);

  ctx.fillStyle = '#8f5222';
  ctx.fillRect(
    x0 + esq * 0.55,
    y + (topo ? 2.15 : 0),
    larg - (esq + dir) * 0.55,
    TAMANHO_CASA - (topo ? 2.15 : 0) - (baixo ? 1.25 : 0),
  );

  // Ripas horizontais discretas no fundo da banca
  ctx.fillStyle = 'rgba(52, 26, 8, 0.22)';
  for (let py = y + 1.4; py < y + 15.2; py += 2.1) {
    ctx.fillRect(x0 + esq * 0.55, py, larg - (esq + dir) * 0.55, 0.18);
  }

  if (topo) {
    desenharToldoListrado(ctx, x0, larg, y, '#218848', '#fff8ec', 2.2);
  }

  // Dois caixotes de madeira profundos com forro de juta e tabuleta de giz
  for (const caixa of HORTIFRUTI_CAIXAS) {
    const cy = y + caixa.cy;
    ctx.fillStyle = 'rgba(35, 18, 6, 0.28)';
    retanguloArredondado(ctx, x + 1.25, cy + 0.3, TAMANHO_CASA - 2.5, caixa.h, 0.65);
    ctx.fill();

    // Borda chanfrada da caixa
    ctx.fillStyle = '#c8894c';
    retanguloArredondado(ctx, x + 1.25, cy, TAMANHO_CASA - 2.5, caixa.h, 0.6);
    ctx.fill();

    ctx.fillStyle = '#dfa466';
    ctx.fillRect(x + 1.5, cy + 0.16, TAMANHO_CASA - 3.0, 0.35);

    ctx.fillStyle = '#995e28';
    ctx.fillRect(x + 1.45, cy + caixa.h - 0.85, TAMANHO_CASA - 2.9, 0.65);

    // Interior escavado forrado com papel/juta clara
    const fundoJuta = ctx.createLinearGradient(x, cy + 0.5, x, cy + caixa.h - 0.7);
    fundoJuta.addColorStop(0, '#c29d63');
    fundoJuta.addColorStop(0.28, '#e8cf9d');
    fundoJuta.addColorStop(1, '#d8b77d');
    ctx.fillStyle = fundoJuta;
    retanguloArredondado(ctx, x + 1.75, cy + 0.45, TAMANHO_CASA - 3.5, caixa.h - 1.25, 0.38);
    ctx.fill();

    // Sombra interna da borda superior do caixote
    const sombraInt = ctx.createLinearGradient(x, cy + 0.45, x, cy + 1.45);
    sombraInt.addColorStop(0, 'rgba(58, 32, 10, 0.34)');
    sombraInt.addColorStop(1, 'rgba(58, 32, 10, 0)');
    ctx.fillStyle = sombraInt;
    ctx.fillRect(x + 1.75, cy + 0.45, TAMANHO_CASA - 3.5, 1.0);

    // Mini lousa de preço fixada na madeira da frente do caixote
    ctx.fillStyle = '#26382c';
    retanguloArredondado(ctx, x + 2.2, cy + caixa.h - 0.74, 4.9, 0.58, 0.14);
    ctx.fill();
    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(x + 2.55, cy + caixa.h - 0.52, 2.7, 0.16);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(x + 5.55, cy + caixa.h - 0.52, 1.15, 0.16);
  }

  if (baixo) {
    ctx.fillStyle = '#47250c';
    ctx.fillRect(x0, y + 14.8, larg, 1.2);
  }
}

function desenharGeladeiraBase(ctx, x, y, vizinhos, tema) {
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);

  ctx.fillStyle = tema.moldura;
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);

  // Testeira iluminada superior
  const testa = ctx.createLinearGradient(x0, y, x0, y + 2.25);
  testa.addColorStop(0, tema.testaTop);
  testa.addColorStop(1, tema.testaBase);
  ctx.fillStyle = testa;
  ctx.fillRect(x0, y, larg, 2.25);
  ctx.fillStyle = tema.led;
  ctx.fillRect(x0 + esq * 0.4, y + 1.78, larg - (esq + dir) * 0.4, 0.42);

  // Interior LED refrigerado
  const led = ctx.createLinearGradient(x, y + 2.25, x, y + 14.2);
  led.addColorStop(0, tema.fundoTopo);
  led.addColorStop(1, tema.fundoBase);
  ctx.fillStyle = led;
  ctx.fillRect(x0 + esq * 0.5, y + 2.25, larg - (esq + dir) * 0.5, 11.95);

  // Divisória metálica vertical entre portas adjacentes
  ctx.fillStyle = 'rgba(65, 85, 102, 0.25)';
  ctx.fillRect(x + 0.15, y + 2.25, 0.35, 11.95);
  ctx.fillRect(x + TAMANHO_CASA - 0.5, y + 2.25, 0.35, 11.95);

  // 3 prateleiras gradeadas metálicas
  const pxInner = x0 + esq * 0.4;
  const wInner = larg - (esq + dir) * 0.4;
  for (const offY of GELADEIRA_ANDARES) {
    const py = y + offY;
    ctx.fillStyle = '#f4f9fc';
    ctx.fillRect(pxInner, py - 0.4, wInner, 0.4);
    ctx.fillStyle = tema.prateleira;
    ctx.fillRect(pxInner, py, wInner, 0.48);
    ctx.fillStyle = tema.bordaPrat;
    ctx.fillRect(pxInner, py + 0.42, wInner, 0.16);
    for (let tx = x + 1.4; tx <= x + 12.8; tx += 3.5) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tx, py + 0.12, 1.35, 0.28);
    }
  }

  // Grade de ventilação inferior
  ctx.fillStyle = tema.rodape;
  ctx.fillRect(x0, y + 14.2, larg, 1.8);
  ctx.fillStyle = 'rgba(15, 25, 32, 0.35)';
  for (let vy = 14.55; vy <= 15.55; vy += 0.45) {
    ctx.fillRect(x + 1.2, y + vy, TAMANHO_CASA - 2.4, 0.2);
  }
}

function desenharPortaVidroOverlay(ctx, x, y) {
  ctx.save();
  // Reflexos oblíquos translúcidos sobre os produtos refrigerados
  ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.beginPath();
  ctx.moveTo(x + 1.6, y + 2.65);
  ctx.lineTo(x + 4.9, y + 2.65);
  ctx.lineTo(x + 2.2, y + 13.75);
  ctx.lineTo(x + 1.1, y + 13.75);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.beginPath();
  ctx.moveTo(x + 5.7, y + 2.65);
  ctx.lineTo(x + 6.9, y + 2.65);
  ctx.lineTo(x + 4.2, y + 13.75);
  ctx.lineTo(x + 3.4, y + 13.75);
  ctx.closePath();
  ctx.fill();

  // Moldura de alumínio escovado da porta e puxador vertical cromado
  ctx.strokeStyle = 'rgba(120, 144, 156, 0.85)';
  ctx.lineWidth = 0.55;
  retanguloArredondado(ctx, x + 0.65, y + 2.55, TAMANHO_CASA - 1.3, 11.35, 0.45);
  ctx.stroke();

  ctx.fillStyle = '#455a64';
  retanguloArredondado(ctx, x + 14.0, y + 5.7, 0.62, 4.4, 0.22);
  ctx.fill();
  ctx.fillStyle = '#eceff1';
  ctx.fillRect(x + 14.12, y + 6.0, 0.22, 3.8);
  ctx.restore();
}

function desenharGeladeiraLaticinios(ctx, x, y, vizinhos) {
  desenharGeladeiraBase(ctx, x, y, vizinhos, TEMAS_GELADEIRA.laticinios);
}

function desenharBebidas(ctx, x, y, vizinhos) {
  desenharGeladeiraBase(ctx, x, y, vizinhos, TEMAS_GELADEIRA.bebidas);
}

function desenharAcougue(ctx, x, y, vizinhos) {
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);

  ctx.fillStyle = '#90a4ae';
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);

  // Interior refrigerado em azulejo branco limpo e base inox inclinada
  ctx.fillStyle = '#f8fbfd';
  ctx.fillRect(x0 + esq * 0.45, y + 2.35, larg - (esq + dir) * 0.45, 9.35);

  ctx.strokeStyle = 'rgba(144, 164, 174, 0.25)';
  ctx.lineWidth = 0.18;
  for (let gy = y + 3.8; gy < y + 11.2; gy += 1.6) {
    ctx.beginPath();
    ctx.moveTo(x0 + esq * 0.45, gy);
    ctx.lineTo(x0 + larg - dir * 0.45, gy);
    ctx.stroke();
  }
  for (let gx = x + 3.2; gx < x + 14; gx += 3.2) {
    ctx.beginPath();
    ctx.moveTo(gx, y + 2.35);
    ctx.lineTo(gx, y + 9.5);
    ctx.stroke();
  }

  // Plataforma inclinada em aço inox resfriado
  const inoxDeck = ctx.createLinearGradient(x, y + 5.4, x, y + 11.7);
  inoxDeck.addColorStop(0, '#cfd8dc');
  inoxDeck.addColorStop(0.4, '#eceff1');
  inoxDeck.addColorStop(1, '#b0bec5');
  ctx.fillStyle = inoxDeck;
  ctx.fillRect(x0 + esq * 0.45, y + 6.4, larg - (esq + dir) * 0.45, 5.3);

  desenharToldoListrado(ctx, x0, larg, y, '#d32f2f', '#fffaf6', 2.45);

  // Parapeito frontal em aço inox e rodapé vermelho rubi
  const inoxFront = ctx.createLinearGradient(x, y + 11.7, x, y + 14.0);
  inoxFront.addColorStop(0, '#eceff1');
  inoxFront.addColorStop(0.5, '#cfd8dc');
  inoxFront.addColorStop(1, '#90a4ae');
  ctx.fillStyle = inoxFront;
  ctx.fillRect(x0, y + 11.7, larg, 2.3);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.fillRect(x0, y + 11.9, larg, 0.28);

  ctx.fillStyle = '#c63b3b';
  ctx.fillRect(x0, y + 14.0, larg, 2.0);
  ctx.fillStyle = '#8e2424';
  ctx.fillRect(x0, y + 15.45, larg, 0.55);
}

function desenharPadaria(ctx, x, y, vizinhos) {
  const { x0, larg, esq, dir } = bordasHorizontais(x, vizinhos);
  const topo = semVizinho(vizinhos, 'cima');
  const baixo = semVizinho(vizinhos, 'baixo');

  // Expositor de madeira mel & nogueira com iluminação âmbar
  ctx.fillStyle = '#683713';
  ctx.fillRect(x0, y, larg, TAMANHO_CASA);
  const fundo = ctx.createLinearGradient(x, y, x + TAMANHO_CASA, y);
  fundo.addColorStop(0, '#995724');
  fundo.addColorStop(0.5, '#ad662d');
  fundo.addColorStop(1, '#8c4e1f');
  ctx.fillStyle = fundo;
  ctx.fillRect(
    x0 + esq * 0.55,
    y + (topo ? 2.15 : 0),
    larg - (esq + dir) * 0.55,
    TAMANHO_CASA - (topo ? 2.15 : 0) - (baixo ? 1.25 : 0),
  );

  // Ripas verticais sutis na traseira de madeira
  ctx.fillStyle = 'rgba(65, 32, 10, 0.16)';
  for (let rx = x + 3.2; rx < x + 14.5; rx += 3.2) {
    ctx.fillRect(rx, y + (topo ? 2.15 : 0), 0.22, TAMANHO_CASA - (topo ? 2.15 : 0) - (baixo ? 1.25 : 0));
  }

  if (topo) {
    const testa = ctx.createLinearGradient(x0, y, x0, y + 2.15);
    testa.addColorStop(0, '#e89d4c');
    testa.addColorStop(1, '#c97627');
    ctx.fillStyle = testa;
    ctx.fillRect(x0, y, larg, 2.15);
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(x0 + esq * 0.4, y + 1.65, larg - (esq + dir) * 0.4, 0.45);
  }

  // Duas bandejas/cestas trançadas de vime com pano creme iluminado
  for (const caixa of HORTIFRUTI_CAIXAS) {
    const cy = y + caixa.cy;
    ctx.fillStyle = 'rgba(42, 20, 6, 0.25)';
    retanguloArredondado(ctx, x + 1.25, cy + 0.3, TAMANHO_CASA - 2.5, caixa.h, 0.75);
    ctx.fill();

    ctx.fillStyle = '#dfb05c';
    retanguloArredondado(ctx, x + 1.25, cy, TAMANHO_CASA - 2.5, caixa.h, 0.72);
    ctx.fill();

    // Detalhe trançado do vime na borda frontal
    ctx.fillStyle = '#b9802c';
    for (let wx = x + 2.0; wx <= x + 13.4; wx += 1.4) {
      ctx.fillRect(wx, cy + caixa.h - 0.65, 0.75, 0.4);
    }

    const linho = ctx.createLinearGradient(x, cy + 0.5, x, cy + caixa.h - 0.8);
    linho.addColorStop(0, '#fae5ba');
    linho.addColorStop(0.5, '#fff6e1');
    linho.addColorStop(1, '#f3d9a4');
    ctx.fillStyle = linho;
    retanguloArredondado(ctx, x + 1.75, cy + 0.48, TAMANHO_CASA - 3.5, caixa.h - 1.25, 0.45);
    ctx.fill();
  }

  if (baixo) {
    ctx.fillStyle = '#532b0d';
    ctx.fillRect(x0, y + 14.8, larg, 1.2);
  }
}

function desenharCaixa(ctx, x, y, vizinhos) {
  const casaX = vizinhos?.casaX ?? Math.floor(x / TAMANHO_CASA);
  const numeroCaixa = casaX <= 9 ? '1' : casaX <= 13 ? '2' : '3';

  // Sombra suave do balcão no chão
  ctx.fillStyle = 'rgba(45, 32, 20, 0.16)';
  retanguloArredondado(ctx, x + 0.75, y + 1.3, TAMANHO_CASA - 1.5, 14.3, 1.3);
  ctx.fill();

  // Corpo externo em grafite-azulado e tampo em aço/quartzo claro
  ctx.fillStyle = '#455a64';
  retanguloArredondado(ctx, x + 0.6, y + 0.9, TAMANHO_CASA - 1.2, 14.2, 1.2);
  ctx.fill();

  ctx.fillStyle = '#f2f5f7';
  retanguloArredondado(ctx, x + 1.2, y + 2.0, TAMANHO_CASA - 2.4, 10.9, 0.85);
  ctx.fill();

  // Esteira rolante emborrachada com divisórias e separador de cliente
  ctx.fillStyle = '#263238';
  retanguloArredondado(ctx, x + 1.9, y + 2.8, 5.4, 9.1, 0.5);
  ctx.fill();
  ctx.fillStyle = '#37474f';
  for (let ry = 3.8; ry < 11.4; ry += 1.45) {
    ctx.fillRect(x + 2.2, y + ry, 4.8, 0.35);
  }
  ctx.fillStyle = '#ef5350';
  retanguloArredondado(ctx, x + 2.35, y + 6.95, 4.5, 0.75, 0.25);
  ctx.fill();

  // Mini comprinhas sobre a esteira
  ctx.fillStyle = '#ffa726';
  retanguloArredondado(ctx, x + 2.7, y + 4.3, 1.6, 1.9, 0.3);
  ctx.fill();
  ctx.fillStyle = '#42a5f5';
  retanguloArredondado(ctx, x + 4.8, y + 4.6, 1.5, 1.6, 0.3);
  ctx.fill();

  // Leitor óptico de código de barras (scanner luminoso)
  ctx.fillStyle = '#546e7a';
  retanguloArredondado(ctx, x + 7.7, y + 8.3, 2.7, 2.0, 0.3);
  ctx.fill();
  ctx.fillStyle = '#80deea';
  ctx.fillRect(x + 8.05, y + 8.65, 2.0, 1.3);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillRect(x + 8.2, y + 8.85, 1.7, 0.24);

  // Registradora com monitor e teclado
  ctx.fillStyle = '#f5f0e6';
  retanguloArredondado(ctx, x + 9.4, y + 2.7, 4.9, 5.1, 0.5);
  ctx.fill();
  ctx.fillStyle = '#1b4332';
  retanguloArredondado(ctx, x + 9.95, y + 3.15, 3.8, 1.9, 0.25);
  ctx.fill();
  ctx.fillStyle = '#52e088';
  ctx.fillRect(x + 10.35, y + 3.55, 3.0, 0.95);
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(x + 10.0, y + 5.5, 3.7, 1.6);

  // Operador(a) simpático(a) atrás do caixa
  ctx.fillStyle = '#2e9556';
  ctx.beginPath();
  ctx.arc(x + 11.8, y + 2.1, 2.35, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#f4b897';
  ctx.beginPath();
  ctx.arc(x + 11.8, y + 1.8, 1.65, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.arc(x + 11.8, y + 1.25, 1.7, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#2e9556';
  retanguloArredondado(ctx, x + 10.2, y + 0.05, 3.2, 0.95, 0.4);
  ctx.fill();

  // Plaquinha numérica do caixa
  ctx.fillStyle = '#2e9556';
  retanguloArredondado(ctx, x + 8.3, y + 10.75, 5.9, 3.45, 0.7);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 2.7px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`CX ${numeroCaixa}`, x + 11.25, y + 12.55);
}

const folhasCarregadas = {};

function urlBaseFiguras() {
  if (typeof window !== 'undefined' && window.location?.href) {
    return new URL('../../figuras/mercadinho/', window.location.href).href;
  }
  return '/figuras/mercadinho/';
}

function carregarImagemFolha(chave, arquivo, baseUrl) {
  if (typeof Image === 'undefined') {
    return Promise.resolve({ chave, imagem: null });
  }
  return new Promise(resolve => {
    const img = new Image();
    img.decoding = 'async';
    img.addEventListener('load', () => {
      folhasCarregadas[chave] = img;
      resolve({ chave, imagem: img });
    });
    img.addEventListener('error', () => {
      delete folhasCarregadas[chave];
      resolve({ chave, imagem: null });
    });
    img.src = new URL(arquivo, baseUrl).href;
  });
}

/** Devolve as folhas CC0 da Kenney já carregadas em memória. */
export function obterFolhasCarregadas() {
  return { ...folhasCarregadas };
}

/**
 * Carrega as folhas de tiles CC0 de public/figuras/mercadinho/.
 * Se algum PNG não carregar ou não houver suporte a Image, mantém a arte em canvas sem erro.
 */
export async function carregarArte(baseUrl = urlBaseFiguras()) {
  if (typeof Image === 'undefined') {
    return { altaResolucao: true, folhasCarregadas: false, folhas: {} };
  }
  const resultados = await Promise.all(
    Object.entries(FOLHAS_ARQUIVOS).map(([chave, arquivo]) =>
      carregarImagemFolha(chave, arquivo, baseUrl),
    ),
  );
  const todasCarregadas = resultados.every(r => Boolean(r.imagem));
  return {
    altaResolucao: true,
    folhasCarregadas: todasCarregadas,
    folhas: obterFolhasCarregadas(),
  };
}

function aplicarContorno25D(ctx, tamanho) {
  ctx.strokeStyle = 'rgba(43, 43, 58, 0.85)';
  ctx.lineWidth = Math.max(0.16, tamanho * 0.028);
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function desenharCaixaLongaVida(ctx, x, y, s, corP, corR) {
  const u = f => x + f * s;
  const v = f => y + f * s;

  // Sombra de contato
  ctx.fillStyle = 'rgba(35, 25, 20, 0.16)';
  ctx.beginPath();
  ctx.ellipse(u(0.49), v(0.90), s * 0.30, s * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face frontal
  const gradFrente = ctx.createLinearGradient(u(0.20), v(0.28), u(0.20), v(0.89));
  gradFrente.addColorStop(0, clarearCor(corP, 0.12));
  gradFrente.addColorStop(1, corP);
  ctx.fillStyle = gradFrente;
  ctx.beginPath();
  ctx.rect(u(0.20), v(0.28), s * 0.44, s * 0.61);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Face lateral 3D sombreada
  ctx.fillStyle = escurecerCor(corP, 0.28);
  ctx.beginPath();
  ctx.moveTo(u(0.64), v(0.28));
  ctx.lineTo(u(0.79), v(0.21));
  ctx.lineTo(u(0.79), v(0.81));
  ctx.lineTo(u(0.64), v(0.89));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Topo inclinado em duas águas + aba soldada
  ctx.fillStyle = clarearCor(corP, 0.22);
  ctx.beginPath();
  ctx.moveTo(u(0.20), v(0.28));
  ctx.lineTo(u(0.31), v(0.13));
  ctx.lineTo(u(0.71), v(0.13));
  ctx.lineTo(u(0.64), v(0.28));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  ctx.fillStyle = escurecerCor(corP, 0.14);
  ctx.beginPath();
  ctx.moveTo(u(0.64), v(0.28));
  ctx.lineTo(u(0.71), v(0.13));
  ctx.lineTo(u(0.79), v(0.21));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  ctx.fillStyle = '#ffffff';
  retanguloArredondado(ctx, u(0.31), v(0.085), s * 0.40, s * 0.05, s * 0.015);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Tampa rosca superior
  ctx.fillStyle = corR;
  ctx.beginPath();
  ctx.ellipse(u(0.49), v(0.185), s * 0.075, s * 0.036, 0, 0, Math.PI * 2);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Faixa de rótulo frontal + brilho especular
  ctx.fillStyle = corR;
  ctx.fillRect(u(0.215), v(0.45), s * 0.41, s * 0.26);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillRect(u(0.235), v(0.30), s * 0.065, s * 0.56);
}

function desenharPacote(ctx, x, y, s, corP, corR) {
  const u = f => x + f * s;
  const v = f => y + f * s;

  // Abas frisadas superior e inferior
  ctx.fillStyle = escurecerCor(corP, 0.2);
  retanguloArredondado(ctx, u(0.18), v(0.09), s * 0.64, s * 0.10, s * 0.02);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  retanguloArredondado(ctx, u(0.18), v(0.81), s * 0.64, s * 0.10, s * 0.02);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Corpo almofadado em curva suave com gradiente cilíndrico
  const grad = ctx.createLinearGradient(u(0.16), v(0.5), u(0.84), v(0.5));
  grad.addColorStop(0, clarearCor(corP, 0.16));
  grad.addColorStop(0.52, corP);
  grad.addColorStop(1, escurecerCor(corP, 0.26));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(u(0.21), v(0.17));
  ctx.lineTo(u(0.79), v(0.17));
  ctx.quadraticCurveTo(u(0.87), v(0.50), u(0.79), v(0.83));
  ctx.lineTo(u(0.21), v(0.83));
  ctx.quadraticCurveTo(u(0.13), v(0.50), u(0.21), v(0.17));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Selo oval frontal na cor do rótulo + brilho
  ctx.fillStyle = corR;
  retanguloArredondado(ctx, u(0.26), v(0.35), s * 0.48, s * 0.30, s * 0.08);
  ctx.fill();
  ctx.strokeStyle = escurecerCor(corP, 0.3);
  ctx.lineWidth = Math.max(0.12, s * 0.018);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.beginPath();
  ctx.ellipse(u(0.28), v(0.31), s * 0.04, s * 0.11, 0.2, 0, Math.PI * 2);
  ctx.fill();
}

function desenharLata(ctx, x, y, s, corP, corR) {
  const u = f => x + f * s;
  const v = f => y + f * s;

  // Base metálica inferior arredondada
  ctx.fillStyle = '#90a4ae';
  ctx.beginPath();
  ctx.ellipse(u(0.50), v(0.84), s * 0.30, s * 0.075, 0, 0, Math.PI * 2);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Corpo cilíndrico com brilho metálico vertical
  const grad = ctx.createLinearGradient(u(0.20), v(0.5), u(0.80), v(0.5));
  grad.addColorStop(0, escurecerCor(corP, 0.14));
  grad.addColorStop(0.28, clarearCor(corP, 0.28));
  grad.addColorStop(0.58, corP);
  grad.addColorStop(1, escurecerCor(corP, 0.28));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(u(0.20), v(0.19));
  ctx.lineTo(u(0.20), v(0.83));
  ctx.ellipse(u(0.50), v(0.83), s * 0.30, s * 0.072, 0, Math.PI, 0, true);
  ctx.lineTo(u(0.80), v(0.19));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Faixa do rótulo envolvente
  ctx.fillStyle = corR;
  ctx.beginPath();
  ctx.moveTo(u(0.205), v(0.36));
  ctx.quadraticCurveTo(u(0.50), v(0.43), u(0.795), v(0.36));
  ctx.lineTo(u(0.795), v(0.67));
  ctx.quadraticCurveTo(u(0.50), v(0.74), u(0.205), v(0.67));
  ctx.closePath();
  ctx.fill();

  // Aro metálico superior e anel de abertura
  ctx.fillStyle = '#eceff1';
  ctx.beginPath();
  ctx.ellipse(u(0.50), v(0.19), s * 0.30, s * 0.075, 0, 0, Math.PI * 2);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  ctx.fillStyle = '#cfd8dc';
  ctx.beginPath();
  ctx.ellipse(u(0.50), v(0.19), s * 0.23, s * 0.048, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(u(0.29), v(0.27), s * 0.06, s * 0.52);
}

function desenharGarrafa(ctx, x, y, s, corP, corR) {
  const u = f => x + f * s;
  const v = f => y + f * s;

  // Corpo contornado com ombros anatômicos e cintura leve
  const grad = ctx.createLinearGradient(u(0.24), v(0.5), u(0.76), v(0.5));
  grad.addColorStop(0, clarearCor(corP, 0.16));
  grad.addColorStop(0.26, clarearCor(corP, 0.34));
  grad.addColorStop(0.60, corP);
  grad.addColorStop(1, escurecerCor(corP, 0.28));
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(u(0.42), v(0.20));
  ctx.lineTo(u(0.58), v(0.20));
  ctx.lineTo(u(0.58), v(0.30));
  ctx.bezierCurveTo(u(0.68), v(0.35), u(0.75), v(0.41), u(0.74), v(0.54));
  ctx.quadraticCurveTo(u(0.70), v(0.63), u(0.74), v(0.74));
  ctx.lineTo(u(0.74), v(0.86));
  ctx.quadraticCurveTo(u(0.50), v(0.92), u(0.26), v(0.86));
  ctx.lineTo(u(0.26), v(0.74));
  ctx.quadraticCurveTo(u(0.30), v(0.63), u(0.26), v(0.54));
  ctx.bezierCurveTo(u(0.25), v(0.41), u(0.32), v(0.35), u(0.42), v(0.30));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Rótulo central
  ctx.fillStyle = corR;
  ctx.beginPath();
  ctx.moveTo(u(0.27), v(0.49));
  ctx.quadraticCurveTo(u(0.50), v(0.53), u(0.73), v(0.49));
  ctx.lineTo(u(0.73), v(0.71));
  ctx.quadraticCurveTo(u(0.50), v(0.75), u(0.27), v(0.71));
  ctx.closePath();
  ctx.fill();

  // Anel de lacre + tampa rosqueada
  ctx.fillStyle = clarearCor(corR, 0.18);
  retanguloArredondado(ctx, u(0.40), v(0.185), s * 0.20, s * 0.045, s * 0.015);
  ctx.fill();
  ctx.fillStyle = corR;
  retanguloArredondado(ctx, u(0.41), v(0.08), s * 0.18, s * 0.12, s * 0.03);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Brilho vertical do vidro/PET
  ctx.fillStyle = 'rgba(255, 255, 255, 0.56)';
  ctx.beginPath();
  ctx.ellipse(u(0.35), v(0.41), s * 0.03, s * 0.075, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(u(0.31), v(0.52), s * 0.045, s * 0.30);
}

function desenharPote(ctx, x, y, s, corP, corR) {
  const u = f => x + f * s;
  const v = f => y + f * s;

  // Corpo cônico
  const grad = ctx.createLinearGradient(u(0.20), v(0.5), u(0.80), v(0.5));
  grad.addColorStop(0, clarearCor(corP, 0.18));
  grad.addColorStop(0.55, corP);
  grad.addColorStop(1, escurecerCor(corP, 0.28));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(u(0.20), v(0.29));
  ctx.lineTo(u(0.80), v(0.29));
  ctx.lineTo(u(0.72), v(0.84));
  ctx.quadraticCurveTo(u(0.50), v(0.90), u(0.28), v(0.84));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Rótulo curvo frontal
  ctx.fillStyle = corR;
  ctx.beginPath();
  ctx.moveTo(u(0.23), v(0.43));
  ctx.quadraticCurveTo(u(0.50), v(0.48), u(0.77), v(0.43));
  ctx.lineTo(u(0.74), v(0.69));
  ctx.quadraticCurveTo(u(0.50), v(0.74), u(0.26), v(0.69));
  ctx.closePath();
  ctx.fill();

  // Sombra da aba da tampa
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(u(0.20), v(0.29), s * 0.60, s * 0.04);

  // Tampa saliente arredondada
  const gradTampa = ctx.createLinearGradient(u(0.15), v(0.14), u(0.15), v(0.29));
  gradTampa.addColorStop(0, clarearCor(corR, 0.25));
  gradTampa.addColorStop(1, corR);
  ctx.fillStyle = gradTampa;
  retanguloArredondado(ctx, u(0.15), v(0.14), s * 0.70, s * 0.15, s * 0.05);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.52)';
  ctx.fillRect(u(0.20), v(0.165), s * 0.60, s * 0.03);
}

function desenharCaixaPapelao(ctx, x, y, s, corP, corR) {
  const u = f => x + f * s;
  const v = f => y + f * s;

  // Frente
  const grad = ctx.createLinearGradient(u(0.14), v(0.28), u(0.14), v(0.89));
  grad.addColorStop(0, clarearCor(corP, 0.10));
  grad.addColorStop(1, corP);
  ctx.fillStyle = grad;
  ctx.fillRect(u(0.14), v(0.28), s * 0.50, s * 0.61);
  ctx.beginPath();
  ctx.rect(u(0.14), v(0.28), s * 0.50, s * 0.61);
  aplicarContorno25D(ctx, s);

  // Lateral direita 3D
  ctx.fillStyle = escurecerCor(corP, 0.28);
  ctx.beginPath();
  ctx.moveTo(u(0.64), v(0.28));
  ctx.lineTo(u(0.85), v(0.17));
  ctx.lineTo(u(0.85), v(0.77));
  ctx.lineTo(u(0.64), v(0.89));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Topo 3D com vinco da aba
  ctx.fillStyle = clarearCor(corP, 0.22);
  ctx.beginPath();
  ctx.moveTo(u(0.14), v(0.28));
  ctx.lineTo(u(0.35), v(0.17));
  ctx.lineTo(u(0.85), v(0.17));
  ctx.lineTo(u(0.64), v(0.28));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  ctx.fillStyle = corR;
  retanguloArredondado(ctx, u(0.18), v(0.41), s * 0.42, s * 0.30, s * 0.05);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(u(0.16), v(0.30), s * 0.055, s * 0.55);
}

function desenharBandeja(ctx, x, y, s, corP, corR) {
  const u = f => x + f * s;
  const v = f => y + f * s;

  // Base 3D da bandeja inclinada
  ctx.fillStyle = '#d7ccc8';
  retanguloArredondado(ctx, u(0.10), v(0.35), s * 0.80, s * 0.47, s * 0.11);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  ctx.fillStyle = '#f8f4ee';
  retanguloArredondado(ctx, u(0.13), v(0.31), s * 0.74, s * 0.41, s * 0.09);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Cavidade interna e porções frescas na cor principal
  ctx.fillStyle = clarearCor(corP, 0.16);
  for (const [bx, by] of [[0.32, 0.50], [0.50, 0.47], [0.66, 0.52]]) {
    ctx.beginPath();
    ctx.ellipse(u(bx), v(by), s * 0.13, s * 0.10, -0.15, 0, Math.PI * 2);
    ctx.fill();
  }
  // Camada superior das porções com brilho
  for (const [bx, by] of [[0.32, 0.50], [0.50, 0.47], [0.66, 0.52]]) {
    ctx.fillStyle = corP;
    ctx.beginPath();
    ctx.ellipse(u(bx), v(by), s * 0.115, s * 0.088, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.beginPath();
    ctx.ellipse(u(bx - 0.03), v(by - 0.025), s * 0.04, s * 0.022, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Brilho de filme PVC transparente sobre a bandeja
  ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
  ctx.beginPath();
  ctx.moveTo(u(0.22), v(0.33));
  ctx.lineTo(u(0.40), v(0.33));
  ctx.lineTo(u(0.24), v(0.68));
  ctx.lineTo(u(0.16), v(0.68));
  ctx.closePath();
  ctx.fill();

  // Etiqueta da marca colada no filme
  ctx.fillStyle = corR;
  retanguloArredondado(ctx, u(0.33), v(0.55), s * 0.34, s * 0.14, s * 0.03);
  ctx.fill();
  ctx.strokeStyle = escurecerCor(corP, 0.35);
  ctx.lineWidth = Math.max(0.12, s * 0.016);
  ctx.stroke();
}

function desenharFrasco(ctx, x, y, s, corP, corR) {
  const u = f => x + f * s;
  const v = f => y + f * s;

  // Bico dosador e tampa
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(u(0.46), v(0.06));
  ctx.lineTo(u(0.54), v(0.06));
  ctx.lineTo(u(0.57), v(0.16));
  ctx.lineTo(u(0.43), v(0.16));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  ctx.fillStyle = corR;
  retanguloArredondado(ctx, u(0.40), v(0.145), s * 0.20, s * 0.10, s * 0.025);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Silhueta acinturada de detergente/frasco
  const grad = ctx.createLinearGradient(u(0.22), v(0.5), u(0.78), v(0.5));
  grad.addColorStop(0, clarearCor(corP, 0.18));
  grad.addColorStop(0.35, corP);
  grad.addColorStop(1, escurecerCor(corP, 0.26));
  ctx.fillStyle = grad;

  ctx.beginPath();
  ctx.moveTo(u(0.37), v(0.24));
  ctx.lineTo(u(0.63), v(0.24));
  ctx.bezierCurveTo(u(0.76), v(0.30), u(0.78), v(0.42), u(0.71), v(0.54));
  ctx.bezierCurveTo(u(0.69), v(0.64), u(0.77), v(0.74), u(0.74), v(0.87));
  ctx.quadraticCurveTo(u(0.50), v(0.92), u(0.26), v(0.87));
  ctx.bezierCurveTo(u(0.23), v(0.74), u(0.31), v(0.64), u(0.29), v(0.54));
  ctx.bezierCurveTo(u(0.22), v(0.42), u(0.24), v(0.30), u(0.37), v(0.24));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  ctx.fillStyle = corR;
  retanguloArredondado(ctx, u(0.31), v(0.45), s * 0.38, s * 0.29, s * 0.07);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(u(0.31), v(0.31), s * 0.05, s * 0.48);
}

function desenharBarra(ctx, x, y, s, corP, corR) {
  const u = f => x + f * s;
  const v = f => y + f * s;

  // Abas laterais serrilhadas
  for (const lado of [0, 1]) {
    ctx.fillStyle = escurecerCor(corP, 0.22);
    ctx.beginPath();
    if (lado === 0) {
      ctx.moveTo(u(0.18), v(0.28));
      ctx.lineTo(u(0.08), v(0.34));
      ctx.lineTo(u(0.11), v(0.50));
      ctx.lineTo(u(0.08), v(0.66));
      ctx.lineTo(u(0.18), v(0.72));
    } else {
      ctx.moveTo(u(0.82), v(0.28));
      ctx.lineTo(u(0.92), v(0.34));
      ctx.lineTo(u(0.89), v(0.50));
      ctx.lineTo(u(0.92), v(0.66));
      ctx.lineTo(u(0.82), v(0.72));
    }
    ctx.closePath();
    ctx.fill();
    aplicarContorno25D(ctx, s);
  }

  // Corpo central chanfrado
  const grad = ctx.createLinearGradient(u(0.5), v(0.24), u(0.5), v(0.76));
  grad.addColorStop(0, clarearCor(corP, 0.20));
  grad.addColorStop(0.5, corP);
  grad.addColorStop(1, escurecerCor(corP, 0.25));
  ctx.fillStyle = grad;
  retanguloArredondado(ctx, u(0.17), v(0.24), s * 0.66, s * 0.52, s * 0.07);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  ctx.fillStyle = corR;
  retanguloArredondado(ctx, u(0.27), v(0.33), s * 0.46, s * 0.34, s * 0.05);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(u(0.22), v(0.27), s * 0.56, s * 0.045);
}

function desenharSaquinho(ctx, x, y, s, corP, corR) {
  const u = f => x + f * s;
  const v = f => y + f * s;

  // Topo selado estilo stand-up pouch
  ctx.fillStyle = corR;
  retanguloArredondado(ctx, u(0.20), v(0.10), s * 0.60, s * 0.11, s * 0.025);
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Bolsa estufada para baixo
  const grad = ctx.createLinearGradient(u(0.15), v(0.5), u(0.85), v(0.5));
  grad.addColorStop(0, clarearCor(corP, 0.16));
  grad.addColorStop(0.45, corP);
  grad.addColorStop(1, escurecerCor(corP, 0.26));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(u(0.21), v(0.20));
  ctx.lineTo(u(0.79), v(0.20));
  ctx.quadraticCurveTo(u(0.86), v(0.56), u(0.83), v(0.84));
  ctx.quadraticCurveTo(u(0.50), v(0.92), u(0.17), v(0.84));
  ctx.quadraticCurveTo(u(0.14), v(0.56), u(0.21), v(0.20));
  ctx.closePath();
  ctx.fill();
  aplicarContorno25D(ctx, s);

  // Selo central circular / escudo
  ctx.fillStyle = corR;
  ctx.beginPath();
  ctx.ellipse(u(0.50), v(0.54), s * 0.20, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = escurecerCor(corP, 0.28);
  ctx.lineWidth = Math.max(0.12, s * 0.02);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.44)';
  ctx.beginPath();
  ctx.ellipse(u(0.27), v(0.45), s * 0.032, s * 0.16, 0.08, 0, Math.PI * 2);
  ctx.fill();
}

const DESENHO_MOLDES = {
  'caixa-longa-vida': desenharCaixaLongaVida,
  pacote: desenharPacote,
  lata: desenharLata,
  garrafa: desenharGarrafa,
  pote: desenharPote,
  'caixa-papelao': desenharCaixaPapelao,
  bandeja: desenharBandeja,
  frasco: desenharFrasco,
  barra: desenharBarra,
  saquinho: desenharSaquinho,
};

/**
 * Desenha o molde vetorial 2.5D de embalagem em alta resolução recolorido pelas cores da marca.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} moldeId
 * @param {[string, string]} cores
 * @param {number} x
 * @param {number} y
 * @param {number} tamanho
 * @param {string|null} [emoji]
 */
export function desenharMoldeEmbalagem(ctx, moldeId, cores, x, y, tamanho, emoji = null) {
  const [corPrincipal, corRotulo] = Array.isArray(cores) && cores.length >= 2
    ? cores
    : PALETA_RESERVA[0];
  const fnMolde = DESENHO_MOLDES[moldeId] || desenharPacote;

  ctx.save();
  fnMolde(ctx, x, y, tamanho, corPrincipal, corRotulo);

  if (emoji) {
    const raio = tamanho * 0.21;
    const cx = x + tamanho * 0.74;
    const cy = y + tamanho * 0.74;

    ctx.fillStyle = 'rgba(35, 25, 20, 0.20)';
    ctx.beginPath();
    ctx.arc(cx, cy + tamanho * 0.025, raio, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 253, 248, 0.96)';
    ctx.strokeStyle = corPrincipal;
    ctx.lineWidth = Math.max(0.9, tamanho * 0.034);
    ctx.beginPath();
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = `${Math.round(tamanho * 0.30)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, cx, cy + tamanho * 0.015);
  }
  ctx.restore();
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

function desenharFrutaEsferica(ctx, cx, cy, raio, corClara, corBase, corEscura, folha = true) {
  ctx.fillStyle = 'rgba(42, 26, 12, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx + 0.08, cy + raio * 0.85, raio * 0.9, raio * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  const grad = ctx.createRadialGradient(cx - raio * 0.32, cy - raio * 0.35, raio * 0.12, cx, cy, raio);
  grad.addColorStop(0, corClara);
  grad.addColorStop(0.55, corBase);
  grad.addColorStop(1, corEscura);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, raio, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
  ctx.beginPath();
  ctx.ellipse(cx - raio * 0.35, cy - raio * 0.35, raio * 0.26, raio * 0.15, -0.5, 0, Math.PI * 2);
  ctx.fill();

  if (folha) {
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.ellipse(cx + raio * 0.22, cy - raio * 0.86, raio * 0.42, raio * 0.22, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharCaixaBananas(ctx, rx, ry, rw, rh) {
  for (let i = 0; i < 3; i++) {
    const bx = rx + 2.1 + i * 3.8;
    const by = ry + rh * 0.54 + (i % 2 === 0 ? -0.15 : 0.2);
    for (let f = 0; f < 3; f++) {
      const oy = by - 0.55 + f * 0.58;
      ctx.strokeStyle = f === 0 ? '#ffe066' : f === 1 ? '#fdd835' : '#f4b400';
      ctx.lineWidth = 0.82;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bx - 1.35, oy - 0.2);
      ctx.quadraticCurveTo(bx - 0.1, oy + 0.68, bx + 1.35, oy - 0.25);
      ctx.stroke();
    }
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(bx + 1.15, by - 0.65, 0.45, 0.95);
  }
}

function desenharCaixaFrutasGrade(ctx, rx, ry, rw, rh, config) {
  const cols = 4;
  const rows = 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = rx + 1.45 + c * ((rw - 2.9) / (cols - 1)) + (r % 2 === 1 ? 0.35 : -0.2);
      const cy = ry + 1.05 + r * (rh * 0.44);
      desenharFrutaEsferica(ctx, cx, cy, config.raio, config.clara, config.base, config.escura, config.folha);
      if (config.estrela) {
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(cx - 0.38, cy - config.raio - 0.05, 0.76, 0.22);
        ctx.fillRect(cx - 0.11, cy - config.raio - 0.28, 0.22, 0.5);
      }
    }
  }
}

function desenharCaixaAlface(ctx, rx, ry, rw) {
  for (let i = 0; i < 3; i++) {
    const cx = rx + 2.3 + i * ((rw - 4.6) / 2);
    const cy = ry + 1.9 + (i % 2) * 0.2;
    ctx.fillStyle = '#2e7d32';
    for (let p = 0; p < 6; p++) {
      const ang = (p * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ang) * 0.75, cy + Math.sin(ang) * 0.55, 0.78, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.arc(cx, cy, 0.95, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c5e1a5';
    ctx.beginPath();
    ctx.arc(cx - 0.1, cy - 0.1, 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharCaixaCenouras(ctx, rx, ry, rw, rh) {
  for (let i = 0; i < 5; i++) {
    const cx = rx + 1.6 + i * ((rw - 3.2) / 4);
    const cy = ry + rh * 0.52 + (i % 2 === 0 ? -0.25 : 0.25);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.42);
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.moveTo(0, -1.3);
    ctx.lineTo(-0.55, -2.15);
    ctx.lineTo(0.45, -2.05);
    ctx.closePath();
    ctx.fill();
    const grad = ctx.createLinearGradient(-0.6, -1.3, 0.6, 1.5);
    grad.addColorStop(0, '#ffa726');
    grad.addColorStop(1, '#e65100');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-0.52, -1.3);
    ctx.lineTo(0.52, -1.3);
    ctx.lineTo(0.08, 1.55);
    ctx.lineTo(-0.08, 1.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function desenharCaixaBatatas(ctx, rx, ry, rw, rh) {
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const cx = rx + 1.5 + c * ((rw - 3.0) / 3) + (r % 2) * 0.35;
      const cy = ry + 1.05 + r * (rh * 0.44);
      const grad = ctx.createRadialGradient(cx - 0.25, cy - 0.2, 0.1, cx, cy, 1.0);
      grad.addColorStop(0, '#efe0b4');
      grad.addColorStop(0.6, '#d2ab64');
      grad.addColorStop(1, '#9b7236');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 1.02, 0.72, (c + r) * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(75, 48, 22, 0.42)';
      ctx.fillRect(cx + 0.15, cy + 0.05, 0.16, 0.16);
    }
  }
}

function desenharCaixaMamao(ctx, rx, ry, rw) {
  for (let i = 0; i < 3; i++) {
    const cx = rx + 2.2 + i * ((rw - 4.4) / 2);
    const cy = ry + 1.95;
    if (i === 1) {
      // Mamão aberto mostrando polpa coral e sementes
      ctx.fillStyle = '#fb8c00';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 1.55, 1.02, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff7043';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 1.25, 0.72, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#263238';
      for (const sx of [-0.45, -0.15, 0.15, 0.45]) {
        ctx.beginPath();
        ctx.arc(cx + sx, cy, 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const grad = ctx.createRadialGradient(cx - 0.3, cy - 0.3, 0.15, cx, cy, 1.5);
      grad.addColorStop(0, '#ffd54f');
      grad.addColorStop(0.55, '#fb8c00');
      grad.addColorStop(1, '#4e6f22');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 1.5, 0.98, -0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function desenharCaixaUvas(ctx, rx, ry, rw, corBase, corClara) {
  for (let i = 0; i < 3; i++) {
    const cx = rx + 2.3 + i * ((rw - 4.6) / 2);
    const cy = ry + 1.05;
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(cx - 0.12, cy - 0.35, 0.24, 0.45);
    const bagos = [
      [-0.65, 0.25], [0, 0.25], [0.65, 0.25],
      [-0.35, 0.85], [0.35, 0.85],
      [0, 1.45],
    ];
    for (const [dx, dy] of bagos) {
      ctx.fillStyle = corBase;
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = corClara;
      ctx.beginPath();
      ctx.arc(cx + dx - 0.12, cy + dy - 0.12, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function desenharCaixaMorangos(ctx, rx, ry, rw) {
  for (let p = 0; p < 2; p++) {
    const bx = rx + 0.55 + p * (rw * 0.49);
    ctx.fillStyle = '#aed581';
    retanguloArredondado(ctx, bx, ry + 0.45, rw * 0.44, 3.0, 0.35);
    ctx.fill();
    ctx.fillStyle = '#8bc34a';
    ctx.fillRect(bx + 0.3, ry + 2.4, rw * 0.44 - 0.6, 0.28);
    for (let s = 0; s < 3; s++) {
      const mx = bx + 1.15 + s * 1.4;
      const my = ry + 1.55 + (s % 2) * 0.35;
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.moveTo(mx - 0.55, my - 0.3);
      ctx.lineTo(mx + 0.55, my - 0.3);
      ctx.quadraticCurveTo(mx, my + 1.05, mx, my + 0.92);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#43a047';
      ctx.fillRect(mx - 0.35, my - 0.52, 0.7, 0.26);
      ctx.fillStyle = '#fff59d';
      ctx.fillRect(mx - 0.18, my + 0.12, 0.14, 0.14);
      ctx.fillRect(mx + 0.12, my + 0.28, 0.14, 0.14);
    }
  }
}

const DESENHO_HORTIFRUTI = {
  banana: desenharCaixaBananas,
  maca: (ctx, rx, ry, rw, rh) => desenharCaixaFrutasGrade(ctx, rx, ry, rw, rh, {
    raio: 0.92,
    clara: '#ff6e6e',
    base: '#e53935',
    escura: '#8e0000',
    folha: true,
  }),
  laranja: (ctx, rx, ry, rw, rh) => desenharCaixaFrutasGrade(ctx, rx, ry, rw, rh, {
    raio: 0.92,
    clara: '#ffcc80',
    base: '#fb8c00',
    escura: '#d84315',
    folha: true,
  }),
  tomate: (ctx, rx, ry, rw, rh) => desenharCaixaFrutasGrade(ctx, rx, ry, rw, rh, {
    raio: 0.9,
    clara: '#ff5252',
    base: '#e53935',
    escura: '#b71c1c',
    folha: false,
    estrela: true,
  }),
  alface: desenharCaixaAlface,
  cenoura: desenharCaixaCenouras,
  batata: desenharCaixaBatatas,
  cebola: (ctx, rx, ry, rw, rh, idxCaixa) => desenharCaixaFrutasGrade(ctx, rx, ry, rw, rh, idxCaixa === 0
    ? { raio: 0.88, clara: '#fff5dc', base: '#e2c58a', escura: '#9d793c', folha: false }
    : { raio: 0.88, clara: '#ce93d8', base: '#8e24aa', escura: '#4a148c', folha: false }),
  mamao: desenharCaixaMamao,
  uva: (ctx, rx, ry, rw, _rh, idxCaixa) => (
    idxCaixa === 0
      ? desenharCaixaUvas(ctx, rx, ry, rw, '#7b1fa2', '#e1bee7')
      : desenharCaixaUvas(ctx, rx, ry, rw, '#689f38', '#dcedc8')
  ),
  morango: desenharCaixaMorangos,
};

function desenharFileirasEmbalagens(ctx, moldeId, listaCores, x, y, andaresY, tamanhoItem = 3.25) {
  const baseFrac = BASE_MOLDE_EMBALAGEM[moldeId] || 0.89;
  const colunasX = [0.95, 4.35, 7.75, 11.15];

  andaresY.forEach((andarY, idxAndar) => {
    const py = y + andarY - baseFrac * tamanhoItem - 0.16;
    colunasX.forEach((colX, idxCol) => {
      const cores = listaCores[(idxAndar + idxCol) % listaCores.length];
      desenharMoldeEmbalagem(ctx, moldeId, cores, x + colX, py, tamanhoItem);
    });
  });
}

function desenharCartelasOvos(ctx, listaCores, x, y) {
  GELADEIRA_ANDARES.forEach((andarY, idxAndar) => {
    const py = y + andarY - 2.35;
    for (let c = 0; c < 3; c++) {
      const [corCasca, corEmbalagem] = listaCores[(idxAndar + c) % listaCores.length];
      const cx = x + 1.15 + c * 4.55;
      ctx.fillStyle = '#d7ccc8';
      retanguloArredondado(ctx, cx, py + 0.7, 3.9, 1.5, 0.3);
      ctx.fill();
      ctx.fillStyle = escurecerCor(corEmbalagem, 0.1);
      retanguloArredondado(ctx, cx + 0.15, py + 0.35, 3.6, 0.65, 0.2);
      ctx.fill();
      for (let e = 0; e < 3; e++) {
        ctx.fillStyle = corCasca;
        ctx.beginPath();
        ctx.ellipse(cx + 0.8 + e * 1.12, py + 1.25, 0.45, 0.56, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

function desenharPaesFrescos(ctx, produtoId, rx, ry, rw) {
  if (produtoId === 'pao-de-forma') {
    for (let i = 0; i < 3; i++) {
      const bx = rx + 0.7 + i * 3.9;
      ctx.fillStyle = '#c67a28';
      retanguloArredondado(ctx, bx, ry + 0.85, 3.2, 2.35, 0.7);
      ctx.fill();
      ctx.fillStyle = '#f8e3b4';
      retanguloArredondado(ctx, bx + 0.35, ry + 1.25, 2.5, 1.65, 0.45);
      ctx.fill();
      ctx.fillStyle = '#b96918';
      ctx.fillRect(bx + 1.0, ry + 0.78, 1.2, 0.25);
    }
  } else if (produtoId === 'bisnaguinha') {
    for (let i = 0; i < 4; i++) {
      const cx = rx + 1.55 + i * ((rw - 3.1) / 3);
      const cy = ry + 1.9 + (i % 2) * 0.25;
      const grad = ctx.createRadialGradient(cx - 0.3, cy - 0.3, 0.15, cx, cy, 1.2);
      grad.addColorStop(0, '#ffe09e');
      grad.addColorStop(0.55, '#dfa045');
      grad.addColorStop(1, '#a96218');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 1.18, 0.82, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(cx - 0.3, cy - 0.35, 0.55, 0.18);
    }
  } else {
    // Pão de hot-dog / baguetes
    for (let i = 0; i < 3; i++) {
      const cx = rx + 2.0 + i * ((rw - 4.0) / 2);
      const cy = ry + 1.95;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.32);
      ctx.fillStyle = '#d78c34';
      retanguloArredondado(ctx, -1.65, -0.68, 3.3, 1.36, 0.68);
      ctx.fill();
      ctx.fillStyle = '#f8ca7a';
      ctx.fillRect(-0.95, -0.35, 0.55, 0.25);
      ctx.fillRect(0.25, -0.35, 0.55, 0.25);
      ctx.restore();
    }
  }
}

function desenharConteudoAcougue(ctx, produtoId, x, y) {
  const bandejas = [
    { bx: x + 1.15, by: y + 4.35, bw: 6.45, bh: 5.4 },
    { bx: x + 8.35, by: y + 4.35, bw: 6.45, bh: 5.4 },
  ];

  for (const [bIdx, b] of bandejas.entries()) {
    ctx.fillStyle = 'rgba(30, 45, 55, 0.22)';
    retanguloArredondado(ctx, b.bx + 0.15, b.by + 0.3, b.bw, b.bh, 0.7);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    retanguloArredondado(ctx, b.bx, b.by, b.bw, b.bh, 0.65);
    ctx.fill();
    ctx.fillStyle = '#e1eff8';
    retanguloArredondado(ctx, b.bx + 0.45, b.by + 0.45, b.bw - 0.9, b.bh - 0.9, 0.45);
    ctx.fill();

    if (produtoId === 'frango') {
      for (let f = 0; f < 3; f++) {
        ctx.fillStyle = f % 2 === 0 ? '#ffccbc' : '#ffb8a0';
        ctx.beginPath();
        ctx.ellipse(b.bx + 1.9 + f * 1.35, b.by + 2.6 + (f % 2) * 0.3, 1.05, 1.35, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.36)';
        ctx.beginPath();
        ctx.arc(b.bx + 1.65 + f * 1.35, b.by + 2.1 + (f % 2) * 0.3, 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (produtoId === 'carne-moida') {
      const grad = ctx.createRadialGradient(b.bx + 2.8, b.by + 2.3, 0.2, b.bx + 3.2, b.by + 2.7, 2.2);
      grad.addColorStop(0, '#ef5350');
      grad.addColorStop(0.65, '#c62828');
      grad.addColorStop(1, '#8e1515');
      ctx.fillStyle = grad;
      retanguloArredondado(ctx, b.bx + 0.9, b.by + 1.0, b.bw - 1.8, b.bh - 2.0, 0.95);
      ctx.fill();
      ctx.fillStyle = '#ffcdd2';
      for (const [dx, dy] of [[1.7, 1.9], [2.9, 2.4], [4.2, 2.0], [2.2, 3.2], [3.8, 3.3]]) {
        ctx.fillRect(b.bx + dx, b.by + dy, 0.42, 0.22);
      }
    } else {
      for (let g = 0; g < 3; g++) {
        ctx.fillStyle = g === 1 ? '#e64a19' : '#d84315';
        retanguloArredondado(ctx, b.bx + 0.95, b.by + 1.05 + g * 1.18, b.bw - 1.9, 0.85, 0.42);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 240, 220, 0.38)';
        ctx.fillRect(b.bx + 1.3, b.by + 1.2 + g * 1.18, b.bw - 2.6, 0.18);
      }
    }

    // Raminho verde de salsinha decorativa
    ctx.fillStyle = '#43a047';
    ctx.beginPath();
    ctx.arc(b.bx + b.bw - 1.05 - bIdx * 0.2, b.by + 1.15, 0.42, 0, Math.PI * 2);
    ctx.fill();
  }

  // Brilho da vitrine curva de vidro sobre o açougue
  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.fillRect(x + 0.8, y + 3.0, TAMANHO_CASA - 1.6, 1.15);
  ctx.beginPath();
  ctx.moveTo(x + 2.0, y + 4.15);
  ctx.lineTo(x + 4.6, y + 4.15);
  ctx.lineTo(x + 2.4, y + 11.2);
  ctx.lineTo(x + 1.2, y + 11.2);
  ctx.closePath();
  ctx.fill();
}

function desenharSeloCantinho(ctx, item, x, y, corBorda) {
  const cx = x + 12.85;
  const cy = y + 12.85;
  const raio = 2.15;

  ctx.fillStyle = 'rgba(42, 28, 16, 0.25)';
  ctx.beginPath();
  ctx.arc(cx, cy + 0.32, raio, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 253, 248, 0.96)';
  ctx.strokeStyle = corBorda;
  ctx.lineWidth = 0.42;
  ctx.beginPath();
  ctx.arc(cx, cy, raio, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = '3.25px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.emoji, cx, cy + 0.14);
}

/**
 * Abastece a prateleira/banca/geladeira com ilustrações específicas do produto e suas marcas,
 * sobrepondo vidro nas geladeiras e selo compacto de identificação no canto inferior direito.
 */
export function desenharProduto(ctx, produtoId, opcaoId, x, y, vizinhos = null) {
  const item = itemPorId.get(produtoId);
  if (!item) return;

  const moldeId = MOLDE_DO_PRODUTO[produtoId] || 'pacote';
  const listaCores = coresOpcoesDoItem(item, opcaoId);
  const corBorda = listaCores[0][0];

  ctx.save();
  if (item.secao === 'hortifruti') {
    const fnFruta = DESENHO_HORTIFRUTI[produtoId];
    if (fnFruta) {
      HORTIFRUTI_CAIXAS.forEach((caixa, idxCaixa) => {
        fnFruta(ctx, x + 1.9, y + caixa.cy + 0.55, 12.2, caixa.h - 1.35, idxCaixa);
      });
    }
  } else if (item.secao === 'acougue') {
    desenharConteudoAcougue(ctx, produtoId, x, y);
  } else if (item.secao === 'laticinios' || item.secao === 'bebidas') {
    if (produtoId === 'ovos') {
      desenharCartelasOvos(ctx, listaCores, x, y);
    } else {
      desenharFileirasEmbalagens(ctx, moldeId, listaCores, x, y, GELADEIRA_ANDARES, 3.05);
    }
    desenharPortaVidroOverlay(ctx, x, y);
  } else if (item.secao === 'padaria') {
    if (produtoId === 'pao-de-forma' || produtoId === 'bisnaguinha' || produtoId === 'pao-de-hot-dog') {
      desenharPaesFrescos(ctx, produtoId, x + 1.9, y + HORTIFRUTI_CAIXAS[0].cy + 0.55, 12.2);
      desenharFileirasEmbalagens(ctx, moldeId, listaCores, x, y, [HORTIFRUTI_CAIXAS[1].cy + 4.15], 3.45);
    } else {
      desenharFileirasEmbalagens(
        ctx,
        moldeId,
        listaCores,
        x,
        y,
        [HORTIFRUTI_CAIXAS[0].cy + 4.05, HORTIFRUTI_CAIXAS[1].cy + 4.15],
        3.45,
      );
    }
  } else {
    // Gôndolas de mercearia, limpeza e guloseimas (3 andares abastecidos com o molde/marca real)
    desenharFileirasEmbalagens(ctx, moldeId, listaCores, x, y, GONDOLA_ANDARES, 3.22);
  }

  desenharSeloCantinho(ctx, item, x, y, corBorda);
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

/** Cria ícone DOM com molde de embalagem e cores da marca para os painéis. */
export function criarIcone(produtoId, opcaoId = null, escala = 2) {
  const item = itemPorId.get(produtoId);
  const moldeId = MOLDE_DO_PRODUTO[produtoId] || 'pacote';
  const marca = resolverMarcaDoItem(item, opcaoId);
  const cores = coresDaMarca(marca);
  const emoji = item ? item.emoji : '🛒';

  const aplicarAtributos = el => {
    el.className = 'icone-produto';
    el.setAttribute('aria-hidden', 'true');
    el.dataset.molde = moldeId;
    el.dataset.marca = marca;
    el.dataset.corPrincipal = cores[0];
    el.dataset.corRotulo = cores[1];
    if (escala > 2) {
      el.dataset.escala = String(escala);
    }
    return el;
  };

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
    if (ctx) {
      const tamanhoCss = Math.max(52, Math.round(TAMANHO_CASA * escala * 1.4));
      const dpr = Math.max(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 2);
      aplicarAtributos(canvas);
      canvas.width = Math.round(tamanhoCss * dpr);
      canvas.height = Math.round(tamanhoCss * dpr);
      canvas.style.width = `${tamanhoCss}px`;
      canvas.style.height = `${tamanhoCss}px`;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      desenharMoldeEmbalagem(ctx, moldeId, cores, 2, 2, tamanhoCss - 4, emoji);
      ctx.restore();
      return canvas;
    }
  }

  const span = document.createElement('span');
  aplicarAtributos(span);
  span.textContent = emoji;
  return span;
}
