import { Component, OnInit } from '@angular/core';
import { CardinfoComponent } from 'src/app/commons/cardinfo/cardinfo.component';
import { HomeComponent } from 'src/app/home/home.component';
import { Place } from 'src/app/models/place.model';
import { UiComponent } from 'src/app/motor/ui/ui.component';
import { PlaceService } from 'src/app/services/place.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { FormBuilder, FormControl } from '@angular/forms';
import { Provincia } from 'src/app/models/provincia.model';
import { Observable, Subscription } from 'rxjs';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css']
})
export class FavoritosComponent implements OnInit {

  public waitFavourites = false;
  public uidUser = this.userservice.uid;
  public listaFavoritos: Place[] = [];
  public rol = this.userservice.rol;
  public dir= environment.picturesDir;

  public filtrosActivos = false;
  public valueReview = 0;

  public totalFavoritos = 0;
  /* cosas del paginado */
  public posicionactual: number = 0;
  public registresPerPage: number = 6;

  /* Filtro de provincias */
  public province: Provincia[] = [];
  public filterProvince = new FormControl();
  public filteredProvinces: Observable<Provincia[]>;

  public subs$: Subscription;

  public searchForm = this.fb.group({
    text: [''],
    province: [''],
    order: ['']
  });

  public observer;

  public cerdaId = document.getElementById('cosasmalasjijiji');

  constructor(
    private fb: FormBuilder,
    private userservice: UserService,
    private cardinfo:CardinfoComponent,
    private homeComponent: HomeComponent,
    private provinceService: ProvinciaService,
    public domSanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    if(this.rol!=''){
      this.cargarFavoritos();
      this.getProvinces();
      this.subs$ = this.searchForm.valueChanges
        .subscribe( event => {
          if(this.searchForm.get('text').value.length == 0) { this.listaFavoritos = []; }
        });

      this.subs$ = this.searchForm.valueChanges
        .pipe(debounceTime(500),
              distinctUntilChanged())
        .subscribe( event => {
          this.cargarFavoritos();
        });
    }
  }

  ngAfterViewInit(): void {
    this.observer = new MutationObserver(mutations => {
      this.cargarFavoritos();
    });
    //this.cargarFavoritos();
    var config = { attributes: true, childList: true, characterData: true };;
    this.cerdaId = document.getElementById('cosasmalasjijiji');
    this.observer.observe(this.cerdaId, config);
  }

cargarFavoritos() {
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

    this.waitFavourites = true;

    this.userservice.getPlacesFavourites(this.posicionactual, this.uidUser, text, this.valueReview, prov, order)
      .subscribe((res:any) => {
        if (res['favourites'].length === 0) {
          if (this.posicionactual > 0) {
            this.posicionactual = this.posicionactual - this.registresPerPage;
            if (this.posicionactual < 0) { this.posicionactual = 0};
            this.cargarFavoritos();
          } else {
          this.listaFavoritos = [];
          this.totalFavoritos = 0;
          }
        } else {
          this.listaFavoritos = res['favourites'];
          if(text != ''){
            for(let i = 0; i <this.listaFavoritos.length; i++){
                /* Comprobamos la descripcion */
                if(this.listaFavoritos[i].description.toLowerCase().includes(text.toLowerCase())){
                  let spl = this.listaFavoritos[i].description.toLowerCase().split(text.toLowerCase());
                  this.listaFavoritos[i].description = '';
                  for(let j = 0; j < spl.length; j++){
                    this.listaFavoritos[i].description += spl[j] ;
                    if(j < spl.length - 1){
                      this.listaFavoritos[i].description += '<b>'+ text.toUpperCase() +'</b>';
                    }
                  }
                }
                /* Comprobamos el nombre del lugar */
                if(this.listaFavoritos[i].name.toLowerCase().includes(text.toLowerCase())){
                  let spl = this.listaFavoritos[i].name.toLowerCase().split(text.toLowerCase());
                  this.listaFavoritos[i].name = '';
                  for(let j = 0; j < spl.length; j++){
                    this.listaFavoritos[i].name += spl[j] ;
                    if(j < spl.length - 1){
                      this.listaFavoritos[i].name += '<label style="background-color: orange">'+ text.toUpperCase() +'</label>';
                    }
                  }
                }
            }
          }
          this.totalFavoritos = res['page'].total_favourites;
        }
        this.waitFavourites = false;

      }, (err)=> {
        this.waitFavourites = false;
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });
      });
  }

cambiarPagina( pagina: number ){
  pagina = (pagina < 0 ? 0 : pagina);
  this.posicionactual = ((pagina - 1) * this.registresPerPage >=0 ? (pagina - 1) * this.registresPerPage : 0);
  this.cargarFavoritos();
}

  removePlaceToFavourites(place: Place){
    /*let placeJSONtext = JSON.stringify(place);
    let place_to_JSON_parse = JSON.parse(placeJSONtext)._id;*/
    this.userservice.removePlaceToFavourites(this.uidUser, place.uid).subscribe( (res:any) => {
      this.listaFavoritos = [];
      this.cargarFavoritos();
      //this.cargarLugares();
      Swal.fire({
         icon: 'success', title: 'Lugar eliminado con éxito',
         text: res['place'].name +' ya no es de tus lugares favoritos',
         backdrop:false
     });
    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', backdrop:false, title: 'Oops...', text: msgerror,});
    })
  }

  openLugarCard(place){
    this.homeComponent.cerrarCardViaj();
    this.cardinfo.mostrarLugarCard(place.uid);
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
    this.searchForm.get('province').setValue('');
    this.searchForm.get('order').setValue('');
    this.listaFavoritos = [];
  }

  cerrarCardFavs(){
    this.valueReview = 0;
    if(this.filtrosActivos) { this.cambiarFiltro(); }
    this.borrar();
    document.getElementById('tarFav').classList.remove('active');
    document.getElementById('cerrarTarFavs').classList.remove('active');
    document.getElementById('favoritosHome').classList.remove('Homeactive');
  }

  private filtroProvincia(): Provincia[] {
    return this.province.filter(option => option.name.toLowerCase().includes(this.searchForm.value.province.toLowerCase()));
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

}
