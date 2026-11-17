const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('calculationsAPI', {
  list: (query) => ipcRenderer.invoke('calculations:list', query),
  add: (input) => ipcRenderer.invoke('calculations:add', input),
  toggle: (id) => ipcRenderer.invoke('calculations:toggle', id),
  remove: (id) => ipcRenderer.invoke('calculations:remove', id),
});
