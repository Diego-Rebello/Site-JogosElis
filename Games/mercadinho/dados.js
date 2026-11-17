/**
 * Catálogo do Mercadinho.
 * As marcas são citadas só pelo nome, para a brincadeira parecer uma compra de verdade.
 * Os preços são de brincadeira, inspirados na cesta básica do Procon-SP/Dieese de julho de 2026.
 * Os corações são o gosto da nossa família, não avaliação de qualidade.
 * Para trocar uma marca, um preço ou os corações, edite só este arquivo e rode `npm test`.
 */

function item(id, nome, emoji, secao, medida, quantidades, opcoes) {
  return {
    id,
    nome,
    emoji,
    secao,
    medida,
    quantidades,
    opcoes: opcoes.map(([rotulo, preco, coracoes], indice) => ({
      id: `${id}-${indice + 1}`,
      rotulo,
      preco,
      coracoes,
    })),
  };
}

export const produtos = [
  // Hortifrúti (11)
  item('banana', 'Banana', '🍌', 'hortifruti', '1 kg', [1], [
    ['Nanica', 599, 1],
    ['Prata', 799, 2],
    ['Orgânica', 1099, 3],
  ]),
  item('maca', 'Maçã', '🍎', 'hortifruti', '1 kg', [1], [
    ['Gala', 999, 2],
    ['Fuji', 1199, 3],
  ]),
  item('laranja', 'Laranja', '🍊', 'hortifruti', '1 kg', [1], [
    ['Pera', 499, 2],
    ['Lima', 699, 2],
    ['Baía', 799, 3],
  ]),
  item('tomate', 'Tomate', '🍅', 'hortifruti', '1 kg', [1], [
    ['Salada', 799, 1],
    ['Italiano', 949, 2],
    ['Orgânico', 1399, 3],
  ]),
  item('alface', 'Alface', '🥬', 'hortifruti', '1 unidade', [1], [
    ['Crespa', 349, 2],
    ['Americana', 499, 2],
    ['Hidropônica', 549, 3],
  ]),
  item('cenoura', 'Cenoura', '🥕', 'hortifruti', '1 kg', [1], [
    ['Comum', 599, 2],
    ['Orgânica', 999, 3],
  ]),
  item('batata', 'Batata', '🥔', 'hortifruti', '1 kg', [1], [
    ['Lavada', 819, 2],
    ['Asterix', 999, 3],
  ]),
  item('cebola', 'Cebola', '🧅', 'hortifruti', '1 kg', [1], [
    ['Branca', 789, 2],
    ['Roxa', 1099, 3],
  ]),
  item('mamao', 'Mamão', '🍈', 'hortifruti', '1 unidade', [1], [
    ['Papaia', 599, 2],
    ['Formosa', 899, 3],
  ]),
  item('uva', 'Uva', '🍇', 'hortifruti', 'bandeja 500 g', [1], [
    ['Niágara', 899, 2],
    ['Sem semente', 1199, 3],
  ]),
  item('morango', 'Morango', '🍓', 'hortifruti', 'bandeja', [1], [
    ['Comum', 999, 2],
    ['Orgânico', 1499, 3],
  ]),

  // Padaria e matinais (7)
  item('pao-de-forma', 'Pão de forma', '🍞', 'padaria', '500 g', [1], [
    ['Panco', 649, 1],
    ['Pullman', 799, 2],
    ['Wickbold', 949, 3],
  ]),
  item('bisnaguinha', 'Bisnaguinha', '🥐', 'padaria', 'pacote', [1], [
    ['Panco', 699, 2],
    ['Seven Boys', 749, 2],
    ['Pullman', 849, 3],
  ]),
  item('pao-de-hot-dog', 'Pão de hot-dog', '🥖', 'padaria', 'pacote', [1], [
    ['Panco', 629, 2],
    ['Pullman', 749, 3],
  ]),
  item('biscoito-recheado', 'Biscoito recheado', '🍪', 'padaria', 'pacote', [1, 2], [
    ['Passatempo', 329, 2],
    ['Trakinas', 379, 3],
    ['Oreo', 449, 3],
  ]),
  item('cream-cracker', 'Biscoito cream cracker', '🍘', 'padaria', '200 g', [1], [
    ['Marilan', 299, 1],
    ['Bauducco', 399, 2],
    ['Piraquê', 479, 3],
  ]),
  item('achocolatado', 'Achocolatado em pó', '🍫', 'padaria', 'pote', [1], [
    ['Toddy', 749, 2],
    ['Nescau', 849, 3],
    ['Ovomaltine', 1290, 3],
  ]),
  item('cafe', 'Café em pó', '☕', 'padaria', '250 g', [1], [
    ['Caboclo', 1149, 1],
    ['Pilão', 1299, 2],
    ['Melitta', 1399, 3],
  ]),

  // Laticínios e frios (8)
  item('leite', 'Leite', '🥛', 'laticinios', '1 litro', [1, 2, 3], [
    ['Italac', 529, 1],
    ['Piracanjuba', 589, 2],
    ['Ninho', 749, 3],
  ]),
  item('iogurte', 'Iogurte de morango', '🍶', 'laticinios', 'garrafinha', [2, 3, 4], [
    ['Batavo', 279, 1],
    ['Nestlé', 329, 2],
    ['Danone', 399, 3],
  ]),
  item('manteiga', 'Manteiga', '🧈', 'laticinios', '200 g', [1], [
    ['Italac', 1090, 1],
    ['Itambé', 1249, 2],
    ['Aviação', 1490, 3],
  ]),
  item('margarina', 'Margarina', '🍯', 'laticinios', '500 g', [1], [
    ['Primor', 549, 1],
    ['Delícia', 699, 2],
    ['Qualy', 849, 3],
  ]),
  item('queijo', 'Queijo muçarela fatiado', '🧀', 'laticinios', '150 g', [1], [
    ['Seara', 849, 1],
    ['Sadia', 979, 2],
    ['Tirolez', 1149, 3],
  ]),
  item('presunto', 'Presunto fatiado', '🥓', 'laticinios', '200 g', [1], [
    ['Seara', 649, 2],
    ['Perdigão', 729, 2],
    ['Sadia', 849, 3],
  ]),
  item('requeijao', 'Requeijão', '🥣', 'laticinios', 'copo 200 g', [1], [
    ['Itambé', 749, 1],
    ['Vigor', 849, 2],
    ['Catupiry', 1190, 3],
  ]),
  item('ovos', 'Ovos', '🥚', 'laticinios', 'dúzia', [1], [
    ['Brancos', 1079, 2],
    ['Vermelhos', 1249, 2],
    ['Caipiras', 1690, 3],
  ]),

  // Mercearia (11)
  item('arroz', 'Arroz', '🍚', 'mercearia', '1 kg', [1], [
    ['Camil', 549, 2],
    ['Prato Fino', 649, 2],
    ['Tio João', 749, 3],
  ]),
  item('feijao', 'Feijão carioca', '🍲', 'mercearia', '1 kg', [1], [
    ['Kicaldo', 799, 2],
    ['Camil', 899, 3],
    ['Broto Legal', 949, 3],
  ]),
  item('macarrao', 'Macarrão espaguete', '🍝', 'mercearia', '500 g', [1, 2], [
    ['Galo', 329, 1],
    ['Adria', 429, 2],
    ['Barilla', 699, 3],
  ]),
  item('molho-de-tomate', 'Molho de tomate', '🥫', 'mercearia', 'sachê 300 g', [1, 2], [
    ['Quero', 279, 1],
    ['Pomarola', 399, 2],
    ['Heinz', 549, 3],
  ]),
  item('oleo', 'Óleo de soja', '🌻', 'mercearia', '900 ml', [1], [
    ['Coamo', 699, 2],
    ['Soya', 739, 2],
    ['Liza', 789, 2],
  ]),
  item('acucar', 'Açúcar', '🧂', 'mercearia', '1 kg', [1], [
    ['Caravelas', 399, 2],
    ['Guarani', 429, 2],
    ['União', 499, 2],
  ]),
  item('farinha', 'Farinha de trigo', '🌾', 'mercearia', '1 kg', [1], [
    ['Sol', 419, 2],
    ['Renata', 499, 2],
    ['Dona Benta', 599, 3],
  ]),
  item('fermento', 'Fermento em pó', '🧁', 'mercearia', 'lata 100 g', [1], [
    ['Dona Benta', 379, 2],
    ['Royal', 449, 3],
  ]),
  item('leite-condensado', 'Leite condensado', '🍮', 'mercearia', 'caixinha 395 g', [1], [
    ['Italac', 549, 2],
    ['Piracanjuba', 599, 2],
    ['Moça', 799, 3],
  ]),
  item('queijo-ralado', 'Queijo ralado', '🧀', 'mercearia', 'pacote 50 g', [1], [
    ['Vigor', 699, 2],
    ['Faixa Azul', 999, 3],
  ]),
  item('milho', 'Milho verde', '🌽', 'mercearia', 'lata', [1], [
    ['Predilecta', 329, 2],
    ['Quero', 349, 2],
    ['Bonduelle', 549, 3],
  ]),

  // Açougue (3)
  item('frango', 'Filé de frango', '🍗', 'acougue', '1 kg', [1], [
    ['Seara', 1990, 2],
    ['Perdigão', 2190, 2],
    ['Sadia', 2490, 3],
  ]),
  item('carne-moida', 'Carne moída', '🥩', 'acougue', '500 g', [1], [
    ['Acém', 1699, 2],
    ['Patinho', 2399, 3],
  ]),
  item('salsicha', 'Salsicha', '🌭', 'acougue', '500 g', [1], [
    ['Seara', 699, 1],
    ['Perdigão', 799, 2],
    ['Sadia', 949, 3],
  ]),

  // Bebidas (4)
  item('suco', 'Suco de caixa', '🧃', 'bebidas', '1 litro', [1], [
    ['Maguary', 649, 1],
    ['Del Valle', 799, 2],
    ['Natural One', 1290, 3],
  ]),
  item('suco-caixinha', 'Suco de caixinha', '🧃', 'bebidas', '200 ml', [2, 3, 4], [
    ['Kapo', 229, 2],
    ['Maguary', 279, 2],
    ['Tial', 399, 3],
  ]),
  item('refrigerante', 'Refrigerante', '🥤', 'bebidas', '2 litros', [1], [
    ['Dolly', 549, 1],
    ['Guaraná Antarctica', 849, 3],
    ['Coca-Cola', 1099, 3],
  ]),
  item('agua', 'Água mineral', '💧', 'bebidas', '1,5 litro', [1, 2], [
    ['Crystal', 299, 2],
    ['Bonafont', 349, 2],
    ['Minalba', 379, 2],
  ]),

  // Limpeza e higiene (5)
  item('detergente', 'Detergente', '🧴', 'limpeza', '500 ml', [1], [
    ['Limpol', 229, 2],
    ['Minuano', 299, 2],
    ['Ypê', 349, 2],
  ]),
  item('sabao-em-po', 'Sabão em pó', '🧺', 'limpeza', '800 g', [1], [
    ['Tixan Ypê', 990, 1],
    ['Brilhante', 1290, 2],
    ['Omo', 1690, 3],
  ]),
  item('papel-higienico', 'Papel higiênico', '🧻', 'limpeza', '4 rolos', [1], [
    ['Mili', 549, 1],
    ['Personal', 699, 2],
    ['Neve', 949, 3],
  ]),
  item('creme-dental', 'Creme dental', '😁', 'limpeza', '90 g', [1], [
    ['Sorriso', 399, 1],
    ['Colgate', 549, 2],
    ['Oral-B', 699, 3],
  ]),
  item('sabonete', 'Sabonete', '🧼', 'limpeza', '1 unidade', [2, 3], [
    ['Lux', 229, 2],
    ['Protex', 329, 2],
    ['Dove', 449, 3],
  ]),
];

