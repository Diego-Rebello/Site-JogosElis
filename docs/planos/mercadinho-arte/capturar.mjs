// Tira capturas do Mercadinho em quatro tamanhos de tela, para o portão visual do
// PLANO-MERCADINHO-ARTE.md. Não tem dependências: usa o Google Chrome instalado,
// em modo sem janela, pelo protocolo de depuração.
//
// Uso (com `npm run dev` rodando em outro terminal):
//   node docs/planos/mercadinho-arte/capturar.mjs [url] [pasta-de-saida]
//
//   url             padrão: http://localhost:5173/Games/mercadinho/
//   pasta-de-saida  padrão: ./capturas-mercadinho (crie fora do repositório ou não faça commit)
//
// Sai um PNG por tela e por tamanho:
//   1-inicio, 1b-tutorial, 2-missao, 3-loja, 4-mapa, 5-produto (prateleira do hortifrúti, pelo mapa),
//   6-secoes, 7-gondola (Laticínios), 8-produto-embalagem (Leite), 9-guloseimas.
// Nos tamanhos de celular os toques são toques de verdade (eventos de toque), como no aparelho;
// no computador são cliques de mouse. Assim o contorno de foco aparece só quando apareceria
// para a Elis. Erros do console da página aparecem no terminal com "ERRO".
// Cada tamanho imprime uma linha "medidas" (px de CSS) e o desalinhamento das tábuas da gôndola,
// para o relatório.

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as esperar } from 'node:timers/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const url = process.argv[2] || 'http://localhost:5173/Games/mercadinho/';
const saida = path.resolve(process.argv[3] || 'capturas-mercadinho');
const TAMANHOS = [
  { nome: 'cel-360', largura: 360, altura: 640, dpr: 3, toque: true },
  { nome: 'cel-390', largura: 390, altura: 844, dpr: 3, toque: true },
  { nome: 'pc-1280', largura: 1280, altura: 800, dpr: 2, toque: false },
  { nome: 'pc-1366', largura: 1366, altura: 768, dpr: 2, toque: false },
];
// Casa de prateleira usada na captura do painel do produto (hortifrúti, perto da entrada).
const CASA_DO_PRODUTO = { x: 1, y: 12 };
const MAPA = '#mapa-janela, #mapa-canvas';

mkdirSync(saida, { recursive: true });

