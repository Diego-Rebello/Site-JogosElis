# Plano de Implementação — Mercadinho (J15)

> Jogo de supermercado para a área **Jogos da Elis**: a Elis recebe uma **lista de compras** e um
> **valor para gastar**, anda por um mercado em **pixel art**, procura os produtos nas prateleiras,
> escolhe entre **marcas de verdade** com preços diferentes e passa no caixa. O dinheiro nunca dá
> para levar o melhor de tudo: ela precisa decidir onde vale gastar mais, se cabe um chocolate e
> quanto sobra de troco.
>
> Criado em 2026-11-14. Pedido do Diego: praticar dinheiro e valor das coisas com base matemática,
> lista variável que faça sentido, orçamento próximo do valor da lista, loja navegável em 2D ou
> "3D falso", pixel art bem feito, produtos e marcas que existem nos mercados do Brasil.
>
> **Documento de execução para o modelo executor (Claude Sonnet, Gemini ou Codex).** O plano fecha
> decisões de produto, arquitetura, arquivos, números e critérios de aceite. O executor não deve
> "melhorar", simplificar ou trocar essas decisões. Diante de contradição, comportamento não
> previsto ou falha de verificação, deve parar no fim da etapa atual, registrar as evidências e
> pedir decisão ao Diego.

---

## Resumo para o Diego

**O que a Elis vai jogar.** Ela abre o jogo e recebe uma missão, por exemplo: *"Café da manhã:
pão de forma, 2 leites, mamão, ovos e café. Você tem R$ 55,00."* Entra no mercado visto de cima,
toca onde quer ir e a personagem anda pelos corredores. Cada prateleira é um produto; ao chegar,
abre um painel com 2 ou 3 opções reais (Italac R$ 5,30, Piracanjuba R$ 5,90, Ninho R$ 7,50), cada
uma com corações que dizem o quanto a família gosta dela. Perto do caixa ficam as guloseimas. No
caixa sai o cupom, ela calcula o troco e vê o resultado.

**Como isso atende o que você pediu:**

| Pedido | Como aparece no jogo |
|---|---|
| Lista variável que faça sentido | 10 temas (café da manhã, lanche da escola, macarronada, bolo de aniversário...). Cada tema sorteia produtos de "vagas" coerentes, então nunca sai "sabão em pó" no piquenique. |
| Valor variável, próximo da lista | O orçamento é um valor redondo sorteado entre 40% e 75% do caminho que vai da cesta mais barata até a cesta com o melhor de tudo. Sempre dá para comprar a lista; nunca dá para levar tudo do melhor. |
| Escolher marca melhor ou pior | Cada compra tem uma **meta de corações** ("família feliz"). A cesta mais barata nunca alcança a meta, então ela precisa escolher em quais produtos subir de marca. |
| Comprar ou não um chocolate | As guloseimas também dão corações. Em cerca de 1 a cada 3 missões, levar uma guloseima é a forma mais esperta de bater a meta; nas outras, é melhor melhorar uma marca. |
| Base matemática | Ler preços com centavos, comparar, somar o carrinho de cabeça (o total fica escondido no nível padrão), multiplicar quantidades, calcular o troco e, no Desafio, o total da compra. |
| Navegar pelo mercado | Mapa de 24 × 16 casas em visão de cima oblíqua, toque para andar, câmera que acompanha, 49 prateleiras em 7 seções mais a gôndola de guloseimas e 3 caixas. |
| Pixel art bem feito | Cenário e personagem de pacotes profissionais em domínio público (Kenney, CC0). Há um **portão de arte**: você aprova uma captura da loja antes de o executor seguir. |
| Marcas de verdade | 49 produtos com 136 opções (93 marcas vendidas no Brasil) e 12 guloseimas. Preços calibrados pela pesquisa do Procon-SP/Dieese de julho de 2026. |

**Decisões que adotei como padrão.** Pode trocar qualquer uma antes da Etapa 1:

1. **Jogo novo, separado do Dinheirinho.** Nome **Mercadinho**, pasta `Games/mercadinho/`, id
   `mercadinho`, ícone 🛒. O Dinheirinho (montar valores com notas e moedas) continua igual.
2. **Três estrelas, uma por objetivo:** comprou tudo da lista dentro do orçamento · bateu a meta
   de corações · não estourou no caixa e acertou as contas de primeira. Não existe derrota: se o
   dinheiro não der, o caixa manda devolver ou trocar alguma coisa, como na vida real.
3. **Corações = "o quanto a nossa família gosta", não qualidade.** O jogo nunca diz que uma marca
   é ruim. Em alguns produtos a opção do meio tem os mesmos corações da mais cara, e em produtos
   como óleo, açúcar e detergente todas empatam: aí o certo é levar a mais barata. Isso ensina
   que preço maior nem sempre é escolha melhor.
4. **Marcas só por escrito.** Nome da marca na etiqueta da prateleira; a embalagem é um desenho
   genérico (caixa, pacote, lata) com cores. Nada de logotipo nem cópia de embalagem.
5. **Sem cronômetro, sem recorde de velocidade.** Uma compra leva de 3 a 6 minutos.
6. **Troco vai para o cofrinho** (Etapa 6): acumula entre partidas até realizar um "sonho"
   escolhido por ela. É o contrapeso de gastar tudo.

**O que só você pode fazer:**

- **Revisar a tabela da seção 3** (uns 10 minutos): trocar marcas pelas que vocês compram em casa,
  ajustar os corações ao gosto da família e corrigir algum preço que pareça fora. As diferenças
  de preço entre marcas são estimativa minha, não pesquisa.
- **Aprovar a arte** no fim da Etapa 4.
- **Decidir sobre as marcas num site público.** O site está aberto na internet. Citar nomes de
  marcas num jogo educativo sem fins comerciais é uso comum, mas se preferir zero risco, a troca
  por marcas inventadas é só editar `dados.js`; nada mais no jogo depende dos nomes.

**Números já validados em protótipo** (a seção 4.4 e o Apêndice A trazem o código): 9.000
missões sorteadas (3.000 por nível) sem nenhuma falha; orçamentos de R$ 15 a R$ 35 no nível 1,
R$ 30 a R$ 70 no 2 e R$ 45 a R$ 95 no 3; em média 19 cestas diferentes compram a lista, cabem no
orçamento e batem a meta no nível padrão; o mapa tem as 244 casas de piso ligadas e toda prateleira alcançável.

---

## 1. Pesquisa: arte e preços

### 1.1 Pixel art com licença livre

Pesquisa feita em 2026-11-14. Tilesets prontos de supermercado existem, mas os bons são pagos ou
não declaram licença (Snoblin, Maru_98, LimeZu Modern Interiors, Carbonova). A base escolhida é
a série **Roguelike** da Kenney, em domínio público (CC0 1.0), 16 × 16 px por tile:

| Pacote | Página | Arquivos | Uso aqui |
|---|---|---|---|
| Roguelike Modern City | https://kenney.nl/assets/roguelike-modern-city | 1.036 tiles | Pisos, paredes, **gôndolas com produtos**, geladeiras, balcões |
| Roguelike Indoors | https://kenney.nl/assets/roguelike-indoors | 480 tiles | Balcões, armários, bancadas (complemento do mesmo estilo) |
| RPG Urban Pack | https://kenney.nl/assets/rpg-urban-pack | 480 tiles | **Personagens com quadros de caminhada** nas 4 direções |

As três páginas declaram "License: Creative Commons CC0". As pré-visualizações foram
conferidas: o Modern City tem prateleiras de loja listradas e geladeiras; o Urban Pack tem as
colunas de personagens andando. O conteúdo exato (coordenadas de cada tile) é levantado na
Etapa 4.

Para os **ícones de produto** há conjuntos CC0 de comida 16 × 16 no OpenGameArt ("16x16 food",
de ARoachIFoundOnMyPillow; "Food Items 16x16", de Red_Voxel; "64 16x16 food sprites", de
Sanglorian; a coleção "CC0 Food Icons", de AntumDeluge). As páginas bloquearam leitura
automática, então **conteúdo e licença precisam ser conferidos pelo executor na Etapa 4** antes
de usar. Eles cobrem frutas, legumes e pães; produto embalado (caixa de leite, pacote de arroz)
quase não existe em pacote nenhum, por isso a seção 4.7 define moldes de embalagem próprios.

### 1.2 Preços

Base: pesquisa da cesta básica do Procon-SP em convênio com o Dieese, julho de 2026 (preços
médios em São Paulo). Exemplos usados na calibragem: leite UHT 1 L R$ 5,68 · pão de forma 500 g
R$ 6,80 · macarrão 500 g R$ 3,39 · feijão 1 kg R$ 8,96 · arroz 5 kg R$ 19,63 · café 500 g
R$ 24,95 · ovos (dúzia) R$ 10,74 · óleo de soja R$ 7,37 · batata 1 kg R$ 8,20 · cebola 1 kg
R$ 7,89 · margarina 250 g R$ 3,82 · detergente R$ 2,35 · papel higiênico 4 rolos R$ 6,53 ·
creme dental R$ 4,99 · sabonete R$ 2,09 · biscoito recheado R$ 2,80.

A opção do meio de cada produto fica perto dessa média. A distância entre marcas e os preços
dos produtos que a pesquisa não cobre (iogurte, suco, guloseimas, hortifrúti por tipo) são
**estimativas**: servem para o jogo, não são pesquisa de preço.

---

## 2. Mecânica fechada

### 2.1 Identidade

| Campo | Valor |
|---|---|
| Nome | **Mercadinho** |
| Pasta | `Games/mercadinho/` |
| `jogoId` (progresso, configurações, Vite) | `mercadinho` |
| Ícone do cartão e favicon | 🛒 |
| Título da página | `Mercadinho — Jogos da Elis` |
| Nome da loja dentro do jogo | "Mercadinho da Esquina" (inventado; não usar nome de rede real) |
| Objetivo pedagógico | Sistema monetário, adição e subtração com centavos, multiplicação por quantidade, estimativa, comparação de preços e escolha com orçamento limitado (BNCC EF04MA10 e EF04MA25) |

### 2.2 Fluxo completo

```
INÍCIO ──► MISSÃO ──► LOJA ◄──────────────┐
(nível)   (lista e    (andar, prateleiras, │ faltou item
           dinheiro)   carrinho, espiar)   │ ou estourou
                          │                │
                          ▼                │
                        CAIXA ─────────────┘
                     (cupom, contas)
                          │ pagou
                          ▼
                      RESULTADO ──► jogar de novo / trocar nível
                  (estrelas, escolhas, cofrinho)
```

1. **Início:** título, três botões de nível (o salvo nas configurações vem marcado), o cofrinho
   (Etapa 6), a opção "Andar pelo mercado" ou "Lista rápida" (seção 2.12) e COMEÇAR.
2. **Missão:** cartão com o tema, a frase do convite, a lista com quantidades, o dinheiro e a
   meta de corações. Botão "Vamos às compras!".
3. **Loja:** mapa navegável com o painel fixo (dinheiro, lista, corações, carrinho).
4. **Caixa:** ao tocar num caixa. Confere lista, imprime o cupom, faz as contas do nível.
5. **Resultado:** três objetivos, estrelas, resumo das escolhas, troco no cofrinho.

Não existe tela de derrota, vida, cronômetro nem contagem regressiva em nenhuma fase.

### 2.3 A missão: lista, orçamento e meta de corações

Uma missão é gerada por `gerarMissao({ nivel, semente })` (seção 4.4) e contém:

- `itens`: produtos da lista, cada um com quantidade.
- `orcamento`: quanto ela tem, em centavos, sempre múltiplo de R$ 1,00.
- `metaCoracoes`: quantos corações deixam a "família feliz".
- `maximoCoracoes`: o máximo que dá para alcançar com esse orçamento (referência do resultado).

**Regras que valem em toda missão** (o gerador garante; os testes conferem):

1. Dá para comprar a lista inteira com as opções mais baratas e ainda sobra dinheiro.
2. **Não** dá para comprar a opção de mais corações de todos os itens.
3. A cesta mais barata **não** alcança a meta de corações.
4. Existe pelo menos uma cesta que compra tudo, cabe no orçamento e alcança a meta.

**Corações.** Cada opção de produto vale de 1 a 3 corações; cada linha da lista conta os
corações da opção escolhida **uma vez**, não importa a quantidade. Cada guloseima vale de 1 a 3
corações. Produto que não está na lista do dia não pode ser comprado (seção 2.6).

**Guloseimas (desejos).** Ficam na gôndola perto dos caixas. Limite por compra: 1 no nível 1,
2 nos níveis 2 e 3. O texto do limite na tela: "Hoje pode levar até 2 guloseimas."

### 2.4 Níveis

