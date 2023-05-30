function arrayEquals(a, b) {
    
    // console.log("running")

    let val =  Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
    
    return val

}


const AreConnected = (PC1, PC2) => {
    // Return true if the 2 components have ports that overlap, false otherwise
    
    let port = 0

    var portA
    var portB

    for (let x = 0 ; x < 2 ; x++ ){
        port++
        portA = PC1[x]

        for (let y = 0 ; y < 2 ; y++ ) {
            portB = PC2[y]
            
            // console.log(portA)
            // console.log(portB)

            if (arrayEquals(portA, portB)){
                console.log("MATCH")
                return port
            }
        }
    }
    
    return 0

}