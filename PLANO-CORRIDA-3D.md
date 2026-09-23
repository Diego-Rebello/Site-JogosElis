# Plano de Implementação — Corrida 3D

> Um novo jogo para **Jogos do Rael**, com o carro visto de trás, a estrada indo até o
> horizonte e os rivais crescendo conforme se aproximam. O Rael dirige para os lados,
> ultrapassa **30 carros**, abastece e recebe a **bandeirada**. Batida só atrasa.
>
> Criado em 2026-09-22. Desdobramento da seção **9. Ideia para depois: visão de trás (v2)**
> do [plano do Grande Prêmio do Rael](PLANO-GRANDE-PREMIO-DO-RAEL.md#9-ideia-para-depois-visão-de-trás-v2).
> Base de regras: `rael/grande-premio/jogo.js`, já existente. Base de renderização:
> [javascript-racer](https://github.com/jakesgordon/javascript-racer), de Jake Gordon,
> com código MIT. A apresentação será **pseudo-3D em Canvas 2D**, sem motor 3D novo.
>
> **Documento de execução para o modelo executor (Gemini, Claude ou Codex).** Mantém o formato
> do plano anterior: decisões de produto, arquitetura, arquivos permitidos, protocolo,
> etapas, critérios de aceite e validação com o Rael. Este documento planeja a implementação;
> nenhuma caixa marcada ou resultado de teste deve ser interpretado como já executado.

---

## Resumo para o Diego

**O que o Rael vai jogar.** O carro azul aparece de costas, na parte de baixo da tela. À frente,
uma estrada com faixas, grama e céu. Os outros carros vêm do fundo da estrada, todos andando
na mesma direção. Ele usa os mesmos botões ◀ ▶ para ultrapassar e passa pelo posto para
encher o tanque. Depois de 30 ultrapassagens, cruza a linha de chegada e ganha a bandeirada.

| Objetivo | Como aparece no jogo |
|---|---|
| “O carro de trás, igual videogame” | Carro com janela traseira, lanternas e rodas; pista em perspectiva. |
| Preservar o que já funciona | O mesmo `avancarCorrida`, sem reescrever gasolina, colisões ou eventos. |
| Reflexo e ultrapassagem | Mesma progressão e mesmas ajudas do Grande Prêmio. |
| Curvas sem complicar os controles | Curvas suaves só na parte distante da imagem; nenhuma força empurra o carro. |
| Batida só atrasa | 35% da velocidade por 2 s, retomada em 0,6 s; nunca derrota. |
| Gasolina sem bloqueio | Posto, ajuda após postos perdidos e reserva continuam iguais. |
| Recompensa própria | Cartão, contagem de rodadas e conquistas de **Corrida 3D**. |

**Decisões adotadas para a implementação:**

1. **Jogo separado:** nome **Corrida 3D**, pasta `rael/corrida-3d/`, id `corrida-3d`.
   Grande Prêmio do Rael e Corrida do Rael continuam disponíveis.
2. **Mesmo motor por importação direta.** Não criar uma segunda cópia de `jogo.js`.
3. **Portar somente a renderização necessária** do javascript-racer: projeção, polígonos
   da estrada, escala e ordenação. Não portar sua física, tráfego, cronômetro ou loop.
4. **Arte própria desenhada no Canvas.** Reusar os SVGs locais no painel e nos cartões.
5. **Retrato como prioridade**, com suporte a paisagem e teclado, sem exigir girar o aparelho.
6. **Calibrar primeiro a perspectiva em uma reta.** Curvas decorativas entram depois que
   carro, posto, colisão e ultrapassagem estiverem visualmente coerentes.

**Principal cuidado.** O motor atual usa coordenadas de uma pista vista de cima. A imagem nova
precisa representar essas mesmas posições em profundidade. Mudar o desenho não pode causar
batida invisível, abastecimento distante ou contagem antes de o rival ficar para trás.

---

## 1. Pesquisa: bases no GitHub

| Opção | O que aproveitar | Custo de adaptar | Veredito |
|---|---|---|---|
| `rael/grande-premio/jogo.js` e testes locais | Regras, estado, eventos, sorteio injetado, simulações de conclusão | Baixo: importar módulo existente | **Motor obrigatório** |
| [javascript-racer — common.js](https://github.com/jakesgordon/javascript-racer/blob/master/common.js) | `Util.project`, `Render.polygon`, `Render.segment`; princípios de escala e recorte de `Render.sprite` | Médio: adaptar para módulos e arte própria | **Base visual escolhida** |
| [javascript-racer — v2.curves.html](https://github.com/jakesgordon/javascript-racer/blob/master/v2.curves.html) | Referência para estrada segmentada e curvas | Médio: remover dependência da física original | Referência de perspectiva; curvas apenas decorativas |
| [javascript-racer — v4.final.html](https://github.com/jakesgordon/javascript-racer/blob/master/v4.final.html) | Referência para objetos em profundidade | Alto se trouxer também IA e física | Consultar; não importar sua simulação |
| Three.js/WebGL e modelos 3D | Geometria 3D real | Novo motor, assets, dependências e otimização | Fora do escopo |

**Nomes do código original.** A seção 9 anterior fala em `renderSegment` e `renderSprite`;
no `common.js` consultado, os métodos são `Render.segment` e `Render.sprite`. O conceito de
`playerSegment.cars` não vira uma segunda lista de rivais: a única lista continua sendo
`estado.rivais`; agrupar por profundidade, se necessário, é cálculo descartável do quadro.

**Código e assets têm condições diferentes.** O [README original](https://github.com/jakesgordon/javascript-racer#license)
identifica sprites como exemplos emprestados de OutRun e restringe a reutilização da música.
Não copiar imagens nem áudio do repositório. Preservar a
[licença MIT do código](https://github.com/jakesgordon/javascript-racer/blob/master/LICENSE)
nos trechos adaptados, junto da atribuição já existente ao Pixel Racer nos arquivos derivados.

**Desempenho é critério de aceite local.** O projeto original é uma demonstração antiga;
seu README não comprova desempenho no iPad/Android atual. Medir o jogo adaptado nos aparelhos
de destino, com a matriz da Etapa 6.

---

## 2. Mecânica fechada

### 2.1 Identidade

| Campo | Decisão |
|---|---|
| Nome visível | **Corrida 3D** |
| Pasta | `rael/corrida-3d/` |
| ID da atividade | `corrida-3d` |
| Rota Vite | `'rael-corrida-3d': 'rael/corrida-3d/index.html'` |
| Cartão | Depois de Grande Prêmio do Rael, em `rael/index.html` |
| Figura do cartão/conquistas | `corrida/carro-de-corrida`, já existente |
| Tecnologia | HTML/CSS/JS e Canvas 2D, módulos ES, sem dependência nova |
| Motor | Importação de `../grande-premio/jogo.js` |
| Conclusão | 30 ultrapassagens → chegada → bandeirada |
| Recompensa | Figurinha comum por corrida concluída, inclusive com ajuda |
| Conquistas | “Primeira corrida 3D” (1 rodada) e “Piloto 3D” (10 rodadas) |

### 2.2 Fluxo completo

1. **Convite:** título “Corrida 3D”, carro, frase “Ultrapasse 30 carros para ganhar a bandeirada!”
   e botão “🏁 Vamos correr”. Primeira fala somente após interação.
2. **Largada:** câmera já posicionada atrás do carro; semáforo vermelho → amarelo → verde,
   0,8 s por luz. Fala “Preparar... apontar... já!”. Corrida começa ao concluir os 2,4 s.
3. **Corrida:** aceleração automática e aquecimento, com as mesmas regras do motor existente.
4. **Meta:** evento `meta` esvazia a pista, congela gasolina e prepara a chegada.
5. **Chegada:** a linha quadriculada cresce em perspectiva até alcançar a frente do carro.
6. **Bandeirada:** evento único, freada por 1,5 s, som, confete, fala e registro da rodada.
7. **Final:** após 2 s de celebração ativa, figurinha, resumo positivo e conquistas novas.
8. **Reinício:** “🏁 Correr de novo” recria o estado e volta à largada, sem repetir o convite.

### 2.3 Regras herdadas e exceções à seção 5.0 do MELHORIAS

O pedido é o desdobramento visual da seção 9. As exceções de reflexo, 30 ultrapassagens e
trânsito na mesma direção descritas na seção 2.3 do plano anterior também se aplicam aqui.
Não criar novas exceções de dificuldade.

| Regra | Valor preservado |
|---|---|
| Ultrapassagem | Rival não contado e não saindo com `rival.y > carro.y + carro.h`; +1 até 30 |
| Batida | Colisão do motor, margem 6; 35% por 2 s + retomada de 0,6 s; imunidade nesse intervalo |
| Rival batido | Sai em 0,5 s, sem pontuar; contador nunca diminui |
| Tanque | 100; consumo de 2/s somente durante a corrida |
| Posto | A partir de gasolina ≤ 50; perdido → nova tentativa após 4 s |
| Ajuda de posto | Depois de 2 perdas, priorizar a faixa do jogador |
| Reserva | Velocidade limitada a 40%; rivais saem; tentativas de posto a cada 1,5 s |
| Ajuda de desvio | Após 2 batidas seguidas, próximos 3 nascimentos com velocidade de ajuda e seta |
| Faixas | 2, 3 ou 4, lidas das configurações a cada nova corrida |
| Pausa | Sem avanço do motor, combustível, efeitos ou temporizadores da apresentação |

Continuam proibidos game over, vidas, ranking, recorde, cronômetro visível, contagem regressiva
de prazo, punição no álbum e exibição do número de batidas. Nada exige leitura para jogar.

### 2.4 Curva de dificuldade

Importar a tabela `NIVEIS` existente; estes valores documentam a base, sem duplicá-la no código:

| Nível | Ultrapassagens | Cruzeiro lógico | Intervalo | Chance de dupla |
|---|---|---:|---|---:|
| Aquecimento | 0–2 | 190 px/s | 3,6 s | 0 |
| 1 | 3–9 | 220 px/s | 3,0–3,6 s | 0 |
| 2 | 10–19 | 255 px/s | 2,5–3,1 s | 0,20 |
| 3 | 20–29 | 295 px/s | 2,1–2,7 s | 0,30 |

“px/s” continua sendo unidade **do motor**, não velocidade em pixels na tela nova nem km/h.
Não recalcular dificuldade a partir da distância aparente. Preservar espaçamento, bloqueio
de nascimentos, anti-sobreposição com posto e ajuda já implementados no motor.

### 2.5 Câmera e pista

- Canvas lógico **400×700**, com dimensionamento CSS proporcional.
- Horizonte em `y = 170`; céu claro e grama simples, desenhados localmente.
- Carro azul na região inferior, visto de trás, com faixa branca, janela e lanternas.
- Estrada segmentada, faixas brancas e zebras nas bordas, todas na mesma projeção.
- A câmera tem altura e orientação fixas: sem balanço, zoom dinâmico ou inclinação nas curvas.
- Curvas suaves somente longe do jogador; a zona dos últimos 300 px lógicos antes de
  `carro.y` permanece reta. Força centrífuga **zero**; curva nunca exige compensar direção.
- Sem morros, túneis ou objetos escondendo rivais. A faixa livre precisa ser identificável.
- O movimento do chão deriva de `estado.distancia`; parada e lentidão aparecem na imagem.

### 2.6 Carros, ultrapassagem e batida na perspectiva

- Todos os carros mostram a traseira. Rivais mantêm cor, faixa, posição e identidade do motor.
- Ao nascer, o rival já precisa ser distinguível do asfalto. Usar contorno e contraste;
  não atrasar sua apresentação até “ficar grande”.
- Desenhar rivais distantes antes dos próximos e incluir o jogador nessa ordenação.
- Rival ultrapassado continua saindo pela região inferior até ser removido pelo motor.
  Não desaparecer no horizonte nem pontuar por cruzar um pixel arbitrário da tela.
- A colisão continua sendo calculada **só pelo motor**. Nunca testar sobreposição entre
  retângulos dos desenhos em perspectiva para decidir batida.
- Contato deve parecer contato. Validar sombra/base dos veículos, margens laterais e momento
  do evento com sobreposição de depuração das hitboxes projetadas, restrita a desenvolvimento.
- Feedback de batida: contorno, transparência a no máximo 2 Hz e fumaça discreta. Nesta versão,
  não tremer a câmera, mesmo quando movimento reduzido estiver desligado.

### 2.7 Posto e ajuda visual

- Posto com bomba amarela, teto verde e faixa verde de aproximação, visto em perspectiva.
- O local coletável é **na faixa**, como no motor atual. Não desenhar um prédio no acostamento
  sugerindo que seja necessário sair da pista para abastecer.
- Base do posto e faixa verde usam a mesma projeção da estrada; abastecimento só no evento
  `abasteceu`, sem uma animação disparar a coleta.
- A seta verde usa o resultado de `faixaSugerida(estado)` e os mesmos critérios de exibição
  do Grande Prêmio; desenhar perto do jogador, sobre a faixa indicada.
- Na reserva, continuar mostrando o movimento lento e a aproximação do posto. Nenhuma tela
  interrompe a corrida para informar falta de combustível.

### 2.8 Controles, pausa e ciclo de vida

Preservar entrada do Grande Prêmio: ◀ ▶ ≥ **72×72 px**, toque sustentado nas metades do Canvas,
setas e A/D; direções simultâneas anulam-se, soltar uma mantém a outra. `pointerup`,
`pointercancel`, `blur` e aba oculta limpam as entradas. `touch-action: none` só no Canvas e
nos botões de direção. Converter toques pelo `getBoundingClientRect()`, não pelo backing store.

Repetir e Pausar ≥ **64×64 px**, acima da pista e longe das setas. Espaço/Enter iniciam ou
continuam apenas nas fases apropriadas, sem duplicar o clique nativo de um botão focado.

- Aba oculta pausa **corrida, largada e celebração**, preservando a fase anterior e o tempo
  restante. Ao voltar, exigir “▶ Continuar”. Não repetir o registro de uma bandeirada já salva.
- Na pausa, congelar também semáforo, fumaça, aceno e espera da tela final. Tempos dessas
  sequências devem consumir `dt` ativo, em vez de avançar com um timeout durante aba oculta.
- Ao continuar, zerar entrada e referência do timestamp; primeiro quadro sem salto.
- Um RAF e um conjunto de listeners por página. Reinício não registra novos listeners.
- `pagehide` cancela RAF, timers remanescentes e fala. Se voltar pelo bfcache (`pageshow`
  persistido), restaurar em pausa com exatamente um RAF, sem perder ou duplicar a rodada.
- `dt ≤ 0,05 s`, como no motor original. Quedas de FPS nunca aceleram consumo ou nascimento.

### 2.9 Movimento reduzido e desempenho

Com `prefers-reduced-motion: reduce`, usar pista reta e fundo estático; remover fumaça, pisca,
aceno e deslocamento do “+1”. Manter o movimento indispensável de estrada e carros.
Indicar batida por contorno fixo e pouca gasolina por barra vermelha fixa.

Qualidade inicial: **80 segmentos**, resolução interna até **DPR 1,5**, fundo sem parallax.
Disponibilizar no renderizador um perfil econômico de **40 segmentos e DPR 1** para medição
em desenvolvimento. A escolha publicada deve vir da validação no aparelho de referência;
nesta entrega não há detecção automática de qualidade nem controle técnico na tela infantil.

Meta: mediana ≥ **30 FPS** e percentil 95 do intervalo entre quadros ≤ **50 ms** em 60 s
de corrida ativa no aparelho de referência. Registrar aparelho, navegador, perfil e viewport;
excluir largada, pausa e transição de aba. Se necessário, reduzir apenas detalhe visual.

### 2.10 Falas, textos e narrador

Reaproveitar prioridades 1/2/3, marcos e falas de gasolina/ajuda do Grande Prêmio, sem `await`
no loop. Todo texto narrado vai para `#retorno`; modo acompanhado também usa `#roteiro-fala`.
Repetir toca a última instrução sem mudar o estado do jogo.

| Momento | Texto |
|---|---|
| Convite após interação | “{nome}, vamos brincar de Corrida 3D?”; sem nome: “Vamos brincar de Corrida 3D?” |
| Explicação | “Ultrapasse trinta carros para ganhar a bandeirada. E não esqueça de abastecer!” |
| Primeiro rival | “Tem um carro na frente. Vá para o lado e ultrapasse!” |
| Primeiro posto | “Olha o posto! Passe por cima para abastecer.” |
| Meta | “Trinta carros! Agora é a reta final!” |
| Bandeirada | “Bandeirada! Você completou a Corrida 3D, {nome}!”; usar “piloto” sem nome |
| Final sem abastecimento | “Você ultrapassou 30 carros!” |
| Final com abastecimento | “Você ultrapassou 30 carros e abasteceu 1 vez!” ou “... N vezes!” |

Se a síntese pronunciar “3D” de forma inadequada, somente na fala usar “três dê”. Nome visível,
rota e identificação da atividade continuam **Corrida 3D** / `corrida-3d`.

### 2.11 Painel (HUD) e tela

```text
┌────────────────────────────────────────┐
│ [Repetir]  carro ━━━━━━━ bandeira [Pausa]│
│                   12/30                │
│ gasolina  █████████░░░░░░░             │
│ ┌────────────────────────────────────┐ │
│ │                céu                 │ │
│ │             __/  \__               │ │
│ │           /  rival  \              │ │
│ │         /     |      \             │ │
│ │       / posto | rival \            │ │
│ │     /         |        \           │ │
│ │   /      carro azul      \         │ │
│ └────────────────────────────────────┘ │
│          [ ◀ ]       [ ▶ ]             │
└────────────────────────────────────────┘
```

Painel e botões ficam no DOM; Canvas só desenha o mundo e os efeitos. Barras com
`role="progressbar"`, nomes acessíveis e contador 0/30. Ícones usam os SVGs locais existentes.
Sem velocímetro, minimapa, porcentagem de gasolina ou informação técnica para a criança.

Em 360×800, a pista se ajusta à altura disponível para caber com painel e setas. Em paisagem,
permitir layout em duas colunas (pista e controles/painel), mantendo os alvos mínimos. No modo
acompanhado e zoom de 200%, permitir rolagem vertical para preservar texto e alvos; nunca
rolagem horizontal nem controles cortados.

---

## 3. Arquitetura e reaproveitamento

### 3.1 Matriz de reaproveitamento

| Origem | Decisão |
|---|---|
| `rael/grande-premio/jogo.js` | **Importar diretamente**, incluindo constantes, estado e eventos. Não editar. |
| `rael/grande-premio/tela.js` | Copiar e adaptar entrada, narrador, painel, fluxo e recompensa; substituir desenho e identidade. Não importar: inicializa DOM e RAF. |
| HTML/CSS do Grande Prêmio | Adaptar na nova pasta; manter semântica, tema e controles. |
| `rael/corrida-do-rael/jogo.js` | Helpers geométricos já usados pelo motor; importar helpers puros quando necessários. |
| `Util.project` e `Render.*` | Portar fórmulas e desenho necessários, com atribuição; sem globais do original. |
| `Game.run`, `update`, `updateCars`, colisões e combustível externos | Não portar; responsabilidades já resolvidas localmente. |
| `shared/` | Usar APIs atuais de fala, sons, cabeçalho, progresso, conquistas, figuras e confete. |
| `public/figuras/corrida/` | Reusar carro, bandeira, bomba e licença existentes. |

### 3.2 Arquivos permitidos

| Arquivo | Ação |
|---|---|
| `rael/corrida-3d/index.html` | Novo: telas, HUD, Canvas e controles |
| `rael/corrida-3d/corrida-3d.css` | Novo: layout, pausa e efeitos |
| `rael/corrida-3d/tela.js` | Novo: integração e ciclo de vida |
| `rael/corrida-3d/projecao.js` | Novo: transformação pura de coordenadas e cena |
| `rael/corrida-3d/renderizador.js` | Novo: pista e arte Canvas, sem regras |
| `rael/corrida-3d/LICENSE-javascript-racer.txt` | Cópia integral da licença da revisão utilizada |
| `rael/corrida-3d/LICENSE-pixel-racer.txt` | Cópia idêntica à licença do Grande Prêmio |
| `tests/corrida-3d.test.js` | Novo: projeção e independência do motor |
| `tests/corrida-3d-renderizador.test.js` | Novo: renderização sem mutação e contratos do Canvas |
| `tests/conquistas-descobertas.test.js` | Acrescentar cenários da atividade |
| `shared/conquistas-descobertas.js` | Uma entrada em `ATIVIDADES_DESCOBERTAS` |
| `vite.config.ts` | Uma entrada em `paginas` |
| `rael/index.html` | Um cartão depois de Grande Prêmio do Rael |
| `README.md` | Inventário, árvore, créditos e dependência do motor |
| `MELHORIAS.md` | Subseção “Corrida 3D” depois de Grande Prêmio do Rael, sem número Pxx |

Este plano é a entrega de planejamento. Durante sua implementação, não reescrevê-lo para
acomodar falhas. `PLANO-GRANDE-PREMIO-DO-RAEL.md` recebe somente o link para este desdobramento
na entrega de planejamento.

**Preservar:** `rael/grande-premio/`, `rael/corrida-do-rael/`, seus testes existentes,
`shared/` fora da entrada indicada, catálogo de palavras, `public/figuras/`, `package*.json`,
`MELHORIAS-historico.md`, `sw.js` e gerador do service worker. O precache é gerado a partir de
`dist/`; a nova rota e seus bundles precisam ser comprovados no build, sem editar lista manual.

### 3.3 Guardas (qualquer item reprova a etapa)

| # | Proibido |
|---|---|
| G01 | Alterar arquivos fora da seção 3.2 durante a implementação. |
| G02 | Copiar ou reimplementar o motor em `corrida-3d/jogo.js`. |
| G03 | Mudar estado de corrida, colisão, RNG ou eventos dentro da projeção/renderização. |
| G04 | Novo motor, dependência, CDN, imagem, áudio ou requisição externa em runtime. |
| G05 | Copiar sprites, fundo ou música do javascript-racer. |
| G06 | Game over, vidas, ranking, perda de pontos, prazo ou contagem de batidas na interface. |
| G07 | Física de curva, força centrífuga, penalidade de acostamento ou IA extra dos rivais. |
| G08 | Acesso direto a storage, `speechSynthesis` ou `new Audio`. |
| G09 | Novo RAF/listener por reinício ou loop próprio vindo do projeto externo. |
| G10 | Testes com `.skip`, `.only`, `.todo`, remoção de asserções ou baseline rebaixada. |
| G11 | Desenhar carro/posto/bandeira com emoji; exigir leitura para jogar. |
| G12 | Commitar `dist/`, `node_modules/`, backups, `.DS_Store` ou arquivos com ` 2` no nome. |
| G13 | Esconder falha com `catch {}` ou inventar resultado de validação. |
| G14 | Transformar coordenadas projetadas de volta em alteração de regra do motor. |
| G15 | Declarar teste mobile/offline sem executá-lo no ambiente indicado. |
| G16 | Publicar, push, PR, merge ou deploy sem autorização específica. |

### 3.4 API do motor: uma única fonte de verdade

```js
import {
  criarCorrida, avancarCorrida, resumoDaCorrida, faixaSugerida,
  LARGURA_CANVAS, ALTURA_CANVAS, DT_MAXIMO, META_ULTRAPASSAGENS,
} from '../grande-premio/jogo.js';

// Uma chamada por passo ativo, antes de projetar e desenhar.
const eventos = avancarCorrida(estado, { dt, direcao }, { sortear });
```

O motor muta `estado` e devolve eventos. Somente a tela consome os eventos para narrar,
atualizar painel e registrar conclusão. A renderização recebe dados para leitura.

Eventos preservados: `rival-apareceu`, `ultrapassou`, `marco`, `bateu`, `ajuda-desvio`,
`posto-apareceu`, `abasteceu`, `posto-perdido`, `pouca-gasolina`, `reserva`, `meta`, `bandeirada`.
Nenhum evento novo é necessário. Usar o estado real do código, incluindo `postosNascidos`,
sem reconstruí-lo a partir de uma transcrição do plano anterior.

### 3.5 Contrato da projeção

`projecao.js` não acessa DOM, Canvas, relógio, armazenamento ou sorteio. Cada quadro cria uma
descrição visual nova, sem anexar campos a `estado` ou ordenar `estado.rivais` no lugar.

```js
export function projetarPonto({ x, y }, camera) {} // { x, y, escala } ou null no recorte
export function projetarObjeto(objeto, camera) {} // base, pegada no chão e escala
export function criarCena(estado, { movimentoReduzido = false } = {}) {}
// { camera, segmentos, objetos, linhaDeChegada }
```

**Convenção única de coordenadas**, usada em estrada, carros, posto, seta e chegada:

```text
Referência longitudinal = estado.carro.y (580 na base atual)
d = referência − y lógico                 // positivo à frente do jogador
z = 700 + d                               // distância à câmera
escala = 700 / z
telaX = 200 + (x lógico − 200 + curva(d, estado.distancia)) × escala
telaY = 170 + (580 − 170) × escala
```

- `z ≤ 100`: recortar, nunca dividir por zero ou projetar atrás da câmera.
- Ponto `(x, 580)` projeta em `(x, 580)` quando a curva é zero. Essa é a referência visual
  para a frente do jogador e para o cruzamento da linha de chegada.
- Para retângulos do motor, projetar seus quatro cantos como **pegada no chão**. O desenho
  de cada carro se apoia nessa pegada; centro traseiro em `(x + w/2, y + h)`.
- Largura do veículo segue a largura da pegada traseira; altura da carroceria vista de trás
  começa em `34 × escala` e fica em constante visual própria. Não reinterpretar `h = 64`
  do motor como altura vertical da carroceria: ele representa comprimento na estrada.
- A linha de chegada projeta seu `y` real. Em `linha.y === carro.y`, passa na referência
  dianteira do jogador. Não usar a base traseira do sprite para disparar a bandeirada.
- Conservar posição contínua de `carro.x` durante troca de faixa. Não arredondar para a faixa.
- Objetos ordenados pelo centro longitudinal lógico, distante → próximo; desempate estável
  por identidade. Jogador participa da ordem; pegadas/sombras são desenhadas no chão.
- A depuração projeta hitboxes com as margens reais de colisão/coleta. Ela é apenas visual,
  ativada por `import.meta.env.DEV` e opção local; não é controle publicado para a criança.

**Curva decorativa fechada:** `curva = 18 × sin(2π × distancia / 2400) × smoothstep(t)`,
com `t = clamp((d − 300) / 600, 0, 1)` e `smoothstep(t) = t²(3 − 2t)`. Movimento reduzido
força `curva = 0`. As coordenadas do chão e dos objetos recebem o mesmo deslocamento.
A amplitude é visual, em unidades lógicas, sem escrever em `carro.x`.

**Estrada:** cobrir de `d = −200` até `d = 3500`, em 80 segmentos; 40 no perfil econômico.
Recortar polígonos aos limites do Canvas. Usar `estado.distancia` para fase das zebras e
marcas no chão, com continuidade entre quadros e sem acumular uma segunda velocidade.
Pista além desse alcance pode se fechar até o horizonte como fundo sem objetos interativos.

Esses números são a calibração inicial obrigatória. Se a inspeção revelar que não representam
bem o contato ou dificultam enxergar o rival, ajustar **somente constantes visuais**, registrar
antes/depois e repetir os critérios de projeção. Não compensar alterando regras compartilhadas.

### 3.6 Renderizador e separação de responsabilidades

```js
export function criarRenderizador(canvas, { qualidade = 'padrao' } = {}) {
  // configurar viewport/DPR; desenhar cena; liberar recursos
  return { redimensionar, desenhar, destruir };
}
```

- `desenhar(cena, apresentacao)` recebe também seta, imunidade e efeitos preparados pela tela.
  Não chama `avancarCorrida`, `registrarRodada`, fala, som, sorteio ou RAF.
- Fundo e arte são primitivas Canvas; cache de desenhos locais em Canvas auxiliar é permitido
  se a medição justificar. Sem atlas de terceiros ou necessidade de `OffscreenCanvas`.
- DPR muda apenas o backing store. Usar `setTransform` para escala absoluta em resize,
  sem acumular `scale()` e sem mudar as unidades lógicas de jogo.
- Redimensionar preserva o estado, contador e posição; sem reiniciar corrida ou sorteio.
- Separar funções de estrada, carro traseiro, posto, chegada e seta, com nomes em português.
- `save()`/`restore()` equilibrados; nenhum `NaN`, `Infinity`, dimensão negativa ou alpha fora
  de 0–1 pode chegar ao Canvas.

### 3.7 Fases, registro e integração

```text
CONVITE → LARGADA → CORRIDA → BANDEIRADA → FIM
LARGADA / CORRIDA / BANDEIRADA → PAUSA → fase anterior
FIM → LARGADA
qualquer fase → Início
```

Manter `faseDaTela` e uma `faseAntesDaPausa`, sem múltiplos booleanos de corrida. `avancarCorrida`
só roda em CORRIDA e BANDEIRADA, esta última para a freada. Cena inicial usa `criarCorrida()`
sem avançar o motor no convite ou na largada.

No evento `bandeirada`, nesta ordem:

1. Alterar fase e desabilitar direção.
2. Definir `corridaRegistrada = true` **antes** de `registrarRodada('corrida-3d')`.
3. Guardar retorno da recompensa; disparar celebração uma vez.
4. Depois de 2 s ativos, mostrar figurinha e `anunciarConquistas(premio.conquistasNovas, …)`.

Entrada nova depois de `grande-premio`:

```js
{ id: 'corrida-3d', nome: 'Corrida 3D', figura: 'corrida/carro-de-corrida', estreia: 'Primeira corrida 3D', fa: 'Piloto 3D' },
```

Contagem própria: concluir Corrida 3D não incrementa Grande Prêmio. A atividade passa a integrar
o conjunto exigido por “Explorador de brincadeiras”; conquistas já obtidas não devem ser removidas.
Não migrar nem zerar progresso existente.

---

## 4. Protocolo do executor

### 4.1 Regras

- Executar etapas na ordem e entregar evidências por etapa. Este plano, por si só, não inicia
  implementação. Quando Diego autorizar a execução completa, prosseguir pelas etapas aprovadas
  sem pedir novamente permissão para ações já incluídas nessa autorização.
- Se a autorização for para uma etapa, encerrar com seu relatório. Não expandir escopo.
- Não marcar `[x]` sem evidência. Usar **NÃO EXECUTADO**, **NÃO VERIFICADO NO NAVEGADOR** ou
  **PENDENTE NO APARELHO REAL**, conforme o caso.
- Problema fora do escopo: registrar evidência e dependência; continuar trabalho independente.
  Mudança de regra do motor exige uma decisão separada do Diego.
- Precedência: **pedido do Diego > este plano > mecânica do Grande Prêmio > seção 5.0 do
  MELHORIAS > implementação externa**.
- Não usar `git add .`, `git add -A`, reset destrutivo, limpeza ampla ou stash automático.
  Se commits estiverem autorizados, adicionar caminhos explicitamente e revisar o staging.

### 4.2 Leitura obrigatória antes de editar

1. Este plano e seções 2, 3, 6, 8 e 9 do plano do Grande Prêmio.
2. `MELHORIAS.md`: seções 2.2, 5.0, 6 e subseções dos dois jogos de corrida existentes.
3. `rael/grande-premio/{jogo.js,tela.js,index.html,grande-premio.css}` e
   `tests/grande-premio.test.js`, na revisão local escolhida como base.
4. Helpers de `rael/corrida-do-rael/jogo.js` e APIs de `shared/` importadas pelo Grande Prêmio.
5. `tests/conquistas-descobertas.test.js`, `vite.config.ts`, `rael/index.html`, `shared/pwa.js`,
   `sw.js` e `scripts/gerar-service-worker.mjs`.
6. `README`, `LICENSE`, `common.js`, `v2.curves.html` e trechos relevantes de `v4.final.html`
   do javascript-racer; registrar o SHA completo da revisão usada na implementação.

### 4.3 Comandos do projeto

O caminho local contém `:`, conforme registrado no plano anterior. Usar binários locais:

```sh
node ./node_modules/vitest/vitest.mjs run
node ./node_modules/typescript/bin/tsc --noEmit
node ./node_modules/vite/bin/vite.js build
node scripts/gerar-service-worker.mjs sw.js dist/sw.js dist
node ./node_modules/vite/bin/vite.js preview
```

Não instalar dependências ou usar `npx`. Build e geração do service worker são sequenciais:
gerar precache somente depois de um build bem-sucedido.

### 4.4 Guardas ao fim de cada etapa

`<base>` representa o SHA registrado na Etapa 0; substituir pelo valor real nos comandos.

```sh
git status --short
git diff --check
git diff --name-only <base>
git diff --stat <base> -- rael/grande-premio rael/corrida-do-rael tests/grande-premio.test.js tests/corrida-do-rael.test.js package.json package-lock.json MELHORIAS-historico.md shared/catalogo-figuras.js
rg -n '\.skip\(|\.only\(|\.todo\(' tests/corrida-3d*.test.js
rg -n 'Math\.random|Date\.now|performance\.now|localStorage|speechSynthesis|requestAnimationFrame' rael/corrida-3d/projecao.js rael/corrida-3d/renderizador.js
```

O diff dos arquivos protegidos e as buscas devem estar vazios; `rg` com código 1 significa
nenhuma ocorrência. Executar buscas somente após os arquivos existirem. Revisar separadamente
os arquivos novos não rastreados, que não aparecem em `git diff <base>`.

### 4.5 Relatório por etapa

```text
Etapa N — relatório
Base: <SHA>
Commit: <SHA e mensagem, ou não criado>
Arquivos alterados: <lista, incluindo novos>
Testes: <comando e resultado>
Typecheck/build/precache: <resultado ou não executado>
Guardas: <resultado e desvios>
Navegador: <ambiente, viewport, ação e resultado>
Capturas: <quando houver alteração visual>
Pendências: <incluindo aparelho real e observação com o Rael>
```

### 4.6 Prompt para iniciar a execução

```text
Leia PLANO-CORRIDA-3D.md e implemente a Etapa <N>.
Use o motor existente por importação direta e respeite os arquivos permitidos.
Não altere as regras do Grande Prêmio nem copie os assets do javascript-racer.
Execute as verificações aplicáveis e entregue o relatório com evidências reais.
```

---

## 5. Etapas

### Etapa 0 — Confirmar a base e registrar referências

1. Registrar branch, SHA e `git status --short`; preservar trabalho preexistente.
2. Confirmar presença do motor, APIs e testes do Grande Prêmio. Não assumir que o antigo
   cenário de WIP/branch descrito na Etapa 0 daquele plano ainda existe.
3. Executar suíte, typecheck e build atuais; registrar contagens e falhas anteriores.
4. Registrar revisão do javascript-racer e os trechos que serão adaptados, com licença.
5. Mapear o ponto de substituição do desenho em `tela.js` e o fluxo real de pausa/registro.

**Critérios:**

- [ ] A0.1 Base local e externa identificadas; nenhum trabalho anterior removido.
- [ ] A0.2 Linha de base dos comandos registrada, sem fingir aprovação de falhas existentes.
- [ ] A0.3 Confirmado que a API necessária existe; divergências de mecânica documentadas.

**Entrega:** relatório da base. Nenhuma mudança de gameplay.

### Etapa 1 — Esqueleto integrado e identidade

1. Criar pasta, HTML/CSS e entrada de tela com convite “Corrida 3D”.
2. Adicionar rota Vite e cartão; reusar SVGs existentes.
3. Incluir licenças e avisos nos arquivos derivados.
4. Importar `criarCorrida()` e mostrar cena estática inicial simples; nenhuma regra duplicada.
5. Verificar navegação e build. Durante esta etapa, não apresentar partida incompleta como
   funcional: desenvolvimento local, sem publicar.

**Critérios:**

- [ ] A1.1 Cartão e rota abrem a página correta; título, cabeçalho e nome acessível atualizados.
- [ ] A1.2 Nenhum import de `grande-premio/tela.js`; nenhum `corrida-3d/jogo.js`.
- [ ] A1.3 Build contém `dist/rael/corrida-3d/index.html`; precache inclui rota e bundles.
- [ ] A1.4 Outros jogos abrem sem regressão; rede sem 404 e sem recursos externos.

**Commit sugerido:** `Cria a estrutura da Corrida 3D`

### Etapa 2 — Projeção pura e testes de equivalência

Implementar `projecao.js` conforme a seção 3.5, inicialmente com curva zero. Criar testes
significativos, sem reescrever a suíte do motor:

| # | Cenário | Resultado obrigatório |
|---|---|---|
| T01 | Ponto no plano do jogador | Referência `(x, 580)` preservada |
| T02 | Mesmo objeto em profundidades diferentes | Mais próximo → maior e mais baixo, sem inversão |
| T03 | Centro e bordas com 2/3/4 faixas | Faixas ordenadas, jogador limitado à pista lógica |
| T04 | Ponto na/atrás da câmera | Recorte explícito; nenhum NaN/Infinity |
| T05 | Objeto nascendo, aproximando, ultrapassado e saindo | Projeção contínua, sem salto ou inversão |
| T06 | Estado congelado recursivamente | Criar cena não tenta mutá-lo |
| T07 | Rival e posto antes/depois de contato | Pegadas e hitboxes projetadas consistentes com a zona de contato |
| T08 | Linha de chegada em `y = carro.y` | Cruza exatamente a referência dianteira |
| T09 | Lista de rivais deliberadamente fora de ordem | Cena ordena cópia; lista do motor permanece intacta |
| T10 | Mesma sequência de passos, com e sem `criarCena` entre passos | Estados e eventos idênticos a cada passo |

T10 deve usar sorteadores independentes com a mesma semente, 2/3/4 faixas, entradas
determinísticas e casos de batida, reserva, abastecimento e chegada. Fazer também execuções
com zero, uma e várias renderizações entre passos. Reusar a suíte existente para provar
conclusão do bot parado, vantagem de desviar e unicidade da bandeirada.

**Critérios:**

- [ ] A2.1 T01–T10 aprovados; motor e testes anteriores sem diff.
- [ ] A2.2 Projeção não importa DOM, Canvas, RNG, fala ou armazenamento.
- [ ] A2.3 Mesmos eventos e mesma ordem, independentemente da frequência de desenho.

**Commit sugerido:** `Adiciona a projecao da Corrida 3D sem alterar o motor`

### Etapa 3 — Estrada, carros e coerência visual

1. Implementar renderizador de pista reta, carro traseiro, rivais, posto e linha de chegada.
2. Ligar entrada e loop ao motor existente; tratar os eventos para efeitos e painel.
3. Projetar seta e pontos de ancoragem de fumaça/“+1”, eliminando posições 2D copiadas da tela antiga.
4. Inspecionar hitboxes projetadas no desenvolvimento, com 2/3/4 faixas e movimentos laterais.
5. Só então adicionar curva decorativa, resolução por DPR e resize.
6. Testar renderizador com contexto Canvas instrumentado: coordenadas finitas,
   `save`/`restore` equilibrados, estado sem mutação, resize sem escala acumulada.

**Critérios:**

- [ ] A3.1 Rival reconhecível desde o nascimento no viewport 360×800; contato coerente ao bater.
- [ ] A3.2 Rival da faixa vizinha não parece ocupar a do jogador na zona de colisão.
- [ ] A3.3 Ultrapassagem visual coincide com a passagem completa; rival batido não gera “+1”.
- [ ] A3.4 Posto coleta ao contato com sua base, não no horizonte ou acostamento.
- [ ] A3.5 Curvas, perfil econômico e resize não alteram estado nem eventos.
- [ ] A3.6 Capturas: início, rival distante, rival próximo, dupla, posto e chegada.

**Commit sugerido:** `Desenha a pista e os carros da Corrida 3D`

### Etapa 4 — Largada, narrador, ajudas e pausa

1. Completar largada, narrador e feedback a partir dos eventos existentes.
2. Reaproveitar prioridade das falas e modo acompanhado; adaptar identidade.
3. Implementar pausa com retorno à fase anterior, incluindo largada e celebração.
4. Garantir cancelamento de fala/callbacks antigos por `geracaoDaCorrida` e ciclo de vida seguro.
5. Atender movimento reduzido, teclado, toques simultâneos e layout retrato/paisagem.

**Critérios:**

- [ ] A4.1 Primeiro rival e posto recebem instrução; ajuda de desvio e reserva continuam claras.
- [ ] A4.2 Aba oculta em cada fase ativa congela motor e apresentação; retorno exige Continuar.
- [ ] A4.3 Repetir não avança semáforo, corrida ou final; nenhum anúncio por quadro.
- [ ] A4.4 Movimento reduzido sem curva, fumaça, pisca ou aceno; corrida concluível.
- [ ] A4.5 Sem-fala, teclado e toque funcionam sem cortes e sem direção presa.
- [ ] A4.6 Voltar pelo navegador após `pagehide` não deixa página congelada ou RAF duplicado.

**Commit sugerido:** `Integra controles fala e pausa na Corrida 3D`

### Etapa 5 — Bandeirada, álbum, conquistas e documentação

1. Implementar a ordem de conclusão da seção 3.7 e reinício seguro.
2. Adicionar atividade ao catálogo de conquistas, com os nomes da seção 2.1.
3. Acrescentar testes de primeira, nona, décima e décima primeira rodadas, sem alterar
   asserções anteriores; verificar figura existente e ordem do catálogo.
4. Testar isolamento: rodada `corrida-3d` não incrementa `grande-premio` ou `corrida-do-rael`.
5. Testar “Explorador de brincadeiras” com a atividade nova e preservação de conquistas antigas.
6. Documentar no README a importação do motor, limites da adaptação, SHA externo e créditos.
7. Registrar no MELHORIAS resultado técnico e o que ainda falta observar com o Rael.

**Critérios:**

- [ ] A5.1 Bandeirada salva exatamente uma rodada, inclusive se pausar durante celebração.
- [ ] A5.2 Figurinha e conquistas próprias aparecem; jogos anteriores preservam contagens.
- [ ] A5.3 Cinco toques rápidos em reiniciar causam uma nova largada, com um RAF.
- [ ] A5.4 `shared/` tem apenas a entrada permitida; suíte, typecheck e build aprovados.
- [ ] A5.5 README contém atribuição, revisão e explica que imagens/música externas não foram usadas.

**Commit sugerido:** `Integra Corrida 3D ao album e as conquistas`

### Etapa 6 — Verificação final

Somente correções dentro do escopo, repetindo critérios afetados. Executar suíte completa,
typecheck, build, geração do service worker, revisão do diff e guardas. Validar no **preview
de produção**, incluindo carregamento offline depois de o service worker controlar a página.

| # | Ambiente/ação | Resultado obrigatório |
|---|---|---|
| B01 | 390×844, 3 faixas, corrida completa | Perspectiva clara, bandeirada, uma rodada e figurinha |
| B02 | 360×800, 2 faixas | Sem corte dos botões; rival visível; nunca dupla |
| B03 | 360×800, 4 faixas | Dupla deixa caminho livre e distinguível |
| B04 | 844×390 e tablet em paisagem; girar durante corrida | Layout útil, estado preservado e toque correto |
| B05 | 1280×800, setas/A/D, teclas simultâneas | Direção correta, sem evento duplo de Enter/Espaço |
| B06 | Bater de propósito e desviar de raspão | Contato visual plausível, imunidade e ajuda; sem colisão aparente entre faixas |
| B07 | Ignorar postos até reserva e abastecer | Pista esvazia; posto alcançável; corrida continua |
| B08 | Não tocar depois da largada | Corrida termina; registrar duração, sem limite visível |
| B09 | Aba oculta na largada, corrida, chegada e celebração | Pausa completa; retomar sem salto ou recompensa duplicada |
| B10 | Repetir, sem-fala e movimento reduzido | Instrução acessível; nenhuma mudança de regra |
| B11 | 5 reinícios rápidos e 5 corridas; sair/voltar pelo navegador | Um loop/listener por ação, sem callbacks de corrida anterior |
| B12 | Offline: recarregar e entrar pelo cartão | Nova rota, bundle compartilhado e SVGs disponíveis |
| B13 | Armazenamento indisponível | Rodada concluível usando comportamento existente de `descobertas.js` |
| B14 | Grande Prêmio e Corrida do Rael | Navegação, regras e progresso anteriores preservados |
| B15 | iPad/Safari e Android/Chrome reais | Registrar desempenho conforme 2.9 e fluidez dos controles |

**Acessibilidade manual:** foco visível, Tab em ordem, retomada de foco após pausa, nomes das
barras atualizados por mudança, `aria-live` sem excesso, formas além de cores, zoom de 200%
sem rolagem horizontal. Não declarar acessibilidade total do Canvas só por ter `aria-label`.

**Critérios finais:**

- [ ] A6.1 Testes da linha de base e novos cenários aprovados; typecheck e build com código 0.
- [ ] A6.2 B01–B15 documentados, com pendências reais destacadas; nenhuma evidência inventada.
- [ ] A6.3 Console sem erros e rede sem 404; nenhum pedido externo necessário para jogar.
- [ ] A6.4 Build e precache contêm página e todos os recursos usados, inclusive motor compartilhado.
- [ ] A6.5 Capturas de convite, perspectiva, dupla, batida, reserva, bandeirada e final.
- [ ] A6.6 Diff restrito à seção 3.2; jogos e motor anteriores intactos.
- [ ] A6.7 Relatório separa verificação automática, navegador, aparelho real e observação com o Rael.

**Commit sugerido:** `Documenta e valida a Corrida 3D`

**Entregar relatório final. Não fazer push, PR, merge ou deploy sem autorização específica.**

---

## 6. Validação com o Rael

Não marcar como concluída sem observação no aparelho usado em casa.

- [ ] Reconhece o próprio carro visto de trás?
- [ ] Entende que os carros distantes estão à frente, na mesma direção?
- [ ] Percebe o rival cedo o suficiente para trocar de faixa?
- [ ] Identifica a faixa livre quando há dupla?
- [ ] As batidas parecem acontecer no contato, sem “bater no nada”?
- [ ] Entende que deve passar pelo posto na pista?
- [ ] A curva decorativa ajuda a sensação de dirigir sem confundir ou incomodar?
- [ ] Usa as ajudas e consegue chegar à bandeirada, inclusive depois de reserva?
- [ ] Mantém interesse até o final e distingue o cartão de Corrida 3D do Grande Prêmio?
- [ ] Controles cabem no aparelho e não são confundidos com Pausar/Repetir?

**Ordem de ajuste se a perspectiva estiver difícil:** aumentar contraste/contorno do rival;
reduzir cenário; retirar curvas decorativas; recalibrar câmera e escala preservando pegadas;
validar novamente contato e visibilidade; experimentar configuração existente de 2 faixas.
Fazer uma alteração por vez e registrar observação. Alterar meta, velocidades ou hitboxes do
motor é tarefa separada, pois afetaria também o Grande Prêmio.

---

## 7. Fora do escopo desta versão

- 3D real, WebGL, Three.js, modelos, texturas ou download de assets externos.
- Física de curva, morros, volante, giroscópio, acelerador, freio, turbo ou saída de pista.
- Reescrita/extração do motor compartilhado ou refatoração dos jogos anteriores.
- IA de rivais, ultrapassagens dos adversários, perseguição ou corrida contra relógio.
- Troca entre visão de cima e de trás durante a mesma corrida.
- Escolha de carro/pista, garagem, loja, multiplayer e ranking.
- Música ou sprites do OutRun/javascript-racer.
- Novas regras de combustível, recompensa ou conquistas por feitos acumulados.
- Publicação, push, PR, merge ou deploy sem pedido específico.

---

## 8. Definição de pronto

- [ ] **Corrida 3D** aparece como jogo separado, com identidade e progresso próprios.
- [ ] Visão traseira reconhecível e estrada em perspectiva funcionam com 2/3/4 faixas.
- [ ] `avancarCorrida` e estado vêm do Grande Prêmio por importação; nenhum motor duplicado.
- [ ] Colisão, ultrapassagem, coleta e chegada têm imagem coerente com os eventos existentes.
- [ ] Batida só atrasa; gasolina, ajuda, reserva e 30 ultrapassagens preservadas.
- [ ] Figurinha, conquistas, reinício e pausa não duplicam registros nem loops.
- [ ] Mobile, teclado, movimento reduzido, sem-fala, resize e offline verificados.
- [ ] Desempenho registrado em aparelho real; arte própria e atribuições completas.
- [ ] Grande Prêmio e Corrida do Rael preservados, com testes anteriores aprovados.
- [ ] Observação com o Rael registrada; pendências não apresentadas como concluídas.

---

## 9. Ideias para depois

Somente após validar esta versão: novos cenários desenhados localmente, cartão exclusivo com
carro visto de trás e curvas mais expressivas. Morros com oclusão ou curvas com física exigem
plano próprio: mudam visibilidade e dificuldade e não são uma extensão automática desta entrega.

---

## 10. Revisão das Etapas 0–5 (2026-09-23)

> Revisão feita pelo Claude a pedido do Diego, depois que o Codex implementou até a Etapa 5.
> **Esta seção vale como pedido do Diego** (precedência da seção 4.1): o executor deve tratar
> os itens R01–R12 antes ou durante a Etapa 6, na ordem de prioridade abaixo. Os itens que
> mudam o visual continuam restritos a **constantes visuais**; nenhum altera o motor.

### 10.1 Estado conferido

- **Commit:** as Etapas 2–5 estavam sem commit (“Commit desta etapa: não criado” nos
  relatórios do MELHORIAS). Foram commitadas juntas em `f440331` no branch
  `corrida-3d-etapa-1`, sem ir para a `main`. Etapa 1: `fe0ad62` e `ce593cf`.
- **Automático, reexecutado nesta revisão:** Vitest **504/504 em 32 arquivos**; `tsc --noEmit`
  sem erros; build Vite e `gerar-service-worker.mjs` aprovados (267 endereços, com
  `rael/corrida-3d/` e o bundle `rael-corrida-3d-*.js`).
- **Guardas:** nenhum diff em `rael/grande-premio`, `rael/corrida-do-rael`, testes antigos ou
  `package*.json`; nenhuma ocorrência de RNG, relógio, storage, fala ou RAF em `projecao.js` e
  `renderizador.js`; nenhum `.skip`/`.only`/`.todo`. O desenho de hitboxes some do bundle de produção.
- **Arquitetura conforme o plano:** motor importado de `../grande-premio/jogo.js` (sem cópia),
  projeção pura e testada (T01–T10), renderizador sem regras, uma fase única (`faseDaTela`),
  bandeirada com `corridaRegistrada = true` antes de `registrarRodada('corrida-3d')`, reinício
  protegido contra cliques repetidos, conquistas “Primeira corrida 3D” e “Piloto 3D”
  com testes de 1.ª/9.ª/10.ª/11.ª rodada e isolamento dos outros jogos.
- **Ainda não feito:** Etapa 6 inteira (offline, matriz B01–B15, aparelho real, FPS) e seção 6
  (observação com o Rael).

### 10.2 Problemas e melhorias

| # | Prioridade | Tipo | Resumo |
|---|---|---|---|
| R01 | **Alta** | Jogabilidade/visual | Rivais nascem pequenos no meio da tela; metade de cima do Canvas não tem jogo |
| R02 | **Alta** | Layout | Paisagem sem as duas colunas exigidas em 2.11; pista minúscula em celular e tablet deitados |
| R03 | **Alta** | Evidência | Provas só em `/tmp`, dependentes do runtime do Codex; JSON final da Etapa 5 não comprova A5.3 |
| R04 | Média | Visual | Curva decorativa quase invisível e com formato de “dobra”, não de curva |
| R05 | Média | Desempenho | Cena calcula por quadro dados que o renderizador não usa |
| R06 | Média | UX | Foco fixo no botão Pausar: anel chamativo e Espaço/Enter pausam a corrida |
| R07 | Média | Layout | Tela final em 390×844: figurinha no rodapé e “Correr de novo” abaixo da dobra |
| R08 | Baixa | Bateria | RAF roda a 60 Hz também no convite, na pausa e no final |
| R09 | Baixa | Fala | “Preparar... apontar... já!” não acompanha as luzes do semáforo |
| R10 | Baixa | Fala | Fala cortada pela pausa não é retomada (ex.: “Bandeirada!”) |
| R11 | Baixa | Área útil | Faixa inferior do Canvas (y 621–700) só mostra asfalto |
| R12 | Processo | Git | Cada etapa deve terminar com commit próprio |

**R01 — Rivais aparecem pequenos e “surgem do nada” no meio da tela (alta).**
O motor nasce rivais em `Y_NASCIMENTO_RIVAL = -70`: a traseira fica em `d = 586`,
`escala = 700 / 1286 ≈ 0,54`, `telaY ≈ 393` de 700. Ou seja: céu (0–170) e estrada distante
(170–~390) ocupam **mais da metade do Canvas sem nenhum objeto interativo**, e o rival aparece
de repente a 56% da altura com metade do tamanho. Em 360×800 a pista mede ~251×440 CSS px:
o rival nasce com **~14 CSS px** de largura e o carro do Rael tem ~28 CSS px
(capturas `producao-rival.png` e `dupla.png` da Etapa 3). Para uma criança pequena isso
é pouco, e o “pop-in” no meio da estrada contradiz a ideia de ver o carro vindo do horizonte.
*Como tratar (só constantes visuais, seção 3.5):* experimentar, uma mudança por vez e com
captura antes/depois, (a) subir o horizonte e encurtar a estrada decorativa
(`DISTANCIA_DISTANTE`) para que o ponto de nascimento fique perto do fim visível da pista;
(b) reduzir o céu; (c) um *fade-in* curto (≤ 0,2 s) no nascimento, só no desenho, sem atrasar
o contorno. Não mexer em `Y_NASCIMENTO_RIVAL` nem em hitboxes (afetaria o Grande Prêmio).
*Aceite:* em 360×800 o rival nasce com ≥ 20 CSS px de largura **ou** aparece junto ao fim
visível da estrada; T01–T10 continuam passando; contato visual continua coerente (A3.1–A3.4).

**R02 — Paisagem não tem layout em duas colunas (alta).** A seção 2.11 pede “layout em duas
colunas (pista e controles/painel)” em paisagem. O CSS só limita a largura por
`(100dvh − 360px) × 400/700`: em 844×390 a pista cai para o mínimo de **160 CSS px** de largura
e a página exige rolagem; num iPad deitado (1180×820) a pista fica com ~263 px de largura.
O relatório da Etapa 3 adiou isso e o da Etapa 4 diz “paisagem conferida” só quanto a
rolagem horizontal. *Como tratar:* `@media (orientation: landscape)` com grid de duas colunas
(pista à esquerda com a altura toda; painel, Repetir/Pausar e ◀ ▶ à direita), alvos mínimos
mantidos. *Aceite:* B04 com capturas em 844×390 e 1180×820, sem rolagem vertical na corrida.

**R03 — Evidências frágeis (alta, antes de marcar A6.x).** Todas as capturas e scripts estão
em `/tmp/corrida3d-etapa3..5/` (apagados ao reiniciar o Mac) e os scripts importam o
Playwright de `~/.cache/codex-runtimes/...`, que não é dependência do projeto. Além disso, o
`resultado.json` final da Etapa 5 registra `"cincoCliquesReinicio": false`: a execução final
(`validar-final.mjs`) não repetiu o teste dos cinco cliques; a aprovação de A5.3 veio de uma
execução anterior (`validar.mjs`), cujo JSON foi sobrescrito. *Como tratar:* na Etapa 6,
reexecutar os cenários de reinício e guardar evidências numa pasta fora do repositório que
não seja temporária (ex.: `~/Desktop/evidencias-corrida-3d/`), citando-a no relatório.
Não commitar capturas nem scripts (G12).

**R04 — Curva decorativa não parece curva (média).** Pela fórmula de 3.5 o deslocamento na
tela é `18 × sin(...) × smoothstep(t) × escala`: no máximo **~8 px lógicos** perto de
`d ≈ 900`, e volta ao centro no horizonte porque o ponto de fuga é fixo. O resultado é uma
leve “dobra” das bordas (visível em `producao-rival.png`), não uma estrada que vira.
*Decisão para o Diego:* (a) **retirar a curva** nesta versão (mais simples; é o 3.º passo da
“ordem de ajuste” da seção 6), ou (b) trocar por curva acumulada como no javascript-racer
(deslocamento cresce com a distância e o ponto de fuga se move), mantendo reta a zona
dos últimos 300 px. Recomendação: (a) agora e (b) só depois da observação com o Rael.

**R05 — Trabalho descartado a cada quadro (média).** `criarCena` monta dados que o
renderizador nunca lê: `segmentos[].faixas` (80 × faixas polígonos projetados e recortados),
`mundoPerto`/`mundoLonge`, `linhaDeChegada.inicio`/`fim` e as `hitboxes` de todos os objetos,
também em produção. Com 4 faixas são ~850 polígonos por quadro, com várias alocações cada.
A estrada, de cor única, é pintada com 80 `fill()` separados. Ainda sem medição em aparelho.
*Como tratar:* medir primeiro (2.9/B15). Se preciso: calcular hitboxes só com a opção de
depuração, retirar `faixas` da cena, desenhar a estrada reta como um polígono único e
reutilizar a malha quando a curva for zero. Os testes que leem esses campos devem passar a
verificar o equivalente no que é desenhado, **sem reduzir asserções** (G10).

**R06 — Foco no botão Pausar durante a corrida (média).** `iniciarLargada` e `continuar`
fazem `$('pausar').focus()`. Nas capturas o botão fica com um anel de foco grosso durante
toda a corrida, chamando a atenção da criança para ele; e com teclado, Espaço/Enter (fáceis
de apertar por acaso) acionam o botão focado e pausam. Herdado do Grande Prêmio.
*Como tratar:* focar o quadro da pista (`tabindex="-1"`, com rótulo) ou mostrar o anel só com
`:focus-visible` real de teclado; manter a retomada de foco exigida pela acessibilidade.

**R07 — Tela final corta as ações (média, verificar).** Em `primeiro-fim.png` (390×844) há um
grande espaço entre o texto e a figurinha, que fica no rodapé; “🏁 Correr de novo” e
“🏠 Início” ficam abaixo da dobra. Provavelmente é o cartão de conquista nova animando.
*Como tratar:* conferir no navegador depois da animação e comparar com o Grande Prêmio; se o
botão continuar fora da tela, compactar o final (figura menor, figurinha ao lado do texto)
só em `corrida-3d.css`. *Aceite:* botão “Correr de novo” visível sem rolar em 360×800 e 390×844.

**R08 — RAF permanente (baixa).** `quadro` sempre chama `agendarQuadro()`, mesmo no convite,
na pausa e no final, onde nada é desenhado. Gasta bateria no tablet. Parar o RAF nessas fases
e reagendar em `iniciarLargada`, `continuar` e `pageshow`, preservando “um RAF por página”.

**R09 — Contagem falada fora do ritmo das luzes (baixa).** A largada chama
`falarSequencia(['Preparar...', 'apontar...', 'já!'])` de uma vez; o semáforo troca a cada
0,8 s pelo relógio do jogo. Com voz lenta, “já!” sai depois do verde. Falar cada palavra ao
acender a luz correspondente (herdado do Grande Prêmio; corrigir só aqui).

**R10 — Fala interrompida pela pausa (baixa).** `pausar` chama `interromperFala()`; ao continuar,
a frase cortada não volta (ex.: “Bandeirada! Você completou...” se pausar na celebração).
O texto continua em `#retorno` e Repetir funciona; opcional: repetir a última fala de
prioridade 3 ao continuar.

**R11 — Asfalto vazio embaixo do carro (baixa).** A base do jogador projeta em `y ≈ 621`;
de 621 a 700 só há estrada. Avaliar junto com R01 (câmera um pouco mais baixa ou Canvas
recortado), sempre preservando a referência `(x, 580)` de T01/T08.

**R12 — Commits por etapa (processo).** O plano sugere um commit por etapa (seção 5), mas as
Etapas 2–5 ficaram sem commit até esta revisão. Na Etapa 6 e nas correções acima, commitar
ao fim de cada item com caminhos explícitos (4.1), sem push/PR/merge (G16).

### 10.3 Ordem sugerida

1. R03 (salvar evidências e refazer A5.3) → R02 → R07: não mudam a perspectiva.
2. R01 + R11 com capturas antes/depois; decidir R04 com o Diego.
3. R06, R08–R10.
4. Etapa 6 completa, incluindo medição de FPS (R05 só se a medição pedir).
5. Observação com o Rael (seção 6), dando atenção especial a “percebe o rival cedo?”.

---

## Fontes consultadas (2026-09-22)

- [Plano do Grande Prêmio do Rael](PLANO-GRANDE-PREMIO-DO-RAEL.md), em especial a seção 9.
- [Motor implementado](rael/grande-premio/jogo.js), [tela](rael/grande-premio/tela.js) e
  [testes](tests/grande-premio.test.js), consultados no workspace atual.
- [javascript-racer: README e restrições dos assets](https://github.com/jakesgordon/javascript-racer).
- [javascript-racer: código de projeção e renderização](https://github.com/jakesgordon/javascript-racer/blob/master/common.js).
- [javascript-racer: referência de curvas](https://github.com/jakesgordon/javascript-racer/blob/master/v2.curves.html).
- [javascript-racer: versão final para consulta na implementação](https://github.com/jakesgordon/javascript-racer/blob/master/v4.final.html).
- [javascript-racer: licença do código](https://github.com/jakesgordon/javascript-racer/blob/master/LICENSE).
