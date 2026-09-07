export const CORES = Object.freeze(['rosa', 'azul', 'verde', 'amarelo']);

/** Gerador determinístico Mulberry32: a mesma semente produz a mesma partida. */
export function criarGerador(semente = Date.now()) {
  let estado = Number(semente) >>> 0;
  return () => {
    estado += 0x6D2B79F5;
    let valor = estado;
    valor = Math.imul(valor ^ (valor >>> 15), valor | 1);
    valor ^= valor + Math.imul(valor ^ (valor >>> 7), valor | 61);
    return ((valor ^ (valor >>> 14)) >>> 0) / 4294967296;
  };
}

export function proximaCor(aleatorio = Math.random) {
  return CORES[Math.floor(aleatorio() * CORES.length)];
}

export function ampliarSequencia(sequencia, aleatorio = Math.random) {
  return [...sequencia, proximaCor(aleatorio)];
}

export function conferirJogada(sequencia, jogadas) {
  const indice = jogadas.length - 1;
  return indice >= 0 && indice < sequencia.length && jogadas[indice] === sequencia[indice];
}

export function estrelasPorRecorde(recorde) {
  if (recorde >= 12) return 3;
  if (recorde >= 8) return 2;
  if (recorde >= 5) return 1;
  return 0;
}
