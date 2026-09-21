# Native lab

Working directory: `~/Downloads/CODE-BOOK/lab/memento-native`. Expected output: the native app exactly as it existed at the frozen native pin, with pinned web and SQL reference files beside it so parity tests can run. Reset command: `../make-native-lab.sh` from that working directory, or `./make-native-lab.sh` from `~/Downloads/CODE-BOOK/lab`. This cannot touch Memento.

Run `npm ci`, tests, and Expo only inside the exported copy. The script reads the two frozen commits from Memento with `git archive`; it never checks out, installs, or writes there.
