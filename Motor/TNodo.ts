import { Entidad } from "./Entidad";
import * as glMatrix from 'gl-matrix'

export class TNodo {

    private entidad: Entidad | null;
    private padre: TNodo | null;
    private hijos: TNodo[];
    private actualizarMatriz: boolean;
    private traslacion: glMatrix.vec3;
    private rotacion: glMatrix.vec3;
    private escalado: glMatrix.vec3;
    private matrizTrans: glMatrix.mat4;


    // TENER ARRAY DE LUCES Y CAMARAS PARA PODER CALCULAR LOS UNIFORMS SIN TENER QUE IR NODO A NODO
    // CREAR PRIMER NODO COMO CAMARA Y SEGUNDO LA MALLA PARA PRUEBA RAPIDA

    constructor() {

        this.entidad = null;
        this.hijos = [];
        this.padre = null;

        this.traslacion = glMatrix.vec3.create();
        this.rotacion = glMatrix.vec3.create();
        this.escalado = glMatrix.vec3.create();
        this.matrizTrans = glMatrix.mat4.create();
        this.actualizarMatriz = false;

    }

    addHijo( hijo: TNodo): Number{

        if(hijo != null){

            this.hijos.push(hijo);
            hijo.setPadre(this);
            

            return 1;
        }

        return -1;
        
    }

    
    remHijo( hijo: TNodo): Number{

        if(hijo != null){

            var index = this.hijos.indexOf(hijo);
          

            if(index > -1){
            
                this.hijos.splice(index, 1);
                hijo.setPadre(null);
              
                return 1;

            }
        }

        return -1;
        
    }

    setEntidad( entidad: Entidad): Boolean{

        if(entidad != null){


            this.entidad = entidad;


            return true;
        }

        return false;
        
    }

    recorrer(gl, programa,programa2,programa3, camara, luz, texturas, matriz: glMatrix.mat4): void{

        var unix = glMatrix.vec3.create();
        var uniy = glMatrix.vec3.create();
        var uniz = glMatrix.vec3.create();
        unix[0] = 1;
        uniy[1] = 1;
        uniz[2] = 1;

        if(this.actualizarMatriz && matriz){
        
            glMatrix.mat4.translate(this.matrizTrans, this.matrizTrans,this.traslacion);
            glMatrix.mat4.rotate(this.matrizTrans, this.matrizTrans,this.rotacion[0],unix);
            glMatrix.mat4.rotate(this.matrizTrans, this.matrizTrans,this.rotacion[1],uniy);
            glMatrix.mat4.rotate(this.matrizTrans, this.matrizTrans,this.rotacion[2],uniz);  
            glMatrix.mat4.scale(this.matrizTrans, this.matrizTrans,this.escalado);

            glMatrix.mat4.multiply(this.matrizTrans, matriz, this.matrizTrans)

            this.actualizarMatriz = false;
        }
        

        if(this.entidad){

            this.entidad.dibujar(gl, programa,programa2, programa3,  this.matrizTrans, camara, luz, texturas);
        }

        for(let i = 0; i < this.hijos.length; i++){
            this.hijos[i].recorrer(gl, programa,programa2, programa3, camara, luz, texturas, this.matrizTrans);
        }

    }

    trasladar(traslacion: glMatrix.vec3   ): void{
        

        glMatrix.vec3.add(this.traslacion,this.traslacion, traslacion);
        
        this.actualizarMatriz = true;

    }

    rotar(rotacion: glMatrix.vec3): void{
        
        glMatrix.vec3.add(this.rotacion,this.rotacion, rotacion);
        this.actualizarMatriz = true;

    }

    escalar(escalado: glMatrix.vec3): void{
        
        glMatrix.vec3.add(this.escalado,this.escalado, escalado);
        this.actualizarMatriz = true;

    }


    setTraslacion(traslacion: glMatrix.vec3): void{


        this.traslacion = traslacion;


        this.actualizarMatriz = true;


    }

    setRotacion(rotacion: glMatrix.vec3): void{

        
        this.rotacion = rotacion;


        this.actualizarMatriz = true;

    }
    
    setEscalado(escalado: glMatrix.vec3): void{

        
        this.escalado = escalado;


        this.actualizarMatriz = true;

    }

    setMatrizTransf(matriz: glMatrix.mat4): void{
        
        this.matrizTrans = matriz;

        //this.actualizarMatriz = true;
    }

    setPadre(padre: TNodo | null): void{
        
        this.padre = padre;
    }

    getMatrizTransf(): glMatrix.mat4{ return this.matrizTrans }

    getEntidad(): Entidad | null{ return this.entidad }

    getPadre(): TNodo | null{ return this.padre }

    getTraslacion(): glMatrix.vec3{ return this.traslacion }

    getRotacion(): glMatrix.vec3{ return this.rotacion }    

    getEscalado(): glMatrix.vec3{ return this.escalado }


}