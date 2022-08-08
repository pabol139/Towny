import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {ElementRef, Injectable, NgZone, OnDestroy, ɵɵclassMapInterpolate4} from '@angular/core';
import { hexToRgb } from '@swimlane/ngx-charts';
import { min } from 'rxjs/operators';
import { TimelineLite, Back, Power1 } from 'gsap'
import { PuebloService } from './pueblo.service';
import { ProvinciaService } from './provincia.service';
import { ApiService } from './api.service';
import { ConstantPool } from '@angular/compiler';
import { TNodo } from '../../../../Motor/TNodo';
import { ELuz } from '../../../../Motor/ELuz';
import { ECamara } from '../../../../Motor/ECamara';
import { EMalla } from '../../../../Motor/EMalla';
import { TGestorRecursos } from '../../../../Motor/recursos/TGestorRecursos';
import { TRecursoMalla } from '../../../../Motor/recursos/TRecursoMalla';
import * as glMatrix from 'gl-matrix-ts'
import { TRecursoShader } from '../../../../Motor/recursos/TRecursoShader';

//import * as THREEx from '../../assets/engine.elements/threex.domevents.js'
//import * as CanvasJS from './canvasjs.min';
import { Motor } from '../../../../Motor/Motor';
import * as gl from 'gl-matrix-ts';
import { TRecursoTextura } from '../../../../Motor/recursos/TRecursoTextura';
import { fromValues } from 'gl-matrix-ts/dist/mat3';
import { CardinfoService } from './cardinfo.service';
import { TRecurso } from '../../../../Motor/recursos/TRecurso';
import { vertexShaderTexto } from '../../../../Motor/shaders/VertexShaderTexto';


@Injectable({providedIn: 'root'})
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement | undefined;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private onRenderFcts= [];
  private controls: THREE.OrbitControls;
  private evento:any;
  private zoom=0;gl: any;
  private rotacionIni: any;
