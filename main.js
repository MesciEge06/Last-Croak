const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    autoHideMenuBar: true,
    useContentSize: true,
    title: 'The Last Croak — 3D Aksiyon RPG Oyunu',
    center: true,
    backgroundColor: '#0a0d14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webgl: true,
      backgroundThrottling: false
    }
  });

  // Load the game index.html
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Ensure menu bar is hidden
  mainWindow.setMenuBarVisibility(false);

  // F11 or Alt+Enter to toggle full screen
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.key === 'F11' || (input.key === 'Enter' && input.alt)) && input.type === 'keyDown') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });

  return mainWindow;
}

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
