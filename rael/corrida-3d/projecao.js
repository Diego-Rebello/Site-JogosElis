/**
 * Corrida 3D — geometria de apresentação, sem avanço da simulação.
 * Perspectiva adaptada de Util.project e segmentação de Render.segment:
 * https://github.com/jakesgordon/javascript-racer/tree/3e8a060b5900755db27f899612a74a77427c853e
 * Copyright (c) 2012, 2013, 2014, 2015, 2016 Jake Gordon and contributors.
 * MIT — cópia integral em LICENSE-javascript-racer.txt. Sem assets externos.
 * Motor importado do Grande Prêmio, derivado de Pixel Racer:
 * Copyright (c) 2026 Tarek Elomami — MIT, LICENSE-pixel-racer.txt.
 */
import {
  ALTURA_CANVAS, LARGURA_CANVAS, MARGEM_COLISAO, MARGEM_OLEO,
  Y_NASCIMENTO_OLEO, Y_NASCIMENTO_POSTO, Y_NASCIMENTO_RIVAL,
} from '../grande-premio/jogo.js';

export const ALTURA_CARROCERIA = 34;
// O motor usa literalmente 4 na coleta; não exporta uma constante para essa margem.
const MARGEM_COLETA = 4;
export const PROFUNDIDADE = 700;
/**
 * Até JUNCAO_DISTANTE à frente do carro a perspectiva é a física (700 / (700 + d)):
 * contato, colisão e ultrapassagem ficam iguais. Além dela a escala cai em linha reta,
 * com a mesma inclinação na junção, até ESCALA_DA_CAUDA (dentro da névoa); dali em diante
 * decai de forma exponencial, também sem quebra, e nunca chega a zero.
 * Assim o rival nasce pequeno perto do fim visível da estrada (y ≈ 279) em vez de
 * surgir no meio da tela (y ≈ 393), e a velocidade aparente nunca diminui ao se aproximar.
 */
export const JUNCAO_DISTANTE = 50;
export const ESCALA_DA_CAUDA = 0.06;
const DISTANCIA_PROXIMA = -200;
export const DISTANCIA_DISTANTE = 1200;
// Rival e posto nascem já visíveis (alfa mínimo) e ficam opacos nestes px lógicos,
// cerca de 0,2 s: suaviza o surgimento no meio da estrada sem atrasar o contorno.
export const DISTANCIA_DE_ENTRADA = 25;
export const ALFA_AO_NASCER = 0.45;
// A névoa cobre a estrada vazia além do ponto de nascimento; termina um pouco antes dele.
const FOLGA_DA_NEVOA = 80;

/**
 * Câmera criada por criarCena. A cena usa pista reta (curva 0); a curva suave
 * além dos 300 px de contato continua disponível aqui para uma versão futura.
 * Preserva subpixels: arredondar aqui causaria saltos durante trocas de faixa.
 * null significa recorte no plano próximo (z <= 100) ou entrada não finita.
 */
export function projetarPonto({ x, y }, camera) {
  const d = camera.referencia - y;
  const z = camera.profundidade + d;
  if (!Number.isFinite(x) || !Number.isFinite(z) || z <= camera.recorte) return null;
  const escala = escalaNaDistancia(d, camera);
  if (escala === null) return null;
  const t = Math.max(0, Math.min(1, (d - 300) / 600));
  const curva = camera.movimentoReduzido ? 0 : (camera.curva ?? 0) * t * t * (3 - 2 * t);
  const telaX = camera.centro + (x - camera.centro + curva) * escala;
  const telaY = camera.horizonte + (camera.referencia - camera.horizonte) * escala;
  if (![telaX, telaY, escala].every(Number.isFinite)) return null;
  return { x: telaX, y: telaY, escala };
}

/** Sem `juncao` na câmera, perspectiva física pura; com ela, a cauda descrita acima. */
function escalaNaDistancia(d, camera) {
  const { profundidade, juncao } = camera;
  if (!Number.isFinite(juncao) || d <= juncao) return profundidade / (profundidade + d);
  const naJuncao = profundidade / (profundidade + juncao);
  const inclinacao = naJuncao / (profundidade + juncao);
  const linear = naJuncao - inclinacao * (d - juncao);
  if (linear >= ESCALA_DA_CAUDA) return linear;
  const inicioDaCauda = juncao + (naJuncao - ESCALA_DA_CAUDA) / inclinacao;
  return ESCALA_DA_CAUDA * Math.exp(-(d - inicioDaCauda) * inclinacao / ESCALA_DA_CAUDA);
}

