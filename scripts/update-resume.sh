#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: npm run resume:update -- /absolute/or/relative/path/to/resume.pdf"
  exit 1
fi

SOURCE_PATH="$1"
TARGET_PATH="public/resume.pdf"

if [[ ! -f "$SOURCE_PATH" ]]; then
  echo "Error: file not found: $SOURCE_PATH"
  exit 1
fi

mkdir -p public
cp "$SOURCE_PATH" "$TARGET_PATH"

echo "Updated $TARGET_PATH from $SOURCE_PATH"
