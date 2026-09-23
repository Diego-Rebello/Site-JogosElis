# Plano de Melhorias — Jogos da Elis

> Backlog executável: cada tarefa abaixo foi escrita para ser entregue a um modelo (Opus ou
> Sonnet) que a execute do início ao fim sem precisar de mais contexto. Diego revisa o resultado,
> testa com a criança e segue para a próxima.
>
> **O histórico completo — diagnóstico original do repositório, decisões tomadas durante a
> execução e o "como ficou" de cada tarefa já entregue — está em
> [MELHORIAS-historico.md](MELHORIAS-historico.md).** Consulte lá se uma tarefa nova precisar
> entender uma decisão do passado; este arquivo só traz o que ainda falta.
>
> Atualizado em 2026-09-19: P16 (Chute a Gol) feita na branch `p16-chute-a-gol` como porte do
> Football-game-in-HTML (Apache 2.0); falta validar no navegador e com o Rael.
> Anterior, 2026-09-19: P15 (Álbum com Conquistas) implementada na branch
> `p15-album-conquistas`; falta validar com o Rael.
> Anterior, 2026-09-11: implementação técnica da P14 concluída na branch
> `p14-labirinto-obstaculos`. A publicação e a validação presencial com o Rael continuam pendentes.

---

## 1. Status em 2026-09-11

**Concluído** — detalhes no histórico:
- **T01 a T23** (higiene, correções, base compartilhada, testes, publicação, PWA, acessibilidade): todas as 23 melhorias técnicas.
- **J01, J02, J04 a J11 e J13** (incluindo Memória de Contas e Labirinto de Aventuras): 11 jogos novos para a Elis.
- **P00, P02 a P07** (área, Encaixe as Figuras, Palmas nas Palavras, Rimas com Figuras, Começa com o Mesmo Som, Letras para Explorar, Meu Primeiro Labirinto): a área **Jogos do Rael** está no ar com sete brincadeiras. Falta validar todas com a criança (marcado em cada uma).

**Implementado em branch, aguardando validação com a criança:**
- **P16** (Chute a Gol: pênaltis com mira, goleiro em movimento e contagem de gols), branch
  `p16-chute-a-gol`. Detalhes na seção 5.
- **P15** (conquistas no álbum do Rael), branch `p15-album-conquistas`. Detalhes no item 10 da tarefa.
- **P14** (mapas 15×15, 20×20 e 25×25, obstáculos, visão ampliada e ajuda visual). A opção
  30×30 não foi exposta antes da validação prevista.

**Falta fazer** — especificação completa nas seções 4 e 5 deste arquivo:

| ID | Tarefa | Prioridade | Esforço | Modelo | Depende de |
|---|---|---|---|---|---|
| J03 | Ditado Mágico | Alta | M | Sonnet | `shared/fala.js` (pronto, da P00) |
| J12 | Quebra-Cabeça Deslizante | Baixa | P | Sonnet | T09 (pronta) |
| J14 | Brincando de Rimar | Média | M | Opus | T09 (pronta); motor parcial já existe (P04) |
| P01 | Quem Faz Esse Som? | Alta | M | Sonnet | P00 (pronta) |
| P08 | O Que Vem Depois? | Média | P | Sonnet | P00 (pronta) |
| P09 | Meu Nome | Alta | M | Sonnet | P00 (pronta) |
| P10 | Conta Comigo | Média | P | Sonnet | P00 (pronta) |
| P11 | Qual é o Intruso? | Média | P | Sonnet | P00 (pronta) |
| P12 | Qual Vem Primeiro? | Baixa | M | Sonnet | P00 (pronta) |
| P13 | Memória Pequena | Baixa | P | Sonnet | P00 (pronta) |

**Ordem recomendada:** P09 → P10 (sem gravação nem banco, validam o fluxo) → P01 (a única que
depende de áudio gravado) → P08, P11 → P12, P13 → J03 → J12 → J14. Motivo completo na seção 5.4.
As atividades entregues depois da P15 acrescentam suas próprias conquistas ao catálogo
(`shared/conquistas-descobertas.js`).

**Nota sobre o estado do repositório:** a P14 está isolada na branch
`p14-labirinto-obstaculos`. Não fazer merge na `main` nem disparar deploy até o Diego reunir as
outras mudanças que quer publicar no mesmo ciclo do Netlify.

---

## 2. Como usar este documento

### 2.1 Convenções

| Campo | Significado |
|---|---|
| **Prioridade** | Alta = corrige bug ou destrava outras tarefas · Média = melhora clara · Baixa = desejável |
| **Esforço** | P = até ~1 h de trabalho do modelo · M = 1 a 3 h · G = meio dia ou mais |
| **Modelo** | Sonnet para tarefas mecânicas e bem delimitadas · Opus para arquitetura, geradores e refatorações amplas |
| **IDs** | `T` = melhoria técnica (todas concluídas) · `J` = jogo novo da Elis · `P` = tarefa da etapa Jogos do Rael (seção 5) |

### 2.2 Regras gerais para o modelo executor (colar no início de toda sessão)

```
Contexto: repositório Site-JogosElis, um site estático de jogos educativos em português do Brasil,
feito por um pai para os filhos: Elis (9 anos, 4.º ano) e Rael (5 anos, pré-alfabetização).
Leia o arquivo MELHORIAS.md antes de começar; consulte MELHORIAS-historico.md se precisar de
contexto de uma decisão já tomada.

Regras:
1. Todo texto visível para a criança fica em pt-BR, com frases curtas, tom alegre e acentuação correta.
2. Sem backend, sem banco de dados, sem chaves de API. Apenas HTML/CSS/JS estático
   (React + Vite somente onde já existe: Jogo da Memória e Jogo da Velha).
3. Tudo precisa funcionar em celular e tablet: largura mínima de 360 px, toque como entrada
   principal, alvos de toque com pelo menos 44 px (64 px na área do Rael), sem rolagem horizontal.
4. O site é publicado pelo Netlify (projeto `jogosdaelis`) a partir da branch `main`, com
   `npm run build` (projeto Vite único desde a T23). Não commitar `dist/` nem `_site/`.
5. Nunca faça commit de node_modules, dist/, _site/, .env.local ou .DS_Store.
6. Trabalhe em uma branch nova criada a partir de `main`. Commits pequenos, mensagens em português.
   Todo push em `main` é publicado automaticamente pelo Netlify em cerca de um minuto, então só
   mescle em `main` o que já foi testado (o Netlify gera uma URL de preview para cada pull request).
7. Ao terminar, abra cada página alterada no navegador (servidor local ou `npx vite preview`),
   confira o console sem erros e a aba Network sem 404.
8. Não remova funcionalidades existentes a menos que a tarefa peça explicitamente.
9. Ao final, escreva um resumo: o que mudou, como foi testado, o que ficou pendente.
10. Atenção ao caminho local do projeto: ele contém ":" (`/Users/diego/Desktop/Programas : Jogos/`),
    que é o separador do PATH. Por isso o npm não consegue prefixar `node_modules/.bin` e os scripts
    caem no binário global. Os scripts já chamam o binário local direto
    (`node ./node_modules/vite/bin/vite.js build`); mantenha esse formato. Se for rodar uma
    ferramenta nova pela linha de comando, chame o binário local pelo caminho, não pelo nome.
11. Reutilize `shared/` (inclusive `shared/fala.js`, `shared/descobertas.js` e o catálogo de
    figuras) e, quando indicado, os motores já existentes de J13/J14/P07/P04 — não crie um
    segundo gerador para a mesma coisa.
```

### 2.3 Dados fixos do projeto

| Pergunta | Resposta |
|---|---|
| Idade das crianças | **Elis, 9 anos** (4.º ano) · **Rael, 5 anos** (pré-alfabetização, Pré II) |
| Provedor da hospedagem | **Netlify**, projeto `jogosdaelis`. Painel: https://app.netlify.com/projects/jogosdaelis/overview |
| URL pública do site | **https://jogosdaelis.netlify.app/** |
| Como o site é publicado | Deploy contínuo do GitHub (branch `main`), `npm run build`, publica `dist/`. Ver T20/T23 no histórico. |

---

## 3. Inventário atual do site

| Página / jogo | Caminho | Tecnologia |
|---|---|---|
| Página inicial (Elis) | `index.html` | HTML/CSS puro + `shared/base.css` |
| Biblioteca comum | `shared/` | CSS + módulos ES próprios, sem dependência externa |
| Jogo da Forca | `Games/forca/` | HTML puro + `shared/` |
| Matemática | `Games/matematica/` | HTML puro + `shared/` |
| Jogo do M ou N | `Games/m-ou-n/` | HTML puro + `shared/` |
| Ortografia Divertida | `Games/ortografia/` | HTML puro + `shared/` |
| Caça-Palavras | `Games/cacapalavras/` | HTML puro + `shared/` |
| Forme a Palavra | `Games/forme-a-palavra/` | HTML puro + `shared/` |
| Que Horas São? | `Games/que-horas-sao/` | HTML puro + `shared/` |
| Tabuada Relâmpago | `Games/tabuada/` | HTML puro + `shared/` |
| Genius das Cores | `Games/genius/` | HTML puro + `shared/` |
| Sudoku de Emojis | `Games/sudoku/` | HTML puro + `shared/` |
| Dinheirinho | `Games/dinheirinho/` | HTML puro + `shared/` |
| Quiz Sabe-Tudo | `Games/quiz/` | HTML puro + `shared/` |
| Labirinto de Aventuras | `Games/labirinto/` | HTML/CSS/JS, motor compartilhado com P07 |
| Jogo da Memória | `Games/memoria/` | React 19.2 + Vite 7 + Tailwind 4, emojis e contas |
| Jogo da Velha | `Games/velha/` | React 19.2 + Vite 7 + Tailwind 4 |
| **Jogos do Rael** — casa | `rael/index.html` | HTML puro + `shared/`, tema `tema-rael.css` |
| Jogos do Rael — Toque na Figura | `rael/toque-na-figura/` | HTML puro |
| Jogos do Rael — Encaixe as Figuras | `rael/encaixe-as-figuras/` | HTML puro |
| Jogos do Rael — Palmas nas Palavras | `rael/palmas-nas-palavras/` | HTML puro |
| Jogos do Rael — Meu Primeiro Labirinto | `rael/meu-primeiro-labirinto/` | HTML puro, reusa `Games/labirinto/jogo.js` |
| Jogos do Rael — configurações | `rael/configuracoes.html` | HTML puro + `shared/descobertas.js` |

O site não faz nenhuma requisição externa (fontes, ícones e CSS são todos locais) e funciona
offline como PWA em ambos os sites (Elis e Rael).

---

## 4. Tarefas pendentes — Jogos da Elis

### 4.0 Padrão para todo jogo novo

**Estrutura**
```
Games/<slug>/
  index.html     estrutura da página; inclui ../../shared/base.css e ../../shared/cabecalho.js
  jogo.js        lógica pura (geração, validação, pontuação) exportada como ES module
  tela.js        ligação com o DOM (eventos, renderização)
  dados.js       listas de palavras/questões (com acentuação correta e revisadas)
```

**Requisitos comuns**
- Tela inicial com escolha de nível; rodada de 10 itens (ou equivalente) com barra de progresso; tela final com acertos, estrelas e "Jogar de novo".
- Usa `shared/`: sons, confete, `normalizar`, `embaralhar`, `registrarPartida`.
- Funciona em 360 px, só com toque; textos ≥ 18 px; alvos ≥ 44 px; sem rolagem horizontal.
- Adicionar cartão na página inicial (emoji + nome) e o `jogoId` no módulo de progresso.
- Testes em `tests/<slug>.test.js` para a lógica de `jogo.js`.
- Dados escritos pelo modelo devem ser **revisados por ele antes de entregar** (grafia, acentos, fatos).

**Faixa etária de referência:** Elis tem **9 anos** (4.º ano). Todo jogo novo abre por padrão no
nível intermediário e precisa ter um nível **Desafio**; os níveis iniciais ficam como revisão
rápida. Evitar conteúdo de alfabetização básica (sílabas simples, contagem até 10) como foco
principal — essa faixa é coberta pela etapa do Rael (seção 5).

**Prompt base para qualquer jogo novo**
```
Abra MELHORIAS.md, leia a seção 4.0 e implemente o jogo <ID> exatamente como especificado.
Use a estrutura de pastas e os módulos de shared/. Entregue também o teste da lógica e o cartão
na página inicial. No resumo, liste os dados criados e como foram revisados.
```

---

### J03 — Ditado Mágico (voz do navegador)

> **Nota:** foi a única J pulada na primeira rodada, porque dependia da voz do navegador. A P00
> criou `shared/fala.js`, que já resolve escolha de voz pt-BR, fila de uma fala por vez, repetir
> e o caso de o aparelho não ter voz nenhuma. Use esse módulo em vez de chamar `speechSynthesis`
> direto.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Objetivo pedagógico:** escrita a partir da escuta, sem precisar de um adulto ditando

