/**
 * dados.js — as cinquenta palavras de Palmas nas Palavras (P03).
 *
 * `silabas` é a divisão falada, em caixa alta, do jeito que a criança vai
 * ouvir e ver nos círculos. Regras de separação usadas na revisão:
 *
 * - dígrafos que não separam: CH, NH, LH, GU, QU  (CHA-VE, GA-LI-NHA, FO-GUE-TE)
 * - dígrafos que separam: RR, SS  (CAR-RO, DI-NOS-SAU-RO)
 * - encontro consonantal que não separa: BR, CR, CL, PL, TR, VR  (LI-VRO, BI-CI-CLE-TA)
 * - ditongo fica junto, hiato separa  (CE-NOU-RA, mas LU-A seria LU-A)
 *
 * Todo `id` precisa existir em shared/catalogo-figuras.js, para a figura
 * aparecer na tela. Há teste conferindo isso e a contagem de sílabas.
 */

export const PALAVRAS = [
  // --- uma sílaba ---
  { id: 'sol', palavra: 'SOL', silabas: ['SOL'] },
  { id: 'pao', palavra: 'PÃO', silabas: ['PÃO'] },
  { id: 'trem', palavra: 'TREM', silabas: ['TREM'] },
  { id: 'flor', palavra: 'FLOR', silabas: ['FLOR'] },

  // --- duas sílabas ---
  { id: 'gato', palavra: 'GATO', silabas: ['GA', 'TO'] },
  { id: 'pato', palavra: 'PATO', silabas: ['PA', 'TO'] },
  { id: 'bola', palavra: 'BOLA', silabas: ['BO', 'LA'] },
  { id: 'casa', palavra: 'CASA', silabas: ['CA', 'SA'] },
  { id: 'uva', palavra: 'UVA', silabas: ['U', 'VA'] },
  { id: 'ovo', palavra: 'OVO', silabas: ['O', 'VO'] },
  { id: 'urso', palavra: 'URSO', silabas: ['UR', 'SO'] },
  { id: 'sapo', palavra: 'SAPO', silabas: ['SA', 'PO'] },
  { id: 'carro', palavra: 'CARRO', silabas: ['CAR', 'RO'] },
  { id: 'chave', palavra: 'CHAVE', silabas: ['CHA', 'VE'] },
  { id: 'livro', palavra: 'LIVRO', silabas: ['LI', 'VRO'] },
  { id: 'bolo', palavra: 'BOLO', silabas: ['BO', 'LO'] },
  { id: 'vaca', palavra: 'VACA', silabas: ['VA', 'CA'] },
  { id: 'porco', palavra: 'PORCO', silabas: ['POR', 'CO'] },
  { id: 'leao', palavra: 'LEÃO', silabas: ['LE', 'ÃO'] },
  { id: 'peixe', palavra: 'PEIXE', silabas: ['PEI', 'XE'] },
  { id: 'pinguim', palavra: 'PINGUIM', silabas: ['PIN', 'GUIM'] },
  { id: 'rato', palavra: 'RATO', silabas: ['RA', 'TO'] },
  { id: 'barco', palavra: 'BARCO', silabas: ['BAR', 'CO'] },
  { id: 'trator', palavra: 'TRATOR', silabas: ['TRA', 'TOR'] },
  { id: 'lua', palavra: 'LUA', silabas: ['LU', 'A'] },
  { id: 'nuvem', palavra: 'NUVEM', silabas: ['NU', 'VEM'] },
  { id: 'porta', palavra: 'PORTA', silabas: ['POR', 'TA'] },
  { id: 'sino', palavra: 'SINO', silabas: ['SI', 'NO'] },

  // --- três sílabas ---
  { id: 'banana', palavra: 'BANANA', silabas: ['BA', 'NA', 'NA'] },
  { id: 'cavalo', palavra: 'CAVALO', silabas: ['CA', 'VA', 'LO'] },
  { id: 'galinha', palavra: 'GALINHA', silabas: ['GA', 'LI', 'NHA'] },
  { id: 'macaco', palavra: 'MACACO', silabas: ['MA', 'CA', 'CO'] },
  { id: 'foguete', palavra: 'FOGUETE', silabas: ['FO', 'GUE', 'TE'] },
  { id: 'abelha', palavra: 'ABELHA', silabas: ['A', 'BE', 'LHA'] },
  { id: 'sapato', palavra: 'SAPATO', silabas: ['SA', 'PA', 'TO'] },
  { id: 'cenoura', palavra: 'CENOURA', silabas: ['CE', 'NOU', 'RA'] },
  { id: 'arvore', palavra: 'ÁRVORE', silabas: ['ÁR', 'VO', 'RE'] },
  { id: 'cachorro', palavra: 'CACHORRO', silabas: ['CA', 'CHOR', 'RO'] },
  { id: 'ovelha', palavra: 'OVELHA', silabas: ['O', 'VE', 'LHA'] },
  { id: 'coelho', palavra: 'COELHO', silabas: ['CO', 'E', 'LHO'] },
  { id: 'onibus', palavra: 'ÔNIBUS', silabas: ['Ô', 'NI', 'BUS'] },
  { id: 'aviao', palavra: 'AVIÃO', silabas: ['A', 'VI', 'ÃO'] },
  { id: 'caminhao', palavra: 'CAMINHÃO', silabas: ['CA', 'MI', 'NHÃO'] },
  { id: 'estrela', palavra: 'ESTRELA', silabas: ['ES', 'TRE', 'LA'] },

  // --- quatro sílabas ---
  { id: 'borboleta', palavra: 'BORBOLETA', silabas: ['BOR', 'BO', 'LE', 'TA'] },
  { id: 'elefante', palavra: 'ELEFANTE', silabas: ['E', 'LE', 'FAN', 'TE'] },
  { id: 'dinossauro', palavra: 'DINOSSAURO', silabas: ['DI', 'NOS', 'SAU', 'RO'] },
  { id: 'bicicleta', palavra: 'BICICLETA', silabas: ['BI', 'CI', 'CLE', 'TA'] },
  { id: 'telefone', palavra: 'TELEFONE', silabas: ['TE', 'LE', 'FO', 'NE'] },
  { id: 'tartaruga', palavra: 'TARTARUGA', silabas: ['TAR', 'TA', 'RU', 'GA'] },
];

/** O maior número de pedaços que aparece: são os botões de "Quantos pedaços?". */
export const MAIS_PEDACOS = 4;
