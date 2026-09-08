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
> Atualizado em 2026-09-08 (reorganização: separado o backlog do histórico, sem mudar o conteúdo
> de nenhuma tarefa).

---

## 1. Status em 2026-09-08

**Concluído** — detalhes no histórico:
- **T01 a T23** (higiene, correções, base compartilhada, testes, publicação, PWA, acessibilidade): todas as 23 melhorias técnicas.
- **J01, J02, J04 a J11 e J13** (incluindo Memória de Contas e Labirinto de Aventuras): 11 jogos novos para a Elis.
- **P00, P02 a P07** (área, Encaixe as Figuras, Palmas nas Palavras, Rimas com Figuras, Começa com o Mesmo Som, Letras para Explorar, Meu Primeiro Labirinto): a área **Jogos do Rael** está no ar com sete brincadeiras. Falta validar todas com a criança (marcado em cada uma).

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

**Nota sobre o estado do repositório:** as pastas `Games/labirinto/`, `rael/meu-primeiro-labirinto/`
e `tests/labirinto.test.js` (P07, já especificada como concluída) e os arquivos modificados
`rael/configuracoes.html`, `rael/index.html`, `vite.config.ts` ainda não foram commitados. J11 e
J13 foram implementadas sobre essa mesma árvore de trabalho — confira `git status` antes de começar
uma tarefa nova.

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
- **Figurinhas em vez de estrelas:** cada rodada concluída dá uma figurinha para o **Álbum** da
  etapa (dinossauros, foguetes, animais...). O álbum não tem meta, não some e não compara.
  Não usar `calcularEstrelas` de `shared/progresso.js` nesta etapa.
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
