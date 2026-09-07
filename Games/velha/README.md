# Jogo da Velha

Jogo da velha com níveis de dificuldade e placar, em React.

Desde a T23 **não existe mais um projeto npm aqui dentro**: esta pasta é só código-fonte,
e o build é o do projeto único da raiz. Rode os comandos lá:

```bash
npm run dev     # servidor de desenvolvimento, com todas as páginas
npm run build   # gera o dist/ do site inteiro
```

Entrada da página: `index.html` → `main.tsx`. A lógica testável (incluindo o minimax)
está em `lib/logica.ts` (`tests/velha.test.ts` importa direto de lá).
