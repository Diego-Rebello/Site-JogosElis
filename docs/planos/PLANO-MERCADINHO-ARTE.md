# Plano de Arte v2 — Mercadinho (J15)

> Refação visual do Mercadinho. O jogo funciona (regras, lista, caixa, testes), mas a loja ficou
> ilegível: não dá para saber o que há em cada prateleira e o conjunto tem cara de improviso.
> Este plano troca **como a loja é desenhada**, sem mexer nas regras do jogo.
>
> Criado em 2026-11-14, depois de rodar o jogo em 360 × 640, 390 × 844 e 1280 × 800 e medir a
> tela. Complementa o `docs/planos/PLANO-MERCADINHO.md`: a seção 3 diz o que deste plano vale no
> lugar do que está lá.
>
> **Documento de execução para o modelo executor (Claude Opus ou Sonnet, com leitura de
> imagem).** As decisões de aparência estão fechadas numa página de referência que já existe e
> já foi conferida: `docs/planos/mercadinho-arte/referencia.html`. O executor **copia** dali
> medidas, cores, moldes e CSS. Não redesenha, não "melhora" e não troca o estilo. Diante de
> dúvida, para no fim da etapa e pergunta ao Diego.

---

## Resumo para o Diego

**Por que ficou ruim.** O problema não era resolução, era **tamanho**. Cada prateleira ocupa
48 px na tela do celular e dentro dela foram desenhadas 12 embalagens de uns 10 px cada, todas
parecidas, mais um emoji de 10 px num selinho para dizer o que é. Subir a resolução para "8×"
deixou esses 10 px nítidos, mas continuam 10 px. Além disso, o desenho inteiro (2.900 linhas)
foi feito por um modelo de linguagem escrevendo coordenadas sem enxergar o resultado, e o
painel da compra toma quase metade da tela do celular antes de o mapa começar.

**O que muda.**

| | Hoje | Depois |
|---|---|---|
| O que se vê numa prateleira | 12 caixinhas de ~10 px + emoji de ~10 px | **Uma figura de 33 a 46 px**, a mesma em todo aparelho |
| De onde vem o desenho | Coordenadas em canvas escritas por IA | Ícones profissionais de um conjunto só (Fluent Emoji) + 10 moldes de embalagem já prontos |
| Como saber o que é | Adivinhar pelo selinho | Figura grande no mapa; **nome escrito** na gôndola e no painel |
| Marcas | Bandeja genérica igual para todas | Embalagem com a cor e o **nome da marca**, lado a lado na prateleira, com etiqueta de preço |
| Emoji | Do sistema: muda por aparelho, alguns errados (mamão era melão 🍈, açúcar era sal 🧂) | Mesmo desenho em qualquer aparelho, vetorial, nítido em qualquer tamanho |
| Espaço do mapa (celular 390 × 844) | 342 × 384 px, começa no meio da tela | Pelo menos 460 px de altura (uns 600 na referência), sem rolar a página |
| Personagem | Boneca com 3 vistas de estilos diferentes | Peão redondo com rosto e carrinho, com contador de itens |

**Veja antes de decidir** (5 minutos). Com `npm run dev` rodando, abra
`http://localhost:5173/docs/planos/mercadinho-arte/referencia.html`. Ou abra direto as imagens
da pasta `docs/planos/mercadinho-arte/`:

- `antes-mapa-celular.png`, `antes-painel-produto.png`, `antes-computador.png`: o jogo hoje.
- `depois-celular.png`: as três telas novas (loja, gôndola de frente, painel das marcas).
- `depois-mapa-computador.png`: a loja inteira no computador.
- `depois-embalagens.png` e `depois-catalogo.png`: os moldes e os 61 itens.

A referência é uma página estática para mostrar a aparência, não é o jogo. O trabalho das
etapas é levar essa aparência para o jogo.

**Decisões suas (Etapa A0).** Adotei um padrão em cada uma; se não disser nada, vale o padrão.

| # | Decisão | Padrão que adotei | Alternativa |
|---|---|---|---|
| D1 | Conjunto de ícones | **Fluent Emoji "Color"**, da Microsoft, licença **MIT** (uso livre com crédito). O plano antigo exigia CC0; a área do Rael já usa OpenMoji, que também pede crédito. | Variante "Flat" do mesmo conjunto: mais simples e 6 vezes mais leve (mesmos nomes de arquivo). |
| D2 | Personagem | **Peão**: rosto de menina num disco, com carrinho e contador. Não tenta imitar uma boneca andando. | Escolher outro tom de pele do mesmo ícone (o conjunto tem variantes). Diga qual. |
| D3 | Mamão | Não existe emoji de mamão. Fiz um **desenho próprio** (`icones/mamao.svg`), visível no catálogo. | Trocar o produto por melão ou manga, que têm ícone pronto (muda `dados.js`). |
| D4 | Nome da marca escrito na embalagem | **Sim**, só no painel do produto e no carrinho, na fonte do jogo. Continua sem logotipo e sem copiar embalagem. | Não escrever na embalagem (o nome continua embaixo, na etiqueta). É uma opção de uma linha. |
| D5 | Onde trabalhar | Branch nova `j15-mercadinho-arte` a partir de `main`, sem merge até você aprovar as capturas. | — |

**Atenção:** o Mercadinho já está em `main` (commit `0a14dbf`), então a versão atual está no ar
em `/Games/mercadinho/`, só sem cartão na página inicial. Nada deste plano vai ao ar antes do
merge.

**Esforço.** Cinco etapas de código (A1 a A5), uma por sessão. O ganho maior aparece na A2
(painel das marcas e gôndola) e na A3 (mapa). Você aprova capturas no fim da A2 e da A4.

**Atualização de 2026-11-14 (noite).** As etapas A1 a A5 foram executadas (pelo Gemini). A
revisão por captura aprovou o mapa e o painel das marcas, mas achou acabamentos ruins em volta
deles: a loja não cabe na tela do notebook, tábuas tortas na gôndola, cabeçalho da lista rápida
sem a cor da seção, botões de baixo quebrando linha e três ícones errados. Isso virou a
**Etapa A6**, que é a próxima a executar. Ela traz uma decisão nova, a **D6**, com padrão já
adotado.

---

## 1. Diagnóstico

Medido em 2026-11-14 com o jogo de `main@0a14dbf` (capturas em `docs/planos/mercadinho-arte/antes-*.png`).

| # | O que se vê | Causa | Onde está |
|---|---|---|---|
| 1 | Não dá para entender a prateleira | Cada casa (48 px no celular, 80 px no computador) recebe 12 embalagens de 3,05 a 3,45 unidades lógicas: ~10 px no celular. O formato e a cor quase não variam. | `arte.js`, `desenharFileirasEmbalagens` e `desenharProduto` |
| 2 | Ícone minúsculo | A identificação é um emoji com fonte de 3,25 unidades (~10 px) dentro de um selo de 4,3 unidades (~13 px). | `arte.js`, `desenharSeloCantinho` |
| 3 | "Resolução baixa" | O commit `ba255ee` subiu a camada do mapa para até 8×. Isso dá nitidez, não tamanho: um desenho de 10 px continua com 10 px. | `renderizador.js`, `ESCALA_MAPA_MAXIMA` |
| 4 | Ícones errados ou diferentes por aparelho | São emoji do sistema (Apple, Android e Windows desenham diferente) e faltam emoji para vários produtos: mamão 🍈, açúcar 🧂, margarina 🍯, creme dental 😁, óleo 🌻, requeijão 🥣, feijão 🍲. | `dados.js`, campo `emoji` |
| 5 | Cara de improviso | Três estilos misturados: vetor chapado por código, emoji fotorrealista do sistema e uma personagem com três vistas que não combinam (de costas vira um bloco rosa). | `arte.js`, `desenharPersonagem*` |
| 6 | Mapa pequeno e vazio | Em 390 × 844 o cabeçalho, o painel da compra e os botões ocupam ~360 px antes do mapa; o mapa fica com 342 × 384 px e mais da metade dele é piso bege. No computador aparecem só 6 fileiras. | `index.html`, `mercadinho.css`, `renderizador.js` (`ajustarTamanho`) |
| 7 | Marcas indistinguíveis | No painel, todas as opções usam o mesmo molde de 52 px com um emoji de ~15 px; só muda um tom de cor. | `arte.js`, `criarIcone`; `tela.js`, `abrirPrateleiraProduto` |
| 8 | Placas no meio do chão | As placas de seção flutuam no piso e a personagem passa por cima do texto. | `renderizador.js`, `PLACAS_SECAO` |
| 9 | Peso morto | Três folhas da Kenney (66 kB) foram baixadas e nunca aparecem no jogo; só a página de prova as usa. | `public/figuras/mercadinho/*.png` |

**Causa de fundo.** O plano original pedia pixel art de pacotes prontos e um portão de arte. O
executor trocou por desenho em canvas por coordenadas, que um modelo de linguagem não consegue
avaliar enquanto escreve, e cada rodada de "melhoria" somou detalhe que não aparece na tela.
Nenhuma etapa exigia medir o tamanho real das coisas na tela.

