import { produtos, desejos, temas, sonhos } from './dados.js';
import { criarGerador } from '../labirinto/jogo.js';
import { embaralhar } from '../../shared/texto.js';
import { formatarDinheiro, somarCentavos } from '../dinheirinho/jogo.js';

export { criarGerador, formatarDinheiro, somarCentavos };

export const NIVEIS = Object.freeze({
  1: Object.freeze({
    itens: 3,
    linhasComQuantidade: 0,
    maximoDeDesejos: 1,
    tolerancia: 2,
    passos: [1000, 500, 200, 100],
    arredondar: 100,
    espiadas: 0,
  }),
  2: Object.freeze({
    itens: 5,
    linhasComQuantidade: 2,
    maximoDeDesejos: 2,
    tolerancia: 1,
    passos: [1000, 500, 200, 100],
    arredondar: 100,
    espiadas: 2,
  }),
  3: Object.freeze({
    itens: 7,
    linhasComQuantidade: 3,
    maximoDeDesejos: 2,
    tolerancia: 1,
    passos: [500, 200, 100],
    arredondar: 1,
    espiadas: 0,
  }),
});

export const JANELA = Object.freeze({ inicio: 0.40, fim: 0.75 });
export const AMPLITUDE_MINIMA = Object.freeze({ 1: 300, 2: 400, 3: 500 });

export const MISSAO_RESERVA = Object.freeze({
  1: Object.freeze({
    nivel: 1,
    semente: 0,
    temaId: 'cafe-da-manha',
    titulo: 'Café da manhã',
    itens: [
      { produtoId: 'pao-de-forma', quantidade: 1 },
      { produtoId: 'leite', quantidade: 1 },
      { produtoId: 'mamao', quantidade: 1 },
    ],
    orcamento: 2200,
    metaCoracoes: 6,
    maximoCoracoes: 8,
    custoMinimo: 1700,
    custoDoMelhor: 2500,
    custoDaMeta: 1900,
    coracoesDaCestaBarata: 4,
  }),
  2: Object.freeze({
    nivel: 2,
    semente: 0,
    temaId: 'cafe-da-manha',
    titulo: 'Café da manhã',
    itens: [
      { produtoId: 'pao-de-forma', quantidade: 1 },
      { produtoId: 'leite', quantidade: 2 },
      { produtoId: 'mamao', quantidade: 1 },
      { produtoId: 'ovos', quantidade: 1 },
      { produtoId: 'cafe', quantidade: 1 },
    ],
    orcamento: 5500,
    metaCoracoes: 12,
    maximoCoracoes: 13,
    custoMinimo: 4400,
    custoDoMelhor: 6300,
    custoDaMeta: 5200,
    coracoesDaCestaBarata: 7,
  }),
  3: Object.freeze({
    nivel: 3,
    semente: 0,
    temaId: 'cafe-da-manha',
    titulo: 'Café da manhã',
    itens: [
      { produtoId: 'pao-de-forma', quantidade: 1 },
      { produtoId: 'leite', quantidade: 2 },
      { produtoId: 'mamao', quantidade: 1 },
      { produtoId: 'ovos', quantidade: 1 },
      { produtoId: 'cafe', quantidade: 1 },
      { produtoId: 'queijo', quantidade: 1 },
      { produtoId: 'iogurte', quantidade: 3 },
    ],
    orcamento: 7500,
    metaCoracoes: 16,
    maximoCoracoes: 17,
    custoMinimo: 6220,
    custoDoMelhor: 8781,
    custoDaMeta: 7170,
    coracoesDaCestaBarata: 9,
  }),
});

const SECOES_VALIDAS = new Set([
  'hortifruti',
  'padaria',
  'laticinios',
  'mercearia',
  'acougue',
  'bebidas',
  'limpeza',
]);
const KEBAB_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const sortear = (lista, rnd) => lista[Math.floor(rnd() * lista.length)];
const porId = Object.fromEntries(produtos.map(p => [p.id, p]));
const desejoPorId = Object.fromEntries(desejos.map(d => [d.id, d]));

function clonarMissao(missao) {
  return {
    ...missao,
    itens: missao.itens.map(item => ({ ...item })),
  };
}

export function precoNoNivel(preco, nivel) {
  const passo = NIVEIS[nivel].arredondar;
  return Math.max(passo, Math.round(preco / passo) * passo);
}

