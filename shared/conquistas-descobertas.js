/**
 * conquistas-descobertas.js — as conquistas do álbum do Rael (P15).
 *
 * Conquista é uma figurinha especial que reconhece um feito dentro de uma
 * brincadeira: abrir o portão com a chave, baixar a ponte, terminar os dez
 * mapas de um nível. A figurinha comum de cada rodada continua vindo sempre;
 * a conquista é um extra.
 *
 * Regras (seção 5.0 do MELHORIAS): premiar o que foi feito e o que foi
 * acumulado, nunca rapidez, ausência de erro, prazo ou dias seguidos. Nada
 * aqui se perde com o tempo.
 *
 * Módulo puro: sem DOM e sem localStorage. Quem guarda é `descobertas.js`,
 * que passa para cá o contexto `{ atividades, marcas, figurinhas }`.
 */

export const LABIRINTO = 'meu-primeiro-labirinto';

/** Quantas figurinhas comuns o álbum tem (FIGURINHAS em descobertas.js). */
export const TOTAL_FIGURINHAS = 18;

/** Datas guardadas para as conquistas de dias diferentes. */
const MAXIMO_DE_DIAS = 60;

/** As brincadeiras da etapa, com a figura do cartão na casa do Rael. */
export const ATIVIDADES_DESCOBERTAS = [
  { id: 'toque-na-figura', nome: 'Toque na Figura', figura: 'dinossauro', estreia: 'Primeiro toque', fa: 'Fã de figuras' },
  { id: 'encaixe-as-figuras', nome: 'Encaixe as Figuras', figura: 'foguete', estreia: 'Primeiro encaixe', fa: 'Fã de encaixar' },
  { id: 'palmas-nas-palavras', nome: 'Palmas nas Palavras', figura: 'banana', estreia: 'Primeiras palmas', fa: 'Fã de palmas' },
  { id: 'rimas-com-figuras', nome: 'Rimas com Figuras', figura: 'gato', estreia: 'Primeira rima', fa: 'Fã de rimas' },
  { id: 'comeca-com-o-mesmo-som', nome: 'Começa com o Mesmo Som', figura: 'abelha', estreia: 'Primeiro som', fa: 'Fã de sons' },
  { id: 'letras-para-explorar', nome: 'Letras para Explorar', figura: 'livro', estreia: 'Primeira letra', fa: 'Fã de letras' },
  { id: LABIRINTO, nome: 'Meu Primeiro Labirinto', figura: 'carro', estreia: null, fa: 'Fã de labirintos' },
  { id: 'chute-a-gol', nome: 'Chute a Gol', figura: 'bola', estreia: 'Primeiro gol', fa: 'Fã de futebol' },
  { id: 'corrida-do-rael', nome: 'Corrida do Rael', figura: 'carro', estreia: 'Primeira corrida', fa: 'Piloto experiente' },
];

export const PAGINAS = [
  { id: 'labirinto', nome: 'Labirinto', figura: '/figuras/carro.svg' },
  { id: 'brincadeiras', nome: 'Brincadeiras', figura: '/figuras/dinossauro.svg' },
  { id: 'geral', nome: 'Geral', figura: '/figuras/sol.svg' },
];

const numero = valor => Math.max(0, Math.floor(Number(valor) || 0));
const rodadas = (contexto, atividade) => numero(contexto.atividades?.[atividade]?.rodadas);
const labirinto = contexto => contexto.marcas?.[LABIRINTO] || {};
const usou = (contexto, obstaculo) => numero(labirinto(contexto).usou?.[obstaculo]);
const mapasDistintos = (contexto, nivel) => Object.keys(labirinto(contexto).mapas || {})
  .filter(id => id.startsWith(`rael-aventura-${nivel}-`)).length;

