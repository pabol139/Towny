import { Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { ReviewService } from 'src/app/services/review.service';
import { Review } from 'src/app/models/review.model';
import { Provincia } from 'src/app/models/provincia.model';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { Place } from 'src/app/models/place.model';
import { ModalService } from 'src/app/commons/modal';
import { PlaceService } from 'src/app/services/place.service';
import { UploadsService } from 'src/app/services/uploads.service';
import { Image, ModalGalleryConfig, ModalGalleryRef, ModalGalleryService } from '@ks89/angular-modal-gallery';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';


@Component({
  selector: 'app-valoraciones',
  templateUrl: './valoraciones.component.html',
  styleUrls: ['./valoraciones.component.css']
})
export class ValoracionesComponent implements OnInit {

  arr = Array;

  public username = this.userservice.name;
  public rol = this.userservice.rol;
  public email = this.userservice.email;
  public uidUser = this.userservice.uid;
  public registerDate = this.userservice.registerDate;
  public reviews = this.userservice.reviews;

  public numMaxFotos = 3;

  public place: Place = null;

  public listaReviews: Review[] = [];
  public listaReviewsUsu: Review[] = [];

  public searchForm = this.fb.group({
    text: [''],
    province: [''],
    order: ['']
  });

  public filtrosActivos = false;

  public createReview = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    comment: ['', Validators.required ],
    //review: ['',Validators.required],
    //place: ['', Validators.required]
  });

  public file: File [] = [];

  public province: Provincia[] = [];
  public loading = false;
  public dir= environment.picturesDir;
  public totalValoraciones: number = 0;
  public posicionactual: number = 0;
  public registresPerPage: number = 6;
  public valueReview = 1;
  public uidReview = 'nuevo';
  public place_id: Place = null;

  public filterProvince = new FormControl();
  public filteredProvinces: Observable<Provincia[]>;

  public waiting: boolean = false;
  public wait_form: boolean = false;
  public submited = false;

  public imagenUrl = [];

  public subs$: Subscription;

  public cerdaId = document.getElementById("accionadorEnviarReview");
  public observer;

  constructor(
    private fb: FormBuilder,
    private userservice: UserService,
    private modalService :ModalService,
    public domSanitizer: DomSanitizer,
    private reviewService: ReviewService,
    private modalGalleryService: ModalGalleryService,
    private provinceService: ProvinciaService
  ) { }

  ngOnInit(): void {
    if(this.uidUser != ''){
      this.cargarValoraciones();
      this.getProvinces();
      this.subs$ = this.searchForm.valueChanges
        .subscribe( event => {
          if(this.searchForm.get('text').value.length == 0){
            this.cargarValoraciones();
          }
        });

      this.subs$ = this.searchForm.valueChanges
        .pipe(debounceTime(500),
              distinctUntilChanged())
        .subscribe( event => {
          if(this.searchForm.get('text').value.length > 0){
            this.cargarValoraciones();
          }
        });
      }
  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(mutations => {
      this.cargarValoraciones();
    });
    var config = { attributes: true, childList: true, characterData: true };
    this.cerdaId = document.getElementById("accionadorEnviarReview");
    this.observer.observe(this.cerdaId, config);
    //this.borrar();
  }

  borrar(){
    this.searchForm.controls['text'].setValue('');
    this.searchForm.controls['province'].setValue('');
    this.searchForm.controls['order'].setValue('');
    this.listaReviews = [];
  }

  cerrarCardRevws(){
    this.valueReview = 1;
    if(this.filtrosActivos) { this.cambiarFiltro(); }
    this.searchForm.get('text').setValue('');
    this.searchForm.get('province').setValue('');
    this.searchForm.get('order').setValue('');
    document.getElementById('tarVals').classList.remove('active');
    document.getElementById('cerrarTarRevws').classList.remove('active');
    document.getElementById('valoracionesHome').classList.remove('Homeactive');
  }

  cargarValoraciones() {
    const text = this.searchForm.get('text').value || '';
    let bool = false;
    let prov = '';

    if(this.searchForm.get('province').value.length > 0){
      for(let x = 0; x < this.province.length; x++){
        if(this.province[x].name === this.searchForm.get('province').value){
          bool = true;
          this.searchForm.value.province = this.province[x].uid;
          break;
        }
      }
      if(this.searchForm.get('province').value.length > 0 && !bool) { return; }
    }
    if(bool){ prov = this.searchForm.value.province; }
    const order = this.searchForm.get('order').value || '';

    this.loading = true;
    this.reviewService.cargarReviewsUser(this.posicionactual, this.userservice.uid, text, this.valueReview, prov, order)
      .subscribe((res:any) => {
        if (res['revsByUser'].length === 0) {
          if (this.posicionactual > 0) {
            this.posicionactual = this.posicionactual - this.registresPerPage;
            if (this.posicionactual < 0) { this.posicionactual = 0};
            this.cargarValoraciones();
          } else {
          this.listaReviews = [];
          this.totalValoraciones = 0;
          }
        } else {
          this.listaReviews = res['revsByUser'];
          if(text != ''){
            for(let i = 0; i <this.listaReviews.length; i++){
                if(this.listaReviews[i].comment.toLowerCase().includes(text.toLowerCase())){
                  let spl = this.listaReviews[i].comment.toLowerCase().split(text.toLowerCase());
                  this.listaReviews[i].comment = '';
                  for(let j = 0; j < spl.length; j++){
                    this.listaReviews[i].comment += spl[j] ;
                    if(j < spl.length - 1){
                      this.listaReviews[i].comment += '<b>'+ text.toUpperCase() +'</b>';
                    }
                  }
                }
            }
          }
          this.totalValoraciones = res['page'].total;
        }
        this.loading = false;

      }, (err)=> {
        this.loading = false;
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });
      });
  }


  cargarValoracion(valoracion: Review){
    this.uidReview = valoracion.uid;
    this.place_id = valoracion.place;
    this.createReview.get('uid').setValue(valoracion.uid);
    this.createReview.get('comment').setValue(valoracion.comment);
    let x = '';
    if (valoracion.review % 1 != 0) {
      x = valoracion.review.toFixed();
      var i = parseInt(x);
      this.updateStars(i);
    } else{
      this.updateStars(valoracion.review);
    }

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

  openModal(id: string) {
    if(id=='favoritos'){
    }
      this.modalService.open(id);
      this.googleTranslateElementInit();

  }

  deleteReview( uid: string) {
    Swal.fire({
      title: 'Borrar valoración.',
      text: `¿Está seguro de que desea eliminar esta valoración?`,
      icon: 'question',
      backdrop: false,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {

          if (result.value) {

            this.reviewService.eliminarReview(uid)
              .subscribe( resp => {
                this.listaReviews = [];
                this.cargarValoraciones();
              }
              ,(err) =>{
                Swal.fire({icon: 'error', backdrop: false, title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  userClick(){
    var optUser = document.getElementById('menu');
      optUser.classList.toggle("active");
  }

  loadPictures(id:any ){
    this.reviewService.cargarReview(id).subscribe((res:any) =>{
      if(res.ok){
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

  reload(){
    this.cargarValoraciones();
  }

  cambiarPagina( pagina: number ){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionactual = ((pagina - 1) * this.registresPerPage >=0 ? (pagina - 1) * this.registresPerPage : 0);
    this.cargarValoraciones();
  }

  getProvinces() {
    // cargamos todos los cursos
    this.provinceService.cargarAllProvincias()
      .subscribe( res => {
        this.province = res['provinces'];
        this.filteredProvinces = this.filterProvince.valueChanges.pipe(
          startWith(''),
          map(value => this.filtroProvincia()),
        );
      });
  }

  private filtroProvincia(): Provincia[] {
    //const filterValue = value.province.toLowerCase();
    return this.province.filter(option => option.name.toLowerCase().includes(this.searchForm.value.province.toLowerCase()));
  }

  cambiarFiltro(){
    if(this.filtrosActivos){
      this.filtrosActivos = false;
      document.getElementById("iconoFiltros").classList.remove('fa-times');
      document.getElementById("iconoFiltros").classList.add('fa-filter');
    }else{
      this.filtrosActivos = true;
      document.getElementById("iconoFiltros").classList.remove('fa-filter');
      document.getElementById("iconoFiltros").classList.add('fa-times');

      var checkExist = setInterval(() => {
        if (document.querySelector(".starsReview")) {
          this.updateStars(this.valueReview);
          clearInterval(checkExist);
        }
      }, 100);

    }

  }

}
