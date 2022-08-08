import { TRecurso } from "./TRecurso";
import * as gl from 'gl-matrix';

export class TRecursoMaterial extends TRecurso {
    private coef_ligth: number;
    private rec_texture: number;

    constructor(nombre: string) {
        super(nombre);
        /*, luz: number, texture: number 
        this.coef_ligth = luz;
        this.rec_texture = texture;*/
    }

    getCoeficienteLuminose(): number{
        return this.coef_ligth;
    }

    getRecursoTexture(): number{
        return this.rec_texture;
    }

    setCoeficienteLuminose(cof_light: number): void{
        this.coef_ligth = cof_light;
    }

    setRecursoTexture(rec_texture: number): void{
        this.rec_texture = rec_texture;
    }


    cargarFichero(nombre: string): void{
        if(nombre !== null && nombre !== ''){
            //console.log('Cargamos el fichero de materiales');
            const mat = require('../'+nombre+'.json');
           
            this.coef_ligth= mat.coef;
            this.rec_texture= mat.r_texture;
            
        }
    }
}