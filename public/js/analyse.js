var TestComponent = {
    "name": "R",
    "type": "resistor",
    "connections": [1,2]
}

const encodeCircuit = () => {
    componentMap.forEach(element => {
        // console.log(element)
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

        api.encodeComponent(obj) 

        }
    )
}