export const desejos = [
  { id: 'batom', nome: 'Chocolate Batom', marca: 'Garoto', emoji: '🍫', preco: 199, coracoes: 1 },
  { id: 'toddynho', nome: 'Toddynho', marca: 'Toddy', emoji: '🧃', preco: 249, coracoes: 1 },
  { id: 'trident', nome: 'Chiclete Trident', marca: 'Trident', emoji: '🍬', preco: 299, coracoes: 1 },
  { id: 'kitkat', nome: 'KitKat', marca: 'Nestlé', emoji: '🍫', preco: 399, coracoes: 1 },
  { id: 'mms', nome: "M&M's", marca: "M&M's", emoji: '🍬', preco: 449, coracoes: 1 },
  { id: 'picole', nome: 'Picolé Fruttare', marca: 'Kibon', emoji: '🍦', preco: 549, coracoes: 2 },
  { id: 'fini', nome: 'Balas de gelatina', marca: 'Fini', emoji: '🍬', preco: 649, coracoes: 2 },
  { id: 'lacta', nome: 'Chocolate ao leite', marca: 'Lacta', emoji: '🍫', preco: 699, coracoes: 2 },
  { id: 'bis', nome: 'Bis', marca: 'Lacta', emoji: '🍫', preco: 749, coracoes: 2 },
  { id: 'ruffles', nome: 'Batata Ruffles', marca: 'Elma Chips', emoji: '🍟', preco: 899, coracoes: 2 },
  { id: 'gibi', nome: 'Gibi da Turma da Mônica', marca: 'Panini', emoji: '📖', preco: 990, coracoes: 3 },
  { id: 'kinder-ovo', nome: 'Kinder Ovo', marca: 'Kinder', emoji: '🥚', preco: 999, coracoes: 2 },
];

