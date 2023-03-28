var TestComponent = {
    "name": "R",
    "type": "resistor",
    "connections": [1,2]
}

const encodeCircuit = () => {
    
    let componentsObj = {}

    componentMap.forEach(element => {
        let obj = {
            "name": element.div.id,
            "type": element.type,
            "connections": element.connections,
            "properties": {}
        };
        
        if (element.hasOwnProperty("emf")) {
            obj.properties.emf = element.emf
        }

        if (element.hasOwnProperty("resistance")) {
            obj.properties.resistance = element.resistance
        }
        componentsObj[obj.name] = obj
        
    }
    )
    
    console.log(componentsObj)

    api.encodeJSON(componentsObj)
}