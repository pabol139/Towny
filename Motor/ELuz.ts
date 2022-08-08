import { Entidad } from "./Entidad";
import * as gl from 'gl-matrix'

enum Luces{
    Una = "Una",
    Dos = "Dos",
    Tres = "Tres"
}

export class ELuz extends Entidad {

    private intensidad: gl.vec3;
    private posicion: gl.vec3;
    private ambient: gl.vec3;
    private diffuse: gl.vec3;
    private specular: gl.vec3;


    constructor(posicion, intensidad ) {

        super();
        
        this.intensidad = intensidad;
        this.posicion = posicion;
        this.ambient = gl.vec3.fromValues(0,0,0);
        this.diffuse = gl.vec3.fromValues(0,0,0);
        this.specular = gl.vec3.fromValues(0,0,0);

     
    }

    dibujar(): void {  }

    setIntensidad(intensidad: gl.vec3): void { this.intensidad = intensidad; }

    setPosicion(posicion: gl.vec3): void { this.posicion = posicion; }

    setAmbient(ambient: gl.vec3): void { this.ambient = ambient; }

    setDiffuse(diffuse: gl.vec3): void { this.diffuse = diffuse; }

    setSpecular(specular: gl.vec3): void { this.specular = specular; }


    getIntensidad(): gl.vec3 { return this.intensidad; }

    getPosicion(): gl.vec3 { return this.posicion; }

    getAmbient(): gl.vec3 { return this.ambient; }

    getDiffuse(): gl.vec3 { return this.diffuse; }

    getSpecular(): gl.vec3 { return this.specular; }




}