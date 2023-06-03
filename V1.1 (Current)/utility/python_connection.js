const exec = require('child_process').exec
const fs = require("fs")

const { Notification } = require("electron")

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
            // console.log(`stderr: ${stderr}`)
            console.log(`err: ${err}`)
            
            if (err) {
                SendErrorMessage()
            } else {
                LoadResults(window)
            }

        })
    })

}

const LoadResults = (window) => {

    fs.readFile("./analysis/temp/results.json", "utf-8", (err, content) => {
        
        fs.unlink("./analysis/temp/results.json", (e) => {
            if (e) throw err
        })

        window.webContents.send("receive-analysis", JSON.parse(content))

    })
    
}


const SendErrorMessage = () => {
    new Notification({
        title: "Circuit Analysis Failed!",
        body: `Please see console`
      }).show()
}

module.exports = {CallAnalysis, LoadResults, SendErrorMessage}