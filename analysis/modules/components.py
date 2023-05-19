# This modules defines the classes representing each component, as well as nodes

# Pretty sure I'll need to dip into a bit of graph theory to make this work

# By the time the circuit reaches this stage, we must assume it is valid (checks should by in Front)

# Idea is...
    # 1) Represent all the components (and wires) as objects, in a list or set or summin
    # 2) Write an algorithm that searches for node placements, and creates nodes to connect the components
        # a) Any wire or component with more than 2 connections will need a node
        # b) Search methods should track where it has gone (graph theory should help) 
        # c) Perhaps it may be worth creating the nodes first, then connects them up 
    # 3) Create Netlist using objects 
    # 3) Profit (basically) 

import PySpice
from PySpice.Unit import *
from PySpice.Spice.Netlist import Circuit 

class Element:
    inst_counter = 0
    name = ""

    def GenerateID(self) -> str:
        type(self).inst_counter += 1
        ID = type(self).name + str(type(self).inst_counter)

        return ID
    
    def __init__(self, connections : tuple[str]) -> None:
        self.type = type(self).__name__.lower()
        if not type(self).name: type(self).name = self.type
        self.connections = connections
        self.ID = self.GenerateID()


    def __str__(self) -> str:
        out = f"{self.ID}: a {self.type} with properties: connections: {self.connections}; "
        if self.type == "cell":
            out += f"emf: {self.emf}; "
        if self.type == "loadcomponent":
            out += f"resistance: {self.resistance};"

        return out


class Cell(Element):
    
    def __init__(self, connections: tuple[str], emf) -> None:
        super().__init__(connections)
        self.emf = emf@u_V #type: ignore

class Resistor(Element):
    
    def __init__(self, connections: tuple[str], resistance):
        super().__init__(connections)
        self.resistance = resistance@u_Ω #type: ignore

class Bulb(Resistor):
    pass

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

    def NodalAnalysis():
        pass


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
            out += f"\n - {ele}"

        return out



if __name__ == "__main__":
    nodes = [Node(()) for _ in range(3)]
    for node in nodes:
        print(node.ID)
        print(node.type)

    
    nodes = [Cell((), 1) for _ in range(3)]
    for node in nodes:
        print(node.ID)
        print(node.type)