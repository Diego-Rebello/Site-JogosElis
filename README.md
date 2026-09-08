# Jogos da Elis

Site estático com jogos educativos em português do Brasil, feito por um pai para os filhos.
Funciona no celular, no tablet e no computador, e não precisa de cadastro nem de internet rápida.

São **dois sites irmãos no mesmo endereço**, com abas para trocar de um para o outro:

| Site | Entrada | Público |
|---|---|---|
| **Jogos da Elis** | `index.html` | 9 anos (4.º ano): quinze jogos de palavras, contas, lógica e memória |
| **Jogos do Rael** | `rael/index.html` | 5 anos, pré-alfabetização: brincadeiras faladas, sem exigir leitura |

**No ar em:** https://jogosdaelis.netlify.app/

---

## Jogos

| Jogo | Arquivo de entrada | Tecnologia |
|---|---|---|
| Jogo da Forca | `Games/forca/index.html` | HTML/CSS/JS puro |
| Jogo da Memória — emojis ou contas | `Games/memoria/` | React 19 + Vite 7 |
| Matemática | `Games/matematica/index.html` | HTML/CSS/JS puro |
| Jogo do M ou N (toque ou digitar) | `Games/m-ou-n/index.html` | HTML/CSS/JS puro |
| Ortografia Divertida (7 regras) | `Games/ortografia/index.html` | HTML/CSS/JS puro |
| Tabuada Relâmpago | `Games/tabuada/index.html` | HTML/CSS/JS puro |
| Caça-Palavras | `Games/caca-palavras/index.html` | HTML/CSS/JS puro |
| Forme a Palavra | `Games/forme-palavra/index.html` | HTML/CSS/JS puro |
| Que Horas São? | `Games/horas/index.html` | HTML/CSS/JS puro |
| Genius das Cores | `Games/genius/index.html` | HTML/CSS/JS puro |
| Sudoku de Emojis | `Games/sudoku/index.html` | HTML/CSS/JS puro |
| Dinheirinho | `Games/dinheirinho/index.html` | HTML/CSS/JS puro |
| Quiz Sabe-Tudo | `Games/quiz/index.html` | HTML/CSS/JS puro |
| Labirinto de Aventuras | `Games/labirinto/index.html` | HTML/CSS/JS puro |
| Jogo da Velha | `Games/velha/` | React 19 + Vite 6 |

A página inicial (`index.html`) é o índice: ela lista os jogos em cartões e aponta para os
caminhos acima. Todos os links são relativos, então o site funciona em qualquer subpasta.

## Jogos do Rael — Primeiras Descobertas

Área própria para uma criança de 5 anos que ainda não lê. Mesma base de código, tema azul,
alvos de toque de 64 px, instrução falada em toda tela e nenhum cronômetro, vida ou recorde.

| Página | Arquivo de entrada | O que é |
|---|---|---|
| Casa do Rael | `rael/index.html` | Cartões das brincadeiras e o álbum de figurinhas |
| Toque na Figura | `rael/toque-na-figura/index.html` | Ouça o nome e toque na figura certa |
| Encaixe as Figuras | `rael/encaixe-as-figuras/index.html` | Leve cada figura à sua sombra e monte quebra-cabeças de 4 e 6 peças |
| Palmas nas Palavras | `rael/palmas-nas-palavras/index.html` | Uma palma para cada pedaço da palavra |
| Rimas com Figuras | `rael/rimas-com-figuras/index.html` | Ouça e encontre palavras que terminam com sons parecidos |
| Começa com o Mesmo Som | `rael/comeca-com-o-mesmo-som/index.html` | Compare o começo de palavras faladas |
| Letras para Explorar | `rael/letras-para-explorar/index.html` | Pareie, ouça e explore letras em caixa alta |
| Meu Primeiro Labirinto | `rael/meu-primeiro-labirinto/index.html` | Explore labirintos grandes de 9×9, 12×12 ou 15×15 no tablet e computador |
| Configurações | `rael/configuracoes.html` | Nome, opções, tema, voz, conjunto de letras e álbum |

O número de opções das configurações é o único botão de dificuldade da etapa: nas brincadeiras
de escolher entre figuras ele é a quantidade de alternativas; nas outras, `nivelDaEtapa()` o lê
como nível (2 = fácil, 3 = normal, 4 = esperto).

O progresso dele fica numa chave própria (`localStorage['jogos-elis:descobertas']`), então não
entra no Mural de Conquistas da Elis e não é apagado pelo "Zerar progresso" das configurações
dela. As próximas brincadeiras estão especificadas na seção 5 do [MELHORIAS.md](MELHORIAS.md).

