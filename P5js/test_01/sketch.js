let size = 50;
let sound;
let alpha = 1;

function setup() {
  sound = loadSound('assets/sound/sound.wav');
  createCanvas(400, 400);
}

function draw() {
  background(255);
  fill(255);
  circle(mouseX,mouseY,size);
  if (sound.isLoaded() && sound.isPlaying()) {
    alpha = sound.currentTime()/sound.duration();
    fill(0,255-255*alpha);
    circle(mouseX,mouseY,size-1);
  }
}

function mouseClicked() {
  size*=1.1;
  if (sound.isLoaded()) sound.play();
}
