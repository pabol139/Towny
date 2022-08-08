import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { UploadsService } from 'src/app/services/uploads.service';
import { environment } from '../../../environments/environment';
import { ModalService } from '../modal';
import { TravelService } from 'src/app/services/travel.service';
import { Travel } from 'src/app/models/travel.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserprofileComponent } from '../../pages/User/userprofile/userprofile.component';

import Swal from 'sweetalert2';
import { Place } from 'src/app/models/place.model';
import { PlaceService } from 'src/app/services/place.service';
import { ReviewService } from 'src/app/services/review.service';
import { Review } from 'src/app/models/review.model'
import { LoginComponent } from 'src/app/auth/login/login.component';
import { RegisterComponent } from 'src/app/auth/register/register.component';
import { ViajesComponent } from 'src/app/pages/User/viajes/viajes.component';
import { map, startWith } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Image, ModalGalleryConfig, ModalGalleryRef, ModalGalleryService } from '@ks89/angular-modal-gallery';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { UiComponent } from 'src/app/motor/ui/ui.component';
import { Provincia } from 'src/app/models/provincia.model';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { FavoritosComponent } from 'src/app/pages/User/favoritos/favoritos.component';


let btn = document.querySelector("#btn");
@Component({
  selector: 'app-usericon',
  templateUrl: './usericon.component.html',
  styleUrls: ['./usericon.component.scss']
})
export class UsericonComponent implements OnInit {
  arr = Array;
  public username = this.userservice.name;
  public rol = this.userservice.rol;
  public email = this.userservice.email;
  public uidUser = this.userservice.uid;
  public registerDate = this.userservice.registerDate;
  public reviews = this.userservice.reviews;
  public pictureUrl = '';
  public uidReview = 'nuevo';
  public filterPlaces = new FormControl();
  public filterProvince = new FormControl();
  public filteredProvinces: Observable<Provincia[]>;
  public filteredOptions: Observable<Place[]>;
  public file: File [] = [];
  public valueReview = 1;
  public valueReviewForm = 0;
  dropdownSettings = {};
  public waitFavourites = false;

  public innerW = false;

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    name: ['', Validators.required ],
    pictures: [''],
    description: [''],
    places: [''],
  });

  public createReview = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    comment: ['', Validators.required ],
  });

  public searchForm = this.fb.group({
    text: [''],
    province: ['']
  });

  public waiting: boolean = false;
  public wait_form: boolean = false;
  public listaRegistros: Place[] = [];
  public listaRegistrosSel: Place[] = [];
  public listaRutas: Travel[] = [];
  public listaFavoritos: Place[] = [];
  public place_id: Place = null;

  public uid: string = 'nuevo';
  public submited = false;

  public listaReviews: Review[] = [];
  public listaReviewsUsu: Review[] = [];
  public totalValoraciones: number = 0;
  public posicionactual: number = 0;
  public registresPerPage: number = 6;
  public loading = false;
  public province: Provincia[] = [];
  public subs$: Subscription;

  constructor(
    private fb: FormBuilder,
    private userservice: UserService,
    private modalService :ModalService,
    private travelservice: TravelService,
    private placeService: PlaceService,
    private reviewService: ReviewService,
    public dialog: MatDialog,
    private domSanitizer: DomSanitizer,
    private modalGalleryService: ModalGalleryService,
    private titleService:Title,
    private favoriteService: FavoritosComponent,

  ) { }

  ngOnInit(): void {

    this.createPictureUrl();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'uid',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      limitSelection: 5
    };
    if(this.rol!=''){
      this.createPictureUrl();
      this.cargarLugares();
      this.cargarRutas();
      this.subs$ = this.searchForm.valueChanges
      .subscribe( event => {
      });
      this.getPlaces();
    }

    if(window.innerWidth<570){
      this.innerW = true;
    }

  }
  private filtroProvincia(): Provincia[] {
    return this.province.filter(option => option.name.toLowerCase().includes(this.searchForm.value.province.toLowerCase()));
  }

  borrar(){
    this.searchForm.reset();
  }

  cambiarPagina( pagina: number ){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionactual = ((pagina - 1) * this.registresPerPage >=0 ? (pagina - 1) * this.registresPerPage : 0);
  }



  getPlaces() {
    this.placeService.getAllPlaces()
      .subscribe((res:any) => {
          this.listaRegistros = res['places'];
          if(this.uid === 'nuevo'){
            this.filteredOptions = this.filterPlaces.valueChanges.pipe(
              startWith(''),
              map(value => this.filtro()),
            );
          }
      }, (err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });
      });
  }

  private filtro(): Place[] {
    return this.listaRegistros.filter(option => option.name.toLowerCase().includes(this.createReview.value.place.toLowerCase()));
  }

  campoNoValidoNew( campo: string) {
    return this.createReview.get(campo)?.invalid && this.submited;
  }

  onResize(event) {
    if(event.target.innerWidth > 570){
      this.innerW = false;
    }else{
      this.innerW = true;
    }
  }

  onItemSelect(item:any){

    this.listaRegistrosSel.push(item.uid);

  }
  onItemDeSelect(item:any){

    this.removeItemFromArr(this.listaRegistrosSel,item.uid);

  }
  removeItemFromArr ( arr, item ) {
    var i = arr.indexOf( item );

    if ( i !== -1 ) {
        arr.splice( i, 1 );
    }
}

  openDialog() {
    const dialogRef = this.dialog.open(

      UserprofileComponent,{
        data: {

            name: this.username,
            email: this.email,
            registerDate: this.registerDate,
            reviews: this.reviews

          },
        panelClass: 'dialog-container-custom'});

    dialogRef.afterClosed().subscribe(result => {
      this.titleService.setTitle("Towny");
    });
  }

  openDialogViajes() {
    const dialogRef = this.dialog.open(

      ViajesComponent,{
        height: '80%',
            width: '100%',
        panelClass: 'dialog-container-custom'});

    dialogRef.afterClosed().subscribe(result => {
      this.titleService.setTitle("Towny");
    });
  }

  openDialogLogin() {
    const dialogRef = this.dialog.open(

      LoginComponent,{

        data: {
          },
       });

    dialogRef.afterClosed().subscribe(result => {
      this.titleService.setTitle("Towny");
    });
  }

  openDialogRegister() {
    const dialogRef = this.dialog.open(

      RegisterComponent,{

        data: {
          },
       });

    dialogRef.afterClosed().subscribe(result => {
      this.titleService.setTitle("Towny");
    });
  }

  createPictureUrl(){
    // Devolvemos la imagen en forma de peticilon a la API
    const token = localStorage.getItem('x-token') || sessionStorage.getItem('x-token') || '';
    this.pictureUrl = `${environment.base_url}/upload/fotoperfil/${this.userservice.picture}?token=${token}`;
  }
  campoNoValido( campo: string) {
    return this.datosForm.get(campo)?.invalid && this.submited;
  }

  userClick(){
    //let optUser = document.querySelector(".optionsUser");
    var optUser = document.getElementById('menu');
      optUser.classList.toggle("active");
  }


  perfilModal(){
    Swal.fire({
      html:
        'You can use <b>bold text</b>, ' +
        '<a href="//sweetalert2.github.io">links</a> ' +
        'and other HTML tags',
      showCloseButton: true,
      showCancelButton: false,
      showConfirmButton: false
    })
  }

  logout(){
    this.userservice.logout();
  }

  openModal(id: string) {
    if(id=='favoritos'){
      this.cargarLugares();
    }
      this.modalService.open(id);
      this.googleTranslateElementInit();

  }

