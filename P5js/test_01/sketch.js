let size = 50;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  fill(255);
  circle(mouseX,mouseY,size);
}

function mousePressed() {
  size*=1.1;
}
