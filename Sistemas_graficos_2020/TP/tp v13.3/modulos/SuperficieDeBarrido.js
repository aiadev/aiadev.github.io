var APP =  APP || {};

(function(){

    function SuperficieDeBarrido() {

        this.mallaNumCols = 20;  
        this.mallaNumFilas = 20;
        this.mallaDeTriangulos;

        var formaFn = new APP.Curva();
        var recorridoFn = new APP.Curva();

        var escalaFormaFn = new APP.Curva();

        var positionBuffer;
        var normalBuffer;
        var uvBuffer;

        var _bHasTapaTop = true;
        var _bHasTapaBottom = true;
        var _bUseEscalaForma = false;

        var _matrix = mat4.create();

        var _name = "SupDeBarrido-NN";

        this.setHasTapaTop = function(tiene) {
            _bHasTapaTop = tiene;
        }

        this.setHasTapaBottom = function(tiene) {
            _bHasTapaBottom = tiene;
        }

        this.generarMalla = function() {
            this.mallaDeTriangulos = this.generarSuperficie();
        }

        this.setGrid = function(columnas, filas) {
            this.mallaNumCols = columnas;  
            this.mallaNumFilas = filas;
        }

        this.setName = function(_name) {
            name = _name;
        }

        this.getName = function() {
            return _name;
        }
      
        this.setForma = function(_formaType, _formaParameters) {            
            formaFn.set(_formaType, _formaParameters); 
            // console.log(name+" forma set: "+ _formaType + " "+_formaParameters);            
        }

        this.setRecorrido = function(_recorridoType, _recorridoParameters) {
            recorridoFn.set(_recorridoType, _recorridoParameters); 
            // console.log(name+" recorrido: "+ _recorridoType + " "+_recorridoParameters);
        }

        this.setEscalaForma = function(_escalaFormaType, _escalaFormaParameters) {
            escalaFormaFn.set(_escalaFormaType, _escalaFormaParameters); 
            _bUseEscalaForma = true;           
            // console.log(name+" escala forma set: "+ _escalaFormaType + " "+_escalaFormaParameters); 
        }

        // this.setEscalaRecorrido = function(_escalaRecType, _escalaRecParameters) {
        //     escalaRecorridoFn.set(_recorridoType, _recorridoParameters); 
        //     console.log(name+" escala rec set: "+ _escalaRecType + " "+_escalaRecParameters);            
        // }

        this.applyMatrixToMesh = function(m) {
            mat4.copy(_matrix, m);
            this.mallaDeTriangulos = this.generarMalla();
        }

        // METODOS EN COMUN CON superficie
        this.getPosicion=function(u,v){

            var p = vec3.create();
            var m = mat4.create();

            p = getFormaPoint(u); 
            m = getBarridoMatrix(v);

            if (_bUseEscalaForma) {
                var s = getEscalaFormaPoint(v);
                var sv = vec3.fromValues(s,s,s);
                mat4.scale(m,m,sv);
            }
            
            // mat4.multiply(p,m,m);
            
            // vec3.transformMat4(p, vec3.fromValues(0,0,0),p); // matriz objeto

            vec3.transformMat4(p, p, m);

            return p;
        }
    
        this.getNormal = function(u,v){    
            return recorridoFn.getNormal();
        }
    
        this.getCoordenadasTextura=function(u,v){
            return [u,v];
        }
            
        function getFormaPoint(pos) { // 0-1

            formaFn.update(pos);
            
            var p = formaFn.getPoint();

            // p = vec3.rotateY(p,p,p,Math.PI*0.5);

            // BUG?? intercambio x-z para poner perpendicular la forma con respecto al recorrido
            var pf = vec4.fromValues(0,0,0,1);
            pf[0] = p[2];   
            pf[1] = p[1];
            pf[2] = p[0];
            return pf;

            // var m = mat4.create();
            // mat4.fromTranslation(m, p);
            // mat4.rotate(m,m, Math.PI/2, vec3.fromValues(0,1,0));

            // MATRIZ
            // return p;
        }
        
        function getBarridoMatrix(pos) { // 0-1
 
            // var m = mat4.create();

            recorridoFn.update(pos);

            var p = recorridoFn.getPoint();
 
            // VER SI ESTO ESTA OK O SI ESTA MATRIZ SE APLICA EN SHADER
            // mat4.translate(m,m,p);

            var m = mat4.create();
            mat4.fromTranslation(m, p);

            // var t = recorridoFn.getTangent();
            // var n = recorridoFn.getNormal();
            // var b = recorridoFn.getBinormal();

            // calculo cada vertice en su nivel
            // luego paso la normal al buffer directo de recorridoFn

 
            // console.log(m);

            // console.log("superf");
            // console.log(p);
            // console.log(t);
            // console.log(n);
            // console.log(b); 

            // matriz N B T P (ver implementacion)
            // //    set(out, m00, m01, m02, m03, 
            // //             m10, m11, m12, m13, 
            // //             m20, m21, m22, m23, 
            // //             m30, m31, m32, m33) → {mat4}

            //     mat4.set(m,  n[0], n[1], n[2], 0,
            //                 b[0], b[1], b[2], 0,
            //                 t[0], t[1], t[2], 0,
            //                 p[0], p[1], p[2], 1);

            return m;
        }

        function getEscalaFormaPoint(pos) { // 0-1
 
            escalaFormaFn.update(pos);
            var p = escalaFormaFn.getPoint();
            // var ps = vec4.fromValues(0,0,0);
            // ps[0] = p[2];
            // ps[1] = p[1];
            // ps[2] = p[0];
            var ps = p[1]; // coordenada y de la curva para valor escala
            // console.log(ps);
            return ps;
 
        }

        this.generarSuperficie = function(){
            
            positionBuffer = [];
            normalBuffer = [];
            uvBuffer = [];

            var nivelInicio = 0;
            if (_bHasTapaBottom) nivelInicio = 1;
            var niveles = this.mallaNumFilas;
            if (_bHasTapaTop) niveles = this.mallaNumFilas-1;

            if (_bHasTapaBottom) {
                for (var j=0; j <= this.mallaNumCols; j++) {
                    // reserva de lugares en el buffer
                    positionBuffer.push(0);
                    positionBuffer.push(0);
                    positionBuffer.push(0);
                    normalBuffer.push(0);
                    normalBuffer.push(0);
                    normalBuffer.push(0);
                    uvBuffer.push(0);
                    uvBuffer.push(0);
                }
            }

            for (var i=nivelInicio; i <= niveles; i++) {
                for (var j=0; j <= this.mallaNumCols; j++) {

                    var u=j/this.mallaNumCols;
                    var v=i/this.mallaNumFilas;

                    var pos = this.getPosicion(u,v);

                    vec3.transformMat4(pos, pos, _matrix); // matriz objeto

                    positionBuffer.push(pos[0]);
                    positionBuffer.push(pos[1]);
                    positionBuffer.push(pos[2]);

                    // console.log("(uv "+u,v+"):"+pos[0], pos[1], pos[2]);

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

            if (_bHasTapaBottom) {
                var x = 0;
                var y = 0;
                var z = 0;

                var nx = 0;
                var ny = 0;
                var nz = 0;

                var count=0;

                for (var j=0; j < this.mallaNumCols*3; j+=3) {

                    var index = (this.mallaNumCols+1)*3 + j;
                    // puntos
                    x += positionBuffer[index];
                    y += positionBuffer[index+1];
                    z += positionBuffer[index+2];
                    // normales
                    nx += normalBuffer[index];
                    ny += normalBuffer[index+1];
                    nz += normalBuffer[index+2];
                    count++;         
                }

                var aver = vec3.fromValues(x/count, y/count, z/count);               
                var naver = vec3.fromValues(nx/count, ny/count, nz/count);               

                var countJ = 0;

                for (var j=0; j <= this.mallaNumCols*3; j+=3) {
                    // promedio nivel 1 y completo los lugares reservados en el nivel 0 del buffer
                    var index = j;

                    positionBuffer[index]   = aver[0];
                    positionBuffer[index+1] = aver[1];
                    positionBuffer[index+2] = aver[2];
 
                    normalBuffer[index]   = naver[0];
                    normalBuffer[index+1] = naver[1];
                    normalBuffer[index+2] = naver[2];
                    
                    uvBuffer[countJ] = j/this.mallaNumCols/3;
                    countJ++;
                    uvBuffer[countJ] = 0;
                    countJ++;
                }
            }


            if (_bHasTapaTop) {
                var x = 0;
                var y = 0;
                var z = 0;

                var nx = 0;
                var ny = 0;
                var nz = 0;

                var count=0;
                
                for (var j=0; j < this.mallaNumCols*3; j+=3) {
                    var index = this.mallaNumCols*3 * this.mallaNumFilas + j;
                    // puntos
                    x += positionBuffer[index];
                    y += positionBuffer[index+1];
                    z += positionBuffer[index+2];
                    // normales
                    nx += normalBuffer[index];
                    ny += normalBuffer[index+1];
                    nz += normalBuffer[index+2];
                    count++;                        
                }
                var aver = vec3.fromValues(x/count, y/count, z/count);               
                var naver = vec3.fromValues(nx/count, ny/count, nz/count);               
                for (var j=0; j <= this.mallaNumCols*3; j+=3) {

                    positionBuffer.push(aver[0]);
                    positionBuffer.push(aver[1]);
                    positionBuffer.push(aver[2]);

                    normalBuffer.push(naver[0]);
                    normalBuffer.push(naver[1]);
                    normalBuffer.push(naver[2]);

                    uvBuffer.push(j/this.mallaNumCols/3);
                    uvBuffer.push(1);
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

        this.dibujarMalla = function(){
            
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

        this.setDefault = function() {
            // var bez2lin1y = [ [-0.5,0.2,0], [0.5,1,0], [0.5,0.2,0]];
            var cb0 = [0.5  ,   -0.5,   0];
            var cb1 = [0.5  ,   0.5,    0];
            var cb2 = [-0.5 ,   0.5,    0];
            var cb3 = [-0.5    , -0.5,      0]; 
            var cbs3 = [cb0,cb1,cb2,cb3,cb0,cb1,cb2];
            var bez2arc = [ [-1,0,0], [1,0,0] , [1,0,0]];
            
            
            
            this.setForma("bspline3-tramos", cbs3);
            // this.setRecorrido("bezier2", bez2arc);
            // this.setEscalaForma("bezier2", bez2lin1y);   
            
            var bez2lin1y = [ [-0.5,0.2,0], [0.5,0.2,0], [0.5,0.2,0]];
            
            // this.setForma("bezier2", bez2arc);
            this.setRecorrido("bezier2", bez2arc);
            // this.setEscalaForma("bezier2", bez2arc);   

        }
        
        this.setDefault();
    }

    APP.SuperficieDeBarrido = SuperficieDeBarrido;

}());