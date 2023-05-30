var componentMap = new Map()

var ComponentCounters = {
    "resistor": 1,
    "bulb": 1,
    "cell": 1,
    "wire": 1
};

var SelectedElement = null;

class Component {
    constructor (type, load_data) {
        
        this.type = type;
        this.div = document.createElement("DIV")
        this.connections = []
        this.ports = []
        this.portCoords = []
        this.width = 0
        this.height = 0
        this.voltage = 0
        this.current = 0

        this.div.id = type + ComponentCounters[type]++;
        this.div.classList.add("component");
        this.div.classList.add(type);
        
        
        this.selected = false;
        this.placed = false;
        
        if (!load_data) {
            this.addIcon();
            
            this.addToCanvas();
        } else {
            this.setFromLoad(load_data);
        }
        
    }
    
    setFromLoad(load_data) {
        console.log(load_data)

        this.connections = load_data.connections
        this.height = load_data.height
        this.width = load_data.width
        this.portCoords = load_data.portCoords
        this.div = document.getElementById(load_data.id)
        this.ports = Array.from(document.getElementById(load_data.id).getElementsByClassName("port"))

        if (load_data.type == "cell") {
            this.emf = load_data.emf
        } else {
            this.resistance = load_data.resistance
        }

        this.addHandlers()


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
            document.getElementById("V_span").innerText = this.voltage
            document.getElementById("I_span").innerText = this.current
        }
        const remove_values = () => {
            document.getElementById("V_span").innerText = "-"
            document.getElementById("I_span").innerText = "-"
        }

        if (on) {
            element.onmousemove = add_values
            element.onmouseleave = remove_values
        } else {
            document.removeEventListener("mousemove", add_values)
            document.removeEventListener("mouseleave", add_values)
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
}

// In future, an AC Source and logic for AC may be included. But not for now ...

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
        // console.log(item.div.id)
        if (!item.div.id.includes("wire")) item.setPortCoords()
    })
}




// Wire Stuff












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







