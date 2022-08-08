export let fragmentShaderTexto = `
        
precision mediump float;

      // Passed in from the vertex shader.
      varying vec2 v_texcoord;

      uniform sampler2D u_texture;


        void main(void) {

          gl_FragColor =  vec4(1.0, 1.0, 1.0, 1.0);
        }
      
      `