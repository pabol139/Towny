

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

      /* export let vertexShader = `
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec2 aTextureCoord;

        varying highp vec3 vPosition;
        varying highp vec3 vNormal;
    
        uniform mat4 uNormalMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionMatrix;
        uniform vec3 lightPosition;

        varying highp vec2 vTextureCoord;
        varying highp vec3 v_vertToLight;
        varying highp vec3 v_vertToLight2;

        void main(void) {

          vec4 viewSunPos   = uViewMatrix * vec4(vec3(4,1,5), 1.0);
          vec4 viewSunPos2  = uViewMatrix * vec4(vec3(-10,1,2), 1.0);

          vec4 viewPosition = uViewMatrix * uModelMatrix * aVertexPosition;

          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
          vPosition = vec3(uViewMatrix * uModelMatrix * aVertexPosition)*1.1;

          v_vertToLight = normalize(viewSunPos.xyz - viewPosition.xyz);
          v_vertToLight2 = normalize(viewSunPos2.xyz - viewPosition.xyz);

          vPosition = vec3(uViewMatrix * uModelMatrix * aVertexPosition);
          vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 0.0));
          vTextureCoord = aTextureCoord;
    
        }
      
      `*/

      export let vertexShader = `
        attribute vec4 aVertexPosition;
        attribute vec3 aVertexNormal;
        attribute vec2 aTextureCoord;

        varying highp vec3 vPosition;
        varying highp vec3 vNormal;
    
        uniform mat4 uNormalMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionMatrix;
        uniform vec3 lightPosition;

        varying highp vec2 vTextureCoord;
        varying highp vec3 v_vertToLight;
        varying highp vec3 v_vertToLight2;

        void main(void) {


          vPosition = vec3( uModelMatrix * aVertexPosition);
          vNormal = aVertexNormal;
          vTextureCoord = aTextureCoord;

          gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;

    
        }
      
      `