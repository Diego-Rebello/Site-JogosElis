# Plano de Implementação — P16 · Chute a Gol (Jogos do Rael)

> Plano por etapas para um modelo executor. **Cada etapa tem critérios de aceite objetivos:
> comandos com o resultado esperado e itens que o Diego confere no navegador.** Uma etapa só
> está pronta quando **todos** os critérios dela passam. Nenhuma etapa começa antes de a anterior
> ser aceita.
>
> Criado em 2026-09-19, revisado no mesmo dia (critérios de aceite endurecidos, decisões
> em aberto fechadas, integração com `criarSessao` corrigida). Linha de base medida na `main`
> nessa data: **27 arquivos de teste, 250 testes, todos passando.**

---

## 0. Regras para o modelo executor (ler antes de qualquer coisa)

### 0.1 Leitura obrigatória

1. [MELHORIAS.md](MELHORIAS.md): seções **2.2** (regras gerais; atenção à **regra 10**, a do
   caminho com ":"), **4.0**, **5.0** (regras da etapa do Rael) e **6** (checklist).
2. Os arquivos que servem de modelo, **inteiros**:
   `rael/rimas-com-figuras/index.html`, `rael/rimas-com-figuras/tela.js`,
   `rael/rimas-com-figuras/jogo.js`, `tests/rimas-com-figuras.test.js`, `shared/rodada.js`.

Em conflito, a ordem de precedência é: **seção 5.0 do MELHORIAS.md > este plano > o seu julgamento.**

### 0.2 Proibições (qualquer uma delas reprova a etapa)

| # | Proibido | Como o Diego confere |
|---|---|---|
| P1 | Alterar qualquer arquivo fora da lista da seção 2 | `git diff --name-only main` |
| P2 | Alterar `shared/descobertas.js`, `shared/rodada.js`, `shared/fala.js`, `shared/sons.js`, `shared/confete.js`, `shared/conquistas-tela.js`, `Games/`, outros jogos de `rael/` ou testes existentes | `git diff --stat main -- shared/descobertas.js shared/rodada.js shared/fala.js shared/sons.js shared/confete.js shared/conquistas-tela.js Games tests` deve listar **somente** `tests/chute-a-gol.test.js` |
| P3 | Alterar `package.json` ou `package-lock.json`, ou instalar dependência | `git diff --stat main -- package.json package-lock.json` vazio |
| P4 | Usar `.skip`, `.only`, `.todo` ou apagar/enfraquecer teste para "passar" | `grep -nE "\.(skip\|only\|todo)\(" tests/chute-a-gol.test.js` vazio |
| P5 | Emoji como figura do jogo (⚽ 🥅 🧤 🧑 etc.). Emojis só nos rótulos de botão já usados no site (🔊 🔁 🏠 ▶) | `grep -nE "⚽\|🥅\|🧤" rael/chute-a-gol/*` vazio |
| P6 | Movimento do goleiro durante a mira, cronômetro ou qualquer coisa que dependa de rapidez | `grep -nE "setInterval\|requestAnimationFrame" rael/chute-a-gol/*` vazio |
| P7 | Acessar `localStorage` direto (só via `shared/descobertas.js`) | `grep -n "localStorage" rael/chute-a-gol/*` vazio |
| P8 | `Math.random` em `jogo.js` (o sorteio entra por `embaralharLista`) | `grep -n "Math.random" rael/chute-a-gol/jogo.js` vazio |
| P9 | Texto visível em inglês, vidas, placar de erros, "Errou", "Perdeu" | `grep -niE "goal!\|missed\|errou\|perdeu\|vidas" rael/chute-a-gol/*` vazio |
| P10 | Copiar código do repositório de referência | Revisão do Diego |
| P11 | Commitar `dist/`, `node_modules/`, `.DS_Store` ou arquivos com " 2" no nome | `git show --stat HEAD` |
| P12 | Merge em `main`, push em `main` ou deploy | `git log main -1` inalterado |
| P13 | Editar ou importar os arquivos duplicados com " 2" no nome (ex.: `shared/conquistas-descobertas 2.js`); são cópias do Finder e estão fora do git | `grep -rn " 2\.js" rael/chute-a-gol` vazio |

### 0.3 Regras de conduta

- **Se algo do plano não funcionar como descrito, PARE** e explique no relatório. Não
  improvise mudança em `shared/`, não "conserte" outros jogos, não mude o escopo.
- **Não declare como feito o que não foi verificado.** Se não conseguiu abrir o navegador,
  escreva "não verificado no navegador" no item, sem marcar ✅.
- Uma etapa por vez, **um commit por etapa**, com a mensagem exata indicada, na branch
  `p16-chute-a-gol` criada a partir de `main`.
