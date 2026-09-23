import { describe, expect, it } from 'vitest';
import { criarRenderizador } from '../rael/corrida-3d/renderizador.js';
import { ALFA_AO_NASCER, DISTANCIA_DE_ENTRADA, criarCena, projetarPonto } from '../rael/corrida-3d/projecao.js';
import {
  criarCorrida, avancarCorrida, CARRO, Y_NASCIMENTO_POSTO, Y_NASCIMENTO_RIVAL,
} from '../rael/grande-premio/jogo.js';
import { centroDaFaixa } from '../rael/corrida-do-rael/jogo.js';

function congelar(objeto) {
  if (objeto && typeof objeto === 'object') {
    Object.values(objeto).forEach(congelar);
    Object.freeze(objeto);
  }
  return objeto;
}

// Contexto estrito: toda chamada real do renderizador passa por estas guardas.
// Detecta argumentos inválidos, alpha fora de [0,1] e pilha Canvas desequilibrada.
function canvasInstrumentado() {
  const chamadas = [];
  let profundidade = 0;
  const metodos = ['setTransform', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'fill',
    'stroke', 'fillRect', 'strokeRect', 'rect', 'clip', 'arc', 'fillText', 'strokeText',
    'ellipse', 'translate', 'rotate'];
  const metodosCtx = Object.fromEntries(metodos.map(nome => [nome, (...args) => {
    for (const arg of args) if (typeof arg === 'number' && !Number.isFinite(arg)) throw new Error(`${nome}: ${arg}`);
    if (['fillRect', 'strokeRect', 'rect'].includes(nome) && (args[2] < 0 || args[3] < 0)) throw new Error('Dimensão negativa');
    if (nome === 'arc' && args[2] < 0) throw new Error('Raio negativo');
    if (nome === 'ellipse' && (args[2] < 0 || args[3] < 0)) throw new Error('Raio negativo');
    chamadas.push([nome, ...args]);
  }]));
  metodosCtx.createLinearGradient = (...args) => {
    for (const arg of args) if (!Number.isFinite(arg)) throw new Error(`createLinearGradient: ${arg}`);
    chamadas.push(['createLinearGradient', ...args]);
    return { addColorStop: (posicao) => { if (!(posicao >= 0 && posicao <= 1)) throw new Error('Parada inválida'); } };
  };
  metodosCtx.save = () => { profundidade++; };
  metodosCtx.restore = () => { if (--profundidade < 0) throw new Error('restore sem save'); };
  const ctx = new Proxy(metodosCtx, {
    set(alvo, chave, valor) {
      if (chave === 'globalAlpha' && (!Number.isFinite(valor) || valor < 0 || valor > 1)) throw new Error(`Alpha inválido: ${valor}`);
      if (chave === 'lineWidth' && (!Number.isFinite(valor) || valor <= 0)) throw new Error('Traço inválido');
      if (chave === 'fillStyle') chamadas.push(['fillStyle', valor]);
      alvo[chave] = valor;
      return true;
    },
  });
  const canvas = { width: 400, height: 700, getContext: () => ctx };
  return { canvas, ctx, chamadas, profundidade: () => profundidade };
}

function estadoVisual(faixas, y) {
  const estado = criarCorrida({ faixas });
  estado.distancia = 600;
  estado.rivais = Array.from({ length: faixas - 1 }, (_, faixa) => ({
    ...CARRO, x: centroDaFaixa(faixa, estado.geometria) - CARRO.w / 2, y,
    id: faixa + 1, faixa, alfa: 0.6, saindo: false, contado: false,
    velocidade: 85.5, cor: '#ef4444', comAjuda: true,
  }));
  estado.posto = { x: centroDaFaixa(faixas - 1, estado.geometria) - 24, y, w: 48, h: 58, ajuda: true };
  estado.linhaDeChegada = { y: 580 };
  return estado;
}

