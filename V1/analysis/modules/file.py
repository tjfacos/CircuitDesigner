import os
from TestScripts.demo import DemoData

import json

def LoadFile():
    try:
        PATH = "./temp/circuit.json"
        
        with open(PATH) as f:
            data = f.read()
        
        os.remove(PATH)
            

    except OSError:
        print("FILE LOAD FAILED!!! Using DemoData")
        data = DemoData


    return data

def SaveResults(result_dict):
    print(result_dict)

    PATH = "./temp/results.json"

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(result_dict, f, ensure_ascii=False, indent=4)