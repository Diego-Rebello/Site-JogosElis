# Jogos da Elis

Site estático com jogos educativos em português do Brasil, feito por um pai para a filha Elis.
Cada jogo é pensado para criança de 9 anos (4.º ano), funciona no celular, no tablet e no
computador, e não precisa de cadastro nem de internet rápida.

**No ar em:** https://jogosdaelis.netlify.app/

---

## Jogos

| Jogo | Arquivo de entrada | Tecnologia |
|---|---|---|
| Jogo da Forca | `Games/forca/index.html` | HTML/CSS/JS puro |
| Jogo da Memória | `Games/memoria/` | React 19 + Vite 6 |
| Matemática | `Games/matematica/index.html` | HTML/CSS/JS puro |
| Jogo do M ou N (toque ou digitar) | `Games/m-ou-n/index.html` | HTML/CSS/JS puro |
| Ortografia Divertida (7 regras) | `Games/ortografia/index.html` | HTML/CSS/JS puro |
| Jogo da Velha | `Games/velha/` | React 19 + Vite 6 |

A página inicial (`index.html`) é o índice: ela lista os jogos em cartões e aponta para os
caminhos acima. Todos os links são relativos, então o site funciona em qualquer subpasta.

---

## Estrutura de pastas

Desde a T23 o repositório é **um único projeto Vite**, com uma entrada por página.

```
.
├── index.html                       Página inicial com os cartões dos jogos
├── configuracoes.html               Nome da criança, som e níveis
├── package.json                     Único do repositório: deps, build, testes e tipos
├── vite.config.ts                   Uma entrada por página (build.rollupOptions.input)
├── tsconfig.json                    Tipos de todo o código TypeScript
├── vitest.config.ts                 Configuração do Vitest
├── netlify.toml                     Testa, compila e publica dist/ no Netlify
├── sw.js                            Modelo do service worker; o build injeta versão e lista
├── scripts/gerar-service-worker.mjs Gera o sw.js final a partir do que foi para dist/
├── public/                          Copiado sem alteração para a raiz do dist/
│   ├── _headers                     Regras de cache da hospedagem
│   ├── _redirects                   Endereços antigos dos jogos (Netlify)
│   ├── manifest.webmanifest         Nome, cores e ícones do app instalável
│   └── icones/                      icone-192.png, icone-512.png e icone.svg
├── shared/                          Biblioteca compartilhada (sem dependências externas)
│   ├── base.css                     Cores, fontes, botões, cartão, placar e feedback
│   ├── cabecalho.js                 Módulo: montarCabecalho('Nome do jogo')
│   ├── texto.js                     normalizar, embaralhar, sortear, sortearVarios
│   ├── sons.js                      Efeitos sonoros gerados pela Web Audio API
│   ├── confete.js                   Confete em canvas e as animações de feedback
│   ├── progresso.js                 Histórico de partidas em localStorage
│   ├── pwa.js                       Registra o service worker
│   ├── demo.html                    Página que exercita tudo acima
│   └── fontes/                      Fredoka One, Pacifico e Nunito em .woff2
├── tests/                           Testes de lógica pura (Vitest)
└── Games/
    ├── forca/                       index.html + jogo.js
    ├── m-ou-n/                      index.html + jogo.js
    ├── matematica/                  index.html + jogo.js
    ├── ortografia/                  index.html + jogo.js + tela.js + dados.js
    ├── memoria/                     index.html + main.tsx + App.tsx + components/ + lib/
    └── velha/                       index.html + main.tsx + App.tsx + components/ + lib/
```

Nenhuma subpasta tem `package.json`, `node_modules` ou `vite.config.ts` própria: são só
código-fonte. Os três jogos em HTML puro também passam pelo bundler agora, então ganham
minificação e hash de cache como os dois em React.

**O que fica de fora do bundler:** o que está em `public/`. O `manifest.webmanifest` aponta
para os ícones por caminho fixo, então eles não podem ganhar hash; `_headers` e `_redirects`
são lidos pelo Netlify e precisam do nome exato.

---

## A biblioteca `shared/`

Tudo aqui é código próprio, sem framework e sem CDN, escrito em módulos ES. Para ver as peças
funcionando, sirva o projeto e abra `shared/demo.html`.

### `base.css`

Basta um `<link>`. Define os tokens (`--cor-principal`, `--cor-secundaria`, `--cor-destaque`,
`--fonte-titulo`, `--fonte-corpo`, `--fonte-leitura`, `--toque`) e as classes:

`.pagina`, `.pagina__conteudo`, `.pagina__conteudo--centro`, `.cabecalho`, `.botao`,
`.botao--secundario`, `.botao--sucesso`, `.botao--neutro`, `.cartao`, `.placar`,
`.placar__certo`, `.placar__errado`, `.campo`, `.feedback`, `.feedback--certo`,
`.feedback--errado`, `.so-leitor`, `.pular`, `.tremer`.

