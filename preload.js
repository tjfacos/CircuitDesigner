const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  encodeJSON: (obj) => {
    
    console.log("Encoding...")
    
    return ipcRenderer.invoke("encodeCircuit", JSON.stringify(obj))
  }
})