#!/usr/bin/env bash
# Rebuilds the export zip for lockable-list-plugin.
# Not part of the shipped generator — this is export/copy machinery only.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="../lockable-list-plugin-export.zip"
rm -f "$OUT"
zip -r -X "$OUT" . -x '.*' >/dev/null
echo "wrote $OUT"
unzip -l "$OUT"
