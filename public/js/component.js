var componentMap = new Map()

var ComponentCounters = {
    "resistor": 1,
    "bulb": 1,
    "cell": 1,
    "wire": 1
};

var SelectedElement = null;

class Component {
    constructor (type) {
        this.type = type;
        this.div = document.createElement("DIV")
        this.connections = []
        this.ports = []
        this.portCoords = []
        this.width = 0
        this.height = 0
        
        this.div.id = type + ComponentCounters[type]++;
        this.div.classList.add("component");
        this.div.classList.add(type);
        
        
        this.selected = false;
        this.placed = false;
        
        this.addIcon();
        
        this.addToCanvas();
        
        
    }
    
    setPortCoords() {
        var x = this.div.offsetLeft
        var y = this.div.offsetTop
        
        let width = this.width
        let height = this.height
        let centre = [x+width/2, y+height/2]

        // console.log(`Centre: ${centre}`)
        // console.log(`${this.div.id}: ${width} ${height}, [${x}, ${y}]`)
        
        let port1 = [x+width/2, y+height/2]
        let port2 = [x+width/2, y+height/2]

        if (this.div.classList.contains("rotated")) {
            // console.log("Vertical")
            port1[1] -= width/2
            port2[1] += width/2
        } else {
            // console.log("Horizontal")
            port1[0] -= width/2
            port2[0] += width/2
        }
        
        this.portCoords = [port1, port2]

        // console.log(this.portCoords)
        
        this.SetConnections()

    }

    addToCanvas() {
        let element = this.div
        document.getElementById("component-container").append(element);
        this.addPorts();
        var overlay = document.getElementById("overlay")
        
        // Start Placement
        overlay.style.display = "block"
        element.classList.add("isBeingAdded")
        document.onmousemove = (e) => {
            
            let x = e.pageX;
            let y = e.pageY;
            
            let lockedCoords = this.placeToGrid(x , y);
            x = lockedCoords[0];
            y = lockedCoords[1];
            
            element.style.left = (x-element.clientWidth/2) + "px";
            element.style.top = (y-element.clientHeight/2) + "px";
        }
        
        document.onmousedown = (e) => {
            // console.log("Called")
            if (!(document.getElementById("toolbar").contains(e.target))) {
                console.log("placed")
                overlay.style.display = "none";
                element.classList.remove("isBeingAdded")
                document.onmousemove = () => {}
                document.onmousedown = () => {};
                
                this.width = Math.round(this.div.offsetWidth / 10) * 10
                this.height = Math.round(this.div.offsetHeight / 10) * 10
                
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
    
    addHandlers(){
        // this.setPortCoords();
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
            // console.log(this.div.style.height/2 - port.clientHeight/2)
            // console.log(this.div.style.width * i)
            
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
            ToggleEditor(this)
            this.selected = true;
        })

        document.addEventListener('click', (e) => {
            if (!( element.contains(e.target) || wizard.contains(e.target)) && this.selected ) {
                element.classList.toggle("selectedComponent")
                ToggleEditor(this)
                this.selected = false
            }
        })
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
    
    SetConnections() {
        console.log("Settings Connections...")
        
        this.connections = []
        
        componentMap.forEach((comp, id) => {
            // If they are connected, and there are less than 2 connections already, and the component isn't already in the list
            // Then add the id and have the component eval its own connections
            if ( AreConnected(this, comp) && this.connections.length < 2 && !(this.connections.includes(id))) 
            {
                console.log(AreConnected(this, comp) && this.connections.length < 2 && !(this.connections.includes(id)))
                console.log(`Connection with ${id} detected...`)
                this.connections.push(id)
                if (!comp.connections.includes(this.div.id)) comp.SetConnections()
            }
        })

    }
}

class Cell extends Component {
    constructor (type) {
        super(type);
        this.emf = 10.0;
    }

    SetConnections() {
        console.log("Settings Cell Connections...")
        
        const GetTerminal = (comp) => {
            // This is called when we know the component is connected. We will check if its connected to the positive (left side)
            // Left side (+) is portA (first in the portCoords array)
            
            let anodeCoords = this.portCoords[0]
            
            let terminal = "-"
            
            comp.portCoords.forEach(port => {
                if (arrayEquals(anodeCoords, port))
                {
                    terminal = "+"
                }
            })
            
            console.log(`${comp.div.id} is connected to ${this.div.id} at the ${terminal} terminal... `)
            
            return terminal
            
        }
        
        
        
        this.connections = [null, null]
        // For a cell, the first element will be connected to anode (+), second to cathode (-)

        componentMap.forEach((comp, id) => {
            
            // If they are connected, and there are less than 2 connections already, and the component isn't already in the list
            // Then add the id and have the component eval its own connections
            if ( AreConnected(this, comp) && !(this.connections.includes(id))) 
            {
                // console.log(AreConnected(this, comp) && this.connections.length < 2 && !(this.connections.includes(id)))
                let terminal = GetTerminal(comp)
                
                if (terminal == "+" && !(this.connections[0])){
                    this.connections[0] = id
                } 
                
                if  (terminal == "-" && !(this.connections[1])) {
                    this.connections[1] = id
                }
                
                if (!comp.connections.includes(this.div.id)) comp.SetConnections()
            }
        })


    }
}

class LoadComponent extends Component {
    constructor (type) {
        super(type);
        this.resistance = 10.0;
        this.voltage = 0.0;
    }
}

// In future, an AC Source and logic for AC may be included. But not for now ...

const addComponent = (type) => {

    let component;
    if (type == "cell") {
        component = new Cell(type);
    } else if (type == "wire") {
        component = createWire()
        // component.Realise(window.innerWidth + 100, window.innerHeight + 100)
        
    } else {
        component = new LoadComponent(type);
    }
    
    component.type = type
    componentMap.set(component.div.id, component);

    console.log(componentMap);

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
        // console.log(item.div.id)
        if (!item.div.id.includes("wire")) item.setPortCoords()
    })
}