---

## Estrutura de pastas

Desde a T23 o repositório é **um único projeto Vite**, com uma entrada por página.

```
.
├── index.html                       Página inicial da Elis, com os cartões dos jogos
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
│   ├── manifest.webmanifest         Nome, cores e ícones do app instalável (Elis)
│   ├── rael.webmanifest             O mesmo para os Jogos do Rael, com start_url /rael/
│   ├── figuras/                     SVGs do OpenMoji usados nas Primeiras Descobertas
│   ├── audio/                       Palavras e sons iniciais locais do Rael
│   └── icones/                      icone-*.png e rael-*.png (192 e 512) mais os .svg
├── shared/                          Biblioteca compartilhada (sem dependências externas)
│   ├── base.css                     Cores, fontes, botões, cartão, placar e feedback
│   ├── tema-rael.css                Os mesmos tokens repintados de azul, para /rael/
│   ├── descobertas.css              Peças de tela das brincadeiras do Rael
│   ├── cabecalho.js                 Módulo: montarCabecalho('Nome do jogo')
│   ├── texto.js                     normalizar, embaralhar, sortear, sortearVarios
│   ├── sons.js                      Efeitos sonoros gerados pela Web Audio API
│   ├── confete.js                   Confete em canvas e as animações de feedback
│   ├── progresso.js                 Histórico de partidas em localStorage
│   ├── fala.js                      Instrução falada em três camadas (Primeiras Descobertas)
│   ├── descobertas.js               Preferências, rodadas e álbum de figurinhas do Rael
│   ├── rodada.js                    Motor das rodadas curtas de alternativas
│   ├── catalogo-figuras.js          Nome, artigo e categoria de cada figura de public/figuras/
│   ├── pwa.js                       Registra o service worker
│   ├── demo.html                    Página que exercita tudo acima
│   └── fontes/                      Fredoka One, Pacifico e Nunito em .woff2
├── tests/                           Testes de lógica pura (Vitest)
├── rael/                            Jogos do Rael (área Primeiras Descobertas)
│   ├── index.html                   Casa do Rael: cartões e álbum
│   ├── configuracoes.html           Preferências do adulto para a etapa
│   ├── toque-na-figura/             index.html + tela.js
│   ├── encaixe-as-figuras/          index.html + dados.js + jogo.js + tela.js
│   ├── palmas-nas-palavras/         index.html + dados.js + jogo.js + tela.js
│   └── meu-primeiro-labirinto/      Tela infantil; reutiliza Games/labirinto/jogo.js
└── Games/
    ├── forca/                       index.html + jogo.js
    ├── m-ou-n/                      index.html + jogo.js
    ├── matematica/                  index.html + jogo.js
    ├── ortografia/                  index.html + jogo.js + tela.js + dados.js
    ├── tabuada/                     index.html + jogo.js + tela.js
    ├── caca-palavras/               index.html + jogo.js + tela.js + dados.js
    ├── forme-palavra/               index.html + jogo.js + tela.js + dados.js
    ├── horas/                       index.html + jogo.js + tela.js
    ├── genius/                      index.html + jogo.js + tela.js
    ├── sudoku/                      index.html + jogo.js + tela.js
    ├── dinheirinho/                 index.html + jogo.js + tela.js + dados.js
    ├── quiz/                         index.html + jogo.js + tela.js + dados.js
    ├── labirinto/                    index.html + jogo.js + tela.js + CSS; motor compartilhado com P07
    ├── memoria/                     index.html + main.tsx + App.tsx + components/ + lib/
    └── velha/                       index.html + main.tsx + App.tsx + components/ + lib/
```

Nenhuma subpasta tem `package.json`, `node_modules` ou `vite.config.ts` própria: são só
código-fonte. Os jogos em HTML puro também passam pelo bundler, então ganham
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

Módulo ES (virou módulo na T23; antes era script clássico com `data-titulo`):

```js
import { montarCabecalho } from '../../shared/cabecalho.js';
montarCabecalho('Jogo da Forca');
```

Injeta no topo do `<body>` a barra com "🏠 Início", o título e o botão 🔊/🔇. O caminho da
página inicial sai de `location.pathname`, então funciona em `Games/forca/`, em
`Games/memoria/` e dentro de `rael/` — onde o Início volta para a casa do Rael, não para a
raiz. Os jogos React não usam este arquivo: têm o componente `Cabecalho`, com o mesmo HTML
e as mesmas classes.

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

### `fala.js` — a voz das Primeiras Descobertas

