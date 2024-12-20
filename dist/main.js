"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let mainWindow;
const createWindow = () => {
    const preloadPath = path_1.default.join(__dirname, 'preload.js');
    console.log("preloadPath: ", preloadPath);
    mainWindow = new electron_1.BrowserWindow({
        width: 500,
        height: 200,
        webPreferences: {
            contextIsolation: true,
            preload: preloadPath,
            nodeIntegration: false, // 보안을 위해 false로 설정
        },
        autoHideMenuBar: true,
    });
    mainWindow.loadFile('../index.html');
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};
electron_1.ipcMain.on('backup-start', (event) => {
    console.log('Button clicked. Sending response to renderer.');
    // event.sender.send('button-clicked-response', 'Hello from Main Process!');
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