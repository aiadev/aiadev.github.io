var APP =  APP || {};

(function(){

    function Objeto3D() {
      
        var _parentObject;
        
        var _parentMatrix = mat4.create();
        var _finalMatrix = mat4.create();

        var _bDraw = true;
        var _name ="Objeto3D-NN";
        var _rows = 10;
        var _cols = 10;

        var _position = [0,0,0];
        var _rotationX = 0;
        var _rotationY = 0;
        var _rotationZ = 0;
        var _scale = [1,1,1];
        
        this.setShape = function(tipo) {
  
            if (tipo == "superficieDeBarrido") {

                APP.SuperficieDeBarrido.call(this);
                APP.inheritPrototypeChildParent(this, APP.SuperficieDeBarrido);

            } else if (tipo == "tuboSenoidal") {

                APP.TuboSenoidal.call(this);         
                APP.inheritPrototypeChildParent(this, APP.TuboSenoidal);

            } else if (tipo == "esfera") {

                APP.Esfera.call(this);
                APP.inheritPrototypeChildParent(this, APP.Esfera);

            } else {

                APP.Malla.call(this); // plano
                APP.inheritPrototypeChildParent(this, APP.Malla);
                
            }
            _parentObject = new Objeto3D();

        }

        this.setName = function(name) {

            _name = name; 

        }

        this.noDraw = function(){

            _bDraw = false;
            console.log(_name+": no se dibujará");

        }

        this.setParent = function(parentObject) {

            _parentObject = parentObject;
            _parentMatrix = _parentObject.getMatrix();

        }

        this.resetMatrix = function() {

            _modelMatrix = _initialMatrix;

        }

        // VER POR AHORA SOLO IMPLEMENT TRASLACION
        this.setPosition = function(position) {

            _position = position;

        }

        this.setRotationX = function(rotationX) {   

            _rotationX = rotationX;

        }

        this.setRotationY = function(rotationY) {   

            _rotationY = rotationY;

        }
        this.setRotationZ = function(rotationZ) {   

            _rotationZ = rotationZ;

        }

        this.setScale = function(scaleVector) { 

            _scale = scaleVector;

        }
        
        this.getRotationXYZ = function() {
            return vec3.fromValues(_rotationX, _rotationY, _rotationZ);
        }

        // this.getRotationYFromMatrix = function() {
        //     var q = glMatrix.quat2.create();
        //     q = mat4.getRotation(q,_finalMatrix);
        //     console.log(q[1], q[3]);
        //     return q[1];
        // }

        this.update = function() { 

            _parentMatrix = _parentObject.getMatrix();

            mat4.translate(_finalMatrix, _parentMatrix, _position);

            mat4.rotateX(_finalMatrix, _finalMatrix, _rotationX);
            mat4.rotateY(_finalMatrix, _finalMatrix, _rotationY);
            mat4.rotateZ(_finalMatrix, _finalMatrix, _rotationZ);

            mat4.scale(_finalMatrix, _finalMatrix, _scale);
            this.applyMatrixToMesh(_finalMatrix);

            this.generarMalla();

            return _finalMatrix;

        }

        this.draw = function() {

            if (_bDraw) this.dibujarMalla();

        }

        this.getMatrix = function() { 

            return _finalMatrix;

        }

        this.getName = function() {

            return _name; 

        }

        this.getPosition = function() {
            return _position;
        }

        this.getScenePosition = function() {
            
            // ojo inluye escala! ver para herencia posicion
            var pos = vec3.create();
            vec3.transformMat4(pos, pos, _finalMatrix);
            return pos;

        }

    }

    APP.Objeto3D = Objeto3D;

}());