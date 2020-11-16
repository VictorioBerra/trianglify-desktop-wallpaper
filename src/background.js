'use strict'

import path from 'path'
import fs from 'fs'
import wallpaper from 'wallpaper'
import { app, protocol, BrowserWindow, screen, Tray, Menu, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { v4 as uuidv4 } from 'uuid';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import mkdirp from 'mkdirp'

const isDevelopment = process.env.NODE_ENV !== 'production'
const iconpath = path.join(__static, 'icon.png')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

app.setAboutPanelOptions({ 
  applicationName: 'About Trianglify Wallpaper', 
  applicationVersion: '1.0.0', 
  copyright: 'Victorio Berra 2020',
  authors: ['Victorio Berra'], 
  website: 'https://www.tberra.com/', 
  iconPath: iconpath, 
})

let win = null
let tray = null

async function createWindow() {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  win = new BrowserWindow({
    width: width * .75,
    height: height * .75,
    frame: false,
    titleBarStyle: 'hidden',
    title: 'Trianglify Wallpaper',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: iconpath
  })

  win.on('close', function (event) {
      event.preventDefault();
      win.hide();
  });

  tray = new Tray(iconpath)
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Settings', 
      type: 'normal', 
      click: function() {
        win.show();
      } 
    },
    { label: 'About', type: 'normal', role: "about", },
    { 
      label: 'Quit', 
      type: 'normal', 
      click: function() {
          win.destroy();
          app.quit();
      } 
    },
  ])
  tray.setToolTip('Trianglify Wallpaper')
  tray.setContextMenu(contextMenu)

  var menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label:'Minimize', 
          click: () => {
            win.hide();
          }
        },
          {
            label:'Quit', 
            click: function() {
              win.destroy();
              app.quit();
          } 
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

ipcMain.on('set-wallpaper-message', (event, dataUrl) => {

  const tempPath = path.join(app.getPath('temp'), 'images')

  // TODO: User settings like image save path...
  mkdirp.sync(tempPath)

  var newFileName = path.join(tempPath, `${uuidv4().toString()}.png`);

  console.log("newFileName", newFileName);
  console.log("tempPath", tempPath);
  //console.log("dataUrl", dataUrl);

  // dataUrl to buffer
  var buffer = Buffer.from(dataUrl.split(",")[1], 'base64');
  fs.writeFileSync(newFileName, buffer);

  wallpaper.set(newFileName);

  event.reply('set-wallpaper-reply', 'done')
})

// Sync
ipcMain.on('get-path-message', (event, arg) => {
  event.returnValue = app.getPath(arg)
})

// Sync
ipcMain.on('get-screens-message', (event, arg) => {
  event.returnValue = {
    all: screen.getAllDisplays(),
    primary: screen.getPrimaryDisplay()
  };
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
