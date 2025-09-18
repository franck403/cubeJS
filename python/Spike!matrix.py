from hub import light_matrix, port
import motor

# Map each port to a line/shape on the 5x5 light matrix
lights = {
    port.A: [(0, y) for y in range(5)],       # Left column
    port.C: [(x, 0) for x in range(5)],       # Top row
    port.E: [(i, i) for i in range(5)],       # Diagonal top-left → bottom-right
}

# One-line function: run motor, then toggle its pixels off/on
def layer(motor_port, rotation, speed): motor.run_for_degrees(motor_port, rotation, speed); [light_matrix.set_pixel(x, y, 0) for (x, y) in lights.get(motor_port, [])] if True else None; [light_matrix.set_pixel(x, y, 100) for (x, y) in lights.get(motor_port, [])] if True else None
