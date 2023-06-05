const { contextBridge, ipcRenderer } = require('electron')

// The context brdge module of Electron allows me to expose methods for the inter-process communication (IPC)
contextBridge.exposeInMainWorld('api', {
  // These methods define what to do when the renderer calls these methods, to send messages to the main process
  CommenceAnalysis: (data) => { return ipcRenderer.invoke("CallAnalysis", JSON.stringify(data))},
  SaveDesign: (data) => { return ipcRenderer.invoke("SaveDesign", data) },
  NotifyUser: (body) => { return ipcRenderer.invoke("NotifyUser", body) },
  GetDesign: () => { return ipcRenderer.invoke("LoadDesign") },
  
  // These methods are called by the renderer when the client first loads,
  // These define which function in the renderer to call when the main process sends messages (through these channels) to the renderer
  HandleLoad: (callback) => ipcRenderer.on("loaded-file", callback),
  HandleNew: (callback) => ipcRenderer.on("new-file", callback),
  ReceiveAnalysis: (callback) => ipcRenderer.on("receive-analysis", callback)
})