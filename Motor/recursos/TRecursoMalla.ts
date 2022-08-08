import { TRecurso } from "./TRecurso";
import fetch from "node-fetch";
import * as glMatrix from 'gl-matrix';
import { TRecursoTextura } from './TRecursoTextura';
import { Camera } from "webgl-operate";
import { Console } from 'console';
import { CardinfoComponent } from "src/app/commons/cardinfo/cardinfo.component";
import { EngineService } from "src/app/services/engine.service";


export class TRecursoMalla extends TRecurso {
    cantidad;
    buffers;
    public matrizObj;
    vertices;
    normales;
    indexes;
    coloresCara;
    coordenadatext;
    urltext;
    camera;
    luz;
    mousec_x;
    mousec_y;
    mouse_x;
    mouse_y;
    click;
    click_out;
    programa;
    c_pixel;
    colores;
    arrayTexture:TRecursoTextura[]=[];
    touch;
    uids;
    public texturesNames;       
    width;
    height;
    media;
    //private engineService:EngineService;
    public cerdaId = document.getElementById("accionadorZoomLugar");
    public observer;
    public posObject=[];
    public engine = new EngineService(null,null,null,null);

    public textCtx = document.createElement("canvas").getContext("2d");

     // Puts text in center of canvas.
    makeTextCanvas(text, width, height) {

        this.textCtx.canvas.width  = width;
        this.textCtx.canvas.height = height;
        this.textCtx.font = "20px monospace";
        this.textCtx.textAlign = "center";
        this.textCtx.textBaseline = "middle";
        this.textCtx.fillStyle = "black";
        this.textCtx.clearRect(0, 0, this.textCtx.canvas.width, this.textCtx.canvas.height);
        this.textCtx.fillText(text, width / 2, height / 2);
        return this.textCtx.canvas;
    }

    constructor(nombre, private cardInfo:CardinfoComponent) {
        super(nombre);

        this.click_out = true;

        //Color aleatorio que se aplica a las mallas clickables
        this.colores = Array();

        //Uid de los lugares que se pueden clickar
        this.uids = Array();
        this.texturesNames = Array();

        //Propiedad de la malla que hace que se pueda clickar
        this.touch = Array();

        //Pixel que se lee
        this.media = Array();
        this.c_pixel =  new Uint8Array(4);
        this.vertices = Array();
        this.normales = Array();
        this.indexes = Array();
        this.coordenadatext = Array();
        this.buffers = Array();
        
        this.height = 0;
        this.width = 0;

        //Localización del cursor en la pantalla
        this.mousec_x = 0;
        this.mousec_y = 0;

        //Ratón click
        this.click = false;
     
        //Captura de eventos para la camara
        document.getElementById("renderCanvas").addEventListener("mousedown", this.panningEvent);
        document.getElementById("renderCanvas").addEventListener("mouseup", this.panningEvent);
        document.getElementById("renderCanvas").addEventListener("mousemove", this.panningEvent);
        document.getElementById("renderCanvas").addEventListener("wheel", this.zoomEvent);
        document.getElementById("renderCanvas").addEventListener("click", this.clickEvent);
        document.getElementById("renderCanvas").addEventListener("mousemove",this.hoverEvent);
        document.addEventListener("keypress",this.keyboardEvent);

        this.observer = new MutationObserver(mutations => {
            
          this.zoom(document.getElementById("accionadorZoomLugar").getAttribute('value'));
        });
        var config = { attributes: true, childList: true, characterData: true };
        this.cerdaId = document.getElementById("accionadorZoomLugar");
        this.observer.observe(this.cerdaId, config);
    
    }

    /*ngAfterViewInit() {
        this.observer = new MutationObserver(mutations => {
          this.zoom(document.getElementById("accionadorZoomLugar").getAttribute('value'));
        });
        var config = { attributes: true, childList: true, characterData: true };
        this.cerdaId = document.getElementById("accionadorZoomLugar");
        this.observer.observe(this.cerdaId, config);
    }*/

