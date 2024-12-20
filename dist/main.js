"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const Core_1 = __importDefault(require("./lib/Core"));
const path_1 = __importDefault(require("path"));
let mainWindow;
let CoreObj;
const createWindow = () => {
    const preloadPath = path_1.default.join(__dirname, 'preload.js');
    console.log("preloadPath: ", preloadPath);
    mainWindow = new electron_1.BrowserWindow({
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
const load_status = (text) => {
    mainWindow?.webContents.send('load_status', text);
};
electron_1.ipcMain.on('backup-start', async (event) => {
    CoreObj = new Core_1.default();
    load_status("초기화 시작");
    await CoreObj.init();
    load_status("초기화 완료");
    await CoreObj.BackUpAddons(load_status);
});
electron_1.ipcMain.on('load-start', async (event) => {
    CoreObj = new Core_1.default();
    load_status("초기화 시작");
    await CoreObj.init();
    load_status("초기화 완료");
    await CoreObj.RestoreAddons(load_status);
});
electron_1.app.on('ready', createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map