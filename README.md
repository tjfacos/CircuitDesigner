# CircuitDesignerElectron

## Summary

This is the repository for my EPQ Artefact.

It is a circuit simulator app for designing linear circuits, using web technologies to inteface with a C++ program implementing SPICE

It is powered and implemented with:

* Client/GUI
  * Standard web technologies
  * Electron.js
  
* Internal Logic
  * Python
  * Pyspice (https://pyspice.fabrice-salvaire.fr)
  * NgSpice circuit simulator (https://github.com/ngspice/ngspice)
    * SPICE is a text-based circuit simulation program on which a majority of existing circuit simulator are based. More detail on it can be found in my Artefact report as well as here: https://en.wikipedia.org/wiki/SPICE
  
## Current State (updated 30/05/2023)
The app is in a useable state, through I still want to add additional features

## Future Features
### This list contains features I want to add in
* New File: To clear the screen and componentMap
* Track open files (to ensure the app can't close without saving files, and save using ctrl+s while designing)
* Make drawing wires easier, by having a new wire start at the end of each wire