---

## 2. Direção de arte v2

Seis regras. Qualquer mudança que contrarie uma delas reprova a etapa.

1. **Uma figura grande por prateleira.** Cada casa mostra um único produto, com 60% a 75% da
   largura da casa. Nada de fileiras de miniaturas.
2. **Nada desenhado por coordenada.** Toda imagem vem de um arquivo SVG do conjunto escolhido
   ou de um dos 10 moldes de embalagem da referência. É proibido usar `<canvas>`, `fillText`
   com emoji ou novos caminhos SVG "feitos à mão" no jogo.
3. **HTML e CSS no lugar de canvas.** Móveis, piso, placas, peão e painéis são elementos com
   CSS. O navegador cuida da nitidez em qualquer tela.
4. **O nome está sempre escrito.** Onde a figura sozinha pode gerar dúvida (gôndola, painel,
   carrinho), o nome do produto aparece em texto de pelo menos 14 px.
5. **Dois níveis de aproximação.** O mapa responde "onde fica". A gôndola de frente e o painel
   do produto respondem "o que é, de que marca e quanto custa".
6. **Tela de jogo, não formulário.** Na loja, o mapa é o maior elemento da tela e a página não
   rola.

**Tamanhos mínimos na tela** (em px de CSS; valem para 360 × 640 em diante):

| Elemento | Mínimo |
|---|---|
| Casa do mapa | 48 |
| Figura na prateleira do mapa | 32 de largura (embalagem) ou 34 (item solto) |
| Figura na gôndola de frente | 76 |
| Figura no painel do produto | 100 |
| Nome do produto (gôndola) e da marca (painel) | 14 |
| Preço | 20 |
| Coração | 22 |
| Alvo de toque | 44 |
| Texto de placa de seção | 14, com contraste de 4,5:1 |

---

## 3. O que este plano substitui no `PLANO-MERCADINHO.md`

| Lá | Situação |
|---|---|
| 1.1 Pixel art com licença livre | **Substituída** pela seção 4.2 daqui (Fluent Emoji, MIT). |
| 2.5, parágrafos "Visão" e "Tamanho na tela" | **Substituídos** pela seção 4.5. O mapa de 24 × 16, a matriz, a câmera, o andar e o "Achar os produtos" **continuam valendo**. |
| 2.6 A prateleira e 2.7 Painel fixo | Conteúdo e regras **continuam**. Só a aparência muda (seções 4.6 a 4.8). |
| 4.1, linhas de `arte.js`, `renderizador.js`, `arte-prova.html` e `public/figuras/mercadinho/` | **Substituídas** pela seção 4.1. |
| 4.2, guardas "Arte só com licença CC0" e "Nenhum logotipo…" | CC0 **ou MIT** com crédito em `LICENCA.txt`. A regra de marcas continua: nome só em texto, sem logotipo, sem copiar embalagem. |
| 4.7 Arte e desenho | **Substituída** inteira pelas seções 4.3 a 4.5. |
| Etapa 4, critérios "pixels nítidos, `pixelated`" e "≤ 400 kB" | **Substituídos** pelos critérios das etapas A1 a A5 e pelo orçamento da seção 4.11. |
| Etapas 5, 6 e 7 | **Continuam**, depois deste plano. A tela e os textos novos das etapas 5 e 6 seguem a aparência daqui. |
| Todo o resto (regras, dados, gerador, caixa, estrelas, protocolo) | **Continua valendo sem mudança.** |

---

## 4. Especificação

A fonte de verdade da aparência é `docs/planos/mercadinho-arte/referencia.html`. Onde este
texto e a referência divergirem em medida ou cor, **vale a referência**. Onde divergirem em
comportamento, vale este texto.

### 4.1 Arquivos

**Criar**

```
Games/mercadinho/figuras.js              Catálogo visual (puro) + criarFigura + criarIconeUi
public/figuras/mercadinho/icones/*.svg   Os 67 ícones usados (lista na seção 4.2)
tests/mercadinho-figuras.test.js         Catálogo visual, moldes, arquivos de ícone
```

**Reescrever**

```
Games/mercadinho/renderizador.js    Mapa em HTML/CSS com o mesmo contrato de hoje (4.5)
Games/mercadinho/arte-prova.html    Folha de prova feita com figuras.js de verdade (4.3)
public/figuras/mercadinho/LICENCA.txt
```

**Editar**

| Arquivo | Mudança |
|---|---|
| `Games/mercadinho/index.html` | Painel da compra compacto, `<div id="mapa-janela">` no lugar do `<canvas>`, barra de baixo, painel da gôndola |
| `Games/mercadinho/mercadinho.css` | Fichas (variáveis `--m-*`), mapa, figuras, gôndola, painel do produto |
| `Games/mercadinho/tela.js` | Usar `criarFigura` e `criarIconeUi`; gôndola; referências a `mapa-canvas` |
| `tests/mercadinho-mapa.test.js` | Remover o bloco "arte, moldes e cores por marca (Etapa 4)", que testa a arte antiga |
| `README.md` | Créditos (Fluent Emoji, MIT) e árvore de pastas |
| `MELHORIAS.md` | Entrada J15: citar este plano |
| `docs/planos/PLANO-MERCADINHO.md` | Já tem o aviso no topo apontando para cá; não mexer no resto |

**Apagar (só na Etapa A3)**

```
Games/mercadinho/arte.js
public/figuras/mercadinho/kenney-cidade.png
public/figuras/mercadinho/kenney-interiores.png
public/figuras/mercadinho/kenney-urbano.png
```

**Não mexer:** `dados.js`, `jogo.js`, `mapa.js`, `tests/mercadinho.test.js` e qualquer arquivo
fora desta lista. O campo `emoji` de `dados.js` fica (os testes o usam); ele só deixa de ser
mostrado na tela.

### 4.2 Ícones

Origem: Fluent Emoji, variante "Color", Microsoft, licença MIT. Os arquivos já estão baixados,
renomeados em português e conferidos em `docs/planos/mercadinho-arte/icones/` (76 arquivos, com
a origem de cada um em `docs/planos/mercadinho-arte/LICENCA.txt`).

Copiar para `public/figuras/mercadinho/icones/` **só os 67 usados**, sem editar:

- **Produtos (46):** `banana maca laranja tomate alface cenoura batata cebola mamao uva morango
  pao-de-forma baguete cachorro-quente biscoito waffle barra-de-chocolate cafe copo-de-leite
  manteiga queijo pernil ovo arroz feijao espaguete girassol colher trigo cupcake pudim milho
  coxa-de-frango carne suco-caixinha copo-com-canudo gota esponja camiseta papel-higienico
  escova-de-dentes sabonete bala sorvete pirulito livro`
- **Seção (1 a mais):** `bolhas`
- **Interface (15):** `saco-de-dinheiro coracao coracao-vazio lista carrinho olhos cupom menina
  alfinete estrela moeda lixeira confirmado sacolas mercado`
- **Temas das missões (5 a mais):** `mochila bolo cesto arvore bule`

Os outros 9 da pasta de referência (`melao manga croissant bacon lata frasco dente casquinha
batata-frita`) são reserva para trocas pedidas pelo Diego; não vão para `public/`.

`mamao.svg` é desenho próprio (decisão D3). Se o Diego escolher a variante "Flat" (D1), baixar
os mesmos nomes trocando `Color/…_color.svg` por `Flat/…_flat.svg` no endereço que está em
`LICENCA.txt`.

`public/figuras/mercadinho/LICENCA.txt` novo: copiar o de `docs/planos/mercadinho-arte/`,
tirando as linhas dos arquivos que não foram copiados e trocando o caminho do título.

### 4.3 A figura do produto (`figuras.js`)

Um único componente desenha qualquer produto em qualquer tamanho. É isto que garante que o
mapa, a gôndola, o painel e o carrinho mostrem a mesma coisa.

```js
// Dados puros: importáveis no Node, sem tocar em document.
export const SECOES_VISUAIS;      // seção → { cor, icone, movel }          (4.4)
export const FIGURA_DO_PRODUTO;   // id → [molde, icone]                     (tabela abaixo)
export const MOLDES;              // molde → { svg(c), rotulo, marca, ... }  (copiar da referência)
export const ICONE_DO_TEMA;       // id do tema → ícone                      (tabela abaixo)
export const ICONES_DA_INTERFACE; // os 15 nomes da seção 4.2, para o teste de arquivos
export const CORES_DA_MARCA;      // mover de arte.js, sem mudar valores
export function coresDaMarca(marca, indiceOpcao);   // mover de arte.js, igual
export function urlDoIcone(nome);                   // .../figuras/mercadinho/icones/<nome>.svg

// Só no navegador.
export function criarFigura(itemId, opcaoId, largura, { marca = false } = {});  // → HTMLElement
export function criarIconeUi(nome, tamanho);                                    // → <img alt="">
```