/** Cantos em ordem: dianteiro esquerdo, dianteiro direito, traseiro direito, traseiro esquerdo. */
function projetarRetangulo({ x, y, w, h }, camera, margem = 0) {
  if (![x, y, w, h].every(Number.isFinite) || w < 2 * margem || h < 2 * margem) return null;
  const pontos = [
    { x: x + margem, y: y + margem },
    { x: x + w - margem, y: y + margem },
    { x: x + w - margem, y: y + h - margem },
    { x: x + margem, y: y + h - margem },
  ].map(ponto => projetarPonto(ponto, camera));
  return pontos.every(Boolean) ? pontos : null;
}

/**
 * Pegada no chão. Na cauda distante a escala cai em linha reta e o comprimento na tela
 * deixaria de encolher: um carro longe viraria um traço comprido. Ali a frente fica a
 * h × (referência − horizonte) / profundidade × escala² da traseira, como na perspectiva
 * física; na junção o valor coincide com a projeção exata, sem salto.
 */
function projetarPegada(retangulo, camera, margem = 0) {
  const exata = projetarRetangulo(retangulo, camera, margem);
  if (!exata || !Number.isFinite(camera.juncao)) return exata;
  const traseira = camera.referencia - (retangulo.y + retangulo.h - margem);
  if (traseira <= camera.juncao) return exata;
  const [, , td, te] = exata;
  const s = td.escala;
  const comprimento = (retangulo.h - 2 * margem) * (camera.referencia - camera.horizonte) / camera.profundidade * s * s;
  const escalaFrente = s * (1 - (retangulo.h - 2 * margem) * s / camera.profundidade);
  const frente = x => camera.centro + (x - camera.centro) * escalaFrente;
  const y = td.y - comprimento;
  return [
    { x: frente(retangulo.x + margem), y, escala: escalaFrente },
    { x: frente(retangulo.x + retangulo.w - margem), y, escala: escalaFrente },
    td,
    te,
  ];
}

/**
 * A base é o centro traseiro no chão. h é comprimento lógico, não altura do sprite.
 * Objetos que interceptam o plano próximo são omitidos inteiros; esse plano fica além
 * da região em que o motor mantém rivais/postos. Não recortar pegadas ao viewport:
 * elas ainda servem de âncora para a carroceria quando a base sai pela borda inferior.
 */
export function projetarObjeto(objeto, camera) {
  const pegada = projetarPegada(objeto, camera);
  if (!pegada) return null;
  const base = projetarPonto({ x: objeto.x + objeto.w / 2, y: objeto.y + objeto.h }, camera);
  if (!base) return null;
  return {
    base,
    pegada,
    escala: base.escala,
    largura: pegada[2].x - pegada[3].x,
    alturaCarroceria: ALTURA_CARROCERIA * base.escala,
    centroLongitudinal: objeto.y + objeto.h / 2,
  };
}

/** Recorte de polígonos convexos no viewport lógico, independente de Canvas. */
function recortarPoligono(pontos) {
  let resultado = pontos.map(({ x, y }) => ({ x, y }));
  for (const [eixo, limite, sentido] of [
    ['x', 0, 1], ['x', LARGURA_CANVAS, -1],
    ['y', 0, 1], ['y', ALTURA_CANVAS, -1],
  ]) {
    const entrada = resultado;
    resultado = [];
    for (let i = 0; i < entrada.length; i++) {
      const a = entrada[i];
      const b = entrada[(i + 1) % entrada.length];
      const dentroA = (a[eixo] - limite) * sentido >= 0;
      const dentroB = (b[eixo] - limite) * sentido >= 0;
      if (dentroA) resultado.push(a);
      if (dentroA !== dentroB) {
        const t = (limite - a[eixo]) / (b[eixo] - a[eixo]);
        resultado.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, [eixo]: limite });
      }
    }
  }
  return resultado;
}

function criarSegmentos(estado, camera, quantidade) {
  const { inicio, fim } = estado.geometria;
  const comprimento = (DISTANCIA_DISTANTE - DISTANCIA_PROXIMA) / quantidade;
  return Array.from({ length: quantidade }, (_, indice) => {
    // Distante → próximo, como os objetos. A malha é fixa; marcas/zebras usam a
    // coordenada do mundo (d + distancia), contínua mesmo quando o carro desacelera.
    const dPerto = DISTANCIA_PROXIMA + (quantidade - indice - 1) * comprimento;
    const dLonge = dPerto + comprimento;
    const y = camera.referencia - dLonge;
    const retangulo = { x: inicio, y, w: fim - inicio, h: comprimento };
    return {
      dPerto,
      dLonge,
      mundoPerto: dPerto + estado.distancia,
      mundoLonge: dLonge + estado.distancia,
      poligono: recortarPoligono(projetarRetangulo(retangulo, camera)),
    };
  });
}

