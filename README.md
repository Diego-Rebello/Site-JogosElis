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
| Jogo da Velha | `Games/velha/` | React 19 + Vite 6 |

A página inicial (`index.html`) é o índice: ela lista os jogos em cartões e aponta para os
caminhos acima. Todos os links são relativos, então o site funciona em qualquer subpasta.

---

## Estrutura de pastas

```
.
├── index.html                       Página inicial com os cartões dos jogos
├── README.md                        Este arquivo
├── MELHORIAS.md                     Backlog de melhorias e de jogos novos
├── package.json                     Testes automatizados da lógica dos jogos
├── vitest.config.ts                 Configuração do Vitest
├── build-all.sh                     Gera o site completo em _site/
├── netlify.toml                     Testa, compila e publica _site/ no Netlify
├── _headers                         Regras de cache da hospedagem
├── .gitignore
├── .vscode/launch.json              Abre index.html no Chrome pelo VS Code
├── _redirects                       Redireciona os endereços antigos dos jogos (Netlify)
├── manifest.webmanifest             Nome, cores e ícones do app instalável (T21)
├── sw.js                            Modelo do service worker; o build injeta versão e lista
├── scripts/gerar-service-worker.mjs Gera o sw.js final a partir do que foi para _site/
├── shared/                          Biblioteca compartilhada pelos jogos (sem dependências)
│   ├── base.css                     Cores, fontes, botões, cartão, placar e feedback
│   ├── cabecalho.js                 Injeta a barra "🏠 Início / título / 🔊"
│   ├── texto.js                     normalizar, embaralhar, sortear, sortearVarios
│   ├── sons.js                      Efeitos sonoros gerados pela Web Audio API
│   ├── confete.js                   Chuva de confete em canvas
│   ├── progresso.js                 Histórico de partidas em localStorage
│   ├── demo.html                    Página que exercita tudo acima
│   └── fontes/                      Fredoka One, Pacifico e Nunito em .woff2
└── Games/
    ├── forca/index.html             Jogo da Forca
    ├── m-ou-n/index.html            Jogo do M ou N
    ├── matematica/                  Matemática (interface e lógica testável)
    ├── memoria/                     Jogo da Memória (React + Vite)
    │   ├── App.tsx, index.tsx, index.html, vite.config.ts, tsconfig.json
    │   └── dist/                    Build local ignorado pelo git
    └── velha/                       Jogo da Velha (React + Vite)
        ├── App.tsx, index.tsx, components/, lib/logica.ts, constants.tsx
        └── dist/                    Build local ignorado pelo git
```

Os jogos em HTML puro usam apenas HTML/CSS e módulos JavaScript locais, sem pacotes externos. Os dois jogos em React são compilados pelo
`build-all.sh`; suas pastas `dist/` são artefatos locais e não ficam no git.

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

## Como rodar e buildar os jogos React

Vale para `Games/memoria` e `Games/velha`. Requer Node.js 18 ou mais novo.

```bash
cd Games/memoria   # ou Games/velha

npm install     # instala as dependências (cria node_modules/, fora do git)
npm run dev     # servidor de desenvolvimento com recarga automática
npm run build   # gera a pasta dist/
npm run preview # serve o dist/ para conferir o resultado do build
npm run typecheck # confere os tipos sem gerar arquivos
```

As pastas `dist/` servem para conferência local e são ignoradas pelo git. No deploy, o Netlify
instala as dependências e refaz os dois builds a partir do código-fonte.

O CSS dos dois jogos é **Tailwind 4 compilado no build** (plugin `@tailwindcss/vite`), não mais
o "Play CDN". O ponto de entrada é o `index.css` de cada jogo, que importa o Tailwind e o
`shared/base.css`. Ele usa `source(none)` e `@source` explícitos de propósito: sem isso o
Tailwind varreria também o `dist/` gerado e realimentaria classes velhas a cada build.

---

## Testes e build completo

Na raiz, instale as dependências uma vez e rode a suíte de lógica pura:

```bash
npm install
npm test
```

Os testes cobrem texto e embaralhamento, M ou N, Matemática, Forca, Memória, progresso e as
duas inteligências do Jogo da Velha. Eles não precisam de navegador nem de rede.

Para reproduzir exatamente o site que o Netlify publica:

```bash
bash build-all.sh
npx serve _site
```

O script instala as dependências dos jogos React, compila seus arquivos e reúne somente o que
é público em `_site/`. Código-fonte TypeScript, configurações e dependências não são copiados.

---

## Funcionar offline (PWA)

O site é instalável e roda sem internet. Três peças:

| Arquivo | Papel |
|---|---|
| `manifest.webmanifest` | Nome, cores e ícones (192 e 512 px em `shared/icones/`) |
| `sw.js` | **Modelo** do service worker, com `__VERSAO__` e `__ARQUIVOS_PRECACHE__` |
| `shared/pwa.js` | Registra o service worker; incluído em todas as páginas |

O `build-all.sh` chama `scripts/gerar-service-worker.mjs`, que lista tudo o que foi para `_site/`,
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
bash build-all.sh
COMMIT_REF="dev-$(date +%s)" node scripts/gerar-service-worker.mjs sw.js _site/sw.js _site

# 2. Servir o _site (o service worker só funciona em localhost ou HTTPS)
python3 -m http.server 8000 --directory _site
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
- O `netlify.toml` roda `npm ci`, `npm test` e `bash build-all.sh`.
- Somente a pasta `_site/` é publicada; um teste quebrado impede o deploy.

Ou seja, **todo push (ou merge de PR) na `main` publica o site**. O fluxo de trabalho:

1. Crie uma branch a partir da `main`.
2. Faça as alterações e rode `npm test` e `bash build-all.sh`.
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