Regras de `criarFigura`:

- `itemId` é id de produto ou de guloseima. `opcaoId` nulo usa a primeira opção (para a cor).
- **Molde `solto`:** só o ícone, quadrado, com `largura` px. Com `marca: true` e item com
  opções, o ícone ganha embaixo uma plaquinha com o nome da opção ("Nanica", "Prata").
- **Demais moldes:** caixa de `largura` × `1,2 × largura`. SVG do molde por baixo, janela
  branca com o ícone, e o nome da marca na faixa indicada pelo molde.
- **`marca: true` só no painel do produto e no carrinho.** No mapa e na gôndola é `false`: a
  janela do ícone cresce e ocupa também a faixa da marca (campo `rotuloSemMarca` ou a união
  calculada na referência).
- O nome da marca usa a fonte do jogo, cabe na faixa por redução de tamanho (fórmula da
  referência) e some se ficar abaixo de 6,5 px. Cor do texto: branco sobre cor escura, escuro
  sobre cor clara (função `clara` da referência).
- Imagens são decorativas: `alt=""` e `aria-hidden="true"`. O nome vai sempre em texto ao lado.
- **Reserva:** se um SVG não carregar (`error`), trocar a imagem por um `<span>` com o `emoji`
  do item em `dados.js`. O jogo nunca mostra imagem quebrada.
- Copiar de `referencia.html`, **sem redesenhar**: o objeto `MOLDES` (10 moldes), as funções
  `misturar` e `clara`, e a função `figura` (que vira `criarFigura` criando elementos em vez de
  texto HTML).

Tabela produto → molde e ícone (é o objeto `FIGURA` da referência; copiar de lá):

```js
export const FIGURA_DO_PRODUTO = {
  // Hortifrúti
  banana: ['solto', 'banana'], maca: ['solto', 'maca'], laranja: ['solto', 'laranja'],
  tomate: ['solto', 'tomate'], alface: ['solto', 'alface'], cenoura: ['solto', 'cenoura'],
  batata: ['solto', 'batata'], cebola: ['solto', 'cebola'], mamao: ['solto', 'mamao'],
  uva: ['solto', 'uva'], morango: ['solto', 'morango'],
  // Padaria e matinais
  'pao-de-forma': ['pacote', 'pao-de-forma'], bisnaguinha: ['pacote', 'baguete'],
  'pao-de-hot-dog': ['pacote', 'cachorro-quente'], 'biscoito-recheado': ['saquinho', 'biscoito'],
  'cream-cracker': ['caixa-papelao', 'waffle'], achocolatado: ['pote', 'barra-de-chocolate'],
  cafe: ['pacote', 'cafe'],
  // Laticínios e frios
  leite: ['caixa', 'copo-de-leite'], iogurte: ['garrafa', 'morango'],
  manteiga: ['caixa-papelao', 'manteiga'], margarina: ['pote', 'manteiga'],
  queijo: ['bandeja', 'queijo'], presunto: ['bandeja', 'pernil'],
  requeijao: ['pote', 'queijo'], ovos: ['bandeja', 'ovo'],
  // Mercearia
  arroz: ['pacote', 'arroz'], feijao: ['pacote', 'feijao'], macarrao: ['pacote', 'espaguete'],
  'molho-de-tomate': ['saquinho', 'tomate'], oleo: ['garrafa', 'girassol'],
  acucar: ['pacote', 'colher'], farinha: ['pacote', 'trigo'], fermento: ['lata', 'cupcake'],
  'leite-condensado': ['caixa', 'pudim'], 'queijo-ralado': ['saquinho', 'queijo'],
  milho: ['lata', 'milho'],
  // Açougue
  frango: ['bandeja', 'coxa-de-frango'], 'carne-moida': ['bandeja', 'carne'],
  salsicha: ['bandeja', 'cachorro-quente'],
  // Bebidas
  suco: ['caixa', 'laranja'], 'suco-caixinha': ['solto', 'suco-caixinha'],
  refrigerante: ['garrafa', 'copo-com-canudo'], agua: ['garrafa', 'gota'],
  // Limpeza e higiene
  detergente: ['frasco', 'esponja'], 'sabao-em-po': ['caixa-papelao', 'camiseta'],
  'papel-higienico': ['solto', 'papel-higienico'],
  'creme-dental': ['caixa-papelao', 'escova-de-dentes'], sabonete: ['solto', 'sabonete'],
  // Guloseimas
  // A6: toddynho, kitkat e ruffles trocaram de ícone (antes: chocolate, chocolate e batata crua)
  batom: ['barra', 'barra-de-chocolate'], toddynho: ['caixa', 'copo-de-leite'],
  trident: ['barra', 'bala'], kitkat: ['barra', 'waffle'], mms: ['saquinho', 'bala'],
  picole: ['solto', 'sorvete'], fini: ['saquinho', 'pirulito'],
  lacta: ['barra', 'barra-de-chocolate'], bis: ['caixa-papelao', 'barra-de-chocolate'],
  ruffles: ['saquinho', 'batata-frita'], gibi: ['solto', 'livro'], 'kinder-ovo': ['saquinho', 'ovo'],
};
```

Ícone de cada tema de missão (`ICONE_DO_TEMA`), no lugar do emoji do título:

| Tema | Ícone | Tema | Ícone |
|---|---|---|---|
| `cafe-da-manha` | `cafe` | `cachorro-quente` | `cachorro-quente` |
| `lanche-da-escola` | `mochila` | `salada-de-frutas` | `morango` |
| `macarronada` | `espaguete` | `compras-do-mes` | `cesto` |
| `almoco` | `arroz` | `piquenique` | `arvore` |
| `bolo` | `bolo` | `cafe-da-tarde` | `bule` |

O nome do molde de leite passa de `caixa-longa-vida` para `caixa`. Os 10 moldes: `caixa`,
`pacote`, `lata`, `garrafa`, `pote`, `caixa-papelao`, `bandeja`, `frasco`, `barra`, `saquinho`,
mais o `solto` (sem molde).

**`arte-prova.html` novo.** Página de desenvolvimento, fora do build, que importa `figuras.js`
e mostra: os 61 itens em 34 px, 78 px e 104 px (com e sem marca), todas as opções de cada
produto lado a lado, e os 67 ícones com o nome do arquivo. É a prova de que o jogo usa o
componente, e é onde o Diego confere marcas e cores.

### 4.4 Seções

| Letra | Seção | Ícone | Cor da seção | Móvel |
|---|---|---|---|---|
| `H` | Hortifrúti | `maca` | `#247a45` | `banca` |
| `P` | Padaria | `pao-de-forma` | `#a05a1f` | `gondola` |
| `L` | Laticínios | `copo-de-leite` | `#256fa8` | `geladeira` |
| `M` | Mercearia | `arroz` | `#b4530f` | `gondola` |
| `A` | Açougue | `carne` | `#c5303a` | `balcao` |
| `B` | Bebidas | `copo-com-canudo` | `#0e7c90` | `geladeira` |
| `Z` | Limpeza | `bolhas` | `#7856c2` | `gondola` |
| `G` | Guloseimas | `pirulito` | `#c92f6f` | `gondola` |

