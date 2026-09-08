# Histórico — Jogos da Elis

> Este arquivo guarda o diagnóstico original do repositório, as decisões tomadas durante a
> execução e o detalhamento completo de cada tarefa já concluída. **O que falta fazer está em
> [MELHORIAS.md](MELHORIAS.md)** — este arquivo é só para consulta, quando uma tarefa nova
> precisar entender uma decisão ou um "como ficou" de algo já entregue.
>
> Gerado em 2026-09-06 a partir da análise completa do repositório `Site-JogosElis`. Reorganizado
> em 2026-09-08 para separar o backlog (MELHORIAS.md) do histórico (este arquivo); nenhum conteúdo
> foi alterado, só reagrupado.

---

## 1. Progresso — tabela de commits

Todas as tarefas de T01 a T23 concluídas, dez jogos novos no ar (J01, J02 e J04 a J10) e sete
brincadeiras dos Jogos do Rael entregues (P00, P02 a P07). Tudo testado no navegador (Chrome
headless) antes de cada commit.

| Tarefa | Status | Commit |
|---|---|---|
| T01 — Higiene do repositório | ✅ Concluída em 2026-09-06 | `b6d320c` |
| T02 — Sincronizar git e atualizar dependências | ✅ Concluída em 2026-09-06 | `74b6342` |
| T03 — Remover restos do AI Studio e endurecer o TypeScript | ✅ Concluída em 2026-09-06 | `94355b9` |
| T04 — Jogo do M ou N: lista de palavras e lacuna | ✅ Concluída em 2026-09-06 | `623809d` |
| T05 — Jogo da Forca: viewport, acentos, Ç e vitória | ✅ Concluída em 2026-09-06 | `4a43a17` |
| T06 — Jogo da Memória: HTML, embaralhamento, grade e timeouts | ✅ Concluída em 2026-09-06 | `ede0eb2` |
| T07 — Jogo da Velha: HTML, keyframes e lógica duplicada | ✅ Concluída em 2026-09-06 | `df45930` |
| T08 — Padronizar nomes das subpastas de `Games/` | ✅ Concluída em 2026-09-06 | `3a44892` |
| T09 — Biblioteca compartilhada `shared/` | ✅ Concluída em 2026-09-06 | `09d8c04` |
| T10 — Cabeçalho e visual compartilhado nos cinco jogos | ✅ Concluída em 2026-09-06 | `1c8f36d` |
| T11 — Fim do Tailwind CDN, do Font Awesome e das fontes remotas | ✅ Concluída em 2026-09-06 | `094f9ed` |
| T12 — Sons e celebração em todos os jogos | ✅ Concluída em 2026-09-06 | `784d82e` |
| T13 — Progresso salvo e Mural de Conquistas | ✅ Concluída em 2026-09-06 | `157e101` |
| T14 — Matemática: níveis, operações e rodadas | ✅ Concluída em 2026-09-06 | `23a226a` |
| T15 — M ou N: toque, regra e rodadas | ✅ Concluída em 2026-09-06 | `23a226a` |
| T16 — Forca: temas, dicas e placar | ✅ Concluída em 2026-09-06 | `23a226a` |
| T17 — Memória: modo solo, recordes e temas | ✅ Concluída em 2026-09-06 | `23a226a` |
| T18 — Velha: placar, símbolos, início e níveis | ✅ Concluída em 2026-09-06 | `528b21d` |
| T19 — Testes automatizados da lógica | ✅ Concluída em 2026-09-06 | `528b21d` |
| T20 — Build e publicação automática no Netlify | ✅ Concluída e validada em produção em 2026-09-06 | `528b21d` |
| T21 — PWA: offline e instalável | ✅ Concluída em 2026-09-06 | `cdd0b6b` |
| T22 — Acessibilidade, SEO e polimento | ✅ Concluída em 2026-09-06 | `b0d3606` |
| T23 — Projeto Vite único multipágina | ✅ Concluída em 2026-09-06 | branch `t23-vite-unico`, já na `main` |
| J01 — Ortografia Divertida | ✅ Concluída em 2026-09-06 | branch `j01-ortografia` |
| J02, J04, J05, J06 — Tabuada, Caça-Palavras, Forme a Palavra, Horas | ✅ Concluídas em 2026-09-07 | `939c3c7` |
| J07, J08, J09, J10 — Genius, Sudoku, Dinheirinho, Quiz | ✅ Concluídas em 2026-09-07 | `05378b0` |
| P00 — Jogos do Rael: área, fala, figuras, álbum e configurações | ✅ Concluída em 2026-09-07, falta validar com a criança | branch `p00-jogos-do-rael` |
| P02 — Encaixe as Figuras | ✅ Concluída em 2026-09-07, falta validar com a criança | branch `p02-p03-rael` |
| P03 — Palmas nas Palavras | ✅ Concluída em 2026-09-07, falta validar com a criança | branch `p02-p03-rael` |
| P07 — Meu Primeiro Labirinto | ✅ Concluída em 2026-09-07, falta validar com a criança | branch `p07-rael` |

**Decisões tomadas durante a execução, que valem para as próximas tarefas:**

- Os scripts npm dos dois jogos React chamam o binário local pelo caminho
  (`node ./node_modules/vite/bin/vite.js build`) por causa do ":" no caminho do projeto. Existe
  também o script `npm run typecheck`.
- Desde a T20, `build-all.sh` compila os jogos React diretamente para seus caminhos públicos em
  `_site/Games/`; `dist/` e `_site/` ficam fora do git. O `_redirects` preserva também os endereços
  antigos que continham `/dist/`. **Depois da T23 isso mudou**: um único `npm run build` gera o
  site inteiro (ver "Como ficou" da T23) e `build-all.sh` deixou de existir.
- O Jogo da Forca ganhou um oitavo tema além dos sete sugeridos na T05: **Corpo**
  (`CORAÇÃO`, `CABEÇA`, `BRAÇO`…), que dá bons casos de Ç e til.
- As cinco páginas e a página inicial ganharam favicon SVG embutido em `data:` URI.
- O Jogo da Memória usa `max-w-lg` no tabuleiro de 16 cartas: como as cartas agora são `w-full`,
  quem define o tamanho delas é a largura do tabuleiro.
- Os dois PRs abertos pelo Snyk (passo 2 da T02) foram **descartados por decisão do Diego**: as
  vulnerabilidades já tinham sido resolvidas pelo `npm audit fix` da própria T02.