A criança de 5 anos não lê, então toda instrução é falada. Gravar tudo daria centenas de
arquivos antes de a primeira brincadeira rodar, por isso a fala sai em três camadas, nesta
ordem: **gravação local** (quando o item tem `audio`) → **voz do próprio aparelho**
(`speechSynthesis` em pt-BR, que funciona offline depois de instalada) → **modo acompanhado**,
em que nada toca e a tela mostra a frase para um adulto ler.

| Função | O que faz |
|---|---|
| `preparar()` | Escolhe a voz pt-BR e destrava o iOS. Chamar dentro do primeiro toque |
| `falar(item)` | Devolve como falou: `'gravada'`, `'sintetizada'`, `'sem-som'` ou `'sem-fala'` |
| `falarSequencia(itens, { aoComecar })` | Fala em ordem, uma por vez; `aoComecar` avisa a tela antes de cada item |
| `repetir()` | Repete a última fala (o botão "Ouvir de novo") |
| `parar()` / `limpar()` | Cala gravação, síntese e fila pendente |
| `definirPreferencia(modo)` | `'auto'`, `'gravada'`, `'sintetizada'` ou `'sem-fala'` |
| `modoAcompanhado()` | `true` quando nada vai soar e o adulto precisa ler |
| `diagnostico()` | Estado atual: voz escolhida, mudo, se há síntese |

Um item é `{ texto, audio? }`. Só uma fala por vez, e sair da tela ou trocar de questão
interrompe a anterior. `configurarAmbiente()` existe para os testes trocarem o navegador por
um dublê.

Alguns aparelhos têm `speechSynthesis`, aceitam `speak()` e não falam nem avisam nada. Por isso
existe um relógio de 2,5 s esperando o evento `start`: depois de duas falas que nem começam, a
camada 2 é dada como perdida e o modo acompanhado assume na hora, em vez de a tela ficar
esperando o tempo máximo a cada frase.

### `descobertas.js`, `rodada.js` e `catalogo-figuras.js`

| Módulo | O que faz |
|---|---|
| `descobertas.js` | Preferências do adulto, rodadas por atividade, álbum de figurinhas e `nivelDaEtapa()`, em `localStorage['jogos-elis:descobertas']` |
| `rodada.js` | `montarDesafios()` sorteia alvos e alternativas sem repetir; `criarSessao()` conta tentativas e manda demonstrar depois de duas |
| `catalogo-figuras.js` | 62 figuras com nome, artigo (`o`/`a`) e categoria, mais os temas e `caminhoDaFigura(id)` |

As figuras são arquivos SVG em `public/figuras/`, e não emoji: o mesmo emoji é desenhado de um
jeito no iPad, de outro no Android e de outro no computador, e a criança precisa reconhecer a
figura. Os desenhos são do [OpenMoji](https://openmoji.org) (CC BY-SA 4.0) — a atribuição fica
em `public/figuras/LICENCA.txt`.

Aqui não existe estrela nem recorde de propósito: cada rodada terminada rende uma figurinha,
com ajuda ou sem ajuda.

### `tema-rael.css` e `descobertas.css`

`tema-rael.css` redeclara os tokens do `base.css` na classe `.tema-rael`, posta no `<html>`
das páginas de `rael/`. Como propriedade personalizada herda, tudo que já usa `var(--cor-…)`
muda de cor sem uma segunda folha inteira — inclusive `--toque`, que sobe de 44 px para 64 px
e faz todos os botões crescerem sozinhos.

`descobertas.css` traz as peças repetidas das brincadeiras: convite "Vamos brincar", instrução
com botão de repetir, grade de alternativas grandes, trilha de passos, roteiro do adulto,
tela de conclusão com figurinha e o álbum.

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
compila as vinte e cinco páginas em `dist/`, e `scripts/gerar-service-worker.mjs`, que lê o que foi
gerado e escreve o `dist/sw.js` com a lista de precache e a versão.

Os testes cobrem texto e embaralhamento, M ou N, Ortografia, Matemática, Tabuada, Caça-Palavras,
Forme a Palavra, Horas, Genius, Sudoku, Dinheirinho, Quiz, Forca, Memória, progresso, as duas
inteligências do Jogo da Velha e, das Primeiras Descobertas, a fala em camadas, o motor de
rodada, o álbum, a correspondência entre o catálogo e os arquivos de figura, as cenas de encaixe
e a divisão silábica das cinquenta palavras, além de rimas, sons iniciais e exploração de letras.
Eles importam o código-fonte direto (`Games/*/lib/…`,
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
| `public/rael.webmanifest` | O mesmo para os Jogos do Rael: `start_url` e `scope` em `/rael/`, ícone de foguete |
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

Feito com ❤️ para a Elis e o Rael se divertirem.
