// This file is responsible for saving and loading files

// This takes in the componentMap, and converts it into an object, and finally a string of that object
// This allows the program to store the properties of components in the map in .circ files
const mapToStr = (map) => {
    var obj = {}

    map.forEach((comp, name) => {
        obj[name] = {}
        for (let property in comp) {
            // The dives can be effectively saved, so skip encoing them
            if (property == "div") {} 
            else {
                obj[name][property] = comp[property]
            }
            
        }
    })

    return JSON.stringify(obj)
}


// This method is invoked from the main process in Electron, and saves the circuit
// It uses the above method to get the obejct string version of the component map (maps in JavaScript can be directly cast to strings)
// It also gets the HTML content of the component-container, which contains the actual visual elements 
// Finally, the SaveDesign method of the inter-process API is called, which send the data to be stored by the main process
// If these is no circuit content to save, the function calls the NotifyUser method to send a notification to the screen
// The inter-process API and channels are defined in preload.js, in the root of the project

const SaveCircuit = () => {
    if (componentMap.size > 0){
        
        html = document.getElementById("component-container").innerHTML
        
        map = mapToStr(componentMap)
        
        let data = JSON.stringify([html, map])

        api.SaveDesign(data) 
    
    } else {
        api.NotifyUser({
            title: "Can't Save Circuit!",
            body: "Circuit has no content"
        })
    }
}

// This defines the function to be called when the main process sends loaded circuit data to the renderer process

api.HandleLoad((_, data_string) => {
    let data = JSON.parse(data_string)
    
    data[1] = JSON.parse(data[1])
    
    document.getElementById("component-container").innerHTML = data[0]
    
    ComponentCounters = {
        "resistor": 1,
        "bulb": 1,
        "cell": 1,
        "wire": 1
    };

    componentMap = new Map()
    let componentData = data[1]
    
    Object.keys(componentData).forEach((key) => {
        let dataEntry = componentData[key]
        dataEntry.id = key
        
        addComponentFromLoad(dataEntry)

    })

})

// When the main process calls for a new design to start, this method calls a function NewDesign to do so
api.HandleNew((_) => {
    NewDesign()
})

// This first confirms the user want to clear the scree, then resets the component counters, component-container, and componentMap to initial condition 
const NewDesign = () => {
    
    let cont = true
    
    if (componentMap.size > 0){
        cont = confirm("Are you sure you want to start a new design? Make sure you've saved anything you want to keep")
    }
    
    if (cont)
    {
        
        ComponentCounters = {
            "resistor": 1,
            "bulb": 1,
            "cell": 1,
            "wire": 1
        };
    
        componentMap = new Map()
    
        document.getElementById("component-container").innerHTML = ""
    }
    
}