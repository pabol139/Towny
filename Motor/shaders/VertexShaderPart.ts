

      /*export let vertexShader = `
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec2 aTextureCoord;
    
        uniform mat4 uNormalMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
          vTextureCoord = aTextureCoord;
    
          // Apply lighting effect
    
          highp vec3 directionalLightColor = vec3(1, 1, 1);
          highp vec3 directionalVector = normalize(vec3(0.35, 0.85, 0.85));
    
          highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
    
          highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
          vLighting = (directionalLightColor * directional);
        }
      
      `*/



     /* export let vertexShader = `
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec2 aTextureCoord;

        varying highp vec3 vPosition;
        varying highp vec3 vNormal;
    
        uniform mat3 uNormalMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionMatrix;
    
        varying highp vec2 vTextureCoord;
    
        void main(void) {
          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;

          vPosition = vec3(uViewMatrix * uModelMatrix * aVertexPosition);
          vNormal = normalize(uNormalMatrix * aVertexNormal);
          vTextureCoord = aTextureCoord;
    
        }
      
      `*/

      export let vertexShaderPart = `
        attribute vec4 aVertexPosition;
       

        varying highp vec3 vPosition;
        varying highp vec3 velocity;
    
        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionMatrix;
    
    
        void main(void) {

          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;

          

          vPosition = vec3(uViewMatrix *  uModelMatrix * aVertexPosition);
    
        }
      
      `