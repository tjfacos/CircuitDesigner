import os
from TestScripts.demo import DemoData

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