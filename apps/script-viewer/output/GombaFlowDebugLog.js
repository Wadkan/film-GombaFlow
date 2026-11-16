const fm = FileManager.local();
const file = fm.joinPath(fm.documentsDirectory(), 'GombaFlowViewer-debug.txt');
const alert = new Alert();
alert.title = 'GombaFlow D3 indítási napló';
alert.message = fm.fileExists(file) ? fm.readString(file) : 'Nincs napló. A D3 program az első utasításokig sem jutott el, vagy másik példány futott.';
alert.addAction('OK');
await alert.presentAlert();
