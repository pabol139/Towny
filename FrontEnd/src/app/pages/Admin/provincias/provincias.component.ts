import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Provincia } from '../../../models/provincia.model';
import { ProvinciaService } from '../../../services/provincia.service';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user.service';
import {PaginationComponent} from '../../../commons/pagination/pagination.component'
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-provincias',
  templateUrl: './provincias.component.html',
  styleUrls: ['./provincias.component.css']
})
export class ProvinciasComponent implements OnInit {

    // Control de paginación
    public totalregistros: number = 0;
    public registroactual: number = 0;
    public registrosporpagina: number = environment.records_per_page;
    // Control del loading
    public loading = false;
    // Cursos lsitado
    public listaRegistros: Provincia[] = [];
    public listaTodosRegistros: Provincia[] = [];

    // Ultima búsqueda
    public ultimaBusqueda = '';


    displayedColumns: string[] = ['select','name', 'cod', 'actions'];
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

  constructor(private provinciaService: ProvinciaService,
    private usuarioService: UserService) {
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;
  private subjectKeyUp = new Subject<any>();

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
    this.cargarProvincias(this.ultimaBusqueda);
    this.subjectKeyUp
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe((d) => {
        this.cargarProvincias(d);
      });
  }

  onSearch($event: any) {
    const value = $event.target.value;
    this.subjectKeyUp.next(value);
  }

  cargarProvincias( texto: string ) {
    this.ultimaBusqueda = texto;
    this.loading = true;
    this.provinciaService.cargarProvincias(this.registroactual, texto)
      .subscribe((res:any) => {
        if (res['provinces'].length === 0) {
          if (this.registroactual > 0) {
            this.registroactual -= this.registrosporpagina;
            if (this.registroactual < 0) { this.registroactual = 0};
            this.cargarProvincias(this.ultimaBusqueda);
          } else {
            this.listaRegistros = [];
            this.listaTodosRegistros = [];
            this.dataSource = new MatTableDataSource(this.listaTodosRegistros)
            this.totalregistros = 0;
          }
        } else {
          this.listaRegistros = res['provinces'];
          this.listaTodosRegistros = res['allprovinces'];
          this.dataSource = new MatTableDataSource(this.listaTodosRegistros)
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
      }, (err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });
        this.loading = false;
      });
  }

  cambiarPagina( pagina: number) {
    pagina = (pagina < 0 ? 0 : pagina);
    this.registroactual = ((pagina - 1) * this.registrosporpagina >=0 ? (pagina - 1) * this.registrosporpagina : 0);
    this.cargarProvincias(this.ultimaBusqueda);
  }

  deleteProvince( uid: any, name: string) {
    Swal.fire({
      title: 'Eliminar Provincia',
      text: `Al eliminar la provincia ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.provinciaService.eliminarProvincia(uid)
              .subscribe( resp => {
                this.cargarProvincias(this.ultimaBusqueda);
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  confirmDeleteProvince( str: any) {
    Swal.fire({
      title: 'Eliminar Provincias',
      text: `¿Estás seguro de que quieres eliminar las provincias seleccionados?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar',
      allowOutsideClick: false
    }).then((result) => {
          if (result.value) {
            this.multiDeleteProvinces(str);
          }
      });
  }

  multiDeleteProvinces(str:any){
    if(!str._selected){
      return;
    }
    if(str._selected.length == 0){
      return;
    }
    if(str._selected.length > 0){
      for(let i = 0; i < str._selected.length;i++){
        this.provinciaService.eliminarProvincia(str._selected[i].uid)
              .subscribe( resp => {
                if(i == str._selected.length - 1){
                  Swal.fire({
                    title: 'Provincias eliminadas', text: `Has eliminado las provincias seleccionadas con éxito`, icon: 'success',
                    allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
                  });
                  this.cargarProvincias(this.ultimaBusqueda);
                  this.selection.clear()

                }
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
      }
    }

  }

}


