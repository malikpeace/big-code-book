#!/bin/sh
set -eu

# Rebuild the disposable Git lesson in this folder.
LAB_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if [ "$LAB_DIR" != "$HOME/Downloads/CODE-BOOK/git-lab" ]; then
  echo "Refusing to reset an unexpected folder: $LAB_DIR" >&2
  exit 1
fi

rm -rf "$LAB_DIR/.git"
rm -f "$LAB_DIR/app.js"

cd "$LAB_DIR"
git init -b main >/dev/null
git config user.name "Big Code Book Student"
git config user.email "student@big-code-book.local"
printf 'make-git-lab.sh\nREADME.md\n' > .git/info/exclude

printf 'const message = "start small";\nconsole.log(message);\n' > app.js
git add app.js
git commit -m "Start the tiny app" >/dev/null

git switch -c feature >/dev/null
printf 'const message = "ship the feature";\nconsole.log(message);\n' > app.js
git add app.js
git commit -m "Change the message on feature" >/dev/null

git switch main >/dev/null
printf 'const message = "protect the main idea";\nconsole.log(message);\n' > app.js
git add app.js
git commit -m "Change the message on main" >/dev/null

if git merge feature >/dev/null 2>&1; then
  echo "Expected a conflict, but the merge succeeded." >&2
  exit 1
fi

echo "Git lab ready: 3 commits, 2 branches, 1 intentional conflict."
echo "Run git status, then open app.js."
