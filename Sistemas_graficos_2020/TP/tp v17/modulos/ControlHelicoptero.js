var APP =  APP || {};

(function(){

    function ControlHelicoptero(){

        $body=$("body");

        var xArrow = 0;
        var yArrow = 0;
        var zArrow = 0;

        var altitudeInertia = 0.01;
        var speedInertia = 0.1;
        var angleInertia = 0.02;
        var helixInertia = 0.1;

        var deltaAltitude = 1;
        var deltaSpeed = 0.001;
        var deltaAngle = 0.03;
        var deltaHelix = 0.03;

        var maxSpeed = 2;
        var maxAltitude = 300;
        var minAltitude = 2; //5

        var minHelix = 0; 
        var maxHelix = 0.5;

        var positionX = 0; //50.0;
        var positionY = 0;
        var positionZ = 0; //50.0;

        var speed = 0;
        var altitude = minAltitude;
        var angle = 0;
        var helix = 0;

        var pitch = 0;
        var roll = 0;

        var angleTarget = 0;
        var altitudeTarget = minAltitude;
        var speedTarget = 0;

        var helixTarget=0;

        var bRetraerHelices = false;
        var retraerHelices = 0;
        
        var directionX = 0;
        var directionY = 0;

        $("body").keydown(function(e){

            switch(e.key){

                case "ArrowUp":
                case "w":
                case "W":

                    xArrow = 1;
                    break;

                case "ArrowDown":
                case "s":
                case "S":
                    
                    xArrow = -1;
                    break;       

                case "ArrowLeft":
                case "a":
                case "A":    

                    zArrow = -1;
                    break;     

                case "ArrowRight":
                case "d":
                case "D":    

                    zArrow = 1;
                    break;

                case "PageUp":
                case "e":
                case "E":

                    yArrow = 1;
                    break;  

                case "PageDown":
                case "q":
                case "Q":

                    yArrow = -1;
                    break;    

                case "h":
                case "H":

                    bRetraerHelices=!bRetraerHelices;
                    if (bRetraerHelices) retraerHelices = 1;
                    else retraerHelices = -1;
                    break;      

                default:

                    break;

            }

        });

        $("body").keyup(function(e){

            switch(e.key){

                case "ArrowUp":
                case "ArrowDown":
                case "w":
                case "W":
                case "s":
                case "S":

                    xArrow = 0;
                    break;    

                case "ArrowLeft":
                case "ArrowRight":
                case "a":
                case "A":
                case "d":
                case "D":

                    zArrow = 0;
                    break;

                case "PageUp":                         
                case "PageDown":
                case "q":
                case "Q":
                case "e":
                case "E":

                    yArrow = 0;
                    break;    

            }

        });

        this.update=function(){

            if (xArrow != 0) {

                speedTarget += xArrow*deltaSpeed;   

            } else {

                speedTarget += (0-speedTarget)*deltaSpeed;

            }
            
            speedTarget = Math.max(-maxAltitude,Math.min(maxSpeed,speedTarget));

            var speedSign = 1;
            
            if (speed < 0) speedSign = -1;

            if (zArrow != 0) {    

                angleTarget += zArrow*deltaAngle*speedSign;    

            }        

            if (yArrow!=0) {

                altitudeTarget += yArrow*deltaAltitude;
                altitudeTarget = Math.max(minAltitude,Math.min(maxAltitude,altitudeTarget));

            }
            
            helixTarget += deltaHelix*retraerHelices;
            helixTarget = Math.max(minHelix,Math.min(maxHelix,helixTarget));

            roll = -(angleTarget-angle)*0.4;
            pitch = -Math.max(-0.5,Math.min(0.5,speed));

            speed += (speedTarget-speed)*speedInertia;
            altitude += (altitudeTarget-altitude)*altitudeInertia;
            angle += (angleTarget-angle)*angleInertia;

            directionX = Math.cos(-angle)*speed;
            directionZ = Math.sin(-angle)*speed;

            positionX += directionX;
            positionZ += directionZ;        
            positionY = altitude;
    
            helix += (helixTarget-helix)*helixInertia;

        }

        this.getPosition=function(){
            return {
                x:positionX,
                y:positionY,
                z:positionZ,
            };
        }

        this.getYaw=function(){

            return angle;

        }

        this.getRoll=function(){

            return roll;

        }

        this.getPitch=function(){

            return pitch;

        }

        this.getSpeed=function(){

            return speed;

        }

        this.getDirectionZ=function() {

            return directionZ;

        }

        this.getDirectionX=function() {

            return directionX;

        }

        this.getAngle=function() {

            return angleTarget-angle;

        }

        this.getRetraerHelices = function() {

            return bRetraerHelices;

        }

        this.getHelix=function(){

            return helix;

        }

        this.getInfo=function(){

            var out = "";

            out += " Position: ("+positionX.toFixed(2)+", "+positionY.toFixed(2)+", "+positionZ.toFixed(2)+")";

            out += " speedTarget: "+speedTarget.toFixed(2)+"<br>";
            out += " altitudeTarget: "+altitudeTarget.toFixed(2)+"<br>";
            out += " angleTarget: "+angleTarget.toFixed(2)+"<br><br>";        

            out += " speed: "+speed.toFixed(2)+"<br>";
            out += " altitude: "+altitude.toFixed(2)+"<br><br>";        

            out += " xArrow: "+xArrow.toFixed(2)+"<br>";
            out += " yArrow: "+yArrow.toFixed(2)+"<br>";
            out += " zArrow: "+zArrow.toFixed(2)+"<br><br>";                

            out += " yaw: "+angle.toFixed(2)+"<br>";    
            out += " pitch: "+pitch.toFixed(2)+"<br>";    
            out += " roll: "+roll.toFixed(2)+"<br>";    

            return out;
        }

        this.getPositionString = function() {

            return " Position: ("+positionX.toFixed(2)+", "+positionY.toFixed(2)+", "+positionZ.toFixed(2)+")";
        
        }

    }

    APP.ControlHelicoptero = ControlHelicoptero;

})();
