import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PlaceService } from 'src/app/services/place.service';
import { PuebloService } from 'src/app/services/pueblo.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CardinfoComponent } from '../cardinfo/cardinfo.component';

@Component({
  selector: 'app-lista-lugares',
  templateUrl: './lista-lugares.component.html',
  styleUrls: ['./lista-lugares.component.css']
})
export class ListaLugaresComponent implements OnInit {

  public observer;
  public cerdaId = document.getElementById("exLugares");
  public todosLugares = [];
  public totalLugares = 0;
  public posicionactual: number = 0;
  public registresPerPage: number = 6;
  public loading = false;
  public filtrosActivos = false;
  public valueReview = 0;

  public searchForm = this.fb.group({
    text: [''],
    order: ['']
  });

  public dir= environment.picturesDir;
  public subs$: Subscription;

  constructor(private puebloService: PuebloService,
              public domSanitizer: DomSanitizer,
              private fb: FormBuilder,
              private cardInfo: CardinfoComponent) { }

  ngOnInit(): void {

    this.subs$ = this.searchForm.valueChanges
        .subscribe( event => {
          if(this.searchForm.get('text').value.length == 0) { this.todosLugares = []; }
        });

    this.subs$ = this.searchForm.valueChanges
        .pipe(debounceTime(500),
              distinctUntilChanged())
        .subscribe( event => {
          this.abrirTarjeta();
        });
  }

  openLugarCard(place){
    //this.homeComponent.cerrarCardViaj();

    if(document.getElementById('ocultarTarLug').classList.contains('active')){
      this.cardInfo.setDentroPueblo(true);
    }
    else{
      this.cardInfo.setDentroPueblo(false);
    }

    this.cardInfo.cerrarCard();
    this.cardInfo.mostrarLugarCard(place.uid);
    if(this.cardInfo.dentroPueblo){

      document.getElementById("accionadorZoomLugar").setAttribute('value', place.uid);
      this.cardInfo.ZoomPlace(place.uid);}
  }

  cerrarCard(){
    this.borrar();
    if(this.filtrosActivos) { this.updateStars(0); this.cambiarFiltro();}
    this.cardInfo.cerrarCard();
  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(mutations => {
      this.abrirTarjeta(document.getElementById("exLugares").getAttribute('value'));
    });
    var config = { attributes: true, childList: true, characterData: true };
    this.cerdaId = document.getElementById("exLugares");
    this.observer.observe(this.cerdaId, config);
  }

  cambiarFiltro(){
    if(this.filtrosActivos){
      this.filtrosActivos = false;
      document.getElementById("iconoFiltrosFav").classList.remove('fa-times');
      document.getElementById("iconoFiltrosFav").classList.add('fa-filter');
    }else{
      this.filtrosActivos = true;
      document.getElementById("iconoFiltrosFav").classList.remove('fa-filter');
      document.getElementById("iconoFiltrosFav").classList.add('fa-times');
    }

    var checkExist = setInterval(() => {
      if (document.querySelector("#starsReviewFav")) {
         this.updateStars(this.valueReview);
         clearInterval(checkExist);
      }
    }, 100);

  }

  abrirTarjeta(uid?){
    const text = this.searchForm.get('text').value || '';
    //console.log(uid);
    let id = '';
    if(uid) { id = uid; }
    else { id = document.getElementById("exLugares").getAttribute('value'); }

    this.loading = true;
    const order = this.searchForm.get('order').value || '';

    this.puebloService.cargarLugaresByTown(this.posicionactual, id, text, this.valueReview, order)
      .subscribe((res:any) => {
        if (res['places'].length === 0) {
          if (this.posicionactual > 0) {
            this.posicionactual = this.posicionactual - this.registresPerPage;
            if (this.posicionactual < 0) { this.posicionactual = 0};
            this.abrirTarjeta(uid);
          } else {
          this.todosLugares = [];
          this.totalLugares = 0;
          }
        } else {
          this.todosLugares = res['places'];
          if(text != ''){
            for(let i = 0; i <this.todosLugares.length; i++){
                /* Comprobamos la descripcion */
                if(this.todosLugares[i].description.toLowerCase().includes(text.toLowerCase())){
                  let spl = this.todosLugares[i].description.toLowerCase().split(text.toLowerCase());
                  this.todosLugares[i].description = '';
                  for(let j = 0; j < spl.length; j++){
                    this.todosLugares[i].description += spl[j] ;
                    if(j < spl.length - 1){
                      this.todosLugares[i].description += '<b>'+ text.toUpperCase() +'</b>';
                    }
                  }
                }
                /* Comprobamos el nombre del lugar */
                if(this.todosLugares[i].name.toLowerCase().includes(text.toLowerCase())){
                  let spl = this.todosLugares[i].name.toLowerCase().split(text.toLowerCase());
                  this.todosLugares[i].name = '';
                  for(let j = 0; j < spl.length; j++){
                    this.todosLugares[i].name += spl[j] ;
                    if(j < spl.length - 1){
                      this.todosLugares[i].name += '<label style="background-color: orange">'+ text.toUpperCase() +'</label>';
                    }
                  }
                }
            }
          }
          this.totalLugares = res['page'].total;
        }
        this.loading = false;

      }, (err)=> {
        this.loading = false;
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });
      });
  }

  cambiarPaginaRevwsByPlace( pagina: number ){
    let uid_place = document.getElementById("exLugares").getAttribute('value');
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionactual = ((pagina - 1) * this.registresPerPage >=0 ? (pagina - 1) * this.registresPerPage : 0);
    this.abrirTarjeta(uid_place);
  }

  updateStars(val: number) {
    this.valueReview = val;
    for(var ii=1;ii<=5;ii++){
      var second = document.querySelector("#starsReviewFav .starss_update:nth-child("+ii+")")
      second.classList.remove('active');
    }
    for(var i=val;i>0;i--){
      var second = document.querySelector("#starsReviewFav .starss_update:nth-child("+i+")")
      second.classList.add('active');
    }
  }

  borrar(){
    this.searchForm.get('text').setValue('');
    this.searchForm.get('order').setValue('');
    this.todosLugares = [];
  }

  /*abrirTarjeta(uid){

    this.todosLugares = [];

    this.puebloService.cargarPueblo(uid).subscribe((res:any) => {

      if(res['towns'].places.length > 0){

        for(let iii=0;iii<res['towns'].places.length;iii++){
            this.placeService.getPlace(res['towns'].places[iii])
            .subscribe( (resss:any) => {
              if(resss.ok && resss['places'].status == "Activo"){
                this.todosLugares.push(resss['places']);
              }
            }, (err) => {
            });
        }

      }
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
      //console.warn('error:', err);
    });
  } */

}
