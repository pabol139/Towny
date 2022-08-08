import { Component, OnInit } from '@angular/core';
import { PlaceService } from 'src/app/services/place.service';
import { PuebloService } from 'src/app/services/pueblo.service';
import { ReviewService } from 'src/app/services/review.service';
import { UserService } from 'src/app/services/user.service';
import { Pueblo } from '../../../models/pueblo.model';
import { EChartsOption } from 'echarts';
import * as CanvasJS from './canvasjs.min';
//import CanvasJS from 'canvasjs';

import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';
import FusionCharts from 'fusioncharts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboardAdmin.component.html',
  styleUrls: ['./dashboardAdmin.component.css']
})





export class DashboardAdminComponent implements OnInit {
  public totalUsus: number = 0;
  public totalTown: number = 0;
  public totalPlaces: number = 0;
  public totalMoney: number = 0;
  public totalRev: number = 0;
  public ultimaBusqueda = '';
  public listaRegistros: Pueblo[] = [];
  public listaVisitas: Pueblo[] = [];
  public username = localStorage.getItem("name");
  public provPerTown:any[] =['nulo'];
  public vitsPerTown:any[] =['nulo'];

  public MapaProvincias = ["Albacete","Alava","Alicante","Almeria","Asturias",
  "Avila","Badajoz","Islas Baleares","Barcelona","Vizcaya","Burgos","Cáceres",
  "Cádiz","Cantabria","Castellón","Ceuta","Ciudad Real","Córdoba","Cuenca",
  "Guipúzcoa","Girona","Granada","Guadalajara","Huelva","Huesca","Jaén",
  "La Coruña","La Rioja","Las Palmas","León","Lérida","Lugo","Madrid","Málaga",
  "Melilla","Murcia","Navarra","Orense","Palencia","Pontevedra","Salamanca",
  "Santa Cruz de Tenerife","Segovia","Sevilla","Soria","Tarragona","Teruel",
  "Toledo","Valencia","Valladolid","Zamora","Zaragoza"];
  public jsonStrVisitProv = '[]';

  public select_data = 'TOWNS_BY_VISITS';

  //TOWNS_BY_VISITS

  public dataSource: Object;
  public myChart;

  constructor(private usuarioService: UserService,
              private puebloService:PuebloService,
              private placeService: PlaceService,
              private valoracionService: ReviewService
    ) {

    }


