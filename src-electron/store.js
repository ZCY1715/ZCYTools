import Store from 'electron-store'
import { ipcMain } from 'electron'

export default function initStore() {
  const store = new Store()

  ipcMain.handle('getStoreValue', (e, key) => {
    return store.get(key)
  })

  ipcMain.handle('setStoreValue', (e, key, value) => {
    store.set(key, value)
  })
}