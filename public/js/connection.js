function arrayEquals(a, b) {
    // console.log(a)
    // console.log(b)
    
    let val =  Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
    // console.log(val)
    return val
}


const AreConnected = (comp1, comp2) => {
    // Return true if the 2 components have ports that overlap, false otherwise
    

    if (comp1 == comp2) return false

    let connected = false


    comp1.portCoords.forEach(portA => {
        comp2.portCoords.forEach(portB => {
            
            // console.log(arrayEquals(portA, portB))
            if (arrayEquals(portA, portB)){
                console.log("MATCH")
                connected = true;
            }
        })
    });
    
    return connected

}