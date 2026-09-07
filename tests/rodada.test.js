import { describe, expect, it } from 'vitest';
import { criarSessao, montarDesafios } from '../shared/rodada.js';

const ITENS = ['gato', 'bola', 'carro', 'sol', 'flor', 'trem', 'pato', 'lua']
  .map(id => ({ id, nome: id }));

/** Embaralhamento previsível: mantém a ordem. Deixa os testes determinísticos. */
const semEmbaralhar = lista => [...lista];

describe('montarDesafios', () => {
  it('monta a quantidade pedida com o número certo de alternativas', () => {
    const desafios = montarDesafios({ itens: ITENS, quantidade: 5, alternativas: 3 });
    expect(desafios).toHaveLength(5);
    desafios.forEach(desafio => expect(desafio.opcoes).toHaveLength(3));
  });

  it('põe exatamente uma resposta certa entre as opções de cada desafio', () => {
    const desafios = montarDesafios({ itens: ITENS, quantidade: 8, alternativas: 4 });
    desafios.forEach(({ alvo, opcoes }) => {
      const certas = opcoes.filter(opcao => opcao.id === alvo.id);
      expect(certas).toHaveLength(1);
      expect(new Set(opcoes.map(o => o.id)).size).toBe(opcoes.length);
    });
  });

  it('não repete o alvo dentro da mesma rodada', () => {
    const desafios = montarDesafios({ itens: ITENS, quantidade: 8, alternativas: 2 });
    const alvos = desafios.map(desafio => desafio.alvo.id);
    expect(new Set(alvos).size).toBe(alvos.length);
  });

  it('respeita duas alternativas, o modo mais fácil', () => {
    const desafios = montarDesafios({ itens: ITENS, quantidade: 3, alternativas: 2, embaralharLista: semEmbaralhar });
    expect(desafios.map(d => d.opcoes.length)).toEqual([2, 2, 2]);
    expect(desafios[0].alvo.id).toBe('gato');
  });

  it('não pede mais alternativas nem mais desafios do que existem figuras', () => {
    const poucos = ITENS.slice(0, 3);
    const desafios = montarDesafios({ itens: poucos, quantidade: 10, alternativas: 6 });
    expect(desafios).toHaveLength(3);
    desafios.forEach(desafio => expect(desafio.opcoes).toHaveLength(3));
  });

  it('devolve rodada vazia quando não dá para montar alternativa nenhuma', () => {
    expect(montarDesafios({ itens: [{ id: 'gato' }] })).toEqual([]);
    expect(montarDesafios({ itens: [] })).toEqual([]);
  });
});

describe('criarSessao', () => {
  const desafios = montarDesafios({ itens: ITENS, quantidade: 3, alternativas: 2, embaralharLista: semEmbaralhar });

  it('começa na primeira pergunta', () => {
    const sessao = criarSessao({ desafios });
    expect(sessao.estado()).toMatchObject({ indice: 0, numero: 1, total: 3, fase: 'pergunta', tentativas: 0 });
  });

  it('marca acerto de primeira e avança', () => {
    const sessao = criarSessao({ desafios });
    const resposta = sessao.responder(desafios[0].alvo.id);
    expect(resposta.certo).toBe(true);
    expect(sessao.estado().fase).toBe('acertou');
    expect(sessao.avancar()).toMatchObject({ indice: 1, fase: 'pergunta', tentativas: 0 });
  });

  it('aceita uma resposta diferente do id da pista', () => {
    const sessao = criarSessao({
      desafios: [{ alvo: { id: 'gato' }, respostaId: 'pato', opcoes: [{ id: 'pato' }, { id: 'bola' }] }],
    });
    expect(sessao.responder('pato').certo).toBe(true);
  });

  it('mostra a resposta depois de duas tentativas e a rodada segue', () => {
    const sessao = criarSessao({ desafios });
    const errada = desafios[0].opcoes.find(opcao => opcao.id !== desafios[0].alvo.id).id;

    const primeira = sessao.responder(errada);
    expect(primeira).toMatchObject({ certo: false, fase: 'pergunta', tentativas: 1 });

    const segunda = sessao.responder(errada);
    expect(segunda).toMatchObject({ certo: false, fase: 'demonstrando', tentativas: 2 });

    expect(sessao.avancar().fase).toBe('pergunta');
  });

  it('ignora toques depois de a questão estar resolvida', () => {
    const sessao = criarSessao({ desafios });
    sessao.responder(desafios[0].alvo.id);
    const depois = sessao.responder(desafios[0].opcoes[0].id);
    expect(sessao.estado().tentativas).toBe(1);
    expect(depois.fase).toBe('acertou');
  });

  it('termina a rodada e conta quem precisou de ajuda, sem pontuar', () => {
    const sessao = criarSessao({ desafios });
    sessao.responder(desafios[0].alvo.id);
    sessao.avancar();

    const errada = desafios[1].opcoes.find(opcao => opcao.id !== desafios[1].alvo.id).id;
    sessao.responder(errada);
    sessao.responder(desafios[1].alvo.id);
    sessao.avancar();

    sessao.responder(desafios[2].alvo.id);
    expect(sessao.avancar().fase).toBe('fim');
    expect(sessao.resumo()).toEqual({ total: 3, semAjuda: 2, comAjuda: 1, concluida: true });
  });

  it('reinicia a mesma rodada do zero', () => {
    const sessao = criarSessao({ desafios });
    sessao.responder(desafios[0].alvo.id);
    sessao.avancar();
    expect(sessao.reiniciar()).toMatchObject({ indice: 0, fase: 'pergunta', tentativas: 0 });
    expect(sessao.resumo()).toMatchObject({ semAjuda: 0, comAjuda: 0 });
  });

  it('nasce encerrada quando não há desafio nenhum', () => {
    const sessao = criarSessao({ desafios: [] });
    expect(sessao.estado().fase).toBe('fim');
    expect(sessao.resumo().concluida).toBe(true);
  });
});
