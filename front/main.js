const { app, BrowserWindow } = require('electron');

const createWindow = async () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    })

    await win.loadFile('www/index.html')
}

app.whenReady().then(async () => {
    await createWindow()
});
