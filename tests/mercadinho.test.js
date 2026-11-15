import { describe, expect, it } from 'vitest';
import { desejos, produtos, sonhos, temas } from '../Games/mercadinho/dados.js';
import {
  CHAVE_COFRINHO,
  comPreferencia,
  depositar,
  escolherSonho,
  estadoInicial,
  gravarCofrinho,
  lerCofrinho,
  podeRealizar,
  realizarSonho,
  sonhosDisponiveis,
  zerarCofrinho,
} from '../Games/mercadinho/cofrinho.js';
import {
  MISSAO_RESERVA,
  NIVEIS,
  aMais,
  alternativasDeTroco,
  chegarAoCaixa,
  colocarNoCarrinho,
  conferirDados,
  contaArmada,
  coracoesDoCarrinho,
  criarCompra,
  criarGerador,
  devolverDesejo,
  digitar,
  elegivel,
  espiar,
  faltando,
  formatarDinheiro,
  gerarMissao,
  levarDesejo,
  mudarQuantidade,
  opcoesNoNivel,
  pagar,
  precoNoNivel,
  responderConta,
  resultadoDaCompra,
  somaArmada,
  totalDoCarrinho,
} from '../Games/mercadinho/jogo.js';

const porId = Object.fromEntries(produtos.map(p => [p.id, p]));

function combinacoesDesejos(nivel) {
  const maximo = NIVEIS[nivel].maximoDeDesejos;
  const lista = [{ ids: [], custo: 0, coracoes: 0 }];
  if (maximo >= 1) {
    for (let i = 0; i < desejos.length; i++) {
      const d = desejos[i];
      const p1 = precoNoNivel(d.preco, nivel);
      lista.push({ ids: [d.id], custo: p1, coracoes: d.coracoes });
      if (maximo >= 2) {
        for (let j = i + 1; j < desejos.length; j++) {
          const d2 = desejos[j];
          lista.push({
            ids: [d.id, d2.id],
            custo: p1 + precoNoNivel(d2.preco, nivel),
            coracoes: d.coracoes + d2.coracoes,
          });
        }
      }
    }
  }
  return lista;
}

const DESEJOS_POR_NIVEL = {
  1: combinacoesDesejos(1),
  2: combinacoesDesejos(2),
  3: combinacoesDesejos(3),
};

function forcaBrutaMissao(missao, { pararNaPrimeiraValida = false } = {}) {
  const nivel = missao.nivel;
  const opcoesPorItem = missao.itens.map(item =>
    opcoesNoNivel(porId[item.produtoId], nivel).map(op => ({
      produtoId: item.produtoId,
      opcaoId: op.id,
      quantidade: item.quantidade,
      custo: op.preco * item.quantidade,
      coracoes: op.coracoes,
    })),
  );
  const desejoCombos = DESEJOS_POR_NIVEL[nivel];

  let custoMinimo = Infinity;
  let maximoCoracoes = -1;
  let custoDaMeta = Infinity;
  let cestaValida = null;

  const escolhidas = new Array(opcoesPorItem.length);

  function percorrer(idx, custoLista, coracoesLista) {
    if (idx === opcoesPorItem.length) {
      if (custoLista < custoMinimo) custoMinimo = custoLista;
      for (let k = 0; k < desejoCombos.length; k++) {
        const dc = desejoCombos[k];
        const custo = custoLista + dc.custo;
        const coracoes = coracoesLista + dc.coracoes;
        if (custo <= missao.orcamento && coracoes > maximoCoracoes) {
          maximoCoracoes = coracoes;
        }
        if (coracoes >= missao.metaCoracoes && custo < custoDaMeta) {
          custoDaMeta = custo;
        }
        if (!cestaValida && custo <= missao.orcamento && coracoes >= missao.metaCoracoes) {
          cestaValida = {
            opcoes: escolhidas.map(e => ({ ...e })),
            desejoIds: dc.ids,
          };
          if (pararNaPrimeiraValida) return true;
        }
      }
      return false;
    }

    const ops = opcoesPorItem[idx];
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      escolhidas[idx] = op;
      if (percorrer(idx + 1, custoLista + op.custo, coracoesLista + op.coracoes)) return true;
    }
    return false;
  }

  percorrer(0, 0, 0);
  return { custoMinimo, maximoCoracoes, custoDaMeta, cestaValida };
}