- As fontes Fredoka One, Pacifico e Nunito são servidas de `shared/fontes/` (77 KB em `.woff2`),
  e não do Google Fonts.
- `shared/base.css` **não estiliza elementos crus** (`body`, `button`, `input`): é tudo classe.
  Sem isso, uma regra dele venceria os utilitários do Tailwind nos dois jogos React, porque CSS
  sem camada ganha de CSS em camada independentemente da especificidade.
- Os jogos em HTML puro usam `<script type="module">` para importar `shared/texto.js`. **Isso
  impede abrir por `file://`**: é preciso servir por HTTP.
- Os `index.css` dos jogos React usam `@import "tailwindcss" source(none)` com `@source`
  explícitos. Sem isso o Tailwind 4 varreria também o `dist/` gerado e realimentaria classes
  velhas a cada build.
- As rodadas de **10 questões** da Matemática e de **10 palavras** do M ou N têm telas, modos e
  regras pedagógicas definitivas (T14 e T15).
- O recorde da Memória é separado por quantidade de cartas e usa a chave
  `jogos-elis:memoria:recorde:<n>`; primeiro compara jogadas e, em empate, o menor tempo.
- No Jogo da Velha, vitória do computador toca o som de erro e **não** lança confete: festa só
  quando quem ganha é a criança.
- O Jogo da Velha mantém a IA original no nível Fácil e usa minimax no Difícil.
- A suíte Vitest da raiz chama o binário por caminho explícito, assim como os scripts dos jogos,
  por causa do `:` no caminho local. São 28 testes puros em 7 arquivos e nenhum usa rede ou DOM
  (número cresceu bastante depois, com os jogos novos e os Jogos do Rael — ver os "Como ficou"
  de cada tarefa).

**Inventário logo após a T23 / P07** (o inventário atualizado vive em MELHORIAS.md):

| Jogo | Caminho | Tecnologia |
|---|---|---|
| Página inicial | `index.html` | HTML/CSS puro + `shared/base.css`, ícones em emoji |
| Biblioteca comum | `shared/` | CSS + módulos ES próprios, sem dependência externa |
| Jogo da Forca | `Games/forca/index.html` | HTML puro + `shared/`, script `type="module"` |
| Matemática | `Games/matematica/` | HTML puro + módulo de lógica testável, `shared/` |
| Jogo do M ou N | `Games/m-ou-n/index.html` | HTML puro + `shared/`, script `type="module"` |
| Ortografia Divertida | `Games/ortografia/` | HTML puro + `dados.js`/`jogo.js`/`tela.js`, `shared/` |
| Jogo da Memória | `Games/memoria/` | React 19.2 + Vite 6.4 + Tailwind 4 compilado |
| Jogo da Velha | `Games/velha/` | React 19.2 + Vite 6.4 + Tailwind 4 compilado |
| Jogos do Rael — casa | `rael/index.html` | HTML puro + `shared/`, tema `tema-rael.css` |
| Jogos do Rael — Toque na Figura | `rael/toque-na-figura/` | HTML puro + `tela.js`, usa `fala.js` e `rodada.js` |
| Jogos do Rael — Encaixe as Figuras | `rael/encaixe-as-figuras/` | HTML puro + `dados.js`/`jogo.js`/`tela.js` |
| Jogos do Rael — Palmas nas Palavras | `rael/palmas-nas-palavras/` | HTML puro + `dados.js`/`jogo.js`/`tela.js` |
| Jogos do Rael — Meu Primeiro Labirinto | `rael/meu-primeiro-labirinto/` | HTML/CSS + tela que reutiliza `Games/labirinto/jogo.js` |
| Jogos do Rael — configurações | `rael/configuracoes.html` | HTML puro + `shared/descobertas.js` |

**O site não faz nenhuma requisição externa.** Fontes, ícones e CSS são todos locais.

---

## 2. Diagnóstico do estado atual

> Fotografia de 2026-09-06, **antes** da execução das tarefas. Mantida como registro do motivo de
> cada tarefa.

### 2.1 Inventário original

| Jogo | Caminho | Tecnologia | Situação |
|---|---|---|---|
| Página inicial | `index.html` | HTML/CSS puro, Font Awesome via CDN, Google Fonts | Funciona. Identidade visual boa (rosa, fontes Pacifico/Fredoka One). |
| Jogo da Forca | `Games/Jogo da Forca/forca.html` | HTML/JS puro em um arquivo | Funciona. Sem `viewport` (ruim no celular), palavras sem acento, sem dica. |
| Jogo de Somar | `Games/Jogo de Somar/soma_placar.html` | HTML/JS puro em um arquivo | Funciona. Só soma, só números de 10 a 99, um nível. |
| Jogo do M ou N | `Games/Jogo M N-digitar/Jogo M N-digitar.html` | HTML/JS puro em um arquivo | Funciona. 4 palavras com erro na lista e lógica da lacuna falha em 3 casos. |
| Jogo da Memória | `Games/emoji-memory-game/` | React 19 + Vite 6 + Tailwind via CDN, `dist/` commitado | Funciona. `index.html` corrompido, 2 arquivos 404, grade estoura no celular com 24/32 cartas. |
| Jogo da Velha | `Games/jogo-da-velha-divertido/` | React 19 + Vite 6 + Tailwind via CDN, `dist/` commitado | Funciona. Restos do template AI Studio, `importmap` inútil, 2 arquivos 404. |

### 2.2 O que foi verificado nesta análise

