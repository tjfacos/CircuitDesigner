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

        console.log(data)

        api.SaveDesign(data) 
    
    } 
}

// const LoadCircuit = () => { api.GetDesign() }

// ipcRenderer.on("loaded-file-reciever", (event, data) => {
//     console.log(data)
// })

api.HandleLoad((event, data) => {
    console.log(data)
})