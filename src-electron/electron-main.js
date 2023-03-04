import { app, BrowserWindow, nativeTheme, Menu, ipcMain, desktopCapturer } from 'electron'
import { initialize, enable } from '@electron/remote/main'
import path from 'path'
import os from 'os'

initialize()

const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    center: true,
    resizable: false,
    show: false,
    icon: path.resolve(__dirname, 'icons/icon.png'),
    frame: false,
    transparent: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
  })

  ipcMain.handle('drag', (e, data) => {
    const [x, y] = mainWindow.getPosition()
    mainWindow.setPosition(x + data.x, y + data.y)
  })

  ipcMain.handle('collectMediaSources', async (e, types) => {
    const sources = await desktopCapturer.getSources({ types })
    mainWindow.webContents.send('getMediaSources', JSON.stringify(sources))
  })

  enable(mainWindow.webContents)

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
  Menu.setApplicationMenu(null)
})

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})