**Mecânica**
- `shared/fala.js` lê a palavra em voz alta; a criança digita; botão "🔈 Ouvir de novo" e "💡 Dica" (mostra o emoji da palavra e a primeira letra).
- Comparação com `normalizar`; ao acertar mostra a palavra com acentos; ao errar mostra lado a lado o que foi digitado e o certo, com as letras diferentes destacadas.
- Frase de contexto opcional ("A **girafa** tem o pescoço comprido.") lida depois da palavra.

**Níveis:** 1 = palavras de 3–4 letras e emoji visível · 2 = 5–7 letras · 3 = 8+ letras e dígrafos (LH, NH, CH, RR, SS) · 4 = frases curtas. Nível padrão: 3.

**Dados:** `dados.js` com `{ palavra: 'GIRAFA', emoji: '🦒', frase: 'A girafa tem o pescoço comprido.', nivel: 2 }`, mínimo 40 por nível.

**Cuidados técnicos**
- `shared/fala.js` já cobre iOS (fala só após um toque) e a ausência de voz pt-BR (cai no modo texto).

**Critérios de aceite**
- [ ] Funciona no Chrome Android e no Safari iOS com voz em português.
- [ ] Diferença entre digitado e correto destacada letra a letra.

---

### J12 — Quebra-Cabeça Deslizante

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T09 (pronta) · **Objetivo pedagógico:** raciocínio espacial e planejamento

**Mecânica**
- Grade 3×3 (8 peças) ou 4×4 (15 peças); tocar em uma peça vizinha do espaço vazio a desliza; contador de movimentos e cronômetro.
- Imagem: um emoji grande desenhado em `canvas` e fatiado nas peças, ou números coloridos (modo simples).
- Embaralhar apenas por movimentos válidos a partir do estado resolvido (garante que tem solução).

**Critérios de aceite**
- [ ] Teste: 100 embaralhamentos são solucionáveis (paridade correta).
- [ ] Peças ≥ 80 px no 4×4 em 360 px de largura.

---

### J14 — Brincando de Rimar

**Status:** Motor parcial já existe (P04 criou os modos "Ouvir e combinar"/"Encontrar a rima" e um banco de 20 questões, sem expor Versinho/Desafio) · **Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Depende de:** T09 (pronta)

**Objetivo:** perceber palavras que terminam com sons parecidos. A brincadeira começa pela
escuta e pelas figuras; o texto entra como apoio nos modos para quem já lê.

**Mecânica**
- Mostrar uma figura e dizer seu nome: "Gato! O que rima com gato?". Apresentar as figuras das
  alternativas e falar seus nomes antes de liberar a resposta; permitir ouvir tudo novamente.
- Exemplo de rodada: **gato → pato / bola**. Ao acertar, repetir "Gato, pato! Os finais combinam!".
  Ao errar, repetir os nomes e permitir nova tentativa; depois de duas tentativas, demonstrar o par.
- Cada alternativa tem um botão próprio para ouvir seu nome, separado do botão de resposta.
  Não exigir microfone, digitação ou leitura para os níveis de escuta.
- Depois da resposta, destacar as duas figuras e reproduzir os nomes em sequência. Nos modos
  com texto, manter a grafia correta e destacar o trecho da rima apenas se revisado no banco.

**Níveis e variações**

| Modo | Proposta | Tamanho da rodada |
|---|---|---|
| Ouvir e combinar — já usado por P04 | Duas figuras como alternativas, narração e exemplo guiado | 5 pares |
| Encontrar a rima — já usado por P04 | Três alternativas com figura, áudio e palavra | 8 pares |
| Versinho — padrão para Elis (novo) | Completar um verso curto e original com uma entre quatro palavras; áudio opcional | 10 versos |
| Desafio (novo) | Encontrar, entre quatro palavras, a única que não rima com as outras três | 10 grupos |

**Conteúdo e cuidados**
- P04 já tem 20 questões de figuras (GATO/PATO/RATO/SAPATO, PÃO/LEÃO/AVIÃO/CAMINHÃO, ABELHA/OVELHA); ampliar para pelo menos 20 versos originais e 20 grupos do Desafio.
- Rima é sonora: revisar a pronúncia desde a vogal tônica até o fim da palavra. Não gerar respostas
  comparando apenas as últimas letras, nem apresentar duas alternativas que rimem com o alvo.
- Evitar diferenças de pronúncia que tornem a questão ambígua. Distratores não podem ser sinônimos
  da resposta nem depender só da categoria da figura. Variar a posição da resposta correta.
- Em Versinho, a resposta precisa rimar e fazer sentido. Exemplo: "Olha só aquele gato,
  brincando perto do ___" → **pato / sino / trem / sol**.

**Dados e implementação** (`Games/rimas/`, promovendo o que P04 já tem)
- Questões de figuras: `{ id, alvo: { nome, imagem, audio }, alternativas: [{ id, nome, imagem, audio }], respostaId, grupoRima, explicacao }`. Versos e grupos têm bancos próprios e respostas explícitas.
- Reutilizar o sorteio e o feedback entre modos; sortear sem repetir a questão na mesma rodada.
- Não depender de voz online do navegador — usar `shared/fala.js`.

**Critérios de aceite**
- [ ] Toda questão tem IDs distintos, uma única resposta e arquivos de imagem/áudio presentes.
- [ ] Revisão por escuta confirma as rimas e elimina distratores ambíguos; registrar a revisão no resumo.
- [ ] Uma criança que não lê consegue jogar o modo inicial após a demonstração, com áudio disponível.
- [ ] Áudios não se sobrepõem; sair ou reiniciar interrompe a narração anterior.
- [ ] Não duplica o motor e o banco que P04 já criou — promove-os, não recria.

---

### 4.1 Outras ideias para depois (sem especificação ainda)

- **Pintar por Números** em `canvas` com paleta grande.
- **Qual é o Intruso?** com palavras (a versão com figuras e narração virou a P11, seção 5).
- **Plural e Singular**: toque na forma certa.
- **Sequência Lógica**: qual figura vem depois?
- **Mapa do Brasil**: toque no estado pedido (SVG).
- **Contar Sílabas**: bata palmas (toques) no número certo.
- **Palavras Cruzadas** infantis com emojis como pistas.
- **Frações na Pizza**: montar e comparar frações com fatias.
- **Problemas em Texto**: enunciados curtos de matemática para interpretar (troco, tempo, distância).
- **Divisão com Resto** e múltiplos/divisores.

---

## 5. Tarefas pendentes — Jogos do Rael (pré-alfabetização, 5 anos)

**Proposta:** brincar com sons, palavras faladas, figuras, letras, o próprio nome, quantidades e
sequências, sem exigir que a criança já leia. Dinossauros, veículos, animais e espaço são opções
de tema a experimentar conforme o interesse dele. A escolha do tema não depende de gênero.

**Referência pedagógica.** Os objetivos de aprendizagem da BNCC para crianças pequenas (4 a 5 anos
e 11 meses) que a etapa cobre: escrita espontânea e hipóteses sobre a escrita (EI05EF09), relação
entre número e quantidade (EI05ET07), classificação por semelhanças e diferenças (EI05ET05),
reconto e ordenação de histórias (EI05EF05) e coordenação manual (EI05CG05). Serve de guia para o
modelo executor e para a validação com a criança, não como meta a cobrar dele.

### 5.0 Regras próprias desta etapa (aplicam-se a toda tarefa Pxx)

- **Começar brincando:** tela com poucos cartões grandes, instrução curta falada e uma demonstração
  antes da primeira rodada. Texto pode acompanhar, mas nenhuma ação depende de ler.
- **Rodadas de 5 a 8 desafios**, com saída livre a qualquer momento. Meta de projeto: cerca de
  3 a 5 minutos por rodada, sem transformar essa duração em limite ou cobrança.
- **Três alternativas como padrão.** O adulto pode escolher **duas** (modo mais fácil) ou **quatro**
  (modo esperto) nas configurações; a escolha vale para todas as atividades e nunca é desbloqueio.
- **Toque simples como padrão:** alvos de pelo menos 64 px e bom espaçamento. Todo arraste tem
  alternativa por toque em dois passos (tocar na peça, tocar no destino). Não exigir precisão de
  traçado, teclado ou coordenação fina para avançar.
- **Retorno acolhedor:** ao errar, repetir a pista; após duas tentativas, demonstrar a resposta e
  seguir em frente. Sem vidas, contagem regressiva, ranking ou perda de pontos. Celebrar
  participação e conclusão, inclusive com ajuda.
- **Figurinhas em vez de estrelas:** cada rodada concluída dá uma figurinha para o **Álbum**,
  com ou sem ajuda. Além delas, **conquistas** (figurinhas especiais, com moldura dourada)
  reconhecem feitos dentro das brincadeiras (P15). Conquistas nunca se perdem, não têm prazo, não
  dependem de rapidez, acerto de primeira nem de dias seguidos, e nenhuma tela anuncia uma
  conquista que ficou de fora. Atividade nova acrescenta as suas em
  `shared/conquistas-descobertas.js`. Não usar `calcularEstrelas` nesta etapa.
- **Fala em pt-BR em três camadas**, já resolvida por `shared/fala.js`: (1) gravação local quando
  existir; (2) voz sintetizada do aparelho via `speechSynthesis` com `lang = 'pt-BR'`; (3) modo
  acompanhado, com roteiro curto na tela para o adulto ler. Uma fala por vez; botão de repetir
  sempre visível; primeira fala só depois de um toque em "Vamos brincar". Gravações são
  **obrigatórias** apenas onde a síntese não serve: sons de animais e objetos (P01) e sons
  isolados como /f/ e /s/ (já resolvidos em P05, reaproveitáveis). O ideal é o próprio Diego
  gravar no celular.
- **Figuras consistentes entre aparelhos:** usar `shared/catalogo-figuras.js` e `public/figuras/`
  (62 SVGs do OpenMoji já disponíveis). Nunca depender do emoji do sistema. Ilustrações próprias
  só quando a atividade pedir cena ou peças — e mesmo assim, ver o truque de P02 (silhueta =
  figura em cinza, pedaço = figura recortada) antes de desenhar algo novo.
- **Letras em caixa alta, tipo bastão**, com a fonte Nunito de `shared/fontes/`.
- **Progresso próprio:** tudo da etapa vive em `localStorage['jogos-elis:descobertas']`, separada
  da chave de progresso da Elis. Usar `shared/descobertas.js` (`registrarRodada`, `obterAlbum`).
  O único dado pessoal é o **primeiro nome**, opcional, em `nomeDescobertas`.
- **Validação com a criança:** observar se entende o convite, identifica as figuras e consegue
  tocar nas opções. Ajustar vocabulário e quantidade de escolhas pela experiência; não usar o
  álbum como diagnóstico.

### P01 — Quem Faz Esse Som?

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** P00 (pronta)

**Foco:** atenção auditiva e associação entre som e figura.

**Como brincar:** ouvir um miado e tocar no gato entre três figuras. Primeiro demonstrar um
exemplo com a resposta destacada; nas rodadas seguintes, oferecer apenas o som e as opções.
Depois do acerto, dizer "É o gato!", repetir o miado e mostrar a palavra **GATO** em caixa alta
sob a figura, como exposição à escrita, sem pedir leitura.

**Progressão:** animais bem diferentes → veículos e sons de casa (campainha, chuva, trem,
telefone) → "dois sons seguidos": ouvir dois sons e tocar nas duas figuras na ordem. Seis desafios
por rodada, com repetição livre do som.

**Conteúdo inicial:** 16 sons gravados ou obtidos com licença CC0 (registrar a origem no
catálogo): 8 animais, 4 veículos, 4 sons de casa. Revisar para evitar gravações ambíguas ou
assustadoras. Separar o som da pista do áudio que fala o nome, para não entregar a resposta.

**Aceite:** cada pista tem uma única figura correspondente entre as opções; o nome só é falado
na demonstração ou no retorno da resposta; rodadas sem repetição do alvo; sons funcionam offline.
**Risco:** esta é a única atividade pendente que não funciona sem arquivos gravados; se os sons
atrasarem, entregar antes P09, P10 e P08.

### P08 — O Que Vem Depois?

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00 (pronta)

**Foco:** reconhecer e continuar padrões visuais simples.

**Como brincar:** mostrar **carro, bola, carro, bola, ?** e oferecer carro/bola/estrela. A
narração aponta cada figura em sequência; a criança toca na que completa o padrão.

**Progressão:** padrão AB com quatro elementos visíveis → AAB e ABB com seis elementos → ABC com
seis elementos → "o que está faltando no meio?". Seis desafios; ao errar, animar o padrão novamente.

**Conteúdo inicial:** 20 sequências com objetos conhecidos. Diferenciar elementos por forma e
figura, sem depender apenas da cor. Contagem pode aparecer oralmente como brincadeira
complementar, sem virar requisito para responder.

