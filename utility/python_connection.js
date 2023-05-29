const exec = require('child_process').exec
const fs = require("fs")

const CallAnalysis = (circuitString) => {
    // let path = process.argv[1]

    console.log(circuitString)

    const isWin = process.platform === "win32"
    let command = `.\\.venv\\scripts\\activate && py main.py`
    
    if (!isWin){
        // Construct command for linux
    }

    fs.writeFile("./analysis/temp/circuit.json", circuitString, () => {
        const python = exec(command, {cwd: "./analysis"}, (err, stdout, stderr) => {
            console.log(`stdout: ${stdout}`)
            console.log(`stderr: ${stderr}`)
            console.log(`err: ${err}`)
        })
    })



    


}

module.exports = {CallAnalysis}