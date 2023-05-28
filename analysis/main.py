# Pyspice Documentation: https://pyspice.fabrice-salvaire.fr/releases/v1.5/overview.html

import numpy as np
import sys

import PySpice
from PySpice.Spice.Netlist import Circuit 
from PySpice.Unit import *
import PySpice.Logging.Logging as Logging

from modules import construction


from TestScripts.demo import DemoData

logger = Logging.setup_logging(logging_level=Logging.logging.ERROR)

if __name__ == "__main__":
    
    # print(sys.argv[1])

    # exit()
    
    try:
        circuit_obj = construction.build(sys.argv[1])
    except:
        circuit_obj = construction.build(DemoData)

    print(circuit_obj.NodalAnalysis())