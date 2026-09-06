// Tipos para sons.js, consumido pelos dois jogos React.
export type NomeDeSom = 'clique' | 'acerto' | 'erro' | 'vitoria';
export declare function tocar(nome: NomeDeSom): void;
export declare function estaMudo(): boolean;
export declare function definirMudo(valor: boolean): boolean;
export declare function alternarMudo(): boolean;
