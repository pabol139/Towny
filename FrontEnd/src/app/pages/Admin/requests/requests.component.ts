import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { Place } from 'src/app/models/place.model';
import { MessageService } from 'src/app/services/message.service';
import { PlaceService } from 'src/app/services/place.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';

import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';


import Swal from 'sweetalert2';

import {
  Action,
  ButtonEvent,
  ButtonType,
  Image,
  ImageModalEvent,
  ModalGalleryService,
  ModalGalleryRef,
  ModalGalleryConfig,
  ModalLibConfig
} from '@ks89/angular-modal-gallery';
import { DomSanitizer } from '@angular/platform-browser';
import { textHeights } from 'ol/render/canvas';
import { PuebloService } from '../../../services/pueblo.service';
@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  [x: string]: any;

  public loading = true;
  //public form:any;
  public form =
    {
        "name": '',
        "email": '',
        "texto":'',
        "username":''
    };
  public totalplaces = 0;
  public actual_position = 0;
  public records_per_page = environment.records_per_page;


  private ultimaBusqueda = '';
  public listaLugares: Place[] = [];
  public placedel: Place[] = [];
  public listaLugaresFilt: Place[] = [];
  public listaTodosLugares: Place[] = [];

  displayedColumns: string[] = ['select','name','town',/*'location','number',*/'description','pictures',/*'web',*/'status', 'actions'];
  dataSource = new MatTableDataSource([]);

  data = Object.values(this.listaLugaresFilt);

  selection = new SelectionModel(true, []);

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
      if (this.isAllSelected()) {
        this.selection.clear();
        return;
      }

      this.selection.select(...this.dataSource.data);
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?): string {
      if (!row) {
        return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

  constructor( private placeservice: PlaceService,
    private userservice: UserService,
    public MessageService: MessageService,
    private domSanitizer: DomSanitizer,
    private puebloservice: PuebloService,
    private modalGalleryService: ModalGalleryService,
    public dialog: MatDialog) {
  }

@ViewChild(MatSort) sort: MatSort;
@ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;

openDetails(uid: string){

  this.placeservice.getPlace(uid).subscribe((res:any) => {

    const place = res['places']

    this.puebloservice.cargarPueblo(place.town).subscribe((res:any) => {

      const lugar = res['towns']


        const user =  this.userservice

        this.dialog.open(RequestDetails, {
          data: {
            place,
            lugar,
            user,
            service: this,
          },
        });
    });
    
  }, (err) => {
    Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
    //console.warn('error:', err);
    this.loading = false;
  });
 
}


  ngOnInit(): void {

    this.dataSource.paginator = this.paginator;
    this.paginator._intl.itemsPerPageLabel = 'Items por página';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página Anterior';

    this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const start = page * pageSize + 1;
      let end = (page + 1) * pageSize;

      if(end > length)
        end = length


      return `${start} - ${end} de ${length}`;
    };

    this.dataSource.sort = this.sort;


    this.getPlaces(this.ultimaBusqueda);

  }

  getPlaces( textoBuscar: string ) {
    this.ultimaBusqueda = textoBuscar;
    this.loading = true;
    this.placeservice.getPlaces(this.actual_position, textoBuscar )
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

            this.totalplaces = 0;
            this.listaLugaresFilt= [];
            this.dataSource = new MatTableDataSource(this.listaLugaresFilt)

          }
        } else {

          this.listaLugaresFilt= [];
          this.listaLugares = res['places'];
          this.listaTodosLugares = res['allplaces'];

          for (let i = 0; i < this.listaTodosLugares.length; i++) {
            if(this.listaTodosLugares[i]['status']=='En revisión'){
              this.listaLugaresFilt.push(this.listaTodosLugares[i]);

              this.totalplaces++;

            }

          }

            this.dataSource = new MatTableDataSource(this.listaLugaresFilt);
            this.dataSource.sort = this.sort;

            this.dataSource.sortingDataAccessor = (item, property) => {
              switch (property) {
                 default:
                  if (typeof item[property] === 'string') {
                    return item[property].normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase('en-US');
                  }
                  return item[property];
              }
            };

            this.dataSource.paginator = this.paginator;

          this.data = Object.values(this.listaLugaresFilt);

        }
        this.loading = false;
      }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        //console.warn('error:', err);
        this.loading = false;
      });
  }

  changePage( page: number ){
    page = (page < 0 ? 0 : page);
    this.actual_position = ((page - 1) * this.records_per_page >=0 ? (page - 1) * this.records_per_page : 0);
    this.getPlaces(this.ultimaBusqueda);
  }

  denyPlace( uid: string, name: string) {


    // Comprobar que no me borro a mi mismo
   /* if (uid === this.placeservice.uid) {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No puedes eliminar tu propio usuario',});
      return;
    }*/
    // Solo los admin pueden borrar lugares
    if (this.userservice.rol !== 'ROL_ADMIN') {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No tienes permisos para realizar esta acción',});
      return;
    }

    Swal.fire({
      title: 'Rechazar solicitud',
      text: `Al rechazar esta solicitud, se enviará el motivo del rechazo del lugar a su usuario. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar',
      input:'text',
      inputPlaceholder: "Motivo de eliminación"
    }).then((result) => {
          if (result.value) {

            this.placeservice.denyPlace(uid, result.value)
            .subscribe( resp => {
              this.totalplaces = 0;
              this.getPlaces(this.ultimaBusqueda);
            }
            ,(err) =>{
              Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
            })
          }
      });
  }



  acceptPlace( uid: string, name: string) {

    // Solo los admin pueden borrar lugares
    if (this.userservice.rol !== 'ROL_ADMIN') {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No tienes permisos para realizar esta acción',});
      return;
    }

    Swal.fire({
      title: 'Aceptar',
      text: `Al aceptar esta solicitud, este lugar se publicará en la web. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, aceptar'
    }).then((result) => {
          if (result.value) {
            this.placeservice.acceptPlace(uid)
              .subscribe( resp => {
                this.totalplaces = 0;
                this.getPlaces(this.ultimaBusqueda);
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }


  loadPictures(id:any ){


    this.placeservice.getPlace(id).subscribe((res:any) =>{

      if(res.ok){
        var place = res['places'];
        var imagenesList= place['pictures'];
        var images:Image[]=[];

        for (let index = 0; index < imagenesList.length; index++) {
          const element = imagenesList[index];
          var namefilenew= this.domSanitizer.bypassSecurityTrustResourceUrl( environment.picturesDir+'/fotoplace/'+element);
        images.push(new Image(index,{img:namefilenew}));

        }

        const dialogRef: ModalGalleryRef = this.modalGalleryService.open({
          id: 22,
          images: images,
          currentImage: images[0],
          libConfig: {
            currentImageConfig: {
              downloadable: true,
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
}

@Component({
  selector: 'request-details',
  templateUrl: 'request-details.html',
  styleUrls: ['../users/users.component.css']

})
export class RequestDetails {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

}