/** Opções que aparecem na prateleira em cada nível, já com o preço do nível, da mais barata para a mais cara. */
export function opcoesNoNivel(produto, nivel) {
  // Nos níveis 1 e 2 os preços são em reais inteiros. Se o arredondamento juntar duas opções
  // no mesmo preço (ex.: R$ 4,99 e R$ 5,49 → R$ 5,00), a mais cara sobe um real.
  const passo = NIVEIS[nivel].arredondar;
  let opcoes = [];
  for (const o of produto.opcoes) {
    const anterior = opcoes.length ? opcoes[opcoes.length - 1].preco : 0;
    opcoes.push({ ...o, preco: Math.max(precoNoNivel(o.preco, nivel), anterior + passo) });
  }
  if (nivel === 1) {
    const barata = opcoes[0];
    const maximo = Math.max(...opcoes.map(o => o.coracoes));
    const querida = opcoes.find(o => o.coracoes === maximo);
    opcoes = barata === querida ? [barata] : [barata, querida];
  }
  return opcoes;
}

/** Um produto só entra na lista se a escolha for de verdade: preços diferentes e crescentes; no nível 1, também corações diferentes e R$ 1,00 de distância. */
export function elegivel(produto, nivel) {
  const o = opcoesNoNivel(produto, nivel);
  if (o.length < 2) return false;
  for (let i = 1; i < o.length; i++) if (o[i].preco <= o[i - 1].preco) return false;
  if (nivel === 1) return o[1].preco - o[0].preco >= 100 && o[1].coracoes > o[0].coracoes;
  return true;
}

/**
 * Menor custo para somar exatamente h corações.
 * `somenteLista`: Map(corações → custo) escolhendo uma opção de cada item da lista.
 * `comDesejos`: o mesmo, podendo levar até `maximoDeDesejos` guloseimas.
 */
export function tabelaDeCustos(itens, nivel) {
  const guardarMenor = (mapa, coracoes, custo) => {
    if (!mapa.has(coracoes) || mapa.get(coracoes) > custo) mapa.set(coracoes, custo);
  };
  let somenteLista = new Map([[0, 0]]);
  for (const item of itens) {
    const proxima = new Map();
    const opcoes = opcoesNoNivel(porId[item.produtoId], nivel);
    for (const [coracoes, custo] of somenteLista) {
      for (const opcao of opcoes) {
        guardarMenor(proxima, coracoes + opcao.coracoes, custo + opcao.preco * item.quantidade);
      }
    }
    somenteLista = proxima;
  }
  // camadas[d] = melhor custo usando exatamente d desejos
  const maximo = NIVEIS[nivel].maximoDeDesejos;
  const camadas = [somenteLista, ...Array.from({ length: maximo }, () => new Map())];
  for (const desejo of desejos) {
    const preco = precoNoNivel(desejo.preco, nivel);
    for (let d = maximo; d >= 1; d--) {
      for (const [coracoes, custo] of camadas[d - 1]) {
        guardarMenor(camadas[d], coracoes + desejo.coracoes, custo + preco);
      }
    }
  }
  const comDesejos = new Map();
  for (const camada of camadas) {
    for (const [coracoes, custo] of camada) guardarMenor(comDesejos, coracoes, custo);
  }
  return { somenteLista, comDesejos };
}

export function montarLista(tema, nivel, rnd) {
  const cfg = NIVEIS[nivel];
  const fixas = tema.vagas.slice(0, tema.fixas);
  const outras = embaralhar(tema.vagas.slice(tema.fixas), rnd);
  const itens = [];
  for (const vaga of [...fixas, ...outras]) {
    if (itens.length >= cfg.itens) break;
    const candidatos = vaga.filter(id => elegivel(porId[id], nivel) && !itens.some(i => i.produtoId === id));
    if (!candidatos.length) continue;
    itens.push({ produtoId: sortear(candidatos, rnd), quantidade: 1 });
  }
  if (itens.length < cfg.itens) return null;
  const comQuantidade = embaralhar(
    itens.filter(i => porId[i.produtoId].quantidades.some(q => q > 1)),
    rnd,
  ).slice(0, cfg.linhasComQuantidade);
  for (const item of comQuantidade) {
    item.quantidade = sortear(porId[item.produtoId].quantidades.filter(q => q > 1), rnd);
  }
  // produtos que só existem em quantidade > 1 (iogurte, suco de caixinha) nunca ficam com 1
  for (const item of itens) {
    const qs = porId[item.produtoId].quantidades;
    if (!qs.includes(item.quantidade)) item.quantidade = nivel === 1 ? 1 : qs[0];
  }
  return itens;
}