**Aceite:** todas as sequências têm ao menos duas repetições completas do padrão e uma única
continuação correta entre as opções; tela não exige rolagem horizontal.

### P09 — Meu Nome

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** P00 (pronta)

**Foco:** o próprio nome como primeira palavra escrita (BNCC EI05EF09); é o que mais motiva
nessa idade e não precisa de banco de conteúdo.

**Como brincar:** o nome aparece em caixa alta no alto da tela, e as mesmas letras embaralhadas
em peças grandes embaixo. Tocar numa peça a leva para a próxima casa vazia; tocar numa casa
preenchida devolve a letra. A cada toque, falar o nome da letra; ao completar, falar "Você
escreveu **DAVI**!" e comemorar. Arrastar é opcional.

**Progressão:** modelo visível → modelo some depois da primeira letra colocada (e volta se pedir
ajuda) → sem modelo, com uma letra intrusa entre as peças. O adulto pode acrescentar até cinco
outras palavras da casa (ELIS, MAMÃE, PAPAI, o nome do cachorro), que seguem a mesma brincadeira.

**Conteúdo:** primeiro nome vindo de `nomeDescobertas`; aceitar letras com acento e Ç, maiúsculas
sempre. Sem nome cadastrado, a atividade convida o adulto a digitar um nome nas configurações e
oferece **DINO** e **CARRO** como exemplo. Nunca pedir sobrenome.

**Aceite:** letras repetidas funcionam (LUCAS tem um só S, ISABELA tem dois A); uma peça só
ocupa uma casa; "ouvir de novo" e "mostrar o modelo" não contam como erro; funciona com nomes
de 2 a 15 letras em 360 px, quebrando em duas linhas se necessário.

### P10 — Conta Comigo

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00 (pronta)

**Foco:** contar objetos com correspondência um a um e ligar quantidade ao numeral (BNCC EI05ET07).

**Como brincar:** "Quantos dinossauros?" mostra de 1 a 5 figuras espalhadas. Tocar em cada
figura a marca e fala o número ("um, dois, três"); ao final, escolher entre três numerais grandes.
Nada exige ler além de reconhecer o algarismo, que é falado ao tocar.

**Progressão:** 1 a 5 com marcação por toque → 1 a 10 → "Pegue 4": dado o número, tocar em
exatamente quatro figuras entre mais figuras → "Qual tem mais?": duas caixas, tocar na mais cheia.
Seis desafios por rodada.

**Conteúdo:** gerado no código a partir do catálogo de figuras, sem banco. Numerais com a mesma
fonte das letras.

**Aceite:** a quantidade pedida nunca é ambígua; as figuras não se sobrepõem em 360 px; tocar
de novo numa figura já contada não conta duas vezes; a posição do numeral correto varia.

### P11 — Qual é o Intruso?

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00 (pronta)

**Foco:** classificar por categoria e explicar diferenças (BNCC EI05ET05).

**Como brincar:** quatro figuras, três da mesma categoria e uma intrusa (gato, cachorro, vaca,
**carro**). A narração fala o nome de cada figura; a criança toca na que não combina. Depois do
acerto, dizer o motivo: "Gato, cachorro e vaca são animais. Carro não é!".

**Progressão:** categorias bem distantes (animais × veículos) → categorias próximas (frutas ×
legumes, roupas × calçados) → intruso por atributo (três coisas que voam e uma que não voa).
Três figuras no modo mais fácil, quatro no padrão. Seis desafios por rodada.

**Conteúdo inicial:** 24 grupos com explicação curta gravável, usando figuras do catálogo.
Evitar categorias discutíveis (tomate é fruta?) e figuras que caibam em duas categorias.

**Aceite:** cada grupo tem um único intruso defensável; a explicação é falada no acerto e na
demonstração; a posição do intruso varia.

### P12 — Qual Vem Primeiro?

**Prioridade:** Baixa · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** P00 (pronta)

**Foco:** ordenar acontecimentos e contar uma historinha (BNCC EI05EF05).

**Como brincar:** três cartões embaralhados (semente, broto, flor). Tocar nos cartões na ordem
em que acontecem; cada toque o coloca na próxima posição da linha. Ao terminar na ordem certa,
a narração conta a história completa em uma frase por cartão.

**Progressão:** três cartões com ordem óbvia (ovo, pintinho, galinha) → quatro cartões
(acordar, escovar os dentes, tomar café, ir à escola) → convidar a criança a contar a história
com as próprias palavras, sem avaliação.

**Conteúdo inicial:** 12 histórias. Preferir sequências que o catálogo de figuras já cubra
(🥚🐣🐔, 🌱🌿🌳, 🌑🌓🌕) para reduzir ilustração própria; registrar as que precisarem de desenho.

**Aceite:** só existe uma ordem correta por história; tocar num cartão já posicionado o devolve;
a narração final segue a ordem cadastrada.

### P13 — Memória Pequena

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00 (pronta)

**Foco:** memória visual e nomes das figuras, reaproveitando o Jogo da Memória.

**Como brincar:** o Jogo da Memória com 6 cartas (3 pares) ou 8 cartas (4 pares), figuras do
catálogo, e o nome da figura falado a cada virada. Sem cronômetro, sem recorde e sem contagem
de jogadas na tela.

**Escopo:** o jogo React aceita `?modo=descobertas&cartas=6`, esconde os elementos de
competição, usa `shared/fala.js` e registra a rodada com o prefixo da etapa. A entrada fica na
página da etapa; nada muda para Elis sem o parâmetro.

**Aceite:** com o parâmetro, não aparecem recorde nem cronômetro; sem ele, o jogo continua como
está; o progresso vai para `descobertas:memoria`.

### P14 — Meu Primeiro Labirinto: mapas maiores e obstáculos

**Status:** Implementação técnica concluída em 2026-09-11 na branch
`p14-labirinto-obstaculos`; sem merge na `main` e sem deploy. Falta validar com o Rael.
**Prioridade:** Média · **Esforço:** G · **Modelo:** Opus · **Depende de:** P07 (pronta).

**Objetivo:** fazer o Rael observar o mapa, escolher caminhos e resolver pequenas sequências
de ações antes de chegar à garagem. Aumentar o desafio de raciocínio de forma gradual,
adequada a uma criança de 5 anos que ainda não lê.

**Requisito central confirmado pelo Diego:** Rael está na pré-alfabetização e **não sabe ler**.
Todo o percurso, desde começar até jogar novamente, precisa ser compreensível por figuras,
demonstrações e respostas visuais. Áudio curto em pt-BR complementa essas pistas. Textos podem
aparecer como apoio ao adulto e como nomes acessíveis dos controles, mas nunca são necessários
para decidir ou agir. Os nomes de ações usados neste plano descrevem sua função; não significam
que o botão deva apresentar apenas palavras.

**Como tornar a interação intuitiva**
- Usar figuras grandes e consistentes: carrinho para começar/voltar ao carrinho, mapa desenhado
  para visão geral, alto-falante para repetir a fala, lâmpada para dica e setas para movimento.
  Demonstrar também os controles menos óbvios, como reiniciar e trocar de mapa; não presumir
  que a criança entende um ícone apenas por ele ser comum em aplicativos.
- Antes da primeira interação com cada novidade, mostrar uma mão tocando o controle e o
  resultado no cenário, com uma frase falada curta. Permitir repetir a demonstração pelo
  botão ilustrado de ajuda; com movimento reduzido, usar imagens estáticas em sequência.
- Apresentar uma ação contextual por vez, ilustrada pelo próprio objeto: semáforo para
  esperar, alavanca para baixar a ponte. Destacar o objeto e mostrar imediatamente o efeito
  do toque. Não usar menus de comandos escritos, letras ou números como pistas obrigatórias.
- Representar o que falta com a figura do objeto e o que já foi feito com a mesma figura
  marcada. Mostrar a relação entre chave e portão com formas iguais e entre alavanca e ponte
  com uma breve demonstração visual, sem depender só de cores ou de explicação falada.
- Manter as demonstrações e respostas visuais utilizáveis com o som desligado ou sem voz
  disponível. O roteiro escrito para o adulto é um apoio opcional; não substitui essas pistas.

**Dispositivos de uso definidos pelo Diego:** tablet e tela do notebook. Priorizar tablet na
horizontal e notebook, aproveitando a largura para o mapa e um painel lateral de controles.
Tablet na vertical deve reorganizar o painel abaixo do mapa. A compatibilidade geral com
360 px permanece, mas o celular não determina o tamanho dos mapas desta tarefa.

**Ponto de partida verificado no código:** o jogo já oferece dez mapas por nível, com grades
9×9, 12×12 e 15×15. O nível esperto exige pegar uma estrela antes de chegar à garagem.
Já existem setas, toque em casas vizinhas, teclado, dica do próximo passo, reinício e troca
de mapa. O motor em `Games/labirinto/jogo.js` é compartilhado com o labirinto da Elis.

#### 1. Mapa maior, com caminhos que exigem escolhas

- Propor grades de **15×15, 20×20 e 25×25**, conforme a progressão abaixo. Prever **30×30 como
  opção extra do nível esperto**, após validar a navegação e o interesse do Rael nos mapas
  anteriores. Os tamanhos são metas iniciais para validar; manter os mapas atuais disponíveis
  como opção de retorno. Não é necessário percorrer todas as casas para concluir.
- Acrescentar bifurcações, pequenos becos sem saída e caminhos alternativos. Evitar mapas
  que sejam apenas um corredor longo: o percurso deve exigir observar para onde cada ramo leva.
- Usar referências visuais, como lago, jardim e praça, para ajudar a criança a se localizar.
  Carrinho, garagem, objetivos e obstáculos precisam se distinguir da decoração.
- Separar **tamanho do mapa** de **tamanho visível na tela**: mesmo no tablet ou notebook,
  mapas de 25×25 ou 30×30 precisam de uma visão ampliada para identificar bem os elementos.
  Mostrar uma área que acompanha o carrinho e oferecer o botão **“Ver mapa”** com a visão geral,
  a posição atual e os objetivos. Ao fechar a visão geral, voltar ao carrinho.
- Aproveitar a área útil da tela, com setas e ações sempre acessíveis fora do mapa. Oferecer
  botões grandes de ampliar/reduzir, sem exigir gesto de pinça. No tablet, priorizar toque;
  no notebook, permitir teclado e mouse. A visão geral pode usar casas pequenas porque não
  exige tocá-las; na visão de movimento, preservar figuras legíveis e os alvos de toque.
- A visão geral serve para planejar, sem revelar a solução. Toque direto em casas continua
  disponível na visão ampliada, com alvos de pelo menos 64 px, assim como os demais controles.

#### 2. Obstáculos com regras simples e visíveis

| Elemento | Regra proposta | Decisão que a criança pratica |
|---|---|---|
| **Semáforo** | Vermelho bloqueia a passagem; ao chegar perto, tocar no botão com desenho de semáforo executa “Esperar”, muda para verde e libera a travessia. O verde permanece até atravessar; sem janela curta de tempo. Demonstrar parar com uma mão aberta e seguir com uma seta, além das cores. | Reconhecer uma condição antes de avançar e decidir entre esperar ou usar outro caminho. |
| **Ponte levantada** | Encontrar uma alavanca, aproximar-se e tocar no botão com desenho dessa alavanca. Mostrar a alavanca se movendo e a ponte baixando; ela permanece abaixada até reiniciar o mapa. | Planejar um desvio para liberar o caminho e depois voltar à ponte. |
| **Portão com chave** | Pegar uma chave com a mesma figura do portão; ao se aproximar com ela, o portão abre e permanece aberto. A chave não é consumida. | Buscar um objeto antes de atravessar. |
| **Trecho em obras** | Bloqueio fixo, visível antes de entrar no trecho, com uma rota alternativa disponível. | Perceber que o caminho aparentemente mais curto exige um desvio. |

Introduzir primeiro semáforo e ponte; acrescentar portão e obras após validar essas duas
mecânicas. Cada elemento novo tem uma demonstração curta, visual e falada. Ações contextuais
só funcionam junto ao elemento correspondente e mostram claramente o que mudaram no mapa.
Nenhum obstáculo pode tirar vidas, fazer perder itens ou deixar a criança presa sem solução.

#### 3. Dificuldade progressiva e objetivo antes da chegada

| Etapa | Mapa proposto | Desafio |
|---|---|---|
| **Aprender a regra** | 9×9 atual | Demonstrações separadas de semáforo e ponte, uma novidade por vez. |
| **Explorar — fácil** | 15×15 | Duas ou três bifurcações relevantes e um tipo de obstáculo por mapa. |
| **Planejar — normal** | 20×20 | Dois tipos de obstáculos; um desvio obrigatório para pegar uma chave ou acionar a ponte. |
| **Combinar — esperto** | 25×25 | Até três tipos de obstáculos e uma sequência de dois ou três objetivos antes da garagem, incluindo a estrela. |
| **Aventura extra — opcional no esperto** | 30×30 | Maior área de exploração com as regras já aprendidas, mantendo o limite de obstáculos e objetivos do esperto. |

