# This will parse and output JSON

# import modules.components
from modules.components import *

import json

def build(raw):
    
    # print(raw)

    data = json.loads(raw)

    circuit_obj = CircuitModel()

    for obj in data:
        match data[obj]["type"]:
            case "cell":
                circuit_obj.AddCell(
                    data[obj]["connections"],
                    data[obj]["properties"]["emf"]
                )
            case "wire":
                circuit_obj.AddWire(
                    data[obj]["connections"]
                )
            case "bulb":
                circuit_obj.AddBulb(
                    data[obj]["connections"],
                    data[obj]["properties"]["resistance"]
                )
            case other:
                circuit_obj.AddResistor(
                    data[obj]["connections"],
                    data[obj]["properties"]["resistance"]
                )

    return circuit_obj