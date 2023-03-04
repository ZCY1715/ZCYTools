import { contextBridge, ipcRenderer } from 'electron'
import { BrowserWindow } from '@electron/remote'

contextBridge.exposeInMainWorld('myWindowAPI', {
  minimize() {
    BrowserWindow.getFocusedWindow().minimize()
  },
  close() {
    BrowserWindow.getFocusedWindow().close()
  },
  drag: ({ x, y }) => ipcRenderer.invoke('drag', { x, y }),
  getMediaSources: async (types) => new Promise((resolve) => {

    const dealSources = (e, sources) => {
      resolve(JSON.parse(sources))
      ipcRenderer.off('getMediaSources', dealSources)
    }
    ipcRenderer.on('getMediaSources', dealSources)
    ipcRenderer.invoke('collectMediaSources', types)

  })
})