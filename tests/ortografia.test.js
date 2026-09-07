import { describe, expect, it } from 'vitest';
import {
  ITENS_POR_RODADA,
  MISTURADO,
  conferir,
  conferirDados,
  conferirItem,
  itensDe,
  listarPacotes,
  montarRodada,
  niveis,
  normalizarPacote,
  pacotes,
  partesDaPalavra,
  preencher,
} from '../Games/ortografia/jogo.js';

const listaDePacotes = Object.values(pacotes);

describe('dados da Ortografia Divertida', () => {
  it('não tem nenhum item incoerente', () => {
    // Critério de aceite do J01: a resposta está entre as opções, é a única
    // que forma a palavra, e o texto com a lacuna preenchida bate com ela.
    expect(conferirDados()).toEqual([]);
  });

  it.each(listaDePacotes.map(pacote => [pacote.id, pacote]))('o pacote %s está completo', (_id, pacote) => {
    expect(pacote.itens.length).toBeGreaterThanOrEqual(30);
    expect(pacote.opcoes.length).toBeGreaterThanOrEqual(2);
    expect(pacote.regra.length).toBeGreaterThan(20);
    expect(pacote.exemplo).toContain('→');
  });

  it.each(listaDePacotes.map(pacote => [pacote.id, pacote]))('o pacote %s não repete palavra nem lacuna', (_id, pacote) => {
    const palavras = pacote.itens.map(item => item.palavra);
    expect(new Set(palavras).size).toBe(palavras.length);

    // Duas lacunas iguais com respostas diferentes deixariam o item sem uma
    // resposta certa só ("MA_" valendo MAL e MAU, por exemplo).
    const respostasPorLacuna = new Map();
    for (const item of pacote.itens) {
      const anterior = respostasPorLacuna.get(item.texto);
      expect(anterior === undefined || anterior === item.resposta).toBe(true);
      respostasPorLacuna.set(item.texto, item.resposta);
    }
  });

  it('todo item tem dica, menos os do M/N, em que a letra seguinte já decide', () => {
    for (const pacote of listaDePacotes) {
      for (const item of pacote.itens) {
        if (pacote.id === 'm-n') continue;
        expect(item.dica, `${item.palavra} sem dica`).toBeTruthy();
        expect(item.dica.length).toBeGreaterThan(10);
      }
    }
  });

  it('usa só letras maiúsculas e acentuadas nas palavras', () => {
    for (const pacote of listaDePacotes) {
      for (const item of pacote.itens) {
        expect(item.palavra, item.palavra).toMatch(/^[A-ZÁÉÍÓÚÂÊÔÃÕÀÇ]+$/);
      }
    }
  });

  it('cobre nos níveis todos os pacotes, sem sobra nem repetição', () => {
    const nosNiveis = niveis.flatMap(nivel => nivel.pacotes);
    expect(new Set(nosNiveis).size).toBe(nosNiveis.length);
    expect([...nosNiveis].sort()).toEqual(Object.keys(pacotes).sort());
    expect(listarPacotes().map(pacote => pacote.id)).toEqual(nosNiveis);
  });

  it('reprova um item quebrado', () => {
    const pacote = { opcoes: ['R', 'RR'] };
    // CARO sai tanto de R quanto do R do RR mal colocado: dois problemas.
    expect(conferirItem({ texto: 'CA_O', resposta: 'RR', palavra: 'CARO' }, pacote)).toHaveLength(2);
    expect(conferirItem({ texto: 'CA_O', resposta: 'X', palavra: 'CAXO' }, pacote)).toHaveLength(1);
    expect(conferirItem({ texto: 'CA_O_', resposta: 'R', palavra: 'CARO' }, pacote)).toHaveLength(2);
  });
});

describe('rodadas', () => {
  it('monta 10 itens sem repetir palavra, em 200 rodadas de cada pacote', () => {
    for (const id of [...Object.keys(pacotes), MISTURADO]) {
      for (let tentativa = 0; tentativa < 200; tentativa++) {
        const rodada = montarRodada(id);
        expect(rodada).toHaveLength(ITENS_POR_RODADA);
        expect(new Set(rodada.map(item => item.palavra)).size).toBe(ITENS_POR_RODADA);
        for (const item of rodada) {
          expect(item.opcoes).toContain(item.resposta);
          if (id !== MISTURADO) expect(item.pacoteId).toBe(id);
        }
      }
    }
  });

  it('o misturado usa todos os pacotes', () => {
    const origens = new Set(itensDe(MISTURADO).map(item => item.pacoteId));
    expect(origens.size).toBe(Object.keys(pacotes).length);
  });

  it('não estoura quando pedem mais itens do que existem', () => {
    const rodada = montarRodada('l-u', 10_000);
    expect(rodada.length).toBe(pacotes['l-u'].itens.length);
  });

  it('cai no pacote padrão quando o id não existe', () => {
    expect(normalizarPacote('inventado')).toBe('g-j');
    expect(normalizarPacote(undefined, 'm-n')).toBe('m-n');
    expect(normalizarPacote(MISTURADO)).toBe(MISTURADO);
    expect(normalizarPacote('x-ch')).toBe('x-ch');
  });
});

describe('respostas', () => {
  const item = { texto: 'CA_O', resposta: 'RR', palavra: 'CARRO' };

  it('só aceita a resposta certa', () => {
    expect(conferir(item, 'RR')).toBe(true);
    expect(conferir(item, 'R')).toBe(false);
  });

  it('remonta a palavra com a letra destacada no lugar certo', () => {
    const { antes, letra, depois } = partesDaPalavra(item);
    expect(antes + letra + depois).toBe(item.palavra);
    expect(letra).toBe('RR');
    expect(preencher(item, 'R')).toBe('CARO');
  });
});
