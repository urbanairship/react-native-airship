#!/bin/bash
# Extracts the CHANGELOG.md section for a version into the given file.
# Fails if the section is missing or empty.
set -e

VERSION="$1"
OUTPUT="$2"
ROOT_PATH=$(dirname "${0}")/..

awk -v v="## Version $VERSION" 'index($0, v) == 1 && (length($0) == length(v) || substr($0, length(v) + 1, 1) == " ") {flag=1; next} /^## Version/ {flag=0} flag' "$ROOT_PATH/CHANGELOG.md" > "$OUTPUT"

if [ -z "$(tr -d '[:space:]' < "$OUTPUT")" ]; then
  echo "No release notes found in CHANGELOG.md for version $VERSION" >&2
  exit 1
fi
