// Tipos para progresso.js, consumido pelos dois jogos React.
export interface RegistroDeJogo {
  partidas: number;
  acertos: number;
  erros: number;
  melhorEstrelas: number;
  ultimaEm: string | null;
}
export declare function calcularEstrelas(acertos: number, erros: number): number;
export declare function obterProgresso(): Record<string, RegistroDeJogo>;
export declare function registrarPartida(
  jogoId: string,
  dados?: { acertos?: number; erros?: number; estrelas?: number },
): RegistroDeJogo;
export declare function estrelasDe(jogoId: string): number;
export declare function zerarProgresso(): boolean;
export interface Configuracoes {
  nomeCrianca: string;
  niveis: {
    forca: string;
    matematica: string;
    'm-ou-n': string;
    memoria: string;
    velha: string;
    [jogoId: string]: string;
  };
}
export declare function obterConfiguracoes(): Configuracoes;
export declare function salvarConfiguracoes(
  configuracoes?: Partial<Omit<Configuracoes, 'niveis'>> & { niveis?: Partial<Configuracoes['niveis']> },
): Configuracoes;
export declare function nomeDaCrianca(): string;
