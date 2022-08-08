import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { PuebloService } from 'src/app/services/pueblo.service';
import { Pueblo } from 'src/app/models/pueblo.model';
import { map, startWith } from 'rxjs/operators';
import { MapComponent } from 'src/app/motor/map/map.component';
import { MapService } from 'src/app/services/map.service';
import { PlaceService } from 'src/app/services/place.service';
import { Place } from 'src/app/models/place.model';
import Swal from 'sweetalert2';
import { Provincia } from 'src/app/models/provincia.model';
import { CardinfoComponent } from '../cardinfo/cardinfo.component';
import { EngineService } from 'src/app/services/engine.service';

@Component({
  selector: 'app-filtersbar',
  templateUrl: './filtersbar.component.html',
  styleUrls: ['./filtersbar.component.css']
})
export class FiltersbarComponent implements OnInit {

  valueReview = 0;
  lugares: FormGroup;
  checkedCheckbox = true;
  public filterbaropen = false;
  public filterProvince = new FormControl();
  gridsize: number = 0;
  public filteredOptions: Observable<any[]>;
  public towns: any[] = [];
  public places: Place[] = []
  public dir = environment.picturesDir;
  public totalPlaces = 0;
  public posicionactual: number = 0;
  public registresPerPage: number = 5;
  public textoInput: string = null

  //public filterProvince = new FormControl();
  //public filteredOptions: Observable<any[]>;
  public filterProvinceForm = new FormControl();
  public filteredProvincesForm: Observable<Provincia[]>;
  public province: Provincia [] = [];
  public subs$: Subscription;
  public searchForm = this.fb.group({
    //text: [''],
    provinces: ['']
  });

  updateSetting(event) {
    this.gridsize = event.value;
  }

  constructor(
   private fb: FormBuilder,
   private townservice:PuebloService,
   private mapservice:MapService,
   private placeService:PlaceService,
   private provinceService: ProvinciaService,
   private cardInfo: CardinfoComponent,

  ) {
    /*

    <option value="RESTAURANT">Restauracion</option>
                          <option value="CHURCH_PLACES">Lugares de culto</option>
                          <option value="MONUMENTS">Monumentos</option>
                          <option value="GREEN_ZONE">Zonas verdes</option>
                          <option value="ENTERTAINMENT">Entretenimiento</option>
                          <option value="COMMERCES">Comercios</option>
                          <option value="ART_AND_CULTURE">Arte y cultura</option>

    */

    this.lugares = fb.group({
      CHURCH_PLACES: false,
      MONUMENTS: false,
      GREEN_ZONE: false,
      ENTERTAINMENT: false,
      COMMERCES: false,
      ART_AND_CULTURE: false,
      RESTAURANT: false
    });
   }

  ngOnInit(): void {
    this.updateStars(1);
    this.getProvinces();
    this.subs$ = this.searchForm.valueChanges
      .subscribe( event => {
        this.filtroProvince();
        //this.filtrarBusqueda();
      });
  }

  updateStars(val) {
    this.valueReview = val;
    //var filterBar = document.getElementById("myImg").style.filter = "grayscale(100%)";
    for(var ii=1;ii<=5;ii++){
      var second = document.querySelector("#starsReview span:nth-child("+ii+")");
      second.classList.remove('active');
    }
    for(var i=val;i>0;i--){
      var second = document.querySelector("#starsReview span:nth-child("+i+")");
      /*second.classList.toggle('active');*/
      second.classList.add('active');
    }
  }

/*
  btnClick(){
    let sidebar = document.querySelector(".sidebar");
    let home_content = document.querySelector(".home-content");
    if(sidebar!=null && home_content!=null){
      sidebar.classList.toggle("active");
      home_content.classList.toggle("active");
    }
  }*/

  private filtroProvince(): Provincia[] {
    return this.province.filter(option1 => option1.name.toLowerCase().includes(this.searchForm.value.provinces.toLowerCase()));
  }

  getProvinces() {
    // cargamos todos los cursos
    this.provinceService.cargarAllProvincias()
      .subscribe( res => {
        this.province = res['provinces'];
        this.filteredProvincesForm = this.filterProvinceForm.valueChanges.pipe(
          startWith(''),
          map(value => this.filtroProvince()),
        );
        //this.filtrarBusqueda();
      });
  }

