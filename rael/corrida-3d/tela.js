/**
 * Corrida 3D — entrada, motor compartilhado, largada e narração.
 * Entrada/painel adaptados do Grande Prêmio do Rael, derivado de Pixel Racer.
 * Copyright (c) 2026 Tarek Elomami — MIT, LICENSE-pixel-racer.txt.
 * Álbum e conquistas seguem o registro único da bandeirada.
 */
import { montarCabecalho } from '../../shared/cabecalho.js';
import { obterConfiguracoes, registrarRodada } from '../../shared/descobertas.js';
import { anunciarConquistas } from '../../shared/conquistas-tela.js';
import { caminhoDaFigura, figura } from '../../shared/catalogo-figuras.js';
import { tocar } from '../../shared/sons.js';
import {
  definirPreferencia, diagnostico as diagnosticoDaFala, falar, falarSequencia, modoAcompanhado,
  parar, preparar, repetir as repetirFala,
} from '../../shared/fala.js';
import { centroDaFaixa, faixaDoCarro } from '../corrida-do-rael/jogo.js';
import {
  criarCorrida, avancarCorrida, faixaSugerida, resumoDaCorrida,
  DT_MAXIMO, META_ULTRAPASSAGENS, JANELA_DA_SETA,
  LIMIAR_POSTO, LIMIAR_POUCA_GASOLINA, DURACAO_LENTIDAO,
} from '../grande-premio/jogo.js';
import { criarCena, projetarPonto } from './projecao.js';
import { criarRenderizador } from './renderizador.js';

montarCabecalho('Corrida 3D');
const $ = id => document.getElementById(id);
const canvas = $('pista');
// Opções de inspeção locais, ausentes da interface infantil e do build publicado.
const opcoesDev = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
const qualidade = opcoesDev?.get('qualidade') === 'economica' ? 'economica' : 'padrao';
const hitboxes = opcoesDev?.has('hitboxes') ?? false;
const renderizador = criarRenderizador(canvas, { qualidade });
const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
const DURACAO_DA_LUZ = 0.8;
const DURACAO_DA_LARGADA = DURACAO_DA_LUZ * 3;
const DURACAO_DA_CELEBRACAO = 2;
const JANELA_PRIORIDADE_1 = 1.5;
const FASES_ANIMADAS = Object.freeze(['largada', 'corrida', 'bandeirada']);
const FALAS = Object.freeze({
  explicacao: 'Ultrapasse trinta carros para ganhar a bandeirada. E não esqueça de abastecer!',
  largada: Object.freeze(['Preparar...', 'apontar...', 'já!']),
  primeiroRival: 'Tem um carro na frente. Vá para o lado e ultrapasse!',
  primeiraUltrapassagem: 'Ultrapassou!',
  primeiroPosto: 'Olha o posto! Passe por cima para abastecer.',
  abasteceu: 'Abasteceu!',
  poucaGasolina: 'A gasolina está acabando! Procure o posto!',
  reserva: 'Acabou a gasolina! O carro ficou devagar. Vá até o posto!',
  primeiraBatida: 'Opa! Bateu. Desvie dos carros!',
  ajudaDesvio: 'Siga a seta verde!',
  meta: 'Trinta carros! Agora é a reta final!',
  primeiroOleo: 'Cuidado! Tem óleo na pista. Desvie da mancha!',
  primeiraDerrapagem: 'Escorregou no óleo!',
  primeiroPisca: 'Olha o pisca-pisca! Aquele carro vai mudar de faixa.',
});
const BOTOES_DE_DIFICULDADE = Object.freeze(['comecar', 'comecar-medio', 'comecar-dificil']);
const FALAS_DOS_MARCOS = Object.freeze({
  5: 'Cinco carros!', 10: 'Dez carros!', 15: 'Quinze carros!',
  20: 'Vinte carros!', 25: 'Vinte e cinco carros!',
  28: 'Faltam só dois!', 29: 'Falta só um!',
});
const teclas = new Set();
const ponteiros = new Map();
const rivaisDoAquecimento = new Set();
// Lembrada durante a visita; "Correr de novo" repete a mesma corrida.
let dificuldade = 'facil';
let avisouPiscaPisca = false;
let estado = criarCorrida({ faixas: obterConfiguracoes().alternativas, dificuldade });
let configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
let faseDaTela = 'convite';
let faseAntesDaPausa = 'corrida';
let geracaoDaCorrida = 0;
let geracaoDaPagina = 0;
let preparandoConvite = false;
let ultimoTempo = null;
let raf = null;
let tempoAtivo = 0;
let tempoLargada = 0;
let tempoBandeirada = 0;
let tempoFumaca = 0;
let efeitos = [];
let tempoRetorno = 0;
let painelAnterior = '';
let falaEmAndamento = null;
let proximaFalaId = 0;
let inicioDaUltimaFala = -Infinity;
let ultimoTextoNarrado = '';
let falaDaFesta = null;
let falaInterrompida = null;
let luzAcesa = -1;
let corridaRegistrada = false;
let premioDaCorrida = null;

