# This modules defines the classes representing each component, as well as nodes

# By the time the circuit reaches this stage, we must assume it is valid (checks should by in Front)
    # Each components (not wire) should have 1 link at each terminal, no more or less
    # Each wire can have between 1 - 3 links at each terminal

# Import dependencies
import PySpice
from PySpice.Unit import *
from PySpice.Spice.Netlist import Circuit 

# This is the base Element class, defining common functionality for the classes of all circuit elements 
class Element:
    # This method constructs the object, giving it an ID and connections
    def __init__(self, ID : str, connections : dict[str, str]) -> None:
        self.type = type(self).__name__.lower()
        self.connections = connections
        
        self.voltage = 0.0
        self.current = 0.0
        
        self.ID = ID


    # Method to print element as a string (used for debugging)
    def __str__(self) -> str:
        out = f"{self.ID}: a {self.type} with properties: \n\t->connections: {self.connections}; "
        if self.type == "cell":
            out += f"\n\t->emf: {self.emf}; "

        return out


# These classes are for all possible circuit elements and all inherit from the base Element class, while defining additional attributes

class Cell(Element):
    
    def __init__(self, ID : str, connections: tuple[str], emf) -> None:
        super().__init__(ID, connections)
        self.emf = emf@u_V #type: ignore

class Resistor(Element):
    
    def __init__(self, ID : str, connections: tuple[str], resistance):
        super().__init__(ID, connections)
        self.resistance = resistance@u_Ω #type: ignore # These units are defined by PySpice

class Bulb(Element):
    
    def __init__(self, ID : str, connections: tuple[str], resistance):
        super().__init__(ID, connections)
        self.resistance = resistance@u_Ω #type: ignore

class Node(Element):
    pass

class Wire(Element):

    def __init__(self, ID : str, connections: tuple[str]):
        super().__init__(ID, connections)
        self.resistance = 0@u_Ω #type: ignore


# The CircuitModel class represents the whole circuit, and is composed of instances of the other classes

