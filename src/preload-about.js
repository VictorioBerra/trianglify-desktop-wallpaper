import { ipcRenderer } from 'electron'

window.hideWindow = async function(){
    await ipcRenderer.send('set-window-hide-message', 'about')
}

window.getAppVersion = async function(){
    return await ipcRenderer.invoke('get-app-version')
}