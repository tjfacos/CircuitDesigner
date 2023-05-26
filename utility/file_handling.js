const fs = require("fs")
const { dialog, Notification } = require("electron")

const SaveDesign = (data, mainWindow) => {
    // console.log(data)
    
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
              else { 
                // console.log("WOOOOO!")
                new Notification({
                  title: "Save Successful!",
                  body: `File saved to ${value.filePath}`
                }).show()
              }
            })

          }
        
        }
      )
}

/* 




*/


const LoadDesign = (mainWindow) => {
  let data = []
  
  dialog.showSaveDialog(mainWindow, {
    "buttonLabel": "Load",
    "title": "Load Circuit Design",
    "defaultPath": "C:\\Users\\thoma\\Desktop\\CompSci\\EPQ\\CircuitDesigner\\designs"
  }).then((value) => {
    if (value.canceled){ return }

  })

  return data

}



module.exports = {SaveDesign, LoadDesign}