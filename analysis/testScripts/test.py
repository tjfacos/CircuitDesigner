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

if __name__ == "__main__":
    VoltageDivider()