- Comandos (binários locais, **regra 10**; não use `npx`):
  - Testes: `node ./node_modules/vitest/vitest.mjs run`
  - Tipos: `node ./node_modules/typescript/bin/tsc --noEmit`
  - Build: `node ./node_modules/vite/bin/vite.js build && node scripts/gerar-service-worker.mjs sw.js dist/sw.js dist`
  - Servidor: `node ./node_modules/vite/bin/vite.js`

> Observação: o `tsc` **não** verifica os `.js` de `rael/` (o `tsconfig.json` não inclui
> `allowJs`). Ele só garante que nada do resto quebrou; a garantia real do motor vem dos testes.

### 0.4 Relatório obrigatório ao fim de cada etapa

Colar exatamente este modelo preenchido:

```
## Etapa N — relatório
Commit: <hash> <mensagem>
Arquivos alterados (git diff --name-only HEAD~1): <lista>

Comandos (colar as últimas linhas da saída real):
- testes: <Test Files X passed (X) / Tests Y passed (Y)>
- tsc: <saída; vazia = ok>
- build: <última linha>
- verificações de proibição 0.2 rodadas: <P1..P13: ok / falhou>

Critérios de aceite da etapa:
- [x] A1 ... (como verifiquei)
- [ ] A2 ... NÃO VERIFICADO / FALHOU: <motivo>

Desvios do plano: <nenhum | lista com motivo>
Dúvidas para o Diego: <nenhuma | lista>
```

---

## 1. Resumo da tarefa

| Campo | Valor |
|---|---|
| ID | **P16** |
| Nome | **Chute a Gol** |
| Pasta | `rael/chute-a-gol/` |
| Id da atividade | `chute-a-gol` (chave no álbum e no catálogo de conquistas) |
| Figura do cartão | `/figuras/bola.svg` (já existe) |
| Depende de | P00 e P15 (prontas) |
| Objetivos da BNCC | Noções de espaço: esquerda, direita, meio, alto e baixo (campo "Espaços, tempos, quantidades, relações e transformações"); número e quantidade na contagem dos gols (EI05ET07); coordenação manual pelo toque (EI05CG05) |

**A ideia em uma frase:** a criança vê um gol dividido em 2, 3 ou 4 partes, cada uma com uma
figura. O goleiro (um bichinho do catálogo) fica **parado** em uma delas. A criança toca numa
parte onde o goleiro não está, ou na figura que a voz pediu, e a bola voa para a rede. No fim,
os gols são contados em voz alta.

### 1.1 Repositório de referência (só a ideia)

<https://github.com/hackingstar124/Football-game-in-HTML> (Apache 2.0). São 4 arquivos, com
controle só por teclado, emojis do sistema, caminhos `F:\...`, goleiro que depende de reflexo e
a variável `footballPos` nunca declarada (o script quebra). **Nenhuma linha dele entra no
projeto.** Aproveita-se só a ideia: gol no alto, bola embaixo e chute animado.

### 1.2 Regras do jogo (decisões fechadas: não escolher alternativas)

| Tema | Decisão |
|---|---|
| Número de zonas | `obterConfiguracoes().alternativas` (2, 3 ou 4) |
| Zonas com 2 | `esquerda`, `direita` (uma linha) |
| Zonas com 3 | `esquerda`, `meio`, `direita` (uma linha) |
| Zonas com 4 | `alto-esquerda`, `alto-direita`, `baixo-esquerda`, `baixo-direita` (grade 2×2) |
| Rótulos falados | "à esquerda", "no meio", "à direita", "no alto, à esquerda", etc. |
| Chutes por rodada | **6**, alternando `livre`, `figura`, `livre`, `figura`, `livre`, `figura` |
| Desafio `livre` | Vale qualquer zona sem goleiro. Pista: "O goleiro está aqui. Chute onde ele não está!" |
| Desafio `figura` | Vale só a zona da figura pedida. O goleiro **nunca** fica nela. Pista: "Chute a bola perto do sapo!" — montar com `perto d${figura(id).artigo} ${figura(id).nome}` (`nomeComArtigo` devolve "o sapo", então não serve direto depois de "perto d") |
| Goleiro | Um bichinho de `GOLEIROS`, **só a imagem** (sem desenhar luvas), escolhido por `rodadasDe('chute-a-gol') % GOLEIROS.length`, sem sorteio |
| Goleiro durante a mira | Parado. Só se move **entre** desafios, antes da pista ser falada |
| Zona do goleiro | Continua tocável; tocar nela é "defesa" |
| Retorno de defesa | `tocar('clique')`, fala "O goleiro pegou! Chute onde ele não está." e a pista é repetida |
| Retorno de figura errada | `tocar('clique')`, fala "Esse é o {nome}. Procure {nomeComArtigo(alvo)}." |
| Depois de 2 tentativas erradas | A zona certa pisca (`.zona-gol--mostrada`), o goleiro escorrega, só essa zona fica ativa e o toque nela é gol |
| Depois do gol | Botão **"Continuar ▶"** aparece e recebe foco (**não** avança sozinho) |
| Som | `tocar('acerto')` no gol, `tocar('clique')` nos toques e `tocar('vitoria')` no fim. **Nunca** `tocar('erro')` |
| Placar | Só "bolas na rede": uma bolinha acesa por gol, sem número e sem contar defesas |
| Fim | Contagem falada de 1 a 6, figurinha (`registrarRodada`) e conquistas (`anunciarConquistas`) |
| Demonstração | Um desafio `livre` guiado antes da primeira rodada, como nas Rimas |

