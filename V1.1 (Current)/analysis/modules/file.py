import os

import json

# This function loads the raw JSON data from circuit.json, then deletes the file
def LoadFile():
    PATH = "./temp/circuit.json"
    
    with open(PATH) as f:
        data = f.read()
    
    os.remove(PATH)
            

    return data

# Saves the results of the simulation to results.json
def SaveResults(result_dict):
    print(result_dict)

    PATH = "./temp/results.json"

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(result_dict, f, ensure_ascii=False, indent=4)