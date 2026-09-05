let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Body {
  constructor(x, y, vx, vy, mass, radius, color) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.mass = mass;
    this.radius = radius;
    this.color = color;
  }
}

let bodies = [];

bodies.push(new Body(
  350, 400, 0, -3,
  5000, 15, "orange"
));
bodies.push(new Body(
  450, 400, 0, 3,
  5000, 15, "cyan"
));

const G = 1;          
const SOFTENING = 0;  
const dt = 1;          

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

function drawBody(body) {
  ctx.beginPath();
  ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
  ctx.fillStyle = body.color;
  ctx.fill();
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateBodies();
  for (let body of bodies) {
    drawBody(body);
  }

  requestAnimationFrame(loop);
}

loop();