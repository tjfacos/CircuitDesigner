const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  encodeComponent: (component) => {
    let componentString = JSON.stringify(component)
    let name = component["name"]
    
    console.log("Preload")
    console.log(`componentString: ${componentString}`)
    console.log(`name: ${name}`)
    
    console.log("Encoding...")
    
    return ipcRenderer.invoke("encodeComponentJSON", componentString, name)
  }
})