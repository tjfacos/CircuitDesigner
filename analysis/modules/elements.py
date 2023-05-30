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
        self.voltage = 0.0
        
        self.ID = ID


    def __str__(self) -> str:
        out = f"{self.ID}: a {self.type} with properties: \n\t->connections: {self.connections}; "
        if self.type == "cell":
            out += f"\n\t->emf: {self.emf}; "
        # if self.type in ["resistor", "bulb"]:
        #     out += f"\n\t->resistance: {self.resistance};"

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


    def __str__(self) -> str:
        out = f"A circuit with {len(self.elements)} elements:"
        for ele in self.elements:
            out += f"\n -> {ele}"

        return out


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
                    print(f"Node reqired at {component.ID}: Connections with {component.connections[terminal]}")
                    n = new_node.ID
                    nodes.append(new_node)
                
                elements_to_change = component.connections[terminal]

                for ele in self.elements:
                    if ele.ID in elements_to_change:
                        for term in ele.connections:
                            ele.connections[term] = [e if e != component.ID else n for e in ele.connections[term] ]

                component.connections[terminal] = [n]

        print(self)

        for wire in wires:
            for terminal in wire.connections:

                if "node" in wire.connections[terminal][0]:
                    continue

                new_node = Node(
                    f"node{len(nodes)+1}",
                    [wire.ID, *wire.connections[terminal]]
                )

                if not (n := NodeAlreadyExists(new_node)):
                    print(f"Node reqired at {wire.ID}: Connections with {wire.connections[terminal]}")
                    n = new_node.ID
                    nodes.append(new_node)
                
                
                wire.connections[terminal] = [n]

        self.elements += nodes

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

            # print(ele)
            if type(ele) == Cell:
                self.spice_cir.V(ele.ID, ele.connections["t1"], ele.connections["t2"], ele.emf)
                continue

            self.spice_cir.R(ele.ID, ele.connections["t1"], ele.connections["t2"], ele.resistance)


        print("\n\n\n\t\t\t\t NETLIST \t\t\t\t\n\n\n")

        print(self.spice_cir)
    

    def Simulate(self):
                
        print("\n\n\n\t\t\t\t SIMULATING (GOOD LUCK)... \t\t\t\t\n\n\n")

        simulator = self.spice_cir.simulator(
            temperature=25,
            nominal_temperature=25
        )

        analysis = simulator.operating_point()

        for ele in [  ele for ele in self.elements if type(ele) in [Cell, Resistor, Bulb] ]:
            print(ele)
            v = []
            for terminal in ele.connections:
                v.append(float(analysis[ele.connections[terminal]]))

            print(v)

            ele.voltage = round(abs(v[0] - v[1]), 1)
            
            print(ele.voltage)
            

    def Output(self):
        voltages_dict = {}
        for ele in [  ele for ele in self.elements if type(ele) in [Cell, Resistor, Bulb] ]:
            voltages_dict[ele.ID] = ele.voltage

        return voltages_dict