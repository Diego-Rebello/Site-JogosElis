import { describe, expect, it } from 'vitest';
import { criarCena, projetarObjeto, projetarPonto } from '../rael/corrida-3d/projecao.js';
import {
  CARRO, DT_MAXIMO, MARGEM_COLISAO, avancarCorrida, criarCorrida,
} from '../rael/grande-premio/jogo.js';
import { centroDaFaixa, retangulosSeSobrepoem } from '../rael/corrida-do-rael/jogo.js';

function congelar(valor) {
  if (valor && typeof valor === 'object') {
    Object.values(valor).forEach(congelar);
    Object.freeze(valor);
  }
  return valor;
}

function verificarFinitos(valor) {
  if (typeof valor === 'number') expect(Number.isFinite(valor)).toBe(true);
  else if (valor && typeof valor === 'object') Object.values(valor).forEach(verificarFinitos);
}

function rival(estado, { id = 1, y = -70, faixa = 0, ...extra } = {}) {
  return {
    ...CARRO, id, y, faixa,
    x: centroDaFaixa(faixa, estado.geometria) - CARRO.w / 2,
    velocidade: 85.5, cor: '#ef4444', contado: false, saindo: false,
    alfa: 1, comAjuda: false, ...extra,
  };
}

function sorteador(sementeInicial) {
  let semente = sementeInicial >>> 0;
  return () => {
    semente = (1664525 * semente + 1013904223) >>> 0;
    return semente / 4294967296;
  };
}

// SAT nos quadriláteros de depuração: verifica contato visual sem substituir a
// colisão do motor. As bordas inclinadas também entram na comparação lateral.
function poligonosSobrepostos(a, b) {
  for (const poligono of [a, b]) {
    for (let i = 0; i < poligono.length; i++) {
      const p = poligono[i];
      const q = poligono[(i + 1) % poligono.length];
      const nx = p.y - q.y;
      const ny = q.x - p.x;
      const projA = a.map(v => v.x * nx + v.y * ny);
      const projB = b.map(v => v.x * nx + v.y * ny);
      if (Math.max(...projA) <= Math.min(...projB) || Math.max(...projB) <= Math.min(...projA)) return false;
    }
  }
  return true;
}

