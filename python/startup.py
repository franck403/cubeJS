cor=1.5
import motor
from hub import port, light_matrix, sound
import time
layer = motor.run_for_degrees
light_matrix.clear();motor.motor_set_high_resolution_mode(port.A, True);motor.motor_set_high_resolution_mode(port.B, True);motor.motor_set_high_resolution_mode(port.C, True);motor.motor_set_high_resolution_mode(port.D, True);motor.motor_set_high_resolution_mode(port.E, True);motor.motor_set_high_resolution_mode(port.F, True)