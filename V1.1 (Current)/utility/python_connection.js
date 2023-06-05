const exec = require('child_process').exec
const fs = require("fs")

const { Notification } = require("electron")

/*
This function is used to calls the ALM, and places the circuit data to be analysed into a temporary file, results.json
The command to call the analysis changes depending on if the app is running on Windows or Linux.
The temporary file is then written using the circuitString value (the stringified data on the circuits elements, properties, connections etc.)
Once that is done, the python code is called, in a child process of the client. 
Thus, it runs on a separate thread on the CPU, being executed concurrently with the client.
When the program returns (he analysis has been completed), and no errors occur, the LoadResults function loads the results
If an error occurs (which it shouldn't but obviously did during development), the SendErrorMessage is called
*/

const CallAnalysis = (circuitString, window) => {

    const isWin = process.platform === "win32"
    let command = `.\\.venv\\scripts\\activate && py main.py`
    
    if (!isWin){
        command = `
        python3 main.py
        `
    }

    if (!fs.existsSync("./analysis/temp")){
        fs.mkdirSync("./analysis/temp");
    }

    fs.writeFile("./analysis/temp/circuit.json", circuitString, () => {
        const python = exec(command, {cwd: "./analysis"}, (err, stdout, stderr) => {
            console.log(`stdout: ${stdout}`)
            console.log(`err: ${err}`)
            
            if (err) {
                SendErrorMessage()
            } else {
                LoadResults(window)
            }

        })
    })

}

/*
This function loads and then deletes the temporary file results.json, containing the results of the analysis.
The data is the parsed back into a JavaScript object, and returned to the renderer process via the receive-analysis IPC channel
*/

const LoadResults = (window) => {

    fs.readFile("./analysis/temp/results.json", "utf-8", (err, content) => {
        
        fs.unlink("./analysis/temp/results.json", (e) => {
            if (e) throw err
        })

        window.webContents.send("receive-analysis", JSON.parse(content))

    })
    
}

// This shows an error notification if the ALM produces an error at runtime
const SendErrorMessage = () => {
    new Notification({
        title: "Circuit Analysis Failed!",
        body: `Please see console`
      }).show()
}

module.exports = {CallAnalysis, LoadResults, SendErrorMessage}