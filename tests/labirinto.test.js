import { describe, expect, it } from 'vitest';
import {
  DIRECOES, analisarMapa, calcularEstrelasLabirinto, criarPartida, gerarMapaDoModo, mapasDoNivel,
  mapasClassicosDoNivel, podeMover, posicoesDaRota, resolverMapa,
} from '../Games/labirinto/jogo.js';

function seguirDicas(partida, limite = 5000) {
  let passos = 0;
  while (!partida.estado().concluida && passos < limite) {
    const dica = partida.dica();
    expect(dica).not.toBeNull();
    const resultado = dica.acao ? partida.agir(dica.acao) : partida.mover(dica.direcao);
    expect(resultado).toMatchObject({ valido: true });
    passos += 1;
  }
  return passos;
}

describe('Meu Primeiro Labirinto (P07 + P14)', () => {
  it('tem dez aventuras grandes, reproduzíveis e solucionáveis em cada nível', () => {
    ['facil', 'normal', 'esperto'].forEach(nivel => {
      const mapas = mapasDoNivel(nivel);
      expect(mapas).toHaveLength(10);
      expect(new Set(mapas.map(mapa => mapa.id)).size).toBe(10);
      mapas.forEach(mapa => {
        const analisado = analisarMapa(mapa);
        const tamanho = nivel === 'facil' ? 15 : nivel === 'normal' ? 20 : 25;
        const rota = resolverMapa(analisado);
        expect(analisado.tamanho).toBe(tamanho);
        expect(rota).not.toBeNull();
        expect(rota.length).toBeGreaterThanOrEqual(tamanho * 2);
      });
    });
  });

  it('abre no 20 por 20 e só o modo esperto exige chave e estrela', () => {
    mapasDoNivel().forEach(mapa => expect(analisarMapa(mapa).tamanho).toBe(20));
    mapasDoNivel('facil').forEach(mapa => expect(analisarMapa(mapa).estrela).toBeNull());
    mapasDoNivel('normal').forEach(mapa => expect(analisarMapa(mapa).estrela).toBeNull());
    mapasDoNivel('esperto').forEach(mapa => {
      const analisado = analisarMapa(mapa);
      expect(analisado.estrela).not.toBeNull();
      expect(analisado.itens.map(item => item.id)).toContain('chave');
    });
  });

  it('mantém os mapas clássicos disponíveis nos tamanhos antigos', () => {
    expect(analisarMapa(mapasClassicosDoNivel('facil')[0]).tamanho).toBe(9);
    expect(analisarMapa(mapasClassicosDoNivel('normal')[0]).tamanho).toBe(12);
    expect(analisarMapa(mapasClassicosDoNivel('esperto')[0]).tamanho).toBe(15);
  });

  it('a dica recomenda movimentos e ações que sempre chegam ao fim', () => {
    ['facil', 'normal', 'esperto'].forEach(nivel => mapasDoNivel(nivel).forEach(mapa => {
      const partida = criarPartida(mapa);
      const seguranca = seguirDicas(partida);
      expect(partida.estado().concluida).toBe(true);
      expect(seguranca).toBeLessThan(5000);
    }));
  });

  it('expõe o caminho visual completo, da posição atual até a garagem', () => {
    ['facil', 'normal', 'esperto'].forEach(nivel => mapasDoNivel(nivel).forEach(mapaRecebido => {
      const mapa = analisarMapa(mapaRecebido);
      const rota = resolverMapa(mapa);
      const posicoes = posicoesDaRota(mapa, rota);
      expect(posicoes[0]).toEqual(mapa.inicio);
      expect(posicoes.at(-1)).toEqual(mapa.destino);
      mapa.itens.forEach(item => expect(posicoes).toContainEqual(item.posicao));
    }));
  });

  it('aplica as quatro regras de obstáculo e reinicia seus estados', () => {
    const semaforo = criarPartida({ id: 'sinal', layout: ['CSG', '...', '...'] });
    expect(semaforo.mover('direita')).toMatchObject({ valido: false, motivo: 'semaforo' });
    expect(semaforo.agir('esperar')).toMatchObject({ valido: true, acao: 'esperar' });
    expect(semaforo.mover('direita')).toMatchObject({ valido: true });

    const ponte = criarPartida({ id: 'ponte', layout: ['C.BG', '.L..', '....', '....'] });
    ponte.mover('baixo');
    expect(ponte.agir('acionar')).toMatchObject({ valido: true, acao: 'acionar' });
    expect(ponte.estado().pontesBaixadas).toHaveLength(1);

    const portao = criarPartida({ id: 'portao', layout: ['C.PG', '.K..', '....', '....'] });
    portao.mover('direita');
    expect(portao.mover('direita')).toMatchObject({ valido: false, motivo: 'portao' });
    portao.mover('baixo');
    expect(portao.estado().itensColetados).toContain('chave');
    portao.mover('cima');
    expect(portao.mover('direita')).toMatchObject({ valido: true, abriuPortao: true });

    const obras = criarPartida({ id: 'obras', layout: ['CX.G', '....', '....', '....'] });
    expect(obras.mover('direita')).toMatchObject({ valido: false, motivo: 'obras' });

    const estado = portao.reiniciar();
    expect(estado).toMatchObject({ itensColetados: [], portoesAbertos: [], pontesBaixadas: [], semaforosVerdes: [] });
  });

  it('recusa item inacessível e dependência circular entre alavanca e ponte', () => {
    expect(() => criarPartida({ id: 'item-inacessivel', layout: ['C#G', '###', 'K..'] }))
      .toThrow(/não tem solução/);
    expect(() => criarPartida({ id: 'ponte-circular', layout: ['CBLG', '####', '....', '....'] }))
      .toThrow(/não tem solução/);
  });

  it('recalcula uma dica válida depois de explorar um caminho diferente', () => {
    const partida = criarPartida(mapasDoNivel('esperto')[3]);
    const primeira = partida.dica();
    if (primeira.direcao) {
      partida.mover(primeira.direcao);
      const oposta = { cima: 'baixo', baixo: 'cima', esquerda: 'direita', direita: 'esquerda' }[primeira.direcao];
      expect(partida.mover(oposta)).toMatchObject({ valido: true });
    } else {
      partida.agir(primeira.acao);
    }
    expect(seguirDicas(partida)).toBeLessThan(5000);
    expect(partida.estado().concluida).toBe(true);
  });

  it('nunca atravessa paredes nem sai do tabuleiro', () => {
    mapasDoNivel('normal').forEach(mapa => {
      Object.keys(DIRECOES).forEach(direcao => {
        const partida = criarPartida(mapa);
        const antes = partida.estado();
        const resultado = partida.mover(direcao);
        if (!resultado.valido) {
          expect(resultado.motivo).toMatch(/parede|limite/);
          expect(partida.estado().posicao).toEqual(antes.posicao);
          expect(partida.estado().movimentos).toBe(0);
        }
      });
    });
  });

  it('recomeçar limpa movimentos, dicas, trilha e estrela', () => {
    const partida = criarPartida(mapasDoNivel('esperto')[0]);
    const dica = partida.dica();
    partida.mover(dica.direcao);
    const estado = partida.reiniciar();
    expect(estado).toMatchObject({ movimentos: 0, dicas: 0, coletouEstrela: false, concluida: false });
    expect(estado.trilha).toEqual([estado.mapa.inicio]);
    expect(estado.posicao).toEqual(estado.mapa.inicio);
  });

  it('não conclui o modo esperto sem coletar a estrela', () => {
    const partida = criarPartida({ id: 'teste', nivel: 'esperto', layout: ['C.G', '...', '.*.'] });
    partida.mover('direita');
    const garagem = partida.mover('direita');
    expect(garagem).toMatchObject({ valido: true, chegouSemEstrela: true, concluida: false });
    expect(partida.estado().concluida).toBe(false);
  });
});