---

## 2. Arquivos permitidos (qualquer outro reprova — P1)

| Arquivo | Ação |
|---|---|
| `rael/chute-a-gol/index.html` | novo |
| `rael/chute-a-gol/dados.js` | novo |
| `rael/chute-a-gol/jogo.js` | novo, motor puro sem DOM |
| `rael/chute-a-gol/tela.js` | novo |
| `rael/chute-a-gol/chute-a-gol.css` | novo |
| `tests/chute-a-gol.test.js` | novo |
| `vite.config.ts` | **só** acrescentar uma linha no objeto `paginas` |
| `rael/index.html` | **só** acrescentar o cartão e ajustar a frase "Em breve" |
| `shared/conquistas-descobertas.js` | **só** acrescentar uma linha em `ATIVIDADES_DESCOBERTAS` (etapa 5) |
| `README.md`, `MELHORIAS.md` | documentação (etapa 6) |

---

## Etapa 1 — Esqueleto da página e rota no build

**Fazer:**

1. `rael/chute-a-gol/index.html`, copiando a estrutura de `rael/rimas-com-figuras/index.html`
   (mesmo `<head>`, com `class="tema-rael"`, os três CSS de `shared/`, o manifest
   `/rael.webmanifest` e `shared/pwa.js`), mais o `<link rel="stylesheet" href="./chute-a-gol.css">`.
   - `<title>Chute a Gol — Jogos do Rael</title>` e `meta description` em pt-BR.
   - IDs obrigatórios (as etapas seguintes dependem deles):
     `tela-convite`, `comecar`, `aviso-voz`, `tela-brincadeira`, `passos`, `instrucao`,
     `repetir`, `campo`, `gol`, `zonas`, `goleiro`, `bola`, `placar`, `retorno`, `continuar`,
     `roteiro`, `roteiro-fala`, `tela-fim`, `bolas-fim`, `figurinha`, `texto-fim`, `de-novo`.
   - Convite: `bola.svg` grande, `<h2>` "Chute a Gol", frase curta e botão `#comecar`
     "▶ Vamos brincar".
2. `rael/chute-a-gol/tela.js` mínimo: `montarCabecalho('Chute a Gol')`,
   `definirPreferencia(obterConfiguracoes().voz)` e a tela de convite visível.
3. `rael/chute-a-gol/chute-a-gol.css` pode começar vazio.
4. `vite.config.ts`: acrescentar `'rael-chute-a-gol': 'rael/chute-a-gol/index.html',` logo
   depois de `'rael-meu-primeiro-labirinto'`.
5. `rael/index.html`: cartão depois do labirinto, no mesmo formato dos outros:
   ```html
   <a href="chute-a-gol/index.html" class="cartao atividade">
       <img class="atividade__figura" src="/figuras/bola.svg" alt="" aria-hidden="true" width="92" height="92">
       <span class="atividade__nome">Chute a Gol</span>
       <span class="atividade__conta" data-rodadas="chute-a-gol"></span>
   </a>
   ```

**Critérios de aceite:**

- [ ] A1.1 Build termina sem erro e `ls dist/rael/chute-a-gol/index.html` existe.
- [ ] A1.2 `grep -c "chute-a-gol" dist/sw.js` ≥ 1.
- [ ] A1.3 Testes: **27 arquivos / 250 testes, todos passando** (nada mudou ainda).
- [ ] A1.4 Os 22 IDs obrigatórios existem: `for i in tela-convite comecar aviso-voz tela-brincadeira passos instrucao repetir campo gol zonas goleiro bola placar retorno continuar roteiro roteiro-fala tela-fim bolas-fim figurinha texto-fim de-novo; do grep -q "id=\"$i\"" rael/chute-a-gol/index.html || echo "FALTA $i"; done` não imprime nada.
- [ ] A1.5 `git diff --name-only main` lista só: os arquivos novos de `rael/chute-a-gol/`, `vite.config.ts` e `rael/index.html`.
- [ ] A1.6 `git diff main -- vite.config.ts` mostra **uma** linha adicionada e nenhuma removida.
- [ ] A1.7 Proibições da seção 0.2 verificadas.

