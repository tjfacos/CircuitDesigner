const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  CommenceAnalysis: (data) => {
    
    // console.log("Begin Analysis...")
    
    return ipcRenderer.invoke("CallAnalysis", JSON.stringify(data))
  },
  SaveDesign: (data) => { return ipcRenderer.invoke("SaveDesign", data) },
  GetDesign: () => { return ipcRenderer.invoke("LoadDesign") },
  HandleLoad: (callback) => ipcRenderer.on("loaded-file", callback)
})