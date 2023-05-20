const fs = require("fs")
const exec = require('child_process').exec

const CallAnalysis = (circuitString) => {
    // const python = spawn("cd analysis && python", ["main.py", circuitString])

    // python.stdout.on("data", (data) => {
    //     console.log(data)
    // })    

    const isWin = process.platform === "win32"

    let path = process.argv[1]
    // console.log(`path: ${path}`)

    let command = `.\\.venv\\scripts\\activate && py main.py ${circuitString}`
    
    if (!isWin){
        // Construct command for linux
    }

    const python = exec(command, {cwd: "./analysis"}, (err, stdout, stderr) => {
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
        console.log(`err: ${err}`)
    })

}

module.exports = {CallAnalysis}