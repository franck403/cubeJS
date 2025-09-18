from hub import light_matrix, port
import motor

# Map each port to a line/shape on the 5x5 light matrix
lights = {
    port.B: [(4, y) for y in range(5)],        # Right column
    port.D: [(x, 4) for x in range(5)],        # Bottom row
    port.F: [(x, 4 - x) for x in range(5)],    # Diagonal top-right → bottom-left
}

# One-line function: run motor, then toggle its pixels off/on
def layer(motor_port, rotation, speed): motor.run_for_degrees(motor_port, rotation, speed); [light_matrix.set_pixel(x, y, 0) for (x, y) in lights.get(motor_port, [])] if True else None; [light_matrix.set_pixel(x, y, 100) for (x, y) in lights.get(motor_port, [])] if True else None
