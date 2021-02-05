// atributos del vértice (cada uno se alimenta de un ARRAY_BUFFER distinto)

attribute vec3 aPosition;   //posicion (x,y,z)
attribute vec3 aNormal;     //vector normal (x,y,z)
attribute vec2 aUv;         //coordenadas de texture (x,y)  x e y (en este caso) van de 0 a 1

// variables Uniform (son globales a todos los vértices y de solo-lectura)

uniform mat4 uMMatrix;     // matriz de modelado
uniform mat4 uVMatrix;     // matriz de vista
uniform mat4 uPMatrix;     // matriz de proyección
uniform mat3 uNMatrix;     // matriz de normales
                
uniform float time;                         // tiempo en segundos

uniform sampler2D uSampler;                 // sampler de textura de la tierra
uniform sampler2D uSamplerHeightmap;        // sampler de altura

uniform vec3 uCeldaCentralPos;  // posicion del helicoptero ya pasada a celdas
uniform float uCeldaSize;       // tamaño de la celda

// variables varying (comunican valores entre el vertex-shader y el fragment-shader)
// Es importante remarcar que no hay una relacion 1 a 1 entre un programa de vertices y uno de fragmentos
// ya que por ejemplo 1 triangulo puede generar millones de pixeles (dependiendo de su tamaño en pantalla)
// por cada vertice se genera un valor de salida en cada varying.
// Luego cada programa de fragmentos recibe un valor interpolado de cada varying en funcion de la distancia
// del pixel a cada uno de los 3 vértices. Se realiza un promedio ponderado

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;         
                 
const float PI=3.141592653;

void main(void) {
            
    vec3 position = aPosition;		
    vec3 normal = aNormal;	
    vec2 uv = aUv ;

    #ifdef TERRENO

        uv = uv * 0.3; // para celdas 3x3

        uv.s = uv.s - (uCeldaCentralPos.z * 0.1);
        uv.t = uv.t + (uCeldaCentralPos.x * 0.1);

        position.y = uv.s-0.2;
        position.x = uv.t-0.1;

    #endif

    vec4 textureColor = texture2D(uSampler, vec2(uv.s, uv.t));         
    
    vec4 textureHeight = texture2D(uSamplerHeightmap, vec2(uv.s, uv.t));         
    
    #ifdef TERRENO

//       position.y += normal.y*min(textureHeight.r*0.5,10.0);;    

       position.z = textureHeight.r*0.025;    

    #endif

    vec4 worldPos = uMMatrix*vec4(position, 1.0);                        

    gl_Position = uPMatrix*uVMatrix*worldPos;

    vWorldPosition = worldPos.xyz;              
    vNormal = normalize(uNMatrix * aNormal);
    vUv = uv;	

}