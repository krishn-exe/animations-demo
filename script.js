// CONSTANTS & SIMULATION PARAMETERS
const G = 1;          
const SOFTENING = 5;  
let dt = 0.5;          

// BODY CLASS & FUNCTIONS
class Body {
  constructor(x, y, vx, vy, mass, radius, color) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.mass = mass;
    this.radius = radius;
    this.color = color;
  }
}

function createBodies() {
  return [
    new Body(400, 400, 0, 0, 10000, 20, "yellow"),
    new Body(300, 200, 7.07, 0, 1, 5, "blue"),
  ];
}

function drawBody(body) {
  ctx.beginPath();
  ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
  ctx.fillStyle = body.color;
  ctx.fill();
}

function updateBodies() {
  // FORCE CALCULATION
  for (let i = 0; i < bodies.length; i++) {
    let fx = 0, fy = 0;
    const a = bodies[i];

    for (let j = 0; j < bodies.length; j++) {
      if (i === j) continue;
      const b = bodies[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy + SOFTENING * SOFTENING;
      const dist = Math.sqrt(distSq);

      const force = (G * a.mass * b.mass) / distSq;
      fx += force * (dx / dist);
      fy += force * (dy / dist);
    }

    a.ax = fx / a.mass;
    a.ay = fy / a.mass;
  }

  // UPDATE POSITIONS AND VELOCITIES
  for (let body of bodies) {
    body.vx += body.ax * dt;
    body.vy += body.ay * dt;
    body.x += body.vx * dt;
    body.y += body.vy * dt;
  }
}

// CANVAS SETUP
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let isPaused = true;

let bodies = createBodies();

const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const dtSlider = document.getElementById("dtSlider");
const dtVal = document.getElementById("dtVal");

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.innerHTML = isPaused ? '<i class="fa-solid fa-play"></i>': '<i class="fa-solid fa-pause"></i>';
});


resetBtn.addEventListener("click", () => {
    bodies = []
    isPaused = true;
    pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
});

dtSlider.addEventListener("input", (e) => {
  dt = parseFloat(e.target.value);
  dtVal.textContent = dt;
});


function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!isPaused) {
    updateBodies();
  }

  for (let body of bodies) {
    drawBody(body);
  }

  requestAnimationFrame(loop);
}

loop();