// Wire Stuff












const createWire = () => {
    
    const wireName = "wire" + ComponentCounters["wire"]++;
    
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

    var container = document.createElement("div")
    container.id = wireName + "-container"
    container.classList.add("wire-container")
    document.getElementById("component-container").append(container)
    
    let joints = [createJoint(), createJoint()]
    
    const thickness = 10
    var wire = new Wire(joints, thickness, wireName)

    
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
    constructor(joints, thickness, name) {
        this.type = "wire";
        this.div = document.createElement("DIV")
        this.connections = [];
        this.thickness = thickness
        this.portCoords = []
        
        this.div.id = name;
        this.div.classList.add("component");
        this.div.classList.add("wire");

        this.ports = joints
    }
    
    addToContainer() { document.getElementById(this.div.id + "-container").append(this.div) }
    
    Realise(left, top, length, orientation) {
        
        
        if (orientation == "horizontal") {
            this.div.style.width = length + "px";
            this.div.style.height = this.thickness + "px";
        } else {
            this.div.style.width = this.thickness + "px";
            this.div.style.height = length + "px";
        }
        
        
        this.div.style.left = left + "px"
        this.div.style.top = top + "px"

        this.addControls()
    }

    addControls () {
        
        console.log("Adding controls...")
        
        var element = this.div;
        var [joint1, joint2] = this.ports
        var wizard = document.getElementById("editor-wizard");

        // Add event listener to bring up controls on double-click
        const clickHandler = () => {
            console.log(`${element.id} selected...`)
            element.classList.toggle("selectedComponent")
            joint1.classList.toggle("selectedComponent")
            joint2.classList.toggle("selectedComponent")
            ToggleEditor(this)
            this.selected = true;
        }
        
        element.addEventListener("dblclick", clickHandler)
        joint1.addEventListener("dblclick", clickHandler)
        joint2.addEventListener("dblclick", clickHandler)

        document.addEventListener('click', (e) => {
            if (!( element.contains(e.target) || wizard.contains(e.target)) && this.selected ) {
                element.classList.toggle("selectedComponent")
                joint1.classList.toggle("selectedComponent")
                joint2.classList.toggle("selectedComponent")
                ToggleEditor(this)
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

    SetConnections() {
        console.log("Settings Connections...")
        
        this.connections = []
        
        componentMap.forEach((comp, id) => {
            // If they are connected, and there are less than 2 connections already, and the component isn't already in the list
            // Then add the id and have the component eval its own connections
            if ( AreConnected(this, comp) && !(this.connections.includes(id))) 
            {
                // console.log(AreConnected(this, comp) && this.connections.length < 2 && !(this.connections.includes(id)))
                console.log(`Connection with ${id} detected...`)
                this.connections.push(id)
                if (!comp.connections.includes(this.div.id)) comp.SetConnections()
            }
        })
    }

}