async function capturar(tamanho) {
  const porta = 9300 + Math.floor(Math.random() * 600);
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${porta}`,
    `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'mercadinho-'))}`,
    '--no-first-run', '--hide-scrollbars', 'about:blank',
  ], { stdio: 'ignore' });

  try {
    let alvo;
    for (let i = 0; i < 60 && !alvo; i++) {
      await esperar(200);
      try {
        alvo = (await (await fetch(`http://127.0.0.1:${porta}/json`)).json()).find(a => a.type === 'page');
      } catch { /* o Chrome ainda está abrindo */ }
    }
    if (!alvo) throw new Error('O Chrome não respondeu.');

    const ws = new WebSocket(alvo.webSocketDebuggerUrl);
    await new Promise(resolver => ws.addEventListener('open', resolver));
    let sequencia = 0;
    const pendentes = new Map();
    ws.addEventListener('message', evento => {
      const mensagem = JSON.parse(evento.data);
      if (mensagem.id && pendentes.has(mensagem.id)) {
        pendentes.get(mensagem.id)(mensagem);
        pendentes.delete(mensagem.id);
      }
      if (mensagem.method === 'Runtime.exceptionThrown') {
        console.log(`ERRO [${tamanho.nome}]`, mensagem.params.exceptionDetails.exception?.description || mensagem.params.exceptionDetails.text);
      }
      if (mensagem.method === 'Runtime.consoleAPICalled' && mensagem.params.type === 'error') {
        console.log(`ERRO [${tamanho.nome}]`, mensagem.params.args.map(a => a.value || a.description).join(' '));
      }
    });
    const cmd = (method, params = {}) => new Promise(resolver => {
      const id = ++sequencia;
      pendentes.set(id, resolver);
      ws.send(JSON.stringify({ id, method, params }));
    });
    const js = async expressao => (await cmd('Runtime.evaluate', {
      expression: expressao, awaitPromise: true, returnByValue: true,
    })).result?.result?.value;
    const foto = async (nome, seletor) => {
      let clip;
      if (seletor) {
        const caixa = await js(`(() => { const e = document.querySelector(${JSON.stringify(seletor)}); if (!e) return 'null';
          const r = e.getBoundingClientRect(); return JSON.stringify({ x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height, scale: 1 }); })()`);
        clip = JSON.parse(caixa || 'null');
      }
      const resposta = await cmd('Page.captureScreenshot', { format: 'png', ...(clip ? { clip, captureBeyondViewport: true } : {}) });
      writeFileSync(path.join(saida, `${tamanho.nome}-${nome}.png`), Buffer.from(resposta.result.data, 'base64'));
    };

    // Toque (celular) ou clique de mouse (computador) num ponto da janela.
    const tocarPonto = async ({ x, y }) => {
      if (tamanho.toque) {
        await cmd('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await cmd('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else {
        await cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
        for (const type of ['mousePressed', 'mouseReleased']) {
          await cmd('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
        }
      }
      await esperar(80);
    };
    // Toca no centro de um elemento visível (rola a página até ele antes).
    const tocar = async seletor => {
      const ponto = JSON.parse(await js(`(() => { const e = [...document.querySelectorAll(${JSON.stringify(seletor)})].find(el => el.offsetParent !== null);
        if (!e) return 'null'; e.scrollIntoView({ block: 'center', inline: 'center' });
        const r = e.getBoundingClientRect(); return JSON.stringify({ x: r.x + r.width / 2, y: r.y + r.height / 2 }); })()`) || 'null');
      if (!ponto) {
        console.log(`AVISO [${tamanho.nome}] não achei ${seletor}`);
        return;
      }
      await tocarPonto(ponto);
    };
    const tocarCasa = async ({ x, y }) => {
      const ponto = JSON.parse(await js(`(() => { const e = document.querySelector(${JSON.stringify(MAPA)}); if (!e) return 'null';
        const r = e.getBoundingClientRect(), d = e.dataset; const casa = Number(d.casaPx);
        const fator = d.escala && e.tagName === 'CANVAS' ? Number(d.escala) : 1;
        return JSON.stringify({ x: r.x + (${x} + .5) * casa - Number(d.camX) * fator, y: r.y + (${y} + .5) * casa - Number(d.camY) * fator }); })()`) || 'null');
      if (ponto) await tocarPonto(ponto);
    };
    const medir = () => js(`(() => {
      const r = s => { const e = document.querySelector(s); if (!e || e.offsetParent === null) return null; const b = e.getBoundingClientRect(); return Math.round(b.width) + 'x' + Math.round(b.height); };
      const d = Object.assign({}, document.querySelector(${JSON.stringify(MAPA)})?.dataset);
      return JSON.stringify({ casa: d.casaPx, camX: d.camX, camY: d.camY, painelCompra: r('#painel-fixo'), mapa: r(${JSON.stringify(MAPA)}),
        barraBaixo: r('#acoes-loja'), listaRapida: r('#btn-alternar-modo-loja'), rolaPagina: document.documentElement.scrollHeight > innerHeight + 1 });
    })()`);

    // Maior diferença de altura (px de CSS) entre tábuas da mesma fileira da gôndola: tem de dar 0.
    const tabuasTortas = () => js(`(() => {
      const fileiras = new Map();
      for (const grade of document.querySelectorAll('.gondola__grade')) {
        if (grade.offsetParent === null) continue;
        const colunas = getComputedStyle(grade).gridTemplateColumns.split(' ').length;
        [...grade.querySelectorAll('.vaga')].forEach((v, i) => {
          const t = v.querySelector('.vaga__tabua'); if (!t) return;
          const chave = Math.floor(i / colunas);
          const lista = fileiras.get(chave) || []; lista.push(t.getBoundingClientRect().top); fileiras.set(chave, lista);
        });
      }
      let pior = 0; for (const l of fileiras.values()) pior = Math.max(pior, Math.max(...l) - Math.min(...l));
      return Math.round(pior * 10) / 10;
    })()`);

    await cmd('Runtime.enable');
    await cmd('Page.enable');
    await cmd('Emulation.setDeviceMetricsOverride', {
      width: tamanho.largura, height: tamanho.altura, deviceScaleFactor: tamanho.dpr, mobile: tamanho.toque,
    });
    if (tamanho.toque) await cmd('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await cmd('Page.navigate', { url });
    await esperar(2000);
    await foto('1-inicio');
    await tocar('#btn-comecar');
    await esperar(600);
    // Perfil novo: o tutorial aparece no primeiro COMEÇAR.
    if (await js(`!document.getElementById('fase-tutorial')?.hidden`)) {
      await foto('1b-tutorial');
      await tocar('#btn-tutorial-pular');
      await esperar(600);
    }
    await foto('2-missao');
    await tocar('#btn-ir-compras');
    await esperar(1800);
    await js('window.scrollTo(0, 0)');
    await foto('3-loja');
    await foto('4-mapa', MAPA);
    console.log(`[${tamanho.nome}] medidas:`, await medir());
    await tocarCasa(CASA_DO_PRODUTO);
    await esperar(3000);
    await foto('5-produto');
    await tocar('#btn-fechar-prateleira');
    await esperar(300);
    await tocar('#btn-alternar-modo-loja');
    await esperar(700);
    await js('window.scrollTo(0, 0)');
    await foto('6-secoes');
    await tocar('.botao-secao[data-secao="laticinios"]');
    await esperar(700);
    await js('window.scrollTo(0, 0)');
    await foto('7-gondola');
    console.log(`[${tamanho.nome}] gôndola Laticínios, tábuas tortas (px):`, await tabuasTortas());
    await tocar('.vaga[data-produto-id="leite"]');
    await esperar(900);
    await foto('8-produto-embalagem');
    await tocar('#btn-fechar-prateleira');
    await esperar(300);
    await tocar('#btn-voltar-secoes');
    await esperar(500);
    await tocar('.botao-secao[data-secao="guloseimas"]');
    await esperar(700);
    await js('window.scrollTo(0, 0)');
    await foto('9-guloseimas');
    console.log(`[${tamanho.nome}] gôndola Guloseimas, tábuas tortas (px):`, await tabuasTortas());
    // Volta ao modo mapa para a próxima abertura do jogo não começar na lista rápida.
    await tocar('#btn-alternar-modo-loja');
    await esperar(300);
    ws.close();
  } finally {
    chrome.kill();
  }
}

for (const tamanho of TAMANHOS) {
  await capturar(tamanho);
}
console.log(`Capturas em ${saida}`);
process.exit(0);
