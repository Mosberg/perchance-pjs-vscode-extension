#!/usr/bin/env bash
# Download every large media asset referenced by the ai-rpg generator.
# Usage: ./download-media.sh [output-dir]   (default: ./downloads)
set -u
OUT="${1:-downloads}"
LIST="$(dirname "$0")/media-filelist.txt"
n=0; total=$(grep -c . "$LIST")
while IFS=$'\t' read -r url dest; do
  [ -z "$url" ] && continue
  n=$((n+1))
  target="$OUT/$dest"
  if [ -s "$target" ]; then echo "[$n/$total] skip (exists) $dest"; continue; fi
  mkdir -p "$(dirname "$target")"
  echo "[$n/$total] $dest"
  curl -fL --retry 3 --retry-delay 2 -o "$target.part" "$url" && mv "$target.part" "$target" || echo "FAILED: $url"
done < "$LIST"
echo "done -> $OUT"
