// This is where save and load live

// https://medium.com/jspoint/working-with-files-i-o-in-an-electron-application-b4d2de403f54

const mapToStr = (map) => {
    var obj = {}

    map.forEach((comp, name) => {
    //   console.log(key)
        obj[name] = {}
        // console.log(comp)
        for (let property in comp) {
            // console.log(property)
            if (property == "div") {} 
            else {
                obj[name][property] = comp[property]
            }
            
        }
    })

    return JSON.stringify(obj)
}

const SaveCircuit = () => {
    if (componentMap.size > 0){
        
        html = document.getElementById("component-container").innerHTML
        
        map = mapToStr(componentMap)
        
        let data = JSON.stringify([html, map])

        // console.log(data)

        api.SaveDesign(data) 
    
    } 
}

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