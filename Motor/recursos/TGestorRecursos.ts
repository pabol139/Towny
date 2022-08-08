import { TRecurso } from './TRecurso';
import * as gl from 'gl-matrix'
import { TRecursoMalla } from './TRecursoMalla';
import { TRecursoShader } from './TRecursoShader';
import { TRecursoMaterial } from './TRecursoMaterial';
import fetch from "node-fetch";
import { TRecursoTextura } from './TRecursoTextura';
import { CardinfoComponent } from 'src/app/commons/cardinfo/cardinfo.component';
import { url } from 'inspector';

export class TGestorRecursos {
    private recursos;

    constructor(private cardInfo){
        this.recursos = new Array<TRecurso>();
    }

    getRecurso(recursoNombre: string, recursoTipo: string, gl): TRecurso | null{ 
        var rec = null;

        for(let i = 0; i< this.recursos.length;i++){
            if(this.recursos[i].getNombre() == recursoNombre){
                rec = this.recursos[i];
                break;
            }
        }

        if(rec == null){

            switch(recursoTipo){

                case "malla":

                    rec = new TRecursoMalla(recursoNombre,this.cardInfo);
                    break;

                case "shader":

                    rec = new TRecursoShader(recursoNombre);

                    break;

                case "material":

                    rec = new TRecursoMaterial(recursoNombre);
                    break;

                case "texturas":

                    rec = new TRecursoTextura(recursoNombre);
                    break;

            }

            rec.setGl(gl);
            rec.cargarFichero(recursoNombre);


            if(rec !== null){
                
                this.recursos.push(rec);
            }
        }

        return rec;
    }
}