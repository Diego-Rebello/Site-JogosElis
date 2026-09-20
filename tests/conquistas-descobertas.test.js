import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ATIVIDADES_DESCOBERTAS, CONQUISTAS, LABIRINTO, PAGINAS, TOTAL_FIGURINHAS, acumularFeitos, avaliarConquistas,
  diaLocal, progressoDe, resumirConquista,
} from '../shared/conquistas-descobertas.js';
import {
  FIGURINHAS, conquistasDaAtividade, obterAlbum, obterConfiguracoes, obterEstado, registrarRodada,
  salvarConfiguracoes, zerarAlbum,
} from '../shared/descobertas.js';

function criarArmazenamento(inicial) {
  const dados = new Map(inicial ? [['jogos-elis:descobertas', JSON.stringify(inicial)]] : []);
  return {
    dados,
    getItem: chave => dados.get(chave) ?? null,
    setItem: (chave, valor) => dados.set(chave, valor),
    removeItem: chave => dados.delete(chave),
  };
}

const ids = lista => lista.map(conquista => conquista.id);
const mapa = (nivel, numero, extra = {}) => ({
  mapaId: `rael-aventura-${nivel}-${numero}`, nivel, aventura: true, dicas: 1, ...extra,
});

describe('Conquistas — catálogo', () => {
  it('tem ids únicos, metas inteiras e páginas conhecidas', () => {
    expect(new Set(ids(CONQUISTAS)).size).toBe(CONQUISTAS.length);
    const paginas = new Set(PAGINAS.map(pagina => pagina.id));
    CONQUISTAS.forEach(conquista => {
      expect(Number.isInteger(conquista.meta) && conquista.meta >= 1).toBe(true);
      expect(paginas.has(conquista.pagina)).toBe(true);
      expect(conquista.nome && conquista.comoGanhar && conquista.parabens).toBeTruthy();
    });
  });

  it('usa só figuras que já existem em public/figuras', () => {
    [...CONQUISTAS, ...PAGINAS].forEach(item => {
      expect(existsSync(resolve('public', `.${item.figura}`)), item.figura).toBe(true);
    });
  });

  it('conta o mesmo número de figurinhas comuns que o álbum', () => {
    expect(TOTAL_FIGURINHAS).toBe(FIGURINHAS.length);
  });

  it('não premia rapidez, erro nem dias seguidos', () => {
    const frases = CONQUISTAS.map(conquista => `${conquista.nome} ${conquista.comoGanhar} ${conquista.parabens}`).join(' ');
    expect(frases).not.toMatch(/rápid|depressa|sem errar|seguid|perdeu/i);
  });

  it('gera duas conquistas por brincadeira, menos a estreia do labirinto', () => {
    const brincadeiras = CONQUISTAS.filter(conquista => conquista.pagina === 'brincadeiras');
    expect(brincadeiras).toHaveLength(ATIVIDADES_DESCOBERTAS.length * 2 - 1);
    expect(ids(brincadeiras)).not.toContain(`${LABIRINTO}-estreia`);
  });
});

describe('Conquistas — acumular feitos do labirinto', () => {
  it('não altera as marcas que recebeu', () => {
    const antes = { [LABIRINTO]: { estrelas: 1 } };
    acumularFeitos(LABIRINTO, antes, { estrela: true, aventura: true });
    expect(antes).toEqual({ [LABIRINTO]: { estrelas: 1 } });
  });

  it('guarda mapas, obstáculos, estrela e mapas sem dica', () => {
    let marcas = {};
    marcas = acumularFeitos(LABIRINTO, marcas, mapa('normal', 3, { ponte: true, semaforo: true, dicas: 0 }));
    marcas = acumularFeitos(LABIRINTO, marcas, mapa('normal', 3, { ponte: true }));
    marcas = acumularFeitos(LABIRINTO, marcas, mapa('esperto', 1, { estrela: true, portao: true }));
    expect(marcas[LABIRINTO]).toEqual({
      mapas: { 'rael-aventura-normal-3': 2, 'rael-aventura-esperto-1': 1 },
      estrelas: 1,
      semDica: 1,
      usou: { ponte: 2, semaforo: 1, portao: 1 },
    });
  });

  it('só conta "sem dica" nos níveis normal e esperto', () => {
    const marcas = acumularFeitos(LABIRINTO, {}, mapa('facil', 1, { dicas: 0 }));
    expect(marcas[LABIRINTO].semDica).toBe(0);
  });

  it('no modo clássico conta a estrela, mas não mapas, obstáculos nem "sem dica"', () => {
    const marcas = acumularFeitos(LABIRINTO, {}, {
      mapaId: 'classico-esperto-1', nivel: 'esperto', aventura: false, dicas: 0, estrela: true, ponte: true,
    });
    expect(marcas[LABIRINTO]).toEqual({ mapas: {}, estrelas: 1, semDica: 0, usou: {} });
  });

  it('marca o dia local de cada rodada, sem repetir', () => {
    const dia = new Date(2026, 8, 19, 23, 50);
    let marcas = acumularFeitos('toque-na-figura', {}, {}, dia);
    marcas = acumularFeitos('rimas-com-figuras', marcas, {}, dia);
    marcas = acumularFeitos('rimas-com-figuras', marcas, {}, new Date(2026, 8, 21, 8, 0));
    expect(marcas.geral.dias).toEqual(['2026-09-19', '2026-09-21']);
    expect(diaLocal(dia)).toBe('2026-09-19');
  });

  it('aguenta marcas estragadas', () => {
    const marcas = acumularFeitos(LABIRINTO, { geral: { dias: 'ontem' }, [LABIRINTO]: { mapas: 3, estrelas: 'x' } },
      mapa('facil', 2, { estrela: true }));
    expect(marcas[LABIRINTO].estrelas).toBe(1);
    expect(marcas[LABIRINTO].mapas).toEqual({ 'rael-aventura-facil-2': 1 });
    expect(marcas.geral.dias).toHaveLength(1);
  });
});

