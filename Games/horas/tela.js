import { montarCabecalho } from '../../shared/cabecalho.js';import { animar,lancarConfete } from '../../shared/confete.js';import { calcularEstrelas,nomeDaCrianca,obterConfiguracoes,registrarPartida } from '../../shared/progresso.js';import { tocar } from '../../shared/sons.js';import { formatarHorario,gerarDistratores,gerarHorario,horaParaAngulos,mesmoHorario,minutosTotais,niveis,normalizarHorario } from './jogo.js';
montarCabecalho('Que Horas São?');const $=id=>document.getElementById(id);let nivel='cinco',modo='leia',alvo,ajuste,indice=0,acertos=0,erros=0,respondida=false,ultima='';
function exibir(id){['inicio','partida','final'].forEach(t=>$(t).hidden=t!==id)}function selecionar(valor){nivel=valor;document.querySelectorAll('[data-nivel]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nivel===nivel)))}
for(const [id,config] of Object.entries(niveis)){const b=document.createElement('button');b.className='botao botao--neutro escolha';b.dataset.nivel=id;b.textContent=config.nome;b.addEventListener('click',()=>selecionar(id));$('niveis').append(b)}const nivelSalvo=obterConfiguracoes().niveis.horas;selecionar(niveis[nivelSalvo]?nivelSalvo:'cinco');
function montarMostrador(){const g=$('marcas');for(let i=0;i<60;i++){const a=i*6*Math.PI/180,r1=i%5===0?94:100,r2=105,x1=120+Math.sin(a)*r1,y1=120-Math.cos(a)*r1,x2=120+Math.sin(a)*r2,y2=120-Math.cos(a)*r2;const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('class','marca');for(const [k,v] of Object.entries({x1,y1,x2,y2}))l.setAttribute(k,v);g.append(l)}for(let i=1;i<=12;i++){const a=i*30*Math.PI/180,t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('class','numero');t.setAttribute('x',120+Math.sin(a)*82);t.setAttribute('y',125-Math.cos(a)*82);t.setAttribute('text-anchor','middle');t.textContent=i;g.append(t)}}
function apontar(horario){const a=horaParaAngulos(horario.hora,horario.minuto);$('hora').setAttribute('transform',`rotate(${a.horas} 120 120)`);$('minuto').setAttribute('transform',`rotate(${a.minutos} 120 120)`);document.querySelector('.relogio').setAttribute('aria-label',`Relógio marcando ${formatarHorario(horario)}`)}
function nova(){do{alvo=gerarHorario(nivel)}while(formatarHorario(alvo)===ultima);ultima=formatarHorario(alvo);respondida=false;$('atual').textContent=indice+1;$('progresso').value=indice;$('feedback').textContent='';$('feedback').className='feedback';$('proxima').hidden=true;$('opcoes').replaceChildren();if(modo==='leia'){$('pedido').textContent='Que horário o relógio está mostrando?';$('digital').hidden=true;$('ajustes').hidden=true;apontar(alvo);for(const horario of gerarDistratores(alvo)){const b=document.createElement('button');b.className='botao botao--neutro opcao';b.textContent=formatarHorario(horario);b.addEventListener('click',()=>responder(horario));$('opcoes').append(b)}}else{$('pedido').textContent='Ajuste os ponteiros para este horário:';$('digital').hidden=false;$('digital').textContent=formatarHorario(alvo);$('ajustes').hidden=false;ajuste={hora:12,minuto:0};apontar(ajuste)}}
function responder(resposta=ajuste){if(respondida)return;respondida=true;const certo=mesmoHorario(resposta,alvo);if(certo){acertos++;$('acertos').textContent=acertos;$('feedback').textContent='🎉 Horário certo!';$('feedback').className='feedback feedback--certo';tocar('acerto');animar(document.querySelector('.relogio'),'pular')}else{erros++;$('erros').textContent=erros;$('feedback').textContent=`A resposta certa é ${formatarHorario(alvo)}.`;$('feedback').className='feedback feedback--errado';apontar(alvo);tocar('erro');animar(document.querySelector('.relogio'),'tremer')}$('opcoes').querySelectorAll('button').forEach(b=>b.disabled=true);$('ajustes').querySelectorAll('button').forEach(b=>b.disabled=true);$('proxima').hidden=false;$('proxima').textContent=indice===9?'VER RESULTADO':'PRÓXIMO';$('proxima').focus()}
function iniciar(novoModo=modo){modo=novoModo;indice=0;acertos=0;erros=0;ultima='';$('acertos').textContent='0';$('erros').textContent='0';exibir('partida');nova();tocar('clique')}
function avancar(){if(!respondida)return;indice++;if(indice>=10){const estrelas=calcularEstrelas(acertos,erros);registrarPartida('horas',{acertos,erros,estrelas});$('resumo').textContent=`${nomeDaCrianca()}, você acertou ${acertos} de 10 horários.`;$('estrelas').textContent='⭐'.repeat(estrelas);exibir('final');tocar('vitoria');lancarConfete()}else nova()}
document.querySelectorAll('.modo').forEach(b=>b.addEventListener('click',()=>iniciar(b.dataset.modo)));document.querySelectorAll('[data-ajuste]').forEach(b=>b.addEventListener('click',()=>{ajuste=normalizarHorario(0,minutosTotais(ajuste)+Number(b.dataset.ajuste));apontar(ajuste);tocar('clique')}));$('conferir').addEventListener('click',()=>responder());$('proxima').addEventListener('click',avancar);$('sair').addEventListener('click',()=>exibir('inicio'));$('de-novo').addEventListener('click',()=>iniciar());$('trocar').addEventListener('click',()=>exibir('inicio'));montarMostrador();

// O nível minuto a minuto precisa de ajuste fino além dos quatro controles pedidos.
for (const delta of [-1, 1]) {
  const botao = document.createElement('button');
  botao.className = 'botao botao--neutro minuto-exato';
  botao.dataset.ajuste = delta;
  botao.textContent = `${delta > 0 ? '+' : '−'}1 min`;
  botao.addEventListener('click', () => {
    ajuste = normalizarHorario(0, minutosTotais(ajuste) + delta);
    apontar(ajuste);
    tocar('clique');
  });
  $('ajustes').insertBefore(botao, $('ajustes').firstChild);
}
function prepararAjustes() {
  $('ajustes').querySelectorAll('button').forEach(botao => { botao.disabled = false; });
  document.querySelectorAll('.minuto-exato').forEach(botao => { botao.hidden = nivel !== 'desafio'; });
}
document.querySelectorAll('.modo').forEach(botao => botao.addEventListener('click', prepararAjustes));
$('proxima').addEventListener('click', prepararAjustes);
$('de-novo').addEventListener('click', prepararAjustes);
