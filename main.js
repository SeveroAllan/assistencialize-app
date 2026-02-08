// CÓDIGO CORRIGIDO E COMPLETO para main.js
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
require('@electron/remote/main').initialize();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Mantém a janela sem borda
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false // Prevent content from being throttled when window is hidden/minimized
    }
  });

  require('@electron/remote/main').enable(mainWindow.webContents);
  mainWindow.loadFile('index.html');

  // Check for updates after window is ready
  mainWindow.webContents.on('did-finish-load', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

// Auto-updater configuration
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Verificando atualizações...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Atualização disponível:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Nenhuma atualização disponível');
});

autoUpdater.on('error', (err) => {
  console.error('Erro ao verificar atualizações:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Velocidade de download: ${progressObj.bytesPerSecond}`;
  log_message = log_message + ` - Baixado ${progressObj.percent}%`;
  log_message = log_message + ` (${progressObj.transferred}/${progressObj.total})`;
  console.log(log_message);

  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Atualização baixada:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

// IPC handler to install update
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});

// Lógica para os botões da janela
ipcMain.on('minimize-app', () => {
  BrowserWindow.getFocusedWindow().minimize();
});
ipcMain.on('maximize-app', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
});
ipcMain.on('close-app', () => {
  BrowserWindow.getFocusedWindow().close();
});

const menuTemplate = [
  { label: 'Recarregar App', role: 'forceReload' },
  { label: 'Ferramentas de Desenvolvedor', role: 'toggleDevTools' },
  { type: 'separator' },
  { label: 'Verificar Atualizações', click: () => { autoUpdater.checkForUpdatesAndNotify(); } },
  { type: 'separator' },
  { label: 'Sair', role: 'quit' }
];
const menu = Menu.buildFromTemplate(menuTemplate);

ipcMain.on('show-settings-menu', (event) => {
  menu.popup(BrowserWindow.fromWebContents(event.sender));
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

