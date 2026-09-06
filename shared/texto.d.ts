// Tipos para texto.js, consumido pelos dois jogos React.
export declare function normalizar(texto: string): string;
export declare function embaralhar<T>(lista: readonly T[]): T[];
export declare function sortear<T>(lista: readonly T[], evitar?: T): T | undefined;
export declare function sortearVarios<T>(lista: readonly T[], n: number): T[];
