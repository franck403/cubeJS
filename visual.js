// Map cube letters to colors
const FACE_COLORS = {
  U: 'white',
  R: 'red',
  F: 'green',
  D: 'yellow',
  L: 'orange',
  B: 'blue',
};

// Create a new image object for the GAN logo
const ganLogo = new Image();
ganLogo.src = 'Gan_cube_brand.webp';

function drawCube(cubeState, canvasId = 'cubeCanvas') {
  if (!cubeState || cubeState.length < 54) {
    console.warn('drawCube: invalid cubeState', cubeState);
    return;
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.warn('drawCube: canvas not found:', canvasId);
    return;
  }

  const ctx = canvas.getContext('2d');
  const size = Math.floor(Math.min(canvas.width / 12, canvas.height / 9));
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const positions = {
    U: { x: 3 * size, y: 0 },
    L: { x: 0, y: 3 * size },
    F: { x: 3 * size, y: 3 * size },
    R: { x: 6 * size, y: 3 * size },
    B: { x: 9 * size, y: 3 * size },
    D: { x: 3 * size, y: 6 * size },
  };

  function drawFaceStr(faceStr, offset, faceName) {
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = offset.x + col * size;
      const y = offset.y + row * size;

      // Check if it's the center sticker of the 'U' face (white face)
      if (faceName === 'U' && i === 4) {
        // If the image is loaded, draw it instead of the colored sticker
        if (ganLogo.complete) {
          imgPad = 2
          ctx.drawImage(ganLogo, x + imgPad/2, y + imgPad/2, size-imgPad, size-imgPad);
        } else {
          // Fallback to drawing a white sticker if the image isn't loaded yet
          ctx.fillStyle = FACE_COLORS.U;
          ctx.fillRect(x, y, size, size);
          ctx.strokeStyle = 'black';
          ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
        }
      } else {
        const sticker = faceStr.charAt(i);
        const color = FACE_COLORS[sticker] || 'gray';

        ctx.fillStyle = color;
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
      }
    }
  }

  const faces = {
    U: cubeState.substr(0, 9),
    R: cubeState.substr(9, 9),
    F: cubeState.substr(18, 9),
    D: cubeState.substr(27, 9),
    L: cubeState.substr(36, 9),
    B: cubeState.substr(45, 9),
  };

  // The face name is now passed to the drawing function
  ['U', 'L', 'F', 'R', 'B', 'D'].forEach((f) =>
    drawFaceStr(faces[f], positions[f], f)
  );
}

// 🔹 Animate a list of moves step-by-step
function animateSolution(
  cubeInstance,
  moves,
  canvasId = 'cubeCanvas',
  delay = 500
) {
  let i = 0;
  function step() {
    if (i >= moves.length) return;
    cubeInstance.move(moves[i]); // apply move to Cube instance
    drawCube(cubeInstance.asString(), canvasId);
    i++;
    setTimeout(step, delay);
  }
  step();
}

// Export globally
window.drawCube = drawCube;
window.animateSolution = animateSolution;