describe('Corrida 3D — contrato de projeção (Etapa 2)', () => {
  const camera = criarCena(criarCorrida()).camera;

  it('T01: preserva (x, 580), inclusive posições laterais fracionárias', () => {
    for (const x of [0, 36, 91.25, 200, 364, 400]) {
      expect(projetarPonto({ x, y: 580 }, camera)).toEqual({ x, y: 580, escala: 1 });
    }
    expect(projetarPonto({ x: 300, y: -120 }, camera)).toEqual({ x: 250, y: 375, escala: 0.5 });
  });

  it('T02: aproximação aumenta a largura, altura visual e posição da base', () => {
    const objeto = { x: 178, y: -70, w: 44, h: 64 };
    const longe = projetarObjeto(objeto, camera);
    const perto = projetarObjeto({ ...objeto, y: 500 }, camera);
    expect(perto.largura).toBeGreaterThan(longe.largura);
    expect(perto.alturaCarroceria).toBeGreaterThan(longe.alturaCarroceria);
    expect(perto.base.y).toBeGreaterThan(longe.base.y);
    expect(perto.largura).toBeCloseTo(44 * perto.escala);
    expect(perto.alturaCarroceria).toBeCloseTo(34 * perto.escala);
    expect(perto.base).toEqual(projetarPonto({ x: 200, y: 564 }, camera));
    expect(perto.pegada.map(p => p.y)).toEqual([
      perto.pegada[0].y, perto.pegada[0].y, perto.base.y, perto.base.y,
    ]);
  });

  it.each([2, 3, 4])('T03: centros/bordas ordenados e direção contínua, %i faixas', faixas => {
    const estado = criarCorrida({ faixas });
    const { inicio, fim, larguraFaixa } = estado.geometria;
    for (const y of [-70, 300, 580, 644]) {
      const pontos = Array.from({ length: faixas + 1 }, (_, f) => projetarPonto({ x: inicio + f * larguraFaixa, y }, camera));
      for (let f = 0; f < faixas; f++) {
        const centro = projetarPonto({ x: centroDaFaixa(f, estado.geometria), y }, camera);
        expect(pontos[f].x).toBeLessThan(centro.x);
        expect(centro.x).toBeLessThan(pontos[f + 1].x);
        expect(centro.x).toBeCloseTo((pontos[f].x + pontos[f + 1].x) / 2);
      }
    }
    const xAntes = estado.carro.x;
    avancarCorrida(estado, { dt: 0.0025, direcao: 1 }, { sortear: sorteador(1) });
    expect(criarCena(estado).objetos[0].pegada[0].x).toBeCloseTo(xAntes + 0.75);
    for (const direcao of [-1, 1]) {
      for (let i = 0; i < 30; i++) avancarCorrida(estado, { dt: DT_MAXIMO, direcao }, { sortear: sorteador(1) });
      expect(estado.carro.x).toBe(direcao === -1 ? inicio : fim - CARRO.w);
      const jogador = criarCena(estado).objetos.find(o => o.tipo === 'jogador');
      expect(jogador.pegada[0].x).toBeGreaterThanOrEqual(inicio);
      expect(jogador.pegada[1].x).toBeLessThanOrEqual(fim);
    }
  });

  it('T04: recorta no plano próximo e atrás da câmera; nunca produz NaN/Infinity', () => {
    for (const y of [1180, 1280, 1400, Infinity, NaN]) expect(projetarPonto({ x: 200, y }, camera)).toBeNull();
    expect(projetarPonto({ x: Infinity, y: 580 }, camera)).toBeNull();
    verificarFinitos(projetarPonto({ x: 200, y: 1179.999 }, camera));
    expect(projetarObjeto({ x: 150, y: 1170, w: 44, h: 64 }, camera)).toBeNull();
    expect(projetarObjeto({ x: 150, y: 100, w: -1, h: 64 }, camera)).toBeNull();
    const estado = criarCorrida();
    estado.rivais = [rival(estado, { y: 1400 })];
    estado.linhaDeChegada = { y: 1280 };
    const cena = criarCena(estado);
    expect(cena.objetos.map(o => o.tipo)).toEqual(['jogador']);
    expect(cena.linhaDeChegada).toBeNull();
    verificarFinitos(cena);
  });

  it('T05: nascimento, contato, ultrapassagem e saída são contínuos', () => {
    let anterior = null;
    for (let y = -400; y <= 720; y++) {
      const objeto = projetarObjeto({ x: 60, y, w: 44, h: 64 }, camera);
      expect(objeto).not.toBeNull();
      verificarFinitos(objeto);
      if (anterior) {
        expect(objeto.base.y).toBeGreaterThan(anterior.base.y);
        expect(objeto.escala).toBeGreaterThan(anterior.escala);
        expect(objeto.base.y - anterior.base.y).toBeLessThan(2);
      }
      anterior = objeto;
    }
    expect(anterior.base.y).toBeGreaterThan(700);
    const estado = criarCorrida();
    estado.rivais = [rival(estado, { y: 644.01, contado: true, saindo: true, alfa: 0.4 })];
    const projetado = criarCena(estado).objetos.find(o => o.tipo === 'rival');
    expect(projetado).toMatchObject({ id: 1, contado: true, saindo: true, alfa: 0.4 });
    expect(projetado.pegada[0].y).toBeGreaterThan(projetarPonto({ x: 60, y: 644 }, camera).y);
  });

  it('T06: aceita estado recursivamente congelado e devolve dados independentes', () => {
    const estado = criarCorrida();
    estado.rivais = [rival(estado)];
    estado.posto = { x: 120, y: 200, w: 64, h: 72, faixa: 1, ajuda: true };
    estado.linhaDeChegada = { y: -40 };
    const antes = structuredClone(estado);
    congelar(estado);
    const cena = criarCena(estado);
    expect(cena).toEqual(criarCena(estado));
    cena.objetos[0].base.x = -999;
    cena.objetos[0].pegada[0].x = -999;
    cena.objetos.reverse();
    cena.segmentos[0].poligono[0].x = -999;
    cena.linhaDeChegada.inicio.x = -999;
    expect(estado).toEqual(antes);
    expect(criarCena(estado).objetos[0].base.x).not.toBe(-999);
  });

  for (const faixas of [2, 3, 4]) {
    for (const tipo of ['rival', 'posto']) {
      it(`T07: pegadas e hitboxes de ${tipo} coincidem com contato, ${faixas} faixas`, () => {
        const margem = tipo === 'rival' ? MARGEM_COLISAO : 4;
        const chave = tipo === 'rival' ? 'colisao' : 'coleta';
        for (const eixo of ['x', 'y']) {
          for (const dentro of [false, true]) {
            const estado = criarCorrida({ faixas });
            estado.tempoAteProximoRival = 999;
            const objeto = tipo === 'rival'
              ? rival(estado, { x: estado.carro.x, y: estado.carro.y })
              : { ...estado.carro, w: 54, h: 64, faixa: 0, ajuda: false };
            if (eixo === 'y') objeto.y = estado.carro.y + 2 * margem - objeto.h + (dentro ? 0.01 : -0.01);
            else objeto.x = estado.carro.x + estado.carro.w - 2 * margem + (dentro ? -0.01 : 0.01);
            if (tipo === 'rival') estado.rivais = [objeto];
            else estado.posto = objeto;
            const cena = criarCena(estado, { hitboxes: true });
            const jogador = cena.objetos.find(o => o.tipo === 'jogador');
            const projetado = cena.objetos.find(o => o.tipo === tipo);
            expect(poligonosSobrepostos(jogador.hitboxes[chave], projetado.hitboxes[chave])).toBe(dentro);
            expect(retangulosSeSobrepoem(estado.carro, objeto, margem)).toBe(dentro);
            expect(projetado.pegada).toEqual(projetarObjeto(objeto, cena.camera).pegada);
            const eventos = avancarCorrida(estado, { dt: 0 }, { sortear: sorteador(2) });
            expect(eventos.some(e => e.tipo === (tipo === 'rival' ? 'bateu' : 'abasteceu'))).toBe(dentro);
          }
        }
      });
    }
  }

  it('T08: linha cruza a frente em 580, independentemente da base traseira', () => {
    for (const deslocamento of [-0.01, 0, 0.01]) {
      const estado = criarCorrida();
      estado.fase = 'chegada';
      estado.linhaDeChegada = { y: estado.carro.y + deslocamento };
      const cena = criarCena(estado);
      const jogador = cena.objetos[0];
      const linha = cena.linhaDeChegada;
      expect(linha.inicio.y).toBe(linha.fim.y);
      if (deslocamento === 0) {
        expect(linha.inicio).toEqual({ x: 36, y: 580, escala: 1 });
        expect(linha.fim).toEqual({ x: 364, y: 580, escala: 1 });
        expect(linha.inicio.y).toBe(jogador.pegada[0].y);
        expect(linha.inicio.y).toBeLessThan(jogador.base.y);
      }
      const eventos = avancarCorrida(estado, { dt: 0 }, { sortear: sorteador(3) });
      expect(eventos.some(e => e.tipo === 'bandeirada')).toBe(deslocamento >= 0);
    }
  });

  it('T09: ordena por centro longitudinal/identidade incluindo jogador e posto', () => {
    const estado = criarCorrida();
    estado.rivais = [
      rival(estado, { id: 10, y: 600 }), rival(estado, { id: 3, y: -70 }),
      rival(estado, { id: 2, y: 600 }), rival(estado, { id: 7, y: 581, h: 10 }),
    ];
    estado.posto = { x: 100, y: 300, w: 64, h: 72, faixa: 0 };
    const ordemOriginal = estado.rivais.map(r => r.id);
    const cena = criarCena(estado);
    expect(cena.objetos.map(o => o.id)).toEqual([3, 'posto', 7, 'jogador', 2, 10]);
    expect(estado.rivais.map(r => r.id)).toEqual(ordemOriginal);
    estado.rivais.reverse();
    expect(criarCena(estado).objetos).toEqual(cena.objetos);
  });

  it('segmentos cobrem -200 a 3500, recortam no viewport e mantêm a fase do mundo', () => {
    const estado = criarCorrida({ faixas: 4 });
    const cena = criarCena(estado);
    expect(cena.segmentos).toHaveLength(80);
    expect(cena.segmentos[0].dLonge).toBe(3500);
    expect(cena.segmentos.at(-1).dPerto).toBe(-200);
    for (let i = 0; i < cena.segmentos.length; i++) {
      const segmento = cena.segmentos[i];
      if (i > 0) expect(segmento.dLonge).toBe(cena.segmentos[i - 1].dPerto);
      for (const p of segmento.poligono) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(400);
        expect(p.y).toBeGreaterThanOrEqual(170);
        expect(p.y).toBeLessThanOrEqual(700);
      }
    }
    // Divisórias das 4 faixas (3 linhas) também ficam dentro do viewport lógico.
    const divisorias = cena.marcas.filter(m => m.cor === '#f8fafc');
    expect(divisorias.length).toBeGreaterThan(0);
    expect(divisorias.length % 3).toBe(0); // uma marca por divisória em cada trecho
    for (const p of cena.marcas.flatMap(m => m.poligono)) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(400);
      expect(p.y).toBeLessThanOrEqual(700);
    }
    estado.distancia = 1234.567;
    const depois = criarCena(estado, { movimentoReduzido: true });
    expect(depois.objetos).toEqual(cena.objetos); // movimento reduzido mantém a reta inicial
    depois.segmentos.forEach((segmento, i) => {
      expect(segmento.poligono).toEqual(cena.segmentos[i].poligono);
      expect(segmento.mundoPerto - cena.segmentos[i].mundoPerto).toBeCloseTo(estado.distancia);
      expect(segmento.mundoLonge - cena.segmentos[i].mundoLonge).toBeCloseTo(estado.distancia);
    });
    const economica = criarCena(estado, { qualidade: 'economica', movimentoReduzido: true });
    expect(economica.segmentos).toHaveLength(40);
    expect(economica.objetos).toEqual(depois.objetos);
    expect(economica.segmentos[0].dLonge).toBe(3500);
    expect(economica.segmentos.at(-1).dPerto).toBe(-200);
  });
});

