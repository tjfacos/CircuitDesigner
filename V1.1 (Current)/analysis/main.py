# Pyspice Documentation: https://pyspice.fabrice-salvaire.fr/releases/v1.5/overview.html

import sys

import PySpice
from PySpice.Spice.Netlist import Circuit 
from PySpice.Unit import *

from modules import construction, file


from TestScripts.demo import DemoData

if __name__ == "__main__":
    
    circuit_obj = construction.build(file.LoadFile())
    
    print("\n\n\t\tOutputing Build Circuit...\t\t\n\n")
    print(circuit_obj)

    circuit_obj.ConstructNetlist()
    circuit_obj.Simulate()

    print("\n\n\n\t\t\t\tOutputing Voltage Dictionary... \t\t\t\t\n\n\n")

    file.SaveResults(circuit_obj.Output())