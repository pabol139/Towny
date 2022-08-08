/*export let fragmentShader = `
        
precision mediump float;

        varying highp vec2 vTextureCoord;
        varying highp vec3 vLighting;
        uniform vec4 fColor; 
    
        uniform sampler2D uSampler;
    
        void main(void) {
          highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    
          gl_FragColor =  fColor;

        }
      
      `*/

      /*export let fragmentShader2 = `
        
      varying highp vec2 vTextureCoord;
      varying highp vec3 vPosition;
      varying highp vec3 vNormal;
      varying highp vec3 v_vertToLight;
      varying highp vec3 v_vertToLight2;

      uniform sampler2D uSampler;
      uniform highp vec3 lightPosition; // POSICIÓN DE LA LUZ EN COORDENADAS DE VISTA
      uniform highp vec3 lightIntensity; // INTENSIDAD DE LA LUZ (MISMA PARA AMB., ESP. Y DIF.)
      uniform highp vec3 Kd; // COMPONENTE DIFUSA DEL MATERIAL
      uniform highp vec3 Ka; // COMPONENTE AMBIENTAL DEL MATERIAL
      uniform highp vec3 Ks; // COMPONENTE ESPECULAR DEL MATERIAL
      uniform highp float Shininess; // FACTOR DE BRILLO DEL MATERIAL
 
      highp vec3 phong() {

        highp vec3 n = normalize(vNormal);
        highp vec3 s = normalize(v_vertToLight - vPosition);
        highp vec3 s2 = normalize(v_vertToLight2 - vPosition);

        highp vec3 v = normalize(vec3(-vPosition));
        highp vec3 r = reflect(-s, n);
        highp vec3 r2 = reflect(-s2, n);

        highp vec3 Ambient = vec3(1.0, 1.0, 1.0);


        highp vec3 Diffuse = vec3(1.0, 1.0, 1.0) * max (dot (v_vertToLight, n), 0.0);
        Diffuse += vec3(1.0, 1.0, 1.0) * max (dot (v_vertToLight2, n), 0.0);

        highp vec3 Specular =  vec3(0.1, 0.1, 0.1) * pow (max (dot (r,v), 0.0), 20.0);
        Specular += vec3(0.2, 0.2, 0.2) * pow (max (dot (r2,v), 0.0), 20.0);
        
        highp vec3 light = lightIntensity * (Ambient + Diffuse + Specular);
        return light;

      }
  
      void main(void) {

        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

        
        gl_FragColor =  texelColor * vec4(phong(), 1.0);
      }
    
    `*/

    export let fragmentShader2 = `

    precision highp float;

    struct Material {
      sampler2D diffuse;
      sampler2D specular;
      float shininess;
    }; 
    
    struct DirLight {
        vec3 direction;
        float colorIntensity;
      
        vec3 ambient;
        vec3 diffuse;
        vec3 specular;
    };
    
    struct PointLight {
        vec3 position;
        
        float constant;
        float linear;
        float quadratic;
      
        vec3 ambient;
        vec3 diffuse;
        vec3 specular;
    };
    
    struct SpotLight {
        vec3 position;
        vec3 direction;
        float cutOff;
        float outerCutOff;
      
        float constant;
        float linear;
        float quadratic;
      
        vec3 ambient;
        vec3 diffuse;
        vec3 specular;       
    };
    
    #define NR_POINT_LIGHTS 4

    varying highp vec2 vTextureCoord;
    varying highp vec3 vPosition;
    varying highp vec3 vNormal;
    varying highp vec3 v_vertToLight;

    uniform vec3 viewPos;
    uniform DirLight dirLight;
    uniform PointLight pointLights[NR_POINT_LIGHTS];
    uniform SpotLight spotLight;
    uniform Material material;

    vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir);
    vec3 CalcPointLight(PointLight light, vec3 normal, vec3 vPosition, vec3 viewDir);
    vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 vPosition, vec3 viewDir);

    void main() {    

    // properties
    vec3 norm = normalize(vNormal);
    vec3 viewDir = normalize(viewPos - vPosition);
    
    // == =====================================================
    // Our lighting is set up in 3 phases: directional, point lights and an optional flashlight
    // For each phase, a calculate function is defined that calculates the corresponding color
    // per lamp. In the main() function we take all the calculated colors and sum them up for
    // this fragment's final color.
    // == =====================================================
    // phase 1: directional lighting

    vec3 result = vec3(0,0,0);

    result = CalcDirLight(dirLight, norm, viewDir);
 
    // phase 2: point lights
    // for(int i = 0; i < NR_POINT_LIGHTS; i++)
    //    result += CalcPointLight(pointLights[0], norm, vPosition, viewDir);  

    // phase 3: spot light
    // result += CalcSpotLight(spotLight, norm, vPosition, viewDir);    
    
    gl_FragColor =   vec4(result, 1.0);


    }

    // calculates the color when using a directional light.
    vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir)
    {
        vec3 lightDir = normalize(light.direction);
        // diffuse shading
        float diff = max(dot(normal, lightDir), 0.0);
        // specular shading
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
        // combine results
        vec3 ambient = light.ambient * vec3(texture2D(material.diffuse, vTextureCoord));
        vec3 diffuse = light.diffuse * diff * vec3(texture2D(material.diffuse, vTextureCoord));
        vec3 specular = light.specular * spec * vec3(texture2D(material.specular, vTextureCoord));
        return ( (light.colorIntensity * ambient) + diffuse + specular);
    }

  // calculates the color when using a point light.
vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(light.position - fragPos);

    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);

    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

    // attenuation
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * (distance * distance)); 

    // combine results
    vec3 ambient = vec3(0.05, 0.05, 0.05) * vec3(texture2D(material.diffuse, vTextureCoord));
    vec3 diffuse = vec3(0.8, 0.8, 0.8) * diff * vec3(texture2D(material.diffuse, vTextureCoord));
    vec3 specular = vec3(1.0, 1.0, 1.0) * spec * vec3(texture2D(material.specular, vTextureCoord));

    ambient *= attenuation;
    diffuse *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
}

// calculates the color when using a spot light.
vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir)
{
    vec3 lightDir = normalize(vec3(0, 2, 3) - fragPos);

    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);

    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);

    // attenuation
    float distance = length(vec3(0, 2, 3) - fragPos);
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * (distance * distance));    

    // spotlight intensity

    //float theta = dot(v_vertToLight, normalize(-vec3(0, 0, 1))); 
    //float epsilon = cos(radians(10.0)) - cos(radians(15.0));
    //float intensity = clamp((theta - cos(radians(15.0))) / epsilon, 0.0, 1.0);

    //float dotFromDirection = dot(v_vertToLight, normalize(-vec3(0, 0, 1))); 
    //float inLight = step(10.0, dotFromDirection);
    //float intensity = inLight * dot(normal, normalize(-vec3(0, 0, 1)));

    // combine results
    vec3 ambient = vec3(0, 0, 0) * vec3(texture2D(material.diffuse, vTextureCoord));
    vec3 diffuse = vec3(1.0, 1.0, 1.0) * diff * vec3(texture2D(material.diffuse, vTextureCoord));
    vec3 specular = vec3(1.0, 1.0, 1.0) * spec * vec3(texture2D(material.specular, vTextureCoord));

    ambient *= attenuation * 3.0;
    diffuse *= attenuation * 3.0;
    specular *= attenuation * 3.0;

    return (ambient + diffuse + specular);
}


    `

   /* export let fragmentShader = `
    precision mediump float;

    varying highp vec2 vTextureCoord;


    uniform sampler2D uSampler;
    varying vec3 vNormal;  // Surface normal
    varying vec3 vPosition;       // Vertex position
    uniform float Ka;   // Ambient reflection coefficient
    uniform float Kd;   // Diffuse reflection coefficient
    uniform float Ks;   // Specular reflection coefficient
    uniform float shininessVal; // Shininess
    // Material color
    uniform vec3 ambientColor;
    uniform vec3 diffuseColor;
    uniform vec3 specularColor;
    uniform vec3 lightPos; // Light position

    void main() {
      vec3 N = normalize(vNormal);
      vec3 L = normalize(vec3(10, 5, -1) - vPosition);
    
      // Lambert's cosine law
      float lambertian = max(dot(N, L), 0.0);
      float specular = 0.0;
      if(lambertian > 0.0) {
        vec3 R = reflect(-L, N);      // Reflected light vector
        vec3 V = normalize(-vPosition); // Vector to viewer
        // Compute the specular term
        float specAngle = max(dot(R, V), 0.0);
        specular = pow(specAngle, 5.0);
      }
      else{
        specular = 20.0;

      }
      gl_FragColor = vec4(1.0 * vec3(0.01, 0.0, 0.0) +
                        1.0 * lambertian * vec3(0.25, 0.0, 0.0) +
                        1.0 * specular * vec3(1.0, 1.0, 1.0), 1.0);
        
      }
    
    `*/
