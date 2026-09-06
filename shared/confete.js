/**
 * confete.js — chuva de confete em canvas, sem nenhuma biblioteca.
 * Uso: import { lancarConfete } from '../../shared/confete.js'; lancarConfete();
 */

const QUANTIDADE = 80;
const CORES_PADRAO = ['#ff69b4', '#ffb6c1', '#ffd166', '#06d6a0', '#4cc9f0', '#f8f8ff'];

function querMenosMovimento() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Usa as cores dos tokens do base.css quando elas existirem. */
function obterCores() {
  try {
    const estilo = getComputedStyle(document.documentElement);
    const daPagina = ['--cor-principal', '--cor-secundaria', '--cor-destaque']
      .map(nome => estilo.getPropertyValue(nome).trim())
      .filter(Boolean);
    return daPagina.length ? [...daPagina, '#ffd166', '#06d6a0', '#4cc9f0'] : CORES_PADRAO;
  } catch {
    return CORES_PADRAO;
  }
}

/**
 * Lança o confete por `duracaoMs` e limpa tudo depois.
 * Com "reduzir movimento" ligado no sistema, não faz nada.
 */
export function lancarConfete(duracaoMs = 1500) {
  if (querMenosMovimento()) return;
  if (!document.body) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const escala = window.devicePixelRatio || 1;
  const largura = window.innerWidth;
  const altura = window.innerHeight;
  canvas.width = largura * escala;
  canvas.height = altura * escala;
  ctx.scale(escala, escala);

  const cores = obterCores();
  const particulas = Array.from({ length: QUANTIDADE }, () => ({
    x: Math.random() * largura,
    y: -20 - Math.random() * altura * 0.5,   // começa acima da tela
    l: 6 + Math.random() * 8,                // lado do papelzinho
    vx: -1 + Math.random() * 2,              // deriva lateral
    vy: 2 + Math.random() * 3,               // queda
    giro: Math.random() * Math.PI * 2,
    velocidadeGiro: -0.2 + Math.random() * 0.4,
    cor: cores[Math.floor(Math.random() * cores.length)],
  }));

  const inicio = performance.now();
  let quadro = 0;

  function desenhar(agora) {
    const decorrido = agora - inicio;
    ctx.clearRect(0, 0, largura, altura);

    // No último terço do tempo o confete vai sumindo em vez de cortar seco.
    const opacidade = Math.min(1, Math.max(0, (duracaoMs - decorrido) / (duracaoMs / 3)));
    ctx.globalAlpha = opacidade;

    for (const p of particulas) {
      p.x += p.vx;
      p.y += p.vy;
      p.giro += p.velocidadeGiro;
      if (p.y > altura + 20) p.y = -20;      // recicla quem já caiu

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.l / 2, -p.l / 4, p.l, p.l / 2);
      ctx.restore();
    }

    if (decorrido < duracaoMs) {
      quadro = requestAnimationFrame(desenhar);
    } else {
      cancelAnimationFrame(quadro);
      canvas.remove();
    }
  }

  quadro = requestAnimationFrame(desenhar);
}
