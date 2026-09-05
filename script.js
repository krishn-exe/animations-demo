// CONSTANTS & SIMULATION PARAMETERS
let G = 1;
let SOFTENING = 0;
let dt = 1;

// BODY CLASS & FUNCTIONS
class Body {
  constructor(x, y, vx, vy, mass, radius, color) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.mass = mass;
    this.radius = radius;
    this.color = color;
    this.ax = 0;
    this.ay = 0;
  }
}


function getPresetFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("preset") || "solar-system";
}

// ---------- PRESET CONFIGURATIONS ----------

function createSolarSystemBodies(cx, cy) {
  // v = sqrt(G * M_sun / r)  for circular orbits
  const M = 10000;
  return [
    new Body(cx, cy, 0, 0, M, 20, "yellow"),                                // Sun
    new Body(cx, cy - 60,  Math.sqrt(M / 60),  0, 1,  3, "#aaaaaa"),        // Mercury
    new Body(cx, cy - 100, Math.sqrt(M / 100), 0, 2,  4, "#e8a946"),        // Venus
    new Body(cx, cy - 150, Math.sqrt(M / 150), 0, 3,  5, "#4da6ff"),        // Earth
    new Body(cx, cy - 210, Math.sqrt(M / 210), 0, 2,  4, "#e84040"),        // Mars
    new Body(cx, cy - 300, Math.sqrt(M / 300), 0, 20, 10, "#c8a45c"),       // Jupiter
    new Body(cx, cy - 400, Math.sqrt(M / 400), 0, 10, 8,  "#d4a94d"),       // Saturn
  ];
}

function createBinaryStarBodies(cx, cy) {
  // Two equal-mass stars: v = sqrt(G * m / (2 * d)), d = separation
  const m = 5000;
  const sep = 150;               // separation between stars
  const vOrbit = Math.sqrt(m / (2 * sep));  // ≈ 4.08

  return [
    new Body(cx - sep / 2, cy, 0, -vOrbit, m, 14, "#ff6633"),   // Star A
    new Body(cx + sep / 2, cy, 0,  vOrbit, m, 14, "#33ccff"),   // Star B
    // Outer planet: v = sqrt(G * M_total / r)
    new Body(cx, cy - 280, Math.sqrt(2 * m / 280), 0, 5, 4, "#88ff88"),
  ];
}

function createFigureEightBodies(cx, cy) {
  // Chenciner-Montgomery figure-eight solution (G=1, m_each=1)
  // Standard positions:  (±0.97000436, ∓0.24308753), (0, 0)
  // Standard velocities: v1=v2=(0.4662036850, 0.4323657300), v3=(-0.9324073700, -0.8647314600)
  //
  // Scaling: positions × S=100, mass m=5000
  // v_scale = sqrt(G * m / S) = sqrt(50) ≈ 7.0711

  const m = 5000;
  const S = 100;
  const vf = Math.sqrt(m / S); // velocity scale factor ≈ 7.0711

  const vx12 =  0.4662036850 * vf;  //  3.296
  const vy12 =  0.4323657300 * vf;  //  3.057
  const vx3  = -0.9324073700 * vf;  // -6.592
  const vy3  = -0.8647314600 * vf;  // -6.115

  return [
    new Body(cx + 97, cy - 24.31, vx12, vy12, m, 8, "#ff5555"),
    new Body(cx - 97, cy + 24.31, vx12, vy12, m, 8, "#55ff88"),
    new Body(cx,      cy,         vx3,  vy3,  m, 8, "#5588ff"),
  ];
}

function createTripleChaosBodies(cx, cy) {
  // Three equal masses in an asymmetric triangle
  // Total momentum = 0:  Σmv = 3000*(0 + -2 + 2, 3 + -2 + -1) = (0, 0) ✓
  return [
    new Body(cx - 100, cy - 67,  0, 3,  3000, 12, "#ff4444"),
    new Body(cx + 100, cy - 67, -2, -2, 3000, 12, "#44ff44"),
    new Body(cx,       cy + 133, 2, -1, 3000, 12, "#4488ff"),
  ];
}

