from hub import light_matrix, port
import motor

# Map each port to a line/shape on the 5x5 light matrix
lights = {
	port.B: [(4, y) for y in range(5)],        # Right column
	port.D: [(x, 4) for x in range(5)],        # Bottom row
	port.F: [(x, 4 - x) for x in range(5)],    # Diagonal top-right → bottom-left
}
light_matrix.set_pixel(1, 1, 100)

def layer(motor_port, rotation, speed):
	# Move motor
	motor.run_for_degrees(motor_port, rotation, speed)

	# Turn off all lights first (so only this motor’s lights show)
	for x in range(5):
		for y in range(5):
			light_matrix.set_pixel(x, y, 0)
	for (x, y) in lights.get(motor_port, []):
		light_matrix.set_pixel(x, y, 100)

print('Working')
