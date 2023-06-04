
// This is called when the user presses the simulate button, or by the main process when the user hits Ctrl+F5
// It is the main method that starts to call the simulation
const Simulate = () => {
    // Circuit validation

    let valid = true
    let error = ""

    // Makes sure the circuit isn't empty
    if (componentMap.size == 0) {
        error = "There are no components!"
        valid = false
    }

    // Loops through each component, ensuring the circuit they are all fully connected up
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

    // 

    componentMap.forEach(element => {
        // Encode the relevant properties of each element
        
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
    
    // Console.log statements are dotted around the appilcation, which help me figure out
    // what is happening (or going wrong) at different parts
    console.log(componentsObj)


    // Send the circuit data through to the main process
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

    // Prevent further Editing, by hiding the toolbar

    let toolbar = document.getElementById("toolbar")
    toolbar.style.display = "none"

    // Hide the simulate button
    let control_button = document.getElementById("simulate-btn")
    control_button.style.display = "none"

    // Display Metrics Wizard
    let metrics_wizard = document.getElementById("metrics-wizard")
    metrics_wizard.style.display = "block"

    // Switch on metrics mode for all components
    componentMap.forEach((comp, key) => {
        if (!key.includes("wire")) { comp.EnableMetricsMode(true) }
    })

}

const CloseMetrics = () => {

    // Hide metrics wizard
    let metrics_wizard = document.getElementById("metrics-wizard")
    metrics_wizard.style.display = "none"

    // Enable editing by showing the toolbar again
    let toolbar = document.getElementById("toolbar")
    toolbar.style.display = "block"

    // Shows the simulate button again
    let control_button = document.getElementById("simulate-btn")
    control_button.style.display = "block"


    // Disable metrics mode for all components
    componentMap.forEach((comp, key) => {
        if (!key.includes("wire")) { comp.EnableMetricsMode(false) }
    })

}