;
  private x=0;
  private y=0;
  private mylatesttap;
  private tapedTwice = false;

  private motor:Motor;
  private gestorR:TGestorRecursos;
  private lastRecurso:TRecurso;
  private lastParticula:TNodo;

  private cube: THREE.Mesh;
  private obj:THREE.Object3D;

  private frameId: number = null;
  private TextureArray:TRecursoTextura[]=[];
  private texturasNombres:any[]=[];
  private lastNodo:TNodo;
  private camara:any;
  public zoomObject:any;
  public coorxZoom=0;
  public cooryZoom=0;
  public coorzZoom=0;
  public yentra:boolean=false;
  public zentra:boolean=false;

  public constructor(private ngZone: NgZone, private townService: PuebloService,private apiservice:ApiService,
   /*, private cardInfo:CardinfoComponent*/
    private cardinfoServ:CardinfoService  ) {
      this.zoomObject=null;
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document


    this.canvas = canvas.nativeElement;

    this.main(this.canvas);


}

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();

        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });
    if(this.lastRecurso instanceof TRecursoMalla){
      if(this.lastRecurso.matrizObj!=null && this.rotacionIni==null){
        this.rotacionIni=new Float32Array(this.lastRecurso.matrizObj);


      }
    }

    if(this.zoomObject!=null){

        if(this.lastRecurso instanceof TRecursoMalla){
          if(this.lastRecurso.matrizObj[0]!=this.rotacionIni[0]){
            //console.log("ha rotado");
            this.lastRecurso.matrizObj= new Float32Array(this.rotacionIni)
          }


          this.lastRecurso.zoom(this.zoomObject);
          var pos:any=this.lastRecurso.getPosMesh();
          if(pos.length>0){
            this.coorxZoom=pos[0];
            this.cooryZoom=pos[1]-2.5;
            this.coorzZoom=pos[2]+6;

          }

        }


        var cam= this.camara.getViewMatrix();
        var inv = glMatrix.mat4.create();
        glMatrix.mat4.invert(inv,cam);
        var velocidad=0.5;


//ZOOM EJE X
        if(inv[12].toFixed(0)!=this.coorxZoom.toFixed(0)){

          if(this.coorxZoom>0 ){
            if(Math.abs(inv[12])>Math.abs(this.coorxZoom)&&Math.sign(inv[12])==-1){
              inv[12]+=velocidad;

            }
            else if(Math.abs(inv[12])<Math.abs(this.coorxZoom)&&Math.sign(inv[12])==-1){
              inv[12]+=velocidad;

            }else if(Math.abs(inv[12])>Math.abs(this.coorxZoom)&&Math.sign(inv[12])==1){
              inv[12]-=velocidad;
            }
            else if(Math.abs(inv[12])<Math.abs(this.coorxZoom)&&Math.sign(inv[12])==1){
              inv[12]+=velocidad;
            }


          }


         else if(this.coorxZoom<0 ){
          if(Math.abs(inv[12])>Math.abs(this.coorxZoom)&&Math.sign(inv[12])==-1){
            inv[12]+=velocidad;

          }
          else if(Math.abs(inv[12])<Math.abs(this.coorxZoom)&&Math.sign(inv[12])==-1){
            inv[12]-=velocidad;

          }else if(Math.abs(inv[12])>Math.abs(this.coorxZoom)&&Math.sign(inv[12])==1){
            inv[12]-=velocidad;
          }
          else if(Math.abs(inv[12])<Math.abs(this.coorxZoom)&&Math.sign(inv[12])==1){
            inv[12]-=velocidad;
          }


          }

      }
//ZOOM EJE Y
      if(inv[13].toFixed(0)!=this.cooryZoom.toFixed(0)){

        if(this.cooryZoom>0 ){
          if(Math.abs(inv[13])>Math.abs(this.cooryZoom)&&Math.sign(inv[13])==-1){
            inv[13]+=velocidad;

          }
          else if(Math.abs(inv[13])<Math.abs(this.cooryZoom)&&Math.sign(inv[13])==-1){
            inv[13]+=velocidad;

          }else if(Math.abs(inv[13])>Math.abs(this.cooryZoom)&&Math.sign(inv[13])==1){
            inv[13]-=velocidad;
          }
          else if(Math.abs(inv[13])<Math.abs(this.cooryZoom)&&Math.sign(inv[13])==1){
            inv[13]+=velocidad;
          }


        }


       else if(this.cooryZoom<0 ){
        if(Math.abs(inv[13])>Math.abs(this.cooryZoom)&&Math.sign(inv[13])==-1){
          inv[13]+=velocidad;

        }
        else if(Math.abs(inv[13])<Math.abs(this.cooryZoom)&&Math.sign(inv[13])==-1){
          inv[13]-=velocidad;

        }else if(Math.abs(inv[13])>Math.abs(this.cooryZoom)&&Math.sign(inv[13])==1){
          inv[13]-=velocidad;
        }
        else if(Math.abs(inv[13])<Math.abs(this.cooryZoom)&&Math.sign(inv[13])==1){
          inv[13]-=velocidad;
        }


        }

      }else{this.yentra=true;}
//ZOOM EJE Z
      if(inv[14].toFixed(0)!=this.coorzZoom.toFixed(0)){

        if(this.coorzZoom>0 ){
          if(Math.abs(inv[14])>Math.abs(this.coorzZoom)&&Math.sign(inv[14])==-1){
            inv[14]+=velocidad;

          }
          else if(Math.abs(inv[14])<Math.abs(this.coorzZoom)&&Math.sign(inv[14])==-1){
            inv[14]+=velocidad;

          }else if(Math.abs(inv[14])>Math.abs(this.coorzZoom)&&Math.sign(inv[14])==1){
            inv[14]-=velocidad;
          }
          else if(Math.abs(inv[14])<Math.abs(this.coorzZoom)&&Math.sign(inv[14])==1){
            inv[14]+=velocidad;
          }


        }


       else if(this.coorzZoom<0 ){
        if(Math.abs(inv[14])>Math.abs(this.coorzZoom)&&Math.sign(inv[14])==-1){
          inv[14]+=velocidad;

        }
        else if(Math.abs(inv[14])<Math.abs(this.coorzZoom)&&Math.sign(inv[14])==-1){
          inv[14]-=velocidad;

        }else if(Math.abs(inv[14])>Math.abs(this.coorzZoom)&&Math.sign(inv[14])==1){
          inv[14]-=velocidad;
        }
        else if(Math.abs(inv[14])<Math.abs(this.coorzZoom)&&Math.sign(inv[14])==1){
          inv[14]-=velocidad;
        }


        }



      }else{this.zentra=true;}


      if(inv[12].toFixed(0)==this.coorxZoom.toFixed(0)&&this.yentra==true&&this.zentra==true){
        this.zoomObject=null;
        this.coorxZoom=0;
        this.cooryZoom=0;
        this.coorzZoom=0;
        this.zentra=false;
        this.yentra=false;
      }

      glMatrix.mat4.invert(cam,inv);



    }



  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;


    if(this.camera){

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

    }


   // this.renderer.setSize(width, height);
  }








public removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

public doubletap() {

  var now = new Date().getTime();
  var timesince = now - this.mylatesttap;
  if((timesince < 600) && (timesince > 0)){

    this. mylatesttap = new Date().getTime();
   return true;

  }else{
          this. mylatesttap = new Date().getTime();
           return false;
        }



}


public resizeCanvasToDisplaySize(canvas) {

  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}
public loadMesh(name:string):void{

    //if(this.lastRecurso instanceof TRecursoMalla){this.lastRecurso.resetEscena(this.gl);}


  // this.resizeCanvasToDisplaySize(canvas);


  //this.motor   = new Motor(null, this.gestorR, this.gl, this.cardinfoServ);

  //this.gestorR = new TGestorRecursos(this.cardinfoServ);
  var escena = this.gestorR.getRecurso("models/json/"+name, "malla", gl);

  if(escena instanceof TRecursoMalla){
    escena.resetEscena(this.gl);
    this.texturasNombres=escena.texturesNames;
  }

  //  var castilloSolo =  gestorR.getRecurso("models/json/CastilloUnido","malla",gl);
  var trasformacion =  glMatrix.vec3.fromValues(0, 0, 0);
  var trasformacion2 =  glMatrix.vec3.fromValues(10, 0, 10);
  var rotacion =  glMatrix.vec3.fromValues(0, 0, 0);
  var rotacion2 =  glMatrix.vec3.fromValues(45, 0, 0);
  var escalado =  glMatrix.vec3.fromValues(1, 1, 1);
    // Texturas


    if(escena instanceof TRecursoMalla){
      if(escena.getTextureArr.length<1 && escena!=this.lastRecurso){

        for (let index = 0; index < this.texturasNombres.length; index++) {
          const element = this.texturasNombres[index];
          var newText= this.gestorR.getRecurso(element, "texturas", gl);
          if(newText instanceof TRecursoTextura){
            newText.cargarFichero('assets/images/textures/'+element);

            this.TextureArray.push(newText);}

        }


        if(escena instanceof TRecursoMalla){escena.addTextureArr(this.TextureArray);
       }

      }
    }

    this.lastRecurso= escena;

    var mescena = this.motor.crearMalla(escena);

    this.TextureArray=[];

    var nescena = this.motor.crearNodo(this.motor.getRaiz,mescena,trasformacion,rotacion,escalado);
    this.lastNodo= nescena;
    this.motor.getRaiz().addHijo(nescena);
    nescena.setEscalado(glMatrix.vec3.fromValues(0.02,0.02,0.02));




    var vertexShader = this.gestorR.getRecurso("vertex", "shader", gl);
    var fragmentShader = this.gestorR.getRecurso("fragment", "shader", gl);
    var fragmentShader2 = this.gestorR.getRecurso("fragment2","shader",gl);
    var vexterShaderPart = this.gestorR.getRecurso("vertexPart","shader",gl);

    if(vexterShaderPart instanceof TRecursoShader && fragmentShader instanceof TRecursoShader)
    var promPar = this.motor.programaParticula(vexterShaderPart.getShader(), fragmentShader.getShader())

    var mPar = this.motor.crearParticula(20000,10,"lluvia",promPar);
    var nPar = this.motor.crearNodo(this.motor.getRaiz,mPar,trasformacion,rotacion,escalado);
    this.lastParticula=nPar;

   // this.motor.getRaiz().addHijo(nPar);

    this.motor.dibujarEscena();
}