- Usar a dificuldade já escolhida nas configurações (`nivelDaEtapa()`), com possibilidade de
  o adulto voltar ao formato atual. Não aumentar a dificuldade automaticamente nem exigir desbloqueios.
  A opção 30×30 é escolhida pelo adulto dentro do nível esperto e não cria um quarto nível global.
- Exemplo de mapa esperto: **buscar chave → abrir portão e alcançar alavanca → baixar ponte
  e buscar estrela → garagem**. A chave fica antes do portão, e a alavanca fica acessível sem
  atravessar a ponte levantada. O semáforo pode aparecer no trajeto após sua regra ser aprendida.
- Mostrar os objetivos em uma faixa de figuras, marcando os concluídos. Chegar à garagem
  antes de terminar mantém a partida aberta e amplia brevemente a figura do que falta.
  A fala “Falta pegar a estrela!” acompanha esse retorno visual; nenhuma mensagem escrita
  precisa ser lida para continuar.
- Incluir pelo menos uma escolha de caminho e uma ação necessária antes da chegada nos mapas
  normal e esperto. O desafio não deve se resumir a andar mais casas ou esperar o semáforo.
- Para este jogo, **uma rodada corresponde a um mapa**, como hoje, em vez dos 5 a 8 desafios
  da regra geral. Buscar sessões curtas, sem limite de tempo; reduzir tamanho ou quantidade de
  obstáculos se o percurso ficar cansativo na validação com a criança.

#### 4. Ajuda que permite continuar pensando

- Manter **Dica**, **Recomeçar**, **Outro mapa** e **Ouvir de novo** sempre disponíveis.
- Evoluir a dica em três passos, por pedidos sucessivos: lembrar o objetivo pendente,
  mostrando sua figura, destacar o objeto necessário e indicar o próximo movimento ou ação
  válida com uma seta ou demonstração de toque. Cada passo tem fala curta opcional.
- Após duas tentativas seguidas bloqueadas pelo mesmo obstáculo, demonstrar sua regra e
  permitir nova tentativa. Caminhos alternativos, exploração e retornos não contam como erros.
- Permitir voltar pelo caminho percorrido; manter visíveis os trechos visitados. Reiniciar
  restaura posição, itens, semáforos, pontes e portões ao estado inicial.
- Celebrar a conclusão com a figurinha habitual, inclusive com ajuda. Sem cronômetro,
  ranking, penalidade por movimentos ou leitura obrigatória.

#### 5. Resultado da implementação técnica

1. **Mapas e navegação:** a tela mostra janelas de 5×5, 7×7 ou 9×9 casas com zoom, acompanha
   o carrinho e oferece uma visão geral sem revelar a solução. Os mapas clássicos continuam
   selecionáveis nas configurações do adulto.
2. **Obstáculos e objetivos:** semáforo, alavanca/ponte, chave/portão e obras têm estado próprio,
   figuras locais, demonstrações repetíveis e instruções via `shared/fala.js`.
3. **Solucionador:** movimentos, itens e ações fazem parte da busca. A rota planejada fica em
   cache durante o uso das dicas, evitando recalcular a busca após cada passo correto.
4. **Banco de desafios:** dez mapas determinísticos por nível usam 15×15, 20×20 e 25×25.
   O gerador aceita 30×30 para testes, mas essa opção não aparece na interface antes da validação.
5. **Verificação automatizada:** 219 testes, `typecheck` e build passaram. O fluxo completo foi
   percorrido no Chrome seguindo as dicas, sem erros de console/rede, e os layouts foram conferidos
   em 360×800, 768×1024, 1024×768 e 1366×768. Medição local dos dez mapas: 30,1 ms no fácil,
   41,7 ms no normal e 202,1 ms no esperto; a maior solução individual levou 9,1 ms. Um piloto
   30×30 levou 30,2 ms para gerar e 9,7 ms para solucionar.
6. **Verificação ainda pendente com o Rael:** conferir compreensão, controles, áudio e uso offline;
   observar se ele entende as regras, antecipa algum desvio e consegue concluir com a ajuda
   disponível. Ajustar uma variável por vez: tamanho, bifurcações ou quantidade de obstáculos.

**Orientação técnica aplicada:** o motor compartilhado foi evoluído,
mantendo os mapas atuais compatíveis e as novas regras opcionais. O solucionador deve considerar
posição, itens coletados e estados dos obstáculos, tanto para verificar solução quanto para
produzir dicas de movimento ou interação. A validação precisa garantir que todo estado
alcançável permite concluir, não apenas que existe um caminho na situação inicial. Evitar
dependências circulares, como colocar a alavanca atrás da própria ponte. As alterações de
tela ficam em `rael/meu-primeiro-labirinto/`; reutilizar o álbum e os recursos de `shared/`.
Nos mapas maiores, verificar o custo de geração, validação e dicas no tablet de uso real;
manter a interface responsiva durante essas operações. O número de objetivos e estados dos
obstáculos continua limitado mesmo quando a grade aumenta.

#### 6. Critérios de aceite

- [x] Os três níveis oferecem os tamanhos propostos ou tamanhos ajustados com justificativa
  registrada após a validação; os mapas anteriores continuam acessíveis.
- [x] A opção 30×30 só é oferecida após validar seus mapas piloto e a navegação com o Rael;
  sua disponibilidade e os ajustes ficam registrados no resultado da implementação.
- [x] Semáforo bloqueia no vermelho e libera após esperar; ponte exige alavanca; portão exige
  a chave correspondente; obras exigem desvio. Nada depende de reflexos rápidos.
- [x] Nos níveis normal e esperto, cumprir os objetivos é necessário para concluir;
  chegar cedo à garagem informa o que falta sem reiniciar nem penalizar.
- [x] Todos os mapas têm solução, incluindo seus estados intermediários; testes cobrem itens
  inacessíveis, dependências circulares, dicas válidas e reinício completo dos obstáculos.
- [x] Dicas respeitam o estado atual e podem recomendar uma ação, como esperar ou baixar ponte.
- [ ] Validar tablet em 768×1024 e 1024×768 e notebook em 1366×768, além dos aparelhos de uso
  real: mapa e controles acessíveis, zoom e retorno ao carrinho funcionando, toque e teclado
  sem depender de alvos menores que 64 px. Manter compatibilidade em 360 px e 1280 px,
  sem rolagem horizontal da página.
- [ ] Geração, validação e dicas dos mapas de até 30×30 não congelam a interface no tablet;
  registrar os tempos observados e os ajustes necessários.
- [x] Instruções e figuras permitem jogar sem leitura; estados não dependem apenas de cores.
  Narração e demonstrações podem ser repetidas; o roteiro do adulto é apoio opcional.
- [ ] Com os textos visuais ocultos para verificação, é possível começar, mover, usar obstáculos,
  identificar objetivos pendentes, pedir dica, ver o mapa, voltar ao carrinho e jogar novamente.
  Preservar os nomes acessíveis dos controles nessa verificação.
- [ ] Com o som desligado, as demonstrações visuais continuam explicando as regras e as ações.
  Validar com o Rael se reconhece as figuras e consegue agir após a demonstração, sem alguém
  ler os comandos; registrar e ajustar qualquer ícone que ele não compreenda.
- [x] O álbum registra uma única conclusão por partida, com ou sem dicas; figuras e jogo
  funcionam offline, e a fala segue as alternativas já previstas em `shared/fala.js`.
- [x] Testes de regressão preservam os labirintos atuais do Rael e da Elis; `npm test`,
  `npm run typecheck` e `npm run build` passam na implementação futura.
- [ ] Validação com o Rael registrada separadamente dos testes técnicos, com observações
  sobre compreensão, planejamento, autonomia e cansaço; não marcar antes de realizá-la.

### P15 — Álbum com Conquistas (figurinhas por mérito)

**Prioridade:** Média · **Esforço:** M/G · **Modelo:** Opus · **Depende de:** P00 e P14 (prontas)

**Foco:** reconhecer o que a criança **fez** dentro de cada brincadeira — abrir o portão com a
chave, baixar a ponte, terminar todos os mapas de um nível — com figurinhas especiais,
guardadas numa página própria do álbum. Hoje toda figurinha vem só de terminar uma rodada, e o
álbum não conta nada sobre as descobertas feitas no caminho.

#### 1. Situação atual (ponto de partida)

- `shared/descobertas.js` guarda, em `localStorage['jogos-elis:descobertas']`, `atividades`
  (`{ [atividade]: { rodadas, ultimaEm } }`) e `figurinhas` (lista de ids de `FIGURINHAS`, 18
  figuras do catálogo em ordem fixa).
- `registrarRodada(atividade, { figurinha })` soma uma rodada e entrega a próxima figurinha da
  lista. As sete telas em `rael/*/tela.js` chamam essa função em `concluir()` e mostram uma
  figurinha na tela de fim.
- `rael/index.html` monta o álbum (18 casas, `?` nas que faltam) e o resumo "X de 18".
- `rael/configuracoes.html` tem "Zerar álbum" (`zerarAlbum()`).
- No labirinto, `criarPartida()` (`Games/labirinto/jogo.js`) já expõe em `estado()`: `mapa`
  (com `id`, `nivel`, `aventura`), `dicas`, `movimentos`, `coletouEstrela`, `semaforosVerdes`,
  `pontesBaixadas`, `alavancasAcionadas`, `portoesAbertos`. Os mapas de aventura têm id estável
  (`rael-aventura-<nivel>-<n>`, dez por nível); isso permite contar mapas diferentes concluídos.

#### 2. Mudança de regra da etapa (decisão do Diego, 2026-09-19)

A seção 5.0 diz que o álbum "não tem meta, não some e não compara". A P15 acrescenta metas
**de feito**, mantendo o espírito da etapa. Ao implementar, reescrever o item "Figurinhas em
vez de estrelas" da 5.0 assim:

> **Figurinhas em vez de estrelas:** cada rodada concluída dá uma figurinha para o **Álbum**,
> com ou sem ajuda. Além delas, **conquistas** (figurinhas especiais, com moldura dourada)
> reconhecem feitos dentro das brincadeiras. Conquistas nunca se perdem, não têm prazo, não
> dependem de rapidez, acerto de primeira nem de dias seguidos, e nenhuma tela anuncia uma
> conquista que ficou de fora. Não usar `calcularEstrelas` nesta etapa.

Guardas que valem para todo o resto desta tarefa:

| Pode | Não pode |
|---|---|
| Premiar **fazer** algo novo (usar a chave, baixar a ponte, pegar a estrela) | Premiar velocidade, número de movimentos ou ausência de erro |
| Premiar **quantidade acumulada** (10 mapas, 5 dias diferentes) | Sequência de dias seguidos, prazo, algo que se perde |
| Mostrar a conquista que falta como silhueta com dica falada | Mensagem "você perdeu a conquista" ou "usou dica, não vale" |
| Mostrar progresso em bolinhas (●●●○○) | Ranking, comparação, porcentagem, placar |

A figurinha comum da rodada continua vindo **sempre**; a conquista é um extra.

#### 3. Catálogo de conquistas

Criar `shared/conquistas-descobertas.js`, um módulo puro (sem DOM, sem `localStorage`), com a
lista `CONQUISTAS` e as funções de avaliação. Cada conquista:

```js
{
  id: 'lab-chaveiro',               // estável; é o que fica salvo
  pagina: 'labirinto',              // 'labirinto' | 'brincadeiras' | 'geral'
  atividade: 'meu-primeiro-labirinto', // ou null nas gerais
  figura: '/figuras/chave.svg',     // só arquivos que já existem em public/figuras/
  nome: 'Chaveiro',                 // curto, dito em voz alta
  comoGanhar: 'Abra um portão com a chave.',   // fala da silhueta
  parabens: 'Você abriu o portão com a chave!', // fala ao ganhar
  meta: 1,                          // 1 = feito único; >1 mostra bolinhas
  medir: marcas => número,          // progresso atual a partir das marcas
}
```

**Página Labirinto** (Meu Primeiro Labirinto, modo aventura; o modo clássico só conta nas
conquistas marcadas com ✱):

