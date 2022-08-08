import { Entidad } from "./Entidad";
import * as gl from 'gl-matrix'
import { EMalla } from "./EMalla";


export class EAnimacion extends Entidad {

 private mallas: EMalla[] = [];
 public frame= 0;
    
    constructor(animacion: EMalla[]) {
        
        super();

       this.mallas= animacion;
       //console.log("animacion cargada")

    }
    dibujar(gl, programa, programa2, matriztrans, camara,luz, texturas): void { 
        
        //console.log("Dibujar de Animacion");
        this.mallas[this.frame].dibujar(gl, programa, programa2, matriztrans, camara,luz, texturas);
    }

    dibujarAnimation(frame,gl, programa, programa2, matriztrans, camara,luz, texturas): void { 
        
        //console.log("Dibujar de Animacion");
        this.mallas[frame].dibujar(gl, programa, programa2, matriztrans, camara,luz, texturas);
    }

    setAnimacion(mesh: EMalla[]){
        this.mallas=mesh;
    }
    getAnimacion(){
       return this.mallas;
    }
    setFrame(frame){
        this.frame=frame;
    }
    getFrame(){
       return this.frame;
    }


}