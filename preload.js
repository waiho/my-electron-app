// preload.js

// All the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const dependency of ['chrome', 'node', 'electron']) {
//     replaceText(`${dependency}-version`, process.versions[dependency])
//   }
// })

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping')
  // we can also expose variables, not just functions
})
contextBridge.exposeInMainWorld('electronAPI', {
  loadURL: (url) => ipcRenderer.send('load-url', url),
  createTab: (url, tabId) => ipcRenderer.invoke('create-tab', url, tabId),
  switchTab: (tabId) => ipcRenderer.invoke('switch-tab', tabId),
});

// copied from Verse electron:
/**
 * Fires every time a tab is loaded (tab's webview is in the "ready" state)
 * @param  {Function} callback
 */
const onElectronTabLoad = (callback) => {
  const handler = (event, url /* src of tab */) => {
    callback(url);
  };
  ipcRenderer.on('webview-ready', handler);
  return { remove: ipcRenderer.removeListener.bind(ipcRenderer, 'webview-ready', handler) };
};

/**
 * Fires every time a tab is closed (electron-tab's close event has fired)
 * @param  {Function} callback
 */
const onElectronChildTabUnload = (callback) => {
  const handler = (event, url /* src of tab */) => {
    callback(url);
  };
  ipcRenderer.on('webview-close', handler); // TODO: rename this to not "webview-close" too similar to window-close for subspace
  return { remove: ipcRenderer.removeListener.bind(ipcRenderer, 'webview-close', handler) };
};

/**
 * Fires when an electron tear-off window (or tab) is unloaded.
 * TODO: this should be just "unload"
 * @param  {Function} callback
 */
const onElectronBeforeUnload = (callback) => {
  const handler = (event, message) => {
    callback(message.tid /* tearoffId of the tearoff unloading */);
  };
  ipcRenderer.on('beforeunload', handler);
  return { remove: ipcRenderer.removeListener.bind(ipcRenderer, 'beforeunload', handler) };
};

// TODO make an actual beforeunload handler that can be stopped (for compose)

contextBridge.exposeInMainWorld('onElectronTabLoad', onElectronTabLoad);
contextBridge.exposeInMainWorld('onElectronChildTabUnload', onElectronChildTabUnload);
contextBridge.exposeInMainWorld('onElectronBeforeUnload', onElectronBeforeUnload);