  changeFilterBar(){
    var filterBar = document.getElementById('barraFiltro');
    filterBar.classList.toggle("active");
    var filterBarSearch = document.getElementById('filtersbar');
    filterBarSearch.classList.toggle("active");
    /*var filterBarBackground = document.getElementById('fondobarraFiltro');
    filterBarBackground.classList.toggle("active");*/
    const icon = document.getElementById('iconoFiltro');

    if (icon.classList.contains('fa-filter')) {
      icon.classList.remove('fa-filter');
      icon.classList.add('fa-times');
    } else {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-filter');
    }
  }

  filtrarBusqueda(){

    let cult = this.lugares.value.CHURCH_PLACES;
    let mon = this.lugares.value.MONUMENTS;
    let green = this.lugares.value.GREEN_ZONE;
    let enter = this.lugares.value.ENTERTAINMENT;
    let comer = this.lugares.value.COMMERCES;
    let art = this.lugares.value.ART_AND_CULTURE;
    let rest = this.lugares.value.RESTAURANT;

    let bool = false;
    for(let x = 0; x < this.province.length; x++){
      if(this.province[x].name === this.searchForm.get('provinces').value){
        bool = true;
        this.searchForm.value.province = this.province[x].uid;
        break;
      }
    }
    let prov = '';

    if(bool){
      prov = this.searchForm.value.provinces;
    }

    this.placeService.getPlacesByFilterSearch(this.posicionactual, this.gridsize, this.valueReview,
      cult, mon, green, enter, comer, art, rest, prov).subscribe(res => {
      if(res['places'].length == 0){
        if (this.posicionactual > 0) {
          this.posicionactual = this.posicionactual - this.registresPerPage;
          if (this.posicionactual < 0) { this.posicionactual = 0};
          this.filtrarBusqueda();
        } else {
        this.places = [];
        this.totalPlaces = 0;
        }
      } else {
        this.places = res['places'];
        this.totalPlaces = res['page'].total;
      }
      /*this.places = res['places'];
      this.totalPlaces = this.places.length;*/
      document.getElementById('containerPlaces').classList.add('active');
      document.getElementById('cerrarTarFilter1').classList.add('active');
      //this.filterbaropen = true;
    }, (err)=> {
      Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo', })
      //this.loading = false;
    });
  }

  cambiarPagina( pagina: number ){
    pagina = (pagina < 0 ? 0 : pagina);
    this.posicionactual = ((pagina - 1) * this.registresPerPage >=0 ? (pagina - 1) * this.registresPerPage : 0);
    this.filtrarBusqueda();
  }

  cerrarResultFilters(){
    this.places = [];
    this.totalPlaces = 0;
    document.getElementById('cerrarTarFilter1').classList.remove('active');
    document.getElementById('containerPlaces').classList.remove('active');
  }

  loadPlaces(){

    this.townservice.cargarAllPueblos()
    .subscribe( res => {
      this.towns = res['towns'];
      this.placeService.getAllPlaces().subscribe(res=>{


        res['places'].forEach(element => {
          if(element.status=='Activo'){
            this.towns.push(element);
          }


        });

        this.filteredOptions = this.filterProvince.valueChanges.pipe(
          startWith(''),
          map(value => this.filtro()),
        );

      });




     // this.cargarPueblos();
    });

  }

  filtro(): any[] {


     return this.towns.filter(option => option?.name.toLowerCase().includes(this.textoInput.toLowerCase()));

  }

  pruebaTarjetaZoomonChange(evt:any,coor,esLugar,uid){
    this.cardInfo.mostrarPuebloCard(uid);
    var checkExist = setInterval(() => {
      if (document.querySelector("#playPueblo")) {
         document.getElementById("playPueblo").click()
         clearInterval(checkExist);
      }
    }, 100);

  }



  zoomIn(coor,esLugar){

    if(esLugar!=null){
      this.mapservice.zoomInMarker(esLugar.location);
    }else{

      this.mapservice.zoomInMarker(coor);
    }
  }

  zoomInEnter(evt:any,coor,esLugar,uid){
    if(evt.source.selected){


      if(esLugar!=null){
        this.mapservice.zoomInMarker(esLugar.location);
      }else{

        this.mapservice.zoomInMarker(coor);
      }


    }

  }

}