- **Build reproduzível:** `vite build` dos dois jogos React gerou arquivos byte a byte iguais aos commitados em `dist/` (mesmos hashes `index-hUXLbAIR.js` e `index-CKN5IFQq.js`). O `dist/` estava sincronizado com o código-fonte.
- **Tipagem:** `tsc --noEmit` passava nos dois projetos. Porém o Jogo da Memória **não tinha `@types/react` instalado**, então quase tudo ali era `any` e a checagem não pegava erros de verdade.
- **Segurança de dependências:** `npm audit` apontava 5 vulnerabilidades altas (vite ≤ 6.4.2 e rollup) nos dois projetos. Todas afetavam apenas o servidor de desenvolvimento, não o site publicado. `npm audit fix` resolveu.
- **Hospedagem:** Netlify, projeto `jogosdaelis`, público em https://jogosdaelis.netlify.app/ (HTTPS com HSTS, HTTP/2, `cache-control: public, max-age=0, must-revalidate`). Não havia `netlify.toml`, `_redirects` nem `_headers` no repositório, então o Netlify publicava a raiz do repositório sem comando de build; por isso o `dist/` dos jogos React estava no git. Confirmado nas capturas do painel: deploy contínuo a partir do GitHub, branch `main`, *auto publishing* ligado, publicado em `main@5f482ec` (o merge do PR #6, mesmo commit de `origin/main`); *Build command* e *Publish directory* não definidos, *Base directory* `/`, *Build status* Active. Três efeitos colaterais observados no site no ar:
  - O pós-processamento *Pretty URLs* do Netlify estava ativo: os links do HTML publicado eram reescritos (`Games/emoji-memory-game/dist/index.html` virava `/games/emoji-memory-game/dist/`, tudo em minúsculas) e os caminhos originais respondiam com redirecionamento 301.
  - Todo o código-fonte era servido publicamente (`/Games/emoji-memory-game/App.tsx`, `vite.config.ts`, `package-lock.json` respondiam 200). Sem risco real, porque o repositório já é público, mas desnecessário; a T20 resolveu publicando só a pasta gerada.
  - O `}` solto do Jogo da Memória (item 5 da tabela abaixo) estava visível no site no ar.
- **GitHub Pages:** desativado no repositório e não era necessário; o Netlify continua sendo o provedor.
- **Git:** a branch `main` local estava 4 commits atrás de `origin/main`. Existiam 2 branches abertas pelo Snyk (`react` e `react-dom` 19.1.1 → 19.2.0, só no Jogo da Velha). Havia um repositório git aninhado por engano em `Games/emoji-memory-game/.git`. Arquivos `.DS_Store` estavam versionados. Não existia `.gitignore` na raiz.
- **CDNs externos:** Google Fonts, Font Awesome 6.5.1 e `cdn.tailwindcss.com` respondiam normalmente, mas o site dependia deles para funcionar.

### 2.3 Problemas encontrados, por gravidade

| # | Gravidade | Onde | Problema | Tarefa |
|---|---|---|---|---|
| 1 | Bug visível | `Games/Jogo M N-digitar/Jogo M N-digitar.html:168` | `SUSPEITO` não tem M nem N: o jogo exibe `_SUSPEITO`. | T04 |
| 2 | Bug de conteúdo | mesmo arquivo `:172-173` | `TROBOMBE` não é palavra (provável `TROMBONE`); `DESEMBRO` está errado (`DEZEMBRO` já existe na lista). | T04 |
| 3 | Bug pedagógico | mesmo arquivo `:207-218` | Lacuna cai na letra inicial antes de vogal: `MEMBRO` → `_EMBRO`, `NUNCA` → `_UNCA`. Não exercita a regra. | T04 |
| 4 | Bug pedagógico | mesmo arquivo `:163-191, :237` | Acentuação inconsistente entre a lista e a comparação exata. | T04 |
| 5 | Bug visível | `Games/emoji-memory-game/index.html:27-36` | Lixo após `</html>` (chave `}` solta, `</script>`, segundo `<body>`, dois `</html>`). | T06 |
| 6 | Bug | `Games/emoji-memory-game/App.tsx:108, :195` | Cartas com largura fixa (`w-20`) em grades de 6 e 8 colunas: sobreposição no celular. | T06 |
| 7 | Bug | `Games/Jogo da Forca/forca.html:3-6` | Sem `<meta name="viewport">`. | T05 |
| 8 | Bug pedagógico | `Games/Jogo da Forca/forca.html:69-75, :96` | Palavras sem acento e teclado sem `Ç`. | T05 |
| 9 | 404 | `Games/emoji-memory-game/index.html:5, :20` e `Games/jogo-da-velha-divertido/index.html:6, :25` | Referências a `vite.svg` e `index.css` que não existem. | T06, T07 |
| 10 | Código morto | `Games/jogo-da-velha-divertido/index.html:16-23` | `importmap` apontando React para `esm.sh`, mas o bundle já inclui o React. | T07 |
| 11 | Qualidade | `Games/jogo-da-velha-divertido/components/Square.tsx:28` | Uma tag `<style>` com keyframes injetada em cada uma das 9 casas. | T07 |
| 12 | Qualidade | `Games/emoji-memory-game/App.tsx:14-16` | Embaralhamento com `sort(() => Math.random() - 0.5)`, enviesado. | T06 |
| 13 | Qualidade | `Games/emoji-memory-game/App.tsx:242, :255` | `setTimeout` sem limpeza. | T06 |
| 14 | Performance | `index.html:8, :11` e os dois jogos React | Font Awesome inteiro para 5 ícones; `@import` de fonte bloqueando renderização; Tailwind "Play CDN". | T11 |
| 15 | Resto de template | `vite.config.ts`, `metadata.json`, `README.md`, `.env.local` | Referências a `GEMINI_API_KEY` e ao AI Studio. | T03 |
| 16 | Higiene | raiz, `Games/`, `.vscode/launch.json:11` | `.DS_Store` versionado; sem `.gitignore`; `launch.json` apontando para pasta inexistente. | T01 |
| 17 | Higiene | `Games/emoji-memory-game/.git` | Repositório git aninhado por engano. | T01 |
| 18 | UX | todos os jogos | Nenhum jogo tinha botão para voltar à página inicial. | T09, T10 |
| 19 | UX | todos os jogos | Sem som, sem celebração, sem progresso salvo, sem níveis de dificuldade. | T12, T13, T14–T18 |
| 20 | Acessibilidade | `index.html` | Rosa `#ff69b4` sobre branco com contraste abaixo de 3:1. | T22 |
| 21 | Publicação | Netlify (raiz do repositório como pasta de publicação) | Código-fonte e configs iam ao ar junto com o site. | T20 |

### 2.4 Pontos fortes preservados

- Links relativos e `base: './'` no Vite: o site funciona em qualquer subpasta.
- Identidade visual da página inicial (rosa, fontes arredondadas, cartões grandes).
- Jogos React bem organizados em componentes; a IA do Jogo da Velha deixa a criança ganhar às vezes (65 % de chance de bloquear).
- Textos já em português e tom carinhoso.

---

## 3. Tarefas técnicas concluídas (T01–T23)

### T01 — Higiene do repositório

