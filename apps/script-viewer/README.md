# GombaFlow Script Viewer prototype

The first implementation checkpoint provides a pure tagged-script parser and a
standalone Scriptable build shell. The generated artifact displays the reviewed
clickable prototype; it does not yet load a Markdown file, implement reader
controls, or save progress. Those behaviors belong to later checkpoints.

From the repository root, build the disposable install script with:

```sh
node apps/script-viewer/tools/build.mjs --output /tmp/GombaFlowViewer.js
```

The build embeds `viewer.html` and `core.js` into one JavaScript file without
runtime downloads. Keep generated output under `/tmp`; do not commit it.
