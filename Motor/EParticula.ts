import { Entidad } from "./Entidad";
import * as glMatrix from 'gl-matrix'
import { EParticulaCapa } from "./EParticulaCapa";


export class EParticula extends Entidad {

    private cantidad: number;
    private altura: number;
    programaa;
    private tipo: string;
    
    matrizObj;
    camera;
    height;
    width;
    posiciones;
    mMatrix;
    bufferpos;
    capa;
 
    constructor(x1,y1,t,p) {

        super();

        

        this.capa = Array();
        this.posiciones = Array();
        this.cantidad = x1;
        this.altura = y1;
        this.tipo = t;
        this.mMatrix = Array();
        this.programaa = p;

        this.height = 0;
        this.width = 0;
        this.bufferpos = Array();
    }

    dibujar(gl, programa,programa2, programa3,  matriztrans, camara,luz, texturas?): void { 

        this.camera = camara;

    //matriz de los objetos



        

        this.matrizObj = matriztrans;
        gl.useProgram(this.programaa);

    // BUFFERS (CREAR BUFFER, ASIGNARLO A UN BUFFER DE OPENGL Y METERLE LOS DATOS -> VERTICES, NORMALES, INDICES, TEXTCOORD)
    // SHADERS Y ATTRIBUTES
    // INDICES SE SUPONE QUE INDICA EL NUMERO DE VERTICES NECESARIOS PARA REALIZAR TODA LA FIGURA

    //Programa del dibujado con colores constantes
    const programInfo = {
        program: this.programaa,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(this.programaa, 'aVertexPosition'),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(this.programaa, 'uProjectionMatrix'),
          modelMatrix: gl.getUniformLocation(this.programaa, 'uModelMatrix'),
          viewMatrix: gl.getUniformLocation(this.programaa, 'uViewMatrix'),
          fcolorLocation: gl.getUniformLocation(this.programaa, "fColor")
        }
      };

      

      //Programa del dibujado con texturas


      this.bufferpos = Array();

      this.initBuffers(gl);
      //gl.clear(gl.mask);
    let render = (now) => {

        this.height = gl.canvas.clientHeight;
        this.width = gl.canvas.clientWidth;

        this.camera.setAspecto(this.width/this.height);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //gl.useProgram(this.programaa);


        for(var i = 0;i<this.capa.length;i++){

            this.capa[i].dibujar(gl, camara, programInfo,this.tipo);
          

        }
 

        //this.drawScene(gl, programInfo, buffers,this.camera,true);  //Dibujamos los elementos que se pueden clickar con un color solido
    
        requestAnimationFrame(render); 
    }

    requestAnimationFrame(render);

}

    initBuffers(gl){

    var inix = 1;
    var iniy = 2;
    var iniz = 1;

    for(var i = 0; i<this.altura;i++){

        if(this.capa.length<this.altura){

        this.posiciones[i] = new Array();   
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        this.mMatrix.push(glMatrix.mat4.create());

        for(var j = 0; j<this.cantidad/this.altura;j++){
    
        var randx = inix + Math.random()*(45-(-45)) - 45;
        var randy = iniy + Math.random()*(10-(-1)) - 1;
        var randz = iniz + Math.random()*(15-(-35)) - 15;

        this.posiciones[i].push(randx,i + 0.05, randz);
        this.posiciones[i].push(randx+0.01,i, randz+0.01);

        }
          
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.posiciones[i]), gl.STATIC_DRAW);
    this.bufferpos.push(positionBuffer);

    var modelo = glMatrix.mat4.create();

    modelo[13] = i/2;


    var aux = new EParticulaCapa(positionBuffer,modelo,i,this.cantidad,this.altura);

    
    this.capa.push(aux);
    }
    }

   


    
}




}




