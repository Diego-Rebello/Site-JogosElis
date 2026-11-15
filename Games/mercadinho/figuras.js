import { desejos, produtos, sonhos, temas } from './dados.js';

/**
 * Catálogo visual do Mercadinho (v2).
 * Módulo puro nos dados e helpers: pode ser importado no Node/Vitest sem tocar em `document`.
 * Os ícones são do conjunto Fluent Emoji "Color" (Microsoft, licença MIT), em
 * `public/figuras/mercadinho/icones/`.
 */

export const SECOES_VISUAIS = Object.freeze({
  H: Object.freeze({ id: 'hortifruti', nome: 'Hortifrúti', icone: 'maca', cor: '#247a45', movel: 'banca' }),
  P: Object.freeze({ id: 'padaria', nome: 'Padaria', icone: 'pao-de-forma', cor: '#a05a1f', movel: 'gondola' }),
  L: Object.freeze({ id: 'laticinios', nome: 'Laticínios', icone: 'copo-de-leite', cor: '#256fa8', movel: 'geladeira' }),
  M: Object.freeze({ id: 'mercearia', nome: 'Mercearia', icone: 'arroz', cor: '#b4530f', movel: 'gondola' }),
  A: Object.freeze({ id: 'acougue', nome: 'Açougue', icone: 'carne', cor: '#c5303a', movel: 'balcao' }),
  B: Object.freeze({ id: 'bebidas', nome: 'Bebidas', icone: 'copo-com-canudo', cor: '#0e7c90', movel: 'geladeira' }),
  Z: Object.freeze({ id: 'limpeza', nome: 'Limpeza', icone: 'bolhas', cor: '#7856c2', movel: 'gondola' }),
  G: Object.freeze({ id: 'guloseimas', nome: 'Guloseimas', icone: 'pirulito', cor: '#c92f6f', movel: 'gondola' }),
});

export const FIGURA_DO_PRODUTO = Object.freeze({
  // Hortifrúti
  banana: Object.freeze(['solto', 'banana']),
  maca: Object.freeze(['solto', 'maca']),
  laranja: Object.freeze(['solto', 'laranja']),
  tomate: Object.freeze(['solto', 'tomate']),
  alface: Object.freeze(['solto', 'alface']),
  cenoura: Object.freeze(['solto', 'cenoura']),
  batata: Object.freeze(['solto', 'batata']),
  cebola: Object.freeze(['solto', 'cebola']),
  mamao: Object.freeze(['solto', 'mamao']),
  uva: Object.freeze(['solto', 'uva']),
  morango: Object.freeze(['solto', 'morango']),
  // Padaria e matinais
  'pao-de-forma': Object.freeze(['pacote', 'pao-de-forma']),
  bisnaguinha: Object.freeze(['pacote', 'baguete']),
  'pao-de-hot-dog': Object.freeze(['pacote', 'cachorro-quente']),
  'biscoito-recheado': Object.freeze(['saquinho', 'biscoito']),
  'cream-cracker': Object.freeze(['caixa-papelao', 'waffle']),
  achocolatado: Object.freeze(['pote', 'barra-de-chocolate']),
  cafe: Object.freeze(['pacote', 'cafe']),
  // Laticínios e frios
  leite: Object.freeze(['caixa', 'copo-de-leite']),
  iogurte: Object.freeze(['garrafa', 'morango']),
  manteiga: Object.freeze(['caixa-papelao', 'manteiga']),
  margarina: Object.freeze(['pote', 'manteiga']),
  queijo: Object.freeze(['bandeja', 'queijo']),
  presunto: Object.freeze(['bandeja', 'pernil']),
  requeijao: Object.freeze(['pote', 'queijo']),
  ovos: Object.freeze(['bandeja', 'ovo']),
  // Mercearia
  arroz: Object.freeze(['pacote', 'arroz']),
  feijao: Object.freeze(['pacote', 'feijao']),
  macarrao: Object.freeze(['pacote', 'espaguete']),
  'molho-de-tomate': Object.freeze(['saquinho', 'tomate']),
  oleo: Object.freeze(['garrafa', 'girassol']),
  acucar: Object.freeze(['pacote', 'colher']),
  farinha: Object.freeze(['pacote', 'trigo']),
  fermento: Object.freeze(['lata', 'cupcake']),
  'leite-condensado': Object.freeze(['caixa', 'pudim']),
  'queijo-ralado': Object.freeze(['saquinho', 'queijo']),
  milho: Object.freeze(['lata', 'milho']),
  // Açougue
  frango: Object.freeze(['bandeja', 'coxa-de-frango']),
  'carne-moida': Object.freeze(['bandeja', 'carne']),
  salsicha: Object.freeze(['bandeja', 'cachorro-quente']),
  // Bebidas
  suco: Object.freeze(['caixa', 'laranja']),
  'suco-caixinha': Object.freeze(['solto', 'suco-caixinha']),
  refrigerante: Object.freeze(['garrafa', 'copo-com-canudo']),
  agua: Object.freeze(['garrafa', 'gota']),
  // Limpeza e higiene
  detergente: Object.freeze(['frasco', 'esponja']),
  'sabao-em-po': Object.freeze(['caixa-papelao', 'camiseta']),
  'papel-higienico': Object.freeze(['solto', 'papel-higienico']),
  'creme-dental': Object.freeze(['caixa-papelao', 'escova-de-dentes']),
  sabonete: Object.freeze(['solto', 'sabonete']),
  // Guloseimas
  batom: Object.freeze(['barra', 'barra-de-chocolate']),
  toddynho: Object.freeze(['caixa', 'copo-de-leite']),
  trident: Object.freeze(['barra', 'bala']),
  kitkat: Object.freeze(['barra', 'waffle']),
  mms: Object.freeze(['saquinho', 'bala']),
  picole: Object.freeze(['solto', 'sorvete']),
  fini: Object.freeze(['saquinho', 'pirulito']),
  lacta: Object.freeze(['barra', 'barra-de-chocolate']),
  bis: Object.freeze(['caixa-papelao', 'barra-de-chocolate']),
  ruffles: Object.freeze(['saquinho', 'batata-frita']),
  gibi: Object.freeze(['solto', 'livro']),
  'kinder-ovo': Object.freeze(['saquinho', 'ovo']),
});

