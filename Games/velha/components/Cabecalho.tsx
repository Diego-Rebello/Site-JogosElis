import React, { useState } from 'react';
import { alternarMudo, estaMudo, tocar } from '../../../shared/sons.js';

/**
 * Mesma barra de cima dos jogos em HTML puro, só que em React.
 * O HTML e as classes são os mesmos de shared/cabecalho.js — este arquivo
 * existe porque um <script> clássico não se encaixa na árvore do React.
 */
interface CabecalhoProps {
  titulo: string;
}

/**
 * Descobre o caminho da página inicial. Funciona em Games/<jogo>/ e o /i
 * cobre o Netlify, que publica a pasta como /games/ em minúsculas.
 */
function caminhoDoInicio(): string {
  const caminho = window.location.pathname;
  if (/\/games\//i.test(caminho)) {
    return caminho.replace(/\/games\/.*$/i, '/index.html');
  }
  return '../../index.html';
}

const Cabecalho: React.FC<CabecalhoProps> = ({ titulo }) => {
  const [mudo, setMudo] = useState<boolean>(() => estaMudo());

  const clicarMudo = () => {
    const agoraMudo = alternarMudo();
    setMudo(agoraMudo);
    if (!agoraMudo) tocar('clique');
  };

  return (
    <header className="cabecalho">
      <a
        className="cabecalho__inicio"
        href={caminhoDoInicio()}
        aria-label="Voltar para a página inicial"
      >
        🏠 <span className="cabecalho__inicio-texto">Início</span>
      </a>
      <h1 className="cabecalho__titulo">{titulo}</h1>
      <button
        type="button"
        className="cabecalho__mudo"
        onClick={clicarMudo}
        aria-pressed={mudo}
        aria-label={mudo ? 'Ligar o som' : 'Desligar o som'}
        title={mudo ? 'Ligar o som' : 'Desligar o som'}
      >
        {mudo ? '🔇' : '🔊'}
      </button>
    </header>
  );
};

export default Cabecalho;
