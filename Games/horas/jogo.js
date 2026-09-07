const inteiro=(min,max,aleatorio=Math.random)=>Math.floor(aleatorio()*(max-min+1))+min;

export const niveis=Object.freeze({
  cheia:{nome:'Hora cheia',passo:60,minutos:[0]},
  meia:{nome:'Meia hora',passo:30,minutos:[0,30]},
  quartos:{nome:'Quartos de hora',passo:15,minutos:[0,15,30,45]},
  cinco:{nome:'De 5 em 5 minutos',passo:5,minutos:Array.from({length:12},(_,i)=>i*5)},
  desafio:{nome:'Desafio: minuto a minuto',passo:1,minutos:Array.from({length:60},(_,i)=>i)},
});

export function normalizarHorario(hora,minuto){const total=((Number(hora)*60+Number(minuto))%(24*60)+24*60)%(24*60);return{hora:Math.floor(total/60),minuto:total%60}}
export function minutosTotais({hora,minuto}){return normalizarHorario(hora,minuto).hora*60+normalizarHorario(hora,minuto).minuto}
export function mesmoHorario(a,b){return minutosTotais(a)===minutosTotais(b)}
export function formatarHorario({hora,minuto}){return`${String(hora).padStart(2,'0')}:${String(minuto).padStart(2,'0')}`}

export function horaParaAngulos(hora,minuto){const h=normalizarHorario(hora,minuto);return{minutos:h.minuto*6,horas:(h.hora%12)*30+h.minuto*.5}}
/** `periodo` preserva a informação 0–11 ou 12–23, que os ponteiros sozinhos não mostram. */
export function angulosParaHora(anguloHoras,anguloMinutos,periodo=0){const minuto=Math.round(anguloMinutos/6)%60;let hora=Math.round((anguloHoras-minuto*.5)/30)%12;if(hora<0)hora+=12;return{hora:hora+(Number(periodo)>=12?12:0),minuto}}

export function gerarHorario(nivel='cinco',opcoes={}){const config=niveis[nivel];if(!config)throw new RangeError(`Nível inválido: ${nivel}`);const aleatorio=opcoes.aleatorio||Math.random;const hora=inteiro(1,12,aleatorio),minuto=config.minutos[inteiro(0,config.minutos.length-1,aleatorio)];return{hora,minuto}}

export function gerarDistratores(horario,aleatorio=Math.random){const certo=normalizarHorario(horario.hora,horario.minuto);const horaTrocada=Math.round(certo.minuto/5)%12||12;const candidatos=[normalizarHorario(certo.hora,certo.minuto+30),normalizarHorario(certo.hora,certo.minuto-30),normalizarHorario(certo.hora+1,certo.minuto),normalizarHorario(certo.hora-1,certo.minuto),normalizarHorario(horaTrocada,(certo.hora%12)*5)];const vistos=new Set([formatarHorario(certo)]),opcoes=[certo];for(const candidato of candidatos.sort(()=>aleatorio()-.5)){const chave=formatarHorario(candidato);if(!vistos.has(chave)){vistos.add(chave);opcoes.push(candidato)}if(opcoes.length===4)break}return opcoes.sort(()=>aleatorio()-.5)}
