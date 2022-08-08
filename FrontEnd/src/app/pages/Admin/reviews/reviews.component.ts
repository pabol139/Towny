import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Review } from '../../../models/review.model';
import { ReviewService } from '../../../services/review.service';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user.service';
import {PaginationComponent} from '../../../commons/pagination/pagination.component'
import { FormBuilder, FormControl } from '@angular/forms';
import { Place } from 'src/app/models/place.model';
import { Observable, Subscription } from 'rxjs';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';


import { PlaceService } from 'src/app/services/place.service';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
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
import { use } from 'echarts';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {

    // Control de paginación
    public totalregistros: number = 0;
    public registroactual: number = 0;
    public registrosporpagina: number = environment.records_per_page;
    // Control del loading
    public loading = false;
    // Cursos lsitado
    public listaRegistros: Review[] = [];
    public listaTodosRegistros: Review[] = [];
    public filterPlace = new FormControl();
    public filteredOptions: Observable<Place[]>;

    // Ultima búsqueda
    public ultimaBusqueda = '';

    public searchForm = this.fb.group({
      text: [''],
      place: ['']
    });
    public subs$: Subscription;

    public places: Place[] = [];


    displayedColumns: string[] = ['select','place','comment','review','pictures','like','publicationDate','user', 'actions'];
    dataSource = new MatTableDataSource([]);

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

  constructor(private reviewService: ReviewService,
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


  this.reviewService.cargarReview(uid).subscribe((res:any) => {

    const user = res['revws']


    this.dialog.open(ReviewDetails, {
      data: {
        user,
        service: this,
      },
    });;

  }, (err) => {
    Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
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
    //this.cargarReviews(this.ultimaBusqueda);
    this.cargarReviews();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.cargarReviews();
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

  cargarReviews() {

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
    this.reviewService.cargarReviews(this.registroactual, text, placeSearch)
      .subscribe( res => {
        if (res['revws'].length === 0) {
          if (this.registroactual > 0) {
            this.registroactual -= this.registrosporpagina;
            if (this.registroactual < 0) { this.registroactual = 0};
            this.cargarReviews();
          } else {
            this.listaRegistros = [];
            this.listaTodosRegistros = [];
            this.dataSource = new MatTableDataSource(this.listaTodosRegistros);
            this.totalregistros = 0;
          }
        } else {
          this.listaRegistros = res['revws'];
          this.listaTodosRegistros = res['allreviews'];

          this.listaTodosRegistros.map(function name(object) {

          })
          this.dataSource = new MatTableDataSource(this.listaTodosRegistros)
          this.dataSource.sort = this.sort
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'place': return  item.place.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase('en-US');
              case 'user': return  item.user.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase('en-US');

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
    this.cargarReviews();
  }

  deleteReview( uid: any) {
    Swal.fire({
      title: 'Eliminar Valoracion',
      text: `Al eliminar la siguiente valoración se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.reviewService.eliminarReview(uid)
              .subscribe( resp => {
                this.cargarReviews();
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  //confirmar multidelete
  confirmMultiDelete( str: any) {
    Swal.fire({
      title: 'Eliminar Valoraciones',
      text: `Al eliminar la siguiente valoración se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.multiDeleteReview(str);
          }
      });
  }

  //aqui hacemos el borrado múltiple
  multiDeleteReview(str:any){
    if(!str._selected){
      return;
    }
    if(str._selected.length == 0){
      return;
    }
    if(str._selected.length > 0){
      for(let i = 0; i < str._selected.length;i++){
        this.reviewService.eliminarReview(str._selected[i].uid)
              .subscribe( resp => {
                if(i == str._selected.length - 1){
                  Swal.fire({
                    title: 'Valoraciones eliminados', text: `Has eliminado las valoraciones con éxito`, icon: 'success',
                    allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
                  });
                }
                this.cargarReviews();
                this.selection.clear()

              }
              ,(err) =>{

                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
      }
    }

  }

  loadPictures(id:any ){


    this.reviewService.cargarReview(id).subscribe((res:any) =>{

      if(res.ok){
        var town = res['revws'];
        var imagenesList= town['pictures'];
        var images:Image[]=[];

        for (let index = 0; index < imagenesList.length; index++) {
          const element = imagenesList[index];
          var namefilenew= this.domSanitizer.bypassSecurityTrustResourceUrl( environment.picturesDir+'/fotoreview/'+element);
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
  selector: 'review-details',
  templateUrl: 'review-details.html',
})
export class ReviewDetails {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

}