describe('Corrida 3D — renderizador Canvas', () => {
  for (const faixas of [2, 3, 4]) {
    for (const qualidade of ['padrao', 'economica']) {
      it(`${faixas} faixas/${qualidade}: desenha nascimento, contato e saída sem mutar dados`, () => {
        const instrumento = canvasInstrumentado();
        const renderizador = criarRenderizador(instrumento.canvas, { qualidade });
        for (const y of [-400, -70, 300, 528, 580, 645, 720]) {
          const estado = congelar(estadoVisual(faixas, y));
          const antes = JSON.stringify(estado);
          const cena = congelar(criarCena(estado, { qualidade, hitboxes: true }));
          const cenaAntes = JSON.stringify(cena);
          for (const reduzido of [false, true]) {
            const apresentacao = congelar({
              imune: true, tempo: 0.2, movimentoReduzido: reduzido, hitboxes: true,
              seta: { de: projetarPonto({ x: 180, y: 510 }, cena.camera), para: projetarPonto({ x: 90, y: 510 }, cena.camera) },
              efeitos: [
                { tipo: 'mais-um', ponto: cena.objetos[0].base, idade: 0.3 },
                { tipo: 'fumaca', ponto: cena.objetos[0].base, idade: 0.4 },
              ],
            });
            renderizador.desenhar(cena, apresentacao);
            expect(instrumento.profundidade()).toBe(0);
            expect(JSON.stringify(cena)).toBe(cenaAntes);
            expect(JSON.stringify(estado)).toBe(antes);
          }
        }
        expect(instrumento.chamadas.some(c => c[0] === 'fillText' && c[1] === '+1')).toBe(true);
        expect(instrumento.chamadas.some(c => c[0] === 'arc')).toBe(true);
        expect(instrumento.chamadas.some(c => c[0] === 'createLinearGradient')).toBe(true);
      });
    }
  }

  it.each([2, 3, 4])('difícil com %i faixas: óleo, pisca-pisca e derrapagem sem mutar dados', faixas => {
    const instrumento = canvasInstrumentado();
    const renderizador = criarRenderizador(instrumento.canvas);
    for (const y of [-400, -60, 200, 540, 690]) {
      for (const fase of ['sinalizando', 'mudando']) {
        const estado = criarCorrida({ faixas, dificuldade: 'dificil' });
        const para = 1;
        estado.rivais = [{
          ...CARRO, x: centroDaFaixa(0, estado.geometria) - CARRO.w / 2, y, id: 1,
          faixa: fase === 'mudando' ? para : 0, ...(fase === 'mudando' ? { faixaAnterior: 0 } : {}),
          alfa: 1, saindo: false, contado: false, velocidade: 99, cor: '#22c55e', comAjuda: false,
          troca: { para, gatilho: 0, fase, tempo: 0.3 },
        }];
        estado.oleo = { faixa: faixas - 1, x: centroDaFaixa(faixas - 1, estado.geometria) - 25, y, w: 50, h: 34, usado: y > 500 };
        estado.derrapagem = { tempo: 0.2, lado: 1, alvoX: estado.carro.x + 50 };
        congelar(estado);
        const antes = JSON.stringify(estado);
        const cena = congelar(criarCena(estado, { hitboxes: true }));
        const rival = cena.objetos.find(o => o.tipo === 'rival');
        if (rival) expect(rival.sinal).toBe(1);
        expect(cena.objetos.find(o => o.tipo === 'jogador').derrapando).toBe(1);
        for (const movimentoReduzido of [false, true]) {
          for (const tempo of [0.1, 0.3]) {
            renderizador.desenhar(cena, congelar({ tempo, movimentoReduzido, hitboxes: true, efeitos: [] }));
            expect(instrumento.profundidade()).toBe(0);
          }
        }
        expect(JSON.stringify(estado)).toBe(antes);
      }
    }
    // A cor da poça prova o óleo; elipse sozinha também vem do halo da derrapagem.
    expect(instrumento.chamadas.some(c => c[0] === 'fillStyle' && c[1] === '#0b0b12')).toBe(true);
    expect(instrumento.chamadas.some(c => c[0] === 'fillStyle' && c[1] === '#f59e0b')).toBe(true);
    // O balanço da derrapagem só existe sem movimento reduzido.
    expect(instrumento.chamadas.some(c => c[0] === 'rotate')).toBe(true);
    const reduzido = canvasInstrumentado();
    const estado = criarCorrida({ faixas, dificuldade: 'dificil' });
    estado.derrapagem = { tempo: 0.2, lado: -1, alvoX: estado.carro.x - 50 };
    criarRenderizador(reduzido.canvas).desenhar(criarCena(estado), { tempo: 0.1, movimentoReduzido: true, efeitos: [] });
    expect(reduzido.chamadas.some(c => c[0] === 'rotate')).toBe(false);
  });

  it('halo no chão: âmbar no escudo, lilás no óleo, os dois juntos e antes dos carros', () => {
    const ESCUDO = 'rgba(251, 191, 36, 0.35)';
    const OLEO = 'rgba(167, 139, 250, 0.35)';
    const desenhar = ({ imune, derrapando, movimentoReduzido = false }) => {
      const instrumento = canvasInstrumentado();
      const estado = estadoVisual(3, 300);
      if (derrapando) estado.derrapagem = { tempo: 0.2, lado: 1, alvoX: estado.carro.x + 50 };
      criarRenderizador(instrumento.canvas).desenhar(criarCena(estado), { imune, tempo: 0.3, movimentoReduzido, efeitos: [] });
      const { chamadas } = instrumento;
      const halos = chamadas.flatMap((c, i) => (c[0] === 'fillStyle' && [ESCUDO, OLEO].includes(c[1])
        ? [{ cor: c[1], i, raio: chamadas.slice(0, i).findLast(e => e[0] === 'ellipse')[3] }] : []));
      const primeiroCarro = chamadas.findIndex(c => c[0] === 'fillStyle' && ['#ef4444', '#0f5aa8'].includes(c[1]));
      return { halos, primeiroCarro };
    };
    expect(desenhar({ imune: false, derrapando: false }).halos).toEqual([]);
    for (const movimentoReduzido of [false, true]) {
      expect(desenhar({ imune: true, derrapando: false, movimentoReduzido }).halos.map(h => h.cor)).toEqual([ESCUDO]);
    }
    expect(desenhar({ imune: false, derrapando: true }).halos.map(h => h.cor)).toEqual([OLEO]);
    const { halos, primeiroCarro } = desenhar({ imune: true, derrapando: true });
    expect(halos.map(h => h.cor)).toEqual([ESCUDO, OLEO]);
    // O escudo fica por fora para não sumir sob o anel do óleo.
    expect(halos[0].raio).toBeGreaterThan(halos[1].raio);
    // Camada de chão: nenhum carro, nem o rival da frente, fica embaixo do halo.
    expect(halos.at(-1).i).toBeLessThan(primeiroCarro);
  });

  it.each(['padrao', 'economica'])('resize %s não acumula escala; destruir impede desenho posterior', qualidade => {
    const { canvas, chamadas } = canvasInstrumentado();
    const renderizador = criarRenderizador(canvas, { qualidade });
    for (const dpr of [3, 1, 2, NaN, 0, 1.25, 2]) renderizador.redimensionar(dpr);
    const limite = qualidade === 'economica' ? 1 : 1.5;
    expect(canvas.width).toBe(400 * limite);
    // Só a vista de y = 120 a 700 vai para o backing store; a escala continua absoluta.
    expect(canvas.height).toBe(580 * limite);
    expect(chamadas.at(-1)).toEqual(['setTransform', limite, 0, 0, limite, 0, -120 * limite]);
    expect(chamadas.filter(c => c[0] === 'setTransform').map(c => c[1])).toEqual(
      qualidade === 'economica' ? [1,1,1,1,1,1,1,1] : [1,1.5,1,1.5,1,1,1.25,1.5],
    );
    const antes = chamadas.length;
    renderizador.destruir();
    renderizador.redimensionar(2);
    renderizador.desenhar(criarCena(criarCorrida()));
    expect(chamadas).toHaveLength(antes);
  });

  it('restaura o contexto mesmo se uma operação Canvas falhar', () => {
    const instrumento = canvasInstrumentado();
    const renderizador = criarRenderizador(instrumento.canvas);
    instrumento.ctx.strokeRect = () => { throw new Error('Canvas indisponível'); };
    expect(() => renderizador.desenhar(criarCena(estadoVisual(3, 500)))).toThrow('Canvas indisponível');
    expect(instrumento.profundidade()).toBe(0);
  });

  it('movimento reduzido mantém +1 fixo e não desenha fumaça', () => {
    const { canvas, chamadas } = canvasInstrumentado();
    const renderizador = criarRenderizador(canvas);
    const cena = criarCena(criarCorrida(), { movimentoReduzido: true });
    for (const idade of [0, 0.5]) renderizador.desenhar(cena, {
      movimentoReduzido: true, imune: true,
      efeitos: ['mais-um', 'fumaca'].map(tipo => ({ tipo, idade, ponto: { x: 200, y: 580, escala: 1 } })),
    });
    expect(chamadas.filter(c => c[0] === 'arc')).toHaveLength(0);
    expect(chamadas.filter(c => c[0] === 'fillText')).toEqual([
      ['fillText', '+1', 200, 560], ['fillText', '+1', 200, 560],
    ]);
  });

  it.each([2, 3, 4])('desenhos, resize e perfis não alteram o próximo passo do motor (%i faixas)', faixas => {
    const comDesenho = estadoVisual(faixas, 528);
    const semDesenho = structuredClone(comDesenho);
    const instrumento = canvasInstrumentado();
    for (const qualidade of ['padrao', 'economica']) {
      const renderer = criarRenderizador(instrumento.canvas, { qualidade });
      for (const dpr of [1, 2, 1.25]) {
        renderer.redimensionar(dpr);
        renderer.desenhar(criarCena(comDesenho, { qualidade }));
        renderer.desenhar(criarCena(comDesenho, { qualidade, movimentoReduzido: true }));
      }
    }
    expect(comDesenho).toEqual(semDesenho);
    const passo = { dt: 0.05, direcao: 1 };
    const sorteador = { sortear: () => 0.4 };
    expect(avancarCorrida(comDesenho, passo, sorteador)).toEqual(avancarCorrida(semDesenho, passo, sorteador));
    expect(comDesenho).toEqual(semDesenho);
  });
});