describe('T10: frequência de projeção não altera estado, sorteios nem ordem dos eventos', () => {
  for (const faixas of [2, 3, 4]) {
    for (const cenario of ['nascimentos', 'batida', 'reserva', 'chegada']) {
      it(`${faixas} faixas, ${cenario}, com zero/uma/três cenas por passo`, () => {
        const inicial = criarCorrida({ faixas });
        if (cenario === 'batida') inicial.rivais = [rival(inicial, { x: inicial.carro.x, y: 520 })];
        if (cenario === 'reserva') inicial.gasolina = 0.05;
        if (cenario === 'chegada') {
          inicial.ultrapassagens = 29;
          inicial.rivais = [rival(inicial, { y: 644 })];
        }
        const execucoes = [0, 1, 3].map(desenhos => ({
          desenhos, estado: structuredClone(inicial), sortear: sorteador(12345 + faixas),
        }));
        const eventosVistos = [];
        // Na reserva, aguarda o posto de ajuda na faixa inicial. Nas demais
        // sequências, move nos dois sentidos após o contato/passagem preparado.
        for (let passo = 0; passo < 300; passo++) {
          const direcao = cenario === 'reserva' || passo < 10 ? 0 : [1, 0, -1, 0][Math.floor(passo / 30) % 4];
          const resultados = execucoes.map(({ desenhos, estado, sortear }) => {
            const eventos = avancarCorrida(estado, { dt: DT_MAXIMO, direcao }, { sortear });
            for (let desenho = 0; desenho < desenhos; desenho++) {
              criarCena(estado, {
                movimentoReduzido: desenho % 2 === 1,
                qualidade: desenho === 2 ? 'economica' : 'padrao',
              });
            }
            return eventos;
          });
          expect(resultados[1]).toEqual(resultados[0]);
          expect(resultados[2]).toEqual(resultados[0]);
          expect(execucoes[1].estado).toEqual(execucoes[0].estado);
          expect(execucoes[2].estado).toEqual(execucoes[0].estado);
          eventosVistos.push(...resultados[0].map(e => e.tipo));
        }
        const esperados = {
          nascimentos: ['rival-apareceu'], batida: ['bateu'],
          reserva: ['reserva', 'posto-apareceu', 'abasteceu'],
          chegada: ['ultrapassou', 'meta', 'bandeirada'],
        };
        expect(eventosVistos).toEqual(expect.arrayContaining(esperados[cenario]));
        if (cenario === 'chegada') expect(eventosVistos.filter(e => e === 'bandeirada')).toHaveLength(1);
        // Também compara o próximo sorteio, para detectar consumo sem efeito imediato.
        const proximosSorteios = execucoes.map(execucao => execucao.sortear());
        expect(proximosSorteios[1]).toBe(proximosSorteios[0]);
        expect(proximosSorteios[2]).toBe(proximosSorteios[0]);
      });
    }
  }
});
