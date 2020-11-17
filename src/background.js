"use strict";

import path from "path";
import fs from "fs";
import wallpaper from "wallpaper";
import {
  app,
  protocol,
  BrowserWindow,
  screen,
  Tray,
  Menu,
  ipcMain,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { v4 as uuidv4 } from "uuid";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import mkdirp from "mkdirp";
import settings from 'electron-settings';
import { combinedDisposable } from "custom-electron-titlebar/lib/common/lifecycle";

// Set up settings and defaults
let imageSavePath = settings.getSync("image.folder");
if (!imageSavePath) {
  const defaultImageSavePath = path.join(
    app.getPath("pictures"),
    "trianglify"
  );
  mkdirp.sync(defaultImageSavePath);
  imageSavePath = defaultImageSavePath;
  settings.setSync("image.folder", defaultImageSavePath);
}

const isDevelopment = process.env.NODE_ENV !== "production";
const iconpath = path.join(__static, "icon.png");

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

app.setAboutPanelOptions({
  applicationName: "About Trianglify Wallpaper",
  applicationVersion: "1.0.0",
  copyright: "Victorio Berra 2020",
  authors: ["Victorio Berra"],
  website: "https://www.tberra.com/",
  iconPath: iconpath,
});

let win = null;
let winPreferences = null;
let tray = null;

async function createWindow() {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  let mainWindow = new BrowserWindow({
    width: width * 0.75,
    height: height * 0.75,
    frame: false,
    titleBarStyle: "hidden",
    title: "Trianglify Wallpaper",
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: iconpath,
  });

  mainWindow.on("close", function(event) {
    event.preventDefault();
    mainWindow.hide();
  });

  tray = new Tray(iconpath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      type: "normal",
      click: function() {
        mainWindow.show();
      },
    },
    {
      label: "Preferences",
      type: "normal",
      click: function() {
        winPreferences.show();
      },
    },
    { label: "About", type: "normal", role: "about" },
    {
      label: "Quit",
      type: "normal",
      click: function() {
        mainWindow.destroy();
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Trianglify Wallpaper");
  tray.setContextMenu(contextMenu);

  var menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Minimize",
          click: () => {
            mainWindow.hide();
          },
        },
        {
          label: "Quit",
          click: function() {
            mainWindow.destroy();
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Preferences",
          click: () => {
            winPreferences.show();
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    mainWindow.loadURL("app://./index.html");
  }

  return mainWindow;
}

async function createPreferencesWindow() {

  let preferencesWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    show: false,
    titleBarStyle: "hidden",
    title: "Trianglify Wallpaper Preferences",
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preloadPreferences.js"),
    },
    icon: iconpath,
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await preferencesWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + "preferences");
    if (!process.env.IS_TEST) preferencesWindow.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    preferencesWindow.loadURL("app://./preferences.html");
  }

  return preferencesWindow;
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#multiple-pages
  if (win === null) {
    win = await createWindow('', 'index.html')
  }
  if (winPreferences === null) {
    winPreferences = await createPreferencesWindow('preferences', 'preferences.html')
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  win = await createWindow();
  winPreferences = await createPreferencesWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}








// TODO redo all this this way https://jaketrent.com/post/select-directory-in-electron/

ipcMain.on("set-wallpaper-message", async (event, dataUrl) => {

  let userSettings = await settings.get();

  let newFileName = path.join(userSettings.image.folder, `${uuidv4().toString()}.png`);

  // dataUrl to buffer
  let buffer = Buffer.from(dataUrl.split(",")[1], "base64");

  try
  {
    fs.writeFileSync(newFileName, buffer);
  }
  catch (err) {
    if (err.code !== 'ENOENT') throw err;
    event.reply("set-wallpaper-reply", `No such file or directory '${userSettings.image.folder}'`);
    return;
  }

  wallpaper.set(newFileName);

  event.reply("set-wallpaper-reply");
});

ipcMain.on('set-window-hide-message', (event, arg) => {
  console.log('set-window-hide-message', arg);
  if(arg === "main") {
    win.hide();
  }
  if(arg === "preferences") {
    winPreferences.hide();
  }
});

ipcMain.on('set-window-show-message', (event, arg) => {
  if(arg === "main") {
    winPreferences.show();
  }
  if(arg === "preferences") {
    winPreferences.show();
  }
});

// Sync
ipcMain.on("get-path-message", (event, arg) => {
  event.returnValue = app.getPath(arg);
});

// Sync
ipcMain.on("get-screens-message", (event, arg) => {
  event.returnValue = {
    all: screen.getAllDisplays(),
    primary: screen.getPrimaryDisplay(),
  };
});

ipcMain.on("set-preferences-closed", (event, arg) => {
  event.returnValue = {
    all: screen.getAllDisplays(),
    primary: screen.getPrimaryDisplay(),
  };
});