function limparEntrada() { teclas.clear(); ponteiros.clear(); }
// Só o Fácil explica e ajuda no começo; Médio e Difícil largam direto, sem seta no aquecimento.
function comAssistenciaInicial() { return dificuldade === 'facil'; }
function atualizarControles() {
  const ativa = faseDaTela === 'corrida';
  $('esquerda').disabled = !ativa;
  $('direita').disabled = !ativa;
  $('pausar').disabled = !['largada', 'corrida', 'bandeirada'].includes(faseDaTela);
  $('repetir').disabled = !ultimoTextoNarrado || !['largada', 'corrida', 'bandeirada', 'pausa'].includes(faseDaTela);
  if (!ativa) limparEntrada();
}
function mostrarTela(nome) {
  for (const tela of ['convite', 'corrida', 'fim']) $(`tela-${tela}`).hidden = tela !== nome;
}
function primeiroNome() {
  return typeof configuracoes.nome === 'string' ? configuracoes.nome.trim().split(/\s+/)[0] || '' : '';
}
function mostrarTextoNarrado(texto) {
  ultimoTextoNarrado = texto;
  $('retorno').textContent = texto;
  $('roteiro-fala').textContent = texto;
  $('roteiro').hidden = !modoAcompanhado();
  tempoRetorno = 4;
  atualizarControles();
}
function acompanharFala(prioridade, promessa) {
  const id = ++proximaFalaId;
  const geracao = geracaoDaCorrida;
  falaEmAndamento = { prioridade, id };
  inicioDaUltimaFala = tempoAtivo;
  Promise.resolve(promessa).catch(() => 'sem-fala').then(() => {
    if (geracao === geracaoDaCorrida && falaEmAndamento?.id === id) falaEmAndamento = null;
  });
  return promessa;
}
function narrar(texto, prioridade, textoVisual = texto) {
  if (prioridade === 2 && falaEmAndamento?.prioridade > 2) return null;
  if (prioridade === 1 && (falaEmAndamento || tempoAtivo - inicioDaUltimaFala < JANELA_PRIORIDADE_1)) return null;
  mostrarTextoNarrado(textoVisual);
  return acompanharFala(prioridade, falar({ texto }));
}
function interromperFala() {
  parar();
  falaEmAndamento = null;
  proximaFalaId += 1;
}
function zerarNarrador() {
  interromperFala();
  inicioDaUltimaFala = -Infinity;
  ultimoTextoNarrado = '';
  $('retorno').textContent = '';
  $('roteiro-fala').textContent = '';
  $('roteiro').hidden = true;
  tempoRetorno = 0;
}
function acenderSemaforo(indice) {
  // Cada palavra da largada sai junto com a sua luz, pelo relógio ativo do jogo.
  if (indice >= 0 && indice !== luzAcesa) {
    mostrarTextoNarrado(FALAS.largada.slice(0, indice + 1).join(' '));
    acompanharFala(2, falar({ texto: FALAS.largada[indice] }));
  }
  luzAcesa = indice;
  $('semaforo').hidden = indice < 0;
  for (const [numero, luz] of [...$('semaforo').querySelectorAll('.semaforo__luz')].entries()) {
    luz.classList.toggle('semaforo__luz--acesa', numero === indice);
  }
}
function atualizarPainel() {
  const total = estado.ultrapassagens;
  const gasolina = Math.round(estado.gasolina);
  const assinatura = `${total}:${gasolina}:${estado.reserva}`;
  if (assinatura === painelAnterior) return;
  painelAnterior = assinatura;
  $('barra-ultrapassagens').style.width = `${total / META_ULTRAPASSAGENS * 100}%`;
  $('contador').textContent = `${total}/${META_ULTRAPASSAGENS}`;
  $('ultrapassagens').setAttribute('aria-valuenow', String(total));
  $('ultrapassagens').setAttribute('aria-label', `Carros ultrapassados: ${total} de ${META_ULTRAPASSAGENS}`);
  $('barra-gasolina').style.width = `${estado.gasolina}%`;
  $('gasolina').setAttribute('aria-valuenow', String(gasolina));
  const rotulo = estado.reserva ? 'Na reserva' : estado.gasolina <= LIMIAR_POUCA_GASOLINA
    ? 'Pouca gasolina' : estado.gasolina <= LIMIAR_POSTO ? 'Gasolina pela metade' : 'Gasolina cheia';
  $('gasolina').setAttribute('aria-label', rotulo);
  $('barra-gasolina').classList.toggle('medidor__barra--pouca', estado.gasolina <= LIMIAR_POUCA_GASOLINA);
  $('barra-gasolina').classList.toggle('medidor__barra--metade', estado.gasolina > LIMIAR_POUCA_GASOLINA && estado.gasolina <= LIMIAR_POSTO);
}
function iniciarLargada() {
  geracaoDaCorrida += 1;
  zerarNarrador();
  configuracoes = obterConfiguracoes();
  definirPreferencia(configuracoes.voz);
  estado = criarCorrida({ faixas: configuracoes.alternativas, dificuldade });
  avisouPiscaPisca = false;
  faseDaTela = 'largada';
  ultimoTempo = null;
  tempoAtivo = tempoLargada = tempoBandeirada = tempoFumaca = 0;
  efeitos = [];
  falaDaFesta = null;
  falaInterrompida = null;
  luzAcesa = -1;
  corridaRegistrada = false;
  premioDaCorrida = null;
  rivaisDoAquecimento.clear();
  limparEntrada();
  painelAnterior = '';
  $('bandeira').hidden = true;
  $('bandeira').classList.remove('bandeira--acenando');
  $('confete').hidden = true;
  $('tela-pausa').hidden = true;
  mostrarTela('corrida');
  acenderSemaforo(0);
  atualizarControles();
  atualizarPainel();
  redimensionar();
  focarPista();
  agendarQuadro();
  if (document.hidden) pausar();
}
// O foco fica na pista, não em Pausar: sem anel chamativo e sem Espaço/Enter pausando.
function focarPista() { $('quadro-pista').focus({ preventScroll: true }); }
function habilitarDificuldades(habilitar) {
  for (const id of BOTOES_DE_DIFICULDADE) {
    $(id).disabled = !habilitar;
    $(id).classList.toggle('dificuldade--escolhida', $(id).dataset.dificuldade === dificuldade);
  }
}
function escolherDificuldade(evento) {
  if (faseDaTela !== 'convite' || preparandoConvite) return;
  dificuldade = evento.currentTarget.dataset.dificuldade;
  iniciarCorrida();
}
/** Do final de volta ao convite, para escolher outra corrida. */
function voltarAoConvite() {
  if (faseDaTela !== 'fim') return;
  geracaoDaCorrida += 1;
  zerarNarrador();
  faseDaTela = 'convite';
  preparandoConvite = false;
  $('texto-convite-fala').hidden = true;
  habilitarDificuldades(true);
  mostrarTela('convite');
  atualizarControles();
  $(BOTOES_DE_DIFICULDADE.find(id => $(id).dataset.dificuldade === dificuldade)).focus({ preventScroll: true });
}
async function iniciarCorrida() {
  if (faseDaTela === 'fim') { iniciarLargada(); return; }
  if (faseDaTela !== 'convite' || preparandoConvite) return;
  preparandoConvite = true;
  habilitarDificuldades(false);
  configuracoes = obterConfiguracoes();
  definirPreferencia(configuracoes.voz);
  const geracao = geracaoDaCorrida;
  const pagina = geracaoDaPagina;
  tocar('clique');
  // O desbloqueio da voz precisa começar no gesto do usuário, antes do primeiro await.
  const preparacao = configuracoes.voz === 'sem-fala' ? Promise.resolve(diagnosticoDaFala()) : preparar();
  const diagnostico = await preparacao;
  if (geracao !== geracaoDaCorrida || pagina !== geracaoDaPagina || faseDaTela !== 'convite') return;
  if (!diagnostico.sinteseDisponivel && !diagnostico.mudo && configuracoes.voz !== 'sem-fala') {
    $('aviso-voz').textContent = 'Um adulto pode ler as frases da tela.';
    $('aviso-voz').hidden = false;
  }
  if (comAssistenciaInicial()) {
    const nome = primeiroNome();
    const convite = nome ? `${nome}, vamos brincar de Corrida três dê?` : 'Vamos brincar de Corrida três dê?';
    const conviteVisual = nome ? `${nome}, vamos brincar de Corrida 3D?` : 'Vamos brincar de Corrida 3D?';
    const introducao = `${conviteVisual} ${FALAS.explicacao}`;
    $('texto-convite-fala').textContent = introducao;
    $('texto-convite-fala').hidden = false;
    mostrarTextoNarrado(introducao);
    await acompanharFala(2, falarSequencia([convite, FALAS.explicacao]));
    if (geracao !== geracaoDaCorrida || pagina !== geracaoDaPagina) return;
  }
  if (faseDaTela === 'convite') iniciarLargada();
  preparandoConvite = false;
  habilitarDificuldades(true);
}
function pausar() {
  limparEntrada();
  if (!['largada', 'corrida', 'bandeirada'].includes(faseDaTela)) return;
  faseAntesDaPausa = faseDaTela;
  faseDaTela = 'pausa';
  ultimoTempo = null;
  // Instruções (prioridade 2 e 3) cortadas pela pausa voltam ao continuar.
  falaInterrompida = falaEmAndamento?.prioridade >= 2 ? { prioridade: falaEmAndamento.prioridade } : null;
  interromperFala();
  $('tela-pausa').hidden = false;
  atualizarControles();
  if (!document.hidden) $('continuar').focus({ preventScroll: true });
}
function continuar() {
  if (faseDaTela !== 'pausa' || document.hidden) return;
  limparEntrada();
  ultimoTempo = null;
  faseDaTela = faseAntesDaPausa;
  $('tela-pausa').hidden = true;
  atualizarControles();
  focarPista();
  if (falaInterrompida) {
    mostrarTextoNarrado(ultimoTextoNarrado);
    const retomada = acompanharFala(falaInterrompida.prioridade, repetirFala());
    // A tela final espera a fala da bandeirada; ela passa a ser a fala retomada.
    if (faseDaTela === 'bandeirada') falaDaFesta = retomada;
    falaInterrompida = null;
  }
  agendarQuadro();
}
function direcaoAtual() {
  const direcoes = new Set(ponteiros.values());
  if (teclas.has('arrowleft') || teclas.has('a')) direcoes.add(-1);
  if (teclas.has('arrowright') || teclas.has('d')) direcoes.add(1);
  return Number(direcoes.has(1)) - Number(direcoes.has(-1));
}
function tratarEvento(evento) {
  switch (evento.tipo) {
    case 'rival-apareceu':
      if (!comAssistenciaInicial()) break;
      if (evento.aquecimento) {
        const primeiro = estado.proximoId - evento.faixas.length;
        for (const r of estado.rivais) if (r.id >= primeiro) rivaisDoAquecimento.add(r.id);
      }
      if (evento.numero === evento.faixas.length) narrar(FALAS.primeiroRival, 2);
      break;
    case 'ultrapassou':
      tocar('clique');
      efeitos.push({ tipo: 'mais-um', x: estado.carro.x + estado.carro.w / 2, y: estado.carro.y, idade: 0 });
      if (evento.total === 1) narrar(FALAS.primeiraUltrapassagem, 1);
      break;
    case 'marco': if (FALAS_DOS_MARCOS[evento.total]) narrar(FALAS_DOS_MARCOS[evento.total], 1); break;
    case 'bateu':
      tocar('erro'); tempoFumaca = 0;
      if (evento.primeira) narrar(FALAS.primeiraBatida, 2);
      break;
    case 'ajuda-desvio': narrar(FALAS.ajudaDesvio, 2); break;
    case 'posto-apareceu': if (evento.primeiro) narrar(FALAS.primeiroPosto, 2); break;
    case 'abasteceu': tocar('acerto'); narrar(FALAS.abasteceu, 2); break;
    case 'pouca-gasolina': narrar(FALAS.poucaGasolina, 3); break;
    case 'reserva': narrar(FALAS.reserva, 3); break;
    case 'meta': narrar(FALAS.meta, 3); break;
    case 'oleo-apareceu': if (evento.primeiro) narrar(FALAS.primeiroOleo, 2); break;
    case 'derrapou':
      tocar('erro');
      if (evento.primeira) narrar(FALAS.primeiraDerrapagem, 2);
      break;
    case 'rival-sinalizou':
      if (!avisouPiscaPisca && narrar(FALAS.primeiroPisca, 2)) avisouPiscaPisca = true;
      break;
    case 'bandeirada':
      if (faseDaTela !== 'corrida' || corridaRegistrada) break;
      faseDaTela = 'bandeirada';
      tempoBandeirada = 0;
      atualizarControles();
      corridaRegistrada = true;
      premioDaCorrida = registrarRodada('corrida-3d');
      $('bandeira').hidden = false;
      $('bandeira').classList.add('bandeira--acenando');
      $('confete').hidden = false;
      tocar('vitoria');
      falaDaFesta = narrar(
        `Bandeirada! Você completou a Corrida três dê, ${primeiroNome() || 'piloto'}!`, 3,
        `Bandeirada! Você completou a Corrida 3D, ${primeiroNome() || 'piloto'}!`,
      );
      break;
    default: break;
  }
}
function faixaDaSeta() {
  const sugerida = faixaSugerida(estado);
  if (sugerida === null) return null;
  const atual = faixaDoCarro(estado.carro.x, estado.carro.w, estado.geometria);
  return estado.rivais.some(r => !r.saindo && !r.contado && r.faixa === atual
    && r.y + r.h >= estado.carro.y - JANELA_DA_SETA && r.y + r.h <= estado.carro.y
    && (r.comAjuda || rivaisDoAquecimento.has(r.id))) ? sugerida : null;
}
function desenhar() {
  const reduzido = movimentoReduzido.matches;
  const cena = criarCena(estado, { movimentoReduzido: reduzido, qualidade, hitboxes });
  const faixa = faixaDaSeta();
  const seta = faixa === null ? null : {
    de: projetarPonto({ x: estado.carro.x + estado.carro.w / 2, y: estado.carro.y - 75 }, cena.camera),
    para: projetarPonto({ x: centroDaFaixa(faixa, estado.geometria), y: estado.carro.y - 75 }, cena.camera),
  };
  renderizador.desenhar(cena, {
    tempo: tempoAtivo, movimentoReduzido: reduzido, imune: estado.tempoDesdeBatida !== null,
    seta, hitboxes,
    efeitos: efeitos.map(efeito => ({ ...efeito, ponto: projetarPonto({
      x: efeito.x,
      y: efeito.y + (efeito.tipo === 'fumaca' ? estado.distancia - efeito.distancia : 0),
    }, cena.camera) })),
  });
}
function avancarEfeitos(dt) {
  tempoAtivo += dt;
  efeitos = efeitos.map(e => ({ ...e, idade: e.idade + dt })).filter(e => e.idade < 0.8);
  tempoFumaca -= dt;
  if (!movimentoReduzido.matches && estado.tempoDesdeBatida !== null
    && estado.tempoDesdeBatida < DURACAO_LENTIDAO && tempoFumaca <= 0) {
    tempoFumaca = 0.12;
    for (const lado of [-1, 1]) efeitos.push({
      tipo: 'fumaca', x: estado.carro.x + estado.carro.w / 2 + lado * estado.carro.w * 0.35,
      y: estado.carro.y + estado.carro.h, distancia: estado.distancia, idade: 0,
    });
  }
  if (tempoRetorno > 0) {
    tempoRetorno -= dt;
    if (tempoRetorno <= 0) $('retorno').textContent = '';
  }
}
function mostrarFim() {
  if (faseDaTela !== 'bandeirada') return;
  faseDaTela = 'fim';
  atualizarControles();
  $('bandeira').hidden = true;
  $('bandeira').classList.remove('bandeira--acenando');
  $('confete').hidden = true;
  const resumo = resumoDaCorrida(estado);
  const abastecimentos = resumo.abastecimentos === 0 ? '' : ` e abasteceu ${resumo.abastecimentos} ${resumo.abastecimentos === 1 ? 'vez' : 'vezes'}`;
  $('texto-fim').textContent = `Você ultrapassou ${resumo.ultrapassagens} carros${abastecimentos}!`;
  const figurinha = $('figurinha');
  const id = premioDaCorrida?.figurinha;
  figurinha.hidden = !id;
  if (id) {
    figurinha.src = caminhoDaFigura(id);
    figurinha.alt = `Figurinha nova: ${figura(id)?.nome || id}`;
  }
  const falasDasConquistas = anunciarConquistas(premioDaCorrida?.conquistasNovas || [], {
    depoisDe: $('texto-fim'),
    dizer: itens => {
      mostrarTextoNarrado(itens.map(item => item.texto).join(' '));
      acompanharFala(2, falarSequencia(itens));
    },
  });
  mostrarTela('fim');
  $('de-novo').focus({ preventScroll: true });
  const geracao = geracaoDaCorrida;
  const pagina = geracaoDaPagina;
  Promise.resolve(falaDaFesta).catch(() => 'sem-fala').then(() => {
    if (geracao !== geracaoDaCorrida || pagina !== geracaoDaPagina || faseDaTela !== 'fim') return;
    const texto = $('texto-fim').textContent;
    mostrarTextoNarrado(texto);
    acompanharFala(2, falarSequencia([{ texto }, ...falasDasConquistas]));
  });
}
function quadro(agora) {
  raf = null;
  const dt = ultimoTempo === null ? 0 : Math.min(DT_MAXIMO, Math.max(0, (agora - ultimoTempo) / 1000));
  ultimoTempo = agora;
  if (faseDaTela === 'largada') {
    tempoLargada = Math.min(DURACAO_DA_LARGADA, tempoLargada + dt);
    if (tempoLargada >= DURACAO_DA_LARGADA) {
      acenderSemaforo(-1);
      faseDaTela = 'corrida';
      ultimoTempo = null;
      limparEntrada();
      atualizarControles();
    } else {
      acenderSemaforo(Math.floor(tempoLargada / DURACAO_DA_LUZ));
    }
    desenhar();
  }
  if (['corrida', 'bandeirada'].includes(faseDaTela)) {
    const passo = ultimoTempo === null ? 0 : dt;
    avancarEfeitos(passo);
    const celebrando = faseDaTela === 'bandeirada';
    const eventos = avancarCorrida(estado, { dt: passo, direcao: faseDaTela === 'corrida' ? direcaoAtual() : 0 }, { sortear: Math.random });
    eventos.forEach(tratarEvento);
    if (celebrando) {
      tempoBandeirada += passo;
      if (tempoBandeirada >= DURACAO_DA_CELEBRACAO) mostrarFim();
    }
    atualizarPainel();
    desenhar();
  }
  agendarQuadro();
}
// Convite, pausa e final não animam o Canvas: sem RAF, até iniciarLargada/continuar.
function agendarQuadro() {
  if (raf === null && FASES_ANIMADAS.includes(faseDaTela)) raf = requestAnimationFrame(quadro);
}
function redimensionar() { renderizador.redimensionar(window.devicePixelRatio); desenhar(); }
function soltar(evento) { ponteiros.delete(evento.pointerId); }
function capturar(elemento, evento, direcao) {
  if (faseDaTela !== 'corrida') return;
  evento.preventDefault();
  ponteiros.set(evento.pointerId, direcao);
  if (elemento.setPointerCapture && evento.buttons) elemento.setPointerCapture(evento.pointerId);
}
function direcaoDoToque(evento) {
  const rect = canvas.getBoundingClientRect();
  return evento.clientX < rect.left + rect.width / 2 ? -1 : 1;
}
for (const [id, direcao] of [['esquerda', -1], ['direita', 1]]) {
  $(id).addEventListener('pointerdown', e => capturar($(id), e, direcao));
  $(id).addEventListener('lostpointercapture', soltar);
}
canvas.addEventListener('pointerdown', e => capturar(canvas, e, direcaoDoToque(e)));
canvas.addEventListener('pointermove', e => { if (ponteiros.has(e.pointerId)) ponteiros.set(e.pointerId, direcaoDoToque(e)); });
canvas.addEventListener('lostpointercapture', soltar);
window.addEventListener('pointerup', soltar);
window.addEventListener('pointercancel', soltar);
window.addEventListener('blur', limparEntrada);
window.addEventListener('keydown', e => {
  const tecla = e.key.toLowerCase();
  if (['arrowleft', 'arrowright', 'a', 'd'].includes(tecla) && faseDaTela === 'corrida') {
    if (e.target instanceof Element && e.target.closest('input, select, textarea')) return;
    e.preventDefault(); teclas.add(tecla);
  } else if ((e.code === 'Space' || tecla === 'enter') && !e.repeat
    && !(e.target instanceof Element && e.target.closest('button, a, input, select, textarea'))) {
    if (['convite', 'fim', 'pausa'].includes(faseDaTela)) {
      e.preventDefault();
      if (faseDaTela === 'pausa') continuar(); else iniciarCorrida();
    } else if (FASES_ANIMADAS.includes(faseDaTela)) {
      e.preventDefault(); // com o foco na pista, Espaço rolaria a página
    }
  }
});
window.addEventListener('keyup', e => teclas.delete(e.key.toLowerCase()));
for (const id of BOTOES_DE_DIFICULDADE) $(id).addEventListener('click', escolherDificuldade);
$('de-novo').addEventListener('click', iniciarCorrida);
$('trocar-dificuldade').addEventListener('click', voltarAoConvite);
$('repetir').addEventListener('click', () => {
  if (!ultimoTextoNarrado || $('repetir').disabled) return;
  mostrarTextoNarrado(ultimoTextoNarrado);
  acompanharFala(1, repetirFala());
});
$('pausar').addEventListener('click', pausar);
$('continuar').addEventListener('click', continuar);
window.addEventListener('resize', redimensionar);
movimentoReduzido.addEventListener('change', desenhar);
document.addEventListener('visibilitychange', () => { limparEntrada(); if (document.hidden) pausar(); });
window.addEventListener('pagehide', () => {
  pausar();
  geracaoDaPagina += 1;
  interromperFala();
  if (faseDaTela === 'convite') {
    preparandoConvite = false;
    habilitarDificuldades(true);
  }
  ultimoTempo = null;
  if (raf !== null) cancelAnimationFrame(raf);
  raf = null;
});
window.addEventListener('pageshow', e => {
  if (e.persisted) {
    pausar();
    ultimoTempo = null;
    redimensionar();
  }
});
habilitarDificuldades(true);
atualizarControles();
atualizarPainel();
redimensionar();
