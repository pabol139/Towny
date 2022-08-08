import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Image, ModalGalleryConfig, ModalGalleryRef, ModalGalleryService } from '@ks89/angular-modal-gallery';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { Provincia } from 'src/app/models/provincia.model';
import { Review } from 'src/app/models/review.model';
import { PlaceService } from 'src/app/services/place.service';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { ReviewService } from 'src/app/services/review.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CardinfoComponent } from '../cardinfo/cardinfo.component';

@Component({
  selector: 'app-reviews-lugar',
  templateUrl: './reviews-lugar.component.html',
  styleUrls: ['./reviews-lugar.component.css']
})
export class ReviewsLugarComponent implements OnInit {

  //public listaRevws : Review[] = [];
  public listaReviews: Review[] = [];
  public cerdaId = document.getElementById("exNumber");
  public observer;

  //public province: Provincia[] = [];
  public loading = false;
  public dir= environment.picturesDir;
  public totalValoraciones: number = 0;
  public posicionactual: number = 0;
  public registresPerPage: number = 6;
  public valueReview = 1;
  //public filterProvince = new FormControl();
  //public filteredProvinces: Observable<Provincia[]>;
  public filtrosActivos = false;

  arr = Array;
  public numMaxFotos = 3;
  public searchForm = this.fb.group({
    text: [''],
    order: ['']
  });

  public subs$: Subscription;

  constructor(private cardInfo: CardinfoComponent,
    private fb: FormBuilder,
    private modalGalleryService: ModalGalleryService,
    private domSanitizer: DomSanitizer,
    private reviewService: ReviewService,
    //private provinceService: ProvinciaService
    ) { }

  ngOnInit(): void {
    //this.getProvincesPlace();
    this.subs$ = this.searchForm.valueChanges
    .subscribe( event => {
      if(this.searchForm.get('text').value.length == 0){
        this.cargarValoracionesPlace();
      }
    });

  this.subs$ = this.searchForm.valueChanges
    .pipe(debounceTime(500))
    .subscribe( event => {
      if(this.searchForm.get('text').value.length > 0){
        this.cargarValoracionesPlace();
      }
    });
  }


  ngAfterViewInit() {
    this.observer = new MutationObserver(mutations => {
      this.cargarValoracionesPlace(document.getElementById("exNumber").getAttribute('value'));
    });
    var config = { attributes: true, childList: true, characterData: true };
    this.cerdaId = document.getElementById("exNumber");
    this.observer.observe(this.cerdaId, config);
  }

  borrar(){
    this.searchForm.get('text').setValue('');
    //this.searchForm.get('province').setValue('');
    this.searchForm.get('order').setValue('');
    this.cargarValoracionesPlace();
  }

  cerrarCard(){
    this.borrar();
    if(this.filtrosActivos) { this.updateStars(1); this.cambiarFiltro();}
    this.cardInfo.cerrarCard();
  }

  cargarValoracionesPlace(uid?: any) {
    let idPlace = document.getElementById("exNumber").getAttribute('value');
    const text = this.searchForm.get('text').value || '';

    const order = this.searchForm.get('order').value || '';

    this.loading = true;
    this.reviewService.cargarReviewsPlace(this.posicionactual, idPlace, text, this.valueReview, order)
      .subscribe((res:any) => {
        if (res['revwsPlace'].length === 0) {
          if (this.posicionactual > 0) {
            this.posicionactual = this.posicionactual - this.registresPerPage;
            if (this.posicionactual < 0) { this.posicionactual = 0};
            this.cargarValoracionesPlace(idPlace);
          } else {
          this.listaReviews = [];
          this.totalValoraciones = 0;
          }
        } else {
          this.listaReviews = res['revwsPlace'];
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
          this.totalValoraciones = res['page'].numrevs;
        }
        this.loading = false;

      }, (err)=> {
        this.loading = false;
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });
      });
  }

  cambiarPaginaRevwsByPlace( pagina: number ){
    let uid_place = document.getElementById("exNumber").getAttribute('value');
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionactual = ((pagina - 1) * this.registresPerPage >=0 ? (pagina - 1) * this.registresPerPage : 0);
    this.cargarValoracionesPlace(uid_place);
  }


  loadPictures(id:any ){
    this.reviewService.cargarReview(id).subscribe((res:any) =>{
      if(res.ok){
        //this.closeModal()
        //this.closeModal('valoraciones');
        //this.userClick();
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

  updateStars(val: number) {
    this.valueReview = val;
    //var filterBar = document.getElementById("myImg").style.filter = "grayscale(100%)";
    for(var ii=1;ii<=5;ii++){
      var second = document.querySelector(".starsReview .starss_update:nth-child("+ii+")")
      second.classList.remove('active');
    }
    for(var i=val;i>0;i--){
      var second = document.querySelector(".starsReview .starss_update:nth-child("+i+")")
      second.classList.add('active');
    }
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