describe('Corrida 3D — pista reta, névoa, entrada dos rivais e marcas', () => {
  it('projetarPonto ainda aplica o smoothstep fechado quando uma câmera traz curva', () => {
    const reta = criarCena(estadoVisual(4, -70)).camera;
    const curva = { ...reta, curva: 18 };
    for (const d of [-200, 0, 150, 300, 450, 600, 900, 3500]) {
      const p = { x: 120, y: 580 - d };
      const a = projetarPonto(p, reta);
      const b = projetarPonto(p, curva);
      const t = Math.max(0, Math.min(1, (d - 300) / 600));
      expect(b.x - a.x).toBeCloseTo(18 * t * t * (3 - 2 * t) * a.escala);
      expect(b.y).toBe(a.y);
      if (d <= 300) expect(b).toEqual(a);
    }
    expect(projetarPonto({ x: 120, y: -1000 }, { ...curva, movimentoReduzido: true }))
      .toEqual(projetarPonto({ x: 120, y: -1000 }, reta));
  });

  it('a cena usa pista reta em qualquer distância, igual com ou sem movimento reduzido', () => {
    const estado = estadoVisual(4, -70);
    const antes = structuredClone(estado);
    for (const distancia of [0, 600, 1234.5, 5000]) {
      estado.distancia = distancia;
      const normal = criarCena(estado);
      const reduzido = criarCena(estado, { movimentoReduzido: true });
      expect(normal.camera.curva).toBe(0);
      expect(normal.objetos).toEqual(reduzido.objetos);
      normal.segmentos.forEach((segmento, i) => expect(segmento.poligono).toEqual(reduzido.segmentos[i].poligono));
      expect(criarCena(estado, { qualidade: 'economica' }).objetos).toEqual(normal.objetos);
    }
    estado.distancia = antes.distancia;
    expect(estado).toEqual(antes);
  });

  it('rival e posto nascem visíveis e ficam opacos em DISTANCIA_DE_ENTRADA; jogador não muda', () => {
    const estado = criarCorrida();
    const alfaDe = (tipo, y, alfa = 1) => {
      estado.rivais = tipo === 'rival' ? [{ ...CARRO, x: 100, y, id: 1, faixa: 0, alfa, cor: '#ef4444' }] : [];
      estado.posto = tipo === 'posto' ? { x: 100, y, w: 48, h: 58, faixa: 0 } : null;
      return criarCena(estado).objetos.find(o => o.tipo === tipo).alfa;
    };
    for (const [tipo, nascimento] of [['rival', Y_NASCIMENTO_RIVAL], ['posto', Y_NASCIMENTO_POSTO]]) {
      expect(alfaDe(tipo, nascimento)).toBeCloseTo(ALFA_AO_NASCER);
      expect(alfaDe(tipo, nascimento + DISTANCIA_DE_ENTRADA / 2)).toBeCloseTo((1 + ALFA_AO_NASCER) / 2);
      expect(alfaDe(tipo, nascimento + DISTANCIA_DE_ENTRADA)).toBe(1);
      expect(alfaDe(tipo, 300)).toBe(1);
    }
    // A saída do motor (alfa decrescente de rival batido) continua valendo por inteiro.
    expect(alfaDe('rival', 300, 0.4)).toBeCloseTo(0.4);
    expect(alfaDe('rival', Y_NASCIMENTO_RIVAL, 0.5)).toBeCloseTo(0.5 * ALFA_AO_NASCER);
    expect(criarCena(estado).objetos.find(o => o.tipo === 'jogador').alfa).toBe(1);
  });

  it('névoa cobre a estrada vazia e termina antes de rival, posto e chegada que acabam de nascer', () => {
    const estado = estadoVisual(3, Y_NASCIMENTO_RIVAL);
    estado.posto = { x: 300, y: Y_NASCIMENTO_POSTO, w: 48, h: 58, faixa: 2 };
    estado.linhaDeChegada = { y: -40 };
    const cena = criarCena(estado);
    const { horizonte, nevoa } = cena.camera;
    // A névoa cobre só a estrada além do nascimento: rival, posto e chegada surgem
    // logo abaixo dela, no fundo da estrada, e não no meio da tela.
    expect(nevoa).toBeGreaterThan(horizonte + 20);
    for (const objeto of cena.objetos.filter(o => o.tipo !== 'jogador')) expect(objeto.base.y).toBeLessThan(nevoa + 100);
    for (const objeto of cena.objetos.filter(o => o.tipo !== 'jogador')) {
      expect(objeto.base.y - (objeto.tipo === 'posto' ? 48 * objeto.escala : objeto.alturaCarroceria)).toBeGreaterThan(nevoa - 6);
      expect(Math.min(...objeto.pegada.map(p => p.y))).toBeGreaterThan(nevoa);
    }
    for (const ladrilho of cena.linhaDeChegada.ladrilhos) {
      for (const p of ladrilho.poligono) expect(p.y).toBeGreaterThan(nevoa);
    }
  });

  it('hitboxes só são calculadas quando a depuração pede', () => {
    const estado = estadoVisual(3, 300);
    expect(criarCena(estado).objetos.every(o => o.hitboxes === null)).toBe(true);
    const comDepuracao = criarCena(estado, { hitboxes: true });
    expect(comDepuracao.objetos.find(o => o.tipo === 'jogador').hitboxes.colisao).toHaveLength(4);
    expect(comDepuracao.objetos.find(o => o.tipo === 'posto').hitboxes.coleta).toHaveLength(4);
  });

  it('marca de faixa desce continuamente com a distância, inclusive na virada do ciclo', () => {
    const estado = criarCorrida();
    const marcas = distancia => {
      estado.distancia = distancia;
      return criarCena(estado, { movimentoReduzido: true }).marcas.filter(m => m.cor === '#f8fafc');
    };
    const a = marcas(99.99);
    const b = marcas(100.01);
    // A marca do mundo 200..255 permanece no mesmo lugar da lista; sua borda
    // aproxima-se suavemente, ao contrário de ligar/desligar um segmento inteiro.
    const camera = criarCena(estado).camera;
    const yAntes = projetarPonto({ x: 200, y: 580 - (255 - 99.99) }, camera).y;
    const yDepois = projetarPonto({ x: 200, y: 580 - (255 - 100.01) }, camera).y;
    expect(a.some(m => Math.abs(m.poligono[0]?.y - yAntes) < 1e-8)).toBe(true);
    expect(b.some(m => Math.abs(m.poligono[0]?.y - yDepois) < 1e-8)).toBe(true);
    expect(yDepois).toBeGreaterThan(yAntes);
    expect(yDepois - yAntes).toBeLessThan(0.02);
    for (const m of [...a, ...b]) for (const p of m.poligono) {
      expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThanOrEqual(400);
      expect(p.y).toBeGreaterThanOrEqual(170); expect(p.y).toBeLessThanOrEqual(700);
    }
  });
});
