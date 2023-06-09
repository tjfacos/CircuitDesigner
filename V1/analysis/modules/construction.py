# This will parse and output JSON

# import modules.components
from modules.elements import *

import json

def build(raw):
    
    print(f"Raw Data Recieved: {raw}")

    data = json.loads(raw)

    circuit_obj = CircuitModel()

    for obj in data:
        match data[obj]["type"]:
            case "cell":
                circuit_obj.AddCell(
                    obj,
                    data[obj]["connections"],
                    data[obj]["properties"]["emf"]
                )
            case "wire":
                circuit_obj.AddWire(
                    obj,
                    data[obj]["connections"]
                )
            case "bulb":
                circuit_obj.AddBulb(
                    obj,
                    data[obj]["connections"],
                    data[obj]["properties"]["resistance"]
                )
            case other:
                circuit_obj.AddResistor(
                    obj,
                    data[obj]["connections"],
                    data[obj]["properties"]["resistance"]
                )

    return circuit_obj