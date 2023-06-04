// This function is designed to compare 2 arrays, which is used to compare
// The port coordinates (stored as arrays) of 2 components

function arrayEquals(a, b) {
    
    let val =  Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
    
    return val

}


const AreConnected = (PC1, PC2) => {
    // Each circuit element has 2 terminals, t1 and t2, where they can connect. If the 2 components are connected,
    // This function returns the terminal number of the 1st component where this connection occurs
    // Returns 0 if there is no connection
    
    let port = 0

    var portA
    var portB

    // Loop through each port on each component, and compare them
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