const CONQUISTAS_DO_LABIRINTO = [
  {
    id: 'lab-primeira-garagem', figura: 'casa.svg', nome: 'Primeira garagem', meta: 1,
    comoGanhar: 'Leve o carrinho até a garagem.',
    parabens: 'Você levou o carrinho até a garagem!',
    medir: contexto => rodadas(contexto, LABIRINTO),
  },
  {
    id: 'lab-sinal-verde', figura: 'labirinto/semaforo-verde.svg', nome: 'Sinal verde', meta: 1,
    comoGanhar: 'Espere o semáforo ficar verde e chegue à garagem.',
    parabens: 'Você esperou o sinal verde!',
    medir: contexto => usou(contexto, 'semaforo'),
  },
  {
    id: 'lab-ponte', figura: 'labirinto/ponte.svg', nome: 'Construtor de pontes', meta: 1,
    comoGanhar: 'Toque na alavanca para baixar a ponte e chegue à garagem.',
    parabens: 'Você baixou a ponte com a alavanca!',
    medir: contexto => usou(contexto, 'ponte'),
  },
  {
    id: 'lab-chaveiro', figura: 'chave.svg', nome: 'Chaveiro', meta: 1,
    comoGanhar: 'Pegue a chave e abra o portão.',
    parabens: 'Você abriu o portão com a chave!',
    medir: contexto => usou(contexto, 'portao'),
  },
  {
    id: 'lab-desvio', figura: 'labirinto/obras.svg', nome: 'Desvio esperto', meta: 1,
    comoGanhar: 'Desvie das obras e chegue à garagem.',
    parabens: 'Você desviou das obras!',
    medir: contexto => usou(contexto, 'obras'),
  },
  {
    id: 'lab-mestre-transito', figura: 'labirinto/semaforo.svg', nome: 'Mestre do trânsito', meta: 4,
    comoGanhar: 'Passe pelo semáforo, pela ponte, pelo portão e pelas obras.',
    parabens: 'Você já conhece todos os obstáculos!',
    medir: contexto => ['semaforo', 'ponte', 'portao', 'obras'].filter(item => usou(contexto, item) > 0).length,
  },
  {
    id: 'lab-estrelas', figura: 'estrela.svg', nome: 'Caçador de estrelas', meta: 5,
    comoGanhar: 'Pegue a estrela no caminho, cinco vezes.',
    parabens: 'Você pegou cinco estrelas!',
    medir: contexto => numero(labirinto(contexto).estrelas),
  },
  {
    id: 'lab-explorar-10', figura: 'carro.svg', nome: 'Explorador', meta: 10,
    comoGanhar: 'Chegue à garagem nos dez mapas do nível fácil.',
    parabens: 'Você terminou todos os mapas do nível fácil!',
    medir: contexto => mapasDistintos(contexto, 'facil'),
  },
  {
    id: 'lab-planejar-10', figura: 'onibus.svg', nome: 'Planejador', meta: 10,
    comoGanhar: 'Chegue à garagem nos dez mapas do nível normal.',
    parabens: 'Você terminou todos os mapas do nível normal!',
    medir: contexto => mapasDistintos(contexto, 'normal'),
  },
  {
    id: 'lab-combinar-10', figura: 'caminhao.svg', nome: 'Grande combinador', meta: 10,
    comoGanhar: 'Chegue à garagem nos dez mapas do nível esperto.',
    parabens: 'Você terminou todos os mapas do nível esperto!',
    medir: contexto => mapasDistintos(contexto, 'esperto'),
  },
  {
    // Decisão a confirmar na validação (P15, item 3): a única que olha a dica.
    // Pedir dica nunca gera aviso sobre ela; se o Rael passar a evitar a dica,
    // basta apagar esta entrada.
    id: 'lab-eu-consigo', figura: 'foguete.svg', nome: 'Eu consigo!', meta: 3,
    comoGanhar: 'Tente chegar à garagem sem pedir ajuda, três vezes.',
    parabens: 'Você achou o caminho sozinho!',
    medir: contexto => numero(labirinto(contexto).semDica),
  },
  {
    id: 'lab-viajante', figura: 'trem.svg', nome: 'Grande viajante', meta: 25,
    comoGanhar: 'Chegue à garagem vinte e cinco vezes.',
    parabens: 'Você já fez vinte e cinco viagens!',
    medir: contexto => rodadas(contexto, LABIRINTO),
  },
].map(conquista => ({ ...conquista, pagina: 'labirinto', atividade: LABIRINTO }));

const CONQUISTAS_DAS_BRINCADEIRAS = ATIVIDADES_DESCOBERTAS.flatMap(atividade => [
  atividade.estreia && {
    id: `${atividade.id}-estreia`, figura: `${atividade.figura}.svg`, nome: atividade.estreia, meta: 1,
    comoGanhar: `Brinque de ${atividade.nome} até o fim.`,
    parabens: `Você brincou de ${atividade.nome}!`,
    medir: contexto => rodadas(contexto, atividade.id),
  },
  {
    id: `${atividade.id}-fa`, figura: `${atividade.figura}.svg`, nome: atividade.fa, meta: 10,
    comoGanhar: `Brinque de ${atividade.nome} dez vezes.`,
    parabens: `Você já brincou dez vezes de ${atividade.nome}!`,
    medir: contexto => rodadas(contexto, atividade.id),
  },
].filter(Boolean).map(conquista => ({ ...conquista, pagina: 'brincadeiras', atividade: atividade.id })));

