import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Place } from 'src/app/models/place.model';
import { Travel } from 'src/app/models/travel.model';
import { PlaceService } from 'src/app/services/place.service';
import { TravelService } from 'src/app/services/travel.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { TravelComponent } from '../../Admin/travel/travel.component';
import { ViajeComponent } from '../viaje/viaje.component';
import {
  Action,
  ButtonEvent,
  ButtonType,
  Image,
  ImageModalEvent,
  ModalGalleryService,
  ModalGalleryRef,
  ModalGalleryConfig,
  ModalLibConfig
} from '@ks89/angular-modal-gallery';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

import { UiComponent } from '../../../motor/ui/ui.component';
import { MapService } from 'src/app/services/map.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.component.html',
  styleUrls: ['./viajes.component.scss']
})
export class ViajesComponent implements OnInit {

  public listaRegistros: Place[] = [];
  public listaRegistrosSel: Place[] = [];
  public listaRutas: Travel[] = [];
  public listaFavoritos: Place[] = [];
  public listaFavoritosSeleccionables: Place[] = [];

  public explore= false;
  public username = this.userservice.name;
  public rol = this.userservice.rol;
  public email = this.userservice.email;
  public uidUser = this.userservice.uid;
  public dir= environment.picturesDir;
  public favourites: Place [] = [];
  public ready:boolean;
  public searchForm = this.fb.group({
    text: [''],

  });


  constructor(
    private travelservice: TravelService,
    private placeService: PlaceService,
    private userservice: UserService,
    private mapservice: MapService,
    public dialog: MatDialog,
    private uiTypescript: UiComponent,
    private domSanitizer: DomSanitizer,
    private modalGalleryService: ModalGalleryService,
    private fb: FormBuilder,){
    //private uiTypescript: UiComponent) {

   }

  ngOnInit(): void {

    this.cargarRutas();
    this.ready=true;

  }

  deleteTravel( uid: string) {
  Swal.fire({
    title: 'Borrar viaje',
    text: `Al eliminar el viaje se perderán todos los datos asociados. ¿Desea continuar?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, borrar',
   backdrop:false

  }).then((result) => {

        if (result.value) {
          this.travelservice.eliminarTravel(uid)
            .subscribe( resp => {
              this.cargarRutas();
            }
            ,(err) =>{
              Swal.fire({icon: 'error', title: 'Oops...',   backdrop:false,
              text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
            })
        }
    });
}

cargarLugares() {
  this.placeService.getAllPlaces()
    .subscribe((res:any) => {
        this.listaRegistros = res['places'];
        this.userservice.getUser(this.uidUser).subscribe((res:any) => {
          this.listaFavoritos = res['users'].favorites;

          for (var i = 0; i < this.listaRegistros.length; i++) {
            var igual=false;
            for (var j = 0; j < res['users'].favorites.length && !igual; j++) {
                if(this.listaRegistros[i]['uid'] === res['users'].favorites[j]['_id']){
                      igual=true;
                }
              }
            if(!igual)this.listaFavoritosSeleccionables.push(this.listaRegistros[i]);
        }
        }, (err)=> {
          Swal.fire({icon: 'error',backdrop:false, title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

        });

    }, (err)=> {
      Swal.fire({icon: 'error', backdrop:false,title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

    });
}
explorarOn(){
  this.explore=true;
  this.cargarRutas();
}
explorarOff(){
  this.explore=false;
  this.cargarRutas();
  }

cargarRutas( ) {
  this.listaRutas=[];
  const text = this.searchForm.get('text').value || '';

  if(text==null || text==''){

  this.travelservice.cargarAllTravels()
    .subscribe((res:any) => {

        for (let index = 0; index < res['travels'].length; index++) {
          const element = res['travels'][index];
          if(this.explore){
            if(element.user.name!=this.username){

              this.listaRutas.push(element);
            }
          }else{
            if(element.user.name==this.username){

              this.listaRutas.push(element);
            }
          }

        }




    }, (err)=> {
      Swal.fire({icon: 'error', backdrop:false,title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

    });
  }else{
    this.travelservice.cargarTravels(0,text,'')
    .subscribe((res:any) => {

        for (let index = 0; index < res['travels'].length; index++) {
          const element = res['travels'][index];
          if(this.explore){
            if(element.user.name!=this.username){

              this.listaRutas.push(element);
            }
          }else{
            if(element.user.name==this.username){

              this.listaRutas.push(element);
            }
          }


        }




    }, (err)=> {
      Swal.fire({icon: 'error', backdrop:false,title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

    });

  }
}

openDialog(id: string, images?: boolean) {
  const dialogRef = this.dialog.open(

    ViajeComponent,{
      width: '65%',
      maxWidth: '500px',
      data:{
        viaje:{
          id:id
        },
        image: {
          images: images
        }
      },

    });

  dialogRef.afterClosed().subscribe(result => {
    this.cargarRutas();

  });
}

comprobarFavoritos(uidPlace: string){

  this.userservice.getUser(this.userservice.uid).
  subscribe(res =>{
    this.favourites = res['users'].favorites;
  });


}

cerrarCardViaj(){
  document.getElementById('tarViaj').classList.remove('active');
  document.getElementById('cerrarTarViaj').classList.remove('active');
}

loadPicturesPlaces(id:string,nombre:string ){
  this.cerrarCardViaj();
}

reload(){
  this.cargarRutas();
}

mostrarRuta(id:string){
  if(this.ready){
    this.mapservice.mostrarRuta(id);
  }

}
fijarRuta(event){
  var elemento;
  for (let index = 0; index < event.path.length; index++) {
    const element = event.path[index];
    if(element.className=='card'){
      elemento=element;
    }

  }
  var cards= document.querySelectorAll('.card')

  if(this.ready){
    this.ready=false;
    elemento.setAttribute('style','border:2px solid black');
    cards.forEach(element => {
      if(element!=elemento){
        element.setAttribute('style','display: none;');
      }

    });


  }else{
    this.ready=true;
    elemento.setAttribute('style','border:0px solid black');
    cards.forEach(element => {
      if(element!=elemento){
        element.setAttribute('style','display: flex;');
      }

    });
  }
}

ocultarRuta(){
  if(this.ready){
    this.mapservice.ocultarRuta();
  }

}

borrar() {
  this.searchForm.reset();
  this.cargarRutas();
}

}


