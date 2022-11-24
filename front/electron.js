const { app, BrowserWindow } = require('electron');

const createWindow = async () => {
    const win = new BrowserWindow({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    await win.loadFile('www/index.html')
}

app.whenReady().then(async () => {
    await createWindow()
});
