const fs = require("fs")
const {spawn} = require('child_process')


const CallAnalysis = (circuitString) => {
    const python = spawn("cd analysis && python", ["main.py", circuitString])

    python.stdout.on("data", (data) => {
        console.log(data)
    })    

}

module.exports = {CallAnalysis}