import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Travel } from '../../../models/travel.model';
import { TravelService } from '../../../services/travel.service';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user.service';
import {PaginationComponent} from '../../../commons/pagination/pagination.component'
import { Place } from 'src/app/models/place.model';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl } from '@angular/forms';
import { PlaceService } from 'src/app/services/place.service';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {MatPaginator} from '@angular/material/paginator';
import { DecimalPipe } from '@angular/common';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {SelectionModel} from '@angular/cdk/collections';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
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

@Component({
  selector: 'app-travels',
  templateUrl: './travels.component.html',
  styleUrls: ['./travels.component.css']
})
export class TravelsComponent implements OnInit {

    // Control de paginación
    public totalregistros: number = 0;
    public registroactual: number = 0;
    public registrosporpagina: number = environment.records_per_page;
    // Control del loading
    public loading = false;
    // Cursos lsitado
    public listaRegistros: Travel[] = [];
    public places: Place[] = [];
    public filterPlace = new FormControl();
    public filteredOptions: Observable<Place[]>;
    // Ultima búsqueda
    public ultimaBusqueda = '';

    public searchForm = this.fb.group({
      text: [''],
      place: ['']
    });
    public subs$: Subscription;



    public listaTodasRutas: Travel[] = [];

    displayedColumns: string[] = ['select','name','description', 'places','images', 'user', 'actions'];
    dataSource = new MatTableDataSource([]);

    selection = new SelectionModel(true, []);



/* SELECCION MULTIPLE */


logSelection() {
}


/** Whether the number of selected elements matches the total number of rows. */

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



    constructor(private travelService: TravelService,
        private usuarioService: UserService,
        private fb: FormBuilder,
        private placeservice: PlaceService,
        private domSanitizer: DomSanitizer,
        private modalGalleryService: ModalGalleryService,
        public dialog: MatDialog) {
    }


    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;


    openDetails(uid: string){


      this.travelService.cargarTravel(uid).subscribe((res:any) => {

        const travel = res['travels']


        this.dialog.open(TravelDetails, {
          data: {
            travel,
            service: this,
          },
        });;

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


        this.getPlaces();
        this.cargarTravels();
        this.subs$ = this.searchForm.valueChanges
            .pipe(debounceTime(500),
                  distinctUntilChanged())
            .subscribe( event => {
              this.cargarTravels();
            });
    }

    borrar() {
      this.searchForm.get('text').setValue('');
      this.searchForm.get('place').setValue('');
    }

    private filtro(): Place[] {
      //const filterValue = value.province.toLowerCase();
      return this.places.filter(option => option.name.toLowerCase().includes(this.searchForm.value.place.toLowerCase()));
    }

    getPlaces() {
      // cargamos todos los cursos
      this.placeservice.getAllPlaces()
        .subscribe( res => {
          this.places = res['places'];
          this.filteredOptions = this.filterPlace.valueChanges.pipe(
            startWith(''),
            map(value => this.filtro()),
          );
        });
    }

    cargarTravels() {
      const text = this.searchForm.get('text').value || '';
      let bool = false;
      for(let x = 0; x < this.places.length; x++){
        if(this.places[x].name === this.searchForm.get('place').value){
          bool = true;
          this.searchForm.value.place = this.places[x].uid;
          break;
        }
      }
      if(this.searchForm.get('place').value.length > 0 && !bool) { return; }
      let placeSearch = '';
      if(bool){
        placeSearch = this.searchForm.value.place;
      }
      this.loading = true;

      this.travelService.cargarTravels(this.registroactual, text, placeSearch)
        .subscribe( res => {
          if (res['travels'].length === 0) {
            if (this.registroactual > 0) {
              this.registroactual -= this.registrosporpagina;
              if (this.registroactual < 0) { this.registroactual = 0};
              this.cargarTravels();
            } else {
              this.listaRegistros = [];
              this.listaTodasRutas = [];
              this.dataSource = new MatTableDataSource(this.listaTodasRutas);
              //this.dataSource = new MatTableDataSource(this.listaRegistros);
              this.totalregistros = 0;
            }
          } else {
            this.listaRegistros = res['travels'];
            this.listaTodasRutas = res['alltravels'];
            this.dataSource = new MatTableDataSource(this.listaTodasRutas);
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
            this.totalregistros = res['page'].total;
          }
          this.loading = false;
        });

    }


    cambiarPagina( pagina: number) {
        pagina = (pagina < 0 ? 0 : pagina);
        this.registroactual = ((pagina - 1) * this.registrosporpagina >=0 ? (pagina - 1) * this.registrosporpagina : 0);
        this.cargarTravels();
    }

    deleteTravel( uid: any, name: string) {
        Swal.fire({
          title: 'Eliminar ruta',
          text: `Al eliminar la ruta ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, borrar'
        }).then((result) => {
              if (result.value) {
                this.travelService.eliminarTravel(uid)
                  .subscribe( resp => {
                    this.cargarTravels();
                  }
                  ,(err) =>{
                    Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
                  })
              }
          });
      }

      confirmMultiDelete( str: any) {
        Swal.fire({
          title: 'Eliminar rutas',
          text: `¿Estás seguro de que quieres eliminar las rutas seleccionadas?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, borrar'
        }).then((result) => {
              if (result.value) {
                this.multiDeleteTravel(str);
              }
          });
      }

      multiDeleteTravel(str:any){
        if(!str._selected){
          return;
        }
        if(str._selected.length == 0){
          return;
        }
        if(str._selected.length > 0){
          for(let i = 0; i < str._selected.length;i++){
            this.travelService.eliminarTravel(str._selected[i].uid)
                  .subscribe( resp => {
                    if(i == str._selected.length - 1){
                      Swal.fire({
                        title: 'Viajes eliminados', text: `Has eliminado los viajes con éxito`, icon: 'success',
                        allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
                      });
                    }
                    this.cargarTravels();
                    this.selection.clear()

                  }
                  ,(err) =>{
                    Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
                  })
          }
        }

      }

      loadPictures(id:any ){


        this.travelService.cargarTravel(id).subscribe((res:any) =>{

          if(res.ok){
            var town = res['travels'];
            var imagenesList= town['pictures'];
            var images:Image[]=[];

            for (let index = 0; index < imagenesList.length; index++) {
              const element = imagenesList[index];
              var namefilenew= this.domSanitizer.bypassSecurityTrustResourceUrl( environment.picturesDir+'/fototravel/'+element);
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
  selector: 'travel-details',
  templateUrl: 'travel-details.html',
  styleUrls: ['../users/users.component.css']

})
export class TravelDetails {

  constructor(@Inject(MAT_DIALOG_DATA) public data, private userservice: TravelService) {}

}
