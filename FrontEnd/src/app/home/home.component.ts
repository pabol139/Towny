import { Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { UserService } from '../services/user.service';
import { ELuz } from "../../../../Motor/ELuz"
import { Entidad } from "../../../../Motor/Entidad"
import { TNodo } from '../../../../Motor/TNodo';
import { ECamara } from '../../../../Motor/ECamara';
import { EMalla } from '../../../../Motor/EMalla';
import * as gl from 'gl-matrix';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';
import { MapService } from '../services/map.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit {

  public load = false;
 // private drawer: MatDrawer;
 @ViewChild('drawer') drawer: MatSidenav;
  constructor(public mapservice:MapService) { }

  ngOnInit(): void {
    /*
    setTimeout( () =>{
      this.load = true;
    }, 400);
    */
   //this.main();
  }

  ngAfterViewInit(){  
      var checkExist = setInterval(() => {
        if (document.querySelector("#starsReviewFavvvf")) {
           clearInterval(checkExist);
        }
      }, 1000);
  }

  cerrarTodasCardCARDINFO(){
    document.getElementById('tarjEvento').classList.remove('Activo');
    document.getElementById('tarjLugar').classList.remove('Activo');
    document.getElementById('tarjLugarReviews').classList.remove('Activo');
    document.getElementById('tarjPueblo').classList.add('Activo');

    if(document.getElementById('engine-wrapper').classList.contains('active')){
      //document.getElementById('cerrarTarLug').style.opacity = '1';
      document.getElementById('cerrarTarLug').style.display = "none";
      let docClose = document.getElementById('ocultarTarLug');
      docClose.classList.remove('active');
    }else{
      let doc = document.getElementById('tarLug');
      doc.classList.remove('active');
      let docClose = document.getElementById('cerrarTarLug');
      docClose.classList.remove('active');
    }

  }

  cerrarMenuUsuario(){
    var optUser = document.getElementById('menu');
    optUser.classList.remove("active");
  }

  onClick(event) {
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id || '';
    var value = idAttr.nodeValue || '';

    this.cerrarCardViaj();
    this.cerrarCardFavs();
    this.cerrarCardRevws();

    if(value=='misviajes'){
      document.getElementById('tarViaj').classList.add('active');
      document.getElementById('cerrarTarViaj').classList.add('active');
      document.getElementById('misviajesHome').classList.add('Homeactive');
      this.cerrarTodasCardCARDINFO();
      this.cerrarMenuUsuario();
    }
    if(value=='valoraciones'){
      document.getElementById('tarVals').classList.add('active');
      document.getElementById('cerrarTarRevws').classList.add('active');
      document.getElementById('valoracionesHome').classList.add('Homeactive');
      this.cerrarTodasCardCARDINFO();
      this.cerrarMenuUsuario();
    }
    if(value=='userprofile'){
      document.getElementById('tarPerf').classList.add('active');
      document.getElementById('cerrarTarViaj').classList.add('active');
      document.getElementById('perfiluserHome').classList.add('Homeactive');
      this.cerrarTodasCardCARDINFO();
      this.cerrarMenuUsuario();
    }
    if(value=='favoritos'){
      document.getElementById('tarFav').classList.add('active');
      document.getElementById('cerrarTarFavs').classList.add('active');
      document.getElementById('favoritosHome').classList.add('Homeactive');
      this.cerrarTodasCardCARDINFO();
      this.cerrarMenuUsuario();
    }
  }
  /*onClickMap(event) {

    if(this.drawer.opened){
      this.drawer.toggle();
    }
  }*/

  cerrarCardViaj(){
    document.getElementById('tarViaj').classList.remove('active');
    document.getElementById('tarPerf').classList.remove('active');
    document.getElementById('tarVals').classList.remove('active');
    document.getElementById('tarFav').classList.remove('active');
    document.getElementById('tarjLugares').classList.remove('Activo');
    document.getElementById('tarjEventos').classList.remove('Activo');
    document.getElementById('cerrarTarViaj').classList.remove('active');
    //document.getElementById('misviajesHome').classList.remove('Homeactive');
    //document.getElementById('valoracionesHome').classList.remove('Homeactive');
    //document.getElementById('perfiluserHome').classList.remove('Homeactive');
    //document.getElementById('favoritosHome').classList.remove('Homeactive');
    this.mapservice.ocultarRuta();

    this.mapservice.ready=true;

    if(document.getElementById('engine-wrapper').classList.contains('active')){
      let docClose = document.getElementById('ocultarTarLug');
      docClose.classList.add('active');
    }

  }

  cerrarCardFavs(){
    document.getElementById('tarFav').classList.remove('active');
    document.getElementById('cerrarTarFavs').classList.remove('active');
    document.getElementById('favoritosHome').classList.remove('Homeactive');
    this.mapservice.ready=true;
  }

  cerrarCardRevws(){
    document.getElementById('tarVals').classList.remove('active');
    document.getElementById('cerrarTarRevws').classList.remove('active');
    document.getElementById('valoracionesHome').classList.remove('Homeactive');
    this.mapservice.ready=true;
  }

}
