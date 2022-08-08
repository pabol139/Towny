import { Component, OnInit } from '@angular/core';
import { PlaceService } from 'src/app/services/place.service';
import { UserService } from 'src/app/services/user.service';
import { ReviewService } from 'src/app/services/review.service';
import { Review } from 'src/app/models/review.model';
import { environment } from 'src/environments/environment';
import { Place } from 'src/app/models/place.model';
import * as CanvasJS from './canvasjs.min';
import Swal from 'sweetalert2';
import { ReviewsComponent } from '../../Admin/reviews/reviews.component';
import { FormBuilder, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-dashboard-commerce',
  templateUrl: './dashboard-commerce.component.html',
  styleUrls: ['./dashboard-commerce.component.css']
})
export class DashboardCommerceComponent implements OnInit {

  public loading = true;

  public totallugares = 0;
  public totalvisitas= 0;
  public notamedia=0;
  public totalvaloraciones=0;
  public actual_position = 0;
  public records_per_page = environment.records_per_page;

  private ultimaBusqueda = '';
  public listaLugares: Place[] = [];
  public username = localStorage.getItem("name");


  data = Object.values(this.listaLugares);
  public provPerTown:any[]=['nulo'];

  public filterPlace = new FormControl();
  public filteredOptions: Observable<Place[]>;
  public places: Place [] = [];

  public placesOrder: Place [] = [];

  public searchForm = this.fb.group({
    place: ['']
  });
  public subs$: Subscription;

  public meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  public order = 'MEDIA_VAL_HIGH';
  public myChart;

  constructor(private placeservice: PlaceService,
              private userservice: UserService,
              private fb: FormBuilder,
              private reviewservice: ReviewService) {
  }

  ngOnInit(): void {
    this.getPlacesAll();
    this.getPlaces(this.ultimaBusqueda);
    this.calcularNota();
    this.getPlacesByNota(this.order)
    this.subs$ = this.searchForm.valueChanges
      .subscribe( event => {
        this.getPlace();
      });
  }

  getPlacesByNota(ord: any){
    //this.waiting = true;
    //this.order = ord;
    this.placeservice.getPlacesByCommerce(ord)
      .subscribe( res => {
        this.placesOrder = res['places'];
        if(ord == 'MORE_REVWS'){
          this.placesOrder = this.bubbleSortDesc(this.placesOrder);
        } else if(ord == 'LESS_REVWS'){
          this.placesOrder = this.bubbleSortAsc(this.placesOrder);
        }

        this.order = ord;
        //this.waiting = false
        return;
      });
  }

