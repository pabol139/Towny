import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Place } from 'src/app/models/place.model';
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
import { PuebloService } from '../../../services/pueblo.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'app-places',
  templateUrl: './places.component.html',
  styleUrls: ['./places.component.css']
})
export class PlacesComponent implements OnInit {

  public loading = true;

  public totalplaces = 0;
  public actual_position = 0;
  public records_per_page = environment.records_per_page;

  private ultimaBusqueda = '';
  public listaLugares: Place[] = [];
  public listaTodosLugares: Place[] = [];
  public listaLugaresNoPen: Place[] = [];

  displayedColumns: string[] = ['select','name','town','description','pictures','visits','status', 'actions'];
  dataSource = new MatTableDataSource([]);

  data = Object.values(this.listaLugares);

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
    private domSanitizer: DomSanitizer,
    private modalGalleryService: ModalGalleryService,
    private puebloservice: PuebloService,
    public dialog: MatDialog) {
  }

@ViewChild(MatSort) sort: MatSort;
@ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;

private subjectKeyUp = new Subject<any>();

openDetails(uid: string){

  this.placeservice.getPlace(uid).subscribe((res:any) => {

    const place = res['places'];

    this.puebloservice.cargarPueblo(place.town).subscribe((res:any) => {

      const lugar = res['towns'];


        const user =  this.userservice;

        this.dialog.open(PlaceDetails, {
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
    this.subjectKeyUp
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe((d) => {
        this.getPlaces(d);
      });
  }

  onSearch($event: any) {
    const value = $event.target.value;
    this.subjectKeyUp.next(value);
  }

  getPlaces( textoBuscar: string ) {
    this.ultimaBusqueda = textoBuscar;
    this.loading = true;
    this.placeservice.getPlaces( this.actual_position, textoBuscar )
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
            this.listaTodosLugares = [];
            this.dataSource = new MatTableDataSource(this.listaTodosLugares)
            this.totalplaces = 0;
          }
        } else {
          this.listaLugares = res['places'];
          this.listaTodosLugares = res['allplaces'];
          this.dataSource = new MatTableDataSource(this.listaTodosLugares)
          this.dataSource.sort = this.sort
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
          for(let i = 0; i < this.listaTodosLugares.length; i++){
            let n = []; n[0] = 0;
            for(let j = 0; j < this.listaTodosLugares[i].visits.length; j++){
              n[0] += this.listaTodosLugares[i].visits[j];
            }
            this.listaTodosLugares[i].visits = n[0];
          }
          this.data = Object.values(this.listaTodosLugares);

          for (let i = 0; i < this.listaLugares.length; i++) {
            if(this.listaLugares[i]['status']!='Pendiente'){
              this.listaLugaresNoPen.push(this.listaLugares[i]);
              this.totalplaces++;
            }
          }
        }



        this.loading = false;
      }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
        //console.warn('error:', err);
        this.loading = false;
      });
  }


  changePage( page: number ){
    page = (page < 0 ? 0 : page);
    this.actual_position = ((page - 1) * this.records_per_page >=0 ? (page - 1) * this.records_per_page : 0);
    this.getPlaces(this.ultimaBusqueda);
  }

  deletePlace( uid: string, name: string) {
    if (this.userservice.rol !== 'ROL_ADMIN') {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No tienes permisos para realizar esta acción',});
      return;
    }

    Swal.fire({
      title: 'Eliminar lugar',
      text: `Al eliminar el lugar ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.placeservice.deletePlace(uid)
              .subscribe( resp => {
                this.getPlaces(this.ultimaBusqueda);
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  confirmMultiDelete(str:any) {
    if (this.userservice.rol !== 'ROL_ADMIN') {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No tienes permisos para realizar esta acción',});
      return;
    }
    Swal.fire({
      title: 'Eliminar usuarios',
      text: `¿Estás seguro de que quieres eliminar los usuarios seleccionados?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar',
      allowOutsideClick: false
    }).then((result) => {
          if (result.value) {
            this.multiDeletePlace(str);
          }
      });
  }

  multiDeletePlace(str:any){
    if(!str._selected){
      return;
    }
    if(str._selected.length == 0){
      return;
    }
    if(str._selected.length > 0){
      for(let i = 0; i < str._selected.length;i++){
        this.placeservice.deletePlace(str._selected[i].uid)
              .subscribe( resp => {
                if(i == str._selected.length - 1){
                  Swal.fire({
                    title: 'Lugares eliminados', text: `Has eliminado los lugares seleccionados con éxito`, icon: 'success',
                    allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
                  });
                  this.getPlaces(this.ultimaBusqueda);
                  this.selection.clear()
                }
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
              })
      }
    }

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
  selector: 'place-details',
  templateUrl: 'place-details.html',
  styleUrls: ['../users/users.component.css']

})
export class PlaceDetails {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

}
