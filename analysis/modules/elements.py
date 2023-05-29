# This modules defines the classes representing each component, as well as nodes

# By the time the circuit reaches this stage, we must assume it is valid (checks should by in Front)


import PySpice
from PySpice.Unit import *
from PySpice.Spice.Netlist import Circuit 

class Element:
    inst_counter = 0
    name = ""

    def __init__(self, connections : tuple[str]) -> None:
        self.type = type(self).__name__.lower()
        if not type(self).name: type(self).name = self.type
        self.connections = connections
        
        type(self).inst_counter += 1
        self.ID = self.type + str(type(self).inst_counter)


    def __str__(self) -> str:
        out = f"{self.ID}: a {self.type} with properties: \n\t->connections: {self.connections}; "
        if self.type == "cell":
            out += f"\n\t->emf: {self.emf}; "
        if self.type == "loadcomponent":
            out += f"\n\t->resistance: {self.resistance};"

        return out


class Cell(Element):
    
    def __init__(self, connections: tuple[str], emf) -> None:
        super().__init__(connections)
        self.emf = emf@u_V #type: ignore

class Resistor(Element):
    
    def __init__(self, connections: tuple[str], resistance):
        super().__init__(connections)
        self.resistance = resistance@u_Ω #type: ignore

class Bulb(Element):
    
    def __init__(self, connections: tuple[str], resistance):
        super().__init__(connections)
        self.resistance = resistance@u_Ω #type: ignore

class Node(Element):
    pass

class Wire(Element):
    pass


class CircuitModel:
    def __init__(self) -> None:
        self.spice_cir = Circuit("UserCircuit")
        self.elements = []

    def AddCell(self, connections, emf):
        self.elements.append(
            Cell(connections, emf)
        )

    def AddResistor(self, connections, resistance):
        self.elements.append(
            Resistor(connections, resistance)
        )

    def AddBulb(self, connections, resistance):
        self.elements.append(
            Bulb(connections, resistance)
        )

    def AddWire(self, connections):
        self.elements.append(
            Wire(connections)
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
        circuit_list = self.elements
        print(circuit_list)
        

        cells = [ ele for ele in circuit_list if ele.type == "cell" ]
        resistors = [ ele for ele in circuit_list if ele.type == "resistor" ]
        wires = [  ele for ele in circuit_list if ele.type == "wire" ]
        bulbs = [  ele for ele in circuit_list if ele.type == "bulb" ]
        nodes = []

        for wire in wires:
            print(wire)


        for wire in wires:
            if len(wire.connections) > 2: # Node required
                print(f"Node reqired at {wire.ID}")
                nodes.append(
                    Node(
                        wire.connections
                    )
                )

                # removed_id = wire.ID
                # node_id = nodes[-1].ID
                

        print()
        print()
        
        for ele in [*wires, *nodes]:
            print(ele)

        print()
        print()

        circuit_list += nodes

        for ele in circuit_list:
            print(ele)
        
        
        
        self.elements = circuit_list

















































if __name__ == "__main__":
    nodes = [Node(()) for _ in range(3)]
    for node in nodes:
        print(node.ID)
        print(node.type)

    
    nodes = [Cell((), 1) for _ in range(3)]
    for node in nodes:
        print(node.ID)
        print(node.type)