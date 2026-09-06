# Jogos da Elis

Site estático com jogos educativos em português do Brasil, feito por um pai para a filha Elis.
Cada jogo é pensado para criança de 9 anos (4.º ano), funciona no celular, no tablet e no
computador, e não precisa de cadastro nem de internet rápida.

**No ar em:** https://jogosdaelis.netlify.app/

---

## Jogos

| Jogo | Arquivo de entrada | Tecnologia |
|---|---|---|
| Jogo da Forca | `Games/Jogo da Forca/forca.html` | HTML/CSS/JS puro |
| Jogo da Memória | `Games/emoji-memory-game/dist/index.html` | React 19 + Vite 6 |
| Jogo de Somar | `Games/Jogo de Somar/soma_placar.html` | HTML/CSS/JS puro |
| Jogo do M ou N (digitar) | `Games/Jogo M N-digitar/Jogo M N-digitar.html` | HTML/CSS/JS puro |
| Jogo da Velha | `Games/jogo-da-velha-divertido/dist/index.html` | React 19 + Vite 6 |

A página inicial (`index.html`) é o índice: ela lista os jogos em cartões e aponta para os
caminhos acima. Todos os links são relativos, então o site funciona em qualquer subpasta.

---

## Estrutura de pastas

```
.
├── index.html                       Página inicial com os cartões dos jogos
├── README.md                        Este arquivo
├── MELHORIAS.md                     Backlog de melhorias e de jogos novos
├── .gitignore
├── .vscode/launch.json              Abre index.html no Chrome pelo VS Code
└── Games/
    ├── Jogo da Forca/forca.html
    ├── Jogo de Somar/soma_placar.html
    ├── Jogo M N-digitar/Jogo M N-digitar.html
    ├── emoji-memory-game/           Jogo da Memória (React + Vite)
    │   ├── App.tsx, index.tsx, index.html, vite.config.ts, tsconfig.json
    │   └── dist/                    Build publicado (versionado no git de propósito)
    └── jogo-da-velha-divertido/     Jogo da Velha (React + Vite)
        ├── App.tsx, index.tsx, components/, constants.tsx
        └── dist/                    Build publicado (versionado no git de propósito)
```

Os jogos em HTML puro ficam cada um em um único arquivo, sem dependências locais.
Os dois jogos em React têm o `dist/` versionado porque o Netlify publica a raiz do
repositório sem rodar build (ver "Como publicar").

---

## Como abrir localmente

Os jogos usam caminhos relativos, então basta servir a raiz do projeto:

```bash
# opção 1 — Node
npx serve .

# opção 2 — Python
python3 -m http.server 8000
```

Depois abra http://localhost:3000 (npx serve) ou http://localhost:8000 (Python).

Abrir o `index.html` com dois cliques (protocolo `file://`) funciona para os jogos em HTML
puro, mas pode falhar nos jogos React. Prefira um dos servidores acima.

No VS Code, a configuração "Open index" (`.vscode/launch.json`) abre o `index.html` no Chrome.

---

## Como rodar e buildar os jogos React

Vale para `Games/emoji-memory-game` e `Games/jogo-da-velha-divertido`. Requer Node.js 18 ou
mais novo.

```bash
cd "Games/emoji-memory-game"   # ou "Games/jogo-da-velha-divertido"

npm install     # instala as dependências (cria node_modules/, fora do git)
npm run dev     # servidor de desenvolvimento com recarga automática
npm run build   # gera a pasta dist/
npm run preview # serve o dist/ para conferir o resultado do build
```

**Importante:** depois de mudar qualquer código de um jogo React, rode `npm run build` e
commite também a pasta `dist/`. É ela que vai ao ar.

---

## Como publicar

A publicação é automática:

- Hospedagem: **Netlify**, projeto `jogosdaelis`.
- Deploy contínuo a partir do GitHub, branch `main`, com *auto publishing* ligado.
- Sem comando de build e sem pasta de publicação definida: o Netlify publica a raiz do
  repositório como está.

Ou seja, **todo push (ou merge de PR) na `main` publica o site**. O fluxo de trabalho:

1. Crie uma branch a partir da `main`.
2. Faça as alterações. Se mexeu em jogo React, rode `npm run build` e commite o `dist/`.
3. Teste localmente com um dos servidores acima.
4. Abra o PR e mescle na `main`. O Netlify publica em seguida.

---

## Backlog

O plano de melhorias técnicas e a lista de jogos novos estão em [MELHORIAS.md](MELHORIAS.md).
Cada tarefa lá tem passos, critérios de aceite e um prompt pronto para ser executado.

---

Feito com ❤️ para a Elis se divertir.