export function calcularMissao(itens, nivel, rnd) {
  const cfg = NIVEIS[nivel];
  const { somenteLista, comDesejos } = tabelaDeCustos(itens, nivel);
  const custoMinimo = Math.min(...somenteLista.values());
  const coracoesMaximosDaLista = Math.max(...somenteLista.keys());
  const custoDoMelhor = somenteLista.get(coracoesMaximosDaLista);
  const coracoesDaCestaBarata = Math.max(
    ...[...somenteLista].filter(([, c]) => c === custoMinimo).map(([h]) => h),
  );
  const amplitude = custoDoMelhor - custoMinimo;
  if (amplitude < AMPLITUDE_MINIMA[nivel]) return { motivo: 'amplitude' };
  const de = custoMinimo + JANELA.inicio * amplitude;
  const ate = custoMinimo + JANELA.fim * amplitude;
  let candidatos = [];
  for (const passo of cfg.passos) {
    for (let v = Math.ceil(de / passo) * passo; v <= ate; v += passo) candidatos.push(v);
    if (candidatos.length) break;
  }
  if (!candidatos.length) return { motivo: 'janela' };
  const orcamento = sortear(candidatos, rnd);
  const maximoCoracoes = Math.max(
    ...[...comDesejos].filter(([, c]) => c <= orcamento).map(([h]) => h),
  );
  const metaCoracoes = maximoCoracoes - cfg.tolerancia;
  if (metaCoracoes <= coracoesDaCestaBarata) return { motivo: 'meta' };
  const custoDaMeta = Math.min(
    ...[...comDesejos].filter(([h]) => h >= metaCoracoes).map(([, c]) => c),
  );
  return {
    orcamento,
    metaCoracoes,
    maximoCoracoes,
    custoMinimo,
    custoDoMelhor,
    custoDaMeta,
    coracoesDaCestaBarata,
  };
}

export function gerarMissao({ nivel = 2, semente = 1, temaId } = {}) {
  const nivelNum = NIVEIS[nivel] ? Number(nivel) : 2;
  const rnd = criarGerador(semente);
  const temaFixo = temaId ? temas.find(t => t.id === temaId) : null;
  if (temaId && !temaFixo) return clonarMissao(MISSAO_RESERVA[nivelNum]);
  for (let tentativa = 0; tentativa < 40; tentativa++) {
    const tema = temaFixo || sortear(temas, rnd);
    const itens = montarLista(tema, nivelNum, rnd);
    if (!itens) continue;
    const contas = calcularMissao(itens, nivelNum, rnd);
    if (contas.motivo) continue;
    return {
      nivel: nivelNum,
      semente,
      temaId: tema.id,
      titulo: tema.titulo,
      itens,
      ...contas,
    };
  }
  return clonarMissao(MISSAO_RESERVA[nivelNum]);
}

export function criarCompra(missao) {
  return {
    missao,
    carrinho: {},
    desejos: [],
    espiadasRestantes: NIVEIS[missao.nivel].espiadas,
    estouros: 0,
    contas: [],
    paga: false,
  };
}

function itemNaLista(missao, produtoId) {
  return missao.itens.some(item => item.produtoId === produtoId);
}

export function colocarNoCarrinho(compra, produtoId, opcaoId, quantidade = 1) {
  const produto = porId[produtoId];
  if (!produto || !itemNaLista(compra.missao, produtoId)) {
    return { compra, recusa: 'fora-da-lista' };
  }
  const opcoes = opcoesNoNivel(produto, compra.missao.nivel);
  if (!opcoes.some(o => o.id === opcaoId)) {
    return { compra, recusa: 'opcao' };
  }
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 6) {
    return { compra, recusa: 'quantidade' };
  }
  return {
    compra: {
      ...compra,
      carrinho: {
        ...compra.carrinho,
        [produtoId]: { opcaoId, quantidade },
      },
    },
  };
}

