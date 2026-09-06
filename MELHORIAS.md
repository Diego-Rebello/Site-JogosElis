# Plano de Melhorias — Jogos da Elis

> Gerado em 2026-09-06 a partir da análise completa do repositório `Site-JogosElis`
> (branch `1.2-correcaoindices`, idêntica a `origin/main`).
> Atualizado no mesmo dia com os dados da hospedagem: **Netlify**, projeto `jogosdaelis`,
> site público em https://jogosdaelis.netlify.app/. Configuração do painel confirmada por capturas
> de tela: deploy contínuo do GitHub (`main`), sem comando de build, publicado em `main@5f482ec`.
>
> Este documento é um **backlog executável**: cada tarefa foi escrita para ser entregue a um modelo
> (Claude Opus ou Claude Sonnet) que a execute do início ao fim sem precisar de mais contexto.
> Diego revisa o resultado, testa com a Elis e segue para a próxima.
>
> **Andamento:** T01 a T12 concluídas em 2026-09-06. A próxima tarefa da fila é a **T13**.
> O estado atual do repositório está na seção [0.4](#04-progresso); a seção 1 é o diagnóstico
> original, de antes da execução, e foi mantida para registrar o motivo de cada tarefa.

---

## 0. Como usar este documento

### 0.1 Convenções

| Campo | Significado |
|---|---|
| **Prioridade** | Alta = corrige bug ou destrava outras tarefas · Média = melhora clara · Baixa = desejável |
| **Esforço** | P = até ~1 h de trabalho do modelo · M = 1 a 3 h · G = meio dia ou mais |
| **Modelo** | Sonnet para tarefas mecânicas e bem delimitadas · Opus para arquitetura, geradores e refatorações amplas |
| **Depende de** | Tarefas que precisam estar prontas antes |
| **IDs** | `T` = melhoria técnica · `J` = jogo novo |

### 0.2 Regras gerais para o modelo executor (colar no início de toda sessão)

```
Contexto: repositório Site-JogosElis, um site estático de jogos educativos em português do Brasil,
feito por um pai para a filha Elis, de 9 anos (4.º ano). Leia o arquivo MELHORIAS.md antes de começar.

Regras:
1. Todo texto visível para a criança fica em pt-BR, com frases curtas, tom alegre e acentuação correta.
2. Sem backend, sem banco de dados, sem chaves de API. Apenas HTML/CSS/JS estático
   (React + Vite somente onde já existe: Jogo da Memória e Jogo da Velha).
3. Tudo precisa funcionar em celular e tablet: largura mínima de 360 px, toque como entrada
   principal, alvos de toque com pelo menos 44 px, sem rolagem horizontal.
4. O site é publicado pelo Netlify (projeto `jogosdaelis`) direto do GitHub, sem comando de build:
   o que está na branch `main` vai ao ar como está. Após alterar um jogo React, rode `npm run build`
   na pasta do jogo (`Games/memoria` ou `Games/velha`) e faça commit da pasta `dist/` atualizada
   (deixa de ser necessário depois da T20).
5. Nunca faça commit de node_modules, .env.local, .DS_Store ou arquivos de build fora de dist/.
6. Trabalhe em uma branch nova criada a partir de `main`. Commits pequenos, mensagens em português.
   Todo push em `main` é publicado automaticamente pelo Netlify em cerca de um minuto, então só
   mescle em `main` o que já foi testado (o Netlify gera uma URL de preview para cada pull request).
7. Ao terminar, abra cada página alterada no navegador (servidor local ou `npx vite preview`),
   confira o console sem erros e a aba Network sem 404.
8. Não remova funcionalidades existentes a menos que a tarefa peça explicitamente.
9. Ao final, escreva um resumo: o que mudou, como foi testado, o que ficou pendente.
10. Atenção ao caminho local do projeto: ele contém ":" (`/Users/diego/Desktop/Programas : Jogos/`),
    que é o separador do PATH. Por isso o npm não consegue prefixar `node_modules/.bin` e os scripts
    caem no binário global. Os scripts dos dois jogos React já chamam o binário local direto
    (`node ./node_modules/vite/bin/vite.js build`); mantenha esse formato. Se for rodar uma
    ferramenta nova pela linha de comando, chame o binário local pelo caminho, não pelo nome, e
    confira a versão na saída (deve ser Vite 6.x, não 7.x).
```

### 0.3 Dados que o Diego deve preencher antes de começar

| Pergunta | Resposta |
|---|---|
| Idade atual da Elis (define os níveis padrão) | **9 anos** (por volta do 4.º ano do fundamental). Respondido em 2026-09-06. |
| Provedor da hospedagem | **Netlify**, projeto `jogosdaelis`. Painel: https://app.netlify.com/projects/jogosdaelis/overview |
| URL pública do site | **https://jogosdaelis.netlify.app/** |
| Como o site é publicado hoje | **Confirmado no painel (2026-09-06):** deploy contínuo a partir de `github.com/Diego-Rebello/Site-JogosElis`, branch `main`, *auto publishing* ligado, publicado em `main@5f482ec`. Em *Build settings*: Runtime, Build command, Publish directory e Package directory **não definidos**; Base directory `/`; Build status *Active*; logs de deploy públicos. Ou seja, o Netlify publica a raiz do repositório exatamente como está no git, sem build. |
| Manter a pasta `Games/` ou renomear para `Games/` (tarefa T08)? | **Manter `Games/`**; só as subpastas são renomeadas para kebab-case. Respondido em 2026-09-06. |

### 0.4 Progresso

Fases 0 e 1 concluídas, mais as T08 a T12. Tudo testado no navegador (Chrome headless) antes de
cada commit.

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
| T13 em diante | ⬜ A fazer | — |

**Inventário atual** (substitui o caminho da tabela 1.1):

| Jogo | Caminho | Tecnologia |
|---|---|---|
| Página inicial | `index.html` | HTML/CSS puro + `shared/base.css`, ícones em emoji |
| Biblioteca comum | `shared/` | CSS + módulos ES próprios, sem dependência externa |
| Jogo da Forca | `Games/forca/index.html` | HTML puro + `shared/`, script `type="module"` |
| Jogo de Somar | `Games/matematica/index.html` | HTML puro + `shared/`, script `type="module"` |
| Jogo do M ou N | `Games/m-ou-n/index.html` | HTML puro + `shared/`, script `type="module"` |
| Jogo da Memória | `Games/memoria/` (publicado de `dist/`) | React 19.2 + Vite 6.4 + Tailwind 4 compilado |
| Jogo da Velha | `Games/velha/` (publicado de `dist/`) | React 19.2 + Vite 6.4 + Tailwind 4 compilado |

**O site não faz mais nenhuma requisição externa.** Fontes, ícones e CSS são todos locais.

**Decisões tomadas durante a execução, que valem para as próximas tarefas:**

- Os scripts npm dos dois jogos React chamam o binário local pelo caminho
  (`node ./node_modules/vite/bin/vite.js build`) por causa do ":" no caminho do projeto — ver a
  regra 10 da seção 0.2. Existe também o script `npm run typecheck`.
- O `_redirects` da T08 aponta os dois jogos React para `.../dist/`, e não para a raiz da pasta como
  dizia a tabela original da tarefa: a raiz serve o `index.html` de desenvolvimento, que carrega
  `index.tsx` e não roda no navegador. Isso deixa de ser necessário na T20.
- O Jogo da Forca ganhou um oitavo tema além dos sete sugeridos na T05: **Corpo**
  (`CORAÇÃO`, `CABEÇA`, `BRAÇO`…), que dá bons casos de Ç e til.
- As cinco páginas e a página inicial ganharam favicon SVG embutido em `data:` URI. Antes todas
  respondiam 404 em `/favicon.ico`. Não há arquivo de ícone no repositório; a T22 pode trocar por um
  ícone próprio.
- O Jogo da Memória usa `max-w-lg` no tabuleiro de 16 cartas: como as cartas agora são `w-full`,
  quem define o tamanho delas é a largura do tabuleiro.
- Os dois PRs abertos pelo Snyk (passo 2 da T02) foram **descartados por decisão do Diego**: as
  vulnerabilidades já tinham sido resolvidas pelo `npm audit fix` da própria T02.
- As fontes Fredoka One, Pacifico e Nunito são servidas de `shared/fontes/` (77 KB em `.woff2`),
  e não do Google Fonts. Era o passo "opcional recomendado" da T11; foi feito já na T09 porque é
  o que fecha a conta de dependências externas e destrava a T21.
- `shared/base.css` **não estiliza elementos crus** (`body`, `button`, `input`): é tudo classe.
  Sem isso, uma regra dele venceria os utilitários do Tailwind nos dois jogos React, porque CSS
  sem camada ganha de CSS em camada independentemente da especificidade.
- Os três jogos em HTML puro passaram a usar `<script type="module">` para importar
  `shared/texto.js`. **Isso impede abrir por `file://`**: é preciso servir por HTTP.
- Os dois `index.css` dos jogos React usam `@import "tailwindcss" source(none)` com `@source`
  explícitos. Sem isso o Tailwind 4 varreria também o `dist/` commitado e realimentaria classes
  velhas a cada build.
- O componente `Cabecalho` está duplicado nos dois projetos React, de propósito: pôr um `.tsx` em
  `shared/` obrigaria a pasta a depender do React, o que a T09 proíbe. A T23 resolve isso se e
  quando os projetos forem unificados.
- Somar e M ou N ainda não têm rodadas, então a comemoração da T12 dispara a cada **5 acertos**,
  como marco provisório. A T14 e a T15 substituem isso por rodadas de verdade.
- No Jogo da Velha, vitória do computador toca o som de erro e **não** lança confete: festa só
  quando quem ganha é a criança.

---

## 1. Diagnóstico do estado atual

> Fotografia de 2026-09-06, **antes** da execução das tarefas. Mantida como registro do motivo de
> cada tarefa. Para o estado atual, ver a seção [0.4](#04-progresso).

### 1.1 Inventário

| Jogo | Caminho | Tecnologia | Situação |
|---|---|---|---|
| Página inicial | `index.html` | HTML/CSS puro, Font Awesome via CDN, Google Fonts | Funciona. Identidade visual boa (rosa, fontes Pacifico/Fredoka One). |
| Jogo da Forca | `Games/Jogo da Forca/forca.html` | HTML/JS puro em um arquivo | Funciona. Sem `viewport` (ruim no celular), palavras sem acento, sem dica. |
| Jogo de Somar | `Games/Jogo de Somar/soma_placar.html` | HTML/JS puro em um arquivo | Funciona. Só soma, só números de 10 a 99, um nível. |
| Jogo do M ou N | `Games/Jogo M N-digitar/Jogo M N-digitar.html` | HTML/JS puro em um arquivo | Funciona. 4 palavras com erro na lista e lógica da lacuna falha em 3 casos. |
| Jogo da Memória | `Games/emoji-memory-game/` | React 19 + Vite 6 + Tailwind via CDN, `dist/` commitado | Funciona. `index.html` corrompido, 2 arquivos 404, grade estoura no celular com 24/32 cartas. |
| Jogo da Velha | `Games/jogo-da-velha-divertido/` | React 19 + Vite 6 + Tailwind via CDN, `dist/` commitado | Funciona. Restos do template AI Studio, `importmap` inútil, 2 arquivos 404. |

### 1.2 O que foi verificado nesta análise

- **Build reproduzível:** `vite build` dos dois jogos React gerou arquivos byte a byte iguais aos commitados em `dist/` (mesmos hashes `index-hUXLbAIR.js` e `index-CKN5IFQq.js`). O `dist/` está sincronizado com o código-fonte.
- **Tipagem:** `tsc --noEmit` passa nos dois projetos. Porém o Jogo da Memória **não tem `@types/react` instalado**, então quase tudo ali é `any` e a checagem não pega erros de verdade.
- **Segurança de dependências:** `npm audit` aponta 5 vulnerabilidades altas (vite ≤ 6.4.2 e rollup) nos dois projetos. Todas afetam apenas o servidor de desenvolvimento, não o site publicado. `npm audit fix` resolve.
- **Hospedagem:** Netlify, projeto `jogosdaelis`, público em https://jogosdaelis.netlify.app/ (HTTPS com HSTS, HTTP/2, `cache-control: public, max-age=0, must-revalidate`). Não há `netlify.toml`, `_redirects` nem `_headers` no repositório, então o Netlify publica a raiz do repositório sem comando de build; por isso o `dist/` dos jogos React está no git. Arquivos fora do git (`node_modules`, `.env.local`) não estão no ar e o conteúdo publicado bate com o `origin/main`. Confirmado nas capturas do painel: deploy contínuo a partir do GitHub, branch `main`, *auto publishing* ligado, publicado em `main@5f482ec` (o merge do PR #6, mesmo commit de `origin/main`); *Build command* e *Publish directory* não definidos, *Base directory* `/`, *Build status* Active. Três efeitos colaterais observados no site no ar:
  - O pós-processamento *Pretty URLs* do Netlify está ativo: os links do HTML publicado são reescritos (`Games/emoji-memory-game/dist/index.html` vira `/games/emoji-memory-game/dist/`, tudo em minúsculas) e os caminhos originais respondem com redirecionamento 301. O HTML no ar não é idêntico ao do repositório.
  - Todo o código-fonte é servido publicamente (`/Games/emoji-memory-game/App.tsx`, `vite.config.ts`, `package-lock.json` respondem 200). Sem risco real, porque o repositório já é público, mas desnecessário; a T20 resolve publicando só a pasta gerada.
  - O `}` solto do Jogo da Memória (item 5 da tabela abaixo) está visível no site no ar.
- **GitHub Pages:** desativado no repositório e não é necessário; o Netlify continua sendo o provedor.
- **Git:** a branch `main` local está 4 commits atrás de `origin/main`. Existem 2 branches abertas pelo Snyk (`react` e `react-dom` 19.1.1 → 19.2.0, só no Jogo da Velha). Há um repositório git aninhado por engano em `Games/emoji-memory-game/.git` (mesmo remoto do projeto principal). Arquivos `.DS_Store` estão versionados (raiz e `Games/`). Não existe `.gitignore` na raiz.
- **CDNs externos:** Google Fonts, Font Awesome 6.5.1 e `cdn.tailwindcss.com` respondem normalmente hoje, mas o site depende deles para funcionar.

### 1.3 Problemas encontrados, por gravidade

| # | Gravidade | Onde | Problema | Tarefa |
|---|---|---|---|---|
| 1 | Bug visível | `Games/Jogo M N-digitar/Jogo M N-digitar.html:168` | `SUSPEITO` não tem M nem N: o jogo exibe `_SUSPEITO`. | T04 |
| 2 | Bug de conteúdo | mesmo arquivo `:172-173` | `TROBOMBE` não é palavra (provável `TROMBONE`); `DESEMBRO` está errado (`DEZEMBRO` já existe na lista). | T04 |
| 3 | Bug pedagógico | mesmo arquivo `:207-218` | Lacuna cai na letra inicial antes de vogal: `MEMBRO` → `_EMBRO`, `NUNCA` → `_UNCA`. Não exercita a regra. | T04 |
| 4 | Bug pedagógico | mesmo arquivo `:163-191, :237` | Acentuação inconsistente: `ONÇA`, `CRIANÇA`, `DANÇA`, `IMBATÍVEL` têm acento/cedilha e a comparação é exata (a criança que digita `ONCA` erra); `LAMPIAO`, `OLIMPIADA`, `AMBULANCIA`, `SIMBOLO`, `INGLES`, `INJECAO` aparecem sem acento, ensinando grafia errada. | T04 |
| 5 | Bug visível | `Games/emoji-memory-game/index.html:27-36` | Lixo após `</html>` (chave `}` solta, `</script>`, segundo `<body>`, dois `</html>`). O `}` vira texto visível no fim da página; o `dist/index.html` herda o problema. | T06 |
| 6 | Bug | `Games/emoji-memory-game/App.tsx:108, :195` | Cartas com largura fixa (`w-20`) em grades de 6 e 8 colunas: com 24 ou 32 cartas as cartas se sobrepõem em telas de celular. | T06 |
| 7 | Bug | `Games/Jogo da Forca/forca.html:3-6` | Sem `<meta name="viewport">`: no celular a página abre minúscula. | T05 |
| 8 | Bug pedagógico | `Games/Jogo da Forca/forca.html:69-75, :96` | Palavras sem acento (`LEAO`, `PASSARO`, `FAMILIA`) e teclado sem `Ç`. Ensina grafia errada. | T05 |
| 9 | 404 | `Games/emoji-memory-game/index.html:5, :20` e `Games/jogo-da-velha-divertido/index.html:6, :25` | Referências a `vite.svg` e `index.css` que não existem. No Jogo da Velha o caminho `/vite.svg` é absoluto e quebra em qualquer subpasta. | T06, T07 |
| 10 | Código morto | `Games/jogo-da-velha-divertido/index.html:16-23` | `importmap` apontando React para `esm.sh`, mas o bundle do Vite já inclui o React. Só confunde. | T07 |
| 11 | Qualidade | `Games/jogo-da-velha-divertido/components/Square.tsx:28` | Uma tag `<style>` com keyframes é injetada dentro de cada uma das 9 casas. | T07 |
| 12 | Qualidade | `Games/emoji-memory-game/App.tsx:14-16` | Embaralhamento com `sort(() => Math.random() - 0.5)`, que é enviesado. | T06 |
| 13 | Qualidade | `Games/emoji-memory-game/App.tsx:242, :255` | `setTimeout` sem limpeza: clicar em "Novo Jogo" durante o 1 s de espera dispara troca de jogador na partida nova. | T06 |
| 14 | Performance | `index.html:8, :11` e os dois jogos React | Font Awesome inteiro (102 KB de CSS + fontes) para 5 ícones; `@import` de fonte bloqueando renderização; Tailwind "Play CDN" (compilador em tempo de execução, não recomendado para produção pela própria Tailwind). | T11 |
| 15 | Resto de template | `vite.config.ts` dos dois jogos, `metadata.json`, `README.md` dos jogos, `.env.local` | Referências a `GEMINI_API_KEY` e ao AI Studio que o jogo não usa. | T03 |
| 16 | Higiene | raiz, `Games/`, `.vscode/launch.json:11` | `.DS_Store` versionado; sem `.gitignore` raiz; `launch.json` aponta para `Homepage/index`, pasta que não existe; `README.md` só tem o título. | T01 |
| 17 | Higiene | `Games/emoji-memory-game/.git` | Repositório git aninhado por engano; comandos git rodados dentro dessa pasta agem no repositório errado. | T01 |
| 18 | UX | todos os jogos | Nenhum jogo tem botão para voltar à página inicial; a criança fica presa. | T09, T10 |
| 19 | UX | todos os jogos | Sem som, sem celebração, sem progresso salvo, sem níveis de dificuldade. | T12, T13, T14–T18 |
| 20 | Acessibilidade | `index.html` | Rosa `#ff69b4` sobre branco tem contraste abaixo de 3:1 para o texto dos cartões. | T22 |
| 21 | Publicação | Netlify (raiz do repositório como pasta de publicação) | Código-fonte, `package-lock.json` e configs vão ao ar junto com o site; `dist/` precisa ser commitado a cada alteração dos jogos React. | T20 |

### 1.4 Pontos fortes a preservar

- Links relativos e `base: './'` no Vite: o site funciona em qualquer subpasta.
- Identidade visual da página inicial (rosa, fontes arredondadas, cartões grandes) agrada o público.
- Jogos React bem organizados em componentes; a IA do Jogo da Velha deixa a criança ganhar às vezes (65 % de chance de bloquear), o que é uma boa decisão pedagógica.
- Textos já em português e tom carinhoso.

---

## 2. Melhorias técnicas

### Ordem sugerida

| Fase | Tarefas | Objetivo |
|---|---|---|
| 0 — Higiene | T01, T02, T03 | Repositório limpo e dependências atualizadas |
| 1 — Correções | T04, T05, T06, T07 | Bugs conhecidos eliminados |
| 2 — Base comum | T08, T09, T10, T11, T12, T13 | Navegação, visual, som e progresso compartilhados |
| 3 — Jogabilidade | T14, T15, T16, T17, T18 | Níveis, modos e placares em cada jogo |
| 4 — Infraestrutura | T19, T20, T21, T22, T23 | Testes, publicação automática, PWA, acessibilidade |
| 5 — Novos jogos | J01 a J12 | Ver seção 3 |

---

### T01 — Higiene do repositório

> ✅ **Concluída em 2026-09-06** — commit `b6d320c`. Ver seção 0.4.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** —
**Arquivos:** `.gitignore` (novo), `.DS_Store`, `Games/.DS_Store`, `.vscode/launch.json`, `README.md`, `Games/emoji-memory-game/.git/`

**Problema encontrado**
- Repositório git aninhado em `Games/emoji-memory-game/.git` (criado por engano; tem o mesmo remoto do projeto).
- `.DS_Store` versionado na raiz e em `Games/`. Não há `.gitignore` na raiz.
- `.vscode/launch.json:11` aponta para `Homepage/index`, que não existe.
- `README.md` contém só `# SiteElis`.

**Passos**
1. Confirme que o `.git` aninhado é mesmo um repositório separado: `git -C "Games/emoji-memory-game" rev-parse --show-toplevel` deve imprimir a pasta do jogo (não a raiz). Só então remova: `rm -rf "Games/emoji-memory-game/.git"`. O `.git` da raiz não é tocado.
2. Crie `.gitignore` na raiz com:
   ```
   .DS_Store
   node_modules/
   *.local
   .env*
   _site/
   ```
3. Remova os `.DS_Store` do índice: `git rm --cached .DS_Store Games/.DS_Store`.
4. Corrija `.vscode/launch.json`: troque o campo `file` por `"${workspaceFolder}/index.html"`.
5. Reescreva `README.md` em pt-BR com: o que é o site, lista dos jogos, estrutura de pastas, como abrir localmente (`npx serve .` ou `python3 -m http.server`), como rodar/buildar os jogos React, como publicar, link para `MELHORIAS.md`.

**Critérios de aceite**
- [x] `git ls-files | grep -c DS_Store` retorna 0.
- [x] `ls Games/emoji-memory-game/.git` falha (pasta não existe; depois da T08 a pasta é `Games/memoria`).
- [x] `git status` limpo depois do commit; `git log -1` mostra o commit de higiene.
- [x] README explica como rodar e publicar.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T01 seguindo exatamente os passos e critérios de aceite.
Antes de apagar qualquer pasta .git, prove com o comando indicado que é o repositório aninhado.
```

---

### T02 — Sincronizar git e atualizar dependências

> ✅ **Concluída em 2026-09-06** — commit `74b6342`. Ver seção 0.4.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T01
**Arquivos:** `Games/emoji-memory-game/package*.json`, `Games/jogo-da-velha-divertido/package*.json`, `dist/` dos dois jogos

**Problema encontrado**
- `main` local está 4 commits atrás de `origin/main`; as branches `1.1-jogo-da-velha` e `1.2-correcaoindices` já foram mescladas.
- Duas branches do Snyk (`snyk-upgrade-…`) sobem `react`/`react-dom` para 19.2.0 só no Jogo da Velha.
- `npm audit`: 5 vulnerabilidades altas em `vite` e `rollup` nos dois projetos (afetam só o dev server).
- Versões diferentes entre os dois jogos são um convite a bugs; melhor manter iguais.

**Passos**
1. `git checkout main && git pull origin main`. Apague as branches locais já mescladas (`git branch -d 1.1-jogo-da-velha 1.2-correcaoindices`).
2. Feche os dois PRs do Snyk sem mesclar (a atualização será feita nos dois jogos de uma vez).
3. Em cada pasta de jogo React: `npm install react@^19.2 react-dom@^19.2 && npm audit fix`. Confirme que `vite` ficou em 6.4.x e que `npm audit` não reporta mais nível alto.
4. `npm run build` nos dois jogos e commite `package.json`, `package-lock.json` e `dist/`.
5. Teste os dois jogos no navegador a partir do `dist/index.html`.

**Critérios de aceite**
- [x] `npm audit` sem vulnerabilidades altas nos dois projetos.
- [x] `react` e `react-dom` com a mesma versão nos dois `package.json`.
- [x] Os dois jogos abrem e funcionam a partir do `dist/`.
- [ ] ~~Branches do Snyk fechadas.~~ **Descartado por decisão do Diego:** o `npm audit fix`
      da própria T02 já resolveu as vulnerabilidades, então os PRs do Snyk ficaram sem efeito.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T02. Não suba para Vite 7 ou 8 nesta tarefa; apenas
`npm audit fix` dentro da faixa atual. Ao final mostre a saída de `npm audit` dos dois projetos.
```

---

### T03 — Remover restos do template AI Studio e endurecer o TypeScript

> ✅ **Concluída em 2026-09-06** — commit `94355b9`. Ver seção 0.4.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T02
**Arquivos:** `vite.config.ts`, `tsconfig.json`, `package.json`, `metadata.json`, `README.md`, `.env.local` dos dois jogos React

**Problema encontrado**
- `vite.config.ts:9-12` (memória) e `:9` (velha) injetam `process.env.GEMINI_API_KEY`, que nenhum jogo usa.
- `metadata.json`, `README.md` e `.env.local` são do gerador AI Studio.
- Memória sem `@types/react` e `@types/react-dom`: o TypeScript trata React como `any`.
- `tsconfig.json` sem `strict` e sem `include`; com `allowJs` ativo, o `tsc` acaba lendo o bundle minificado de `dist/`, o que o deixa lento.

**Passos**
1. Em cada `vite.config.ts` remova `loadEnv` e o bloco `define`; mantenha `base: './'` e o alias `@`.
2. Apague `metadata.json` e `.env.local` (não versionado) dos dois jogos. Substitua o `README.md` de cada jogo por 5 linhas em pt-BR: nome, o que faz, `npm install`, `npm run dev`, `npm run build` (e que o `dist/` é commitado).
3. Memória: `npm i -D @types/react @types/react-dom`. Velha: `npm i -D @types/react-dom`.
4. Nos dois `tsconfig.json`: adicione `"strict": true`, `"include": ["*.ts", "*.tsx", "components", "lib"]`; remova `allowJs`, `experimentalDecorators`, `useDefineForClassFields` e `"types": ["node"]` (`@types/node` pode continuar instalado para o `vite.config.ts`).
5. Adicione o script `"typecheck": "tsc --noEmit"` nos dois `package.json` e corrija os erros de `strict` que aparecerem (esperado: poucos, como `winners[0]` possivelmente indefinido em `App.tsx` da memória).
6. `npm run build` nos dois e commite `dist/`.

**Critérios de aceite**
- [x] `grep -r GEMINI Games/` não encontra nada.
- [x] `npm run typecheck` passa nos dois jogos em menos de 30 s.
- [x] `npm run build` funciona e os jogos abrem normalmente.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T03. Ative strict e corrija os erros sem usar `any`
nem `!` (non-null assertion) exceto onde for realmente impossível evitar; explique cada exceção.
```

---

### T04 — Jogo do M ou N: corrigir lista de palavras e lógica da lacuna

> ✅ **Concluída em 2026-09-06** — commit `623809d`. Ver seção 0.4.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** —
**Arquivos:** `Games/Jogo M N-digitar/Jogo M N-digitar.html`

**Problema encontrado**
- `:168` `SUSPEITO` não tem M/N → exibe `_SUSPEITO`.
- `:172` `TROBOMBE` não existe; `:173` `DESEMBRO` está errado; `:172` `HUMBERTO` é nome próprio.
- `:207-218` a lacuna escolhe o primeiro M, e se ele não vem antes de P/B cai no primeiro N ou volta ao primeiro M: `MEMBRO` → `_EMBRO`, `NUNCA` → `_UNCA` (lacuna antes de vogal, fora da regra ensinada).
- `:237` comparação exata: `ONÇA` só é aceita com cedilha. Metade da lista está sem acento (`LAMPIAO`, `OLIMPIADA`, `AMBULANCIA`, `SIMBOLO`, `COMBUSTIVEL`, `RELAMPAGO`, `INGLES`, `INJECAO`), ensinando grafia errada.

**Passos**
1. Reescreva a lista com grafia correta e acentuada: `LAMPIÃO`, `OLIMPÍADA`, `AMBULÂNCIA`, `SÍMBOLO`, `COMBUSTÍVEL`, `RELÂMPAGO`, `INGLÊS`, `INJEÇÃO`, etc. Troque `SUSPEITO` por `SUSPENSO`, `TROBOMBE` por `TROMBONE`, remova `DESEMBRO` e `HUMBERTO`. Mantenha pelo menos 100 palavras; confira cada uma no dicionário.
2. Substitua a lógica da lacuna por uma função pura:
   ```js
   function gerarLacuna(palavra) {
     let i = palavra.search(/M(?=[PB])/);
     if (i === -1) i = palavra.search(/N(?=[^AEIOUÁÉÍÓÚÂÊÔÃÕ])/);
     if (i === -1) throw new Error('Palavra sem M/N antes de consoante: ' + palavra);
     return { texto: palavra.slice(0, i) + '_' + palavra.slice(i + 1), resposta: palavra[i], indice: i };
   }
   ```
3. Crie `normalizar(texto)` = `texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim()` e compare `normalizar(digitado) === normalizar(palavraCorreta)`. Ao acertar, mostre a palavra com a grafia correta (com acento) em destaque.
4. Na inicialização, percorra a lista chamando `gerarLacuna` em todas as palavras para que qualquer palavra inválida quebre imediatamente durante o desenvolvimento.
5. Mantenha o placar, o botão de nova palavra e o atalho Enter.

**Critérios de aceite**
- [x] Nenhuma palavra da lista lança erro em `gerarLacuna`.
- [x] `MEMBRO` → `ME_BRO`, `NUNCA` → `NU_CA`, `CAMPO` → `CA_PO`, `MENSAGEM` → `ME_SAGEM`.
- [x] Digitar `ONCA` para `ONÇA` é aceito; o feedback mostra `ONÇA`.
- [x] Todas as palavras exibidas com acentuação correta.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T04. Revise a grafia de cada palavra da lista final
uma a uma e liste no resumo as palavras removidas, adicionadas e corrigidas.
```

---

### T05 — Jogo da Forca: viewport, acentos, Ç e verificação de vitória

> ✅ **Concluída em 2026-09-06** — commit `4a43a17`. Ver seção 0.4.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** —
**Arquivos:** `Games/Jogo da Forca/forca.html`

**Problema encontrado**
- Sem `<meta name="viewport">` (`:3-6`).
- Palavras sem acento em `:69-75` (`LEAO`, `PASSARO`, `FAMILIA`); alfabeto `:96` só A–Z, sem `Ç`.
- Vitória detectada lendo `innerText` do DOM (`:111`), frágil.
- Placar conta letras, não partidas; nada persiste entre palavras.

**Passos**
1. Adicione `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
2. Converta a lista para objetos `{ palavra: 'LEÃO', categoria: 'Animais' }` com grafia correta. Categorias sugeridas: Animais, Comidas, Casa, Escola, Natureza, Brinquedos, Contos de fada. Pelo menos 80 palavras.
3. Revelação insensível a acento: ao clicar em `A`, revele `A`, `Á`, `Â`, `Ã`, `À`; ao clicar em `C`, revele também `Ç`. Exiba a letra com o acento original. Guarde as letras acertadas em um `Set` de letras normalizadas e detecte a vitória comparando o conjunto de letras da palavra normalizada com esse `Set`, sem ler o DOM.
4. Mostre a categoria acima da palavra ("Tema: Animais").
5. Placar da sessão: `Vitórias` e `Derrotas`, mantido entre palavras; o placar de erros da rodada continua com o emoji.
6. Aceite teclado físico (`keydown` de A–Z) além dos botões; botões com no mínimo 44 × 44 px e `flex-wrap`.
7. Ao terminar (vitória ou derrota), mostre a palavra completa com acentos.

**Critérios de aceite**
- [x] No celular (360 px) os botões cabem na tela sem rolagem horizontal.
- [x] `PÁSSARO`: clicar em `A` revela as duas letras (`Á` e `A`).
- [x] `CORAÇÃO` (se incluída): clicar em `C` revela `C` e `Ç`; clicar em `A` revela `A` e `Ã`.
- [x] Vitória e derrota disparam corretamente e o placar da sessão acumula.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T05 no arquivo do Jogo da Forca. Mantenha o visual atual
(emojis de estágio, cores) e o limite de 6 erros. Liste as categorias e a contagem de palavras no resumo.
```

---

### T06 — Jogo da Memória: HTML corrompido, 404, embaralhamento, grade responsiva e timeouts

> ✅ **Concluída em 2026-09-06** — commit `ede0eb2`. Ver seção 0.4.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T03
**Arquivos:** `Games/emoji-memory-game/index.html`, `App.tsx`, `dist/`

**Problema encontrado**
- `index.html:2` `lang="en"` e título em inglês; `:5` `vite.svg` inexistente; `:20` `index.css` inexistente; `:27-36` lixo após `</html>` (um `}` vira texto visível, `<body>` e `</html>` duplicados). O `dist/index.html` herda tudo.
- `App.tsx:14-16` embaralhamento enviesado.
- `App.tsx:108` cartas com largura fixa `w-20 h-24`; `:195` grades de 6 e 8 colunas → sobreposição no celular.
- `App.tsx:242` e `:255` `setTimeout` sem limpeza; corrida com "Novo Jogo"/"Voltar".
- No modo 1 jogador o placar "pontos" é sempre igual ao total de pares (sem sentido) e a vitória diz "Jogador 1 Venceu!".

**Passos**
1. Reescreva `index.html` do zero, limpo: `lang="pt-BR"`, título "Jogo da Memória", sem `vite.svg` e sem `index.css`, mantendo Tailwind CDN e as fontes até a T11.
2. Troque `shuffleArray` por Fisher-Yates:
   ```ts
   const embaralhar = <T,>(lista: T[]): T[] => {
     const copia = [...lista];
     for (let i = copia.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [copia[i], copia[j]] = [copia[j], copia[i]];
     }
     return copia;
   };
   ```
3. Grade responsiva: cartas com `w-full aspect-[3/4]` (sem largura fixa); colunas por quantidade e viewport: 16 → `grid-cols-4`; 24 → `grid-cols-4 sm:grid-cols-6`; 32 → `grid-cols-4 sm:grid-cols-6 md:grid-cols-8`. Emoji `text-3xl sm:text-4xl`.
4. Timeouts: guarde os ids em `useRef` e limpe em `handleNewGame`, `handleGoToSetup` e no cleanup dos `useEffect` (`return () => clearTimeout(id)`).
5. Modo 1 jogador: `VictoryModal` mostra "Você encontrou todos os pares!" (o contador de jogadas e cronômetro entram na T17).
6. `npm run typecheck && npm run build`; commite `dist/`.

**Critérios de aceite**
- [x] Aba Network sem 404 ao abrir `dist/index.html`.
- [x] Nenhum `}` visível na página; apenas um `<div id="root">` no DOM.
- [x] Com 32 cartas em 360 px de largura: sem rolagem horizontal e sem sobreposição.
- [x] Clicar em "Novo Jogo" durante a espera de 1 s não troca o jogador da partida nova.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T06. Teste a grade nas larguras 360, 768 e 1280 px
(DevTools) para 16, 24 e 32 cartas e descreva o resultado no resumo.
```

---

### T07 — Jogo da Velha: limpar `index.html`, keyframes e lógica duplicada

> ✅ **Concluída em 2026-09-06** — commit `df45930`. Ver seção 0.4.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T03
**Arquivos:** `Games/jogo-da-velha-divertido/index.html`, `components/Square.tsx`, `App.tsx`, `dist/`

**Problema encontrado**
- `index.html:6` `/vite.svg` com caminho absoluto (404 em subpasta); `:16-23` `importmap` para `esm.sh` que o bundle não usa; `:25` `index.css` inexistente.
- `Square.tsx:28` injeta `<style>` com keyframes em cada casa (9 cópias).
- `App.tsx:79-101` e `:103-125` repetem a sequência "aplicar jogada → checar vencedor → checar empate → trocar jogador".

**Passos**
1. Limpe `index.html`: remova `importmap`, `index.css` e o favicon inexistente (ou crie um favicon SVG de emoji embutido em data URI). Mantenha Tailwind CDN e a fonte até a T11.
2. Mova os keyframes `jump-in` para o `<style>` global do `index.html` e remova a tag `<style>` de `Square.tsx`.
3. Extraia uma função pura em `lib/logica.ts`:
   ```ts
   export function aplicarJogada(tabuleiro: SquareValue[], indice: number, jogador: Player)
     : { tabuleiro: SquareValue[]; vencedor: { player: Player; line: number[] } | null; empate: boolean }
   ```
   e mova `WINNING_COMBINATIONS`, `checkWinner` e `findBestMove` para o mesmo módulo. Use `aplicarJogada` no clique e no efeito do computador.
4. `npm run typecheck && npm run build`; commite `dist/`.

**Critérios de aceite**
- [x] Aba Network sem 404 e sem requisições a `esm.sh`.
- [x] Apenas uma definição de `@keyframes jump-in` no DOM.
- [x] Modos "Com um Amigo" e "Contra o Computador" chegam a vitória, derrota e empate corretamente.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T07. A refatoração não pode alterar o comportamento
da IA (65 % de chance de bloquear, jogada aleatória caso contrário).
```

---

### T08 — Padronizar nomes das subpastas de `Games/` (pasta `Games/` mantida por decisão do Diego)

> ✅ **Concluída em 2026-09-06** — commit `3a44892`. Ver seção 0.4.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T01, T04–T07 · **Decisão do Diego:** ver 0.3
**Arquivos:** `Games/**`, `index.html`, `README.md`

**Problema encontrado**
- Pastas com espaços e maiúsculas (`Jogo M N-digitar`, `Jogo da Forca`) geram URLs com `%20` e dificultam scripts de build. Nomes misturam português e inglês.

**Passos**
1. A pasta `Games/` continua com esse nome. Renomeie só as subpastas, com `git mv` (mantém histórico):

   | De | Para |
   |---|---|
   | `Games/Jogo da Forca/forca.html` | `Games/forca/index.html` |
   | `Games/Jogo de Somar/soma_placar.html` | `Games/matematica/index.html` |
   | `Games/Jogo M N-digitar/Jogo M N-digitar.html` | `Games/m-ou-n/index.html` |
   | `Games/emoji-memory-game/` | `Games/memoria/` |
   | `Games/jogo-da-velha-divertido/` | `Games/velha/` |

2. Atualize os cinco links em `index.html:107-128`, o `README.md` e o campo `name` dos `package.json`.
3. Favoritos antigos: crie o arquivo `_redirects` na raiz do repositório (o Netlify lê esse arquivo da pasta de publicação; a partir da T20 o `build-all.sh` o copia para `_site/`). O Netlify já converte os caminhos para minúsculas, então use minúsculas e `%20` no lugar dos espaços:
   ```
   /games/jogo%20da%20forca/*          /Games/forca/        301
   /games/jogo%20de%20somar/*          /Games/matematica/   301
   /games/jogo%20m%20n-digitar/*       /Games/m-ou-n/       301
   /games/emoji-memory-game/*          /Games/memoria/      301
   /games/jogo-da-velha-divertido/*    /Games/velha/        301
   ```

   **Como ficou de verdade:** os dois últimos destinos foram entregues como
   `/Games/memoria/dist/` e `/Games/velha/dist/`. A raiz dessas pastas serve o `index.html` de
   desenvolvimento, que carrega `index.tsx` e dá página em branco no navegador. Volta a ser
   `/Games/memoria/` e `/Games/velha/` depois da T20, quando o `build-all.sh` passar a copiar o
   conteúdo de `dist/` para a raiz de cada pasta publicada.
4. Verifique: `find Games -name "* *"` deve retornar vazio.

**Critérios de aceite**
- [x] Os 5 cartões da página inicial abrem os jogos.
- [x] Nenhum caminho com espaço dentro de `Games/`.
- [x] `git log --follow Games/forca/index.html` mostra o histórico antigo.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T08 usando `git mv`. Se o Diego optou por manter a pasta
`Games/`, renomeie apenas as subpastas para os nomes em kebab-case indicados.
```

---

### T09 — Biblioteca compartilhada `shared/` (visual, cabeçalho, sons, confete, texto, progresso)

> ✅ **Concluída em 2026-09-06** — commit `09d8c04`. Ver seção 0.4.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Opus · **Depende de:** T08
**Arquivos (novos):** `shared/base.css`, `shared/cabecalho.js`, `shared/texto.js`, `shared/sons.js`, `shared/confete.js`, `shared/progresso.js`, `shared/demo.html`

**Problema encontrado**
- Cada jogo tem visual próprio (Arial azul, Bootstrap-like, teal/indigo, sky) e nenhum tem botão de voltar. Funções como normalizar texto e embaralhar estão duplicadas ou erradas.

**Passos**
1. `shared/base.css`: tokens de `index.html` (`--cor-principal`, `--cor-secundaria`, `--cor-destaque`, fontes), reset mínimo, classes `.botao`, `.botao--secundario`, `.cartao`, `.placar`, `.feedback`, `.feedback--certo`, `.feedback--errado`, `.cabecalho`, com alvos de toque ≥ 44 px, `:focus-visible` e `@media (prefers-reduced-motion)`.
2. `shared/cabecalho.js`: ao carregar, injeta no topo `<header class="cabecalho"><a href="…/index.html">🏠 Início</a><h1>{título}</h1><button class="mudo">🔊</button></header>`. O título vem de `document.currentScript.dataset.titulo`. O link para a raiz é calculado por `location.pathname.replace(/\/games\/.*$/i, '/index.html')` (sem diferenciar maiúsculas, porque o Netlify pode servir a pasta como `/games/`), o que funciona tanto em `Games/forca/` quanto em `Games/memoria/dist/`.
3. `shared/texto.js` (ES module): `normalizar(texto)`, `embaralhar(lista)` (Fisher-Yates), `sortear(lista)`, `sortearVarios(lista, n)`.
4. `shared/sons.js`: Web Audio API, sem arquivos de áudio. `tocar('clique' | 'acerto' | 'erro' | 'vitoria')`, `alternarMudo()`, `estaMudo()`. Especificação: clique = tique de 30 ms; acerto = duas notas senoidais (C5 → E5, 120 ms cada); erro = onda quadrada 200 Hz por 200 ms, volume baixo; vitória = arpejo C5–E5–G5–C6, 100 ms cada. `AudioContext` criado só no primeiro gesto do usuário (exigência do iOS). Estado de mudo em `localStorage['jogos-elis:mudo']`.
5. `shared/confete.js`: `lancarConfete(duracaoMs = 1500)` com canvas em tela cheia, ~80 partículas nas cores dos tokens, sem dependências, respeitando `prefers-reduced-motion`.
6. `shared/progresso.js`: `registrarPartida(jogoId, { acertos, erros, estrelas })`, `obterProgresso()`, `estrelasDe(jogoId)`, `zerarProgresso()`. Chave `localStorage['jogos-elis:progresso']`, esquema:
   ```json
   { "forca": { "partidas": 12, "acertos": 30, "erros": 10, "melhorEstrelas": 3, "ultimaEm": "2026-09-06T14:00:00Z" } }
   ```
   Regra de estrelas para uma rodada: 3 se acertos ≥ 90 %, 2 se ≥ 70 %, 1 se a rodada foi concluída.
7. `shared/demo.html`: página que exercita tudo (botões que tocam cada som, lançam confete, registram progresso e mostram o resumo).

**Critérios de aceite**
- [x] `shared/demo.html` funciona em Chrome, Safari e no celular (som só depois de um toque).
      Verificado no Chrome com espião no `AudioContext`: nenhum contexto de áudio nasce antes
      do primeiro clique. Safari e celular não foram testados por falta de aparelho aqui.
- [x] Nenhuma dependência externa em `shared/`. As fontes também são locais.
- [ ] Cada função de `texto.js` e `progresso.js` tem teste na T19. **Pendente da T19.** Por ora
      há cobertura pelo navegador, via `shared/demo.html`.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T09. Escreva o código em ES modules simples, comentado em
pt-BR, sem frameworks. Entregue shared/demo.html funcionando e descreva a API pública no README.
```

---

### T10 — Aplicar cabeçalho e visual compartilhado em todos os jogos

> ✅ **Concluída em 2026-09-06** — commit `1c8f36d`. Ver seção 0.4.

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T09
**Arquivos:** os 5 jogos e `index.html`

**Passos**
1. Jogos em HTML puro (`forca`, `matematica`, `m-ou-n`): incluir `<link rel="stylesheet" href="../../shared/base.css">` e `<script src="../../shared/cabecalho.js" data-titulo="Jogo da Forca"></script>`; trocar as cores e botões próprios pelas classes de `base.css`; trocar `height: 100vh` por `min-height: 100dvh` (o teclado do celular encolhe a tela).
2. Jogos React: importar `../../shared/base.css` no `index.tsx` (o Vite empacota) e adicionar um componente `Cabecalho` com o mesmo HTML/classes; se o dev server reclamar de arquivo fora da raiz, configurar `server.fs.allow: ['..']` no `vite.config.ts`.
3. Converter os `<script>` dos jogos puros para `type="module"` para poder importar `texto.js` (isso exige abrir por servidor local, não por `file://`; documentar no README).
4. Página inicial: usar `base.css` também, mantendo o visual atual.

**Critérios de aceite**
- [x] Todos os jogos mostram o cabeçalho com "🏠 Início" que leva à página inicial.
- [x] Mesma paleta e mesmos botões em todos os jogos. Nos três jogos em HTML puro isso é
      literal (classes do `base.css`); nos dois React a paleta indigo/teal/sky virou o rosa
      do site, mas os botões continuam sendo utilitários do Tailwind, e não `.botao`.
- [x] Nenhuma regressão de funcionalidade: 24 checagens de jogabilidade nos cinco jogos.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T10 em todos os cinco jogos. Faça um commit por jogo.
Tire um screenshot (ou descreva) de cada jogo em 360 px de largura.
```

---

### T11 — Remover Tailwind CDN, Font Awesome e `@import` de fontes

> ✅ **Concluída em 2026-09-06** — commit `094f9ed`. Ver seção 0.4.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T10
**Arquivos:** `index.html`, `Games/memoria/*`, `Games/velha/*`

**Problema encontrado**
- `index.html:8` carrega 102 KB de CSS do Font Awesome (mais as fontes de ícones) para 5 ícones; `:11` usa `@import` de fonte, que atrasa a renderização.
- Os jogos React usam o Tailwind "Play CDN": compila CSS no navegador, é pesado e emite aviso no console de que não deve ir para produção.
- Tudo isso impede o site de funcionar offline (T21).

**Passos**
1. `index.html`: substitua os `<i class="fa-…">` por emojis (`👻 🧠 🧮 ⌨️ ⭕`) ou SVG embutido; remova o `<link>` do Font Awesome; troque o `@import` por `<link rel="preconnect">` + `<link rel="stylesheet">` das Google Fonts.
2. Opcional recomendado: baixe as fontes `Fredoka One` e `Pacifico` em `.woff2` para `shared/fontes/` e declare `@font-face` em `base.css`, eliminando a dependência do Google Fonts.
3. Nos dois jogos React: `npm i -D tailwindcss @tailwindcss/vite`; adicione o plugin em `vite.config.ts`; crie `index.css` com `@import "tailwindcss";`; importe no `index.tsx`; remova o `<script src="https://cdn.tailwindcss.com">`. Os utilitários com colchetes (`[transform-style:preserve-3d]`) continuam funcionando no Tailwind 4.
4. `npm run build`; confira o tamanho do CSS gerado (esperado: poucas dezenas de KB).

**Critérios de aceite**
- [x] Aba Network sem requisições a `cdn.tailwindcss.com` nem `cdnjs.cloudflare.com` — e sem
      requisição externa nenhuma, em nenhuma das seis páginas.
- [x] Visual idêntico ao anterior. Conferido classe por classe: as 121 classes usadas nos
      componentes têm regra no CSS gerado. `bg-opacity-60`, removida no Tailwind 4, virou
      `bg-black/60`; `cursor: pointer` nos botões foi reposto.
- [x] Nenhum aviso do Tailwind no console.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T11. Use Tailwind 4 com o plugin oficial do Vite.
Se alguma classe deixar de funcionar, reescreva-a em CSS comum em vez de voltar ao CDN.
```

---

### T12 — Sons e celebração em todos os jogos

> ✅ **Concluída em 2026-09-06** — commit `784d82e`. Ver seção 0.4.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T09, T10
**Arquivos:** os 5 jogos

**Passos**
1. Chame `tocar('clique')` em botões principais, `tocar('acerto')`/`tocar('erro')` no feedback e `tocar('vitoria')` + `lancarConfete()` ao concluir uma rodada ou vencer.
2. O botão 🔊/🔇 do cabeçalho controla o mudo e persiste.
3. Feedback visual junto com o som: classe `.tremer` no erro (animação de 300 ms) e `.pular` no acerto, definidas em `base.css`, ambas desativadas com `prefers-reduced-motion`.

**Critérios de aceite**
- [x] Cada jogo toca os quatro sons nos momentos certos; mudo silencia todos e atravessa a
      navegação entre jogos.
- [x] Confete aparece em vitórias e não aparece com `prefers-reduced-motion`.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T12 usando apenas shared/sons.js e shared/confete.js.
```

---

### T13 — Progresso salvo e "Mural de Conquistas" na página inicial

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T09, T10
**Arquivos:** `index.html`, `shared/progresso.js`, os 5 jogos, `configuracoes.html` (novo)

**Passos**
1. Cada jogo chama `registrarPartida` ao terminar uma rodada (define "rodada" por jogo: forca = uma palavra; matemática e m-ou-n = 10 questões; memória = um tabuleiro; velha = uma partida).
2. Página inicial: em cada cartão mostre as estrelas do melhor resultado (`⭐⭐⭐`) e "Jogou 12 vezes"; seção "Mural de Conquistas" com total de estrelas e jogo favorito.
3. `configuracoes.html` (para o adulto): nome da criança (usado nas mensagens: "Parabéns, Elis!"), nível padrão por jogo, mudo, botão "Zerar progresso" com confirmação. Link discreto no rodapé da página inicial.
4. Tudo em `localStorage`; sem servidor.

**Critérios de aceite**
- [ ] Ao terminar uma rodada em qualquer jogo, a página inicial reflete as estrelas.
- [ ] "Zerar progresso" limpa tudo após confirmação.
- [ ] O nome configurado aparece nas mensagens de vitória.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T13. Garanta que a página inicial continua funcionando
quando o localStorage está vazio ou bloqueado (try/catch em toda leitura).
```

---

### T14 — Jogo de Somar vira "Matemática": níveis, subtração e rodadas de 10

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T10
**Arquivos:** `Games/matematica/index.html` (ex `soma_placar.html`)

**Problema encontrado**
- `:178-180` só gera somas de 10 a 99 com resultado ≤ 100 (mínimo 20); nada para quem está começando.
- Após responder, `Enter` não faz nada (`:196`, `:238`); é preciso clicar em "Gerar Novo".
- Sem subtração, sem apoio visual, sem fim de rodada.

**Passos**
1. Tela inicial com escolha de **nível** e **operação**:

   | Nível | Faixa | Operações | Entrada | Apoio visual |
   |---|---|---|---|---|
   | 1 — Contando | 1 a 10 | soma | 3 opções para tocar | fileiras de emojis (🍎🍎🍎 + 🍎🍎) |
   | 2 — Até 20 | 0 a 20 | soma e subtração (resultado ≥ 0) | 3 opções ou digitar | emojis opcionais |
   | 3 — Até 100 | 10 a 99 | soma e subtração | digitar | nenhum |
   | 4 — Tabuada | 2 a 10 × 1 a 10 | multiplicação e divisão exata | digitar | grade de pontos |
   | 5 — Desafio | até 1000 | soma e subtração com reagrupamento, multiplicação por 2 dígitos | digitar | nenhum |

2. Nível padrão ao abrir: 3 (Elis tem 9 anos); os níveis 1 e 2 ficam disponíveis como revisão. Rodada de 10 questões com barra de progresso; tela final com acertos, tempo, estrelas (`registrarPartida`) e "Jogar de novo".
3. Fluxo de teclado: `Enter` confere; `Enter` de novo (ou "Próxima") avança. Errou: mostra a resposta certa e, no nível 1, a contagem dos emojis.
4. Gerador como função pura `gerarQuestao(nivel, operacao)` exportada (para os testes da T19). Nunca gerar subtração com resultado negativo nem repetir a mesma questão em sequência.
5. Atualize o cartão da página inicial para "Matemática" com ícone 🧮.

**Critérios de aceite**
- [ ] 1000 chamadas de `gerarQuestao` por nível respeitam as faixas e nunca produzem negativo.
- [ ] Rodada de 10 questões termina com tela final e registra estrelas.
- [ ] `Enter` confere e avança sem usar o mouse.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T14. Mantenha o arquivo em HTML/JS puro, com a lógica em
um módulo `jogo.js` separado do DOM para facilitar os testes.
```

---

### T15 — Jogo do M ou N: modo toque, explicação da regra e rodadas

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T04, T10
**Arquivos:** `Games/m-ou-n/index.html`

**Passos**
1. Tela inicial com dois modos: **Toque** (dois botões grandes `M` e `N`, ideal para tablet) e **Digite a palavra** (modo atual).
2. Cartão de regra antes de começar: "Antes de **P** e **B** usamos **M**. Antes das outras letras usamos **N**." Botão "Entendi!".
3. Rodada de 10 palavras sem repetição, barra de progresso, tela final com estrelas.
4. Ao errar: mostra a palavra correta com a letra em destaque e lembra a regra; não avança sozinho.
5. Ao acertar: mostra a palavra correta acentuada por 1 s e avança.

**Critérios de aceite**
- [ ] Modo toque jogável só com o dedo; modo digitar continua funcionando com `Enter`.
- [ ] Nenhuma palavra se repete na mesma rodada.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T15 sobre o resultado da T04.
```

---

### T16 — Jogo da Forca: escolha de tema, dica e placar

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T05, T10
**Arquivos:** `Games/forca/index.html`

**Passos**
1. Tela inicial para escolher o tema (ou "Todos").
2. Botão "Dica 💡" liberado após o 3.º erro, mostrando uma frase curta por palavra (adicionar campo `dica` aos dados; escrever para todas as palavras).
3. Placar da sessão (vitórias/derrotas) e estrelas por palavra: 3 sem erro, 2 com até 2 erros, 1 com até 5.
4. Animação do emoji ao errar (`.tremer`) e confete ao vencer (T12).

**Critérios de aceite**
- [ ] Todas as palavras têm `dica` preenchida e revisada.
- [ ] Tema escolhido é respeitado na sequência de palavras.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T16. As dicas devem ser compreensíveis para uma criança
de 9 anos e não podem conter a própria palavra.
```

---

### T17 — Jogo da Memória: modo 1 jogador com jogadas, cronômetro, recorde e temas

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T06, T10
**Arquivos:** `Games/memoria/App.tsx`, novos `lib/logica.ts`, `lib/temas.ts`

**Passos**
1. Temas de emojis selecionáveis na tela inicial: Animais, Comidas, Transportes, Esportes, Natureza, Mistura (mínimo 16 emojis distintos por tema, em `lib/temas.ts`).
2. Modo 1 jogador: contador de jogadas (par de viradas) e cronômetro; ao concluir, mostra jogadas, tempo e recorde por tamanho (`localStorage['jogos-elis:memoria:recorde:<n>']`); estrelas: 3 se jogadas ≤ 1,5 × pares, 2 se ≤ 2,5 ×, 1 caso contrário.
3. Modo 2+ jogadores continua como está, com o nome do jogador da vez em destaque e som ao encontrar par.
4. Mover `embaralhar`, `gerarCartas` e o cálculo de estrelas para `lib/logica.ts` (testes na T19).

**Critérios de aceite**
- [ ] Recorde persiste após recarregar.
- [ ] `gerarCartas(16, 'Animais')` produz 8 pares de emojis distintos do tema.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T17. Não altere a mecânica de virar cartas; só acrescente
o que a tarefa pede.
```

---

### T18 — Jogo da Velha: placar acumulado, escolha de símbolo, quem começa e níveis

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T07, T10
**Arquivos:** `Games/velha/App.tsx`, `lib/logica.ts`, componentes

**Passos**
1. Placar acumulado da sessão: vitórias de X, de O e empates, com botão de zerar.
2. Antes de começar: escolher símbolo (X ou O) e quem começa; a partir da segunda partida, alterna quem começa.
3. Níveis contra o computador: **Fácil** (IA atual: vence se puder, bloqueia 65 % das vezes, senão aleatório), **Difícil** (minimax completo, nunca perde). Implementar `melhorJogadaMinimax(tabuleiro, jogador)` em `lib/logica.ts`.
4. Modo com amigo: nomes editáveis (padrão "Jogador 1" / "Jogador 2") usados nas mensagens.

**Critérios de aceite**
- [ ] No nível Difícil, 200 partidas contra um oponente aleatório terminam sem derrota da IA (teste na T19).
- [ ] Placar acumula corretamente entre partidas e zera sob comando.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T18. O nível Fácil deve continuar exatamente como hoje.
```

---

### T19 — Testes automatizados da lógica dos jogos

**Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Depende de:** T04, T07, T09, T14, T17, T18 (roda sobre o que existir)
**Arquivos:** `package.json` (raiz, novo), `vitest.config.ts` (novo), `tests/**`, módulos `lib/` e `jogo.js` dos jogos

**Passos**
1. Crie `package.json` na raiz com `vitest` como devDependency e script `"test": "vitest run"`. Configure `vitest.config.ts` com `include: ['tests/**/*.test.{js,ts}']`.
2. Toda lógica testada precisa estar fora do DOM: `Games/velha/lib/logica.ts`, `Games/memoria/lib/logica.ts`, `Games/forca/jogo.js`, `Games/matematica/jogo.js`, `Games/m-ou-n/jogo.js`, `shared/texto.js`, `shared/progresso.js` (com `localStorage` injetável).
3. Testes mínimos:
   - `texto.normalizar('Coração') === 'CORACAO'`; `embaralhar` mantém os elementos; distribuição razoável em 10 000 embaralhamentos de 3 itens (cada permutação entre 12 % e 21 %).
   - `m-ou-n.gerarLacuna` funciona para **todas** as palavras da lista e devolve a letra certa nos casos `MEMBRO`, `NUNCA`, `CAMPO`.
   - `matematica.gerarQuestao` respeita faixas por nível em 1000 amostras; nunca negativo.
   - `forca`: revelação insensível a acento; vitória detectada; `Ç` revelado com `C`.
   - `velha`: `checkWinner` para as 8 linhas; `findBestMove` sempre vence quando possível; minimax nunca perde em 200 partidas contra aleatório.
   - `memoria.gerarCartas(n, tema)` gera `n/2` pares distintos.
   - `progresso`: estrelas 3/2/1 nas faixas corretas; `zerarProgresso` limpa.
4. Adicione `npm test` ao README.

**Critérios de aceite**
- [ ] `npm test` verde na raiz em menos de 30 s.
- [ ] Nenhum teste depende de navegador ou de rede.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T19. Se alguma lógica ainda estiver acoplada ao DOM,
extraia-a para um módulo puro antes de testar, sem mudar o comportamento.
```

---

### T20 — Publicação automática no Netlify com build (`dist/` fora do git)

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Opus · **Depende de:** T08, T10
**Arquivos:** `build-all.sh` (novo), `netlify.toml` (novo), `_headers` (novo), `_redirects` (da T08), `.gitignore`, `index.html`, `README.md`

**Contexto**
- O site já está no Netlify (projeto `jogosdaelis`, https://jogosdaelis.netlify.app/), publicado a partir do GitHub sem comando de build e com a raiz do repositório como pasta de publicação (confirmado no painel: *Build command* e *Publish directory* não definidos, *Base directory* `/`, *auto publishing* ligado, publicado em `main@5f482ec`). Consequências: o `dist/` dos jogos React precisa ser commitado a cada alteração (commits enormes, conflitos) e todo o código-fonte vai ao ar junto.
- Não é preciso trocar de provedor. O plano gratuito do Netlify tem minutos de build de sobra para este projeto (um build leva cerca de um minuto), serve HTTPS (necessário para a T21) e cria uma URL de *deploy preview* para cada pull request, o que permite testar cada tarefa antes de mesclar em `main`.
- A solução é ensinar o Netlify a rodar `build-all.sh` e publicar só a pasta `_site/`.

**Passos**
1. Crie `build-all.sh` na raiz:
   ```bash
   #!/usr/bin/env bash
   set -euo pipefail
   RAIZ="$(cd "$(dirname "$0")" && pwd)"
   SAIDA="$RAIZ/_site"
   rm -rf "$SAIDA"; mkdir -p "$SAIDA/Games"
   cp "$RAIZ/index.html" "$SAIDA/"
   for f in configuracoes.html _redirects _headers manifest.webmanifest sw.js; do
     [ -f "$RAIZ/$f" ] && cp "$RAIZ/$f" "$SAIDA/"
   done
   cp -R "$RAIZ/shared" "$SAIDA/shared"
   for pasta in "$RAIZ"/Games/*/; do
     nome="$(basename "$pasta")"
     if [ -f "$pasta/package.json" ]; then
       (cd "$pasta" && npm ci && npm run build)
       mkdir -p "$SAIDA/Games/$nome" && cp -R "$pasta/dist/." "$SAIDA/Games/$nome/"
     else
       mkdir -p "$SAIDA/Games/$nome" && cp -R "$pasta/." "$SAIDA/Games/$nome/"
     fi
   done
   echo "Site gerado em $SAIDA"
   ```
   Com isso os jogos React ficam publicados em `/Games/memoria/` e `/Games/velha/` (sem `dist/` na URL) e nenhum arquivo-fonte vai ao ar. Atualize os links da página inicial para `Games/<slug>/` (o Netlify serve o `index.html` da pasta). Para testar localmente: `bash build-all.sh && npx serve _site`.
2. Crie `netlify.toml` na raiz (tem precedência sobre as configurações do painel):
   ```toml
   [build]
     command = "npm ci && npm test && bash build-all.sh"
     publish = "_site"

   [build.environment]
     NODE_VERSION = "22"
   ```
   Se a T19 ainda não existir (sem `package.json` na raiz), use `command = "bash build-all.sh"` e acrescente `npm ci && npm test &&` quando os testes chegarem. Com os testes no comando, um teste quebrado impede a publicação.
3. Crie `_headers` na raiz: cache longo para os arquivos com hash gerados pelo Vite e revalidação sempre para o service worker da T21:
   ```
   /Games/*/assets/*
     Cache-Control: public, max-age=31536000, immutable
   /sw.js
     Cache-Control: no-cache
   ```
4. No painel do Netlify (Diego, não o modelo):
   - *Continuous deployment* já está confirmado (repositório `Diego-Rebello/Site-JogosElis`, branch de produção `main`, *auto publishing* ligado): nada a alterar. Como *Build command* e *Publish directory* estão vazios no painel, o `netlify.toml` do repositório passa a valer sem conflito; depois do primeiro deploy, conferir em *Build settings* que o painel mostra o comando e a pasta `_site` vindos do arquivo.
   - Opcional: *Deploy log visibility* está como *Logs are public*; mudar para privado se não quiser que os logs de build (saída de `npm ci` e `npm test`) fiquem acessíveis por link. *Functions directory* (`netlify/functions`) é o padrão e não é usado.
   - *Site configuration → Build & deploy → Post processing*: se existir a opção *Pretty URLs* (ou *Asset optimization*), desative. Assim o que foi testado localmente é exatamente o que vai ao ar; as pastas com `index.html` continuam acessíveis como `/Games/forca/` e o `_redirects` da T08 cuida dos caminhos antigos.
5. Abra um pull request de teste e use a URL de preview que o Netlify comenta no PR para conferir todos os jogos antes de mesclar.
6. Depois do primeiro deploy bem-sucedido a partir de `_site/`: remova o `dist/` do git (`git rm -r --cached Games/*/dist`), adicione `Games/*/dist/` e `_site/` ao `.gitignore`, atualize a regra 4 da seção 0.2 e o item do checklist da seção 5 deste documento.
7. README: documentar o fluxo (branch → PR → preview do Netlify → merge em `main` → publicação automática) e o comando de build local.

**Critérios de aceite**
- [ ] `bash build-all.sh` local gera `_site/` e todos os jogos abrem via `npx serve _site`.
- [ ] Push em `main` publica em https://jogosdaelis.netlify.app/ sem intervenção manual; o log de build no Netlify mostra os testes rodando.
- [ ] `git ls-files | grep dist/` vazio.
- [ ] `https://jogosdaelis.netlify.app/Games/memoria/App.tsx` e `/Games/memoria/package.json` respondem 404.
- [ ] Caminhos antigos, como `/games/jogo%20da%20forca/forca`, redirecionam para os novos.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T20. O provedor é o Netlify e continua sendo; não crie workflow
de GitHub Pages. Entregue build-all.sh, netlify.toml, _headers e as alterações de links. Não tente
alterar o painel do Netlify: descreva no resumo o que o Diego precisa conferir lá.
```

---

### T21 — PWA: funcionar offline e instalar na tela inicial do tablet

**Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Depende de:** T11, T20
**Arquivos:** `manifest.webmanifest`, `sw.js`, `shared/pwa.js`, ícones em `shared/icones/`, `build-all.sh`

**Passos**
1. `manifest.webmanifest`: `name` "Jogos da Elis", `short_name` "Elis", `start_url` "./", `display` "standalone", `background_color`/`theme_color` no rosa dos tokens, ícones 192 e 512 px em PNG. Sugestão: usar um desenho da Elis como ícone (Diego fornece a imagem); enquanto isso, gerar um PNG a partir de um SVG com emoji.
2. `sw.js`: precache de todos os arquivos de `_site/` (lista gerada pelo `build-all.sh` e gravada no `sw.js` junto com um número de versão, por exemplo o SHA do commit, disponível no Netlify como `$COMMIT_REF`); para cada `index.html`, incluir também a URL da pasta (`/Games/forca/`), que é como o Netlify serve; estratégia cache-first para arquivos do site e network-first para as páginas HTML; ao ativar uma nova versão, apagar caches antigos. O Netlify já responde com `must-revalidate` e o `_headers` da T20 força `no-cache` no `sw.js`, então o navegador percebe versões novas na abertura seguinte.
3. `shared/pwa.js`: registra o service worker (só em HTTPS ou `localhost`) e é incluído em todas as páginas. Adicionar `<link rel="manifest">` e `<meta name="theme-color">` em todas as páginas.
4. Testar: Lighthouse marca "instalável"; ativar modo avião e abrir dois jogos.

**Critérios de aceite**
- [ ] Site instalável no Android e "Adicionar à Tela de Início" no iPad funcionam.
- [ ] Com o dispositivo offline, todos os jogos abrem e rodam.
- [ ] Um novo deploy é percebido na próxima abertura (versão do cache trocada).

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T21. Nada de bibliotecas de PWA; service worker escrito à mão
e comentado. Documente como forçar a atualização do cache durante o desenvolvimento.
```

---

### T22 — Acessibilidade, SEO básico e polimento

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T10
**Arquivos:** todas as páginas, `shared/base.css`

**Passos**
1. Em todas as páginas: `<meta name="description">`, favicon (SVG com emoji em data URI ou PNG da T21), `<meta property="og:title">`/`og:description`, `lang="pt-BR"`.
2. Áreas de feedback (`#feedback`, `#mensagem`, status do jogo da velha) com `aria-live="polite"`; botões só com emoji recebem `aria-label`.
3. Contraste: o texto rosa `#ff69b4` sobre branco fica abaixo de 3:1. Definir `--cor-texto-destaque` mais escuro (por exemplo `#c2185b`) para textos, mantendo o rosa claro em fundos e bordas. Validar com o Lighthouse.
4. `:focus-visible` visível em todos os botões; navegação por Tab funciona nos jogos de teclado.
5. Fontes grandes: mínimo 18 px no corpo dos jogos; alvos de toque ≥ 44 px (auditar com DevTools).

**Critérios de aceite**
- [ ] Lighthouse Acessibilidade ≥ 95 e Boas práticas ≥ 95 em todas as páginas.
- [ ] Leitor de tela anuncia acerto/erro.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T22. Rode o Lighthouse antes e depois e inclua as notas no resumo.
```

---

### T23 — (Opcional) Unificar tudo em um único projeto Vite multipágina

**Prioridade:** Baixa · **Esforço:** G · **Modelo:** Opus · **Depende de:** T19, T20

**Contexto**
- Hoje há dois `package.json` (um por jogo React) e três jogos em HTML solto. Um único projeto Vite com várias entradas (`build.rollupOptions.input`) daria um só `npm install`, um só `npm run build`, Tailwind e testes compartilhados, e os jogos em HTML puro também passariam pelo bundler (minificação, hash de cache).

**Passos**
1. Mover `package.json`, `vite.config.ts`, `tsconfig.json` para a raiz; `input` com `index.html`, `configuracoes.html` e `Games/*/index.html`.
2. Jogos React viram subpastas com `index.html` + `main.tsx`; `base: './'` mantido.
3. `build-all.sh` vira apenas `npm run build` (saída em `dist/` com a mesma estrutura de pastas).
4. Atualizar workflow, README e este documento.

**Critérios de aceite**
- [ ] Um único `npm run build` gera o site completo.
- [ ] Todos os testes e o deploy continuam funcionando.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T23 em uma branch separada. Não mescle sem aprovação do Diego;
entregue um resumo comparando o processo antes e depois.
```

---

## 3. Sugestões de novos jogos

### 3.0 Padrão para todo jogo novo

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

**Faixa etária de referência:** Elis tem **9 anos** (4.º ano). Todo jogo novo abre por padrão no nível intermediário e precisa ter um nível **Desafio**; os níveis iniciais ficam como revisão rápida. Evitar conteúdo de alfabetização básica (sílabas simples, contagem até 10) como foco principal.

**Prompt base para qualquer jogo novo**
```
Abra MELHORIAS.md, leia a seção 3.0 e implemente o jogo <ID> exatamente como especificado.
Use a estrutura de pastas e os módulos de shared/. Entregue também o teste da lógica e o cartão
na página inicial. No resumo, liste os dados criados e como foram revisados.
```

---

### J01 — Ortografia Divertida (evolução do "M ou N")

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Opus · **Objetivo pedagógico:** regras ortográficas mais comuns do 2.º ao 4.º ano

**Mecânica**
- A palavra aparece com uma lacuna e 2 ou 3 botões grandes com as opções (`M`/`N`, `R`/`RR`, `S`/`SS`, `G`/`J`, `X`/`CH`, `Ç`/`SS`/`S`, `L`/`U`). A criança toca na opção; feedback imediato com a regra em uma frase.
- Ao errar, a palavra certa aparece com a letra destacada e a criança toca em "Entendi" para seguir.

**Níveis:** 1 = M/N (reaproveita a lista da T04) · 2 = R/RR e S/SS · 3 = G/J e X/CH · 4 = Ç/SS/S e L/U · Misturado.

**Dados** (`dados.js`, mínimo 30 palavras por pacote, revisadas):
```js
export const pacotes = {
  'm-n':  { regra: 'Antes de P e B usamos M.', opcoes: ['M','N'],
            itens: [{ texto: 'CA_PO', resposta: 'M', palavra: 'CAMPO' }, ...] },
  'r-rr': { regra: 'Entre duas vogais, o som forte do R se escreve RR.', opcoes: ['R','RR'],
            itens: [{ texto: 'CA_O', resposta: 'RR', palavra: 'CARRO' }, ...] },
  ...
};
```

**Passos**
1. Motor genérico que recebe um pacote e roda a rodada de 10 itens sem repetição.
2. Tela de níveis com o nome da regra e uma frase de exemplo.
3. Registrar progresso por pacote (`jogoId` = `ortografia:<pacote>`).
4. Manter o jogo "M ou N" atual como atalho para o pacote 1 ou substituí-lo por este (decisão do Diego).

**Critérios de aceite**
- [ ] Cada item tem exatamente uma resposta correta entre as opções e a palavra final coincide com `texto` preenchido.
- [ ] Teste automatizado valida essa coerência para todos os itens.

---

### J02 — Tabuada Relâmpago

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** multiplicação (e divisão como inverso)

**Mecânica**
- Escolher a tabuada (2 a 10) ou "Todas"; modo **Treino** (sem tempo, 3 opções de resposta) e modo **Relâmpago** (60 segundos, digitar, quantas acertar).
- Apoio visual no Treino: grade de pontos `3 × 4` desenhada com emojis pequenos.
- Divisão como nível extra: "12 ÷ 3 = ?" com a mesma grade.

**Dados:** gerados por função `gerarQuestao(tabuada, modo)`; evitar repetir a última questão; no "Todas", sortear tabuada com peso maior para as que a criança mais errou (guardar erros por fato em `localStorage`).

**Critérios de aceite**
- [ ] Recorde do modo Relâmpago salvo por tabuada.
- [ ] Teste: 1000 questões geradas estão dentro da tabuada escolhida.

---

### J03 — Ditado Mágico (voz do navegador)

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Objetivo pedagógico:** escrita a partir da escuta, sem precisar de um adulto ditando

**Mecânica**
- O navegador lê a palavra em voz alta com `speechSynthesis` (`lang = 'pt-BR'`); a criança digita; botão "🔈 Ouvir de novo" e "💡 Dica" (mostra o emoji da palavra e a primeira letra).
- Comparação com `normalizar`; ao acertar mostra a palavra com acentos; ao errar mostra lado a lado o que foi digitado e o certo, com as letras diferentes destacadas.
- Frase de contexto opcional ("A **girafa** tem o pescoço comprido.") lida depois da palavra.

**Níveis:** 1 = palavras de 3–4 letras e emoji visível · 2 = 5–7 letras · 3 = 8+ letras e dígrafos (LH, NH, CH, RR, SS) · 4 = frases curtas. Nível padrão: 3.

**Dados:** `dados.js` com `{ palavra: 'GIRAFA', emoji: '🦒', frase: 'A girafa tem o pescoço comprido.', nivel: 2 }`, mínimo 40 por nível.

**Cuidados técnicos**
- No iOS a fala só começa depois de um toque; o botão "Ouvir" cobre isso.
- Se não houver voz pt-BR (`speechSynthesis.getVoices()`), avisar e cair no modo "emoji + primeira letra".

**Critérios de aceite**
- [ ] Funciona no Chrome Android e no Safari iOS com voz em português.
- [ ] Diferença entre digitado e correto destacada letra a letra.

---

### J04 — Caça-Palavras

**Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Objetivo pedagógico:** reconhecimento visual de palavras e atenção

**Mecânica**
- Grade de letras; lista de palavras ao lado (com emoji); a criança arrasta o dedo (ou clica na primeira e na última letra) para marcar; palavra encontrada fica colorida e riscada na lista.
- Temas: Animais, Frutas, Escola, Cores, Corpo, Casa (8 palavras por tema por partida; listas com acentos removidos apenas na grade, mas a lista lateral mostra a grafia correta).

**Níveis:** Fácil 8×8 horizontal e vertical · Médio 10×10 com diagonais · Difícil 12×12 com palavras invertidas.

**Passos**
1. `jogo.js`: `gerarGrade(palavras, tamanho, opcoes)` com colocação por tentativa e preenchimento aleatório; garantir que toda palavra caiba (retentar até 50 vezes; reduzir lista se falhar).
2. `tela.js`: seleção por `pointerdown`/`pointermove`/`pointerup` restrita a linhas retas; sem `touch-action` padrão para não rolar a página durante a seleção.
3. Cronômetro e estrelas por tempo.

**Critérios de aceite**
- [ ] Teste: em 200 grades geradas, todas as palavras estão presentes e localizáveis.
- [ ] Seleção por toque funciona em tablet sem rolar a página.

---

### J05 — Forme a Palavra (sílabas)

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** consciência silábica e ordem das sílabas. Para 9 anos, só faz sentido com palavras longas (4+ sílabas), sílabas intrusas e cronômetro; os níveis 1 e 2 são revisão.

**Mecânica**
- Emoji grande + sílabas embaralhadas em peças; tocar as peças na ordem monta a palavra na linha de cima; tocar em uma peça colocada devolve ela. Confere automaticamente ao completar.
- Nível 1: 2 sílabas · Nível 2: 3 sílabas · Nível 3: 4+ sílabas e uma sílaba "intrusa".

**Dados:** `{ palavra: 'BANANA', silabas: ['BA','NA','NA'], emoji: '🍌' }`, mínimo 60 palavras revisadas (a divisão silábica deve seguir a norma do português).

**Critérios de aceite**
- [ ] Teste: `silabas.join('') === palavra` para todos os itens.
- [ ] Peças com 56 px de altura no mínimo (fáceis de tocar).

---

### J06 — Que Horas São?

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Objetivo pedagógico:** leitura de relógio analógico

**Mecânica**
- Relógio analógico em SVG (ponteiros de hora e minuto, números 1–12).
- Modo **Leia**: o relógio mostra uma hora; a criança escolhe entre 4 horários digitais.
- Modo **Ajuste**: aparece um horário digital; a criança gira os ponteiros com botões `+5 min`, `−5 min`, `+1 h`, `−1 h` (ou arrastando) até coincidir.

**Níveis:** hora cheia · meia hora · quartos de hora · de 5 em 5 minutos · minuto a minuto (Desafio). Nível padrão: de 5 em 5 minutos.

**Critérios de aceite**
- [ ] Os distratores no modo Leia são plausíveis (trocar hora e minuto, ±30 min).
- [ ] Teste: conversão hora↔ângulo dos ponteiros para 0 a 23 h e 0 a 59 min.

---

### J07 — Genius das Cores (sequência)

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** memória de trabalho e atenção

**Mecânica**
- 4 botões coloridos grandes, cada um com uma nota (Web Audio, tons diferentes); o jogo toca uma sequência que cresce a cada rodada; a criança repete.
- Modo **Calmo** (sem limite de tempo, velocidade fixa) e modo **Rápido** (acelera).
- Recorde salvo; estrelas por tamanho da sequência (5 / 8 / 12).

**Critérios de aceite**
- [ ] Sequência reproduzível pelo teste (gerador com semente injetável).
- [ ] Funciona no iOS (áudio após o primeiro toque).

---

### J08 — Sudoku de Emojis

**Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Objetivo pedagógico:** lógica e dedução

**Mecânica**
- Tabuleiro 4×4 (revisão, 4 emojis), 6×6 (padrão, 6 emojis; blocos 2×3) ou 9×9 (Desafio, com números). Tocar na célula abre a paleta de emojis; conflitos ficam com borda vermelha suave; botão "Dica" preenche uma célula.
- Vitória com confete; cronômetro; estrelas por dicas usadas.

**Passos**
1. `jogo.js`: gerador por backtracking de uma solução completa + remoção de células garantindo solução única (verificar com um resolvedor); dificuldade = número de células removidas.
2. `tela.js`: grade responsiva com `aspect-ratio: 1`, células ≥ 48 px no 6×6 em 360 px de largura (usar a largura total da tela).

**Critérios de aceite**
- [ ] Teste: 100 tabuleiros gerados têm solução única.
- [ ] 6×6 cabe em 360 px sem rolagem horizontal.

---

### J09 — Dinheirinho (compras e troco)

**Prioridade:** Baixa · **Esforço:** M · **Modelo:** Sonnet · **Objetivo pedagógico:** valores monetários e decimais

**Mecânica**
- Vitrine com um item e preço (ex.: "🧸 R$ 7,50"); a criança toca em moedas (0,05 · 0,10 · 0,25 · 0,50 · 1,00) e notas (2 · 5 · 10 · 20 · 50) para formar o valor exato; contador mostra quanto já juntou.
- Nível 1: valores inteiros até 10 · Nível 2: com centavos até 20 · Nível 3: "dar o troco" (o cliente pagou X, quanto volta?).
- Moedas e notas desenhadas em CSS/SVG simples com o valor escrito (não usar imagens do dinheiro real).

**Critérios de aceite**
- [ ] Soma em centavos (inteiros) para evitar erro de ponto flutuante; teste cobre isso.

---

### J10 — Quiz Sabe-Tudo

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** conhecimentos gerais (ciências, animais, Brasil, corpo humano, planetas)

**Mecânica**
- 10 perguntas de múltipla escolha (4 opções, emojis quando fizer sentido), explicação curta após responder, placar e estrelas.
- Categorias com pelo menos 25 perguntas cada em `dados.js`; sortear 10 sem repetir.

**Critérios de aceite**
- [ ] O modelo revisa cada fato antes de entregar e marca no resumo qualquer pergunta sobre a qual tenha dúvida.
- [ ] Teste: toda pergunta tem exatamente uma resposta correta e 4 opções distintas.

---

### J11 — Memória de Contas (variação do Jogo da Memória)

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T17 · **Objetivo pedagógico:** cálculo mental

**Mecânica**
- No Jogo da Memória, novo "tema" em que cada par é uma conta e seu resultado (`3 + 4` ↔ `7`, `2 × 5` ↔ `10`). Generalizar `CardData` para `{ face: string; chavePar: string }`.
- Tela inicial: escolher "Emojis" ou "Contas (soma / multiplicação)".

**Critérios de aceite**
- [ ] Nenhum resultado repetido no mesmo tabuleiro (para não haver dois pares com a mesma resposta).
- [ ] Teste de geração cobre isso.

---

### J12 — Quebra-Cabeça Deslizante

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** raciocínio espacial e planejamento

**Mecânica**
- Grade 3×3 (8 peças) ou 4×4 (15 peças); tocar em uma peça vizinha do espaço vazio a desliza; contador de movimentos e cronômetro.
- Imagem: um emoji grande desenhado em `canvas` e fatiado nas peças, ou números coloridos (modo simples).
- Embaralhar apenas por movimentos válidos a partir do estado resolvido (garante que tem solução).

**Critérios de aceite**
- [ ] Teste: 100 embaralhamentos são solucionáveis (paridade correta).
- [ ] Peças ≥ 80 px no 4×4 em 360 px de largura.

---

### 3.1 Outras ideias, em uma linha cada (para depois)

- **Labirinto** gerado aleatoriamente com controle por setas na tela.
- **Pintar por Números** em `canvas` com paleta grande.
- **Rimas**: qual palavra rima com a figura?
- **Qual é o Intruso?**: 4 emojis, um de categoria diferente.
- **Plural e Singular**: toque na forma certa.
- **Sequência Lógica**: qual figura vem depois?
- **Mapa do Brasil**: toque no estado pedido (SVG).
- **Contar Sílabas**: bata palmas (toques) no número certo.
- **Palavras Cruzadas** infantis com emojis como pistas.
- **Frações na Pizza**: montar e comparar frações com fatias.
- **Problemas em Texto**: enunciados curtos de matemática para interpretar (troco, tempo, distância).
- **Divisão com Resto** e múltiplos/divisores.

---

## 4. Matriz de priorização

| ID | Tarefa | Prioridade | Esforço | Modelo | Depende de |
|---|---|---|---|---|---|
| T01 | Higiene do repositório | Alta | P | Sonnet | — |
| T02 | Sincronizar git e dependências | Alta | P | Sonnet | T01 |
| T03 | Remover template AI Studio, TypeScript strict | Alta | P | Sonnet | T02 |
| T04 | M ou N: palavras e lacuna | Alta | P | Sonnet | — |
| T05 | Forca: viewport, acentos, Ç | Alta | P | Sonnet | — |
| T06 | Memória: HTML, 404, grade, timeouts | Alta | M | Sonnet | T03 |
| T07 | Velha: index.html, keyframes, refatoração | Alta | P | Sonnet | T03 |
| T08 | Renomear pastas | Média | P | Sonnet | T01, T04–T07 |
| T09 | Biblioteca `shared/` | Alta | M | Opus | T08 |
| T10 | Aplicar cabeçalho e visual | Alta | M | Sonnet | T09 |
| T11 | Tirar Tailwind CDN e Font Awesome | Média | M | Sonnet | T10 |
| T12 | Sons e confete | Média | P | Sonnet | T09, T10 |
| T13 | Progresso e Mural | Média | M | Sonnet | T09, T10 |
| T14 | Matemática com níveis | Alta | M | Sonnet | T10 |
| T15 | M ou N: modo toque | Média | P | Sonnet | T04, T10 |
| T16 | Forca: temas e dicas | Média | P | Sonnet | T05, T10 |
| T17 | Memória: 1 jogador e temas | Média | M | Sonnet | T06, T10 |
| T18 | Velha: placar, níveis, minimax | Média | M | Sonnet | T07, T10 |
| T19 | Testes automatizados | Média | M | Opus | várias |
| T20 | Publicação automática no Netlify com build | Alta | M | Opus | T08, T10 |
| T21 | PWA offline | Média | M | Opus | T11, T20 |
| T22 | Acessibilidade e SEO | Média | P | Sonnet | T10 |
| T23 | Projeto Vite único (opcional) | Baixa | G | Opus | T19, T20 |
| J01 | Ortografia Divertida | Alta | M | Opus | T09, T04 |
| J02 | Tabuada Relâmpago | Alta | P | Sonnet | T09 |
| J03 | Ditado Mágico | Alta | M | Sonnet | T09 |
| J04 | Caça-Palavras | Média | M | Opus | T09 |
| J05 | Forme a Palavra | Baixa | P | Sonnet | T09 |
| J06 | Que Horas São? | Média | M | Sonnet | T09 |
| J07 | Genius das Cores | Média | P | Sonnet | T09 |
| J08 | Sudoku de Emojis | Média | M | Opus | T09 |
| J09 | Dinheirinho | Baixa | M | Sonnet | T09 |
| J10 | Quiz Sabe-Tudo | Baixa | P | Sonnet | T09 |
| J11 | Memória de Contas | Baixa | P | Sonnet | T17 |
| J12 | Quebra-Cabeça Deslizante | Baixa | P | Sonnet | T09 |

**Caminho mínimo recomendado para a primeira semana:** T01 → T02 → T03 → T04 → T05 → T06 → T07 (tudo pequeno, elimina todos os bugs conhecidos). Depois T08 → T09 → T10 → T20, que destravam o resto.

---

## 5. Checklist de aceite comum (aplicar em toda tarefa)

- [ ] Funciona em 360 px, 768 px e 1280 px sem rolagem horizontal.
- [ ] Toque, teclado e mouse funcionam.
- [ ] Console sem erros; aba Network sem 404.
- [ ] Textos em pt-BR com acentuação correta.
- [ ] Nada de `node_modules`, `.env.local`, `.DS_Store` no commit.
- [ ] Jogos React: `npm run typecheck`, `npm run build` (e `dist/` commitado até a T20).
- [ ] Resumo final com: o que mudou, como foi testado, pendências.