**Verificação do Diego (2 min):** abrir `http://localhost:5173/rael/`, tocar no cartão
"Chute a Gol" e ver o convite com o tema azul; console sem erros e aba Network sem 404.

**Commit:** `Adiciona esqueleto do Chute a Gol na area do Rael`

---

## Etapa 2 — Motor puro (`dados.js`, `jogo.js`) e testes

### 2.1 `dados.js` (conteúdo exato)

```js
/** Figuras que podem aparecer nas zonas do gol: nomes curtos e fáceis de falar. */
export const FIGURAS_ALVO = ['sapo', 'gato', 'sol', 'estrela', 'peixe', 'pato', 'lua', 'flor',
  'maca', 'uva', 'bolo', 'vaca'];

/** Bichinhos que fazem o papel de goleiro; um por rodada, em rodízio. */
export const GOLEIROS = ['urso', 'pinguim', 'macaco', 'leao'];

export const QUANTIDADE_DE_CHUTES = 6;
```

(Todos esses ids foram conferidos no catálogo em 2026-09-19. As duas listas não têm figura em
comum.)

### 2.2 `jogo.js`: API exata

Importar só de `../../shared/catalogo-figuras.js`, `../../shared/texto.js` e `./dados.js`.
Nada de `document`, `window`, `localStorage` ou `Math.random`.

```js
export const ZONAS_POR_QUANTIDADE = {
  2: [{ id: 'esquerda', rotulo: 'à esquerda' }, { id: 'direita', rotulo: 'à direita' }],
  3: [{ id: 'esquerda', rotulo: 'à esquerda' }, { id: 'meio', rotulo: 'no meio' }, { id: 'direita', rotulo: 'à direita' }],
  4: [{ id: 'alto-esquerda', rotulo: 'no alto, à esquerda' }, { id: 'alto-direita', rotulo: 'no alto, à direita' },
      { id: 'baixo-esquerda', rotulo: 'embaixo, à esquerda' }, { id: 'baixo-direita', rotulo: 'embaixo, à direita' }],
};

/** Valor fixo de respostaId: é o que liga o motor ao criarSessao (ver 2.3). */
export const RESPOSTA_GOL = 'gol';

/** Lista de zonas para 2, 3 ou 4; qualquer outro valor usa 3. Devolve cópia. */
export function zonasDoGol(alternativas) {}

/**
 * Monta os desafios da rodada. Cada desafio tem exatamente estes campos:
 * {
 *   tipo: 'livre' | 'figura',
 *   zonas: [{ id, rotulo, figuraId }],   // uma figura distinta por zona, de FIGURAS_ALVO
 *   goleiroZona: string,                 // id de uma das zonas
 *   alvoZona: string | null,             // só no tipo 'figura'; nunca igual a goleiroZona
 *   alvoFiguraId: string | null,         // figuraId da alvoZona; null no 'livre'
 *   respostaId: RESPOSTA_GOL,
 * }
 * Tipos alternados começando por 'livre'. alvoFiguraId não se repete na rodada.
 */
export function montarRodadaChute({ alternativas = 3, quantidade = QUANTIDADE_DE_CHUTES, embaralharLista = embaralhar } = {}) {}

/** 'gol' | 'defesa' | 'outra-figura'. Função pura. */
export function resultadoDoChute(desafio, zonaId) {}

/** Zona ativa na demonstração: 'figura' → alvoZona; 'livre' → primeira zona (na ordem de `zonas`) sem goleiro. */
export function zonaDemonstrada(desafio) {}

/** Goleiro da rodada, em rodízio: GOLEIROS[rodadas % GOLEIROS.length]. */
export function goleiroDaRodada(rodadas) {}
```

Regra de `resultadoDoChute`, nesta ordem:
1. `zonaId === desafio.goleiroZona` → `'defesa'`
2. `desafio.tipo === 'figura' && zonaId !== desafio.alvoZona` → `'outra-figura'`
3. qualquer outro caso → `'gol'`

### 2.3 Integração com `criarSessao` (importante: não alterar `shared/rodada.js`)

`criarSessao().responder(id)` compara `id` com `desafio.respostaId`. Como no tipo `livre`
várias zonas valem, **a tela nunca passa o id da zona para a sessão**. Ela passa o resultado:

```js
const resultado = resultadoDoChute(desafio, zonaId); // 'gol' | 'defesa' | 'outra-figura'
const retorno = sessao.responder(resultado);          // certo quando resultado === 'gol'
```

Se isso não funcionar como descrito, **pare** e reporte (regra 0.3).

### 2.4 `tests/chute-a-gol.test.js`

