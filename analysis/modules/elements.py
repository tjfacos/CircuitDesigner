# This modules defines the classes representing each component, as well as nodes

# By the time the circuit reaches this stage, we must assume it is valid (checks should by in Front)
    # Each components (not wire) should have 1 link at each terminal, no more or less
    # Each wire can have between 1 - 3 links at each terminal

import PySpice
from PySpice.Unit import *
from PySpice.Spice.Netlist import Circuit 

class Element:
    def __init__(self, ID : str, connections : tuple[str]) -> None:
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
    pass


class CircuitModel:
    def __init__(self) -> None:
        self.spice_cir = Circuit("UserCircuit")
        self.elements = []

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


    # I've done a think, and I believe that for a wire with only 2 connections, I can model it as a resistor with 0 resistance


    def ConstructNetlist(self): 
        
        print("\n\n\t\tStarting Netlist Construction...\t\t\n\n")
        
        circuit_list = self.elements

        cells: list[Cell] = [ ele for ele in circuit_list if ele.type == "cell" ]
        resistors: list[Resistor] = [ ele for ele in circuit_list if ele.type == "resistor" ]
        wires: list[Wire] = [  ele for ele in circuit_list if ele.type == "wire" ]
        bulbs: list[Bulb] = [  ele for ele in circuit_list if ele.type == "bulb" ]
        nodes: list[Node] = []

        nodes = []

        def NodeAlreadyExists(new_node : Node):
            """Returns True if an identical node is already in the list"""
            for n in nodes:
                if set(n.connections) == set(new_node.connections):
                    return True
                
            return False

        for wire in wires:
            for terminal in wire.connections:
                if len(wire.connections[terminal]) > 1: # If there are 2 or 3 connections at 1 terminal, a node is required
                    new_node = Node(
                        f"node{len(nodes)+1}",
                        (wire.ID, *wire.connections[terminal])
                    )

                    if not NodeAlreadyExists(new_node):
                        print(f"Node reqired at {wire.ID}: Connections with {wire.connections}")
                        nodes.append(new_node)
        
        print("\n")
        [print(node) for node in nodes]

        
                
        self.elements = circuit_list
