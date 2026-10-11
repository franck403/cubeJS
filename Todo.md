**1. Use absolute angle only, and turn with relative moves.**
Replace every `relative_position` with `absolute_position`. Keep the turns as relative moves, then snap to the nearest multiple of 90 using the absolute angle. This covers what I said in steps 1 and 2.

**2. Make the hub report OK or STOP, and make JS wait for it.**
Each move sends one line to the hub that turns, snaps, and prints OK or STOP. JS waits for that reply before sending the next move. Remove the fixed delays (180 ms, 20 ms, and the wait math) because they're guesses, and they're why the check sometimes reads a motor that's still moving.

**3. Read serial data one full line at a time.**
Keep a text buffer for each hub. Add each chunk to it, and only handle a line once you reach a newline. That way HELP or STOP can't get split across two reads.

**4. Handle STOP and fix FASTWIGGLE and the wiggle, together.**
You asked for the real reason it broke, so here it is. The move code used to work because the correction and check were loose and mostly harmless. When STOP started appearing, the code didn't know what to do with it: STOP was printed but ignored, PAUSE was never printed so FASTWIGGLE never ran, and FASTWIGGLE passed the writer object where it needed the port name. Since the cube's state is uncertain after a STOP, the solve should halt, and recovery should run on that hub only: wiggle its own ports (left has A, C, E; right has B, D, F), wait for it to finish, then snap to the absolute grid. Also remove the global `side` variable.

**5. Delete the dead code.**
Remove the degree-correction function and its variables (lb, ld, cb, cd), the old wiggle function, the timing constants used for guessed delays, and the `sleepT(1)` calls that do nothing.