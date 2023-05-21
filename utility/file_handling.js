const fs = require("fs")
const { dialog } = require("electron")

const SaveDesign = (map, mainWindow) => {
    console.log(map)
    
    dialog.showSaveDialog(mainWindow, {
        "buttonLabel": "Save",
        "title": "Save Circuit Design",
        "defaultPath": "C:\\Users\\thoma\\Desktop\\CompSci\\EPQ\\CircuitDesigner\\designs\\circuit.circ"
      }).then((value) => {
        
        console.log(value)

          if (value.canceled) {
            console.log("Operation Cancelled")
          } else {
            console.log(value.filePath)
          }
        
        }
      )
}

module.exports = {SaveDesign}