export const configuracoes = Object.freeze({
  4:{tamanho:4,blocoLinhas:2,blocoColunas:2,remover:6,nome:'Revisão 4×4'},
  6:{tamanho:6,blocoLinhas:2,blocoColunas:3,remover:18,nome:'Emojis 6×6'},
  9:{tamanho:9,blocoLinhas:3,blocoColunas:3,remover:40,nome:'Desafio 9×9'},
});
const embaralhar=(lista,aleatorio)=>{const a=[...lista];for(let i=a.length-1;i>0;i--){const j=Math.floor(aleatorio()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

function padrao(linha,coluna,cfg){return(linha*cfg.blocoColunas+Math.floor(linha/cfg.blocoLinhas)+coluna)%cfg.tamanho}
function ordemAgrupada(grupos,tamanhoGrupo,aleatorio){return embaralhar([...Array(grupos).keys()],aleatorio).flatMap(g=>embaralhar([...Array(tamanhoGrupo).keys()],aleatorio).map(i=>g*tamanhoGrupo+i))}

export function gerarSolucao(tamanho=6,aleatorio=Math.random){const cfg=configuracoes[tamanho];if(!cfg)throw new RangeError(`Sudoku inválido: ${tamanho}`);const numeros=embaralhar(Array.from({length:tamanho},(_,i)=>i+1),aleatorio),linhas=ordemAgrupada(tamanho/cfg.blocoLinhas,cfg.blocoLinhas,aleatorio),colunas=ordemAgrupada(tamanho/cfg.blocoColunas,cfg.blocoColunas,aleatorio);return linhas.map(l=>colunas.map(c=>numeros[padrao(l,c,cfg)]))}

function candidatos(tabuleiro,linha,coluna,cfg){const usados=new Set(tabuleiro[linha]);for(let l=0;l<cfg.tamanho;l++)usados.add(tabuleiro[l][coluna]);const li=Math.floor(linha/cfg.blocoLinhas)*cfg.blocoLinhas,ci=Math.floor(coluna/cfg.blocoColunas)*cfg.blocoColunas;for(let l=li;l<li+cfg.blocoLinhas;l++)for(let c=ci;c<ci+cfg.blocoColunas;c++)usados.add(tabuleiro[l][c]);return Array.from({length:cfg.tamanho},(_,i)=>i+1).filter(n=>!usados.has(n))}

export function contarSolucoes(tabuleiro,tamanho=tabuleiro.length,limite=2){const cfg=configuracoes[tamanho];const copia=tabuleiro.map(l=>[...l]);let total=0;function resolver(){if(total>=limite)return;let melhor=null,opcoes=null;for(let l=0;l<tamanho;l++)for(let c=0;c<tamanho;c++)if(copia[l][c]===0){const atuais=candidatos(copia,l,c,cfg);if(!atuais.length)return;if(!opcoes||atuais.length<opcoes.length){melhor=[l,c];opcoes=atuais;if(atuais.length===1)break}}if(!melhor){total++;return}for(const valor of opcoes){copia[melhor[0]][melhor[1]]=valor;resolver();copia[melhor[0]][melhor[1]]=0;if(total>=limite)return}}resolver();return total}

export function gerarSudoku(tamanho=6,aleatorio=Math.random){const cfg=configuracoes[tamanho];if(!cfg)throw new RangeError(`Sudoku inválido: ${tamanho}`);const solucao=gerarSolucao(tamanho,aleatorio),tabuleiro=solucao.map(l=>[...l]),posicoes=embaralhar(Array.from({length:tamanho*tamanho},(_,i)=>i),aleatorio);let removidas=0;for(const pos of posicoes){if(removidas>=cfg.remover)break;const l=Math.floor(pos/tamanho),c=pos%tamanho,valor=tabuleiro[l][c];tabuleiro[l][c]=0;if(contarSolucoes(tabuleiro,tamanho,2)===1)removidas++;else tabuleiro[l][c]=valor}return{tabuleiro,solucao,removidas,configuracao:cfg}}

export function encontrarConflitos(tabuleiro,tamanho=tabuleiro.length){const cfg=configuracoes[tamanho],conflitos=new Set();function marcar(celulas){const porValor=new Map();for(const [l,c] of celulas){const v=tabuleiro[l][c];if(!v)continue;const anteriores=porValor.get(v)||[];anteriores.push([l,c]);porValor.set(v,anteriores)}for(const repetidas of porValor.values())if(repetidas.length>1)repetidas.forEach(([l,c])=>conflitos.add(`${l}:${c}`))}for(let l=0;l<tamanho;l++)marcar(Array.from({length:tamanho},(_,c)=>[l,c]));for(let c=0;c<tamanho;c++)marcar(Array.from({length:tamanho},(_,l)=>[l,c]));for(let li=0;li<tamanho;li+=cfg.blocoLinhas)for(let ci=0;ci<tamanho;ci+=cfg.blocoColunas)marcar(Array.from({length:cfg.blocoLinhas*cfg.blocoColunas},(_,i)=>[li+Math.floor(i/cfg.blocoColunas),ci+i%cfg.blocoColunas]));return conflitos}

export function tabuleiroValido(tabuleiro){return !tabuleiro.some(l=>l.includes(0))&&encontrarConflitos(tabuleiro).size===0}