Todas as cores dão pelo menos 4,8:1 com texto branco (conferido). Da cor da seção saem duas
derivadas, calculadas com `misturar`: `--sec-escura` (18% de preto, bordas e tábua) e
`--sec-fundo` (86% de branco, fundo do nicho). Os nomes completos da lista rápida ("Padaria e
matinais", "Laticínios e frios", "Limpeza e higiene") continuam vindo de `mapa.js`; a placa do
mapa usa o nome curto desta tabela.

### 4.5 O mapa em HTML e CSS (`renderizador.js`)

**Contrato igual ao de hoje**, para `tela.js` mudar o mínimo:

```js
criarRenderizador(janela)   // janela = <div id="mapa-janela">; devolve null se não existir
→ { ajustarTamanho(), desenhar(estado), eventoParaCasa(evento), obterMetricas() }
```

`estado` tem os mesmos campos que `desenharMapa()` de `tela.js` já envia: `posX`, `posY` (em
casas, com fração durante o passo), `direcao`, `quadro`, `fasePasso`, `itensNoCarrinho`,
`destinoCaminhada`, `destaqueCasa` e `baloesNivel1`.

**Montagem (uma vez só).** Dentro da janela, um `<div class="mapa">` de 24 × 16 casas com:

- Piso: só fundo em CSS (cor e linhas de 2 px no tamanho da casa). Nenhum elemento por casa de piso.
- Paredes: um elemento por casa `#`, com a classe do lado (`topo`, `lado`, `fundo`, `porta`).
- **Nicho:** um elemento por casa de produto ou guloseima, com a figura (`criarFigura(id, null,
  larguraDaFigura)`), a tábua com a etiqueta amarela (pseudo-elemento) e as bordas só do lado
  de fora do móvel (classes `b-cima`, `b-baixo`, `b-esq`, `b-dir`, calculadas pelos vizinhos da
  mesma letra). Largura da figura: `0,72 × casa` para `solto`, `0,68 × casa` para os demais.
- Caixas: bloco cinza com o ícone `cupom` e a etiqueta "Caixa 1", "Caixa 2", "Caixa 3".
- **Placa:** uma por bloco contíguo de casas da mesma letra, presa ao topo do bloco e centrada
  nele, com o ícone e o nome curto da seção. Móveis encostados na parede do fundo (linha 1)
  têm a placa sobre a parede. `pointer-events: none`.
- Tapete na entrada, marcador de destino (círculo tracejado) e o **peão**.

Copiar da referência o CSS de `.mapa`, `.casa`, `.parede*`, `.nicho*`, `.caixa-reg`, `.placa`,
`.peao*`, `.destino`, `.pino` e `.tapete`, e a lógica de `montarMapa` (bordas, blocos e placas).

**Tamanho da casa** (`ajustarTamanho`), com `L = janela.clientWidth`:

```
casa = L >= 1152 ? min(64, floor(L / 24))        // a loja inteira cabe na largura
                 : clamp(floor(L / 7), 48, 64)   // celular e tablet: 7 casas de largura
```

A altura vem do CSS (seção 4.6); o renderizador só lê `janela.clientHeight`. A variável
`--casa` no elemento `.mapa` leva o valor em px.

**A cada `desenhar(estado)`** (roda a cada quadro enquanto ela anda):

- Câmera: centrada no peão e presa aos limites da loja; se a loja for menor que a janela num
  eixo, fica centrada nele. Aplicar em `.mapa` com `transform: translate3d(...)`, arredondado
  para o pixel do aparelho.
- Peão: `transform: translate3d(posX × casa, posY × casa, 0)`. Um "pulinho" de até 4 px sai de
  `|sen(fasePasso)|`. O selo do carrinho vai para o lado para onde ela anda (`direcao`
  esquerda ou direita). O contador mostra `itensNoCarrinho` e some em zero.
- `baloesNivel1`: classe `nicho--na-lista` e um `.pino` com "!" nas casas indicadas.
- `destaqueCasa`: classe de destaque no nicho ou caixa à frente dela.
- `destinoCaminhada`: posição do marcador de destino.
- **Não criar nem remover elementos por quadro.** Guardar o último valor aplicado e só tocar
  no DOM quando mudar. Por quadro, no máximo dois `transform`.
- Atualizar `janela.dataset`: `casaPx`, `camX`, `camY` (px de CSS), `posX`, `posY`, `direcao`.
  O script de captura usa esses valores.

**Ordem de empilhamento:** piso < paredes e nichos < marcador de destino < placas < pino "!" <
peão. O peão passa na frente das placas.

**`eventoParaCasa(evento)`:** posição do toque relativa à janela, mais a câmera, dividida pela
casa. Mesma resposta de hoje (`{ x, y }` ou `null`).

**Teclado e leitor de tela:** como hoje. A janela é o elemento focável (`tabindex="0"`,
`aria-label` atual), as setas andam, e o botão "Ver: Leite" continua sendo o caminho para quem
não toca no mapa. Os nichos são decorativos para o leitor de tela (`aria-hidden`).

**Movimento reduzido:** sem "pulinho" e sem transição de câmera. O resto já é tratado em
`tela.js`.

### 4.6 A tela da loja

Alvo: tela A de `depois-celular.png`.

- A fase `loja`, no modo "andar pelo mercado", ocupa a altura visível (`100dvh` menos o
  cabeçalho do site) em três faixas: painel da compra, mapa (ocupa o que sobrar) e barra de
  baixo. **A página não rola.** No modo "lista rápida" a página rola normalmente.
- **Painel da compra compacto**, com os mesmos `id` de hoje:

  | Linha | Conteúdo |
  |---|---|
  | 1 | `loja-dinheiro` ("Você tem" pequeno + valor) · `loja-coracoes` ("4 de 13") · `btn-sair-loja` como botão pequeno "Sair" (o `aria-label` continua "Trocar nível") |
  | 2 | `btn-abrir-lista` ("Lista 1 de 5") · `btn-abrir-carrinho` ("Carrinho 2") · `btn-espiar` ("Espiar 2", só no nível 2; sem ele, duas colunas) |
  | 3, só no nível 1 | `barra-nivel1`: texto do total e a barra, numa linha de até 32 px |

  Cada ficha tem 44 px de altura, ícone de 22 px (`criarIconeUi`) e texto de 16 px. O texto
  completo de hoje vai para o `aria-label`.
- `espiada-aviso` vira um aviso flutuante no topo do mapa, sem empurrar nada.
- `loja-secao-atual` ("Você está em: …") fica só para leitor de tela no modo mapa (as placas já
  mostram onde ela está) e continua visível como título no modo lista rápida.
- `btn-alternar-modo-loja` vira um selo no canto de baixo, à direita, sobre o mapa.
- **Barra de baixo:** `btn-interagir-mapa` ("Ver: Leite") à esquerda e `btn-ir-caixa` à
  direita. Sem prateleira vizinha, o lugar do primeiro mostra o texto "Toque numa prateleira".

Medidas a cumprir: painel da compra com no máximo 104 px (140 px no nível 1); janela do mapa
com pelo menos 300 px de altura em 360 × 640 e 460 px em 390 × 844.

### 4.7 A gôndola de frente

Alvo: tela B. É a lista de produtos de uma seção desenhada como prateleira.

- Uma função `montarGondola(secaoId, recipiente)` em `tela.js` substitui a montagem atual dos
  cartões de `lista-produtos`. É usada em dois lugares: na lista rápida (dentro da página) e
  num painel novo `painel-gondola`, aberto a partir do mapa.
- Grade: `repeat(auto-fill, minmax(104px, 1fr))`, sem espaço entre colunas, 14 px entre fileiras.
- Cada vaga é um `<button>` (como os cartões de hoje) com: figura de 78 px **sem marca**, a
  tábua (12 px, largura total, encostando nas vizinhas) e a etiqueta branca com o **nome**
  (14 px) e a **medida** (12 px).
- Estados que os cartões atuais já mostram continuam: item da lista (etiqueta amarela e selo
  "Lista: 2"), item completo (selo verde "✓ Pegou"), guloseima no carrinho, limite atingido.
- Fundo e tábua mudam com o móvel da seção: geladeira (azul claro) para Laticínios e Bebidas,
  madeira para o resto.
- No modo mapa, o painel do produto ganha o atalho "‹ Ver toda a gôndola de Laticínios", que
  abre `painel-gondola`. Tocar num produto ali abre o painel do produto. Mesmas regras dos
  outros painéis: foco preso, Esc e ✕ fecham, um painel por vez.

### 4.8 O painel do produto

Alvo: tela C. Regras e textos da seção 2.6 do plano original continuam; muda a disposição.

- Cabeçalho na cor da seção, com o ícone, "Leite · 1 litro" e o nome da seção.
- As opções ficam **lado a lado sobre uma tábua**, da mais barata para a mais cara: figura de
  100 px (120 px em telas com 600 px ou mais) com `marca: true`.
- Embaixo de cada uma, nesta ordem: **preço** em etiqueta amarela (21 px, com "R$" menor),
  **marca** (15 px), **corações** (ícones `coracao` e `coracao-vazio` de 22 px, com o
  `aria-label` "2 de 3 corações" de hoje) e o **botão**.
- Textos de botão: "Pegar"; "Trocar" quando o produto já está no carrinho com outra opção; "✓
  Pegou" (contorno verde, desabilitado) na opção que está no carrinho. O texto longo de hoje
  ("Colocar no carrinho", "Trocar por esta") vai para o `aria-label`.
- Nível 1: a linha do subtotal ("2 × R$ 5,50 = R$ 11,00") fica entre o preço e a marca.
- Produto fora da lista: mesmas colunas, sem botão, com o aviso de hoje.
- Guloseima: uma coluna só, centrada.
- Seletor de quantidade e aviso "Na lista: 2" como hoje, com os botões de 48 px.
- Em 360 px de largura, três colunas de pelo menos 104 px cabem sem rolagem horizontal.
- **Carrinho:** cada linha ganha a figura de 44 px com `marca: true` à esquerda do texto.

### 4.9 Ícones na interface

Dentro do Mercadinho, todo emoji que hoje aparece como imagem vira `criarIconeUi(nome, tamanho)`:

| Onde | Emoji hoje | Ícone |
|---|---|---|
| Dinheiro | 💰 | `saco-de-dinheiro` |
| Corações | ❤️ 🤍 | `coracao`, `coracao-vazio` |
| Lista, lista rápida | 📝 | `lista` |
| Carrinho, título | 🛒 | `carrinho` |
| Espiar | 👀 | `olhos` |
| Caixa, cupom | 🧺 🧾 | `cupom` |
| Local | 📍 | `alfinete` |
| Estrelas do resultado | ⭐ | `estrela` |
| Remover do carrinho | 🗑️ | `lixeira` |
| Itens completos | ✅ | `confirmado` |
| Seções, produtos, guloseimas | campo `emoji` | `criarFigura` ou o ícone da seção |
| Título da missão | `tema.emoji` | `ICONE_DO_TEMA` |

Em linhas de texto corrido (missão, lista, cupom, resultado), o ícone entra como imagem de
1,2 em alinhada ao texto, antes do nome. O cabeçalho do site (Início, som) não muda.

### 4.10 Quando algo falha

- SVG que não carrega: reserva de emoji da seção 4.3.
- `criarRenderizador` devolve `null` (sem a janela): o jogo cai na lista rápida, como hoje.
- Sem conexão: os ícones estão no precache do service worker (tudo o que está em `dist/` entra).

### 4.11 Peso e desempenho

- `public/figuras/mercadinho/` com no máximo **1.100.000 bytes** (os 67 ícones somam 1.018 kB
  sem compressão e cerca de 155 kB comprimidos, que é o que trafega; as três folhas da Kenney
  saem). Todo o `dist/` entra no precache do service worker: hoje ele tem 2,6 MB.
- Nenhuma dependência nova, nenhuma requisição externa, nenhum otimizador de SVG.
- O mapa tem cerca de 150 elementos e 64 imagens, montados uma vez. Andar só muda dois
  `transform`.
- Se o aparelho da Elis engasgar ao andar (os SVG "Color" têm filtros), a saída prevista é a
  variante "Flat" (D1), que não muda mais nada no código. Só o Diego decide isso, depois de
  testar no aparelho dela.

---

## 5. Protocolo do executor

### 5.1 Regras

1. Valem a seção 2.2 do `MELHORIAS.md` e a seção 5 do `PLANO-MERCADINHO.md` (comandos, guardas
   de dinheiro em centavos, sorteio injetado), menos o que a seção 3 daqui substitui.
2. **Uma etapa por sessão.** Terminar, rodar as guardas, tirar as capturas, escrever o
   relatório e parar.
3. Branch `j15-mercadinho-arte`, criada a partir de `main`. Um commit por etapa, mensagem em
   português. **Sem merge e sem push em `main`.**
4. **Copiar da referência, não recriar.** Se algo da referência não couber no jogo, parar e
   relatar com a captura.
5. Não mudar `dados.js`, `jogo.js`, `mapa.js` nem regra de jogo. Marca, preço e coração só
   mudam por pedido do Diego.
6. **Olhar o resultado.** Nenhuma etapa termina sem o executor abrir as capturas e comparar
   com as imagens `depois-*.png`. Critério escrito sem captura conferida não conta.

### 5.2 Leitura obrigatória antes de editar

- Este plano inteiro e `docs/planos/mercadinho-arte/referencia.html` (código e página aberta).
- As imagens `antes-*.png` e `depois-*.png` da mesma pasta.
- `PLANO-MERCADINHO.md`, seções 2.5 a 2.7, 4.2 e 5.
- `Games/mercadinho/tela.js` inteiro e `mercadinho.css`.
- `shared/base.css` (variáveis de cor, fontes e a regra de contraste).

### 5.3 Comandos

O caminho do projeto tem `:` e quebra o `PATH` do npm. Usar só:

```bash
npm test             # linha de base: 555 testes em 35 arquivos antes da A1; 559 em 36 depois da A5
npm run typecheck
npm run build
npm run dev          # http://localhost:5173/Games/mercadinho/
node docs/planos/mercadinho-arte/capturar.mjs http://localhost:5173/Games/mercadinho/ <pasta-fora-do-repositório>
```

`capturar.mjs` já foi testado contra o jogo atual. Ele abre o Chrome sem janela, percorre
início, missão, loja, painel do produto pelo mapa, seções, gôndola de Laticínios, painel do
Leite e gôndola de Guloseimas em 360 × 640, 390 × 844, 1280 × 800 e 1366 × 768, e grava 36 PNG.
Nos tamanhos de celular ele usa **toque de verdade** (eventos de toque), então um contorno de
foco que aparece na captura também aparece para a Elis. Ele imprime ainda, por tamanho, uma
linha `medidas` (casa, painel da compra, mapa, barra de baixo, se a página rola) e o
**desalinhamento das tábuas** de cada gôndola em px. Depende de `data-casa-px`, `data-cam-x` e
`data-cam-y` no elemento do mapa (seção 4.5) e dos seletores `.botao-secao[data-secao]`,
`.vaga[data-produto-id]`, `#btn-voltar-secoes` e `#btn-alternar-modo-loja`. Se um seletor
mudar, ajustar o script na mesma etapa.

### 5.4 Guardas ao fim de toda etapa

```bash
npm test && npm run typecheck && npm run build
git status --short     # só arquivos da seção 4.1
grep -rnE "parseFloat|toFixed|Math\.random" Games/mercadinho/jogo.js Games/mercadinho/mapa.js Games/mercadinho/dados.js   # vazio
```

A partir da etapa em que cada item é entregue, também:

```bash
grep -rn "getContext\|fillText\|<canvas" Games/mercadinho/ --include=*.js --include=*.html   # vazio (A3 em diante)
grep -c "\.emoji" Games/mercadinho/tela.js                                                  # 0, fora a reserva de figuras.js (A5)
find public/figuras/mercadinho -type f -exec cat {} + | wc -c                               # até 1100000 (A3 em diante)
```

Console do navegador sem erro e aba Network sem 404 em 360 × 640 e 1280 × 800.

### 5.5 Portão visual

Em toda etapa de A2 em diante:

1. Rodar `capturar.mjs` e abrir os PNG.
2. Comparar cada tela com a referência e medir no navegador (`getBoundingClientRect`) os
   tamanhos mínimos da seção 2.
3. Anexar ao relatório: as capturas, as medidas e uma lista honesta das diferenças que
   restaram em relação à referência.

**O Diego aprova as capturas no fim da A2 e da A4.** Sem a aprovação registrada, a etapa
seguinte não começa.

### 5.6 Relatório por etapa

```
## Etapa A<N> — relatório
- Commit: <hash> na branch j15-mercadinho-arte
- O que foi feito:
- Arquivos criados, alterados e apagados:
- Testes: X em Y arquivos (antes: 555 em 35); typecheck e build: ok/falhou
- Critérios de aceite: [x] ou [ ] com a evidência de cada um
- Medidas na tela (px de CSS) em 360 × 640, 390 × 844 e 1280 × 800:
- Capturas: caminho da pasta
- Diferenças em relação à referência:
- Pendências e dúvidas para o Diego:
```

### 5.7 Prompt para iniciar cada etapa

```
Contexto: repositório Site-JogosElis. Leia docs/planos/PLANO-MERCADINHO-ARTE.md inteiro, abra
docs/planos/mercadinho-arte/referencia.html e as imagens antes-*.png e depois-*.png da mesma
pasta. Execute SOMENTE a Etapa A<N>, na branch j15-mercadinho-arte, seguindo o protocolo da
seção 5. Copie medidas, cores, moldes e CSS da referência: não redesenhe nada. Ao terminar,
rode as guardas (5.4), tire e confira as capturas (5.5), escreva o relatório (5.6) e pare.
```

---

## 6. Etapas

| Etapa | Entrega | O jogo muda na tela? | Esforço | Modelo sugerido |
|---|---|---|---|---|
| A0 | Decisões D1 a D5 | Não | 10 min do Diego | — |
| A1 | Ícones, `figuras.js`, testes, folha de prova | Não (só a folha de prova) | M | Sonnet |
| A2 | Painel do produto, gôndola e carrinho com figuras | Sim | M | Opus ou Sonnet com imagem |
| A3 | Mapa em HTML/CSS; sai o canvas e o `arte.js` | Sim | G | Opus |
| A4 | Tela da loja: painel compacto, mapa grande, barra de baixo | Sim | M | Opus ou Sonnet com imagem |
| A5 | Ícones no resto do jogo, acabamento e documentação | Sim | P | Sonnet |
| A6 | Correções da revisão visual: loja inteira no computador, gôndola, barra de baixo, ícones | Sim | M | Opus ou Sonnet com imagem |

Cada etapa deixa o jogo funcionando. A1 e A2 convivem com a arte antiga do mapa.

### Etapa A0 — Decisões (Diego)

Abrir a referência e responder D1 a D5 (ou aceitar os padrões). Se quiser trocar o ícone de
algum produto, apontar no `depois-catalogo.png`: é uma linha na tabela da seção 4.3.

### Etapa A1 — Ícones e figura do produto

**Arquivos:** `public/figuras/mercadinho/icones/` e `LICENCA.txt`; `figuras.js`;
`tests/mercadinho-figuras.test.js`; `arte-prova.html`.

**Passos**

1. Copiar os 67 SVG (seção 4.2) e escrever o `LICENCA.txt` novo. As três folhas da Kenney
   ficam por enquanto (o `arte.js` antigo ainda as carrega), então o `LICENCA.txt` desta etapa
   mantém também o trecho da Kenney; ele sai na A3.
2. Criar `figuras.js` conforme a seção 4.3, copiando `MOLDES`, `misturar`, `clara` e a lógica
   de `figura` da referência. Mover `CORES_DA_MARCA`, `PALETA_RESERVA` e `coresDaMarca` de
   `arte.js` **copiando** (o `arte.js` continua intacto até a A3).
3. Reescrever `arte-prova.html` (seção 4.3) usando só `figuras.js`.
4. Testes novos.

**Critérios de aceite**

- [ ] `FIGURA_DO_PRODUTO` tem exatamente os 61 ids de `dados.js` (49 produtos e 12 guloseimas).
- [ ] Todo molde citado existe em `MOLDES` ou é `solto`; `MOLDES` tem exatamente os 10 nomes.
- [ ] Todo ícone citado em `FIGURA_DO_PRODUTO`, `SECOES_VISUAIS`, `ICONE_DO_TEMA` e
      `ICONES_DA_INTERFACE` existe como arquivo em `public/figuras/mercadinho/icones/` e **não há arquivo sobrando**
      (teste lê a pasta com `node:fs`).
- [ ] Todo arquivo da pasta está listado em `LICENCA.txt`.
- [ ] `coresDaMarca` passa nos mesmos testes de hoje (cores válidas, opções do mesmo produto
      com cores diferentes, reserva estável).
- [ ] `figuras.js` importa no Node sem tocar em `document` (o teste importa o módulo).
- [ ] Texto branco sobre cada cor de seção dá pelo menos 4,5:1 (teste calcula).
- [ ] `arte-prova.html` aberta em 1280 × 800 mostra os 61 itens iguais ao
      `depois-catalogo.png`; captura no relatório.
- [ ] O jogo continua igual ao de antes (nenhum arquivo do jogo importa `figuras.js` ainda).

### Etapa A2 — Painel do produto, gôndola e carrinho

**Arquivos:** `tela.js`, `index.html`, `mercadinho.css`.

**Passos**

1. Copiar para `mercadinho.css` as variáveis `--m-*` e o CSS de `.fig*`, `.folha*`, `.gondola`,
   `.vaga*`, `.etq`, `.opcoes*`, `.pe*`, `.preco`, `.coracoes` e `.qtd` da referência,
   adaptando os nomes às classes que o jogo já tem.
2. Painel do produto conforme a seção 4.8, trocando as duas chamadas de `criarIcone` por
   `criarFigura(..., { marca: true })`.
3. `montarGondola` conforme a seção 4.7, na lista rápida. O painel `painel-gondola` e o atalho
   a partir do mapa também entram aqui.
4. Carrinho com figura de 44 px.
5. Botões da grade de seções da lista rápida com o ícone da seção (`criarIconeUi`, 40 px).

**Critérios de aceite**

- [ ] Em 360 × 640, 390 × 844 e 1280 × 800: figura do painel com pelo menos 100 px, preço com
      pelo menos 20 px, marca com 14 px ou mais, sem rolagem horizontal (medidas no relatório).
- [ ] As opções de um produto ficam lado a lado sobre a tábua e se distinguem pela cor e pelo
      nome escrito na embalagem.
- [ ] Hortifrúti e ovos mostram a plaquinha com o nome da opção.
- [ ] Gôndola: figura de 76 px ou mais e nome de 14 px ou mais em todos os 61 itens.
- [ ] Todos os estados de antes continuam: na lista, completo, fora da lista, trocar de opção,
      quantidade de 1 a 6, subtotal no nível 1, limite de guloseimas.
- [ ] Foco preso, Esc, ✕ e toque fora continuam fechando; `aria-label` dos corações e dos
      botões preservado.
- [ ] Com a pasta `icones/` renomeada, o painel mostra o emoji de reserva, sem erro no console.
- [ ] `tests/mercadinho.test.js` passa sem mudança.
- [ ] Capturas `5-produto`, `6-secoes` e `7-gondola` comparadas com as telas B e C.
- [ ] **Aprovação do Diego registrada.**

### Etapa A3 — Mapa em HTML e CSS

**Arquivos:** `renderizador.js` (novo conteúdo), `index.html`, `mercadinho.css`, `tela.js`;
apagar `arte.js` e as três folhas da Kenney; `tests/mercadinho-mapa.test.js`.

**Passos**

1. Trocar o `<canvas id="mapa-canvas">` por `<div id="mapa-janela" class="janela-mapa">`, com o
   mesmo `tabindex`, `role` e `aria-label`. Atualizar as referências em `tela.js` (hoje nas
   linhas 116, 344, 542, 630, 1897, 1908 e 2107) e o comentário da linha 114.
2. Reescrever `renderizador.js` conforme a seção 4.5.
3. Copiar o CSS do mapa da referência.
4. Apagar `arte.js` e os PNG da Kenney; atualizar `LICENCA.txt`.
5. Em `tests/mercadinho-mapa.test.js`, remover o bloco "arte, moldes e cores por marca
   (Etapa 4)" e os imports de `arte.js`. Os testes de mapa, colisão e caminho ficam.
6. Nesta etapa a altura da janela ainda é a de hoje (`min(62vh, 8 casas)`); a tela inteira
   muda na A4.

**Critérios de aceite**

- [ ] Guardas novas da 5.4: nenhum `getContext`, `fillText` ou `<canvas>` em `Games/mercadinho/`.
- [ ] Em 360 × 640: casa com 48 px ou mais, figura de embalagem com 32 px ou mais de largura e
      item solto com 34 px ou mais (medidas no relatório).
- [ ] Em 1280 × 800 a loja inteira cabe na largura da janela.
- [ ] As 8 seções têm placa com ícone e nome, presa ao móvel; nenhuma placa flutua no piso.
- [ ] Andar por toque, por teclado e trocar o destino no meio do caminho funcionam como antes;
      o painel abre ao chegar; a câmera nunca mostra fora da loja.
- [ ] No nível 1, as prateleiras que faltam têm contorno amarelo e o pino "!".
- [ ] `desenhar` não cria nem remove elementos (conferir pelo código e pelo painel
      Performance do navegador durante uma caminhada).
- [ ] `prefers-reduced-motion`: sem pulinho.
- [ ] Soma dos arquivos de `public/figuras/mercadinho/` até 1.100.000 bytes (comando da 5.4).
- [ ] Captura `4-mapa` comparada com a tela A e com `depois-mapa-computador.png`.

### Etapa A4 — A tela da loja

**Arquivos:** `index.html`, `mercadinho.css`, `tela.js`.

**Passos:** seção 4.6 inteira.

**Critérios de aceite**

- [ ] Em 390 × 844 e 1280 × 800, no modo mapa, a página não rola na fase da loja.
- [ ] Painel da compra com até 104 px de altura (140 px no nível 1) em 360 × 640.
- [ ] Janela do mapa com 300 px ou mais de altura em 360 × 640 e 460 px ou mais em 390 × 844.
- [ ] Todos os botões com 44 px ou mais; nenhum texto cortado em 360 px de largura.
- [ ] Os três níveis conferidos: nível 1 com a barra do total, nível 2 com "Espiar", nível 3
      sem os dois.
- [ ] Alternar entre mapa e lista rápida continua funcionando e guardando a preferência.
- [ ] Leitor de tela: os `aria-label` têm o texto completo de antes; a seção atual continua
      sendo anunciada.
- [ ] Captura `3-loja` nos três tamanhos comparada com a tela A.
- [ ] **Aprovação do Diego registrada.**

### Etapa A5 — Resto do jogo, acabamento e documentação

**Passos**

1. Ícones da seção 4.9 nas fases início, missão, caixa e resultado e nos painéis de lista e
   carrinho.
2. Animações curtas, todas desligadas com `prefers-reduced-motion`: a figura "voa" para o selo
   do carrinho ao pegar, e o contador do peão dá um pulso.
3. `README.md`: créditos de terceiros (Fluent Emoji, Microsoft, MIT; sai a Kenney) e árvore de
   pastas. `MELHORIAS.md`: a entrada J15 passa a citar este plano e o estado da arte.
4. Matriz de verificação da seção 7.

**Critérios de aceite**

- [ ] `grep -c "\.emoji" Games/mercadinho/tela.js` dá 0.
- [ ] Nenhum emoji do sistema aparece dentro do cartão do jogo em nenhuma fase (o cabeçalho do
      site não conta).
- [ ] V01 a V10 registrados no relatório.
- [ ] README e MELHORIAS atualizados.
- [ ] Nada mesclado em `main`.

### Etapa A6 — Correções da revisão visual

> Escrita em 2026-11-14, depois de rodar o jogo com as etapas A1 a A5 prontas e comparar 36
> capturas com a referência. **É a próxima etapa a executar.** Não é uma etapa nova de arte: é
> acabamento de layout em volta do que já ficou bom.

**O que ficou bom e não deve ser mexido.** A arte do mapa (móveis, cores das seções, placas,
figuras, peão), o painel do produto com embalagem (Leite: caixas Italac, Piracanjuba e Ninho
lado a lado, preço e corações) e a tela de seções com os ícones. Nada disso muda nesta etapa.

**O que está errado, com a medida de hoje.** As medidas saem do `capturar.mjs` (seção 5.3).

| # | Problema | Medida hoje | Onde aparece |
|---|---|---|---|
| R1 | No computador a loja não cabe na altura. Ao entrar, a fileira de cima (Laticínios, Açougue, Bebidas) fica fora da tela. | 1280 × 800: casa 52, mapa 1264 × 573, aparecem 11 das 16 fileiras. 1366 × 768: casa 56, 9,6 fileiras. | `pc-*-3-loja.png` |
| R2 | No computador o painel da compra são barras brancas esticadas, com o texto sozinho no meio. | Painel 1180 × 102; a ficha do dinheiro tem ~900 px de largura. | `pc-1280-3-loja.png` |
| R3 | As tábuas da gôndola ficam tortas quando um nome quebra em 2 ou 3 linhas. | Desalinhamento de 23,8 px (Laticínios) e 21,9 px (Guloseimas). | `*-7-gondola.png`, `*-9-guloseimas.png` |
| R4 | A gôndola da lista rápida não tem a cor da seção. No lugar da faixa colorida da referência há um alfinete e dois botões grandes empilhados ("Todas as seções", "Ver no mapa"), que empurram as prateleiras para baixo. | 360 × 640: a primeira tábua fica em y ≈ 493 de 640 e só aparece uma fileira. | `cel-*-7-gondola.png` |
| R5 | Na lista rápida o painel da compra tem moldura própria dentro do cartão (cartão dentro de cartão). | — | `cel-*-6-secoes.png` |
| R6 | Os botões de baixo, no celular, quebram em duas linhas com letra grande. "Toque numa prateleira" parece um botão cinza quebrado. | 360 e 390: os dois botões com 2 linhas. | `cel-*-3-loja.png` |
| R7 | Três ícones enganam: Toddynho e KitKat usam o mesmo tablete de chocolate de Batom, Lacta, Bis e Achocolatado; Ruffles aparece como batata crua. (Erro da tabela da referência, já corrigido na seção 4.3 e na `referencia.html`.) | — | `pc-*-4-mapa.png`, `*-9-guloseimas.png` |
| R8 | No painel de fruta e verdura, o nome da variedade aparece duas vezes: na etiqueta colorida acima da tábua e de novo embaixo do preço. | "Niágara" / "Niágara" | `*-5-produto.png` |
| R9 | No celular, no modo mapa, sobra uma faixa vazia entre o topo do site e o painel da compra. | ~30 px | `cel-*-3-loja.png` |

**Investigado e descartado.** Nas primeiras capturas apareceu um contorno azul-escuro grosso no
botão X e em "Todas as seções". Com toque de verdade ele não aparece: era efeito da captura.
Não mexer no foco.

**Decisão D6 (Diego), com padrão adotado.** Para a loja inteira caber no notebook, a casa do
mapa no computador fica entre 40 e 45 px (hoje 52 a 56). Com isso a figura da prateleira fica
com 27 a 32 px no computador, menor que o mínimo do celular (32 a 34 px). No computador a tela
fica mais longe do olho do que o celular, e ver a loja inteira de uma vez vale mais que 4 px de
figura. **Padrão: loja inteira.** Alternativa: manter a casa de 52 px e deixar o mapa rolar
como hoje (aí só se fazem os passos 2 a 9). No celular nada muda.

**Arquivos:** `mercadinho.css`, `tela.js`, `renderizador.js`, `figuras.js`, `index.html` (só se
for preciso), `public/figuras/mercadinho/icones/batata-frita.svg` (novo, copiado de
`docs/planos/mercadinho-arte/icones/`), `public/figuras/mercadinho/LICENCA.txt`, `README.md`,
`tests/` (só se um teste precisar acompanhar a mudança).

**Passos**

0. **Commit do que já existe.** As etapas A1 a A5 estão na branch `j15-mercadinho-arte` sem
   commit. Antes de editar: `git status --short`, conferir que só aparecem arquivos da seção
   4.1, `docs/planos/` e `MELHORIAS.md`/`README.md`, e fazer um commit "Etapas A1 a A5 do plano
   de arte do Mercadinho". A A6 vai num commit separado, para o Diego ver só a correção.

1. **Loja inteira no computador (R1, R2), conforme a D6.**
   - Uma condição só, `(min-width: 1024px) and (min-aspect-ratio: 5/4)`, exportada de
     `renderizador.js` como `CONSULTA_LAYOUT_LARGO`. O CSS repete a mesma media query, com um
     comentário que aponta para a constante.
   - Nessa condição, no modo mapa, a tela da loja vira duas colunas: à esquerda uma coluna de
     **240 px** com o painel da compra em cima e a barra de baixo embaixo; à direita o mapa.

     ```css
     @media (min-width: 1024px) and (min-aspect-ratio: 5/4) { /* = CONSULTA_LAYOUT_LARGO */
       .jogo-mercadinho--mapa .tela--loja {
         display: grid;
         grid-template-columns: 240px minmax(0, 1fr);
         grid-template-rows: auto minmax(0, 1fr) auto;
         grid-template-areas: "hud mapa" ". mapa" "acoes mapa";
         column-gap: 12px;
       }
       .jogo-mercadinho--mapa .painel-fixo { grid-area: hud; width: auto; }
       .jogo-mercadinho--mapa .hud__linha1,
       .jogo-mercadinho--mapa .hud__linha2 { flex-direction: column; }
       .jogo-mercadinho--mapa .ficha { justify-content: flex-start; height: 48px; }
       .jogo-mercadinho--mapa .loja-mapa-bloco { grid-area: mapa; }
       .jogo-mercadinho--mapa .barra-baixo { grid-area: acoes; grid-template-columns: 1fr; width: auto; }
       .jogo-mercadinho--mapa .loja-cabecalho { position: absolute; } /* continua só para leitor de tela */
     }
     ```

     É um ponto de partida: os seletores exatos podem precisar de ajuste, mas o resultado tem de
     ser esse. "Sair" fica na coluna, como último item do painel da compra.
   - Em `tela.js`, no modo mapa com layout largo, o botão "Lista rápida" vai para
     `#acoes-loja` como botão comum (`botao botao--neutro`), não como selo sobre o mapa. Ao
     cruzar a condição (redimensionar a janela), chamar `renderizarLoja()` de novo, com um
     ouvinte `change` do `matchMedia`.
   - Em `renderizador.js`, no layout largo, `calcularCasa` mede o **pai** da janela
     (`#loja-mapa-bloco`, descontado o padding), nunca a própria janela:
     `casa = clamp(floor(min(L / 24, A / 16)), 40, 64)`. A janela recebe largura `24 × casa` e
     altura `16 × casa` (sem passar do pai) e fica centrada. Medir o pai evita o laço em que a
     janela encolhe e a casa nunca mais cresce. Se a casa ficar em 40 e ainda não couber (janela
     baixa), a câmera rola como hoje. Fora do layout largo a fórmula do celular não muda.
   - Quando o mapa cabe inteiro, a câmera fica em `camX = camY = 0`, sem faixa de piso vazio em
     volta.
   - Entre 600 e 1023 px de largura (tablet em pé, janela estreita), o painel da compra continua
     em cima, mas nenhuma ficha passa de **280 px** de largura e as linhas ficam centradas.

2. **Gôndola com tábuas retas (R3).** Cada vaga vira uma grade de três linhas de altura fixa
   para a figura, para que a tábua fique sempre na mesma altura e a etiqueta cresça para baixo:

   ```css
   .gondola__grade { align-items: stretch; }
   .jogo-mercadinho .vaga { grid-template-rows: 100px 12px 1fr; align-content: stretch; }
   .vaga .fig { align-self: end; }      /* figura de 78 px de largura tem até 94 px de altura */
   .etq { height: calc(100% - 5px); }   /* etiquetas da mesma fileira com a mesma altura */
   ```

   As tábuas vizinhas encostam (`column-gap: 0` já existe) e formam uma prateleira contínua.

3. **Cabeçalho da lista rápida com a cor da seção (R4).**
   - **Seção aberta:** `#loja-cabecalho` vira uma faixa com o fundo da cor da seção
     (`SECOES_VISUAIS[letra].cor`, a mesma do móvel no mapa), cantos de cima arredondados
     (16 px) e encostada na gôndola, como o `folha__topo` do painel. Da esquerda para a
     direita: botão **←** de 44 × 44 branco (`aria-label="Todas as seções"`); ícone da seção
     de 28 px num círculo branco de 40 px; nome da seção em branco, 18 px; abaixo, "Toque num
     produto para ver as marcas" em 13 px; e, encostado à direita, o botão **Ver no mapa**,
     branco, 44 px de altura (até 599 px de largura só o ícone, com `aria-label="Ver no
     mapa"`; a partir de 600 px, ícone e texto). Altura total da faixa: até 64 px. O alfinete
     sai.
   - **Grade de seções:** uma linha só, "Escolha uma seção" à esquerda (18 px) e "Ver no mapa"
     compacto à direita (44 px de altura, 15 px). O ícone de cada cartão de seção fica num
     círculo de 56 px com fundo `color-mix(in srgb, <cor da seção> 16%, white)`.
   - Os `aria-label` e o anúncio da seção ("Você abriu a seção …") continuam como estão. O foco
     ao abrir uma seção vai para o botão ←.

4. **Sem cartão dentro de cartão (R5).** Na lista rápida, `.painel-fixo` fica sem borda, sem
   fundo próprio e sem padding lateral, igual ao modo mapa. O espaço entre o painel da compra e
   o cabeçalho da seção fica em 8 px.

5. **Barra de baixo no celular (R6).**
   - Sem prateleira em frente, o texto passa a ser **"Toque no mapa"** (hoje "Toque numa
     prateleira"). Mudar só o texto visível; o anúncio para leitor de tela continua igual.
   - Desabilitado deixa de parecer botão quebrado e vira dica: fundo transparente, borda
     tracejada de 2 px `#e3c8d4`, texto `var(--cor-suave)`, sem sombra e `opacity: 1`.
   - Os dois botões com altura fixa de **52 px**, letra de 15 px com `line-height: 1.1`,
     `padding: 0 8px`, ícone de 20 px, colunas `1fr 1fr`. "Ver: Queijo muçarela fatiado" pode
     ocupar 2 linhas dentro dos 52 px. "Toque no mapa" e "Ir para o caixa" cabem em uma.

6. **Ícones (R7).** Em `FIGURA_DO_PRODUTO`, igual à seção 4.3 já corrigida: `toddynho` →
   `['caixa', 'copo-de-leite']`, `kitkat` → `['barra', 'waffle']`, `ruffles` →
   `['saquinho', 'batata-frita']`. Copiar `docs/planos/mercadinho-arte/icones/batata-frita.svg`
   para `public/figuras/mercadinho/icones/`, acrescentar a linha dele no `LICENCA.txt`
   (copiar de `docs/planos/mercadinho-arte/LICENCA.txt`) e corrigir as contagens do README
   (67 → 68 ícones; 66 → 67 arquivos do Fluent).

7. **Nome repetido no painel de fruta e verdura (R8).** Em `abrirPrateleiraProduto`, quando o
   molde do produto é `solto`, chamar `criarFigura(..., { marca: false })`. O nome da variedade
   continua embaixo do preço. Produtos embalados não mudam.

8. **Faixa vazia no celular (R9).** No modo mapa, até 8 px entre a borda de baixo do cabeçalho
   do site e o topo da primeira ficha.

9. Rodar as guardas (5.4), o `capturar.mjs` e conferir cada captura com a referência e com a
   tabela acima.

**Critérios de aceite** (medidas em px de CSS, pelo `capturar.mjs` ou por
`getBoundingClientRect`)

- [ ] Commit das etapas A1 a A5 feito antes da A6, e a A6 num commit separado.
- [ ] 1280 × 800 e 1366 × 768: as 16 fileiras e as 24 colunas do mapa aparecem inteiras ao
      entrar na loja, casa entre 40 e 45, `rolaPagina: false`. Peão, placas e caixas visíveis
      sem rolar.
- [ ] 1280 × 800: nenhuma ficha do painel da compra passa de 240 px de largura; "Lista rápida"
      fica na coluna da esquerda, não em cima do mapa.
- [ ] Redimensionar a janela de 1280 para 800 px de largura e voltar: o layout troca e volta sem
      recarregar, e o mapa continua respondendo a toque e teclado.
- [ ] 360 × 640 e 390 × 844, modo mapa: casa, painel da compra e mapa iguais ou maiores que os
      de hoje (casa 48; mapa 308 × 369 e 338 × 573), `rolaPagina: false`.
- [ ] Tábuas tortas = **0** nas duas gôndolas, nos quatro tamanhos (linha impressa pelo script).
- [ ] 360 × 640, lista rápida, Laticínios aberta: faixa da seção em azul `#256fa8` com o nome
      em branco; primeira tábua da gôndola em y ≤ 380 (hoje ≈ 493).
- [ ] Nenhuma moldura em volta do painel da compra na lista rápida.
- [ ] 360 × 640: "Toque no mapa" e "Ir para o caixa" em uma linha cada, botões com 52 px de
      altura. Para contar as linhas:
      `(e => { const r = document.createRange(); r.selectNodeContents(e); return new Set([...r.getClientRects()].map(x => Math.round(x.top))).size; })(document.querySelector('#btn-ir-caixa'))` → 1.
- [ ] Mapa e gôndola de Guloseimas: Toddynho com o copo de leite, KitKat com o waffle, Ruffles
      com a batata frita. `npm test` passa (o teste de ícones confere que não sobra arquivo).
- [ ] Painel da Uva: "Niágara" aparece uma vez só.
- [ ] Soma de `public/figuras/mercadinho/` até 1.100.000 bytes (hoje 1.022.996; a batata frita
      soma ~13 kB).
- [ ] Os 36 PNG do `capturar.mjs` comparados com a referência; diferenças que restaram listadas
      no relatório.
- [ ] **Aprovação do Diego registrada**, olhando `cel-390-3-loja`, `cel-360-7-gondola`,
      `pc-1280-3-loja` e `pc-1366-3-loja`.
- [ ] Nada mesclado em `main`.

**Prompt para iniciar a A6**

```
Contexto: repositório Site-JogosElis, branch j15-mercadinho-arte. As etapas A1 a A5 do
docs/planos/PLANO-MERCADINHO-ARTE.md já estão feitas, mas sem commit. Leia o plano inteiro,
com atenção à Etapa A6, abra docs/planos/mercadinho-arte/referencia.html e as imagens
depois-*.png. Execute SOMENTE a Etapa A6, na ordem dos passos (o passo 0 é o commit do que já
existe). Não mexa na arte do mapa nem no painel do produto embalado: isso foi aprovado. Antes
de editar, rode `npm run dev` e `node docs/planos/mercadinho-arte/capturar.mjs
http://localhost:5173/Games/mercadinho/ <pasta-fora-do-repositório>/antes` e confira que as
medidas batem com a tabela R1 a R9. Ao terminar, rode as guardas (5.4), capture de novo em
<pasta>/depois, abra e compare os PNG, escreva o relatório (5.6) com as linhas "medidas" e
"tábuas tortas" do script e pare. Sem merge e sem push em main.
```

---

## 7. Matriz de verificação final

Com `npm run build && npm run preview`.

| # | Cenário | Esperado |
|---|---|---|
| V01 | 360 × 640, toque, nível 2, compra completa pelo mapa | Tudo legível, sem rolagem horizontal, tamanhos mínimos da seção 2 |
| V02 | 390 × 844, nível 1 | Barra do total, pinos "!", página sem rolar |
| V03 | 768 × 1024 | 12 casas de largura, painéis centrados |
| V04 | 1280 × 800 e 1366 × 768, teclado, nível 3 | Loja inteira na tela, em largura **e altura** (A6), foco visível |
| V05 | Lista rápida do início ao fim | Gôndola de frente em todas as 8 seções |
| V06 | `prefers-reduced-motion` | Sem pulinho, sem voo, sem confete |
| V07 | Sem conexão depois de uma visita | Jogo abre com todos os ícones |
| V08 | Pasta `icones/` ausente | Emoji de reserva, sem erro |
| V09 | Zoom do navegador em 200% | Nada cortado; a página pode rolar |
| V10 | Aparelho da Elis, 2 compras | Andar sem engasgo; o Diego decide se fica "Color" ou "Flat" |

---

## 8. Fora do escopo

- Mudar o mapa, as regras, os preços, as marcas ou os temas.
- Personagem de corpo inteiro com animação de caminhada.
- Arte gerada por IA de imagem, pacotes pagos ou fotos de embalagens.
- Sons novos.
- Refazer a arte de outros jogos do site.

## 9. Riscos

| Risco | Como o plano trata |
|---|---|
| O executor volta a "desenhar" em vez de copiar | Regras 2 e 4 da seção 5.1, guardas com `grep` e portão visual com captura |
| A licença MIT incomodar | D1: é decisão do Diego antes de qualquer código; o crédito vai em `LICENCA.txt` e no README |
| SVG "Color" pesar no aparelho da Elis | V10 e a troca prevista para "Flat" sem mexer em código |
| Nome de marca comprido não caber na embalagem | A fórmula da referência reduz a letra e esconde abaixo de 6,5 px; o nome continua embaixo, em 15 px |
| A referência não prever um estado do jogo | O executor para e pergunta; não inventa aparência |