Todo alvo de toque tem no mínimo 44 px, há `:focus-visible` visível em tudo e as animações
somem com `prefers-reduced-motion: reduce`. O arquivo **não estiliza elementos crus**
(`body`, `button`, `input`): é tudo classe, para poder conviver com o Tailwind dos dois
jogos React sem atropelar os utilitários deles.

### `cabecalho.js`

Script clássico (sem `type="module"`, porque ele lê o próprio `data-titulo`):

```html
<script src="../../shared/cabecalho.js" data-titulo="Jogo da Forca"></script>
```

Injeta no topo do `<body>` a barra com "🏠 Início", o título e o botão 🔊/🔇. O caminho da
página inicial sai de `location.pathname`, então funciona tanto em `Games/forca/` quanto em
`Games/memoria/`. Os jogos React não usam este arquivo: têm o componente `Cabecalho`,
com o mesmo HTML e as mesmas classes.

### `texto.js`

| Função | O que faz |
|---|---|
| `normalizar(texto)` | Tira acentos e cedilha e sobe para maiúsculas: `"coração"` → `"CORACAO"` |
| `embaralhar(lista)` | Cópia embaralhada por Fisher-Yates (sem o viés do `sort` aleatório) |
| `sortear(lista, evitar)` | Um item ao acaso, tentando não repetir `evitar` |
| `sortearVarios(lista, n)` | `n` itens diferentes, já embaralhados |

### `sons.js`

| Função | O que faz |
|---|---|
| `tocar(nome)` | `'clique'`, `'acerto'`, `'erro'` ou `'vitoria'` |
| `estaMudo()` | Lê o estado atual |
| `alternarMudo()` | Inverte e devolve o novo estado |
| `definirMudo(valor)` | Força ligado/desligado |

Sem arquivos de áudio: as notas são geradas pela Web Audio API. O `AudioContext` só nasce na
primeira chamada de `tocar()`, que na prática acontece dentro de um toque do usuário — é o que
o iOS exige. O mudo fica em `localStorage['jogos-elis:mudo']`.

### `confete.js`

`lancarConfete(duracaoMs = 1500)` — canvas em tela cheia, ~80 partículas nas cores dos tokens,
`pointer-events: none`, some sozinho no fim. Não faz nada com `prefers-reduced-motion: reduce`.

`animar(elemento, classe)` — dispara `.pular` (acerto) ou `.tremer` (erro) do `base.css`,
reiniciando a animação se ela já estiver rodando.

### `progresso.js`

| Função | O que faz |
|---|---|
| `registrarPartida(jogoId, { acertos, erros, estrelas })` | Soma uma partida e devolve o registro |
| `obterProgresso()` | O objeto inteiro (`{}` se ainda não houver nada) |
| `estrelasDe(jogoId)` | Melhor quantidade de estrelas já conquistada |
| `calcularEstrelas(acertos, erros)` | 3 se acertou ≥ 90 %, 2 se ≥ 70 %, 1 por terminar |
| `zerarProgresso()` | Apaga tudo |

Guardado em `localStorage['jogos-elis:progresso']`, só neste aparelho:

```json
{ "forca": { "partidas": 12, "acertos": 30, "erros": 10, "melhorEstrelas": 3, "ultimaEm": "2026-09-06T14:00:00Z" } }
```

---

## Como abrir localmente

Os jogos usam caminhos relativos, então basta servir a raiz do projeto:

```bash
# opção 1 — Node
npx serve .

# opção 2 — Python
python3 -m http.server 8000
```

Depois abra http://localhost:3000 (npx serve) ou http://localhost:8000 (Python).

**Não abra com dois cliques.** Desde a T10 os três jogos em HTML puro também usam
`<script type="module">` para importar `shared/texto.js`, e módulos ES não carregam pelo
protocolo `file://`. Use sempre um dos servidores acima.

No VS Code, a configuração "Open index" (`.vscode/launch.json`) abre o `index.html` no Chrome.

---

## Como desenvolver, testar e compilar

Um `package.json` só, na raiz. Requer Node.js 20.19+ ou 22.12+ (exigência do Vite 7).

```bash
npm install       # uma vez

npm run dev       # servidor de desenvolvimento, com todas as páginas
npm test          # testes de lógica pura (sem navegador, sem rede)
npm run typecheck # confere os tipos sem gerar arquivos
npm run build     # gera o dist/ completo e o service worker
npm run preview   # serve o dist/ para conferir o resultado
```

O `npm run build` é exatamente o que o Netlify roda. Ele faz duas coisas: `vite build`, que
compila as nove páginas em `dist/`, e `scripts/gerar-service-worker.mjs`, que lê o que foi
gerado e escreve o `dist/sw.js` com a lista de precache e a versão.