> ✅ Concluída em 2026-09-06 — commit `b6d320c`.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet
**Problema encontrado:** repositório git aninhado em `Games/emoji-memory-game/.git`; `.DS_Store` versionado; sem `.gitignore`; `.vscode/launch.json` apontando para pasta inexistente; `README.md` só com o título.
**O que foi feito:** `.git` aninhado removido (confirmado como repositório separado antes), `.gitignore` criado, `.DS_Store` tirado do índice, `launch.json` corrigido, `README.md` reescrito em pt-BR.

### T02 — Sincronizar git e atualizar dependências

> ✅ Concluída em 2026-09-06 — commit `74b6342`.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T01
**Problema encontrado:** `main` local 4 commits atrás de `origin/main`; duas branches do Snyk; 5 vulnerabilidades altas em `vite`/`rollup`.
**O que foi feito:** git sincronizado, `react`/`react-dom` alinhados em 19.2.x, `npm audit fix` nos dois jogos, `dist/` recompilado. As branches do Snyk foram **descartadas por decisão do Diego**: o `npm audit fix` já tinha resolvido as vulnerabilidades.

### T03 — Remover restos do template AI Studio e endurecer o TypeScript

> ✅ Concluída em 2026-09-06 — commit `94355b9`.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T02
**Problema encontrado:** `vite.config.ts` injetando `GEMINI_API_KEY` sem uso; `metadata.json`/`.env.local` do gerador AI Studio; Memória sem `@types/react`; `tsconfig.json` sem `strict`.
**O que foi feito:** referências ao Gemini removidas, `strict: true` ativado nos dois projetos, `@types/react`/`@types/react-dom` instalados, script `typecheck` adicionado.

### T04 — Jogo do M ou N: corrigir lista de palavras e lógica da lacuna

> ✅ Concluída em 2026-09-06 — commit `623809d`.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet
**Problema encontrado:** `SUSPEITO` sem M/N; `TROBOMBE` e `DESEMBRO` inválidos; lacuna caindo fora da regra ensinada; comparação sem tolerância a acento e metade da lista sem acentuação.
**O que foi feito:** lista revisada e acentuada (100+ palavras), `gerarLacuna` reescrita com regra explícita (M antes de P/B, N antes do resto), comparação por `normalizar()` (NFD sem diacríticos), toda a lista validada na inicialização.

### T05 — Jogo da Forca: viewport, acentos, Ç e verificação de vitória

> ✅ Concluída em 2026-09-06 — commit `4a43a17`.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet
**Problema encontrado:** sem `viewport`; palavras sem acento; alfabeto sem `Ç`; vitória detectada lendo `innerText` do DOM.
**O que foi feito:** viewport adicionado; palavras convertidas para objetos `{ palavra, categoria }` com grafia correta (80+ palavras, 7 categorias); revelação insensível a acento (clicar em A revela A/Á/Â/Ã/À, C revela C/Ç); vitória detectada por `Set` de letras normalizadas; placar de sessão (vitórias/derrotas); teclado físico aceito.

### T06 — Jogo da Memória: HTML corrompido, 404, embaralhamento, grade responsiva e timeouts

> ✅ Concluída em 2026-09-06 — commit `ede0eb2`.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T03
**Problema encontrado:** `index.html` corrompido (lixo visível após `</html>`); `vite.svg`/`index.css` inexistentes (404); embaralhamento enviesado; cartas com largura fixa (sobreposição com 24/32 cartas); `setTimeout` sem limpeza.
**O que foi feito:** `index.html` reescrito do zero (`lang="pt-BR"`); Fisher-Yates para embaralhar; grade responsiva (`w-full aspect-[3/4]`, colunas por quantidade/viewport); timeouts guardados em `useRef` e limpos nos pontos certos; mensagem de vitória do modo 1 jogador corrigida.

### T07 — Jogo da Velha: limpar `index.html`, keyframes e lógica duplicada

> ✅ Concluída em 2026-09-06 — commit `df45930`.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T03
**Problema encontrado:** `/vite.svg` absoluto (404 em subpasta); `importmap` inútil; `index.css` inexistente; keyframes duplicados 9 vezes; lógica de jogada duplicada.
**O que foi feito:** `index.html` limpo; keyframes movidos para o `<style>` global; lógica extraída para `lib/logica.ts` (`aplicarJogada`, `checkWinner`, `findBestMove`), usada tanto no clique quanto no efeito do computador, sem alterar o comportamento da IA.

### T08 — Padronizar nomes das subpastas de `Games/`

> ✅ Concluída em 2026-09-06 — commit `3a44892`.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T01, T04–T07 · **Decisão do Diego:** manter a pasta `Games/`, renomear só as subpastas.
**O que foi feito:** subpastas renomeadas com `git mv` para kebab-case (`Games/forca/`, `Games/matematica/`, `Games/m-ou-n/`, `Games/memoria/`, `Games/velha/`); links da página inicial e `_redirects` atualizados para os caminhos antigos.

### T09 — Biblioteca compartilhada `shared/`

> ✅ Concluída em 2026-09-06 — commit `09d8c04`.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Opus · **Depende de:** T08
**O que foi feito:** criados `shared/base.css` (tokens, `.botao`, `.cartao`, `.placar`, `.feedback`, alvos de toque ≥ 44 px), `shared/cabecalho.js` (injeta cabeçalho com link "🏠 Início" e botão de mudo), `shared/texto.js` (`normalizar`, `embaralhar` Fisher-Yates, `sortear`, `sortearVarios`), `shared/sons.js` (Web Audio API, sem arquivos: clique/acerto/erro/vitória, `AudioContext` só após gesto), `shared/confete.js` (canvas, respeita `prefers-reduced-motion`), `shared/progresso.js` (`registrarPartida`, `obterProgresso`, `estrelasDe`, `zerarProgresso`, chave `jogos-elis:progresso`), `shared/demo.html`.

### T10 — Aplicar cabeçalho e visual compartilhado em todos os jogos

> ✅ Concluída em 2026-09-06 — commit `1c8f36d`.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T09
**O que foi feito:** os três jogos em HTML puro passaram a usar `shared/base.css` e `shared/cabecalho.js` diretamente, com scripts convertidos para `type="module"` (exige servidor HTTP, não `file://`); os dois jogos React ganharam um componente `Cabecalho` equivalente (duplicado de propósito entre os dois projetos, para não obrigar `shared/` a depender de React — resolvido só na T23). Todos os jogos passaram por 24 checagens de jogabilidade sem regressão.

### T11 — Remover Tailwind CDN, Font Awesome e `@import` de fontes

