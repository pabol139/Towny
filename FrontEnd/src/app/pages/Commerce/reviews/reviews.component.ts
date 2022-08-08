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
import { ActivatedRoute, Router } from '@angular/router';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';


import { PlaceService } from 'src/app/services/place.service';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import { debounceTime, map, startWith } from 'rxjs/operators';
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
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComComponent implements OnInit {
    public name = '';

    public listaReviews: Review[] = [];
    public primera = true;
    // Control de paginación
    public totalregistros: number = 0;
    public registroactual: number = 0;
    public registrosporpagina: number = environment.records_per_page;
    // Control del loading
    public loading = false;
    // Cursos lsitado
    public placeSearch = '';
    public text = '';
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

    displayedColumns: string[] = ['place','comment','review','pictures','like','publicationDate'];
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
              public dialog: MatDialog,
              private route: ActivatedRoute,) {
  }

@ViewChild(MatSort) sort: MatSort;
@ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;

  ngOnInit(): void {


    this.name = this.route.snapshot.params['uid'];


    //SI RECIBIMOS UN NOMBRE DE UN LUGAR EN EL ENLACE HACEMOS UNA BÚSQUEDA

    if(this.name){
      this.searchForm.setValue({'text':'','place':this.name});
    }
    else{
      this.cargarReviews();
    }
    this.getPlaces();

    if(this.listaReviews.length > 0){
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
    }
    //this.cargarReviews();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe( event => {
        this.buscar();
      });
  }


  //VACIAR CAMPO DE BÚSQEUDA

  borrar() {
    this.searchForm.get('text').setValue('');
    this.searchForm.get('place').setValue('');
    //this.cargarReviews();
  }


  private filtro(): Place[] {
    //const filterValue = value.province.toLowerCase();
    return this.places.filter(option => option.name.toLowerCase().includes(this.searchForm.value.place.toLowerCase()));
  }

   getPlaces() {
    // cargamos todos los lugares en el input
    this.placeservice.getPlaces(0,'')
      .subscribe( res => {
        this.places = res['places'];
        this.filteredOptions = this.filterPlace.valueChanges.pipe(
          startWith(''),
          map(value => this.filtro()),
        );


          //SI SE ACABA DE CARGAR LA PÁGINA HACEMOS UNA BÚSQUEDA CON LO QUE HEMOS RECIBIDO

        if(this.name && this.primera){
          this.buscar();
          this.primera = false;

        }
      });



  }

  buscar(){
    this.text = this.searchForm.get('text').value || '';

    let bool = false;
    for(let x = 0; x < this.places.length; x++){
      if(this.places[x].name === this.searchForm.get('place').value){
        bool = true;
        this.searchForm.value.place = this.places[x].uid;
        this.placeSearch = this.places[x].uid;
        break;
      }
      else{
        this.placeSearch='';
      }
    }

    if(this.searchForm.get('place').value.length > 0 && !bool) { return; }

    this.cargarReviews();
    //this.loading = false;
  }


  cargarReviews() {
    this.loading = true;
    this.reviewService.getAllReviewsbyCommerce(this.usuarioService.uid,this.placeSearch,this.text)
    .subscribe(res => {
    this.listaReviews=res['revwscom'];
    this.dataSource = new MatTableDataSource(this.listaReviews);
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

    this.loading = false;

 });



  }



  cambiarPagina( pagina: number) {
    pagina = (pagina < 0 ? 0 : pagina);
    this.registroactual = ((pagina - 1) * this.registrosporpagina >=0 ? (pagina - 1) * this.registrosporpagina : 0);
    this.cargarReviews();
  }



  //confirmar multidelete


  //aqui hacemos el borrado múltiple

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
/*
@Component({
  selector: 'review-details',
  templateUrl: 'review-details.html',
})
export class ReviewDetails {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

}
*/
