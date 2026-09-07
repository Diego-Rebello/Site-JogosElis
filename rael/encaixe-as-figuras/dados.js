/**
 * dados.js — as doze cenas de Encaixe as Figuras (P02).
 *
 * Dois tipos de cena:
 *
 * - `silhueta`: três figuras parecidas e as três sombras delas. A criança leva
 *   cada figura para a própria sombra. As sombras são a mesma imagem pintada
 *   de cinza por CSS, então não precisam de arquivo à parte.
 * - `pedacos`: uma figura recortada em pedaços iguais, sem rotação, para
 *   remontar numa grade. Os pedaços também saem do mesmo SVG, recortados por
 *   background-position — foi assim que as cenas de peças ficaram possíveis
 *   sem ilustração nova (ver "Como ficou" da P02 no MELHORIAS.md).
 *
 * `tintaMinima` é a porcentagem de desenho da célula mais vazia da figura,
 * medida desenhando o SVG num canvas e contando pixels opacos. Ela precisa
 * ficar acima de zero: uma célula sem desenho vira um pedaço em branco, e dois
 * pedaços em branco seriam indistinguíveis para a criança. Foi por isso que
 * dinossauro, trem e ônibus ficaram de fora — o céu em volta deles deixa
 * células inteiras vazias.
 *
 * Todo `figura` precisa existir em shared/catalogo-figuras.js; há teste para isso.
 */

export const CENAS = [
  // --- silhuetas: figuras que se parecem, para exigir olhar com atenção ---
  {
    id: 'bichos-de-casa',
    tipo: 'silhueta',
    instrucao: 'Leve cada bicho para a sombra dele.',
    figuras: ['gato', 'cachorro', 'coelho'],
  },
  {
    id: 'no-ceu',
    tipo: 'silhueta',
    instrucao: 'Leve cada figura para a sombra dela.',
    figuras: ['sol', 'lua', 'estrela'],
  },
  {
    id: 'veiculos-grandes',
    tipo: 'silhueta',
    instrucao: 'Leve cada veículo para a sombra dele.',
    figuras: ['carro', 'onibus', 'caminhao'],
  },
  {
    id: 'frutas',
    tipo: 'silhueta',
    instrucao: 'Leve cada fruta para a sombra dela.',
    figuras: ['maca', 'melancia', 'uva'],
  },
  {
    id: 'passaros',
    tipo: 'silhueta',
    instrucao: 'Leve cada passarinho para a sombra dele.',
    figuras: ['pato', 'galinha', 'passarinho'],
  },
  {
    id: 'coisas-minhas',
    tipo: 'silhueta',
    instrucao: 'Leve cada coisa para a sombra dela.',
    figuras: ['camiseta', 'sapato', 'mochila'],
  },

  // --- quatro pedaços: 2 colunas por 2 linhas ---
  {
    id: 'monta-foguete',
    tipo: 'pedacos',
    instrucao: 'Monte o foguete!',
    figura: 'foguete',
    colunas: 2,
    linhas: 2,
    tintaMinima: 14,
  },
  {
    id: 'monta-casa',
    tipo: 'pedacos',
    instrucao: 'Monte a casa!',
    figura: 'casa',
    colunas: 2,
    linhas: 2,
    tintaMinima: 19,
  },
  {
    id: 'monta-elefante',
    tipo: 'pedacos',
    instrucao: 'Monte o elefante!',
    figura: 'elefante',
    colunas: 2,
    linhas: 2,
    tintaMinima: 33,
  },

  // --- seis pedaços: 3 colunas por 2 linhas ---
  {
    id: 'monta-peixe',
    tipo: 'pedacos',
    instrucao: 'Monte o peixe!',
    figura: 'peixe',
    colunas: 3,
    linhas: 2,
    tintaMinima: 18,
  },
  {
    id: 'monta-tartaruga',
    tipo: 'pedacos',
    instrucao: 'Monte a tartaruga!',
    figura: 'tartaruga',
    colunas: 3,
    linhas: 2,
    tintaMinima: 21,
  },
  {
    id: 'monta-cachorro',
    tipo: 'pedacos',
    instrucao: 'Monte o cachorro!',
    figura: 'cachorro',
    colunas: 3,
    linhas: 2,
    tintaMinima: 25,
  },
];

/**
 * Quantas peças cada cena tem. Serve para escolher a cena pelo nível e para
 * conferir, no teste, que nenhuma passa de seis.
 */
export function quantidadeDePecas(cena) {
  return cena.tipo === 'silhueta' ? cena.figuras.length : cena.colunas * cena.linhas;
}
