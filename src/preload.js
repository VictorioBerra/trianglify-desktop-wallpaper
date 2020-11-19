import { ipcRenderer } from 'electron'
import { createPersistedState, createSharedMutations } from "vuex-electron"

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