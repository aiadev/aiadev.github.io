var APP =  APP || {};

(function(){

    function ControlDeCamara() {

        console.log("*** PENDIENTE: ajustar cámaras y agregar orbital ***");

        var _name = "ControlDeCamara-NN";

        var fromObj = new Array();
        var toObj = new Array();
        var up = new Array();
        var mat = mat4.create();
        var camSel = 0;

        this.addCam = function(fromObject, toObject, upVector) {

            fromObj.push(fromObject);
            toObj.push(toObject);
            up.push(upVector);

        }

        this.getCam = function(n) {

            if (n >= 0 && n < up.length) camSel = n;
            else camSel = 0;
                       
            // EYE, CENTER, UP
            return mat4.lookAt(mat,

                fromObj[camSel].getWorldPosition(),
                toObj[camSel].getWorldPosition(),
                up[camSel]);

        }

        this.update = function() {
               
            $("body").keydown(function(e){
                switch(e.key){          
                    case '1':  
                        camSel = 0; // orbital a origen
                    break;
                    case '2':  
                        camSel = 1; // trasera
                        break;
                    case '3':   
                        camSel = 2; // lateral
                        break;
                    case '4':
                        camSel = 3; // superior
                        break;
                    case '5':  
                        camSel = 4; // extra orbital a helicoptero
                        break;
                    case '6': 
                        camSel = 5; // extra frente cinematofrafica
                        break;
                    case '7': 
                        camSel = 6; // extra 1ra persona frente
                        break;
                    case '8': 
                        camSel = 7; // extra orbital helicoptero giro continuo
                        break;
                    default:
                        break;            
                }
            });

            return this.getCam(camSel);

        }

    }

    APP.ControlDeCamara = ControlDeCamara;

})();
