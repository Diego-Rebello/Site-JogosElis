# Plano de Implementação — Grande Prêmio do Rael

> Corrida de carro "de verdade" para a área **Jogos do Rael**: o carro corre sozinho, o Rael
> desvia e ultrapassa os outros carros, cuida da gasolina e, ao ultrapassar **30 carros**, recebe a
> **bandeirada**. Batida nunca encerra a corrida: o carro só fica devagar por uns 2 segundos.
>
> Criado em 2026-09-22. Base técnica: o [Pixel Racer](https://github.com/Elomami1976/pixel-racer)
> (MIT), já portado para `rael/corrida-do-rael/`. O original **era** um jogo de desviar e ultrapassar
> carros; a adaptação anterior removeu isso. Este plano traz de volta o trânsito e a contagem de
> ultrapassagens, troca o game over por atraso e acrescenta o abastecimento.
>
> **Documento de execução para o modelo executor (Gemini, Claude ou Codex).** O plano fecha
> decisões de produto, arquitetura, arquivos, números e critérios de aceite. O executor não deve
> "melhorar", simplificar ou trocar essas decisões. Diante de contradição, comportamento não
> previsto ou falha de verificação, deve parar no fim da etapa atual, registrar as evidências e
> pedir decisão ao Diego.

---

## Resumo para o Diego

**O que o Rael vai jogar.** Visão de cima, igual à Corrida do Rael que ele já conhece, mas agora
com carros coloridos na pista. O carro azul dele anda sozinho e vai ficando mais rápido; ele usa
◀ ▶ para trocar de faixa e passar os outros. Uma barra no alto mostra o carrinho indo até a
bandeira quadriculada (0 → 30). A gasolina vai baixando; quando chega à metade, aparece o posto
(o mesmo desenho que ele já conhece) e é só passar por cima para encher.

**Como isso trabalha o que você pediu:**

| Objetivo | Como aparece no jogo |
|---|---|
| Reflexo | O tempo para reagir começa em ~5,6 s e cai aos poucos até ~3,6 s nos últimos carros. |
| Desviar e ultrapassar | Cada carro que fica para trás sem batida conta +1. A partir do 10.º, às vezes vêm dois lado a lado, sempre com uma faixa livre. |
| Abastecimento | O tanque cheio dura 50 s; na metade aparece o posto. Se passar do posto, outro vem 4 s depois. |
| Batida só atrasa | O carro cai para 35% da velocidade por 2 s e volta em 0,6 s. O carro batido vai embora e não conta, mas o contador nunca diminui. |
| Sem fim por tempo | Não existe cronômetro. A corrida só acaba com 30 ultrapassagens. |
| Gasolina acabou | Não há derrota: o carro anda na "reserva", a pista esvazia e o posto aparece na faixa dele. |

**Decisões que adotei como padrão.** Pode trocar qualquer uma antes da Etapa 1:

1. **Jogo novo, separado.** Nome **Grande Prêmio do Rael**, pasta `rael/grande-premio/`,
   id `grande-premio`. A Corrida do Rael (posto e óleo) continua igual: ele gostou dela.
2. **Visão de cima (2D) nesta versão.** A visão de trás estilo OutRun fica como ideia futura
   (seção 9); o motivo está na seção 1.
3. **Carro em que ele bate não conta como ultrapassado.** A alternativa seria contar mesmo assim;
   aí a batida custaria só os 2 s. Com a regra escolhida, ultrapassar significa passar sem bater,
   mas o número nunca desce.
4. **Meta fixa de 30** (constante `META_ULTRAPASSAGENS`, fácil de mudar depois da validação).
5. **Largada com semáforo** ("Preparar... apontar... já!"). É ritual de corrida, não prazo: dura
   2,4 s e não tem como "perder" a largada.

**Decisão que só você pode tomar (Etapa 0).** A branch `corrida-do-rael` tem **alterações não
commitadas** em 5 arquivos da Corrida do Rael: carros de trânsito que empurram para o lado,
gasolina contínua e uma tela **"O combustível acabou!"** que encerra a rodada. Essa tela é um game
over e contraria este pedido. **Recomendo guardar esse trabalho numa branch própria**, sem mesclar,
e manter a Corrida do Rael como estava no commit `cafe3a4`. Os comandos estão na Etapa 0.

---

## 1. Pesquisa: bases no GitHub

| Opção | Licença | O que já traz | Custo de adaptar | Veredito |
|---|---|---|---|---|
| **Pixel Racer** (Tarek Elomami), já portado em `rael/corrida-do-rael/` | MIT | Canvas 400×700, faixas, carros inimigos (`spawnEnemy`), ponto por carro que passa (`if (!e.scored && e.y + e.h > player.y)`), velocidade que sobe com o placar (`BASE_ENEMY_SPEED + score * SPEED_PER_SCORE`), colisão AABB com hitbox reduzida | **Baixo.** Motor de faixas, movimento e colisão já está testado no repositório (`corrida-do-rael/jogo.js`). Falta trocar o game over por atraso e acrescentar gasolina e bandeirada. | **Escolhido** |
| [jakesgordon/javascript-racer](https://github.com/jakesgordon/javascript-racer) (pseudo-3D estilo OutRun) | Código MIT. Sprites "emprestados" do OutRun do Mega Drive (Sega), **não reutilizáveis**; música licenciada só para aquele projeto | Tráfego com 200 carros, curvas, morros, e **batida que reduz a velocidade** em vez de game over (`speed = car.speed * (car.speed/speed)`) | **Alto.** ~700 linhas no `v4.final.html` mais `common.js`, todos os sprites redesenhados no Canvas, curva com força centrífuga (difícil aos 5 anos) e perspectiva que dificulta julgar distância. | Guardar para uma **versão 2 "visão de trás"** se o Rael pedir |
| Clones de *Road Fighter* (Konami, 1984): [us190190/road-fighter](https://github.com/us190190/road-fighter), [amoldalwai/RoadFighter](https://github.com/amoldalwai/RoadFighter), [codehard123/RoadFighter](https://github.com/codehard123/RoadFighter) | us190190: MIT; os outros **não conferidos** | A ideia exata: ultrapassar carros com gasolina acabando | **Médio/alto.** Projetos pequenos (1 estrela), origem dos assets incerta e código que não segue o padrão do site; adequar custaria mais que estender o que já temos | Só **referência de design** (gasolina como pressão, posto como item na pista) |
| Motores 3D (Three.js: `web-racing`, `NeedForTokens`, `redrock`…) | variadas | Visual 3D | Dependência nova, peso no PWA, desempenho no iPad | Descartado |

**Por que 2D de cima e não pseudo-3D.** Para uma criança de 5 anos, ver o carro da frente como um
retângulo numa faixa, com 4 a 5 s de antecedência, é o jeito mais claro de treinar o reflexo de
desviar. Ele já domina os controles da Corrida do Rael. E cerca de 70% do código já está no
repositório e testado, o que atende ao pedido de poupar código.

---

## 2. Mecânica fechada

### 2.1 Identidade

| Campo | Decisão |
|---|---|
| Nome visível | **Grande Prêmio do Rael** |
| Pasta | `rael/grande-premio/` |
| ID da atividade | `grande-premio` |
| Rota Vite | `'rael-grande-premio': 'rael/grande-premio/index.html'` |
| Figura do cartão | `/figuras/corrida/carro-de-corrida.svg` (OpenMoji 1F3CE) |
| Tecnologia | HTML/CSS/JS, Canvas 2D, sem dependências novas |
| Fim da corrida | 30 ultrapassagens → linha de chegada → bandeirada |
| Recompensa | figurinha comum em toda corrida concluída |
| Conquistas | "Primeira bandeirada" (1.ª corrida) e "Campeão das pistas" (10 corridas) |

### 2.2 Fluxo completo

1. **Convite:** carro de corrida, título, frase "Ultrapasse 30 carros para ganhar a bandeirada!"
   e o botão "🏁 Vamos correr".
2. **Largada:** a pista aparece parada com o carro azul e um semáforo sobre o Canvas:
   vermelho (0,8 s) → amarelo (0,8 s) → verde (0,8 s). Ao mesmo tempo a fala diz "Preparar...
   apontar... já!". Os controles ficam desabilitados até o verde.
3. **Corrida:** o carro anda sozinho. Os três primeiros rivais formam o **aquecimento** (2.8), que
   substitui a demonstração separada da seção 5.0.
4. Ultrapassagens, batidas e abastecimentos acontecem **sem pausar a pista** (2.4 a 2.6).
5. **Ao chegar a 30:** os rivais restantes saem da pista, a gasolina para de baixar e, 1 s depois,
   surge a linha de chegada quadriculada.
6. **Bandeirada:** quando o carro cruza a linha, a bandeira quadriculada acena, toca `vitoria`,
   sobe o confete e o carro freia até parar em 1,5 s.
7. **Tela final:** "Bandeirada!", resumo positivo, figurinha, conquistas novas,
   "🏁 Correr de novo" e "🏠 Início".
8. "Correr de novo" volta à **largada** (passo 2), sem repetir o convite.

### 2.3 Exceções conscientes à seção 5.0 do MELHORIAS

O Diego pediu explicitamente um jogo de reflexo. Por isso **este jogo, e somente ele**, tem três
exceções:

| Regra da 5.0 | Exceção aqui | Por quê |
|---|---|---|
| "Não exigir reflexo rápido" (e a guarda G05/G06 do plano da Corrida do Rael) | Exige reflexo, com curva suave (2.7) e ajuda adaptativa (2.9) | Objetivo declarado do pai |
| "Rodadas de 5 a 8 desafios" | 30 ultrapassagens (~1,5 min sem batidas; mais com batidas e reserva) | A duração fica perto da meta de 3 a 5 min, sem virar limite |
| Trânsito vindo contra a criança proibido | Carros rivais na mesma direção, mais lentos | É a essência de ultrapassar |

**Tudo o mais da seção 5.0 continua valendo:** nada de game over, vidas, recorde, ranking,
cronômetro, contagem regressiva de prazo, perda de pontos ou contador que diminui. Não há
exibição de batidas nem de erros. Figurinha sempre. Fala em pt-BR com botão Repetir. Nada depende
de leitura. Controles grandes. Saída livre pelo cabeçalho. Progresso só por `shared/descobertas.js`.

### 2.4 Ultrapassagem

- Rival = carro de outra cor (nunca azul), mesmo tamanho do jogador (44×64), sempre **mais lento**
  que o jogador em velocidade normal. Na tela, ele desce em direção ao carro do Rael.
- **Conta como ultrapassagem** quando a borda de cima do rival passa da borda de baixo do carro do
  jogador (`rival.y > carro.y + carro.h`) e o rival não foi batido nem está saindo. Cada rival
  conta no máximo uma vez.
- Dois rivais lado a lado contam duas ultrapassagens.
- O contador **nunca diminui** e para em 30.
- Retorno a cada ultrapassagem: `tocar('clique')` e "+1" flutuando sobre o carro (decorativo).
  Nos marcos, fala curta (2.13).

### 2.5 Batida = atraso, nunca derrota

Ao colidir com um rival (AABB com margem de 6 px por lado, mais generosa que os 4 px do original):

1. `tocar('erro')`, o som grave e baixinho que "avisa sem assustar".
2. O carro do jogador cai para **35% da velocidade de cruzeiro por 2,0 s** e depois volta de forma
   linear até 100% em **0,6 s**.
3. Durante esses 2,6 s o jogador fica **imune**: não há segunda batida. O carro pisca
   translúcido a no máximo 2 Hz e solta fumacinha cinza (decorativa).
4. O rival batido fica marcado como **saindo**: some em 0,5 s (alpha 1 → 0), não colide mais e
   **não conta** como ultrapassagem.
5. Enquanto dura a lentidão, novos rivais não nascem. O relógio de nascimento fica congelado.
6. Controles continuam ativos: ele pode trocar de faixa devagar.
7. Com movimento reduzido: sem tremida nem fumaça, só o contorno destacado.

A **única** fala de batida é na primeira da corrida: "Opa! Bateu. Desvie dos carros!".
As batidas seguintes têm só som e efeito. Nenhuma tela mostra quantas batidas houve.

### 2.6 Abastecimento

| Regra | Valor |
|---|---|
| Tanque | 100, começa cheio |
| Consumo | 2,0 por segundo de corrida (tanque cheio dura 50 s); não consome na largada, pausa, chegada e fim |
| Quando o posto aparece | gasolina ≤ 50, sem posto na tela, depois de `tempoAteProximoPosto` |
| Posto perdido | passou da tela sem abastecer → novo posto 4,0 s depois |
| Posto de ajuda | depois de 2 postos perdidos seguidos, o próximo nasce **na faixa do jogador** (ou na livre mais próxima) e brilha |
| Abasteceu | gasolina volta a 100, `tocar('acerto')`, fala "Abasteceu!", zera perdidos |
| Pouca gasolina | ao cruzar 25 (uma vez por tanque): fala "A gasolina está acabando! Procure o posto!" e a barra fica vermelha |
| Acabou (reserva) | ao chegar a 0: velocidade limitada a **40%**, rivais na tela **saem** (2.5, passo 4), **nenhum rival nasce** e o posto aparece na faixa do jogador em 1,5 s e se repete a cada 1,5 s até ele abastecer |

- O posto é **objeto parado na pista**: desce na velocidade do jogador. É o mesmo desenho da
  Corrida do Rael (bomba amarela, teto verde, faixa verde de aproximação).
- **Regra anti-sobreposição:** o posto só nasce numa faixa **sem rival entre o ponto de
  nascimento e o carro** (`-80 ≤ rival.y ≤ carro.y`, ignorando rivais saindo). Com os números
  deste plano, um rival que nasce depois do posto nunca o alcança. Se nenhuma faixa estiver
  livre, tentar de novo em 0,5 s.
- Na reserva o Rael não consegue ultrapassar ninguém (a pista está vazia). A consequência de não
  abastecer é **atraso**, nunca derrota.

### 2.7 Curva de dificuldade

O nível depende de quantas ultrapassagens já foram feitas. Os rivais andam a **45%** da velocidade
de cruzeiro vigente quando nascem, então a velocidade relativa é 55% do cruzeiro.

| Nível | Ultrapassagens feitas | Cruzeiro (px/s) | Intervalo entre rivais | Chance de dupla | Tempo de reação* |
|---|---|---:|---|---:|---:|
| aquecimento | 0–2 | 190 | 3,6 s fixo | 0 | ~5,6 s |
| 1 | 3–9 | 220 | 3,0–3,6 s | 0 | ~4,8 s |
| 2 | 10–19 | 255 | 2,5–3,1 s | 0,20 | ~4,2 s |
| 3 | 20–29 | 295 | 2,1–2,7 s | 0,30 | ~3,6 s |

\* do nascimento (y = −70) até encostar no carro (y = 516), em velocidade normal.

- **Dupla** só existe com 3 ou 4 faixas e **nunca ocupa todas as faixas**. Com 2 faixas, sempre um
  rival por vez.
- **Nenhuma faixa recebe mais de 2 rivais seguidos**, nem com sorteio adversário. Isso garante
  que até um jogador parado ultrapasse alguém.
- Um rival novo só nasce se **todos** os rivais existentes estiverem com `y ≥ 160`, ou seja,
  ≥ 230 px de espaço. No nível 3 isso dá ≥ 1,4 s entre fileiras, e a troca de faixa mais longa
  (2 faixas em 3, ou 3 faixas em 4) leva ≤ 0,82 s: **sempre existe caminho**.
- A quantidade de faixas vem de `obterConfiguracoes().alternativas` (2, 3 ou 4), lida uma vez por
  corrida, igual à Corrida do Rael.

### 2.8 Aquecimento (a demonstração dentro da corrida)

- Os **3 primeiros rivais** vêm sozinhos, no ritmo do nível "aquecimento".
- O **1.º rival nasce na faixa do jogador**, para ensinar que é preciso sair da frente.
- Durante o aquecimento, a **seta verde** (2.9) aparece sempre que houver um rival na faixa do
  jogador a menos de 300 px.
- Falas do aquecimento: no primeiro rival, "Tem um carro na frente. Vá para o lado e ultrapasse!";
  na primeira ultrapassagem, "Ultrapassou!"; no primeiro posto, "Olha o posto! Passe por cima para
  abastecer.".

### 2.9 Ajuda adaptativa

- **Ajuda de desvio:** depois de **2 batidas seguidas** (sem ultrapassagem entre elas), os
  **3 próximos rivais** nascem a 60% do cruzeiro (vêm mais devagar na tela) e a seta verde volta a
  aparecer para eles. Fala uma vez: "Siga a seta verde!". Uma ultrapassagem zera a contagem de
  batidas seguidas.
- **Seta verde:** desenhada no asfalto, à frente do carro, apontando para a faixa sugerida.
  A sugestão é a faixa mais próxima sem rival (não saindo) na janela de 300 px à frente; no
  empate, a mais perto do centro da pista. Sem sugestão possível, não desenha.
- **Ajuda do posto:** 2.6 (posto de ajuda e reserva).
- Nenhuma ajuda é anunciada como erro, e nenhuma muda figurinha ou conquista.

### 2.10 Bandeirada

1. A 30.ª ultrapassagem gera o evento `meta`: todos os rivais passam a **saindo**, o posto some,
   nenhum rival ou posto nasce, a gasolina congela. Fala: "Trinta carros! Agora é a reta final!".
2. 1,0 s depois nasce a **linha de chegada** (y = −40, quadriculada preto e branco de borda a borda
   da pista, 2 fileiras de quadrados de 12 px) e desce na velocidade do jogador.
3. Quando a linha alcança `carro.y`, o evento `bandeirada` é emitido **uma única vez** e o motor
   vai para a fase `fim`.
4. Na fase `fim`, o carro freia linearmente até 0 em 1,5 s e o motor ignora a direção.
5. A tela mostra a bandeira quadriculada (OpenMoji 1F3C1) acenando em cima do Canvas: rotação de
   ±8° em CSS, desligada com movimento reduzido. Toca `vitoria`, `lancarConfete()` e a fala
   "Bandeirada! Você completou o Grande Prêmio, {nome}!".
6. Depois de 2,0 s, troca para a tela final.

### 2.11 Controles

Reaproveitar **literalmente** as regras de entrada da Corrida do Rael:

- Botões `◀` e `▶` de no mínimo **72×72 px**, com `aria-label` "Ir para a esquerda" e "Ir para a
  direita". `pointerdown` mantém a direção. `pointerup`, `pointercancel`, `blur` e
  `visibilitychange` zeram a entrada.
- Setas e A/D como alternativa. Toque sustentado nas metades do Canvas também funciona.
- Esquerda e direita juntas dão direção zero. Soltar um mantém o outro.
- `touch-action: none` só em `#pista`, `#esquerda` e `#direita`.
- Botões **Repetir** e **Pausar** de no mínimo 64×64 px, **longe** dos botões de direção (na faixa
  do painel, acima da pista), para não serem tocados sem querer.
- Espaço/Enter iniciam somente fora da corrida (convite, pausa e fim).

### 2.12 Pausa, aba oculta e movimento reduzido

- **Pausar** abre `#tela-pausa` sobre a pista com "▶ Continuar" e "🏠 Início". Nada anda na pausa
  e a gasolina não baixa.
- Aba oculta (`visibilitychange` → `hidden`) **pausa automaticamente**. Ao voltar, a pausa continua
  até o toque em "Continuar": a criança não é surpreendida com o carro já andando.
- Ao sair da pausa: zerar `ultimoTempo` antes do próximo quadro (sem salto) e zerar a entrada.
- `dt` sempre limitado a 0,05 s (como no original).
- `prefers-reduced-motion: reduce`: sem tremida da batida, sem fumaça, sem aceno da bandeira, sem
  pisca na barra de gasolina (fica vermelha e fixa), zebras e faixas continuam rolando (são o
  próprio movimento do jogo).

### 2.13 Falas, textos e narrador

Toda fala passa pelo **narrador** da tela (função `narrar(texto, prioridade)`), que usa
`falar()` de `shared/fala.js` sem `await` bloqueando o loop:

- **Prioridade 3:** reserva, pouca gasolina, meta, bandeirada. Interrompe qualquer fala.
- **Prioridade 2:** posto, primeira batida, ajuda de desvio, aquecimento. Interrompe prioridade ≤ 2.
- **Prioridade 1:** marcos e "Ultrapassou!". Descartada se houver fala em andamento ou se a última
  fala começou há menos de 1,5 s.
- Todo texto narrado também vai para `#retorno` (`aria-live="polite"`) e, em `modoAcompanhado()`,
  para `#roteiro-fala`. Nada é anunciado por quadro.

| Momento | Prioridade | Fala / texto exato |
|---|---:|---|
| convite | — | "{nome}, vamos correr no Grande Prêmio?" / sem nome: "Vamos correr no Grande Prêmio?" |
| explicação no convite (após o toque) | — | "Ultrapasse trinta carros para ganhar a bandeirada. E não esqueça de abastecer!" |
| largada | — | "Preparar... apontar... já!" |
| 1.º rival | 2 | "Tem um carro na frente. Vá para o lado e ultrapasse!" |
| 1.ª ultrapassagem | 1 | "Ultrapassou!" |
| marco 5 / 10 / 15 / 20 / 25 | 1 | "Cinco carros!" / "Dez carros!" / "Quinze carros!" / "Vinte carros!" / "Vinte e cinco carros!" |
| marco 28 / 29 | 1 | "Faltam só dois!" / "Falta só um!" |
| 1.º posto da corrida | 2 | "Olha o posto! Passe por cima para abastecer." |
| abasteceu | 2 | "Abasteceu!" |
| pouca gasolina | 3 | "A gasolina está acabando! Procure o posto!" |
| reserva | 3 | "Acabou a gasolina! O carro ficou devagar. Vá até o posto!" |
| primeira batida | 2 | "Opa! Bateu. Desvie dos carros!" |
| ajuda de desvio | 2 | "Siga a seta verde!" |
| meta | 3 | "Trinta carros! Agora é a reta final!" |
| bandeirada | 3 | "Bandeirada! Você completou o Grande Prêmio, {nome}!" / sem nome: "... Grande Prêmio, piloto!" |
| tela final (texto) | — | "Você ultrapassou 30 carros e abasteceu N vezes!" (N = 1: "1 vez"; N = 0: omitir a parte do abastecimento) |

Não usar "combustível", "tanque" nem "bomba" na fala: sempre **gasolina** e **posto**. Os números
dos marcos são falados por extenso para garantir a pronúncia.

### 2.14 Painel (HUD) e tela

```text
┌──────────────────────────────────────┐
│ [🏎]━━━━━━━●━━━━━━━━━━━[🏁]  12/30  [⏸]│  ← ultrapassagens (progressbar) + Pausar
│ [⛽]██████████░░░░░░░░         [🔊]  │  ← gasolina + Repetir
│ ┌──────────────────────────────────┐ │
│ │ zebra│   │ ▓rival  │   │zebra     │ │
│ │      ┆   ┆         ┆   ┆          │ │  ← Canvas 400×700 lógico
│ │      │   │  [carro azul] │        │ │
│ └──────────────────────────────────┘ │
│          [ ◀ ]          [ ▶ ]        │  ← ≥ 72×72 px
│  #retorno (texto curto da última fala)│
└──────────────────────────────────────┘
```

- **Ultrapassagens:** `role="progressbar"`, `aria-valuemin=0`, `aria-valuemax=30`,
  `aria-valuenow` e `aria-label="Carros ultrapassados: N de 30"`, atualizados **só no evento
  `ultrapassou`**. O mini carro se move sobre a trilha (`left` em %). O número `N/30` fica visível
  (ele gosta de contar), mas não é necessário para jogar.
- **Gasolina:** `role="progressbar"` com `aria-label` em palavras ("Gasolina cheia", "Gasolina pela
  metade", "Pouca gasolina", "Sem gasolina"), atualizado **só quando a categoria muda**. A largura
  da barra pode mudar por quadro (estilo inline). Cores: verde > 50, amarela 25–50, vermelha < 25,
  com pisca ≤ 2 Hz sem movimento reduzido. **Não mostrar porcentagem.**
- Ícones do painel são os SVGs OpenMoji de `public/figuras/corrida/`, nunca emoji do sistema.
  Emoji só nos rótulos de botão, como no resto do site.

---

## 3. Arquitetura e reaproveitamento

### 3.1 Matriz de reaproveitamento

| Origem | Bloco | Decisão |
|---|---|---|
| `rael/corrida-do-rael/jogo.js` (commit `cafe3a4`) | `quantidadeDeFaixas`, `geometriaDaPista`, `centroDaFaixa`, `faixaDoCarro`, `moverCarro`, `retangulosSeSobrepoem` | **Importar** (`import … from '../corrida-do-rael/jogo.js'`). Já existe precedente: `Games/ortografia/dados.js` importa de `../m-ou-n/jogo.js`. **Não importar constantes** (`VELOCIDADE_*`): passar tudo por parâmetro. |
| `rael/corrida-do-rael/tela.js` (commit `cafe3a4`) | `desenharPista`, `desenharCarro`, `desenharPosto`, `obterDirecaoDeEntrada`, `capturarDirecao`, `soltarDirecao`, `ligarBotaoDirecional`, `atualizarToqueCanvas`, `zerarEntradas`, `agendar`/`cancelarTimers`, `prefereMovimentoReduzido`, `mostrarTela`, `loopDoJogo` | **Copiar e adaptar** para `grande-premio/tela.js` (o `tela.js` tem efeitos colaterais e não pode ser importado). Manter nomes quando a função não mudar de papel. |
| `desenharCarro` | carro dos rivais | **Generalizar** com parâmetro de cor: `desenharCarro(c, { cor, faixaCorrida })`. Jogador azul com faixa branca central; rivais nas cores `#ef4444`, `#eab308`, `#22c55e`, `#a855f7`, `#f97316` (nunca azul). |
| `desenharPista` | pista | **Adaptar:** deslocamento vem de `estado.distancia % 80`; acrescentar **zebras** vermelho/branco nas bordas (blocos de 20 px rolando com a pista). |
| Pixel Racer original | `spawnEnemy`, `scored`, aceleração por placar | **Reintroduzir** em forma pura e testável (`sortearFaixasDosRivais`, contagem em `avancarCorrida`, `nivelDaCorrida`). Aceleração por degraus e com teto (2.7), não contínua. |
| Pixel Racer original | `triggerGameOver` na colisão | **Substituir** pela lentidão da seção 2.5. |
| WIP não commitado (se preservado na Etapa 0) | `desenharOutroCarro`, medidor de gasolina | Pode servir de **referência visual**; não copiar a tela "O combustível acabou!" nem o empurrão lateral. |
| `shared/` | `fala.js`, `sons.js`, `confete.js`, `descobertas.js`, `conquistas-tela.js`, `catalogo-figuras.js`, `cabecalho.js`, `pwa.js`, CSS comuns | **Usar sem alterar.** `rodada.js` (`criarSessao`) **não** é usado: a corrida não é uma lista de desafios. |

### 3.2 Arquivos permitidos

| Arquivo | Ação |
|---|---|
| `rael/grande-premio/index.html` | novo |
| `rael/grande-premio/grande-premio.css` | novo |
| `rael/grande-premio/jogo.js` | novo: motor puro |
| `rael/grande-premio/tela.js` | novo: Canvas, entrada, loop, narrador, fluxo |
| `rael/grande-premio/LICENSE-pixel-racer.txt` | novo: cópia **idêntica** de `rael/corrida-do-rael/LICENSE-pixel-racer.txt` |
| `public/figuras/corrida/carro-de-corrida.svg` | novo: OpenMoji `1F3CE.svg` sem alteração |
| `public/figuras/corrida/bandeira-quadriculada.svg` | novo: OpenMoji `1F3C1.svg` sem alteração |
| `public/figuras/corrida/bomba-de-gasolina.svg` | novo: OpenMoji `26FD.svg` sem alteração |
| `public/figuras/corrida/LICENCA.txt` | novo: atribuição OpenMoji (mesmo texto de `public/figuras/LICENCA.txt`, citando os três códigos e o commit do OpenMoji usado) |
| `tests/grande-premio.test.js` | novo |
| `tests/conquistas-descobertas.test.js` | acrescentar testes da nova atividade |
| `shared/conquistas-descobertas.js` | **uma** entrada em `ATIVIDADES_DESCOBERTAS` |
| `vite.config.ts` | **uma** linha em `paginas` |
| `rael/index.html` | **um** cartão, logo depois de "Corrida do Rael" |
| `README.md` | inventário, árvore e créditos |
| `MELHORIAS.md` | uma subseção "Grande Prêmio do Rael" depois de "Corrida do Rael", sem número de tarefa |

**Proibido tocar:** qualquer arquivo em `rael/corrida-do-rael/`, `shared/` (exceto a entrada
acima), `shared/catalogo-figuras.js`, `public/figuras/*.svg` da raiz, `package*.json`,
`MELHORIAS-historico.md`.

> Por que as figuras vão numa **subpasta**: `tests/figuras.test.js` exige que todo SVG da raiz de
> `public/figuras/` esteja no catálogo, e o catálogo alimenta os jogos de palavras. "Carro de
> corrida" entraria em rimas e sílabas por acidente. A subpasta segue o precedente de
> `public/figuras/labirinto/`, e as conquistas já aceitam caminho relativo
> (`figura: 'labirinto/ponte.svg'`).

### 3.3 Guardas (qualquer item reprova a etapa)

| # | Proibido |
|---|---|
| G01 | Alterar arquivo fora da seção 3.2. |
| G02 | Commitar `dist/`, `node_modules/`, `.DS_Store`, arquivos com ` 2` no nome ou o WIP da Corrida do Rael. |
| G03 | Adicionar dependência, fonte, áudio, imagem (além dos 3 SVGs OpenMoji) ou requisição externa. |
| G04 | Game over, vidas, recorde, ranking, cronômetro visível, contagem regressiva de prazo, perda de pontos, contador que diminui ou tela de derrota (inclusive "a gasolina acabou" encerrando a corrida). |
| G05 | Mostrar ao Rael o número de batidas ou qualquer indicação de erro acumulado. |
| G06 | `Math.random`, `Date.now` ou `performance.now` dentro de `jogo.js`. O sorteio entra por `sortear` injetado. |
| G07 | Acessar `localStorage` diretamente. |
| G08 | Chamar `speechSynthesis` ou `new Audio` diretamente. |
| G09 | Alterar a API de módulos de `shared/`. |
| G10 | Desenhar carro, posto ou bandeira com emoji. Canvas ou SVG OpenMoji apenas. |
| G11 | `.skip`, `.only`, `.todo` ou remoção de asserções. |
| G12 | Merge, push em `main`, PR ou deploy sem autorização. |
| G13 | Criar cópias "backup", `tela-nova.js` etc. dentro do repositório. |
| G14 | `catch {}` para esconder erro novo. |
| G15 | Declarar verificação de navegador, offline ou mobile sem ter aberto a página. |
| G16 | Exigir leitura para jogar. |

### 3.4 API do motor puro (`rael/grande-premio/jogo.js`)

Módulo sem DOM, Canvas, `window`, armazenamento, áudio, fala ou relógio. Estado em objeto
simples, serializável em JSON (sem funções, `Map`, `Set` ou `Infinity`).

```js
/**
 * Grande Prêmio do Rael — motor puro da corrida.
 * Derivado de Pixel Racer (https://github.com/Elomami1976/pixel-racer).
 * Copyright (c) 2026 Tarek Elomami — licença MIT. Cópia em LICENSE-pixel-racer.txt.
 */
import {
  quantidadeDeFaixas, geometriaDaPista, centroDaFaixa, faixaDoCarro,
  moverCarro, retangulosSeSobrepoem,
} from '../corrida-do-rael/jogo.js';

export const LARGURA_CANVAS = 400;
export const ALTURA_CANVAS = 700;
export const MARGEM_DA_PISTA = 36;
export const CARRO = Object.freeze({ w: 44, h: 64, y: 580 });
export const VELOCIDADE_LATERAL = 300;
export const META_ULTRAPASSAGENS = 30;
export const MARCOS = Object.freeze([5, 10, 15, 20, 25, 28, 29]);
export const MARGEM_COLISAO = 6;
export const FATOR_RIVAL = 0.45;
export const FATOR_RIVAL_AJUDA = 0.6;
export const RIVAIS_COM_AJUDA = 3;
export const BATIDAS_PARA_AJUDA = 2;
export const DURACAO_LENTIDAO = 2.0;
export const FATOR_LENTIDAO = 0.35;
export const DURACAO_RETOMADA = 0.6;
export const CAPACIDADE_TANQUE = 100;
export const CONSUMO_POR_SEGUNDO = 2.0;
export const LIMIAR_POSTO = 50;
export const LIMIAR_POUCA_GASOLINA = 25;
export const FATOR_RESERVA = 0.4;
export const ESPERA_APOS_POSTO_PERDIDO = 4.0;
export const ESPERA_POSTO_RESERVA = 1.5;
export const POSTOS_PERDIDOS_PARA_AJUDA = 2;
export const Y_NASCIMENTO_RIVAL = -70;
export const Y_NASCIMENTO_POSTO = -80;
export const Y_LIBERA_NOVO_RIVAL = 160;
export const Y_REMOVE_A_FRENTE = -400;
export const DURACAO_SAIDA = 0.5;
export const PRIMEIRO_RIVAL_APOS = 1.5;
export const ESPERA_LINHA_DE_CHEGADA = 1.0;
export const DURACAO_FREADA_FINAL = 1.5;
export const DT_MAXIMO = 0.05;
export const JANELA_DA_SETA = 300;
export const RIVAIS_DE_AQUECIMENTO = 3;
export const CORES_DOS_RIVAIS = Object.freeze(['#ef4444', '#eab308', '#22c55e', '#a855f7', '#f97316']);

/** Tabela da seção 2.7, congelada. */
export const NIVEIS = Object.freeze([
  Object.freeze({ nome: 'aquecimento', ate: 2, cruzeiro: 190, intervalo: [3.6, 3.6], chanceDupla: 0 }),
  Object.freeze({ nome: 'nivel-1', ate: 9, cruzeiro: 220, intervalo: [3.0, 3.6], chanceDupla: 0 }),
  Object.freeze({ nome: 'nivel-2', ate: 19, cruzeiro: 255, intervalo: [2.5, 3.1], chanceDupla: 0.2 }),
  Object.freeze({ nome: 'nivel-3', ate: 29, cruzeiro: 295, intervalo: [2.1, 2.7], chanceDupla: 0.3 }),
]);

/** Nível pelo número de ultrapassagens; inválido/negativo → aquecimento; ≥ 29 → nível 3. */
export function nivelDaCorrida(ultrapassagens) {}

/**
 * Velocidade atual do jogador (px/s).
 * - tempoDesdeBatida < 2,0 → cruzeiro × 0,35
 * - 2,0 ≤ t < 2,6 → interpolação linear de 0,35 a 1,0
 * - reserva → no máximo cruzeiro × 0,40 (vale o menor dos dois limites)
 * Entradas inválidas nunca produzem NaN; sem batida, usar tempoDesdeBatida = null.
 */
export function velocidadeDoJogador({ cruzeiro, tempoDesdeBatida = null, reserva = false }) {}

/** Gasolina após dt; resultado sempre entre 0 e 100; dt inválido/negativo = 0. */
export function consumirGasolina({ nivel, dt, taxa = CONSUMO_POR_SEGUNDO }) {}

/**
 * Faixas do próximo nascimento: array de 1 ou 2 índices distintos, ordenados.
 * - 2 faixas: sempre 1 rival
 * - nunca ocupa todas as faixas
 * - dupla só se sortear() < chanceDupla e faixas >= 3
 * - nenhuma faixa aparece em 3 nascimentos seguidos (historico = últimos nascimentos)
 * - `forcarFaixa` (aquecimento, 1.º rival) tem prioridade e gera rival único
 */
export function sortearFaixasDosRivais({ faixas, chanceDupla, historico = [], sortear, forcarFaixa = null }) {}

/**
 * Faixa para um posto: só faixas sem rival (não saindo) com Y_NASCIMENTO_POSTO <= y <= carro.y.
 * Com `preferirFaixa`, devolve essa faixa se livre, senão a livre mais próxima dela
 * (empate → a menor). Sem preferência, sorteia entre as livres. Nenhuma livre → null.
 */
export function faixaParaPosto({ estado, preferirFaixa = null, sortear }) {}

/**
 * Faixa sugerida pela seta verde, ou null. Só sugere se houver rival (não saindo) na faixa do
 * jogador com a borda de baixo entre carro.y - JANELA_DA_SETA e carro.y.
 */
export function faixaSugerida(estado) {}

/** Estado inicial (seção 3.5). Carro centralizado na faixa floor((faixas - 1) / 2). */
export function criarCorrida({ faixas = 3 } = {}) {}

/**
 * Avança a simulação. MUTA `estado` e devolve a lista de eventos do passo (seção 3.6).
 * `direcao` é normalizada para -1, 0 ou 1; `dt` é limitado a [0, DT_MAXIMO].
 */
export function avancarCorrida(estado, { dt, direcao = 0 }, { sortear }) {}

/** { ultrapassagens, abastecimentos, terminou } — sem batidas (G05). */
export function resumoDaCorrida(estado) {}
```

### 3.5 Formato do estado

```js
{
  fase: 'correndo',            // 'correndo' | 'chegada' | 'fim'
  faixas: 3,
  geometria: { inicio: 36, fim: 364, largura: 400, larguraFaixa: 109.33, faixas: 3 },
  tempo: 0,                    // segundos simulados
  distancia: 0,                // px percorridos (rolagem da pista)
  velocidade: 190,             // velocidade do jogador no último passo
  carro: { x: 178, y: 580, w: 44, h: 64 },
  ultrapassagens: 0,
  abastecimentos: 0,
  batidas: 0,                  // só para testes; nunca exibido
  batidasSeguidas: 0,
  tempoDesdeBatida: null,      // null = sem batida recente
  rivaisComAjuda: 0,           // quantos próximos rivais ainda nascem lentos
  rivaisNascidos: 0,
  historicoDeFaixas: [],       // últimos 2 nascimentos (arrays de faixas)
  tempoAteProximoRival: 1.5,
  rivais: [],                  // { id, faixa, x, y, w, h, velocidade, cor, contado, saindo, alfa, comAjuda }
  gasolina: 100,
  avisouPoucaGasolina: false,
  reserva: false,
  posto: null,                 // { faixa, x, y, w, h, ajuda }
  postosPerdidosSeguidos: 0,
  tempoAteProximoPosto: 0,
  tempoAteLinha: null,
  linhaDeChegada: null,        // { y }
  tempoDeFreada: 0,
  proximoId: 1,
}
```

### 3.6 Ordem exata de `avancarCorrida` e eventos

Em cada chamada, nesta ordem (os eventos saem na ordem em que acontecem):

1. `fase === 'fim'`: frear (velocidade linear até 0 em `DURACAO_FREADA_FINAL`), rolar a pista e os
   objetos, **nenhum evento**, ignorar direção. Retornar.
2. Normalizar `dt` e `direcao`. `tempo += dt`. Se `tempoDesdeBatida !== null`, somar `dt`; ao
   passar de 2,6 s, voltar a `null`.
3. **Gasolina** (só em `correndo` e fora da reserva): consumir. Ao cruzar ≤ 25 pela primeira vez
   neste tanque → `{ tipo: 'pouca-gasolina' }`. Ao chegar a 0 → `reserva = true`, todos os rivais
   `saindo`, `tempoAteProximoPosto = ESPERA_POSTO_RESERVA` e `{ tipo: 'reserva' }`.
4. `cruzeiro = nivelDaCorrida(ultrapassagens).cruzeiro`; `velocidade = velocidadeDoJogador(...)`.
5. Mover o carro com `moverCarro` (velocidade lateral 300, limites da pista).
6. `distancia += velocidade × dt`; rivais `y += (velocidade − rival.velocidade) × dt`; rivais
   saindo: `alfa -= dt / DURACAO_SAIDA`; posto e linha: `y += velocidade × dt`.
7. **Batida** (fase `correndo`, sem imunidade): o primeiro rival não saindo e não contado cuja
   AABB se sobrepõe (margem 6) → `saindo = true`, `batidas++`, `batidasSeguidas++`,
   `tempoDesdeBatida = 0`, `{ tipo: 'bateu', rivalId, primeira: batidas === 1 }`. Se
   `batidasSeguidas === BATIDAS_PARA_AJUDA` → `rivaisComAjuda = 3`, `{ tipo: 'ajuda-desvio' }`.
8. **Posto:** se sobrepõe ao carro (margem 4) → `gasolina = 100`, `reserva = false`,
   `avisouPoucaGasolina = false`, `abastecimentos++`, `postosPerdidosSeguidos = 0`, `posto = null`,
   `tempoAteProximoPosto = 0`, `{ tipo: 'abasteceu', total }`.
9. **Ultrapassagens:** cada rival não contado e não saindo com `y > carro.y + carro.h` →
   `contado = true`, `ultrapassagens++`, `batidasSeguidas = 0`,
   `{ tipo: 'ultrapassou', total }`. Se `total` estiver em `MARCOS` → `{ tipo: 'marco', total }`.
   Se `total === 30` → `fase = 'chegada'`, todos os rivais `saindo`, `posto = null`,
   `tempoAteLinha = 1,0`, `{ tipo: 'meta' }` e **parar de contar** neste passo.
10. **Limpeza:** remover rivais com `y > ALTURA_CANVAS + 20`, `alfa <= 0` ou
    `y < Y_REMOVE_A_FRENTE`. Posto com `y > ALTURA_CANVAS` → `posto = null`,
    `postosPerdidosSeguidos++`, `tempoAteProximoPosto = reserva ? 1,5 : 4,0`,
    `{ tipo: 'posto-perdido' }`.
11. **Nascimento de rival** (só em `correndo`, fora da reserva e com `tempoDesdeBatida === null`):
    `tempoAteProximoRival -= dt`; se ≤ 0 **e** todos os rivais têm `y ≥ 160` **e** o nascimento
    não é "normal com rival de ajuda ainda na pista" (ver nota abaixo): sortear faixas
    (primeiro rival: `forcarFaixa` = faixa do jogador), criar rivais com velocidade
    `cruzeiro × (rivaisComAjuda > 0 ? 0,60 : 0,45)` e cor sorteada, decrementar `rivaisComAjuda`
    uma vez por nascimento, sortear o próximo intervalo do nível e emitir
    `{ tipo: 'rival-apareceu', faixas, numero: rivaisNascidos, aquecimento: rivaisNascidos <= 3 }`.
    Se o espaço não estiver livre, manter o relógio em 0 e tentar no próximo passo.
    **Nota:** rival de ajuda (0,60×) desce mais devagar na tela que um rival normal (0,45×). No
    nível 3, um normal nascido atrás de um de ajuda na mesma faixa o alcança em ~3,8 s, antes de o
    de ajuda sair da tela (~4,7 s). Por isso, **enquanto houver rival `comAjuda` não contado e não
    saindo, nenhum rival normal nasce**. O contrário (rival de ajuda nascendo atrás de um normal)
    é seguro: eles se afastam.
12. **Nascimento de posto** (só em `correndo`, sem posto): se `reserva` ou `gasolina ≤ 50`,
    `tempoAteProximoPosto -= dt`; se ≤ 0: `preferir = reserva || perdidos ≥ 2 ? faixa do jogador :
    null`; `faixaParaPosto(...)`; se `null` → `tempoAteProximoPosto = 0,5`; senão criar posto
    (`ajuda = preferir !== null`) e `{ tipo: 'posto-apareceu', faixa, ajuda, primeiro }`.
13. **Chegada** (fase `chegada`): `tempoAteLinha -= dt`; ao chegar a 0, criar
    `linhaDeChegada = { y: -40 }`. Quando `linhaDeChegada.y >= carro.y` → `fase = 'fim'`,
    `{ tipo: 'bandeirada' }` (uma única vez).

Tipos de evento válidos, e somente estes: `rival-apareceu`, `ultrapassou`, `marco`, `bateu`,
`ajuda-desvio`, `posto-apareceu`, `abasteceu`, `posto-perdido`, `pouca-gasolina`, `reserva`,
`meta`, `bandeirada`.

### 3.7 Fases da tela (`tela.js`)

Uma variável `faseDaTela`, sem booleanos paralelos:

```js
export const FASES = Object.freeze({
  CONVITE: 'convite', LARGADA: 'largada', CORRIDA: 'corrida',
  PAUSA: 'pausa', BANDEIRADA: 'bandeirada', FIM: 'fim',
});
```

```text
CONVITE -> LARGADA -> CORRIDA
CORRIDA -> PAUSA -> CORRIDA            (botão Pausar / aba oculta → Continuar)
CORRIDA -> BANDEIRADA -> FIM           (evento 'bandeirada'; 2,0 s de animação)
FIM -> LARGADA                         (Correr de novo)
qualquer -> página inicial             (cabeçalho; limpar tudo em pagehide)
```

- `avancarCorrida` só é chamado em `CORRIDA` e `BANDEIRADA` (freada). O RAF desenha em todas.
- Um único RAF durante a vida da página; listeners registrados uma vez; timers num `Set` central
  cancelados em reinício e `pagehide`; contador `geracaoDaCorrida` para descartar callbacks e falas
  antigas. É o mesmo padrão da Corrida do Rael, copiado.
- `sortear = Math.random` é injetado **pela tela**.
- `preparar()` da fala é chamado no toque em "Vamos correr" (exigência do iOS).
- `registrarRodada('grande-premio')` com guarda `corridaRegistrada = true` definida **antes** da
  chamada, uma vez por corrida.

---

## 4. Protocolo do executor

### 4.1 Regras

- Uma etapa por vez, na ordem. Não começar a seguinte sem o aceite do Diego.
- Não marcar `[x]` sem evidência real (comando e saída, ou observação no navegador com viewport).
  Se não executou, escrever **NÃO EXECUTADO**; se não abriu o navegador, **NÃO VERIFICADO NO
  NAVEGADOR**.
- Não editar este plano para fazer a implementação caber nele. Mudança de escopo só pelo Diego.
- Nunca `git add .` ou `git add -A`. Adicionar arquivos da lista da etapa, conferir
  `git diff --cached --name-only` linha por linha.
- Nunca `git reset --hard`, `git clean`, `git checkout --`, `git stash` ou `git restore` amplo.
- Precedência em conflito: **pedido do Diego > este plano > seção 5.0 do MELHORIAS > código
  original**. As exceções da seção 2.3 existem só para este jogo.

### 4.2 Leitura obrigatória antes de editar

1. Este plano inteiro.
2. `MELHORIAS.md`, seções **2.2**, **5.0** e **6**, e a subseção **Corrida do Rael**.
3. `rael/corrida-do-rael/jogo.js`, `tela.js`, `index.html`, `corrida-do-rael.css` na versão do
   commit `cafe3a4` (`git show cafe3a4:<caminho>`), como fonte do código a copiar.
4. `shared/fala.js`, `shared/sons.js`, `shared/descobertas.js`, `shared/conquistas-descobertas.js`,
   `shared/conquistas-tela.js`, `shared/confete.js`.
5. `tests/corrida-do-rael.test.js` e `tests/conquistas-descobertas.test.js`, como modelo de testes.

### 4.3 Comandos do projeto

O caminho local tem `:`, que quebra o `PATH` do `npm run`. Usar sempre os binários locais:

```sh
node ./node_modules/vitest/vitest.mjs run
node ./node_modules/typescript/bin/tsc --noEmit
node ./node_modules/vite/bin/vite.js build && node scripts/gerar-service-worker.mjs sw.js dist/sw.js dist
node ./node_modules/vite/bin/vite.js            # desenvolvimento
node ./node_modules/vite/bin/vite.js preview    # validar build e offline
```

Não usar `npx`, não instalar nada, não alterar `package.json`/lockfile.

### 4.4 Guardas ao fim de toda etapa

```sh
git status --short
git diff --check
git diff --name-only <base>
git diff --stat <base> -- package.json package-lock.json MELHORIAS-historico.md rael/corrida-do-rael shared/catalogo-figuras.js
rg -n "\.skip\(|\.only\(|\.todo\(" tests
rg -n "Math\.random|Date\.now|performance\.now|document|window|localStorage" rael/grande-premio/jogo.js
```

As duas últimas buscas devem voltar vazias. O `--stat` só pode listar arquivos da seção 3.2.

### 4.5 Relatório por etapa

```text
## Etapa N — relatório
Commit: <hash> <mensagem>
Base: <hash de início>
Arquivos alterados: <git diff --name-only HEAD~1>

Comandos:
- testes: <Test Files … / Tests …>
- tsc: <saída; vazia = ok>
- build: <últimas linhas> (quando aplicável)
- guardas G01–G16 e 4.4: <ok / falhou, com evidência>

Critérios de aceite:
- [x] A<N>.1 … (como foi verificado)
- [ ] A<N>.2 … NÃO VERIFICADO / FALHOU: <motivo>

Desvios do plano: <nenhum | lista>
A observar com o Rael: <lista>
```

### 4.6 Prompt para iniciar cada etapa

```text
Leia PLANO-GRANDE-PREMIO-DO-RAEL.md por inteiro e execute somente a Etapa N.
Não antecipe etapas seguintes. Preserve alterações preexistentes do usuário.
Obedeça à lista de arquivos (3.2), às guardas G01–G16, aos números e contratos exatos.
Rode todos os critérios A<N>.* e entregue o relatório no formato 4.5 com saídas reais.
Se algum critério falhar ou não puder ser verificado, não declare a etapa pronta,
não improvise mudança de escopo: pare e explique ao Diego.
```

---

## 5. Etapas

### Etapa 0 — Preparar a base (decisão do Diego, sem código)

**Situação encontrada em 2026-09-22:** branch `corrida-do-rael` em `cafe3a4`, **não mesclada em
`main`**, com alterações não commitadas em `rael/corrida-do-rael/{corrida-do-rael.css,index.html,
jogo.js,tela.js}` e `tests/corrida-do-rael.test.js` (trânsito, gasolina contínua e a tela
"O combustível acabou!"). Com o WIP, a suíte tinha **29 arquivos / 385 testes** passando.

O executor **não** mexe no WIP sem autorização escrita do Diego. Opções:

- **A (recomendada): preservar o WIP numa branch própria**
  ```sh
  git switch -c corrida-trafego-wip
  git add rael/corrida-do-rael/corrida-do-rael.css rael/corrida-do-rael/index.html \
          rael/corrida-do-rael/jogo.js rael/corrida-do-rael/tela.js tests/corrida-do-rael.test.js
  git commit -m "WIP: transito e gasolina na Corrida do Rael (nao mesclar)"
  git switch corrida-do-rael          # volta limpa para cafe3a4
  git switch -c grande-premio         # base do novo jogo
  ```
- **B:** o próprio Diego descarta o WIP e depois cria `grande-premio` a partir de `corrida-do-rael`.
- **C:** se `corrida-do-rael` já tiver sido mesclada em `main`, criar `grande-premio` a partir de
  `main`.

A base **precisa** conter a Corrida do Rael commitada, porque o motor novo importa
`../corrida-do-rael/jogo.js` e o catálogo de conquistas já tem `corrida-do-rael`.

**Critérios:**

- [ ] A0.1 `git status --short` limpo, exceto os arquivos ` 2` (cópias do Finder) e este plano,
  que continuam não rastreados e ficam fora de todos os commits do jogo.
- [ ] A0.2 `git rev-parse HEAD` registrado como `<base>`; `git log -1 --format=%s` registrado.
- [ ] A0.3 Linha de base registrada: saída real de testes (arquivos/testes) e `tsc` com código 0.
  **Usar esse número**, não 385, como referência das etapas seguintes.

### Etapa 1 — Esqueleto integrado

**Arquivos:** `rael/grande-premio/{index.html, grande-premio.css, tela.js,
LICENSE-pixel-racer.txt}`, `public/figuras/corrida/*` (3 SVGs + `LICENCA.txt`), `vite.config.ts`,
`rael/index.html`.

**Procedimento:**

1. Copiar a licença: `cp rael/corrida-do-rael/LICENSE-pixel-racer.txt rael/grande-premio/`.
2. Baixar do OpenMoji (versão colorida), registrando o hash do commit usado no `LICENCA.txt`:
   `https://raw.githubusercontent.com/hfg-gmuend/openmoji/<commit>/color/svg/{1F3CE,1F3C1,26FD}.svg`.
   Em 2026-09-22 o `master` era `aeb8bb3a59e2de39c754ac79180c8131c906acea` e os três arquivos
   respondiam 200. Só renomear, sem editar o SVG.
3. `index.html` a partir de `git show cafe3a4:rael/corrida-do-rael/index.html`, trocando título,
   descrição, CSS próprio e telas. IDs obrigatórios, **exatamente uma vez cada**:

   ```text
   tela-convite comecar aviso-voz
   tela-corrida painel ultrapassagens barra-ultrapassagens contador gasolina barra-gasolina
   repetir pausar quadro-pista pista semaforo bandeira retorno roteiro roteiro-fala controles esquerda direita
   tela-pausa continuar
   tela-fim texto-fim figurinha de-novo
   ```

   `#bandeira` é a imagem da bandeira quadriculada **sobre o Canvas**, com `hidden` até a
   bandeirada. A tela final pode repetir a figura sem `id`.

   - `<title>Grande Prêmio do Rael — Jogos do Rael</title>`, `lang="pt-BR"`, `class="tema-rael"`,
     manifest e ícones iguais aos da Corrida do Rael.
   - `<canvas id="pista" width="400" height="700" aria-label="Pista do Grande Prêmio">` com texto
     alternativo interno.
   - `#retorno` com `aria-live="polite"`; telas inativas com `hidden`; todos os botões
     `type="button"`.
   - `#semaforo`: três `<span>` (vermelho, amarelo, verde) sobre o Canvas, `aria-hidden="true"`.
   - `#tela-pausa` é sobreposição dentro de `#quadro-pista`, não uma página nova.
4. CSS: caber a partir de 360 px sem rolagem horizontal; Canvas 400×700 lógico reduzido só
   visualmente; `#esquerda`/`#direita` ≥ 72×72; `#repetir`/`#pausar` ≥ 64×64; `touch-action: none`
   só em `#pista`, `#esquerda`, `#direita`.
5. Rota no Vite (uma linha, depois de `rael-corrida-do-rael`).
6. Cartão em `rael/index.html`, logo depois do cartão "Corrida do Rael", com
   `/figuras/corrida/carro-de-corrida.svg`, nome "Grande Prêmio do Rael" e
   `data-rodadas="grande-premio"`.
7. `tela.js` nesta etapa: aviso MIT no topo, `montarCabecalho('Grande Prêmio do Rael')`,
   configuração de voz e convite → exibe `tela-corrida` com a pista **parada** desenhada
   (`desenharPista` copiado). Sem loop de jogo ainda.

**Critérios:**

- [ ] A1.1 `cmp -s rael/corrida-do-rael/LICENSE-pixel-racer.txt rael/grande-premio/LICENSE-pixel-racer.txt` → código 0.
- [ ] A1.2 Os três SVGs têm `<svg`, não têm `<script` e são idênticos aos baixados
  (`shasum -a 256` no relatório). `LICENCA.txt` cita OpenMoji, CC BY-SA 4.0, os três códigos e o commit.
- [ ] A1.3 Nenhum ID da lista falta ou se repete:
  ```sh
  for id in tela-convite comecar aviso-voz tela-corrida painel ultrapassagens barra-ultrapassagens contador gasolina barra-gasolina repetir pausar quadro-pista pista semaforo bandeira retorno roteiro roteiro-fala controles esquerda direita tela-pausa continuar tela-fim texto-fim figurinha de-novo; do n=$(rg -o "id=\"$id\"" rael/grande-premio/index.html | wc -l | tr -d ' '); test "$n" = 1 || echo "$id:$n"; done
  ```
- [ ] A1.4 `git diff <base> -- vite.config.ts` = 1 linha adicionada, 0 removidas.
- [ ] A1.5 `git diff <base> -- rael/index.html` contém só o novo cartão, na posição definida.
- [ ] A1.6 `tests/figuras.test.js` continua passando (a subpasta não entra no catálogo).
- [ ] A1.7 Build com código 0; existe `dist/rael/grande-premio/index.html`;
  `rg -c "grande-premio" dist/sw.js` ≥ 1; `rg -c "figuras/corrida/" dist/sw.js` ≥ 3.
- [ ] A1.8 Em 360×800 e 390×844: sem rolagem horizontal, Canvas inteiro, botões nas medidas;
  convite → tela da corrida por toque; console sem erro, Network sem 404.
- [ ] A1.9 Suíte e `tsc` iguais à linha de base da Etapa 0. Guardas passam.

**Commit:** `Adiciona base do Grande Premio do Rael`

**Parar e entregar o relatório da Etapa 1.**

### Etapa 2 — Motor puro e testes

**Arquivos:** `rael/grande-premio/jogo.js`, `tests/grande-premio.test.js`.

**Procedimento:**

1. Implementar exatamente a API da seção 3.4, com o estado da 3.5 e a ordem da 3.6.
2. Validar números com `Number.isFinite`. Nenhuma função pública devolve `NaN` ou `Infinity`.
3. No teste, criar um gerador determinístico (LCG com semente) para `sortear`, além de sorteadores
   adversários (`() => 0`, `() => 0.999999`).
4. Criar dois bots **no arquivo de teste**:
   - **parado**: `direcao = 0` sempre;
   - **desviador**: se `faixaSugerida(estado)` não for `null`, dirige até o centro dela; se houver
     posto na tela, dirige até a faixa do posto; senão fica parado.
5. Simular com `dt = 0.05` (o máximo) para os testes rodarem rápido.

**Matriz mínima: 45 `it()` explícitos.**

| Grupo | Casos obrigatórios |
|---|---|
| constantes | valores da 3.4; `NIVEIS` congelado; cores sem azul (`#3b82f6`/`#2563eb`/`#0f5aa8` ausentes) |
| `nivelDaCorrida` | 0, 2, 3, 9, 10, 19, 20, 29, 30, 100, −1, `NaN`, string |
| `velocidadeDoJogador` | sem batida; t = 0; t = 1,99; t = 2,3 (≈ 0,675×); t = 2,6 → 1×; reserva 0,40×; reserva + batida → menor; entradas inválidas sem `NaN` |
| `consumirGasolina` | consumo normal; limite em 0; nunca > 100; dt negativo/`NaN` = 0 |
| `sortearFaixasDosRivais` | 2 faixas sempre 1; dupla só com chance e ≥ 3 faixas; nunca todas; índices válidos e distintos; `forcarFaixa`; com `() => 0` nenhuma faixa 3× seguida (500 nascimentos); determinismo |
| `faixaParaPosto` | preferida livre; preferida ocupada → livre mais próxima; rival saindo não bloqueia; rival acima do nascimento não bloqueia; todas ocupadas → `null` |
| `faixaSugerida` | sem rival → `null`; rival fora da janela → `null`; rival na janela → faixa livre mais próxima; empate → mais perto do centro |
| `criarCorrida` | campos da 3.5; carro centralizado; `JSON.parse(JSON.stringify(e))` igual a `e`; 2/3/4 faixas; faixas inválidas → 3 |
| `avancarCorrida`: ultrapassagem | conta uma vez; evento `ultrapassou` único por rival; marcos 5…29 emitidos uma vez; dupla conta 2 |
| `avancarCorrida`: batida | evento com `primeira`; lentidão 0,35×; imunidade de 2,6 s sem 2.ª batida; rival batido nunca conta; relógio de nascimento congelado; `ajuda-desvio` na 2.ª seguida; ultrapassagem zera `batidasSeguidas`; 3 rivais seguintes a 0,60×; rival normal não nasce enquanto houver rival de ajuda na pista |
| `avancarCorrida`: gasolina | consumo de 2/s; `pouca-gasolina` uma vez por tanque; `reserva` em 0 com rivais saindo e sem nascimentos; posto na faixa do jogador na reserva; `abasteceu` volta a 100 e sai da reserva; `posto-perdido` → novo em 4 s; 2 perdidos → posto de ajuda |
| `avancarCorrida`: aquecimento | 1.º rival na faixa do jogador; 3 primeiros sozinhos a cruzeiro 190 |
| `avancarCorrida`: chegada | 30 → `meta`, fase `chegada`, rivais saindo, sem nascimentos, gasolina congelada; linha após 1 s; `bandeirada` uma vez; fase `fim` ignora direção, freia até 0 em 1,5 s e não emite eventos |
| `avancarCorrida`: robustez | `dt = 10` age como 0,05; `dt < 0` e `NaN` = 0; direção 5 → 1; carro sempre dentro da pista |
| simulações | ver abaixo |

**Simulações obrigatórias** (para 2, 3 e 4 faixas; 60 sementes cada):

- **S1 — nunca trava:** o bot **parado** chega a `bandeirada` em ≤ 12 min simulados em todas as
  sementes e também com os dois sorteadores adversários.
- **S2 — invariantes por passo:** `0 ≤ gasolina ≤ 100`; `ultrapassagens` nunca diminui e nunca
  passa de 30; `carro.x` dentro da pista; nenhum nascimento ocupa todas as faixas; eventos só dos
  tipos da 3.6; `bandeirada` exatamente uma vez.
- **S3 — desviar compensa:** na mesma semente, o bot **desviador** termina com **menos tempo
  simulado** que o parado em ≥ 90% das sementes, e com menos batidas no total somado.
- **S4 — sem sobreposição:** em nenhum passo o posto sobrepõe um rival não saindo, e dois rivais
  não saindo nunca se sobrepõem.
- **S5 — duração plausível:** a média do tempo do bot desviador com 3 faixas fica entre 60 s e
  240 s (estimativa pela tabela 2.7: ~85 s sem batidas). Registrar no relatório as médias e máximos de S1/S3 por quantidade de faixas.

**Critérios:**

- [ ] A2.1 API exporta todos os contratos da 3.4; helpers extras justificados no relatório.
- [ ] A2.2 Buscas da seção 4.4 sobre `jogo.js` voltam vazias.
- [ ] A2.3 `node ./node_modules/vitest/vitest.mjs run tests/grande-premio.test.js` passa 3 vezes
  seguidas com a mesma contagem e leva < 10 s.
- [ ] A2.4 ≥ 45 `it()` novos, contados e listados por grupo no relatório.
- [ ] A2.5 S1 a S5 passam; números registrados.
- [ ] A2.6 Suíte completa = linha de base + novos; `tsc` limpo; nenhum arquivo além dos dois.

**Commit:** `Cria e testa o motor do Grande Premio`

**Parar e entregar o relatório da Etapa 2.**

### Etapa 3 — Pista, carros, controles, loop e batida

**Arquivos:** `rael/grande-premio/tela.js`, `grande-premio.css`; `index.html` só para completar
atributos já previstos. Não mudar o motor para compensar a tela: se o contrato estiver errado,
voltar formalmente à Etapa 2.

**Procedimento:**

1. Copiar e adaptar da Corrida do Rael (`cafe3a4`) as funções listadas na 3.1: entrada,
   timers, loop, `desenharPista` (com zebras), `desenharCarro` (com cor), `desenharPosto`.
2. Loop: `requestAnimationFrame(loop)` uma vez na carga e uma vez por quadro. `dt` real limitado
   pelo motor. Em `CORRIDA`, chamar `avancarCorrida(estado, { dt, direcao }, { sortear: Math.random })`
   e despachar os eventos para `tratarEvento(evento)`.
3. Ordem de desenho: grama → pista e zebras → faixas → linha de chegada → posto → seta verde →
   rivais (com `globalAlpha = alfa`) → carro do jogador → fumaça/"+1" → nada de texto essencial.
   `save()`/`restore()` em toda transformação.
4. Batida (2.5): tremida de ±4 px por 0,4 s, fumaça por 2 s, pisca ≤ 2 Hz durante a imunidade.
   Desligar tremida e fumaça com movimento reduzido.
5. Painel: `atualizarUltrapassagens(total)` só em evento; `atualizarGasolina(nivel)` a cada quadro
   para a largura e só na mudança de categoria para `aria-label` e classe de cor.
6. Nesta etapa a corrida começa direto no toque (sem semáforo), e os eventos só tocam **som**;
   falas ficam para a Etapa 4. Bandeirada provisória: em `bandeirada`, só trocar para `tela-fim`
   sem registrar nada.

**Critérios:**

- [ ] A3.1 Tabela de proveniência "função original → função final → mudança" para cada item da 3.1.
- [ ] A3.2 Com 2, 3 e 4 faixas (mudando em Configurações do Rael), captura mostra o número certo
  de faixas, zebras, rivais e posto inteiros dentro da pista.
- [ ] A3.3 Segurar ◀ por 2 s leva o carro ao limite sem ultrapassá-lo; idem ▶. Os dois juntos → X
  parado. `pointerup`, `pointercancel`, `blur` e `visibilitychange` zeram a direção (cada um
  exercitado).
- [ ] A3.4 Bater de propósito: carro visivelmente mais lento por ~2 s, sem segunda batida
  durante a imunidade, rival batido some e **o contador não muda**; depois volta ao normal.
- [ ] A3.5 Passar um rival sem bater: contador +1 no momento em que o rival fica todo abaixo do
  carro; `aria-valuenow` acompanha.
- [ ] A3.6 Não pegar posto até a gasolina zerar: barra vermelha, pista esvazia, carro devagar,
  posto aparece na faixa do carro; passar nele → barra cheia e rivais voltam a nascer.
- [ ] A3.7 Chegar a 30 (para abreviar, pode pausar num breakpoint dentro do loop e executar
  `estado.ultrapassagens = 29` no console do escopo pausado, **sem commitar instrumentação**):
  rivais somem, linha aparece, `tela-fim` abre uma vez.
- [ ] A3.8 Redimensionar 390×844 → 360×800 → 1280×800 mantém `canvas.width = 400` e
  `canvas.height = 700`, sem corte ou rolagem horizontal.
- [ ] A3.9 60 s de corrida sem erro no console; um único RAF e uma reação por toque após 5
  reinícios (instrumentação temporária removida antes do commit).
- [ ] A3.10 `rg -n "GAME OVER|triggerGameOver|combust[ií]vel acabou|tentar de novo|recorde|localStorage|new Audio|speechSynthesis" rael/grande-premio` vazio.
- [ ] A3.11 Suíte, `tsc`, build e guardas passam.

**Commit:** `Porta pista, transito e batida para o Grande Premio`

**Parar e entregar o relatório da Etapa 3.**

### Etapa 4 — Largada, narrador, aquecimento, ajudas e pausa

**Arquivos:** `tela.js`, `grande-premio.css`, `index.html` (só atributos previstos).

**Procedimento:**

1. **Largada** (2.2 passo 2): semáforo em DOM, 3 × 0,8 s, via timers centrais; `falarSequencia(['Preparar...', 'apontar...', 'já!'])`
   sem esperar a fala terminar; controles habilitados no verde. Movimento reduzido: só troca de
   cor, sem escala.
2. **Narrador** (2.13) com as três prioridades, a janela de 1,5 s e o espelho em `#retorno` e
   `#roteiro-fala`.
3. Mapear eventos → som + fala + efeito conforme a tabela da 2.13 (1.º rival, 1.ª ultrapassagem,
   marcos, 1.º posto, abasteceu, pouca gasolina, reserva, 1.ª batida, ajuda de desvio, meta).
4. **Seta verde** desenhada quando `(aquecimento || rival com ajuda) && faixaSugerida(estado) !== null`.
   Posto com `ajuda: true` ganha brilho verde pulsando a ≤ 2 Hz (fixo com movimento reduzido).
5. **Pausa** (2.12): botão, aba oculta, "Continuar", reset de `ultimoTempo` e de entrada.
6. **Repetir:** `repetir()` de `fala.js`; nunca pausa, move, conta ou muda fase.
7. Nome: primeiro nome de `obterConfiguracoes().nome`; vazio/inválido → frases sem nome (2.13).

**Critérios:**

- [ ] A4.1 Sequência observada: `CONVITE → LARGADA → CORRIDA`; durante a largada ◀ ▶ não movem o
  carro e o contador fica em 0.
- [ ] A4.2 Voz sintetizada numa corrida inteira: nenhuma sobreposição de vozes; marcos falados
  por extenso; uma fala de prioridade 1 nunca corta uma de prioridade 3 (forçar reserva durante
  um marco e registrar).
- [ ] A4.3 `sem-fala`: todas as falas aparecem em `#roteiro-fala`; a corrida é concluível sem som.
- [ ] A4.4 Aquecimento: o 1.º rival vem na faixa do carro, a seta verde aparece e aponta para uma
  faixa livre; nos rivais 4+ a seta some (sem ajuda ativa).
- [ ] A4.5 Duas batidas seguidas → "Siga a seta verde!" uma vez, 3 rivais mais lentos com seta;
  depois volta ao normal.
- [ ] A4.6 Primeira batida fala; a segunda e as seguintes só tocam som.
- [ ] A4.7 Pausar em corrida, com posto na tela e na reserva: nada anda e a gasolina não baixa;
  ocultar a aba por 3 s pausa sozinho; "Continuar" retoma sem salto.
- [ ] A4.8 Repetir em largada, corrida e pausa não altera estado (comparar `JSON.stringify(estado)`
  antes/depois, fora o tempo).
- [ ] A4.9 `prefers-reduced-motion`: sem tremida, fumaça ou pisca; corrida concluível.
- [ ] A4.10 `rg -n "setInterval" rael/grande-premio` vazio. Suíte, `tsc`, build, guardas passam.

**Commit:** `Adiciona largada, narrador e ajudas ao Grande Premio`

**Parar e entregar o relatório da Etapa 4.**

### Etapa 5 — Bandeirada, álbum, conquistas e documentação

**Arquivos:** `tela.js`, `index.html`, `grande-premio.css`, `shared/conquistas-descobertas.js`,
`tests/conquistas-descobertas.test.js`, `README.md`, `MELHORIAS.md`.

**Procedimento:**

1. Bandeirada completa (2.10): bandeira OpenMoji em `#bandeira` sobre o Canvas com aceno CSS,
   `tocar('vitoria')`, `lancarConfete()`, fala, freada de 1,5 s, tela final após 2,0 s.
2. Ordem fechada da conclusão:
   1. evento `bandeirada` → `faseDaTela = BANDEIRADA`, controles desabilitados;
   2. `corridaRegistrada = true` e **uma** chamada `const premio = registrarRodada('grande-premio')`;
   3. animação, som, confete e fala da bandeirada;
   4. após 2,0 s: `FIM`, texto final (2.13), figurinha de `premio.figurinha` pelo catálogo;
   5. `anunciarConquistas(premio.conquistasNovas, …)` sem filtrar;
   6. habilitar "Correr de novo".
3. Entrada em `ATIVIDADES_DESCOBERTAS`, **depois** de `corrida-do-rael`:
   ```js
   { id: 'grande-premio', nome: 'Grande Prêmio do Rael', figura: 'corrida/carro-de-corrida', estreia: 'Primeira bandeirada', fa: 'Campeão das pistas' },
   ```
4. "Correr de novo": cancela timers, fala e entrada, incrementa `geracaoDaCorrida`, cria nova
   corrida (`criarCorrida`, relendo o número de faixas), zera o painel, `corridaRegistrada = false`
   e vai para `LARGADA`. Não recria RAF nem listeners.
5. Testes novos em `tests/conquistas-descobertas.test.js`, sem alterar os existentes:
   1.ª corrida → `grande-premio-estreia`; 9 corridas sem `grande-premio-fa`, 10.ª com, 11.ª sem
   repetir; figura resolve para `/figuras/corrida/carro-de-corrida.svg` e o arquivo existe;
   "Explorador de brincadeiras" passa a exigir também `grande-premio`.
6. `README.md`: inventário, árvore, créditos (Pixel Racer MIT, commit
   `6be6d5b0ae295240228399583096e232145fb7cb`; OpenMoji CC BY-SA 4.0 com os três códigos) e
   um resumo do que foi reaproveitado.
7. `MELHORIAS.md`: subseção "Grande Prêmio do Rael" logo depois de "Corrida do Rael", registrando
   as exceções da 2.3, o resultado e o que falta observar com o Rael. Sem número de tarefa.

**Critérios:**

- [ ] A5.1 `git diff <base> -- shared/` mostra só a linha nova em `conquistas-descobertas.js`.
- [ ] A5.2 Testes de conquistas passam isolados e na suíte; nenhum teste antigo foi alterado
  (`git diff <base> -- tests/conquistas-descobertas.test.js` só com linhas `+`).
- [ ] A5.3 No navegador: uma corrida aumenta a contagem do cartão de N para N+1 (nunca N+2);
  recarregar, voltar e tocar várias vezes na tela final não registra de novo.
- [ ] A5.4 1.ª corrida mostra figurinha e "Primeira bandeirada"; no álbum, a conquista aparece com a
  figura do carro de corrida (sem imagem quebrada).
- [ ] A5.5 "Correr de novo" 5 vezes rápidas inicia no máximo uma corrida; depois de 5 corridas, um
  único RAF e uma reação por toque.
- [ ] A5.6 Tela final não mostra batidas nem tempo; o texto segue a 2.13 para N = 0, 1 e ≥ 2
  abastecimentos.
- [ ] A5.7 Suíte, `tsc`, build, precache e guardas passam.

**Commit:** `Integra o Grande Premio ao album e as conquistas`

**Parar e entregar o relatório da Etapa 5.**

### Etapa 6 — Verificação final

Sem funcionalidade nova. Só correções de defeitos encontrados aqui, repetindo os critérios da
etapa afetada.

```sh
git status --short --branch
git diff --check <base>
node ./node_modules/vitest/vitest.mjs run
node ./node_modules/typescript/bin/tsc --noEmit
node ./node_modules/vite/bin/vite.js build && node scripts/gerar-service-worker.mjs sw.js dist/sw.js dist
test -f dist/rael/grande-premio/index.html && rg -c "grande-premio|figuras/corrida" dist/sw.js
git diff --name-only <base>
git diff --stat <base> -- package.json package-lock.json MELHORIAS-historico.md rael/corrida-do-rael shared/catalogo-figuras.js
rg -n "GAME OVER|recorde|ranking|setInterval|Math\.random|localStorage|speechSynthesis|new Audio" rael/grande-premio
```

Validar com `vite preview` (build de produção), não só com o servidor de desenvolvimento.

| # | Ambiente | Ação | Resultado obrigatório |
|---|---|---|---|
| B01 | 390×844, 3 faixas, toque | corrida completa desviando | bandeirada, uma rodada salva, figurinha |
| B02 | 390×844, 3 faixas | bater de propósito 3 vezes | 2 s devagar cada, contador nunca desce, ajuda na 2.ª seguida |
| B03 | 390×844, 3 faixas | ignorar todos os postos | reserva, pista vazia, posto na faixa, abastece, continua |
| B04 | 390×844 | não tocar em nada após a largada | a corrida termina sozinha (S1 no navegador); registrar o tempo |
| B05 | 360×800, 2 faixas | corrida completa | sem corte ou rolagem; nunca 2 rivais juntos |
| B06 | 360×800, 4 faixas | corrida completa | duplas deixam faixa livre; botões ≥ 72 px |
| B07 | 1280×800 | setas e A/D; Espaço no convite e no fim | funcionam; Espaço não interfere na corrida |
| B08 | voz sintetizada | Repetir em largada, corrida e pausa | repete a última fala; nenhuma mudança de estado |
| B09 | `sem-fala` | corrida inteira | roteiro visível; concluível sem som |
| B10 | movimento reduzido | batida, posto de ajuda, bandeirada | sem tremida, fumaça, pisca ou aceno |
| B11 | aba oculta 3 s | em corrida, reserva e chegada | pausa, retoma sem salto nem evento duplicado |
| B12 | reinício agressivo | 5 toques rápidos + 5 corridas | sem RAF, listener ou timer duplicado |
| B13 | offline no preview | carregar, desligar rede, recarregar | jogo, figuras da subpasta e progresso funcionam |
| B14 | navegação | cartão → jogo → Início | rota certa; contagem no cartão; Corrida do Rael intacta |
| B15 | armazenamento bloqueado | simular falha de storage | corrida termina sem exceção |

**Acessibilidade manual:** ordem de Tab (cabeçalho → Repetir → Pausar → ◀ → ▶); foco visível;
Enter/Espaço sem evento duplo; `aria-live` só em mudanças; barras com nome atualizado; rival,
posto e jogador distintos por forma e posição, não só por cor; zoom 200% sem rolagem horizontal.

**Critérios finais:**

- [ ] A6.1 Suíte ≥ linha de base + 45 + testes de conquistas; `tsc` e build com código 0.
- [ ] A6.2 Diff só com arquivos da 3.2; `package*.json`, `MELHORIAS-historico.md`,
  `rael/corrida-do-rael/` e `shared/catalogo-figuras.js` com diff vazio.
- [ ] A6.3 B01–B15 com evidência objetiva (viewport, faixas, preferências, resultado, console,
  rede). Capturas de: convite, largada, dupla com 4 faixas, batida, reserva, bandeirada, tela final.
- [ ] A6.4 Console sem `error` e Network sem 404 em toda a matriz.
- [ ] A6.5 Relatório separa "verificado automaticamente", "verificado no navegador" e
  "falta observar com o Rael".

**Commit:** `Documenta e valida o Grande Premio do Rael`

**Parar. Não fazer push, PR, merge ou deploy. Entregar o relatório final ao Diego.**

---

## 6. Validação com o Rael

Não marcar como concluída sem observar o Rael jogando no iPad/Android de casa.

- [ ] Entende que precisa sair da frente dos carros depois do 1.º rival com seta?
- [ ] Usa ◀ ▶ com antecedência ou só no último instante? (é esse o reflexo que queremos ver
  melhorar com o tempo)
- [ ] A batida frustra ou ele entende "fiquei devagar, bora de novo"?
- [ ] Percebe a barra de gasolina baixando e procura o posto antes da reserva?
- [ ] Na reserva, entende que precisa ir até o posto?
- [ ] Acompanha a barra das ultrapassagens e se anima com os marcos falados?
- [ ] Mantém o interesse até a bandeirada? Quanto tempo levou?
- [ ] Toca em Pausar ou Repetir sem querer?

**Ordem de ajuste se estiver difícil demais** (um item por vez, validando de novo):

1. Baixar o cruzeiro dos níveis 2 e 3 em 10%.
2. Subir o aquecimento de 3 para 5 rivais.
3. Diminuir `chanceDupla` para 0,1 / 0,2.
4. Aumentar `MARGEM_COLISAO` de 6 para 8.
5. Diminuir `META_ULTRAPASSAGENS` para 20.
6. Configurar 2 faixas nas Configurações do Rael.

**Se estiver fácil demais:** subir o cruzeiro do nível 3 para 320, o `CONSUMO_POR_SEGUNDO` para
2,5 e a `chanceDupla` do nível 3 para 0,4, nessa ordem.

Não corrigir dificuldade com vidas, cronômetro, pontos negativos ou instruções escritas.

---

## 7. Fora do escopo desta versão

- Visão de trás / pseudo-3D (ver seção 9).
- Carros rivais que trocam de faixa, curvas, obstáculos fixos, óleo.
- Turbo, freio, acelerador (ele só dirige).
- Escolha de carro, cores, pistas ou loja.
- Conquistas por quantidade acumulada ("Frentista: 20 abastecimentos",
  "Mil ultrapassagens"): exigem `feitos` em `registrarRodada` e mudança em `acumularFeitos`
  (`shared/`), então ficam para uma tarefa própria.
- Qualquer alteração na Corrida do Rael ou no WIP guardado.
- Publicar, PR ou merge.

---

## 8. Definição de pronto

- [ ] Rivais, ultrapassagem contada, aceleração por degraus e colisão do Pixel Racer de volta, com
  atribuição MIT.
- [ ] Batida só atrasa (35% por 2 s + 0,6 s de retomada), sem game over em nenhum caminho.
- [ ] Gasolina com posto, ajuda e reserva, sem derrota.
- [ ] 30 ultrapassagens → linha de chegada → bandeirada → figurinha e conquistas.
- [ ] O bot parado sempre termina (sem soft-lock) e o desviador termina mais rápido.
- [ ] Toque em 360 px, teclado, movimento reduzido, `sem-fala` e offline verificados.
- [ ] Corrida do Rael intacta; `shared/` só com a entrada nova.
- [ ] Validação presencial da seção 6 registrada antes de pedir merge/deploy ao Diego.

---

## 9. Ideia para depois: visão de trás (v2)

Se o Rael pedir "o carro de trás, igual videogame", o caminho de menor custo é portar o
[javascript-racer](https://github.com/jakesgordon/javascript-racer) (MIT), mantendo **o mesmo
motor de regras** deste plano (`avancarCorrida`, eventos, gasolina e bandeirada) e trocando só a
renderização:

- aproveitar `Util.project`, `renderSegment`, `renderSprite` e a lógica de `playerSegment.cars`;
- **não** usar `images/sprites.png` nem `background.png` (arte da Sega) nem a música (licença
  restrita): desenhar carros, posto e fundo no Canvas;
- zerar ou reduzir `centrifugal` e usar só retas e curvas suaves;
- a batida do original já reduz a velocidade (`speed = car.speed * (car.speed/speed)`) e combina
  com a regra da seção 2.5.

Isso exige um plano próprio.

---

## Fontes consultadas (2026-09-22)

- Pixel Racer: https://github.com/Elomami1976/pixel-racer (código original: `spawnEnemy`, placar por
  carro que passa, `BASE_ENEMY_SPEED + score * SPEED_PER_SCORE`, `triggerGameOver`)
- javascript-racer: https://github.com/jakesgordon/javascript-racer (README: licença MIT, sprites do
  OutRun do Mega Drive, música licenciada só para o projeto; `v4.final.html`: colisão com carros)
- Road Fighter (clones): https://github.com/us190190/road-fighter,
  https://github.com/amoldalwai/RoadFighter, https://github.com/codehard123/RoadFighter
- GitHub Topics "racing-game" (JavaScript): https://github.com/topics/racing-game?l=javascript
- OpenMoji: https://github.com/hfg-gmuend/openmoji (color/svg 1F3CE, 1F3C1, 26FD)
