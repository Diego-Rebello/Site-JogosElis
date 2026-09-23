import { describe, expect, it } from 'vitest';
import { criarRenderizador } from '../rael/corrida-3d/renderizador.js';
import { criarCena, projetarPonto } from '../rael/corrida-3d/projecao.js';
import { criarCorrida, avancarCorrida, CARRO } from '../rael/grande-premio/jogo.js';
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
    'stroke', 'fillRect', 'strokeRect', 'rect', 'clip', 'arc', 'fillText', 'strokeText'];
  const metodosCtx = Object.fromEntries(metodos.map(nome => [nome, (...args) => {
    for (const arg of args) if (typeof arg === 'number' && !Number.isFinite(arg)) throw new Error(`${nome}: ${arg}`);
    if (['fillRect', 'strokeRect', 'rect'].includes(nome) && (args[2] < 0 || args[3] < 0)) throw new Error('Dimensão negativa');
    if (nome === 'arc' && args[2] < 0) throw new Error('Raio negativo');
    chamadas.push([nome, ...args]);
  }]));
  metodosCtx.save = () => { profundidade++; };
  metodosCtx.restore = () => { if (--profundidade < 0) throw new Error('restore sem save'); };
  const ctx = new Proxy(metodosCtx, {
    set(alvo, chave, valor) {
      if (chave === 'globalAlpha' && (!Number.isFinite(valor) || valor < 0 || valor > 1)) throw new Error(`Alpha inválido: ${valor}`);
      if (chave === 'lineWidth' && (!Number.isFinite(valor) || valor <= 0)) throw new Error('Traço inválido');
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
          const cena = congelar(criarCena(estado, { qualidade }));
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
      });
    }
  }

  it.each(['padrao', 'economica'])('resize %s não acumula escala; destruir impede desenho posterior', qualidade => {
    const { canvas, chamadas } = canvasInstrumentado();
    const renderizador = criarRenderizador(canvas, { qualidade });
    for (const dpr of [3, 1, 2, NaN, 0, 1.25, 2]) renderizador.redimensionar(dpr);
    const limite = qualidade === 'economica' ? 1 : 1.5;
    expect(canvas.width).toBe(400 * limite);
    expect(canvas.height).toBe(700 * limite);
    expect(chamadas.at(-1)).toEqual(['setTransform', limite, 0, 0, limite, 0, 0]);
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

describe('Corrida 3D — curva decorativa e marcas', () => {
  it('curva aplica o smoothstep fechado a chão e objetos, sem deslocar a zona de contato', () => {
    const estado = estadoVisual(4, -70);
    const antes = structuredClone(estado);
    const reta = criarCena(estado, { movimentoReduzido: true });
    const curva = criarCena(estado);
    for (const d of [-200, 0, 150, 300, 450, 600, 900, 3500]) {
      const p = { x: 120, y: estado.carro.y - d };
      const a = projetarPonto(p, reta.camera);
      const b = projetarPonto(p, curva.camera);
      const t = Math.max(0, Math.min(1, (d - 300) / 600));
      expect(b.x - a.x).toBeCloseTo(18 * t * t * (3 - 2 * t) * a.escala);
      expect(b.y).toBe(a.y);
      if (d <= 300) expect(b).toEqual(a);
    }
    const rival = curva.objetos.find(o => o.tipo === 'rival');
    const logico = estado.rivais.find(r => r.id === rival.id);
    expect(rival.base).toEqual(projetarPonto({ x: logico.x + logico.w / 2, y: logico.y + logico.h }, curva.camera));
    expect(curva.objetos.find(o => o.tipo === 'jogador')).toEqual(reta.objetos.find(o => o.tipo === 'jogador'));
    expect(criarCena(estado, { qualidade: 'economica' }).objetos).toEqual(curva.objetos);
    expect(estado).toEqual(antes);
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