function preencherCarrinho(missao, escolherOpcao, desejoIds = []) {
  let compra = criarCompra(missao);
  for (const item of missao.itens) {
    const opcoes = opcoesNoNivel(porId[item.produtoId], missao.nivel);
    const opcao = escolherOpcao(opcoes, item);
    const res = colocarNoCarrinho(compra, item.produtoId, opcao.id, item.quantidade);
    expect(res.recusa).toBeUndefined();
    compra = res.compra;
  }
  for (const desejoId of desejoIds) {
    const res = levarDesejo(compra, desejoId);
    expect(res.recusa).toBeUndefined();
    compra = res.compra;
  }
  return compra;
}

describe('Mercadinho — dados e preços', () => {
  it('tem catálogo válido com 49 produtos, 12 guloseimas, 10 temas e 6 sonhos com ids únicos', () => {
    expect(conferirDados()).toEqual([]);
    expect(produtos).toHaveLength(49);
    expect(desejos).toHaveLength(12);
    expect(temas).toHaveLength(10);
    expect(sonhos).toHaveLength(6);
    expect(new Set(produtos.map(p => p.id)).size).toBe(49);
    expect(new Set(desejos.map(d => d.id)).size).toBe(12);
    expect(new Set(temas.map(t => t.id)).size).toBe(10);
    expect(new Set(sonhos.map(s => s.id)).size).toBe(6);
  });

  it('mantém preços crescentes nos três níveis e corações de 1 a 3 não decrescentes', () => {
    for (const p of produtos) {
      for (const op of p.opcoes) {
        expect(op.coracoes).toBeGreaterThanOrEqual(1);
        expect(op.coracoes).toBeLessThanOrEqual(3);
      }
      for (let i = 1; i < p.opcoes.length; i++) {
        expect(p.opcoes[i].coracoes).toBeGreaterThanOrEqual(p.opcoes[i - 1].coracoes);
      }
      for (const nivel of [1, 2, 3]) {
        const ops = opcoesNoNivel(p, nivel);
        if (nivel === 1 && !elegivel(p, 1)) continue;
        expect(ops.length).toBeGreaterThanOrEqual(2);
        for (let i = 1; i < ops.length; i++) {
          expect(ops[i].preco).toBeGreaterThan(ops[i - 1].preco);
        }
      }
    }
  });

  it('arredonda os cinco casos da tabela 4.3 de precoNoNivel', () => {
    const casos = [
      [529, 550, 530, 529],
      [749, 750, 750, 749],
      [229, 250, 230, 229],
      [1090, 1100, 1090, 1090],
      [1249, 1250, 1250, 1249],
    ];
    for (const [etiqueta, n1, n2, n3] of casos) {
      expect(precoNoNivel(etiqueta, 1)).toBe(n1);
      expect(precoNoNivel(etiqueta, 2)).toBe(n2);
      expect(precoNoNivel(etiqueta, 3)).toBe(n3);
    }
  });

  it('tem vagas apontando para produtos existentes e todo tema gera lista nos 3 níveis', () => {
    for (const tema of temas) {
      for (const vaga of tema.vagas) {
        for (const id of vaga) {
          expect(porId[id]).toBeDefined();
        }
      }
      for (const nivel of [1, 2, 3]) {
        const missao = gerarMissao({ nivel, semente: 42, temaId: tema.id });
        expect(missao.temaId).toBe(tema.id);
        expect(missao.itens).toHaveLength(NIVEIS[nivel].itens);
      }
    }
  });

  it('deixa fora do nível 1 exatamente os seis produtos esperados', () => {
    const inelegiveis = produtos.filter(p => !elegivel(p, 1)).map(p => p.id);
    expect(inelegiveis).toEqual([
      'biscoito-recheado',
      'oleo',
      'acucar',
      'fermento',
      'agua',
      'detergente',
    ]);
  });

  it('reproduz os seis valores de conferência da seção 4.4', () => {
    const esperados = [
      {
        nivel: 1, semente: 7, temaId: 'cafe-da-manha',
        itens: [['pao-de-forma', 1], ['leite', 1], ['mamao', 1]],
        orcamento: 2400, metaCoracoes: 6, maximoCoracoes: 8, custoMinimo: 1800, custoDoMelhor: 2600, custoDaMeta: 2000,
      },
      {
        nivel: 1, semente: 8, temaId: 'lanche-da-escola',
        itens: [['pao-de-forma', 1], ['suco-caixinha', 1], ['queijo', 1]],
        orcamento: 2200, metaCoracoes: 5, maximoCoracoes: 7, custoMinimo: 1750, custoDoMelhor: 2500, custoDaMeta: 1900,
      },
      {
        nivel: 2, semente: 7, temaId: 'cafe-da-manha',
        itens: [['pao-de-forma', 1], ['leite', 2], ['mamao', 1], ['ovos', 1], ['cafe', 1]],
        orcamento: 5500, metaCoracoes: 12, maximoCoracoes: 13, custoMinimo: 4540, custoDoMelhor: 6440, custoDaMeta: 5210,
      },
      {
        nivel: 2, semente: 8, temaId: 'lanche-da-escola',
        itens: [['pao-de-forma', 1], ['suco-caixinha', 2], ['queijo', 1], ['agua', 1], ['biscoito-recheado', 2]],
        orcamento: 3500, metaCoracoes: 11, maximoCoracoes: 12, custoMinimo: 2920, custoDoMelhor: 3960, custoDaMeta: 3300,
      },
      {
        nivel: 3, semente: 7, temaId: 'cafe-da-manha',
        itens: [['pao-de-forma', 1], ['leite', 2], ['mamao', 1], ['ovos', 1], ['cafe', 1], ['queijo', 1], ['iogurte', 3]],
        orcamento: 7500, metaCoracoes: 16, maximoCoracoes: 17, custoMinimo: 6220, custoDoMelhor: 8781, custoDaMeta: 7170,
      },
      {
        nivel: 3, semente: 8, temaId: 'lanche-da-escola',
        itens: [['pao-de-forma', 1], ['suco-caixinha', 2], ['queijo', 1], ['agua', 2], ['biscoito-recheado', 1], ['banana', 1], ['iogurte', 4]],
        orcamento: 5500, metaCoracoes: 15, maximoCoracoes: 16, custoMinimo: 4598, custoDoMelhor: 6568, custoDaMeta: 5248,
      },
    ];

    for (const exp of esperados) {
      const m = gerarMissao({ nivel: exp.nivel, semente: exp.semente });
      expect(m.temaId).toBe(exp.temaId);
      expect(m.itens.map(i => [i.produtoId, i.quantidade])).toEqual(exp.itens);
      expect(m.orcamento).toBe(exp.orcamento);
      expect(m.metaCoracoes).toBe(exp.metaCoracoes);
      expect(m.maximoCoracoes).toBe(exp.maximoCoracoes);
      expect(m.custoMinimo).toBe(exp.custoMinimo);
      expect(m.custoDoMelhor).toBe(exp.custoDoMelhor);
      expect(m.custoDaMeta).toBe(exp.custoDaMeta);
    }
  });
});

