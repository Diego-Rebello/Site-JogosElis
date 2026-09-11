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
> Atualizado em 2026-09-11: implementação técnica da P14 concluída na branch
> `p14-labirinto-obstaculos`. A publicação e a validação presencial com o Rael continuam pendentes.

---

## 1. Status em 2026-09-11

**Concluído** — detalhes no histórico:
- **T01 a T23** (higiene, correções, base compartilhada, testes, publicação, PWA, acessibilidade): todas as 23 melhorias técnicas.
- **J01, J02, J04 a J11 e J13** (incluindo Memória de Contas e Labirinto de Aventuras): 11 jogos novos para a Elis.
- **P00, P02 a P07** (área, Encaixe as Figuras, Palmas nas Palavras, Rimas com Figuras, Começa com o Mesmo Som, Letras para Explorar, Meu Primeiro Labirinto): a área **Jogos do Rael** está no ar com sete brincadeiras. Falta validar todas com a criança (marcado em cada uma).

**Implementado em branch, aguardando validação com a criança:**
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