Os testes cobrem texto e embaralhamento, M ou N, Ortografia, Matemática, Forca, Memória,
progresso e as duas inteligências do Jogo da Velha. Eles importam o código-fonte direto (`Games/*/lib/…`,
`Games/*/jogo.js`, `shared/…`), sem passar pelo build.

### Tailwind

Os dois jogos React usam **Tailwind 4 compilado no build** (plugin `@tailwindcss/vite`). O
ponto de entrada é o `index.css` de cada jogo, que importa o Tailwind e o `shared/base.css`.
Ele usa `source(none)` com `@source` explícitos de propósito: sem isso o Tailwind varreria
também o `dist/` gerado e realimentaria classes velhas a cada build.

---

## Funcionar offline (PWA)

O site é instalável e roda sem internet. Três peças:

| Arquivo | Papel |
|---|---|
| `public/manifest.webmanifest` | Nome, cores e ícones (192 e 512 px em `public/icones/`) |
| `sw.js` | **Modelo** do service worker, com `__VERSAO__` e `__ARQUIVOS_PRECACHE__` |
| `shared/pwa.js` | Registra o service worker; incluído em todas as páginas |

O `npm run build` chama `scripts/gerar-service-worker.mjs`, que lista tudo o que foi para `dist/`,
injeta essa lista no modelo e carimba a versão. A versão é o `COMMIT_REF` do Netlify (ou o SHA
curto do commit local), então **cada deploy gera um cache novo** e o service worker apaga os
antigos ao ativar. O `_headers` manda `Cache-Control: no-cache` no `sw.js`, então o navegador
percebe a troca na abertura seguinte.

Estratégia: páginas HTML vão pela rede primeiro (para pegar novidades) e caem no cache se não
houver internet; o resto vem do cache primeiro.

### Por que as respostas são recriadas antes de ir para o cache

O Netlify responde `/Games/forca/` com um 301 para `/games/forca/`. O `fetch` segue o desvio e
traz o conteúdo certo, mas a resposta fica marcada como *redirecionada* — e o navegador se
recusa a usar uma resposta assim para uma navegação. O sintoma era específico: a página inicial
abria offline e **nenhum dos cinco jogos abria**. Por isso o `sw.js` recria a `Response` antes de
guardar, o que descarta a marca. O precache também baixa um endereço de cada vez, em vez de usar
`cache.addAll`: com `addAll`, um único endereço com problema derrubaria o modo offline inteiro.

### Forçar a atualização do cache durante o desenvolvimento

Como o `sw.js` local carimba o SHA do commit, editar um arquivo **não** troca a versão sozinho.
Enquanto estiver mexendo no site:

```bash
# 1. Gerar o site com uma versão inventada, para forçar cache novo a cada rodada
npm run build
COMMIT_REF="dev-$(date +%s)" node scripts/gerar-service-worker.mjs sw.js dist/sw.js dist

# 2. Servir o dist/ (o service worker só funciona em localhost ou HTTPS)
npm run preview
```

No navegador, o caminho mais rápido é o DevTools → **Application**:

- **Service Workers** → marque *Update on reload* (e *Bypass for network* para ignorar o cache);
- **Storage** → *Clear site data* apaga service worker, caches e `localStorage` de uma vez.

Pelo console dá para limpar tudo sem o DevTools:

```js
for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
for (const n of await caches.keys()) await caches.delete(n);
location.reload();
```

Para testar o modo avião de verdade, use DevTools → Network → *Offline*, e não o wi-fi do
computador: assim só a aba fica sem rede.

---

## Como publicar

A publicação é automática:

- Hospedagem: **Netlify**, projeto `jogosdaelis`.
- Deploy contínuo a partir do GitHub, branch `main`, com *auto publishing* ligado.
- O `netlify.toml` roda `npm ci`, `npm test` e `npm run build`.
- Somente a pasta `dist/` é publicada; um teste quebrado impede o deploy.

Ou seja, **todo push (ou merge de PR) na `main` publica o site**. O fluxo de trabalho:

1. Crie uma branch a partir da `main`.
2. Faça as alterações e rode `npm test` e `npm run build`.
3. Abra um PR e confira todos os jogos na URL de preview criada pelo Netlify.
4. Mescle na `main` somente depois da validação. O Netlify testa e publica em seguida.

No painel do Netlify, o comando e a pasta de publicação vêm do `netlify.toml`. Recomenda-se
manter a otimização “Pretty URLs” desligada para o preview corresponder ao build local.

---

## Backlog

O plano de melhorias técnicas e a lista de jogos novos estão em [MELHORIAS.md](MELHORIAS.md).
Cada tarefa lá tem passos, critérios de aceite e um prompt pronto para ser executado.

---

Feito com ❤️ para a Elis se divertir.
