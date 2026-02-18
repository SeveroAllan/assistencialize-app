// CÓDIGO CORRIGIDO E COMPLETO para main.js
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
require('@electron/remote/main').initialize();

const isMac = process.platform === 'darwin';
let mainWindow;

function createWindow() {
  // No Mac: titleBarStyle 'hiddenInset' mantém os traffic lights nativos
  // e libera espaço para arrastar a janela. No Windows: frame: false.
  const windowOptions = {
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: isMac
      ? path.join(__dirname, 'icon.png')           // Mac usa .png ou .icns
      : path.join(__dirname, 'logo-assistencialize-novo.ico'), // Windows usa .ico
    frame: !isMac,          // Windows: sem frame. Mac: com frame nativo.
    titleBarStyle: isMac ? 'hiddenInset' : undefined, // Mac: traffic lights nativos
    trafficLightPosition: isMac ? { x: 14, y: 14 } : undefined,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  };

  mainWindow = new BrowserWindow(windowOptions);

  require('@electron/remote/main').enable(mainWindow.webContents);
  mainWindow.loadFile('index.html');

  // Informa ao renderer qual plataforma está rodando
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('platform-info', { isMac });
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

// Menu nativo completo (padrão macOS)
const menuTemplate = [
  // Menu do App (só aparece no Mac, com nome do app)
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { label: `Sobre o ${app.name}`, role: 'about' },
      { type: 'separator' },
      { label: 'Verificar Atualizações', click: () => { autoUpdater.checkForUpdatesAndNotify(); } },
      { type: 'separator' },
      { label: 'Serviços', role: 'services' },
      { type: 'separator' },
      { label: `Ocultar ${app.name}`, role: 'hide' },
      { label: 'Ocultar Outros', role: 'hideOthers' },
      { label: 'Mostrar Todos', role: 'unhide' },
      { type: 'separator' },
      { label: `Sair do ${app.name}`, role: 'quit' }
    ]
  }] : []),
  {
    label: 'Editar',
    submenu: [
      { label: 'Desfazer', role: 'undo' },
      { label: 'Refazer', role: 'redo' },
      { type: 'separator' },
      { label: 'Recortar', role: 'cut' },
      { label: 'Copiar', role: 'copy' },
      { label: 'Colar', role: 'paste' },
      { label: 'Selecionar Tudo', role: 'selectAll' }
    ]
  },
  {
    label: 'Visualizar',
    submenu: [
      { label: 'Recarregar', role: 'forceReload' },
      { label: 'Ferramentas de Desenvolvedor', role: 'toggleDevTools' },
      { type: 'separator' },
      { label: 'Tela Cheia', role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Janela',
    role: 'windowMenu'
  }
];

const appMenu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(appMenu);

// Menu de contexto do botão de configurações
const settingsMenu = Menu.buildFromTemplate([
  { label: 'Verificar Atualizações', click: () => { autoUpdater.checkForUpdatesAndNotify(); } },
  { type: 'separator' },
  { label: 'Ferramentas de Desenvolvedor', role: 'toggleDevTools' }
]);

ipcMain.on('show-settings-menu', (event) => {
  settingsMenu.popup(BrowserWindow.fromWebContents(event.sender));
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

