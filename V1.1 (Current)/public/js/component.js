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

        // Set initial positions of the ports to be the centre of the div
        let port1 = [x+width/2, y+height/2]
        let port2 = [x+width/2, y+height/2]


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
    
    // Adds the component Icon to the HTML div
    addIcon() {
        let element = this.div;
        let img = document.createElement("img");
        // Component icons are stored in the assets/components directory
        // The program uses the type of the component to construct the file path to the relevant icon
        let svgURL = `../assets/components/${element.classList[1]}.svg`;
        // The image element is then given this path as a source, and is then added to the element on the screen
        img.src = svgURL;
        img.id = element.id + "-icon";
        img.alt = element.id;
        img.draggable = false;
        
        element.append(img)
    }
    // This is a convenience method, to call the addMovement and addControls methods, both of which
    // implement handlers on the HTML element
    addHandlers() {
        this.addMovement()
        this.addControls();
    }
    // This adds HTML ports to the element, which are used as reference points
    addPorts() {
        
        const createPort = (i) => {
            
            // Function to create a port. The parameter 'i' indicates wether it is drawn on the left or the right     
            let port = document.createElement("div")
            port.classList.add("joint")
            port.classList.add("port")
            this.div.append(port)
            
            port.style.position = "absolute"
            port.style.top = (this.div.clientHeight/2 - port.clientHeight/2) + "px"
            port.style.left = (this.div.clientWidth * i - port.clientWidth/2) + "px"
            
            return port
        }
        
        // Creates a port for i = 0 (left side) and i = 1 (right side)
        for (var i = 0; i < 2; i++){ this.ports.push( createPort(i) ) }
        
                
        
    }
    
    // This method adds event handers, that allow the user to drag the HTML element on the screen
    addMovement() {
        let element = this.div;
        // The div listens for the user clicking on it
        element.addEventListener("mousedown", () => {
            element.style.position = "absolute";
            // This element (for this object) is now the selectedElement
            SelectedElement = element;
            
            
            // As the mouse moves, the program gets the mouse position (x and y) on the page, locks them to the closest grid position, 
            // and then moves the SelectedElement so its centre is in that spot on the grid
            document.onmousemove = (e) => {
                
                let x = e.pageX;
                let y = e.pageY;
                
                let lockedCoords = this.placeToGrid(x , y);
                x = lockedCoords[0];
                y = lockedCoords[1];

                SelectedElement.style.left = (x-SelectedElement.clientWidth/2) + "px";
                SelectedElement.style.top = (y-SelectedElement.clientHeight/2) + "px";
            }   
            // When the user stops dragging, remove redundant event listeners (by setting them to empty functions), 
            //deselect the element, and then establish connections again
            document.onmouseup = () => {
                document.onmousemove = (e) => {}
                SelectedElement = null;
                SetAllPortCoords()
                document.onmouseup = () => {}
            }
        
        })
    
        
    }

    // This method opens the editor wizard, with the objects data, when the user double-clicks on the element
    addControls () {
        
        console.log("Adding controls...")
        
        var element = this.div;
        var wizard = document.getElementById("editor-wizard");

        // Add event listener to bring up controls on double-click
        element.addEventListener("dblclick", () => {
            console.log(`${element.id} selected...`)
            element.classList.toggle("selectedComponent")
            // Toggle the editor wizrd to on, and pass this object to it, so its values can be loaded into it
            ToggleEditor(this, "on")
            // This objet is now in the selected state
            this.selected = true;
        })

        // When the user clicks out of the element (anywhere other tha the editor wizard or element itself),
        // deselect element and hide the editor
        document.addEventListener('click', (e) => {
            if (!( element.contains(e.target) || wizard.contains(e.target)) && this.selected ) {
                element.classList.toggle("selectedComponent")
                ToggleEditor(this, "off")
                this.selected = false
            }
        })
    }

    // This method enables and disables metrics mode
    EnableMetricsMode(on) {
        
        let element = this.div
        
        const add_values = () => {
            // To add the values, set the revevant fileds in the metrics wizard to this elements values (name, voltage over, current through, etc.)
            document.getElementById("name_span").innerText = this.div.id
            document.getElementById("V_span").innerText = this.voltage
            document.getElementById("I_span").innerText = this.current
            document.getElementById("R_span").innerText = this.resistance
            document.getElementById("P_span").innerText = Math.round((this.voltage * this.current)*100) / 100
        }
        const remove_values = () => {
            // Return all value to their default state
            document.getElementById("name_span").innerText = "  -  "
            document.getElementById("V_span").innerText = "  -  "
            document.getElementById("I_span").innerText = "  -  "
            document.getElementById("R_span").innerText = "  -  "
            document.getElementById("P_span").innerText = "  -  "
        }

        if (on) {
            // If we are enabling metrics mode, the functions above are used as event listeners, called when the user mouses over or off the element
            element.onmousemove = add_values
            element.onmouseleave = remove_values

            // If the element is a bulb, and there is some current through the object, the bulb brightness method is called (defined under the LoadComponent class as a bulb is a type of load component, with a resistance)
            if (this.current > 0 && this.type == "bulb") {
                this.setBulbBrightness()
            }

        } else {
            // Removes the named event listeners to disable metric mode on the component object & HTML element
            document.removeEventListener("mousemove", add_values)
            document.removeEventListener("mouseleave", add_values)
            // Removes the glow from bulbs by removing the last declared child of the bulb div (the glow element)
            if (this.type == "bulb") { this.div.removeChild(this.div.lastChild) }
        }
    }

    // Rotates the element, by toggling the rotate class (which turns it by 90 degrees on the screen when enabled)
    rotate() {
        this.div.classList.toggle("rotated")
        SetAllPortCoords()
    }

    // Places x-y coordinates to the grid, by rounding them to the nearest 30 pixels (each square of the grid is 30 x 30 px)
    placeToGrid(x, y) {
        let cellsize = 30;
        let NewCoords = []

        let coords = [x , y]
        coords.forEach(coord => {
            // Round up and round down
            let up = Math.ceil(coord/cellsize)*cellsize;
            let down = Math.floor(coord/cellsize)*cellsize;
            // Add to the new coordinates whichever of the rounded up and down values is closest to the original value (using the absoluet differences of each)
            NewCoords.push(( Math.abs(coord - up) < Math.abs(coord - down) ? up : down))
        });
    
        return NewCoords;
    }
    
    getPortCoords() {
        return this.portCoords
    }

    // Sets the connections, representing the names of circuit elements on the screen this element is connected to
    SetConnections() {
        console.log(`Setting Connections for ${this.div.id}...`)
        
        // Conections are stored as a dictioary, with bth terminals having a list of connected elements
        this.connections = {
            "t1": [],
            "t2": []
        }
        
        // Check each comonent
        componentMap.forEach((comp, id) => {
            
            // Do nothing if you find your own object in the componentMap
            if (this.div.id == id) { return }
            
            console.log(`Checking for connection with ${id}`)
            
            // Calls the areConnected method, which returns which terminal, if any, the 2 components are connected to
            let connection = AreConnected(this.getPortCoords(), comp.getPortCoords())
            
            
            // If they are connected, and the component isn't already in the list
            // Then add the id aof the connected element to the list at that terminal, and have the component eval its own connections
            if ( connection && !(this.connections["t1"].includes(id) || this.connections["t2"].includes(id))) 
            {
                console.log(`Connection with ${id} detected...`)
                
                let terminal = `t${connection}`
                this.connections[terminal].push(id)
                
                // Only call the connected element to evaluate its connections if you aren't in its connections list
                if (comp.connections["t1"].includes(this.div.id) || comp.connections["t2"].includes(this.div.id)) {}
                else { comp.SetConnections() }
            }
        })

    }
}

