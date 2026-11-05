# Source of index.html

Edit the files here, never index.html directly.

- `page.html`: the page markup. `<!--@css-->` and `<!--@js-->` mark where the styles and the script go.
- `css/`: styles, joined in file-name order.
- `js/`: one script, joined in file-name order. `00-core.js` opens `(function(){` and `23-native.js` closes it, so every file shares the same scope.

Build: `node tools/build.mjs` (writes index.html). Check: `node tools/build.mjs --check`.
Commit src/ and index.html together. Cloudflare Pages serves index.html as it is.
