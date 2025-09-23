// LEFT side ports: A, C, E
const CLP_LEFT = {
    "U":  "layer(port.E, 90, 500)\nlight_matrix.set_pixel(0, 0, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 0, 0)",
    "U'": "layer(port.E, -90, 500)\nlight_matrix.set_pixel(0, 0, 100)\nlight_matrix.set_pixel(1, 0, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 0, 0)\nlight_matrix.set_pixel(1, 0, 0)",
    "U2": "layer(port.E, 180, 500)\nlight_matrix.set_pixel(0, 0, 100)\nlight_matrix.set_pixel(1, 0, 100)\nlight_matrix.set_pixel(2, 0, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 0, 0)\nlight_matrix.set_pixel(1, 0, 0)\nlight_matrix.set_pixel(2, 0, 0)",

    "L":  "layer(port.C, 90, 500)\nlight_matrix.set_pixel(0, 2, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 2, 0)",
    "L'": "layer(port.C, -90, 500)\nlight_matrix.set_pixel(0, 2, 100)\nlight_matrix.set_pixel(1, 2, 100)\nlight_matrix.set_pixel(3, 2, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 2, 0)\nlight_matrix.set_pixel(1, 2, 0)\nlight_matrix.set_pixel(3, 2, 0)",
    "L2": "layer(port.C, 180, 500)\nlight_matrix.set_pixel(0, 2, 100)\nlight_matrix.set_pixel(1, 2, 100)\nlight_matrix.set_pixel(3, 2, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 2, 0)\nlight_matrix.set_pixel(1, 2, 0)\nlight_matrix.set_pixel(3, 2, 0)",

    "F":  "layer(port.A, 90, 500)\nlight_matrix.set_pixel(0, 4, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 4, 0)",
    "F'": "layer(port.A, -90, 500)\nlight_matrix.set_pixel(0, 4, 100)\nlight_matrix.set_pixel(1, 4, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 4, 0)\nlight_matrix.set_pixel(1, 4, 0)",
    "F2": "layer(port.A, 180, 500)\nlight_matrix.set_pixel(0, 4, 100)\nlight_matrix.set_pixel(1, 4, 100)\nlight_matrix.set_pixel(2, 4, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 4, 0)\nlight_matrix.set_pixel(1, 4, 0)\nlight_matrix.set_pixel(2, 4, 0)",
};

// RIGHT side ports: B, D, F
const CLP_RIGHT = {
    "R":  "layer(port.D, 90, 500)\nlight_matrix.set_pixel(0, 0, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 0, 0)",
    "R'": "layer(port.D, -90, 500)\nlight_matrix.set_pixel(0, 0, 100)\nlight_matrix.set_pixel(1, 0, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 0, 0)\nlight_matrix.set_pixel(1, 0, 0)",
    "R2": "layer(port.D, 180, 500)\nlight_matrix.set_pixel(0, 0, 100)\nlight_matrix.set_pixel(1, 0, 100)\nlight_matrix.set_pixel(2, 0, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 0, 0)\nlight_matrix.set_pixel(1, 0, 0)\nlight_matrix.set_pixel(2, 0, 0)",

    "B":  "layer(port.F, 90, 500)\nlight_matrix.set_pixel(0, 2, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 2, 0)",
    "B'": "layer(port.F, -90, 500)\nlight_matrix.set_pixel(0, 2, 100)\nlight_matrix.set_pixel(1, 2, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 2, 0)\nlight_matrix.set_pixel(1, 2, 0)",
    "B2": "layer(port.F, 180, 500)\nlight_matrix.set_pixel(0, 2, 100)\nlight_matrix.set_pixel(1, 2, 100)\nlight_matrix.set_pixel(2, 2, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 2, 0)\nlight_matrix.set_pixel(1, 2, 0)\nlight_matrix.set_pixel(2, 2, 0)",

    "D":  "layer(port.B, 90, 500)\nlight_matrix.set_pixel(0, 4, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 4, 0)",
    "D'": "layer(port.B, -90, 500)\nlight_matrix.set_pixel(0, 4, 100)\nlight_matrix.set_pixel(1, 4, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 4, 0)\nlight_matrix.set_pixel(1, 4, 0)",
    "D2": "layer(port.B, 180, 500)\nlight_matrix.set_pixel(0, 4, 100)\nlight_matrix.set_pixel(1, 4, 100)\nlight_matrix.set_pixel(2, 4, 100);time.sleep_ms(2000)\nlight_matrix.set_pixel(0, 4, 0)\nlight_matrix.set_pixel(1, 4, 0)\nlight_matrix.set_pixel(2, 4, 0)",
};