export function mudarQuantidade(compra, produtoId, quantidade) {
  if (!Number.isInteger(quantidade) || quantidade < 0 || quantidade > 6) {
    return { compra, recusa: 'quantidade' };
  }
  if (quantidade === 0) {
    if (!compra.carrinho[produtoId]) return { compra };
    const novoCarrinho = { ...compra.carrinho };
    delete novoCarrinho[produtoId];
    return { compra: { ...compra, carrinho: novoCarrinho } };
  }
  if (!compra.carrinho[produtoId]) {
    return { compra, recusa: 'fora-da-lista' };
  }
  return {
    compra: {
      ...compra,
      carrinho: {
        ...compra.carrinho,
        [produtoId]: { ...compra.carrinho[produtoId], quantidade },
      },
    },
  };
}

export function levarDesejo(compra, desejoId) {
  if (!desejoPorId[desejoId]) return { compra, recusa: 'desejo' };
  if (compra.desejos.includes(desejoId)) return { compra, recusa: 'repetido' };
  const limite = NIVEIS[compra.missao.nivel].maximoDeDesejos;
  if (compra.desejos.length >= limite) return { compra, recusa: 'limite' };
  return {
    compra: {
      ...compra,
      desejos: [...compra.desejos, desejoId],
    },
  };
}

export function devolverDesejo(compra, desejoId) {
  return {
    compra: {
      ...compra,
      desejos: compra.desejos.filter(id => id !== desejoId),
    },
  };
}

function opcaoEscolhida(produtoId, opcaoId, nivel) {
  const produto = porId[produtoId];
  return opcoesNoNivel(produto, nivel).find(o => o.id === opcaoId);
}

export function totalDoCarrinho(compra) {
  const nivel = compra.missao.nivel;
  let total = 0;
  for (const [produtoId, entrada] of Object.entries(compra.carrinho)) {
    const opcao = opcaoEscolhida(produtoId, entrada.opcaoId, nivel);
    if (opcao) total += opcao.preco * entrada.quantidade;
  }
  for (const desejoId of compra.desejos) {
    const desejo = desejoPorId[desejoId];
    if (desejo) total += precoNoNivel(desejo.preco, nivel);
  }
  return total;
}

export function coracoesDoCarrinho(compra) {
  const nivel = compra.missao.nivel;
  let coracoes = 0;
  for (const [produtoId, entrada] of Object.entries(compra.carrinho)) {
    const opcao = opcaoEscolhida(produtoId, entrada.opcaoId, nivel);
    if (opcao) coracoes += opcao.coracoes;
  }
  for (const desejoId of compra.desejos) {
    const desejo = desejoPorId[desejoId];
    if (desejo) coracoes += desejo.coracoes;
  }
  return coracoes;
}

export function faltando(compra) {
  const resultado = [];
  for (const item of compra.missao.itens) {
    const noCarrinho = compra.carrinho[item.produtoId]?.quantidade || 0;
    if (noCarrinho < item.quantidade) {
      resultado.push({ produtoId: item.produtoId, falta: item.quantidade - noCarrinho });
    }
  }
  return resultado;
}

export function aMais(compra) {
  const resultado = [];
  for (const item of compra.missao.itens) {
    const noCarrinho = compra.carrinho[item.produtoId]?.quantidade || 0;
    if (noCarrinho > item.quantidade) {
      resultado.push({ produtoId: item.produtoId, sobra: noCarrinho - item.quantidade });
    }
  }
  return resultado;
}

export function espiar(compra) {
  if (compra.espiadasRestantes <= 0) {
    return { compra, recusa: 'sem-espiadas' };
  }
  return {
    compra: {
      ...compra,
      espiadasRestantes: compra.espiadasRestantes - 1,
    },
    total: totalDoCarrinho(compra),
  };
}

export function chegarAoCaixa(compra) {
  const itensFaltando = faltando(compra);
  if (itensFaltando.length > 0) {
    return { situacao: 'falta-item', faltando: itensFaltando, compra };
  }
  const total = totalDoCarrinho(compra);
  if (total > compra.missao.orcamento) {
    return {
      situacao: 'estourou',
      total,
      diferenca: total - compra.missao.orcamento,
      compra: {
        ...compra,
        estouros: compra.estouros + 1,
      },
    };
  }
  return {
    situacao: 'ok',
    total,
    troco: compra.missao.orcamento - total,
    compra,
  };
}

