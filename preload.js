const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  CommenceAnalysis: (data) => {
    
    console.log("Begin Analysis...")
    
    return ipcRenderer.invoke("CallAnalysis", JSON.stringify(obj))
  },
  SaveDesign: (data) => { return ipcRenderer.invoke("SaveDesign", data) }
})