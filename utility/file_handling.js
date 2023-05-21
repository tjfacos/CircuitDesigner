const fs = require("fs")
const { dialog } = require("electron")

const SaveDesign = (data, mainWindow) => {
    console.log(data)
    
    var success = false

    dialog.showSaveDialog(mainWindow, {
        "buttonLabel": "Save",
        "title": "Save Circuit Design",
        "defaultPath": "C:\\Users\\thoma\\Desktop\\CompSci\\EPQ\\CircuitDesigner\\designs\\NewCircuit.circ"
      }).then((value) => {
        
        // console.log(value)

          if (value.canceled) {
            console.log("Operation Cancelled")
          } else {
            // console.log(value.filePath)

            fs.writeFile(value.filePath, data, (err) => {
              if (err){ console.log(`ERROR: ${err}`) }
              else { success = true }
            })

          }
        
        }
      )

    return success
}

module.exports = {SaveDesign}