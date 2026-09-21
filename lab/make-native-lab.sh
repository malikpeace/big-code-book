#!/bin/sh
set -eu

# Export the frozen native pin into a disposable working copy.
LAB_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
BOOK_ROOT=$(CDPATH= cd -- "$LAB_DIR/.." && pwd)
MEMENTO_ROOT=${MEMENTO_ROOT:-"$HOME/Downloads/MEMENTO"}
DEST_NATIVE="$LAB_DIR/memento-native"
DEST_WEB="$LAB_DIR/memento-app"
DEST_SUPABASE="$LAB_DIR/supabase"
NATIVE_PIN=$(awk '$1 == "native" { print $2 }' "$BOOK_ROOT/research/MEMENTO-PIN")
WEB_PIN=$(awk '$1 == "web" { print $2 }' "$BOOK_ROOT/research/MEMENTO-PIN")

if [ "$LAB_DIR" != "$HOME/Downloads/CODE-BOOK/lab" ]; then
  echo "Refusing to reset an unexpected folder: $LAB_DIR" >&2
  exit 1
fi
if [ -z "$NATIVE_PIN" ] || [ -z "$WEB_PIN" ]; then
  echo "Both pins are required in research/MEMENTO-PIN." >&2
  exit 1
fi
if ! git -C "$MEMENTO_ROOT" cat-file -e "$NATIVE_PIN^{commit}"; then
  echo "Native pin $NATIVE_PIN does not exist in Memento." >&2
  exit 1
fi
if ! git -C "$MEMENTO_ROOT" cat-file -e "$WEB_PIN^{commit}"; then
  echo "Web pin $WEB_PIN does not exist in Memento." >&2
  exit 1
fi

rm -rf "$DEST_NATIVE" "$DEST_WEB" "$DEST_SUPABASE"
mkdir -p "$DEST_NATIVE"
git -C "$MEMENTO_ROOT" archive "$NATIVE_PIN" memento-native | tar -x --strip-components=1 -C "$DEST_NATIVE"

# Native parity tests read the frozen web app and SQL through sibling paths.
git -C "$MEMENTO_ROOT" archive "$WEB_PIN" memento-app supabase | tar -x -C "$LAB_DIR"

echo "Native lab ready at $DEST_NATIVE"
echo "Exported native pin $NATIVE_PIN plus web references from $WEB_PIN."
