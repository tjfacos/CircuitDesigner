const fs = require("fs")


const EncodeJSON = (fileString) => {

    if (!fs.existsSync("./temp")){
        fs.mkdirSync("./temp");
    }

    fs.writeFile(
        `./temp/circuit.json`, 
        fileString,
        (err) => {
            if (err) {console.log(err)}
        }
    )

}

module.exports = {EncodeJSON}