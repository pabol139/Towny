import { TRecurso } from "./TRecurso";
import * as gl from 'gl-matrix';

export class TRecursoTextura extends TRecurso {
    private id: number;
    private width: number;
    private height: number
    private url:string;

    constructor(nombre: string,) {
        super(nombre);
        /* 
        this.id = id;*/
        this.width = 1;
        this.height = 1;
            
    
    }

   /* dibujar(): void{
        console.log('Dibujo la textura');
    }*/

    cargarFichero(nombre: string): void {
        if(nombre !== null && nombre !== ''){
            this.url= nombre;
        }
    }

   getFichero(): string {
       return this.url;
    }

    getId():number {
        return this.id;
    }

    getWidth():number {
        return this.width;
    }

    getHeight():number {
        return this.height;
    }

    setId(id: number):void {
        this.id = id;
    }

    setWidth(width: number):void {
        this.width = width;
    }

    setHeight(height: number):void {
        this.height = height;
    }


    public loadTexture(gl) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
      
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = this.width;
        const height = this.height;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);  
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      width, height, border, srcFormat, srcType,
                      pixel);
      
        const image = new Image();
        image.onload = function() {
          gl.bindTexture(gl.TEXTURE_2D, texture);

          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

          gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                        srcFormat, srcType, image);
      
   
          if ((image.width & (image.width -1)) == 0 && (image.height & (image.height -1)) == 0) {
             // Yes, it's a power of 2. Generate mips.
 
             gl.generateMipmap(gl.TEXTURE_2D);
          } else {
             
             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          }
        };
        image.src =this.url;
      
        return texture;
      }
}