# PySpice Documentation: https://pyspice.fabrice-salvaire.fr/releases/v1.5/overview.html

import sys

import PySpice
from PySpice.Spice.Netlist import Circuit 
from PySpice.Unit import *

from modules import construction, file

if __name__ == "__main__":

    # This file manages the activities of the ALM
    # As an abstract process, the circuit.json file is loaded (and deleted), parsed, and used to construct the circuit_obj, an object of class CircuitModel
    # THis is then called to construct the SPICE Netlist, simulate the circuit using PySpice, and then use the output to write the new temporary file, results.json

    # NOTE: as I feel it may be unclear, JSON is a notation to store data in the format of a JavaScript object, containing keys and values

    circuit_obj = construction.build(file.LoadFile())
    
    print("\n\n\t\tOutputting Build Circuit...\t\t\n\n")
    print(circuit_obj)

    circuit_obj.ConstructNetlist()
    circuit_obj.Simulate()

    print("\n\n\n\t\t\t\tOutputting Voltage Dictionary... \t\t\t\t\n\n\n")

    file.SaveResults(circuit_obj.Output())