export const ICONE_DO_TEMA = Object.freeze({
  'cafe-da-manha': 'cafe',
  'lanche-da-escola': 'mochila',
  macarronada: 'espaguete',
  almoco: 'arroz',
  bolo: 'bolo',
  'cachorro-quente': 'cachorro-quente',
  'salada-de-frutas': 'morango',
  'compras-do-mes': 'cesto',
  piquenique: 'arvore',
  'cafe-da-tarde': 'bule',
});

/** Ícone de cada sonho do cofrinho (dados.js, `sonhos`). */
export const ICONE_DO_SONHO = Object.freeze({
  caderno: 'caderno',
  canetinhas: 'giz-de-cera',
  bola: 'bola-de-volei',
  pelucia: 'ursinho',
  livros: 'livro',
  patins: 'patins',
});

export const ICONES_DA_INTERFACE = Object.freeze([
  'saco-de-dinheiro',
  'coracao',
  'coracao-vazio',
  'lista',
  'carrinho',
  'olhos',
  'cupom',
  'menina',
  'alfinete',
  'estrela',
  'moeda',
  'lixeira',
  'confirmado',
  'sacolas',
  'mercado',
  'porquinho',
]);

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

export function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function misturar(a, b, t) {
  const A = rgb(a);
  const B = rgb(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

export function clara(hex) {
  const [r, g, b] = rgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 165;
}

/** Os 10 moldes de embalagem copiados da referência (caixa de desenho 100 × 120). */
export const MOLDES = Object.freeze({
  caixa: Object.freeze({
    svg: c => `<path d="M27 6h46l9 18H18z" fill="${c.escura}"/><rect x="18" y="24" width="64" height="92" rx="5" fill="${c.cor}"/><path d="M70 24h7a5 5 0 0 1 5 5v82a5 5 0 0 1-5 5h-7z" fill="${c.escura}" opacity=".5"/><rect x="18" y="24" width="64" height="4" fill="#fff" opacity=".35"/><circle cx="58" cy="15" r="5.500" fill="#fff"/><circle cx="58" cy="15" r="3" fill="${c.clarinha}"/>`,
    rotulo: Object.freeze([22, 34, 46, 50]),
    marca: Object.freeze([19, 87, 62, 25]),
  }),
  pacote: Object.freeze({
    svg: c => `<path d="M15 16h70c5 30 5 58 0 88H15c-5-30-5-58 0-88z" fill="${c.cor}"/><rect x="15" y="8" width="70" height="10" rx="2" fill="${c.escura}"/><rect x="15" y="102" width="70" height="10" rx="2" fill="${c.escura}"/><path d="M15 13h70M15 107h70" stroke="#fff" stroke-opacity=".35" stroke-width="1.500" stroke-dasharray="3 3"/><path d="M21 26c-3 24-3 44 0 68" stroke="#fff" stroke-opacity=".4" stroke-width="4" stroke-linecap="round" fill="none"/>`,
    rotulo: Object.freeze([25, 24, 50, 50]),
    marca: Object.freeze([17, 77, 66, 23]),
  }),
  lata: Object.freeze({
    svg: c => `<rect x="19" y="14" width="62" height="98" rx="7" fill="#b9c0c9"/><rect x="19" y="25" width="62" height="76" fill="${c.cor}"/><ellipse cx="50" cy="15" rx="31" ry="7" fill="#e8ebef"/><ellipse cx="50" cy="15" rx="24" ry="4.500" fill="#cfd5dc"/><rect x="19" y="25" width="9" height="76" fill="#fff" opacity=".25"/><rect x="72" y="25" width="9" height="76" fill="#000" opacity=".14"/>`,
    rotulo: Object.freeze([27, 30, 46, 44]),
    marca: Object.freeze([21, 76, 58, 23]),
  }),
  garrafa: Object.freeze({
    svg: c => `<rect x="40" y="4" width="20" height="11" rx="3" fill="${c.tampa}"/><path d="M43 15h14v7c0 9 21 13 21 30v56a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8V52c0-17 21-21 21-30z" fill="${c.cor}"/><path d="M29 56v50" stroke="#fff" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"/><rect x="22" y="56" width="56" height="48" fill="#fff"/>`,
    rotulo: Object.freeze([30, 57, 40, 28]),
    marca: Object.freeze([23, 85, 54, 18]),
    marcaNoRotulo: true,
  }),
  pote: Object.freeze({
    svg: c => `<path d="M16 46h68l-6 60a9 9 0 0 1-9 8H31a9 9 0 0 1-9-8z" fill="${c.cor}"/><rect x="11" y="32" width="78" height="16" rx="6" fill="${c.tampa}"/><rect x="11" y="32" width="78" height="5" rx="2.500" fill="#fff" opacity=".3"/><path d="M24 54l4 46" stroke="#fff" stroke-opacity=".4" stroke-width="4" stroke-linecap="round"/>`,
    rotulo: Object.freeze([30, 51, 40, 36]),
    marca: Object.freeze([23, 88, 54, 21]),
  }),
  'caixa-papelao': Object.freeze({
    svg: c => `<path d="M12 24l9-10h68l-9 10z" fill="${c.clarinha}"/><path d="M80 24l9-10v92l-9 10z" fill="${c.escura}"/><rect x="12" y="24" width="68" height="92" rx="3" fill="${c.cor}"/>`,
    rotulo: Object.freeze([20, 31, 52, 52]),
    marca: Object.freeze([14, 86, 64, 25]),
  }),
  bandeja: Object.freeze({
    svg: () => `<rect x="5" y="30" width="90" height="76" rx="15" fill="#dfe5eb"/><rect x="10" y="34" width="80" height="66" rx="11" fill="#fbfcfd"/><path d="M18 40h22L24 94H14z" fill="#fff" opacity=".0"/>`,
    rotulo: Object.freeze([20, 34, 60, 48]),
    marca: Object.freeze([14, 80, 72, 21]),
    rotuloSemMarca: Object.freeze([18, 36, 64, 62]),
    rotuloTransparente: true,
    marcaEtiqueta: true,
  }),
  frasco: Object.freeze({
    svg: c => `<rect x="44" y="3" width="12" height="10" rx="3" fill="${c.tampa}"/><rect x="39" y="11" width="22" height="11" rx="3" fill="${c.tampa}"/><path d="M40 22h20c0 10 15 13 15 28v58a8 8 0 0 1-8 8H33a8 8 0 0 1-8-8V50c0-15 15-18 15-28z" fill="${c.cor}"/><path d="M32 54v50" stroke="#fff" stroke-opacity=".45" stroke-width="4.500" stroke-linecap="round"/>`,
    rotulo: Object.freeze([32, 48, 36, 34]),
    marca: Object.freeze([26, 85, 48, 21]),
  }),
  barra: Object.freeze({
    svg: c => `<path d="M4 44l5 4-5 5 5 4-5 5 5 4-5 5 5 4-5 5 5 4-5 4h12V40H4z" fill="${c.escura}"/><path d="M96 44l-5 4 5 5-5 4 5 5-5 4 5 5-5 4 5 5-5 4 5 4H84V40h12z" fill="${c.escura}"/><rect x="12" y="36" width="76" height="60" rx="5" fill="${c.cor}"/><rect x="12" y="36" width="76" height="6" rx="3" fill="#fff" opacity=".3"/>`,
    rotulo: Object.freeze([17, 42, 30, 30]),
    marca: Object.freeze([15, 74, 70, 20]),
    rotuloSemMarca: Object.freeze([22, 42, 56, 48]),
  }),
  saquinho: Object.freeze({
    svg: c => `<path d="M16 14h68l3 10c3 28 3 48 0 76l-3 10H16l-3-10c-3-28-3-48 0-76z" fill="${c.cor}"/><path d="M16 14l4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5z" fill="${c.cor}"/><path d="M16 110l4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5 4.250 5 4.250-5z" fill="${c.cor}"/><path d="M15 20h70M15 104h70" stroke="${c.escura}" stroke-width="2" stroke-opacity=".7"/><path d="M21 30c-2 22-2 40 0 60" stroke="#fff" stroke-opacity=".4" stroke-width="4" stroke-linecap="round" fill="none"/>`,
    rotulo: Object.freeze([25, 27, 50, 46]),
    marca: Object.freeze([17, 76, 66, 24]),
  }),
});

const ITEM_POR_ID = new Map([...produtos, ...desejos].map(item => [item.id, item]));

const EMOJI_RESERVA_UI = {
  'saco-de-dinheiro': '💰',
  coracao: '❤️',
  'coracao-vazio': '🤍',
  lista: '📝',
  carrinho: '🛒',
  olhos: '👀',
  cupom: '🧾',
  menina: '👧',
  alfinete: '📍',
  estrela: '⭐',
  moeda: '🪙',
  lixeira: '🗑️',
  confirmado: '✅',
  sacolas: '🛍️',
  mercado: '🏪',
  porquinho: '🐷',
  maca: '🍎',
  'pao-de-forma': '🍞',
  'copo-de-leite': '🥛',
  arroz: '🍚',
  carne: '🥩',
  'copo-com-canudo': '🥤',
  bolhas: '🧴',
  pirulito: '🍭',
  cafe: '☕',
  mochila: '🎒',
  espaguete: '🍝',
  bolo: '🎂',
  'cachorro-quente': '🌭',
  morango: '🍓',
  cesto: '🧺',
  arvore: '🌳',
  bule: '🫖',
};

const EMOJI_POR_ICONE = { ...EMOJI_RESERVA_UI };
for (const item of [...produtos, ...desejos]) {
  const icone = FIGURA_DO_PRODUTO[item.id]?.[1];
  if (icone && !(icone in EMOJI_POR_ICONE)) EMOJI_POR_ICONE[icone] = item.emoji;
}
for (const tema of temas) {
  const icone = ICONE_DO_TEMA[tema.id];
  if (icone && !(icone in EMOJI_POR_ICONE)) EMOJI_POR_ICONE[icone] = tema.emoji;
}
for (const sonho of sonhos) {
  const icone = ICONE_DO_SONHO[sonho.id];
  if (icone && !(icone in EMOJI_POR_ICONE)) EMOJI_POR_ICONE[icone] = sonho.emoji;
}

export function urlDoIcone(nome) {
  if (typeof window !== 'undefined' && window.location?.href) {
    const url = new URL(window.location.href);
    if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) {
      url.pathname += '/';
    }
    return new URL(`../../figuras/mercadinho/icones/${nome}.svg`, url.href).href;
  }
  return `/figuras/mercadinho/icones/${nome}.svg`;
}

function criarImagemIcone(nome, emojiReserva, tamanhoReservaPx) {
  const img = document.createElement('img');
  img.src = urlDoIcone(nome);
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  img.decoding = 'async';
  img.addEventListener(
    'error',
    () => {
      const reserva = document.createElement('span');
      reserva.className = img.classList.contains('icone-texto')
        ? 'fig__reserva icone-texto'
        : 'fig__reserva';
      reserva.setAttribute('aria-hidden', 'true');
      reserva.textContent = emojiReserva || EMOJI_POR_ICONE[nome] || '🛒';
      if (tamanhoReservaPx) {
        reserva.style.fontSize = `${Math.max(12, Math.round(tamanhoReservaPx))}px`;
      }
      if (img.getAttribute('style')) {
        reserva.setAttribute('style', img.getAttribute('style'));
        reserva.style.display = 'grid';
        reserva.style.placeItems = 'center';
        reserva.style.lineHeight = '1';
        if (tamanhoReservaPx) {
          reserva.style.fontSize = `${Math.max(12, Math.round(tamanhoReservaPx))}px`;
        }
      }
      img.replaceWith(reserva);
    },
    { once: true },
  );
  return img;
}

/** Cria um ícone decorativo de interface (<img alt="">) com reserva em emoji. */
export function criarIconeUi(nome, tamanho = 24) {
  const img = criarImagemIcone(nome, EMOJI_POR_ICONE[nome] || '🛒', tamanho * 0.8);
  img.className = 'icone-ui';
  if (tamanho) {
    img.width = tamanho;
    img.height = tamanho;
    img.style.width = `${tamanho}px`;
    img.style.height = `${tamanho}px`;
  }
  return img;
}

function resolverOpcaoECores(item, opcaoId) {
  if (item.opcoes?.length) {
    let idx = opcaoId ? item.opcoes.findIndex(o => o.id === opcaoId) : 0;
    if (idx < 0) idx = 0;
    const opcao = item.opcoes[idx];
    return {
      nome: opcao.rotulo,
      cores: coresDaMarca(opcao.rotulo, idx),
    };
  }
  const marca = item.marca || item.nome;
  return {
    nome: marca,
    cores: coresDaMarca(marca, 0),
  };
}

/**
 * Cria o elemento visual de um produto ou guloseima em qualquer largura em px.
 * Com `marca: false` (mapa e gôndola), o rótulo se estende pela faixa da marca.
 */
export function criarFigura(itemId, opcaoId, largura, { marca = false } = {}) {
  const item = ITEM_POR_ID.get(itemId);
  if (!item) {
    const vazio = document.createElement('span');
    vazio.className = 'fig';
    vazio.style.width = `${largura}px`;
    vazio.style.height = `${largura}px`;
    return vazio;
  }

  const [moldeId, icone] = FIGURA_DO_PRODUTO[item.id];
  const { nome, cores } = resolverOpcaoECores(item, opcaoId);
  const el = document.createElement('span');
  el.className = 'fig';
  el.setAttribute('aria-hidden', 'true');

  if (moldeId === 'solto') {
    if (!marca || !item.opcoes) {
      el.classList.add('fig--solto');
      el.style.width = `${largura}px`;
      el.style.height = `${largura}px`;
      el.append(criarImagemIcone(icone, item.emoji, largura * 0.78));
      return el;
    }

    const u = largura / 100;
    const cor = cores[0];
    const fonte = Math.min(15 * u, (84 * u * 0.94) / (nome.length * 0.66));
    el.style.width = `${largura}px`;
    el.style.height = `${largura * 1.2}px`;

    const img = criarImagemIcone(icone, item.emoji, 72 * u);
    img.style.position = 'absolute';
    img.style.left = `${6 * u}px`;
    img.style.top = `${2 * u}px`;
    img.style.width = `${88 * u}px`;
    img.style.height = `${88 * u}px`;
    img.style.objectFit = 'contain';

    const faixa = document.createElement('span');
    faixa.className = 'fig__marca';
    faixa.textContent = nome;
    faixa.style.left = `${8 * u}px`;
    faixa.style.top = `${93 * u}px`;
    faixa.style.width = `${84 * u}px`;
    faixa.style.height = `${24 * u}px`;
    faixa.style.fontSize = `${fonte}px`;
    faixa.style.background = cor;
    faixa.style.color = clara(cor) ? '#2b2118' : '#fff';
    faixa.style.borderRadius = `${6 * u}px`;
    faixa.style.border = `${2 * u}px solid #fff`;
    faixa.style.boxShadow = `0 ${2 * u}px 0 rgba(0,0,0,.15)`;

    el.append(img, faixa);
    return el;
  }

  const m = MOLDES[moldeId];
  const c = {
    cor: cores[0],
    escura: misturar(cores[0], '#000000', 0.28),
    clarinha: misturar(cores[0], '#ffffff', 0.45),
    tampa: clara(cores[1]) ? misturar(cores[0], '#000000', 0.38) : cores[1],
  };

  const altura = largura * 1.2;
  const u = largura / 100;
  el.style.width = `${largura}px`;
  el.style.height = `${altura}px`;

  const svgHost = document.createElement('div');
  svgHost.innerHTML = `<svg viewBox="0 0 100 120" aria-hidden="true">${m.svg(c)}</svg>`;
  const svg = svgHost.firstElementChild;

  const [mx, my, mw, mh] = m.marca;
  const [rx, ry, rw, rh] = marca
    ? m.rotulo
    : m.rotuloSemMarca || [m.rotulo[0], m.rotulo[1], m.rotulo[2], my + mh - m.rotulo[1] - 2];

  const rotulo = document.createElement('span');
  rotulo.className = 'fig__rotulo';
  rotulo.style.left = `${rx * u}px`;
  rotulo.style.top = `${ry * u}px`;
  rotulo.style.width = `${rw * u}px`;
  rotulo.style.height = `${rh * u}px`;
  if (m.rotuloTransparente) {
    rotulo.style.background = 'none';
  }
  rotulo.append(criarImagemIcone(icone, item.emoji, Math.min(rw, rh) * u * 0.72));

  el.append(svg, rotulo);

  const linhas = nome.length > 11 && nome.includes(' ') ? 2 : 1;
  const maior = linhas === 2 ? Math.max(...nome.split(' ').map(p => p.length)) : nome.length;
  const fonte = Math.min(mh * u * (linhas === 2 ? 0.46 : 0.78), (mw * u * 0.94) / (maior * 0.66));

  if (marca && fonte >= 6.5) {
    const corTexto = m.marcaNoRotulo
      ? misturar(cores[0], '#000000', 0.45)
      : m.marcaEtiqueta
        ? (clara(cores[0]) ? '#2b2118' : '#fff')
        : (clara(cores[0]) ? misturar(cores[0], '#000000', 0.62) : '#fff');

    const faixa = document.createElement('span');
    faixa.className = 'fig__marca';
    faixa.textContent = nome;
    faixa.style.left = `${mx * u}px`;
    faixa.style.top = `${my * u}px`;
    faixa.style.width = `${mw * u}px`;
    faixa.style.height = `${mh * u}px`;
    faixa.style.fontSize = `${fonte}px`;
    faixa.style.color = corTexto;
    if (m.marcaEtiqueta) {
      faixa.style.background = cores[0];
      faixa.style.borderRadius = `${4 * u}px`;
      faixa.style.border = `${1.5 * u}px solid #fff`;
    }
    el.append(faixa);
  }

  return el;
}
