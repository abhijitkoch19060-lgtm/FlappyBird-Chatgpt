const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 720;

/* UI */
const menu = document.getElementById("menu");
const settings = document.getElementById("settings");
const hud = document.getElementById("hud");
const countdownEl = document.getElementById("countdown");
const gameOverEl = document.getElementById("gameOver");

/* AUDIO */
const menuMusic = new Audio("assets/audio/violet-vape.mp3");
const gameMusic = new Audio("assets/audio/beyond-ruin.mp3");
const scoreSound = new Audio("assets/audio/score.wav");
const hitSound = new Audio("assets/audio/hit.wav");

menuMusic.loop = true;
gameMusic.loop = true;

/* SETTINGS */
let muted = false;
let sfxVolume = 0.6;
let musicVolume = 0.4;

/* BIRD */
let bird = {
  x: 200,
  y: 360,
  r: 20,
  vel: 0,
  gravity: 0.35,
  lift: -8,
  color: "#2ecc71",
  eye: 6
};

/* GAME STATE */
let pillars = [];
let score = 0;
let frame = 0;
let playing = false;
let controlEnabled = false;
let menuMode = true;

/* EVENTS */
document.addEventListener("mousedown", flap);
document.addEventListener("keydown", e => e.code === "Space" && flap());

document.getElementById("newGameBtn").onclick = startCountdown;
document.getElementById("settingsBtn").onclick = () => switchScreen(settings);
document.getElementById("backBtn").onclick = () => switchScreen(menu);

document.getElementById("birdColor").oninput = e => bird.color = e.target.value;
document.getElementById("eyeSize").oninput = e => bird.eye = e.target.value;
document.getElementById("sfxVolume").oninput = e => sfxVolume = e.target.value;
document.getElementById("musicVolume").oninput = e => musicVolume = e.target.value;
document.getElementById("muteToggle").onchange = e => muted = e.target.checked;

/* FUNCTIONS */
function switchScreen(screen) {
  document.querySelectorAll(".overlay").forEach(o => o.classList.remove("active"));
  screen.classList.add("active");
}

function playSound(sound) {
  if (muted) return;
  sound.volume = sfxVolume;
  sound.currentTime = 0;
  sound.play();
}

function flap() {
  if (!playing) return;
  controlEnabled = true;
  bird.vel = bird.lift;
}

function startCountdown() {
  switchScreen(null);
  menuMusic.pause();
  gameMusic.currentTime = 0;
  gameMusic.volume = musicVolume;
  if (!muted) gameMusic.play();

  countdownEl.style.display = "flex";
  let c = 3;
  countdownEl.textContent = c;

  const timer = setInterval(() => {
    c--;
    countdownEl.textContent = c > 0 ? c : "GO!";
    if (c < 0) {
      clearInterval(timer);
      countdownEl.style.display = "none";
      startGame();
    }
  }, 1000);
}

function startGame() {
  gameOverEl.classList.remove("active");
  bird.y = 360;
  bird.vel = 0;
  pillars = [];
  score = 0;
  frame = 0;
  playing = true;
  menuMode = false;
  controlEnabled = false;
}

function endGame() {
  playing = false;
  playSound(hitSound);
  gameMusic.pause();
  gameOverEl.classList.add("active");
}

function drawBird() {
  ctx.fillStyle = bird.color;
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(bird.x + 6, bird.y - 5, bird.eye, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(bird.x + 7, bird.y - 5, bird.eye / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawPillars() {
  pillars.forEach(p => {
    ctx.fillStyle = "#bfa76f";
    ctx.fillRect(p.x, 0, p.w, p.top);
    ctx.fillRect(p.x, p.bottom, p.w, canvas.height);
  });
}

function updatePillars() {
  if (frame % 120 === 0) {
    let gap = 180;
    let top = Math.random() * 300 + 50;
    pillars.push({ x: canvas.width, w: 80, top, bottom: top + gap, passed: false });
  }

  pillars.forEach(p => {
    p.x -= 3;

    if (!p.passed && p.x + p.w < bird.x) {
      p.passed = true;
      score = Math.min(999, score + 1);
      playSound(scoreSound);
    }

    if (
      bird.x + bird.r > p.x &&
      bird.x - bird.r < p.x + p.w &&
      (bird.y - bird.r < p.top || bird.y + bird.r > p.bottom)
    ) endGame();
  });

  pillars = pillars.filter(p => p.x + p.w > 0);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (menuMode) {
    bird.vel = Math.sin(frame / 20) * 0.8;
  } else if (controlEnabled) {
    bird.vel += bird.gravity;
  }

  bird.y += bird.vel;

  if (bird.y > canvas.height || bird.y < 0) {
    if (!menuMode) endGame();
    bird.y = canvas.height / 2;
  }

  updatePillars();
  drawPillars();
  drawBird();

  hud.textContent = score;
  frame++;
  requestAnimationFrame(gameLoop);
}

/* INIT */
menuMusic.volume = musicVolume;
menuMusic.play();
gameLoop();
