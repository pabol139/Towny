import { Entidad } from "./Entidad";
import * as glMatrix from 'gl-matrix'


export class EParticulaCapa extends Entidad {


    programaa;
    id;
    buffer;
    mMatrix;
    numero;
    capas;


    constructor(b,m,n,nn,c) {
        
        super();
        this.buffer = b;
        this.mMatrix = m;
        this.id = n;
        this.numero = nn;
        this.capas = c;



     
    }

    dibujar(gl, camara, programa,t): void { 

    
       // console.log("Dibujar particulas");
   

        
    //gl.clearColor(0, 0, 0, 1.0);  
    gl.enable(gl.DEPTH_TEST);        
    gl.depthFunc(gl.LEQUAL);         

    //Cargamos las matrices

    var projectionMatrix = glMatrix.mat4.create();
    projectionMatrix = camara.getProjectionMatrix();

    const vMatrix = camara.getViewMatrix();

    //const mMatrix = m;
  

    if(this.mMatrix[13]<-3){
        this.mMatrix[13] = 3;
        this.mMatrix[12] = -5;
    }

   if(this.mMatrix[12]>10){
    this.mMatrix[12] = -10;
    }


  glMatrix.mat4.translate(this.mMatrix,this.mMatrix,glMatrix.vec3.fromValues(0.005,-0.03,0))



    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(
            programa.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programa.attribLocations.vertexPosition);
    }

    
    gl.useProgram(programa.program);

    gl.uniformMatrix4fv(
        programa.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);

    gl.uniformMatrix4fv(
        programa.uniformLocations.modelMatrix,
        false,
        this.mMatrix);

    gl.uniformMatrix4fv(
        programa.uniformLocations.viewMatrix,
            false,
            vMatrix);
    
        //Asignamos un color

        if(t=="lluvia"){

        gl.uniform4f(programa.uniformLocations.fcolorLocation,89/255,194/255,249/255,1);
        }

        if(t == "nieve"){
            gl.uniform4f(programa.uniformLocations.fcolorLocation,255,255,255,1);
        }

    {
       
        gl.drawArrays( gl.LINES, 0, (2*this.numero)/this.capas);
        //Comprobamos que se haya hecho click y que sea la funcion correspondiente
        
    }



    //matriz de los objetos

    

 




}
}



