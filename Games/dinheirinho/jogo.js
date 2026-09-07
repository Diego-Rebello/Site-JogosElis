import { embaralhar } from '../../shared/texto.js';import { produtos } from './dados.js';
export const denominacoes=Object.freeze([5,10,25,50,100,200,500,1000,2000,5000]);
export function somarCentavos(valores){return valores.reduce((soma,valor)=>soma+Math.trunc(Number(valor)),0)}
export function formatarDinheiro(centavos){const valor=Math.max(0,Math.trunc(Number(centavos)||0));return`R$ ${Math.floor(valor/100)},${String(valor%100).padStart(2,'0')}`}
export function valorDaQuestao(item){return item.nivel===3?item.pago-item.preco:item.preco}
export function montarRodada(nivel=2,quantidade=10){return embaralhar(produtos.filter(p=>p.nivel===Number(nivel))).slice(0,quantidade)}
export function conferirPagamento(valores,item){return somarCentavos(valores)===valorDaQuestao(item)}
export function denominacoesDoNivel(nivel){return Number(nivel)===1?denominacoes.filter(v=>v>=100):denominacoes}
export function conferirDados(lista=produtos){return lista.flatMap((p,i)=>{const erros=[];if(!Number.isInteger(p.preco)||p.preco<=0)erros.push(`${i}: preço inválido`);if(p.nivel===1&&(p.preco%100!==0||p.preco>1000))erros.push(`${i}: nível 1 fora da faixa`);if(p.nivel===2&&(p.preco%5!==0||p.preco>2000))erros.push(`${i}: nível 2 fora da faixa`);if(p.nivel===3&&(!Number.isInteger(p.pago)||p.pago<=p.preco||(p.pago-p.preco)%5))erros.push(`${i}: troco inválido`);return erros})}