describe('Mercadinho — gerador de missões', () => {
  it('gera missões válidas para sementes de 1 a 1.000 nos três níveis sem cair na reserva', () => {
    for (const nivel of [1, 2, 3]) {
      const cfg = NIVEIS[nivel];
      for (let semente = 1; semente <= 1000; semente++) {
        const m = gerarMissao({ nivel, semente });
        expect(m.semente).toBe(semente);
        expect(m.itens).toHaveLength(cfg.itens);
        expect(new Set(m.itens.map(i => i.produtoId)).size).toBe(cfg.itens);
        for (const item of m.itens) {
          if (nivel === 1) {
            expect(item.quantidade).toBe(1);
          } else {
            expect(porId[item.produtoId].quantidades).toContain(item.quantidade);
          }
        }
        expect(m.orcamento % 100).toBe(0);
        expect(m.custoMinimo).toBeLessThan(m.orcamento);
        expect(m.orcamento).toBeLessThan(m.custoDoMelhor);
        expect(m.custoDaMeta).toBeLessThanOrEqual(m.orcamento);
        expect(m.coracoesDaCestaBarata).toBeLessThan(m.metaCoracoes);
        expect(m.metaCoracoes).toBeLessThanOrEqual(m.maximoCoracoes);
      }
    }
  });

  it('é determinístico para a mesma semente e nível e respeita temaId para todos os 10 temas', () => {
    for (const nivel of [1, 2, 3]) {
      const a = gerarMissao({ nivel, semente: 123 });
      const b = gerarMissao({ nivel, semente: 123 });
      expect(a).toEqual(b);

      for (const tema of temas) {
        const m = gerarMissao({ nivel, semente: 99, temaId: tema.id });
        expect(m.temaId).toBe(tema.id);
        expect(m.titulo).toBe(tema.titulo);
      }
    }
  });

  it('confirma maximoCoracoes, custoMinimo e custoDaMeta por força bruta em 50 sementes por nível', () => {
    for (const nivel of [1, 2, 3]) {
      for (let semente = 1; semente <= 50; semente++) {
        const m = gerarMissao({ nivel, semente });
        const fb = forcaBrutaMissao(m);
        expect(fb.custoMinimo).toBe(m.custoMinimo);
        expect(fb.maximoCoracoes).toBe(m.maximoCoracoes);
        expect(fb.custoDaMeta).toBe(m.custoDaMeta);
      }
    }
  });

  it('mantém MISSAO_RESERVA válida nos três níveis e a devolve quando temaId é inválido', () => {
    for (const nivel of [1, 2, 3]) {
      const cfg = NIVEIS[nivel];
      const reserva = MISSAO_RESERVA[nivel];
      expect(reserva).toBeDefined();
      expect(reserva.nivel).toBe(nivel);
      expect(reserva.itens).toHaveLength(cfg.itens);
      expect(new Set(reserva.itens.map(i => i.produtoId)).size).toBe(cfg.itens);
      for (const item of reserva.itens) {
        expect(porId[item.produtoId]).toBeDefined();
        if (nivel === 1) {
          expect(item.quantidade).toBe(1);
        } else {
          expect(porId[item.produtoId].quantidades).toContain(item.quantidade);
        }
      }
      expect(reserva.orcamento % 100).toBe(0);
      expect(reserva.custoMinimo).toBeLessThan(reserva.orcamento);
      expect(reserva.orcamento).toBeLessThan(reserva.custoDoMelhor);
      expect(reserva.custoDaMeta).toBeLessThanOrEqual(reserva.orcamento);
      expect(reserva.coracoesDaCestaBarata).toBeLessThan(reserva.metaCoracoes);
      expect(reserva.metaCoracoes).toBeLessThanOrEqual(reserva.maximoCoracoes);

      const fb = forcaBrutaMissao(reserva);
      expect(fb.custoMinimo).toBe(reserva.custoMinimo);
      expect(fb.maximoCoracoes).toBe(reserva.maximoCoracoes);
      expect(fb.custoDaMeta).toBe(reserva.custoDaMeta);

      const retornada = gerarMissao({ nivel, semente: 1, temaId: 'inexistente' });
      expect(retornada).toEqual(reserva);
      expect(retornada).not.toBe(reserva);
    }
  });
});

