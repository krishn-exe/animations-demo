let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let x = 100;
let y = 100;

let vy = 0;
let gravity = 0.01;

function update() {
    vy += gravity;
    y += vy;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

function loop() {
    update();
    draw();

    requestAnimationFrame(loop);
}

loop();