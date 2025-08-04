const { app, BrowserWindow, screen, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

let win;
let tray;

function createWindow() {
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = 350;
  const winHeight = 400;

  const x = screenW - winWidth;
  const y = screenH - winHeight - 200;

  win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x,
    y,
    frame: false,
    resizable: true,
    skipTaskbar: true, // 👉 不显示任务栏图标（转为托盘）
    show: true,       // 👉 初始隐藏，依赖托盘控制显示
    transparent: true,
    alwaysOnTop: true,
    focusable: true,
    title: '',
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('viewer2.html');
  win.setAlwaysOnTop(true, 'screen-saver');
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'image.png')); // 你需要放一个icon.ico或icon.png在根目录

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏窗口',
      click: () => {
        if (win.isVisible()) {
          win.hide();
        } else {
          win.show();
        }
      }
    },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  // tray.setToolTip('DPS Viewer'); // 鼠标悬停提示
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    // 单击托盘图标也切换显示/隐藏
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  ipcMain.on('minimize', () => win.minimize());
  ipcMain.on('close', () => win.close());
});