> ✅ Concluída em 2026-09-06 — commit `094f9ed`.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T10
**O que foi feito:** ícones do Font Awesome trocados por emoji/SVG; fontes Fredoka One/Pacifico baixadas para `shared/fontes/` em `.woff2` (77 KB); os dois jogos React migraram do Tailwind "Play CDN" para o Tailwind 4 com `@tailwindcss/vite`. Nenhuma requisição externa restante em nenhuma das seis páginas; visual conferido classe por classe.

### T12 — Sons e celebração em todos os jogos

> ✅ Concluída em 2026-09-06 — commit `784d82e`.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T09, T10
**O que foi feito:** os cinco jogos chamam `tocar('clique'|'acerto'|'erro'|'vitoria')` nos momentos certos e `lancarConfete()` em vitórias; botão 🔊/🔇 do cabeçalho persiste entre jogos; classes `.tremer`/`.pular` no feedback visual, desativadas com `prefers-reduced-motion`.

### T13 — Progresso salvo e "Mural de Conquistas" na página inicial

> ✅ Concluída em 2026-09-06 — commit `157e101`.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T09, T10
**O que foi feito:** cada jogo chama `registrarPartida` ao fim de uma rodada; a página inicial mostra estrelas e "jogou N vezes" por cartão, mais uma seção "Mural de Conquistas"; `configuracoes.html` criada (nome da criança, nível padrão, mudo, "zerar progresso"), com leitura de `localStorage` protegida por `try/catch`.

### T14 — Jogo de Somar vira "Matemática": níveis, subtração e rodadas de 10

> ✅ Concluída em 2026-09-06 — commit `23a226a`.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T10
**Problema encontrado:** só somas de 10 a 99; `Enter` não avançava; sem subtração, apoio visual ou fim de rodada.
**O que foi feito:** 5 níveis (Contando → Desafio), com apoio visual em emoji nos níveis baixos; rodada de 10 questões com barra de progresso e tela final com estrelas; gerador `gerarQuestao(nivel, operacao)` puro, nunca produz negativo nem repete a última questão; fluxo por `Enter` sem precisar do mouse.

### T15 — Jogo do M ou N: modo toque, explicação da regra e rodadas

> ✅ Concluída em 2026-09-06 — commit `23a226a`.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T04, T10
**O que foi feito:** dois modos (Toque com botões M/N grandes, e Digite a palavra); cartão de regra antes de começar; rodada de 10 palavras sem repetição; ao errar mostra a palavra certa e lembra a regra, sem avançar sozinho.

### T16 — Jogo da Forca: escolha de tema, dica e placar

> ✅ Concluída em 2026-09-06 — commit `23a226a`.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T05, T10
**O que foi feito:** tela de escolha de tema (ou "Todos"); botão "Dica 💡" liberado após o 3.º erro, com frase por palavra; placar de sessão e estrelas por número de erros; animação `.tremer` no erro.

### T17 — Jogo da Memória: modo 1 jogador com jogadas, cronômetro, recorde e temas

> ✅ Concluída em 2026-09-06 — commit `23a226a`.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T06, T10
**O que foi feito:** temas de emojis selecionáveis (Animais, Comidas, Transportes, Esportes, Natureza, Mistura); modo 1 jogador com contador de jogadas, cronômetro e recorde por tamanho (`jogos-elis:memoria:recorde:<n>`, compara jogadas e depois tempo); lógica movida para `lib/logica.ts`.

### T18 — Jogo da Velha: placar acumulado, escolha de símbolo, quem começa e níveis

> ✅ Concluída em 2026-09-06 — commit `528b21d`.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T07, T10
**O que foi feito:** placar acumulado da sessão (X, O, empates); escolha de símbolo e de quem começa, alternando nas partidas seguintes; nível Fácil mantém a IA original, nível Difícil usa minimax completo (`melhorJogadaMinimax`), nunca perde em 200 partidas contra oponente aleatório; nomes editáveis no modo com amigo.

### T19 — Testes automatizados da lógica dos jogos

> ✅ Concluída em 2026-09-06 — commit `528b21d`. São 28 testes em 7 arquivos (número cresceu bastante com os jogos e etapas seguintes).

**Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Depende de:** T04, T07, T09, T14, T17, T18
**O que foi feito:** `vitest` configurado na raiz (`npm test`); lógica de todos os jogos extraída para módulos puros fora do DOM (`lib/logica.ts`, `jogo.js`, `shared/texto.js`, `shared/progresso.js` com `localStorage` injetável); cobertura de normalização, geração de questões/lacunas por faixa, vitória/empate, minimax, geração de cartas e cálculo de estrelas.

### T20 — Publicação automática no Netlify com build (`dist/` fora do git)

> ✅ Concluída em 2026-09-06 — implementação no commit `528b21d`; primeiro deploy do novo pipeline validado em produção no commit `326b4b1`.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Opus · **Depende de:** T08, T10
**Contexto:** o Netlify publicava a raiz do repositório sem build, então o `dist/` dos jogos React precisava ser commitado a cada alteração e todo o código-fonte ia ao ar.
**O que foi feito:** `build-all.sh` (compila os dois jogos React e monta `_site/` com tudo mais copiado), `netlify.toml` (`command = "npm ci && npm test && bash build-all.sh"`, `publish = "_site"`), `_headers` (cache longo para assets com hash, `no-cache` no service worker). Depois do primeiro deploy bem-sucedido, `dist/` saiu do git. Confirmado: `/Games/memoria/App.tsx` e `/Games/memoria/package.json` respondem 404; caminhos antigos redirecionam. **Superado pela T23**, que substituiu `build-all.sh` por um único `npm run build`.

### T21 — PWA: funcionar offline e instalar na tela inicial do tablet

> ✅ Concluída em 2026-09-06 — branch `t21-pwa-offline`.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Depende de:** T11, T20
**O que foi feito:** `manifest.webmanifest` (nome, ícones 192/512, `display: standalone`); `sw.js` escrito à mão com precache de tudo em `_site/`, versionado pelo commit, cache-first para assets e network-first para páginas HTML; `shared/pwa.js` registra o service worker só em HTTPS/localhost. Lighthouse confirma instalável; funciona em modo avião (o problema de "respostas redirecionadas" encontrado no caminho foi corrigido). Não testado nos aparelhos físicos (Android/iPad) por falta de acesso.

### T22 — Acessibilidade, SEO básico e polimento