  getPlace(){
    let n = 0;
    let bool = false;
    for(let x = 0; x < this.places.length; x++){
      if(this.places[x].name === this.searchForm.get('place').value){
        bool = true;
        this.searchForm.value.place = this.places[x].uid;
        n = x;
        break;
      }
    }

    let placeSearch = '';
    if(bool){
      placeSearch = this.searchForm.value.place;

      if(this.myChart){
        this.myChart.destroy();
      }

        const ch1 = <HTMLCanvasElement> document.getElementById('myChart');

          const ctx = ch1.getContext('2d');
          this.myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: [this.meses[0], this.meses[1], this.meses[2], this.meses[3], this.meses[4],
                       this.meses[5], this.meses[6], this.meses[7], this.meses[8], this.meses[9],
                       this.meses[10], this.meses[11]],
              datasets: [{
                  label: 'Visitas por mes',
                  data: [
                         this.listaLugares[n].visits[0],
                         this.listaLugares[n].visits[1],
                         this.listaLugares[n].visits[2],
                         this.listaLugares[n].visits[3],
                         this.listaLugares[n].visits[4],
                         this.listaLugares[n].visits[5],
                         this.listaLugares[n].visits[6],
                         this.listaLugares[n].visits[7],
                         this.listaLugares[n].visits[8],
                         this.listaLugares[n].visits[9],
                         this.listaLugares[n].visits[10],
                         this.listaLugares[n].visits[11]
                        ],
                  borderRadius: 15,
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)'
                  ],
                  borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)'
                  ],
                  borderWidth: 1
              }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
      });
    }

  }

  private filtro(): Place[] {
    return this.places.filter(option => option.name.toLowerCase().includes(this.searchForm.value.place.toLowerCase()));
  }

  getPlacesAll() {
    // cargamos todos los cursos
    this.placeservice.getPlacesByCommerce()
      .subscribe( res => {
        this.places = res['places'];
        this.filteredOptions = this.filterPlace.valueChanges.pipe(
          startWith(''),
          map(value => this.filtro()),
        );
      });
  }

  getPlaces( textoBuscar: string ) {
    this.ultimaBusqueda = textoBuscar;
    this.loading = true;
    this.placeservice.getPlaces( this.actual_position, textoBuscar)
      .subscribe( (res:any) => {
        // Lo que nos llega lo asignamos a lista usuarios para renderizar la tabla
        // Comprobamos si estamos en un apágina vacia, si es así entonces retrocedemos una página si se puede

        if (res['places'].length === 0) {
          if (this.actual_position > 0) {
            this.actual_position = this.actual_position - this.records_per_page;
            if (this.actual_position < 0) { this.actual_position = 0};
            this.getPlaces(this.ultimaBusqueda);
          } else {
            this.listaLugares = [];
            this.totallugares = 0;
          }
          document.getElementById('divChart').style.display = 'none';
        } else {
          this.listaLugares = res['places'];
          this.data = Object.values(this.listaLugares);
          this.totallugares = res['places'].length;
          for(let i = 0; i < this.listaLugares.length; i++){
            for(let j = 0; j < this.listaLugares[i].visits.length; j++){
              this.totalvisitas += this.listaLugares[i].visits[j];
            }
          }
          var counter=0;
        for (let index = 0; index < this.listaLugares.length; index++) {

          const element = this.listaLugares[index];
          let provActual= element['visits']['name'];


          if(this.provPerTown.includes(provActual)){
              counter++;
          }
          else{
            counter++;
            this.provPerTown.push(provActual);
          }
          if(this.listaLugares[index+1]!=null && this.listaLugares[index+1]['visits']['name']!=provActual){
            this.provPerTown.push(counter);
            counter=0;
          }else if (this.listaLugares[index+1]==null){
            this.provPerTown.push(counter);
          }
      }

        if(this.totallugares > 0){
          this.searchForm.get('place').setValue(this.listaLugares[0].name);
          if(this.myChart){
            this.myChart.destroy();
          }

          const ch1 = <HTMLCanvasElement> document.getElementById('myChart');
          if(!document.getElementById('myChart')) { return; }
          const ctx = ch1.getContext('2d');
          if(this.myChart){
            this.myChart.destroy();
          }
          this.myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: [this.meses[0], this.meses[1], this.meses[2], this.meses[3], this.meses[4],
                       this.meses[5], this.meses[6], this.meses[7], this.meses[8], this.meses[9],
                       this.meses[10], this.meses[11]],
              datasets: [{
                  label: 'Visitas por mes',
                  data: [
                         this.listaLugares[0].visits[0],
                         this.listaLugares[0].visits[1],
                         this.listaLugares[0].visits[2],
                         this.listaLugares[0].visits[3],
                         this.listaLugares[0].visits[4],
                         this.listaLugares[0].visits[5],
                         this.listaLugares[0].visits[6],
                         this.listaLugares[0].visits[7],
                         this.listaLugares[0].visits[8],
                         this.listaLugares[0].visits[9],
                         this.listaLugares[0].visits[10],
                         this.listaLugares[0].visits[11]
                        ],
                  borderRadius: 15,
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)'
                  ],
                  borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)'
                  ],
                  borderWidth: 1
              }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
      });
        }
      }
        this.loading = false;
      }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        this.loading = false;
      });
  }

  calcularNota(){
    this.reviewservice.getAllReviewsbyCommerce(this.userservice.uid,'','')
    .subscribe( (res:any) => {
      // Lo que nos llega lo asignamos a lista usuarios para renderizar la tabla
      // Comprobamos si estamos en un apágina vacia, si es así entonces retrocedemos una página si se puede
      let valors= res['revws'];
      let numrevws = res['numrevs'];
      this.notamedia = res['med_rvw'];

      this.totalvaloraciones=numrevws;

    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
      this.loading = false;
    });
  }

  bubbleSortDesc(arrayPlace: Place []): Place []{
    var arr = arrayPlace;
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < (arr.length - i - 1); j++) {
              if(arr[j].reviews.length < arr[j+1].reviews.length) {
                      var tmp = arr[j];
                      arr[j] = arr[j+1];
                      arr[j+1] = tmp;
        }
      }
    }
    var err = [];
    if(arr.length > 5){
      for(let i = 0; i < 5; i++){ err.push(arr[i]); }
    } else {
      for(let i = 0; i < arr.length; i++){ err.push(arr[i]); }
    }
    return err
  }

  bubbleSortAsc(arrayPlace: Place []): Place []{
    var arr = arrayPlace;
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < (arr.length - i - 1); j++) {
              if(arr[j].reviews.length > arr[j+1].reviews.length) {
                      var tmp = arr[j];
                      arr[j] = arr[j+1];
                      arr[j+1] = tmp;
        }
      }
    }
    var err = [];
    if(arr.length > 5){
      for(let i = 0; i < 5; i++){ err.push(arr[i]); }
    } else {
      for(let i = 0; i < arr.length; i++){ err.push(arr[i]); }
    }
    return err
  }

}