describe('Conquistas — avaliação', () => {
  const contexto = (atividades = {}, marcas = {}, figurinhas = []) => ({ atividades, marcas, figurinhas });

  it('nada vem de graça sem brincar', () => {
    expect(avaliarConquistas(contexto())).toEqual([]);
  });

  it('não devolve de novo o que já foi ganho', () => {
    const ctx = contexto({ 'toque-na-figura': { rodadas: 1 } });
    expect(ids(avaliarConquistas(ctx))).toEqual(['toque-na-figura-estreia']);
    expect(avaliarConquistas(ctx, { 'toque-na-figura-estreia': '2026-09-19' })).toEqual([]);
  });

  it('limita o progresso à meta e resume sem a função de medir', () => {
    const fa = CONQUISTAS.find(conquista => conquista.id === 'toque-na-figura-fa');
    const ctx = contexto({ 'toque-na-figura': { rodadas: 14 } });
    expect(progressoDe(fa, ctx)).toBe(10);
    const resumo = resumirConquista(fa, contexto({ 'toque-na-figura': { rodadas: 4 } }));
    expect(resumo).toMatchObject({ id: 'toque-na-figura-fa', progresso: 4, meta: 10, ganha: false, ganhaEm: null });
    expect(resumo).not.toHaveProperty('medir');
  });
});

