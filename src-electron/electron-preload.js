const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  drag: ({ x, y }) => ipcRenderer.invoke('drag', { x, y })
})