`describe('Chute a Gol (P16)', ...)` com **pelo menos estes 12 testes**, nomeados assim:

1. `todas as figuras de FIGURAS_ALVO e GOLEIROS existem no catálogo`
2. `FIGURAS_ALVO e GOLEIROS não têm figura em comum`
3. `zonasDoGol devolve 2, 3 e 4 zonas com ids distintos e usa 3 para valor inválido`
4. `montarRodadaChute devolve QUANTIDADE_DE_CHUTES desafios para 2, 3 e 4 zonas`
5. `os tipos alternam começando por livre`
6. `as figuras de um desafio são distintas e vêm de FIGURAS_ALVO`
7. `goleiroZona é sempre uma das zonas do desafio`
8. `no tipo figura o goleiro nunca está na zona pedida`
9. `a figura pedida não se repete na rodada`
10. `resultadoDoChute: goleiro dá defesa, figura errada dá outra-figura, o resto dá gol` (cobrir `livre` e `figura`)
11. `zonaDemonstrada sempre dá gol em resultadoDoChute` (para todos os desafios de rodadas com 2, 3 e 4 zonas)
12. `é determinístico com embaralharLista identidade e goleiroDaRodada faz rodízio`

Os testes 4 a 9 e 11 rodam em laço para `alternativas` 2, 3 e 4 e também com o
`embaralhar` real, 50 vezes cada, para pegar casos aleatórios.

**Critérios de aceite:**

- [ ] A2.1 Testes: **28 arquivos, ≥ 262 testes, todos passando** (250 + ≥ 12).
- [ ] A2.2 `grep -c "it(" tests/chute-a-gol.test.js` ≥ 12, e os 12 nomes acima aparecem literalmente.
- [ ] A2.3 `grep -nE "document|window|localStorage|Math\.random" rael/chute-a-gol/jogo.js rael/chute-a-gol/dados.js` vazio.
- [ ] A2.4 **Teste de sanidade dos testes (obrigatório, não commitar):** trocar temporariamente a
      regra 1 de `resultadoDoChute` para devolver `'gol'` e rodar os testes. Pelo menos os
      testes 10 e 11 **têm que falhar**. Desfazer e colar no relatório a saída dos testes
      falhando. Se nada falhar, os testes não prestam: refazer.
- [ ] A2.5 `git diff --name-only HEAD~1` lista só `rael/chute-a-gol/dados.js`, `rael/chute-a-gol/jogo.js` e `tests/chute-a-gol.test.js`.
- [ ] A2.6 Proibições da seção 0.2 verificadas.

**Verificação do Diego (3 min):** ler os 12 nomes de teste no arquivo; conferir A2.4 no
relatório; rodar `node ./node_modules/vitest/vitest.mjs run tests/chute-a-gol.test.js`.

**Commit:** `Cria motor e testes do Chute a Gol`

---

## Etapa 3 — Tela jogável (sem animação)

**Fazer** (`tela.js` segue a estrutura de `rael/rimas-com-figuras/tela.js`: `mostrarTela`,
`dizerPista`, `pintarPassos`, `abrirDemonstracao`, `abrirRodada`, `perguntar`, `responder`,
`encerrar`, listeners no fim):

1. **Campo (`chute-a-gol.css`):**
   - Gramado: gradiente CSS com listras verdes, sem imagem.
   - Gol `#gol`: **SVG inline no HTML** (traves brancas e rede em linhas cruzadas), com a grade
     `#zonas` por cima. Com 2 ou 3 zonas, `grid-template-columns: repeat(N, 1fr)`; com 4,
     2 × 2. A classe do `#zonas` indica o caso: `zonas--2`, `zonas--3` ou `zonas--4`.
   - Cada zona: `<button class="zona-gol" type="button" data-zona="{id}" aria-label="Chutar perto d{artigo} {nome}, {rotulo}">`
     com `<img src="{caminhoDaFigura(figuraId)}" alt="" aria-hidden="true">`.
   - **Tamanho mínimo de toque de cada zona: 64 × 64 px**, em qualquer largura a partir de 360 px.
   - Goleiro `#goleiro`: `<img>` do bichinho, posicionado sobre a zona `goleiroZona`, com
     `pointer-events: none` para o toque chegar à zona. A zona dele ganha `.zona-gol--goleiro`
     (contorno diferente) e continua tocável.
   - Bola `#bola`: `/figuras/bola.svg` na marca do pênalti, embaixo e centralizada.
   - `#placar`: 6 bolinhas apagadas, que acendem (`.placar__bola--gol`) a cada gol.
