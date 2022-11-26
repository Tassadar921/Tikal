const { app, BrowserWindow } = require('electron');

const createWindow = async () => {
    const win = new BrowserWindow({
        width: 1000,
        height: 500
    });

    await win.loadFile('www/index.html');
}

app.whenReady().then(async () => {
    await createWindow()
});