describe('Mercadinho — compra e caixa', () => {
  it('coloca, troca opção, muda quantidade, tira e aplica todas as recusas', () => {
    const missao = gerarMissao({ nivel: 2, semente: 7 });
    let compra = criarCompra(missao);

    // Fora da lista
    expect(colocarNoCarrinho(compra, 'sabao-em-po', 'sabao-em-po-1', 1).recusa).toBe('fora-da-lista');
    // Opção inexistente
    expect(colocarNoCarrinho(compra, 'leite', 'leite-9', 1).recusa).toBe('opcao');
    // Quantidade inválida
    expect(colocarNoCarrinho(compra, 'leite', 'leite-1', 0).recusa).toBe('quantidade');
    expect(colocarNoCarrinho(compra, 'leite', 'leite-1', 7).recusa).toBe('quantidade');
    expect(colocarNoCarrinho(compra, 'leite', 'leite-1', 1.5).recusa).toBe('quantidade');

    // Coloca no carrinho
    compra = colocarNoCarrinho(compra, 'leite', 'leite-1', 2).compra;
    expect(compra.carrinho.leite).toEqual({ opcaoId: 'leite-1', quantidade: 2 });

    // Troca opção
    compra = colocarNoCarrinho(compra, 'leite', 'leite-2', 2).compra;
    expect(compra.carrinho.leite).toEqual({ opcaoId: 'leite-2', quantidade: 2 });

    // Muda quantidade e valida
    expect(mudarQuantidade(compra, 'leite', 7).recusa).toBe('quantidade');
    expect(mudarQuantidade(compra, 'ovos', 2).recusa).toBe('fora-da-lista');
    compra = mudarQuantidade(compra, 'leite', 3).compra;
    expect(compra.carrinho.leite.quantidade).toBe(3);

    // 0 tira do carrinho
    compra = mudarQuantidade(compra, 'leite', 0).compra;
    expect(compra.carrinho.leite).toBeUndefined();

    // Limite de guloseimas
    compra = levarDesejo(compra, 'batom').compra;
    expect(levarDesejo(compra, 'batom').recusa).toBe('repetido');
    compra = levarDesejo(compra, 'toddynho').compra;
    expect(levarDesejo(compra, 'trident').recusa).toBe('limite');
    compra = devolverDesejo(compra, 'batom').compra;
    expect(compra.desejos).toEqual(['toddynho']);
  });

  it('calcula total com quantidades, corações uma vez por linha, faltando e aMais', () => {
    const missao = gerarMissao({ nivel: 2, semente: 7 });
    // itens: pao-de-forma x1, leite x2, mamao x1, ovos x1, cafe x1
    let compra = criarCompra(missao);
    // leite-2 = 590, ovos-1 = 1080
    compra = colocarNoCarrinho(compra, 'leite', 'leite-2', 3).compra;
    compra = colocarNoCarrinho(compra, 'ovos', 'ovos-1', 1).compra;
    compra = levarDesejo(compra, 'batom').compra; // 200 no nível 2, 1 coração

    expect(totalDoCarrinho(compra)).toBe(590 * 3 + 1080 + 200);
    // corações: leite-2 (2) + ovos-1 (2) + batom (1) = 5 (leite x3 conta 1 vez)
    expect(coracoesDoCarrinho(compra)).toBe(5);

    expect(faltando(compra)).toEqual([
      { produtoId: 'pao-de-forma', falta: 1 },
      { produtoId: 'mamao', falta: 1 },
      { produtoId: 'cafe', falta: 1 },
    ]);
    expect(aMais(compra)).toEqual([{ produtoId: 'leite', sobra: 1 }]);
  });

  it('controla espiadas nos três níveis', () => {
    for (const nivel of [1, 3]) {
      const c = criarCompra(gerarMissao({ nivel, semente: 7 }));
      expect(espiar(c).recusa).toBe('sem-espiadas');
    }
    let c2 = criarCompra(gerarMissao({ nivel: 2, semente: 7 }));
    c2 = colocarNoCarrinho(c2, 'leite', 'leite-1', 2).compra;
    const e1 = espiar(c2);
    expect(e1.total).toBe(1060);
    expect(e1.compra.espiadasRestantes).toBe(1);
    const e2 = espiar(e1.compra);
    expect(e2.compra.espiadasRestantes).toBe(0);
    expect(espiar(e2.compra).recusa).toBe('sem-espiadas');
  });

  it('trata os três casos de chegarAoCaixa e acumula estouros', () => {
    const missao = gerarMissao({ nivel: 2, semente: 7 });
    const incompleta = criarCompra(missao);
    expect(chegarAoCaixa(incompleta).situacao).toBe('falta-item');

    const cara = preencherCarrinho(missao, ops => ops.at(-1));
    const cx1 = chegarAoCaixa(cara);
    expect(cx1.situacao).toBe('estourou');
    expect(cx1.diferenca).toBe(cx1.total - missao.orcamento);
    expect(cx1.compra.estouros).toBe(1);

    const cx2 = chegarAoCaixa(cx1.compra);
    expect(cx2.compra.estouros).toBe(2);

    const barata = preencherCarrinho(missao, ops => ops[0]);
    const cxOk = chegarAoCaixa(barata);
    expect(cxOk.situacao).toBe('ok');
    expect(cxOk.troco).toBe(missao.orcamento - cxOk.total);
  });

  it('calcula estrelas e objetivos para 1, 2 (corações), 2 (contas) e 3 estrelas', () => {
    const missao = gerarMissao({ nivel: 2, semente: 7 });
    const { cestaValida } = forcaBrutaMissao(missao, { pararNaPrimeiraValida: true });

    // Cenário 3 estrelas: cesta esperta, sem estouro, troco certo de primeira
    let c3 = criarCompra(missao);
    for (const op of cestaValida.opcoes) {
      c3 = colocarNoCarrinho(c3, op.produtoId, op.opcaoId, op.quantidade).compra;
    }
    for (const d of cestaValida.desejoIds) c3 = levarDesejo(c3, d).compra;
    const total3 = totalDoCarrinho(c3);
    c3 = responderConta(c3, 'troco', missao.orcamento - total3, 1).compra;
    c3 = pagar(c3);
    const r3 = resultadoDaCompra(c3);
    expect(r3.estrelas).toBe(3);
    expect(r3.objetivos).toEqual({ missaoCumprida: true, familiaFeliz: true, contasCertas: true });
    expect(r3.acertos).toBe(1);
    expect(r3.erros).toBe(0);

    // Cenário 2 estrelas (corações + lista, mas errou a conta na 1ª tentativa)
    let c2Cor = criarCompra(missao);
    for (const op of cestaValida.opcoes) {
      c2Cor = colocarNoCarrinho(c2Cor, op.produtoId, op.opcaoId, op.quantidade).compra;
    }
    for (const d of cestaValida.desejoIds) c2Cor = levarDesejo(c2Cor, d).compra;
    c2Cor = responderConta(c2Cor, 'troco', 99999, 1).compra;
    c2Cor = responderConta(c2Cor, 'troco', missao.orcamento - total3, 2).compra;
    c2Cor = pagar(c2Cor);
    const r2Cor = resultadoDaCompra(c2Cor);
    expect(r2Cor.estrelas).toBe(2);
    expect(r2Cor.objetivos).toEqual({ missaoCumprida: true, familiaFeliz: true, contasCertas: false });
    expect(r2Cor.erros).toBe(1);

    // Cenário 2 estrelas (contas + lista, mas cesta barata sem bater corações)
    let c2Contas = preencherCarrinho(missao, ops => ops[0]);
    const totalBarata = totalDoCarrinho(c2Contas);
    c2Contas = responderConta(c2Contas, 'troco', missao.orcamento - totalBarata, 1).compra;
    c2Contas = pagar(c2Contas);
    const r2Contas = resultadoDaCompra(c2Contas);
    expect(r2Contas.estrelas).toBe(2);
    expect(r2Contas.objetivos).toEqual({ missaoCumprida: true, familiaFeliz: false, contasCertas: true });
    expect(r2Contas.escolhas.every(e => e.posicao === 'em-conta')).toBe(true);

    // Cenário 1 estrela (só lista: barata + estouro/erro)
    let c1 = preencherCarrinho(missao, ops => ops[0]);
    c1 = { ...c1, estouros: 1 };
    c1 = responderConta(c1, 'troco', 0, 1).compra;
    c1 = pagar(c1);
    const r1 = resultadoDaCompra(c1);
    expect(r1.estrelas).toBe(1);
    expect(r1.objetivos).toEqual({ missaoCumprida: true, familiaFeliz: false, contasCertas: false });
  });

  it('opera digitar, alternativasDeTroco e contaArmada conforme a especificação', () => {
    let valor = 0;
    for (const d of [5, 2, 1, 0]) valor = digitar(valor, d);
    expect(valor).toBe(5210);
    expect(digitar(valor, 'apagar')).toBe(521);
    expect(digitar(99999, 9)).toBe(99999);
    expect(formatarDinheiro(valor)).toBe('R$ 52,10');

    for (const troco of [0, 50, 290, 1000]) {
      const alts = alternativasDeTroco(troco, criarGerador(troco + 1));
      expect(alts).toHaveLength(3);
      expect(new Set(alts).size).toBe(3);
      expect(alts).toContain(troco);
      expect(alts.every(v => v >= 0)).toBe(true);
    }

    expect(contaArmada(5500, 5210, '-')).toEqual([
      '  55,00',
      '− 52,10',
      '───────',
      '   2,90',
    ]);
    expect(contaArmada(1250, 300, '+')).toEqual([
      '  12,50',
      '+  3,00',
      '───────',
      '  15,50',
    ]);
    expect(somaArmada([450, 1200, 75])).toEqual([
      '   4,50',
      '  12,00',
      '+  0,75',
      '───────',
      '  17,25',
    ]);
  });

  it('conta só a primeira resposta de cada tipo de conta, mesmo se a criança voltar do caixa', () => {
    const missao = gerarMissao({ nivel: 3, semente: 7 });
    let compra = criarCompra(missao);
    for (let i = 0; i < 3; i++) {
      compra = responderConta(compra, 'total', totalDoCarrinho(compra), 1).compra;
    }
    compra = responderConta(compra, 'troco', missao.orcamento - totalDoCarrinho(compra), 1).compra;
    expect(compra.contas).toEqual([
      { tipo: 'total', certaDePrimeira: true },
      { tipo: 'troco', certaDePrimeira: true },
    ]);
  });
});

