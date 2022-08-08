import { Entidad } from "./Entidad";
import * as gl from 'gl-matrix'
import { TRecursoMalla } from './recursos/TRecursoMalla';

export class EMalla extends Entidad {

    private rmalla: TRecursoMalla | null; //RMALLA

    constructor(malla) {
        
        super();

        this.rmalla = malla

    }

    dibujar(gl, programa, programa2, programa3, matriztrans, camara,luz, texturas): void { 
        
        this.rmalla.dibujar(gl, programa,programa2, programa3, matriztrans, camara,luz, texturas)
    
    }

    cargarModelo(): void { }

    setRMalla(rmalla: TRecursoMalla): void { this.rmalla = rmalla }


}