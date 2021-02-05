var APP =  APP || {};

(function(){

    function SuperficieDeBarrido() {

        var _formaFn = new APP.Curva();
        var _recorridoFn = new APP.Curva();

        var _supNormal = vec3.create();
        var _supPoint = vec3.create();
        var _supU;
        var _supV;

        var _escalaFormaFn = new APP.Curva();

        var _bHasTapaTop = true;
        var _bHasTapaBottom = true;
        var _bUseEscalaForma = false;

        var _bInverseNormals = false;

        var _matrix = mat4.create();

        var _name = "SupDeBarrido-NN";

        this.setHasTapaBottomTop = function(hasBottom, hasTop) {

            _bHasTapaBottom = hasBottom;
            _bHasTapaTop = hasTop;

        }

        this.setHasTapaTop = function(tiene) {

            _bHasTapaTop = tiene;

        }

        this.setHasTapaBottom = function(tiene) {

            _bHasTapaBottom = tiene;

        }

        this.setName = function(name) {

            _name = name;

        }

        this.getName = function() {

            return _name;

        }
      
        this.setForma = function(formaType, formaParameters) {            

            _formaFn.set(formaType, formaParameters); 

        }

        this.setRecorrido = function(recorridoType, recorridoParameters) {

            _recorridoFn.set(recorridoType, recorridoParameters); 

        }

        this.setEscalaForma = function(escalaFormaType, escalaFormaParameters) {

            _escalaFormaFn.set(escalaFormaType, escalaFormaParameters); 
            _bUseEscalaForma = true;           

        }

        this.update = function(u,v){

            _formaFn.update(u);
            _recorridoFn.update(v);

            var p = _formaFn.getPoint();
            var m = getBarridoMatrix();

            if (_bUseEscalaForma) {

                _escalaFormaFn.update(v);
                var s = _escalaFormaFn.getPoint()[1]; // coord en y
                var sv = vec3.fromValues(s,s,s);
                mat4.scale(m,m,sv);
            }

            _supPoint = vec3.transformMat4(_supPoint, p, m);

            _supNormal = vec3.cross(_supNormal, _formaFn.getNormal(), _recorridoFn.getNormal());

            

            if (_bInverseNormals) {

                // _supNormal = vec3.inverse(_supNormal, _supNormal);

                // _supNormal[0] = -_supNormal[0];
                // _supNormal[1] = -_supNormal[1];
                // _supNormal[2] = -_supNormal[2];

            }

            _supU = u;
            _supV = v;

        }

        this.getPosicion = function(){
        
            return _supPoint;

        }

        this.getNormal = function(){    

            return _supNormal;

        }

        this.inverseNormals = function() {

            _bInverseNormals = true;

        }
    
        this.getCoordenadasTextura = function(){

            return [_supU, _supV];

        }
        
        function getBarridoMatrix() { // 0-1
 
            var m = mat4.create();

            var p = _recorridoFn.getPoint();
            var t = _recorridoFn.getTangent();
            var n = _recorridoFn.getNormal();
            var b = _recorridoFn.getBinormal();

            // matriz N B T P
            // //    set(out, m00, m01, m02, m03, 
            // //             m10, m11, m12, m13, 
            // //             m20, m21, m22, m23, 
            // //             m30, m31, m32, m33) → {mat4}

            mat4.set(m, n[0], n[1], n[2], 0,
                        b[0], b[1], b[2], 0,
                        t[0], t[1], t[2], 0,
                        p[0], p[1], p[2], 1);

            return m;
            
        }

        // DISCRETIZADOR DE CURVAS
        this.getBuffers = function(segmentosForma, nivelesRecorrido){
            
            positionBuffer = [];
            normalBuffer = [];
            uvBuffer = [];
            indexBuffer=[];  

            var nivelInicio = 0;
            var niveles = nivelesRecorrido;

            if (_bHasTapaBottom) nivelInicio = 1;

            if (_bHasTapaTop) niveles = nivelesRecorrido-1;

            if (_bHasTapaBottom) {

                for (var j=0; j <= segmentosForma; j++) {

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

            for (var n=nivelInicio; n <= niveles; n++) {
                for (var j=0; j <= segmentosForma; j++) {

                    var u = j/segmentosForma;
                    var v = n/nivelesRecorrido;

                    this.update(u,v);

                    var pos = this.getPosicion();

                    positionBuffer.push(pos[0]);
                    positionBuffer.push(pos[1]);
                    positionBuffer.push(pos[2]);

                    var nrm = this.getNormal();

                    normalBuffer.push(nrm[0]);
                    normalBuffer.push(nrm[1]);
                    normalBuffer.push(nrm[2]);

                    var uvs = this.getCoordenadasTextura();

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

                for (var j=0; j < segmentosForma*3; j+=3) {

                    var index = (segmentosForma+1)*3 + j;
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

                var normalBottom = [-1,0,0];

                for (var j=0; j <= segmentosForma*3; j+=3) {
                    // promedio nivel 1 y completo los lugares reservados en el nivel 0 del buffer
                    var index = j;

                    positionBuffer[index]   = aver[0];
                    positionBuffer[index+1] = aver[1];
                    positionBuffer[index+2] = aver[2];
 
                    normalBuffer[index]   = normalBottom[0];
                    normalBuffer[index+1] = normalBottom[1];
                    normalBuffer[index+2] = normalBottom[2];
                    
                    uvBuffer[countJ] = j/3/segmentosForma;
                    countJ++;
                    uvBuffer[countJ] = 0;
                    countJ++;
                }

                for (var j=0; j <= segmentosForma*3; j+=3) {
                    // promedio nivel 1 y completo los lugares reservados en el nivel 0 del buffer
                    var index1 = segmentosForma*3+j;
 
                    normalBuffer[index1]   = normalBottom[0];
                    normalBuffer[index1+1] = normalBottom[1];
                    normalBuffer[index1+2] = normalBottom[2];
                    
                    uvBuffer[countJ] = j/3/segmentosForma;
                    countJ++;
                    uvBuffer[countJ] = 1/nivelesRecorrido;
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
                
                for (var j=0; j < segmentosForma*3; j+=3) {
                    var index = segmentosForma*3 * nivelesRecorrido + j;
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
                for (var j=0; j <= segmentosForma*3; j+=3) {

                    positionBuffer.push(aver[0]);
                    positionBuffer.push(aver[1]);
                    positionBuffer.push(aver[2]);

                    normalBuffer.push(naver[0]);
                    normalBuffer.push(naver[1]);
                    normalBuffer.push(naver[2]);

                    uvBuffer.push(j/segmentosForma/3);
                    uvBuffer.push(1);
                }
            }

            // Buffer de indices de los triángulos
            // importante vaciar el array!
            indexBuffer=[];  

            // ej grilla 3x2 indexBuffer=[0,4,1,5,2,6,3,7,  7,4,  4,8,5,9,6,10,7,11]; 

            var cols = segmentosForma + 1;  // columnas=3 => cols=4 

            for (i = 0; i < nivelesRecorrido; i++) {               // y ej 3x2 max 1

                for (j = 0; j < cols; j++) {            // x ej 3x2 max 3, cols 4

                    indexBuffer.push(j + i*cols);
                    indexBuffer.push(j + (i+1)*cols);        

                }

                if (i < nivelesRecorrido-1) {

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

        this.setDefault = function() {

            // var bez2lin1y = [ [-0.5,0.2,0], [0.5,1,0], [0.5,0.2,0]];
            var cb0 = [0.5 , -0.5,  0];
            var cb1 = [0.5 ,  0.5,  0];
            var cb2 = [-0.5,  0.5,  0];
            var cb3 = [-0.5, -0.5,  0]; 
            var cbs3 = [cb0,cb1,cb2,cb3,cb0,cb1,cb2];
            var bez2arc = [ [-1,0,0], [1,0,0] , [1,0,0]];
                 
            this.setForma("bspline3-tramos", cbs3);
            // this.setRecorrido("bezier2", bez2arc);
            // this.setEscalaForma("bezier2", bez2lin1y);   
            
            var bez2lin1y = [ [-0.5,0.2,0], [0.5,0.2,0], [0.5,0.2,0]];
            
            // this.setForma("bezier2", bez2arc);
            this.setRecorrido("bezier2", bez2lin1y);
            // this.setEscalaForma("bezier2", bez2arc);   

        }
        
        this.setDefault();
    }

    APP.SuperficieDeBarrido = SuperficieDeBarrido;

}());