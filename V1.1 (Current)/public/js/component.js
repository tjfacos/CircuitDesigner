// Declare the componentMap, the data type where all components are stored
var componentMap = new Map()

// ComponentCounters are used to set the names for each component, so they are all unique
var ComponentCounters = {
    "resistor": 1,
    "bulb": 1,
    "cell": 1,
    "wire": 1
};

// This variable tracks which element on the screen is selected
var SelectedElement = null;

/*

The Component Class is the base class for all standard component classes, from which the component objects are instantiated
Classes are effectivly blueprints that are used to created objects

*/


class Component {
    
    // This method is called whenever a component (like a cell or resistor) is added to the design
    constructor (type, load_data) {
        
        // Set properties, including a HTML DIV, representing the component, to add to the screen
        this.type = type;
        this.div = document.createElement("DIV")
        this.connections = []
        this.ports = []
        this.portCoords = []
        this.width = 0
        this.height = 0
        this.voltage = 0
        this.current = 0

        // The div attribute of the object contains its name: its type, as well a number representing which element of that type it is
        // For example, the second resistor in a design is called resistor2
        this.div.id = type + ComponentCounters[type]++;
        // Classes are used to style each component, so a general component class, 
        // as well as a class for that type of component, e.g. cell, is added
        this.div.classList.add("component");
        this.div.classList.add(type);
        
        
        this.selected = false;
        this.placed = false;
        
        // If load data is provided (whenever a design is loaded from a file), 
        // The initial state must be set, using the load data passed into the constructor
        // Otherwise, a procedure of adding the component icon to the div, and configuring it for the canvas can be followed
        if (!load_data) {
            this.addIcon();
            this.addToCanvas();
        } else {
            this.setFromLoad(load_data);
        }
        
    }
    
    // This method sets the objects state using loaded data
    setFromLoad(load_data) {
        console.log(load_data)

        // Set properties from loaded data
        this.connections = load_data.connections
        this.height = load_data.height
        this.width = load_data.width
        this.portCoords = load_data.portCoords

        // Identify which HTML element on the screen represents this object
        this.div = document.getElementById(load_data.id)
        this.ports = Array.from(document.getElementById(load_data.id).getElementsByClassName("port"))

        // Set type specific properties
        if (load_data.type == "cell") {
            this.emf = load_data.emf
        } else {
            this.resistance = load_data.resistance
        }

        // Add standard event handlers for movement and control
        this.addHandlers()

    }

    // This method calculates the coordinates on the grid of the terminals/ports 
    // (points where the object connects to other elements in the circuit)
    setPortCoords() {
        // Get x-y coordinates of the component itself, on the screen
        var x = this.div.offsetLeft
        var y = this.div.offsetTop
        
        // Find the width and height of the component on the screen, and calculate the coodinates for the centre of the element
        let width = this.width
        let height = this.height
        let centre = [x+width/2, y+height/2]

        // Set initial positions of the ports to be the centre
        let port1 = centre
        let port2 = centre


        // If the component is rotated (vertical orientation)
            // Subtract half a width to the y-coordinate first port, and add half from the second
        // Otherwise (horizontal), do the same but for the x-coordinates

        if (this.div.classList.contains("rotated")) {
            port1[1] -= width/2
            port2[1] += width/2
        } else {
            port1[0] -= width/2
            port2[0] += width/2
        }
        
        // Set the portCoords attibute to reflect these calculations
        this.portCoords = [port1, port2]

        // Find the connected elements
        this.SetConnections()

    }

    /* NB: For extra clarity: 
        An element on the screen refers to a HTML element, usually a div, present in the document 
        A circuit element refers to a part of the circuit, such as a resistor, cell, or wire
    */

