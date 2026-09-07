import { montarCabecalho } from '../../shared/cabecalho.js';
import { lancarConfete } from '../../shared/confete.js';
import { nomeDaCrianca, obterConfiguracoes, registrarPartida } from '../../shared/progresso.js';
import { tocar } from '../../shared/sons.js';
import { temas } from './dados.js';
import { caminhoEntre, dificuldades, escolherPalavras, gerarGrade, lerCaminho, palavraDaGrade } from './jogo.js';

montarCabecalho('Caça-Palavras');
const $=id=>document.getElementById(id);let tema='animais',dificuldade='medio',partida,palavras=[],encontradas=new Set(),inicio=0,intervalo=null,primeira=null,caminhoAtual=[];
function exibir(id){['inicio','partida','final'].forEach(t=>$(t).hidden=t!==id)}
function selecionar(tipo,valor){if(tipo==='tema')tema=valor;else dificuldade=valor;document.querySelectorAll(`[data-${tipo}]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[tipo]===valor)))}
for(const [id,dado] of Object.entries(temas)){const b=document.createElement('button');b.className='botao botao--neutro escolha';b.dataset.tema=id;b.textContent=`${dado.emoji} ${dado.nome}`;b.addEventListener('click',()=>selecionar('tema',id));$('temas').append(b)}
for(const [id,dado] of Object.entries(dificuldades)){const b=document.createElement('button');b.className='botao botao--neutro escolha';b.dataset.dificuldade=id;b.textContent=`${dado.nome} · ${dado.tamanho}×${dado.tamanho}`;b.addEventListener('click',()=>selecionar('dificuldade',id));$('dificuldades').append(b)}selecionar('tema',tema);const dificuldadeSalva=obterConfiguracoes().niveis['caca-palavras'];selecionar('dificuldade',dificuldades[dificuldadeSalva]?dificuldadeSalva:'medio');
function celulaEm(linha,coluna){return $(`c-${linha}-${coluna}`)}function limparSelecao(){document.querySelectorAll('.celula.selecionada').forEach(c=>c.classList.remove('selecionada'));caminhoAtual=[]}function pintarCaminho(caminho){limparSelecao();caminhoAtual=caminho;caminho.forEach(p=>celulaEm(p.linha,p.coluna)?.classList.add('selecionada'))}
function montarGrade(){const grade=$('grade');grade.replaceChildren();grade.style.gridTemplateColumns=`repeat(${partida.grade.length},1fr)`;partida.grade.forEach((linha,l)=>linha.forEach((letra,c)=>{const b=document.createElement('button');b.type='button';b.className='celula';b.id=`c-${l}-${c}`;b.dataset.linha=l;b.dataset.coluna=c;b.textContent=letra;b.setAttribute('role','gridcell');b.setAttribute('aria-label',`${letra}, linha ${l+1}, coluna ${c+1}`);grade.append(b)}))}
function montarLista(){const lista=$('lista');lista.replaceChildren();for(const [palavra,emoji] of palavras){const s=document.createElement('span');s.className='palavra';s.dataset.palavra=palavraDaGrade(palavra);s.textContent=`${emoji} ${palavra}`;lista.append(s)}}
function posicao(elemento){const c=elemento?.closest?.('.celula');return c?{linha:Number(c.dataset.linha),coluna:Number(c.dataset.coluna)}:null}
function palavraSelecionada(){const direta=lerCaminho(partida.grade,caminhoAtual),inversa=[...direta].reverse().join('');return palavras.map(([p])=>palavraDaGrade(p)).find(p=>p===direta||p===inversa)}
function conferir(){const palavra=palavraSelecionada();if(!palavra||encontradas.has(palavra)){limparSelecao();primeira=null;return}encontradas.add(palavra);caminhoAtual.forEach(p=>{const c=celulaEm(p.linha,p.coluna);c.classList.remove('selecionada');c.classList.add('encontrada')});document.querySelector(`[data-palavra="${palavra}"]`)?.classList.add('encontrada');$('quantidade').textContent=encontradas.size;$('progresso').value=encontradas.size;$('feedback').textContent=`Encontrou ${palavras.find(([p])=>palavraDaGrade(p)===palavra)[0]}!`;$('feedback').className='feedback feedback--certo';tocar('acerto');primeira=null;caminhoAtual=[];if(encontradas.size===palavras.length)finalizar()}
function atualizarTempo(){const s=Math.floor((Date.now()-inicio)/1000);$('tempo').textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
function iniciarJogo(){const config=dificuldades[dificuldade];palavras=escolherPalavras(temas[tema].palavras,config.tamanho,8);partida=gerarGrade(palavras.map(([palavra])=>palavra),config.tamanho,config);encontradas=new Set();primeira=null;$('quantidade').textContent='0';$('progresso').value=0;$('feedback').textContent='';montarGrade();montarLista();inicio=Date.now();clearInterval(intervalo);intervalo=setInterval(atualizarTempo,1000);atualizarTempo();exibir('partida');tocar('clique')}
function finalizar(){clearInterval(intervalo);const segundos=Math.max(1,Math.floor((Date.now()-inicio)/1000)),limites={facil:[90,180],medio:[150,300],dificil:[240,480]}[dificuldade],estrelas=segundos<=limites[0]?3:segundos<=limites[1]?2:1;registrarPartida('caca-palavras',{acertos:8,erros:0,estrelas});$('resumo').textContent=`Parabéns, ${nomeDaCrianca()}! Você terminou em ${Math.floor(segundos/60)} min ${segundos%60} s.`;$('estrelas').textContent='⭐'.repeat(estrelas);exibir('final');tocar('vitoria');lancarConfete()}
$('comecar').addEventListener('click',iniciarJogo);$('sair').addEventListener('click',()=>{clearInterval(intervalo);exibir('inicio')});$('de-novo').addEventListener('click',iniciarJogo);$('trocar').addEventListener('click',()=>exibir('inicio'));

// Um toque escolhe as pontas; um arraste escolhe do início até a célula sob o dedo.
// O clique separado preserva a mesma mecânica para mouse e teclado.
let inicioDoPonteiro = null;
let arrastou = false;
let ignorarClique = false;
const gradeElemento = $('grade');
gradeElemento.addEventListener('pointerdown', evento => {
  const pos = posicao(evento.target);
  if (!pos) return;
  evento.preventDefault();
  evento.stopImmediatePropagation();
  inicioDoPonteiro = pos;
  arrastou = false;
  gradeElemento.setPointerCapture?.(evento.pointerId);
}, true);
gradeElemento.addEventListener('pointermove', evento => {
  if (!inicioDoPonteiro || !(evento.buttons || evento.pointerType === 'touch')) return;
  evento.preventDefault();
  evento.stopImmediatePropagation();
  const fim = posicao(document.elementFromPoint(evento.clientX, evento.clientY));
  if (!fim) return;
  if (fim.linha !== inicioDoPonteiro.linha || fim.coluna !== inicioDoPonteiro.coluna) arrastou = true;
  if (arrastou) {
    primeira = inicioDoPonteiro;
    pintarCaminho(caminhoEntre(primeira, fim));
  }
}, true);
gradeElemento.addEventListener('pointerup', evento => {
  if (!inicioDoPonteiro) return;
  evento.preventDefault();
  evento.stopImmediatePropagation();
  const fim = posicao(document.elementFromPoint(evento.clientX, evento.clientY)) || inicioDoPonteiro;
  if (arrastou) {
    primeira = inicioDoPonteiro;
    pintarCaminho(caminhoEntre(primeira, fim));
    if (caminhoAtual.length > 1) conferir();
    primeira = null;
  } else if (!primeira) {
    primeira = fim;
    pintarCaminho([fim]);
  } else {
    const caminho = caminhoEntre(primeira, fim);
    if (caminho.length > 1) { pintarCaminho(caminho); conferir(); }
    else { primeira = fim; pintarCaminho([fim]); }
  }
  inicioDoPonteiro = null;
  ignorarClique = true;
}, true);
gradeElemento.addEventListener('click', evento => {
  if (ignorarClique) { ignorarClique = false; evento.stopImmediatePropagation(); return; }
  const fim = posicao(evento.target);
  if (!fim) return;
  evento.stopImmediatePropagation();
  if (!primeira) { primeira = fim; pintarCaminho([fim]); return; }
  const caminho = caminhoEntre(primeira, fim);
  if (caminho.length > 1) { pintarCaminho(caminho); conferir(); }
  else { primeira = fim; pintarCaminho([fim]); }
}, true);
