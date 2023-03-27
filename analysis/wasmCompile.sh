#!/bin/bash
echo 'Calling emcc...'

emcc main.cpp -o analysis.js -s NO_EXIT_RUNTIME=1 -s EXPORTED_RUNTIME_METHODS=ccall,cwrap

echo 'Success!'