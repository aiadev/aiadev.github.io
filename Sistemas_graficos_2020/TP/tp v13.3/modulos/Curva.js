"use strict"
var APP =  APP || {};

(function(){
    
    function Curva() {

        var _tipo, _modo, _puntosDeControl;
        var _fnCurva, _fnCurvaDer;      
        
        var Base0,Base1,Base2,Base3;
        var Base0der,Base1der,Base2der,Base3der;
       
        var _der = vec3.create();
        var _punto = vec3.create();
        var _normal = vec3.create();
        var _tangente = vec3.create();
        var _binormal = vec3.create();

        function setBases(cuales) { // bezier2, bezier3, bspline2, bspline3
            
            // Definimos las Bases de Berstein, dependen de u
            if (cuales=="bezier3"){
                Base0=function(u) { return (1-u)*(1-u)*(1-u); }  // 1*(1-u) - u*(1-u) = 1-2u+u2  ,  (1-2u+u2) - u +2u2- u3 ,  1 - 3u +3u2 -u3
                Base1=function(u) { return (3*(1-u)*(1-u)*u); } // 3*(1-u)*(u-u2) , 3*(u-u2-u2+u3), 3u -6u2+2u3
                Base2=function(u) { return (3*(1-u)*u*u);} //3u2-3u3
                Base3=function(u) { return (u*u*u); }

                // bases derivadas
                Base0der=function(u) { return (-3*u*u+6*u-3);} //-3u2 +6u -3
                Base1der=function(u) { return (9*u*u-12*u+3); }  // 9u2 -12u +3
                Base2der=function(u) { return (-9*u*u+6*u);}		 // -9u2 +6u
                Base3der=function(u) { return (3*u*u); }			// 3u2          
            
            } else if (cuales=="bspline3"){	
            
                Base0=function(u) { return ((1-3*u+3*u*u-u*u*u)*1/6);}  // (1 -3u +3u2 -u3)/6
                Base1=function(u) { return ((4-6*u*u+3*u*u*u)*1/6); }  // (4  -6u2 +3u3)/6
                Base2=function(u) { return ((1+3*u+3*u*u-3*u*u*u)*1/6);} // (1 -3u +3u2 -3u3)/6
                Base3=function(u) { return ((u*u*u)*1/6); }  //    u3/6

                // bases derivadas
                Base0der=function(u) { return ((-3 +6*u -3*u*u)/6) }  // (-3 +6u -3u2)/6
                Base1der=function(u) { return ((-12*u+9*u*u)/6) }   // (-12u +9u2)  /6
                Base2der=function(u) { return ((3+6*u-9*u*u)/6);}	// (-3 +6u -9u2)/6
                Base3der=function(u) { return ((3*u*u)*1/6); }	
            
            } else if (cuales=="bezier2"){
            
                Base0=function(u) { return (1-u)*(1-u);} 	// (1-u)^2
                Base1=function(u) { return (2*u*(1-u)); }	// 2*u*(1-u)
                Base2=function(u) { return (u*u);}			// u^2

                // bases derivadas
                Base0der=function(u) { return (-2+2*u); } 
                Base1der=function(u) { return (2-4*u); }  
                Base2der=function(u) { return (2*u); }	
            
            } else if (cuales=="bspline2"){	
            
                Base0=function(u) { return (0.5*(1-u)*(1-u));}   // 0.5*(1-u)^2
                Base1=function(u) { return (0.5+u*(1-u));} 		// 0.5+ u*(1-u)
                Base2=function(u) { return (0.5*u*u); } 			// 0.5*u^2           

                // bases derivadas
                Base0der=function(u) { return (-1+u);}  	//
                Base1der=function(u) { return (1-2*u);} 
                Base2der=function(u) { return  (u);}            
            
            }
        
        }

        var curvaCuadratica = function(u,puntosDeControl){
        
            var p0=puntosDeControl[0];
            var p1=puntosDeControl[1];
            var p2=puntosDeControl[2];
            var punto= vec3.create();

            punto[0] = Base0(u)*p0[0]+Base1(u)*p1[0]+Base2(u)*p2[0];
            punto[1] = Base0(u)*p0[1]+Base1(u)*p1[1]+Base2(u)*p2[1];
            punto[2] = Base0(u)*p0[2]+Base1(u)*p1[2]+Base2(u)*p2[2];

            return punto;
        
        }

        var curvaCubica = function (u,puntosDeControl){
        
            var p0 = puntosDeControl[0];
            var p1 = puntosDeControl[1];
            var p2 = puntosDeControl[2];
            var p3 = puntosDeControl[3];
            var punto= vec3.create();

            punto[0] = Base0(u)*p0[0]+Base1(u)*p1[0]+Base2(u)*p2[0]+Base3(u)*p3[0];
            punto[1] = Base0(u)*p0[1]+Base1(u)*p1[1]+Base2(u)*p2[1]+Base3(u)*p3[1];
            punto[2] = Base0(u)*p0[2]+Base1(u)*p1[2]+Base2(u)*p2[2]+Base3(u)*p3[2];

            return punto;
        
        }

        var curvaCubicaDerivadaPrimera = function (u,puntosDeControl){
        
            var p0 = puntosDeControl[0];
            var p1 = puntosDeControl[1];
            var p2 = puntosDeControl[2];
            var p3 = puntosDeControl[3];
            var punto= vec3.create();

            punto[0] = Base0der(u)*p0[0]+Base1der(u)*p1[0]+Base2der(u)*p2[0]+Base3der(u)*p3[0];
            punto[1] = Base0der(u)*p0[1]+Base1der(u)*p1[1]+Base2der(u)*p2[1]+Base3der(u)*p3[1];
            punto[2] = Base0der(u)*p0[2]+Base1der(u)*p1[2]+Base2der(u)*p2[2]+Base3der(u)*p3[2];

            return punto;
        
        }
            
        var curvaCuadraticaDerivadaPrimera = function (u,puntosDeControl){
        
            var p0=puntosDeControl[0];
            var p1=puntosDeControl[1];
            var p2=puntosDeControl[2];		
            var punto= vec3.fromValues(0,0,0);

            punto[0] = Base0der(u)*p0[0]+Base1der(u)*p1[0]+Base2der(u)*p2[0];
            punto[1] = Base0der(u)*p0[1]+Base1der(u)*p1[1]+Base2der(u)*p2[1];
            punto[2] = Base0der(u)*p0[2]+Base1der(u)*p1[2]+Base2der(u)*p2[2];

            return punto;
        
        }	

        function useBspline2Tramos(u,puntosDeControl){
        
            var numTramos = puntosDeControl.length-2; // 6-2 = 4
            var ut = u * numTramos;     // mapeo u(0-1) en el rango de ut(0-numTramos)
            var utf = Math.floor(ut);   // parte entera = en qué tramo estoy
            var utp = ut-utf;           // resto = dentro de ese tramo, en qué posición(0-1) estoy
            if (utf >= numTramos) {     // caso particular: para que no busque puntos que no existen
                utf = numTramos-1;
                utp = 1; 
            }
            var puntosTramo = [ puntosDeControl[utf], puntosDeControl[utf+1],puntosDeControl[utf+2] ];
            var tramoCurva = {
                uTramo: utp,
                puntosTramo: puntosTramo
            }
            return tramoCurva;
            
        }

        function useBspline3Tramos(u,puntosDeControl){
        
            var numTramos = puntosDeControl.length-3; // 6-3 = 3
            var ut = u * numTramos;     // mapeo u(0-1) en el rango de ut(0-numTramos)
            var utf = Math.floor(ut);   // parte entera = en qué tramo estoy
            var utp = ut-utf;           // resto = dentro de ese tramo, en qué posición(0-1) estoy
            if (utf >= numTramos) {     // caso particular: para que no busque puntos que no existen
                utf = numTramos-1;
                utp = 1; 
            }
            var puntosTramo = [ puntosDeControl[utf], puntosDeControl[utf+1],puntosDeControl[utf+2],puntosDeControl[utf+3] ];
            var tramoCurva = {
                uTramo: utp,
                puntosTramo: puntosTramo
            }
            return tramoCurva;
        
        }

        this.set = function(tipo, puntosDeControl) {
        
            _tipo = tipo;
            _puntosDeControl = puntosDeControl;

            if (_tipo == "bezier3" || _tipo == "bspline3"|| _tipo == "bspline3-tramos") {

                _modo = "cubica";
                _fnCurva = curvaCubica;
                _fnCurvaDer = curvaCubicaDerivadaPrimera;

            } else if (_tipo == "bezier2" || _tipo == "bspline2" || _tipo == "bspline2-tramos") {

                _modo = "cuadratica";
                _fnCurva = curvaCuadratica;
                _fnCurvaDer = curvaCuadraticaDerivadaPrimera;

            }

            if (_tipo == "bspline2-tramos") setBases("bspline2");
            else if (_tipo == "bspline3-tramos") setBases("bspline3");
            else setBases(_tipo);
        
        }
        
        this.update = function(u) {
        
            if (_tipo == "bspline2-tramos") {
                
                var t = useBspline2Tramos(u, _puntosDeControl);
                _punto = _fnCurva(t.uTramo, t.puntosTramo);
                _der = _fnCurvaDer(t.uTramo ,t.puntosTramo);
        
            } else if (_tipo == "bspline3-tramos") {
        
                var t = useBspline3Tramos(u, _puntosDeControl);
                _punto = _fnCurva(t.uTramo, t.puntosTramo);
                _der = _fnCurvaDer(t.uTramo, t.puntosTramo);
        
            } else {
        
                _punto = _fnCurva(u, _puntosDeControl);
                _der = _fnCurvaDer(u, _puntosDeControl);    
        
            }

            // var modulo=Math.sqrt(der[0]*der[0]+der[1]*der[1]+der[2]*der[2]);
            // tangente[0] = der[0]/modulo;
            // tangente[1] = der[1]/modulo;
            // tangente[2] = der[2]/modulo;
  
            vec3.normalize(_tangente, _der); // idem a dividir por modulo

            _normal[0] = -_tangente[1];   // x: -derNorm.y
            _normal[1] =  _tangente[0];   // y:  derNorm.x 
            _normal[2] =  _tangente[2];

            vec3.multiply(_binormal, _tangente, _normal);

        }

        // this.set(_tipo, _puntosDeControl)
        // this.update(u)
        this.getPoint   = function() { return _punto; }
        this.getTangent = function() { return _tangente; }
        this.getNormal  = function() { return _normal; }
        this.getBinormal = function() { return _binormal; }
    }

    APP.Curva = Curva;

}());