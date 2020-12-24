var APP =  APP || {};

(function(){

    function Discretizador(superficie3D, filasNiveles, colsVertices) {
    
        positionBuffer = [];
        normalBuffer = [];
        uvBuffer = [];
        indexBuffer=[];  
    
        for (var i=0; i <= filasNiveles; i++) {
            for (var j=0; j <= colsVertices; j++) {
    
                var u=j/colsVertices;
                var v=i/filasNiveles;
    
                var pos = superficie3D.getPosicion(u,v);
    
                positionBuffer.push(pos[0]);
                positionBuffer.push(pos[1]);
                positionBuffer.push(pos[2]);
    
                var nrm = superficie3D.getNormal(u,v);

                normalBuffer.push(nrm[0]);
                normalBuffer.push(nrm[1]);
                normalBuffer.push(nrm[2]);
    
                var uvs = superficie3D.getCoordenadasTextura(u,v);
    
                uvBuffer.push(uvs[0]);
                uvBuffer.push(uvs[1]);
    
            }
        }
            
        // ej grilla 3x2 indexBuffer=[0,4,1,5,2,6,3,7,  7,4,  4,8,5,9,6,10,7,11]; 
    
        var cols = colsVertices + 1;  // columnas=3 => cols=4 
    
        for (i = 0; i < filasNiveles; i++) {        // y ej 3x2 max 1
            for (j = 0; j < cols; j++) {            // x ej 3x2 max 3, cols 4
                indexBuffer.push(j + i*cols);
                indexBuffer.push(j + (i+1)*cols);        
            }
            if (i < this.filasNiveles-1) {
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

    APP.Discretizador = Discretizador;

}());

