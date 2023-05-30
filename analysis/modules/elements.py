# This modules defines the classes representing each component, as well as nodes

# By the time the circuit reaches this stage, we must assume it is valid (checks should by in Front)
    # Each components (not wire) should have 1 link at each terminal, no more or less
    # Each wire can have between 1 - 3 links at each terminal

import PySpice
from PySpice.Unit import *
from PySpice.Spice.Netlist import Circuit 

class Element:
    def __init__(self, ID : str, connections : dict[str, str]) -> None:
        self.type = type(self).__name__.lower()
        self.connections = connections
        
        self.ID = ID


    def __str__(self) -> str:
        out = f"{self.ID}: a {self.type} with properties: \n\t->connections: {self.connections}; "
        if self.type == "cell":
            out += f"\n\t->emf: {self.emf}; "
        if self.type == "loadcomponent":
            out += f"\n\t->resistance: {self.resistance};"

        return out


class Cell(Element):
    
    def __init__(self, ID : str, connections: tuple[str], emf) -> None:
        super().__init__(ID, connections)
        self.emf = emf@u_V #type: ignore

class Resistor(Element):
    
    def __init__(self, ID : str, connections: tuple[str], resistance):
        super().__init__(ID, connections)
        self.resistance = resistance@u_Ω #type: ignore

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


class CircuitModel:
    def __init__(self) -> None:
        self.spice_cir = Circuit("UserCircuit")
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

    def Simulate(self):
        simulator = self.spice_cir.simulator(
            temperature=25,
            nominal_temperature=25
        )

        analysis = simulator.operating_point()

        # Probably need to process analysis (dictionary?) before return, as data
        
        # Placeholder
        data = analysis

        return data

    def __str__(self) -> str:
        out = f"A circuit with {len(self.elements)} elements:"
        for ele in self.elements:
            out += f"\n -> {ele}"

        return out


    def Refine(self):
        """This method refines the circuit, by removing unnecessary wires."""
        
        # All wires that aren't connecting 2 nodes together are redundant, and should be replaced

        redundant: Element = None

        wires: list[Wire] = [  ele for ele in self.elements if ele.type == "wire" ]

        for wire in wires:
            
            connected_elements = [wire.connections["t1"], wire.connections["t2"]]

            # If the element connects 2 nodes, do nothing
            if "node" in connected_elements[0] and "node" in connected_elements[1]:
                continue

            redundant = wire
            
            break

        if not redundant:
            return True
        
        print(f"{redundant.ID} is redundant")
        print(f"Connections: {connected_elements}")

        # Identify the 2 connections, and replace
        # At this point, wires can either be connecting 2 nodes, a node and a wire, or 2 wires
        # redundant is a wire object, connecting to a wire and a node, or another wire
        
        found = 0

        for i in range(len(self.elements)):

            if found == 2:
                break

            if self.elements[i].ID in connected_elements:
                
                found += 1
                print(f"Setting Connections for {self.elements[i].ID}, {self.elements[i].connections}")
                
                # Replace value in dictionary or tuple
                if type(self.elements[i].connections) == dict: # Connected element is a wire
                                            
                    for k in self.elements[i].connections:
                        
                        v = self.elements[i].connections[k]
                        
                        if v == redundant.ID:
                            self.elements[i].connections[k] = [e for e in connected_elements if e != self.elements[i].ID][0]
                            print(self.elements[i].connections)
                
                else: # Connected element is a node
                    
                    for x in range(len(self.elements[i].connections)):
                        

                        if self.elements[i].connections[x] == redundant.ID:
                            
                            self.elements[i].connections[x] = [e for e in connected_elements if e != [self.elements[i].ID]][0]
                            
                            print(self.elements[i].connections)

        self.elements.remove(redundant)

        return self.Refine()

    # I've done a think, and I believe that for a wire with only 2 connections, I can model it as a resistor with 0 resistance
    def ConstructNetlist(self): 
        
        print("\n\n\t\tStarting Netlist Construction...\t\t\n\n")

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
            # Each component needs 2 nodes, one for eeach terminal
            for terminal in component.connections:
                new_node = Node(
                    f"node{len(nodes)+1}",
                    [component.ID, *component.connections[terminal]]
                )

                if not (n := NodeAlreadyExists(new_node)):
                    print(f"Node reqired at {component.ID}: Connections with {component.connections[terminal]}")
                    n = new_node.ID
                    nodes.append(new_node)
                
                elements_to_change = component.connections[terminal]

                for ele in self.elements:
                    if ele.ID in elements_to_change:
                        for term in ele.connections:
                            ele.connections[term] = [e if e != component.ID else n for e in ele.connections[term] ]

                component.connections[terminal] = [n]
                                                      
        for wire in wires:
            for terminal in wire.connections:
                if len(wire.connections[terminal]) > 1: # If there are 2 or 3 connections at 1 terminal, a node is required
                    new_node = Node(
                        f"node{len(nodes)+1}",
                        [wire.ID, *wire.connections[terminal]]
                    )

                    if not (n := NodeAlreadyExists(new_node)):
                        print(f"Node reqired at {wire.ID}: Connections with {wire.connections[terminal]}")
                        n = new_node.ID
                        nodes.append(new_node)
                    
                    
                    wire.connections[terminal] = [n]
        
        
        for ele in self.elements:
            if type(ele) == Node:
                continue

            for terminal in ele.connections:
                # print(ele.connections[terminal])
                ele.connections[terminal] = ele.connections[terminal][0]
                # print(ele.connections[terminal])


        self.elements += nodes
        self.Refine()
        # Let's hope this is working correctly

        print("\n\n\n\t\t\t\t AFTER ADDING NODES + REFINEMENT \t\t\t\t\n\n\n")
              
        print(self)

        print("\n\n\n\t\t\t\t CONSTRUCTING NETLIST \t\t\t\t\n\n\n")

        # Every non-node element must be added to the netlist

