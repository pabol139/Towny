import { Entidad } from "./Entidad";
import * as glMatrix from 'gl-matrix'

export class ECamara extends Entidad {
   private tipo: boolean;
   private perspectiva: number;
   private izquierda: number;
   private derecha: number;
   private superior: number;
   private inferior: number;
   private cercano: number;
   private aspecto: number;
   private lejano: number;
   private projectionMatrix: glMatrix.mat4;
   private viewMatrix: glMatrix.mat4;

    constructor(tipo) {

        super();
        this.tipo = tipo;

        //TIPO TRUE ES PERSPECTIVA
       
        this.projectionMatrix = glMatrix.mat4.create();
        
        this.viewMatrix = glMatrix.mat4.create();  

     }


     setPersMatrix(perspectiva, aspecto, cercano, lejano){
      glMatrix.mat4.perspective(this.projectionMatrix,perspectiva,aspecto,cercano,lejano);
      this.perspectiva = perspectiva;
      this.aspecto = aspecto;
      this.cercano = cercano;
      this.lejano = lejano;
     }

     setOrtoMatrix(izquierda,derecha,inferior,superior,cercano,lejano){

      glMatrix.mat4.ortho(this.projectionMatrix,izquierda,derecha,inferior,superior,cercano,lejano);

     }

    dibujar(gl, programa,  matriztrans, camara,luz, texturas): void { 

       
        glMatrix.mat4.invert(this.viewMatrix, matriztrans);

  


     }

     getViewMatrix(){

        return this.viewMatrix;
    
     } 

     setViewMatrix(matrix){
        this.viewMatrix = matrix;
     }



     getProjectionMatrix(){

        return this.projectionMatrix;
     } 


      rotate(){
         glMatrix.mat4.rotate(this.viewMatrix, this.viewMatrix,0.553599,glMatrix.vec3.fromValues(1,0,0));
         glMatrix.mat4.translate(this.viewMatrix, this.viewMatrix, glMatrix.vec3.fromValues(0,-5,0));
      }



      setPerspectiva(): void { 


         if(this.tipo){
     
           glMatrix.mat4.perspective(this.projectionMatrix, this.perspectiva, this.aspecto ,this.cercano, this.lejano);
     
            if(this.projectionMatrix[14]>0){this.projectionMatrix[14] = -1;}
            if(this.projectionMatrix[10]>0){this.projectionMatrix[10] = -this.projectionMatrix[10]}
         }
     
     
          }
     
          setAspecto(asp): void{
             this.aspecto = asp;
     
     
           
     
             this.setPerspectiva();
          }

    setParalela(): void {  }

}