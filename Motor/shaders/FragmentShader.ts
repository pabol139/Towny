export let fragmentShader = `
        
precision mediump float;
        uniform vec4 fColor; 

        void main(void) {

    
          gl_FragColor =  fColor;
        }
      
      `