export const temas = [
  {
    id: 'cafe-da-manha',
    titulo: 'Café da manhã',
    emoji: '☕',
    convite: 'Amanhã tem café da manhã caprichado!',
    fixas: 2,
    vagas: [
      ['pao-de-forma', 'bisnaguinha'],
      ['leite'],
      ['manteiga', 'margarina', 'requeijao'],
      ['cafe', 'achocolatado'],
      ['queijo', 'presunto'],
      ['banana', 'mamao', 'laranja'],
      ['suco', 'iogurte'],
      ['ovos'],
    ],
  },
  {
    id: 'lanche-da-escola',
    titulo: 'Lanche da escola',
    emoji: '🎒',
    convite: 'A lancheira da semana está vazia.',
    fixas: 2,
    vagas: [
      ['pao-de-forma', 'bisnaguinha'],
      ['suco-caixinha'],
      ['queijo', 'presunto', 'requeijao'],
      ['maca', 'banana', 'uva'],
      ['biscoito-recheado', 'cream-cracker'],
      ['iogurte'],
      ['agua'],
    ],
  },
  {
    id: 'macarronada',
    titulo: 'Macarronada de domingo',
    emoji: '🍝',
    convite: 'Domingo é dia de macarronada com a família.',
    fixas: 2,
    vagas: [
      ['macarrao'],
      ['molho-de-tomate'],
      ['carne-moida', 'frango', 'salsicha'],
      ['queijo-ralado'],
      ['tomate', 'cebola'],
      ['alface', 'cenoura'],
      ['suco', 'refrigerante'],
      ['oleo'],
    ],
  },
  {
    id: 'almoco',
    titulo: 'Almoço de todo dia',
    emoji: '🍚',
    convite: 'Acabou a comida do dia a dia em casa.',
    fixas: 2,
    vagas: [
      ['arroz'],
      ['feijao'],
      ['frango', 'carne-moida', 'ovos'],
      ['oleo'],
      ['tomate', 'alface', 'cenoura'],
      ['batata', 'cebola'],
      ['suco', 'agua'],
    ],
  },
  {
    id: 'bolo',
    titulo: 'Bolo de aniversário',
    emoji: '🎂',
    convite: 'Vai ter bolo de aniversário feito em casa!',
    fixas: 3,
    vagas: [
      ['farinha'],
      ['ovos'],
      ['fermento'],
      ['acucar'],
      ['leite'],
      ['manteiga', 'margarina'],
      ['achocolatado', 'leite-condensado'],
      ['refrigerante', 'suco'],
    ],
  },
  {
    id: 'cachorro-quente',
    titulo: 'Noite do cachorro-quente',
    emoji: '🌭',
    convite: 'Hoje é noite do cachorro-quente.',
    fixas: 2,
    vagas: [
      ['pao-de-hot-dog'],
      ['salsicha'],
      ['molho-de-tomate'],
      ['milho'],
      ['queijo-ralado', 'requeijao'],
      ['refrigerante', 'suco'],
      ['tomate', 'cebola', 'batata'],
    ],
  },
  {
    id: 'salada-de-frutas',
    titulo: 'Salada de frutas',
    emoji: '🍓',
    convite: 'A sobremesa vai ser salada de frutas.',
    fixas: 2,
    vagas: [
      ['banana'],
      ['maca'],
      ['laranja'],
      ['mamao'],
      ['uva', 'morango'],
      ['leite-condensado', 'iogurte'],
      ['suco'],
    ],
  },
  {
    id: 'compras-do-mes',
    titulo: 'Compras da casa',
    emoji: '🧺',
    convite: 'Chegou o dia das compras da casa.',
    fixas: 2,
    vagas: [
      ['papel-higienico'],
      ['sabao-em-po'],
      ['arroz'],
      ['feijao'],
      ['detergente'],
      ['creme-dental'],
      ['sabonete'],
      ['cafe'],
      ['oleo', 'acucar'],
    ],
  },
  {
    id: 'piquenique',
    titulo: 'Piquenique no parque',
    emoji: '🌳',
    convite: 'Sábado tem piquenique no parque.',
    fixas: 2,
    vagas: [
      ['pao-de-forma', 'bisnaguinha'],
      ['suco', 'suco-caixinha'],
      ['queijo', 'presunto'],
      ['uva', 'morango', 'maca'],
      ['biscoito-recheado', 'cream-cracker'],
      ['agua'],
      ['iogurte'],
    ],
  },
  {
    id: 'cafe-da-tarde',
    titulo: 'Café da tarde com a vovó',
    emoji: '🫖',
    convite: 'A vovó vem para o café da tarde.',
    fixas: 2,
    vagas: [
      ['cafe', 'achocolatado'],
      ['leite'],
      ['cream-cracker', 'biscoito-recheado'],
      ['requeijao', 'manteiga'],
      ['queijo'],
      ['bisnaguinha', 'pao-de-forma'],
      ['mamao', 'banana'],
      ['acucar'],
    ],
  },
];

export const sonhos = [
  { id: 'caderno', nome: 'Caderno de desenho', emoji: '📓', preco: 1500 },
  { id: 'canetinhas', nome: 'Jogo de canetinhas', emoji: '🖍️', preco: 2500 },
  { id: 'bola', nome: 'Bola de vôlei', emoji: '🏐', preco: 4000 },
  { id: 'pelucia', nome: 'Bichinho de pelúcia', emoji: '🧸', preco: 6000 },
  { id: 'livros', nome: 'Coleção de livros', emoji: '📚', preco: 8000 },
  { id: 'patins', nome: 'Patins', emoji: '🛼', preco: 10000 },
];
