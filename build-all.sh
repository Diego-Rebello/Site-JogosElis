#!/usr/bin/env bash
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")" && pwd)"
SAIDA="$RAIZ/_site"

rm -rf "$SAIDA"
mkdir -p "$SAIDA/Games"
cp "$RAIZ/index.html" "$SAIDA/"

for arquivo in configuracoes.html _redirects _headers manifest.webmanifest; do
  [ -f "$RAIZ/$arquivo" ] && cp "$RAIZ/$arquivo" "$SAIDA/"
done

cp -R "$RAIZ/shared" "$SAIDA/shared"
# Declarações de tipo do TypeScript não servem para nada no navegador
# e ainda entravam no precache do service worker.
find "$SAIDA/shared" -name '*.d.ts' -delete

for pasta in "$RAIZ"/Games/*/; do
  nome="$(basename "$pasta")"
  mkdir -p "$SAIDA/Games/$nome"
  if [ -f "$pasta/package.json" ]; then
    (cd "$pasta" && npm ci && npm run build)
    cp -R "$pasta/dist/." "$SAIDA/Games/$nome/"
  else
    cp -R "$pasta/." "$SAIDA/Games/$nome/"
  fi
done

versao="${COMMIT_REF:-$(git -C "$RAIZ" rev-parse --short HEAD 2>/dev/null || echo local)}"
COMMIT_REF="$versao" node "$RAIZ/scripts/gerar-service-worker.mjs" "$RAIZ/sw.js" "$SAIDA/sw.js" "$SAIDA"

echo "Site gerado em $SAIDA"
