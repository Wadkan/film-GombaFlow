const fm = FileManager.local();
const file = fm.joinPath(fm.documentsDirectory(), 'GombaFlowViewer-debug.txt');
const alert = new Alert();
alert.title = 'GombaFlow indítási napló';
alert.message = fm.fileExists(file) ? fm.readString(file) : 'Nincs napló. Az új néző nem indult el, vagy másik példány futott.';
alert.addAction('OK');
await alert.presentAlert();
