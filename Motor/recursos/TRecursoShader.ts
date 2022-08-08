import { TRecurso } from "./TRecurso";
import * as glx from 'gl-matrix';
import * as webgl from 'webgl-operate';
import{Context} from 'webgl-operate';
import { vertexShader } from '../shaders/VertexShader'
import { fragmentShader } from '../shaders/FragmentShader'
import { fragmentShader2 } from '../shaders/FragmentShader2'
import { vertexShaderPart } from '../shaders/VertexShaderPart'
import { vertexShaderTexto } from '../shaders/VertexShaderTexto';
import { fragmentShaderTexto } from '../shaders/FragmentShaderTexto';
export class TRecursoShader extends TRecurso {
    private id: string;
    private context:Context | undefined;
    private canvas: HTMLCanvasElement | undefined;
    private shader: WebGLShader;

    constructor(nombre: string) {

        super(nombre);
        

    }

    dibujar(): void{
        //console.log('Dibujo el shader');
        
    }

    cargarFichero(tipo: string){

         this.cargarShaders(tipo)

    }

    cargarShaders(tipo: string) {

        let shader: WebGLShader;
        let gl = this.getGl();

        let vertex = vertexShader;

        let fragment = fragmentShader;

        let fragment2 = fragmentShader2;

        let vertexPart = vertexShaderPart;

        let vertexTexto = vertexShaderTexto;

        let fragmentTexto = fragmentShaderTexto;


        let vertexText = vertex.trim();
        let fragmentText = fragment.trim();
        let fragmentText2 = fragment2.trim();
        let vertexPartText = vertexPart.trim();
        let vertexTextoText = vertexTexto.trim();
        let fragmentTextoText = fragmentTexto.trim();


        switch(tipo){

            case "vertex":

                shader = gl.createShader(gl.VERTEX_SHADER)
                gl.shaderSource(shader, vertexText)
                gl.compileShader(shader)
                break;

            case "vertexPart":

                shader = gl.createShader(gl.VERTEX_SHADER)
                gl.shaderSource(shader, vertexPartText)
                gl.compileShader(shader)
                break;

            case "fragment":

                shader = gl.createShader(gl.FRAGMENT_SHADER)
                gl.shaderSource(shader, fragmentText)
                gl.compileShader(shader)
                break;

            case "fragment2":

                shader = gl.createShader(gl.FRAGMENT_SHADER)
                gl.shaderSource(shader, fragmentText2)
                gl.compileShader(shader)
                break;

            case "vertexText":

                shader = gl.createShader(gl.VERTEX_SHADER)
                gl.shaderSource(shader, vertexTextoText)
                gl.compileShader(shader)
                break;

            case "fragmentText":

                shader = gl.createShader(gl.FRAGMENT_SHADER)
                gl.shaderSource(shader, fragmentTextoText)
                gl.compileShader(shader)
                break;

        }



        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            alert(gl.getShaderInfoLog(shader));

            return null;

        }

        this.shader = shader;

    }


    getShader(){

        return this.shader;
    }
    
}