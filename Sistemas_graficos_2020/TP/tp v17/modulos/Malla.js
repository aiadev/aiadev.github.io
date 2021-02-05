// EJEMPLO DE USO
// objeto3.setName("objeto3");
// objeto3.setShape("superficieDeBarrido"); // 1 - setShape
// objeto3.setGrid(20, 20);                 // 2 - otros seteos

// OTROS SETEOS            
// objeto3.setForma("bspline2", circ3);
// objeto3.setRecorrido("bezier2", puntosDeControlCuadratica);
// objeto2.setParent(objeto1);

// OTRAS MODIFICACIONES
// objeto2.scale(vec3.fromValues(0.5,0.5,4));   // 3 - otras modif de pos, scale, rot
// objeto2.translate(vec3.fromValues(2,0,0));
// objeto2.updateMatrix();                      // 4 - actualizar la matriz (transf solo se juntan ahi)

// objeto3.generarMalla();                      // 5 - generarMalla al final (que aplica la matriz)

var APP =  APP || {};

(function(){

    function Malla() {

        this.mallaNumCols = 20;  
        this.mallaNumFilas = 20;
        this.mallaDeTriangulos;   

        var _name ="Malla-NN";

        var _ancho = 3;
        var _largo = 3;

        var _matrix = mat4.create(); 

        this.setAncho = function(ancho){

            _ancho= ancho;

        }

        this.setAlto = function(alto) {

            _alto = alto;

        }
    
        this.getPosicion = function(u,v){
    
            var x=(u-0.5)*_ancho;
            var z=(v-0.5)*_largo;
            return [x,0,z];
        }
    
        this.getNormal = function(u,v){

            return [0,1,0];

        }
    
        this.getCoordenadasTextura = function(u,v){

            return [u,v];

        }

        this.setName = function(name) {

            _name = name; 

        }

        this.getName = function() {

            return _name; 

        }

        this.applyMatrixToMesh = function(m) {
            mat4.copy(_matrix, m);
            this.mallaDeTriangulos = this.generarMalla();
        }

        this.getBuffers = function(){

            positionBuffer = [];
            normalBuffer = [];
            uvBuffer = [];
        
            for (var i=0; i <= this.mallaNumFilas; i++) {
                for (var j=0; j <= this.mallaNumCols; j++) {
        
                    var u=j/this.mallaNumCols;
                    var v=i/this.mallaNumFilas;
        
                    var pos = this.getPosicion(u,v);

                    vec3.transformMat4(pos, pos, _matrix); // matriz objeto
        
                    positionBuffer.push(pos[0]);
                    positionBuffer.push(pos[1]);
                    positionBuffer.push(pos[2]);
        
                    var nrm = this.getNormal(u,v);

                    vec3.transformMat4(nrm, nrm, _matrix); // matriz objeto

                    normalBuffer.push(nrm[0]);
                    normalBuffer.push(nrm[1]);
                    normalBuffer.push(nrm[2]);
        
                    var uvs = this.getCoordenadasTextura(u,v);
        
                    uvBuffer.push(uvs[0]);
                    uvBuffer.push(uvs[1]);
        
                }
            }
        
            // Buffer de indices de los triángulos
            // importante vaciar el array!
            indexBuffer=[];  
        
            // ej grilla 3x2 indexBuffer=[0,4,1,5,2,6,3,7,  7,4,  4,8,5,9,6,10,7,11]; 
        
            var cols = this.mallaNumCols + 1;  // columnas=3 => cols=4 
        
            for (i = 0; i < this.mallaNumFilas; i++) {               // y ej 3x2 max 1
                for (j = 0; j < cols; j++) {            // x ej 3x2 max 3, cols 4
                    indexBuffer.push(j + i*cols);
                    indexBuffer.push(j + (i+1)*cols);        
                }
                if (i < this.mallaNumFilas-1) {
                    indexBuffer.push((i+2)*cols - 1);   // ej 3x2 7
                    indexBuffer.push((i+1)*cols);       // ej 3x2 4
                }
            }
        
            // Creación e Inicialización de los buffers
        
            webgl_position_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBuffer), gl.STATIC_DRAW);
            webgl_position_buffer.itemSize = 3;
            webgl_position_buffer.numItems = positionBuffer.length / 3;
        
            webgl_normal_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer), gl.STATIC_DRAW);
            webgl_normal_buffer.itemSize = 3;
            webgl_normal_buffer.numItems = normalBuffer.length / 3;
        
            webgl_uvs_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
            webgl_uvs_buffer.itemSize = 2;
            webgl_uvs_buffer.numItems = uvBuffer.length / 2;
        
            webgl_index_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
            webgl_index_buffer.itemSize = 1;
            webgl_index_buffer.numItems = indexBuffer.length;
        
            return {
                webgl_position_buffer,
                webgl_normal_buffer,
                webgl_uvs_buffer,
                webgl_index_buffer
            }

        }

        this.generarMalla = function() {

            this.mallaDeTriangulos = this.getBuffers();
        }

        this.dibujarMalla = function(){
            

            // void glBindBuffer( GLenum target, GLuint buffer );
            // void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);

            // Se configuran los buffers que alimentaron el pipeline
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mallaDeTriangulos.webgl_position_buffer);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);
        
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mallaDeTriangulos.webgl_uvs_buffer);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);
        
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mallaDeTriangulos.webgl_normal_buffer);
            gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);
               
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mallaDeTriangulos.webgl_index_buffer);
        
            if (modo!="wireframe"){
                gl.uniform1i(shaderProgram.useLightingUniform,(lighting=="true"));                    
                gl.drawElements(gl.TRIANGLE_STRIP, this.mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
            }
            
            if (modo!="smooth") {
                gl.uniform1i(shaderProgram.useLightingUniform,false);
                gl.drawElements(gl.LINES, this.mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
            }
         
        }

    }

    Malla.prototype.setGrid = function(columnas, filas) {

        this.mallaNumCols = columnas;  
        this.mallaNumFilas = filas;
    }

    function Esfera(){
    
        Malla.call(this); 

        var _radio = 1;
    
        this.setRadio = function(radio) {
            _radio = radio;
        }
      
        this.getPosicion = function(u,v){
    
            var phi = u * Math.PI*2;  // azimuth 0-360
            var theta = v * Math.PI;  // colatitud 0-180
    
            var x = _radio * Math.sin(theta)*Math.cos(phi);
            var y = _radio * Math.cos(theta);
            var z = _radio * Math.sin(theta)*Math.sin(phi);
            
            return [x,y,z];
        }
    
        this.getNormal = function(u,v){    
    
            var phi = u * Math.PI*2;  // azimuth 0-360
            var theta = v * Math.PI;  // colatitud 0-180
    
            var x = _radio * Math.sin(theta)*Math.cos(phi);
            var y = _radio * Math.cos(theta);
            var z = _radio * Math.sin(theta)*Math.sin(phi);
    
            return [x,y,z];
        }
    
        this.getCoordenadasTextura = function(u,v){
            return [u,v];
        }
    }
    
    APP.inheritPrototypeChildParent(Esfera, Malla);
    
    function TuboSenoidal(){

        Malla.call(this); 
    
        var _amplitud = 0.1;
        var _longitud = 0.4;
        var _radio = 1;
        var _altura = 2;
        
        this.setAmplitud = function(amplitud){
            _amplitud = amplitud;
        }

        this.setLongitud = function(longitud){
            _longitud = longitud;
        }

        this.setRadio = function(radio){
            _radio = radio;
        }

        this.setAltura = function(altura){
            _altura = altura;
        }
       
        this.getPosicion = function(u,v){      
    
            var phi = u * Math.PI*2;  // azimuth 0-360
            var delta = v * Math.PI*2 / _longitud*_altura;  // 0 a 360*alt/long
    
            var r = _radio + _amplitud * Math.sin(delta);
    
            var x = r * Math.cos(phi);
            var y = -0.5 + _altura * v;
            var z = r * Math.sin(phi);
        
            return [x,y,z];
        }
    
        this.getNormal = function(u,v){    
    
            var phi = u * Math.PI*2;  // azimuth 0-360
    
            var x = Math.cos(phi);
            var y = -0.5 + _altura * v;
            var z = Math.sin(phi);
        
            return [x,y,z];
        }
    
        this.getCoordenadasTextura = function(u,v){
            return [u,v];
        }
    }

    APP.inheritPrototypeChildParent(TuboSenoidal, Malla);

    APP.Malla = Malla;
    APP.Esfera = Esfera;
    APP.TuboSenoidal = TuboSenoidal;

}());