// ---------- PRESET LOADER ----------

function getPresetConfig(cx, cy) {
  const preset = getPresetFromURL();

  switch (preset) {
    case "solar-system":
      return { bodies: createSolarSystemBodies(cx, cy), G: 1, SOFTENING: 2,  dt: 0.3 };
    case "binary-stars":
      return { bodies: createBinaryStarBodies(cx, cy),  G: 1, SOFTENING: 10, dt: 0.3 };
    case "figure-eight":
      return { bodies: createFigureEightBodies(cx, cy), G: 1, SOFTENING: 0,  dt: 0.5 };
    case "chaos":
      return { bodies: createTripleChaosBodies(cx, cy), G: 1, SOFTENING: 15, dt: 0.3 };
    default:
      return { bodies: createSolarSystemBodies(cx, cy), G: 1, SOFTENING: 2,  dt: 0.3 };
  }
}

// ---------- PHYSICS ----------

function computeAccelerations() {
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
}

function updateBodies() {
  // Leapfrog (Kick-Drift-Kick) integration — symplectic, conserves energy

  // Half kick: v += ½ a dt
  for (let body of bodies) {
    body.vx += 0.5 * body.ax * dt;
    body.vy += 0.5 * body.ay * dt;
  }

  // Drift: x += v dt
  for (let body of bodies) {
    body.x += body.vx * dt;
    body.y += body.vy * dt;
  }

  // Recompute accelerations at new positions
  computeAccelerations();

  // Half kick: v += ½ a dt
  for (let body of bodies) {
    body.vx += 0.5 * body.ax * dt;
    body.vy += 0.5 * body.ay * dt;
  }
}

function drawBody(body) {
  ctx.beginPath();
  ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
  ctx.fillStyle = body.color;
  ctx.fill();
}

// ---------- CANVAS SETUP ----------

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ---------- STATE ----------

let isPaused = false;
let bodies = [];

// ---------- UI ELEMENTS ----------

const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const clearBtn = document.getElementById("clearBtn");
const dtSlider = document.getElementById("dtSlider");
const dtVal = document.getElementById("dtVal");
const GSlider = document.getElementById("GSlider");
const GVal = document.getElementById("GVal");
const SofteningSlider = document.getElementById("SofteningSlider");
const SofteningVal = document.getElementById("SofteningVal");

// ---------- APPLY PRESET ----------

function applyPreset() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const config = getPresetConfig(cx, cy);

  bodies = config.bodies;
  G = config.G;
  SOFTENING = config.SOFTENING;
  dt = config.dt;

  // Bootstrap accelerations for the first leapfrog half-kick
  computeAccelerations();

  syncSliders();
}

function syncSliders() {
  dtSlider.value = dt;
  dtVal.textContent = dt;
  GSlider.value = G;
  GVal.textContent = G;
  SofteningSlider.value = SOFTENING;
  SofteningVal.textContent = SOFTENING;
}

// Initial load
applyPreset();

// ---------- CONTROLS ----------

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.innerHTML = isPaused ? '<i class="fa-solid fa-play"></i>': '<i class="fa-solid fa-pause"></i>';
});

clearBtn.addEventListener("click", () => {
  bodies = [];
  isPaused = true;
  pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
});

resetBtn.addEventListener("click", () => {
  isPaused = true;
  pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  applyPreset();
});

dtSlider.addEventListener("input", () => {
  dt = parseFloat(dtSlider.value);
  dtVal.textContent = dtSlider.value;
});

GSlider.addEventListener("input", () => {
  G = parseFloat(GSlider.value);
  GVal.textContent = GSlider.value;
});

SofteningSlider.addEventListener("input", () => {
  SOFTENING = parseFloat(SofteningSlider.value);
  SofteningVal.textContent = SofteningSlider.value;
});

// ---------- MAIN LOOP ----------

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