    addTextureArr(texture:TRecursoTextura[]){
        this.arrayTexture= texture;
    }
    getTextureArr(){
        return this.arrayTexture;
    }


    dibujar(gl, programa,programa2,programa3,  matriztrans, camara,luz, texturas?){

       
        this.buffers = Array();
        this.camera = camara;

        // create text texture.
        var textCanvas = this.makeTextCanvas("Hello!", 100, 26);
        var textWidth  = textCanvas.width;
        var textHeight = textCanvas.height;
        var textTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
        // make sure we can render it even if it's not a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


        //matriz de los objetos

        this.matrizObj= matriztrans;

        gl.useProgram(programa);

        //Programa del dibujado con colores constantes
        const programInfo = {
            program: programa,
            attribLocations: {
              vertexPosition: gl.getAttribLocation(programa, 'aVertexPosition'),
              vertexNormal: gl.getAttribLocation(programa, 'aVertexNormal'),
              textureCoord: gl.getAttribLocation(programa, 'aTextureCoord')
            },
            uniformLocations: {
              projectionMatrix: gl.getUniformLocation(programa, 'uProjectionMatrix'),
              modelMatrix: gl.getUniformLocation(programa, 'uModelMatrix'),
              viewMatrix: gl.getUniformLocation(programa, 'uViewMatrix'),
              normalMatrix: gl.getUniformLocation(programa, 'uNormalMatrix'),
              uSampler: gl.getUniformLocation(programa, 'uSampler'),
              fcolorLocation: gl.getUniformLocation(programa, "fColor")
            }
          };

          //Programa del dibujado con texturas
          const programInfo2 = {
            program: programa2,
            attribLocations: {
              vertexPosition: gl.getAttribLocation(programa2, 'aVertexPosition'),
              vertexNormal: gl.getAttribLocation(programa2, 'aVertexNormal'),
              textureCoord: gl.getAttribLocation(programa2, 'aTextureCoord')
            },
            uniformLocations: {
              projectionMatrix: gl.getUniformLocation(programa2, 'uProjectionMatrix'),
              modelMatrix: gl.getUniformLocation(programa2, 'uModelMatrix'),
              viewMatrix: gl.getUniformLocation(programa2, 'uViewMatrix'),
              normalMatrix: gl.getUniformLocation(programa2, 'uNormalMatrix'),
              uSampler: gl.getUniformLocation(programa2, 'uSampler'),
              lightIntensity: gl.getUniformLocation(programa2, "lightIntensity"),
              lightPosition: gl.getUniformLocation(programa2, "lightPosition"),
              viewPosition: gl.getUniformLocation(programa2, "viewPos"),
              matDiffuse: gl.getUniformLocation(programa2, 'material.diffuse'),
              matSpecular: gl.getUniformLocation(programa2, 'material.specular'),
              matShininess: gl.getUniformLocation(programa2, 'material.shininess'),
              pointLights: gl.getUniformLocation(programa2, 'pointLights[0].position'),
              pointLights2: gl.getUniformLocation(programa2, 'pointLights[1].position'),
              pointLights3: gl.getUniformLocation(programa2, 'pointLights[2].position'),
              pointLights4: gl.getUniformLocation(programa2, 'pointLights[3].position'),
              spotLightCutOff: gl.getUniformLocation(programa2, 'spotlight.cutOff'),
              spotLightOutterCutOff: gl.getUniformLocation(programa2, 'spotlight.outerCutOff'),
              dirlightColorIntensity: gl.getUniformLocation(programa2, 'dirLight.colorIntensity'),
              dirlightDirection: gl.getUniformLocation(programa2, 'dirLight.direction'),
              dirlightAmbient: gl.getUniformLocation(programa2, 'dirLight.ambient'),
              dirlightDiffuse: gl.getUniformLocation(programa2, 'dirLight.diffuse'),
              dirlightSpecular: gl.getUniformLocation(programa2, 'dirLight.specular'),

            }
          };

          const programInfo3 = {
            program: programa3,
            attribLocations: {
              vertexPosition: gl.getAttribLocation(programa3, 'aVertexPosition'),

            },
            uniformLocations: {
              projectionMatrix: gl.getUniformLocation(programa3, 'uProjectionMatrix'),
              modelMatrix: gl.getUniformLocation(programa3, 'uModelMatrix'),
              viewMatrix: gl.getUniformLocation(programa3, 'uViewMatrix'),
              modelviewMatrix: gl.getUniformLocation(programa3, 'uModelViewMatrix'),
              normalMatrix: gl.getUniformLocation(programa3, 'uNormalMatrix'),
              uSampler: gl.getUniformLocation(programa3, 'uSampler'),
              fcolorLocation: gl.getUniformLocation(programa3, "fColor")
            }
          };




        this.initBuffers(gl);


        const texture = Array();


   

       

        
        for (let index = 0; index < this.arrayTexture.length; index++) {
            const element = this.arrayTexture[index];
            texture.push(element.loadTexture(gl));
            
        }
    

         //texture.push(this.loadTexture(gl,'assets/images/plano.jpg'));
        // texture.push(this.loadTexture(gl,'assets/images/castillotext.jpg'));
        // texture.push(this.loadTexture(gl,'assets/images/gris.jpg'));

        let render = (now) => {

          
            this.engine.resizeCanvasToDisplaySize(gl.canvas);

            this.height = gl.canvas.clientHeight;
            this.width = gl.canvas.clientWidth;

           

            this.camera.setAspecto(this.width/this.height);

            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


            gl.useProgram(programa);

            this.drawScene(gl, programInfo, this.buffers, texture, this.camera,true);  //Dibujamos los elementos que se pueden clickar con un color solido
            
            gl.useProgram(programa2);

            this.drawScene2(gl, programInfo2, this.buffers, texture, this.camera, luz, false); //dibujamos con texturas todos los elementos
        
            //gl.useProgram(programa3);

            //this.drawScene3(gl, programInfo3, this.buffers, texture, this.camera, luz, false); //dibujamos con texturas todos los elementos


            requestAnimationFrame(render); 
        }

        requestAnimationFrame(render);

    }


 
    initBuffers(gl) {

        for(let i = 0;i<this.indexes.length;i++){


        //Buffer con las posiciones de los vertices
            
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = this.vertices[i];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
       


        //Buffer con las coordenadas de texturas

        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        const textureCoordinates = this.coordenadatext[i];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),  gl.STATIC_DRAW);

