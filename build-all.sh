#!/usr/bin/env bash
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")" && pwd)"
SAIDA="$RAIZ/_site"

rm -rf "$SAIDA"
mkdir -p "$SAIDA/Games"
cp "$RAIZ/index.html" "$SAIDA/"

for arquivo in configuracoes.html _redirects _headers manifest.webmanifest sw.js; do
  [ -f "$RAIZ/$arquivo" ] && cp "$RAIZ/$arquivo" "$SAIDA/"
done

cp -R "$RAIZ/shared" "$SAIDA/shared"

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

echo "Site gerado em $SAIDA"