describe('Mercadinho — simulações (300 sementes por nível)', () => {
  it('simula comprador econômico, exagerado e esperto em 300 sementes por nível', () => {
    for (const nivel of [1, 2, 3]) {
      for (let semente = 1; semente <= 300; semente++) {
        const missao = gerarMissao({ nivel, semente });

        // Comprador econômico: sempre a mais barata, sem guloseima
        let eco = preencherCarrinho(missao, ops => ops[0]);
        const cxEco = chegarAoCaixa(eco);
        expect(cxEco.situacao).toBe('ok');
        const ecoSemContas = pagar(cxEco.compra);
        const resEcoSemContas = resultadoDaCompra(ecoSemContas);
        expect(resEcoSemContas.estrelas).toBe(1);
        expect(resEcoSemContas.objetivos).toEqual({
          missaoCumprida: true,
          familiaFeliz: false,
          contasCertas: false,
        });

        eco = cxEco.compra;
        if (nivel === 3) eco = responderConta(eco, 'total', cxEco.total, 1).compra;
        eco = responderConta(eco, 'troco', cxEco.troco, 1).compra;
        eco = pagar(eco);
        const resEco = resultadoDaCompra(eco);
        expect(resEco.estrelas).toBe(2);
        expect(resEco.objetivos).toEqual({
          missaoCumprida: true,
          familiaFeliz: false,
          contasCertas: true,
        });

        // Comprador exagerado: sempre a de mais corações
        const exag = preencherCarrinho(missao, ops => ops.at(-1));
        expect(chegarAoCaixa(exag).situacao).toBe('estourou');

        // Comprador esperto: segue uma cesta encontrada pela força bruta
        const { cestaValida } = forcaBrutaMissao(missao, { pararNaPrimeiraValida: true });
        expect(cestaValida).not.toBeNull();
        let esp = criarCompra(missao);
        for (const op of cestaValida.opcoes) {
          esp = colocarNoCarrinho(esp, op.produtoId, op.opcaoId, op.quantidade).compra;
        }
        for (const desejoId of cestaValida.desejoIds) {
          esp = levarDesejo(esp, desejoId).compra;
        }
        const cxEsp = chegarAoCaixa(esp);
        expect(cxEsp.situacao).toBe('ok');
        esp = cxEsp.compra;
        if (nivel === 3) esp = responderConta(esp, 'total', cxEsp.total, 1).compra;
        esp = responderConta(esp, 'troco', cxEsp.troco, 1).compra;
        esp = pagar(esp);
        const resEsp = resultadoDaCompra(esp);
        expect(resEsp.estrelas).toBe(3);
      }
    }
  });
});

