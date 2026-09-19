import { montarCabecalho } from '../../shared/cabecalho.js';
import { definirPreferencia } from '../../shared/fala.js';
import { obterConfiguracoes } from '../../shared/descobertas.js';

const $ = id => document.getElementById(id);
const telas = {
  convite: $('tela-convite'),
  brincadeira: $('tela-brincadeira'),
  fim: $('tela-fim'),
};

const configuracoes = obterConfiguracoes();
definirPreferencia(configuracoes.voz);
montarCabecalho('Chute a Gol');

function mostrarTela(nome) {
  Object.entries(telas).forEach(([chave, elemento]) => {
    if (elemento) elemento.hidden = chave !== nome;
  });
}

mostrarTela('convite');
