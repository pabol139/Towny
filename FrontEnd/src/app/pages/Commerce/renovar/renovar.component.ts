import { Component, OnInit, ViewChild, Inject, ElementRef, AfterViewInit, NgZone, OnChanges } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StripeService } from 'src/app/services/stripe.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-places',
    templateUrl: './renovar.component.html',
    styleUrls: ['./renovar.component.scss']
  })
  export class RenovarComponent implements AfterViewInit {
      
    @ViewChild('cardInfo') cardInfo: ElementRef;
    @ViewChild('fech') el:ElementRef;
    @ViewChild('fech1') el1:ElementRef;
    fechainicio: any;
    fechafin: string;
    cardError: string;
    card: any;
    dateError: string;
    tipo: string;
    pago: string;
    public loading: boolean= true;

    constructor(private NgZone: NgZone, 
                private StripeService : StripeService,
                private UserService: UserService,
                private router: Router,
                private rut: ActivatedRoute
                ){}

    ngAfterViewInit(): void {
      var fechas: string;
      this.dateError="";
      this.loading=false;    
      
      if(elements._elements.length == 0){
        this.card = elements.create('card');
        }
        else{
          this.card = elements.getElement('card');
        }
      this.card.mount(this.cardInfo.nativeElement);
      this.card.addEventListener('change', this.onChange.bind(this));
      if(this.rut.snapshot.params.finplanactual.length > 11){
        this.pago= "modelo";
        if(this.rut.snapshot.params.finplanactual[this.rut.snapshot.params.finplanactual] == 'o'){
        this.tipo= "35€ - pago modelo estandar";          
        }
        else{
        this.tipo= "45€ - pago modelo premium";

        }
        this.el.nativeElement.remove();
        this.el1.nativeElement.remove();
      }
      else if(this.rut.snapshot.params.finplanactual.length == 0){        
        this.pago= "mal";
      }
      else{
        if(this.rut.snapshot.params.finplanactual == null){
          fechas= "01/01/2000";
        }
        else{
          fechas= this.rut.snapshot.params.finplanactual.split("/");

        }
        this.pago= "mes";
        this.tipo= "20€ - pago mensualidad";
      }
        var nueva= fechas[2]+"-"+fechas[1]+"-"+fechas[0];
        if(new Date(nueva) < new Date() ){
          this.fechainicio=new Date().toISOString().slice(0, 10);
          const ayuda2 = new Date(this.fechainicio);
          ayuda2.setMonth(ayuda2.getMonth()+1);
          const ayuda3 = ayuda2.toISOString().slice(0, 10);
          const ay= ayuda3.split("-");
          const imp=ay[2]+"/"+ay[1]+"/"+ay[0];
          this.fechafin=imp;
        }
        else{
          var fin;
          if(this.rut.snapshot.params.finplanactual.toString() != "undefined"){
            var fe= this.rut.snapshot.params.finplanactual.toString().split("/");
            fin= fe[2]+"-"+fe[1]+"-"+fe[0];
          }
          else{
            var date = new Date();
            fin= date.getFullYear()+ '-' + String(date.getMonth()+1).padStart(2, '0') + '-' +String(date.getDate() +1).padStart(2, '0');
          }
          this.fechainicio= fin;
          const ayuda = new Date(this.fechainicio);
          ayuda.setMonth(ayuda.getMonth()+1);
          const ayuda1 = ayuda.toISOString().slice(0, 10);
          const ay= ayuda1.split("-");
          const imp=ay[2]+"/"+ay[1]+"/"+ay[0];
          this.fechafin=imp;
        }
    }

    onChange({error}){
      if(error){
        this.NgZone.run(()=> this.cardError = error.message);
      }else{
        this.NgZone.run(()=> this.cardError = null);
      }
    }

    onChange2(nuevafecha){
      var fefin2 = (<HTMLInputElement>document.getElementById("FechaInicio")).value;
      var dates= new Date(fefin2);  
      if(dates<new Date()){
        this.NgZone.run(()=>this.dateError = "La fecha debe ser superior al dia de hoy");  
      }
      else{
        this.dateError="";
      }
      const fechan = (nuevafecha.target.value);
      const ayuda4 = new Date(fechan);
      ayuda4.setMonth(ayuda4.getMonth()+1);
      const ayuda5 = ayuda4.toISOString().slice(0, 10);
      const ay= ayuda5.split("-");
      const imp=ay[2]+"/"+ay[1]+"/"+ay[0];
      this.fechafin=imp;
    }

    async onClick(){
      this.loading=true;
      if(this.dateError==""){
        const {token, error} = await stripe.createToken(this.card);
        if (token){
          const response = await this.StripeService.charge(100, token.id);
          const info = new Object();
          var date = new Date();
          var day = date.getDate();
          var monthIndex = date.getMonth();
          var year = date.getFullYear();
          var minutes = date.getMinutes();
          var hours = date.getHours();
          var seconds = date.getSeconds();
          var ayuda="";
          var ayuda1="";
          var ayuda2="";
          var ayuda3="";
          var ayuda4="";
          if(monthIndex<9){
            ayuda='0';
          }
          if(day<10){
            ayuda1='0';
          }
          if(minutes<10){
            ayuda2='0';
          }
          if(hours<10){
            ayuda3='0';
          }
          if(seconds<10){
            ayuda4='0';
          }
          var myFormattedDate = ayuda1+""+day+""+ayuda+""+(monthIndex+1)+""+year+""+ayuda2+""+hours+""+ayuda3+""+minutes+""+ayuda4+""+seconds;
          var fefin = (<HTMLInputElement>document.getElementById("FechaInicio")).value;
          var dividir= fefin.split("-");
          var juntar= dividir[2]+"/"+dividir[1]+"/"+dividir[0];

          info['cantidad']=20;
          info['factura']=myFormattedDate;
          info['finicio']=juntar;
          info['ffinal']=this.fechafin;
        
          this.UserService.payFactura(this.UserService.uid, info)
          .subscribe( (res:any) => {
            if(res.ok){
               Swal.fire({
                 title: 'Pago realizado con éxito', text: `El pago se ha realizado correctamente`, icon: 'success',
                 allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
               }).then((result) => {
                  if (result.value) {
                    this.router.navigateByUrl('/commerce/bill');
                 }
              });
            }  
            this.loading=false;
          }, (err) => {
            const errtext = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo.';
            Swal.fire({icon: 'error', title: 'Oops...', text: errtext});
            return;
          });
        }
        else{
          this.NgZone.run(()=> this.cardError = error.message);
        }
      }
      else{
        this.NgZone.run(()=> this.dateError = "La fecha debe ser superior al dia de hoy");
      }
    }
  }