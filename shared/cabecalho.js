/*
 * cabecalho.js — injeta a barra de cima com "🏠 Início", o título do jogo e
 * o botão de som. Use como script clássico (sem type="module"), porque ele
 * lê o próprio data-titulo por document.currentScript:
 *
 *   <script src="../../shared/cabecalho.js" data-titulo="Jogo da Forca"></script>
 *
 * Os jogos em React não usam este arquivo: eles têm o componente Cabecalho,
 * com o mesmo HTML e as mesmas classes.
 */
(function () {
  // Tem de ser lido agora: dentro de um callback, currentScript já é null.
  var script = document.currentScript;
  var titulo = (script && script.dataset.titulo) || document.title;
  var urlSons = script ? new URL('sons.js', script.src).href : null;

  /**
   * Descobre o caminho da página inicial a partir de onde o jogo está.
   * Serve tanto para Games/forca/ quanto para Games/memoria/dist/, e o /i
   * cobre o Netlify, que publica a pasta como /games/ em minúsculas.
   */
  function caminhoDoInicio() {
    var caminho = location.pathname;
    if (/\/games\//i.test(caminho)) {
      return caminho.replace(/\/games\/.*$/i, '/index.html');
    }
    // Fora do padrão (a demo desta pasta, por exemplo): a raiz do site é
    // sempre um nível acima de shared/, e shared/ é onde este script mora.
    if (script) return new URL('../index.html', script.src).href;
    return '../../index.html';
  }

  function lerMudo() {
    try {
      return localStorage.getItem('jogos-elis:mudo') === '1';
    } catch (e) {
      return false;
    }
  }

  function montar() {
    if (document.querySelector('.cabecalho')) return; // não duplica

    var cabecalho = document.createElement('header');
    cabecalho.className = 'cabecalho';

    var inicio = document.createElement('a');
    inicio.className = 'cabecalho__inicio';
    inicio.href = caminhoDoInicio();
    inicio.innerHTML = '🏠 <span class="cabecalho__inicio-texto">Início</span>';
    inicio.setAttribute('aria-label', 'Início: voltar para a página inicial');

    var h1 = document.createElement('h1');
    h1.className = 'cabecalho__titulo';
    h1.textContent = titulo;

    var mudo = document.createElement('button');
    mudo.type = 'button';
    mudo.className = 'cabecalho__mudo';

    function pintarBotao(estaMudo) {
      mudo.textContent = estaMudo ? '🔇' : '🔊';
      mudo.setAttribute('aria-pressed', String(estaMudo));
      mudo.setAttribute('aria-label', estaMudo ? 'Ligar o som' : 'Desligar o som');
      mudo.title = estaMudo ? 'Ligar o som' : 'Desligar o som';
    }
    pintarBotao(lerMudo());

    mudo.addEventListener('click', function () {
      if (!urlSons) return;
      // import dinâmico: funciona em script clássico e só carrega o áudio
      // quando a criança mexe no botão.
      import(urlSons).then(function (sons) {
        var agoraMudo = sons.alternarMudo();
        pintarBotao(agoraMudo);
        if (!agoraMudo) sons.tocar('clique');
      });
    });

    cabecalho.appendChild(inicio);
    cabecalho.appendChild(h1);
    cabecalho.appendChild(mudo);
    document.body.insertBefore(cabecalho, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
