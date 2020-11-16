import { ipcRenderer } from 'electron'
window.ipcRenderer = ipcRenderer

const customTitlebar = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
    const customTitlebarInstance = new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#272727'),
        overflow: 'hidden'
    });
})