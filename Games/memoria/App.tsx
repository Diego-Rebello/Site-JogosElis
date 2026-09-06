import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CardData, GameState, Player } from './types';
import Cabecalho from './components/Cabecalho';
import { tocar } from '../../shared/sons.js';
import { lancarConfete } from '../../shared/confete.js';
import { calcularEstrelas as calcularEstrelasGeral, obterConfiguracoes, registrarPartida } from '../../shared/progresso.js';
import { calcularEstrelas, gerarCartas } from './lib/logica';
import { nomesDosTemas, type NomeDoTema } from './lib/temas';

// Tons escolhidos na T22: com texto branco por cima, todos passam de 4.5:1
// (os tons 500 do Tailwind ficavam entre 2.1 e 3.8).
const CORES = ['bg-pink-600', 'bg-red-600', 'bg-emerald-700', 'bg-amber-700'];
const configuracoes = obterConfiguracoes();
const nomeCrianca = configuracoes.nomeCrianca;
const cartasSalvas = Number(configuracoes.niveis.memoria);
const cartasPadrao = [16, 24, 32].includes(cartasSalvas) ? cartasSalvas : 16;

interface Recorde { jogadas: number; segundos: number }
const chaveRecorde = (cartas: number) => `jogos-elis:memoria:recorde:${cartas}`;
function lerRecorde(cartas: number): Recorde | null {
  try { const valor = JSON.parse(localStorage.getItem(chaveRecorde(cartas)) || 'null'); return valor && Number.isFinite(valor.jogadas) && Number.isFinite(valor.segundos) ? valor : null; } catch { return null; }
}
function melhorQue(atual: Recorde, anterior: Recorde | null) { return !anterior || atual.jogadas < anterior.jogadas || (atual.jogadas === anterior.jogadas && atual.segundos < anterior.segundos); }
function salvarRecorde(cartas: number, recorde: Recorde) { try { localStorage.setItem(chaveRecorde(cartas), JSON.stringify(recorde)); } catch { /* O jogo continua sem persistência. */ } }
const tempo = (segundos: number) => `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;

interface SetupProps { onStart: (jogadores: number, cartas: number, tema: NomeDoTema) => void }
const SetupScreen: React.FC<SetupProps> = ({ onStart }) => {
  const [jogadores, setJogadores] = useState(1); const [cartas, setCartas] = useState(cartasPadrao); const [tema, setTema] = useState<NomeDoTema>('Animais');
  const seletor = (ativo: boolean) => `min-h-12 rounded-xl border-2 px-3 py-2 font-bold transition ${ativo ? 'border-pink-600 bg-pink-600 text-white shadow-md' : 'border-pink-200 bg-white text-pink-700 hover:bg-pink-50'}`;
  return <main className="flex flex-1 items-center justify-center p-3 sm:p-5"><section className="w-full max-w-2xl rounded-2xl bg-white/75 p-5 text-center shadow-lg sm:p-8">
    <h1 className="mb-5 font-fredoka text-4xl text-pink-700 sm:text-5xl">🧠 Jogo da Memória</h1>
    <fieldset className="mb-5"><legend className="mb-3 text-xl font-bold text-gray-700">Escolha um tema</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{nomesDosTemas.map(nome => <button key={nome} className={seletor(tema === nome)} aria-pressed={tema === nome} onClick={() => setTema(nome)}>{nome}</button>)}</div></fieldset>
    <fieldset className="mb-5"><legend className="mb-3 text-xl font-bold text-gray-700">Quantos jogadores?</legend><div className="flex justify-center gap-2">{[1,2,3,4].map(n => <button key={n} className={`${seletor(jogadores === n)} min-w-14 text-xl`} aria-pressed={jogadores === n} onClick={() => setJogadores(n)}>{n}</button>)}</div></fieldset>
    <fieldset className="mb-6"><legend className="mb-3 text-xl font-bold text-gray-700">Quantas cartas?</legend><div className="flex justify-center gap-2">{[16,24,32].map(n => <button key={n} className={`${seletor(cartas === n)} min-w-16 text-lg`} aria-pressed={cartas === n} onClick={() => setCartas(n)}>{n}</button>)}</div></fieldset>
    <button className="min-h-14 w-full rounded-2xl bg-emerald-700 px-5 text-2xl font-bold text-white shadow-lg hover:bg-emerald-800" onClick={() => onStart(jogadores, cartas, tema)}>Começar!</button>
  </section></main>;
};

interface CardProps { card: CardData; onClick: (id: number) => void; disabled: boolean }
const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => <button type="button" aria-label={card.isMatched ? `Par encontrado: ${card.emoji}` : card.isFlipped ? `Carta ${card.emoji}` : 'Carta virada'} disabled={disabled || card.isFlipped || card.isMatched} onClick={() => onClick(card.id)} className="aspect-[3/4] min-h-11 w-full [perspective:1000px] disabled:cursor-default">
  <span className={`relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''}`}>
    <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-pink-600 text-3xl text-pink-100 shadow-md [backface-visibility:hidden]">?</span>
    <span className={`absolute inset-0 flex items-center justify-center rounded-lg text-3xl shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] sm:text-4xl ${card.isMatched ? 'bg-emerald-200' : 'bg-white'}`}>{card.emoji}</span>
  </span>
</button>;

interface PlacarProps { players: Player[]; atual: number; jogadas: number; segundos: number; solo: boolean; onName: (id: number, nome: string) => void; onNew: () => void; onBack: () => void }
const Placar: React.FC<PlacarProps> = ({ players, atual, jogadas, segundos, solo, onName, onNew, onBack }) => <div className="mb-4 rounded-xl bg-white/75 p-3 shadow-md">
  {solo ? <div className="flex justify-center gap-6 text-lg font-bold text-gray-700"><span>🃏 {jogadas} jogadas</span><span>⏱️ {tempo(segundos)}</span></div> : <div className="mb-3 flex flex-wrap justify-center gap-2">{players.map((p,i) => <div key={p.id} className={`rounded-lg p-2 text-center transition ${p.id === atual ? `${CORES[i]} scale-105 text-white shadow-lg` : 'bg-gray-200'}`}><input aria-label={`Nome do jogador ${p.id}`} className="w-24 bg-transparent text-center text-sm font-bold focus:outline-none" value={p.name} maxLength={18} onChange={e => onName(p.id,e.target.value)}/><div className="text-xl font-bold">{p.score}</div></div>)}</div>}
  <div className="mt-2 flex justify-center gap-2"><button className="min-h-11 rounded-lg bg-pink-600 px-4 font-bold text-white" onClick={onBack}>Voltar</button><button className="min-h-11 rounded-lg bg-emerald-700 px-4 font-bold text-white" onClick={onNew}>Novo jogo</button></div>
</div>;

interface FinalProps { players: Player[]; solo: boolean; jogadas: number; segundos: number; estrelas: number; recorde: Recorde | null; novoRecorde: boolean; onAgain: () => void; onBack: () => void }
const Final: React.FC<FinalProps> = ({ players, solo, jogadas, segundos, estrelas, recorde, novoRecorde, onAgain, onBack }) => {
  const maior = Math.max(...players.map(p => p.score)); const vencedores = players.filter(p => p.score === maior); const mensagem = solo ? `Parabéns, ${nomeCrianca}!` : vencedores.length > 1 ? 'Empate!' : `${vencedores[0]?.name} venceu!`;
  return <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4"><section className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl"><h2 className="mb-3 font-fredoka text-4xl text-yellow-600">🏆 {mensagem}</h2>{solo ? <><p className="text-xl">Você terminou em <strong>{jogadas} jogadas</strong> e <strong>{tempo(segundos)}</strong>.</p>{novoRecorde && <p className="mt-2 text-xl font-bold text-emerald-600">✨ Novo recorde!</p>}{recorde && <p className="mt-2 text-gray-600">Recorde: {recorde.jogadas} jogadas em {tempo(recorde.segundos)}</p>}</> : <div>{players.map(p => <p key={p.id}>{p.name}: <strong>{p.score} pares</strong></p>)}</div>}<p className="my-4 text-3xl" aria-label={`${estrelas} estrelas`}>{'⭐'.repeat(estrelas)}</p><div className="flex flex-wrap justify-center gap-3"><button className="min-h-12 rounded-xl bg-emerald-700 px-5 font-bold text-white" onClick={onAgain}>Jogar de novo</button><button className="min-h-12 rounded-xl bg-pink-600 px-5 font-bold text-white" onClick={onBack}>Configurar</button></div></section></div>;
};

const App: React.FC = () => {
  const [estado,setEstado] = useState<GameState>('setup'), [cards,setCards] = useState<CardData[]>([]), [viradas,setViradas] = useState<number[]>([]), [combinadas,setCombinadas] = useState<number[]>([]), [conferindo,setConferindo] = useState(false), [tremendo,setTremendo] = useState(false), [aviso,setAviso] = useState('');
  const [players,setPlayers] = useState<Player[]>([]), [playerAtual,setPlayerAtual] = useState(1), [cardCount,setCardCount] = useState(cartasPadrao), [tema,setTema] = useState<NomeDoTema>('Animais'), [jogadas,setJogadas] = useState(0), [segundos,setSegundos] = useState(0), [recorde,setRecorde] = useState<Recorde|null>(null), [novoRecorde,setNovoRecorde] = useState(false);
  const timers = useRef<number[]>([]), jogadasRef = useRef(0), segundosRef = useRef(0), registrada = useRef(false);
  const limparTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current=[]; }, []);
  const agendar = useCallback((fn:()=>void, ms:number) => { const id=window.setTimeout(()=>{timers.current=timers.current.filter(x=>x!==id);fn()},ms);timers.current.push(id);return id; },[]);
  useEffect(() => limparTimers, [limparTimers]);
  useEffect(() => { if (estado !== 'playing' || players.length !== 1) return; const id=window.setInterval(()=>{segundosRef.current++;setSegundos(segundosRef.current)},1000); return()=>clearInterval(id); },[estado,players.length]);

  useEffect(() => {
    if (viradas.length !== 2) return; setConferindo(true); const [a,b]=viradas, primeira=cards.find(c=>c.id===a), segunda=cards.find(c=>c.id===b);
    if (primeira && segunda && primeira.emoji===segunda.emoji) { tocar('acerto'); setAviso(`Par encontrado: ${primeira.emoji}.`); setCombinadas(v=>[...v,a,b]); setPlayers(ps=>ps.map(p=>p.id===playerAtual?{...p,score:p.score+1}:p)); setViradas([]); setConferindo(false); return; }
    tocar('erro'); setAviso('Não foi dessa vez. As cartas vão virar de novo.'); setTremendo(true); agendar(()=>{setTremendo(false);setViradas([]);if(players.length>1)setPlayerAtual(p=>(p%players.length)+1);setConferindo(false)},900);
  },[viradas,cards,playerAtual,players.length,agendar]);

  useEffect(() => {
    if (!cards.length || combinadas.length!==cards.length || registrada.current) return; registrada.current=true; const pares=cards.length/2, solo=players.length===1, estrelas=solo?calcularEstrelas(jogadasRef.current,pares):calcularEstrelasGeral(pares,Math.max(0,jogadasRef.current-pares));
    registrarPartida('memoria',{acertos:pares,erros:Math.max(0,jogadasRef.current-pares),estrelas});
    if(solo){const atual={jogadas:jogadasRef.current,segundos:segundosRef.current},anterior=lerRecorde(cardCount),novo=melhorQue(atual,anterior);if(novo)salvarRecorde(cardCount,atual);setNovoRecorde(novo);setRecorde(novo?atual:anterior)}
    setEstado('finished'); setAviso('Você encontrou todos os pares!'); tocar('vitoria'); lancarConfete();
  },[combinadas,cards,players.length,cardCount,agendar]);

  const iniciar = useCallback((quantidadeJogadores:number, quantidadeCartas:number, nomeTema:NomeDoTema) => { limparTimers();setCardCount(quantidadeCartas);setTema(nomeTema);setPlayers(Array.from({length:quantidadeJogadores},(_,i)=>({id:i+1,name:i===0?nomeCrianca:`Jogador ${i+1}`,score:0})));setCards(gerarCartas(quantidadeCartas,nomeTema));setViradas([]);setCombinadas([]);setPlayerAtual(1);setConferindo(false);setTremendo(false);jogadasRef.current=0;segundosRef.current=0;setJogadas(0);setSegundos(0);setRecorde(quantidadeJogadores===1?lerRecorde(quantidadeCartas):null);setNovoRecorde(false);registrada.current=false;setEstado('playing');tocar('clique') },[limparTimers]);
  const repetir = useCallback(() => iniciar(players.length,cardCount,tema),[iniciar,players.length,cardCount,tema]);
  const voltar = useCallback(() => { limparTimers();setEstado('setup');setCards([]);setViradas([]);setCombinadas([]) },[limparTimers]);
  const virar = useCallback((id:number) => { if(conferindo||viradas.length>=2||viradas.includes(id)||combinadas.includes(id))return;if(viradas.length===1){jogadasRef.current++;setJogadas(jogadasRef.current)}setViradas(v=>[...v,id]);tocar('clique') },[conferindo,viradas,combinadas]);
  const mudarNome = useCallback((id:number,nome:string)=>setPlayers(ps=>ps.map(p=>p.id===id?{...p,name:nome}:p)),[]);
  const colunas=cardCount===32?'grid-cols-4 sm:grid-cols-6 md:grid-cols-8':cardCount===24?'grid-cols-4 sm:grid-cols-6':'grid-cols-4'; const largura=cardCount===32?'max-w-5xl':cardCount===24?'max-w-3xl':'max-w-lg'; const estrelasFinal=players.length===1?calcularEstrelas(jogadas,cardCount/2):calcularEstrelasGeral(cardCount/2,Math.max(0,jogadas-cardCount/2));
  return <div className="fundo-jogos flex min-h-dvh flex-col"><Cabecalho titulo="Jogo da Memória"/><p className="so-leitor" role="status" aria-live="polite">{aviso}</p>{estado==='setup'?<SetupScreen onStart={iniciar}/>:<main className="flex flex-1 justify-center p-3 sm:p-5"><div className={`w-full ${largura}`}><header className="mb-4 text-center"><h1 className="font-fredoka text-4xl text-pink-700">{tema}</h1><p className="text-gray-600">Encontre os pares!</p></header><Placar players={players} atual={playerAtual} jogadas={jogadas} segundos={segundos} solo={players.length===1} onName={mudarNome} onNew={repetir} onBack={voltar}/><section className={`grid ${colunas} gap-2 rounded-xl bg-white/70 p-3 shadow-lg sm:gap-3 ${tremendo?'tremer':''}`}>{cards.map(c=><Card key={c.id} card={{...c,isFlipped:viradas.includes(c.id),isMatched:combinadas.includes(c.id)}} onClick={virar} disabled={conferindo}/>)}</section>{estado==='finished'&&<Final players={players} solo={players.length===1} jogadas={jogadas} segundos={segundos} estrelas={estrelasFinal} recorde={recorde} novoRecorde={novoRecorde} onAgain={repetir} onBack={voltar}/>}</div></main>}</div>;
};

export default App;
