/**
 * catalogo-figuras.js — as figuras usadas na área Primeiras Descobertas
 * (Jogos do Rael). Cada figura é um SVG local em `public/figuras/`, servido
 * em `/figuras/<id>.svg`.
 *
 * Por que arquivos e não emoji: o mesmo emoji é desenhado de um jeito no
 * iPad, de outro no Android e de outro no computador. Numa atividade em que
 * a criança precisa reconhecer a figura, isso não pode variar. Os desenhos
 * vêm do OpenMoji (CC BY-SA 4.0) — a atribuição está em /figuras/LICENCA.txt.
 *
 * `artigo` existe para a fala montar "o gato" / "a bola" sem gambiarra.
 * As atividades P03 e P05 vão acrescentar aqui os campos de sílabas e de som
 * inicial, que precisam de revisão por escuta antes de entrar.
 */

/** @typedef {{ id: string, nome: string, artigo: 'o' | 'a', categoria: string }} Figura */

/** @type {Figura[]} */
export const FIGURAS = [
  // --- animais ---
  { id: 'gato', nome: 'gato', artigo: 'o', categoria: 'animais' },
  { id: 'cachorro', nome: 'cachorro', artigo: 'o', categoria: 'animais' },
  { id: 'vaca', nome: 'vaca', artigo: 'a', categoria: 'animais' },
  { id: 'cavalo', nome: 'cavalo', artigo: 'o', categoria: 'animais' },
  { id: 'porco', nome: 'porco', artigo: 'o', categoria: 'animais' },
  { id: 'ovelha', nome: 'ovelha', artigo: 'a', categoria: 'animais' },
  { id: 'coelho', nome: 'coelho', artigo: 'o', categoria: 'animais' },
  { id: 'leao', nome: 'leão', artigo: 'o', categoria: 'animais' },
  { id: 'macaco', nome: 'macaco', artigo: 'o', categoria: 'animais' },
  { id: 'elefante', nome: 'elefante', artigo: 'o', categoria: 'animais' },
  { id: 'sapo', nome: 'sapo', artigo: 'o', categoria: 'animais' },
  { id: 'peixe', nome: 'peixe', artigo: 'o', categoria: 'animais' },
  { id: 'passarinho', nome: 'passarinho', artigo: 'o', categoria: 'animais' },
  { id: 'pato', nome: 'pato', artigo: 'o', categoria: 'animais' },
  { id: 'galinha', nome: 'galinha', artigo: 'a', categoria: 'animais' },
  { id: 'pinguim', nome: 'pinguim', artigo: 'o', categoria: 'animais' },
  { id: 'abelha', nome: 'abelha', artigo: 'a', categoria: 'animais' },
  { id: 'borboleta', nome: 'borboleta', artigo: 'a', categoria: 'animais' },
  { id: 'tartaruga', nome: 'tartaruga', artigo: 'a', categoria: 'animais' },
  { id: 'dinossauro', nome: 'dinossauro', artigo: 'o', categoria: 'animais' },
  { id: 'urso', nome: 'urso', artigo: 'o', categoria: 'animais' },
  { id: 'rato', nome: 'rato', artigo: 'o', categoria: 'animais' },

  // --- veículos ---
  { id: 'carro', nome: 'carro', artigo: 'o', categoria: 'veiculos' },
  { id: 'onibus', nome: 'ônibus', artigo: 'o', categoria: 'veiculos' },
  { id: 'trem', nome: 'trem', artigo: 'o', categoria: 'veiculos' },
  { id: 'aviao', nome: 'avião', artigo: 'o', categoria: 'veiculos' },
  { id: 'foguete', nome: 'foguete', artigo: 'o', categoria: 'veiculos' },
  { id: 'barco', nome: 'barco', artigo: 'o', categoria: 'veiculos' },
  { id: 'bicicleta', nome: 'bicicleta', artigo: 'a', categoria: 'veiculos' },
  { id: 'caminhao', nome: 'caminhão', artigo: 'o', categoria: 'veiculos' },
  { id: 'helicoptero', nome: 'helicóptero', artigo: 'o', categoria: 'veiculos' },
  { id: 'trator', nome: 'trator', artigo: 'o', categoria: 'veiculos' },

  // --- natureza ---
  { id: 'sol', nome: 'sol', artigo: 'o', categoria: 'natureza' },
  { id: 'lua', nome: 'lua', artigo: 'a', categoria: 'natureza' },
  { id: 'estrela', nome: 'estrela', artigo: 'a', categoria: 'natureza' },
  { id: 'flor', nome: 'flor', artigo: 'a', categoria: 'natureza' },
  { id: 'arvore', nome: 'árvore', artigo: 'a', categoria: 'natureza' },
  { id: 'nuvem', nome: 'nuvem', artigo: 'a', categoria: 'natureza' },
  { id: 'ilha', nome: 'ilha', artigo: 'a', categoria: 'natureza' },

  // --- coisas de casa ---
  { id: 'casa', nome: 'casa', artigo: 'a', categoria: 'casa' },
  { id: 'cama', nome: 'cama', artigo: 'a', categoria: 'casa' },
  { id: 'porta', nome: 'porta', artigo: 'a', categoria: 'casa' },
  { id: 'chave', nome: 'chave', artigo: 'a', categoria: 'casa' },
  { id: 'sino', nome: 'sino', artigo: 'o', categoria: 'casa' },
  { id: 'relogio', nome: 'relógio', artigo: 'o', categoria: 'casa' },
  { id: 'telefone', nome: 'telefone', artigo: 'o', categoria: 'casa' },
  { id: 'igreja', nome: 'igreja', artigo: 'a', categoria: 'casa' },

  // --- objetos ---
  { id: 'bola', nome: 'bola', artigo: 'a', categoria: 'objetos' },
  { id: 'livro', nome: 'livro', artigo: 'o', categoria: 'objetos' },
  { id: 'lapis', nome: 'lápis', artigo: 'o', categoria: 'objetos' },
  { id: 'mochila', nome: 'mochila', artigo: 'a', categoria: 'objetos' },
  { id: 'guarda-chuva', nome: 'guarda-chuva', artigo: 'o', categoria: 'objetos' },

  // --- roupa ---
  { id: 'sapato', nome: 'sapato', artigo: 'o', categoria: 'roupa' },
  { id: 'camiseta', nome: 'camiseta', artigo: 'a', categoria: 'roupa' },

  // --- comida ---
  { id: 'banana', nome: 'banana', artigo: 'a', categoria: 'comida' },
  { id: 'maca', nome: 'maçã', artigo: 'a', categoria: 'comida' },
  { id: 'uva', nome: 'uva', artigo: 'a', categoria: 'comida' },
  { id: 'melancia', nome: 'melancia', artigo: 'a', categoria: 'comida' },
  { id: 'bolo', nome: 'bolo', artigo: 'o', categoria: 'comida' },
  { id: 'pao', nome: 'pão', artigo: 'o', categoria: 'comida' },
  { id: 'ovo', nome: 'ovo', artigo: 'o', categoria: 'comida' },
  { id: 'leite', nome: 'leite', artigo: 'o', categoria: 'comida' },
  { id: 'cenoura', nome: 'cenoura', artigo: 'a', categoria: 'comida' },
  { id: 'pizza', nome: 'pizza', artigo: 'a', categoria: 'comida' },
];