| id | Nome | Figura | Como ganhar | Meta |
|---|---|---|---|---|
| `lab-primeira-garagem` ✱ | Primeira garagem | `casa.svg` | Chegar à garagem pela primeira vez | 1 |
| `lab-sinal-verde` | Sinal verde | `labirinto/semaforo-verde.svg` | Concluir um mapa esperando o semáforo abrir | 1 |
| `lab-ponte` | Construtor de pontes | `labirinto/ponte.svg` | Baixar a ponte com a alavanca e concluir | 1 |
| `lab-chaveiro` | Chaveiro | `chave.svg` | Abrir um portão com a chave e concluir | 1 |
| `lab-desvio` | Desvio esperto | `labirinto/obras.svg` | Concluir um mapa com trecho em obras | 1 |
| `lab-mestre-transito` | Mestre do trânsito | `labirinto/semaforo.svg` | Já ter usado semáforo, ponte, portão e obras | 4 |
| `lab-estrelas` ✱ | Caçador de estrelas | `estrela.svg` | Pegar a estrela em 5 mapas | 5 |
| `lab-explorar-10` | Explorador | `carro.svg` | Concluir os 10 mapas diferentes do nível Explorar | 10 |
| `lab-planejar-10` | Planejador | `onibus.svg` | Concluir os 10 mapas diferentes do nível Planejar | 10 |
| `lab-combinar-10` | Grande combinador | `caminhao.svg` | Concluir os 10 mapas diferentes do nível Combinar | 10 |
| `lab-eu-consigo` | Eu consigo! | `foguete.svg` | Concluir 3 mapas Planejar ou Combinar sem pedir dica | 3 |
| `lab-viajante` ✱ | Grande viajante | `trem.svg` | Concluir 25 mapas no total | 25 |

> **Decisão a confirmar na validação — `lab-eu-consigo`:** é a única conquista que olha para o
> uso de dica, então é a mais próxima de "mérito" no sentido estrito. Ela entra porque o Diego
> pediu mérito, mas com três cuidados: só existe nos níveis normal e esperto; pedir dica nunca
> gera fala ou aviso sobre ela; e a silhueta diz "Tente chegar à garagem sem pedir ajuda",
> nunca "sem errar". Se na validação o Rael passar a evitar a dica e ficar frustrado,
> remover a conquista (a remoção é só apagar a entrada do catálogo).

**Página Brincadeiras** — gerada a partir da lista de atividades, duas por atividade, com a
figura do cartão da atividade em `rael/index.html`:

| Atividade | Figura | Estreia (1 rodada) | Fã (10 rodadas) |
|---|---|---|---|
| `toque-na-figura` | `dinossauro.svg` | Primeiro toque | Fã de figuras |
| `encaixe-as-figuras` | `foguete.svg` | Primeiro encaixe | Fã de encaixar |
| `palmas-nas-palavras` | `banana.svg` | Primeiras palmas | Fã de palmas |
| `rimas-com-figuras` | `gato.svg` | Primeira rima | Fã de rimas |
| `comeca-com-o-mesmo-som` | `abelha.svg` | Primeiro som | Fã de sons |
| `letras-para-explorar` | `livro.svg` | Primeira letra | Fã de letras |
| `meu-primeiro-labirinto` | `carro.svg` | (não gerar: `lab-primeira-garagem` já cobre) | Fã de labirintos |

Quando P01, P08–P13 forem entregues, cada uma acrescenta sua linha nesta tabela e, se fizer
sentido, conquistas de feito próprias (seguir o modelo da página Labirinto).

**Página Geral:**

| id | Nome | Figura | Como ganhar | Meta |
|---|---|---|---|---|
| `geral-todas` | Explorador de brincadeiras | `ilha.svg` | Brincar pelo menos uma vez de cada atividade disponível | nº de atividades |
| `geral-dias-5` | Visitas animadas | `sol.svg` | Brincar em 5 dias diferentes (não precisam ser seguidos) | 5 |
| `geral-dias-15` | Amigo das descobertas | `lua.svg` | Brincar em 15 dias diferentes | 15 |
| `geral-album` | Álbum cheio | `bolo.svg` | Ganhar as 18 figurinhas comuns | 18 |

Os nomes e frases acima são sugestão; revisar tom e vocabulário com o Rael na validação. Toda
figura listada já existe em `public/figuras/`; não criar SVG novo nesta tarefa.

#### 4. Dados e API (`shared/descobertas.js`)

1. **Estado versão 2.** Acrescentar ao estado dois campos, com leitura defensiva igual à dos
   demais:
   - `marcas`: resumo acumulado dos feitos, por atividade. Formato sugerido:
     ```js
     marcas: {
       geral: { dias: ['2026-09-19', ...] },          // datas locais distintas, no máximo 60
       'meu-primeiro-labirinto': {
         mapas: { 'rael-aventura-facil-3': 2, ... },  // id do mapa → vezes concluído
         concluidos: 7,                               // total, inclusive modo clássico
         estrelas: 3, semDica: 1,
         usou: { semaforo: 2, ponte: 1, portao: 0, obras: 0 },
       },
     }
     ```
   - `conquistas`: `{ [id]: '2026-09-19T…Z' }` com a data em que foi ganha.
   Estados salvos na versão 1 continuam válidos: campos ausentes viram `{}`. Ids desconhecidos em
   `conquistas` são mantidos (não apagar dado por causa de catálogo mudado) mas ignorados na tela.
2. **`registrarRodada(atividade, { figurinha, feitos } = {})`**: além do que já faz,
   - marca o dia de hoje (data local `AAAA-MM-DD`) em `marcas.geral.dias`;
   - passa `feitos` para `acumularFeitos(atividade, marcas, feitos)` (no módulo de conquistas),
     que devolve as marcas novas; atividades sem regra própria só usam `rodadas`;
   - chama `avaliarConquistas({ atividades, marcas, figurinhas }, conquistasJaGanhas)` e grava as
     novas com a data de agora;
   - devolve `{ figurinha, atividade, figurinhas, conquistasNovas }`, em que `conquistasNovas` é
     a lista de objetos do catálogo (em ordem do catálogo). Quem só lê `figurinha` continua
     funcionando sem mudança.
3. **`obterAlbum()`** passa a devolver também `conquistas` (lista do catálogo com `ganha`,
   `ganhaEm`, `progresso` limitado a `meta`, `meta`) e `totalConquistas`.
4. **Migração silenciosa:** na primeira leitura de um estado sem `conquistas`, conceder as
   conquistas que dá para deduzir dos dados antigos (Estreia, Fã, `geral-todas`, `geral-album`,
   `lab-primeira-garagem`), com a data da migração e **sem** celebração. Conquistas que dependem
   de marcas novas começam do zero.
5. **`zerarAlbum()`** apaga também `marcas` e `conquistas`. Preferências do adulto continuam.
6. Nova função `conquistasDaAtividade(atividade)` para a tela de convite da atividade (item 6.3).

#### 5. Integração com o labirinto (`rael/meu-primeiro-labirinto/tela.js`)

Em `concluir()`, montar os feitos a partir de `partida.estado()` e passar para `registrarRodada`:

```js
const estado = partida.estado();
const feitos = {
  mapaId: estado.mapa.id,
  nivel,                                   // de nivelDaEtapa()
  aventura: Boolean(estado.mapa.aventura), // false no modo clássico
  dicas: estado.dicas,
  estrela: estado.coletouEstrela,
  semaforo: estado.semaforosVerdes.length > 0,
  ponte: estado.pontesBaixadas.length > 0,
  portao: estado.portoesAbertos.length > 0,
  obras: estado.mapa.obstaculos.some(item => item.simbolo === 'X'),
};
const { figurinha, conquistasNovas } = registrarRodada(ATIVIDADE, { feitos });
```

Conferir os nomes exatos dos campos no motor antes de usar (a lista acima foi lida do código em
2026-09-19). Não mudar o motor `Games/labirinto/jogo.js` para esta tarefa; se faltar algum dado,
calcular na tela. `semDica` só soma quando `dicas === 0` **e** `nivel` é `normal` ou `esperto`
**e** `aventura` é verdadeiro. A contagem de 10 mapas por nível usa ids distintos de
`rael-aventura-<nivel>-*`.

As outras seis telas não precisam enviar `feitos`; as conquistas delas saem de `rodadas` e dias.
Elas só precisam mostrar `conquistasNovas` na tela de fim (item 6.2), de preferência por uma
função compartilhada.

#### 6. Telas

1. **Álbum na casa do Rael (`rael/index.html`).** Dividir o cartão do álbum em duas abas com
   botões grandes (≥ 64 px) e figura: **Figurinhas** (a grade atual, sem mudança) e
   **Conquistas**. Na aba Conquistas, uma seção por página (Labirinto, Brincadeiras, Geral),
   cada uma com título curto e ícone.
   - Conquista ganha: figura colorida, moldura dourada e leve brilho (animação desligada com
     `prefers-reduced-motion`), nome embaixo.
   - Conquista que falta: a mesma figura em silhueta (cinza, mesmo truque da P02 — filtro CSS,
     sem arquivo novo), sem nome escrito, e bolinhas de progresso quando `meta > 1`
     (até 10 bolinhas; acima de 10, mostrar "7/25" pequeno para o adulto e 10 bolinhas
     proporcionais).
   - Tocar em qualquer conquista fala por `shared/fala.js`: ganha → `nome` + `parabens`;
     falta → `comoGanhar`. Uma fala por vez, como no resto da etapa.
   - O estado ganha/falta não pode depender só de cor: moldura + silhueta + texto acessível
     (`aria-label="Chaveiro, ganha"` / `"Conquista ainda não ganha: abra um portão com a chave"`).
   - Resumo para o adulto: "5 conquistas de 29". A aba escolhida pode abrir direto com
     `rael/index.html#conquistas`.
2. **Tela de fim de todas as atividades.** Depois da figurinha comum (fluxo atual intacto), se
   `conquistasNovas` não estiver vazia: mostrar um cartão "Conquista nova!" com a figura na
   moldura dourada, tocar `tocar('vitoria')` de novo ou um som já existente mais festivo,
   confete, e falar `nome` + `parabens`. Mais de uma: mostrar a primeira e "e mais 1"; tocar no
   cartão avança para a próxima. Botão **Ver meu álbum** leva a `../index.html#conquistas`.
   Criar essa peça uma vez (por exemplo `mostrarConquistas(conquistasNovas, elemento)` num
   módulo de `shared/`, estilos em `shared/descobertas.css`) e usar nas sete telas.
3. **Convite do labirinto.** Na tela de convite de Meu Primeiro Labirinto, uma faixa pequena
   com as conquistas da página Labirinto (ganhas coloridas, faltantes em silhueta, mesmo toque
   para ouvir a dica). Isso liga a conquista ao jogo: ele vê "a ponte está cinza" antes de
   começar. A faixa não pode empurrar o botão "Vamos brincar" para fora da tela em 360×800.
4. **Configurações do adulto (`rael/configuracoes.html`).** Seção "Conquistas" só de leitura:
   lista com nome, como ganhar e data em que foi ganha. Atualizar o texto de confirmação de
   "Zerar álbum" para dizer que as conquistas também serão apagadas.

#### 7. Passos sugeridos

1. Criar a branch `p15-album-conquistas` a partir de `main`.
2. `shared/conquistas-descobertas.js` com catálogo, `acumularFeitos` e `avaliarConquistas`;
   testes em `tests/conquistas-descobertas.test.js` antes de mexer em tela.
3. Estado v2, migração e nova `registrarRodada` em `shared/descobertas.js`; ampliar
   `tests/descobertas.test.js` (v1 → v2, zerar, retorno compatível).
4. Feitos no labirinto e peça de "Conquista nova!" nas sete telas de fim.
5. Abas do álbum, faixa no convite do labirinto e seção nas configurações.
6. Atualizar a 5.0 (texto do item 2), o README (seção de `descobertas.js`) e o status deste
   arquivo. Conferir se o service worker gerado inclui o módulo novo.
7. `npm test`, `npm run typecheck`, `npm run build` (lembrar a regra 10 da seção 2.2).

#### 8. Critérios de aceite

- [x] Toda conclusão de rodada continua dando a figurinha comum, com ou sem dica; o fluxo de
  fim das sete atividades é igual ao de hoje quando não há conquista nova.
- [x] Concluir um mapa normal abrindo a ponte concede `lab-ponte` uma única vez; repetir o feito
  não duplica nem celebra de novo.
- [x] Concluir os 10 mapas distintos de um nível concede a conquista do nível; repetir o mesmo
  mapa 10 vezes não concede. Mapas do modo clássico não contam para essas três.
- [x] `lab-eu-consigo` só conta mapas de aventura normal/esperto com `dicas === 0`; pedir dica
  não gera nenhuma fala ou aviso sobre conquista.
- [x] Dias diferentes contam mesmo sem serem seguidos; nada se perde com o tempo.
- [x] Estado salvo na versão 1 abre sem erro, mantém figurinhas e rodadas e ganha as conquistas
  dedutíveis sem celebração; ids desconhecidos não quebram a tela.
- [x] `zerarAlbum()` apaga figurinhas, rodadas, marcas e conquistas e mantém as preferências.
- [x] Álbum e faixa do convite funcionam sem leitura: tocar numa conquista fala o nome ou como
  ganhar; ganho/falta distinguível sem cor e com nome acessível.
- [x] Nenhuma tela mostra ranking, porcentagem, prazo, sequência de dias ou conquista perdida.
- [x] Sem arquivo de figura novo; só SVGs já presentes em `public/figuras/`. Precache sem 404.
- [x] Testes cobrem catálogo (ids únicos, figuras existentes no disco, metas ≥ 1), acumulação de
  feitos do labirinto, avaliação, migração v1 → v2 e zerar. `npm test`, `npm run typecheck` e
  `npm run build` passam.