    // This is the initial procedure to place the element on the screen
    addToCanvas() {
        
        // Add the component's HTML div to the component-container
        let element = this.div
        document.getElementById("component-container").append(element);
        
        // Add ports (used as reference points to connect the component to other circuit elements)
        this.addPorts();
        var overlay = document.getElementById("overlay")
        
        // Start Placement Procedure
        // Set CSS classes to show that the component is being added (blue outline, drop shadow etc), as well as make the blue overlay visible 
        overlay.style.display = "block"
        element.classList.add("isBeingAdded")

        // An event listener is used to track mouse movements, and the position of the element the screen is updated to track that position
        document.onmousemove = (e) => {
            
            let x = e.pageX;
            let y = e.pageY;
            
            // Lock coordinates to the grid. This makes them a multiple of 30, as each square on the grid is 30 x 30 px

            let lockedCoords = this.placeToGrid(x , y);
            x = lockedCoords[0];
            y = lockedCoords[1];
            
            // Set element position to the locked coordinates, adjusted so the mouse pointer is in the centre of the component, rather than the top left
            // This involves setting both coordinates and subtracting half the width//height of the HTML element as appropriate
            element.style.left = (x-element.clientWidth/2) + "px";
            element.style.top = (y-element.clientHeight/2) + "px";
        }
        
        // When the user clicks on the position, set the component in that position
        document.onmousedown = (e) => {
            if (!(document.getElementById("toolbar").contains(e.target))) {
                console.log("placed")
                // Remove overlay and placement styling
                overlay.style.display = "none";
                element.classList.remove("isBeingAdded")

                // Remove event listeners
                document.onmousemove = () => {}
                document.onmousedown = () => {};
                
                this.width = Math.round(this.div.offsetWidth / 10) * 10
                this.height = Math.round(this.div.offsetHeight / 10) * 10
                
                // Set the port coordinates of every component. 
                // This also evaluates the connections between components in the circuit
                SetAllPortCoords()
                this.addHandlers();
            }
        }
        
    }
    
    
    addIcon() {
        let element = this.div;
        let img = document.createElement("img");
        let svgURL = `../assets/components/${element.classList[1]}.svg`;
        img.src = svgURL;
        img.id = element.id + "-icon";
        img.alt = element.id;
        img.draggable = false;
        
        element.append(img)
    }
    
    addHandlers() {
        this.addMovement()
        this.addControls();
    }
    
    addPorts() {
        
        const createPort = (i) => {
            
            
            let port = document.createElement("div")
            port.classList.add("joint")
            port.classList.add("port")
            this.div.append(port)
            
            console.log(`i: ${i}`)
            
            port.style.position = "absolute"
            port.style.top = (this.div.clientHeight/2 - port.clientHeight/2) + "px"
            port.style.left = (this.div.clientWidth * i - port.clientWidth/2) + "px"
            
            return port
        }
        
        for (var i = 0; i < 2; i++){ this.ports.push( createPort(i) ) }
        
                
        
    }
    
    addMovement() {
        let element = this.div;
        element.addEventListener("mousedown", () => {
            element.style.position = "absolute";
            SelectedElement = element;
            
            
            document.onmousemove = (e) => {
                
                let x = e.pageX;
                let y = e.pageY;
                
                let lockedCoords = this.placeToGrid(x , y);
                x = lockedCoords[0];
                y = lockedCoords[1];

                SelectedElement.style.left = (x-SelectedElement.clientWidth/2) + "px";
                SelectedElement.style.top = (y-SelectedElement.clientHeight/2) + "px";
            }   
            
            document.onmouseup = () => {
                document.onmousemove = (e) => {}
                SelectedElement = null;
                SetAllPortCoords()
                document.onmouseup = () => {}
            }
        
        })
    
        
    }

    addControls () {
        
        console.log("Adding controls...")
        
        var element = this.div;
        var wizard = document.getElementById("editor-wizard");

        // Add event listener to bring up controls on double-click
        element.addEventListener("dblclick", () => {
            console.log(`${element.id} selected...`)
            element.classList.toggle("selectedComponent")
            ToggleEditor(this, "on")
            this.selected = true;
        })

        document.addEventListener('click', (e) => {
            if (!( element.contains(e.target) || wizard.contains(e.target)) && this.selected ) {
                element.classList.toggle("selectedComponent")
                ToggleEditor(this, "off")
                this.selected = false
            }
        })
    }

