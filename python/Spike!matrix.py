from hub import light_matrix, port
import motor

# Map each port to a line/shape on the 5x5 light matrix
lights = {
	port.A: [(0, y) for y in range(5)],       # Left column
	port.C: [(x, 0) for x in range(5)],       # Top row
	port.E: [(i, i) for i in range(5)],       # Diagonal top-left → bottom-right
}

def layer(motor_port, rotation, speed):
	# Move motor
	motor.run_for_degrees(motor_port, rotation, speed)

	# Turn off all lights first (so only this motor’s lights show)
	for x in range(5):
		for y in range(5):
			light_matrix.set_pixel(x, y, 0)

	# Turn on lights for this motor
	for (x, y) in lights.get(motor_port, []):
		light_matrix.set_pixel(x, y, 100)

print('Working')