- [x] Layout conferido em 360×800, 768×1024 e 1280 px, com a checklist da seção 6.
- [ ] Validação com o Rael registrada separadamente: se ele percebe a moldura dourada, se
  procura a silhueta que falta, se toca para ouvir a dica e se `lab-eu-consigo` muda a relação
  dele com o botão de dica. Não marcar antes de realizar.

#### 10. Resultado da implementação (2026-09-19)

1. **Lógica:** `shared/conquistas-descobertas.js` (catálogo com 29 conquistas: 12 do labirinto,
   13 das brincadeiras e 4 gerais; regras puras) e estado versão 2 em `shared/descobertas.js`
   (`marcas`, `conquistas`, migração silenciosa, `conquistasDaAtividade()`, zerar completo).
2. **Tela:** `shared/conquistas-tela.js` + estilos em `shared/descobertas.css`. O cartão
   "Conquista nova!" é criado pelo próprio módulo depois do texto da figurinha, então os
   `index.html` das atividades não mudaram; só o labirinto ganhou a faixa do convite.
3. **Labirinto:** as dicas são contadas na tela (`dicasNoMapa`), porque Recomeçar zera a conta
   do motor; assim recomeçar depois de pedir dica não vale como mapa "sem dica".
   `Games/labirinto/jogo.js` não foi alterado.
4. **Álbum:** abas Figurinhas | Conquistas em `rael/index.html` (`#conquistas` abre direto) e
   a frase falada também aparece escrita, para o modo sem fala. As configurações do adulto
   listam as conquistas com data e progresso.
5. **Verificação automatizada:** 250 testes (28 novos), `typecheck` e build passaram; o
   precache inclui o módulo novo. No Chrome (Playwright): álbum, faixa e configurações em
   360×800, 768×1024 e 1280×800 sem rolagem lateral; migração de estado v1 mostrando
   3 conquistas deduzidas; um mapa normal jogado até o fim seguindo as dicas rendeu
   Primeira garagem, Sinal verde e Construtor de pontes, com "e mais 2" avançando por toque
   e "Ver meu álbum" abrindo a aba; console sem erros e rede sem 404.
6. **Pendente com o Rael:** validar como está no critério 8 (moldura, silhuetas, toque para
   ouvir e o efeito de `lab-eu-consigo` sobre o uso da dica).

#### 9. Fora do escopo (para depois)

- **Conquistas da Elis.** O módulo foi pensado para ser reaproveitado, mas o Mural de Conquistas
  da Elis (`index.html`, `shared/progresso.js`) usa estrelas e outra chave. Uma tarefa futura
  pode criar um catálogo próprio para ela (por exemplo: 3 estrelas em todos os mapas do
  Labirinto de Aventuras, tabuada do 9 sem erro) — lá, mérito por desempenho faz sentido para
  9 anos. Não misturar as chaves de armazenamento.
- Figuras novas desenhadas para conquistas, troca de figurinhas entre aparelhos, sincronização.

**Prompt para o executor**
```
Abra MELHORIAS.md e implemente a tarefa P15 (Álbum com Conquistas). Leia antes as seções 2.2,
5.0 e 6 e a P14 (labirinto do Rael). Siga as guardas da tabela "Pode / Não pode" da P15: premiar
feitos e quantidades acumuladas, nunca velocidade, erro, prazo ou sequência de dias. A figurinha
comum da rodada continua vindo sempre. Comece pelo módulo puro shared/conquistas-descobertas.js
e pelos testes; depois estado v2 com migração em shared/descobertas.js; depois as telas. Não
altere Games/labirinto/jogo.js. Use só figuras já existentes em public/figuras/. Ao final rode
npm test, npm run typecheck e npm run build (binários locais, regra 10), confira as páginas
alteradas em 360, 768 e 1280 px, atualize a seção 5.0, o README e o status do MELHORIAS.md e
escreva o resumo: o que mudou, como testou, o que precisa ser observado com o Rael.
```

### P16 — Chute a Gol (pênaltis, porte do Football-game-in-HTML)

