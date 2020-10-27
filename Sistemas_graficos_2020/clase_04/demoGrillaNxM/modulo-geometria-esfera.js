

/*

    Tareas:
    ------

    1) Modificar a función "generarSuperficie" para que tenga en cuenta los parametros filas y columnas al llenar el indexBuffer
       Con esta modificación deberían poder generarse planos de N filas por M columnas

    2) Modificar la funcion "dibujarMalla" para que use la primitiva "triangle_strip"

    3) Crear nuevos tipos funciones constructoras de superficies

        3a) Crear la función constructora "Esfera" que reciba como parámetro el radio

        3b) Crear la función constructora "TuboSenoidal" que reciba como parámetro la amplitud de onda, longitud de onda, radio del tubo y altura.
        (Ver imagenes JPG adjuntas)
        
        
    Entrega:
    -------

    - Agregar una variable global que permita elegir facilmente que tipo de primitiva se desea visualizar [plano,esfera,tubosenoidal]
    
*/

// var primitiva = "plano"; // plano, esfera, tuboSenoidal
var primitiva = "esfera";
// var primitiva = "tuboSenoidal";

var superficie3D;
var mallaDeTriangulos;

var columnas = 36;  
var filas = 36;

function crearGeometria(){
        
    if (primitiva == "tuboSenoidal") superficie3D = new TuboSenoidal(0.1,0.4,1,2); //amp, long, radio, altura
    else if (primitiva == "esfera") superficie3D = new Esfera(1.2); // radio
    else superficie3D = new Plano(3,3);                             // ancho, largo

    mallaDeTriangulos=generarSuperficie(superficie3D,filas,columnas);
    
}

function dibujarGeometria(){

    dibujarMalla(mallaDeTriangulos);

}

function Plano(ancho,largo){

    this.getPosicion=function(u,v){

        var x=(u-0.5)*ancho;
        var z=(v-0.5)*largo;
        return [x,0,z];
    }

    this.getNormal=function(u,v){
        return [0,1,0];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

function Esfera(radio){

    this.getPosicion=function(u,v){

        var phi = u * Math.PI*2;  // azimuth 0-360
        var theta = v * Math.PI;  // colatitud 0-180

        var x = radio * Math.sin(theta)*Math.cos(phi);
        var y = radio * Math.cos(theta);
        var z = radio * Math.sin(theta)*Math.sin(phi);
        
        return [x,y,z];
    }

    this.getNormal=function(u,v){    

        var phi = u * Math.PI*2;  // azimuth 0-360
        var theta = v * Math.PI;  // colatitud 0-180

        var x = radio * Math.sin(theta)*Math.cos(phi);
        var y = radio * Math.cos(theta);
        var z = radio * Math.sin(theta)*Math.sin(phi);

        return [x,y,z];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}

//amplitud de onda, longitud de onda, radio del tubo y altura
function TuboSenoidal(amplitud,longitud,radio,altura){

    this.getPosicion=function(u,v){      

        var phi = u * Math.PI*2;  // azimuth 0-360
        var delta = v * Math.PI*2 / longitud*altura;  // 0 a 360*alt/long

        var r = radio + amplitud * Math.sin(delta);

        var x = r * Math.cos(phi);
        var y = -0.5 + altura * v;
        var z = r * Math.sin(phi);
      
        return [x,y,z];
    }

    this.getNormal=function(u,v){    

        var phi = u * Math.PI*2;  // azimuth 0-360

        var x = Math.cos(phi);
        var y = -0.5 + altura * v;
        var z = Math.sin(phi);
      
        return [x,y,z];
    }

    this.getCoordenadasTextura=function(u,v){
        return [u,v];
    }
}


function generarSuperficie(superficie,filas,columnas){
    
    positionBuffer = [];
    normalBuffer = [];
    uvBuffer = [];

    for (var i=0; i <= filas; i++) {
        for (var j=0; j <= columnas; j++) {

            var u=j/columnas;
            var v=i/filas;

            var pos=superficie.getPosicion(u,v);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm=superficie.getNormal(u,v);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            var uvs=superficie.getCoordenadasTextura(u,v);

            uvBuffer.push(uvs[0]);
            uvBuffer.push(uvs[1]);

        }
    }

    // Buffer de indices de los triángulos
    // importante vaciar el array!
    indexBuffer=[];  

    // ej grilla 3x2 indexBuffer=[0,4,1,5,2,6,3,7,  7,4,  4,8,5,9,6,10,7,11]; 

    var cols = columnas + 1;  // columnas=3 => cols=4 

    for (i = 0; i < filas; i++) {               // y ej 3x2 max 1
        for (j = 0; j < cols; j++) {            // x ej 3x2 max 3, cols 4
            indexBuffer.push(j + i*cols);
            indexBuffer.push(j + (i+1)*cols);        
        }
        if (i < filas-1) {
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

function dibujarMalla(mallaDeTriangulos){
    
    // Se configuran los buffers que alimentaron el pipeline
    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_position_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_uvs_buffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_normal_buffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);
       
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mallaDeTriangulos.webgl_index_buffer);


    if (modo!="wireframe"){
        gl.uniform1i(shaderProgram.useLightingUniform,(lighting=="true"));                    
        gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
    
    if (modo!="smooth") {
        gl.uniform1i(shaderProgram.useLightingUniform,false);
        gl.drawElements(gl.LINES, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
 
}

