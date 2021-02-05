var APP =  APP || {};

(function(){

    function inheritPrototype(child, parent) {

        // basicamente, child copia a su prototype todas las propiedades del prototype de parent, pero conserva su propio constructor
        // esta funcion debe ser aplicada sobre "funciones" contructoras, NO sobre instancias de objetos
        
        var copyOfParent = Object.create(parent.prototype); // Object.create, devuelve un objeto con las propiedades de aquel pasado por parámetro
                                                            // Se copiaron todas las propiedades de parent.prototype ---> a ---> copyOfParent
        
        copyOfParent.constructor = child; 				    // pero nosotros queremos heredar todas las propiedades conservando el constructor original
                                                                
        child.prototype = copyOfParent;   					// finalmente este es el nuevo prototype de child

    }

    APP.inheritPrototypeChildParent = inheritPrototype;

})();

// ver ejemplo completo en demoJavascriptBasico / jsHerencia

// en HIJO
//Padre.call(this); 	// Esto es fundamental!, tengo que llamar explicitamente al constructor de la clase padre
// Pero tengo que pasarle una referencia al objeto mismo ("this") 
// el metodo .call(contexto) sirve para llamar a cualquier función con un contexto especifico
// en este caso llamo a Forma() pero la funcion va a operar sobre el objeto que le paso como referencia


// USO: inheritPrototype(Hijo, Padre);

// esta funcion debe ser aplicada sobre "funciones" contructoras, NO sobre instancias de objetos


// OJO!!! defino el padre, luego defino el hijo
// y despues de definir todo (incluidas funciones .prototype)
// recien ahi uso la funcion para copiar el prototipo al hijo

// inheritPrototype(Hijo, Padre);   // Defino la relacion de herencia,  
									   // IMPORTANTE, tener cuidado en cuando se ejecuta esta función
									   // porque va a sobreescribir Rectangulo.prototype
									   // por eso hay que ejecutarla ANTES de definir las funciones 
									   // especificas de Rectangulo.prototype									   

                                       // Para profundizar en tema de constructores, ver el siguiente link 
// http://addyosmani.com/resources/essentialjsdesignpatterns/book/#constructorpatternjavascript