    EnableMetricsMode(on) {
        
        let element = this.div
        
        const add_values = () => {
            document.getElementById("name_span").innerText = this.div.id
            document.getElementById("V_span").innerText = this.voltage
            document.getElementById("I_span").innerText = this.current
            document.getElementById("R_span").innerText = this.resistance
            document.getElementById("P_span").innerText = Math.round((this.voltage * this.current)*100) / 100
        }
        const remove_values = () => {
            document.getElementById("name_span").innerText = "  -  "
            document.getElementById("V_span").innerText = "  -  "
            document.getElementById("I_span").innerText = "  -  "
            document.getElementById("R_span").innerText = "  -  "
            document.getElementById("P_span").innerText = "  -  "
        }

        if (on) {
            element.onmousemove = add_values
            element.onmouseleave = remove_values

            if (this.current > 0 && this.type == "bulb") {
                this.setBulbBrightness()
            }

        } else {
            document.removeEventListener("mousemove", add_values)
            document.removeEventListener("mouseleave", add_values)
            if (this.type == "bulb") { this.div.removeChild(this.div.lastChild) }
        }
    }


    rotate() {
        this.div.classList.toggle("rotated")
        SetAllPortCoords()
    }

    placeToGrid(x, y) {
        let cellsize = 30;
        let NewCoords = []

        let coords = [x , y]
        coords.forEach(coord => {
            let up = Math.ceil(coord/cellsize)*cellsize;
            let down = Math.floor(coord/cellsize)*cellsize;
            NewCoords.push(( Math.abs(coord - up) < Math.abs(coord - down) ? up : down))
        });
    
        return NewCoords;
    }
    
    getPortCoords() {
        return this.portCoords
    }

    SetConnections() {
        console.log(`Setting Connections for ${this.div.id}...`)
        
        this.connections = {
            "t1": [],
            "t2": []
        }
        
        componentMap.forEach((comp, id) => {
            
            // If they are connected, and there are less than 2 connections already, and the component isn't already in the list
            // Then add the id and have the component eval its own connections

            if (this.div.id == id) { return }

            console.log(`Checking for connection with ${id}`)
            
            let connection = AreConnected(this.getPortCoords(), comp.getPortCoords())

            // console.log(connection)

            // console.log(connection && this.connections.length < 2 && !(this.connections.includes(id)))

            if ( connection && !(this.connections["t1"] || this.connections["t2"]) < 2 && !(this.connections["t1"].includes(id) || this.connections["t2"].includes(id))) 
            {
                console.log(`Connection with ${id} detected...`)
                
                let terminal = `t${connection}`
                this.connections[terminal].push(id)
                
                if (comp.connections["t1"].includes(this.div.id) || comp.connections["t2"].includes(this.div.id)) {}
                else { comp.SetConnections() }
            }
        })

    }
}

class Cell extends Component {
    constructor (type, load_data) {
        super(type, load_data);
        if (!this.emf) {this.emf = 10.0;}
        this.resistance = "  -  "
    }
}

class LoadComponent extends Component {
    constructor (type, load_data) {
        // console.log(load_data)
        super(type, load_data)
        this.voltage = 0.0;
        if (!this.resistance){
            this.resistance = 10.0;
        }
    }

    setBulbBrightness() {
        let glow = document.createElement("div")

        glow.style.position = "absolute"
        glow.style.height = glow.style.width = "50px"
        glow.style.top = "5px"
        glow.style.left = "35px"
        glow.classList.add("bulb-glow")

        let brightness = (this.current * this.voltage) * 0.8 / 5
        
        if (brightness > 0.8){ brightness = 0.8 }

        glow.style.opacity = `${brightness}`

        this.div.append(glow)
    }
}

const addComponent = (type, fromLoad) => {

    let component;

    if (type == "cell") {
        component = new Cell(type, fromLoad);
    } else if (type == "wire") {
        component = createWire(fromLoad)
    } else {
        component = new LoadComponent(type, fromLoad);
    }
    
    component.type = type
    componentMap.set(component.div.id, component);

    // console.log(componentMap);

}

