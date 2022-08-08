import { Component, OnInit, ViewChild, Inject, ElementRef, AfterViewInit, NgZone, OnChanges } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StripeService } from 'src/app/services/stripe.service';
import { PlaceService } from 'src/app/services/place.service';
import Swal from 'sweetalert2';
import { remove } from 'ol/array';

@Component({
    selector: 'app-places',
    templateUrl: './pagoslugar.component.html',
    styleUrls: ['./pagoslugar.component.scss']
  })
  export class PagoslugarComponent implements AfterViewInit {
      
    @ViewChild('cardInfo') cardInfo: ElementRef;
    cardError: string;
    card: any;
    dateError: string;
    tipo: string;
    pago: string;
    lugar: string;
    vari: boolean = false;
    mensualidad: boolean = false;
    public loading: boolean= true;


    constructor(private NgZone: NgZone, 
                private StripeService : StripeService,
                private UserService: UserService,
                private PlaceService: PlaceService,
                private router: Router,
                private rut: ActivatedRoute
                ){}

    ngAfterViewInit(): void {
      if(elements._elements.length == 0){
      this.card = elements.create('card');
      }
      else{
        this.card = elements.getElement('card');
      }
    this.card.mount(this.cardInfo.nativeElement);
    this.card.addEventListener('change', this.onChange.bind(this));
    this.loading=false;    

      this.PlaceService.getPlace(this.rut.snapshot.params.tipo)
          .subscribe( (res:any) => {
            if(res.ok){
              if(res.places.premium){
                this.pago = "45€ | Tarifa premium";
              }
              else{
                this.pago = "30€ | Tarfia estandar";
              }
            }
          });           
          
          var fechas;

          this.UserService.getUser(this.UserService.uid)
          .subscribe ((res: any) => {
            var ayuda = res['users']['bills'][res['users']['bills'].length-1];
            fechas = ayuda.split(" ");

            var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();    
                var today1 = dd + '/' + mm + '/' + yyyy;

            if(today1 < fechas[3]){
              this.mensualidad= false;
            }
            else{ 
              this.mensualidad= true;
               
            }
        });

      this.lugar = this.rut.snapshot.params.tipo;
    }

    volver(){
      this.router.navigateByUrl("commerce/comercios");
    }

    onChange({error}){
      if(error){
        this.NgZone.run(()=> this.cardError = error.message);
      }else{
        this.NgZone.run(()=> this.cardError = null);
      }
    }

    async onClick(){
      this.loading=true;
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

          info['cantidad']= 45;
          info['factura']= myFormattedDate;
          info['premium']= "true";
                  
          this.PlaceService.payLugar(this.lugar, info)
          .subscribe( (res:any) => {
            if(res.ok){
              if(this.mensualidad){


                this.PlaceService.acceptPlace(this.lugar)
                .subscribe((res:any) =>{
                  if(res.ok){
                    
                  }
                  else{
                  }
                })

                Swal.fire({
                  title: 'Pago realizado con éxito', text: `El lugar se ha activado correctamente`, icon: 'success',
                  allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
                }).then((result) => {
                   if (result.value) {
                     this.router.navigateByUrl('/commerce/comercios');
                  }
               });
               
              }
              else{
                Swal.fire({icon: 'warning', title: 'Suscripción mensual', text: 'El pago se realizó correctamente pero debes tener la suscripción al corriente de pagos para poder activar el comercio',})
                .then((result) => {
                if (result.value) {
                  this.router.navigateByUrl('/commerce/comercios');
               } });
              }
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
  }