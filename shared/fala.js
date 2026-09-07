/**
 * fala.js — a voz da área Primeiras Descobertas (Jogos do Rael).
 *
 * A criança de 5 anos ainda não lê, então toda instrução precisa ser falada.
 * Gravar tudo daria centenas de arquivos antes de a primeira atividade rodar,
 * por isso a fala sai em três camadas, nesta ordem:
 *
 *   1. gravação local (`item.audio`), quando existir — é o que soa melhor e
 *      o único caminho para som de bicho, som isolado (/f/) e sílaba solta;
 *   2. voz do próprio aparelho (speechSynthesis em pt-BR), que funciona em
 *      modo avião depois que a voz está instalada — cobre nome, instrução e
 *      comemoração sem nenhum arquivo;
 *   3. modo acompanhado: nada toca e a tela mostra a frase para um adulto ler.
 *
 * Nenhum serviço online, nenhuma chave de API: a camada 2 é do sistema.
 *
 * Uso:
 *   import { preparar, falar, parar } from '../../shared/fala.js';
 *   await preparar();                       // dentro do toque em "Vamos brincar"
 *   await falar({ texto: 'Cadê o gato?' }); // devolve como falou
 */
import { estaMudo } from './sons.js';

/** @typedef {{ texto?: string, audio?: string }} ItemDeFala */

/** Preferência do adulto, salva nas configurações da etapa. */
export const MODOS = ['auto', 'gravada', 'sintetizada', 'sem-fala'];

const ESPERA_AUDIO_MS = 8000;
const ESPERA_SINTESE_MS = 20000;

let preferencia = 'auto';
let ambienteInjetado = null;
let vozEscolhida = null;
let vozesProntas = false;
let audioAtual = null;
let ultimoDito = null;
/** Sobe a cada parar(): sequências antigas param sozinhas ao ver o número mudado. */
let geracao = 0;

/** Troca o ambiente (só os testes usam isto). Passe null para voltar ao normal. */
export function configurarAmbiente(ambiente) {
  ambienteInjetado = ambiente;
  vozEscolhida = null;
  vozesProntas = false;
}

function ambiente() {
  if (ambienteInjetado) return ambienteInjetado;
  return {
    sintese: globalThis.speechSynthesis ?? null,
    Enunciado: globalThis.SpeechSynthesisUtterance ?? null,
    criarAudio: url => new globalThis.Audio(url),
    mudo: estaMudo,
  };
}

/** 'auto', 'gravada', 'sintetizada' ou 'sem-fala'. Devolve o que ficou valendo. */
export function definirPreferencia(modo) {
  preferencia = MODOS.includes(modo) ? modo : 'auto';
  return preferencia;
}

export function preferenciaAtual() {
  return preferencia;
}

function escolherVoz(sintese) {
  const vozes = typeof sintese?.getVoices === 'function' ? sintese.getVoices() : [];
  const idioma = voz => String(voz?.lang || '').replace('_', '-').toLowerCase();
  return vozes.find(voz => idioma(voz).startsWith('pt-br'))
    || vozes.find(voz => idioma(voz).startsWith('pt'))
    || null;
}

/**
 * Prepara a fala. Chame dentro do primeiro toque ("Vamos brincar"): o iOS só
 * libera a voz do aparelho dentro de um gesto, e a lista de vozes costuma
 * chegar vazia até o evento voiceschanged.
 */
export async function preparar() {
  const env = ambiente();
  if (!env.sintese || !env.Enunciado) return diagnostico();

  vozEscolhida = escolherVoz(env.sintese);
  if (!vozEscolhida && typeof env.sintese.addEventListener === 'function') {
    await new Promise(resolve => {
      const relogio = setTimeout(pronto, 1200);
      function pronto() {
        clearTimeout(relogio);
        env.sintese.removeEventListener?.('voiceschanged', pronto);
        resolve();
      }
      env.sintese.addEventListener('voiceschanged', pronto, { once: true });
    });
    vozEscolhida = escolherVoz(env.sintese);
  }
  vozesProntas = true;

  // Destrava o iOS: uma fala vazia e sem volume, ainda dentro do gesto.
  try {
    const destrava = new env.Enunciado('');
    destrava.volume = 0;
    env.sintese.speak(destrava);
  } catch {
    /* se não destravar, a camada 3 assume */
  }
  return diagnostico();
}

/** O que dá para fazer neste aparelho agora. A tela usa isto para decidir o modo acompanhado. */
export function diagnostico() {
  const env = ambiente();
  const mudo = typeof env.mudo === 'function' ? env.mudo() : false;
  const sinteseDisponivel = Boolean(env.sintese && env.Enunciado);
  if (sinteseDisponivel && !vozesProntas) vozEscolhida = vozEscolhida || escolherVoz(env.sintese);
  return {
    mudo,
    preferencia,
    sinteseDisponivel,
    voz: vozEscolhida ? vozEscolhida.name : null,
    idiomaDaVoz: vozEscolhida ? vozEscolhida.lang : null,
    podeSintetizar: sinteseDisponivel && !mudo && preferencia !== 'sem-fala' && preferencia !== 'gravada',
  };
}