2. **Fluxo:**
   - `#comecar` → `preparar()` (aviso de voz como nas Rimas) → `abrirDemonstracao()`.
   - **Demonstração:** desafio `livre` fixo com goleiro na primeira zona; só a
     `zonaDemonstrada` fica ativa (outras `disabled`) e é tocada pela criança. Fala: "Olha: o
     goleiro está aqui. Chute onde ele não está. Toque aqui!" Depois do gol, "Continuar ▶"
     abre a rodada de verdade.
   - **Rodada:** `montarRodadaChute({ alternativas: configuracoes.alternativas })`,
     `criarSessao({ desafios })`, goleiro `goleiroDaRodada(rodadasDe('chute-a-gol'))`.
   - **Toque numa zona:** fazer exatamente o da seção 2.3 e, conforme o retorno:
     - `certo` → gol: acende bolinha, `tocar('acerto')`, texto e fala "Gooool!", desabilita as
       zonas, mostra `#continuar` com foco.
     - `fase === 'demonstrando'` → `tocar('clique')`, `.zona-gol--mostrada` na
       `zonaDemonstrada`, as outras ficam `disabled`, fala "Olha, aqui está livre! Toque aqui."
       O toque seguinte nessa zona **não chama `sessao.responder`** (a sessão já está em
       `demonstrando`): a tela trata como gol direto.
     - senão → fala de retorno (seção 1.2) e repete a pista. Zonas continuam ativas.
   - `#continuar` → `sessao.avancar()`; `fase === 'fim'` → `encerrar()`, senão `perguntar()`.
   - `#repetir` sempre visível; repete `pistaAtual`.
   - `#roteiro` aparece no modo "sem fala", como nas Rimas.
   - `encerrar()` nesta etapa pode ser provisório (mostrar `#tela-fim`); a etapa 5 completa.
3. **Teclado:** botões nativos (Tab + Enter/Espaço). Não criar atalho de tecla próprio.

**Critérios de aceite:**

- [ ] A3.1 Testes, tipos e build passam (mesmos números da etapa 2).
- [ ] A3.2 `grep -nE "setInterval|requestAnimationFrame|localStorage|tocar\('erro'\)" rael/chute-a-gol/*` vazio.
- [ ] A3.3 `grep -n "sessao.responder(" rael/chute-a-gol/tela.js`: toda chamada recebe o resultado de `resultadoDoChute`, nunca `zonaId` direto.
- [ ] A3.4 `git diff --name-only HEAD~1` só com arquivos de `rael/chute-a-gol/`.
- [ ] A3.5 No relatório, a tabela abaixo preenchida com "ok" ou com a falha, testada no DevTools
      em modo dispositivo:

| Cenário | 360 px | 768 px | 1280 px |
|---|---|---|---|
| Sem rolagem horizontal | | | |
| Cada zona ≥ 64×64 px (medir no inspetor) com 4 zonas | | | |
| Rodada completa de 6 chutes só com toque/clique | | | |
| Rodada completa só com teclado (Tab/Enter) | | | |
| Tocar no goleiro 2× seguidas → zona certa pisca → gol | | | |
| Figura errada 2× seguidas → zona certa pisca → gol | | | |
| Configurações com 2 e com 4 opções mudam as zonas | | | |
| Voz "sem fala" nas configurações → roteiro aparece | | | |
| Console sem erro e Network sem 404 | | | |

**Verificação do Diego (5 min):** jogar uma rodada no celular; tocar de propósito no goleiro
duas vezes; trocar para 4 opções em `rael/configuracoes.html` e jogar de novo.

**Commit:** `Torna o Chute a Gol jogavel com fala e sessao`

---

## Etapa 4 — Animação do chute e do goleiro

**Fazer:**

1. **Bola:** ao tocar a zona, calcular o deslocamento (centro da `#bola` → centro da zona, via
   `getBoundingClientRect`) e aplicar `transform: translate(x, y) scale(0.6)` com
   `transition: transform 600ms ease-out`. Esperar `transitionend` **com fallback de
   `setTimeout(700)`** (se o evento não vier, o jogo não trava).
2. **Gol:** a rede balança (keyframe de ~400 ms no SVG) e `lancarConfete(800)`.
3. **Defesa:** o goleiro dá um pulinho (`animar(elemento, classe)` de `shared/confete.js`) e a
   bola volta para a marca. Sem vermelho e sem tremer a tela.
4. **Escorregão** (fase `demonstrando`): o goleiro gira 90° e fica deitado até o gol.
5. **Entre desafios:** o goleiro desliza para a nova zona (`transition` de ~400 ms) e **só
   depois** a pista é falada e as zonas são habilitadas.
6. **Trava de toque:** variável `animando`; enquanto for `true`, tocar nas zonas não faz nada.
7. **`@media (prefers-reduced-motion: reduce)`:** sem `transition` nem `animation` no campo; a
   bola e o goleiro vão direto para a posição final e o fallback do item 1 garante que o jogo segue.

