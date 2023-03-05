import { contextBridge, ipcRenderer } from 'electron'
import { BrowserWindow, screen, desktopCapturer } from '@electron/remote'

contextBridge.exposeInMainWorld('myWindowAPI', {
  minimize() {
    BrowserWindow.getFocusedWindow().minimize()
  },
  close() {
    BrowserWindow.getFocusedWindow().close()
  },
  drag: async ({ x, y }) => await ipcRenderer.invoke('drag', { x, y }),
  getMediaSources: async (types) => await desktopCapturer.getSources({ types }),
  getWorkAreaSize: () => {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize
    return {
      width: workAreaSize.width,
      height: workAreaSize.height
    }
  },
  getStoreValue: async (key) => await ipcRenderer.invoke('getStoreValue', key),
  setStoreValue: async (key, value) => await ipcRenderer.invoke('setStoreValue', key, value)
})