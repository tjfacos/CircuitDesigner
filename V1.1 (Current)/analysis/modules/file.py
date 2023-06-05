import os
from TestScripts.demo import DemoData

import json

# This function loads the raw JSON data from circuit.json, then deletes the file
def LoadFile():
    try:
        PATH = "./temp/circuit.json"
        
        with open(PATH) as f:
            data = f.read()
        
        os.remove(PATH)
            

    except OSError:
        print("FILE LOAD FAILED!!! Using DemoData")
        # This was used o load data for a demo circuit I used while developing the ALM
        data = DemoData

    return data

# Saves the results of the simulation to results.json
def SaveResults(result_dict):
    print(result_dict)

    PATH = "./temp/results.json"

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(result_dict, f, ensure_ascii=False, indent=4)