**Critérios de aceite:**

- [ ] A4.1 Testes, tipos e build passam.
- [ ] A4.2 `grep -n "prefers-reduced-motion" rael/chute-a-gol/chute-a-gol.css` ≥ 1.
- [ ] A4.3 `grep -n "animando" rael/chute-a-gol/tela.js` mostra a trava sendo checada no listener das zonas.
- [ ] A4.4 `grep -nE "setInterval|requestAnimationFrame" rael/chute-a-gol/*` continua vazio.
- [ ] A4.5 No relatório: rodada completa com **"Emular prefers-reduced-motion: reduce"** ligado
      no DevTools (Rendering) sem travar; tocar 5 vezes rápido numa zona gera **um** chute só.
- [ ] A4.6 `git diff --name-only HEAD~1` só com arquivos de `rael/chute-a-gol/`.

**Verificação do Diego (3 min):** no iPad ou Android de casa, a bola voa suave; tocar várias
vezes rápido não quebra; o goleiro nunca se mexe enquanto a pista é falada.

**Commit:** `Anima chute, rede e goleiro no Chute a Gol`

---

## Etapa 5 — Contagem dos gols, figurinha e conquistas

**Fazer:**

1. **`encerrar()`** (modelo: `encerrar()` das Rimas):
   - `const { figurinha, conquistasNovas } = registrarRodada('chute-a-gol');` (**sem** `feitos`).
   - `#bolas-fim`: uma `bola.svg` por gol (6), todas apagadas.
   - Fala com `falarSequencia([...], { aoComecar })`: "Vamos contar os gols!", "um", "dois",
     "três", "quatro", "cinco", "seis", "Seis gols!". No `aoComecar(indice)`, acender a bola
     do número dito (`.bola-contada`).
   - Depois: figurinha em `#figurinha`, texto em `#texto-fim`,
     `anunciarConquistas(conquistasNovas, { depoisDe: $('texto-fim'), dizer: dizerPista })`,
     `tocar('vitoria')` e `lancarConfete()`.
   - Como todo desafio acaba em gol, o total é **sempre 6**. É intencional.
2. **`#de-novo`:** nova rodada (`abrirRodada()`, sem demonstração). O goleiro muda porque
   `rodadasDe` aumentou.
3. **`shared/conquistas-descobertas.js`:** acrescentar **uma linha**, no fim de
   `ATIVIDADES_DESCOBERTAS`:
   ```js
   { id: 'chute-a-gol', nome: 'Chute a Gol', figura: 'bola', estreia: 'Primeiro gol', fa: 'Fã de futebol' },
   ```
   Isso cria sozinho `chute-a-gol-estreia` e `chute-a-gol-fa`, e muda a meta de `geral-todas`
   de 7 para 8. Pelo código atual (`avaliarConquistas` ignora as já ganhas e
   `resumirConquista` usa a data salva), **quem já ganhou `geral-todas` não perde**. O
   critério A5.4 prova isso.

**Critérios de aceite:**

- [ ] A5.1 Testes: **28 arquivos, todos passando**, sem alterar nenhum teste existente
      (`git diff --name-only HEAD~1 -- tests` só pode listar `tests/chute-a-gol.test.js`, se tocado).
- [ ] A5.2 `git diff HEAD~1 -- shared/conquistas-descobertas.js` = **exatamente 1 linha
      adicionada, 0 removidas.**
- [ ] A5.3 Acrescentar ao `tests/chute-a-gol.test.js` o teste
      `o catálogo de conquistas tem chute-a-gol-estreia e chute-a-gol-fa`.
- [ ] A5.4 Acrescentar ao `tests/chute-a-gol.test.js` o teste
      `quem já ganhou geral-todas não perde depois da atividade nova`: `avaliarConquistas`
      com `ganhas = { 'geral-todas': '<data>' }` e só 7 atividades jogadas não devolve
      `geral-todas`, e `resumirConquista` dela devolve `ganha: true`.
- [ ] A5.5 No relatório, com o álbum zerado (`rael/configuracoes.html` → Zerar álbum):
  - primeira rodada completa → cartão "Chute a Gol" na Casa do Rael mostra 1 rodada;
  - aparece a conquista "Primeiro gol" na tela de fim;
  - página "Brincadeiras" do álbum mostra "Primeiro gol" ganha e "Fã de futebol" em silhueta (1/10);
  - as 6 bolas acendem uma a uma junto com a contagem falada.
- [ ] A5.6 Proibições da seção 0.2 verificadas.

**Verificação do Diego (4 min):** fazer os passos de A5.5 no próprio aparelho.

**Commit:** `Conta os gols e registra o Chute a Gol no album`

---

## Etapa 6 — Acabamento, PWA e documentação

**Fazer:**

