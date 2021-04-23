let size = 50;
let sound;
let inColor;

function setup() {
  sound = loadSound('assets/sound/sound.wav');
  createCanvas(400, 400);
  inColor = color(255,0,0);
}

function draw() {
  background(220);
  if (sound.isPlaying()) {
    fill(0,255,0);
  } else {
    fill(255,0,0);
  }
  circle(mouseX,mouseY,size);
}

function mousePressed() {
  size*=1.1;
  sound.play();
}