/** Marcas presas ao mundo: as extremidades se deslocam continuamente, sem trocar
 * a cor de um segmento fixo inteiro quando a distância cruza um múltiplo. */
function criarMarcas(estado, camera, quantidade) {
  const { inicio, fim, larguraFaixa } = estado.geometria;
  const marcas = [];
  const adicionar = (x, w, dPerto, dLonge, cor) => {
    const pegada = projetarRetangulo({ x, w, y: camera.referencia - dLonge, h: dLonge - dPerto }, camera);
    if (pegada) marcas.push({ cor, poligono: recortarPoligono(pegada) });
  };
  const passo = (DISTANCIA_DISTANTE - DISTANCIA_PROXIMA) / quantidade;
  for (let i = 0; i < quantidade; i++) {
    const perto = DISTANCIA_PROXIMA + i * passo;
    for (const x of [inicio - 3, fim]) adicionar(x, 3, perto, perto + passo, '#ffffff');
  }
  for (let mundo = Math.floor((estado.distancia + DISTANCIA_PROXIMA) / 40) * 40;
    mundo < estado.distancia + DISTANCIA_DISTANTE; mundo += 40) {
    const perto = Math.max(DISTANCIA_PROXIMA, mundo - estado.distancia);
    const longe = Math.min(DISTANCIA_DISTANTE, mundo + 40 - estado.distancia);
    const cor = Math.abs(Math.round(mundo / 40)) % 2 ? '#ffffff' : '#dc2626';
    for (const x of [inicio - 13, fim + 3]) adicionar(x, 10, perto, longe, cor);
  }
  for (let mundo = Math.floor((estado.distancia + DISTANCIA_PROXIMA) / 100) * 100;
    mundo < estado.distancia + DISTANCIA_DISTANTE; mundo += 100) {
    const perto = Math.max(DISTANCIA_PROXIMA, mundo - estado.distancia);
    const longe = Math.min(DISTANCIA_DISTANTE, mundo + 55 - estado.distancia);
    if (longe <= perto) continue;
    for (let faixa = 1; faixa < estado.faixas; faixa++) {
      adicionar(inicio + faixa * larguraFaixa - 2, 4, perto, longe, '#f8fafc');
    }
  }
  return marcas;
}

/** 0 no nascimento → 1 depois de DISTANCIA_DE_ENTRADA; jogador sempre 1. */
function entrada(objeto, tipo) {
  const nascimento = { rival: Y_NASCIMENTO_RIVAL, posto: Y_NASCIMENTO_POSTO, oleo: Y_NASCIMENTO_OLEO }[tipo] ?? null;
  if (nascimento === null) return 1;
  return Math.max(0, Math.min(1, (objeto.y - nascimento) / DISTANCIA_DE_ENTRADA));
}

function objetoDaCena(objeto, tipo, id, camera, comHitboxes) {
  const projecao = projetarObjeto(objeto, camera);
  if (!projecao) return null;
  const alfaDoMotor = objeto.alfa ?? 1;
  return {
    ...projecao,
    tipo,
    id,
    faixa: objeto.faixa ?? null,
    cor: tipo === 'jogador' ? '#0f5aa8' : objeto.cor ?? null,
    alfa: alfaDoMotor * (ALFA_AO_NASCER + (1 - ALFA_AO_NASCER) * entrada(objeto, tipo)),
    saindo: objeto.saindo ?? false,
    contado: objeto.contado ?? false,
    comAjuda: objeto.comAjuda ?? objeto.ajuda ?? false,
    // Pisca-pisca do rival que vai trocar ou está trocando de faixa: -1 esquerda, 1 direita.
    sinal: sinalDaTroca(objeto),
    // Só para a depuração em desenvolvimento; fora dela não custa nada por quadro.
    // O jogador tem duas pegadas porque colisão e coleta usam margens diferentes.
    hitboxes: comHitboxes ? {
      colisao: tipo === 'posto' ? null : projetarPegada(objeto, camera, MARGEM_COLISAO),
      coleta: tipo === 'rival' ? null : projetarPegada(objeto, camera, MARGEM_COLETA),
    } : null,
  };
}