1. `README.md`: na tabela "Jogos do Rael", depois do labirinto:
   `| Chute a Gol | \`rael/chute-a-gol/index.html\` | Chute onde o goleiro não está ou na figura pedida e conte os gols |`
2. `MELHORIAS.md`: P16 na seção 5 (resumo da seção 1 deste plano + "Resultado da
   implementação" com data), linha na tabela de status da seção 1 como **"Implementado em
   branch, aguardando validação com a criança"** e nota com a data no topo.
3. `rael/index.html`: revisar a frase "Em breve" (não citar o Chute a Gol como futuro).

**Critérios de aceite:**

- [ ] A6.1 Testes, tipos e build passam; `grep -c "/rael/chute-a-gol/" dist/sw.js` ≥ 1.
- [ ] A6.2 **Offline:** no DevTools, carregar o site uma vez, marcar "Offline" e recarregar
      `/rael/chute-a-gol/`: a página abre e dá para jogar uma rodada.
- [ ] A6.3 **Peso:** `du -ch dist/assets/*chute* 2>/dev/null | tail -1` informado no
      relatório; nenhum arquivo novo em `public/` (`git diff --name-only main -- public` vazio).
- [ ] A6.4 Checklist da seção 6 do MELHORIAS.md colado no relatório com cada item marcado.
- [ ] A6.5 **Nenhum** lugar do MELHORIAS.md marca a validação com o Rael como concluída.
- [ ] A6.6 Conferência final contra `main`: `git diff --name-only main` lista **somente** os
      arquivos da seção 2, e todas as proibições da seção 0.2 passam.

**Commit:** `Documenta o Chute a Gol (P16)`

---

## Etapa 7 — Validação com o Rael (só o Diego)

O modelo **não** executa esta etapa nem a marca como feita.

- [ ] Entende "onde o goleiro não está" depois da demonstração?
- [ ] Reconhece as figuras pedidas pela voz? Alguma confunde (ex.: lua × sol)?
- [ ] 3 zonas está bom, ou 2 ou 4 fazem mais sentido?
- [ ] Fica frustrado com a defesa? Se sim: goleiro "distraído" já na 1.ª tentativa.
- [ ] Acompanha a contagem final falando os números?
- [ ] Quer jogar de novo? Quantas rodadas seguidas?
- [ ] As zonas estão confortáveis no tablet de casa?

---

## 3. Fora do escopo (não implementar)

Arrastar a bola; modo goleiro; pistas só de posição ("no alto, à direita") sem figura;
conquistas por feito (`feitos`); torcida ou hino em `shared/sons.js`; escolha de uniforme.
Se parecer uma boa ideia durante a execução, anote em "Dúvidas para o Diego".

## 4. Riscos

| Risco | Mitigação |
|---|---|
| 4 zonas pequenas demais em 360 px | Gol mais alto na grade 2×2. Se ainda ficar < 64 px, **parar e reportar** (não reduzir o mínimo) |
| A defesa soar como erro | Fala positiva, sem `tocar('erro')`, gol garantido na 3.ª tentativa |
| Voz pronuncia mal alguma figura | Trocar a figura em `FIGURAS_ALVO` (o teste 1 garante que ela existe) |
| `transitionend` não dispara em algum navegador | Fallback de `setTimeout` obrigatório (etapa 4, item 1) |

---

## 5. Como conduzir com o modelo executor

Mandar **uma etapa por mensagem** e revisar o relatório antes de liberar a próxima. Prompt
para a etapa N:

```
Leia PLANO-P16-CHUTE-A-GOL.md inteiro, depois as seções 2.2, 4.0, 5.0 e 6 do MELHORIAS.md e
os arquivos de modelo listados na seção 0.1 do plano. Execute SOMENTE a Etapa N. Respeite as
proibições da seção 0.2 e as decisões da seção 1.2 sem escolher alternativas. Se algo do plano
não funcionar como descrito, pare e explique, sem improvisar em shared/ ou em outros jogos.
Rode todos os comandos e critérios de aceite da etapa e responda SOMENTE com o relatório da
seção 0.4 preenchido, colando as saídas reais dos comandos. Não marque como verificado o que
não verificou. Faça um único commit com a mensagem indicada na etapa, na branch
p16-chute-a-gol. Não faça merge nem push em main.
```

**Checagem rápida do Diego em toda etapa** (30 s, sem confiar no relatório):

```sh
git log --oneline main..p16-chute-a-gol
git diff --name-only main
node ./node_modules/vitest/vitest.mjs run 2>&1 | tail -4
grep -rnE "setInterval|requestAnimationFrame|localStorage|Math\.random|⚽|🥅|\.only\(|\.skip\(" rael/chute-a-gol tests/chute-a-gol.test.js
```
O último comando tem que voltar vazio.