| | Revisão (`1`) | Intermediário (`2`, padrão) | Desafio (`3`) |
|---|---|---|---|
| Itens na lista | 3 | 5 | 7 |
| Opções por produto | 2 (a mais barata e a de mais corações) | todas (2 ou 3) | todas (2 ou 3) |
| Linhas com quantidade maior que 1 | nenhuma | até 2 sorteadas | até 3 sorteadas |
| Preços | arredondados para R$ 0,50 | arredondados para R$ 0,10 | de etiqueta (R$ 5,29; R$ 7,49) |
| Guloseimas por compra | 1 | 2 | 2 |
| Total do carrinho | sempre visível, com barra | escondido; **2 espiadas** | escondido; sem espiar |
| Subtotal de linha com quantidade | mostrado | escondido ("3 × R$ 3,30") | escondido |
| Prateleiras da lista marcadas no mapa | sim (balão "!") | não | não |
| Contas no caixa | troco, 3 alternativas | troco, digitado | total da compra e troco, digitados |
| Folga da meta (`tolerancia`) | máximo − 2 | máximo − 1 | máximo − 1 |
| Orçamentos típicos | R$ 15 a R$ 35 | R$ 30 a R$ 70 | R$ 45 a R$ 95 |

Iogurte e suco de caixinha só existem em quantidade 2 ou mais; nos níveis 2 e 3 eles vêm sempre
assim, além das linhas sorteadas.

O nível vem de `obterConfiguracoes().niveis.mercadinho` (padrão `'2'`), como nos outros jogos.

### 2.5 A loja navegável

**Visão.** De cima e oblíqua (o chão visto de cima, os móveis mostrando a frente), como nos
RPGs de 16 bits. É o "3D falso" desta versão. Tiles de 16 × 16 px lógicos, ampliados por um
fator **inteiro** com `image-rendering: pixelated` e `imageSmoothingEnabled = false`.

**Mapa.** Fixo, 24 colunas × 16 linhas. A loja é sempre a mesma, para a Elis aprender onde fica
cada coisa, como num mercado de verdade.

```
     0         1         2
     012345678901234567890123
 0   ########################
 1   #LLLLLLLL..AAA...BBBB..#
 2   #......................#
 3   #H.....................#
 4   #H...PP..MM..MM..ZZ....#
 5   #H...PP..MM..M...ZZ....#
 6   #H...PP..MM......Z.....#
 7   #H...P...MM............#
 8   #H.....................#
 9   #H.....................#
10   #H.....................#
11   #H.....GGGGGG..GGGGGG..#
12   #H.....................#
13   #H......K...K...K......#
14   #..E...................#
15   ########################
```

Coluna `x` da esquerda para a direita, linha `y` de cima para baixo, as duas a partir de 0. A
mesma matriz, pronta para copiar, está na seção 4.5.

| Símbolo | Significado | Anda? |
|---|---|---|
| `#` | Parede | não |
| `.` | Piso | sim |
| `E` | Entrada: piso onde a personagem começa | sim |
| `H` `P` `L` `M` `A` `B` `Z` | Prateleira de uma seção; **cada casa é um produto** | não |
| `G` | Gôndola de guloseimas; cada casa é uma guloseima | não |
| `K` | Caixa | não |

| Letra | Seção | Produtos | Onde |
|---|---|---|---|
| `H` | Hortifrúti | 11 | parede esquerda |
| `L` | Laticínios e frios | 8 | parede do fundo, à esquerda (geladeiras) |
| `A` | Açougue | 3 | parede do fundo, ao centro |
| `B` | Bebidas | 4 | parede do fundo, à direita |
| `P` | Padaria e matinais | 7 | primeira gôndola |
| `M` | Mercearia | 11 | segunda e terceira gôndolas |
| `Z` | Limpeza e higiene | 5 | quarta gôndola |
| `G` | Guloseimas | 12 | em frente aos caixas |

A ordem dos produtos dentro de cada seção é a ordem de leitura das casas (linha por linha, da
esquerda para a direita) casada com a ordem dos produtos daquela seção na tabela da seção 3.

**Tamanho na tela.** `escala = clamp(floor(larguraDoCanvas / 144), 3, 5)`. Em 360 px de largura
a escala é 3: cada casa tem 48 px (acima do alvo mínimo de 44 px) e aparecem 7,5 casas de
largura. A altura do canvas é `min(60vh, 8 casas)`.

**Câmera.** Centralizada na personagem e presa aos limites do mapa (nunca mostra fora da loja).

**Andar.**
- Toque ou clique numa casa de piso: a personagem segue o caminho mais curto (busca em largura,
  4 direções) a 6 casas por segundo.
- Toque numa prateleira, guloseima ou caixa: ela anda até a casa livre vizinha mais próxima e o
  painel abre sozinho ao chegar.
- Teclado: setas ou WASD andam uma casa; Enter ou Espaço abre a prateleira à frente.
- Quando há prateleira vizinha, aparece embaixo do mapa um botão grande com o nome dela
  ("Ver: Leite"). Serve para teclado, leitor de tela e para quem não percebeu que pode tocar.
- Um novo toque durante a caminhada troca o destino. Abrir qualquer painel para a personagem.
- Com `prefers-reduced-motion: reduce`: sem quadros de caminhada e sem deslizar; a personagem
  aparece na casa de destino depois de 150 ms.

**Achar os produtos.** Cada prateleira mostra o ícone do seu produto. Cada seção tem uma placa
com o nome. O painel fixo mostra "📍 Você está em: Padaria". Na lista de compras, cada item traz
a seção ("Leite · Laticínios"). No nível 1, as prateleiras de itens que ainda faltam têm um
balão "!".

### 2.6 A prateleira (painel do produto)

Painel em DOM sobre o mapa (não é canvas), com foco preso enquanto aberto e fechamento por ✕,
Esc ou toque fora.

- Cabeçalho: nome do produto e medida ("Leite · 1 litro"). Se está na lista: "Na lista: 2".
- Um cartão por opção, da mais barata para a mais cara: desenho da embalagem, **marca**, preço
  grande, corações (❤️ cheios e 🤍 vazios até 3, com `aria-label="2 de 3 corações"`).
- Seletor de quantidade (− 1 +, de 1 a 6), que abre no valor **1** em todos os níveis: ler a
  quantidade na lista é parte do exercício.
- Botão "Colocar no carrinho". Se o produto já está no carrinho com outra opção, o botão vira
  "Trocar por esta" e mantém a quantidade escolhida agora. **Um produto tem uma opção só no
  carrinho.**
- Produto fora da lista do dia: os cartões aparecem com preço (ela pode olhar e comparar), sem
  botão, com o aviso "Hoje isto não está na lista."
- Guloseima: um cartão só, com "Levar" ou "Devolver". Atingido o limite, "Levar" fica
  desabilitado com o texto do limite.
- No nível 1, a etiqueta mostra também o subtotal ("2 × R$ 5,50 = R$ 11,00"). Nos níveis 2 e 3,
  só "2 × R$ 5,30".

### 2.7 Painel fixo, carrinho e espiada

Painel fixo (DOM, acima do mapa), sempre visível na loja:

| Elemento | Conteúdo |
|---|---|
| 💰 Dinheiro | "Você tem R$ 55,00" (nunca muda durante a compra) |
| 📝 Lista | "3 de 5" e botão que abre a lista com ✓ nos itens completos |
| ❤️ Corações | "9 de 12". Ao bater a meta, ganha ✓ e continua contando ("13 de 12 ✓") |
| 🛒 Carrinho | Quantidade de itens e botão que abre o carrinho |
| 👀 Espiar (só nível 2) | "Espiar o total (2)". Mostra o total por 4 s e gasta uma espiada |
| 📍 Seção | Nome da seção mais próxima |

**Total visível (nível 1):** "No carrinho: R$ 18,50" e uma barra que enche até o orçamento:
verde até 80%, amarela até 100%, vermelha acima.

**Carrinho (painel):** uma linha por produto com marca, quantidade, preço unitário e botões
`−`, `+` e 🗑️. Trocar de marca exige voltar à prateleira. Nos níveis 2 e 3 o carrinho **não**
mostra subtotais nem total: é a "notinha" para ela somar de cabeça ou no papel. Uma dica fixa no
rodapé do carrinho: "Dica: arredonde! R$ 4,90 é quase R$ 5,00."

