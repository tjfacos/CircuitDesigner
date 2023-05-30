import numpy as np
import sys

import PySpice
from PySpice.Spice.Netlist import Circuit 
from PySpice.Unit import *
import PySpice.Logging.Logging as Logging

logger = Logging.setup_logging(logging_level=Logging.logging.ERROR)


def VoltageDivider() -> None:
    print("Running...")
    circuit = Circuit("Voltage Divider")

    circuit.V('input', 'in', circuit.gnd, 10@u_V) #type: ignore
    circuit.R(1, 'in', 'out', 9@u_kΩ) #type: ignore
    circuit.R(2, 'out', circuit.gnd, 1@u_kΩ) #type: ignore

    simulator = circuit.simulator(
        temperature=25,
        nominal_temperature=25
    )

    analysis = simulator.operating_point()
    for node in (analysis['in'], analysis.out): # .in is invalid !
        print('Node {}: {} V'.format(str(node), float(node)))

def Test():
    print("Running Test...")
    circuit = Circuit("Test")

    # circuit.V('input', 'in', circuit.gnd, 10@u_V) #type: ignore
    # circuit.R(1, 'in', 'out', 9@u_kΩ) #type: ignore
    # circuit.R(2, 'out', circuit.gnd, 1@u_kΩ) #type: ignore

    circuit.V("input", "n1", "n6", 10@u_V) # type: ignore
    circuit.R("w1", "n1", "n2", 0@u_Ω) # type: ignore
    circuit.R("w2", "n2", "n3", 0@u_Ω) # type: ignore
    circuit.R("w3", "n5", "n4", 0@u_Ω) # type: ignore
    circuit.R("w4", "n6", "n5", 0@u_Ω) # type: ignore
    circuit.R(1, "n2", "n5", 5@u_Ω) # type: ignore
    circuit.R(2, "n3", "n4", 5@u_Ω) # type: ignore

    print(circuit)

    simulator = circuit.simulator(
        temperature=25,
        nominal_temperature=25
    )

    analysis = simulator.operating_point()
    print(round(float(analysis["n1"]), 2))
    print(round(float(analysis["n2"]), 2))
    print(round(float(analysis["n3"]), 2))
    print(round(float(analysis["n4"]), 2))
    print(round(float(analysis["n5"]), 2))
    print(round(float(analysis["n6"]), 2))
    
    # OK, new plan
        # Leave all wires, model as 0 ohm resistors
        # Nodes at every junctions between 2 wires, or 2 components, an addition to the current nodes
        # EVERY COMPONENT MUST ONLY LINK TO NODES
        # At the end, find the difference between the node voltages for the 2 nodes each component should be connected to to find the potential


if __name__ == "__main__":
    Test()