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
            if (property == "div") {
                console.log(`Component name is: ${name}`)
                let val = document.getElementById(name).outerHTML.toString()
                console.log(val)
                obj[name][property] = val  
            } else {
                obj[name][property] = comp[property]
            }
            
        }
    })

    return JSON.stringify(obj)
}
  

const SaveCircuit = () => {
    if (componentMap.size > 0){ 
        map = mapToStr(componentMap)
        console.log(map)

        api.SaveDesign(map) 
    
    } 
}

const LoadCircuit = () => {

}