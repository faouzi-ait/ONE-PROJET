# !/bin/env node
set -e

for theme in src/theme/*; do
  echo "Testing $(basename "$theme")"
  CLIENT=$(basename "$theme") jest --no-cache src
done
