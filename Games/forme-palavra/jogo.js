import { embaralhar, normalizar } from '../../shared/texto.js';
import { palavras, silabasIntrusas } from './dados.js';

export const ITENS_POR_RODADA = 10;

export function conferirDados(lista = palavras) {
  return lista.flatMap((item, indice) => {
    const erros=[];
    if(item.silabas.join('')!==item.palavra)erros.push(`${indice}: sílabas não formam ${item.palavra}`);
    if(![1,2,3].includes(item.nivel))erros.push(`${indice}: nível inválido`);
    if(item.nivel===1 && item.silabas.length!==2)erros.push(`${indice}: nível 1 não tem 2 sílabas`);
    if(item.nivel===2 && item.silabas.length!==3)erros.push(`${indice}: nível 2 não tem 3 sílabas`);
    if(item.nivel===3 && item.silabas.length<4)erros.push(`${indice}: desafio tem menos de 4 sílabas`);
    return erros;
  });
}

export function montarRodada(nivel=3, quantidade=ITENS_POR_RODADA) {
  return embaralhar(palavras.filter(item=>item.nivel===Number(nivel))).slice(0,quantidade);
}

export function montarPecas(item, comIntrusa=item.nivel===3) {
  const pecas=item.silabas.map((texto,indice)=>({id:`certa-${indice}`,texto,intrusa:false}));
  if(comIntrusa){const candidatas=silabasIntrusas.filter(s=>!item.silabas.includes(s));const texto=candidatas[Math.floor(Math.random()*candidatas.length)];pecas.push({id:'intrusa',texto,intrusa:true});}
  return embaralhar(pecas);
}

export function conferirOrdem(item, pecas) {
  return normalizar(pecas.map(p=>p.texto).join(''))===normalizar(item.palavra);
}
