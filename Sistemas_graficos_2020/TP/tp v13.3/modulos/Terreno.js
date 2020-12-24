var APP =  APP || {};

(function(){

    function Terreno() {

        console.log("*** PENDIENTE: implementar Terreno ***");

        APP.Objeto3Dnew.call(this);

        this.provisorio = function() {

            sb_t = new APP.SuperficieDeBarridoNew(100,100);
            sb_t.setRecorrido("bezier2", [ [-1,0,0],[-1,0,0],[1,0,0] ]);
            sb_t.setForma("bezier2", [ [-1,0,0],[-1,0,0],[1,0,0] ]);
            sb_t.setHasTapaBottomTop(false,false);
            
            this.setBuffers(sb_t.getBuffers());
            this.setScale([100,100,100]);
            this.setPosition([0,0,0]);
            this.setTexture("./img/pasto.jpg");
            this.setName("terreno");
            this.updateMatrizModelado();
        }

    }
    APP.inheritPrototypeChildParent(Terreno, APP.Objeto3Dnew);

    APP.Terreno = Terreno;

})();