        //Buffer con los indices de la caras

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        const indices = this.indexes[i];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        //Buffer de las normales de los vertices

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        const normales = this.normales[i];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normales), gl.STATIC_DRAW);

            this.buffers.push( {
              position: positionBuffer,
              textureCoord: textureCoordBuffer,
              indices: indexBuffer,
              normal: normalBuffer

            });
        }
    }

   
      

      public addTexture(t){
          this.urltext = t;
      }


    public drawScene(gl, programInfo, buffers, texture,cam,off) {

        this.click_out = true;

       // gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
      
        // Clear the canvas before we start drawing on it.
      
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for(let i = 0;i<buffers.length;i++){

        if(this.touch[i] == "true" && this.click){ //Miramos que la malla sea clickable
        


      



        //Cargamos las matrices

        var projectionMatrix = glMatrix.mat4.create();
        projectionMatrix = cam.getProjectionMatrix();

      

        const vMatrix = cam.getViewMatrix();
        const mMatrix = this.matrizObj; 


        const normalMatrix = glMatrix.mat4.create();
        const modelViewMatrix = glMatrix.mat4.create();

        glMatrix.mat4.multiply(modelViewMatrix, mMatrix, vMatrix);
        glMatrix.mat4.invert(normalMatrix, modelViewMatrix);
        glMatrix.mat4.transpose(normalMatrix, normalMatrix);


        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }

        
 

            {
                const numComponents = 2;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].textureCoord);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.textureCoord,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.textureCoord);
            }
        
            {
                const numComponents = 3;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;

                gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].normal);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexNormal,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.vertexNormal);
              }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[i].indices);

        gl.useProgram(programInfo.program);

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.viewMatrix,
            false,
            vMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelMatrix,
            false,
            mMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.normalMatrix,
            false,
            normalMatrix);
        
            //Asignamos un color
            gl.uniform4f(programInfo.uniformLocations.fcolorLocation, this.colores[i][0],this.colores[i][1],this.colores[i][2],this.colores[i][3]);
        

        {
            const vertexCount = this.indexes[i].length;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);

            //Comprobamos que se haya hecho click y que sea la funcion correspondiente
            
               
                
                //Leemos el color del pixel donde se clicka
                gl.readPixels(this.mouse_x,gl.canvas.clientHeight-this.mouse_y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,this.c_pixel);

                //Comprobamos con un pequeño margen que cada valor del pixel coincide con el color del elemento
                if(this.c_pixel[0] == Math.round(this.colores[i][0]*256) || this.c_pixel[0] +1 == Math.round(this.colores[i][0]*256) ){              
                 if(this.c_pixel[1] == Math.round(this.colores[i][1]*256) || this.c_pixel[1] +1 == Math.round(this.colores[i][1]*256) ){
                   if(this.c_pixel[2] == Math.round(this.colores[i][2]*256) || this.c_pixel[2] +1 == Math.round(this.colores[i][2]*256) ){
                       if(this.c_pixel[3] == Math.round(this.colores[i][3]*256) || this.c_pixel[3] +1 == Math.round(this.colores[i][3]*256) ){

                   

                        
                       // document.body.style.cursor = 'pointer';

                        if(this.click) //Si clickamos
                            {
                           // this.cardInfo.mostrarLugarCard(this.uids[i]); //Cogemos el uid de la malla para abrir la tarjeta
                           document.getElementById("accionadorPuebloMotor").setAttribute('value',this.uids[i]);
                         
                           this.click = false; //Ponemos a false el click
                            this.click_out = false;
                       
                            if(document.getElementById('ocultarTarLug').classList.contains('noDesplegada')){
                                this.cardInfo.ocultarCard();

                            }
                        }
                        
                        i = buffers.length;
                    }
                        else{

                            document.body.style.cursor = 'default';
                        }
                        }else{
                            document.body.style.cursor = 'default'; 
                        }
                    }
                }

                else{
                    document.body.style.cursor = 'default';
                }   

               

            
        }}
    }
    if(this.click_out && this.click){
        
     
        if(!document.getElementById('ocultarTarLug').classList.contains('noDesplegada')){
            this.cardInfo.ocultarCard();

        }

        this.click = false;
       
        //this.click_out = false;
    }

    }



    cargarFichero(nombre){
        if(nombre !== null && nombre !== ''){
            const model = require('../'+nombre+'.json');

            let count = 0;

            this.colores = Array();

        //Uid de los lugares que se pueden clickar
        this.uids = Array();
        this.texturesNames= Array();

        //Propiedad de la malla que hace que se pueda clickar
        this.touch = Array();

        //Pixel que se lee

        this.c_pixel =  new Uint8Array(4);
        this.vertices = Array();
        this.normales = Array();
        this.indexes = Array();
        this.coordenadatext = Array();
        this.buffers = Array();
        
        this.height = 0;
        this.width = 0;

            //Leemos el json hasta que no hayan malals
            for(let k in model.meshes){
                if(model.meshes.hasOwnProperty(k)){
                    count++;
                    
                    //Leemos su uid
                    this.uids.push(model.meshes[count-1].uid);
                    this.texturesNames.push(model.meshes[count-1].texture)

                    var color = [Math.random(),Math.random(),Math.random(),Math.random()]
                    //Generamos un color aleatorio y se lo asignamos
                    this.colores.push(color);
                    
                    //Leemos si se puede clickar
                    this.touch.push(model.meshes[count-1].touch);
                    
                    //Y leemos toda su geometria
                    this.indexes.push([].concat.apply([], model.meshes[count-1].faces));
                    this.normales.push(model.meshes[count-1].normals);
                    this.vertices.push(model.meshes[count-1].vertices);


                    if(model.meshes[count-1].texturecoords){

                    this.coordenadatext.push(model.meshes[count-1].texturecoords[0]);

                    }

                }
            }

            this.cantidad = count;


        }
    }
    



    public drawScene2(gl, programInfo, buffers, texture,cam, luz, off) { //Funcion todavia por arreglar

  


        for(let i = 0;i<buffers.length;i++){

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        

        // Clear the canvas before we start drawing on it.

      //  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.
        var projectionMatrix = glMatrix.mat4.create();

        
        projectionMatrix = cam.getProjectionMatrix();

      

        const vMatrix = cam.getViewMatrix();
        const mMatrix = this.matrizObj; 


        const normalMatrix = glMatrix.mat4.create();
        const modelViewMatrix = glMatrix.mat4.create();

      //  glMatrix.mat4.rotateX(mMatrix, mMatrix, Math.PI/200);
      //  glMatrix.mat4.rotateY(mMatrix, mMatrix, Math.PI/300);

        glMatrix.mat4.multiply(modelViewMatrix, mMatrix, vMatrix);
        glMatrix.mat4.invert(normalMatrix, modelViewMatrix);
        glMatrix.mat4.transpose(normalMatrix, normalMatrix);


        //glMatrix.mat4.lookAt(vMatrix,glMatrix.vec3.fromValues(0,0,-5),glMatrix.vec3.fromValues(0,0,0), glMatrix.vec3.fromValues(0,0,0));

        //glMatrix.mat4.invert(vMatrix,vMatrix);

        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute
        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
        }


        
        // Tell WebGL how to pull out the texture coordinates from
  // the texture coordinate buffer into the textureCoord attribute.

 

            {
                const numComponents = 2;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].textureCoord);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.textureCoord,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.textureCoord);
            }
        
            {
                const numComponents = 3;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;

                gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].normal);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexNormal,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.vertexNormal);
              }

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[i].indices);

        // Tell WebGL to use our program when drawing

        gl.useProgram(programInfo.program);

        // Set the shader uniforms

        gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.viewMatrix,
            false,
            vMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelMatrix,
            false,
            mMatrix);
        gl.uniformMatrix4fv(
            programInfo.uniformLocations.normalMatrix,
            false,
            normalMatrix);
        
            // Aplicamos valores de la luz al shader

            
            // AÑADIMOS ATRIBUTOS MATERIAL

            gl.uniform1f(programInfo.uniformLocations.matShininess, 32.0);
            gl.uniform1i(programInfo.uniformLocations.matDiffuse, 0);
            gl.uniform1i(programInfo.uniformLocations.matSpecular, 1);

            // AÑADIMOS ATRIBUTOS LUZ DIRECCIONAL

            gl.uniform1f(programInfo.uniformLocations.dirlightColorIntensity, luz.getIntensidad ());
            gl.uniform3fv(programInfo.uniformLocations.dirlightDirection, luz.getPosicion());
            gl.uniform3fv(programInfo.uniformLocations.dirlightAmbient, luz.getAmbient());
            gl.uniform3fv(programInfo.uniformLocations.dirlightDiffuse, luz.getDiffuse());
            gl.uniform3fv(programInfo.uniformLocations.dirlightSpecular, luz.getSpecular());

            gl.uniform3fv(programInfo.uniformLocations.viewPosition, glMatrix.vec3.fromValues(5,0,0));

            gl.activeTexture(gl.TEXTURE0);

            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, texture[i]);
           
            

            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
        

        {    var vertexCount=0;
            if(this.indexes[i]!=null){
                 vertexCount = this.indexes[i].length;}

                const type = gl.UNSIGNED_SHORT;
                const offset = 0;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            
            


        }
    }

    this.click_out = true;
    }



    public drawScene3(gl, programInfo, buffers, texture,cam, luz, off) { 

        const positionBuffer = gl.createBuffer();


        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
      
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
        // Now create an array of positions for the square.
      
        const positions = [
           1.0,  1.0,
          -1.0,  1.0,
           1.0, -1.0,
          -1.0, -1.0,
        ];

        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);

            {
                const numComponents = 2;  // pull out 2 values per iteration
                const type = gl.FLOAT;    // the data in the buffer is 32bit floats
                const normalize = false;  // don't normalize
                const stride = 0;         // how many bytes to get from one set of values to the next
                                          // 0 = use type and numComponents above
                const offset = 0;         // how many bytes inside the buffer to start from
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexPosition,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.vertexPosition);
              }

              var projectionMatrix = glMatrix.mat4.create();

        
              projectionMatrix = cam.getProjectionMatrix();
      
            
      
              const vMatrix = cam.getViewMatrix();
              const mMatrix = glMatrix.mat4.create();
      
              const billboardMatrix =  glMatrix.mat4.create();
      

      
              const normalMatrix = glMatrix.mat4.create();
              const modelViewMatrix = glMatrix.mat4.create();
      
             // glMatrix.mat4.translate(billboardMatrix, billboardMatrix, [0.0, 5.0, 0.0]);
             // glMatrix.mat4.multiply(billboardMatrix, mMatrix, billboardMatrix);

              glMatrix.mat4.multiply(modelViewMatrix, vMatrix, mMatrix);
             // glMatrix.mat4.invert(normalMatrix, modelViewMatrix);
             // glMatrix.mat4.transpose(normalMatrix, normalMatrix);

              //glMatrix.mat4.rotateX(modelViewMatrix, modelViewMatrix, Math.PI/200);
              //glMatrix.mat4.rotateY(modelViewMatrix, modelViewMatrix, Math.PI/300);

              gl.useProgram(programInfo.program);



            gl.uniformMatrix4fv(
                programInfo.uniformLocations.projectionMatrix,
                false,
                projectionMatrix);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.viewMatrix,
                false,
                vMatrix);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.modelMatrix,
                false,
                mMatrix);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.modelviewMatrix,
                false,
                modelViewMatrix);
 
            

              const offset = 0;
              const vertexCount = 4;
              gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);

    }

    zoomEvent = (e) => { //ZOOM PENDIENTE

       if(this.width>0&&this.height>0){


        var y = e.y - this.height/2;
        var x = e.x - this.width/2;


        if(this.camera){
            var vmat = glMatrix.mat4.create();

            vmat = this.camera.getViewMatrix();

            var invertida = glMatrix.mat4.create();
            glMatrix.mat4.invert(invertida,vmat);
            
           
        if(e.deltaY > 0 && invertida[13]<15&& invertida[14]<35){

                //ZOOM OUT

               var px = vmat[8] *1.002;
               var pz = vmat[10]*1.001;
               var py = vmat[9]*1.5;



    


               glMatrix.mat4.translate(vmat,vmat,glMatrix.vec3.fromValues(px,-0.3,-pz));
            

        }

        if(e.deltaY<0 && invertida[13]>2 && invertida[14]>3){





                var invertida = glMatrix.mat4.create();
                glMatrix.mat4.invert(invertida,vmat);


                   var px = vmat[8] *1.002;
                   var pz = vmat[10]*1.001;
                   var py = vmat[9]*1.5;
    

    
   
                 
                    glMatrix.mat4.translate(vmat,vmat,glMatrix.vec3.fromValues(-px,0.3,pz));
                     
                      
                   }

        }
        this.camera.setViewMatrix(vmat);


    }
    }

    //ROTACIÓN Y MOVIMIENTO


    clickEvent = (e)  => {
        this.click = true;
        
        this.mousec_x = e.x;
        this.mousec_y = e.y;

        //Capturamos el lugar del raton al hacer click
    }

    hoverEvent = (e)  => {
    

      this.mouse_x = e.x;        
      this.mouse_y = e.y;

        //Capturamos el lugar del raton al moverse
    }

    panningEvent = (e) => {


        var shift = (e.shiftKey); //Variable para saber si se va a rotar o mover

        if(e.buttons != 1 || (e.buttons == 1 && e.movementX != 0 && e.movementY != 0)){
            this.click = false;
        }

        
 
        if(this.camera){
            var vmat = glMatrix.mat4.create();

            vmat = this.camera.getViewMatrix();

            var invertida = glMatrix.mat4.create();
            glMatrix.mat4.invert(invertida,vmat);



           
            

            if(e.movementX > 0 && e.buttons == 1&&!shift){

                //EJE X Y Z DE LA CAMARA POR TRASLACIÓN

                

                var px = vmat[8] *1.4;
                var pz = vmat[10]*1.4;

                glMatrix.mat4.invert(invertida,vmat);

                if(invertida[12]>-35.1){


                glMatrix.mat4.translate(vmat,vmat,glMatrix.vec3.fromValues(pz*e.movementX/100,0,px*e.movementX/100));
                }
        
            }
            if(e.movementX < 0 && e.buttons == 1&&!shift){
            




                var px = vmat[8] *1.4;
                var pz = vmat[10]*1.4;


                glMatrix.mat4.invert(invertida,vmat);

                if(invertida[12]<40.1){


                glMatrix.mat4.translate(vmat,vmat,glMatrix.vec3.fromValues(pz*e.movementX/100,0,px*e.movementX/100));

                }
        
            }
            if(e.movementY > 0 && e.buttons == 1&&!shift){




                

                var px = vmat[8] *1.4;
                var pz = vmat[10]*1.4;

                glMatrix.mat4.invert(invertida,vmat);

                if(invertida[14]>-5){

                glMatrix.mat4.translate(vmat,vmat,glMatrix.vec3.fromValues(-px*e.movementY/100,0,pz*e.movementY/100));

                }


            }
            if(e.movementY < 0 && e.buttons == 1&&!shift){

        
                var px = vmat[8] *1.4;
                var pz = vmat[10]*1.4;


                glMatrix.mat4.invert(invertida,vmat);

                if(invertida[14]<45){

                glMatrix.mat4.translate(vmat,vmat,glMatrix.vec3.fromValues(-px*e.movementY/100,0,pz*e.movementY/100));

                }
            }

            if(e.movementX > 0 && e.buttons == 1 &&shift){

                
               // glMatrix.mat4.rotate(vmat,vmat,0.01*e.movementX,glMatrix.vec3.fromValues(0,1,0));
               glMatrix.mat4.rotate(this.matrizObj,this.matrizObj,0.003*e.movementX,glMatrix.vec3.fromValues(0,1,0));
                //console.log(this.matrizObj);
        
            }
            if(e.movementX < 0 && e.buttons == 1&&shift){
            

                glMatrix.mat4.rotate(this.matrizObj,this.matrizObj,0.003*e.movementX,glMatrix.vec3.fromValues(0,1,0));
            // glMatrix.mat4.rotate(vmat,vmat,0.01*e.movementX,glMatrix.vec3.fromValues(0,1,0));
    
                

            }

            var inv = glMatrix.mat4.create();

            glMatrix.mat4.invert(inv,vmat);



      
    }
    }



    keyboardEvent = (e)  => {
    

        


        //if(e.key == 'z')
        //this.zoom();
  
          //Capturamos el lugar del raton al moverse
      }

      public getPosMesh(){
          return this.posObject;
      }

    public zoom(uid){
        
        this.posObject=[];
        var mediax = 0;
        var mediay = 0;
        var mediaz = 0;

        var indice; 
        var encontrado;


        for(var k = 0; k<this.uids.length;k++){

            if(uid == this.uids[k]){
                indice = k;
                encontrado = true;
            }

        }

       //Malla a la que te diriges (3 castillo y 2 plaza de toros)

       if(encontrado){ 
       for(var i = 0;i<this.vertices[indice].length;i = i+3){

            var x = (this.vertices[indice][i])/50;
            var y =  (this.vertices[indice][i+1])/50;
            var z = (this.vertices[indice][i+2])/50;

  


            mediax = mediax+x;
            
            mediay = mediay+y;
            
            mediaz = mediaz+z;
        }

        //  LOCALIZACIONES DE LA MALLA

        mediax = mediax/((this.vertices[indice].length)/3);
        
        mediay = mediay/((this.vertices[indice].length)/3);
        
        mediaz = mediaz/((this.vertices[indice].length)/3);

 
       this.posObject.push(mediax);
       this.posObject.push(mediay);
       this.posObject.push(mediaz);

     

      
        //EN LA MATRIZ DE CAMARA INVERTIDA EN 12, 13 Y 14 ESTAN SUS COORDENADAS X,Y,Z SI LAS CAMBIAS Y LA VUELVES A INVERTIR LA POSICIONAS DONDE QUIERAS

     /*   var cam = this.camera.getViewMatrix();
        var inv = glMatrix.mat4.create();
        
        glMatrix.mat4.invert(inv,cam);

        //LA SUMA ES PARA QUE NO SE QUEDE DENTRO

        inv[12] = mediax;
        inv[13] = mediay+2.5;
        inv[14] = mediaz+4;

        glMatrix.mat4.invert(cam,inv);*/



    }

/*  
   

        var cam = this.camera.getViewMatrix();
        var inv = glMatrix.mat4.create();

      while(inv[12].toFixed(2)!=mediax.toFixed(2) && inv[13].toFixed(2)!=mediay.toFixed(2) && inv[14].toFixed(2)!=mediaz.toFixed(2)){
            glMatrix.mat4.invert(inv,cam);

            if(inv[12].toFixed(2)!=mediax.toFixed(2)){

                if(mediax>0 && inv[12].toFixed(2)<mediax.toFixed(2)){

                    inv[12]+=0.01;

                }

                if(mediax<0 && inv[12].toFixed(2)>mediax.toFixed(2)){

                    inv[12]-=0.01;

                }
               
            }
            if(inv[13].toFixed(2)!=mediay.toFixed(2)){

                if(mediay>0 && inv[13].toFixed(2)<mediay.toFixed(2)){

                    inv[13]+=0.01;

                }

                if(mediay<0 && inv[13].toFixed(2)>mediay.toFixed(2)){

                    inv[13]-=0.01;

                }

            }
            if(inv[14].toFixed(2)!=mediaz.toFixed(2)){

                if(mediaz>0 && inv[14].toFixed(2)<mediaz.toFixed(2)){

                    inv[14]+=0.01;

                }

                if(mediaz<0 && inv[14].toFixed(2)>mediaz.toFixed(2)){

                    inv[14]-=0.01;

                }

            }

            glMatrix.mat4.invert(cam,inv);

        }*/

      
        
    }

    public resetEscena(gl){
      
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        for (let index = 0; index < this.buffers.length; index++) {
            const element = this.buffers[index];
            //gl.deleteBuffer(element);
            
        }
    }

    public delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }


}