import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Pueblo } from '../../../models/pueblo.model';
import { PuebloService } from '../../../services/pueblo.service';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user.service';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {PaginationComponent} from '../../../commons/pagination/pagination.component'
import { ProvinciaService } from 'src/app/services/provincia.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { Provincia } from 'src/app/models/provincia.model';
import { Observable, Subscription } from 'rxjs';
import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import { UploadsService } from 'src/app/services/uploads.service';
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
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-pueblos',
  templateUrl: './pueblos.component.html',
  styleUrls: ['./pueblos.component.css']
})
export class PueblosComponent implements OnInit {

  // Control de paginación
  public totalregistros: number = 0;
  public registroactual: number = 0;
  public registrosporpagina: number = environment.records_per_page;
  // Control del loading
  public loading = false;
  // Cursos lsitado
  public listaRegistros: Pueblo[] = [];
  public listaTodosRegistros: Pueblo[] = [];
  public filterProvince = new FormControl();
  public filteredOptions: Observable<Provincia[]>;

  // Ultima búsqueda
  public ultimaBusqueda = '';

  public subs$: Subscription;

  displayedColumns: string[] = ['select','name','province', 'description', 'population','visits','pictures','actions'];
  dataSource = new MatTableDataSource([]);
  public province: Provincia[] = [];

  selection = new SelectionModel(true, []);
  public tipo: string = 'fototown';

  public searchForm = this.fb.group({
    text: [''],
    province: ['']
  });

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



constructor(private puebloService: PuebloService,
                    private fb: FormBuilder,
                    private provincservice: ProvinciaService,
                    private uploadservice: UploadsService,
                    private domSanitizer: DomSanitizer,
                    private modalGalleryService: ModalGalleryService,
                    public dialog: MatDialog
                    ) {

}

@ViewChild(MatSort) sort: MatSort;
@ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;



openDetails(uid: string){


  this.puebloService.cargarPueblo(uid).subscribe((res:any) => {

    const town = res['towns']

    this.dialog.open(PuebloDetails, {
      data: {
        town,
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
  this.getProvinces();
  //this.cargarPueblos();
  this.cargarPueblos();
  this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.cargarPueblos();
      });
}

borrar() {
  this.searchForm.get('text').setValue('');
  this.searchForm.get('province').setValue('');
  //this.cargarPueblos();
}

private filtro(): Provincia[] {
  return this.province.filter(option => option.name.toLowerCase().includes(this.searchForm.value.province.toLowerCase()));
}

getProvinces() {
  // cargamos todos los cursos
  this.provincservice.cargarAllProvincias()
    .subscribe( res => {
      this.province = res['provinces'];
      this.filteredOptions = this.filterProvince.valueChanges.pipe(
        startWith(''),
        map(value => this.filtro()),
      );

    });
}

cargarPueblos() {
  const text = this.searchForm.get('text').value || '';
  let bool = false;
  for(let x = 0; x < this.province.length; x++){
    if(this.province[x].name === this.searchForm.get('province').value){
      bool = true;
      this.searchForm.value.province = this.province[x].uid;
      break;
    }
  }
  if(this.searchForm.get('province').value.length > 0 && !bool) { return; }
  let prov = '';

  if(bool){
    prov = this.searchForm.value.province;
  }
  this.loading = true;
  this.puebloService.cargarPueblos(this.registroactual, text, prov)
    .subscribe( res => {
      if (res['towns'].length === 0) {
        if (this.registroactual > 0) {
          this.registroactual -= this.registrosporpagina;
          if (this.registroactual < 0) { this.registroactual = 0};
          this.cargarPueblos();
        } else {
          this.listaRegistros = [];
          this.listaTodosRegistros = [];
          this.dataSource = new MatTableDataSource(this.listaTodosRegistros);
          this.totalregistros = 0;
        }
      } else {
        this.listaRegistros = res['towns'];
        this.listaTodosRegistros = res['alltowns'];
        this.dataSource = new MatTableDataSource(this.listaTodosRegistros)
        this.dataSource.sort = this.sort
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'province': return  item.province.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase('en-US');
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
  this.cargarPueblos();
}

deletePueblo( uid: any, name: string) {
  Swal.fire({
    title: 'Eliminar Pueblo',
    text: `Al eliminar el pueblo ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, borrar'
  }).then((result) => {
        if (result.value) {
          this.puebloService.eliminarPueblo(uid)
            .subscribe( resp => {
              this.cargarPueblos();
            }
            ,(err) =>{
              Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
            })
        }
    });
}

confirmMultiTown(str: any) {
  Swal.fire({
    title: 'Eliminar Pueblos',
    text: `¿Estás seguro de que quieres eliminar los pueblos seleccionados?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Si, borrar'
  }).then((result) => {
        if (result.value) {
          this.multiDeleteTown(str);
        }
    });
}

multiDeleteTown(str:any){
  if(!str._selected){
    return;
  }
  if(str._selected.length == 0){
    return;
  }
  if(str._selected.length > 0){
    for(let i = 0; i < str._selected.length;i++){
      this.puebloService.eliminarPueblo(str._selected[i].uid)
            .subscribe( resp => {
              if(i == str._selected.length - 1){
                Swal.fire({
                  title: 'Pueblos eliminados', text: `Has eliminado los pueblos seleccionados con éxito`, icon: 'success',
                  allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
                });
                this.cargarPueblos();
                this.selection.clear()

              }
            }
            ,(err) =>{
              Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
            })
    }
  }

}

loadPictures(id:any ){


  this.puebloService.cargarPueblo(id).subscribe((res:any) =>{

    if(res.ok){
      var town = res['towns'];
      var imagenesList= town['pictures'];
      var images:Image[]=[];

      for (let index = 0; index < imagenesList.length; index++) {
        const element = imagenesList[index];
        var namefilenew= this.domSanitizer.bypassSecurityTrustResourceUrl( environment.picturesDir+'/fototown/'+element);
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
  selector: 'pueblo-details',
  templateUrl: 'pueblo-details.html',
  styleUrls: ['../users/users.component.css']

})
export class PuebloDetails {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

}
