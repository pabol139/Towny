import { Component, OnInit } from '@angular/core';
import { NOMEM } from 'dns';
import { UsericonComponent } from 'src/app/commons/usericon/usericon.component';
import { Place } from 'src/app/models/place.model';
import {EngineService} from 'src/app/services/engine.service';
import {PlaceService} from 'src/app/services/place.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

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
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-ui',
  templateUrl: './ui.component.html',
  styleUrls: ['./ui.component.scss']
})
export class UiComponent implements OnInit {

  public uid_user = this.userservice.uid;
  public esFavorito = false;
  public favouriteUsers: Place[] = [];
  public uid_place: string = '';
  public x = 0;

  constructor(private engServ: EngineService,
              private userservice: UserService,
              private plceSv: PlaceService,
              private usericonServie: UsericonComponent,
              private domSanitizer: DomSanitizer,
              private modalGalleryService: ModalGalleryService) { }

  ngOnInit(): void {
    //this.esFavorito = false;
    this.uid_place="";
  }


  addPlaceToFavourites(uid){
    if(this.uid_place!= ''){
      this.userservice.addPlaceToFavourites(this.uid_user, this.uid_place).subscribe( (res:any) => {
        document.getElementById('Favorite').style.display = 'block';
        document.getElementById('notFavorite').style.display = 'none';
        this.usericonServie.cargarLugares();
      }, (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      });
    }
  }


  removePlaceToFavourites(uid){
    if(this.uid_place!= ''){
      this.userservice.removePlaceToFavourites(this.uid_user, this.uid_place).subscribe( (res:any) => {
        document.getElementById('Favorite').style.display = 'none';
        document.getElementById('notFavorite').style.display = 'block';
        this.usericonServie.cargarLugares();
      }, (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      });
    }
  }

  comprobarFavorito(uid: string){
    this.userservice.getUser(this.uid_user)
        .subscribe( (res:any) => {
          this.favouriteUsers = [];
          if (!res['users']) {
            return;
          };
          this.favouriteUsers = res['users'].favorites;
          let bool = false;
          if(this.favouriteUsers.length > 0){
            for(let i = 0; i < this.favouriteUsers.length && !bool; i++){
              let placeJSONtext = JSON.stringify(this.favouriteUsers[i]);
              let place_to_JSON_parse = JSON.parse(placeJSONtext)._id;
              if(place_to_JSON_parse.toString() == uid.toString()){
                this.esFavorito = true;
                bool = true;
              }
            }

            if(!this.esFavorito){
              document.getElementById('Favorite').style.display = 'none';
              document.getElementById('notFavorite').style.display = 'block';
            }
            else{
              document.getElementById('Favorite').style.display = 'block';
              document.getElementById('notFavorite').style.display = 'none';
            }

          }else{
            document.getElementById('Favorite').style.display = 'none';
            document.getElementById('notFavorite').style.display = 'block';
          }

        }, (err) => {
          let error_midle = '';
          if(err.error.err){
            error_midle += '<p> Los errores son los siguientes: ';
            if(err.error.err.id){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.id.msg}`;
            }
            error_midle += '</p>';
          }
          if(error_midle === ''){
            error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
          }
          //this.router.navigateByUrl('/admin/users');
          Swal.fire({icon: 'error', title: 'Oops...', html: error_midle,});
          return;
        });

  }

  openLugarVista(uid){
    this.uid_place = uid;
    this.esFavorito = false;

      if(this.x == 0){
        if(localStorage.getItem('x-token')){
          document.getElementById("notFavorite").addEventListener('click', (uid) =>{
            this.addPlaceToFavourites(uid);
          });
          document.getElementById("Favorite").addEventListener('click', (uid) =>{
            this.removePlaceToFavourites(uid);
          });
        }
        document.getElementById("contenedorMasFotos").addEventListener('click', (uid) =>{
          this.loadPictures();
        });
        this.x++;
      } else if(this.x > 0){
        this.uid_place = uid;
      }

    this.plceSv.getPlace(uid)
          .subscribe( (resss:any) => {
            document.getElementById("tarLugarInfoType").innerText = resss['places'].type;
            document.getElementById("tarLugarInfoNom").innerText = resss['places'].name;
            document.getElementById("tarLugarInfoFotsDescrip").innerText = resss['places'].description;
            document.getElementById("tarLugarInfoImg").style.backgroundImage = "url("+environment.picturesDir+'/fotoplace/'+resss['places'].pictures[0]+")";
            document.getElementById("tarLugarInfoFotsNum").innerText = resss['places'].pictures.length+"+";
            document.getElementById("tarLugarInfoFotsValo").innerText = resss['places'].media_reviews;
            document.getElementById("tarLugarInfoFotsCalle").innerText = resss['places'].location;
            document.getElementById("tarLugarInfoFotsTelf").innerText = resss['places'].mobile_number;
            document.getElementById("tarLugarInfoFotsWeb").innerText = resss['places'].web;
            document.getElementById("tarLugarInfoFots").style.backgroundImage = "url("+environment.picturesDir+'/fotoplace/'+resss['places'].pictures[0]+")";

            if(this.uid_user != ''){
              this.comprobarFavorito(uid);
            }
          }, (err) => {
          });
    document.getElementById('tarLugarInfo').classList.add('active');
    document.getElementById('cerrarTarLugarInfo').classList.add('active');
  }

  cerrarCard(){
    let doc = document.getElementById('tarLugarInfo');
    doc.classList.remove('active');
    let docClose = document.getElementById('cerrarTarLugarInfo');
    docClose.classList.remove('active');
  }

  loadPictures(){

    this.plceSv.getPlace(this.uid_place).subscribe((res:any) =>{

      if(res.ok){
        var town = res['places'];
        var imagenesList= town['pictures'];
        var images:Image[]=[];

        for (let index = 0; index < imagenesList.length; index++) {
          const element = imagenesList[index];
          var namefilenew= this.domSanitizer.bypassSecurityTrustResourceUrl( environment.picturesDir+'/fotoplace/'+element);
        images.push(new Image(index,{img:namefilenew}));

        }

          const dialogRef: ModalGalleryRef = this.modalGalleryService.open({
            id: 22,
            images: images,
            currentImage: images[0],
            libConfig: {
              currentImageConfig: {
                downloadable: true,
                visible: true,
                size: {
                  width: '150px',
                  height: 'auto'
                }
              }


          }
          } as ModalGalleryConfig) as ModalGalleryRef;


      }
    }, (err) => {

      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      if(msgerror !== 'No hay imágenes en el array')
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });

  }

}
