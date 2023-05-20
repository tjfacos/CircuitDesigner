const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  CommenceAnalysis: (obj) => {
    
    console.log("Begin Analysis...")
    
    return ipcRenderer.invoke("CallAnalysis", JSON.stringify(obj))
  }
})