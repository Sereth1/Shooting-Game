/** @type {HTMLCanvasElement} */

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let gameOver = 0;
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
ctx.font = "80px Impact";

let ravenEnemies = 10;
let ravens = [];
//fps
let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
//fps

let explosions = [];
class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "boom1.wav";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 150;
    this.markedForDeletion = false;
  }
  update(deltaTime) {
    this.frame === 0 && this.sound.play();
    this.timeSinceLastFrame += deltaTime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size / 4,
      this.size,
      this.size
    );
  }
}
class Raven {
  constructor() {
    this.spriteWidth = 270;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.8 + 0.3;

    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;

    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);

    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;

    this.image = new Image();
    this.image.src = "raven.png";
    this.markedForDeletion = false;

    this.frame = 0;
    this.maxFrame = 4;

    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;

    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];

    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
  }

  update(deltaTime) {
    this.x -= this.directionX;
    this.y += this.directionY;

    this.timeSinceFlap += deltaTime;

    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
    }

    if (this.x < 0 - this.width) {
      this.markedForDeletion = true;
    }

    if (this.y < 0 || this.y > canvas.height) {
      this.directionY = this.directionY * -1;
    }
    if (this.x < 0 - this.width) gameOver = true;
  }
  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,

      this.frame * this.spriteWidth,
      0,

      this.spriteWidth,
      this.spriteHeight,

      this.x,
      this.y,

      this.width,
      this.height
    );
  }
}
for (let i = 0; i < ravenEnemies; i++) {
  ravens.push(new Raven());
}

const raven = new Raven();
let score = 0;
function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 96, 75);
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 100, 75);
}

function drawGameOver() {
  ctx.fillStyle = "white";
  ctx.fillText(
    "GAME OVER,your score is " + score,
    canvas.width / 3.5,
    canvas.height / 2
  );
}

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  timeToNextRaven += deltaTime;
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort((a, b) => {
      return a.width - b.width;
    });
  }
  drawScore();

  [...ravens, ...explosions].forEach((object) => object.update(deltaTime));
  [...ravens, ...explosions].forEach((object) => object.draw());

  ravens = ravens.filter((object) => !object.markedForDeletion);
  explosions = explosions.filter((object) => !object.markedForDeletion);
  !gameOver ? requestAnimationFrame(animate) : drawGameOver();
}

window.addEventListener("click", (e) => {
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  const pc = detectPixelColor.data;
  let scored = false;
  ravens.forEach((object) => {
    if (
      !scored &&
      object.randomColors[0] === pc[0] &&
      object.randomColors[1] === pc[1] &&
      object.randomColors[2] === pc[2]
    ) {
      object.markedForDeletion = true;
      scored = true;
      explosions.push(new Explosion(object.x, object.y, object.width));
      console.log(explosions);
    }
  });

  if (scored) {
    score++;
  }
});
animate(0);