describe('Conquistas — no álbum do Rael', () => {
  let armazenamento;
  beforeEach(() => {
    armazenamento = criarArmazenamento();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 19, 10, 0));
  });
  afterEach(() => vi.useRealTimers());

  const jogarLabirinto = feitos => registrarRodada(LABIRINTO, { feitos }, armazenamento);

  it('a primeira rodada continua dando a figurinha comum e celebra a estreia', () => {
    const resultado = registrarRodada('toque-na-figura', {}, armazenamento);
    expect(resultado.figurinha).toBe(FIGURINHAS[0]);
    expect(ids(resultado.conquistasNovas)).toEqual(['toque-na-figura-estreia']);
    expect(resultado.conquistasNovas[0]).toMatchObject({ ganha: true, nome: 'Primeiro toque' });
  });

  it('baixar a ponte concede a conquista uma vez só, com ou sem dica', () => {
    const primeira = jogarLabirinto(mapa('normal', 1, { ponte: true, dicas: 4 }));
    expect(ids(primeira.conquistasNovas)).toEqual(['lab-primeira-garagem', 'lab-ponte']);
    const segunda = jogarLabirinto(mapa('normal', 2, { ponte: true }));
    expect(segunda.conquistasNovas).toEqual([]);
    expect(segunda.figurinha).toBe(FIGURINHAS[1]);
  });

  it('dez mapas diferentes do nível concedem a conquista; o mesmo mapa dez vezes, não', () => {
    for (let vez = 0; vez < 10; vez += 1) jogarLabirinto(mapa('facil', 1));
    expect(obterEstado(armazenamento).conquistas).not.toHaveProperty('lab-explorar-10');
    let ultima;
    for (let numero = 2; numero <= 10; numero += 1) ultima = jogarLabirinto(mapa('facil', numero));
    expect(ids(ultima.conquistasNovas)).toContain('lab-explorar-10');
  });

  it('mapas do modo clássico não contam para os dez mapas do nível', () => {
    for (let numero = 1; numero <= 10; numero += 1) {
      jogarLabirinto({ mapaId: `rael-aventura-facil-${numero}`, nivel: 'facil', aventura: false, dicas: 0 });
    }
    expect(obterEstado(armazenamento).conquistas).not.toHaveProperty('lab-explorar-10');
  });

  it('"Eu consigo!" pede três mapas normal ou esperto sem dica', () => {
    jogarLabirinto(mapa('normal', 1, { dicas: 0 }));
    jogarLabirinto(mapa('facil', 1, { dicas: 0 }));
    jogarLabirinto(mapa('esperto', 1, { dicas: 2 }));
    jogarLabirinto(mapa('esperto', 2, { dicas: 0 }));
    expect(obterEstado(armazenamento).conquistas).not.toHaveProperty('lab-eu-consigo');
    const terceira = jogarLabirinto(mapa('normal', 2, { dicas: 0 }));
    expect(ids(terceira.conquistasNovas)).toContain('lab-eu-consigo');
  });

  it('usar os quatro obstáculos, em qualquer ordem e mapa, faz o mestre do trânsito', () => {
    jogarLabirinto(mapa('facil', 1, { semaforo: true }));
    jogarLabirinto(mapa('normal', 1, { ponte: true }));
    jogarLabirinto(mapa('esperto', 1, { portao: true }));
    const ultima = jogarLabirinto(mapa('esperto', 2, { obras: true }));
    expect(ids(ultima.conquistasNovas)).toEqual(['lab-desvio', 'lab-mestre-transito']);
  });

  it('dias diferentes contam mesmo sem serem seguidos', () => {
    [1, 4, 9, 20].forEach(dia => {
      vi.setSystemTime(new Date(2026, 9, dia, 9, 0));
      registrarRodada('rimas-com-figuras', {}, armazenamento);
    });
    expect(obterEstado(armazenamento).conquistas).not.toHaveProperty('geral-dias-5');
    vi.setSystemTime(new Date(2027, 0, 2, 9, 0));
    const quinta = registrarRodada('rimas-com-figuras', {}, armazenamento);
    expect(ids(quinta.conquistasNovas)).toContain('geral-dias-5');
  });

  it('completar as figurinhas comuns rende o álbum cheio', () => {
    let ultima;
    FIGURINHAS.forEach(() => { ultima = registrarRodada('toque-na-figura', {}, armazenamento); });
    expect(ids(ultima.conquistasNovas)).toContain('geral-album');
  });

  it('obterAlbum traz as conquistas com progresso e a contagem', () => {
    jogarLabirinto(mapa('normal', 1, { estrela: true }));
    const album = obterAlbum(armazenamento);
    expect(album.totalConquistas).toBe(CONQUISTAS.length);
    expect(album.conquistasGanhas).toBe(1);
    expect(album.conquistas.find(conquista => conquista.id === 'lab-estrelas')).toMatchObject({ progresso: 1, meta: 5, ganha: false });
    expect(album.conquistas.find(conquista => conquista.id === 'lab-primeira-garagem')).toMatchObject({ ganha: true });
  });

  it('conquistasDaAtividade devolve só as da brincadeira', () => {
    const doLabirinto = conquistasDaAtividade(LABIRINTO, armazenamento);
    expect(doLabirinto.every(conquista => conquista.atividade === LABIRINTO)).toBe(true);
    expect(ids(doLabirinto)).toContain('lab-chaveiro');
    expect(ids(doLabirinto)).toContain(`${LABIRINTO}-fa`);
  });

  it('zerar apaga marcas e conquistas e mantém as preferências', () => {
    salvarConfiguracoes({ tema: 'animais' }, armazenamento);
    jogarLabirinto(mapa('normal', 1, { ponte: true }));
    zerarAlbum(armazenamento);
    const estado = obterEstado(armazenamento);
    expect(estado).toMatchObject({ marcas: {}, conquistas: {}, figurinhas: [], atividades: {} });
    expect(obterConfiguracoes(armazenamento).tema).toBe('animais');
    expect(ids(jogarLabirinto(mapa('normal', 1, { ponte: true })).conquistasNovas)).toContain('lab-ponte');
  });
});

