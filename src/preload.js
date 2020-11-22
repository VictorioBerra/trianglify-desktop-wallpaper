import { ipcRenderer } from 'electron'
import { createPersistedState, createSharedMutations } from "@victorioberra/vuex-electron"
import log from 'electron-log';

window.log = log.functions;
window.ipcRenderer = ipcRenderer
window.createPersistedState = createPersistedState
window.createSharedMutations = createSharedMutations

const customTitlebar = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
    new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#272727'),
        overflow: 'hidden'
    });
})

window.cronSetWallpaperCommand = function(cb){
    log.debug("Attaching cron set wallpaper handler");
    ipcRenderer.on('cron-set-random-wallpaper-command', cb)
}

window.cronSetWallpaperCommandRemove = function(cb){
    ipcRenderer.removeListener('cron-set-random-wallpaper-command', cb)
}

window.cronSetWallpaperCommandWebhook = function(cb){
    ipcRenderer.on('cron-set-random-wallpaper-webhook-command', cb)
}

window.cronSetWallpaperCommandWebhookRemove = function(cb){
    ipcRenderer.removeListener('cron-set-random-wallpaper-webhook-command', cb)
}