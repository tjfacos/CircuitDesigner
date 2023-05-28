# Pyspice Documentation: https://pyspice.fabrice-salvaire.fr/releases/v1.5/overview.html

import numpy as np
import sys

import PySpice
from PySpice.Spice.Netlist import Circuit 
from PySpice.Unit import *
import PySpice.Logging.Logging as Logging

from modules import construction

logger = Logging.setup_logging(logging_level=Logging.logging.ERROR)

# circuit = Circuit("UserCircuit")


# test.VoltageDivider()


if __name__ == "__main__":
    # circuit_list = construction.build(sys.argv[1])
    circuit_obj = construction.build(
    """
    
    {
        "resistor1": {
            "name": "resistor1",
            "type": "resistor",
            "connections": [
                "wire8",
                "wire9"
            ],
            "properties": {
                "resistance": 10
            }
        },
        "resistor2": {
            "name": "resistor2",
            "type": "resistor",
            "connections": [
                "wire3",
                "wire4"
            ],
            "properties": {
                "resistance": 10
            }
        },
        "cell1": {
            "name": "cell1",
            "type": "cell",
            "connections": [
                "wire1",
                "wire5"
            ],
            "properties": {
                "emf": 10
            }
        },
        "wire1": {
            "name": "wire1",
            "type": "wire",
            "connections": [
                "cell1",
                "wire2"
            ],
            "properties": {}
        },
        "wire2": {
            "name": "wire2",
            "type": "wire",
            "connections": [
                "wire1",
                "wire3",
                "wire10"
            ],
            "properties": {}
        },
        "wire3": {
            "name": "wire3",
            "type": "wire",
            "connections": [
                "resistor2",
                "wire2",
                "wire10"
            ],
            "properties": {}
        },
        "wire4": {
            "name": "wire4",
            "type": "wire",
            "connections": [
                "resistor2",
                "wire6",
                "wire7"
            ],
            "properties": {}
        },
        "wire5": {
            "name": "wire5",
            "type": "wire",
            "connections": [
                "cell1",
                "wire6"
            ],
            "properties": {}
        },
        "wire6": {
            "name": "wire6",
            "type": "wire",
            "connections": [
                "wire4",
                "wire5",
                "wire7"
            ],
            "properties": {}
        },
        "wire7": {
            "name": "wire7",
            "type": "wire",
            "connections": [
                "wire4",
                "wire6",
                "wire8"
            ],
            "properties": {}
        },
        "wire8": {
            "name": "wire8",
            "type": "wire",
            "connections": [
                "resistor1",
                "wire7"
            ],
            "properties": {}
        },
        "wire9": {
            "name": "wire9",
            "type": "wire",
            "connections": [
                "resistor1",
                "wire10"
            ],
            "properties": {}
        },
        "wire10": {
            "name": "wire10",
            "type": "wire",
            "connections": [
                "wire2",
                "wire3",
                "wire9"
            ],
            "properties": {}
        }
    }
    
    """
    )

    print(circuit_obj.NodalAnalysis())