> ✅ Concluída em 2026-09-06 — branch `t22-acessibilidade`.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T10
**O que foi feito:** `meta description`, favicon, `og:title`/`og:description`, `lang="pt-BR"` em todas as páginas; `aria-live="polite"` nas áreas de feedback; contraste do rosa ajustado (`--cor-texto-destaque: #c2185b`); `:focus-visible` em todos os botões; fontes ≥ 18 px, alvos ≥ 44 px. **Resultado: Lighthouse 100/100 em Acessibilidade e Boas práticas nas oito páginas** (antes: 92–100 em acessibilidade). O Jogo da Memória não tinha nenhum retorno para leitor de tela e ganhou uma região `role="status"`.

### T23 — Unificar tudo em um único projeto Vite multipágina

> ✅ Concluída em 2026-09-06 — branch `t23-vite-unico`, já mesclada na `main`.

**Prioridade:** Baixa · **Esforço:** G · **Modelo:** Opus · **Depende de:** T19, T20
**O que foi feito:** `package.json`/`vite.config.ts`/`tsconfig.json` únicos na raiz, com `build.rollupOptions.input` cobrindo `index.html`, `configuracoes.html` e todos os `Games/*/index.html`; os dois jogos React viraram subpastas normais do projeto único. `build-all.sh` deixou de existir — um só `npm run build` gera o site completo. **Foi preciso subir o Vite de 6.4.3 para 7.3.6**: com o Vite 6 na raiz, o `vite-node` do Vitest quebrava com `Cannot find module '/@vite/env'`. Todos os testes continuaram passando (28 do Vitest, 19 de modo avião, 13 de jogabilidade, 50 de acessibilidade, Lighthouse 100/100).

---

## 4. Jogos da Elis concluídos

### J01 — Ortografia Divertida (evolução do "M ou N")

> ✅ Concluída em 2026-09-06 — branch `j01-ortografia`.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Opus · **Objetivo pedagógico:** regras ortográficas mais comuns do 2.º ao 4.º ano

**Como ficou** (`Games/ortografia/`, 25 testes em `tests/ortografia.test.js`)

- **Sete pacotes, 418 itens**: `m-n` (164, reaproveitados da T04), `r-rr` (43), `s-ss` (41),
  `g-j` (41), `x-ch` (41), `c-ss-s` (47) e `l-u` (41), mais o modo **Misturado**.
- **Decisão do Diego:** os dois jogos convivem. O "M ou N" continua no ar com o modo de digitar
  a palavra inteira, e o pacote 1 daqui importa `listaDePalavras` e `gerarLacuna` de
  `Games/m-ou-n/jogo.js` — assim as duas telas nunca discordam sobre onde fica a lacuna.
- **Toda palavra tem uma dica** (menos as do M/N). Pares em que as duas opções dão palavras reais
  e a dica não resolveria bem (ALTO/AUTO, MEU/MEL, MAU/MAL, ASA/ASSA, ROSA/ROÇA) ficaram fora.
- A lacuna é sempre **um `_` só**, mesmo quando a resposta tem duas letras.
- **Progresso em duas chaves**: `ortografia:<pacote>` guarda o histórico de cada regra e
  `ortografia` é a chave que a página inicial e o Mural mostram no cartão do jogo.
- Nível padrão nas Configurações: `g-j` (o nível 3, seguindo a regra de abrir no intermediário).
- Testado no Chrome headless em 360 px: rodada inteira até a tela final, sem erro no console.

### J02 — Tabuada Relâmpago

> ✅ Concluída em 2026-09-06 — integrada diretamente na `main` junto com J04, J05 e J06 (commit `939c3c7`).

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** multiplicação (e divisão como inverso)

**Como ficou:** treino de 10 fatos com três opções e grade de pontos; Relâmpago de 60 segundos;
multiplicação e divisão exata; erros guardados por fato para ponderar o modo "Todas"; recordes
separados para as tabuadas 2–10 e para "Todas". O teste amostra 1.000 questões de cada tabuada.

### J04 — Caça-Palavras

> ✅ Concluída em 2026-09-06 — commit `939c3c7`.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Objetivo pedagógico:** reconhecimento visual de palavras e atenção

**Como ficou:** seis temas com 62 palavras revisadas e oito opções que cabem até na grade 8×8
em cada tema. A lista mantém acentos e a grade usa a forma normalizada. A seleção aceita arraste
com Pointer Events ou dois toques, fica restrita às oito direções retas e usa `touch-action: none`.
Foram testadas 200 grades em cada dificuldade (600 no total), sempre com as oito palavras localizáveis.

### J05 — Forme a Palavra (sílabas)

> ✅ Concluída em 2026-09-06 — commit `939c3c7`.

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** consciência silábica e ordem das sílabas

**Como ficou:** 60 palavras revisadas, 20 em cada nível. A validação exige exatamente duas
sílabas no nível 1, três no nível 2 e quatro ou mais no Desafio. As peças repetidas têm
identidade própria, a intrusa nunca repete uma sílaba correta e a altura de 56 px é preservada
também no CSS compilado pelo Vite.

### J06 — Que Horas São?

> ✅ Concluída em 2026-09-06 — commit `939c3c7`.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Objetivo pedagógico:** leitura de relógio analógico

**Como ficou:** SVG com 60 marcas, números e ponteiros que consideram o avanço do ponteiro das
horas a cada minuto. O modo Leia oferece quatro horários únicos feitos de troca dos ponteiros,
±30 minutos ou ±1 hora. O modo Ajuste tem os quatro botões pedidos e acrescenta ±1 minuto no
Desafio. O teste percorre todas as 1.440 combinações de hora e minuto na ida e na volta.

### J07 — Genius das Cores (sequência)

> ✅ Concluída em 2026-09-06 — commit `05378b0`.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** memória de trabalho e atenção

**Como ficou:** gerador Mulberry32 com semente injetável, quatro cores com frequências próprias,
modos Calmo e Rápido, recorde separado por modo e estrelas nos marcos 5/8/12. O `AudioContext`
é criado e retomado diretamente no toque do botão Começar, como o iOS exige.

### J08 — Sudoku de Emojis

> ✅ Concluída em 2026-09-06 — commit `05378b0`.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Objetivo pedagógico:** lógica e dedução