export function responderConta(compra, tipo, valor, tentativa = 1) {
  const total = totalDoCarrinho(compra);
  const respostaCerta = tipo === 'total' ? total : compra.missao.orcamento - total;
  const certa = valor === respostaCerta;
  // Só a primeira resposta de cada tipo conta: no nível 3 a criança pode responder o total,
  // estourar, voltar à loja e responder de novo — isso não pode inflar acertos nem erros.
  const jaRespondida = compra.contas.some(c => c.tipo === tipo);
  const contas = tentativa === 1 && !jaRespondida
    ? [...compra.contas, { tipo, certaDePrimeira: certa }]
    : compra.contas;
  return {
    compra: { ...compra, contas },
    certa,
    respostaCerta,
  };
}

export function pagar(compra) {
  return { ...compra, paga: true };
}

function posicaoDaOpcao(produtoId, opcaoId, nivel) {
  const opcoes = opcoesNoNivel(porId[produtoId], nivel);
  const indice = opcoes.findIndex(o => o.id === opcaoId);
  if (indice <= 0) return 'em-conta';
  if (indice === opcoes.length - 1) return 'queridinha';
  return 'meio';
}

export function resultadoDaCompra(compra) {
  const total = totalDoCarrinho(compra);
  const coracoes = coracoesDoCarrinho(compra);
  const missaoCumprida = Boolean(compra.paga)
    && faltando(compra).length === 0
    && total <= compra.missao.orcamento;
  const familiaFeliz = missaoCumprida && coracoes >= compra.missao.metaCoracoes;
  const contasEsperadas = compra.missao.nivel === 3 ? 2 : 1;
  const acertos = compra.contas.filter(c => c.certaDePrimeira).length;
  const errosDeConta = compra.contas.filter(c => !c.certaDePrimeira).length;
  const erros = errosDeConta + compra.estouros;
  const contasCertas =
    missaoCumprida
    && compra.estouros === 0
    && errosDeConta === 0
    && acertos >= contasEsperadas;
  const estrelas = (missaoCumprida ? 1 : 0) + (familiaFeliz ? 1 : 0) + (contasCertas ? 1 : 0);

  const escolhas = compra.missao.itens
    .filter(item => compra.carrinho[item.produtoId])
    .map(item => {
      const { opcaoId } = compra.carrinho[item.produtoId];
      const opcao = opcaoEscolhida(item.produtoId, opcaoId, compra.missao.nivel);
      return {
        produtoId: item.produtoId,
        rotulo: opcao.rotulo,
        posicao: posicaoDaOpcao(item.produtoId, opcaoId, compra.missao.nivel),
      };
    });

  return {
    estrelas,
    objetivos: { missaoCumprida, familiaFeliz, contasCertas },
    coracoes,
    troco: compra.missao.orcamento - total,
    escolhas,
    aMais: aMais(compra),
    acertos,
    erros,
  };
}

export function digitar(valor, tecla) {
  const atual = Math.max(0, Math.trunc(Number(valor) || 0));
  if (tecla === 'apagar') return Math.floor(atual / 10);
  const digito = Number(tecla);
  if (!Number.isInteger(digito) || digito < 0 || digito > 9) return atual;
  return Math.min(99999, atual * 10 + digito);
}

export function alternativasDeTroco(troco, rnd = criarGerador(1)) {
  const certo = Math.max(0, Math.trunc(Number(troco) || 0));
  const terceira = certo >= 100 ? certo - 100 : certo + 50;
  return embaralhar([certo, certo + 100, terceira], rnd);
}

export function formatarNumeroVirgula(centavos) {
  const valor = Math.max(0, Math.trunc(Number(centavos) || 0));
  return `${Math.floor(valor / 100)},${String(valor % 100).padStart(2, '0')}`;
}

/** Monta as linhas de uma conta armada com N parcelas (o sinal vai na última). */
function armarConta(parcelas, resultado, sinal) {
  const textos = parcelas.map(formatarNumeroVirgula);
  const strR = formatarNumeroVirgula(resultado);
  const largura = Math.max(...textos.map(t => t.length + 2), strR.length);
  const ultima = textos.length - 1;
  return [
    ...textos.map((texto, idx) => (
      idx === ultima ? `${sinal} ${texto.padStart(largura - 2, ' ')}` : texto.padStart(largura, ' ')
    )),
    '─'.repeat(largura),
    strR.padStart(largura, ' '),
  ];
}