function sinalDaTroca(objeto) {
  const { troca } = objeto;
  if (!troca || !['sinalizando', 'mudando'].includes(troca.fase)) return 0;
  const origem = troca.fase === 'mudando' ? objeto.faixaAnterior ?? objeto.faixa : objeto.faixa;
  return Math.sign(troca.para - origem);
}

/**
 * Snapshot visual novo, sem referências mutáveis ao estado do motor.
 * Pista reta: a curva decorativa foi retirada na revisão R04 (quase invisível).
 * qualidade é opção técnica para medição, nunca configuração na tela infantil;
 * hitboxes só é pedido pela depuração em desenvolvimento.
 */
export function criarCena(estado, { movimentoReduzido = false, qualidade = 'padrao', hitboxes = false } = {}) {
  const camera = {
    referencia: estado.carro.y,
    centro: LARGURA_CANVAS / 2,
    horizonte: 170,
    profundidade: PROFUNDIDADE,
    juncao: JUNCAO_DISTANTE,
    recorte: 100,
    movimentoReduzido,
    curva: 0,
  };
  camera.nevoa = projetarPonto({
    x: camera.centro, y: Math.min(Y_NASCIMENTO_RIVAL, Y_NASCIMENTO_POSTO, Y_NASCIMENTO_OLEO) - FOLGA_DA_NEVOA,
  }, camera).y;
  const jogador = objetoDaCena(estado.carro, 'jogador', 'jogador', camera, hitboxes);
  // Derrapagem: -1/1 para o lado do escorregão, 0 sem lado seguro; null fora dela.
  if (jogador) jogador.derrapando = estado.derrapagem ? estado.derrapagem.lado : null;
  const objetos = [jogador];
  for (const rival of estado.rivais) objetos.push(objetoDaCena(rival, 'rival', rival.id, camera, hitboxes));
  if (estado.posto) objetos.push(objetoDaCena(estado.posto, 'posto', 'posto', camera, hitboxes));
  const visiveis = objetos.filter(Boolean);
  visiveis.sort((a, b) => {
    const profundidade = a.centroLongitudinal - b.centroLongitudinal;
    if (profundidade !== 0) return profundidade;
    if (a.tipo !== b.tipo) return a.tipo < b.tipo ? -1 : 1;
    if (a.id === b.id) return 0;
    return a.id < b.id ? -1 : 1;
  });

  let linhaDeChegada = null;
  if (estado.linhaDeChegada) {
    const { y } = estado.linhaDeChegada;
    const inicio = projetarPonto({ x: estado.geometria.inicio, y }, camera);
    const fim = projetarPonto({ x: estado.geometria.fim, y }, camera);
    if (inicio && fim) {
      const ladrilhos = [];
      for (let fileira = 0; fileira < 2; fileira++) {
        for (let coluna = 0; coluna < 20; coluna++) {
          const largura = (estado.geometria.fim - estado.geometria.inicio) / 20;
          const poligono = projetarRetangulo({
            x: estado.geometria.inicio + coluna * largura, w: largura,
            y: y - 24 + fileira * 12, h: 12,
          }, camera);
          if (poligono) ladrilhos.push({ poligono: recortarPoligono(poligono), cor: (coluna + fileira) % 2 ? '#0f172a' : '#ffffff' });
        }
      }
      linhaDeChegada = { inicio, fim, ladrilhos };
    }
  }
  // A mancha de óleo é chão: desenhada sobre a estrada, antes de todos os carros.
  let oleo = null;
  if (estado.oleo) {
    const pegada = projetarPegada(estado.oleo, camera);
    if (pegada) {
      oleo = {
        pegada: recortarPoligono(pegada),
        escala: pegada[3].escala,
        usado: estado.oleo.usado,
        alfa: ALFA_AO_NASCER + (1 - ALFA_AO_NASCER) * entrada(estado.oleo, 'oleo'),
        hitbox: hitboxes ? projetarPegada(estado.oleo, camera, MARGEM_OLEO) : null,
      };
    }
  }
  return {
    camera,
    oleo,
    segmentos: criarSegmentos(estado, camera, qualidade === 'economica' ? 40 : 80),
    marcas: criarMarcas(estado, camera, qualidade === 'economica' ? 40 : 80),
    objetos: visiveis,
    linhaDeChegada,
  };
}