  ngOnInit(): void {

    this.dataSource = {
      "chart": {
      "numbersuffix": " visitas",
      "includevalueinlabels": "1",
      "labelsepchar": ": ",
      "entityFillHoverColor": "#FFF9C4",
      "theme": "fusion"
      },
      "colorrange": {
        "color": [{
          "minvalue": "0",
          "maxvalue": 0,
          "code": "#D0DFA3",
          "displayValue": "< "+0
      }, {
          "minvalue": 0*2,
          "maxvalue": 0*3,
          "code": "#B0BF92",
          "displayValue": 0*2+"-"+0*3
      }, {
          "minvalue": 0*4,
          "maxvalue": 0*5,
          "code": "#91AF64",
          "displayValue": 0*4+"-"+0*5
      }, {
          "minvalue": 0*6,
          "maxvalue": 0,
          "code": "#A9FF8D",
          "displayValue": "> "+0
      }]
    },
    "data": JSON.parse(this.jsonStrVisitProv)

    };

    this.usuarioService.getUsers(0, this.ultimaBusqueda)
      .subscribe((res:any) => {
        this.totalUsus = res['allusers'].length;
      },(err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });
      this.puebloService.cargarPueblos(0, this.ultimaBusqueda)
      .subscribe((res:any) => {
        this.totalTown = res['alltowns'].length;
      },(err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });
      this.puebloService.cargarPueblosPorVisitas()
      .subscribe((res:any) => {
        this.listaVisitas = res['towns'];
      },(err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });
      this.placeService.getPlaces(0, this.ultimaBusqueda)
      .subscribe((res:any) => {
        this.totalPlaces = res['allplaces'].length;
      },(err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });
      this.valoracionService.cargarReviews(0, this.ultimaBusqueda)
      .subscribe((res:any) => {
        this.totalRev = res['allreviews'].length;
      },(err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });

      //cargamos todos los pueblos para el gráfico de barras
      /*this.puebloService.cargarAllPueblos()
      .subscribe((res:any) => {
        this.listaRegistros = res['towns'];
      var counter=0;
      for (let index = 0; index < this.listaRegistros.length; index++) {
        const element = this.listaRegistros[index];
        let provActual= element['province']['name'];


        if(this.provPerTown.includes(provActual)){
            counter++;
        }
        else{

          counter++;
          this.provPerTown.push(provActual);
        }
        if(this.listaRegistros[index+1]!=null && this.listaRegistros[index+1]['province']['name']!=provActual){
          this.provPerTown.push(counter);
          counter=0;
        }else if (this.listaRegistros[index+1]==null){
          this.provPerTown.push(counter);
        }

      }

      const ch1 = <HTMLCanvasElement> document.getElementById('myChart');
      const ctx = ch1.getContext('2d');
      const myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: [this.provPerTown[1], this.provPerTown[3], this.provPerTown[5], this.provPerTown[7], this.provPerTown[9], this.provPerTown[11], this.provPerTown[13], this.provPerTown[15], this.provPerTown[17]],
              datasets: [{
                  label: 'Pueblos',
                  data: [this.provPerTown[2], this.provPerTown[4], this.provPerTown[6], this.provPerTown[8], this.provPerTown[10], this.provPerTown[12], this.provPerTown[14], this.provPerTown[16], this.provPerTown[18]],
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
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
      },(err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });*/

      this.puebloService.cargarAllPueblos()
      .subscribe((res:any) => {
        this.listaRegistros = res['towns'];

      var counter=0;
      var obj = JSON.parse(this.jsonStrVisitProv);

      var maxValue = 0;

      for (let index = 0; index < this.listaRegistros.length; index++) {
        const element = this.listaRegistros[index];
        let provActual= element['province']['name'];
        let visits= element['visits'] || 0;


        if(this.vitsPerTown.includes(provActual)){
          counter=counter+ visits;
        }
        else{

          counter=counter+visits;
          this.vitsPerTown.push(provActual);
        }
        if(this.listaRegistros[index+1]!=null && this.listaRegistros[index+1]['province']['name']!=provActual){
          this.vitsPerTown.push(counter);
          if(counter>maxValue){
            maxValue = counter;
          }
          for(let u=0;u<this.MapaProvincias.length;u++){
            if(this.MapaProvincias[u]==provActual){
              var str = "" + (u+1);
              var pad = "000";
              var ans = pad.substring(0, pad.length - str.length) + str;
              obj.push({"id":ans,"value":counter});
            }
          }
          counter=0;
        }else if (this.listaRegistros[index+1]==null){
          this.vitsPerTown.push(counter);
        }
      }

      this.jsonStrVisitProv = JSON.stringify(obj);

      var ValorMBajo = Math.round(maxValue/7);

      this.dataSource = {
        "chart": {
        "numbersuffix": " visitas",
        "includevalueinlabels": "1",
        "labelsepchar": ": ",
        "entityFillHoverColor": "#FFF9C4",
        "theme": "fusion"
        },
        "colorrange": {
          "color": [{
            "minvalue": "0",
            "maxvalue": ValorMBajo,
            "code": "#D0DFA3",
            "displayValue": "< "+ValorMBajo
        }, {
            "minvalue": ValorMBajo*2,
            "maxvalue": ValorMBajo*3,
            "code": "#B0BF92",
            "displayValue": ValorMBajo*2+"-"+ValorMBajo*3
        }, {
            "minvalue": ValorMBajo*4,
            "maxvalue": ValorMBajo*5,
            "code": "#91AF64",
            "displayValue": ValorMBajo*4+"-"+ValorMBajo*5
        }, {
            "minvalue": ValorMBajo*6,
            "maxvalue": maxValue,
            "code": "#A9FF8D",
            "displayValue": "> "+maxValue
        }]
      },
      "data": JSON.parse(this.jsonStrVisitProv)

      }; // end of this.dataSource

      },(err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });

      this.visitsByTown();
  }

  visitsByTown(){
    this.provPerTown = ['nulo'];
    this.puebloService.cargarAllPueblos()
      .subscribe((res:any) => {
        this.listaRegistros = res['towns'];
      var counter=0;
      for (let index = 0; index < this.listaRegistros.length; index++) {
        const element = this.listaRegistros[index];
        let provActual= element['province']['name'];


        if(this.provPerTown.includes(provActual)){
            counter++;
        }
        else{

          counter++;
          this.provPerTown.push(provActual);
        }
        if(this.listaRegistros[index+1]!=null && this.listaRegistros[index+1]['province']['name']!=provActual){
          this.provPerTown.push(counter);
          counter=0;
        }else if (this.listaRegistros[index+1]==null){
          this.provPerTown.push(counter);
        }

      }
      if(this.myChart){
        this.myChart.destroy();
      }
      const ch1 = <HTMLCanvasElement> document.getElementById('myChart');
      const ctx = ch1.getContext('2d');
      this.myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: [this.provPerTown[1], this.provPerTown[3], this.provPerTown[5], this.provPerTown[7], this.provPerTown[9], this.provPerTown[11], this.provPerTown[13], this.provPerTown[15], this.provPerTown[17]],
              datasets: [{
                  label: 'Pueblos',
                  data: [this.provPerTown[2], this.provPerTown[4], this.provPerTown[6], this.provPerTown[8], this.provPerTown[10], this.provPerTown[12], this.provPerTown[14], this.provPerTown[16], this.provPerTown[18]],
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
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });

      },(err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });
  }