**Como ficou:** soluções completas 4×4, 6×6 e 9×9 são permutadas por linhas, colunas e símbolos;
cada célula só é removida se o resolvedor ainda contar exatamente uma solução. A suíte valida
100 tabuleiros de cada tamanho (300 no total). Conflitos de linha, coluna e bloco são destacados,
e dicas viram células fixas e determinam as estrelas.

### J09 — Dinheirinho (compras e troco)

> ✅ Concluída em 2026-09-06 — commit `05378b0`.

**Prioridade:** Baixa · **Esforço:** M · **Modelo:** Sonnet · **Objetivo pedagógico:** valores monetários e decimais

**Como ficou:** 30 produtos revisados, dez por nível, moedas e notas próprias desenhadas em CSS,
botão para desfazer e rodadas de dez compras. Todos os preços, pagamentos, trocos e denominações
são inteiros em centavos; os testes cobrem inclusive R$ 0,10 + R$ 0,20 = R$ 0,30 sem ponto flutuante.

### J10 — Quiz Sabe-Tudo

> ✅ Concluída em 2026-09-06 — commit `05378b0`.

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** conhecimentos gerais

**Como ficou:** 125 fatos revisados — 25 em Ciências, Animais, Brasil, Corpo humano e Planetas —,
todos acompanhados de explicação curta. Foram escolhidos fatos estáveis e sem ambiguidade. O
teste percorre o banco inteiro, exige quatro opções distintas e exatamente uma ocorrência da
resposta correta, além de validar rodadas sem repetição.

---

### J11 — Memória de Contas

> ✅ Concluída em 2026-09-08.

**Como ficou**

1. O Jogo da Memória agora oferece **Emojis** ou **Contas**, com somas, multiplicações e um modo
   misturado. Cada conta combina com uma carta de resultado.
2. `CardData` usa `face` e `chavePar`, então a regra de combinação serve tanto para duas figuras
   iguais quanto para faces diferentes do mesmo resultado.
3. O gerador escolhe no máximo uma conta por resultado. Testes cobrem 16, 24 e 32 cartas nos três
   modos e garantem resultados únicos e exatamente duas faces por par.
4. Recordes de contas ficam separados por quantidade e operação; os recordes antigos dos emojis
   mantêm suas chaves e continuam válidos.

### J13 — Labirinto de Aventuras

> ✅ Concluída em 2026-09-08.

**Como ficou**

1. O núcleo iniciado na P07 foi ampliado, sem duplicação, com geração por busca em profundidade,
   paredes entre células, semente reproduzível e solução que inclui os itens ainda pendentes.
2. Três modos: Explorador 5×5, Aventureiro 7×7 com chave e Desafio 9×9 com dois itens em qualquer
   ordem. A rodada tem três mapas, sem cronômetro, e abre no Aventureiro.
3. Há três apresentações — dinossauro/ninho, carrinho/garagem e cachorro/casinha — além de uma
   demonstração inicial de dois movimentos, setas, teclado, toque em casa vizinha, trilha, dica,
   reinício e troca de mapa.
4. Conclusões, movimentos e dicas são salvos por modo. A conclusão rende de uma a três estrelas
   conforme o uso de dicas e aparece no Mural de Conquistas.
5. Testes percorrem 200 mapas por nível (600 no total), validam alcance, itens, paredes, limites,
   desvios, reinício e pontuação. A interface foi testada no Chrome em 360 px.

---

## 5. Jogos do Rael concluídos

> Contexto completo da etapa (proposta, regras, BNCC) está em MELHORIAS.md, seção "Jogos do Rael".

### P00 — Preparar a área Primeiras Descobertas

> ✅ Concluída em 2026-09-07.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Opus · **Depende de:** T09, T13, T21, T23

**Como ficou**

1. **Site irmão, não seção.** A etapa virou os **Jogos do Rael**, em `rael/`, com página
   inicial, configurações e uma brincadeira. As duas páginas iniciais ganharam abas
   (`.trocador` no `base.css`) para trocar de site. `montarCabecalho` aprendeu que, dentro de
   `/rael/`, o botão "Início" volta para a casa do Rael.
2. **Tema por variáveis, não por folha nova.** `shared/tema-rael.css` redeclara os tokens do
   `base.css` em `:root.tema-rael`, no `<html>`. Como propriedade personalizada herda, tudo que
   já usava `var(--cor-…)` mudou de cor de graça — inclusive `--toque`, que passou de 44 px para
   64 px e fez todos os botões crescerem sozinhos. Contrastes conferidos (o pior fica em 5,06:1).
3. **Fala em três camadas** em `shared/fala.js`: gravação → voz do aparelho (`speechSynthesis`
   pt-BR) → modo acompanhado com a frase escrita para o adulto ler. Só P01, P05 e talvez P03
   precisam de arquivos gravados.
4. **Figuras** em `public/figuras/`: 62 SVGs do OpenMoji (CC BY-SA 4.0, 300 KB), com nome,
   artigo (`o`/`a`) e categoria em `shared/catalogo-figuras.js`. Um teste confere que catálogo e
   arquivos batem nos dois sentidos.
5. **Motor de rodada** em `shared/rodada.js` e **estado da etapa** em `shared/descobertas.js`,
   este último numa chave própria do `localStorage`. Sem estrela e sem recorde: cada rodada
   terminada rende uma figurinha para o álbum.
6. **Configurações do adulto** em `rael/configuracoes.html`: primeiro nome, 2/3/4 alternativas,
   tema das figuras, modo de voz, som e "zerar álbum". Botão **Testar a voz** que diz qual
   camada falou e qual voz do aparelho foi escolhida.
7. **Uma brincadeira de verdade junto**, "Toque na Figura" (`rael/toque-na-figura/`): ouvir o
   nome e tocar na figura entre 2, 3 ou 4 opções. Não substitui a P01 (som de bicho).
8. **PWA próprio:** `public/rael.webmanifest` com `start_url`/`scope` em `/rael/`, nome
   "Jogos do Rael" e ícone de foguete.
9. **Bug achado no caminho:** o atributo `hidden` não escondia elementos com classe `.botao` ou
   `.roteiro`, porque uma regra de `display` do autor ganha do `[hidden]` do navegador. Corrigido
   com `[hidden] { display: none !important; }` no `descobertas.css`.

**Como foi testado:** `npm test` (141 testes, 54 novos), `npm run typecheck`, `npm run build` e
um roteiro no Chrome sem interface (46 verificações), mais um teste de modo avião com o service
worker. **Falta a validação com o Rael e nos aparelhos de casa.**