class CircuitModel:
    def __init__(self) -> None:
        self.spice_cir = Circuit("UserCircuit") # PySpice circuit, where the netlist is constructed, and which Ngspice analyses
        self.elements: list[Element] = []

    def AddCell(self, ID, connections, emf):
        self.elements.append(
            Cell( ID, connections, emf)
        )

    def AddResistor(self, ID, connections, resistance):
        self.elements.append(
            Resistor(ID, connections, resistance)
        )

    def AddBulb(self, ID, connections, resistance):
        self.elements.append(
            Bulb(ID, connections, resistance)
        )

    def AddWire(self, ID, connections):
        self.elements.append(
            Wire(ID, connections)
        )


    def __str__(self) -> str:
        out = f"A circuit with {len(self.elements)} elements:"
        for ele in self.elements:
            out += f"\n -> {ele}"

        return out

    # This algorithm defines the nodes required in the circuit
        # First, all the wires and components are collected into lists
        # A function, NodeAlreadyExists, is used to ensure no identical nodes are ever created
        # For every component, its terminals are defined as nodes first
        # The same process then occurs for connections between wires
        # Throughout this, every time a new node is made, the connections of the elements its connected to are updated to show the node, so by the end all elements are connected solely to 2 nodes, not to each other


    def IdentifyNodes(self):

        wires: list[Wire] = [  ele for ele in self.elements if ele.type == "wire" ]
        components: list[Element] = [  ele for ele in self.elements if ele.type != "wire" ]
        nodes: list[Node] = []

        def NodeAlreadyExists(new_node : Node):
            """If an identical node is already exists, returns its ID. Otherwise, returns None"""
            for n in nodes:
                if set(n.connections) == set(new_node.connections):
                    return n.ID
                
            return None

        for component in components:

            for terminal in component.connections:
                new_node = Node(
                    f"node{len(nodes)+1}",
                    [component.ID, *component.connections[terminal]]
                )

                if not (n := NodeAlreadyExists(new_node)):
                    print(f"Node required at {component.ID}: Connections with {component.connections[terminal]}")
                    n = new_node.ID
                    nodes.append(new_node)
                
                elements_to_change = component.connections[terminal]

                # Search through each element in the circuit. If its in the list of elements which must be updated (now connected to a new node, and not directly to another element),
                # search its connections, replacing the connection with the node when the connection is with the current component being dealt with
                for ele in self.elements:
                    if ele.ID in elements_to_change:
                        for term in ele.connections:
                            ele.connections[term] = [e if e != component.ID else n for e in ele.connections[term] ]

                component.connections[terminal] = [n]

        print(self)

        # Same process, but for wires

        for wire in wires:
            for terminal in wire.connections:

                if "node" in wire.connections[terminal][0]:
                    continue

                new_node = Node(
                    f"node{len(nodes)+1}",
                    [wire.ID, *wire.connections[terminal]]
                )

                if not (n := NodeAlreadyExists(new_node)):
                    print(f"Node required at {wire.ID}: Connections with {wire.connections[terminal]}")
                    n = new_node.ID
                    nodes.append(new_node)
                
                
                wire.connections[terminal] = [n]

        self.elements += nodes

    # Constructs the SPICE Netlist (text description of the circuit Ngspice can interpret) in the spice_cir attribute
    # For cells, a voltage source is added, otherwise a resistor is added
    # Wires are modelled as 0 ohm resistors, so they can be added directly to the netlist (saving the need for more complex refinement algorithms)
    def ConstructNetlist(self): 
        
        print("\n\n\t\tStarting Netlist Construction...\t\t\n\n")

        self.IdentifyNodes()
    
        
        for ele in self.elements:
            if type(ele) == Node:
                continue

            for terminal in ele.connections:
                ele.connections[terminal] = ele.connections[terminal][0]

        

        print("\n\n\n\t\t\t\t AFTER ADDING NODES \t\t\t\t\n\n\n")
              
        print(self)

        print("\n\n\n\t\t\t\t CONSTRUCTING NETLIST \t\t\t\t\n\n\n")

        # Every non-node element must be added to the netlist

        for ele in self.elements:
            if type(ele) == Node:
                continue

            if type(ele) == Cell:
                self.spice_cir.V(ele.ID, ele.connections["t1"], ele.connections["t2"], ele.emf)
                continue

            
            self.spice_cir.R(ele.ID, ele.connections["t1"], ele.connections["t2"], ele.resistance)
            self.spice_cir[f"R{ele.ID}"].plus.add_current_probe(self.spice_cir)


        print("\n\n\n\t\t\t\t NETLIST \t\t\t\t\n\n\n")

        print(self.spice_cir)
    


    def Simulate(self):
                
        print("\n\n\n\t\t\t\t SIMULATING... \t\t\t\t\n\n\n")

        simulator = self.spice_cir.simulator( temperature=25, nominal_temperature=25 )

        # Perform operating point analysis (standard DC analysis, where the values don't change over time)
        analysis = simulator.operating_point()

        currents = {}

        # The current at each node (including through components) is added to the currents dictionary
        for node in analysis.branches.values():
            currents[str(node)] = round(abs(float(node)) , 1)

        for ele in [  ele for ele in self.elements if type(ele) in [Cell, Resistor, Bulb] ]:
            # Take the voltage at the nodes each component is connected to
            v = []
            for terminal in ele.connections:
                v.append(float(analysis[ele.connections[terminal]]))

            # Take the absolute (positive) difference between them, rounding to 1 decimal place for accuracy
            ele.voltage = round(abs(v[0] - v[1]), 1)
            
            #Find the current in the currents dictionary for this component, and add it as an attribute of the component object
            for entry in currents:
                if ele.ID in entry:
                    ele.current = currents[entry]


            print(ele.ID)
            print(ele.voltage)
            print(ele.current)

    # This method encodes the results in a dictionary, and returns it to be stored in the results.json temporary file
    def Output(self):
        
        results_dict = {}
        for ele in [  ele for ele in self.elements if type(ele) in [Cell, Resistor, Bulb] ]:
            results_dict[ele.ID] = [ele.voltage, ele.current]

        return results_dict