**Linha completa:** a linha da lista ganha ✓ quando a quantidade no carrinho é maior ou igual à
pedida. Levar a mais é permitido (custa dinheiro) e aparece no resultado ("Você levou 1 iogurte
a mais").

### 2.8 O caixa

Ao chegar a um caixa (`K`):

1. **Falta item?** "Ainda falta: leite e pão de forma." Botão "Voltar às compras". Não conta
   erro.
2. **Cupom.** A lista de itens aparece linha a linha (200 ms por linha; botão "Pular"; com
   movimento reduzido aparece inteira).
3. **Conta do total (só nível 3).** "Quanto deu a compra?" com o teclado numérico. Duas
   tentativas. Na segunda falha, mostra a soma armada e segue.
4. **Total revelado** (em todos os níveis, depois do passo 3).
5. **Estourou?** Se total > orçamento: "Ih, passou! A compra deu R$ 57,40 e você tem R$ 55,00.
   Passou R$ 2,40. Vamos devolver ou trocar alguma coisa?" Botão "Voltar às compras". Conta
   **1 estouro**. Ela volta para a loja com o carrinho como estava e o total volta a ficar
   escondido.
6. **Conta do troco.** "Você entrega R$ 55,00. A compra deu R$ 52,10. Quanto volta de troco?"
   - Nível 1: três alternativas (a certa, a certa + R$ 1,00 e a certa − R$ 1,00; se a última
     ficar negativa, usa a certa + R$ 0,50), embaralhadas.
   - Níveis 2 e 3: teclado numérico.
   - Duas tentativas. Na segunda falha, mostra a subtração armada e a resposta.
7. **Pagou:** som de vitória, confete, tela de resultado.

**Teclado numérico (caixa registradora).** Dez botões de dígito, ⌫ e OK. Os dígitos entram
pela direita, em centavos: tocar 5, 2, 1, 0 mostra R$ 0,05 → R$ 0,52 → R$ 5,21 → R$ 52,10.
Limite de R$ 999,99. Assim não existe vírgula para errar.

**Conta armada** (em `<pre>`, fonte monoespaçada, alinhada pela vírgula):

```
  55,00
− 52,10
───────
   2,90
```

### 2.9 Resultado e estrelas

Uma estrela por objetivo, mostrados como lista de conferência:

| Objetivo | Regra | Estrela |
|---|---|---|
| ✅ **Missão cumprida** | Pagou a compra com tudo da lista dentro do orçamento | sempre que termina |
| ✅ ou ⬜ **Família feliz** | Corações do carrinho pago ≥ `metaCoracoes` | +1 |
| ✅ ou ⬜ **Contas certas** | Nenhum estouro **e** todas as contas do caixa certas na primeira tentativa | +1 |

Espiar não tira estrela. Depois das estrelas:

- **Suas escolhas:** uma linha por item ("Leite: Piracanjuba, a do meio" · "Café: Caboclo, a
  mais em conta" · "Ovos: caipiras, a queridinha da família"). Vocabulário fixo: "a mais em
  conta", "a do meio", "a queridinha da família". Nunca "pior", "ruim" ou "fraca".
- **Guloseimas:** "Você levou um Bis." ou "Você não levou guloseima."
- **Corações:** "12 corações. O máximo possível hoje era 13."
- **Troco:** "Sobrou R$ 2,90." (na Etapa 6: "Foi para o cofrinho 🐷")
- Botões "JOGAR DE NOVO" (missão nova, mesmo nível) e "TROCAR NÍVEL".

`registrarPartida('mercadinho', { acertos, erros, estrelas })` com `estrelas` explícito (1 a 3),
`acertos` = contas certas de primeira e `erros` = contas erradas na primeira tentativa +
estouros.

### 2.10 Cofrinho e sonhos (Etapa 6)

- O troco de cada compra paga entra no cofrinho, que fica em
  `localStorage['jogos-elis:mercadinho']`.
- Na tela inicial ela escolhe um **sonho** para juntar (lista na seção 3.4) e vê a barra
  "R$ 12,40 de R$ 25,00".
- Quando o cofrinho alcança o preço, aparece "Você juntou o suficiente!" com o botão "Realizar
  o sonho": desconta o preço, guarda o sonho na **estante** (fileira de ícones na tela inicial)
  e pede a escolha do próximo.
- O cofrinho nunca diminui a não ser ao realizar um sonho. Não tem prazo nem "dias seguidos".

Formato (versão 1):

```json
{ "versao": 1, "cofrinho": 1240, "sonhoAtual": "canetinhas",
  "sonhosRealizados": ["caderno"], "compras": 7, "tutorialVisto": true }
```

Leitura defensiva: JSON inválido, versão desconhecida ou `localStorage` bloqueado devolvem o
estado inicial sem erro. O botão "Zerar progresso" de `configuracoes.html` também apaga esta
chave.

### 2.11 Textos principais

Todo texto em pt-BR, frases curtas, acentuação correta. O nome vem de `nomeDaCrianca()`.

| Momento | Texto |
|---|---|
| Início | "Faça as compras sem estourar o dinheiro e deixe a família feliz!" |
| Missão | "{convite do tema} Você tem **R$ 55,00**. A família fica feliz com **12 ❤️** ou mais." |
| Limite de guloseimas | "Hoje pode levar até 2 guloseimas." |
| Fora da lista | "Hoje isto não está na lista." |
| Espiada | "Total até agora: R$ 31,20" |
| Sem espiadas | "As espiadas acabaram. Some de cabeça!" |
| Falta item | "Ainda falta: {itens}." |
| Estouro | "Ih, passou! A compra deu {total} e você tem {orçamento}. Passou {diferença}. Vamos devolver ou trocar alguma coisa?" |
| Conta certa | "Isso mesmo!" |
| Conta errada, 1.ª vez | "Quase! Confira e tente de novo." |
| Conta errada, 2.ª vez | "Vamos ver juntas:" seguido da conta armada |
| Resultado, 3 estrelas | "{nome}, compra perfeita!" |
| Resultado, 2 estrelas | "{nome}, muito bem! Faltou pouco." |
| Resultado, 1 estrela | "{nome}, compra feita! Na próxima dá para caprichar mais." |
| Rodapé do início | "As marcas aparecem só para brincar de fazer compras. Os preços são inventados com base em 2026." |

### 2.12 Lista rápida (sem mapa) e acessibilidade

- **Lista rápida:** na tela inicial, a opção "Lista rápida" troca o mapa por botões das 8
  seções; cada seção lista seus produtos e abre o mesmo painel de prateleira. Tudo o mais é
  igual. Serve para leitor de tela, para aparelho muito lento e como **reserva automática** se
  o canvas ou as imagens não carregarem. A escolha fica em `localStorage` junto do cofrinho
  (campo `modoLista`, padrão `false`).
- O canvas tem `role="img"` e `aria-label` descritivo; uma região `aria-live="polite"` anuncia
  "Você está em frente a: Leite", "Leite Piracanjuba no carrinho", "Faltam 2 itens".
- Tudo funciona só com teclado: Tab alcança painel fixo, botão "Ver: ...", painéis e teclado
  numérico; foco visível; Esc fecha painéis e devolve o foco.
- Alvos de toque ≥ 44 px; texto ≥ 18 px; sem rolagem horizontal em 360 px.
- Preço nunca é informado só por cor: a barra do nível 1 tem também o valor escrito.

---

## 3. Dados

Tudo em `Games/mercadinho/dados.js`. Preços em **centavos inteiros** (nunca ponto flutuante).
O preço guardado é o **de etiqueta**; os níveis 1 e 2 derivam dele por `precoNoNivel()`
(seção 4.3). Emoji é só reserva para a lista rápida e para antes da arte final; pode repetir.
Não usar emoji posterior ao Unicode 12 (2019), para não virar quadrado em tablet antigo.

Cabeçalho obrigatório do arquivo:

```js
/**
 * Catálogo do Mercadinho.
 * As marcas são citadas só pelo nome, para a brincadeira parecer uma compra de verdade.
 * Os preços são de brincadeira, inspirados na cesta básica do Procon-SP/Dieese de julho de 2026.
 * Os corações são o gosto da nossa família, não avaliação de qualidade.
 * Para trocar uma marca, um preço ou os corações, edite só este arquivo e rode `npm test`.
 */
```

### 3.1 Produtos (49)

Formato: `{ id, nome, emoji, secao, medida, quantidades, opcoes: [{ id, rotulo, preco, coracoes }] }`.
O `id` da opção é `<id do produto>-<posição>` (`leite-1`, `leite-2`, `leite-3`). As opções vêm
sempre da mais barata para a mais cara. `quantidades` lista as quantidades que a lista pode
pedir (padrão `[1]`).

**Hortifrúti** — `secao: 'hortifruti'`, letra `H` no mapa, 11 produtos

| `id` | Nome | Emoji | Medida | Quantidades | Opção 1 | Opção 2 | Opção 3 |
|---|---|---|---|---|---|---|---|
| `banana` | Banana | 🍌 | 1 kg | 1 | Nanica · R$ 5,99 · 1 ❤️ | Prata · R$ 7,99 · 2 ❤️ | Orgânica · R$ 10,99 · 3 ❤️ |
| `maca` | Maçã | 🍎 | 1 kg | 1 | Gala · R$ 9,99 · 2 ❤️ | Fuji · R$ 11,99 · 3 ❤️ | — |
| `laranja` | Laranja | 🍊 | 1 kg | 1 | Pera · R$ 4,99 · 2 ❤️ | Lima · R$ 6,99 · 2 ❤️ | Baía · R$ 7,99 · 3 ❤️ |
| `tomate` | Tomate | 🍅 | 1 kg | 1 | Salada · R$ 7,99 · 1 ❤️ | Italiano · R$ 9,49 · 2 ❤️ | Orgânico · R$ 13,99 · 3 ❤️ |
| `alface` | Alface | 🥬 | 1 unidade | 1 | Crespa · R$ 3,49 · 2 ❤️ | Americana · R$ 4,99 · 2 ❤️ | Hidropônica · R$ 5,49 · 3 ❤️ |
| `cenoura` | Cenoura | 🥕 | 1 kg | 1 | Comum · R$ 5,99 · 2 ❤️ | Orgânica · R$ 9,99 · 3 ❤️ | — |
| `batata` | Batata | 🥔 | 1 kg | 1 | Lavada · R$ 8,19 · 2 ❤️ | Asterix · R$ 9,99 · 3 ❤️ | — |
| `cebola` | Cebola | 🧅 | 1 kg | 1 | Branca · R$ 7,89 · 2 ❤️ | Roxa · R$ 10,99 · 3 ❤️ | — |
| `mamao` | Mamão | 🍈 | 1 unidade | 1 | Papaia · R$ 5,99 · 2 ❤️ | Formosa · R$ 8,99 · 3 ❤️ | — |
| `uva` | Uva | 🍇 | bandeja 500 g | 1 | Niágara · R$ 8,99 · 2 ❤️ | Sem semente · R$ 11,99 · 3 ❤️ | — |
| `morango` | Morango | 🍓 | bandeja | 1 | Comum · R$ 9,99 · 2 ❤️ | Orgânico · R$ 14,99 · 3 ❤️ | — |

**Padaria e matinais** — `secao: 'padaria'`, letra `P` no mapa, 7 produtos

| `id` | Nome | Emoji | Medida | Quantidades | Opção 1 | Opção 2 | Opção 3 |
|---|---|---|---|---|---|---|---|
| `pao-de-forma` | Pão de forma | 🍞 | 500 g | 1 | Panco · R$ 6,49 · 1 ❤️ | Pullman · R$ 7,99 · 2 ❤️ | Wickbold · R$ 9,49 · 3 ❤️ |
| `bisnaguinha` | Bisnaguinha | 🥐 | pacote | 1 | Panco · R$ 6,99 · 2 ❤️ | Seven Boys · R$ 7,49 · 2 ❤️ | Pullman · R$ 8,49 · 3 ❤️ |
| `pao-de-hot-dog` | Pão de hot-dog | 🥖 | pacote | 1 | Panco · R$ 6,29 · 2 ❤️ | Pullman · R$ 7,49 · 3 ❤️ | — |
| `biscoito-recheado` | Biscoito recheado | 🍪 | pacote | 1, 2 | Passatempo · R$ 3,29 · 2 ❤️ | Trakinas · R$ 3,79 · 3 ❤️ | Oreo · R$ 4,49 · 3 ❤️ |
| `cream-cracker` | Biscoito cream cracker | 🍘 | 200 g | 1 | Marilan · R$ 2,99 · 1 ❤️ | Bauducco · R$ 3,99 · 2 ❤️ | Piraquê · R$ 4,79 · 3 ❤️ |
| `achocolatado` | Achocolatado em pó | 🍫 | pote | 1 | Toddy · R$ 7,49 · 2 ❤️ | Nescau · R$ 8,49 · 3 ❤️ | Ovomaltine · R$ 12,90 · 3 ❤️ |
| `cafe` | Café em pó | ☕ | 250 g | 1 | Caboclo · R$ 11,49 · 1 ❤️ | Pilão · R$ 12,99 · 2 ❤️ | Melitta · R$ 13,99 · 3 ❤️ |

**Laticínios e frios** — `secao: 'laticinios'`, letra `L` no mapa, 8 produtos

| `id` | Nome | Emoji | Medida | Quantidades | Opção 1 | Opção 2 | Opção 3 |
|---|---|---|---|---|---|---|---|
| `leite` | Leite | 🥛 | 1 litro | 1, 2, 3 | Italac · R$ 5,29 · 1 ❤️ | Piracanjuba · R$ 5,89 · 2 ❤️ | Ninho · R$ 7,49 · 3 ❤️ |
| `iogurte` | Iogurte de morango | 🍶 | garrafinha | 2, 3, 4 | Batavo · R$ 2,79 · 1 ❤️ | Nestlé · R$ 3,29 · 2 ❤️ | Danone · R$ 3,99 · 3 ❤️ |
| `manteiga` | Manteiga | 🧈 | 200 g | 1 | Italac · R$ 10,90 · 1 ❤️ | Itambé · R$ 12,49 · 2 ❤️ | Aviação · R$ 14,90 · 3 ❤️ |
| `margarina` | Margarina | 🍯 | 500 g | 1 | Primor · R$ 5,49 · 1 ❤️ | Delícia · R$ 6,99 · 2 ❤️ | Qualy · R$ 8,49 · 3 ❤️ |
| `queijo` | Queijo muçarela fatiado | 🧀 | 150 g | 1 | Seara · R$ 8,49 · 1 ❤️ | Sadia · R$ 9,79 · 2 ❤️ | Tirolez · R$ 11,49 · 3 ❤️ |
| `presunto` | Presunto fatiado | 🥓 | 200 g | 1 | Seara · R$ 6,49 · 2 ❤️ | Perdigão · R$ 7,29 · 2 ❤️ | Sadia · R$ 8,49 · 3 ❤️ |
| `requeijao` | Requeijão | 🥣 | copo 200 g | 1 | Itambé · R$ 7,49 · 1 ❤️ | Vigor · R$ 8,49 · 2 ❤️ | Catupiry · R$ 11,90 · 3 ❤️ |
| `ovos` | Ovos | 🥚 | dúzia | 1 | Brancos · R$ 10,79 · 2 ❤️ | Vermelhos · R$ 12,49 · 2 ❤️ | Caipiras · R$ 16,90 · 3 ❤️ |

**Mercearia** — `secao: 'mercearia'`, letra `M` no mapa, 11 produtos

| `id` | Nome | Emoji | Medida | Quantidades | Opção 1 | Opção 2 | Opção 3 |
|---|---|---|---|---|---|---|---|
| `arroz` | Arroz | 🍚 | 1 kg | 1 | Camil · R$ 5,49 · 2 ❤️ | Prato Fino · R$ 6,49 · 2 ❤️ | Tio João · R$ 7,49 · 3 ❤️ |
| `feijao` | Feijão carioca | 🍲 | 1 kg | 1 | Kicaldo · R$ 7,99 · 2 ❤️ | Camil · R$ 8,99 · 3 ❤️ | Broto Legal · R$ 9,49 · 3 ❤️ |
| `macarrao` | Macarrão espaguete | 🍝 | 500 g | 1, 2 | Galo · R$ 3,29 · 1 ❤️ | Adria · R$ 4,29 · 2 ❤️ | Barilla · R$ 6,99 · 3 ❤️ |
| `molho-de-tomate` | Molho de tomate | 🥫 | sachê 300 g | 1, 2 | Quero · R$ 2,79 · 1 ❤️ | Pomarola · R$ 3,99 · 2 ❤️ | Heinz · R$ 5,49 · 3 ❤️ |
| `oleo` | Óleo de soja | 🌻 | 900 ml | 1 | Coamo · R$ 6,99 · 2 ❤️ | Soya · R$ 7,39 · 2 ❤️ | Liza · R$ 7,89 · 2 ❤️ |
| `acucar` | Açúcar | 🧂 | 1 kg | 1 | Caravelas · R$ 3,99 · 2 ❤️ | Guarani · R$ 4,29 · 2 ❤️ | União · R$ 4,99 · 2 ❤️ |
| `farinha` | Farinha de trigo | 🌾 | 1 kg | 1 | Sol · R$ 4,19 · 2 ❤️ | Renata · R$ 4,99 · 2 ❤️ | Dona Benta · R$ 5,99 · 3 ❤️ |
| `fermento` | Fermento em pó | 🧁 | lata 100 g | 1 | Dona Benta · R$ 3,79 · 2 ❤️ | Royal · R$ 4,49 · 3 ❤️ | — |
| `leite-condensado` | Leite condensado | 🍮 | caixinha 395 g | 1 | Italac · R$ 5,49 · 2 ❤️ | Piracanjuba · R$ 5,99 · 2 ❤️ | Moça · R$ 7,99 · 3 ❤️ |
| `queijo-ralado` | Queijo ralado | 🧀 | pacote 50 g | 1 | Vigor · R$ 6,99 · 2 ❤️ | Faixa Azul · R$ 9,99 · 3 ❤️ | — |
| `milho` | Milho verde | 🌽 | lata | 1 | Predilecta · R$ 3,29 · 2 ❤️ | Quero · R$ 3,49 · 2 ❤️ | Bonduelle · R$ 5,49 · 3 ❤️ |

**Açougue** — `secao: 'acougue'`, letra `A` no mapa, 3 produtos

| `id` | Nome | Emoji | Medida | Quantidades | Opção 1 | Opção 2 | Opção 3 |
|---|---|---|---|---|---|---|---|
| `frango` | Filé de frango | 🍗 | 1 kg | 1 | Seara · R$ 19,90 · 2 ❤️ | Perdigão · R$ 21,90 · 2 ❤️ | Sadia · R$ 24,90 · 3 ❤️ |
| `carne-moida` | Carne moída | 🥩 | 500 g | 1 | Acém · R$ 16,99 · 2 ❤️ | Patinho · R$ 23,99 · 3 ❤️ | — |
| `salsicha` | Salsicha | 🌭 | 500 g | 1 | Seara · R$ 6,99 · 1 ❤️ | Perdigão · R$ 7,99 · 2 ❤️ | Sadia · R$ 9,49 · 3 ❤️ |

**Bebidas** — `secao: 'bebidas'`, letra `B` no mapa, 4 produtos

| `id` | Nome | Emoji | Medida | Quantidades | Opção 1 | Opção 2 | Opção 3 |
|---|---|---|---|---|---|---|---|
| `suco` | Suco de caixa | 🧃 | 1 litro | 1 | Maguary · R$ 6,49 · 1 ❤️ | Del Valle · R$ 7,99 · 2 ❤️ | Natural One · R$ 12,90 · 3 ❤️ |
| `suco-caixinha` | Suco de caixinha | 🧃 | 200 ml | 2, 3, 4 | Kapo · R$ 2,29 · 2 ❤️ | Maguary · R$ 2,79 · 2 ❤️ | Tial · R$ 3,99 · 3 ❤️ |
| `refrigerante` | Refrigerante | 🥤 | 2 litros | 1 | Dolly · R$ 5,49 · 1 ❤️ | Guaraná Antarctica · R$ 8,49 · 3 ❤️ | Coca-Cola · R$ 10,99 · 3 ❤️ |
| `agua` | Água mineral | 💧 | 1,5 litro | 1, 2 | Crystal · R$ 2,99 · 2 ❤️ | Bonafont · R$ 3,49 · 2 ❤️ | Minalba · R$ 3,79 · 2 ❤️ |

**Limpeza e higiene** — `secao: 'limpeza'`, letra `Z` no mapa, 5 produtos

| `id` | Nome | Emoji | Medida | Quantidades | Opção 1 | Opção 2 | Opção 3 |
|---|---|---|---|---|---|---|---|
| `detergente` | Detergente | 🧴 | 500 ml | 1 | Limpol · R$ 2,29 · 2 ❤️ | Minuano · R$ 2,39 · 2 ❤️ | Ypê · R$ 2,49 · 2 ❤️ |
| `sabao-em-po` | Sabão em pó | 🧺 | 800 g | 1 | Tixan Ypê · R$ 9,90 · 1 ❤️ | Brilhante · R$ 12,90 · 2 ❤️ | Omo · R$ 16,90 · 3 ❤️ |
| `papel-higienico` | Papel higiênico | 🧻 | 4 rolos | 1 | Mili · R$ 5,49 · 1 ❤️ | Personal · R$ 6,99 · 2 ❤️ | Neve · R$ 9,49 · 3 ❤️ |
| `creme-dental` | Creme dental | 😁 | 90 g | 1 | Sorriso · R$ 3,99 · 1 ❤️ | Colgate · R$ 5,49 · 2 ❤️ | Oral-B · R$ 6,99 · 3 ❤️ |
| `sabonete` | Sabonete | 🧼 | 1 unidade | 2, 3 | Lux · R$ 2,29 · 2 ❤️ | Protex · R$ 3,29 · 2 ❤️ | Dove · R$ 4,49 · 3 ❤️ |

No código o preço é o inteiro em centavos: "R$ 5,29" vira `preco: 529`.

**Regras dos dados** (conferidas por `conferirDados()` e por teste):

- `id` único, em kebab-case; `secao` existe; 2 ou 3 opções por produto.
- Preço inteiro e positivo; preços **estritamente crescentes** dentro do produto, inclusive
  depois do arredondamento do nível 2.
- Corações de 1 a 3 e **nunca decrescentes**: a opção mais cara nunca vale menos corações.
- Em hortifrúti, açougue (carne moída) e ovos, o rótulo é o **tipo** (Prata, Orgânica,
  Caipiras), não uma marca.
- Produtos com as três opções empatadas em corações (óleo, açúcar, água, detergente) são de
  propósito: a resposta esperta é a mais barata.

### 3.2 Guloseimas (12)

Formato: `{ id, nome, marca, emoji, preco, coracoes }`. Uma opção só por guloseima.

| `id` | Nome | Marca | Emoji | Preço | Corações |
|---|---|---|---|---|---|
| `batom` | Chocolate Batom | Garoto | 🍫 | R$ 1,99 | 1 |
| `toddynho` | Toddynho | Toddy | 🧃 | R$ 2,49 | 1 |
| `trident` | Chiclete Trident | Trident | 🍬 | R$ 2,99 | 1 |
| `kitkat` | KitKat | Nestlé | 🍫 | R$ 3,99 | 1 |
| `mms` | M&M's | M&M's | 🍬 | R$ 4,49 | 1 |
| `picole` | Picolé Fruttare | Kibon | 🍦 | R$ 5,49 | 2 |
| `fini` | Balas de gelatina | Fini | 🍬 | R$ 6,49 | 2 |
| `lacta` | Chocolate ao leite | Lacta | 🍫 | R$ 6,99 | 2 |
| `bis` | Bis | Lacta | 🍫 | R$ 7,49 | 2 |
| `ruffles` | Batata Ruffles | Elma Chips | 🍟 | R$ 8,99 | 2 |
| `gibi` | Gibi da Turma da Mônica | Panini | 📖 | R$ 9,90 | 3 |
| `kinder-ovo` | Kinder Ovo | Kinder | 🥚 | R$ 9,99 | 2 |

A ordem desta tabela é a ordem das 12 casas `G` do mapa.

### 3.3 Temas (10)

Formato: `{ id, titulo, emoji, convite, fixas, vagas }`. Cada **vaga** é uma lista de produtos
alternativos; o gerador sorteia um por vaga. As `fixas` primeiras vagas entram sempre; as
outras são embaralhadas e completam a lista até o tamanho do nível.

| `id` | Título | Emoji | Fixas | Vagas, na ordem (alternativas separadas por `/`) |
|---|---|---|---|---|
| `cafe-da-manha` | Café da manhã | ☕ | 2 | `pao-de-forma / bisnaguinha` · `leite` · `manteiga / margarina / requeijao` · `cafe / achocolatado` · `queijo / presunto` · `banana / mamao / laranja` · `suco / iogurte` · `ovos` |
| `lanche-da-escola` | Lanche da escola | 🎒 | 2 | `pao-de-forma / bisnaguinha` · `suco-caixinha` · `queijo / presunto / requeijao` · `maca / banana / uva` · `biscoito-recheado / cream-cracker` · `iogurte` · `agua` |
| `macarronada` | Macarronada de domingo | 🍝 | 2 | `macarrao` · `molho-de-tomate` · `carne-moida / frango / salsicha` · `queijo-ralado` · `tomate / cebola` · `alface / cenoura` · `suco / refrigerante` · `oleo` |
| `almoco` | Almoço de todo dia | 🍚 | 2 | `arroz` · `feijao` · `frango / carne-moida / ovos` · `oleo` · `tomate / alface / cenoura` · `batata / cebola` · `suco / agua` |
| `bolo` | Bolo de aniversário | 🎂 | 3 | `farinha` · `ovos` · `fermento` · `acucar` · `leite` · `manteiga / margarina` · `achocolatado / leite-condensado` · `refrigerante / suco` |
| `cachorro-quente` | Noite do cachorro-quente | 🌭 | 2 | `pao-de-hot-dog` · `salsicha` · `molho-de-tomate` · `milho` · `queijo-ralado / requeijao` · `refrigerante / suco` · `tomate / cebola / batata` |
| `salada-de-frutas` | Salada de frutas | 🍓 | 2 | `banana` · `maca` · `laranja` · `mamao` · `uva / morango` · `leite-condensado / iogurte` · `suco` |
| `compras-do-mes` | Compras da casa | 🧺 | 2 | `papel-higienico` · `sabao-em-po` · `arroz` · `feijao` · `detergente` · `creme-dental` · `sabonete` · `cafe` · `oleo / acucar` |
| `piquenique` | Piquenique no parque | 🌳 | 2 | `pao-de-forma / bisnaguinha` · `suco / suco-caixinha` · `queijo / presunto` · `uva / morango / maca` · `biscoito-recheado / cream-cracker` · `agua` · `iogurte` |
| `cafe-da-tarde` | Café da tarde com a vovó | 🫖 | 2 | `cafe / achocolatado` · `leite` · `cream-cracker / biscoito-recheado` · `requeijao / manteiga` · `queijo` · `bisnaguinha / pao-de-forma` · `mamao / banana` · `acucar` |

Convites (campo `convite`):

| Tema | Convite |
|---|---|
| `cafe-da-manha` | "Amanhã tem café da manhã caprichado!" |
| `lanche-da-escola` | "A lancheira da semana está vazia." |
| `macarronada` | "Domingo é dia de macarronada com a família." |
| `almoco` | "Acabou a comida do dia a dia em casa." |
| `bolo` | "Vai ter bolo de aniversário feito em casa!" |
| `cachorro-quente` | "Hoje é noite do cachorro-quente." |
| `salada-de-frutas` | "A sobremesa vai ser salada de frutas." |
| `compras-do-mes` | "Chegou o dia das compras da casa." |
| `piquenique` | "Sábado tem piquenique no parque." |
| `cafe-da-tarde` | "A vovó vem para o café da tarde." |

### 3.4 Sonhos do cofrinho (Etapa 6)

Formato: `{ id, nome, emoji, preco }`. Itens genéricos, sem marca.

| `id` | Nome | Emoji | Preço |
|---|---|---|---|
| `caderno` | Caderno de desenho | 📓 | R$ 15,00 |
| `canetinhas` | Jogo de canetinhas | 🖍️ | R$ 25,00 |
| `bola` | Bola de vôlei | 🏐 | R$ 40,00 |
| `pelucia` | Bichinho de pelúcia | 🧸 | R$ 60,00 |
| `livros` | Coleção de livros | 📚 | R$ 80,00 |
| `patins` | Patins | 🛼 | R$ 100,00 |

---

## 4. Arquitetura

### 4.1 Arquivos permitidos

**Criar:**

```
Games/mercadinho/
  index.html          Página: telas início, missão, loja, caixa e resultado; painéis
  mercadinho.css      Estilos próprios (o resto vem de shared/base.css)
  dados.js            Catálogo: produtos, desejos, temas, sonhos (seção 3)
  jogo.js             Motor puro: preços por nível, gerador de missão, compra, caixa, estrelas
  mapa.js             Puro: MAPA, seções, colisão, caminho, prateleira vizinha
  cofrinho.js         Puro + armazenamento injetável: cofrinho, sonhos, preferências (Etapa 6)
  arte.js             Recortes dos tiles, moldes de embalagem, cores por marca, carregamento
  renderizador.js     Canvas: câmera, camada do mapa, personagem, balões, placas
  tela.js             DOM, eventos, fases, painéis, sons
  arte-prova.html     Só para desenvolvimento (fora do build): folha de contato e prova da loja
public/figuras/mercadinho/
  *.png               Folhas de tiles CC0, sem edição
  LICENCA.txt         Origem, autor, licença e data de cada arquivo
tests/
  mercadinho.test.js       Dados, preços, gerador, compra, caixa, estrelas, cofrinho
  mercadinho-mapa.test.js  Mapa, colisão, caminho, casamento prateleira × produto
```

**Editar (só o indicado):**

| Arquivo | Mudança |
|---|---|
| `vite.config.ts` | Entrada `mercadinho: 'Games/mercadinho/index.html'` em `paginas` |
| `index.html` | Cartão 🛒 "Mercadinho" depois do Dinheirinho e `mercadinho: 'Mercadinho'` no objeto `nomes` |
| `shared/progresso.js` | `mercadinho: '2'` em `CONFIGURACOES_PADRAO.niveis` |
| `configuracoes.html` | `<select id="mercadinho">` com os 3 níveis, `'mercadinho'` no array `ids` e apagar `jogos-elis:mercadinho` no "Zerar progresso" |
| `README.md` | Tabela de jogos, árvore de pastas, lista de testes e créditos da arte |
| `MELHORIAS.md` | Atualizar a entrada J15 com o resultado |

### 4.2 Guardas (qualquer item reprova a etapa)

- Nenhuma dependência nova no `package.json`. Sem framework, sem CDN, sem requisição externa.
- `jogo.js`, `mapa.js` e `dados.js` não tocam em `document`, `window`, `localStorage`, relógio
  nem `Math.random` direto: o sorteio é sempre injetado (`criarGerador(semente)`).
- Dinheiro sempre em centavos inteiros. Proibido `parseFloat`, `toFixed` ou soma de reais com
  vírgula em qualquer conta. Formatação só por `formatarDinheiro`.
- Reutilizar, sem copiar: `formatarDinheiro` de `Games/dinheirinho/jogo.js`, `criarGerador` de
  `Games/labirinto/jogo.js`, `embaralhar` de `shared/texto.js`, e `sons`, `confete`,
  `progresso` e `cabecalho` de `shared/`.
- Nenhum logotipo, embalagem copiada, slogan ou imagem de marca. Nome de marca só como texto.
- Nenhum texto chama uma marca de ruim, pior ou fraca.
- Arte só com licença **CC0**. Qualquer outra licença exige aprovação do Diego antes do commit.
- Sem cronômetro, vida, derrota, recorde de tempo ou contador que diminui.
- Não alterar nenhum outro jogo nem remover funcionalidade existente.
- `arte-prova.html` não entra em `vite.config.ts`.

### 4.3 Preços por nível

```js
export const NIVEIS = {
  1: { itens: 3, linhasComQuantidade: 0, maximoDeDesejos: 1, tolerancia: 2, passos: [1000, 500, 200, 100], arredondar: 50, espiadas: 0 },
  2: { itens: 5, linhasComQuantidade: 2, maximoDeDesejos: 2, tolerancia: 1, passos: [1000, 500, 200, 100], arredondar: 10, espiadas: 2 },
  3: { itens: 7, linhasComQuantidade: 3, maximoDeDesejos: 2, tolerancia: 1, passos: [500, 200, 100], arredondar: 1, espiadas: 0 },
};
```

`precoNoNivel(preco, nivel)` = `Math.max(passo, Math.round(preco / passo) * passo)`, com
`passo = NIVEIS[nivel].arredondar`.

| Preço de etiqueta | Nível 1 | Nível 2 | Nível 3 |
|---|---|---|---|
| R$ 5,29 | R$ 5,50 | R$ 5,30 | R$ 5,29 |
| R$ 7,49 | R$ 7,50 | R$ 7,50 | R$ 7,49 |
| R$ 2,29 | R$ 2,50 | R$ 2,30 | R$ 2,29 |
| R$ 10,90 | R$ 11,00 | R$ 10,90 | R$ 10,90 |
| R$ 12,49 | R$ 12,50 | R$ 12,50 | R$ 12,49 |

`opcoesNoNivel(produto, nivel)` devolve as opções com o preço do nível. No nível 1 devolve só
duas: a mais barata e a de mais corações (a mais barata entre as empatadas).

`elegivel(produto, nivel)`: o produto só entra numa lista se a escolha for de verdade. Exige 2
ou mais opções com preços crescentes no nível; no nível 1, exige também R$ 1,00 ou mais de
diferença e corações diferentes. Com o catálogo desta versão ficam fora do nível 1: biscoito
recheado, óleo, açúcar, fermento, água e detergente. Nos níveis 2 e 3 todos entram.

### 4.4 O gerador de missões

Algoritmo de `gerarMissao({ nivel = 2, semente = Date.now(), temaId })` (o código de referência,
já validado, está no **Apêndice A** e deve ser portado sem mudar a ordem dos sorteios):

1. `rnd = criarGerador(semente)`.
2. Até 40 tentativas:
   1. Sorteia o tema (ou usa `temaId`).
   2. **Lista** (`montarLista`): percorre as vagas fixas e depois as outras embaralhadas; em
      cada vaga sorteia um produto elegível e ainda não usado; para ao completar
      `NIVEIS[nivel].itens`. Depois sorteia até `linhasComQuantidade` linhas, entre as que
      aceitam quantidade maior que 1, e dá a cada uma uma quantidade maior que 1. Produto que só
      existe em quantidade maior que 1 (iogurte, suco de caixinha) recebe a menor quantidade
      dele; no nível 1 tudo fica com 1.
   3. **Tabela de custos** (`tabelaDeCustos`): programação dinâmica que guarda, para cada soma
      de corações, o menor custo possível. `somenteLista` usa só os itens da lista;
      `comDesejos` permite até `maximoDeDesejos` guloseimas.
   4. `custoMinimo` = menor custo de `somenteLista`. `custoDoMelhor` = custo da soma máxima de
      corações de `somenteLista`. `amplitude = custoDoMelhor − custoMinimo`. Se
      `amplitude < AMPLITUDE_MINIMA[nivel]` (R$ 3,00 · R$ 4,00 · R$ 5,00), descarta.
   5. **Orçamento:** janela de `custoMinimo + 0,40 × amplitude` a `custoMinimo + 0,75 ×
      amplitude`. Percorre `passos` do maior para o menor e fica com o primeiro passo que tem
      múltiplo dentro da janela; entre os múltiplos desse passo, sorteia um. Sem múltiplo
      nenhum, descarta.
   6. `maximoCoracoes` = maior soma de corações de `comDesejos` com custo ≤ orçamento.
      `metaCoracoes = maximoCoracoes − tolerancia`.
   7. `coracoesDaCestaBarata` = maior soma de corações entre as cestas de custo mínimo. Se
      `metaCoracoes ≤ coracoesDaCestaBarata`, descarta.
   8. `custoDaMeta` = menor custo de `comDesejos` com corações ≥ meta. Devolve a missão.
3. Se as 40 tentativas falharem, devolve `MISSAO_RESERVA[nivel]`: uma missão fixa por nível,
   escrita em `jogo.js` e coberta por teste. (Em 9.000 sementes do protótipo isso nunca
   aconteceu; a reserva existe para o jogo nunca travar depois de uma edição de preços.)

Retorno:

```js
{ nivel, semente, temaId, titulo, itens: [{ produtoId, quantidade }],
  orcamento, metaCoracoes, maximoCoracoes,
  custoMinimo, custoDoMelhor, custoDaMeta, coracoesDaCestaBarata }
```

**Valores de conferência do porte** (com o catálogo exatamente como na seção 3; servem para a
Etapa 1 provar que o porte é fiel, não viram teste permanente porque mudam quando o Diego editar
preços):

| Nível | Semente | Tema | Itens | Orçamento | Meta | Máximo | `custoMinimo` | `custoDoMelhor` | `custoDaMeta` |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 7 | `cafe-da-manha` | pao-de-forma ×1, leite ×1, mamao ×1 | 2400 | 6 | 8 | 1800 | 2600 | 2000 |
| 1 | 8 | `lanche-da-escola` | pao-de-forma ×1, suco-caixinha ×1, queijo ×1 | 2200 | 5 | 7 | 1750 | 2500 | 1900 |
| 2 | 7 | `cafe-da-manha` | pao-de-forma ×1, leite ×2, mamao ×1, ovos ×1, cafe ×1 | 5500 | 12 | 13 | 4540 | 6440 | 5210 |
| 2 | 8 | `lanche-da-escola` | pao-de-forma ×1, suco-caixinha ×2, queijo ×1, agua ×1, biscoito-recheado ×2 | 3500 | 11 | 12 | 2920 | 3960 | 3300 |
| 3 | 7 | `cafe-da-manha` | pao-de-forma ×1, leite ×2, mamao ×1, ovos ×1, cafe ×1, queijo ×1, iogurte ×3 | 7500 | 16 | 17 | 6220 | 8781 | 7170 |
| 3 | 8 | `lanche-da-escola` | pao-de-forma ×1, suco-caixinha ×2, queijo ×1, agua ×2, biscoito-recheado ×1, banana ×1, iogurte ×4 | 5500 | 15 | 16 | 4598 | 6568 | 5248 |

Valores de dinheiro em centavos.

### 4.5 Mapa (`mapa.js`)

```js
export const MAPA = Object.freeze([
  '########################',
  '#LLLLLLLL..AAA...BBBB..#',
  '#......................#',
  '#H.....................#',
  '#H...PP..MM..MM..ZZ....#',
  '#H...PP..MM..M...ZZ....#',
  '#H...PP..MM......Z.....#',
  '#H...P...MM............#',
  '#H.....................#',
  '#H.....................#',
  '#H.....................#',
  '#H.....GGGGGG..GGGGGG..#',
  '#H.....................#',
  '#H......K...K...K......#',
  '#..E...................#',
  '########################',
]);
```

24 colunas × 16 linhas; 244 casas de piso (contando a entrada), todas ligadas.

| Função | O que faz |
|---|---|
| `SECOES` | `{ H: { id: 'hortifruti', nome: 'Hortifrúti', emoji }, ... }` para as 7 letras de seção |
| `celulaEm(x, y)` | `{ tipo: 'parede' \| 'piso' \| 'produto' \| 'desejo' \| 'caixa', id?, secao? }` |
| `podeAndar(x, y)` | `true` só para `.` e `E`; fora do mapa é `false` |
| `entrada()` | `{ x: 3, y: 14 }` |
| `casasDe(produtoId)` / `casaDoDesejo(id)` | Posição da prateleira de cada produto e guloseima |
| `caminho(de, para)` | Lista de casas do caminho mais curto (busca em largura, 4 direções); `[]` se `de` = `para`; `null` se não há caminho |
| `vizinhaLivre(de, alvo)` | A casa de piso vizinha de `alvo` (4 direções) mais perto de `de` pelo caminho |
| `prateleirasVizinhas(posicao)` | Prateleiras, guloseimas e caixas nas 4 casas ao redor |
| `secaoMaisProxima(posicao)` | Seção da prateleira mais próxima (distância de Manhattan) |

O casamento prateleira × produto segue a ordem de leitura das casas de cada letra e a ordem dos
produtos da seção em `dados.js`. Um teste confere que cada letra tem exatamente tantas casas
quantos produtos (`H` 11, `P` 7, `L` 8, `M` 11, `A` 3, `B` 4, `Z` 5, `G` 12).

### 4.6 A compra (`jogo.js`)

O estado da compra é um objeto simples; as funções devolvem um **novo** estado (não mutam).

```js
{ missao,
  carrinho: { [produtoId]: { opcaoId, quantidade } },
  desejos: [desejoId],
  espiadasRestantes, estouros: 0,
  contas: [{ tipo: 'total' | 'troco', certaDePrimeira: boolean }],
  paga: false }
```

| Função | O que faz |
|---|---|
| `criarCompra(missao)` | Estado inicial, com `espiadasRestantes = NIVEIS[nivel].espiadas` |
| `colocarNoCarrinho(compra, produtoId, opcaoId, quantidade)` | Põe ou troca a opção. Recusa produto fora da lista, opção que não existe no nível e quantidade fora de 1 a 6 (`{ compra, recusa: 'fora-da-lista' \| 'opcao' \| 'quantidade' }`) |
| `mudarQuantidade(compra, produtoId, quantidade)` | 0 tira do carrinho |
| `levarDesejo(compra, desejoId)` / `devolverDesejo` | Respeita `maximoDeDesejos` (`recusa: 'limite'`) |
| `totalDoCarrinho(compra)` | Centavos, com os preços do nível |
| `coracoesDoCarrinho(compra)` | Uma vez por linha + guloseimas |
| `faltando(compra)` | Itens da lista ausentes ou com quantidade menor que a pedida |
| `aMais(compra)` | Itens com quantidade maior que a pedida |
| `espiar(compra)` | `{ compra, total }` e gasta uma espiada; `{ recusa: 'sem-espiadas' }` se acabou |
| `chegarAoCaixa(compra)` | `{ situacao: 'falta-item', faltando }` · `{ situacao: 'estourou', total, diferenca, compra }` (soma 1 estouro) · `{ situacao: 'ok', total, troco }` |
| `responderConta(compra, tipo, valor, tentativa)` | `{ compra, certa, respostaCerta }`; só a tentativa 1 conta para `certaDePrimeira` |
| `pagar(compra)` | Marca `paga` |
| `resultadoDaCompra(compra)` | `{ estrelas, objetivos: { missaoCumprida, familiaFeliz, contasCertas }, coracoes, troco, escolhas, aMais, acertos, erros }` |
| `digitar(valor, tecla)` | Dígito: `min(99999, valor * 10 + d)` · `'apagar'`: `floor(valor / 10)` |
| `alternativasDeTroco(troco, rnd)` | 3 valores diferentes, não negativos, com o certo; embaralhados |
| `contaArmada(a, b, operacao)` | Linhas de texto alinhadas pela vírgula para o `<pre>` |
| `conferirDados()` | Lista de problemas do catálogo (vazia = tudo certo) |

`escolhas` do resultado: para cada item, `{ produtoId, rotulo, posicao: 'em-conta' | 'meio' |
'queridinha' }`. Com 2 opções só existem `'em-conta'` e `'queridinha'`.

### 4.7 Arte (`arte.js`) e desenho (`renderizador.js`)

A arte é uma **camada trocável**. O `renderizador.js` só chama funções de `arte.js` e nunca sabe
de onde o desenho vem. Isso permite desenvolver a loja com arte provisória (Etapa 3) e trocar
pela final (Etapa 4) sem tocar na lógica.

| Função de `arte.js` | Provisória (Etapa 3) | Final (Etapa 4) |
|---|---|---|
| `carregarArte()` | Resolve na hora | Carrega os PNG de `public/figuras/mercadinho/`; se falhar, cai na provisória |
| `desenharCasa(ctx, celula, x, y)` | Retângulo de cor por tipo e seção | Recorte da folha da Kenney |
| `desenharProduto(ctx, produtoId, opcaoId, x, y)` | Emoji do produto | Ícone CC0 ou molde de embalagem com as cores da marca |
| `desenharPersonagem(ctx, direcao, quadro, x, y)` | Círculo com seta | Personagem do RPG Urban Pack, 4 direções × quadros de caminhada |
| `criarIcone(produtoId, opcaoId, escala)` | `<span>` com emoji | `<canvas>` ampliado com `image-rendering: pixelated`, para os painéis |

**Folhas da Kenney.** Copiar para `public/figuras/mercadinho/` os PNG de folha (spritesheet)
dos pacotes, **sem editar**. Os tiles têm 16 × 16 px; na série Roguelike há 1 px de espaço entre
eles (passo de 17 px) — confirmar no arquivo `Tilesheet.txt` ou equivalente de cada pacote. As
coordenadas ficam numa tabela `RECORTES` em `arte.js`:

```js
export const RECORTES = {
  piso: { folha: 'cidade', coluna: 0, linha: 0 },   // preencher na Etapa 4
  parede: { folha: 'cidade', coluna: 0, linha: 0 },
  // gondola, geladeira, balcao, banca, caixa, porta, placa...
};
```

**Moldes de embalagem.** Produto embalado é desenhado por código a partir de um molde 16 × 16,
recolorido por marca. Um molde é uma lista de 16 textos de 16 letras:

| Letra | Cor |
|---|---|
| `.` | transparente |
| `o` | contorno (`#2b2b3a`) |
| `a` | cor principal da marca |
| `b` | cor principal escurecida 25% (sombra) |
| `c` | cor do rótulo (segunda cor da marca) |
| `w` | brilho (`#ffffff`) |

Exemplo de formato (caixa longa vida):

```js
const CAIXA_LONGA_VIDA = [
  '................',
  '....oooooooo....',
  '...oaaaaaaaao...',
  '..oaaaaaaaaaao..',
  '..obbbbbbbbbbo..',
  '..oaaaaaaaaaao..',
  '..oawwaaaaaaao..',
  '..oaccccccccao..',
  '..oaccccccccao..',
  '..oaccccccccao..',
  '..oaccccccccao..',
  '..oaaaaaaaaaao..',
  '..oaaaaaaaaabo..',
  '..oaaaaaaaabbo..',
  '...oooooooooo...',
  '................',
];
```

Moldes necessários (10): caixa longa vida, pacote (arroz, feijão, açúcar, café), lata, garrafa,
pote ou copo, caixa de papelão (biscoito, creme dental), bandeja (frios, uva, morango), frasco
(detergente), barra (chocolate, sabonete) e saquinho (salgadinho, balas). `MOLDE_DO_PRODUTO`
liga cada produto a um molde ou a um ícone CC0.

**Cores por marca.** `CORES_DA_MARCA = { 'Italac': ['#d6202a', '#ffffff'], ... }` com duas cores
por marca. Preencher só quando houver confiança na cor dominante da embalagem; marca ausente
recebe duas cores estáveis derivadas do nome (função de espalhamento simples), para o jogo
nunca quebrar. Cor não é logotipo: é só para diferenciar as opções na prateleira.

**Desenho.**
- A camada do mapa (24 × 16 casas = 384 × 256 px lógicos) é pintada **uma vez** num canvas fora
  da tela e copiada a cada quadro com a escala inteira. Balões "!" e personagem vão por cima.
- Um único `requestAnimationFrame`, ativo só enquanto a personagem anda ou há animação; parado,
  o canvas não redesenha.
- Tratar `devicePixelRatio` para o canvas não borrar; manter `imageSmoothingEnabled = false`.
- Sem ordenação por profundidade nesta versão: a personagem nunca ocupa a casa de um móvel.
- Placas de seção: faixa com o nome, desenhada no canvas com `--fonte-corpo`, em
  `8 × escala` px.

### 4.8 Fases da tela (`tela.js`)

`'inicio' → 'missao' → 'loja' ⇄ 'caixa' → 'resultado'`. Uma função `mostrarFase(nome)` esconde
as outras (`hidden`). Painéis (prateleira, carrinho, lista) só existem dentro de `'loja'` e um
de cada vez. Sair para o início no meio da compra pede confirmação ("Sair e perder esta
compra?").

Como em outros jogos do site, `tela.js` chama `conferirDados()` ao carregar e lança erro se
houver problema no catálogo.

---

## 5. Protocolo do executor

### 5.1 Regras

1. Vale tudo da seção 2.2 do `MELHORIAS.md` (regras gerais) e a seção 4.0 (padrão de jogo novo).
2. **Uma etapa por sessão.** Ao terminar, escrever o relatório (5.5) e parar. Não começar a
   etapa seguinte sem o Diego pedir.
3. Branch única `j15-mercadinho`, criada a partir de `main`. Um commit por etapa, mensagem em
   português. **Não fazer merge nem push em `main`**: todo push em `main` publica o site.
4. Não mudar números, textos, nomes de função ou arquivos deste plano. Se algo aqui estiver
   errado ou impossível, parar e relatar com a evidência.
5. Não inventar dados fora das tabelas da seção 3. Marca, preço ou coração só mudam por pedido
   do Diego.

### 5.2 Leitura obrigatória antes de editar

- `MELHORIAS.md`, seções 2.2, 4.0 e 6.
- `README.md`, seções "A biblioteca shared/" e "Como desenvolver, testar e compilar".
- `Games/labirinto/` (`index.html`, `tela.js`, `labirinto.css`): referência de página com
  telas, escolhas e CSS próprio; e `criarGerador` em `jogo.js`.
- `Games/dinheirinho/jogo.js`: `formatarDinheiro` e `somarCentavos`.
- `rael/corrida-3d/tela.js`: referência de canvas com `requestAnimationFrame`, toque e pausa.
- `shared/progresso.js`, `shared/base.css`, `configuracoes.html`, `index.html`.

### 5.3 Comandos do projeto

O caminho local tem `:` e quebra o `PATH` do npm. Use só estes:

```bash
npm test             # Vitest (linha de base em 2026-11-14: 527 testes em 33 arquivos)
npm run typecheck    # tsc --noEmit
npm run build        # vite build + service worker
npm run dev          # http://localhost:5173/Games/mercadinho/
npm run preview      # serve o dist/
```

Nunca chamar `vite`, `vitest` ou `tsc` soltos nem por `npx`.

### 5.4 Guardas ao fim de toda etapa

```bash
npm test && npm run typecheck && npm run build
git status --short        # só arquivos da seção 4.1
grep -rnE "parseFloat|toFixed|Math\.random" Games/mercadinho/jogo.js Games/mercadinho/mapa.js Games/mercadinho/dados.js   # deve sair vazio
```

Abrir a página no navegador (360 × 640 e 1280 × 800): console sem erro, aba Network sem 404.

### 5.5 Relatório por etapa

```
## Etapa N — relatório
- Commit: <hash> na branch j15-mercadinho
- O que foi feito: ...
- Arquivos criados/alterados: ...
- Testes: X testes em Y arquivos (antes: 527 em 33); typecheck e build: ok/falhou
- Critérios de aceite: lista com [x] ou [ ] e a evidência de cada um
- Verificação no navegador: tamanhos testados, o que foi observado
- Desvios do plano e motivo: ...
- Pendências e dúvidas para o Diego: ...
```

### 5.6 Prompt para iniciar cada etapa

```
Contexto: repositório Site-JogosElis. Leia docs/planos/PLANO-MERCADINHO.md inteiro e a seção 2.2
do MELHORIAS.md. Execute SOMENTE a Etapa <N> do plano, na branch j15-mercadinho, seguindo o
protocolo da seção 5. Não altere decisões do plano. Ao terminar, rode as guardas da seção 5.4,
escreva o relatório da seção 5.5 e pare.
```

---

## 6. Etapas

| Etapa | Entrega | Jogável? | Esforço | Modelo sugerido |
|---|---|---|---|---|
| 0 | Preparação | não | P | qualquer |
| 1 | Dados e motor puro com testes | não | M | Sonnet |
| 2 | Página e compra completa em lista rápida (nível 2) | **sim** | M | Sonnet |
| 3 | Loja navegável com arte provisória | sim | G | Sonnet ou Gemini |
| 4 | Pixel art final e **portão de arte** | sim | G | modelo com visão |
| 5 | Níveis 1 e 3, tutorial e integração no site | sim | M | Sonnet |
| 6 | Cofrinho e sonhos | sim | P | Sonnet |
| 7 | Acabamento, documentação e verificação final | sim | M | Sonnet |

A partir da Etapa 2 o jogo já pode ser testado com a Elis. As Etapas 3 e 4 trazem a loja; se
alguma delas atrasar, a 5 e a 6 podem ser feitas antes, porque não dependem do mapa.

### Etapa 0 — Preparação (sem código de jogo)

1. `git switch main && git pull && git switch -c j15-mercadinho`.
2. `npm ci` e as três guardas da seção 5.4. Registrar a linha de base (esperado: 527 testes em
   33 arquivos).
3. Fazer a leitura da seção 5.2.
4. Conferir que `Games/mercadinho/`, `public/figuras/mercadinho/` e os dois arquivos de teste
   **não existem**.

**Critérios de aceite**
- [ ] Branch `j15-mercadinho` criada a partir de `main` atualizada.
- [ ] Linha de base registrada no relatório.
- [ ] Nenhum arquivo alterado.

### Etapa 1 — Dados e motor puro

**Arquivos:** `Games/mercadinho/dados.js`, `jogo.js`, `mapa.js`, `tests/mercadinho.test.js`,
`tests/mercadinho-mapa.test.js`. Nenhuma página ainda.

**Passos**
1. Escrever `dados.js` copiando as tabelas da seção 3 **na mesma ordem** (a ordem muda os
   sorteios).
2. Portar o Apêndice A para `jogo.js`, trocando os auxiliares locais por `criarGerador`
   (`../labirinto/jogo.js`) e `embaralhar` (`../../shared/texto.js`). Reexportar
   `formatarDinheiro` de `../dinheirinho/jogo.js`.
3. Implementar a compra (seção 4.6) e `MISSAO_RESERVA`.
4. Implementar `mapa.js` (seção 4.5).
5. Escrever os testes abaixo.

**Testes obrigatórios**

*Dados e preços*
- `conferirDados()` devolve `[]`; 49 produtos, 12 guloseimas, 10 temas; ids únicos.
- Preços crescentes por produto nos três níveis (no nível 1, entre as duas opções mostradas dos
  produtos elegíveis); corações de 1 a 3 e não decrescentes.
- `precoNoNivel`: os cinco casos da tabela da seção 4.3.
- Toda vaga de todo tema aponta para produto existente; todo tema gera lista nos três níveis.
- Inelegíveis do nível 1 são exatamente os seis da seção 4.3.

*Gerador* (para sementes de 1 a 1.000, em cada nível)
- Nunca devolve a missão reserva.
- `itens.length === NIVEIS[nivel].itens`, sem produto repetido; quantidades aceitas pelo
  produto; no nível 1 todas iguais a 1.
- `orcamento % 100 === 0`.
- `custoMinimo < orcamento < custoDoMelhor`.
- `custoDaMeta <= orcamento`.
- `coracoesDaCestaBarata < metaCoracoes <= maximoCoracoes`.
- Mesma semente e nível devolvem missões idênticas (`toEqual`).
- Para 50 sementes por nível, uma **força bruta** (todas as combinações de opções e de até
  `maximoDeDesejos` guloseimas) confirma `maximoCoracoes`, `custoMinimo` e `custoDaMeta`.
- `gerarMissao({ temaId })` respeita o tema pedido, para os 10 temas.

*Compra e caixa*
- Colocar, trocar de opção, mudar quantidade e tirar; recusas `fora-da-lista`, `opcao`,
  `quantidade` e `limite`.
- `totalDoCarrinho` com quantidades; `coracoesDoCarrinho` conta uma vez por linha.
- `faltando` e `aMais`.
- `espiar` gasta e depois recusa; no nível 1 e no 3 já começa recusando.
- `chegarAoCaixa`: os três casos; cada estouro soma 1.
- `resultadoDaCompra`: um cenário para cada combinação de estrelas (1, 2 por corações, 2 por
  contas, 3).
- `digitar`: 5, 2, 1, 0 → 5210; apagar → 521; não passa de 99999.
- `alternativasDeTroco`: 3 valores distintos, não negativos, contendo o certo, inclusive para
  troco 0 e troco 50.
- `contaArmada(5500, 5210, '-')` devolve as quatro linhas da seção 2.8.

*Simulações* (300 sementes por nível)
- **Comprador econômico** (sempre a mais barata, sem guloseima): nunca estoura, sempre termina
  com 1 estrela por lista e **nunca** ganha "família feliz".
- **Comprador exagerado** (sempre a de mais corações): estoura em toda missão.
- **Comprador esperto** (segue uma cesta que a força bruta achou): termina com as 3 estrelas em
  toda missão.

*Mapa*
- 16 linhas de 24 colunas; contagem de casas por letra igual à da seção 4.5.
- Toda casa de piso é alcançável a partir da entrada (244).
- Toda prateleira, guloseima e caixa tem pelo menos uma casa de piso vizinha.
- `caminho` devolve passos vizinhos, só por piso, com o tamanho mínimo (comparar com a
  distância de Manhattan num corredor livre) e `null` para destino em parede.
- Cada um dos 49 produtos e das 12 guloseimas tem exatamente uma casa.

**Critérios de aceite**
- [ ] Todos os testes acima passam; a suíte anterior continua em 527 testes verdes.
- [ ] Os valores de conferência da seção 4.4 batem (colar a saída no relatório).
- [ ] As guardas da seção 5.4 passam (o `grep` sai vazio).
- [ ] Nenhum arquivo fora dos cinco listados foi alterado.

### Etapa 2 — Página e compra completa em lista rápida

Entrega o jogo jogável do início ao fim no **nível 2**, ainda sem mapa.

**Arquivos:** `Games/mercadinho/index.html`, `mercadinho.css`, `tela.js`; `vite.config.ts`.

**Passos**
1. `index.html` no padrão de `Games/labirinto/index.html` (metadados, manifest, favicon 🛒,
   `base.css`, `pwa.js`, `montarCabecalho('Mercadinho')`).
2. Fases início, missão, loja (em lista rápida: 8 botões de seção → produtos → painel), caixa e
   resultado, conforme as seções 2.2 a 2.9, 2.11 e 2.12.
3. Painel fixo, painel de prateleira, carrinho, lista, espiada, cupom, teclado numérico, conta
   armada, estrelas, `registrarPartida`, sons (`clique`, `acerto`, `erro`, `vitoria`) e confete.
4. Emoji como desenho de produto (a arte vem depois).
5. Entrada no `vite.config.ts`.

**Critérios de aceite**
- [ ] Uma compra completa do nível 2 termina com 3 estrelas quando feita certo, com 2 ao
      ignorar os corações e com 2 ao estourar uma vez.
- [ ] Estourar no caixa devolve à loja com o carrinho intacto; não existe tela de derrota.
- [ ] Faltando item, o caixa lista o que falta e não conta erro.
- [ ] O total não aparece em lugar nenhum da loja; a espiada mostra por 4 s e o contador desce
      de 2 para 0.
- [ ] O teclado numérico entra pela direita e a conta armada aparece na segunda falha.
- [ ] Produto fora da lista mostra preços e não tem botão de compra.
- [ ] Terceira guloseima é recusada com o texto do limite.
- [ ] Em 360 × 640: sem rolagem horizontal, alvos ≥ 44 px, texto ≥ 18 px.
- [ ] Só com teclado dá para terminar uma compra; Esc fecha painéis.
- [ ] `registrarPartida('mercadinho', ...)` grava (conferir `localStorage['jogos-elis:progresso']`).
- [ ] Console sem erro, Network sem 404, guardas da 5.4 verdes.

### Etapa 3 — Loja navegável com arte provisória

**Arquivos:** `Games/mercadinho/arte.js` (versão provisória), `renderizador.js`; `tela.js`,
`index.html` e `mercadinho.css` (canvas, botão "Ver: ...", opção Andar/Lista rápida).

**Passos**
1. `arte.js` provisório: cores por tipo e seção, emoji do produto sobre a prateleira, círculo
   com seta como personagem (tabela da seção 4.7).
2. `renderizador.js`: camada do mapa fora da tela, câmera presa aos limites, escala inteira,
   `devicePixelRatio`, personagem, balões "!" (só serão usados no nível 1), placas de seção.
3. Movimento: toque para andar com `caminho`, toque em prateleira com `vizinhaLivre`, teclado,
   botão contextual, troca de destino no meio do caminho, movimento reduzido.
4. Ligar a prateleira, a guloseima e o caixa aos painéis da Etapa 2.
5. "Andar pelo mercado" como padrão; "Lista rápida" continua disponível e assume sozinha se o
   canvas não puder ser criado.

**Critérios de aceite**
- [ ] Em 360 px de largura cada casa mede 48 px e a câmera nunca mostra fora do mapa.
- [ ] A personagem nunca atravessa parede, prateleira ou caixa, por toque ou por teclado.
- [ ] Tocar numa prateleira distante leva a personagem até a casa vizinha e abre o painel.
- [ ] Tocar em outro lugar durante a caminhada muda o destino sem travar.
- [ ] Dá para alcançar e abrir as 49 prateleiras, as 12 guloseimas e os 3 caixas (percorrer
      por script no console ou manualmente e registrar no relatório).
- [ ] Setas e WASD andam; Enter abre a prateleira à frente; o botão "Ver: ..." aparece e some.
- [ ] Com `prefers-reduced-motion`, não há deslizamento nem quadros de caminhada.
- [ ] Parado, o canvas não redesenha (conferir que não há `requestAnimationFrame` em laço).
- [ ] Uma compra completa andando pelo mapa leva de 3 a 6 minutos no nível 2.
- [ ] A lista rápida continua funcionando igual à da Etapa 2.

### Etapa 4 — Pixel art final e portão de arte

**Arquivos:** `public/figuras/mercadinho/*.png` e `LICENCA.txt`; `arte.js` (versão final);
`arte-prova.html`.

**Passos**
1. Baixar da página oficial de cada pacote da seção 1.1 (botão Download → "Continue without
   donating"). Copiar para `public/figuras/mercadinho/` **somente** as folhas de tiles
   usadas, sem editar, com nomes em kebab-case (`kenney-cidade.png`, `kenney-interiores.png`,
   `kenney-urbano.png`). Se o download automático falhar, parar e pedir os arquivos ao Diego.
2. Escrever `LICENCA.txt` no modelo de `public/figuras/corrida/LICENCA.txt`: para cada arquivo,
   pacote, autor (Kenney), URL, licença (CC0 1.0), data do download.
3. Criar `arte-prova.html` com duas partes: (a) **folha de contato**: cada folha ampliada 3×
   com a grade e as coordenadas (coluna, linha) escritas; (b) **prova da loja**: o mapa inteiro
   desenhado com os recortes escolhidos, a personagem nas 4 direções e os 10 moldes de
   embalagem em 3 cores cada.
4. Com a folha de contato, preencher `RECORTES`: piso, parede (com cantos se existirem),
   gôndola, geladeira (seção `L`), balcão (seção `A`), banca (seção `H`), gôndola de guloseimas,
   caixa registradora, porta, e os quadros da personagem (uma menina, se houver).
5. Ícones de produto: conferir conteúdo e licença dos conjuntos de comida da seção 1.1. Usar
   só o que for CC0 e registrar em `LICENCA.txt`. O que faltar vira molde de embalagem.
6. Desenhar os 10 moldes (formato da seção 4.7), ligar cada produto em `MOLDE_DO_PRODUTO` e
   preencher `CORES_DA_MARCA`.
7. Tirar capturas da prova da loja e do jogo em 360 × 640 e 1280 × 800 e anexar ao relatório.

**Portão de arte.** O executor para aqui. **O Diego aprova as capturas** (ou pede ajustes)
antes da Etapa 5 ou de qualquer merge.

**Critérios de aceite**
- [ ] Todo arquivo de `public/figuras/mercadinho/` está em `LICENCA.txt` com licença CC0.
- [ ] Nenhum logotipo, marca desenhada ou embalagem copiada; marca só em texto.
- [ ] Pixels nítidos em qualquer escala (sem borrão): escala inteira e `pixelated`.
- [ ] Cenário e personagem do mesmo tamanho de pixel (nada ampliado em fator diferente).
- [ ] As 7 seções são distinguíveis à primeira vista (móvel diferente ou cor de piso) e têm
      placa legível.
- [ ] Cada prateleira mostra o ícone do seu produto; os painéis mostram a embalagem ampliada.
- [ ] As opções de um mesmo produto têm cores diferentes entre si.
- [ ] Se os PNG não carregarem (testar renomeando a pasta), o jogo cai na arte provisória ou
      na lista rápida sem erro.
- [ ] `npm run build` inclui os PNG no `dist/` e no precache do service worker.
- [ ] Soma dos arquivos de `public/figuras/mercadinho/` ≤ 400 kB.
- [ ] Capturas anexadas; aprovação do Diego registrada.

### Etapa 5 — Níveis 1 e 3, tutorial e integração no site

**Arquivos:** `tela.js`, `index.html` e `mercadinho.css` do jogo; `index.html` (raiz),
`shared/progresso.js`, `configuracoes.html`.

**Passos**
1. Nível 1: duas opções, total visível com barra, subtotais, balões "!", troco por
   alternativas, 1 guloseima.
2. Nível 3: preços de etiqueta, sem espiada, conta do total antes do troco.
3. Tutorial de 4 cartões na primeira vez (e botão "Como jogar" no início): a lista e o
   dinheiro · andar e abrir prateleiras · corações e guloseimas · o caixa. Com "Pular".
4. Cartão na página inicial, nível padrão em `shared/progresso.js`, `<select>` e "Zerar
   progresso" em `configuracoes.html` (tabela da seção 4.1).

**Critérios de aceite**
- [ ] Cada linha da tabela da seção 2.4 vale no jogo, nos três níveis.
- [ ] No nível 1 a barra muda de verde para amarela e vermelha nos limites de 80% e 100% e o
      valor está sempre escrito.
- [ ] No nível 3 a conta do total aparece a cada ida ao caixa e errar tira a estrela "Contas
      certas".
- [ ] O nível escolhido em Configurações vem marcado ao abrir o jogo.
- [ ] O cartão 🛒 aparece na página inicial com estrelas e "Jogou N vezes", e o jogo entra no
      "Jogo favorito" do mural.
- [ ] O tutorial aparece só na primeira vez e pode ser reaberto.
- [ ] Teste novo em `tests/progresso.test.js` ou em `tests/mercadinho.test.js` cobre o nível
      padrão `'2'`.

### Etapa 6 — Cofrinho e sonhos

**Arquivos:** `Games/mercadinho/cofrinho.js`; `tela.js`, `index.html`, `mercadinho.css`;
`tests/mercadinho.test.js`.

**Passos**
1. `cofrinho.js`: `lerCofrinho(armazenamento)`, `depositar(estado, centavos)`,
   `escolherSonho(estado, id)`, `podeRealizar(estado)`, `realizarSonho(estado)`,
   `gravarCofrinho(estado, armazenamento)`. Funções puras; o armazenamento é injetado, como em
   `shared/progresso.js`.
2. Tela inicial: cofrinho, sonho atual com barra, estante. Resultado: "Foi para o cofrinho".
3. Guardar aqui também `tutorialVisto` e `modoLista`.

**Critérios de aceite**
- [ ] O troco de cada compra paga soma no cofrinho uma vez só (recarregar a tela de resultado
      não deposita de novo).
- [ ] Realizar um sonho desconta o preço exato e o coloca na estante.
- [ ] Testes: depósito, escolha, realização, JSON inválido, versão desconhecida e
      armazenamento bloqueado (todos devolvem estado utilizável).
- [ ] "Zerar progresso" apaga o cofrinho.
- [ ] Nada no cofrinho tem prazo, sequência de dias ou perda.

### Etapa 7 — Acabamento, documentação e verificação final

**Passos**
1. Animações curtas (item indo para o carrinho, cupom, moedinha no cofrinho), todas desligadas
   com `prefers-reduced-motion`.
2. `README.md`: linha na tabela de jogos, pasta na árvore, testes citados, créditos da arte na
   seção "Créditos de terceiros" (Kenney, CC0, e o que mais tiver sido usado).
3. `MELHORIAS.md`: atualizar a entrada J15 com o resultado, no formato das outras.
4. Rodar a matriz de verificação abaixo e o checklist da seção 6 do `MELHORIAS.md`.

**Matriz de verificação no navegador** (`npm run build && npm run preview`)

| # | Cenário | Esperado |
|---|---|---|
| V01 | 360 × 640, toque, nível 2, compra perfeita | 3 estrelas; sem rolagem horizontal |
| V02 | 768 × 1024, toque, nível 1 | Total e barra visíveis; balões "!" |
| V03 | 1280 × 800, teclado, nível 3 | Conta do total e do troco; foco visível |
| V04 | Estourar duas vezes e depois pagar | 2 estouros; sem derrota; sem estrela de contas |
| V05 | Ir ao caixa sem um item | Lista o que falta; não conta erro |
| V06 | Lista rápida do início ao fim | Igual ao mapa nas regras |
| V07 | `prefers-reduced-motion` | Sem deslizamento, cupom inteiro, sem confete |
| V08 | Som desligado no cabeçalho | Nenhum som |
| V09 | Offline depois de uma visita | Jogo abre e roda com a arte |
| V10 | `localStorage` bloqueado | Joga normalmente; cofrinho não persiste; sem erro |
| V11 | Pasta de figuras ausente | Arte provisória ou lista rápida; sem erro |
| V12 | 20 missões seguidas por nível | Listas coerentes com o tema; nenhuma repetida em sequência |

**Critérios de aceite**
- [ ] V01 a V12 registrados no relatório com o resultado.
- [ ] Guardas da 5.4 verdes; console sem erro; Network sem 404.
- [ ] README e MELHORIAS atualizados.
- [ ] Nada mesclado em `main`: a decisão de publicar é do Diego.

---

## 7. Validação com a Elis

Observar duas ou três compras no nível 2, sem ajudar na primeira:

| O que olhar | Se não acontecer |
|---|---|
| Entende sozinha que precisa andar e tocar nas prateleiras? | Reforçar o tutorial; ligar os balões "!" também no nível 2 |
| Lê a quantidade na lista ("2 leites")? | Destacar o número na lista |
| Compara preços antes de pegar, ou pega sempre a primeira? | Embaralhar a ordem dos cartões no painel |
| Usa os corações para decidir, ou ignora? | Mostrar a meta no painel de prateleira |
| Tenta somar de cabeça ou gasta as espiadas logo? | Subir para 3 espiadas ou mostrar total arredondado |
| Como reage ao estourar no caixa? | Se frustrar: mostrar no caixa "o item mais caro do carrinho" como dica |
| Acerta o troco? Usa papel? | Se errar sempre: troco por alternativas também no nível 2 |
| Encontra os produtos ou se perde? | Aumentar as placas; mapa pequeno no canto |
| Quanto tempo leva uma compra? | Acima de 8 min: lista de 4 itens no nível 2 |
| Pede para jogar de novo? Fala do cofrinho? | Rever os preços dos sonhos |

Os ajustes da coluna da direita são mudanças de um número ou de uma opção; nenhum exige
redesenho.

---

## 8. Fora do escopo desta versão

Ideias para depois da validação (cada uma vira uma etapa própria):

- **Promoções:** "leve 3, pague 2", desconto em reais, etiqueta amarela.
- **Embalagens e preço por unidade:** pacote com 6 contra unidade; "qual vale mais a pena?".
- **Peso:** meio quilo de queijo, 300 g de presunto, com frações e décimos.
- **Pagar com notas e moedas** e conferir o troco recebido, reaproveitando o Dinheirinho.
- **Pix ou dinheiro:** formas de pagamento.
- **Outros clientes** andando pela loja e fila no caixa.
- **Segunda loja** (feira, padaria) com outro mapa.
- **Lista escrita pelos pais** nas configurações.
- **Voz** lendo a lista (`shared/fala.js`).
- **Ordenação por profundidade** e sombras para reforçar o "3D falso".

Fora de qualquer versão: logotipos e embalagens reais, propaganda, compra por tempo, ranking.

---

## 9. Definição de pronto

- [ ] As oito etapas entregues, cada uma com relatório e critérios marcados.
- [ ] Arte aprovada pelo Diego no portão da Etapa 4.
- [ ] Tabela de marcas, preços e corações revisada pelo Diego.
- [ ] `npm test`, `npm run typecheck` e `npm run build` verdes; suíte anterior intacta.
- [ ] Matriz V01 a V12 completa.
- [ ] Licenças registradas em `public/figuras/mercadinho/LICENCA.txt` e no README.
- [ ] Validação com a Elis feita (seção 7) e ajustes decididos.
- [ ] Merge em `main` feito pelo Diego.

---

## Apêndice A — Código de referência do gerador (validado)

Rodou em 2026-11-14 com o catálogo da seção 3: 3.000 sementes por nível, nenhuma falha, média de
1,5 tentativa no nível 1 e 1,0 nos níveis 2 e 3. Ao portar para `jogo.js`:

- trocar `criarGerador` e `embaralhar` locais pelos do projeto (`Games/labirinto/jogo.js` e
  `shared/texto.js`): são o mesmo algoritmo e dão os mesmos sorteios para semente numérica;
- manter a **ordem das chamadas de sorteio**;
- acrescentar `espiadas` a `NIVEIS` e a `MISSAO_RESERVA` no lugar do retorno `{ falhou: true }`;
- o campo `tentativas` é só diagnóstico e pode sair.

```js
import { produtos, desejos, temas } from './dados.js';

export const NIVEIS = {
  1: { itens: 3, linhasComQuantidade: 0, maximoDeDesejos: 1, tolerancia: 2, passos: [1000, 500, 200, 100], arredondar: 50 },
  2: { itens: 5, linhasComQuantidade: 2, maximoDeDesejos: 2, tolerancia: 1, passos: [1000, 500, 200, 100], arredondar: 10 },
  3: { itens: 7, linhasComQuantidade: 3, maximoDeDesejos: 2, tolerancia: 1, passos: [500, 200, 100], arredondar: 1 },
};
export const JANELA = { inicio: 0.40, fim: 0.75 };
export const AMPLITUDE_MINIMA = { 1: 300, 2: 400, 3: 500 };

export function criarGerador(semente = Date.now()) {
  let estado = (Number(semente) >>> 0) || 0x6d2b79f5;
  return () => {
    estado += 0x6d2b79f5;
    let v = estado;
    v = Math.imul(v ^ (v >>> 15), v | 1);
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}
const embaralhar = (lista, rnd) => { const c = [...lista]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; };
const sortear = (lista, rnd) => lista[Math.floor(rnd() * lista.length)];
const porId = Object.fromEntries(produtos.map(p => [p.id, p]));

export function precoNoNivel(preco, nivel) {
  const passo = NIVEIS[nivel].arredondar;
  return Math.max(passo, Math.round(preco / passo) * passo);
}

/** Opções que aparecem na prateleira em cada nível, já com o preço do nível, da mais barata para a mais cara. */
export function opcoesNoNivel(produto, nivel) {
  let opcoes = produto.opcoes.map(o => ({ ...o, preco: precoNoNivel(o.preco, nivel) }));
  if (nivel === 1) {
    const barata = opcoes[0];
    const maximo = Math.max(...opcoes.map(o => o.coracoes));
    const querida = opcoes.find(o => o.coracoes === maximo);
    opcoes = barata === querida ? [barata] : [barata, querida];
  }
  return opcoes;
}

/** Um produto só entra na lista se a escolha for de verdade: preços diferentes e crescentes; no nível 1, também corações diferentes e R$ 1,00 de distância. */
export function elegivel(produto, nivel) {
  const o = opcoesNoNivel(produto, nivel);
  if (o.length < 2) return false;
  for (let i = 1; i < o.length; i++) if (o[i].preco <= o[i - 1].preco) return false;
  if (nivel === 1) return o[1].preco - o[0].preco >= 100 && o[1].coracoes > o[0].coracoes;
  return true;
}

/**
 * Menor custo para somar exatamente h corações.
 * `somenteLista`: Map(corações → custo) escolhendo uma opção de cada item da lista.
 * `comDesejos`: o mesmo, podendo levar até `maximoDeDesejos` guloseimas.
 */
export function tabelaDeCustos(itens, nivel) {
  const guardarMenor = (mapa, coracoes, custo) => {
    if (!mapa.has(coracoes) || mapa.get(coracoes) > custo) mapa.set(coracoes, custo);
  };
  let somenteLista = new Map([[0, 0]]);
  for (const item of itens) {
    const proxima = new Map();
    for (const [coracoes, custo] of somenteLista) {
      for (const opcao of opcoesNoNivel(porId[item.produtoId], nivel)) {
        guardarMenor(proxima, coracoes + opcao.coracoes, custo + opcao.preco * item.quantidade);
      }
    }
    somenteLista = proxima;
  }
  // camadas[d] = melhor custo usando exatamente d desejos
  const maximo = NIVEIS[nivel].maximoDeDesejos;
  const camadas = [somenteLista, ...Array.from({ length: maximo }, () => new Map())];
  for (const desejo of desejos) {
    const preco = precoNoNivel(desejo.preco, nivel);
    for (let d = maximo; d >= 1; d--) {
      for (const [coracoes, custo] of camadas[d - 1]) guardarMenor(camadas[d], coracoes + desejo.coracoes, custo + preco);
    }
  }
  const comDesejos = new Map();
  for (const camada of camadas) for (const [coracoes, custo] of camada) guardarMenor(comDesejos, coracoes, custo);
  return { somenteLista, comDesejos };
}

export function montarLista(tema, nivel, rnd) {
  const cfg = NIVEIS[nivel];
  const fixas = tema.vagas.slice(0, tema.fixas);
  const outras = embaralhar(tema.vagas.slice(tema.fixas), rnd);
  const itens = [];
  for (const vaga of [...fixas, ...outras]) {
    if (itens.length >= cfg.itens) break;
    const candidatos = vaga.filter(id => elegivel(porId[id], nivel) && !itens.some(i => i.produtoId === id));
    if (!candidatos.length) continue;
    itens.push({ produtoId: sortear(candidatos, rnd), quantidade: 1 });
  }
  if (itens.length < cfg.itens) return null;
  const comQuantidade = embaralhar(itens.filter(i => porId[i.produtoId].quantidades.some(q => q > 1)), rnd).slice(0, cfg.linhasComQuantidade);
  for (const item of comQuantidade) item.quantidade = sortear(porId[item.produtoId].quantidades.filter(q => q > 1), rnd);
  // produtos que só existem em quantidade > 1 (iogurte, suco de caixinha) nunca ficam com 1
  for (const item of itens) { const qs = porId[item.produtoId].quantidades; if (!qs.includes(item.quantidade)) item.quantidade = nivel === 1 ? 1 : qs[0]; }
  return itens;
}

export function calcularMissao(itens, nivel, rnd) {
  const cfg = NIVEIS[nivel];
  const { somenteLista, comDesejos } = tabelaDeCustos(itens, nivel);
  const custoMinimo = Math.min(...somenteLista.values());
  const coracoesMaximosDaLista = Math.max(...somenteLista.keys());
  const custoDoMelhor = somenteLista.get(coracoesMaximosDaLista);
  const coracoesDaCestaBarata = Math.max(...[...somenteLista].filter(([, c]) => c === custoMinimo).map(([h]) => h));
  const amplitude = custoDoMelhor - custoMinimo;
  if (amplitude < AMPLITUDE_MINIMA[nivel]) return { motivo: 'amplitude' };
  const de = custoMinimo + JANELA.inicio * amplitude, ate = custoMinimo + JANELA.fim * amplitude;
  let candidatos = [];
  for (const passo of cfg.passos) {
    for (let v = Math.ceil(de / passo) * passo; v <= ate; v += passo) candidatos.push(v);
    if (candidatos.length) break;
  }
  if (!candidatos.length) return { motivo: 'janela' };
  const orcamento = sortear(candidatos, rnd);
  const maximoCoracoes = Math.max(...[...comDesejos].filter(([, c]) => c <= orcamento).map(([h]) => h));
  const metaCoracoes = maximoCoracoes - cfg.tolerancia;
  if (metaCoracoes <= coracoesDaCestaBarata) return { motivo: 'meta' };
  const custoDaMeta = Math.min(...[...comDesejos].filter(([h]) => h >= metaCoracoes).map(([, c]) => c));
  return { orcamento, metaCoracoes, maximoCoracoes, custoMinimo, custoDoMelhor, custoDaMeta, coracoesDaCestaBarata };
}

export function gerarMissao({ nivel = 2, semente = Date.now(), temaId } = {}) {
  const rnd = criarGerador(semente);
  const motivos = {};
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const tema = temaId ? temas.find(t => t.id === temaId) : sortear(temas, rnd);
    const itens = montarLista(tema, nivel, rnd);
    if (!itens) { motivos.lista = (motivos.lista || 0) + 1; continue; }
    const contas = calcularMissao(itens, nivel, rnd);
    if (contas.motivo) { motivos[contas.motivo] = (motivos[contas.motivo] || 0) + 1; continue; }
    return { nivel, semente, temaId: tema.id, titulo: tema.titulo, itens, ...contas, tentativas: tentativa + 1 };
  }
  return { falhou: true, motivos };
}
```

---

## Fontes consultadas (2026-11-14)

- Kenney, Roguelike Modern City (CC0): https://kenney.nl/assets/roguelike-modern-city
- Kenney, Roguelike Indoors (CC0): https://kenney.nl/assets/roguelike-indoors
- Kenney, RPG Urban Pack (CC0): https://kenney.nl/assets/rpg-urban-pack
- OpenGameArt, 16x16 food: https://opengameart.org/content/16x16-food
- OpenGameArt, CC0 Food Icons: https://opengameart.org/content/cc0-food-icons
- Procon-SP e Dieese, Cesta Básica, julho de 2026:
  https://www.procon.sp.gov.br/wp-content/uploads/2026/08/CB-julho-2026-com-comparativo-anual.pdf
- Tilesets de supermercado avaliados e descartados por preço ou licença:
  https://snoblin.itch.io/rpg-asset-tileset-supermarket-pack-asset-alliance ·
  https://carbonova.itch.io/supermarket-tileset ·
  https://limezu.itch.io/moderninteriors