describe('Labirinto de Aventuras (J13)', () => {
  it.each([
    ['explorador', 5, 0],
    ['aventureiro', 7, 1],
    ['desafio', 9, 2],
  ])('gera 200 mapas %s alcançáveis com tamanho e itens corretos', (modo, tamanho, itens) => {
    for (let semente = 1; semente <= 200; semente += 1) {
      const mapa = analisarMapa(gerarMapaDoModo(modo, { semente }));
      expect(mapa.tamanho).toBe(tamanho);
      expect(mapa.itens).toHaveLength(itens);
      expect(new Set([mapa.inicio, mapa.destino, ...mapa.itens.map(item => item.posicao)]
        .map(item => `${item.linha},${item.coluna}`)).size).toBe(2 + itens);
      const rota = resolverMapa(mapa);
      expect(rota).not.toBeNull();
      const partida = criarPartida(mapa);
      rota.forEach(direcao => expect(partida.mover(direcao).valido).toBe(true));
      expect(partida.estado()).toMatchObject({ concluida: true, movimentos: rota.length });
      expect(partida.estado().itensColetados).toHaveLength(itens);
    }
  });

  it('repete exatamente o mapa quando recebe a mesma semente', () => {
    const primeiro = gerarMapaDoModo('desafio', { semente: 'elis' });
    const segundo = gerarMapaDoModo('desafio', { semente: 'elis' });
    expect(segundo.layout).toEqual(primeiro.layout);
    expect(segundo.paredes).toEqual(primeiro.paredes);
  });

  it('respeita todas as paredes e os limites nos mapas gerados', () => {
    const mapa = analisarMapa(gerarMapaDoModo('desafio', { semente: 42 }));
    for (let linha = 0; linha < mapa.tamanho; linha += 1) {
      for (let coluna = 0; coluna < mapa.tamanho; coluna += 1) {
        const origem = { linha, coluna };
        Object.values(DIRECOES).forEach(delta => {
          const destino = { linha: linha + delta.linha, coluna: coluna + delta.coluna };
          expect(podeMover(mapa, origem, destino)).toBe(podeMover(mapa, destino, origem));
        });
      }
    }
  });

  it('a dica se recalcula após um desvio e após coletar itens', () => {
    const partida = criarPartida(gerarMapaDoModo('desafio', { semente: 73 }));
    const primeira = partida.dica();
    partida.mover(primeira.direcao);
    const volta = Object.entries(DIRECOES).find(([, delta]) => (
      partida.estado().posicao.linha + delta.linha === partida.estado().mapa.inicio.linha
      && partida.estado().posicao.coluna + delta.coluna === partida.estado().mapa.inicio.coluna
    ))?.[0];
    expect(partida.mover(volta).valido).toBe(true);

    let seguranca = 0;
    while (!partida.estado().concluida && seguranca < 400) {
      const dica = partida.dica();
      expect(dica).not.toBeNull();
      expect(partida.mover(dica.direcao).valido).toBe(true);
      seguranca += 1;
    }
    expect(partida.estado().concluida).toBe(true);
    expect(partida.estado().itensColetados).toHaveLength(2);
  });

  it('dá estrelas por conclusão e uso de dicas', () => {
    expect(calcularEstrelasLabirinto(0, 3)).toBe(3);
    expect(calcularEstrelasLabirinto(3, 3)).toBe(2);
    expect(calcularEstrelasLabirinto(4, 3)).toBe(1);
    expect(calcularEstrelasLabirinto(0, 2)).toBe(0);
  });
});