  changeVisits(param: any){
    if(param == 'TOWNS_BY_VISITS') {
      this.totalMoney = 0;
      this.visitsByTown();
    } else if (param == 'TYPE_OF_PLACE'){
      this.totalMoney = 0;
      this.getTypeOfPlace();
    }
     else if (param == 'TYPE_OF_SUBS'){
      this.totalMoney = 0;
      this.getTypeOfSubs();
    } else if (param == 'TYPE_OF_STATE'){
      this.totalMoney = 0;
      this.getTypeOfPlaceByState();
    } else if(param == 'TOTAL_MONEY'){
      this.totalMoney = 0;
      this.getTotalMoney();
    }
  }

  getTotalMoney(){
    if(this.myChart){
      this.myChart.destroy();
    }
    this.totalMoney = 0;
    this.placeService.getAllPlaces().subscribe(res =>{
      let places = res['places'];
      this.usuarioService.getAllUsers().subscribe(res =>{
        let users = res['allusers'];
        for(let i = 0; i < users.length; i++){
          if(users[i].rol == 'ROL_COMMERCE'){
            //console.log('Entro');
            this.totalMoney = this.totalMoney + (users[i].bills.length * 30);
          }
        }
        for(let i = 0; i< places.length; i++){
          if(!places[i].premium){
            this.totalMoney += 30;
          } else {
            this.totalMoney += 45;
          }
        }
        //console.log(this.totalMoney);
      });
    });
  }

  getTypeOfPlaceByState(){
    this.placeService.getAllPlaces().subscribe(res =>{
      //console.log(res);
      let active = 0, rev = 0, desactive = 0, rechazao = 0;
      let places = res['places'];
      for(let i = 0; i< places.length; i++){
        if(places[i].status === 'Activo'){
          active += 1;
        } else if(places[i].status === 'En revisión') {
          rev += 1;
        } else if(places[i].status === 'Desactivado') {
          desactive += 1;
        } else if(places[i].status === 'Rechazado') {
          rechazao += 1;
        }
      }
      if(this.myChart){
        this.myChart.destroy();
      }
      const ch1 = <HTMLCanvasElement> document.getElementById('myChart');
      const ctx = ch1.getContext('2d');
      this.myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ['Activos', 'En revision', 'Desactivado', 'Rechazado'],
              datasets: [{
                  label: 'Suscripiones',
                  data: [active, rev, desactive, rechazao],
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
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
    });
  }

  getTypeOfPlace(){
    this.placeService.getAllPlaces().subscribe(res =>{
      //console.log(res);
      let monum = 0, restaurants = 0, art_and_culture = 0, green_zones = 0, churchplaces = 0, enter = 0, commerces = 0;
      let places = res['places'];
      for(let i = 0; i< places.length; i++){
        if(places[i].type === 'RESTAURANT' && places[i].status === 'Activo'){
          restaurants += 1;
        } else if(places[i].type === 'MONUMENTS' && places[i].status === 'Activo') {
          monum += 1;
        } else if(places[i].type === 'ART_AND_CULTURE' && places[i].status === 'Activo') {
          art_and_culture += 1;
        } else if(places[i].type === 'GREEN_ZONE' && places[i].status === 'Activo') {
          green_zones += 1;
        } else if(places[i].type === 'CHURCH_PLACES' && places[i].status === 'Activo') {
          churchplaces += 1;
        } else if(places[i].type === 'ENTERTAINMENT' && places[i].status === 'Activo') {
          enter += 1;
        } else if(places[i].type === 'COMMERCES' && places[i].status === 'Activo') {
          commerces += 1;
        }
      }
      if(this.myChart){
        this.myChart.destroy();
      }
      const ch1 = <HTMLCanvasElement> document.getElementById('myChart');
      const ctx = ch1.getContext('2d');
      this.myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ['Monumentos', 'Restaurantes', 'Arte y cultura',
                       'Zonas verdes', 'Lugares de culto', 'Entretenimiento', 'Comercios'],
              datasets: [{
                  label: 'Suscripiones',
                  data: [monum, restaurants, art_and_culture, green_zones, churchplaces, enter, commerces],
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
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
    });
  }

  getTypeOfSubs(){
    this.placeService.getAllPlaces().subscribe(res =>{
      //console.log(res);
      let estandarSub = 0;
      let premiumSub = 0;
      let places = res['places'];
      for(let i = 0; i< places.length; i++){
        if(!places[i].premium && places[i].status === 'Activo'){
          estandarSub += 1;
        } else if(places[i].premium && places[i].status === 'Activo') {
          premiumSub += 1;
        }
      }
      if(this.myChart){
        this.myChart.destroy();
      }
      const ch1 = <HTMLCanvasElement> document.getElementById('myChart');
      const ctx = ch1.getContext('2d');
      this.myChart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: ['Estandar', 'Premium'],
              datasets: [{
                  label: 'Suscripiones',
                  data: [estandarSub, premiumSub],
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
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
    });
  }

}


