const path = require('node:path');
const { app, BrowserWindow, shell } = require('electron');

const APP_DATA_DIR_NAME = 'Guitar Training';
const WINDOW_WIDTH = 1280;
const WINDOW_HEIGHT = 860;

app.setName('Guitar Training');

function getWebDistPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'web-dist');
  }

  return path.resolve(__dirname, '..', '..', 'web', 'dist');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    title: 'Guitar Training',
    backgroundColor: '#111318',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentUrl = mainWindow.webContents.getURL();
    if (currentUrl && url !== currentUrl) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(getWebDistPath(), 'index.html'));
}

const appDataPath = path.join(app.getPath('appData'), APP_DATA_DIR_NAME);
app.setPath('userData', appDataPath);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
