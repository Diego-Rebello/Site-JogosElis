import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  configurarAmbiente, definirPreferencia, falar, falarSequencia, limpar,
  modoAcompanhado, parar, preparar, repetir,
} from '../shared/fala.js';

/**
 * Ambiente falso no lugar do navegador: nada aqui toca som de verdade.
 * `audioOk: false` simula a gravação que não carrega — o caso em que a fala
 * precisa cair para a voz do aparelho.
 */
function criarAmbiente({ audioOk = true, temSintese = true, mudo = false } = {}) {
  const registro = { falado: [], tocado: [], cancelamentos: 0, pausas: 0 };

  class Enunciado {
    constructor(texto) { this.text = texto; }
  }

  const sintese = temSintese ? {
    getVoices: () => [{ name: 'Luciana', lang: 'pt-BR' }, { name: 'Alex', lang: 'en-US' }],
    addEventListener: () => {},
    removeEventListener: () => {},
    cancel: () => { registro.cancelamentos += 1; },
    speak: enunciado => {
      if (enunciado.text) registro.falado.push(enunciado.text);
      // O navegador avisa o fim depois; aqui basta o próximo tique.
      setTimeout(() => enunciado.onend?.(), 0);
    },
  } : null;

  const ambiente = {
    sintese,
    Enunciado: temSintese ? Enunciado : null,
    mudo: () => mudo,
    criarAudio: endereco => {
      registro.tocado.push(endereco);
      const ouvintes = {};
      return {
        addEventListener: (evento, fn) => { (ouvintes[evento] ||= []).push(fn); },
        pause: () => { registro.pausas += 1; },
        play: () => {
          setTimeout(() => (ouvintes[audioOk ? 'ended' : 'error'] || []).forEach(fn => fn()), 0);
          return Promise.resolve();
        },
      };
    },
  };
  return { ambiente, registro };
}

beforeEach(() => definirPreferencia('auto'));

afterEach(() => {
  limpar();
  configurarAmbiente(null);
});

describe('fala em camadas', () => {
  it('usa a gravação quando ela existe e carrega', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    expect(await falar({ texto: 'Cadê o gato?', audio: '/audio/cade-o-gato.m4a' })).toBe('gravada');
    expect(registro.tocado).toEqual(['/audio/cade-o-gato.m4a']);
    expect(registro.falado).toEqual([]);
  });

  it('cai para a voz do aparelho quando a gravação não carrega', async () => {
    const { ambiente, registro } = criarAmbiente({ audioOk: false });
    configurarAmbiente(ambiente);
    expect(await falar({ texto: 'Cadê o gato?', audio: '/audio/faltando.m4a' })).toBe('sintetizada');
    expect(registro.falado).toEqual(['Cadê o gato?']);
  });

  it('sintetiza direto quando o item não tem gravação', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    expect(await falar({ texto: 'Muito bem!' })).toBe('sintetizada');
    expect(registro.tocado).toEqual([]);
    expect(registro.falado).toEqual(['Muito bem!']);
  });

  it('sem voz no aparelho e sem gravação, sobra o modo acompanhado', async () => {
    const { ambiente } = criarAmbiente({ temSintese: false });
    configurarAmbiente(ambiente);
    expect(await falar({ texto: 'Cadê o gato?' })).toBe('sem-fala');
    expect(modoAcompanhado()).toBe(true);
  });

  it('respeita o som desligado', async () => {
    const { ambiente, registro } = criarAmbiente({ mudo: true });
    configurarAmbiente(ambiente);
    expect(await falar({ texto: 'Cadê o gato?' })).toBe('sem-som');
    expect(registro.falado).toEqual([]);
    expect(modoAcompanhado()).toBe(true);
  });

  it('no modo "sem fala" não toca nem gravação nem síntese', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    definirPreferencia('sem-fala');
    expect(await falar({ texto: 'Oi', audio: '/audio/oi.m4a' })).toBe('sem-fala');
    expect(registro.tocado).toEqual([]);
    expect(registro.falado).toEqual([]);
  });

  it('no modo "só gravações" não inventa voz para quem não tem arquivo', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    definirPreferencia('gravada');
    expect(await falar({ texto: 'Muito bem!' })).toBe('sem-fala');
    expect(registro.falado).toEqual([]);
  });

  it('no modo "só a voz do aparelho" ignora a gravação', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    definirPreferencia('sintetizada');
    expect(await falar({ texto: 'Oi', audio: '/audio/oi.m4a' })).toBe('sintetizada');
    expect(registro.tocado).toEqual([]);
  });
});

describe('uma fala por vez', () => {
  it('fala a sequência na ordem', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    await falarSequencia([{ texto: 'Olha só.' }, { texto: 'O gato.' }, { texto: 'Toque no gato!' }]);
    expect(registro.falado).toEqual(['Olha só.', 'O gato.', 'Toque no gato!']);
  });

  it('parar() abandona o resto da fila e cancela o que estava falando', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    const emAndamento = falarSequencia([{ texto: 'Um' }, { texto: 'Dois' }, { texto: 'Três' }]);
    parar();
    await emAndamento;
    expect(registro.falado).toEqual(['Um']);
    expect(registro.cancelamentos).toBeGreaterThan(0);
  });

  it('uma fala nova interrompe a anterior', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    await falar({ texto: 'Primeira' });
    await falar({ texto: 'Segunda' });
    expect(registro.falado).toEqual(['Primeira', 'Segunda']);
    expect(registro.cancelamentos).toBeGreaterThan(0);
  });

  it('parar() também interrompe a gravação que estiver tocando', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    const tocando = falar({ audio: '/audio/miado.m4a' });
    parar();
    await tocando;
    expect(registro.pausas).toBe(1);
  });
});

describe('ouvir de novo', () => {
  it('repete a última fala sem contar como tentativa', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    await falar({ texto: 'Cadê o pato?' });
    await repetir();
    expect(registro.falado).toEqual(['Cadê o pato?', 'Cadê o pato?']);
  });

  it('repete a sequência inteira quando foi uma sequência', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    await falarSequencia([{ texto: 'Quase!' }, { texto: 'Cadê o pato?' }]);
    await repetir();
    expect(registro.falado).toEqual(['Quase!', 'Cadê o pato?', 'Quase!', 'Cadê o pato?']);
  });

  it('não faz nada quando ainda não houve fala nenhuma', async () => {
    const { ambiente, registro } = criarAmbiente();
    configurarAmbiente(ambiente);
    expect(await repetir()).toBe('sem-fala');
    expect(registro.falado).toEqual([]);
  });
});

describe('preparar()', () => {
  it('escolhe a voz em português e não usa a inglesa', async () => {
    const { ambiente } = criarAmbiente();
    configurarAmbiente(ambiente);
    const estado = await preparar();
    expect(estado).toMatchObject({ sinteseDisponivel: true, voz: 'Luciana', idiomaDaVoz: 'pt-BR' });
    expect(modoAcompanhado()).toBe(false);
  });

  it('avisa quando o aparelho não tem voz nenhuma', async () => {
    const { ambiente } = criarAmbiente({ temSintese: false });
    configurarAmbiente(ambiente);
    expect(await preparar()).toMatchObject({ sinteseDisponivel: false, voz: null });
  });
});