const CONQUISTAS_GERAIS = [
  {
    id: 'geral-todas', figura: 'ilha.svg', nome: 'Explorador de brincadeiras', meta: ATIVIDADES_DESCOBERTAS.length,
    comoGanhar: 'Brinque de todas as brincadeiras pelo menos uma vez.',
    parabens: 'Você já brincou de todas as brincadeiras!',
    medir: contexto => ATIVIDADES_DESCOBERTAS.filter(atividade => rodadas(contexto, atividade.id) > 0).length,
  },
  {
    id: 'geral-dias-5', figura: 'sol.svg', nome: 'Visitas animadas', meta: 5,
    comoGanhar: 'Venha brincar em cinco dias diferentes.',
    parabens: 'Você já brincou em cinco dias diferentes!',
    medir: contexto => diasDiferentes(contexto),
  },
  {
    id: 'geral-dias-15', figura: 'lua.svg', nome: 'Amigo das descobertas', meta: 15,
    comoGanhar: 'Venha brincar em quinze dias diferentes.',
    parabens: 'Você já brincou em quinze dias diferentes!',
    medir: contexto => diasDiferentes(contexto),
  },
  {
    id: 'geral-album', figura: 'bolo.svg', nome: 'Álbum cheio', meta: TOTAL_FIGURINHAS,
    comoGanhar: 'Junte todas as figurinhas do álbum.',
    parabens: 'Você juntou todas as figurinhas!',
    medir: contexto => new Set(contexto.figurinhas || []).size,
  },
].map(conquista => ({ ...conquista, pagina: 'geral', atividade: null }));

function diasDiferentes(contexto) {
  const dias = contexto.marcas?.geral?.dias;
  return Array.isArray(dias) ? new Set(dias).size : 0;
}

/** O catálogo inteiro, na ordem em que aparece no álbum. */
export const CONQUISTAS = [...CONQUISTAS_DO_LABIRINTO, ...CONQUISTAS_DAS_BRINCADEIRAS, ...CONQUISTAS_GERAIS]
  .map(conquista => Object.freeze({ ...conquista, figura: `/figuras/${conquista.figura}` }));

/** Data local no formato AAAA-MM-DD: "dia diferente" é o dia do aparelho, não o de Greenwich. */
export function diaLocal(data = new Date()) {
  const dois = valor => String(valor).padStart(2, '0');
  return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}`;
}

/** Marcas salvas passam por aqui ao serem lidas: só objetos, sem nada que quebre as contas. */
export function limparMarcas(marcas) {
  return marcas && typeof marcas === 'object' && !Array.isArray(marcas) ? marcas : {};
}

function acumularLabirinto(anterior = {}, feitos = {}) {
  const marcas = {
    mapas: { ...(anterior.mapas && typeof anterior.mapas === 'object' ? anterior.mapas : {}) },
    estrelas: numero(anterior.estrelas),
    semDica: numero(anterior.semDica),
    usou: { ...(anterior.usou && typeof anterior.usou === 'object' ? anterior.usou : {}) },
  };
  if (feitos.estrela) marcas.estrelas += 1;
  // O modo clássico conta nas rodadas e na estrela; o resto é do modo aventura.
  if (!feitos.aventura) return marcas;

  if (typeof feitos.mapaId === 'string' && feitos.mapaId) {
    marcas.mapas[feitos.mapaId] = numero(marcas.mapas[feitos.mapaId]) + 1;
  }
  ['semaforo', 'ponte', 'portao', 'obras'].forEach(obstaculo => {
    if (feitos[obstaculo]) marcas.usou[obstaculo] = numero(marcas.usou[obstaculo]) + 1;
  });
  if (numero(feitos.dicas) === 0 && ['normal', 'esperto'].includes(feitos.nivel)) marcas.semDica += 1;
  return marcas;
}

/**
 * Soma os feitos de uma rodada às marcas e devolve marcas novas (não altera
 * as que vieram). Toda rodada marca o dia; o labirinto guarda também mapas,
 * estrelas, obstáculos e mapas sem dica.
 */
export function acumularFeitos(atividade, marcasRecebidas, feitos = {}, agora = new Date()) {
  const marcas = { ...limparMarcas(marcasRecebidas) };
  const diasAntes = Array.isArray(marcas.geral?.dias) ? marcas.geral.dias.filter(dia => typeof dia === 'string') : [];
  const dias = [...new Set([...diasAntes, diaLocal(agora)])].slice(-MAXIMO_DE_DIAS);
  marcas.geral = { ...(marcas.geral || {}), dias };
  if (atividade === LABIRINTO) marcas[LABIRINTO] = acumularLabirinto(marcas[LABIRINTO], feitos || {});
  return marcas;
}

/** Quanto falta, limitado à meta: 7 de 10 continua 10 de 10 depois de passar. */
export function progressoDe(conquista, contexto) {
  return Math.min(conquista.meta, numero(conquista.medir(contexto)));
}

/** As conquistas que o contexto já alcança e ainda não estão em `ganhas`, na ordem do catálogo. */
export function avaliarConquistas(contexto, ganhas = {}) {
  return CONQUISTAS.filter(conquista => !ganhas[conquista.id] && progressoDe(conquista, contexto) >= conquista.meta);
}

/** O que a tela precisa de uma conquista: dados do catálogo, progresso e data. */
export function resumirConquista(conquista, contexto, ganhas = {}) {
  const ganhaEm = typeof ganhas[conquista.id] === 'string' ? ganhas[conquista.id] : null;
  const { medir, ...dados } = conquista;
  return { ...dados, progresso: ganhaEm ? conquista.meta : progressoDe(conquista, contexto), ganha: Boolean(ganhaEm), ganhaEm };
}
