import { beforeEach, describe, expect, it } from 'vitest';
import {
  FIGURINHAS, nivelDaEtapa, obterAlbum, obterConfiguracoes, obterEstado, proximaFigurinha,
  registrarRodada, rodadasDe, salvarConfiguracoes, zerarAlbum,
} from '../shared/descobertas.js';

function criarArmazenamento() {
  const dados = new Map();
  return {
    dados,
    getItem: chave => dados.get(chave) ?? null,
    setItem: (chave, valor) => dados.set(chave, valor),
    removeItem: chave => dados.delete(chave),
  };
}

describe('Primeiras Descobertas — preferências', () => {
  let armazenamento;
  beforeEach(() => { armazenamento = criarArmazenamento(); });

  it('abre nos padrões da etapa quando não há nada salvo', () => {
    expect(obterConfiguracoes(armazenamento)).toEqual({
      nome: 'Rael', alternativas: 3, tema: 'tudo', voz: 'auto',
    });
  });

  it('salva o que veio e devolve o que ficou valendo', () => {
    const salvas = salvarConfiguracoes({ nome: 'Rael', alternativas: 2, tema: 'animais', voz: 'sintetizada' }, armazenamento);
    expect(salvas).toEqual({ nome: 'Rael', alternativas: 2, tema: 'animais', voz: 'sintetizada' });
    expect(obterConfiguracoes(armazenamento)).toEqual(salvas);
  });

  it('recusa quantidade de alternativas fora de 2, 3 ou 4', () => {
    salvarConfiguracoes({ alternativas: 7 }, armazenamento);
    expect(obterConfiguracoes(armazenamento).alternativas).toBe(3);
    salvarConfiguracoes({ alternativas: 4 }, armazenamento);
    salvarConfiguracoes({ alternativas: 'muitas' }, armazenamento);
    expect(obterConfiguracoes(armazenamento).alternativas).toBe(4);
  });

  it('guarda só o primeiro nome, sem números nem símbolos', () => {
    salvarConfiguracoes({ nome: '  Rael 123 !!  ' }, armazenamento);
    expect(obterConfiguracoes(armazenamento).nome).toBe('Rael');
    salvarConfiguracoes({ nome: 'Maria Antônia da Silva Pereira' }, armazenamento);
    expect(obterConfiguracoes(armazenamento).nome).toHaveLength(15);
  });

  it('mantém o nome anterior quando o campo chega vazio', () => {
    salvarConfiguracoes({ nome: 'Rael' }, armazenamento);
    salvarConfiguracoes({ nome: '   ' }, armazenamento);
    expect(obterConfiguracoes(armazenamento).nome).toBe('Rael');
  });

  it('recusa modo de voz desconhecido', () => {
    salvarConfiguracoes({ voz: 'robozinho' }, armazenamento);
    expect(obterConfiguracoes(armazenamento).voz).toBe('auto');
  });

  it('lê o número de alternativas como nível nas atividades sem alternativa', () => {
    expect(nivelDaEtapa(armazenamento)).toBe('normal');
    salvarConfiguracoes({ alternativas: 2 }, armazenamento);
    expect(nivelDaEtapa(armazenamento)).toBe('facil');
    salvarConfiguracoes({ alternativas: 4 }, armazenamento);
    expect(nivelDaEtapa(armazenamento)).toBe('esperto');
  });

  it('aguenta armazenamento quebrado sem derrubar a tela', () => {
    const quebrado = {
      getItem: () => '{ isto não é json',
      setItem: () => { throw new Error('cheio'); },
      removeItem: () => {},
    };
    expect(obterConfiguracoes(quebrado).alternativas).toBe(3);
    expect(() => salvarConfiguracoes({ tema: 'animais' }, quebrado)).not.toThrow();
  });
});

describe('Primeiras Descobertas — rodadas e álbum', () => {
  let armazenamento;
  beforeEach(() => { armazenamento = criarArmazenamento(); });

  it('conta as rodadas por atividade', () => {
    registrarRodada('toque-na-figura', {}, armazenamento);
    registrarRodada('toque-na-figura', {}, armazenamento);
    expect(rodadasDe('toque-na-figura', armazenamento)).toBe(2);
    expect(rodadasDe('quem-faz-esse-som', armazenamento)).toBe(0);
  });

  it('dá uma figurinha nova a cada rodada, sem repetir', () => {
    const primeira = registrarRodada('toque-na-figura', {}, armazenamento);
    const segunda = registrarRodada('toque-na-figura', {}, armazenamento);
    expect(primeira.figurinha).toBe(FIGURINHAS[0]);
    expect(segunda.figurinha).toBe(FIGURINHAS[1]);
    expect(obterAlbum(armazenamento).figurinhas).toEqual([FIGURINHAS[0], FIGURINHAS[1]]);
  });

  it('não guarda estrela, acerto nem erro: terminar já basta', () => {
    registrarRodada('toque-na-figura', {}, armazenamento);
    const registro = obterEstado(armazenamento).atividades['toque-na-figura'];
    expect(Object.keys(registro).sort()).toEqual(['rodadas', 'ultimaEm']);
  });

  it('recomeça o álbum quando todas as figurinhas já foram ganhas', () => {
    FIGURINHAS.forEach(() => registrarRodada('toque-na-figura', {}, armazenamento));
    expect(obterAlbum(armazenamento).figurinhas).toHaveLength(FIGURINHAS.length);
    expect(proximaFigurinha(armazenamento)).toBe(FIGURINHAS[0]);
    registrarRodada('toque-na-figura', {}, armazenamento);
    expect(obterAlbum(armazenamento).figurinhas).toHaveLength(FIGURINHAS.length);
  });

  it('soma as rodadas de todas as atividades no álbum', () => {
    registrarRodada('toque-na-figura', {}, armazenamento);
    registrarRodada('meu-nome', {}, armazenamento);
    registrarRodada('meu-nome', {}, armazenamento);
    expect(obterAlbum(armazenamento).rodadas).toBe(3);
  });

  it('zera o álbum sem apagar as preferências do adulto', () => {
    salvarConfiguracoes({ tema: 'veiculos', alternativas: 2 }, armazenamento);
    registrarRodada('toque-na-figura', {}, armazenamento);
    zerarAlbum(armazenamento);
    expect(obterAlbum(armazenamento)).toMatchObject({ figurinhas: [], rodadas: 0 });
    expect(obterConfiguracoes(armazenamento)).toMatchObject({ tema: 'veiculos', alternativas: 2 });
  });

  it('escreve numa chave própria, longe do progresso da Elis', () => {
    registrarRodada('toque-na-figura', {}, armazenamento);
    expect([...armazenamento.dados.keys()]).toEqual(['jogos-elis:descobertas']);
  });
});
