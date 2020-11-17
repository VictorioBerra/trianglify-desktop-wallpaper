import settings from 'electron-settings';
import { ipcRenderer } from 'electron'

window.settings = settings

window.hideWindow = async function(){
    await ipcRenderer.send('set-window-hide-message', 'preferences')
}