const fs = require("fs")
const { dialog, Notification, ipcMain } = require("electron")

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
This method returns an array, containingL:
 - The componentMap data (except div)
 - The innerHTML for the comoponent container

 If the operation is cancelled, an empy array is returned
*/


const LoadDesign = async (mainWindow) => {
  let data = []
  
  let result = await dialog.showOpenDialog(mainWindow, {
    title: "Open Circuit Design",
    defaultPath: "C:\\Users\\thoma\\Desktop\\CompSci\\EPQ\\CircuitDesigner\\designs\\NewCircuit.circ",
    filters: [
      {name: "Circuits", extensions: "circ"}
    ], 
    properties: ["openFile"]

  })
  
  console.log(result)


  if (result.canceled){ return }

  fs.readFile(result.filePaths[0], "utf-8", (err, content) => {
    mainWindow.webContents.send("loaded-file", content)
  })
  
}



module.exports = {SaveDesign, LoadDesign}