// Cell class inherits all the functionality of the Component class, but also has an emf attribute
class Cell extends Component {
    constructor (type, load_data) {
        super(type, load_data);
        if (!this.emf) {this.emf = 10.0;}
        this.resistance = "  -  "
    }
}

// LoadComponent class (used for resistors and bulbs) inherits all the functionality of the Component class, but also has a resistance attribute
// It also has the setBulbBrightness method for bulbs
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
        // Add glow as a HTML element over the bulb
        let glow = document.createElement("div")

        glow.style.position = "absolute"
        glow.style.height = glow.style.width = "50px"
        glow.style.top = "5px"
        glow.style.left = "35px"
        glow.classList.add("bulb-glow")

        // Brightness is caluclated using the power over the component (P = VI), and is used to set the glow element's opacity
        // The maximum is 0.8, at 5 watts 
        let brightness = (this.current * this.voltage) * 0.8 / 5
        
        if (brightness > 0.8){ brightness = 0.8 }

        glow.style.opacity = `${brightness}`

        this.div.append(glow)
    }
}

// This is caled when users select a compoent from the toolbar
const addComponent = (type, fromLoad) => {

    let component;

    // Add a new component, using its type and any load data
    if (type == "cell") {
        component = new Cell(type, fromLoad);
    } else if (type == "wire") {
        component = createWire(fromLoad)
    } else {
        component = new LoadComponent(type, fromLoad);
    }
    
    component.type = type

    // Add to component map, using the object's HTML element's ID as its name
    componentMap.set(component.div.id, component);

}


