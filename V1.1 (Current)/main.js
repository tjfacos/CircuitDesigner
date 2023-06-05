const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, globalShortcut,Notification } = require('electron')
const path = require('path')

// Local Dependencies
const { CallAnalysis } = require("./utility/python_connection")
const { SaveDesign, LoadDesign } = require("./utility/file_handling")

// Function to create Main Window
const createWindow = () => {
  
  // Creates new instance of Electron's BrowserWindow class
  const mainWindow = new BrowserWindow({
    icon: __dirname + '/assets/icons/favicon.ico',
    webPreferences: {
      // A preload script is loaded, defining the channels that the renderer and main processes can use to communicate
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Form menu, adding options with shortcuts
  
  let menu = new Menu()

  fileItem = new MenuItem({
    "label": "File",
    "submenu": [
      {
        "label": "New Design",
        "accelerator": "Ctrl+N",
        "click": () => {
          // The main process sends a message through the 'new-file' channel, instructing the renderer to start a new design
          mainWindow.webContents.send("new-file")
        }
      },
      {
        "label": "Save Design",
        "accelerator": "Ctrl+S",
        "click": () => {
          // Runs the SaveCircuit function in the renderer
          mainWindow.webContents.executeJavaScript("SaveCircuit()") 
        }
      },
      {
        "label": "Open Design",
        "accelerator": "Ctrl+O",
        "click": () => {
          LoadDesign(mainWindow) 
        }
      },
    ]
  })
  
  // This is a shortcut I use to open Electron's DevTools, a facility for be to inspect the internal state of the page and renderer
  devToolsItem = new MenuItem({
    "click": () => {
      mainWindow.webContents.openDevTools()
    },
    "accelerator": "Ctrl+Shift+I"
  })
  
  helpItem = new MenuItem({
    "click": () => {
      mainWindow.webContents.executeJavaScript("openHelpDialog()")
    },
    "label": "Help"    
  })

  // Add menu options to the main menu bar (the top bar)
  menu.append(fileItem)
  menu.append(devToolsItem)
  menu.append(helpItem)

  // Load renderer files and set menu
  mainWindow.maximize()
  mainWindow.loadFile('public/index.html')
  mainWindow.setMenu(menu)
  
  
  return mainWindow

}

// Adds handlers when the renderer sents messages and data to the main process, through channels like CallAnalysis
const AddHandlers = (mainWindow) => {
  
  ipcMain.handle("CallAnalysis", (_, circuit) => {
        
    CallAnalysis(circuit, mainWindow)
    
    return 0
  })
  
  ipcMain.handle("SaveDesign", (_, data) => {
    SaveDesign(data, mainWindow)
  })

  // This is a default channel, that can be used to call generic notifications from the renderer
  ipcMain.handle("NotifyUser", (_, body) => {
    new Notification(body).show()
  })

  // Establish the shortcut to simulate
  globalShortcut.register('Ctrl+f5', () => {
    mainWindow.webContents.executeJavaScript("Simulate()")
  })

} 

app.whenReady().then(() => {
  AddHandlers(createWindow())
  

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
