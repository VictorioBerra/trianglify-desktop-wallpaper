import settings from 'electron-settings';
import { ipcRenderer } from 'electron'

window.settings = settings

window.backupWallpaperReplyOn = function(cb){
    ipcRenderer.on('copy-wallpaper-reply', cb)
}

window.backupWallpaperReplyOff = function(cb){
    ipcRenderer.removeListener('copy-wallpaper-reply', cb)
}

window.hideWindow = async function(){
    await ipcRenderer.send('set-window-hide-message', 'preferences')
}

window.backupWallpaper = async function(){
    await ipcRenderer.send('copy-wallpaper-message', 'preferences')
}