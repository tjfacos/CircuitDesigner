const fs = require("fs")
const resolve = require("path").resolve
const { dialog, Notification, ipcMain } = require("electron")
/*
This method saves the HTML content and circuit element data to a file
the user creates, through the save dialog.
The method first opens the save dialog, which returns the file path of the file the user wants to create.
THe program then writes the circuit data to that file, and show a notification which informs the user exactly where the file has been saved
*/ 
const SaveDesign = (data, mainWindow) => {
    
    dialog.showSaveDialog(mainWindow, {
        "buttonLabel": "Save",
        "title": "Save Circuit Design",
        "defaultPath": resolve("./designs"),
        "filters": [{
          name: 'Circuit Files',
          extensions: ['circ']
        }]
      }).then((value) => {
        
          if (value.canceled) {
            console.log("Operation Cancelled")
          } else {
       
            fs.writeFile(value.filePath, data, (err) => {
              if (err){ console.log(`ERROR: ${err}`) }
              else { 
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
This method builds an array, containing:
 - The componentMap data (except div)
 - The innerHTML for the component container

If the operation is cancelled, nothing happens.
Otherwise, the method loads the contents of the file the user selects using the Open Dialog,
and sends this data, through the 'loaded-file' channel to the renderer
*/


const LoadDesign = async (mainWindow) => {
  let data = []
  
  let result = await dialog.showOpenDialog(mainWindow, {
    title: "Open Circuit Design",
    defaultPath: resolve("./designs"),
    filters: [{
      name: 'Circuit Files',
      extensions: ['circ']
    }], 
    properties: ["openFile"]

  })
  
  if (result.canceled){ return }

  fs.readFile(result.filePaths[0], "utf-8", (err, content) => {
    mainWindow.webContents.send("loaded-file", content)
  })
  
}



module.exports = {SaveDesign, LoadDesign}