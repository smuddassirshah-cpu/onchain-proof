#!/usr/bin/env sh
# Fetches the Pyodide runtime used by the code drill into mockups/vendor/pyodide.
set -eu
DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
cd "$TMP"
npm pack pyodide@314.0.7 >/dev/null
tar -xzf pyodide-314.0.7.tgz
mkdir -p "$DIR/vendor/pyodide"
cd package
cp pyodide.js pyodide.mjs pyodide.asm.mjs pyodide.asm.wasm python_stdlib.zip pyodide-lock.json package.json "$DIR/vendor/pyodide/"
rm -rf "$TMP"
echo "Pyodide copied to $DIR/vendor/pyodide"