googleTranslateElementInit() {
  new google.translate.TranslateElement({
      pageLanguage: 'es',
      includedLanguages: 'es,ca,eu,gl,en,fr,it,pt,de',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      gaTrack: true
  }, 'google_translate_element');
}

closeModal(id: string) {
    this.modalService.close(id);
}

crearViaje(): void {

  if (this.datosForm.invalid) { return; }

  // Si estamos creando uno nuevo
  if (this.datosForm.get('uid')?.value === 'nuevo') {

    this.datosForm.value.places= this.listaRegistrosSel;
    this.travelservice.newTravel( this.datosForm.value)
      .subscribe( (res:any) => {
       // this.datosForm.get('uid')?.setValue( res['provinces'].uid );
        this.datosForm.markAsPristine();
        Swal.fire({icon: 'success', title: 'Viaje creado con exito', text: 'Se creo el viaje',});

      }, (err) => {

        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      })


}

}

deleteTravel( uid: string) {

  Swal.fire({
    title: 'Borrar viaje',
    text: `Al eliminar el viaje se perderán todos los datos asociados. ¿Desea continuar?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, borrar'
  }).then((result) => {

        if (result.value) {
          this.travelservice.eliminarTravel(uid)
            .subscribe( resp => {
              this.cargarRutas();
            }
            ,(err) =>{
              Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
            })
        }
    });
}

cargarFavoritos(){
  this.favoriteService.cargarFavoritos();
}

cargarLugares() {
  this.favoriteService.borrar();
}

cargarRutas( ) {
  this.listaRutas=[];
  this.travelservice.cargarAllTravels()
    .subscribe((res:any) => {
        for (let index = 0; index < res['travels'].length; index++) {
          const element = res['travels'][index];
          if(element.user.name==this.username){
            this.listaRutas.push(element);
          }

        }

    }, (err)=> {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

    });
}

cargarValoraciones(){

}


deleteReview( uid: string) {
  Swal.fire({
    title: 'Borrar valoración.',
    text: `¿Está seguro de que desea eliminar esta valoración?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, borrar'
  }).then((result) => {

        if (result.value) {
          this.reviewService.eliminarReview(uid)
            .subscribe( resp => {
              this.listaReviews = [];
            }
            ,(err) =>{
              Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
            })
        }
    });
}

updateStars(val: number) {
  this.valueReview = val;
  for(var ii=1;ii<=5;ii++){
    var second = document.querySelector(".starsReview .starss_update:nth-child("+ii+")")
    second.classList.remove('active');
  }
  for(var i=val;i>0;i--){
    var second = document.querySelector(".starsReview .starss_update:nth-child("+i+")")
    second.classList.add('active');
  }
}

loadPictures(id:any ){
  this.reviewService.cargarReview(id).subscribe((res:any) =>{
    if(res.ok){
      this.userClick();
      var town = res['revws'];
      var imagenesList= town['pictures'];
      var images:Image[]=[];

      for (let index = 0; index < imagenesList.length; index++) {
        const element = imagenesList[index];
        var namefilenew= this.domSanitizer.bypassSecurityTrustResourceUrl( environment.picturesDir+'/fotoreview/'+element);
        images.push(new Image(index,{img:namefilenew}));
      }
      const dialogRef: ModalGalleryRef = this.modalGalleryService.open({
        id: 22,
        images: images,
        currentImage: images[0],
        libConfig: {
          currentImageConfig: {
            downloadable: true,
            disableClose: false,
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





