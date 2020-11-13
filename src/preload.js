import { ipcRenderer } from 'electron'
window.ipcRenderer = ipcRenderer

const customTitlebar = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
    new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#272727')
    });
})