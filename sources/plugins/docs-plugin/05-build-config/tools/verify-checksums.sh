#!/usr/bin/env sh
# Verifies every file in this package against checksums.sha256.txt
set -e
cd "$(dirname "$0")/.."
cd ..
sha256sum -c checksums.sha256.txt