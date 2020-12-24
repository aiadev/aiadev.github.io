var APP =  APP || {};

(function(){

    function Cielo() {

        console.log("*** PENDIENTE: implementar Cielo ***");

        APP.Objeto3Dnew.call(this);

        var _name = "Cielo-NN";
        
        this.provisorio = function() {

            this.setName("cielo");
            
        }

    }

    APP.inheritPrototypeChildParent(Cielo, APP.Objeto3Dnew);

    APP.Cielo = Cielo;

})();
