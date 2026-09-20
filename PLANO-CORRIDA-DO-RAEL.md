# Plano de Implementação — Corrida do Rael

> Plano por etapas para portar e adaptar o
> [Pixel Racer](https://github.com/Elomami1976/pixel-racer) para a área **Jogos do Rael**.
> O objetivo é preservar o máximo possível do motor original em Canvas, trocando a competição
> infinita e punitiva por uma brincadeira curta, falada e acolhedora para uma criança de 5 anos.
>
> Criado em 2026-09-20. Linha de base local verificada nessa data: **28 arquivos de teste e
> 299 testes passando**, `tsc --noEmit` sem erros. O repositório de origem tinha um único
> `index.html` de 575 linhas e licença MIT.
>
> **Documento de execução para o Gemini.** Este arquivo fecha decisões de produto, arquitetura,
> arquivos, contratos e critérios de aceite. O executor não deve “melhorar”, simplificar ou trocar
> essas decisões por conta própria. Diante de contradição, comportamento não previsto ou falha de
> verificação, deve parar no fim da etapa atual, registrar evidências e pedir decisão ao Diego.

---

## 0. Protocolo obrigatório para o executor

### 0.1 Regra principal: evidência antes de conclusão

- Executar **uma etapa por vez**, na ordem deste documento.
- Não começar a etapa seguinte antes de todos os critérios da etapa atual passarem e o Diego
  aceitar o relatório.
- Não marcar item com `[x]` baseado apenas em leitura de código. Colar a evidência real: comando,
  trecho da saída, inspeção no navegador ou valor observado.
- Se um comando não foi executado, escrever **NÃO EXECUTADO**. Se o navegador não foi aberto,
  escrever **NÃO VERIFICADO NO NAVEGADOR**. Nunca substituir verificação por “deve funcionar”.
- Se algum critério falhar, não criar commit “parcialmente pronto”. Corrigir dentro do escopo ou
  parar e relatar o bloqueio.
- Não editar este plano para fazer a implementação parecer compatível. Mudanças de escopo só podem
  ser feitas pelo Diego.
- Não reformatar arquivos inteiros que recebem apenas uma linha nova. O diff precisa continuar
  pequeno e auditável.
- Antes e depois de cada etapa, rodar `git status --short` e `git diff --check`.

### 0.2 Leitura obrigatória antes de alterar qualquer arquivo

1. Ler por inteiro:
   - `MELHORIAS.md`, principalmente as seções **2.2**, **5.0**, **5.5** e **6**;
   - `shared/rodada.js`, `shared/fala.js`, `shared/descobertas.js`,
     `shared/conquistas-tela.js` e `shared/sons.js`;
   - `rael/chute-a-gol/index.html`, `rael/chute-a-gol/tela.js` e
     `rael/chute-a-gol/chute-a-gol.css`, somente como referência de integração de um jogo de ação;
   - `tests/chute-a-gol.test.js`, como referência de motor puro e testes.
2. Baixar ou clonar o repositório de origem em uma pasta temporária, registrar no relatório o
   hash exato do commit usado e conferir `index.html`, `README.md` e `LICENSE`.
3. Criar a branch `corrida-do-rael` a partir de `main` em um diretório limpo.
4. Não descartar nem incluir alterações anteriores do usuário. Na criação deste plano havia uma
   alteração não commitada em `MELHORIAS-historico.md`; ela está **fora do escopo**. Se ainda
   existir, usar outro worktree ou parar e pedir orientação antes de trocar de branch.

Em caso de conflito, a ordem de precedência é:
**pedido do Diego > seção 5.0 de `MELHORIAS.md` > este plano > código original**.

### 0.3 Auditoria inicial obrigatória

Antes da primeira edição, registrar no relatório da etapa 1:

```sh
git status --short --branch
git rev-parse --verify HEAD
git rev-parse --verify main
git diff --name-only
node --version
node ./node_modules/vitest/vitest.mjs run
node ./node_modules/typescript/bin/tsc --noEmit
```

Resultado mínimo esperado na linha de base:

- `HEAD` e `main` apontam para a base escolhida pelo Diego;
- alterações preexistentes são listadas e preservadas, nunca incluídas nos commits do jogo;
- 28 arquivos de teste e 299 testes passam;
- o typecheck termina com código 0;
- se a contagem da linha de base tiver mudado legitimamente, registrar o novo valor antes de
  codificar e usar esse valor nos critérios seguintes; não alterar testes para recuperar 299.

### 0.4 Comandos do projeto

O caminho local contém `:`, portanto usar sempre os binários locais já definidos:

```sh
node ./node_modules/vitest/vitest.mjs run
node ./node_modules/typescript/bin/tsc --noEmit
node ./node_modules/vite/bin/vite.js build && node scripts/gerar-service-worker.mjs sw.js dist/sw.js dist
node ./node_modules/vite/bin/vite.js
```

Não usar `npx`, não instalar dependências e não alterar `package.json` ou `package-lock.json`.
Não usar binários globais como substitutos silenciosos.

### 0.5 Guardas de escopo e qualidade

Qualquer item abaixo reprova a etapa:

| # | Proibido |
|---|---|
| G01 | Alterar arquivo fora da lista da seção 4 deste plano. |
| G02 | Commitar `dist/`, `node_modules/`, `.DS_Store`, arquivos com ` 2` no nome ou a alteração já existente em `MELHORIAS-historico.md`. |
| G03 | Adicionar dependência, fonte, imagem, áudio ou requisição externa. O jogo deve continuar local e funcionar offline. |
| G04 | Manter “GAME OVER”, recorde, ranking, vidas, perda de pontos, contagem regressiva ou colisão que encerre a rodada. |
| G05 | Manter carros inimigos ou trânsito vindo contra a criança. Os únicos elementos interativos da pista na primeira versão são **posto** e **óleo**. |
| G06 | Exigir leitura, teclado, reflexo rápido, toque preciso ou arraste para concluir a rodada. |
| G07 | Acessar `localStorage` diretamente. Todo progresso passa por `shared/descobertas.js`. |
| G08 | Chamar `speechSynthesis` ou criar `Audio` diretamente. Usar `shared/fala.js` e `shared/sons.js`. |
| G09 | Usar `Math.random` dentro do motor puro sem injeção. Os testes precisam controlar a ordem dos trechos. |
| G10 | Alterar a API dos módulos de `shared/` para acomodar apenas este jogo. |
| G11 | Usar emoji como desenho do carro, posto ou óleo. Desenhar no Canvas; emoji só pode aparecer em rótulos já padronizados do site. |
| G12 | Ocultar ou enfraquecer testes com `.skip`, `.only`, `.todo` ou remoção de asserções. |
| G13 | Fazer merge, push em `main`, abrir PR ou deploy sem autorização. |
| G14 | Criar caminhos alternativos como `jogo-novo.js`, `tela-final.js`, cópias “backup” ou arquivos temporários dentro do repositório. |
| G15 | Engolir exceções novas com `catch {}` apenas para esconder erro. Tratamento de falha precisa manter o jogo utilizável e, em desenvolvimento, permitir diagnóstico. |
| G16 | Declarar acessibilidade, uso offline, ausência de 404 ou comportamento mobile sem abrir e testar a página correspondente. |

Rodar estas guardas ao fim de **toda** etapa, ajustando `<base>` para o commit de início:

```sh
git diff --check
git diff --name-only <base>
git diff --stat <base> -- package.json package-lock.json MELHORIAS-historico.md
git status --short
rg -n "\.skip\(|\.only\(|\.todo\(" tests
```

### 0.6 Relatório obrigatório por etapa

```text
## Etapa N — relatório
Commit: <hash> <mensagem>
Origem usada: <hash do pixel-racer, quando aplicável>
Arquivos alterados: <git diff --name-only HEAD~1>

Comandos:
- testes: <Test Files ... / Tests ...>
- tsc: <saída; vazia = ok>
- build: <últimas linhas>
- `git diff --check`: <saída; vazia = ok>
- guardas G01–G16: <ok / falhou, com evidência>

Critérios de aceite:
- [x] ... (como foi verificado)
- [ ] ... NÃO VERIFICADO / FALHOU: <motivo>

Desvios do plano: <nenhum | lista e justificativa>
Pendente de validação com o Rael: <lista>
```

O relatório deve incluir também uma captura de tela ou descrição objetiva das dimensões testadas
quando a etapa tiver verificação visual. “Ficou bonito” não é evidência; registrar elementos
visíveis, medidas, estado alcançado e ausência/presença de erros no console.

### 0.7 Prompt curto para iniciar cada etapa no Gemini

Usar este texto, trocando apenas o número da etapa:

```text
Leia PLANO-CORRIDA-DO-RAEL.md por inteiro e execute somente a Etapa N.
Não antecipe nenhuma etapa seguinte. Preserve alterações preexistentes do usuário.
Obedeça à lista de arquivos permitidos, às guardas G01–G16 e aos contratos exatos.
Rode todos os critérios A<N>.* e entregue o relatório no formato da seção 0.6 com
saídas reais. Se algum critério falhar ou não puder ser verificado, não declare a
etapa pronta e não improvise mudança de escopo. Pare e explique ao Diego.
```

Depois de cada relatório, revisar `git diff` pessoalmente antes de autorizar a próxima etapa.

### 0.8 Git e recuperação segura

- Nunca usar `git add .` nem `git add -A`. Adicionar ao stage somente a lista explícita da etapa.
- Antes do commit, rodar `git diff --cached --name-only` e comparar linha por linha com a lista.
- Nunca usar `git reset --hard`, `git clean`, `git checkout --`, `git restore` amplo ou `git stash`
  para esconder alterações do usuário.
- Se um arquivo fora do escopo aparecer no stage, removê-lo somente do stage de forma não
  destrutiva e confirmar que o conteúdo local continua presente.
- Se uma etapa já commitada revelar defeito, criar uma correção pequena na mesma branch; não
  reescrever histórico nem fazer `commit --amend` sem autorização do Diego.
- Não apagar a pasta temporária de origem até a licença e os hashes terem sido conferidos; depois,
  removê-la apenas se estiver fora do repositório e o caminho exato tiver sido validado.

---

## 1. Resultado esperado

### 1.1 Identidade

| Campo | Decisão |
|---|---|
| Nome visível | **Corrida do Rael** |
| Pasta | `rael/corrida-do-rael/` |
| ID da atividade | `corrida-do-rael` |
| Cartão na casa do Rael | `/figuras/carro.svg` |
| Tecnologia | HTML/CSS/JS, Canvas 2D, sem dependências novas |
| Rodada | 6 trechos, sem limite de tempo |
| Recompensa | figurinha comum em toda rodada concluída, com ou sem ajuda |
| Conquistas | “Primeira corrida” e “Piloto experiente” após 10 rodadas |

**Ideia em uma frase:** o carro anda sozinho por uma pista larga; o Rael usa dois botões grandes
para ir à esquerda ou à direita, encontra o posto para encher o tanque e, se passar no óleo,
o carrinho apenas dá um rodopio divertido e tenta o mesmo trecho novamente.

### 1.2 Fluxo completo

1. Convite com o carro, o nome **Corrida do Rael** e o botão “Vamos dirigir”.
2. Demonstração falada sem óleo: o posto fica destacado e o jogo mostra como usar as setas.
3. Rodada de seis trechos.
4. Cada trecho tem exatamente um posto, uma poça de óleo em outra faixa e as demais faixas livres.
5. O posto enche um dos seis segmentos do tanque e inicia o próximo trecho após uma pausa curta.
6. O óleo faz o carro girar uma vez, toca um som leve e repete o mesmo trecho; não tira gasolina.
7. Passar por uma faixa vazia também repete o trecho, com a fala “O posto ficou ali. Vamos de novo!”.
8. Depois de duas tentativas sem chegar ao posto, a pista pausa, a faixa certa brilha e o carro é
   conduzido lentamente até ela. O trecho conta como concluído **com ajuda**.
9. No fim: “Tanque cheio!”, contagem falada de 1 a 6, confete, figurinha e conquistas novas.
10. “Dirigir de novo” prepara uma nova demonstração sem repetir o convite; “Início” continua
    disponível no cabeçalho.

Não haverá tela de escolha de modo, seleção de carro ou escolha de dificuldade dentro do jogo. A
quantidade de faixas vem da configuração já existente da área do Rael.

### 1.3 Personalização para o Rael

- O título e o cartão usam “Corrida do Rael”.
- A fala usa o primeiro nome de `obterConfiguracoes().nome`; o padrão atual já é “Rael”.
- Se o nome estiver vazio ou inválido, usar “piloto”, nunca montar uma frase quebrada.
- Textos têm frases curtas; a ação nunca depende deles.
- O carro do jogador é azul, grande e permanece no terço inferior da tela.
- O posto usa amarelo/verde e uma mangueira claramente desenhada; o óleo é uma poça preta com
  brilho azul. Não usar texto dentro dos objetos como única forma de identificação.

---

## 2. Mecânica fechada

### 2.0 Vocabulário obrigatório

Usar estes termos de forma consistente no código e na interface:

| Conceito | Nome no código | Texto para a criança |
|---|---|---|
| uma das seis partes da rodada | `trecho` | não precisa ser falado |
| objetivo correto | `posto` | “posto” |
| distração que gira o carro | `oleo` | “óleo” |
| passagem sem tocar em item | `passou` | “o posto ficou ali” |
| progresso da rodada | `tanque` | “tanque” |
| conclusão assistida | `comAjuda` | nunca mostrar como erro |

Não alternar entre “gasolina”, “combustível”, “bomba” e “posto” nas instruções. A instrução
principal é sempre **“Leve o carrinho até o posto.”** “Abasteceu!” é apenas o retorno do acerto.

### 2.1 Faixas e configuração do adulto

Reaproveitar `obterConfiguracoes().alternativas` como quantidade de faixas:

| Configuração | Pista | Como fica o trecho |
|---|---|---|
| 2 alternativas | 2 faixas largas | 1 posto + 1 óleo |
| 3 alternativas | 3 faixas | 1 posto + 1 óleo + 1 livre |
| 4 alternativas | 4 faixas | 1 posto + 1 óleo + 2 livres |

- O posto e o óleo nunca ficam na mesma faixa.
- O posto não fica na mesma faixa em três trechos consecutivos.
- O primeiro trecho começa com o posto em uma faixa adjacente à posição inicial do carro.
- O motor lógico trabalha com índices de faixa; o Canvas converte faixa em coordenada X.

### 2.2 Controles

- Dois botões de no mínimo **72 × 72 px**: `◀` e `▶`, com `aria-label` “Ir para a esquerda” e
  “Ir para a direita”.
- `pointerdown` mantém a direção; `pointerup`, `pointercancel`, `blur` e `visibilitychange`
  obrigatoriamente zeram a entrada, para o carro não ficar andando sozinho.
- Teclado é alternativa: setas e A/D. Espaço inicia/reinicia somente fora da rodada.
- Tocar na metade esquerda/direita do Canvas pode continuar funcionando como no original, mas os
  botões visíveis são o caminho principal. `touch-action: none` fica restrito ao Canvas e aos
  controles, nunca ao `body` inteiro.
- O carro usa movimento contínuo do original, com velocidade menor e colisões generosas por faixa.
  Ao soltar o controle, ele permanece onde está; o resultado considera a faixa ocupada pelo centro
  do carro, evitando exigir alinhamento milimétrico.

Regras de entrada que precisam ser implementadas literalmente:

1. Só aceitar movimento nas fases `DEMO` e `JOGANDO`.
2. `keydown` ignora repetição para ações de iniciar/reiniciar, mas pode manter direção para setas/A/D.
3. Prevenir o scroll somente para as teclas usadas pelo jogo e somente quando o jogo estiver ativo.
4. Se esquerda e direita estiverem pressionadas ao mesmo tempo, a direção resultante é zero.
5. Soltar um dos dois controles mantém o outro ativo.
6. O botão “Repetir” nunca move o carro, nunca conta tentativa e nunca reinicia o trecho.
7. Depois que um encontro é resolvido, ignorar entrada até o início da próxima tentativa.

### 2.3 Ritmo e ajuda

- Velocidade fixa da pista: começar em **110 px/s**; não acelerar por pontuação.
- Cada encontro nasce acima da tela e oferece pelo menos quatro segundos de antecipação em 400×700.
- Só um conjunto posto/óleo pode estar ativo por vez; o seguinte não nasce durante a fala ou efeito.
- O jogo pausa durante demonstração, rodopio, fala longa, aba em segundo plano e tela de fim.
- Usar `criarSessao({ desafios, tentativasAteDemonstrar: 2 })` de `shared/rodada.js`:
  `posto` é a resposta certa; `oleo` e `passou` são tentativas acolhidas, não erros exibidos.
- Não mostrar número de tentativas, acertos ou falhas. O único progresso visual é o tanque com
  seis segmentos, todos preenchidos até o fim, inclusive nos trechos concluídos com ajuda.

### 2.4 Geometria e ordem de colisão

Valores iniciais fechados para evitar que o executor escolha números arbitrários:

| Constante | Valor |
|---|---:|
| Canvas lógico | 400 × 700 px |
| limite esquerdo da pista | 36 px |
| limite direito da pista | 364 px |
| posição Y do carro | 580 px |
| carro | 44 × 64 px |
| velocidade horizontal do carro | 220 px/s |
| velocidade vertical do encontro | 110 px/s |
| Y inicial do encontro | -90 px |
| posto | até 70% da largura da faixa, máximo 64 × 72 px |
| óleo | até 72% da largura da faixa, máximo 68 × 30 px |
| margem da AABB | 4 px por lado |
| pausa após posto | 900 ms, sem contar tempo de fala |
| duração do rodopio | 700 ms |

O CSS pode reduzir o Canvas visualmente, mas nenhuma medida lógica muda com o tamanho da tela.

Cada encontro tem um flag `resolvido`, inicialmente `false`. Em cada frame, verificar nesta ordem:

1. se `resolvido`, não avaliar novamente;
2. colisão com o posto → resultado `posto`;
3. colisão com o óleo → resultado `oleo`;
4. se a borda superior dos dois itens passou da borda inferior do carro sem colisão → `passou`;
5. no primeiro resultado, definir `resolvido = true` **antes** de som, fala, timer ou mudança de tela.

Essa ordem impede pontuação dupla quando o carro fica entre duas faixas, quando um frame é repetido
ou quando o navegador atrasa. Posto tem prioridade no caso extremo de as duas AABBs se sobreporem.

### 2.5 Máquina de estados

A tela deve ter uma única variável de fase. Não combinar vários booleanos independentes como
`jogando`, `pausado`, `terminou` e `demonstrando`, pois isso permite estados contraditórios.

```js
export const FASES = Object.freeze({
  CONVITE: 'convite',
  PREPARANDO: 'preparando',
  DEMO: 'demo',
  JOGANDO: 'jogando',
  RETORNO: 'retorno',
  AJUDA: 'ajuda',
  FIM: 'fim',
});
```

Transições permitidas:

```text
CONVITE -> PREPARANDO -> DEMO -> JOGANDO
JOGANDO -> RETORNO -> JOGANDO          (posto ou primeira tentativa sem posto)
JOGANDO -> AJUDA -> RETORNO -> JOGANDO (segunda tentativa sem posto)
RETORNO -> FIM                          (se o sexto trecho terminou)
FIM -> PREPARANDO                       (Dirigir de novo)
qualquer fase -> página inicial         (cabeçalho; limpar tudo em pagehide)
```

Qualquer transição fora dessa lista é erro de implementação. O loop desenha em todas as fases, mas
só altera posição em `DEMO`, `JOGANDO` e durante o movimento automático de `AJUDA`.

### 2.6 Concorrência, timers e fala

- Manter um único ID de RAF durante a vida da página.
- Guardar todos os `setTimeout` criados pela tela em um `Set`; remover quando dispararem e cancelar
  todos em `reiniciar()` e `pagehide`.
- Usar um contador de geração (`geracaoDaRodada`) para que uma Promise antiga de fala não altere
  a rodada nova depois de “Dirigir de novo”.
- Esperar `falarSequencia(...)` quando a fala define a mudança de estado. Se retornar `sem-fala`,
  o roteiro visual continua e o fluxo prossegue sem espera artificial longa.
- `preparar()` deve ser chamado a partir do toque em “Vamos dirigir”, como exige o iOS.
- `parar()` antes de trocar de trecho; `limpar()` ao reiniciar/sair.
- Nunca iniciar uma segunda fala sem cancelar ou aguardar a anterior.
- `registrarRodada` precisa de guarda booleana `rodadaRegistrada`, definida antes da chamada.

### 2.7 Movimento reduzido e interrupções

- Com `prefers-reduced-motion: reduce`, não girar o carro: piscar o contorno e mostrar a poça
  espirrando por poucos quadros. Manter velocidade baixa e fixa.
- Limitar `dt` a 0,05 s, como no original.
- Ao voltar de uma aba oculta, zerar `lastTime` antes de retomar para nenhum item “teletransportar”.
- `requestAnimationFrame` pode continuar ativo para desenhar a tela. A pista/encontro avança nas
  fases `DEMO`, `JOGANDO` e no movimento guiado de `AJUDA`; as outras fases não alteram posições.

### 2.8 Falas e textos exatos da primeira versão

| Momento | Fala/texto |
|---|---|
| convite | “{nome}, vamos dirigir?” |
| demonstração | “Use as setas. Leve o carrinho até o posto.” |
| começo da rodada | “Agora é sua vez. Vá até o posto!” |
| posto | “Abasteceu!” |
| óleo | “O carrinho rodopiou! Vamos de novo!” |
| faixa livre | “O posto ficou ali. Vamos de novo!” |
| ajuda | “Olhe o caminho brilhando. O carrinho vai até o posto.” |
| fim, antes da contagem | “Vamos contar os abastecimentos!” |
| fim | “Tanque cheio! Muito bem, {nome}!” |

Se `nome` não estiver disponível, substituir a frase inteira por “Vamos dirigir?” ou “Tanque
cheio! Muito bem, piloto!”, sem deixar vírgula solta. Toda fala também aparece no roteiro visual
quando `modoAcompanhado()` for verdadeiro.

---

## 3. Reaproveitamento obrigatório do Pixel Racer

O repositório de origem é MIT, portanto o porte pode copiar e modificar o código desde que o aviso
de copyright e a licença sejam preservados. Copiar `LICENSE` para
`rael/corrida-do-rael/LICENSE-pixel-racer.txt` e manter aviso de origem no topo dos arquivos
derivados.

Na pasta temporária do clone, obter a referência com:

```sh
git -C <pasta-temporaria>/pixel-racer rev-parse HEAD
shasum -a 256 <pasta-temporaria>/pixel-racer/index.html
shasum -a 256 <pasta-temporaria>/pixel-racer/LICENSE
```

Copiar a licença integral, sem corrigir espaços, ano ou nome. Confirmar a cópia com `cmp -s` e
registrar o código de saída 0. O arquivo original não entra inteiro no projeto final: ele serve de
fonte para os blocos listados abaixo. A pasta temporária nunca deve ser criada dentro do repositório.

### 3.1 Matriz de porte

| Bloco original | Decisão no porte |
|---|---|
| Canvas lógico 400×700 e wrapper responsivo | **Manter**, encaixado no cartão e cabeçalho do site. |
| `COLORS` e constantes geométricas | **Adaptar** para o tema azul/verde do Rael. |
| Estado `MENU / PLAYING / GAMEOVER` | **Adaptar** para as sete fases exatas da seção 2.5. |
| Teclado, mapa de toques e `getInputDirection()` | **Manter e adaptar**, acrescentando botões visíveis e limpeza de entrada. |
| `drawRoad()` | **Manter**, generalizando divisórias para 2, 3 ou 4 faixas. |
| `drawCar()` | **Manter**, aumentando contraste e tamanho do carro do Rael. |
| `rectsOverlap()` com hitbox reduzida | **Manter** como função pura testável. |
| `requestAnimationFrame`, delta-time e clamp | **Manter**. |
| `spawnEnemy()` e lista `enemies` | **Adaptar** para um encontro por trecho: posto e óleo, sem carros inimigos. |
| Velocidade crescente por pontuação | **Remover**; velocidade fixa e calma. |
| Placar/recorde e `localStorage` | **Substituir** pelo tanque e `registrarRodada`. |
| `AudioController` e MP3s ausentes | **Substituir** por `shared/sons.js` e `shared/fala.js`. |
| Menus desenhados em inglês no Canvas | **Substituir** por DOM em pt-BR, legível e acessível. |
| Colisão que chama `triggerGameOver()` | **Substituir** por posto, rodopio ou nova tentativa. |

Meta de reaproveitamento: preservar ou adaptar os **sete blocos estruturais** do original
(Canvas, geometria, entrada, pista, carro, colisão e loop), sem reescrever um motor novo com outra
tecnologia. Não usar percentual de linhas como meta, porque a integração com fala, álbum e
acessibilidade necessariamente acrescenta código próprio.

O relatório da etapa 3 deve conter uma tabela “função original → função final → alteração”, no
mínimo para `getInputDirection`, `drawRoad`, `drawCar`, `rectsOverlap`, `spawnEnemy` e `gameLoop`.
Se algum desses blocos não for aproveitado, parar e justificar antes de criar alternativa.

### 3.2 Aviso no topo dos derivados

Usar um comentário equivalente a:

```js
/**
 * Corrida do Rael — derivado de Pixel Racer.
 * Origem: https://github.com/Elomami1976/pixel-racer
 * Copyright (c) 2026 Tarek Elomami — licença MIT.
 * Cópia da licença em LICENSE-pixel-racer.txt.
 */
```

Também registrar no README quais blocos foram reutilizados e quais foram alterados.

---

## 4. Arquivos permitidos

| Arquivo | Ação |
|---|---|
| `rael/corrida-do-rael/index.html` | novo: estrutura, telas, Canvas, controles e acessibilidade |
| `rael/corrida-do-rael/corrida-do-rael.css` | novo: encaixe responsivo, controles e estados visuais |
| `rael/corrida-do-rael/jogo.js` | novo: motor puro, derivado das contas do original |
| `rael/corrida-do-rael/tela.js` | novo: Canvas, entrada, loop, fala e fluxo |
| `rael/corrida-do-rael/LICENSE-pixel-racer.txt` | novo: cópia integral da licença MIT da origem |
| `tests/corrida-do-rael.test.js` | novo: testes do motor puro |
| `tests/conquistas-descobertas.test.js` | acrescentar testes específicos das duas conquistas novas |
| `vite.config.ts` | uma entrada nova em `paginas` |
| `rael/index.html` | um cartão novo |
| `shared/conquistas-descobertas.js` | uma atividade nova no catálogo |
| `README.md` | inventário, árvore e crédito de terceiros |
| `MELHORIAS.md` | registrar “Corrida do Rael” e o resultado da implementação, sem criar número de tarefa |

Nenhum arquivo de `shared/` além de `shared/conquistas-descobertas.js` deve mudar.

### 4.1 Alteração máxima permitida nos arquivos existentes

| Arquivo existente | Limite do diff |
|---|---|
| `vite.config.ts` | uma linha adicionada ao objeto `paginas`; zero linhas removidas |
| `rael/index.html` | somente o novo cartão; não reordenar os cartões atuais |
| `shared/conquistas-descobertas.js` | somente uma entrada em `ATIVIDADES_DESCOBERTAS` |
| `tests/conquistas-descobertas.test.js` | somente testes da nova atividade; não alterar expectativas anteriores para mascarar regressão |
| `README.md` | linhas necessárias para inventário, árvore e crédito; não reescrever outras seções |
| `MELHORIAS.md` | uma subseção nova de resultado; não alterar histórico de tarefas existentes |

Se formatador automático mudar outras linhas, desfazer apenas a formatação gerada antes de seguir;
não usar essa situação como motivo para aceitar um diff amplo.

---

## 5. API planejada do motor puro

`jogo.js` não acessa DOM, Canvas, `window`, armazenamento, áudio nem fala. O sorteio entra por
função injetável.

```js
import { embaralhar } from '../../shared/texto.js';

export const LARGURA_CANVAS = 400;
export const ALTURA_CANVAS = 700;
export const QUANTIDADE_DE_TRECHOS = 6;
export const VELOCIDADE_DA_PISTA = 110;
export const VELOCIDADE_DO_CARRO = 220;
export const RESPOSTA_POSTO = 'posto';

/** Converte qualquer valor para 2, 3 ou 4; o padrão é 3. */
export function quantidadeDeFaixas(alternativas) {}

/**
 * Devolve { inicio, fim, largura, larguraFaixa, faixas }.
 * inicio/fim são as bordas internas dirigíveis, não as linhas pintadas.
 */
export function geometriaDaPista({ largura, margem, faixas }) {}

/** Centro X de uma faixa válida; índices fora do intervalo são limitados. */
export function centroDaFaixa(indice, geometria) {}

/** Faixa ocupada pelo centro X do carro. */
export function faixaDoCarro(x, larguraCarro, geometria) {}

/**
 * Movimento contínuo. `x` é a borda esquerda do carro; direção é normalizada
 * para -1, 0 ou 1; dt negativo/inválido vale zero; saída fica entre inicio e
 * fim - largura.
 */
export function moverCarro({ x, direcao, velocidade, dt, inicio, fim, largura }) {}

/** AABB do original com margem configurável. */
export function retangulosSeSobrepoem(a, b, margem = 4) {}

/**
 * Cria seis desafios: { id, postoFaixa, oleoFaixa, respostaId: 'posto' }.
 * O embaralhamento é injetável e posto/óleo nunca ocupam a mesma faixa.
 */
export function montarTrechos({
  faixas = 3,
  quantidade = QUANTIDADE_DE_TRECHOS,
  embaralharLista = embaralhar,
} = {}) {}

/**
 * 'posto', 'oleo', 'passou' ou null enquanto o encontro ainda está ativo.
 * Posto tem prioridade se duas AABBs se sobrepuserem no mesmo frame.
 */
export function resultadoDoEncontro({ carro, posto, oleo, itensPassaram = false }) {}

/** Segmentos preenchidos do tanque, sempre entre zero e o total. */
export function progressoDoTanque(concluidos, total = QUANTIDADE_DE_TRECHOS) {}
```

O executor pode acrescentar helpers puros pequenos, mas não duplicar `criarSessao` nem criar uma
segunda camada de persistência.

### 5.1 Formatos de dados obrigatórios

```js
// Saída de montarTrechos(). Índices de faixa começam em zero.
{
  id: 'trecho-1',
  postoFaixa: 0,
  oleoFaixa: 1,
  respostaId: 'posto',
}

// Retângulo usado na colisão. Todos os campos são números em pixels lógicos.
{ x: 0, y: 0, w: 44, h: 64 }
```

Invariantes obrigatórias de `montarTrechos`:

1. sempre devolver array novo e objetos novos;
2. `quantidade <= 0` devolve `[]`;
3. quantidade de faixas inválida usa 3;
4. todos os índices ficam entre `0` e `faixas - 1`;
5. `postoFaixa !== oleoFaixa` em todos os trechos;
6. `respostaId` é sempre `RESPOSTA_POSTO`;
7. IDs são sequenciais a partir de `trecho-1`;
8. o posto não aparece três vezes seguidas na mesma faixa;
9. não mutar arrays devolvidos por `embaralharLista` nem objetos de chamada;
10. com a mesma função injetada, a saída é reproduzível.

---

## 6. Etapas de implementação

### Etapa 1 — Fixar a origem, licença e esqueleto integrado

**Arquivos que podem mudar nesta etapa:**

- novos: `rael/corrida-do-rael/index.html`, `rael/corrida-do-rael/corrida-do-rael.css`,
  `rael/corrida-do-rael/tela.js`, `rael/corrida-do-rael/LICENSE-pixel-racer.txt`;
- existentes: `vite.config.ts`, `rael/index.html`;
- nenhum outro.

**Procedimento obrigatório:**

1. Registrar o commit exato do Pixel Racer no relatório; a inclusão em `README.md` ocorre na etapa 5.
2. Clonar em diretório temporário, calcular os dois SHA-256 da seção 3 e copiar a licença MIT
   integral para `LICENSE-pixel-racer.txt`. Não copiar os MP3 fictícios citados no README original.
3. Criar `index.html` a partir da estrutura de uma página atual do Rael, nunca do HTML de tela
   cheia do original, com:
   - `lang="pt-BR"`, `class="tema-rael"`, manifest `/rael.webmanifest`;
   - meta description em pt-BR e `<title>Corrida do Rael — Jogos do Rael</title>`;
   - CSS comuns de `shared/`, `shared/pwa.js` e `tela.js` como módulo;
   - cabeçalho montado por `montarCabecalho('Corrida do Rael')`;
   - telas `tela-convite`, `tela-demonstracao`, `tela-brincadeira`, `tela-fim`;
   - `<canvas id="pista" width="400" height="700" aria-label="Pista da Corrida do Rael">` com
     fallback textual entre abertura e fechamento;
   - todos os IDs desta lista, exatamente uma vez:

     ```text
     tela-convite comecar aviso-voz
     tela-demonstracao demonstracao-texto demonstracao-continuar
     tela-brincadeira progresso instrucao repetir roteiro roteiro-fala
     quadro-pista pista tanque retorno controles esquerda direita
     tela-fim tanque-fim figurinha texto-fim de-novo
     ```

   - `#instrucao` e `#retorno` com `aria-live="polite"`; não usar `assertive`;
   - botões com `type="button"`; `#esquerda` e `#direita` com nomes acessíveis explícitos;
   - telas inativas com atributo `hidden`, não apenas fora da tela por CSS.
4. Adicionar a rota `'rael-corrida-do-rael': 'rael/corrida-do-rael/index.html'` ao Vite.
5. Adicionar o cartão à casa do Rael usando `/figuras/carro.svg` e
   `data-rodadas="corrida-do-rael"`, imediatamente depois de “Chute a Gol”.
6. CSS inicial deve fazer a página caber a partir de 360 px sem rolagem horizontal; manter a
   resolução lógica 400×700 e reduzir apenas o tamanho visual. `touch-action: none` só pode estar
   em `#pista`, `#esquerda` e `#direita`.
7. `tela.js` nesta etapa só monta cabeçalho, lê configuração de voz e alterna convite →
   demonstração; não antecipar loop, colisão ou persistência.

**Critérios de aceite — todos obrigatórios:**

- [ ] A1.1 `cmp -s <origem>/LICENSE rael/corrida-do-rael/LICENSE-pixel-racer.txt` termina com 0.
- [ ] A1.2 O relatório contém commit e SHA-256 do `index.html` e da `LICENSE` da origem.
- [ ] A1.3 A lista de IDs abaixo não imprime `FALTA` nem `DUPLICADO`:

  ```sh
  for id in tela-convite comecar aviso-voz tela-demonstracao demonstracao-texto demonstracao-continuar tela-brincadeira progresso instrucao repetir roteiro roteiro-fala quadro-pista pista tanque retorno controles esquerda direita tela-fim tanque-fim figurinha texto-fim de-novo; do n=$(rg -o "id=\"$id\"" rael/corrida-do-rael/index.html | wc -l | tr -d ' '); test "$n" = 1 || echo "$id:$n"; done
  ```

- [ ] A1.4 `git diff main -- vite.config.ts` mostra exatamente uma linha adicionada e nenhuma
  removida; `rg -n "rael-corrida-do-rael" vite.config.ts` encontra exatamente uma ocorrência.
- [ ] A1.5 `git diff main -- rael/index.html` contém somente o novo cartão; o link, nome, figura e
  `data-rodadas` são os especificados.
- [ ] A1.6 O build termina com código 0, existe
  `dist/rael/corrida-do-rael/index.html` e `rg -c "corrida-do-rael" dist/sw.js` devolve pelo menos 1.
- [ ] A1.7 Os 28 arquivos/299 testes da linha de base passam e `tsc --noEmit` termina com 0.
- [ ] A1.8 Em viewport 360×800: largura de `document.documentElement.scrollWidth` não é maior que
  `window.innerWidth`; Canvas está inteiro; botões medem pelo menos 72×72 CSS px.
- [ ] A1.9 Em viewport 390×844: cartão abre a página; convite → demonstração funciona por toque;
  console não tem erro e Network não tem 404.
- [ ] A1.10 `rg -ni "PIXEL RACER|SCORE|BEST|GAME OVER|NEW RECORD" rael/corrida-do-rael`
  não encontra texto visível ou executável.
- [ ] A1.11 `rg -n "touch-action" rael/corrida-do-rael/corrida-do-rael.css` confirma que a regra
  não se aplica a `html`, `body`, `.pagina` ou seletores globais.
- [ ] A1.12 Guardas G01–G16 passam; `git diff --name-only` lista somente os seis arquivos permitidos
  nesta etapa, além do próprio plano se ele estiver sendo versionado separadamente.

**Commit:** `Adiciona base da Corrida do Rael a partir do Pixel Racer`

**Parar aqui, entregar o relatório da etapa 1 e aguardar aceite do Diego.**

### Etapa 2 — Extrair motor puro e cobrir com testes

**Arquivos que podem mudar nesta etapa:**

- novo: `rael/corrida-do-rael/jogo.js`, `tests/corrida-do-rael.test.js`;
- nenhum arquivo da etapa 1 deve mudar sem justificativa e novo aceite visual.

**Procedimento obrigatório:**

1. Implementar a API da seção 5, reaproveitando as contas do original.
2. Generalizar a pista original de três para 2, 3 ou 4 faixas.
3. Montar seis trechos determinísticos quando `embaralharLista` for injetada.
4. Validar números com `Number.isFinite`; funções públicas nunca devolvem `NaN`, `Infinity` ou
   retângulo negativo.
5. Não duplicar o estado de tentativas de `criarSessao`; esta etapa testa apenas o motor geométrico
   e a geração de trechos.
6. Criar pelo menos **30 testes explícitos**, organizados nos grupos abaixo. Um teste em loop pode
   validar muitos casos, mas o relatório deve informar quantos `it()`/`test()` foram adicionados.

**Matriz mínima dos testes:**

| Grupo | Casos obrigatórios |
|---|---|
| constantes | dimensões, velocidades, quantidade 6 e resposta `posto` |
| `quantidadeDeFaixas` | 2, 3, 4; string; zero; negativo; `NaN`; acima de 4; ausência |
| `geometriaDaPista` | largura 400/margem 36 para 2, 3 e 4; soma das faixas; objeto novo; valores inválidos seguros |
| `centroDaFaixa` | primeiro, intermediário, último; índice negativo e maior que o limite |
| `faixaDoCarro` | centro de todas as faixas; carro sobre divisória; bordas; X inválido |
| `moverCarro` | esquerda, direita, parado, duas direções normalizadas; limite esquerdo/direito; `dt=0`; `dt<0`; `NaN` |
| `retangulosSeSobrepoem` | sobreposição; separados em X; separados em Y; apenas encostados; margem; não mutação |
| `montarTrechos` | padrão 6; quantidade zero; 2/3/4 faixas; IDs; resposta; posto≠óleo; índices válidos; nenhuma trinca; determinismo; não mutação |
| `resultadoDoEncontro` | posto; óleo; ambos com prioridade do posto; passou; ainda ativo retorna `null`; chamada repetida é estável |
| `progressoDoTanque` | 0, 1, 6; negativo→0; acima→total; total inválido seguro |

Nos testes de propriedade, gerar no mínimo 200 rodadas por quantidade de faixas usando funções
injetadas determinísticas; não depender do `Math.random` real para o teste passar.

**Critérios de aceite — todos obrigatórios:**

- [ ] A2.1 `jogo.js` exporta todos e somente os contratos públicos da seção 5, além de helpers que
  tenham justificativa no relatório.
- [ ] A2.2 A busca abaixo não encontra dependência de navegador ou persistência:

  ```sh
  rg -n "document|window|localStorage|sessionStorage|Audio|speechSynthesis|requestAnimationFrame|setTimeout|setInterval" rael/corrida-do-rael/jogo.js
  ```

- [ ] A2.3 `rg -n "Math\.random" rael/corrida-do-rael/jogo.js` só é aceito se estiver dentro de
  `shared/texto.js` importado; o arquivo novo em si deve ficar sem ocorrência.
- [ ] A2.4 `node ./node_modules/vitest/vitest.mjs run tests/corrida-do-rael.test.js` passa isolado
  três vezes consecutivas, com a mesma contagem.
- [ ] A2.5 A suíte completa passa: pelo menos 29 arquivos, os 299 testes anteriores e todos os
  novos testes; nenhum arquivo anterior deixa de executar.
- [ ] A2.6 `tsc --noEmit` termina com 0 e `git diff --check` não imprime nada.
- [ ] A2.7 Cobertura comportamental da matriz foi conferida item a item no relatório; não aceitar
  apenas snapshots nem testes que repetem a própria implementação.
- [ ] A2.8 Congelar um trecho devolvido em teste e chamar helpers não gera mutação; comparar cópia
  profunda antes/depois.
- [ ] A2.9 Para 200 rodadas de cada modo, nenhuma contém posto=óleo, índice inválido ou três postos
  consecutivos na mesma faixa.
- [ ] A2.10 `git diff --name-only HEAD~1` contém apenas `jogo.js` e o teste; G01–G16 passam.

**Commit:** `Extrai e testa o motor da Corrida do Rael`

**Parar aqui, entregar o relatório da etapa 2 e aguardar aceite do Diego.**

### Etapa 3 — Portar pista, carro, entrada e loop do original

**Arquivos que podem mudar nesta etapa:**

- `rael/corrida-do-rael/tela.js`;
- `rael/corrida-do-rael/corrida-do-rael.css`;
- `rael/corrida-do-rael/index.html` somente se faltar um atributo necessário já previsto;
- não alterar motor nem testes para compensar erro de tela; se o contrato do motor estiver errado,
  voltar formalmente à etapa 2 e registrar o motivo.

**Procedimento obrigatório:**

1. Portar para `tela.js`, com aviso MIT, os blocos de Canvas do original:
   `drawRoad`, `drawCar`, entrada unificada, estado, delta-time e `gameLoop`.
2. Adaptar `drawRoad` para a geometria dinâmica do motor.
3. Desenhar posto e óleo só com Canvas 2D:
   - posto: base, bomba, visor, mangueira e faixa verde de aproximação;
   - óleo: elipse irregular escura, brilho e pequenas gotas.
4. Implementar os botões visíveis e manter setas/A/D.
5. Parar entrada em `pointercancel`, perda de foco e aba oculta.
6. Exibir instrução e estado em DOM, com `aria-live="polite"`; não desenhar texto essencial
   somente no Canvas.
7. Ordem fixa de desenho por frame: fundo/grama → pista → bordas/divisórias → posto/óleo → carro →
   efeitos decorativos. O Canvas não desenha botões, instrução, progresso ou texto essencial.
8. Usar coordenadas lógicas de 400×700. Converter ponteiro para coordenada lógica com a razão entre
   `getBoundingClientRect()` e `canvas.width`; não usar `clientX` como se fosse pixel do Canvas.
9. Carregar a quantidade de faixas uma vez ao começar a rodada. Mudança nas configurações em outra
   aba só vale na próxima rodada.
10. Criar exatamente um listener de cada tipo no carregamento do módulo. Reiniciar não registra
    listeners novamente.
11. O loop chama `requestAnimationFrame(gameLoop)` uma vez na inicialização e uma vez ao final de
    cada frame. Nenhuma função de começo/recomeço cria outro loop.
12. Desenhos precisam usar `save()`/`restore()` ao aplicar rotação ou alpha, para nenhum efeito
    vazar ao quadro seguinte.

**Critérios de aceite — todos obrigatórios:**

- [ ] A3.1 O relatório apresenta a tabela de proveniência exigida na seção 3, apontando arquivo e
  função final para os seis blocos do original.
- [ ] A3.2 Em 400×700 lógico, a pista vai de X=36 a X=364 e o carro começa com Y=580, 44×64.
- [ ] A3.3 Para 2, 3 e 4 faixas, captura de tela comprova: número correto de faixas, posto e óleo
  inteiros dentro da pista e carro inteiro dentro das bordas.
- [ ] A3.4 Pressionar e segurar esquerda por 2 s leva o carro ao limite esquerdo sem ultrapassá-lo;
  repetir à direita chega ao limite direito.
- [ ] A3.5 Pressionar esquerda+direita ao mesmo tempo deixa o X inalterado; soltar apenas um botão
  passa a mover na direção ainda pressionada.
- [ ] A3.6 `pointerup`, `pointercancel`, `window.blur` e `document.visibilitychange` foram exercitados
  separadamente e cada um zera a direção.
- [ ] A3.7 Setas, A/D e toque sustentado nas metades esquerda/direita do Canvas funcionam; a página
  não rola enquanto esses controles estão ativos; fora da rodada, a navegação normal não fica bloqueada.
- [ ] A3.8 Redimensionar 390×844 → 360×800 → desktop preserva `canvas.width=400` e
  `canvas.height=700`, sem deformação, corte ou scroll horizontal.
- [ ] A3.9 Ocultar a aba por pelo menos 3 s e voltar não desloca encontro nem carro em salto; o
  primeiro `dt` útil após retorno é limitado/reiniciado.
- [ ] A3.10 Instrumentar temporariamente ou usar DevTools para confirmar um único RAF e uma única
  reação por evento após cinco reinícios; remover toda instrumentação antes do commit.
- [ ] A3.11 `rg -ni "enemy|enemies|triggerGameOver|pixelRacerHighScore|assets/.*\.mp3|new Audio|localStorage" rael/corrida-do-rael` não encontra código executável.
- [ ] A3.12 Console sem erro durante 60 s de movimento; Network sem 404; testes completos, typecheck
  e build passam; G01–G16 passam.

**Commit:** `Porta a pista e os controles do Pixel Racer`

**Parar aqui, entregar o relatório da etapa 3 e aguardar aceite do Diego.**

### Etapa 4 — Rodada amigável, demonstração e ajuda

**Arquivos que podem mudar nesta etapa:**

- `rael/corrida-do-rael/tela.js`;
- `rael/corrida-do-rael/corrida-do-rael.css`;
- `rael/corrida-do-rael/index.html` somente para completar estados/ARIA já previstos;
- `tests/corrida-do-rael.test.js` somente para novos testes do motor já existente; não mover lógica
  DOM para o teste só para aumentar contagem.

**Procedimento obrigatório:**

1. Conectar os seis trechos a `criarSessao`.
2. Implementar demonstração inicial sem óleo, com fala e destaque visual.
3. Implementar os três resultados:
   - `posto`: `tocar('acerto')`, encher tanque e dizer “Abasteceu!”;
   - `oleo`: `tocar('clique')`, rodopio e “O carrinho rodopiou! Vamos de novo!”;
   - `passou`: `tocar('clique')` e “O posto ficou ali. Vamos de novo!”.
4. Na segunda tentativa sem posto, demonstrar a faixa certa, mover o carro devagar e concluir
   o trecho com ajuda.
5. Pausar atualizações enquanto uma fala ou efeito decisivo estiver acontecendo.
6. Implementar `prefers-reduced-motion` sem rotação.
7. Usar o nome configurado em falas de convite, sem repeti-lo em toda frase.
8. Botão “Repetir” sempre disponível durante demonstração e rodada.
9. Implementar a sessão com estas chamadas, sem contador paralelo de tentativas:
   - criar: `criarSessao({ desafios: trechos, tentativasAteDemonstrar: 2 })`;
   - posto: `sessao.responder('posto')`, encher um segmento, depois `sessao.avancar()`;
   - óleo: `sessao.responder('oleo')`; se continuar em `pergunta`, recriar o mesmo encontro;
   - vazio: `sessao.responder('passou')`; se continuar em `pergunta`, recriar o mesmo encontro;
   - fase `demonstrando`: executar ajuda, não chamar `responder` outra vez e depois `avancar()`.
10. A demonstração inicial é separada da sessão: não enche tanque, não incrementa tentativas, não
    entra no resumo e não chama persistência.
11. Ao recriar o mesmo trecho, posto e óleo ficam nas mesmas faixas. Só um novo trecho pode mudar
    suas faixas.
12. Durante `RETORNO` e `AJUDA`, desabilitar controles com `disabled` e atualizar `aria-disabled`;
    reabilitar somente depois que o encontro seguinte estiver pronto.
13. Não usar `setInterval`. Animação é pelo RAF existente; pausas usam o registrador central de
    timers da seção 2.6.
14. O tanque deve ter seis elementos DOM criados uma vez. Atualização só alterna classe/atributo e
    `aria-label="Tanque: X de 6 abastecimentos"`; não recriar o container em cada frame.
15. Para ajuda, destacar a faixa correta por pelo menos 900 ms, mover o carro a no máximo 140 px/s
    até o centro dessa faixa e só então fazer o posto chegar ao carro. Não teletransportar o carro.
16. O rodopio não muda X, não muda trecho e não acumula rotações: remover/resetar transformação ao
    terminar. Em movimento reduzido, usar apenas contorno/brilho por 400–700 ms.

**Tabela de efeitos obrigatória:**

| Resultado | Som | Fala | Tanque | Sessão | Próximo passo |
|---|---|---|---:|---|---|
| posto | `acerto` | “Abasteceu!” | +1 | `acertou` | avançar após retorno |
| óleo, 1ª tentativa | `clique` | frase do óleo | igual | `pergunta` | repetir mesmo trecho |
| vazio, 1ª tentativa | `clique` | frase do posto | igual | `pergunta` | repetir mesmo trecho |
| óleo/vazio, 2ª tentativa | `clique` | frase de ajuda | +1 ao concluir ajuda | `demonstrando` | avançar após demonstração |

**Critérios de aceite — todos obrigatórios:**

- [ ] A4.1 Do convite ao primeiro trecho, a ordem observada é `CONVITE → PREPARANDO → DEMO →
  JOGANDO`; a demonstração não altera “0 de 6”.
- [ ] A4.2 Cenário de seis postos de primeira termina com tanque 6/6 e resumo da sessão
  `{ total: 6, semAjuda: 6, comAjuda: 0, concluida: true }`.
- [ ] A4.3 Cenário de seis ajudas termina com tanque 6/6 e resumo
  `{ total: 6, semAjuda: 0, comAjuda: 6, concluida: true }`.
- [ ] A4.4 Atingir óleo na primeira tentativa: carro gira/realça uma vez, tanque não muda, mesmo ID
  de trecho e mesmas faixas voltam; controles ficam bloqueados durante efeito e voltam depois.
- [ ] A4.5 Passar por faixa livre na primeira tentativa: não há giro, tanque não muda e mesmo trecho
  volta com as mesmas faixas.
- [ ] A4.6 Combinações óleo→vazio, vazio→óleo, óleo→óleo e vazio→vazio acionam ajuda exatamente na
  segunda tentativa e avançam uma única vez.
- [ ] A4.7 Na ajuda, faixa correta brilha ≥900 ms, carro se move visivelmente sem teletransporte,
  tanque recebe exatamente +1 e o trecho seguinte começa só depois.
- [ ] A4.8 Segurar ambos os controles durante retorno/ajuda não move o carro nem vaza direção para o
  trecho seguinte.
- [ ] A4.9 Tocar “Repetir” em demonstração, trecho normal, retorno e modo acompanhado não altera
  tentativa, tanque, faixa, trecho ou fase.
- [ ] A4.10 Modo `sem-fala`: todas as instruções necessárias aparecem em `#roteiro-fala`, posto e
  faixa correta têm pista visual, e a rodada inteira pode ser concluída sem áudio.
- [ ] A4.11 Voz sintetizada: não há sobreposição; posto seguinte não se move durante a fala de
  retorno; botão Repetir fala a mensagem atual.
- [ ] A4.12 `prefers-reduced-motion: reduce`: óleo não aplica rotação; nenhum efeito pisca mais de
  três vezes por segundo; rodada permanece concluível.
- [ ] A4.13 Depois de alternar a aba durante `JOGANDO`, `RETORNO` e `AJUDA`, cada estado retoma ou
  conclui sem pular trecho, duplicar tanque ou bloquear controles.
- [ ] A4.14 `rg -n "setInterval|tentativas\s*[+]=|tentativas\+\+" rael/corrida-do-rael` não encontra
  cronômetro nem contador paralelo de tentativas.
- [ ] A4.15 Testes completos, typecheck, build, console e Network passam; G01–G16 passam.

**Commit:** `Transforma a corrida em uma brincadeira amigavel para o Rael`

**Parar aqui, entregar o relatório da etapa 4 e aguardar aceite do Diego.**

### Etapa 5 — Final, álbum, conquistas e integração

**Arquivos que podem mudar nesta etapa:**

- `rael/corrida-do-rael/tela.js`, `index.html` e `corrida-do-rael.css`;
- `shared/conquistas-descobertas.js`;
- `tests/conquistas-descobertas.test.js`;
- `README.md` e `MELHORIAS.md` apenas nos trechos definidos na seção 4.1.

**Procedimento obrigatório:**

1. Ao concluir, tocar `vitoria`, lançar confete e falar a contagem de 1 a 6 antes de “Tanque cheio!”.
2. Definir `rodadaRegistrada = true` **antes** de chamar, uma única vez por rodada:

   ```js
   const premio = registrarRodada('corrida-do-rael');
   ```

3. Mostrar `premio.figurinha` pelo catálogo de figuras já existente e chamar
   `anunciarConquistas(premio.conquistasNovas, ...)` sem filtrar ou descartar conquistas simultâneas.
4. Adicionar a `ATIVIDADES_DESCOBERTAS`:

   ```js
   {
     id: 'corrida-do-rael',
     nome: 'Corrida do Rael',
     figura: 'carro',
     estreia: 'Primeira corrida',
     fa: 'Piloto experiente',
   }
   ```

5. “Dirigir de novo” limpa RAF pendente, timers, fala, entrada e sessão antes de recomeçar.
   O RAF principal não deve ser cancelado/recriado: “limpa RAF pendente” significa remover efeitos
   ou callbacks extras; permanece apenas o loop único da etapa 3.
6. Ao iniciar nova rodada, zerar: sessão, tanque, trecho/encontro, retorno, classes de efeito,
   direção, timers, geração de fala e `rodadaRegistrada=false`.
7. Atualizar `README.md` e `MELHORIAS.md`, incluindo crédito, commit da origem, licença, blocos
   reaproveitados, diferenças da versão do Rael e situação da validação presencial.
8. Acrescentar testes específicos ao catálogo/persistência sem alterar testes antigos para fazê-los
   passar.

**Ordem fechada da conclusão:**

1. `sessao.avancar()` devolve fase `fim`;
2. tela muda para `FIM` e controles são desabilitados;
3. guarda `rodadaRegistrada` é ativada e `registrarRodada` é chamado uma vez;
4. tanque final, figurinha e conquistas são renderizados;
5. tocar vitória e lançar confete;
6. falar “Vamos contar...” + 1, 2, 3, 4, 5, 6 + “Tanque cheio...”;
7. emendar as falas devolvidas por `anunciarConquistas`;
8. habilitar “Dirigir de novo”.

**Critérios de aceite — todos obrigatórios:**

- [ ] A5.1 `git diff --word-diff=porcelain main -- shared/conquistas-descobertas.js` comprova que a
  única mudança de produção em `shared/` é a entrada especificada.
- [ ] A5.2 Novo teste conclui uma rodada em armazenamento falso e recebe figurinha, atividade com
  `rodadas: 1` e somente `corrida-do-rael-estreia` entre as conquistas específicas do jogo.
- [ ] A5.3 Após nove rodadas, “Piloto experiente” ainda não foi liberada; na décima, aparece uma vez;
  na décima primeira, não reaparece.
- [ ] A5.4 Rodada representada como “com ajuda” recebe exatamente as mesmas conquistas de quantidade;
  não existe condição de rapidez, tentativa ou acerto de primeira.
- [ ] A5.5 Teste de catálogo confirma IDs únicos, figuras existentes e duas conquistas ligadas à
  atividade `corrida-do-rael`.
- [ ] A5.6 Teste da conquista geral confirma que “Explorador de brincadeiras” exige agora também a
  Corrida do Rael e só é liberada quando todas as atividades do catálogo têm rodada ≥1.
- [ ] A5.7 No navegador, uma rodada aumenta a contagem da atividade de N para N+1, nunca N+2; atualizar
  a tela, voltar pelo botão e tocar repetidamente no fim não registra de novo.
- [ ] A5.8 Primeira rodada nova mostra figurinha e “Primeira corrida”; simulação controlada da décima
  mostra “Piloto experiente”; todas as conquistas novas ficam navegáveis se mais de uma surgir.
- [ ] A5.9 Ordem falada é exatamente introdução, números 1–6 e encerramento; não há duas vozes ao
  mesmo tempo e “Dirigir de novo” só habilita após montar a tela final.
- [ ] A5.10 Clicar cinco vezes rapidamente em “Dirigir de novo” inicia no máximo uma rodada e deixa
  tanque 0/6, controles neutros e uma sessão.
- [ ] A5.11 Após jogar de novo cinco vezes, um único encontro é atualizado por frame e um único clique
  em cada controle produz uma reação; não há listeners/RAF acumulados.
- [ ] A5.12 A casa do Rael mostra o novo cartão, a contagem correta e a conquista geral recalculada;
  zerar álbum continua funcionando.
- [ ] A5.13 README contém URL, autor, MIT, hash da origem e matriz resumida de porte; MELHORIAS não
  cria número de tarefa para este jogo.
- [ ] A5.14 Suíte completa, teste isolado de conquistas, typecheck e build passam; console e Network
  ficam limpos; G01–G16 passam.

**Commit:** `Integra a Corrida do Rael ao album e as conquistas`

**Parar aqui, entregar o relatório da etapa 5 e aguardar aceite do Diego.**

### Etapa 6 — Verificação final e documentação

Esta etapa não acrescenta funcionalidade. Só corrige defeitos encontrados nas verificações e
atualiza a documentação já permitida. Toda correção precisa repetir os testes da etapa afetada.

**Automação obrigatória, nesta ordem:**

```sh
git status --short --branch
git diff --check main
node ./node_modules/vitest/vitest.mjs run
node ./node_modules/typescript/bin/tsc --noEmit
node ./node_modules/vite/bin/vite.js build && node scripts/gerar-service-worker.mjs sw.js dist/sw.js dist
test -f dist/rael/corrida-do-rael/index.html
rg -c "corrida-do-rael" dist/sw.js
git diff --name-only main
git diff --stat main -- package.json package-lock.json MELHORIAS-historico.md
```

Subir o artefato de produção com `node ./node_modules/vite/bin/vite.js preview`; não usar apenas o
servidor de desenvolvimento para validar offline e caminhos finais.

**Matriz obrigatória no navegador:**

| # | Ambiente/estado | Ação | Resultado obrigatório |
|---|---|---|---|
| B01 | 390×844, 3 faixas, toque | seis postos de primeira | tanque 6/6, tela final, uma rodada salva |
| B02 | 390×844, 3 faixas | óleo e depois posto | um rodopio, mesmo trecho repetido, tanque +1 só no posto |
| B03 | 390×844, 3 faixas | vazio duas vezes | ajuda visual, carro guiado, tanque +1, próximo trecho |
| B04 | 360×800, 2 faixas | rodada completa | sem corte/scroll horizontal; posto e óleo reconhecíveis |
| B05 | 360×800, 4 faixas | rodada completa | objetos não se sobrepõem; controles ≥72 px |
| B06 | desktop 1280×800 | setas e A/D | todos funcionam; carro respeita bordas |
| B07 | desktop | espaço em convite/fim e durante jogo | inicia/reinicia só onde permitido; durante jogo não interfere |
| B08 | voz sintetizada | usar Repetir em quatro fases | repete fala atual; zero mudança de estado |
| B09 | `sem-fala` | rodada inteira | roteiro visível e jogo concluível sem som |
| B10 | `prefers-reduced-motion` | atingir óleo | sem rotação; retorno claro e não piscante |
| B11 | aba oculta por 3 s | ocultar em jogo/retorno/ajuda | sem salto, duplicação ou bloqueio |
| B12 | reinício agressivo | cinco toques rápidos e cinco rodadas | sem RAF/listener/timer duplicado |
| B13 | offline em preview | carregar online, desligar rede, recarregar | jogo, shared, retorno e progresso local funcionam |
| B14 | navegação | entrar pelo cartão e voltar pelo cabeçalho | rotas corretas; contagem aparece na casa |
| B15 | armazenamento bloqueado | simular falha de storage | rodada termina sem exceção; prêmio visual não quebra tela |

Para B01–B15, registrar: viewport, quantidade de faixas, preferência de voz/movimento, resultado,
console e requisições com falha. Capturar pelo menos convite, 4 faixas, óleo, ajuda e tela final.

**Auditoria de acessibilidade manual:**

- navegar por Tab em ordem: cabeçalho → ação da tela → Repetir → esquerda → direita;
- foco visível em todos os botões;
- Enter/Espaço ativam botões sem duplicar evento;
- `hidden` retira telas inativas da navegação e da árvore acessível;
- `aria-live` não anuncia por frame, somente mudanças de instrução/retorno;
- tanque tem nome acessível atualizado de 0/6 a 6/6;
- posto e óleo diferem por forma, cor e comportamento, nunca só por cor;
- zoom do navegador em 200% não cria rolagem horizontal nem esconde ação essencial;
- contraste de texto e botões segue o tema existente; nenhum texto menor que 18 px na área do Rael.

**Inspeções finais:**

```sh
git diff --name-only main
git diff --stat main -- package.json package-lock.json MELHORIAS-historico.md
git diff --stat main -- shared
rg -n "GAME OVER|NEW RECORD|SCORE|BEST|pixelRacerHighScore|new Audio|speechSynthesis|localStorage" rael/corrida-do-rael
rg -n "carro inimigo|enemy|enemies|triggerGameOver" rael/corrida-do-rael
rg -n "setInterval|\.skip\(|\.only\(|\.todo\(" rael/corrida-do-rael tests/corrida-do-rael.test.js tests/conquistas-descobertas.test.js
rg -n "P""17|p""17" PLANO-CORRIDA-DO-RAEL.md README.md MELHORIAS.md rael/corrida-do-rael tests/corrida-do-rael.test.js
du -sk dist
```

As buscas de termos proibidos devem ficar vazias, exceto quando um termo aparecer dentro de um
comentário de atribuição que explique explicitamente a remoção; preferir não deixá-lo nem ali.

**Critérios de aceite final — todos obrigatórios:**

- [ ] A6.1 Pelo menos 29 arquivos e **pelo menos 329 testes** passam: os 299 da linha de base mais os
  30 testes mínimos; relatório cola as quatro linhas finais reais do Vitest.
- [ ] A6.2 Typecheck termina com código 0 e saída vazia; build termina com código 0; arquivo final e
  entrada no precache existem.
- [ ] A6.3 `git diff --check main` não imprime nada e somente os arquivos da seção 4 aparecem no diff.
- [ ] A6.4 `package.json`, lockfile e `MELHORIAS-historico.md` têm diff vazio; em `shared/`, somente
  a entrada da nova atividade mudou; os testes correspondentes estão no arquivo de testes permitido.
- [ ] A6.5 As quatro buscas de inspeção final não encontram termo proibido, teste desativado,
  `setInterval` ou o identificador numérico legado removido deste plano.
- [ ] A6.6 B01–B15 passam com evidência; nenhum cenário fica resumido como “ok” sem resultado
  observável.
- [ ] A6.7 Auditoria de teclado, foco, árvore acessível, aria-live, zoom e contraste passa.
- [ ] A6.8 Console tem zero `error` e zero exceção não tratada em toda a matriz; Network tem zero 404
  e zero pedido aos MP3s fictícios ou domínios externos.
- [ ] A6.9 Offline funciona a partir do build servido por preview, não só mantendo recursos em cache
  de uma aba já aberta; registrar como a rede foi desativada e a página recarregada.
- [ ] A6.10 README identifica Pixel Racer, Tarek Elomami, licença MIT, URL, commit e partes portadas;
  a cópia da licença continua idêntica.
- [ ] A6.11 `dist/` não aparece em `git status --short` nem em `git diff --name-only --cached`.
- [ ] A6.12 O relatório final separa “verificado automaticamente”, “verificado no navegador” e
  “ainda precisa ser observado com o Rael”.
- [ ] A6.13 Nenhum desvio está pendente. Se houver, a etapa não está aceita até decisão do Diego.

**Commit:** `Documenta e valida a Corrida do Rael`

**Parar aqui. Não fazer push, PR, merge ou deploy. Entregar o relatório final ao Diego.**

---

## 7. Validação presencial com o Rael

Não marcar esta seção como concluída sem observar a criança jogando.

### Roteiro de observação

- [ ] Entende que deve levar o carro ao posto após ouvir/ver uma demonstração?
- [ ] Reconhece o posto e diferencia a poça de óleo sem depender do texto?
- [ ] Descobre os botões esquerdo/direito sem ajuda verbal extra?
- [ ] Consegue corrigir a faixa com quatro segundos de antecipação?
- [ ] O rodopio diverte ou distrai/frustra?
- [ ] Depois do óleo, entende que pode tentar novamente?
- [ ] Percebe o tanque enchendo a cada trecho?
- [ ] Mantém interesse pelos seis trechos sem pedir para sair?
- [ ] A fala está clara no iPad e no Android usados em casa?
- [ ] Tocar no Canvas por acidente conflita com os botões?

### Ordem de ajustes se houver dificuldade

1. Reduzir `VELOCIDADE_DA_PISTA`.
2. Aumentar posto e largura de colisão por faixa.
3. Antecipar o nascimento do encontro.
4. Deixar a faixa do posto destacada por mais tempo.
5. Oferecer só duas faixas na configuração do adulto.
6. Reduzir a rodada de seis para cinco trechos apenas se a duração estiver cansativa.

Não corrigir dificuldade adicionando vidas, pontuação, cronômetro ou instruções escritas maiores.

---

## 8. Fora do escopo da primeira versão

- Carros adversários, ultrapassagem, corrida contra outra pessoa ou chefe final.
- Combustível que acaba, multa, dano, explosão, colisão ou derrota.
- Loja, moedas, escolha de carro, skins ou desbloqueios.
- Fases infinitas, recordes ou aumento automático de velocidade.
- Novas imagens ou áudios externos.
- Alterar configurações globais ou o formato do estado persistido.
- Publicar, abrir pull request ou mesclar na `main`.

Esses itens só entram depois da validação com o Rael e em um plano separado.

---

## 9. Definição de pronto

A Corrida do Rael estará tecnicamente pronta quando:

- [ ] o núcleo Canvas, entrada, pista, carro, colisão e loop do Pixel Racer estiver portado com atribuição MIT;
- [ ] posto e óleo substituírem todo o trânsito inimigo;
- [ ] a rodada tiver seis trechos, ajuda após duas tentativas e nenhum estado de derrota;
- [ ] a brincadeira funcionar com toque em 360 px, teclado como alternativa e movimento reduzido;
- [ ] fala, som, figurinha e conquistas usarem apenas os módulos compartilhados;
- [ ] testes, typecheck, build, precache, console e rede passarem;
- [ ] README e MELHORIAS registrarem a origem e o que mudou;
- [ ] o relatório separar claramente “verificado tecnicamente” de “a validar com o Rael”.

A publicação só fica pronta depois de a validação presencial da seção 7 ser registrada e o Diego
autorizar merge/deploy.
