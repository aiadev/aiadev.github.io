var APP =  APP || {};

(function(){

    function SuperficieDeBarridoNew(filas, columnas) {

        var _filas = filas;  
        var _columnas = columnas;

        var _formaFn = new APP.Curva();
        var _recorridoFn = new APP.Curva();

        var _escalaFormaFn = new APP.Curva();

        var _bHasTapaTop = true;
        var _bHasTapaBottom = true;6587
        var _bUseEscalaForma = false;

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

        // METODOS EN COMUN CON superficie3D
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
            
            vec3.transformMat4(p, p, m);

            return p;

        }
    
        this.getNormal = function(u,v){    

            return _recorridoFn.getNormal();

        }
    
        this.getCoordenadasTextura=function(u,v){

            return [u,v];

        }
            
        function getFormaPoint(pos) { // 0-1

            _formaFn.update(pos);
            
            var p = _formaFn.getPoint();

            // intercambio x-z para poner perpendicular la forma respecto del recorrido
            var pf = vec4.create();
            pf[0] = p[2];   
            pf[1] = p[1];
            pf[2] = p[0];
            pf[3] = 1; // coord homogeneas
            return pf;

        }
        
        function getBarridoMatrix(pos) { // 0-1
 
            var m = mat4.create();

            _recorridoFn.update(pos);
            var p = _recorridoFn.getPoint();
            mat4.fromTranslation(m, p);

            // var t = recorridoFn.getTangent();
            // var n = recorridoFn.getNormal();
            // var b = recorridoFn.getBinormal();

            // calculo cada vertice en su nivel
            // luego paso la normal al buffer directo de recorridoFn
 
            // console.log(m);

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
 
            _escalaFormaFn.update(pos);
            var p = _escalaFormaFn.getPoint();
            // var ps = vec4.fromValues(0,0,0);
            // ps[0] = p[2];
            // ps[1] = p[1];
            // ps[2] = p[0];
            var ps = p[1]; // coordenada y de la curva para valor escala
            // console.log(ps);
            return ps;
 
        }

        // adaptando a getBuffers
        this.getBuffers = function(){
            
            positionBuffer = [];
            normalBuffer = [];
            uvBuffer = [];
            indexBuffer=[];  

            var nivelInicio = 0;
            if (_bHasTapaBottom) nivelInicio = 1;
            var niveles = _filas;
            if (_bHasTapaTop) niveles = _filas-1;

            if (_bHasTapaBottom) {
                for (var j=0; j <= _columnas; j++) {
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
                for (var j=0; j <= _columnas; j++) {

                    var u = j/_columnas;
                    var v = n/_filas;

                    var pos = this.getPosicion(u,v);

                    // vec3.transformMat4(pos, pos, _matrix); // matriz objeto

                    positionBuffer.push(pos[0]);
                    positionBuffer.push(pos[1]);
                    positionBuffer.push(pos[2]);

                    // console.log("(uv "+u,v+"):"+pos[0], pos[1], pos[2]);

                    var nrm = this.getNormal(u,v);

                    // vec3.transformMat4(nrm, nrm, _matrix); // matriz objeto

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

                for (var j=0; j < _columnas*3; j+=3) {

                    var index = (_columnas+1)*3 + j;
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

                for (var j=0; j <= _columnas*3; j+=3) {
                    // promedio nivel 1 y completo los lugares reservados en el nivel 0 del buffer
                    var index = j;

                    positionBuffer[index]   = aver[0];
                    positionBuffer[index+1] = aver[1];
                    positionBuffer[index+2] = aver[2];
 
                    normalBuffer[index]   = naver[0];
                    normalBuffer[index+1] = naver[1];
                    normalBuffer[index+2] = naver[2];
                    
                    uvBuffer[countJ] = j/_columnas/3;
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
                
                for (var j=0; j < _columnas*3; j+=3) {
                    var index = _columnas*3 * _filas + j;
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
                for (var j=0; j <= _columnas*3; j+=3) {

                    positionBuffer.push(aver[0]);
                    positionBuffer.push(aver[1]);
                    positionBuffer.push(aver[2]);

                    normalBuffer.push(naver[0]);
                    normalBuffer.push(naver[1]);
                    normalBuffer.push(naver[2]);

                    uvBuffer.push(j/_columnas/3);
                    uvBuffer.push(1);
                }
            }


            // Buffer de indices de los triángulos
            // importante vaciar el array!
            indexBuffer=[];  

            // ej grilla 3x2 indexBuffer=[0,4,1,5,2,6,3,7,  7,4,  4,8,5,9,6,10,7,11]; 

            var cols = _columnas + 1;  // columnas=3 => cols=4 

            for (i = 0; i < _filas; i++) {               // y ej 3x2 max 1

                for (j = 0; j < cols; j++) {            // x ej 3x2 max 3, cols 4

                    indexBuffer.push(j + i*cols);
                    indexBuffer.push(j + (i+1)*cols);        

                }

                if (i < _filas-1) {

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
            var cb0 = [0.5  ,   -0.5,   0];
            var cb1 = [0.5  ,   0.5,    0];
            var cb2 = [-0.5 ,   0.5,    0];
            var cb3 = [-0.5    , -0.5,  0]; 
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

    APP.SuperficieDeBarridoNew = SuperficieDeBarridoNew;

}());