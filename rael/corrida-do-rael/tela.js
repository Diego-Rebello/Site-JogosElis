/**
 * Corrida do Rael — derivado de projeto sob licença MIT.
 * Origem: https://github.com/Elomami1976/pixel-racer
 * Copyright (c) 2026 Tarek Elomami — licença MIT.
 * Cópia da licença em LICENSE-pixel-racer.txt.
 */

import { montarCabecalho } from '../../shared/cabecalho.js';
import { definirPreferencia, preparar } from '../../shared/fala.js';
import { obterConfiguracoes } from '../../shared/descobertas.js';

montarCabecalho('Corrida do Rael');

const $ = id => document.getElementById(id);

const telas = {
  convite: $('tela-convite'),
  demonstracao: $('tela-demonstracao'),
  brincadeira: $('tela-brincadeira'),
  fim: $('tela-fim'),
};

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, elemento]) => {
    if (elemento) {
      elemento.hidden = chave !== nome;
    }
  });
}

const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);

const botaoComecar = $('comecar');
if (botaoComecar) {
  botaoComecar.addEventListener('click', async () => {
    await preparar();
    mostrarTela('demonstracao');
  });
}
