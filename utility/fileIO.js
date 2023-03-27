const fs = require("fs")


const EncodeComponent = (componentString, name) => {

    // console.log("fileIO")
    // console.log(`componentString: ${componentString}`)
    // console.log(`name: ${name}`)

    if (!fs.existsSync("./temp")){
        fs.mkdirSync("./temp");
    }

    fs.writeFile(
        `./temp/${name}.json`, 
        componentString,
        (err) => {
            if (err) {console.log(err)}
        }
    )

}


const EncodeCircuitJSON = (componentMap) => {
    // console.log("Hello from fileIO.js!!")
    
    let circuit = {
        "components": []
    }
    
    componentMap.forEach((component) => {
        
        let obj = {
            "name": component.div.id,
            "type": component.type,
            "connections": component.connections
        }

        if (obj.type == "Cell") {
            obj.emf = component.emf
        }
        if (!(obj.type == "Wire")) {
            obj.resistance = component.resistance
        }

        circuit.components.push(obj)

    });

    console.log(circuit)

    fs.mkdir("temp")
    fs.writeFile(
        "./temp/circuit.json", 
        JSON.stringify(circuit),
        (err) => {
            if (err) {console.log(err)}
        })
}

const test = () => {
    console.log("test")

    fs.mkdirSync("temp")
    fs.writeFile(
        "./temp/circuit.json", 
        "testing",
        (err) => {
            if (err) {console.log(err)}
        }
    )
}

module.exports = {EncodeComponent}