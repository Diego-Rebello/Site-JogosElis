/**
 * Banco inicial de P04. Os três grupos usam palavras muito familiares e
 * figuras inequívocas do catálogo. Cada questão fixa o nome pretendido da
 * figura; a rima foi revisada desde a vogal tônica até o fim.
 */
export const GRUPOS_RIMA = {
  ato: ['gato', 'pato', 'rato', 'sapato'],
  ao: ['pao', 'leao', 'aviao', 'caminhao'],
  elha: ['abelha', 'ovelha'],
};

export const QUESTOES_RIMA = [
  { id: 'gato-pato', alvoId: 'gato', respostaId: 'pato', grupoRima: 'ato' },
  { id: 'gato-rato', alvoId: 'gato', respostaId: 'rato', grupoRima: 'ato' },
  { id: 'pato-gato', alvoId: 'pato', respostaId: 'gato', grupoRima: 'ato' },
  { id: 'pato-sapato', alvoId: 'pato', respostaId: 'sapato', grupoRima: 'ato' },
  { id: 'rato-sapato', alvoId: 'rato', respostaId: 'sapato', grupoRima: 'ato' },
  { id: 'rato-gato', alvoId: 'rato', respostaId: 'gato', grupoRima: 'ato' },
  { id: 'sapato-rato', alvoId: 'sapato', respostaId: 'rato', grupoRima: 'ato' },
  { id: 'sapato-pato', alvoId: 'sapato', respostaId: 'pato', grupoRima: 'ato' },
  { id: 'pao-leao', alvoId: 'pao', respostaId: 'leao', grupoRima: 'ao' },
  { id: 'pao-aviao', alvoId: 'pao', respostaId: 'aviao', grupoRima: 'ao' },
  { id: 'leao-pao', alvoId: 'leao', respostaId: 'pao', grupoRima: 'ao' },
  { id: 'leao-caminhao', alvoId: 'leao', respostaId: 'caminhao', grupoRima: 'ao' },
  { id: 'aviao-caminhao', alvoId: 'aviao', respostaId: 'caminhao', grupoRima: 'ao' },
  { id: 'aviao-leao', alvoId: 'aviao', respostaId: 'leao', grupoRima: 'ao' },
  { id: 'caminhao-aviao', alvoId: 'caminhao', respostaId: 'aviao', grupoRima: 'ao' },
  { id: 'caminhao-pao', alvoId: 'caminhao', respostaId: 'pao', grupoRima: 'ao' },
  { id: 'abelha-ovelha-1', alvoId: 'abelha', respostaId: 'ovelha', grupoRima: 'elha' },
  { id: 'abelha-ovelha-2', alvoId: 'abelha', respostaId: 'ovelha', grupoRima: 'elha' },
  { id: 'ovelha-abelha-1', alvoId: 'ovelha', respostaId: 'abelha', grupoRima: 'elha' },
  { id: 'ovelha-abelha-2', alvoId: 'ovelha', respostaId: 'abelha', grupoRima: 'elha' },
];
