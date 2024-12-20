import { app, BrowserWindow, ipcMain } from 'electron';
import Core from './lib/Core';
import path from 'path';

let mainWindow: BrowserWindow | null;
let CoreObj: Core | null;

const createWindow = () => {
  const preloadPath = path.join(__dirname, 'preload.js');

  mainWindow = new BrowserWindow({
    width: 500,
    height: 200,
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,
      nodeIntegration: false, // For security
      webSecurity: false,  // 보안 비활성화
    },
    autoHideMenuBar: true,
  });
  const indexPath = path.join(__dirname, 'index.html');
  load_status(app.getAppPath());
  mainWindow.loadFile(indexPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const load_status = (text: string) => {
  mainWindow?.webContents.send('load_status', text);
}

ipcMain.on('backup-start', async (event) => {
  CoreObj = new Core();
  load_status("초기화 시작");
  await CoreObj.init();
  load_status("초기화 완료");
  await CoreObj.BackUpAddons(load_status)
});

ipcMain.on('load-start', async (event) => {
  CoreObj = new Core();
  load_status("초기화 시작");
  await CoreObj.init();
  load_status("초기화 완료");
  await CoreObj.RestoreAddons(load_status)
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