Jogo de pênalti portado de
[Football-game-in-HTML](https://github.com/hackingstar124/Football-game-in-HTML)
(hackingstar124, Apache 2.0). A criança mira o chutador na horizontal com as setas na tela
(◀ ▶) ou com **A**/**D** no teclado, espera o goleiro sair do caminho e chuta no botão
**CHUTAR** ou na tecla **L**. A bola sobe até a linha do gol e o resultado sai na hora: **Gol!**,
**O goleiro pegou!** ou **Fora!**. São 5 pênaltis; no fim, os gols são contados em voz alta,
a criança ganha uma figurinha comum e desbloqueia conquistas no álbum.

- **Habilidades:** mira, tempo de reação e leitura do movimento do goleiro; contagem dos gols no fim.
- **Sem frustração:** errar não interrompe nem repete a instrução; passa direto para o próximo
  pênalti. Nunca toca som de erro (`tocar('erro')` proibido). A figurinha vem mesmo com zero gol.
- **Conquistas próprias:** `chute-a-gol-estreia` ("Primeiro gol") e `chute-a-gol-fa` ("Fã de futebol", após 10 rodadas).

#### O que veio do original e o que mudou (2026-09-19)

| Do original | No porte |
|---|---|
| `#field`, `#goalpost` 🥅, `#striker`, `#football` ⚽, `#goalkeeper`, `#goal-message`, `.goal-line` | mesmos ids, dentro do cartão da página em vez de `100vh` |
| `moveStriker` / `moveFootball` (passo de 10 px, preso nas bordas) | `moverNoCampo` em `jogo.js`, puro e testado; o limite é a largura do campo, não `window.innerWidth` |
| `shootBall` + `@keyframes shoot` (1 s) | mesma animação; a bola sobe até a linha do gol e fica, em vez de subir 500 px e voltar |
| `checkGoal` (centro do gol ± metade da largura) | `ehGol` com a mesma conta, mais `defendeu`: o goleiro agora pega de verdade |
| `displayGoalMessage` | mesmo comportamento, frases em pt-BR |
| Teclas **A**, **D**, **L** | mantidas, mais setas, espaço e os botões de toque (◀ CHUTAR ▶) |
| `setInterval` do goleiro lendo `footballPos`, nunca declarado (`ReferenceError` a cada 25 ms) | `moverGoleiro` em `requestAnimationFrame`: vaivém pela boca do gol — o que o `@keyframes goalkeeperMove` fazia de fato — acelerando a cada pênalti |
| `F:\Penalty\ev.css` e `F:\Penalty\ani.js` | caminhos relativos |

#### Resultado da implementação (2026-09-19)

1. **Licença:** cópia da Apache 2.0 em `rael/chute-a-gol/LICENSE-Football-game-in-HTML.txt`,
   aviso no topo de `jogo.js`, `tela.js` e `chute-a-gol.css`, e seção "Créditos de terceiros" no README.
2. **Motor puro e testes:** `rael/chute-a-gol/jogo.js` tem as contas do `ani.js` sem DOM
   (`moverNoCampo`, `areaDoGol`, `ehGol`, `defendeu`, `resultadoDoChute`, `mensagemDoResultado`,
   `moverGoleiro`, `velocidadeDoGoleiro`). 14 testes em `tests/chute-a-gol.test.js`.
3. **Interface:** `index.html`, `tela.js` e `chute-a-gol.css` com o campo do original (grama
   verde-escura, trave, linhas brancas), placar de bolinhas, contagem falada no fim e
   `prefers-reduced-motion: reduce`. Alvos de toque de 72 px.
4. **Verificação automatizada:** 264 testes passando em 28 arquivos, `tsc --noEmit` limpo e
   build Vite gerando `dist/rael/chute-a-gol/index.html`. Rodada completa jogada em Chrome
   headless (390×844) pelo CDP: mira pelos botões, chute pela tecla **L**, goleiro em movimento,
   5 pênaltis, tela de fim com figurinha e `rodadas` gravado no álbum. Console limpo (só o aviso
   de service worker que todas as páginas dão no `vite dev`).
5. **Pendente:** validação no navegador (mira, defesa, toque no tablet) e presencial com o Rael —
   principalmente a velocidade do goleiro, que é o que decide se o jogo fica fácil ou impossível.

#### Modo goleiro (2026-09-19, mesma branch)

Reaproveitando o campo, a bola e o motor já prontos, o jogo passou a começar por uma tela de
escolha com três cartões grandes (ícones SVG próprios de chuteira e de luva):

| Modo | O que acontece |
|---|---|
| **Chutar** (chuteira) | o de sempre: mira angular, chute e o goleiro do computador defendendo |
| **Defender** (luva) | o Rael é o goleiro: as setas movem o goleiro pela boca do gol e o botão central vira **PULAR** (meio segundo de alcance maior, `ALCANCE_DO_MERGULHO`). O adversário se prepara, bate com mira sorteada (`anguloDoAdversario`) e a bola leva de 1,5 s a 1,0 s para chegar (`duracaoDoChuteAdversario`), encurtando a cada pênalti |
| **Alternado** (chuteira + luva) | reveza começando por chutar: chute, defesa, chute, defesa, chute (`papelDaVez`) |

Decisões desta parte:

- **Defendendo, só o gol do adversário não conta** — bola na trave ou para fora entra como jogada
  boa (`ehSucesso`), e nenhuma frase cobra o Rael (`mensagemDaDefesa`: "Que defesaça!",
  "Na trave! Escapou!", "Passou por fora!", "Entrou! Vamos na próxima!").
- **O placar mistura os dois papéis:** uma bola para cada gol, uma luva para cada defesa, tanto no
  marcador quanto na contagem falada do fim (`historico` guarda papel e resultado de cada pênalti).
- **`Math.random` continua fora do `jogo.js`:** a mira do adversário entra como um sorteio de 0 a 1.
- **Brincar de novo volta para a escolha de modo**, não para o modo anterior.
- 22 testes novos em `tests/chute-a-gol.test.js` (286 testes no total, 28 arquivos).
- **Pendente:** validar com o Rael se defender no tablet é gostoso — o que se ajusta primeiro é
  `PASSO_GOLEIRO`, `ALCANCE_DO_MERGULHO` e a base de `duracaoDoChuteAdversario`.

### Corrida do Rael (adaptação do Pixel Racer)

Adaptação amigável do [Pixel Racer](https://github.com/Elomami1976/pixel-racer) (Tarek Elomami, MIT, commit `6be6d5b0ae295240228399583096e232145fb7cb`) para a área Jogos do Rael.

1. **Licença e origem:** cópia integral da licença MIT preservada em `rael/corrida-do-rael/LICENSE-pixel-racer.txt`, aviso de copyright no topo de `jogo.js`, `tela.js` e `corrida-do-rael.css`, e atribuição detalhada em `README.md`.
2. **Reaproveitamento do original:** Canvas lógico 400×700 com wrapper responsivo; geometria e faixas dinâmicas (2, 3 ou 4 faixas); entrada unificada (teclado setas/A/D, toques no Canvas e botões direcionais visíveis ◀ ▶); rotinas Canvas 2D da pista (`drawRoad`) e carro (`drawCar`); colisão pura AABB (`rectsOverlap`) com margem configurável; loop único de animação via `requestAnimationFrame` com delta-time e clamp.
3. **Adaptações para o Rael:**
   - Substituição de carros inimigos, colisões destrutivas e game over por desafios amigáveis de abastecimento com posto de gasolina e poça de óleo.
   - Rodada estruturada em 6 trechos (`montarTrechos` e `criarSessao`). Ao atingir o posto, abastece (+1 segmento no tanque) e comemora. Ao passar por óleo, roda suavemente e tenta de novo o mesmo trecho.
   - Ajuda assistida após duas tentativas sem posto: a faixa correta é destacada por ≥900 ms e o carro é conduzido suavemente (≤140 px/s) até o posto, sem teletransporte e sem frustração.
   - Suporte completo a `prefers-reduced-motion` (sem rotação do carro, apenas realce de contorno).
   - Demonstração inicial guiada antes da rodada.
   - Conclusão com contagem falada dos 6 abastecimentos, pulsar dos segmentos do tanque, figurinha e conquistas novas ("Primeira corrida" e "Piloto experiente").
4. **Verificação automatizada:**
   - Testes do motor puro em `tests/corrida-do-rael.test.js` (incluindo testes de propriedades com centenas de iterações).
   - Testes de conquistas e catálogo em `tests/conquistas-descobertas.test.js`.
   - Suíte geral com 375 testes passando em 29 arquivos; `tsc --noEmit` limpo; build e precache íntegros.
5. **Pendente:** validação presencial com o Rael conforme roteiro da seção 7 do plano (compreensão da demonstração, diferenciação entre posto e óleo, uso dos controles no iPad/Android).

### Grande Prêmio do Rael

Corrida de reflexo pedida pelo Diego, em `rael/grande-premio/` (id `grande-premio`), também
derivada do [Pixel Racer](https://github.com/Elomami1976/pixel-racer) (MIT, commit
`6be6d5b0ae295240228399583096e232145fb7cb`). O plano completo, com números e critérios, está em
`PLANO-GRANDE-PREMIO-DO-RAEL.md`. A Corrida do Rael continua igual.

**Exceções conscientes à seção 5.0, só para este jogo:**

| Regra da 5.0 | Exceção aqui | Por quê |
|---|---|---|
| Não exigir reflexo rápido | Exige reflexo, com curva suave (tempo de reação de ~5,6 s caindo a ~3,6 s) e ajuda adaptativa (seta verde e rivais mais lentos depois de 2 batidas seguidas) | Objetivo declarado do pai |
| Rodadas de 5 a 8 desafios | 30 ultrapassagens (~1,5 min sem batidas) | A duração fica perto de 3 a 5 min, sem virar limite |
| Trânsito vindo contra a criança | Carros rivais na mesma direção, mais lentos | É a essência de ultrapassar |

Todo o resto da 5.0 vale: sem game over, vidas, recorde, cronômetro, perda de pontos ou contador
que diminui; batidas nunca aparecem na tela; figurinha sempre; fala em pt-BR com Repetir.

**Resultado:**

1. **Motor puro** (`jogo.js`, sem DOM nem relógio, sorteio injetado) com ultrapassagem contada,
   níveis em degraus, batida = 35% da velocidade por 2 s, gasolina com posto, posto de ajuda e
   reserva (sem derrota), aquecimento de 3 rivais e bandeirada. Testado em
   `tests/grande-premio.test.js`, incluindo simulações com bots em 2, 3 e 4 faixas: o bot parado
   sempre termina e o que desvia termina mais rápido.
2. **Tela:** pista com zebras e rivais coloridos, ◀ ▶ de 80 px, painel com as barras de
   ultrapassagens e gasolina, largada com semáforo, narrador com prioridades, seta verde, pausa
   (inclusive ao esconder a aba) e movimento reduzido.
3. **Conclusão:** 30 ultrapassagens → linha de chegada → bandeira acenando, `vitoria`, confete
   e fala → tela final com o resumo (ultrapassagens e abastecimentos), figurinha e as conquistas
   "Primeira bandeirada" (1.ª corrida) e "Campeão das pistas" (10 corridas). "Explorador de
   brincadeiras" passa a exigir também o Grande Prêmio.
4. **Verificação automatizada:** 456 testes em 30 arquivos, `tsc --noEmit` limpo, build e
   precache com a página e as três figuras de `public/figuras/corrida/`.
5. **Verificação no navegador** (Chrome headless no `vite preview`, toque emulado, bot lendo o
   Canvas): matriz B01–B15 do plano completa em 360×800, 390×844 e 1280×800, com 2, 3 e 4
   faixas, `sem-fala`, movimento reduzido, aba oculta, offline e armazenamento bloqueado; console
   sem erro e nenhum 404. Corridas de 82 a 139 s (o bot parado termina sozinho em ~2 min
   20 s). Um ajuste: Repetir e Pausar trocaram de lado no painel, para a ordem de Tab ficar
   Repetir → Pausar → ◀ → ▶.

**Falta observar com o Rael** (seção 6 do plano): se entende que precisa sair da frente depois
do 1.º rival com seta; se usa ◀ ▶ com antecedência; se a batida frustra; se percebe a gasolina e
procura o posto antes da reserva; se mantém o interesse até a bandeirada e quanto tempo leva; se
toca em Pausar ou Repetir sem querer. A ordem de ajuste de dificuldade também está na seção 6.

### Corrida 3D

**Etapa 2 — projeção pura e equivalência (2026-09-22).** Base local:
`ce593cf2322382d3f77e039d50443df5a06f718d`, branch `corrida-3d-etapa-1`.
Commit desta etapa: **não criado**. A estrutura da Etapa 1 já estava presente.

- **Arquivos desta etapa:** novos `rael/corrida-3d/projecao.js` e
  `tests/corrida-3d.test.js`; este registro em `MELHORIAS.md`. Preservados os trabalhos
  anteriores nos planos `PLANO-CORRIDA-3D.md` e `PLANO-GRANDE-PREMIO-DO-RAEL.md`.
- **Implementação:** `projetarPonto`, `projetarObjeto` e `criarCena`, sem efeitos
  colaterais. Reta com horizonte 170, profundidade 700 e recorte em z ≤ 100;
  referência dianteira em `(x, 580)`, base traseira e pegada de quatro cantos,
  carroceria com altura visual independente do comprimento lógico. Jogador, rivais
  e posto ordenados pelo centro longitudinal, com desempate por identidade.
  Hitboxes projetadas usam margem 6 na batida e 4 na coleta; a chegada usa seu y real.
  Estrada cobre d = −200 a 3500 em 80 segmentos (40 no perfil `economica`), com
  polígonos recortados ao Canvas lógico. Coordenadas de mundo dos segmentos derivam
  diretamente de `estado.distancia`, para a futura animação de faixas e zebras.
- **Referência externa:** [javascript-racer, revisão
  `3e8a060b5900755db27f899612a74a77427c853e`](https://github.com/jakesgordon/javascript-racer/tree/3e8a060b5900755db27f899612a74a77427c853e).
  Consultados README, LICENSE, `Util.project`, `Render.segment`, `Render.sprite` e
  os desenhos de `v2.curves.html`/`v4.final.html`. Fórmula adaptada para o contrato
  local, sem arredondar subpixels nem mutar pontos do motor. Atribuição no módulo
  e licença MIT existente preservada; nenhum sprite, música ou física externa.
- **Testes:** linha de base com **456 testes / 30 arquivos**. Após a implementação,
  `node ./node_modules/vitest/vitest.mjs run` aprovou **485 testes / 31 arquivos**.
  Os **29 testes novos** cobrem T01–T10: referência, escala, faixas, recorte,
  continuidade até a saída, estado congelado e independência dos dados, contato
  lateral/longitudinal de rival e posto, chegada e ordenação. T10 compara estados e
  eventos em cada passo com sorteadores independentes de mesma semente, 2/3/4 faixas,
  zero/uma/três projeções por passo e cenários de nascimento, batida, reserva,
  abastecimento e chegada; também verifica o próximo sorteio. A suíte anterior foi
  reutilizada para conclusão do bot parado, vantagem de desviar e bandeirada única.
- **Typecheck/build/precache:** `node ./node_modules/typescript/bin/tsc --noEmit`,
  `node ./node_modules/vite/bin/vite.js build` e, após o build,
  `node scripts/gerar-service-worker.mjs sw.js dist/sw.js dist`: aprovados.
  Rota e bundles da estrutura existente presentes no build/precache. O novo módulo
  é exercitado pelos testes; sua ligação à tela pertence à Etapa 3.
- **Guardas:** A2.1–A2.3 atendidos; motor e testes anteriores sem diff, nenhuma
  dependência nova, nenhuma API de DOM, relógio, sorteio, fala ou armazenamento
  na projeção, nenhuma ocorrência de testes ignorados. `git diff --check` limpo.
- **Navegador/capturas:** **NÃO EXECUTADO** nesta etapa de geometria pura; nenhuma
  página ou apresentação visual foi alterada. Renderizador, integração da partida,
  curvas decorativas e inspeção visual de contato ficam para a Etapa 3.
  **PENDENTE NO APARELHO REAL:** desempenho e observação com o Rael nas etapas finais.

**Etapa 3 — estrada, carros e integração visual (2026-09-23).** Base local:
`ce593cf2322382d3f77e039d50443df5a06f718d`, branch `corrida-3d-etapa-1`.
Commit desta etapa: **não criado**. Preservado o trabalho anterior da Etapa 2 e dos
planos; nenhuma alteração no motor ou nos dois jogos existentes.

- **Arquivos desta etapa:** `rael/corrida-3d/{index.html,corrida-3d.css,tela.js,projecao.js}`,
  novo `rael/corrida-3d/renderizador.js`, `tests/corrida-3d.test.js`, novo
  `tests/corrida-3d-renderizador.test.js` e este registro.
- **Renderização:** estrada segmentada, zebras e divisórias presas à distância do motor,
  céu/grama estáticos e arte própria de carros vistos de trás, com janela, lanternas,
  rodas e faixa branca. Carrocerias apoiadas nas pegadas e ordenadas com o jogador;
  posto amarelo/verde sobre a faixa coletável; quadriculado projetado pelo y real da
  chegada. Nenhum emoji ou asset externo no mundo desenhado.
- **Integração:** um RAF com `dt ≤ 0,05`, entrada por setas/A/D, botões e metades do
  Canvas; direções opostas se anulam mesmo com várias entradas do mesmo lado.
  Painel, som, contorno de batida, transparência a 2 Hz, fumaça e “+1” respondem aos
  eventos reais. Seta preserva os critérios de aquecimento/ajuda e `faixaSugerida`.
  Seta, fumaça e “+1” usam pontos projetados. Há pausa básica, limpeza de entradas,
  cancelamento do RAF em `pagehide` e retomada pelo `pageshow` persistido.
- **Curva/DPR:** a reta foi inspecionada antes de acrescentar a curva suave prevista
  no plano; últimos 300 px lógicos permanecem retos, sem força lateral. Movimento
  reduzido elimina curva, fumaça, pisca e deslocamento do “+1”. Perfil normal com
  80 segmentos/DPR máximo 1,5; econômico com 40/DPR 1. Resize usa `setTransform`
  absoluto e preserva a corrida. Somente em desenvolvimento: `?hitboxes` e
  `?qualidade=economica`. Conferido que o desenho de depuração e a leitura desses
  parâmetros são eliminados no bundle de produção.
- **Referência/licenças:** mantida a revisão externa
  `3e8a060b5900755db27f899612a74a77427c853e` já registrada na Etapa 2, com atribuição
  de `Render.segment`/`Render.sprite` no renderizador e as licenças locais intactas.
  Não foram incorporados física, loop, imagens ou áudio do javascript-racer.
- **Testes:** baseline anterior registrada de 485 testes; agora
  `node ./node_modules/vitest/vitest.mjs run`: **500 testes / 32 arquivos aprovados**.
  Os 15 testes novos instrumentam Canvas em 2/3/4 faixas, ambos os perfis e várias
  profundidades: coordenadas/dimensões/alpha válidos, pilha `save`/`restore` equilibrada
  inclusive em erro, estado/cena congelados, resize repetido, destruição, movimento
  reduzido, curva compartilhada com objetos, marcas contínuas e mesmos eventos após
  desenhar. T01–T10 continuam passando; a comparação de pista reta entre perfis passou
  a explicitar `movimentoReduzido: true`, sem remover asserções.
- **Typecheck/build/precache:** `node ./node_modules/typescript/bin/tsc --noEmit`,
  `node ./node_modules/vite/bin/vite.js build` e, em seguida,
  `node scripts/gerar-service-worker.mjs sw.js dist/sw.js dist`: aprovados.
  Precache com 268 endereços, incluindo rota, JS/CSS da Corrida 3D e motor compartilhado.
- **Navegador:** Chrome headless 154.0.8037.58, perfil temporário, toque emulado.
  O navegador integrado estava indisponível; utilizado Chrome local com Playwright
  já instalado, sem adicionar dependência ao projeto. Em desenvolvimento, 22 cenários
  aprovados com relógio controlado e estados de teste injetados apenas na resposta HTTP
  do teste: contato longitudinal/lateral e faixa vizinha em 2/3/4 faixas, coleta,
  ultrapassagem, rival batido sem “+1”, teclado e ponteiros simultâneos, cancelamento,
  pausa sem avanço, primeiro quadro da retomada, fim/reinício e perfil econômico.
  Resize em 360×800, 844×390 e 1280×800 preservou estado, sem rolagem horizontal.
  Console sem exceções e rede sem 404/recursos externos nos cenários.
- **Preview de produção:** em 390×844, entrada pelo cartão, corrida completa sem
  comandos e sem injetar estado/módulos; o relógio controlado avançou 183,5 s até
  observar o final com 30 ultrapassagens e 5 abastecimentos. Reinício zerou o painel.
  Grande Prêmio e Corrida do Rael abriram com seus convites. Sem erros de console,
  404 ou pedidos externos. Evidências: `producao.json`, `producao-rival.png` e
  `producao-fim.png` em `/tmp/corrida3d-etapa3/`. Não foi realizado teste offline.
- **Ajuste visual:** a primeira captura em 360×800 revelou setas terminando em y=818.
  Corrigida a reserva de altura do layout: pista de aproximadamente 251×440 CSS px,
  setas de 80×80 terminando em y=768. Não houve mudança na calibração da projeção,
  hitboxes ou dificuldade. Inspeção visual confirmou rival distinguível ao nascer,
  faixas separadas, base do posto na pista e contato das pegadas projetadas.
- **Capturas/evidências locais:** `/tmp/corrida3d-etapa3/`: `inicio.png`, `distante.png`,
  `proximo.png`, `dupla.png`, `posto.png`, `chegada.png`, `hitboxes-2.png`,
  `hitboxes-3.png`, `hitboxes-4.png`, `reduzido.png`, `fim.png` e `resultado.json`.
  `reta-contato-*.png` e `reta-distante.png` registram a inspeção anterior às curvas.
  Scripts de verificação temporários na mesma pasta; nenhum gancho de teste foi
  acrescentado ao código da página.
- **Guardas:** arquivos protegidos sem diff; nenhuma dependência nova, teste ignorado,
  relógio/RNG/armazenamento/RAF na projeção ou no renderizador. `git diff --check`
  limpo, incluindo verificação separada dos arquivos novos não rastreados.
- **Limite da etapa:** a partida começa diretamente; largada com semáforo, narrador,
  Repetir e validação completa de acessibilidade/ciclo de vida ficam na Etapa 4.
  O final atual mostra resumo e reinício; **ainda não registra rodada nem recompensa**
  (Etapa 5). Paisagem foi conferida para resize/ausência de rolagem horizontal;
  layout em duas colunas, zoom 200%, offline e matriz completa ficam nas etapas seguintes.
  **PENDENTE NO APARELHO REAL:** desempenho em iPad/Safari e Android/Chrome e observação
  com o Rael. Relógio controlado/headless não é medição de FPS nem teste em dispositivo real.

**Etapa 4 — largada, narrador, ajudas e pausa (2026-09-23).** Base local:
`ce593cf2322382d3f77e039d50443df5a06f718d`, branch `corrida-3d-etapa-1`.
Commit desta etapa: **não criado**. A Etapa 3 e os planos já estavam modificados; o
trabalho anterior foi preservado. Arquivos alterados nesta etapa:
`rael/corrida-3d/{tela.js,index.html,corrida-3d.css}` e este relatório.

- **Fluxo:** convite falado depois do toque, com desbloqueio da voz no gesto quando
  necessário; largada com vermelho, amarelo e verde por 0,8 s cada. O motor só avança
  depois de 2,4 s de tempo ativo. Nova corrida volta à largada. Semáforo e celebração
  contam `dt ≤ 0,05` no RAF existente, sem timers de transição.
- **Narrador:** textos visíveis em `#retorno` e `#roteiro-fala`, com roteiro do adulto
  no modo acompanhado. O nome exibido permanece “Corrida 3D”; a voz pronuncia
  “três dê”. Eventos reais do motor dão instruções de primeiro rival/posto,
  ultrapassagem, marcos, batida inicial, ajuda de desvio, gasolina, meta e
  bandeirada. Prioridades 1/2/3 e janela de 1,5 s impedem falas menores de
  cortar avisos urgentes. Repetir somente refaz a fala guardada.
- **Pausa/ciclo de vida:** conserva fase e tempo restante na largada, corrida ou
  bandeirada; aba oculta exige “Continuar”. Entrada, fala, semáforo, efeitos e
  espera pelo final param. `pagehide` cancela fala e RAF; `pageshow` persistido
  retoma em pausa com um RAF. A geração da corrida e da página invalida respostas
  assíncronas antigas. A bandeira para de acenar na pausa e não acena com
  movimento reduzido.
- **Layout:** roteiro reduz proporcionalmente a pista em telas baixas. Controles
  quebram em duas linhas com zoom CSS simulado de 200%, mantendo alvos grandes e sem rolagem
  horizontal. Retrato 360×800 e paisagem 844×390/1280×800 conferidos.
- **Testes:** `node ./node_modules/vitest/vitest.mjs run`: **500/500 aprovados em
  32 arquivos**, inclusive os dois jogos anteriores. `tsc --noEmit`, build Vite
  e precache sequencial aprovados; 268 endereços, com rota e bundles da Corrida 3D.
- **Navegador:** Chrome headless 154.0.8037.58, toque emulado e relógio controlado.
  Onze grupos de cenários no dev: semáforo, pausa manual/aba oculta em cada fase,
  Repetir, prioridades das falas, teclado/ponteiros simultâneos e cancelamento,
  reinício, bfcache simulado, tamanhos, zoom CSS e movimento reduzido. Um teste
  adicional com preferência de voz automática passou por `pagehide` durante o
  convite e confirmou que a resposta antiga não inicia a corrida ao voltar.
  Sem exceções,
  404 ou requisições externas. O gancho de inspeção foi injetado somente na
  resposta HTTP do teste; não entrou no código ou build. Evidências em
  `/tmp/corrida3d-etapa4/verificar.mjs`, `resultado.json`, `convite.png`,
  `largada.png` e `pausa-bandeirada.png`.
- **Preview de produção:** entrada pelo cartão, voz configurada como “sem-fala”,
  sem injeção de estado/módulos. Corrida completa em 390×844 com relógio
  controlado: 30 ultrapassagens, 3 abastecimentos, tela final e reinício na
  largada; Grande Prêmio e Corrida do Rael abriram. Sem erros de console,
  404 ou rede externa. Capturas e resultado em `/tmp/corrida3d-etapa4/producao-*`
  e `producao.json`. O tempo simulado até o final foi 163,5 s; não representa FPS.
- **Guardas:** `git diff --check` limpo; arquivos protegidos sem diff; nenhuma
  dependência, motor, regra, asset externo ou teste ignorado. Projeção e
  renderizador continuam sem RNG, relógio, storage, fala ou RAF.
- **Limite da etapa:** o resumo final ainda não registra rodada, figurinha ou
  conquista (Etapa 5). **PENDENTE NO APARELHO REAL:** voz e ciclo de vida em
  Safari/iPad e Chrome/Android, FPS e observação com o Rael. Teste offline e
  matriz final de dispositivos pertencem à Etapa 6.

**Etapa 5 — bandeirada, álbum, conquistas e documentação (2026-09-23).** Base local:
`ce593cf2322382d3f77e039d50443df5a06f718d`, branch `corrida-3d-etapa-1`.
Commit desta etapa: **não criado**. Alterados nesta etapa: `rael/corrida-3d/{tela.js,
index.html,corrida-3d.css}`, `shared/conquistas-descobertas.js`,
`tests/conquistas-descobertas.test.js`, `README.md` e este relatório. Alterações
anteriores do plano e das Etapas 2–4 foram preservadas.

- **Conclusão:** o evento único `bandeirada` muda a fase, desativa a direção,
  marca `corridaRegistrada` antes de chamar `registrarRodada('corrida-3d')` e
  guarda a recompensa. Bandeira, som, confete CSS pausável e fala começam uma
  vez. Após 2 s ativos, o final mostra a figurinha do catálogo e as conquistas
  novas por `anunciarConquistas`; o resumo falado espera a fala da bandeirada.
  Nova corrida reinicia a guarda e a recompensa. Sem mudança no motor.
- **Catálogo:** Corrida 3D vem depois do Grande Prêmio, com “Primeira corrida
  3D” na 1.ª rodada e “Piloto 3D” na 10.ª. Usa o SVG local já existente. O
  Explorador de brincadeiras passa a incluir a atividade; conquistas obtidas
  anteriormente permanecem guardadas. Nenhuma migração ou limpeza de progresso.
- **Testes:** 504/504 em 32 arquivos, incluindo 4 novos cenários de 1.ª, 9.ª,
  10.ª e 11.ª rodadas, figura, ordem, isolamento do Grande Prêmio e Corrida do
  Rael, Explorador e preservação do progresso. `tsc --noEmit`, build Vite e
  `git diff --check` aprovados. O precache gerado em `dist/sw.js` tem a rota,
  bundles, motor compartilhado e SVG. Nenhuma dependência nova.
- **Preview de produção:** Chrome headless em 390×844, relógio controlado, duas
  corridas completas sem direção do jogador. Na primeira, pausa de 10 s
  simulados durante a bandeirada manteve exatamente uma rodada e congelou o
  final; após Continuar apareceram figurinha e “Primeira corrida 3D”. Cinco
  cliques síncronos em “Correr de novo” geraram uma largada; o contador só
  subiu para 2 na segunda bandeirada. O cartão foi conferido na página inicial.
  O script inicial recriava o armazenamento em cada navegação; isso foi
  corrigido no teste. Um aviso de MIME apareceu quando o service worker foi
  gerado durante um teste aberto; o arquivo final respondeu 200 com
  `Content-Type: text/javascript`. Nova corrida completa e navegação ao cartão,
  com o build e precache estáveis, passaram sem erros de console, 404 ou pedidos
  externos. Evidências em `/tmp/corrida3d-etapa5/`.
- **PENDENTE NO APARELHO REAL:** voz, desempenho em Safari/iPad e
  Chrome/Android e observação com o Rael. Offline completo e matriz final
  permanecem na Etapa 6.

**Revisão das Etapas 2–5 (2026-09-23).** Etapas commitadas juntas em `f440331`, no branch
`corrida-3d-etapa-1`. Testes (504/504), typecheck, build e precache reexecutados e aprovados.
Problemas e melhorias (R01–R12: rivais pequenos no meio da tela, paisagem sem duas colunas,
evidências só em `/tmp`, curva quase invisível, entre outros) estão na
[seção 10 do plano](PLANO-CORRIDA-3D.md#10-revisão-das-etapas-05-2026-09-23), para tratar antes
ou durante a Etapa 6.

**Correções R01–R12 (2026-09-23).** Commits `4c7e4dc`, `97eac86` e `dfbfde4`. Céu vazio
cortado e névoa na distância (pista 21% mais larga no celular), rivais com entrada suave,
pista reta, paisagem em duas colunas sem rolagem, tela final sem cortar “Correr de novo”,
foco na pista, RAF só quando anima, largada falada por luz e fala retomada após a pausa.
508/508 testes, typecheck, build e precache aprovados; validação no preview com voz
simulada. Detalhes e pendências na seção 10.4 do plano. **PENDENTE:** Etapa 6, FPS em
aparelho real e observação com o Rael.

### 5.4 Ordem sugerida de entrega

1. **P09 → P10.** Meu Nome e Conta Comigo não precisam de gravações nem de banco de dados,
   então validam navegação, voz sintetizada e toque antes de mexer em conteúdo.
2. **P01.** É a única pendente que depende de gravação; reaproveitar o processo já validado em P05.
3. **P08 → P11.** Padrões e categorias, com o catálogo de figuras já pronto.
4. **P12 → P13.** As duas menos prioritárias; P13 reaproveita o Jogo da Memória, quase sem conteúdo novo.

Essa é uma ordem de implementação, não uma trilha obrigatória para a criança. Se uma atividade
já entregue ainda não fizer sentido para o Rael, manter as anteriores disponíveis e ajustar a
demonstração antes de emendar a próxima.

### 5.5 Riscos ainda em aberto

- **Qualidade da voz pt-BR por aparelho.** Testar o botão "Testar a voz" das configurações do
  Rael no iPad e no Android de casa e anotar aqui o nome da voz que aparecer, antes de gravar
  o áudio de P01.
- **Peso do PWA.** O service worker pré-cacheia todo o site; limite de 8 MB para áudio e figuras
  da etapa inteira — conferir o total acumulado a cada tarefa nova (P00 + P02 a P07 já somam
  cerca de 2 MB de áudio).

**Prompt base para esta etapa**
```
Abra MELHORIAS.md e implemente a tarefa <Pxx>. Leia as seções 4.0, 6 e 5.0 (regras próprias da
etapa); para idade, dificuldade, duração, pontuação, fala e tamanho dos controles, prevalece a
seção 5.0. Verifique as dependências antes de começar. Reutilize shared/ (em especial fala.js,
descobertas.js e o catálogo de figuras) e os motores de labirinto/rimas já existentes (de
P07/P04) quando indicado. Entregue a atividade utilizável sem leitura, os arquivos locais de
áudio e figuras com origem registrada, a integração com a área Primeiras Descobertas, o registro
no álbum e os testes da lógica aplicáveis. No resumo, informe a revisão do conteúdo, os testes
por toque, com voz sintetizada e offline, o peso adicionado ao precache e o que ainda precisa
ser observado com a criança. Não marque validação com a criança como concluída sem realizá-la.
```

---

## 6. Checklist de aceite comum (aplicar em toda tarefa)

- [ ] Funciona em 360 px, 768 px e 1280 px sem rolagem horizontal.
- [ ] Toque, teclado e mouse funcionam.
- [ ] Console sem erros; aba Network sem 404.
- [ ] Textos em pt-BR com acentuação correta.
- [ ] Nada de `node_modules`, `.env.local`, `.DS_Store` no commit.
- [ ] `npm run typecheck` e `npm run build` (projeto Vite único); `dist/` permanece fora do git.
- [ ] Resumo final com: o que mudou, como foi testado, pendências.
