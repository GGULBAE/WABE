import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null;

const createWindow = () => {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log("preloadPath: ", preloadPath);

  mainWindow = new BrowserWindow({
    width: 500,
    height: 200,
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,
      nodeIntegration: false, // For security
    },
    autoHideMenuBar: true,
  });
  
  mainWindow.loadFile('../index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

ipcMain.on('backup-start', (event) => {
  console.log('Button clicked. Sending response to renderer.');
  // event.sender.send('button-clicked-response', 'Hello from Main Process!');
});


app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