export function contaArmada(a, b, operacao = '-') {
  return operacao === '+' ? somaArmada([a, b]) : armarConta([a, b], a - b, '−');
}

/** Conta armada de adição com qualquer número de parcelas. */
export function somaArmada(valores) {
  return armarConta(valores, somarCentavos(valores), '+');
}

export function conferirDados() {
  const problemas = [];
  const idsProdutos = new Set();

  for (const p of produtos) {
    if (!KEBAB_RE.test(p.id)) problemas.push(`Produto com id inválido: ${p.id}`);
    if (idsProdutos.has(p.id)) problemas.push(`Produto duplicado: ${p.id}`);
    idsProdutos.add(p.id);
    if (!SECOES_VALIDAS.has(p.secao)) problemas.push(`Seção inválida em ${p.id}: ${p.secao}`);
    if (!Array.isArray(p.quantidades) || !p.quantidades.length || p.quantidades.some(q => !Number.isInteger(q) || q < 1)) {
      problemas.push(`Quantidades inválidas em ${p.id}`);
    }
    if (!Array.isArray(p.opcoes) || p.opcoes.length < 2 || p.opcoes.length > 3) {
      problemas.push(`Quantidade de opções inválida em ${p.id}`);
      continue;
    }
    for (let i = 0; i < p.opcoes.length; i++) {
      const o = p.opcoes[i];
      const idEsperado = `${p.id}-${i + 1}`;
      if (o.id !== idEsperado) problemas.push(`Id de opção inválido em ${p.id}: ${o.id}`);
      if (!Number.isInteger(o.preco) || o.preco <= 0) problemas.push(`Preço inválido em ${o.id}`);
      if (!Number.isInteger(o.coracoes) || o.coracoes < 1 || o.coracoes > 3) {
        problemas.push(`Corações inválidos em ${o.id}`);
      }
      if (i > 0) {
        const ant = p.opcoes[i - 1];
        if (o.preco <= ant.preco) problemas.push(`Preços não crescentes em ${p.id}`);
        if (o.coracoes < ant.coracoes) problemas.push(`Corações decrescentes em ${p.id}`);
      }
    }
  }

  const idsDesejos = new Set();
  for (const d of desejos) {
    if (!KEBAB_RE.test(d.id)) problemas.push(`Desejo com id inválido: ${d.id}`);
    if (idsDesejos.has(d.id)) problemas.push(`Desejo duplicado: ${d.id}`);
    idsDesejos.add(d.id);
    if (!Number.isInteger(d.preco) || d.preco <= 0) problemas.push(`Preço inválido em ${d.id}`);
    if (!Number.isInteger(d.coracoes) || d.coracoes < 1 || d.coracoes > 3) {
      problemas.push(`Corações inválidos em ${d.id}`);
    }
  }

  const idsTemas = new Set();
  for (const t of temas) {
    if (!KEBAB_RE.test(t.id)) problemas.push(`Tema com id inválido: ${t.id}`);
    if (idsTemas.has(t.id)) problemas.push(`Tema duplicado: ${t.id}`);
    idsTemas.add(t.id);
    if (!Number.isInteger(t.fixas) || t.fixas < 1 || t.fixas > t.vagas.length) {
      problemas.push(`Fixas inválidas no tema ${t.id}`);
    }
    for (const vaga of t.vagas) {
      if (!Array.isArray(vaga) || !vaga.length) {
        problemas.push(`Vaga vazia no tema ${t.id}`);
        continue;
      }
      for (const produtoId of vaga) {
        if (!idsProdutos.has(produtoId)) problemas.push(`Produto inexistente ${produtoId} no tema ${t.id}`);
      }
    }
  }

  const idsSonhos = new Set();
  for (const s of sonhos) {
    if (!KEBAB_RE.test(s.id)) problemas.push(`Sonho com id inválido: ${s.id}`);
    if (idsSonhos.has(s.id)) problemas.push(`Sonho duplicado: ${s.id}`);
    idsSonhos.add(s.id);
    if (!Number.isInteger(s.preco) || s.preco <= 0) problemas.push(`Preço inválido no sonho ${s.id}`);
  }

  return problemas;
}