### P02 — Encaixe as Figuras

> ✅ Concluída em 2026-09-07.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00

**Como ficou**

1. **Sem ilustração nova.** As doze cenas saem dos mesmos SVGs do catálogo. A sombra é a figura
   com `filter: brightness(0)` e opacidade baixa; o pedaço é a figura recortada por
   `background-position`, como um sprite.
2. **Toque e arraste, os dois.** O arraste usa eventos de ponteiro; o toque em dois passos
   continua sendo o modo garantido.
3. **Níveis pelo mesmo botão da etapa.** 2 alternativas = três silhuetas; 3 = duas silhuetas e
   um de quatro pedaços; 4 = silhueta, quatro e seis pedaços.
4. **Descoberta no meio do caminho:** recortar uma figura numa grade deixa células em branco
   quando o desenho não preenche o quadro. Medida a tinta de cada célula num canvas
   (`tintaMinima`, em `dados.js`); tirou dinossauro, trem e ônibus das cenas de pedaços.
5. **Ajuda sem custo:** "Me mostra" encaixa a próxima peça e pode ser usado à vontade.

### P03 — Palmas nas Palavras

> ✅ Concluída em 2026-09-07.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** P00

**Como ficou**

1. **Cinquenta palavras** com divisão revisada à mão, em `dados.js`, todas com figura no
   catálogo. Regras de separação documentadas no cabeçalho do arquivo (CH/NH/LH/GU/QU não
   separam, RR/SS separam, ditongo fica junto). Teste confere que juntar sílabas devolve a
   palavra e que toda sílaba tem vogal.
2. **Demonstração antes da rodada**, ligando cada sílaba a uma palma.
3. **Círculo por sílaba, em sincronia com a fala** — `falarSequencia` ganhou um aviso por item
   (`aoComecar`) que acende o círculo no instante em que a sílaba é dita.
4. **Três níveis** pelo botão da etapa (2/3/4 alternativas → 1 palavra de 2 sílabas / 1–3
   sílabas / até 4 sílabas mais "Quantos pedaços?").
5. **Sem gravação por enquanto** — sílabas ditas pela voz do aparelho; `fala.js` prefere
   gravação se algum dia for adicionada.

### P04 — Rimas com Figuras

> ✅ Concluída em 2026-09-07.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00, J14

**Como ficou**

1. Banco inicial de 20 questões em três famílias sonoras: GATO/PATO/RATO/SAPATO,
   PÃO/LEÃO/AVIÃO/CAMINHÃO e ABELHA/OVELHA. Distratores da mesma família são rejeitados.
2. Seis alvos por rodada, com duas/três/quatro figuras conforme a configuração; cada
   alternativa tem botão próprio para ouvir o nome, sem registrar tentativa.
3. Como J14 ainda está pendente, o motor e os dados ficaram separados da tela e prontos para
   serem promovidos ao jogo da Elis, sem expor Versinho ou Desafio no lado do Rael.

### P05 — Começa com o Mesmo Som

> ✅ Concluída em 2026-09-07.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Opus · **Depende de:** P00

**Como ficou**

1. Trinta palavras com figura e gravação local, agrupadas por som, mais doze arquivos de som
   inicial. O pacote WAV mono ocupa 1,5 MB e entra no precache do PWA.
2. A primeira rodada e o nível fácil usam somente vogais. O nível normal acrescenta F, M, S e L;
   P, B e T aparecem apenas quando o adulto escolhe quatro alternativas.
3. A letra só aparece depois da resposta. Palavras e alternativas podem ser ouvidas quantas
   vezes quiser; os testes garantem uma única opção do mesmo grupo sonoro por desafio.
4. Gravações geradas com a voz offline Luciana (pt-BR). **Pendente:** conferir os sons isolados
   no iPad/Android e substituir pela voz de casa se necessário.

### P06 — Letras para Explorar

> ✅ Concluída em 2026-09-07.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** P00

**Como ficou**

1. Quatro modos: Letras iguais, Ouvir e encontrar, Letra da figura e Mesa de letras. Os três
   primeiros com demonstração e seis desafios; a mesa é livre e não pontua.
2. Conjunto inicial: vogais, letras do primeiro nome e B/M/P/L/S. As configurações permitem
   marcar letras individualmente, restaurar o conjunto inicial ou usar A–Z.
3. A letra é falada pelo nome, não confundida com seu som. Até duas figuras do catálogo ligam
   a forma da letra a palavras familiares; IGREJA e ILHA garantem dois exemplos para a vogal I.

### P07 — Meu Primeiro Labirinto

> ✅ Concluída em 2026-09-07.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00, J13

**Como ficou**

1. Dez aventuras manuais com versões 3×3, 4×4 e 5×5. O nível normal abre direto no 4×4; o modo
   esperto pede uma estrela antes da garagem.
2. Lógica canônica em `Games/labirinto/jogo.js`: movimento, paredes, reinício e a busca que
   resolve os mapas e indica o próximo passo — compartilhável com J13, sem segundo gerador.
3. Tela aceita setas grandes, teclado e toque numa casa vizinha. Sem cronômetro, vidas ou
   avaliação por movimentos; usar dica não muda a festa nem a figurinha.
4. Testes percorrem todos os mapas, seguem cada dica até o fim, verificam paredes, limites,
   estrela obrigatória e reinício limpo.

---

## 6. Riscos e decisões já resolvidos (etapa Jogos do Rael)

- **Áudio era o gargalo — resolvido na P00.** O rascunho anterior exigia gravação para toda
  fala; somadas, as atividades passariam de 300 arquivos antes de qualquer coisa rodar. Com a
  fala em três camadas, só P01 e P05 dependem de gravação, e a etapa começou sem nenhuma — a P03
  saiu com as sílabas ditas pela voz do aparelho.
- **Figuras.** Emojis do sistema mudam de desenho entre aparelhos; SVGs copiados de um conjunto
  livre resolvem isso sem ilustrar à mão. A P02 acabou não precisando de desenho próprio.
- **Dois perfis no mesmo aparelho — resolvido de outro jeito.** Em vez de um seletor
  "Quem vai brincar?", a P00 fez dois sites irmãos com abas no alto de cada página inicial.
- **Peso do PWA.** O service worker pré-cacheia todo o `dist/`; limite de 8 MB para áudio e
  figuras da etapa, revisado a cada tarefa.
- **Escrita com o dedo** (traçar letras) ficou de fora de propósito.
