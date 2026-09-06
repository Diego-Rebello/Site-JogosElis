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
| Jogo da Memória | `Games/memoria/dist/index.html` | React 19 + Vite 6 |
| Matemática | `Games/matematica/index.html` | HTML/CSS/JS puro |
| Jogo do M ou N (toque ou digitar) | `Games/m-ou-n/index.html` | HTML/CSS/JS puro |
| Jogo da Velha | `Games/velha/dist/index.html` | React 19 + Vite 6 |

A página inicial (`index.html`) é o índice: ela lista os jogos em cartões e aponta para os
caminhos acima. Todos os links são relativos, então o site funciona em qualquer subpasta.

---

## Estrutura de pastas

```
.
├── index.html                       Página inicial com os cartões dos jogos
├── README.md                        Este arquivo
├── MELHORIAS.md                     Backlog de melhorias e de jogos novos
├── .gitignore
├── .vscode/launch.json              Abre index.html no Chrome pelo VS Code
├── _redirects                       Redireciona os endereços antigos dos jogos (Netlify)
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
    │   └── dist/                    Build publicado (versionado no git de propósito)
    └── velha/                       Jogo da Velha (React + Vite)
        ├── App.tsx, index.tsx, components/, lib/logica.ts, constants.tsx
        └── dist/                    Build publicado (versionado no git de propósito)
```

Os jogos em HTML puro ficam cada um em um único arquivo, sem dependências locais.
Os dois jogos em React têm o `dist/` versionado porque o Netlify publica a raiz do
repositório sem rodar build (ver "Como publicar").

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
`Games/memoria/dist/`. Os jogos React não usam este arquivo: têm o componente `Cabecalho`,
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

**Importante:** depois de mudar qualquer código de um jogo React, rode `npm run build` e
commite também a pasta `dist/`. É ela que vai ao ar.

O CSS dos dois jogos é **Tailwind 4 compilado no build** (plugin `@tailwindcss/vite`), não mais
o "Play CDN". O ponto de entrada é o `index.css` de cada jogo, que importa o Tailwind e o
`shared/base.css`. Ele usa `source(none)` e `@source` explícitos de propósito: sem isso o
Tailwind varreria também o `dist/` commitado e realimentaria classes velhas a cada build.

---

## Como publicar

A publicação é automática:

- Hospedagem: **Netlify**, projeto `jogosdaelis`.
- Deploy contínuo a partir do GitHub, branch `main`, com *auto publishing* ligado.
- Sem comando de build e sem pasta de publicação definida: o Netlify publica a raiz do
  repositório como está.

Ou seja, **todo push (ou merge de PR) na `main` publica o site**. O fluxo de trabalho:

1. Crie uma branch a partir da `main`.
2. Faça as alterações. Se mexeu em jogo React, rode `npm run build` e commite o `dist/`.
3. Teste localmente com um dos servidores acima.
4. Abra o PR e mescle na `main`. O Netlify publica em seguida.

---

## Backlog

O plano de melhorias técnicas e a lista de jogos novos estão em [MELHORIAS.md](MELHORIAS.md).
Cada tarefa lá tem passos, critérios de aceite e um prompt pronto para ser executado.

---

Feito com ❤️ para a Elis se divertir.
