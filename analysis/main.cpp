// UNCOMMENT WHEN COMPILING!!!!!
// #include <emscripten.h>

#include "analyser.h"

#include "json.hpp"

#include <iostream>

extern "C" {
    // EMSCRIPTEN_KEEPALIVE
    int add(int a, int b) {
        return a+b;
    }
}

// int main(int, char**) {
//     std::cout << "Hello, world!\n";
// }
