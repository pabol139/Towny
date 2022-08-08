import { TNodo } from './TNodo';
import { TGestorRecursos } from './recursos/TGestorRecursos';
import { ECamara } from './ECamara';
import { ELuz } from './ELuz';
import { EMalla } from './EMalla';
import { EParticula } from './EParticula';
import { CardinfoComponent } from 'src/app/commons/cardinfo/cardinfo.component';
export class Motor{


    private escena: TNodo;
    private gl : WebGL2RenderingContext;
    private gestorR;
    private programa;
    private programa2;
    private programa3;
    private camaraActiva;
    private luzActiva;
    private registroTexturas;
    private programaPart;
    
    //hacer arrays de luces texturas camaras



    constructor(escena, gestor, gl, private cardInfo){

        if(escena)
            this.escena = escena;
        else
            this.escena = new TNodo();

        if(gestor)
            this.gestorR = gestor
        else
            this.gestorR = new TGestorRecursos(this.cardInfo);

        this.gl = gl;

        // Shaders
        this.programa = null;

        this.registroTexturas = []

    }

    iniciarPrograma(vertex, fragment){

        let vertexShader = vertex
        let fragmentShader = fragment
        let shadersProgram = this.gl.createProgram();

        this.gl.attachShader(shadersProgram, vertexShader);
        this.gl.attachShader(shadersProgram, fragmentShader);
        this.gl.linkProgram(shadersProgram);


        if(!this.gl.getProgramParameter(shadersProgram, this.gl.LINK_STATUS)){

            //console.log('Fallo al crear los shaders en' + this.gl.getProgramInfoLog(shadersProgram))
        }

        this.programa =  shadersProgram;

    }


    iniciarPrograma2(vertex, fragment){

        let vertexShader = vertex
        let fragmentShader = fragment
        let shadersProgram = this.gl.createProgram();

        this.gl.attachShader(shadersProgram, vertexShader);
        this.gl.attachShader(shadersProgram, fragmentShader);
        this.gl.linkProgram(shadersProgram);


        if(!this.gl.getProgramParameter(shadersProgram, this.gl.LINK_STATUS)){

            //console.log('Fallo al crear los shaders en' + this.gl.getProgramInfoLog(shadersProgram))
        }

        this.programa2 =  shadersProgram;

    }

    iniciarPrograma3(vertex, fragment){


        let vertexShader = vertex
        let fragmentShader = fragment
        let shadersProgram = this.gl.createProgram();

        this.gl.attachShader(shadersProgram, vertexShader);
        this.gl.attachShader(shadersProgram, fragmentShader);
        this.gl.linkProgram(shadersProgram);


        if(!this.gl.getProgramParameter(shadersProgram, this.gl.LINK_STATUS)){

            //console.log('Fallo al crear los shaders en' + this.gl.getProgramInfoLog(shadersProgram))
        }

        this.programa3 =  shadersProgram;

    }

    programaParticula(vertex, fragment){

        let vertexShader = vertex
        let fragmentShader = fragment
        let shadersProgram = this.gl.createProgram();

        this.gl.attachShader(shadersProgram, vertexShader);
        this.gl.attachShader(shadersProgram, fragmentShader);
        this.gl.linkProgram(shadersProgram);


        if(!this.gl.getProgramParameter(shadersProgram, this.gl.LINK_STATUS)){

            //console.log('Fallo al crear los shaders en' + this.gl.getProgramInfoLog(shadersProgram))
        }

      return(shadersProgram);

    }



    
    crearNodo(padre, entidad, traslacion, rotacion, escalado){

        if(!padre)
            padre = this.escena;

        let nodo = new TNodo();
        nodo.setPadre(padre);
        nodo.setEntidad(entidad);

        if(traslacion)
            nodo.setTraslacion(traslacion);
        
        if(rotacion)
            nodo.setRotacion(rotacion);

        if(escalado)
            nodo.setEscalado(escalado);

        return nodo;

    }


    crearCamara(tipo){

        let camara = new ECamara(tipo);

        if(!this.camaraActiva)
            this.camaraActiva = camara;

        return camara;

    }

    crearLuz(intensidad, posicion){

        let luz = new ELuz(intensidad, posicion);

        if(!this.luzActiva)
            this.luzActiva = luz;

        return luz;

    }

    crearMalla(fichero){

        let malla = new EMalla(fichero);

        return malla;

    }

    crearParticula(x,y,t,p){
        let particula = new EParticula(x,y,t,p);

        return particula;
    }

    dibujarEscena(){

        this.escena.recorrer(this.gl, this.programa,this.programa2, this.programa3, this.camaraActiva, this.luzActiva, this.registroTexturas, null)

    }
    
    getRaiz(){

        return this.escena;

    }




}