DemoData = """

{
    "cell1": {
        "name": "cell1",
        "type": "cell",
        "connections": {
            "t1": [
                "wire1"
            ],
            "t2": [
                "wire6"
            ]
        },
        "properties": {
            "emf": 15
        }
    },
    "wire1": {
        "name": "wire1",
        "type": "wire",
        "connections": {
            "t1": [
                "wire2"
            ],
            "t2": [
                "cell1"
            ]
        },
        "properties": {}
    },
    "wire2": {
        "name": "wire2",
        "type": "wire",
        "connections": {
            "t1": [
                "wire1"
            ],
            "t2": [
                "wire3",
                "wire7"
            ]
        },
        "properties": {}
    },
    "wire3": {
        "name": "wire3",
        "type": "wire",
        "connections": {
            "t1": [
                "wire2",
                "wire7"
            ],
            "t2": [
                "resistor1"
            ]
        },
        "properties": {}
    },
    "wire4": {
        "name": "wire4",
        "type": "wire",
        "connections": {
            "t1": [
                "resistor1"
            ],
            "t2": [
                "wire5",
                "wire9"
            ]
        },
        "properties": {}
    },
    "wire5": {
        "name": "wire5",
        "type": "wire",
        "connections": {
            "t1": [
                "wire4",
                "wire9"
            ],
            "t2": [
                "wire6"
            ]
        },
        "properties": {}
    },
    "wire6": {
        "name": "wire6",
        "type": "wire",
        "connections": {
            "t1": [
                "cell1"
            ],
            "t2": [
                "wire5"
            ]
        },
        "properties": {}
    },
    "resistor1": {
        "name": "resistor1",
        "type": "resistor",
        "connections": {
            "t1": [
                "wire3"
            ],
            "t2": [
                "wire4"
            ]
        },
        "properties": {
            "resistance": 10
        }
    },
    "bulb1": {
        "name": "bulb1",
        "type": "bulb",
        "connections": {
            "t1": [
                "wire8"
            ],
            "t2": [
                "wire10"
            ]
        },
        "properties": {
            "resistance": 5
        }
    },
    "wire7": {
        "name": "wire7",
        "type": "wire",
        "connections": {
            "t1": [
                "wire2",
                "wire3"
            ],
            "t2": [
                "wire8"
            ]
        },
        "properties": {}
    },
    "wire8": {
        "name": "wire8",
        "type": "wire",
        "connections": {
            "t1": [
                "wire7"
            ],
            "t2": [
                "bulb1"
            ]
        },
        "properties": {}
    },
    "wire9": {
        "name": "wire9",
        "type": "wire",
        "connections": {
            "t1": [
                "wire10"
            ],
            "t2": [
                "wire4",
                "wire5"
            ]
        },
        "properties": {}
    },
    "wire10": {
        "name": "wire10",
        "type": "wire",
        "connections": {
            "t1": [
                "bulb1"
            ],
            "t2": [
                "wire9"
            ]
        },
        "properties": {}
    }
}


"""