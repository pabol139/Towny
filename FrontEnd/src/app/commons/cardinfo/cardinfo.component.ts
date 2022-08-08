import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser';
import { ModalGalleryConfig, ModalGalleryRef, ModalGalleryService, Image } from '@ks89/angular-modal-gallery';
import { UiComponent } from 'src/app/motor/ui/ui.component';
import { EventService } from 'src/app/services/event.service';
import { PlaceService } from 'src/app/services/place.service';
import { PuebloService } from 'src/app/services/pueblo.service';
import { environment } from 'src/environments/environment';

import { Place } from 'src/app/models/place.model';

import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { UsericonComponent } from '../usericon/usericon.component';
import { FavoritosComponent } from 'src/app/pages/User/favoritos/favoritos.component';
import { Review } from 'src/app/models/review.model';
import { FormBuilder, Validators } from '@angular/forms';
import { UploadsService } from 'src/app/services/uploads.service';
import { ReviewService } from 'src/app/services/review.service';
import { ModalService } from '../modal';
import { ValoracionComponent } from 'src/app/pages/User/valoracion/valoracion.component';
import { MatDialog } from '@angular/material/dialog';

import { FiltersbarComponent } from '../filtersbar/filtersbar.component';
import { MapComponent } from '../../motor/map/map.component';
import { ListaEventosComponent } from '../lista-eventos/lista-eventos.component';
import { ListaLugaresComponent } from '../lista-lugares/lista-lugares.component';
import { EngineService } from 'src/app/services/engine.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-cardinfo',
  templateUrl: './cardinfo.component.html',
  styleUrls: ['./cardinfo.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardinfoComponent implements OnInit {

  public htmlActual = '';
  public htmlAnterior = '';
  public idActualPueblo = "";
  public idActualLugar = "";
  public prevision="Despejado";
  public puebloinfo:any;
  public entrando:boolean=false;


  public uid_user = this.userservice.uid;
  public esFavorito = false;
  public favouriteUsers: Place[] = [];
  public uid_place: string = '';
  public x = 0;

  public dentroPueblo = false;
  public dir= environment.picturesDir;

  public coordsPueblo;
  public surfacePueblo;

  /* Crear review */

  public createReview = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    comment: ['', Validators.required ],
    //review: ['',Validators.required],
    //place: ['', Validators.required]
  });

  public imagenUrl = [];
  public waiting: boolean = false;
  public submited = false;
  public valueReview = 1;
  public file: File [] = [];
  public waiting_pictures = false;

  public cerdaId = document.getElementById("accionadorEnviarReview");
  public observer;
  public cerdaId2 = document.getElementById("accionadorPuebloMotor");
  public observer2;

  constructor(private puebloservice:PuebloService,
              private modalGalleryService: ModalGalleryService,
              private eventService:EventService,
              private domSanitizer: DomSanitizer,
              private placeService: PlaceService,
              private fb: FormBuilder,

             // private engcomp:EngineComponent,
              private userservice:UserService,
              public dialog: MatDialog,
              private usericonServie: UsericonComponent,
              private valoracionService: ValoracionComponent,
              private reviewService: ReviewService,
              private uploadService: UploadsService,
              private modalService :ModalService,
              private plceSv: PlaceService,
              private filtersbar:FiltersbarComponent,
              private mapComponent: MapComponent,
              private listaEventos: ListaEventosComponent,
              private listaLugares: ListaLugaresComponent,
              private engine:EngineService,
              private apiservice:ApiService


             ) {




             }

  ngOnInit(): void {
    this.htmlActual = `

eventos

lugares
`;

  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(mutations => {
      this.mostrarLugarCard(document.getElementById("accionadorEnviarReview").getAttribute('value'));
    });
    var config = { attributes: true, childList: true, characterData: true };
    this.cerdaId = document.getElementById("accionadorEnviarReview");
    this.observer.observe(this.cerdaId, config);

    this.observer2 = new MutationObserver(mutations => {
      this.dentroPueblo = true;
      this.mostrarLugarCard(document.getElementById("accionadorPuebloMotor").getAttribute('value'));
    });
    var config2 = { attributes: true, childList: true, characterData: true };
    this.cerdaId2 = document.getElementById("accionadorPuebloMotor");
    this.observer2.observe(this.cerdaId2, config2);
  }

  closeModal(id: string) {
    this.createReview.get('comment').setValue('');
    this.file = [];
    this.modalService.close(id);
  }

  cancelar(){
    this.createReview.get('comment').setValue('');
    this.file = [];
    this.updateStars(1);
  }

  deleteFileUpload(event: number){

    var x = -1;
    var arr = [];

    for(let i = 0; i< this.file.length; i++){
      if(i != event) {
        arr.push(this.file[i]);
      }
      else if( i == event){
        x = i;
      }
    }

    if(x !== -1){
      this.imagenUrl.splice(x, 1);
      this.file = arr;
    }

  }

  campoNoValidoNew( campo: string) {
    return this.createReview.get(campo)?.invalid && this.submited;
  }

  ZoomPlace(uid:any){
    this.engine.zoomObject=uid;

  }

  fileChange(element: any) {

    var arr = element.target.files;

    //this.file = element.target.files;
    if (arr.length > 0) {
      const extensiones = ['jpeg','jpg','png'];
      let names = [];
      let nombrecortado = [];
      let extension = [];
      for(let i = 0; i < arr.length; i++){
        names.push(arr[i].name);
        nombrecortado.push(names[i].split('.'));
        extension.push(nombrecortado[i][nombrecortado[i].length - 1]);
      }

      for(let i = 0; i < extension.length; i++){
        if(!extensiones.includes(extension[i])){
          this.file = [];
          return;
        }
      }

      for(let i = 0; i < arr.length; i++){
        this.file.push(arr[i]);
      }

      this.imagenUrl = [];

      for(let i = 0; i < this.file.length; i++){
        this.waiting_pictures = true
        let reader = new FileReader();
        reader.readAsDataURL(this.file[i]);
        reader.onload = (event) => {
          this.imagenUrl[i] = event.target.result.toString();
          this.waiting_pictures = false;
        };
        //this.file.push(arr[i]);
      }
      this.waiting_pictures = false;
    }
  }

  updateStars(val: number) {
    this.valueReview = val;
    //var filterBar = document.getElementById("myImg").style.filter = "grayscale(100%)";
    for(var ii=1;ii<=5;ii++){
      var second = document.querySelector(".starsReview .starss_update:nth-child("+ii+")")
      second.classList.remove('active');
    }
    for(var i=val;i>0;i--){
      var second = document.querySelector(".starsReview .starss_update:nth-child("+i+")")
      /*second.classList.toggle('active');*/
      second.classList.add('active');
    }
  }

  newReview(){
    this.submited = true;

    if (this.createReview.invalid) { return; }

      if(this.uid_place == null){
        return;
      }

      this.waiting = true;

      this.createReview.value.place = this.uid_place;

      var createData: any = {
        uid: 'nuevo',
        comment: this.createReview.value.comment,
        review: this.valueReview,
        place: this.uid_place
      }

      //this.wait_form = true;

      this.reviewService.crearReview( createData )
        .subscribe( (res:any) => {
            if(this.file && this.file.length > 0){
              let formData = new FormData();
              for(let i = 0; i < this.file.length;i++)
                formData.append("file", this.file[i]);

              this.uploadService.uploadPhotos(formData, 'fotoreview', res['revw'].uid).subscribe( res => {
                //this.wait_form = false;
                this.file = []; this.imagenUrl = [];
              }, (err) => {
                this.reviewService.eliminarReview(res['revw'].uid).subscribe();
                const errtext = err.error.msg || 'No se pudo cargar la imagen';
                Swal.fire({icon: 'error', title: 'Oops...', text: errtext});
                return;
              });
            }
            this.submited = false;
            this.updateStars(0);
            //this.cargarValoraciones();
            this.createReview.reset();
            this.createReview.markAsPristine();
            this.waiting = false;
          }, (err) => {
          this.waiting = false;
          //this.wait_form = false;
          let error_midle = '';
          if(err.error.err){
            error_midle += '<p> Los errores son los siguientes: ';
            if(err.error.err.review){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.review.msg}`;
            }
            error_midle += '</p>';
          }
          if(error_midle === ''){
            error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
          }
          const msgerror = err.error.msg || error_midle;
          Swal.fire({icon: 'error', title: 'Oops...', html: msgerror,});
        });
    }

  setDentroPueblo(uwu){
    this.dentroPueblo = uwu;
  }

  cerrarCard(){
    this.x = 0;


    if(document.getElementById('tarjLugarReviews').classList.contains('Activo')){

      this.cerrarLugarreviews();

    }else if(document.getElementById('tarjEventos').classList.contains('Activo')){

      document.getElementById('tarjEventos').classList.remove('Activo');
      document.getElementById('tarjPueblo').classList.add('Activo');

      if(!this.dentroPueblo){
        document.getElementById('cerrarTarLug').classList.add('active');
      }

      document.getElementById('tarLug').classList.remove('ocultarbarraFiltros');

    }else if(document.getElementById('tarjLugares').classList.contains('Activo')){

      document.getElementById('tarjLugares').classList.remove('Activo');
      document.getElementById('tarjPueblo').classList.add('Activo');

      if(!this.dentroPueblo){
        document.getElementById('cerrarTarLug').classList.add('active');
      }

      document.getElementById('tarLug').classList.remove('ocultarbarraFiltros');

    }else if(document.getElementById('tarjLugar').classList.contains('Activo')){

      document.getElementById('tarjLugar').classList.remove('Activo');
      if(document.getElementById('tarjPueblo').innerHTML==""){
        //ARREGLAR BUG CUANDO VES LUGAR DESDE MIS VALROACIONES Y HAY UN PUEBLO BAJO

        let doc = document.getElementById('tarLug');
        doc.classList.remove('active');
        let docClose = document.getElementById('cerrarTarLug');
        docClose.classList.remove('active');
      }else{
        document.getElementById('tarjPueblo').classList.add('Activo');
      }
    }
    else if(document.getElementById('tarjEvento').classList.contains('Activo')){

      document.getElementById('tarjEvento').classList.remove('Activo');
      document.getElementById('tarjPueblo').classList.add('Activo');
    }
    else{

      let doc = document.getElementById('tarLug');
      doc.classList.remove('active');
      let docClose = document.getElementById('cerrarTarLug');
      docClose.classList.remove('active');
    }

  }

  cerrarTodasCard(){
    document.getElementById('tarjEvento').classList.remove('Activo');
    document.getElementById('tarjLugar').classList.remove('Activo');
    document.getElementById('tarjLugarReviews').classList.remove('Activo');
    document.getElementById('tarjPueblo').classList.add('Activo');
  }

  ocultarCard(){
    this.x = 0;
    let doc = document.getElementById('tarLug');
    document.getElementById('ocultarTarLug').classList.toggle('noDesplegada');

    if(document.getElementById('ocultarTarLug').classList.contains('noDesplegada')){
      document.getElementById('ocultarTarLug').innerHTML = `<i class="fa fa-arrow-right" aria-hidden="true"></i>`;
      doc.classList.remove('active');
    }else{
      document.getElementById('ocultarTarLug').innerHTML = `<i class="fa fa-arrow-left" aria-hidden="true"></i>`;
      doc.classList.add('active');
    }

  }

  addPlaceToFavourites(uid){
    if(this.uid_place!= ''){

      this.userservice.addPlaceToFavourites(this.uid_user, this.uid_place).subscribe( (res:any) => {

        this.comprobarFavorito(this.uid_place);
        document.getElementById('cosasmalasjijiji').setAttribute('value',this.uid_place + '2');

        //this.FavoriteService.cargarFavoritosDesdeFuera();
      }, (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      });
    }
  }


  removePlaceToFavourites(uid){
    if(this.uid_place!= ''){

      this.userservice.removePlaceToFavourites(this.uid_user, this.uid_place).subscribe( (res:any) => {

        this.comprobarFavorito(this.uid_place);
        document.getElementById('cosasmalasjijiji').setAttribute('value',this.uid_place + '1' );

        //this.FavoriteService.cargarFavoritosDesdeFuera();
      }, (err) => {
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      });
    }
  }

  comprobarFavorito(uid: string){
    this.esFavorito = false;
    this.userservice.getUser(this.uid_user)
        .subscribe( (res:any) => {

          this.favouriteUsers = [];
          if (!res['users']) {
            //this.router.navigateByUrl('/admin/users');
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

          //this.cargaDatosForm(res);
          //this.wait_form = false;
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

  openDialogNewReview() {
    const dialogRef = this.dialog.open(

      ValoracionComponent,{
      });


    dialogRef.afterClosed().subscribe(result => {
      //this.titleService.setTitle("Towny");

    });
  }

  loadPicturesEvento(uid){

    this.eventService.getEvent(uid).subscribe((res:any) =>{

      if(res.ok){
        var town = res['events'];
        var imagenesList= town['pictures'];
        var images:Image[]=[];

        for (let index = 0; index < imagenesList.length; index++) {
          const element = imagenesList[index];
          var namefilenew= this.domSanitizer.bypassSecurityTrustResourceUrl( environment.picturesDir+'/fotoevento/'+element);
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

  loadPicturesLugar(uid){

    this.plceSv.getPlace(uid).subscribe((res:any) =>{

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

  cargarType(str1: string): string{
    let str = '';
    if(str1 == 'RESTAURANT') str = 'Restauración';
    else if(str1 == 'CHURCH_PLACES') str = 'Lugar de culto';
    else if(str1 == 'MONUMENTS') str = 'Monumento';
    else if(str1 == 'GREEN_ZONE') str = 'Zona verde';
    else if(str1 == 'ENTERTAINMENT') str = 'Entretenimiento';
    else if(str1 == 'COMMERCES') str = 'Comercio';
    else if(str1 == 'ART_AND_CULTURE') str = 'Arte y cultura';

    return str;
  }

  mostrarEventosLista(uid){
    this.listaEventos.abrirTarjeta(uid);
  }

  /*mostrarLugaresLista(uid){
    this.listaLugares.abrirTarjeta(uid);
  }*/

  mostrarEventoCard(uid: string){

    //this.x = 0;

    let htmlFinall = ""

    this.eventService.getEvent(uid)
          .subscribe( (resss:any) => {
            //this.uid_place = resss['places'].uid;

            //addFavouritePlaceToUser(this.uid_place);

            /*var checkExist = setInterval(() => {
              if (document.querySelector("#tarLugarInfoType")) {

                 clearInterval(checkExist);
              }
            }, 100);*/

            var splitted = resss['events'].date.split("T", 1);
            var splitted2 = splitted[0].split("-", 3);

            htmlFinall = `<div class="tarLug" id="tarEventoInfo">
            <div class="degradao">
                <div id="tarEventoInfoImg" class="tarLugImg"></div>
            </div>
            <div class="containerInfoFoto">
                <h3 id="tarLugarInfoType">`+splitted2[2]+'-'+splitted2[1]+'-'+splitted2[0]+`</h3>
                <h1 id="tarLugarInfoNom">`+resss['events'].name+`</h1>
            </div>`

            if(this.dentroPueblo){
              htmlFinall += `<div class="cardReviewHeader topHeader">
              <i id="tancarEvento" class="fa-solid fa-arrow-left circle-icon circleHeader"></i>
              </div>`;
            }

            htmlFinall+= `<div class="containerMasFotosFoto" id="contenedorMasFotosEvento">
                <div id="tarEventoInfoFots"></div>
                <p id="tarLugarInfoFotsNum">`+resss['events'].pictures.length+"+"+`</p>
            </div>`


            htmlFinall+=`<div class="containerdescrip">
                <h2>Descripcion:</h2>
                <p id="tarLugarInfoFotsDescrip">`+resss['events'].description+`</p>
            </div> </div>`

            /*if(this.uid_user != ''){
              htmlFinall+= `<div class="botonFlotante masLargo">
              <h4 id="writeReview">Escribir una reseña</h4>
            </div>`
            }*/

            document.getElementById("tarjEvento").innerHTML = htmlFinall;
            document.getElementById("tarEventoInfoImg").style.backgroundImage = "url("+environment.picturesDir+'/fotoevento/'+resss['events'].pictures[0]+")";
            document.getElementById("tarEventoInfoFots").style.backgroundImage = "url("+environment.picturesDir+'/fotoevento/'+resss['events'].pictures[0]+")";

            if(this.dentroPueblo){
              document.getElementById('tancarEvento').addEventListener('click', (uid) =>{
                this.cerrarCard();
              });
            }

            document.getElementById("contenedorMasFotosEvento").addEventListener('click', (uid) =>{
              this.loadPicturesEvento(uid);
            });


          document.getElementById('tarEventoInfo').classList.add('active');
          //document.getElementById('cerrarTarLugarInfo').classList.add('active');
          document.getElementById('cerrarTarLug').classList.add('active');
          document.getElementById('tarLug').classList.add('active');

          document.getElementById('tarjEvento').classList.add('Activo');
          document.getElementById('tarjPueblo').classList.remove('Activo');

          }, (err) => {

          });

    /*this.htmlActual = htmlFinall;

    htmlFinall = htmlFinall;
    //document.getElementById("tarLug").innerHTML = htmlFinall;
    document.getElementById("tarjLugar").innerHTML = htmlFinall;*/

  }


  mostrarLugarCard(uid: string){

    this.uid_place = uid;

    this.x = 0;
    this.htmlAnterior = this.htmlActual;

    let htmlFinall = ""


    this.plceSv.getPlace(uid)
          .subscribe( (resss:any) => {
            //this.uid_place = resss['places'].uid;

            //addFavouritePlaceToUser(this.uid_place);

            /*var checkExist = setInterval(() => {
              if (document.querySelector("#tarLugarInfoType")) {
                 clearInterval(checkExist);
              }
            }, 100);*/

            htmlFinall = `<div class="tarLug" id="tarLugarInfo">
            <div class="degradao">
                <div id="tarLugarInfoImg" class="tarLugImg"></div>
            </div>
            <div class="containerInfoFoto">
                <h3 id="tarLugarInfoType">`+this.cargarType(resss['places'].type)+`</h3>
                <h1 id="tarLugarInfoNom">`+resss['places'].name+`</h1>
            </div>`

            if(this.uid_user != ''){
                htmlFinall += `<div id="corasonsitos" class="favorito">
                  <span *ngIf="!this.esFavorito" title="Añadir lugar a tus favoritos" id="notFavorite" ><i class="fa-regular fa-heart"></i></span>
                  <span *ngIf="this.esFavorito" title="Eliminar lugar a tus favoritos" id="Favorite"><i class="fa-solid fa-heart"></i></span>
                </div>`
            }

            if(this.dentroPueblo){
              htmlFinall += `<div class="cardReviewHeader topHeader">
              <i id="tancarLugar" class="fa-solid fa-arrow-left circle-icon circleHeader"></i>
              </div>`;
            }

            htmlFinall+= `<div class="containerMasFotosFoto" id="contenedorMasFotosLugar">
                <div id="tarLugarInfoFots">
                </div>
                <p id="tarLugarInfoFotsNum">`+resss['places'].pictures.length+"+"+`</p>
            </div>`;

            if(!this.dentroPueblo){
              htmlFinall+= `<div class="botonFlotante">
              <h4 id="seePlacee">Ver lugar</h4>
            </div>`
            }

             if(this.uid_user != '' && this.userservice.rol == 'ROL_USER'){
              htmlFinall+= `<div class="botonFlotante">
                            <h4 id="writeReview">Escribir una reseña</h4>
                            </div>`
              /*`<button id="writeReview" style="display: block; margin: auto; margin-top: 15px; margin-bottom: 15px;" type="button" name="submit" class="btn btn-info">
                Escribe una reseña
              </button>`*/
            }

            htmlFinall+=`<div class="containertarjetasLugares containertarjetas">
                <div class="tarjetaLugar tarjeta">
                    <div class="iconn"><i class="fa fa-star" aria-hidden="true"></i></div>
                    <div class="reviewsDosJuntos">
                        <h2 id="tarLugarInfoFotsValo">`+resss['places'].media_reviews+`</h2>
                        <div id="starsRevieww" class="starsReview"><span><i class="fas fa-star"></i></span><span><i class="fas fa-star"></i></span><span><i class="fas fa-star"></i></span><span><i class="fas fa-star"></i></span><span><i class="fas fa-star"></i></span></div>
                        <h2 id="tarLugarInfoFotsMasvalo">`+resss['places'].reviews.length + " reseñas"+`</h2>
                    </div>
                </div>`
                if(resss['places'].mobile_number != ""){
                  htmlFinall+=`<div class="tarjetaLugar tarjeta">
                      <div class="iconn"><i class="fa fa-phone" aria-hidden="true"></i></div>
                      <div>
                          <h2 id="tarLugarInfoFotsTelf">`+resss['places'].mobile_number+`</h2>
                      </div>
                  </div>`
                }
                if(resss['places'].location != ""){
                  htmlFinall+=`<div class="tarjetaLugar tarjeta">
                      <div class="iconn"><i class="fa fa-map-pin" aria-hidden="true"></i></div>
                      <div>
                          <h2 id="tarLugarInfoFotsCalle">`+resss['places'].location+`</h2>
                      </div>
                  </div>`
                }
                if(resss['places'].web != ""){
                  htmlFinall+=`<div class="tarjetaLugar tarjeta">
                      <div class="iconn"><i class="fa fa-window-maximize" aria-hidden="true"></i></div>
                      <div>
                          <h2 id="tarLugarInfoFotsWeb">`+resss['places'].web+`</h2>
                      </div>
                  </div>`
                }
                if(resss['places'].schedule != ""){
                  htmlFinall+=`<div class="tarjetaLugar tarjeta">
                      <div class="iconn"><i class="fa fa-clock" aria-hidden="true"></i></div>
                      <div>
                          <h2 id="tarLugarInfoFotsHorario">`+resss['places'].schedule+`</h2>
                      </div>
                  </div>`
                }
                htmlFinall+=`</div>

            <div class="containerdescrip">
                <h2>Descripcion:</h2>
                <p id="tarLugarInfoFotsDescrip">`+resss['places'].description+`</p>
            </div>
       `;


           this.reviewService.cargarReviewsPlace(0, resss['places'].uid)
           .subscribe( (re:any) => {

              let contadorMax3=3;

              for(var owo=re['revwsPlace'].length-1;owo>=0;owo--){

                if(owo==re['revwsPlace'].length-1){
                  htmlFinall+=`<div class="comentariosResumen">
                  <h2>Resumen Valoraciones:</h2>`;
                }



                if(contadorMax3>=0){
                  htmlFinall+=`<div class="comentariRes"><img src="`+this.dir+`/fotoperfil/`+re['revwsPlace'][owo].user.picture+`">
                <p>`+re['revwsPlace'][owo].comment+`</p></div>`;
                }

                contadorMax3--;

                if(owo==0 || contadorMax3==0){
                  htmlFinall+=`
                  <div id="vermasrev" class="botonFlotante vermasrev">
                <h4 id="writeReview">Ver más reseñas</h4>
              </div></div>`;

                  document.getElementById("tarjLugar").innerHTML = htmlFinall;



            document.getElementById("tarLugarInfoImg").style.backgroundImage = "url("+environment.picturesDir+'/fotoplace/'+resss['places'].pictures[0]+")";
            document.getElementById("tarLugarInfoFots").style.backgroundImage = "url("+environment.picturesDir+'/fotoplace/'+resss['places'].pictures[0]+")";

            document.getElementById('tarLugarInfoFotsMasvalo').addEventListener('click', (uid) =>{
              this.abrirLugarreviews(resss['places'].uid);
            });

            document.getElementById('vermasrev').addEventListener('click', (uid) =>{
              this.abrirLugarreviews(resss['places'].uid);
            });

            if(this.uid_user != ''){
              document.getElementById('writeReview').addEventListener('click', (uid) =>{
                this.openDialogNewReview();

                this.valoracionService.setUID_PLACE(this.uid_place);
              });
            }

            if(!this.dentroPueblo){
              document.getElementById('seePlacee').addEventListener('click', (uid) =>{


                this.playPueblo(this.coordsPueblo, this.surfacePueblo);
                this.mostrarLugarCard(resss['places'].uid);
                this.ZoomPlace(resss['places'].uid);
                document.getElementById("accionadorZoomLugar").setAttribute('value', resss['places'].uid);
              });

            }

            if(this.dentroPueblo){
              document.getElementById('tancarLugar').addEventListener('click', (uid) =>{
                this.cerrarCard();
              });
            }

            for(var it=1;it<=5;it++){
              if(it<=resss['places'].media_reviews){
                var second = document.querySelector("#starsRevieww span:nth-child("+it+")")
                second.classList.add('estrellaActiva');
              }
            }

            if(this.uid_user != ''){
              this.comprobarFavorito(uid);
            }

            this.esFavorito = false;
            if(this.x == 0){

              if(localStorage.getItem('x-token') || sessionStorage.getItem('x-token')){

                document.getElementById("notFavorite").addEventListener('click', (uid) =>{
                  this.addPlaceToFavourites(uid);
                });
                document.getElementById("Favorite").addEventListener('click', (uid) =>{
                  this.removePlaceToFavourites(uid);
                });
              }
              this.x++;
            } else if(this.x > 0){
              this.uid_place = uid;

            }
            document.getElementById("contenedorMasFotosLugar").addEventListener('click', (uid) =>{
              this.loadPicturesLugar(this.uid_place);
            });


          document.getElementById('tarLugarInfo').classList.add('active');
          //document.getElementById('cerrarTarLugarInfo').classList.add('active');
          document.getElementById('cerrarTarLug').classList.add('active');
          document.getElementById('tarLug').classList.add('active');

          document.getElementById('tarjLugar').classList.add('Activo');
          document.getElementById('tarjPueblo').classList.remove('Activo');

                  break;
                }


              }

              if(re['revwsPlace'].length==0){
                document.getElementById("tarjLugar").innerHTML = htmlFinall;



            document.getElementById("tarLugarInfoImg").style.backgroundImage = "url("+environment.picturesDir+'/fotoplace/'+resss['places'].pictures[0]+")";
            document.getElementById("tarLugarInfoFots").style.backgroundImage = "url("+environment.picturesDir+'/fotoplace/'+resss['places'].pictures[0]+")";

            /*document.getElementById('tarLugarInfoFotsMasvalo').addEventListener('click', (uid) =>{
              this.abrirLugarreviews(resss['places'].uid);
            });

            document.getElementById('vermasrev').addEventListener('click', (uid) =>{
              this.abrirLugarreviews(resss['places'].uid);
            });*/

            if(this.uid_user != ''){
              document.getElementById('writeReview').addEventListener('click', (uid) =>{
                this.openDialogNewReview();

                this.valoracionService.setUID_PLACE(this.uid_place);
              });
            }

            if(!this.dentroPueblo){


              document.getElementById('seePlacee').addEventListener('click', (uid) =>{

                this.playPueblo(this.coordsPueblo, this.surfacePueblo);
                this.mostrarLugarCard(resss['places'].uid);
                this.ZoomPlace(resss['places'].uid);
                document.getElementById("accionadorZoomLugar").setAttribute('value', resss['places'].uid);
              });

            }

            if(this.dentroPueblo){
              document.getElementById('tancarLugar').addEventListener('click', (uid) =>{
                this.cerrarCard();
              });
            }

            for(var it=1;it<=5;it++){
              if(it<=resss['places'].media_reviews){
                var second = document.querySelector("#starsRevieww span:nth-child("+it+")")
                second.classList.add('estrellaActiva');
              }
            }

            if(this.uid_user != ''){
              this.comprobarFavorito(uid);
            }

            this.esFavorito = false;
            if(this.x == 0){

              if(localStorage.getItem('x-token') || sessionStorage.getItem('x-token')){

                document.getElementById("notFavorite").addEventListener('click', (uid) =>{
                  this.addPlaceToFavourites(uid);
                });
                document.getElementById("Favorite").addEventListener('click', (uid) =>{
                  this.removePlaceToFavourites(uid);
                });
              }
              this.x++;
            } else if(this.x > 0){
              this.uid_place = uid;

            }
            document.getElementById("contenedorMasFotosLugar").addEventListener('click', (uid) =>{
              this.loadPicturesLugar(this.uid_place);
            });


          document.getElementById('tarLugarInfo').classList.add('active');
          //document.getElementById('cerrarTarLugarInfo').classList.add('active');
          document.getElementById('cerrarTarLug').classList.add('active');
          document.getElementById('tarLug').classList.add('active');

          document.getElementById('tarjLugar').classList.add('Activo');
          document.getElementById('tarjPueblo').classList.remove('Activo');
              }

            }, (err) => {

            });



          }, (err) => {

          });

    /*this.htmlActual = htmlFinall;

    htmlFinall = htmlFinall;
    //document.getElementById("tarLug").innerHTML = htmlFinall;
    document.getElementById("tarjLugar").innerHTML = htmlFinall;*/

  }

  mostrarPuebloCard(uid){

    document.getElementById("tarjPueblo").innerHTML = "";


    this.idActualPueblo = uid;

    let doc = document.getElementById('tarLug');
    let docClose = document.getElementById('cerrarTarLug');
    doc.classList.remove('active');
    docClose.classList.remove('active');

    let fotos = [];
    let htmlFinal = "";
    this.prevision = "";

    this.puebloservice.cargarPueblo(uid).subscribe((res:any) => {



      let longFotos=0;

      var codsplit=res['towns'].surface.split(' ');
      this.puebloinfo=res['towns'];


      /*this.apiservice.getTiempo(codsplit[1]).subscribe( (res:any) => {

        this.apiservice.getDataTiempo(res['datos']).subscribe((res:any)=>{

          this.prevision=res[0].prediccion.dia[0].estadoCielo[0].descripcion;

          if(this.prevision==''){
            this.prevision='Despejado';
          }*/
          this.prevision = 'Despejado';

      if(this.puebloinfo.pictures.length!=0){
        longFotos = (this.puebloinfo.pictures.length-1);
      }

      htmlFinal += `<div class="degradao">
      <div id="tarLugImg"></div>
  </div>
  <div class="containerInfoFoto">
      <h1 id="tarLugNom">`+this.puebloinfo.name+`</h1>
  </div>
  <div class="containerMasFotosFoto" id="contenedorMasFotos">
      <div id="tarLugFots">
      </div>
      <p id="tarLugFotsNum">`+longFotos+`+</p>
  </div>
  <div class="containertarjetas">
      <div class="tarjeta">
          <div class="iconn"><i class="fa fa-users" aria-hidden="true"></i></div>
          <div>
              <h2 id="tarLugFotsPob">`+this.puebloinfo.population+`</h2>
              <p>Poblacion</p>
          </div>
      </div>
      <div class="tarjeta">
          <div class="iconn"><i class="fa fa-map" aria-hidden="true"></i></div>
          <div>
              <h2 id="tarLugFotsVisit">`+this.puebloinfo.province.name+`</h2>
              <p>Provincia</p>
          </div>
      </div>
  </div>

  <div class="botonFlotante">
    <h4 id="playPueblo">Visitar Pueblo</h4>
  </div>

  <div class="containerdescrip">

      <h2>Descripcion:</h2>
      <p id="tarLugFotsDescrip">`+this.puebloinfo.description+`</p>
      <h2>Tiempo:</h2>
      <p id="tarLugFotsDescrip">`+this.prevision+`</p>


  </div>`;


      for(let i=0;i<this.puebloinfo.pictures.length-1;i++){
        fotos.push(environment.picturesDir+'/fototown/'+this.puebloinfo.pictures[i+1]);
      }

      let html = "";
      let uids_eventos = [];
      let contadorgeneralEventos = 0;

      this.coordsPueblo = this.puebloinfo.location;
      this.surfacePueblo = this.puebloinfo.surface;

      if(this.puebloinfo.events.length > 0){

        let verMas = "";
        let flechaMas = "";

        if(this.puebloinfo.events.length>2){
          verMas = "Ver todos";
          flechaMas = `<i id="masEventos" class="fa-solid fa-plus circle-iconn"></i>`;
        }

        html += `<div class="containereventosylugares" id="containereventos">
        <div class="info">
            <h4 id="eventosNum"><strong>Eventos:</strong> `+this.puebloinfo.events.length+`</h4>
            <p id="eventosMas">`+verMas+`</p>
        </div>
        <div class="lista" id="listaEventos">`;

        for(let ii=0;ii<this.puebloinfo.events.length;ii++){
          if(ii<2){
            this.eventService.getEvent(this.puebloinfo.events[ii])
            .subscribe( (ress:any) => {

              contadorgeneralEventos++;
              uids_eventos.push(ress['events'].uid);


              var splitted = ress['events'].date.split("T", 1);
              var splitted2 = splitted[0].split("-", 3);

              html += `<div class="itemLista" id="itemListaEventos">
              <img src="`+environment.picturesDir+'/fotoevento/'+ress['events'].pictures[0]+`">
              <p>`+ress['events'].name+`</p>
              <p>`+splitted2[2]+'-'+splitted2[1]+'-'+splitted2[0]+`</p>
          </div>`;

            /*if(ii <= 2){
              document.getElementById('listaEventos').innerHTML = html;
            }*/



            //if(ii+2 == this.puebloinfo.events.length){
            if(contadorgeneralEventos == this.puebloinfo.events.length || contadorgeneralEventos==2){
              html += flechaMas+`</div>
              </div>`;

              htmlFinal += html;

                this.htmlActual = htmlFinal;
                //document.getElementById("tarLug").innerHTML = htmlFinal;
                document.getElementById("tarjPueblo").innerHTML = htmlFinal;
                document.getElementById("tarLugImg").style.backgroundImage = "url("+environment.picturesDir+'/fototown/'+this.puebloinfo.pictures[1]+")";
                document.getElementById("tarLugFots").style.backgroundImage = "url("+environment.picturesDir+'/fototown/'+this.puebloinfo.pictures[1]+")";
                document.getElementById('contenedorMasFotos').addEventListener("click", (event) => {this.loadPictures(); });
                document.getElementById('playPueblo').addEventListener("click", (event) => {this.playPueblo(this.puebloinfo.location,this.puebloinfo.surface); });

                this.htmlActual = htmlFinal;

                for(let g=0;g<contadorgeneralEventos;g++){

                  document.querySelectorAll('#itemListaEventos')[g].addEventListener("click", (event) => {this.abrirEventos(this.idActualPueblo, uids_eventos[g]);});
                }

                if(flechaMas!=""){
                  document.getElementById('eventosMas').addEventListener('click', (uid) =>{

                    this.abrirEventos(this.idActualPueblo, "");
                  });
                  document.getElementById('masEventos').addEventListener('click', (uid) =>{

                    this.abrirEventos(this.idActualPueblo, "");
                  });
                }

            }

            }, (err) => {

            });
          }
        }

      }

      let html2 = "";
      let html3 = "";
      //Solo lugares activos
      let contador = 0;
      let contadorgeneral = 0;

      let uids_lugares = [];

      if(this.puebloinfo.places.length > 0){

        for(let iii=0;iii<this.puebloinfo.places.length;iii++){
          //if(contador<=3){
            this.placeService.getPlace(this.puebloinfo.places[iii])
            .subscribe( (resss:any) => {
              contadorgeneral++;
              if(resss.ok && resss['places'].status == "Activo"){
                //document.getElementById("containerlugares").style.display = 'block';
                contador++;
                uids_lugares.push(resss['places'].uid);


                if(contador<3){
                  html2 += `<div class="itemLista" id="itemListaLugares" (click)="openLugarCard(uidd);">
                  <img src="`+environment.picturesDir+'/fotoplace/'+resss['places'].pictures[0]+`">
                  <p>`+resss['places'].name+`</p>
                  <p id="listaValoracionLugar">`+resss['places'].media_reviews+`<i class="fa fa-star"></i></p>
                  </div>`;
                }
              }


              /*if(contador <= 3){
                document.getElementById('listaLugares').innerHTML = html2;
                let gg = document.querySelectorAll('#itemListaLugares');
                for(let iiii=0;iiii<gg.length;iiii++){
                  gg[iiii].addEventListener('click', (event) =>{
                    let uidd = "";
                    if((<MouseEvent>event).clientX>10 && (<MouseEvent>event).clientX<125){
                      uidd = this.lugares[0];
                    }else if((<MouseEvent>event).clientX>125 && (<MouseEvent>event).clientX<235){
                      uidd = this.lugares[1];
                    }else if((<MouseEvent>event).clientX>235 && (<MouseEvent>event).clientX<345){
                      uidd = this.lugares[2];
                    }
                    this.openLugarCard(uidd);
                  });
                }
              }else if(contador>3){
                document.getElementById("lugaresMas").innerText = 'Ver más';
              }

              document.getElementById("lugaresNum").innerText = 'Lugares: '+contador;*/

              let verMas2 = "";
              let flechitaMas = "";

              if(contador>2){
                verMas2 = "Ver todos";
                flechitaMas = `<i id="masLugares" class="fa-solid fa-plus circle-iconn"></i>`;
              }

              if(contador>0){
                html3 = `<div class="containereventosylugares" id="containerlugares">
                <div class="info">
                    <h4 id="lugaresNum"><strong>Lugares:</strong> `+contador+`</h4>
                    <p id="lugaresMas" style="cursor:pointer;">`+verMas2+`</p>
                </div>
                <div class="lista" id="listaLugares">`+html2+flechitaMas+`</div>
                </div>`;
              }
              if(contador>0 && contadorgeneral == this.puebloinfo.places.length){/*iii+1 == this.puebloinfo.places.length){*/
                htmlFinal += html3;
                this.htmlActual = htmlFinal;
                //document.getElementById("tarLug").innerHTML = htmlFinal;
                document.getElementById("tarjPueblo").innerHTML = htmlFinal;
                document.getElementById("tarLugImg").style.backgroundImage = "url("+environment.picturesDir+'/fototown/'+this.puebloinfo.pictures[1]+")";
                document.getElementById("tarLugFots").style.backgroundImage = "url("+environment.picturesDir+'/fototown/'+this.puebloinfo.pictures[1]+")";
                document.getElementById('contenedorMasFotos').addEventListener("click", (event) => {this.loadPictures(); });
                document.getElementById('playPueblo').addEventListener("click", (event) => {this.playPueblo(this.puebloinfo.location,this.puebloinfo.surface);});
                if(contador>=3){
                  for(let g=0;g<2;g++){

                    document.querySelectorAll('#itemListaLugares')[g].addEventListener("click", (event) => {this.mostrarLugarCard(uids_lugares[g]);if(this.dentroPueblo){document.getElementById("accionadorZoomLugar").setAttribute('value', uids_lugares[g]);this.ZoomPlace(uids_lugares[g]);}});
                  }
                }else{
                  for(let g=0;g<contador;g++){
                    document.querySelectorAll('#itemListaLugares')[g].addEventListener("click", (event) => {this.mostrarLugarCard(uids_lugares[g]);if(this.dentroPueblo){document.getElementById("accionadorZoomLugar").setAttribute('value',uids_lugares[g]);this.ZoomPlace(uids_lugares[g]);}});
                  }
                }

                for(let g=0;g<contadorgeneralEventos;g++){
                  document.querySelectorAll('#itemListaEventos')[g].addEventListener("click", (event) => { /*this.mostrarEventoCard(uids_eventos[g]);*/this.abrirEventos(this.idActualPueblo, uids_eventos[g]);});
                }

                if(verMas2 != ""){
                  document.getElementById('lugaresMas').addEventListener('click', (uid) =>{
                    this.abrirLugares(this.idActualPueblo);
                  });
                  document.getElementById('masLugares').addEventListener('click', (uid) =>{
                    this.abrirLugares(this.idActualPueblo);
                  });
              }

                if(contadorgeneralEventos==2){
                  if(document.getElementById('eventosMas') && document.getElementById('masEventos')){
                    document.getElementById('eventosMas').addEventListener('click', (uid) =>{
                      this.abrirEventos(this.idActualPueblo, "");
                    });
                    document.getElementById('masEventos').addEventListener('click', (uid) =>{
                      this.abrirEventos(this.idActualPueblo, "");
                    });
                  }
                }

                this.htmlActual = htmlFinal;
              }


            }, (err) => {
            });
          //}
        }
      }

        //document.getElementById("tarLug").innerHTML = htmlFinal;
        document.getElementById("tarjPueblo").innerHTML = htmlFinal;
        document.getElementById("tarLugImg").style.backgroundImage = "url("+environment.picturesDir+'/fototown/'+this.puebloinfo.pictures[1]+")";
        document.getElementById("tarLugFots").style.backgroundImage = "url("+environment.picturesDir+'/fototown/'+this.puebloinfo.pictures[1]+")";
        //this.htmlActual = htmlFinal;
        this.htmlActualCambiar(htmlFinal);

        document.getElementById('contenedorMasFotos').addEventListener("click", (event) => {this.loadPictures();});
        document.getElementById('playPueblo').addEventListener("click", (event) => {this.playPueblo(this.puebloinfo.location,this.puebloinfo.surface);});


        doc.classList.add('active');
        docClose.classList.add('active');

      }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});





  /*});
}, (err) => {
  let f = err.url;
  let mssgg = `El certificado de aemet no es válido, haga click en el link que hay a continuación <a href="`+f+`">LINK</a>', pulse en motrar detalles/configuración avanzada y finalmente haga click en acceder/visitar sitio web.`;
  Swal.fire({icon: 'error', title: 'Oops...', html: mssgg,})});*/
});

    }

    htmlActualCambiar(html){
      this.htmlActual = html;
    }

    playPueblo(coords,surface){
      if(document.getElementById('engine-wrapper').classList.contains('active')){
        /*document.getElementById('engine-wrapper').style.display = 'none';
        document.getElementById('map').style.display = 'block';*/
        document.getElementById('playPueblo').innerHTML = "Visitar Pueblo";
        let docClose = document.getElementById('ocultarTarLug');
        docClose.classList.remove('active');
        this.entrando=false;
        //document.getElementById('cerrarTarLug').style.opacity = '1';
        document.getElementById('cerrarTarLug').style.display = "block";
        this.dentroPueblo = false;

        //this.mapComponent.salirZoomPueblo();
        document.getElementById("mapSalirZoom").setAttribute('value', coords);

        document.getElementById('footerChido').style.display = 'block';

      }else{

        /*document.getElementById('engine-wrapper').style.display = 'block';*/
        let docClose = document.getElementById('ocultarTarLug');
        docClose.classList.add('active');
        this.entrando=true;
        /*this.engine.resizeCanvasToDisplaySize(document.getElementById('renderCanvas'));
        document.getElementById('map').style.display = 'none';*/

        //document.getElementById('cerrarTarLug').style.opacity = '0';
        document.getElementById('cerrarTarLug').style.display = "none";
        this.dentroPueblo = true;

        document.getElementById('footerChido').style.display = 'none';
       var surfaceSplit=surface.split(' ');
        this.engine.loadMesh(surfaceSplit[0]);
        this.filtersbar.zoomIn(coords, undefined);

          var checkExists = setInterval(() => {

            if (document.querySelector("#playPueblo").innerHTML == "Salir del Pueblo") {
              clearInterval(checkExists);
            }
            document.getElementById('playPueblo').innerHTML = "Salir del Pueblo";
          }, 100);
      }

    }

    loadPictures(){


      this.puebloservice.cargarPueblo(this.idActualPueblo).subscribe((res:any) =>{

        if(res.ok && this.puebloinfo.pictures.length>1){
          var town = this.puebloinfo;
          var imagenesList= town['pictures'];
          var images:Image[]=[];

          for (let index = 0; index < imagenesList.length-1; index++) {
            const element = imagenesList[index+1];
            var namefilenew= this.domSanitizer.bypassSecurityTrustResourceUrl( environment.picturesDir+'/fototown/'+element);
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

    abrirLugarreviews(reviews){

      //CERDA 1
      document.getElementById("exNumber").setAttribute('value', reviews);

      document.getElementById('cerrarTarLug').classList.remove('active');
      document.getElementById('tarjLugar').classList.remove('Activo');
      document.getElementById('tarjLugarReviews').classList.add('Activo');
      document.getElementById('tarLug').classList.add('ocultarbarraFiltros');
    }

    abrirEventos(eventos, evento){

      //CERDA 1
      document.getElementById("exEventos").setAttribute('value', eventos);
      document.getElementById('exEventosUno').setAttribute('value', evento)

      document.getElementById('cerrarTarLug').classList.remove('active');
      document.getElementById('tarjPueblo').classList.remove('Activo');
      document.getElementById('tarjEventos').classList.add('Activo');
      document.getElementById('tarLug').classList.add('ocultarbarraFiltros');
    }

    abrirLugares(lugares){

      //CERDA 1
      document.getElementById("exLugares").setAttribute('value', lugares);

      document.getElementById('cerrarTarLug').classList.remove('active');
      document.getElementById('tarjPueblo').classList.remove('Activo');
      document.getElementById('tarjLugares').classList.add('Activo');
      document.getElementById('tarLug').classList.add('ocultarbarraFiltros');
    }

    cerrarLugarreviews(){
      document.getElementById('cerrarTarLug').classList.add('active');
      document.getElementById('tarjLugarReviews').classList.remove('Activo');
      document.getElementById('tarjLugar').classList.add('Activo');
      document.getElementById('tarLug').classList.remove('ocultarbarraFiltros');
    }

    cargarPrevision(cod:string){

      var codsplit=cod.split(' ');
      this.apiservice.getTiempo(codsplit[1])
      .subscribe( (res:any) => {

        this.apiservice.getDataTiempo(res['datos']).subscribe((res:any)=>{
          this.prevision=res[0].prediccion.dia[0].estadoCielo[0].descripcion;

          if(this.prevision==''){
            this.prevision='Despejado';
          }
        });
      });
    }

  }
