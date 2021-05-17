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
  Notification,
  Menu,
  ipcMain,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { v4 as uuidv4 } from "uuid";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import mkdirp from "mkdirp";
import cron from "cron"
import { DateTime } from 'luxon';
import log from 'electron-log';
import _ from "lodash"
import axios from 'axios'
import { autoUpdater } from "electron-updater"

// Some real hacky stuff here for "vuex-electron"
// "vuex-electron" needs to run here in the main process and also in renderer
// Renderer uses preload and sets these on window.
import { createPersistedState, createSharedMutations } from "@victorioberra/vuex-electron"
import store from './plugins/vuex'
import { start } from "repl";
const storeInstance = store({ createPersistedState, createSharedMutations } )

// Set up settings and defaults
let imageSavePath = storeInstance.state.settings.image.savePath;
if (!imageSavePath) {
  const defaultImageSavePath = path.join(
    app.getPath("pictures"),
    "trianglify"
  );
  mkdirp.sync(defaultImageSavePath);
  imageSavePath = defaultImageSavePath;
  storeInstance.dispatch("settingsImageSavePath", defaultImageSavePath);
}

const isDevelopment = process.env.NODE_ENV !== "production";
const iconpath = path.join(__static, "icon.png");

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let win = null;
let randomCronWallpaperJob = null;
let winPreferences = null;
let winAbout = null;
let tray = null;

async function createWindow() {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  let mainWindow = new BrowserWindow({
    width: width * 0.75,
    height: height * 0.75,
    show: false,
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
    {
      label: "Designer",
      submenu: [
        {
          label: "Generate and Set",
          click: () => {
            win.webContents.send('cron-set-random-wallpaper-command', 'TODO: palette or some payload.');
          },
        },
      ],
    },
    {
      label: "About",
      type: "normal",
      click: function() {
        winAbout.show();
      },
    },
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
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
            winAbout.show();
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
    autoUpdater.checkForUpdatesAndNotify()
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

async function createAboutWindow() {

  let aboutWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    show: false,
    titleBarStyle: "hidden",
    title: "Trianglify Wallpaper About",
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preloadAbout.js"),
    },
    icon: iconpath,
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await aboutWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + "about");
    if (!process.env.IS_TEST) aboutWindow.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    aboutWindow.loadURL("app://./about.html");
  }

  return aboutWindow;
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
  if (winAbout === null) {
    winAbout = await createAboutWindow('about', 'about.html')
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
  win.maximize();
  win.show();
  winPreferences = await createPreferencesWindow();
  winAbout = await createAboutWindow();

  randomCronWallpaperJob = new cron.CronJob(storeInstance.state.randomCronExpression, async function() {
    log.info("CronJob random wallpaper job ran.");
    win.webContents.send('cron-set-random-wallpaper-command', 'TODO: palette or some payload.');

    var randomCronWebhook = storeInstance.state.randomCronWebhook;
    if(randomCronWebhook !== null && randomCronWebhook.trim() !== "") {
      log.info("Webhook detected, sending POST.");
      let response = await axios.post(randomCronWebhook, 'Wallpaper set!')
        .then(function(response){
          return {
            message: response.statusText,
            error: false
          };
        })
        .catch(function(error){
          if (error.response) {
            return {
              error: true,
              message: error.response.statusText
            };
          } else if (error.request) {
            return {
              error: true,
              message: "The request was made but no response was received"
            };
          } else {
            return {
              error: true,
              message: "Something happened in setting up the request that triggered an Error"
            };
          }
        });

        if(response.error) {
          new Notification({
            title: 'Trianglify Desktop Webhook Issue',
            body: 'You have a webhook setup that is failing. See scheduler in app.'
          }).show()
        }

      log.info("Webhook call complete, result: ", response);
      win.webContents.send('cron-set-random-wallpaper-webhook-command', response);
    }
  }, null, false, DateTime.local().zoneName);

  log.info("Starting job on first start? " + storeInstance.state.enableRandomCron);

  if(storeInstance.state.enableRandomCron) {
    randomCronWallpaperJob.start();
  }

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

const debouncedCronTimeChange = _.debounce(function(payload){
  log.debug("randomCronExpression changed, setting new cron time.: " + payload);
  randomCronWallpaperJob.setTime(new cron.CronTime(payload));
  if(storeInstance.state.enableRandomCron) {
    randomCronWallpaperJob.start();
  }
}, 500);

ipcMain.on("vuex-mutations-notify-main", async (event, {type, payload}) => {
  log.debug("vuex icp system in background called: ", {type, payload});
  switch(type){
    case 'enableRandomCron': {
      log.debug("Call to enableRandomCron: " + payload);
      if(payload){
        randomCronWallpaperJob.start();
      } else {
        randomCronWallpaperJob.stop();
      }
      break;
    }
    case 'randomCronExpression': {
      debouncedCronTimeChange(payload);
      break;
    }
  }
})




// TODO redo all this this way? why use this? https://jaketrent.com/post/select-directory-in-electron/

ipcMain.on("set-wallpaper-message", async (event, dataUrl) => {

  var newFileName = await saveWallpaperipcMainHandler(event, dataUrl);

  log.info("Setting wallpaper in background.js on set-wallpaper-message handler.");

  wallpaper.set(newFileName);

  event.reply("set-wallpaper-reply");
});

ipcMain.on("save-wallpaper-message", async (event, dataUrl) => {

  await saveWallpaperipcMainHandler(event, dataUrl);

  event.reply("save-wallpaper-reply");
});

ipcMain.on('copy-wallpaper-message', async (event, arg) => {
  const response = {
    error: null,
    errorMessage: null,
    newFileName: null
  };

  let userSettings = await storeInstance.state.settings;

  const newFileName = `${uuidv4().toString()}.png`;
  let newFilePath = path.join(userSettings.image.savePath, newFileName);
  response.newFileName = newFilePath;

  var currentWallpaper = await wallpaper.get();

  try {
    await fs.copyFileSync(currentWallpaper, newFilePath);
  } catch(err) {
    if (err.code !== 'ENOENT') throw err;
    response.error = true;
    response.errorMessage = `No such file or directory '${currentWallpaper}'`;
  }

  event.reply("copy-wallpaper-reply", response);

});

ipcMain.on('set-window-hide-message', (event, arg) => {
  //console.log('set-window-hide-message', arg);
  if(arg === "main") {
    win.hide();
  }
  if(arg === "preferences") {
    winPreferences.hide();
  }
  if(arg === "about") {
    winAbout.hide();
  }
});

ipcMain.on('set-window-show-message', (event, arg) => {
  if(arg === "main") {
    win.show();
  }
  if(arg === "preferences") {
    winPreferences.show();
  }
  if(arg === "about") {
    winAbout.show();
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

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

async function saveWallpaperipcMainHandler(event, dataUrl){
  let userSettings = await storeInstance.state.settings;

  let newFileName = path.join(userSettings.image.savePath, `${uuidv4().toString()}.png`);

  log.info("Saving wallpaper to: " + newFileName);

  // dataUrl to buffer
  let buffer = Buffer.from(dataUrl.split(",")[1], "base64");

  try
  {
    fs.writeFileSync(newFileName, buffer);
    return newFileName;
  }
  catch (err) {
    if (err.code !== 'ENOENT') throw err;
    event.reply("set-wallpaper-reply", `No such file or directory '${userSettings.image.savePath}'`);
    return;
  }
}