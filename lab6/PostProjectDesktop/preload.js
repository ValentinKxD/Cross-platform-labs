const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("calculationsAPI", {
  loadCalculations: () => ipcRenderer.invoke("calculations:load"),
  saveCalculations: (calculations) => ipcRenderer.invoke("calculations:save", calculations),
});
