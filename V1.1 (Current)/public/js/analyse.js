const Simulate = () => {
    // Circuit validation

    let valid = true
    let error = ""

    if (componentMap.size == 0) {
        error = "There are no components!"
        valid = false
    }

    componentMap.forEach((comp, key) => {
        for (terminal in comp.connections) {
            if (comp.connections[terminal].length == 0) {
                error = error.concat(`${key} isn't connected\n`)
                valid = false
                return
            }
        }
    })



    if (valid) {encodeCircuit()}
    else{
        api.NotifyUser({
                title: "Can't Simulate Circuit!",
                body: error
        })
    }
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

api.ReceiveAnalysis((_, results) => {
    DisplayAnalysis(results)
})

const DisplayAnalysis = (results) => {
    
    // Add voltages and currents to components

    console.log(results)
    for (var comp in results) {
        componentMap.get(comp).voltage = results[comp][0]
        componentMap.get(comp).current = results[comp][1]
    }

    // Prevent Editing

    let toolbar = document.getElementById("toolbar")
    toolbar.style.display = "none"

    let control_button = document.getElementById("simulate-btn")
    control_button.style.display = "none"

    // Add Metrics

    let metrics_wizard = document.getElementById("metrics-wizard")
    metrics_wizard.style.display = "block"

    // Switch on metrics mode for all components
    componentMap.forEach((comp, key) => {
        if (!key.includes("wire")) { comp.EnableMetricsMode(true) }
    })

}

const CloseMetrics = () => {
    let metrics_wizard = document.getElementById("metrics-wizard")
    metrics_wizard.style.display = "none"

    let toolbar = document.getElementById("toolbar")
    toolbar.style.display = "block"

    let control_button = document.getElementById("simulate-btn")
    control_button.style.display = "block"


    // Switch on metrics mode for all components
    componentMap.forEach((comp, key) => {
        if (!key.includes("wire")) { comp.EnableMetricsMode(false) }
    })

}


