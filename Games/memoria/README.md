# Jogo da Memória

Jogo da memória com emojis para 1 a 4 jogadores, em React.

Desde a T23 **não existe mais um projeto npm aqui dentro**: esta pasta é só código-fonte,
e o build é o do projeto único da raiz. Rode os comandos lá:

```bash
npm run dev     # servidor de desenvolvimento, com todas as páginas
npm run build   # gera o dist/ do site inteiro
```

Entrada da página: `index.html` → `main.tsx`. A lógica testável está em `lib/`
(`tests/memoria.test.ts` importa direto de lá).
