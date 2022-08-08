

      export let vertexShaderTexto = `
      
        attribute vec4 aVertexPosition;
        attribute vec2 a_texcoord;

        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelViewMatrix;

        varying vec2 v_texcoord;

    
        void main(void) {

          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;

          // Pass the texcoord to the fragment shader.
          v_texcoord = a_texcoord;
        }
      
      `