function criarArmazenamento(inicial = {}) {
  const dados = new Map(Object.entries(inicial));
  return {
    getItem: chave => dados.get(chave) ?? null,
    setItem: (chave, valor) => dados.set(chave, String(valor)),
    removeItem: chave => dados.delete(chave),
  };
}

const armazenamentoBloqueado = {
  getItem: () => { throw new Error('bloqueado'); },
  setItem: () => { throw new Error('bloqueado'); },
  removeItem: () => { throw new Error('bloqueado'); },
};

describe('Cofrinho e sonhos', () => {
  it('começa vazio quando não há nada salvo', () => {
    expect(lerCofrinho(criarArmazenamento())).toEqual(estadoInicial());
  });

  it('deposita o troco e conta a compra', () => {
    let estado = depositar(estadoInicial(), 290);
    estado = depositar(estado, 1050);
    expect(estado.cofrinho).toBe(1340);
    expect(estado.compras).toBe(2);
  });

  it('troco zero ou inválido não muda o dinheiro, mas conta a compra', () => {
    expect(depositar(estadoInicial(), 0)).toMatchObject({ cofrinho: 0, compras: 1 });
    expect(depositar(estadoInicial(), -50)).toMatchObject({ cofrinho: 0, compras: 1 });
    expect(depositar(estadoInicial(), 1.5)).toMatchObject({ cofrinho: 0, compras: 1 });
  });

  it('escolhe e troca o sonho sem mexer no dinheiro', () => {
    let estado = { ...estadoInicial(), cofrinho: 700 };
    estado = escolherSonho(estado, 'canetinhas');
    expect(estado.sonhoAtual).toBe('canetinhas');
    estado = escolherSonho(estado, 'bola');
    expect(estado).toMatchObject({ sonhoAtual: 'bola', cofrinho: 700 });
    expect(escolherSonho(estado, 'nave-espacial')).toBe(estado);
  });

  it('realiza o sonho descontando o preço exato e guarda na estante', () => {
    let estado = escolherSonho({ ...estadoInicial(), cofrinho: 1499 }, 'caderno');
    expect(podeRealizar(estado)).toBe(false);
    expect(realizarSonho(estado)).toBe(estado);

    estado = depositar(estado, 251);
    expect(podeRealizar(estado)).toBe(true);
    estado = realizarSonho(estado);
    expect(estado).toMatchObject({ cofrinho: 250, sonhoAtual: null, sonhosRealizados: ['caderno'] });
  });

  it('sonho realizado sai da escolha até todos estarem na estante', () => {
    const umRealizado = { ...estadoInicial(), sonhosRealizados: ['caderno'] };
    expect(sonhosDisponiveis(umRealizado).map(s => s.id)).not.toContain('caderno');
    expect(escolherSonho(umRealizado, 'caderno').sonhoAtual).toBe(null);

    const todos = { ...estadoInicial(), sonhosRealizados: sonhos.map(s => s.id) };
    expect(sonhosDisponiveis(todos)).toHaveLength(sonhos.length);
    expect(escolherSonho(todos, 'caderno').sonhoAtual).toBe('caderno');
  });

  it('grava e lê de volta o mesmo estado', () => {
    const armazenamento = criarArmazenamento();
    let estado = escolherSonho(depositar(estadoInicial(), 1240), 'canetinhas');
    estado = comPreferencia(comPreferencia(estado, 'tutorialVisto', true), 'modoLista', true);
    expect(gravarCofrinho(estado, armazenamento)).toBe(true);
    expect(lerCofrinho(armazenamento)).toEqual(estado);
  });

  it('JSON inválido devolve o estado inicial', () => {
    const armazenamento = criarArmazenamento({ [CHAVE_COFRINHO]: '{cofrinho: 10' });
    expect(lerCofrinho(armazenamento)).toEqual(estadoInicial());
  });

  it('versão desconhecida devolve o estado inicial', () => {
    const armazenamento = criarArmazenamento({
      [CHAVE_COFRINHO]: JSON.stringify({ versao: 2, cofrinho: 5000 }),
    });
    expect(lerCofrinho(armazenamento)).toEqual(estadoInicial());
  });

  it('campos estragados voltam ao valor inicial um por um', () => {
    const armazenamento = criarArmazenamento({
      [CHAVE_COFRINHO]: JSON.stringify({
        versao: 1, cofrinho: -3, sonhoAtual: 'nave', sonhosRealizados: ['bola', 'nave'], compras: '7', tutorialVisto: true,
      }),
    });
    expect(lerCofrinho(armazenamento)).toEqual({
      ...estadoInicial(), sonhosRealizados: ['bola'], tutorialVisto: true,
    });
  });

  it('armazenamento bloqueado ou ausente devolve estado utilizável e não lança erro', () => {
    expect(lerCofrinho(armazenamentoBloqueado)).toEqual(estadoInicial());
    expect(gravarCofrinho(estadoInicial(), armazenamentoBloqueado)).toBe(false);
    expect(lerCofrinho(null)).toEqual(estadoInicial());
    expect(gravarCofrinho(estadoInicial(), null)).toBe(false);
    const estado = realizarSonho(escolherSonho(depositar(lerCofrinho(armazenamentoBloqueado), 1500), 'caderno'));
    expect(estado.sonhosRealizados).toEqual(['caderno']);
  });

  it('só aceita tutorialVisto e modoLista como preferência', () => {
    const estado = estadoInicial();
    expect(comPreferencia(estado, 'cofrinho', 9999)).toBe(estado);
  });

  it('repetir um sonho depois de todos realizados não duplica a estante', () => {
    const todos = sonhos.map(s => s.id);
    let estado = { ...estadoInicial(), cofrinho: 100000, sonhosRealizados: [...todos] };
    estado = realizarSonho(escolherSonho(estado, todos[0]));
    expect(estado.sonhosRealizados).toEqual(todos);
  });

  it('lerCofrinho remove sonhos repetidos já gravados', () => {
    const armazenamento = criarArmazenamento({
      [CHAVE_COFRINHO]: JSON.stringify({ versao: 1, sonhosRealizados: ['bola', 'bola', 'caderno'] }),
    });
    expect(lerCofrinho(armazenamento).sonhosRealizados).toEqual(['bola', 'caderno']);
  });

  it('zerarCofrinho apaga dinheiro e sonhos mas mantém as preferências', () => {
    const armazenamento = criarArmazenamento({
      [CHAVE_COFRINHO]: JSON.stringify({
        versao: 1, cofrinho: 900, sonhoAtual: 'bola', sonhosRealizados: ['caderno'], compras: 4,
        tutorialVisto: true, modoLista: true,
      }),
    });
    expect(zerarCofrinho(armazenamento)).toBe(true);
    expect(lerCofrinho(armazenamento)).toEqual({ ...estadoInicial(), tutorialVisto: true, modoLista: true });
    expect(zerarCofrinho(armazenamentoBloqueado)).toBe(false);
  });
});