main(rendererCanvas): void{

  const canvas = rendererCanvas; // PREGUNTA ALEJANDRO

 // this.resizeCanvasToDisplaySize(canvas);

  const gl = canvas.getContext("webgl2")

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  this.gl= gl;
  this.gestorR = new TGestorRecursos(this.cardinfoServ);


  this.motor   = new Motor(null, this.gestorR, gl, this.cardinfoServ);

  // Recursos

    // Shaders

    var vertexShader = this.gestorR.getRecurso("vertex", "shader", gl);
    var fragmentShader = this.gestorR.getRecurso("fragment", "shader", gl);
    var fragmentShader2 = this.gestorR.getRecurso("fragment2","shader",gl);
    var vexterShaderPart = this.gestorR.getRecurso("vertexPart","shader",gl);
    var vertexShaderTexto = this.gestorR.getRecurso("vertexText","shader",gl);
    var fragmentShaderTexto = this.gestorR.getRecurso("fragmentText","shader",gl);


  var trasformacion =  glMatrix.vec3.fromValues(0, 0, 0);
  var trasformacion2 =  glMatrix.vec3.fromValues(10, 0, 10);
  var rotacion =  glMatrix.vec3.fromValues(0, 0, 0);
  var rotacion2 =  glMatrix.vec3.fromValues(45, 0, 0);
  var escalado =  glMatrix.vec3.fromValues(1, 1, 1);
  var escalado2 =  glMatrix.vec3.fromValues(5, 5, 5);



  //SHADERS CLICK

  if(vertexShader instanceof TRecursoShader && fragmentShader instanceof TRecursoShader)
    this.motor.iniciarPrograma(vertexShader.getShader(), fragmentShader.getShader())

  //SHADERS DIBUJADO

  if(vertexShader instanceof TRecursoShader && fragmentShader2 instanceof TRecursoShader)
    this.motor.iniciarPrograma2(vertexShader.getShader(), fragmentShader2.getShader())

  //SHADERS PARTICULAS

  if(vexterShaderPart instanceof TRecursoShader && fragmentShader instanceof TRecursoShader)
    var promPar = this.motor.programaParticula(vexterShaderPart.getShader(), fragmentShader.getShader())

  //SHADERS TEXTO

  if(vertexShaderTexto instanceof TRecursoShader && fragmentShaderTexto instanceof TRecursoShader)
    this.motor.iniciarPrograma3(vertexShaderTexto.getShader(), fragmentShaderTexto.getShader())


    //textura es el segundo programa

  //Camara


  //TRUE CAMARA PERSPECTIVA FALSE CAMARA ORTOGRAFIVA

  this.camara = this.motor.crearCamara(true);
  //camara.setOrtoMatrix(0,10,0,5,0.1,100.0);
  this.camara.setPersMatrix(45 * Math.PI / 180,gl.canvas.clientWidth / gl.canvas.clientHeight,0.1,100.0);


  var nodoCamara = this.motor.crearNodo(this.motor.getRaiz(), this.camara, null, rotacion, null);
  this.motor.getRaiz().addHijo(nodoCamara);

  // Luz

  var colorLuz = glMatrix.vec3.fromValues(1, 1, 0.854) // Luz tarde
  var difusaLuz = glMatrix.vec3.fromValues(1.0, 1.0, 1.0)
  var specularLuz = glMatrix.vec3.fromValues(0.5, 0.5, 0.5)

  var intensidadLuz = 0.4
  var posicionLuz = glMatrix.vec3.fromValues(-5, 5.0, 10)


  var luz = this.motor.crearLuz(posicionLuz, intensidadLuz);

  luz.setAmbient(colorLuz);
  luz.setDiffuse(difusaLuz);
  luz.setSpecular(specularLuz);

  var nodoLuz= this.motor.crearNodo(this.motor.getRaiz(), luz, null, null, null);
  this.motor.getRaiz().addHijo(nodoLuz);

  // Mallas

 // var mcastillosolo = motor.crearMalla(castilloSolo);
 // var ncastillosolo = motor.crearNodo(motor.getRaiz,mcastillosolo,trasformacion,rotacion,escalado);




//Primer parámetro cantidad total de particulas, segundo capas en las que se divide y altura



  //Npueblo.addHijo(Ncastillo);
  //Npueblo.addHijo(Niglesia);
  //Npueblo.addHijo(Ncinema);
  //Npueblo.addHijo(Ncastillo2);

 // motor.getRaiz().addHijo(Npueblo);

 // motor.getRaiz().addHijo(nsusana);





  //motor.getRaiz().addHijo(ncastillosolo);





  this.camara.rotate();





  // Viewport

  // Dibujar








  }

public animar():void{
}

}


