# Pyspice Documentation: https://pyspice.fabrice-salvaire.fr/releases/v1.5/overview.html

import numpy as np
import sys

import PySpice
from PySpice.Spice.Netlist import Circuit 
from PySpice.Unit import *
import PySpice.Logging.Logging as Logging

from modules import construction, file


from TestScripts.demo import DemoData

logger = Logging.setup_logging(logging_level=Logging.logging.ERROR)

if __name__ == "__main__":
    
    circuit_obj = construction.build(file.LoadFile())
    
    print("\n\n\t\tOutputing Build Circuit...\t\t\n\n")
    print(circuit_obj)

    circuit_obj.ConstructNetlist()
    circuit_obj.Simulate()
    file.SaveFile(circuit_obj.Output())