describe('Conquistas — estado salvo na versão 1', () => {
  const versao1 = {
    versao: 1,
    nome: 'Rael',
    alternativas: 3,
    atividades: {
      'toque-na-figura': { rodadas: 12, ultimaEm: '2026-09-10T10:00:00.000Z' },
      [LABIRINTO]: { rodadas: 2, ultimaEm: '2026-09-11T10:00:00.000Z' },
    },
    figurinhas: [FIGURINHAS[0], FIGURINHAS[1]],
  };

  it('abre sem erro, mantém o que havia e ganha o que dá para deduzir', () => {
    const armazenamento = criarArmazenamento(versao1);
    const estado = obterEstado(armazenamento);
    expect(estado.figurinhas).toEqual(versao1.figurinhas);
    expect(estado.atividades).toEqual(versao1.atividades);
    expect(Object.keys(estado.conquistas).sort()).toEqual(
      ['lab-primeira-garagem', 'toque-na-figura-estreia', 'toque-na-figura-fa'].sort(),
    );
  });

  it('não celebra as conquistas deduzidas na primeira rodada depois da migração', () => {
    const armazenamento = criarArmazenamento(versao1);
    const resultado = registrarRodada('toque-na-figura', {}, armazenamento);
    expect(resultado.conquistasNovas).toEqual([]);
    expect(obterEstado(armazenamento).conquistas).toHaveProperty('toque-na-figura-fa');
  });

  it('mantém ids desconhecidos e descarta datas inválidas', () => {
    const armazenamento = criarArmazenamento({ ...versao1, versao: 2, conquistas: { antiga: '2026-01-01', ruim: 5 } });
    expect(obterEstado(armazenamento).conquistas).toEqual({ antiga: '2026-01-01' });
    expect(() => obterAlbum(armazenamento)).not.toThrow();
  });
});

describe('Conquistas — Corrida do Rael (Etapa 5)', () => {
  it('A5.2: conclui uma rodada em armazenamento falso e recebe figurinha, atividade com rodadas: 1 e somente corrida-do-rael-estreia entre as conquistas específicas do jogo', () => {
    const armazenamento = criarArmazenamento();
    const premio = registrarRodada('corrida-do-rael', {}, armazenamento);
    expect(premio.figurinha).toBeTruthy();
    expect(premio.atividade).toMatchObject({ rodadas: 1 });
    const novasIds = ids(premio.conquistasNovas);
    const conquistasDoJogo = novasIds.filter(id => id.startsWith('corrida-do-rael-'));
    expect(conquistasDoJogo).toEqual(['corrida-do-rael-estreia']);
  });

  it('A5.3: após nove rodadas, "Piloto experiente" ainda não foi liberada; na décima, aparece uma vez; na décima primeira, não reaparece', () => {
    const armazenamento = criarArmazenamento();
    for (let i = 1; i <= 9; i++) {
      const res = registrarRodada('corrida-do-rael', {}, armazenamento);
      expect(ids(res.conquistasNovas)).not.toContain('corrida-do-rael-fa');
    }
    const decima = registrarRodada('corrida-do-rael', {}, armazenamento);
    expect(ids(decima.conquistasNovas)).toContain('corrida-do-rael-fa');
    expect(obterEstado(armazenamento).atividades['corrida-do-rael'].rodadas).toBe(10);

    const decimaPrimeira = registrarRodada('corrida-do-rael', {}, armazenamento);
    expect(ids(decimaPrimeira.conquistasNovas)).not.toContain('corrida-do-rael-fa');
    expect(obterEstado(armazenamento).atividades['corrida-do-rael'].rodadas).toBe(11);
  });

  it('A5.4: rodada representada como "com ajuda" recebe exatamente as mesmas conquistas de quantidade; sem condição de rapidez ou acerto de primeira', () => {
    const armazenamento = criarArmazenamento();
    const res = registrarRodada('corrida-do-rael', { feitos: { comAjuda: 6 } }, armazenamento);
    expect(ids(res.conquistasNovas)).toContain('corrida-do-rael-estreia');
    expect(res.atividade.rodadas).toBe(1);
  });

  it('A5.5: teste de catálogo confirma IDs únicos, figuras existentes e duas conquistas ligadas à atividade corrida-do-rael', () => {
    const doJogo = CONQUISTAS.filter(c => c.atividade === 'corrida-do-rael');
    expect(doJogo).toHaveLength(2);
    expect(ids(doJogo)).toEqual(['corrida-do-rael-estreia', 'corrida-do-rael-fa']);
    doJogo.forEach(c => {
      expect(existsSync(resolve('public', `.${c.figura}`)), c.figura).toBe(true);
      expect(c.nome).toBeTruthy();
      expect(c.comoGanhar).toBeTruthy();
      expect(c.parabens).toBeTruthy();
    });
  });

  it('A5.6: "Explorador de brincadeiras" exige agora também a Corrida do Rael e só é liberada quando todas as atividades do catálogo têm rodada >= 1', () => {
    const armazenamento = criarArmazenamento();
    const outras = ATIVIDADES_DESCOBERTAS.filter(a => a.id !== 'corrida-do-rael');

    outras.forEach(a => {
      registrarRodada(a.id, {}, armazenamento);
    });
    expect(obterEstado(armazenamento).conquistas).not.toHaveProperty('geral-todas');

    const final = registrarRodada('corrida-do-rael', {}, armazenamento);
    expect(ids(final.conquistasNovas)).toContain('geral-todas');
    expect(obterEstado(armazenamento).conquistas).toHaveProperty('geral-todas');
  });
});
