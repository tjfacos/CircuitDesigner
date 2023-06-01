const openHelpDialog = () => {
    document.getElementById("help-dialog").showModal()
}

const closeHelpDialog = () => {
    document.getElementById("help-dialog").close()
}

const ToggleEditor = (component, state) => {
    // If the editor is not yet displayed, display it
    // Set the name to the selected component
    // Make sure emf is hidden unless component is a cell
    // Add event Listeners to change the value of the resistance/emf on change
    // Make sure all values are numbers

    // If the editor is displayed, close it
    
    let dialog = document.getElementById("editor-wizard")
    let emfField = document.getElementById("emf-field")
    let resistanceField = document.getElementById("resistance-field")
    let rotateBtn = document.getElementById("rotate-button")   
    let deleteBtn = document.getElementById("delete-button")

    emfField.style.display = "block"
    resistanceField.style.display = "block"
    rotateBtn.style.display = "block"
    deleteBtn.style.display = "block"
    dialog.style.height = "40%"


    resistanceField.value = ""
    emfField.value = ""

    if (dialog.classList.contains("hidden")) {
        
        document.getElementById("wizard-component-name").innerText = component.div.id
        
        if (component.div.classList.contains("wire")) {
            resistanceField.style.display = "none"
            dialog.style.height = "15%"
            document.getElementById("rotate-button").style.display = "none"
        } else {
            resistanceField.style.display = "block"
            resistanceField.value = component.resistance
        }

        if (!(component.div.classList.contains("cell"))) {
           emfField.style.display = "none" 
        } else {
            emfField.value = component.emf
            resistanceField.style.display = "none"
        }

        
    } 
    
    dialog.classList.toggle("hidden")

    if (state && state == "on")
    {
        dialog.classList.remove("hidden")
    } else if (state && state == "off") {
        dialog.classList.add("hidden")
    }

}

const setResistance = () => {
    let input = document.getElementById("resistance-field").value
    // if (document.getElementById("emf-field").value === "" || document.getElementById("resistance-field").value === "") {
    //     document.getElementById("wizard-text-output").innerText = "Numbers only!!!"
    // } else {
    //     document.getElementById("wizard-text-output").innerText = ""
    // }

    componentMap.forEach(async (item, key) => {
        if (item.selected) {
            item.resistance = Number(input)
        }
    })
}

const setEMF = () => {
    let input = document.getElementById("emf-field").value
    // if (document.getElementById("emf-field").value === "" || document.getElementById("resistance-field").value === "") {
    //     document.getElementById("wizard-text-output").innerText = "Numbers only!!!"
    // } else {
    //     document.getElementById("wizard-text-output").innerText = ""
    // }

    componentMap.forEach(async (item, key) => {
        if (item.selected) {
            item.emf = Number(input)
        }
    })
}