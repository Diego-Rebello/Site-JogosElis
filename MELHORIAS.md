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
> **Andamento:** T01 a T23 e J01 concluídas em 2026-09-06; J02 e J04 a J10 em 2026-09-07;
> P00, P02 e P03 em 2026-09-07. Faltam **J03** (Ditado Mágico), **J11** a **J14**,
> **P01**, **P04** a **P13**.
> O estado atual do repositório está na seção [0.4](#04-progresso); a seção 1 é o diagnóstico
> original, de antes da execução, e foi mantida para registrar o motivo de cada tarefa.
>
> **Planejamento ampliado em 2026-09-07:** Labirinto e Rimas detalhados na seção 3.1;
> nova etapa de pré-alfabetização para um menino de 5 anos na seção 6 (revisada para essa idade
> no mesmo dia). **P00, P02 e P03 implementadas em 2026-09-07**: os Jogos do Rael estão no ar
> com três brincadeiras. As demais tarefas da seção 6 continuam pendentes.

---

## 0. Como usar este documento

### 0.1 Convenções

| Campo | Significado |
|---|---|
| **Prioridade** | Alta = corrige bug ou destrava outras tarefas · Média = melhora clara · Baixa = desejável |
| **Esforço** | P = até ~1 h de trabalho do modelo · M = 1 a 3 h · G = meio dia ou mais |
| **Modelo** | Sonnet para tarefas mecânicas e bem delimitadas · Opus para arquitetura, geradores e refatorações amplas |
| **Depende de** | Tarefas que precisam estar prontas antes |
| **IDs** | `T` = melhoria técnica · `J` = jogo novo · `P` = tarefa da etapa de pré-alfabetização (seção 6) |

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
4. O site é publicado pelo Netlify (projeto `jogosdaelis`) a partir da branch `main`. O arquivo
   `netlify.toml` roda os testes e o `build-all.sh`, publicando somente `_site/`. As pastas `dist/`
   dos jogos React são geradas durante o build e não devem ser commitadas.
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

Todas as tarefas de T01 a T23 concluídas, nove jogos novos no ar (J01, J02 e J04 a J10) e a
P00 entregue: os **Jogos do Rael** existem, com a primeira brincadeira falada.
Tudo testado no navegador (Chrome headless) antes de cada commit.

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

**Inventário atual** (substitui o caminho da tabela 1.1):

| Jogo | Caminho | Tecnologia |
|---|---|---|
| Página inicial | `index.html` | HTML/CSS puro + `shared/base.css`, ícones em emoji |
| Biblioteca comum | `shared/` | CSS + módulos ES próprios, sem dependência externa |
| Jogo da Forca | `Games/forca/index.html` | HTML puro + `shared/`, script `type="module"` |
| Matemática | `Games/matematica/` | HTML puro + módulo de lógica testável, `shared/` |
| Jogo do M ou N | `Games/m-ou-n/index.html` | HTML puro + `shared/`, script `type="module"` |
| Ortografia Divertida | `Games/ortografia/` | HTML puro + `dados.js`/`jogo.js`/`tela.js`, `shared/` |
| Jogo da Memória | `Games/memoria/` (compilado para `_site/Games/memoria/`) | React 19.2 + Vite 6.4 + Tailwind 4 compilado |
| Jogo da Velha | `Games/velha/` (compilado para `_site/Games/velha/`) | React 19.2 + Vite 6.4 + Tailwind 4 compilado |
| **Jogos do Rael** — casa | `rael/index.html` | HTML puro + `shared/`, tema `tema-rael.css` |
| Jogos do Rael — Toque na Figura | `rael/toque-na-figura/` | HTML puro + `tela.js`, usa `fala.js` e `rodada.js` |
| Jogos do Rael — Encaixe as Figuras | `rael/encaixe-as-figuras/` | HTML puro + `dados.js`/`jogo.js`/`tela.js` |
| Jogos do Rael — Palmas nas Palavras | `rael/palmas-nas-palavras/` | HTML puro + `dados.js`/`jogo.js`/`tela.js` |
| Jogos do Rael — configurações | `rael/configuracoes.html` | HTML puro + `shared/descobertas.js` |

**O site não faz mais nenhuma requisição externa.** Fontes, ícones e CSS são todos locais.

**Decisões tomadas durante a execução, que valem para as próximas tarefas:**

- Os scripts npm dos dois jogos React chamam o binário local pelo caminho
  (`node ./node_modules/vite/bin/vite.js build`) por causa do ":" no caminho do projeto — ver a
  regra 10 da seção 0.2. Existe também o script `npm run typecheck`.
- Desde a T20, `build-all.sh` compila os jogos React diretamente para seus caminhos públicos em
  `_site/Games/`; `dist/` e `_site/` ficam fora do git. O `_redirects` preserva também os endereços
  antigos que continham `/dist/`.
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
  explícitos. Sem isso o Tailwind 4 varreria também o `dist/` gerado e realimentaria classes
  velhas a cada build.
- O componente `Cabecalho` está duplicado nos dois projetos React, de propósito: pôr um `.tsx` em
  `shared/` obrigaria a pasta a depender do React, o que a T09 proíbe. A T23 resolve isso se e
  quando os projetos forem unificados.
- As rodadas de **10 questões** da Matemática e de **10 palavras** do M ou N agora têm telas,
  modos e regras pedagógicas definitivas (T14 e T15).
- O recorde da Memória é separado por quantidade de cartas e usa a chave
  `jogos-elis:memoria:recorde:<n>`; primeiro compara jogadas e, em empate, o menor tempo.
- No Jogo da Velha, vitória do computador toca o som de erro e **não** lança confete: festa só
  quando quem ganha é a criança.
- O Jogo da Velha mantém a IA original no nível Fácil e usa minimax no Difícil. Símbolo, primeiro
  jogador e nomes são escolhidos antes da partida; o início alterna nas partidas seguintes.
- A suíte Vitest da raiz chama o binário por caminho explícito, assim como os scripts dos jogos,
  por causa do `:` no caminho local. São 28 testes puros em 7 arquivos e nenhum usa rede ou DOM.

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

> ✅ **Concluída em 2026-09-06** — commit `157e101`. Ver seção 0.4.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T09, T10
**Arquivos:** `index.html`, `shared/progresso.js`, os 5 jogos, `configuracoes.html` (novo)

**Passos**
1. Cada jogo chama `registrarPartida` ao terminar uma rodada (define "rodada" por jogo: forca = uma palavra; matemática e m-ou-n = 10 questões; memória = um tabuleiro; velha = uma partida).
2. Página inicial: em cada cartão mostre as estrelas do melhor resultado (`⭐⭐⭐`) e "Jogou 12 vezes"; seção "Mural de Conquistas" com total de estrelas e jogo favorito.
3. `configuracoes.html` (para o adulto): nome da criança (usado nas mensagens: "Parabéns, Elis!"), nível padrão por jogo, mudo, botão "Zerar progresso" com confirmação. Link discreto no rodapé da página inicial.
4. Tudo em `localStorage`; sem servidor.

**Critérios de aceite**
- [x] Ao terminar uma rodada em qualquer jogo, a página inicial reflete as estrelas.
- [x] "Zerar progresso" limpa tudo após confirmação.
- [x] O nome configurado aparece nas mensagens de vitória.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T13. Garanta que a página inicial continua funcionando
quando o localStorage está vazio ou bloqueado (try/catch em toda leitura).
```

---

### T14 — Jogo de Somar vira "Matemática": níveis, subtração e rodadas de 10

> ✅ **Concluída em 2026-09-06** — commit `23a226a`.

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
- [x] 1000 chamadas de `gerarQuestao` por nível respeitam as faixas e nunca produzem negativo.
- [x] Rodada de 10 questões termina com tela final e registra estrelas.
- [x] `Enter` confere e avança sem usar o mouse.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T14. Mantenha o arquivo em HTML/JS puro, com a lógica em
um módulo `jogo.js` separado do DOM para facilitar os testes.
```

---

### T15 — Jogo do M ou N: modo toque, explicação da regra e rodadas

> ✅ **Concluída em 2026-09-06** — commit `23a226a`.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T04, T10
**Arquivos:** `Games/m-ou-n/index.html`

**Passos**
1. Tela inicial com dois modos: **Toque** (dois botões grandes `M` e `N`, ideal para tablet) e **Digite a palavra** (modo atual).
2. Cartão de regra antes de começar: "Antes de **P** e **B** usamos **M**. Antes das outras letras usamos **N**." Botão "Entendi!".
3. Rodada de 10 palavras sem repetição, barra de progresso, tela final com estrelas.
4. Ao errar: mostra a palavra correta com a letra em destaque e lembra a regra; não avança sozinho.
5. Ao acertar: mostra a palavra correta acentuada por 1 s e avança.

**Critérios de aceite**
- [x] Modo toque jogável só com o dedo; modo digitar continua funcionando com `Enter`.
- [x] Nenhuma palavra se repete na mesma rodada.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T15 sobre o resultado da T04.
```

---

### T16 — Jogo da Forca: escolha de tema, dica e placar

> ✅ **Concluída em 2026-09-06** — commit `23a226a`.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T05, T10
**Arquivos:** `Games/forca/index.html`

**Passos**
1. Tela inicial para escolher o tema (ou "Todos").
2. Botão "Dica 💡" liberado após o 3.º erro, mostrando uma frase curta por palavra (adicionar campo `dica` aos dados; escrever para todas as palavras).
3. Placar da sessão (vitórias/derrotas) e estrelas por palavra: 3 sem erro, 2 com até 2 erros, 1 com até 5.
4. Animação do emoji ao errar (`.tremer`) e confete ao vencer (T12).

**Critérios de aceite**
- [x] Todas as palavras têm `dica` preenchida e revisada.
- [x] Tema escolhido é respeitado na sequência de palavras.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T16. As dicas devem ser compreensíveis para uma criança
de 9 anos e não podem conter a própria palavra.
```

---

### T17 — Jogo da Memória: modo 1 jogador com jogadas, cronômetro, recorde e temas

> ✅ **Concluída em 2026-09-06** — commit `23a226a`.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T06, T10
**Arquivos:** `Games/memoria/App.tsx`, novos `lib/logica.ts`, `lib/temas.ts`

**Passos**
1. Temas de emojis selecionáveis na tela inicial: Animais, Comidas, Transportes, Esportes, Natureza, Mistura (mínimo 16 emojis distintos por tema, em `lib/temas.ts`).
2. Modo 1 jogador: contador de jogadas (par de viradas) e cronômetro; ao concluir, mostra jogadas, tempo e recorde por tamanho (`localStorage['jogos-elis:memoria:recorde:<n>']`); estrelas: 3 se jogadas ≤ 1,5 × pares, 2 se ≤ 2,5 ×, 1 caso contrário.
3. Modo 2+ jogadores continua como está, com o nome do jogador da vez em destaque e som ao encontrar par.
4. Mover `embaralhar`, `gerarCartas` e o cálculo de estrelas para `lib/logica.ts` (testes na T19).

**Critérios de aceite**
- [x] Recorde persiste após recarregar.
- [x] `gerarCartas(16, 'Animais')` produz 8 pares de emojis distintos do tema.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T17. Não altere a mecânica de virar cartas; só acrescente
o que a tarefa pede.
```

---

### T18 — Jogo da Velha: placar acumulado, escolha de símbolo, quem começa e níveis

> ✅ **Concluída em 2026-09-06** — commit `528b21d`.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** T07, T10
**Arquivos:** `Games/velha/App.tsx`, `lib/logica.ts`, componentes

**Passos**
1. Placar acumulado da sessão: vitórias de X, de O e empates, com botão de zerar.
2. Antes de começar: escolher símbolo (X ou O) e quem começa; a partir da segunda partida, alterna quem começa.
3. Níveis contra o computador: **Fácil** (IA atual: vence se puder, bloqueia 65 % das vezes, senão aleatório), **Difícil** (minimax completo, nunca perde). Implementar `melhorJogadaMinimax(tabuleiro, jogador)` em `lib/logica.ts`.
4. Modo com amigo: nomes editáveis (padrão "Jogador 1" / "Jogador 2") usados nas mensagens.

**Critérios de aceite**
- [x] No nível Difícil, 200 partidas contra um oponente aleatório terminam sem derrota da IA (teste na T19).
- [x] Placar acumula corretamente entre partidas e zera sob comando.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T18. O nível Fácil deve continuar exatamente como hoje.
```

---

### T19 — Testes automatizados da lógica dos jogos

> ✅ **Concluída em 2026-09-06** — commit `528b21d`. São 28 testes em 7 arquivos.

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
- [x] `npm test` verde na raiz em menos de 30 s.
- [x] Nenhum teste depende de navegador ou de rede.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T19. Se alguma lógica ainda estiver acoplada ao DOM,
extraia-a para um módulo puro antes de testar, sem mudar o comportamento.
```

---

### T20 — Publicação automática no Netlify com build (`dist/` fora do git)

> ✅ **Concluída em 2026-09-06** — implementação no commit `528b21d`; primeiro deploy do novo
> pipeline validado em produção no commit `326b4b1`.

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
- [x] `bash build-all.sh` local gera `_site/` e todos os jogos abrem via servidor local.
- [x] Push em `main` publica em https://jogosdaelis.netlify.app/ sem intervenção manual; testes executam antes do build.
- [x] `git ls-files | grep dist/` vazio.
- [x] `https://jogosdaelis.netlify.app/Games/memoria/App.tsx` e `/Games/memoria/package.json` respondem 404.
- [x] Caminhos antigos, como `/games/jogo%20da%20forca/forca`, redirecionam para os novos.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T20. O provedor é o Netlify e continua sendo; não crie workflow
de GitHub Pages. Entregue build-all.sh, netlify.toml, _headers e as alterações de links. Não tente
alterar o painel do Netlify: descreva no resumo o que o Diego precisa conferir lá.
```

---

### T21 — PWA: funcionar offline e instalar na tela inicial do tablet

> ✅ **Concluída em 2026-09-06** — branch `t21-pwa-offline`. Ver seção 0.4.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Depende de:** T11, T20
**Arquivos:** `manifest.webmanifest`, `sw.js`, `shared/pwa.js`, ícones em `shared/icones/`, `build-all.sh`

**Passos**
1. `manifest.webmanifest`: `name` "Jogos da Elis", `short_name` "Elis", `start_url` "./", `display` "standalone", `background_color`/`theme_color` no rosa dos tokens, ícones 192 e 512 px em PNG. Sugestão: usar um desenho da Elis como ícone (Diego fornece a imagem); enquanto isso, gerar um PNG a partir de um SVG com emoji.
2. `sw.js`: precache de todos os arquivos de `_site/` (lista gerada pelo `build-all.sh` e gravada no `sw.js` junto com um número de versão, por exemplo o SHA do commit, disponível no Netlify como `$COMMIT_REF`); para cada `index.html`, incluir também a URL da pasta (`/Games/forca/`), que é como o Netlify serve; estratégia cache-first para arquivos do site e network-first para as páginas HTML; ao ativar uma nova versão, apagar caches antigos. O Netlify já responde com `must-revalidate` e o `_headers` da T20 força `no-cache` no `sw.js`, então o navegador percebe versões novas na abertura seguinte.
3. `shared/pwa.js`: registra o service worker (só em HTTPS ou `localhost`) e é incluído em todas as páginas. Adicionar `<link rel="manifest">` e `<meta name="theme-color">` em todas as páginas.
4. Testar: Lighthouse marca "instalável"; ativar modo avião e abrir dois jogos.

**Critérios de aceite**
- [x] Site instalável: o Chrome lê o `manifest.webmanifest` **sem nenhum erro**, com
      `display: standalone`, ícones de 192 e 512 px e um service worker com handler de
      `fetch`. **Não testei nos aparelhos** (Android e iPad) por não ter acesso a eles.
- [x] Com o dispositivo offline, todos os jogos abrem e rodam. **Isto estava quebrado** e
      foi corrigido: ver "Respostas redirecionadas" na seção 0.4.
- [x] Um novo deploy é percebido na próxima abertura: o cache novo entra e o antigo é
      apagado, sobrando um só.

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T21. Nada de bibliotecas de PWA; service worker escrito à mão
e comentado. Documente como forçar a atualização do cache durante o desenvolvimento.
```

---

### T22 — Acessibilidade, SEO básico e polimento

> ✅ **Concluída em 2026-09-06** — branch `t22-acessibilidade`. Ver seção 0.4.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** T10
**Arquivos:** todas as páginas, `shared/base.css`

**Passos**
1. Em todas as páginas: `<meta name="description">`, favicon (SVG com emoji em data URI ou PNG da T21), `<meta property="og:title">`/`og:description`, `lang="pt-BR"`.
2. Áreas de feedback (`#feedback`, `#mensagem`, status do jogo da velha) com `aria-live="polite"`; botões só com emoji recebem `aria-label`.
3. Contraste: o texto rosa `#ff69b4` sobre branco fica abaixo de 3:1. Definir `--cor-texto-destaque` mais escuro (por exemplo `#c2185b`) para textos, mantendo o rosa claro em fundos e bordas. Validar com o Lighthouse.
4. `:focus-visible` visível em todos os botões; navegação por Tab funciona nos jogos de teclado.
5. Fontes grandes: mínimo 18 px no corpo dos jogos; alvos de toque ≥ 44 px (auditar com DevTools).

**Critérios de aceite**
- [x] Lighthouse Acessibilidade ≥ 95 e Boas práticas ≥ 95 em todas as páginas.
      **100/100 nas oito páginas**, nas duas categorias. Antes: acessibilidade 92 a 100
      (home 94, m-ou-n 92, memória 94, demo 92, matemática 95, forca 98, velha 100,
      configurações 100); boas práticas já era 100 em todas.
- [x] Leitor de tela anuncia acerto/erro. Forca, Matemática, M ou N e Configurações já
      tinham `aria-live`; a Velha anuncia pelo status. O **Jogo da Memória não tinha nada**
      (o retorno era só visual) e ganhou uma região `role="status"` que fala "Par
      encontrado: 🐶" ou "Não foi dessa vez".

**Prompt para o modelo**
```
Abra MELHORIAS.md e execute a tarefa T22. Rode o Lighthouse antes e depois e inclua as notas no resumo.
```

---

### T23 — (Opcional) Unificar tudo em um único projeto Vite multipágina

> ✅ **Concluída em 2026-09-06** — branch `t23-vite-unico`, **não mesclada**.
> Aguarda aprovação do Diego, como o prompt da própria tarefa pede.

**Prioridade:** Baixa · **Esforço:** G · **Modelo:** Opus · **Depende de:** T19, T20

**Contexto**
- Hoje há dois `package.json` (um por jogo React) e três jogos em HTML solto. Um único projeto Vite com várias entradas (`build.rollupOptions.input`) daria um só `npm install`, um só `npm run build`, Tailwind e testes compartilhados, e os jogos em HTML puro também passariam pelo bundler (minificação, hash de cache).

**Passos**
1. Mover `package.json`, `vite.config.ts`, `tsconfig.json` para a raiz; `input` com `index.html`, `configuracoes.html` e `Games/*/index.html`.
2. Jogos React viram subpastas com `index.html` + `main.tsx`; `base: './'` mantido.
3. `build-all.sh` vira apenas `npm run build` (saída em `dist/` com a mesma estrutura de pastas).
4. Atualizar workflow, README e este documento.

**Critérios de aceite**
- [x] Um único `npm run build` gera o site completo (`vite build` mais o gerador do
      service worker). O `build-all.sh` deixou de existir.
- [x] Todos os testes e o deploy continuam funcionando: 28 do Vitest, 19 de modo avião,
      13 de jogabilidade, 50 de acessibilidade e Lighthouse 100/100 nas oito páginas.
      **Foi preciso subir o Vite de 6.4.3 para 7.3.6**: com o Vite 6 na raiz, o
      `vite-node` do Vitest quebrava com `Cannot find module '/@vite/env'`. Na `main` o
      Vitest já usava Vite 7 por dependência transitiva; o problema só apareceu quando
      a versão passou a ser fixada no `package.json` único.

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

**Exceção — etapa de pré-alfabetização:** as tarefas `P00` a `P13` da seção 6 são voltadas a uma
criança de **5 anos** em pré-alfabetização. Nelas prevalecem as regras da seção 6.0: início no nível mais simples,
rodadas curtas, instruções faladas e nenhuma exigência de leitura, escrita ou cronômetro.
Isso também vale para os modos de Labirinto e Rimas abertos por essa etapa.

**Prompt base para qualquer jogo novo**
```
Abra MELHORIAS.md, leia a seção 3.0 e implemente o jogo <ID> exatamente como especificado.
Use a estrutura de pastas e os módulos de shared/. Entregue também o teste da lógica e o cartão
na página inicial. No resumo, liste os dados criados e como foram revisados.
```

---

### J01 — Ortografia Divertida (evolução do "M ou N")

> ✅ **Concluída em 2026-09-06** — commit na branch `j01-ortografia`. Ver as decisões no fim desta seção.

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
- [x] Cada item tem exatamente uma resposta correta entre as opções e a palavra final coincide com `texto` preenchido.
- [x] Teste automatizado valida essa coerência para todos os itens.

**Como ficou** (`Games/ortografia/`, 25 testes em `tests/ortografia.test.js`)

- **Sete pacotes, 418 itens**: `m-n` (164, reaproveitados da T04), `r-rr` (43), `s-ss` (41),
  `g-j` (41), `x-ch` (41), `c-ss-s` (47) e `l-u` (41). Mais o modo **Misturado**, que sorteia de
  todos. Mínimo pedido era 30 por pacote.
- **Decisão do passo 4 (Diego):** os dois jogos convivem. O "M ou N" continua no ar com o modo
  de digitar a palavra inteira, e o pacote 1 daqui importa `listaDePalavras` e `gerarLacuna` de
  `Games/m-ou-n/jogo.js` — assim as duas telas nunca discordam sobre onde fica a lacuna.
- **Toda palavra tem uma dica** (menos as do M/N, em que a letra seguinte já decide). Sem ela
  "CA_O" seria CARO ou CARRO: é a dica que garante o primeiro critério de aceite. Pares em que as
  duas opções dão palavras reais e a dica não resolveria bem (ALTO/AUTO, MEU/MEL, MAU/MAL,
  ASA/ASSA, ROSA/ROÇA) ficaram fora da lista.
- A lacuna é sempre **um `_` só**, mesmo quando a resposta tem duas letras: dois underscores
  entregariam que a resposta é RR, SS ou CH.
- **Progresso em duas chaves**: `ortografia:<pacote>` guarda o histórico de cada regra e
  `ortografia` é a chave que a página inicial e o Mural mostram no cartão do jogo.
- Nas Configurações dá para escolher qual regra abre marcada como "seu nível" (padrão: `g-j`,
  o nível 3, seguindo a regra de abrir no intermediário da seção 3.0).
- Testado no Chrome headless em 360 px: rodada inteira até a tela final, sem erro no console e
  sem rolagem horizontal.

---

### J02 — Tabuada Relâmpago

> ✅ **Concluída em 2026-09-06** — integrada diretamente na `main` junto com J04, J05 e J06.

**Prioridade:** Alta · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** multiplicação (e divisão como inverso)

**Mecânica**
- Escolher a tabuada (2 a 10) ou "Todas"; modo **Treino** (sem tempo, 3 opções de resposta) e modo **Relâmpago** (60 segundos, digitar, quantas acertar).
- Apoio visual no Treino: grade de pontos `3 × 4` desenhada com emojis pequenos.
- Divisão como nível extra: "12 ÷ 3 = ?" com a mesma grade.

**Dados:** gerados por função `gerarQuestao(tabuada, modo)`; evitar repetir a última questão; no "Todas", sortear tabuada com peso maior para as que a criança mais errou (guardar erros por fato em `localStorage`).

**Critérios de aceite**
- [x] Recorde do modo Relâmpago salvo por tabuada.
- [x] Teste: 1000 questões geradas estão dentro da tabuada escolhida.

**Como ficou:** treino de 10 fatos com três opções e grade de pontos; Relâmpago de 60 segundos;
multiplicação e divisão exata; erros guardados por fato para ponderar o modo "Todas"; recordes
separados para as tabuadas 2–10 e para "Todas". O teste amostra 1.000 questões de cada tabuada.

---

### J03 — Ditado Mágico (voz do navegador)

> **Nota de 2026-09-07:** foi a única tarefa J pulada, porque dependia da voz do navegador.
> A P00 criou `shared/fala.js`, que já resolve escolha de voz pt-BR, fila de uma fala por vez,
> repetir e o caso de o aparelho não ter voz nenhuma. Quem retomar a J03 deve usar esse módulo
> em vez de chamar `speechSynthesis` direto.

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

> ✅ **Concluída em 2026-09-06** — integrada diretamente na `main` junto com J02, J05 e J06.

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
- [x] Teste: em 200 grades geradas, todas as palavras estão presentes e localizáveis.
- [x] Seleção por toque funciona em tablet sem rolar a página.

**Como ficou:** seis temas com 62 palavras revisadas e oito opções que cabem até na grade 8×8
em cada tema. A lista mantém acentos e a grade usa a forma normalizada. A seleção aceita arraste
com Pointer Events ou dois toques, fica restrita às oito direções retas e usa `touch-action: none`.
Foram testadas 200 grades em cada dificuldade (600 no total), sempre com as oito palavras localizáveis.

---

### J05 — Forme a Palavra (sílabas)

> ✅ **Concluída em 2026-09-06** — integrada diretamente na `main` junto com J02, J04 e J06.

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** consciência silábica e ordem das sílabas. Para 9 anos, só faz sentido com palavras longas (4+ sílabas), sílabas intrusas e cronômetro; os níveis 1 e 2 são revisão.

**Mecânica**
- Emoji grande + sílabas embaralhadas em peças; tocar as peças na ordem monta a palavra na linha de cima; tocar em uma peça colocada devolve ela. Confere automaticamente ao completar.
- Nível 1: 2 sílabas · Nível 2: 3 sílabas · Nível 3: 4+ sílabas e uma sílaba "intrusa".

**Dados:** `{ palavra: 'BANANA', silabas: ['BA','NA','NA'], emoji: '🍌' }`, mínimo 60 palavras revisadas (a divisão silábica deve seguir a norma do português).

**Critérios de aceite**
- [x] Teste: `silabas.join('') === palavra` para todos os itens.
- [x] Peças com 56 px de altura no mínimo (fáceis de tocar).

**Como ficou:** 60 palavras revisadas, 20 em cada nível. A validação também exige exatamente
duas sílabas no nível 1, três no nível 2 e quatro ou mais no Desafio. As peças repetidas têm
identidade própria, a intrusa nunca repete uma sílaba correta e a altura de 56 px é preservada
também no CSS compilado pelo Vite.

---

### J06 — Que Horas São?

> ✅ **Concluída em 2026-09-06** — integrada diretamente na `main` junto com J02, J04 e J05.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Sonnet · **Objetivo pedagógico:** leitura de relógio analógico

**Mecânica**
- Relógio analógico em SVG (ponteiros de hora e minuto, números 1–12).
- Modo **Leia**: o relógio mostra uma hora; a criança escolhe entre 4 horários digitais.
- Modo **Ajuste**: aparece um horário digital; a criança gira os ponteiros com botões `+5 min`, `−5 min`, `+1 h`, `−1 h` (ou arrastando) até coincidir.

**Níveis:** hora cheia · meia hora · quartos de hora · de 5 em 5 minutos · minuto a minuto (Desafio). Nível padrão: de 5 em 5 minutos.

**Critérios de aceite**
- [x] Os distratores no modo Leia são plausíveis (trocar hora e minuto, ±30 min).
- [x] Teste: conversão hora↔ângulo dos ponteiros para 0 a 23 h e 0 a 59 min.

**Como ficou:** SVG com 60 marcas, números e ponteiros que consideram o avanço do ponteiro das
horas a cada minuto. O modo Leia oferece quatro horários únicos feitos de troca dos ponteiros,
±30 minutos ou ±1 hora. O modo Ajuste tem os quatro botões pedidos e acrescenta ±1 minuto no
Desafio. O teste percorre todas as 1.440 combinações de hora e minuto na ida e na volta.

---

### J07 — Genius das Cores (sequência)

> ✅ **Concluída em 2026-09-06** — integrada diretamente na `main` junto com J08, J09 e J10.

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** memória de trabalho e atenção

**Mecânica**
- 4 botões coloridos grandes, cada um com uma nota (Web Audio, tons diferentes); o jogo toca uma sequência que cresce a cada rodada; a criança repete.
- Modo **Calmo** (sem limite de tempo, velocidade fixa) e modo **Rápido** (acelera).
- Recorde salvo; estrelas por tamanho da sequência (5 / 8 / 12).

**Critérios de aceite**
- [x] Sequência reproduzível pelo teste (gerador com semente injetável).
- [x] Funciona no iOS (áudio após o primeiro toque).

**Como ficou:** gerador Mulberry32 com semente injetável, quatro cores com frequências próprias,
modos Calmo e Rápido, recorde separado por modo e estrelas nos marcos 5/8/12. O `AudioContext`
é criado e retomado diretamente no toque do botão Começar, como o iOS exige.

---

### J08 — Sudoku de Emojis

> ✅ **Concluída em 2026-09-06** — integrada diretamente na `main` junto com J07, J09 e J10.

**Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Objetivo pedagógico:** lógica e dedução

**Mecânica**
- Tabuleiro 4×4 (revisão, 4 emojis), 6×6 (padrão, 6 emojis; blocos 2×3) ou 9×9 (Desafio, com números). Tocar na célula abre a paleta de emojis; conflitos ficam com borda vermelha suave; botão "Dica" preenche uma célula.
- Vitória com confete; cronômetro; estrelas por dicas usadas.

**Passos**
1. `jogo.js`: gerador por backtracking de uma solução completa + remoção de células garantindo solução única (verificar com um resolvedor); dificuldade = número de células removidas.
2. `tela.js`: grade responsiva com `aspect-ratio: 1`, células ≥ 48 px no 6×6 em 360 px de largura (usar a largura total da tela).

**Critérios de aceite**
- [x] Teste: 100 tabuleiros gerados têm solução única.
- [x] 6×6 cabe em 360 px sem rolagem horizontal.

**Como ficou:** soluções completas 4×4, 6×6 e 9×9 são permutadas por linhas, colunas e símbolos;
cada célula só é removida se o resolvedor ainda contar exatamente uma solução. A suíte valida
100 tabuleiros de cada tamanho (300 no total). Conflitos de linha, coluna e bloco são destacados,
e dicas viram células fixas e determinam as estrelas.

---

### J09 — Dinheirinho (compras e troco)

> ✅ **Concluída em 2026-09-06** — integrada diretamente na `main` junto com J07, J08 e J10.

**Prioridade:** Baixa · **Esforço:** M · **Modelo:** Sonnet · **Objetivo pedagógico:** valores monetários e decimais

**Mecânica**
- Vitrine com um item e preço (ex.: "🧸 R$ 7,50"); a criança toca em moedas (0,05 · 0,10 · 0,25 · 0,50 · 1,00) e notas (2 · 5 · 10 · 20 · 50) para formar o valor exato; contador mostra quanto já juntou.
- Nível 1: valores inteiros até 10 · Nível 2: com centavos até 20 · Nível 3: "dar o troco" (o cliente pagou X, quanto volta?).
- Moedas e notas desenhadas em CSS/SVG simples com o valor escrito (não usar imagens do dinheiro real).

**Critérios de aceite**
- [x] Soma em centavos (inteiros) para evitar erro de ponto flutuante; teste cobre isso.

**Como ficou:** 30 produtos revisados, dez por nível, moedas e notas próprias desenhadas em CSS,
botão para desfazer e rodadas de dez compras. Todos os preços, pagamentos, trocos e denominações
são inteiros em centavos; os testes cobrem inclusive R$ 0,10 + R$ 0,20 = R$ 0,30 sem ponto flutuante.

---

### J10 — Quiz Sabe-Tudo

> ✅ **Concluída em 2026-09-06** — integrada diretamente na `main` junto com J07, J08 e J09.

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Objetivo pedagógico:** conhecimentos gerais (ciências, animais, Brasil, corpo humano, planetas)

**Mecânica**
- 10 perguntas de múltipla escolha (4 opções, emojis quando fizer sentido), explicação curta após responder, placar e estrelas.
- Categorias com pelo menos 25 perguntas cada em `dados.js`; sortear 10 sem repetir.

**Critérios de aceite**
- [x] O modelo revisa cada fato antes de entregar e marca no resumo qualquer pergunta sobre a qual tenha dúvida.
- [x] Teste: toda pergunta tem exatamente uma resposta correta e 4 opções distintas.

**Como ficou:** 125 fatos revisados — 25 em Ciências, Animais, Brasil, Corpo humano e Planetas —,
todos acompanhados de explicação curta. Foram escolhidos fatos estáveis e sem ambiguidade; não
ficou nenhuma pergunta com dúvida factual. O teste percorre o banco inteiro, exige quatro opções
distintas e exatamente uma ocorrência da resposta correta, além de validar rodadas sem repetição.

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

### 3.1 Ideias detalhadas — Labirinto e Rimas

#### J13 — Labirinto de Aventuras

**Status:** Proposto · **Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Depende de:** T09

**Objetivo:** brincar com orientação espacial, antecipação de movimentos e planejamento de caminhos.
O personagem precisa chegar a um destino: levar o dinossauro ao ninho, o carrinho à garagem ou
o cachorro à casinha. O tema muda a apresentação, sem mudar as regras.

**Mecânica**
- Mostrar personagem, destino e paredes bem distintos. Uma demonstração inicial faz dois
  movimentos em um minitabuleiro e convida a criança a experimentar.
- Mover uma casa por toque nas quatro setas grandes abaixo do tabuleiro; aceitar também setas
  do teclado e toque em uma casa vizinha livre. Arrastar é opcional, nunca obrigatório.
- Ao tentar atravessar uma parede, manter a posição e dar retorno visual suave, sem perder vida.
- Botão de dica ilumina apenas o próximo passo de uma rota válida. Permitir recomeçar o mesmo
  mapa ou trocar por outro; mostrar o caminho percorrido com uma trilha discreta.
- Rodada de três mapas; comemoração curta em cada chegada. Sem tempo limite no modo padrão.

**Níveis e variações**

| Modo | Tabuleiro | Desafio |
|---|---|---|
| Primeiros caminhos — usado por P07 | 3×3, depois 4×4 | Destino visível, poucas bifurcações, sem itens obrigatórios; um mapa por rodada |
| Explorador — revisão | 5×5 | Pequenos becos sem saída; chegar ao destino |
| Aventureiro — padrão para Elis | 7×7 | Buscar uma chave antes de entrar no destino |
| Desafio | 9×9 | Buscar dois itens em qualquer ordem e depois chegar ao destino; planejar uma rota mais curta |

**Implementação proposta** (`Games/labirinto/`)
1. Representar células e paredes em dados; separar `gerarLabirinto`, `mover` e `resolver` da tela.
   Gerar mapas conectados por busca em profundidade com semente injetável. Nos primeiros
   caminhos, usar mapas revisados à mão para controlar a quantidade de decisões.
2. Colocar início e destino em células distintas. Itens precisam estar em células acessíveis,
   diferentes do início e do destino; a chave libera a chegada, sem bloquear o acesso a si mesma.
3. Calcular dicas considerando posição e itens já coletados. No Desafio, a referência de menor
   rota também deve considerar os itens obrigatórios, não apenas a distância até a saída.
4. Renderizar em SVG ou grade CSS responsiva. No 9×9, as células são apenas visuais quando
   pequenas; o controle principal continua sendo as setas com pelo menos 56 px.
5. Registrar conclusões, movimentos válidos e dicas por modo. Na etapa de 5 anos (P07), celebrar a
   chegada sem avaliar eficiência; nos demais modos, estrelas por conclusão e uso de dicas.

**Critérios de aceite**
- [ ] Em 200 mapas por nível gerado, o destino e todos os itens são alcançáveis.
- [ ] Movimentos nunca atravessam paredes nem saem do tabuleiro; chegar sem os itens pedidos não encerra a partida.
- [ ] A dica continua válida após desvios e coleta de itens; recomeçar limpa a partida anterior.
- [ ] Funciona por toque e teclado em 360 px, com personagem e destino reconhecíveis.
- [ ] P07 abre diretamente em Primeiros caminhos e salva progresso separado dos modos de Elis.

#### J14 — Brincando de Rimar

**Status:** Proposto · **Prioridade:** Média · **Esforço:** M · **Modelo:** Opus · **Depende de:** T09

**Objetivo:** perceber palavras que terminam com sons parecidos. A brincadeira começa pela
escuta e pelas figuras; o texto entra como apoio nos modos para quem já lê.

**Mecânica**
- Mostrar uma figura e dizer seu nome: “Gato! O que rima com gato?”. Apresentar as figuras das
  alternativas e falar seus nomes antes de liberar a resposta; permitir ouvir tudo novamente.
- Exemplo de rodada: **gato → pato / bola**. Ao acertar, repetir “Gato, pato! Os finais combinam!”.
  Ao errar, repetir os nomes e permitir nova tentativa; depois de duas tentativas, demonstrar o par.
- Cada alternativa tem um botão próprio para ouvir seu nome, separado do botão de resposta.
  Não exigir microfone, digitação ou leitura para os níveis de escuta.
- Depois da resposta, destacar as duas figuras e reproduzir os nomes em sequência. Nos modos
  com texto, manter a grafia correta e destacar o trecho da rima apenas se revisado no banco.

**Níveis e variações**

| Modo | Proposta | Tamanho da rodada |
|---|---|---|
| Ouvir e combinar — usado por P04 | Duas figuras como alternativas, narração e exemplo guiado | 5 pares |
| Encontrar a rima — revisão | Três alternativas com figura, áudio e palavra | 8 pares |
| Versinho — padrão para Elis | Completar um verso curto e original com uma entre quatro palavras; áudio opcional | 10 versos |
| Desafio | Encontrar, entre quatro palavras, a única que não rima com as outras três | 10 grupos |

**Conteúdo e cuidados**
- Banco inicial: pelo menos 20 questões de figuras, 20 versos originais e 20 grupos do Desafio.
  Para o modo de duas alternativas, selecionar a resposta e um distrator da questão de figuras.
- Pares iniciais: **gato/pato**, **mão/pão**, **balão/leão**, **janela/panela**. Usar nomes comuns e
  figuras inequívocas; o áudio fixa o nome pretendido quando a imagem admite mais de um nome.
- Rima é sonora: revisar a pronúncia desde a vogal tônica até o fim da palavra. Não gerar respostas
  comparando apenas as últimas letras, nem apresentar duas alternativas que rimem com o alvo.
- Evitar diferenças de pronúncia que tornem a questão ambígua. Distratores não podem ser sinônimos
  da resposta nem depender só da categoria da figura. Variar a posição da resposta correta.
- Em Versinho, a resposta precisa rimar e fazer sentido. Exemplo original: “Olha só aquele gato,
  brincando perto do ___” → **pato / sino / trem / sol**.

**Dados e implementação** (`Games/rimas/`)
- Questões de figuras: `{ id, alvo: { nome, imagem, audio }, alternativas: [{ id, nome, imagem,
  audio }], respostaId, grupoRima, explicacao }`. Versos e grupos têm bancos próprios e respostas explícitas.
- Reutilizar o sorteio e o feedback entre modos; sortear sem repetir a questão na mesma rodada.
- Os modos de escuta usam gravações locais em pt-BR e funcionam offline após o conteúdo ser
  armazenado pelo PWA. P04 reutiliza a infraestrutura de P00. Não depender de voz online do navegador.
- Se faltar áudio, oferecer repetição/tentativa de carregamento e modo acompanhado por adulto;
  não transformar silenciosamente uma questão de escuta em leitura obrigatória.

**Critérios de aceite**
- [ ] Toda questão tem IDs distintos, uma única resposta e arquivos de imagem/áudio presentes.
- [ ] Revisão por escuta confirma as rimas e elimina distratores ambíguos; registrar a revisão no resumo.
- [ ] Uma criança que não lê consegue jogar o modo inicial após a demonstração, com áudio disponível.
- [ ] Áudios não se sobrepõem; sair ou reiniciar interrompe a narração anterior.
- [ ] Rodadas respeitam o modo escolhido e o progresso de P04 fica separado do de Elis.

### 3.2 Outras ideias para depois

- **Pintar por Números** em `canvas` com paleta grande.
- **Qual é o Intruso?**: 4 emojis, um de categoria diferente. A versão com figuras e narração virou a P11 da seção 6; uma versão com palavras pode voltar aqui para Elis.
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
| J13 | Labirinto de Aventuras | Média | M | Opus | T09 |
| J14 | Brincando de Rimar | Média | M | Opus | T09 |

As tarefas da nova etapa de pré-alfabetização têm sua própria ordem e matriz na seção 6.2.

**Caminho mínimo recomendado para a primeira semana:** T01 → T02 → T03 → T04 → T05 → T06 → T07 (tudo pequeno, elimina todos os bugs conhecidos). Depois T08 → T09 → T10 → T20, que destravam o resto.

---

## 5. Checklist de aceite comum (aplicar em toda tarefa)

- [ ] Funciona em 360 px, 768 px e 1280 px sem rolagem horizontal.
- [ ] Toque, teclado e mouse funcionam.
- [ ] Console sem erros; aba Network sem 404.
- [ ] Textos em pt-BR com acentuação correta.
- [ ] Nada de `node_modules`, `.env.local`, `.DS_Store` no commit.
- [ ] Jogos React: `npm run typecheck` e `npm run build`; `dist/` permanece fora do git.
- [ ] Resumo final com: o que mudou, como foi testado, pendências.

---

## 6. Nova etapa — Jogos do Rael / Primeiras Descobertas (5 anos, pré-alfabetização)

> **Planejada em 2026-09-07 e revisada no mesmo dia para 5 anos. P00 implementada em 2026-09-07;
> P01 a P13 pendentes.** Público: **Rael**, 5 anos, fase de pré-alfabetização (Pré II da
> Educação Infantil).
>
> **Como ficou na prática:** em vez de uma seção dentro do site da Elis, a etapa virou um
> **site irmão no mesmo endereço**, os **Jogos do Rael**, em `rael/`, com tema azul próprio e
> duas abas no alto das duas páginas iniciais para trocar de um lado para o outro. Nada nos
> jogos da Elis mudou além do aparecimento dessas abas.

**Proposta:** brincar com sons, palavras faladas, figuras, letras, o próprio nome, quantidades e
sequências, sem exigir que a criança já leia. Dinossauros, veículos, animais e espaço são opções
de tema a experimentar conforme o interesse dele. A escolha do tema não depende de gênero.

**O que muda em relação ao rascunho para 4 anos.** Aos 5 anos a criança costuma reconhecer várias
letras (em especial as do próprio nome), escrever ou tentar escrever o nome, bater palmas nas
sílabas, perceber rimas e sons iniciais, contar até 10 com correspondência um a um e classificar
figuras por categoria. Por isso:

- **Três alternativas** viram o padrão; duas ficam como modo mais fácil e quatro como modo esperto.
- **Rodadas de 5 a 8 desafios**, e não de 3 a 5; a atenção sustentada é maior.
- **Letras e nome próprio** deixam de ser exploração opcional e passam a ser eixo da etapa
  (P06 sobe de prioridade; entra P09 — Meu Nome).
- **Som inicial** (P05) sobe para prioridade Alta e começa pelas vogais, que em português têm
  nome e som iguais.
- **Contagem até 10** entra (P10). A regra da seção 3.0 que evita contagem básica vale para Elis,
  não para esta etapa.
- **Encaixe de silhuetas** (P02) fica mais difícil e cai para prioridade Média: duas formas
  distintas seriam fáceis demais.
- Entram ainda **Qual é o Intruso?** (P11), **Qual Vem Primeiro?** (P12) e **Memória Pequena** (P13).

**Referência pedagógica.** Os objetivos de aprendizagem da BNCC para crianças pequenas (4 a 5 anos
e 11 meses) que a etapa cobre: escrita espontânea e hipóteses sobre a escrita (EI05EF09), relação
entre número e quantidade (EI05ET07), classificação por semelhanças e diferenças (EI05ET05),
reconto e ordenação de histórias (EI05EF05) e coordenação manual (EI05CG05). Serve de guia para o
modelo executor e para a validação com a criança, não como meta a cobrar dele.

### 6.0 Regras próprias desta etapa

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
- **Fala em pt-BR em três camadas** (decisão desta revisão, ver P00): (1) gravação local quando
  existir; (2) voz sintetizada do aparelho via `speechSynthesis` com `lang = 'pt-BR'`, que no iOS,
  Android e macOS funciona sem internet depois de a voz estar instalada; (3) modo acompanhado, com
  roteiro curto na tela para o adulto ler. Uma fala por vez; botão de repetir sempre visível;
  primeira fala só depois de um toque em “Vamos brincar”. Volume e silêncio respeitam
  `shared/sons.js`. Gravações são **obrigatórias** apenas onde a síntese não serve: sons de
  animais e objetos (P01), sons isolados como /f/ e /s/ (P05) e as sílabas separadas (P03, se a
  síntese soar artificial). O ideal é o próprio Diego gravar no celular: a voz de casa é a que ele
  mais reconhece.
- **Figuras consistentes entre aparelhos:** SVGs do OpenMoji (CC BY-SA 4.0) em
  `public/figuras/`, um arquivo por figura, catalogados em `shared/catalogo-figuras.js` e com a
  atribuição em `public/figuras/LICENCA.txt`. Nunca depender do emoji do sistema, que muda de
  desenho entre iPhone, Android e computador. Ilustrações próprias só quando a atividade pedir
  cena ou peças (P02, P12). A P00 já baixou 62 figuras (300 KB): animais, veículos, natureza,
  coisas de casa, objetos, roupa e comida.
- **Letras em caixa alta, tipo bastão**, como na escola. Usar a fonte Nunito de `shared/fontes/`
  com pesos que deixem I, L, J, O e Q inequívocos; conferir A, G e Q em tamanho grande.
- **Progresso próprio:** tudo da etapa (preferências, rodadas por atividade e álbum) vive numa
  chave só, `localStorage['jogos-elis:descobertas']`, separada da chave de progresso da Elis.
  O Mural de `index.html` soma apenas os IDs do mapa `nomes` dele, então nada daqui entra nas
  conquistas dela; "Zerar progresso" nas configurações da Elis não apaga o álbum, e "Zerar álbum"
  nas do Rael não apaga o progresso dela. O único dado pessoal é o **primeiro nome**, opcional,
  digitado pelo adulto para P09 e para a saudação. Sem sobrenome, data de nascimento ou conta.
- **Validação com a criança:** observar se entende o convite, identifica as figuras e consegue tocar
  nas opções. Ajustar vocabulário e quantidade de escolhas pela experiência; não usar o álbum
  como diagnóstico.

### P00 — Preparar a área Primeiras Descobertas ✅

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Opus · **Depende de:** T09, T13, T21, T23 (todas concluídas)

**✅ Concluída em 2026-09-07.** O que está escrito abaixo é a especificação original; o que foi
entregue está no bloco **"Como ficou"**, no fim da tarefa.

**Entrega**
1. Criar a página `Games/descobertas/index.html` (entrada `descobertas` em `paginas` do
   `vite.config.ts`) com os cartões das atividades desta etapa, e um cartão grande e ilustrado na
   página inicial. Disponibilizar somente cartões de atividades já implementadas. Cada atividade
   fica em `Games/descobertas/<slug>/` seguindo a estrutura da seção 3.0.
2. Criar `shared/fala.js`: `falar(item)`, `parar()`, `repetirUltima()` e `disponivel()`. Um item
   é `{ texto, audio? }`; a função toca `audio` se o arquivo existir e carregar, senão sintetiza
   `texto` com a voz pt-BR disponível (escolher voz com `lang` começando por `pt-BR`; se só houver
   `pt-PT`, usar e avisar nas configurações), senão devolve `false` para a tela abrir o modo
   acompanhado. Fila de uma fala por vez; `parar()` ao trocar de questão, repetir ou sair.
   Testes em `tests/fala.test.js` com `speechSynthesis` e `Audio` simulados.
3. Criar `shared/descobertas.js` com os blocos comuns: demonstração guiada, rodada curta com
   alternativas embaralhadas (`sortearVarios` de `shared/texto.js`), retorno acolhedor, tela de
   conclusão com figurinha, e `registrarRodada(atividade)` / `obterAlbum()` usando as chaves
   com prefixo `descobertas:`.
4. Criar `shared/figuras/` com os SVGs usados (catálogo em `shared/figuras/catalogo.js`:
   `{ id, arquivo, nome, audio? }`) e `shared/audio/` para as gravações. Um teste em
   `tests/catalogo.test.js` confirma que todo arquivo referenciado existe. Como o service worker
   pré-cacheia tudo que sai em `dist/`, manter áudio em `.m4a` ou `.mp3` mono, curto, e o total da
   etapa abaixo de 8 MB; registrar o tamanho no resumo.
5. Ampliar `configuracoes.html` com um bloco “Primeiras Descobertas”: primeiro nome (opcional,
   até 15 letras, salvo em `nomeDescobertas`), alternativas (2/3/4), tema, voz (gravada quando
   houver / sintetizada / sem fala) e um botão para zerar só o álbum. Nada disso é exigido para jogar.

**Aceite**
- [x] Entrada e retorno à página inicial funcionam em 360 px; botões têm pelo menos 64 px.
- [x] Depois de uma visita com cache completo, figuras e a voz funcionam em modo avião — conferido em Chrome com a rede cortada, com as 149 URLs no precache. **Falta conferir no iPad e no Android de casa.**
- [x] Repetir, trocar de questão e sair não deixam falas sobrepostas ou pendentes.
- [x] Partidas desta etapa não alteram o Mural, os recordes nem os níveis dos jogos existentes.
- [x] Sem voz pt-BR e sem gravação, a tela oferece o modo acompanhado em vez de ficar muda.

**Como ficou**

1. **Site irmão, não seção.** A etapa virou os **Jogos do Rael**, em `rael/`, com página
   inicial, configurações e uma brincadeira. As duas páginas iniciais ganharam abas
   (`.trocador` no `base.css`) para trocar de site. `montarCabecalho` aprendeu que, dentro de
   `/rael/`, o botão "Início" volta para a casa do Rael.
2. **Tema por variáveis, não por folha nova.** `shared/tema-rael.css` redeclara os tokens do
   `base.css` em `:root.tema-rael`, no `<html>`. Como propriedade personalizada herda, tudo que
   já usava `var(--cor-…)` mudou de cor de graça — inclusive `--toque`, que passou de 44 px para
   64 px e fez todos os botões crescerem sozinhos. Contrastes conferidos e anotados no arquivo
   (o pior fica em 5,06:1, acima do 4,5:1 do WCAG AA).
3. **Fala em três camadas** em `shared/fala.js`: gravação → voz do aparelho (`speechSynthesis`
   pt-BR) → modo acompanhado com a frase escrita para o adulto ler. É o que destrava a etapa
   sem esperar por centenas de gravações: só P01, P05 e talvez P03 vão precisar de arquivos.
4. **Figuras** em `public/figuras/`: 62 SVGs do OpenMoji (CC BY-SA 4.0, 300 KB), com nome,
   artigo (`o`/`a`) e categoria em `shared/catalogo-figuras.js`. Um teste confere que catálogo e
   arquivos batem nos dois sentidos.
5. **Motor de rodada** em `shared/rodada.js` e **estado da etapa** em `shared/descobertas.js`,
   este último numa chave própria do `localStorage`. Sem estrela e sem recorde: cada rodada
   terminada rende uma figurinha para o álbum.
6. **Configurações do adulto** em `rael/configuracoes.html`: primeiro nome, 2/3/4 alternativas,
   tema das figuras, modo de voz, som e "zerar álbum". Tem um botão **Testar a voz** que diz
   qual camada falou e qual voz do aparelho foi escolhida — é por ele que se confere o iPad.
7. **Uma brincadeira de verdade junto**, "Toque na Figura" (`rael/toque-na-figura/`): ouvir o
   nome e tocar na figura entre 2, 3 ou 4 opções. Ela não estava na lista P01–P13; foi feita
   porque a P00 não tem como ser aceita sem uma tela que exercite fala, demonstração, rodada,
   retorno depois de dois erros e figurinha. Ela **não substitui a P01**, que é de som de bicho.
8. **PWA próprio:** `public/rael.webmanifest` com `start_url` e `scope` em `/rael/`, nome
   "Jogos do Rael" e ícone de foguete (`public/icones/rael-192.png` e `rael-512.png`, gerados a
   partir de `rael.svg`). Instalar os dois lados dá dois atalhos diferentes no tablet.
9. **Um bug achado no caminho:** o atributo `hidden` não escondia nada que tivesse classe
   `.botao` ou `.roteiro`, porque uma regra de `display` do autor ganha do `[hidden]` do
   navegador. O botão "Continuar" ficava clicável no meio da pergunta. Corrigido com
   `[hidden] { display: none !important; }` no `descobertas.css`.

**Como foi testado:** `npm test` (141 testes, 54 novos), `npm run typecheck`, `npm run build` e
um roteiro no Chrome sem interface que joga a rodada inteira em 360 px — 46 verificações, sem
erro de console e sem 404 —, mais um teste de modo avião com o service worker. **Falta a
validação com o Rael e nos aparelhos de casa.**

### P01 — Quem Faz Esse Som?

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** P00

**Foco:** atenção auditiva e associação entre som e figura.

**Como brincar:** ouvir um miado e tocar no gato entre três figuras. Primeiro demonstrar um
exemplo com a resposta destacada; nas rodadas seguintes, oferecer apenas o som e as opções.
Depois do acerto, dizer “É o gato!”, repetir o miado e mostrar a palavra **GATO** em caixa alta
sob a figura, como exposição à escrita, sem pedir leitura.

**Progressão:** animais bem diferentes → veículos e sons de casa (campainha, chuva, trem,
telefone) → “dois sons seguidos”: ouvir dois sons e tocar nas duas figuras na ordem. Seis desafios
por rodada, com repetição livre do som.

**Conteúdo inicial:** 16 sons gravados ou obtidos com licença CC0 (registrar a origem no
catálogo): 8 animais, 4 veículos, 4 sons de casa. Revisar para evitar gravações ambíguas ou
assustadoras. Separar o som da pista do áudio que fala o nome, para não entregar a resposta.

**Aceite:** cada pista tem uma única figura correspondente entre as opções; o nome só é falado
na demonstração ou no retorno da resposta; rodadas sem repetição do alvo; sons funcionam offline.
**Risco:** esta é a única atividade que não funciona sem arquivos gravados; se os sons atrasarem,
entregar antes P09, P10 e P06.

### P02 — Encaixe as Figuras ✅

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00

**✅ Concluída em 2026-09-07.** Especificação original abaixo; o entregue está em "Como ficou".

**Foco:** discriminação visual, reconhecimento de formas e coordenação manual.

**Como brincar:** levar uma figura até sua silhueta ou lugar na cena. Tocar primeiro na peça e
depois no destino produz o mesmo resultado de arrastar. No primeiro exemplo, uma animação mostra o encaixe.

**Progressão (revisada para 5 anos):** três silhuetas parecidas (gato/cachorro/coelho) → cena com
quatro peças (foguete: bico, corpo, asas, fogo) → quebra-cabeça de seis peças em grade 2×3, sem
rotação. Três cenas por rodada.

**Conteúdo inicial:** 12 cenas locais com encaixes definidos e peças grandes. Uma peça encaixada
permanece no lugar; uma tentativa diferente só devolve a peça à origem. As silhuetas podem vir
dos SVGs de `shared/figuras/` preenchidos em cinza; as cenas de peças precisam de ilustração própria.

**Aceite**
- [x] Funciona integralmente sem arrastar: tocar na peça e depois no lugar resolve tudo.
- [x] Encaixes não se sobrepõem: um destino aceita uma peça só, e peça encaixada não sai.
- [x] Todas as peças e destinos cabem em 360 px, inclusive a grade de seis pedaços.
- [x] A demonstração pode ser repetida quantas vezes quiser, pelo botão "Me mostra".

**Como ficou**

1. **Sem ilustração nova.** As doze cenas saem dos mesmos SVGs do catálogo. A sombra é a figura
   com `filter: brightness(0)` e opacidade baixa; o pedaço é a figura recortada por
   `background-position`, como um sprite. A cena de peças da especificação (foguete em bico,
   corpo, asas e fogo) virou um quebra-cabeça de recortes iguais, que é a mesma brincadeira sem
   depender de desenho à mão.
2. **Toque e arraste, os dois.** O arraste usa eventos de ponteiro, então dedo e mouse seguem o
   mesmo caminho. O toque em dois passos continua sendo o modo garantido, e é o que a aceitação exige.
3. **Níveis pelo mesmo botão da etapa.** O número de alternativas das configurações vira nível:
   duas = três silhuetas; três = duas silhuetas e um de quatro pedaços; quatro = silhueta, quatro
   e seis pedaços. Nenhum desbloqueio.
4. **Uma descoberta no meio do caminho:** recortar uma figura numa grade deixa células em branco
   quando o desenho não preenche o quadro. Duas peças em branco seriam indistinguíveis para a
   criança. Mediu-se a tinta de cada célula desenhando o SVG num canvas, e só entraram figuras
   cuja célula mais vazia ainda tem desenho (a medida ficou registrada em `tintaMinima`, no
   `dados.js`). Foi o que tirou dinossauro, trem e ônibus das cenas de pedaços.
5. **Ajuda sem custo:** "Me mostra" encaixa a próxima peça e pode ser usado à vontade; a
   comemoração do fim é a mesma.

### P03 — Palmas nas Palavras ✅

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** P00

**✅ Concluída em 2026-09-07.** Especificação original abaixo; o entregue está em "Como ficou".

**Foco:** explorar oralmente as partes das palavras, sem ler sílabas escritas.

**Como brincar:** mostrar um pato, dizer “Pato” e demonstrar “PA — TO”, iluminando dois círculos.
A criança toca em um botão grande de palma uma vez para cada parte; cada toque acende um círculo.
Um botão visual de concluir permite conferir sem exigir ritmo ou rapidez.

**Progressão:** imitar palavras de duas sílabas com círculos visíveis → uma, duas e três sílabas
com modelo disponível → tentar antes de ouvir a divisão → **“Quantos pedaços?”**: depois de bater
palmas, tocar no número (1 a 4), ligando com a contagem de P10. Exemplos: **SOL**, **PA-TO**,
**BO-LA**, **BA-NA-NA**, **BOR-BO-LE-TA**. Seis palavras por rodada; oferecer limpar e tentar novamente.

**Conteúdo inicial:** 30 palavras ilustráveis de uma a quatro sílabas, com áudio da palavra
inteira, áudio segmentado e divisão revisada. Se a síntese das sílabas soar artificial, gravar só
o áudio segmentado. Não interpretar o tempo entre toques como acerto ou erro.

**Aceite**
- [x] A contagem depende somente dos toques; o tempo entre eles não entra na conta.
- [x] O exemplo e o botão "Começar de novo" zeram os círculos.
- [x] A quantidade de partes faladas é a divisão cadastrada: a fala percorre o mesmo vetor de sílabas.
- [x] "Quantos pedaços?" compara com a divisão, e não com as palmas batidas.

**Como ficou**

1. **Trinta palavras** com a divisão revisada à mão, em `dados.js`, todas com figura no catálogo.
   As regras de separação usadas estão escritas no cabeçalho do arquivo (CH/NH/LH/GU/QU não
   separam, RR/SS separam, ditongo fica junto). Um teste confere que juntar as sílabas devolve a
   palavra escrita e que toda sílaba tem vogal.
2. **Círculo por sílaba, em sincronia com a fala.** `falarSequencia` ganhou um aviso por item
   (`aoComecar`), e é ele que acende o círculo no instante em que a sílaba é dita.
3. **Três níveis pelo botão da etapa:** duas alternativas = só palavras de dois pedaços, com o
   modelo vindo sozinho e os círculos sempre à vista; três = de uma a três sílabas, modelo só se
   pedirem; quatro = até quatro sílabas mais a pergunta "Quantos pedaços?".
4. **Sem gravação por enquanto.** As sílabas são ditas pela voz do aparelho, uma por vez. Se
   soarem artificiais no aparelho de casa, é só gravar os áudios segmentados e apontar `audio`
   em cada sílaba: `fala.js` prefere a gravação sozinho.

### P04 — Rimas com Figuras

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00, J14

**Foco:** perceber semelhanças sonoras no final de palavras.

**Como brincar:** usar os modos **Ouvir e combinar** (duas figuras) e **Encontrar a rima** (três
figuras) de J14, com seis pares por rodada. Começar com uma demonstração de **gato/pato**;
disponibilizar nomes e instruções em áudio. A palavra escrita pode aparecer sob a figura, mas
nunca é condição para responder.

**Escopo:** criar a entrada e a apresentação para esta etapa, reutilizando o motor e o banco de
J14. Abrir em Ouvir e combinar quando o adulto escolher duas alternativas e em Encontrar a rima
quando escolher três ou quatro. Selecionar os pares mais familiares e registrar progresso com o
prefixo da etapa.

**Aceite:** entrada abre no modo correto, não oferece Versinho/Desafio durante a rodada e permite
ouvir cada figura sem selecionar a resposta; uma rodada completa funciona sem leitura.

### P05 — Começa com o Mesmo Som

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Opus · **Depende de:** P00

**Foco:** comparar sons no início de palavras faladas, e só depois associá-los à letra.

**Como brincar:** ouvir “Foca” e escolher entre **fita**, **bola** e **mesa** qual começa com o
mesmo som. Na demonstração, realçar naturalmente o /f/ nas duas palavras; depois falar as palavras
inteiras. Três alternativas e seis desafios, com repetição disponível.

**Progressão:** **vogais** primeiro (A de abelha, E de elefante, I de igreja, O de ovo, U de uva),
porque em português o nome da vogal é o próprio som → consoantes prolongáveis /f/, /v/, /m/,
/s/, /l/, /n/, /z/, /j/ → oclusivas /p/, /b/, /t/, /d/ só por escolha do adulto. Depois do
acerto, mostrar a letra e a palavra em caixa alta (“A de ABELHA”) como associação, sem
transformar o desafio em escolher pela inicial escrita.

**Conteúdo inicial:** 30 questões com figuras do catálogo e áudio revisado. Agrupar pelo som
inicial, não pela letra: evitar C de casa/cenoura e G de gato/girafa nesta primeira versão.
Cuidado com a qualidade das vogais: escolher palavras cuja vogal inicial soe como o nome da letra
(**elefante**, **ovo**, **olho**; evitar **óculos**, **época**). Não pronunciar “efe” quando a
pista pede o som /f/; não adicionar uma vogal ao som isolado. Os sons isolados (cerca de 15
arquivos) precisam de gravação; o resto pode usar a síntese.

**Aceite:** exatamente uma alternativa compartilha o som do alvo; a posição correta varia;
revisão por escuta confirma cada questão e nenhuma resposta depende de reconhecer letras.

### P06 — Letras para Explorar

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** P00

**Foco:** reconhecer formas e nomes das letras, começando pelas do próprio nome.

**Como brincar:** mostrar uma letra grande e convidar a encontrar outra igual entre três peças.
Ao tocar, falar o nome da letra e apresentar uma palavra ilustrada: “B. Bola!”. Não cobrar leitura
da palavra nem tratar o nome da letra como se fosse seu som.

**Progressão:** parear letras iguais com modelo sempre visível → encontrar a letra depois de
ouvir seu nome, sem modelo → “Qual letra começa **ABELHA**?”, apenas para as letras já vistas em
P05. Mais um modo livre, **Mesa de letras**: tocar em qualquer letra para ouvir o nome e ver duas
figuras; sem pontuação.

**Conjunto inicial:** vogais mais as letras do primeiro nome (lidas de `nomeDescobertas`, sem
repetir) e, se sobrar espaço, B, M, P, L e S. O adulto pode ampliar até o alfabeto completo; sem
obrigação de completar. Seis desafios por rodada.

**Aceite:** pareamento inicial pode ser resolvido visualmente; letras usam a fonte e a forma da
seção 6.0; ouvir de novo não conta como tentativa; o conjunto escolhido fica salvo localmente;
sem nome cadastrado, a atividade funciona com o conjunto padrão.

### P07 — Meu Primeiro Labirinto

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00, J13

**Foco:** orientação espacial e planejamento de pequenos trajetos.

**Como brincar:** levar o carrinho à garagem usando as setas. Reutilizar **Primeiros caminhos**
de J13, com um mapa 4×4 por rodada; oferecer 3×3 (mais fácil) e 5×5 com uma estrela para pegar
no caminho (modo esperto) nas configurações do adulto. Destino sempre visível, sem cronômetro
ou avaliação pelo número de movimentos.

**Conteúdo inicial:** dez mapas revisados, com caminho curto e poucas bifurcações. Dica mostra
o próximo passo e pode ser repetida livremente. Setas de pelo menos 64 px nesta apresentação.

**Aceite:** abre no 4×4, a dica sempre leva a um caminho possível e a comemoração é a mesma com
ou sem ajuda. Reutilizar a lógica de J13, sem manter um segundo gerador.

### P08 — O Que Vem Depois?

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00

**Foco:** reconhecer e continuar padrões visuais simples.

**Como brincar:** mostrar **carro, bola, carro, bola, ?** e oferecer carro/bola/estrela. A
narração aponta cada figura em sequência; a criança toca na que completa o padrão.

**Progressão:** padrão AB com quatro elementos visíveis → AAB e ABB com seis elementos → ABC com
seis elementos → “o que está faltando no meio?”. Seis desafios; ao errar, animar o padrão novamente.

**Conteúdo inicial:** 20 sequências com objetos conhecidos. Diferenciar elementos por forma e
figura, sem depender apenas da cor. Contagem pode aparecer oralmente como brincadeira
complementar, sem virar requisito para responder.

**Aceite:** todas as sequências têm ao menos duas repetições completas do padrão e uma única
continuação correta entre as opções; tela não exige rolagem horizontal.

### P09 — Meu Nome

**Prioridade:** Alta · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** P00

**Foco:** o próprio nome como primeira palavra escrita (BNCC EI05EF09); é o que mais motiva
nessa idade e não precisa de banco de conteúdo.

**Como brincar:** o nome aparece em caixa alta no alto da tela, e as mesmas letras embaralhadas
em peças grandes embaixo. Tocar numa peça a leva para a próxima casa vazia; tocar numa casa
preenchida devolve a letra. A cada toque, falar o nome da letra; ao completar, falar “Você
escreveu **DAVI**!” e comemorar. Arrastar é opcional.

**Progressão:** modelo visível → modelo some depois da primeira letra colocada (e volta se pedir
ajuda) → sem modelo, com uma letra intrusa entre as peças. O adulto pode acrescentar até cinco
outras palavras da casa (ELIS, MAMÃE, PAPAI, o nome do cachorro), que seguem a mesma brincadeira.

**Conteúdo:** primeiro nome vindo de `nomeDescobertas`; aceitar letras com acento e Ç, maiúsculas
sempre. Sem nome cadastrado, a atividade convida o adulto a digitar um nome nas configurações e
oferece **DINO** e **CARRO** como exemplo. Nunca pedir sobrenome.

**Aceite:** letras repetidas funcionam (LUCAS tem um só S, ISABELA tem dois A); uma peça só
ocupa uma casa; “ouvir de novo” e “mostrar o modelo” não contam como erro; funciona com nomes
de 2 a 15 letras em 360 px, quebrando em duas linhas se necessário.

### P10 — Conta Comigo

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00

**Foco:** contar objetos com correspondência um a um e ligar quantidade ao numeral (BNCC EI05ET07).

**Como brincar:** “Quantos dinossauros?” mostra de 1 a 5 figuras espalhadas. Tocar em cada
figura a marca e fala o número (“um, dois, três”); ao final, escolher entre três numerais grandes.
Nada exige ler além de reconhecer o algarismo, que é falado ao tocar.

**Progressão:** 1 a 5 com marcação por toque → 1 a 10 → “Pegue 4”: dado o número, tocar em
exatamente quatro figuras entre mais figuras → “Qual tem mais?”: duas caixas, tocar na mais cheia.
Seis desafios por rodada.

**Conteúdo:** gerado no código a partir do catálogo de figuras, sem banco. Numerais com a mesma
fonte das letras.

**Aceite:** a quantidade pedida nunca é ambígua; as figuras não se sobrepõem em 360 px; tocar
de novo numa figura já contada não conta duas vezes; a posição do numeral correto varia.

### P11 — Qual é o Intruso?

**Prioridade:** Média · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00

**Foco:** classificar por categoria e explicar diferenças (BNCC EI05ET05). Ideia trazida da
seção 3.2; uma versão com palavras pode virar mais tarde um jogo para Elis.

**Como brincar:** quatro figuras, três da mesma categoria e uma intrusa (gato, cachorro, vaca,
**carro**). A narração fala o nome de cada figura; a criança toca na que não combina. Depois do
acerto, dizer o motivo: “Gato, cachorro e vaca são animais. Carro não é!”.

**Progressão:** categorias bem distantes (animais × veículos) → categorias próximas (frutas ×
legumes, roupas × calçados) → intruso por atributo (três coisas que voam e uma que não voa).
Três figuras no modo mais fácil, quatro no padrão. Seis desafios por rodada.

**Conteúdo inicial:** 24 grupos com explicação curta gravável, usando figuras do catálogo.
Evitar categorias discutíveis (tomate é fruta?) e figuras que caibam em duas categorias.

**Aceite:** cada grupo tem um único intruso defensável; a explicação é falada no acerto e na
demonstração; a posição do intruso varia.

### P12 — Qual Vem Primeiro?

**Prioridade:** Baixa · **Esforço:** M · **Modelo:** Sonnet · **Depende de:** P00

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

**Prioridade:** Baixa · **Esforço:** P · **Modelo:** Sonnet · **Depende de:** P00

**Foco:** memória visual e nomes das figuras, reaproveitando o Jogo da Memória.

**Como brincar:** o Jogo da Memória com 6 cartas (3 pares) ou 8 cartas (4 pares), figuras do
catálogo, e o nome da figura falado a cada virada. Sem cronômetro, sem recorde e sem contagem
de jogadas na tela.

**Escopo:** o jogo React aceita `?modo=descobertas&cartas=6`, esconde os elementos de
competição, usa `shared/fala.js` e registra a rodada com o prefixo da etapa. A entrada fica na
página da etapa; nada muda para Elis sem o parâmetro.

**Aceite:** com o parâmetro, não aparecem recorde nem cronômetro; sem ele, o jogo continua como
está; o progresso vai para `descobertas:memoria`.

### 6.1 Ordem sugerida de entrega

1. **Preparar e experimentar com pouco conteúdo:** ~~P00~~ (feita) → P09 → P10. Meu Nome e Conta Comigo
   não precisam de gravações nem de banco de dados, então validam navegação, voz sintetizada e
   toque com ele antes de produzir áudio e figuras.
2. **Letras e sons:** P06 → P05 → ~~P03~~ (feita). Aqui entram as primeiras gravações
   obrigatórias (sons isolados e, se preciso, sílabas).
3. **Escuta e figuras:** P01 → J14 + P04 → P11.
4. **Ampliar conforme o interesse:** J13 + P07 → P08 → ~~P02~~ (feita) → P12 → P13.

Essa é uma ordem de implementação, não uma trilha obrigatória para a criança. Labirinto e Rimas
podem ser antecipados se forem os temas que mais despertarem interesse. Se uma atividade ainda
não fizer sentido para ele, manter as anteriores disponíveis e ajustar a demonstração.

### 6.2 Matriz da etapa

| ID | Entrega | Prioridade | Esforço | Modelo | Depende de |
|---|---|---|---|---|---|
| P00 | Área, fala em camadas, figuras, álbum e configurações | ✅ Concluída em 2026-09-07 | M | Opus | T09, T13, T21, T23 |
| P01 | Quem Faz Esse Som? | Alta | M | Sonnet | P00 |
| P02 | Encaixe as Figuras | ✅ Concluída em 2026-09-07 | P | Sonnet | P00 |
| P03 | Palmas nas Palavras | ✅ Concluída em 2026-09-07 | M | Sonnet | P00 |
| P04 | Rimas com Figuras | Média | P | Sonnet | P00, J14 |
| P05 | Começa com o Mesmo Som | Alta | M | Opus | P00 |
| P06 | Letras para Explorar | Alta | M | Sonnet | P00 |
| P07 | Meu Primeiro Labirinto | Média | P | Sonnet | P00, J13 |
| P08 | O Que Vem Depois? | Média | P | Sonnet | P00 |
| P09 | Meu Nome | Alta | M | Sonnet | P00 |
| P10 | Conta Comigo | Média | P | Sonnet | P00 |
| P11 | Qual é o Intruso? | Média | P | Sonnet | P00 |
| P12 | Qual Vem Primeiro? | Baixa | M | Sonnet | P00 |
| P13 | Memória Pequena | Baixa | P | Sonnet | P00 |

### 6.3 Riscos e decisões desta revisão

- **Áudio era o gargalo — resolvido na P00.** O rascunho anterior exigia gravação para toda
  fala; somadas, as atividades passariam de 300 arquivos antes de qualquer coisa rodar. Com a
  fala em três camadas (gravação → síntese do aparelho → modo acompanhado), só P01 e P05 dependem
  de gravação, e a etapa começou sem nenhuma — a P03 saiu com as sílabas ditas pela voz do
  aparelho, e trocar por gravação depois é só preencher o campo `audio`. **Pendente:** a qualidade da voz
  pt-BR varia por aparelho; usar o botão "Testar a voz" das configurações do Rael no iPad e no
  Android de casa e anotar aqui o nome da voz que aparecer.
- **Figuras.** Emojis do sistema mudam de desenho entre aparelhos; SVGs copiados de um conjunto
  livre resolvem isso sem ilustrar à mão. A P02 acabou não precisando de desenho próprio: silhueta
  é a figura pintada de cinza e pedaço é a figura recortada. Só parte da P12 ainda pede ilustração.
  **Cuidado herdado da P02:** recortar figura em grade deixa células em branco quando o desenho
  não preenche o quadro, e duas peças em branco ficam indistinguíveis. Medir a tinta por célula
  antes de escolher a figura.
- **Dois perfis no mesmo aparelho — resolvido de outro jeito.** Em vez de um seletor
  “Quem vai brincar?”, a P00 fez dois sites irmãos com abas no alto de cada página inicial.
  Cada lado tem tema, ícone de instalação, configurações e progresso próprios, e nenhum precisa
  saber do outro. Se um dia isso incomodar, o seletor continua sendo uma opção.
- **Peso do PWA.** O service worker pré-cacheia todo o `dist/`; a etapa não pode inflar a
  primeira visita. Limite de 8 MB para áudio e figuras da etapa, revisado a cada tarefa.
- **Escrita com o dedo** (traçar letras) ficou de fora de propósito: a seção 6.0 evita cobrar
  traçado, e um traçado livre sem avaliação rende pouco numa tela. Reavaliar depois de P06 e P09.

**Prompt base para esta etapa**
```
Abra MELHORIAS.md e implemente a tarefa <Pxx>. Leia as seções 3.0, 5 e 6; para idade,
dificuldade, duração, pontuação, fala e tamanho dos controles, prevalece a seção 6.0.
Verifique as dependências antes de começar. Reutilize shared/ (em especial fala.js,
descobertas.js e o catálogo de figuras) e os motores de J13/J14 quando indicado.
Entregue a atividade utilizável sem leitura, os arquivos locais de áudio e figuras com origem
registrada, a integração com a área Primeiras Descobertas, o registro no álbum e os testes da
lógica aplicáveis. No resumo, informe a revisão do conteúdo, os testes por toque, com voz
sintetizada e offline, o peso adicionado ao precache e o que ainda precisa ser observado com a
criança. Não marque validação com a criança como concluída sem realizá-la.
```
