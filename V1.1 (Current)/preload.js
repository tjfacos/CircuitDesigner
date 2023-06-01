const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  CommenceAnalysis: (data) => {
    
    // console.log("Begin Analysis...")
    
    return ipcRenderer.invoke("CallAnalysis", JSON.stringify(data))
  },
  SaveDesign: (data) => { return ipcRenderer.invoke("SaveDesign", data) },
  NotifyUser: (body) => { return ipcRenderer.invoke("NotifyUser", body) },
  GetDesign: () => { return ipcRenderer.invoke("LoadDesign") },
  HandleLoad: (callback) => ipcRenderer.on("loaded-file", callback),
  HandleNew: (callback) => ipcRenderer.on("new-file", callback),
  ReceiveAnalysis: (callback) => ipcRenderer.on("receive-analysis", callback)
})