/** true quando nada vai soar: a tela precisa mostrar a frase para o adulto ler. */
export function modoAcompanhado() {
  const estado = diagnostico();
  if (estado.mudo || preferencia === 'sem-fala') return true;
  if (preferencia === 'gravada') return false;    // depende de o item ter arquivo
  return !estado.sinteseDisponivel;
}

function tocarArquivo(env, url) {
  return new Promise(resolve => {
    let audio;
    try {
      audio = env.criarAudio(url);
    } catch {
      resolve(false);
      return;
    }
    if (!audio) {
      resolve(false);
      return;
    }
    audioAtual = audio;
    let encerrado = false;
    const relogio = setTimeout(() => encerrar(false), ESPERA_AUDIO_MS);
    function encerrar(deuCerto) {
      if (encerrado) return;
      encerrado = true;
      clearTimeout(relogio);
      if (audioAtual === audio) audioAtual = null;
      resolve(deuCerto);
    }
    audio.addEventListener?.('ended', () => encerrar(true));
    audio.addEventListener?.('error', () => encerrar(false));
    audio.addEventListener?.('abort', () => encerrar(false));
    try {
      const tocando = audio.play?.();
      if (tocando && typeof tocando.catch === 'function') tocando.catch(() => encerrar(false));
    } catch {
      encerrar(false);
    }
  });
}

function sintetizar(env, texto) {
  return new Promise(resolve => {
    let fala;
    try {
      fala = new env.Enunciado(texto);
    } catch {
      resolve(false);
      return;
    }
    fala.lang = vozEscolhida?.lang || 'pt-BR';
    if (vozEscolhida) fala.voice = vozEscolhida;
    // Devagar e um pouco agudo: é mais fácil de acompanhar nessa idade.
    fala.rate = 0.92;
    fala.pitch = 1.05;

    let encerrado = false;
    const relogio = setTimeout(() => encerrar(true), ESPERA_SINTESE_MS);
    function encerrar(deuCerto) {
      if (encerrado) return;
      encerrado = true;
      clearTimeout(relogio);
      resolve(deuCerto);
    }
    fala.onend = () => encerrar(true);
    // 'interrupted' e 'canceled' chegam aqui quando parar() é chamado: não é falha de verdade.
    fala.onerror = () => encerrar(false);
    try {
      env.sintese.speak(fala);
    } catch {
      encerrar(false);
    }
  });
}

/**
 * Fala um item e devolve como falou:
 * 'gravada' | 'sintetizada' | 'sem-som' (mudo) | 'sem-fala' (modo acompanhado).
 * Por padrão interrompe o que estiver falando: nunca duas vozes ao mesmo tempo.
 */
export async function falar(item, { interromper = true, lembrar = true } = {}) {
  const pedido = typeof item === 'string' ? { texto: item } : (item || {});
  if (interromper) parar();
  if (lembrar) ultimoDito = pedido;

  const env = ambiente();
  const minhaGeracao = geracao;
  if (typeof env.mudo === 'function' && env.mudo()) return 'sem-som';
  if (preferencia === 'sem-fala') return 'sem-fala';

  if (pedido.audio && preferencia !== 'sintetizada') {
    const deuCerto = await tocarArquivo(env, pedido.audio);
    if (deuCerto) return 'gravada';
    if (preferencia === 'gravada') return 'sem-fala';
    if (minhaGeracao !== geracao) return 'sem-fala';
  }

  if (preferencia === 'gravada') return 'sem-fala';
  if (!pedido.texto || !env.sintese || !env.Enunciado) return 'sem-fala';
  if (minhaGeracao !== geracao) return 'sem-fala';

  const falou = await sintetizar(env, pedido.texto);
  return falou ? 'sintetizada' : 'sem-fala';
}

/**
 * Fala vários itens em ordem, um de cada vez. Se alguém chamar parar() no
 * meio (trocar de questão, sair da tela), o resto da fila é abandonado.
 */
export async function falarSequencia(itens = []) {
  parar();
  const lista = itens.map(item => (typeof item === 'string' ? { texto: item } : item));
  ultimoDito = lista;
  const minhaGeracao = geracao;
  const resultados = [];
  for (const item of lista) {
    if (minhaGeracao !== geracao) break;
    resultados.push(await falar(item, { interromper: false, lembrar: false }));
  }
  return resultados;
}

/** Repete a última fala. Não conta como tentativa em nenhuma atividade. */
export function repetir() {
  if (!ultimoDito) return Promise.resolve('sem-fala');
  return Array.isArray(ultimoDito) ? falarSequencia(ultimoDito) : falar(ultimoDito);
}

/** Cala tudo: gravação tocando, fala sintetizada e fila pendente. */
export function parar() {
  geracao += 1;
  const env = ambiente();
  try {
    env.sintese?.cancel?.();
  } catch {
    /* alguns navegadores reclamam se nada estiver falando */
  }
  if (audioAtual) {
    try {
      audioAtual.pause?.();
      if (typeof audioAtual.currentTime === 'number') audioAtual.currentTime = 0;
    } catch {
      /* idem */
    }
    audioAtual = null;
  }
}

/** Esquece a última fala guardada. Usado ao sair da atividade. */
export function limpar() {
  parar();
  ultimoDito = null;
}
