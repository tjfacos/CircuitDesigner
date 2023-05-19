# CircuitDesignerElectron

## Summary

This is the repository for my EPQ Artefact.

It is a circuit simulator app for designing linear circuits, using web technologies to inteface with a C++ program implementing SPICE

It is powered and implemented with:

* Client/GUI
  * Standard web technologies
  * Electron.js
  
* Internal Logic
  * C++
  * Emscripten
  * WebAssembly
  * NgSpice circuit simulator (https://github.com/ngspice/ngspice)
    * SPICE is a text-based circuit simulation program on which a majority of existing circuit simulator are based. More detail on it can be found in my Artefact report as well as here: https://en.wikipedia.org/wiki/SPICE
  
## Current State (updated 07/04/2023)
The program remains unfinished, although most of the client-facing work is done.

A new repository has been created so I can write the C++ analysis separately, and import it later.