// Load component after a file has been loaded
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

// Called when a user presses the delete button on the editor wizard, or presses the delete button
const DeleteComponent = () => {
    componentMap.forEach(async (item, key) => {
        // IF there is a selected item, remove it from the screen, and the component map

        if (item.selected) {
            
            console.log(`Deleting Component ${item.div.id}...`)
            
            if (item.div.classList.contains("wire")) {
                await item.destroy()
            } else {
                await item.div.remove();
            }    

            componentMap.delete(key);

            // Re-evaluate 
            componentMap.forEach((comp) => {
                comp.SetConnections()
            })
            
            ToggleEditor(null, "off")

        }
    })
}

// To rotate a component (using r or the rotate button), loop through to find the selected component, and call the rotate method on it
const RotateComponent = () => {
    componentMap.forEach((item) => {
        if (item.selected) {
            item.rotate();
        }
    })
}

// Call all items to evaluate their port cooridinate and connections
const SetAllPortCoords = () => {
    console.log("Setting all Port Coords...")
    componentMap.forEach((item) => {
        if (!item.div.id.includes("wire")) item.setPortCoords()
    })
}

// This method places and produces wires to be placed in the component map
const createWire = (load_data) => {
    
    // Function to create the joints (the blue dots shown at both ends of the wire when they are placed)
    const createJoint = () => {
        let joint = document.createElement("div")
        joint.classList.add("joint")
        container.append(joint)
        return joint
    }
    
    // This function places coordinate the grid, as seen in an above method
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
    
    // This method takes the coordinates of the 2 ends of a wire, and positions it to a horizontal or vertical grid line, 
    // to fix the port positions in either horizontal and vertical
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
        

        if (orientation == "horizontal") { //Horizontal
            return [x2, y1]
        } else { //Vertical
            return [x1, y2]
        }
        
    }
    
    const wireName = "wire" + ComponentCounters["wire"]++;

    // If this iwre is being loaded from a saved design, return a wire using that data as its initial state
    if (load_data) {
        return new Wire(load_data, null, null, wireName)
    }
    
    // A container is created, to contain the wire and joints intside the HTML DOM (Document Object Model), where the HTML elements exist
    var container = document.createElement("div")
    container.id = wireName + "-container"
    container.classList.add("wire-container")
    document.getElementById("component-container").append(container)
    
    // Create Joints
    let joints = [createJoint(), createJoint()]
    
    const thickness = 10
    
    // Initialise aninstance of the wire class
    var wire = new Wire(null, joints, thickness, wireName)
    
    
    wire.addToContainer()
    
    
    // Start Wire Placement

    // Show blue overlay
    let overlay = document.getElementById("overlay")
    overlay.style.display = "block"
    
    var [joint1, joint2] = joints
    
    var x1, y1, x2, y2
    
    // Event listeners are used so the joint racks the mouse on the screen (similar to standard components)
    document.onmousemove = (e) => {
        [x1, y1] = placeToGrid(e.pageX, e.pageY)
        joint1.style.left = (x1-joint1.clientWidth/2) + "px";
        joint1.style.top = (y1-joint1.clientHeight/2) + "px";
    }

    // When the user clicks first, place the first joint
    document.onclick = (e) => {
        document.onmousemove = (e) => {
            [x2, y2] = positionWireToLine(x1, y1, e.pageX, e.pageY)
            joint2.style.left = (x2-joint1.clientWidth/2) + "px";
            joint2.style.top = (y2-joint1.clientHeight/2) + "px";
        }

        // When the user clicks for the second time, in a different place, remove event listeners and draw the wire
        document.onclick = (e) => {
            
            if (x1 == x2 && y1 == y2) {
                return;
            }
            
            // Remove overlay and event listeners
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

            // Set connections and draw to screen, also adding event handlers
            wire.SetConnections()
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
    
    // Set wire state using loaded data, if present
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

    // Add wire to wire-container
    addToContainer() { document.getElementById(this.div.id + "-container").append(this.div) }
    
    // Draw wire to screen and then add controls
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

        // Add event listener to bring up controls on double-click, and hide them when the user clicks off
        
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

    // Remove the wires components from the component-container
    destroy() {
        document.getElementById(this.div.id + "-container").remove()
        this.div.remove()
        this.ports[0].remove()
        this.ports[1].remove()
    }

    getPortCoords() {
        return this.portCoords
    }

    // This method is identical to the one above
    // They share the same name, so all componnts can send messages (call eah others methods) using a common interface
    // This makes it possible for components of unrelated classes to interact
    
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