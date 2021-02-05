var APP = APP || {};

(function() {

    function Objeto3D () {
              
        var _vertexBuffer = null;
        var _normalBuffer = null;
        var _uvsBuffer = null;
        var _indexBuffer = null;
        var _texture = null;
        var _heightmapTexture = null;

        var _hasTexture = false;
        var _hasHeightmapTexture = false;

        var _matrizModelado = mat4.create();
        var _position = vec3.create();
        var _rotation = vec3.create();
        var _scale = vec3.fromValues(1,1,1);
     
        var _child = [];

        var _name = "Objeto3D-NN";

        var _parentMatrix = mat4.create();

        var _data;

        this.setData = function(data) {

            _data = data;

        }

        this.getData = function() {

            return _data;

        }

        this.setTexture = function(texture_file) {

            _texture = gl.createTexture();
            _texture.image = new Image();

            _texture.image.onload = function() {
                onTextureLoaded(_texture, 0);
            }

            _texture.image.src = texture_file;
            _hasTexture = true;

        }

        this.setHeightmapTexture = function(texture_file) {

            _heightmapTexture = gl.createTexture();
            _heightmapTexture.image = new Image();

            _heightmapTexture.image.onload = function() {
                onTextureLoaded(_heightmapTexture, 0);
            }

            _heightmapTexture.image.src = texture_file;
            _hasHeightmapTexture = true;

        }

        function onTextureLoaded( textura, level) {

            // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            // gl.bindTexture(gl.TEXTURE_2D, _texture);
            // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _texture.image);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            // gl.generateMipmap(gl.TEXTURE_2D);
    
            // gl.bindTexture(gl.TEXTURE_2D, null);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            gl.bindTexture(gl.TEXTURE_2D, textura);
            gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textura.image);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
    
            gl.bindTexture(gl.TEXTURE_2D, null);

        }

        this.updateMatrizModelado = function(parentMatrix) {

            if (parentMatrix != undefined) _parentMatrix = parentMatrix;

            var m = mat4.create(); 
            mat4.translate(m, _parentMatrix, _position);
            mat4.rotateX(m, m, _rotation[0]);
            mat4.rotateY(m, m, _rotation[1]);
            mat4.rotateZ(m, m, _rotation[2]);
            mat4.scale(m, m, _scale);
            return m;

        }
        
        this.getWorldPosition = function(){

            var m = this.updateMatrizModelado();
            var pos = vec3.create();
            return vec3.transformMat4(pos, pos, m);      

        }

        function setThisShaderUniforms() {
            
            gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, _matrizModelado);

            var normalMatrix = mat3.create();
            mat3.fromMat4(normalMatrix, _matrizModelado); // normalMatrix= (inversa(traspuesta(matrizModelado)));
    
            mat3.invert(normalMatrix, normalMatrix);
            mat3.transpose(normalMatrix,normalMatrix);

            gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);

        }
        
        this.draw = function(parentMatrix) {

            _matrizModelado = this.updateMatrizModelado(parentMatrix);

            setThisShaderUniforms();

            if (_vertexBuffer && _indexBuffer) {

                // referencia:
                // void glBindBuffer( GLenum target, GLuint buffer );
                // void gl.vertexAttribPointer(index, size, type, normalized, stride, offset);

                // Se configuran los buffers que alimentaron el pipeline
                gl.bindBuffer(gl.ARRAY_BUFFER, _vertexBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, _vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
            
                gl.bindBuffer(gl.ARRAY_BUFFER, _uvsBuffer);
                gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, _uvsBuffer.itemSize, gl.FLOAT, false, 0, 0);
            
                gl.bindBuffer(gl.ARRAY_BUFFER, _normalBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, _normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
                
                // nuevo para textura de demoplanetatierra
                if (_hasTexture) {

                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, _texture);
                    gl.uniform1i(shaderProgram.samplerUniform, 0);

                }

                if (_hasHeightmapTexture) {

                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, _heightmapTexture);
                    gl.uniform1i(shaderProgram.samplerUniform, 1);

                }

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);
            
                if (modo!="wireframe"){

                    gl.uniform1i(shaderProgram.useLightingUniform,(lighting=="true"));                    
                    gl.drawElements(gl.TRIANGLE_STRIP, _indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

                }
                
                if (modo!="smooth") {

                    gl.uniform1i(shaderProgram.useLightingUniform,false);
                    gl.drawElements(gl.LINES, _indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

                }

            }
         
            for (var i = 0; i < _child.length; i++) {

                _child[i].draw(_matrizModelado);

            }

        }     

        this.setBuffers = function(buffers) {

            _vertexBuffer = buffers.webgl_position_buffer;
            _normalBuffer = buffers.webgl_normal_buffer;
            _uvsBuffer = buffers.webgl_uvs_buffer;
            _indexBuffer = buffers.webgl_index_buffer;
        
        }

        this.addChild = function(h) {

            _child.push(h);

        }

        // this.quitarHijo = function(h) {
        //     // eliminar hijo del array
        // }

        this.setPosition = function(positionVector) {

            _position = positionVector;

        }

        this.setRotationX = function(rotationX) {

            _rotation[0]= rotationX;

        }

        this.setRotationY = function(rotationY) {

            _rotation[1] = rotationY;

        }
        
        this.setRotationZ = function(rotationZ) {

            _rotation[2] = rotationZ;

        }

        this.setScale = function(scaleVector) {

            _scale = scaleVector;

        }

        this.setName = function(name) {

            _name = name;

        }

        this.getName = function() {

            return _name;

        }


    }

    APP.Objeto3D = Objeto3D;

})();