const addComponentFromLoad = (componentObj) => {
    let component;
    let type = componentObj.type

    if (type == "cell") {
        component = new Cell(type, componentObj);
    } else if (type == "wire") {
        component = createWire(componentObj)
    } else {
        component = new LoadComponent(type, componentObj);
    }

    component.type = type
    componentMap.set(component.div.id, component)

}


const DeleteComponent = () => {
    componentMap.forEach(async (item, key) => {
        if (item.selected) {
            
            console.log(`Deleting Component ${item.div.id}...`)
            
            if (item.div.classList.contains("wire")) {
                await item.destroy()
            } else {
                await item.div.remove();
            }    

            componentMap.delete(key);

            componentMap.forEach((comp) => {
                comp.SetConnections()
            })
            
            ToggleEditor()

            console.log("Delete Procedure finished... ")
        }
    })
}

const RotateComponent = () => {
    componentMap.forEach((item) => {
        if (item.selected) {
            item.rotate();
        }
    })
}


const SetAllPortCoords = () => {
    console.log("Setting all Port Coords...")
    componentMap.forEach((item) => {
        if (!item.div.id.includes("wire")) item.setPortCoords()
    })
}


const createWire = (load_data) => {
    
    
    
    const createJoint = () => {
        let joint = document.createElement("div")
        joint.classList.add("joint")
        container.append(joint)
        return joint
    }
    
    const placeToGrid = (x, y) => {
        let cellsize = 30;
        let NewCoords = []
        
        let coords = [x , y]
        coords.forEach(coord => {
            let up = Math.ceil(coord/cellsize)*cellsize;
            let down = Math.floor(coord/cellsize)*cellsize;
            NewCoords.push(( Math.abs(coord - up) < Math.abs(coord - down) ? up : down))
        });
        
        return NewCoords;
    }
    
    const positionWireToLine = (X1, Y1, X2, Y2) => {
        const [x2,y2] = placeToGrid(X2, Y2)
        let x1 = X1
        let y1 = Y1
        
        let deltaX = Math.abs(x2-x1)
        let deltaY = Math.abs(y2-y1)
        
        var orientation;
        if (deltaX > deltaY) {
            orientation = "horizontal"
        } else {
            orientation = "vertical"
        } 
        
        // console.log(orientation)
        
        if (orientation == "horizontal") { //Horizontal
            return [x2, y1]
        } else { //Vertical
            return [x1, y2]
        }
        
    }
    
    const wireName = "wire" + ComponentCounters["wire"]++;

    if (load_data) {
        return new Wire(load_data, null, null, wireName)
    }
    
    var container = document.createElement("div")
    container.id = wireName + "-container"
    container.classList.add("wire-container")
    document.getElementById("component-container").append(container)
    
    let joints = [createJoint(), createJoint()]
    
    const thickness = 10
    var wire = new Wire(null, joints, thickness, wireName)
    
    
    wire.addToContainer()
    
    
    // Start Placement
    let overlay = document.getElementById("overlay")
    overlay.style.display = "block"
    
    var [joint1, joint2] = joints
    
    var x1, y1, x2, y2
    
    document.onmousemove = (e) => {
        [x1, y1] = placeToGrid(e.pageX, e.pageY)
        joint1.style.left = (x1-joint1.clientWidth/2) + "px";
        joint1.style.top = (y1-joint1.clientHeight/2) + "px";
    }

    document.onclick = (e) => {
        document.onmousemove = (e) => {
            [x2, y2] = positionWireToLine(x1, y1, e.pageX, e.pageY)
            joint2.style.left = (x2-joint1.clientWidth/2) + "px";
            joint2.style.top = (y2-joint1.clientHeight/2) + "px";
        }
        document.onclick = (e) => {
            
            if (x1 == x2 && y1 == y2) {
                return;
            }
            
            overlay.style.display = "none"
            document.onmousemove = () => {}
            document.onclick = () => {}

            wire.ports[0].style.display = "none"
            wire.ports[1].style.display = "none"

            // Figure out where to draw the div
            
            var length, top, left, orientation
            if (y1 == y2) {
                // wire is horizontal
                orientation = "horizontal"
                top = y1-thickness/2
                left = (x1 < x2 ? x1 : x2)
                length = Math.abs(x2-x1)
            } else {
                //wire is vertical
                orientation = "vertical"
                left = x1-thickness/2
                top = (y1 < y2 ? y1 : y2)
                length = Math.abs(y2-y1)
            }
            wire.portCoords = [
                [x1, y1],
                [x2, y2]
            ]
            wire.SetConnections()
            console.log(wire.portCoords)
            wire.Realise(left, top, length, orientation)
        }
    }

    return wire

}




