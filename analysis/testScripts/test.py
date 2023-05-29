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
    print("Running Simple Loop...")
    circuit = Circuit("Simple Loop")

    # circuit.V('input', 'in', circuit.gnd, 10@u_V) #type: ignore
    # circuit.R(1, 'in', 'out', 9@u_kΩ) #type: ignore
    # circuit.R(2, 'out', circuit.gnd, 1@u_kΩ) #type: ignore

    circuit.V("input", "n1", "n2", 10@u_V) # type: ignore
    circuit.R(1, "n1", "n2", 1@u_kΩ) # type: ignore
    circuit.R(2, "n1", "n2", 3@u_kΩ) # type: ignore

    print(circuit)

    # exit()

    simulator = circuit.simulator(
        temperature=25,
        nominal_temperature=25
    )

    analysis = simulator.operating_point()
    print(float(analysis["n0"]))
    print(float(analysis["n1"]))

if __name__ == "__main__":
    Test()