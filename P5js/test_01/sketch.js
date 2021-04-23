let size = 50;
let sound;
let alpha = 1;
let pitch = 1;

function preload() {
  sound = loadSound('assets/sound/sound.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  updatePitch();
  background(255);
  fill(255);
  circle(mouseX,mouseY,size+10);
  if (sound.isLoaded() && sound.isPlaying()) {
    alpha = sound.currentTime()/sound.duration();
    fill(0,255-255*alpha);
  }
  circle(mouseX,mouseY,size);
}

function mouseClicked() { 
  if (sound.isLoaded()) sound.play();
}

function updatePitch() {
  pitch = map(mouseX, 0.1, width, 0.5, 4);
  pitch = constrain(pitch, 0.1, 4);
  sound.rate(pitch);
  size = 200-pitch*45;
}