/**
 * Temas que o adulto pode escolher nas configurações. O tema não muda as
 * regras: ele só decide de quais categorias saem as figuras da rodada.
 */
export const TEMAS = {
  tudo: { nome: 'De tudo um pouco', categorias: null },
  animais: { nome: 'Animais', categorias: ['animais'] },
  veiculos: { nome: 'Veículos', categorias: ['veiculos'] },
  casa: { nome: 'Coisas de casa', categorias: ['casa', 'objetos', 'roupa', 'comida'] },
  natureza: { nome: 'Céu e natureza', categorias: ['natureza', 'animais'] },
};

const PORid = new Map(FIGURAS.map(figura => [figura.id, figura]));

/** Devolve a figura pelo id, ou undefined se não existir. */
export function figura(id) {
  return PORid.get(id);
}

/** Endereço do arquivo SVG da figura. */
export function caminhoDaFigura(id) {
  return `/figuras/${id}.svg`;
}

/** "o gato", "a bola" — do jeito que a fala precisa dizer. */
export function nomeComArtigo(id) {
  const item = PORid.get(id);
  return item ? `${item.artigo} ${item.nome}` : '';
}

/** As figuras de um tema. Tema desconhecido devolve o catálogo inteiro. */
export function figurasDoTema(tema = 'tudo') {
  const escolhido = TEMAS[tema] || TEMAS.tudo;
  if (!escolhido.categorias) return [...FIGURAS];
  return FIGURAS.filter(item => escolhido.categorias.includes(item.categoria));
}

/** As categorias existentes, sem repetir. Serve para a P11 (Qual é o Intruso?). */
export function categorias() {
  return [...new Set(FIGURAS.map(item => item.categoria))];
}
