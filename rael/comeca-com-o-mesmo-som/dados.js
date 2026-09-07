/**
 * Trinta palavras com som inicial inequívoco. C/G ficaram de fora porque a
 * mesma letra muda de som em português. As vogais usam palavras em que o som
 * inicial se aproxima do nome da letra (ELEFANTE, OVO; não ÉPOCA/ÓCULOS).
 */
const palavra = (id, nome, som, letra, tipo) => ({
  id, nome, som, letra, tipo, audio: `/audio/palavras/${id}.wav`,
  audioSom: `/audio/sons-iniciais/${som}.wav`,
});

export const PALAVRAS_SOM = [
  palavra('abelha', 'abelha', 'a', 'A', 'vogal'),
  palavra('arvore', 'árvore', 'a', 'A', 'vogal'),
  palavra('aviao', 'avião', 'a', 'A', 'vogal'),
  palavra('elefante', 'elefante', 'e', 'E', 'vogal'),
  palavra('estrela', 'estrela', 'e', 'E', 'vogal'),
  palavra('igreja', 'igreja', 'i', 'I', 'vogal'),
  palavra('ilha', 'ilha', 'i', 'I', 'vogal'),
  palavra('ovo', 'ovo', 'o', 'O', 'vogal'),
  palavra('ovelha', 'ovelha', 'o', 'O', 'vogal'),
  palavra('onibus', 'ônibus', 'o', 'O', 'vogal'),
  palavra('uva', 'uva', 'u', 'U', 'vogal'),
  palavra('urso', 'urso', 'u', 'U', 'vogal'),

  palavra('flor', 'flor', 'f', 'F', 'continuo'),
  palavra('foguete', 'foguete', 'f', 'F', 'continuo'),
  palavra('maca', 'maçã', 'm', 'M', 'continuo'),
  palavra('macaco', 'macaco', 'm', 'M', 'continuo'),
  palavra('mochila', 'mochila', 'm', 'M', 'continuo'),
  palavra('sapo', 'sapo', 's', 'S', 'continuo'),
  palavra('sol', 'sol', 's', 'S', 'continuo'),
  palavra('lapis', 'lápis', 'l', 'L', 'continuo'),
  palavra('leao', 'leão', 'l', 'L', 'continuo'),
  palavra('livro', 'livro', 'l', 'L', 'continuo'),

  palavra('pato', 'pato', 'p', 'P', 'oclusiva'),
  palavra('pao', 'pão', 'p', 'P', 'oclusiva'),
  palavra('peixe', 'peixe', 'p', 'P', 'oclusiva'),
  palavra('banana', 'banana', 'b', 'B', 'oclusiva'),
  palavra('bola', 'bola', 'b', 'B', 'oclusiva'),
  palavra('bolo', 'bolo', 'b', 'B', 'oclusiva'),
  palavra('tartaruga', 'tartaruga', 't', 'T', 'oclusiva'),
  palavra('trem', 'trem', 't', 'T', 'oclusiva'),
];

export const SONS_INICIAIS = [...new Set(PALAVRAS_SOM.map(item => item.som))];
