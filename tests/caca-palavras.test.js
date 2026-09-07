import { describe, expect, it } from 'vitest';
import { temas } from '../Games/caca-palavras/dados.js';
import { dificuldades, escolherPalavras, gerarGrade, lerCaminho, localizarPalavra, palavraDaGrade } from '../Games/caca-palavras/jogo.js';

describe('Caça-Palavras', () => {
  it('mantém a grafia correta na lista e remove acentos só na grade', () => {
    expect(palavraDaGrade('CORAÇÃO')).toBe('CORACAO');
    expect(palavraDaGrade('PÊSSEGO')).toBe('PESSEGO');
  });
  it.each(Object.entries(dificuldades))('gera 200 grades %s com todas as palavras localizáveis', (_id, config) => {
    for(let i=0;i<200;i++){
      const palavras = escolherPalavras(temas.animais.palavras,config.tamanho,8).map(([p])=>p);
      const resultado=gerarGrade(palavras,config.tamanho,config);
      expect(resultado.grade).toHaveLength(config.tamanho);
      for(const palavra of palavras){const caminho=localizarPalavra(resultado.grade,palavra);expect(caminho,palavra).not.toBeNull();expect(lerCaminho(resultado.grade,caminho)).toBe(palavraDaGrade(palavra));}
    }
  });
  it('cada tema oferece oito palavras diferentes que cabem até no Fácil',()=>{for(const tema of Object.values(temas)){expect(escolherPalavras(tema.palavras,8,8)).toHaveLength(8);expect(new Set(tema.palavras.map(([p])=>p)).size).toBe(tema.palavras.length)}});
});
