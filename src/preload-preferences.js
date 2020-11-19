import { ipcRenderer } from 'electron'
import { createPersistedState, createSharedMutations } from "vuex-electron"

window.createPersistedState = createPersistedState
window.createSharedMutations = createSharedMutations

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