const Simulate = () => {
    // Circuit validation

    encodeCircuit()
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

    api.CommenceAnalysis(componentsObj)
}


// Recieve Analysis Data

api.ReceiveAnalysis((_, voltages) => {
    DisplayAnalysis(voltages)
})

const DisplayAnalysis = (voltages) => {
    // Add voltages to components

    console.log(voltages)
    for (var comp in voltages) {
        componentMap.get(comp).voltage = voltages[comp]
        componentMap.get(comp).SetCurrent()
        // console.log(comp)
        // console.log(componentMap.get(comp))
    }

    
}