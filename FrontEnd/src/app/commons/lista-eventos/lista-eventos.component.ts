import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { PuebloService } from 'src/app/services/pueblo.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CardinfoComponent } from '../cardinfo/cardinfo.component';

@Component({
  selector: 'app-lista-eventos',
  templateUrl: './lista-eventos.component.html',
  styleUrls: ['./lista-eventos.component.css']
})
export class ListaEventosComponent implements OnInit {

  public observer;
  public cerdaId = document.getElementById("exEventos");
  public todosEventos = [];

  public dir= environment.picturesDir;

  constructor(private puebloService: PuebloService,
              private cardInfo: CardinfoComponent,
              private eventService: EventService) { }

  ngOnInit(): void {
  }

  cerrarCard(){
    this.cardInfo.cerrarCard();
  }

  activarEvento(){
    document.getElementById('eventosIdCard').firstElementChild.classList.add('activo');
  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(mutations => {
      this.abrirTarjeta(document.getElementById("exEventos").getAttribute('value'));
    });
    var config = { attributes: true, childList: true, characterData: true };
    this.cerdaId = document.getElementById("exEventos");
    this.observer.observe(this.cerdaId, config);
  }

  abrirTarjeta(uid){

    this.todosEventos = [];
    //let idEventos = document.getElementById("exEventos").getAttribute('value');

    let eventoID = document.getElementById("exEventosUno").getAttribute('value');

    this.puebloService.cargarPueblo(uid).subscribe((res:any) => {

      if(res['towns'].events.length > 0){

        if(eventoID != ""){
          this.eventService.getEvent(eventoID)
              .subscribe( (ress:any) => {


                this.todosEventos.push(ress['events']);

              }, (err) => {
          });
        }

          for(let ii=0;ii<res['towns'].events.length;ii++){
              this.eventService.getEvent(res['towns'].events[ii])
              .subscribe( (ress:any) => {


                if(ress['events'].uid != eventoID){
                  this.todosEventos.push(ress['events']);
                }

                if(ii+1==res['towns'].events.length && eventoID!=""){
                  this.activarEvento();
                }

              }, (err) => {
              });
            }

      }
      
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
      //console.warn('error:', err);
    });

    /*document.getElementById("tarjEventos").innerHTML = "Prueba";
    document.getElementById('cerrarTarLug').classList.add('active');
    document.getElementById('tarLug').classList.add('active');

    document.getElementById('tarjEventos').classList.add('Activo');
    document.getElementById('tarjPueblo').classList.remove('Activo');*/
  }

}
