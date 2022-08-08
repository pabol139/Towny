import * as glMatrix from 'gl-matrix';

export abstract class TRecurso {
    private nombre: string;
    private gl: WebGL2RenderingContext;

    constructor(nombre: string) {
        this.nombre = nombre;
    }

    getNombre(): string{
        return this.nombre;
    }

    setNombre(name: string): void{
        if(name !== null && name !== ''){
            this.nombre = name;
        }
    }

    getGl(){

       return this.gl;

    }

    setGl(gl){

        if(gl)
            this.gl = gl

    }

    cargarFichero(nombre: string): void{
        if(nombre !== null && nombre !== ''){
            //console.log('Cargamos el fichero');
        }
    }
}