class Wire {
    constructor(load_data, joints, thickness, name) {
        this.type = "wire";
        
        if (load_data) {
            this.setFromLoad(load_data, name)
            return
        }
        
        this.div = document.createElement("DIV")
        this.connections = [];
        this.thickness = thickness
        this.portCoords = []
        
        this.div.id = name;
        this.div.classList.add("component");
        this.div.classList.add("wire");

        this.ports = joints
    }
    
    setFromLoad(load_data, name) {
        console.log(name)
        console.log(load_data)
        this.connections = load_data.connections
        this.div = document.getElementById(name)
        this.portCoords = load_data.portCoords
        this.thickness = load_data.thickness
        this.ports = Array.from(document.getElementById(name + "-container").getElementsByClassName("joint"))
        this.selected = false
        this.addControls()
    }

    addToContainer() { document.getElementById(this.div.id + "-container").append(this.div) }
    
    Realise(left, top, length, orientation) {
        
        
        if (orientation == "horizontal") {
            this.div.style.width = length + this.thickness + "px";
            this.div.style.height = this.thickness + "px";
            this.div.style.left = left - this.thickness/2 + "px"
            this.div.style.top = top + "px"
        } else {
            this.div.style.width = this.thickness + "px";
            this.div.style.height = length + this.thickness + "px";
            this.div.style.left = left + "px"
            this.div.style.top = top - this.thickness/2 + "px"
        }
        
        

        this.addControls()
    }

    addControls () {
        
        console.log("Adding controls...")
        
        var element = this.div;
        var [joint1, joint2] = this.ports
        var wizard = document.getElementById("editor-wizard");

        // Add event listener to bring up controls on double-click
        
        element.addEventListener("dblclick", () => {
            console.log(`${element.id} selected...`)
            element.classList.add("selectedComponent")
            ToggleEditor(this, "on")
            this.selected = true;
        })

        document.addEventListener('click', (e) => {
            if (!( element.contains(e.target) || wizard.contains(e.target)) && this.selected ) {
                element.classList.remove("selectedComponent")
                ToggleEditor(this, "off")
                this.selected = false
            }
        })
        
    }

    destroy() {
        document.getElementById(this.div.id + "-container").remove()
        this.div.remove()
        this.ports[0].remove()
        this.ports[1].remove()
    }

    getPortCoords() {
        return this.portCoords
    }

    SetConnections() {
        console.log(`Setting Connections for ${this.div.id}...`)
        
        this.connections = {
            "t1": [],
            "t2": []
        }
        
        componentMap.forEach((comp, id) => {
            
            // If they are connected, and there are less than 2 connections already, and the component isn't already in the list
            // Then add the id and have the component eval its own connections

            if (this.div.id == id) { return }

            console.log(`Checking for connection with ${id}`)
            
            let connection = AreConnected(this.getPortCoords(), comp.getPortCoords())

            if ( connection && !(this.connections["t1"].includes(id) || this.connections["t2"].includes(id))) 
            {
                console.log(`Connection with ${id} detected...`)
                
                let terminal = `t${connection}`
                this.connections[terminal].push(id)
                
                if (comp.connections["t1"].includes(this.div.id) || comp.connections["t2"].includes(this.div.id)) {}
                else { comp.SetConnections() }
            }
        })

    }

}







