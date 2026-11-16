async function runViewer(adapter) {
  try {
    const file = await adapter.pick();
    if (!file) return;
    const markdown = await adapter.read(file);
    core.parseScript(markdown);
    await adapter.render(markdown);
  } catch (error) {
    await adapter.showError('MD megnyitása: ' + String(error.message || error));
  }
}
module.exports = { runViewer };
