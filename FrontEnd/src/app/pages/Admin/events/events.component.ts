import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Event } from '../../../models/event.model';
import { EventService } from '../../../services/event.service';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user.service';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {PaginationComponent} from '../../../commons/pagination/pagination.component'
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

    // Control de paginación
    public totalregistros: number = 0;
    public registroactual: number = 0;
    public registrosporpagina: number = environment.records_per_page;
    // Control del loading
    public loading = false;
    // Cursos lsitado
    public listaRegistros: Event[] = [];
    public listaTodosRegistros: Event[] = [];

    // Ultima búsqueda
    public ultimaBusqueda = '';

    displayedColumns: string[] = ['select','name','description','pictures','fecha','town','actions'];
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
  constructor(private eventService: EventService,
    private usuarioService: UserService,
    public dialog: MatDialog) {
  }

@ViewChild(MatSort) sort: MatSort;
@ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;

private subjectKeyUp = new Subject<any>();

openDetails(uid: string){


  this.eventService.getEvent(uid).subscribe((res:any) => {

    const user = res['events']

    this.dialog.open(EventDetails, {
      data: {
        user,
        service: this,
      },
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

    this.getEvents(this.ultimaBusqueda);

    this.subjectKeyUp
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe((d) => {
        this.getEvents(d);
      });

  }

  onSearch($event: any) {
    const value = $event.target.value;
    this.subjectKeyUp.next(value);
  }

  getEvents( texto: string ) {
    this.ultimaBusqueda = texto;
    this.loading = true;
    this.eventService.getEvents(this.registroactual, texto)
      .subscribe((res:any) => {
        if (res['events'].length === 0) {
          if (this.registroactual > 0) {
            this.registroactual -= this.registrosporpagina;
            if (this.registroactual < 0) { this.registroactual = 0};
            this.getEvents(this.ultimaBusqueda);
          } else {
            this.listaRegistros = [];
            this.totalregistros = 0;
            this.listaTodosRegistros = [];
            this.dataSource = new MatTableDataSource(this.listaTodosRegistros)
          }
        } else {
          this.listaRegistros = res['events'];
          this.listaTodosRegistros = res['allevents'];
          this.dataSource = new MatTableDataSource(this.listaTodosRegistros)
          this.dataSource.sort = this.sort

          this.dataSource.sortingDataAccessor = (item, property) => {

            switch (property) {
              case 'town': return  item.town.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase('en-US');
              case 'fecha': {
                let newDate = new Date(item.date);
                return newDate;
              }
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
        Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo', });
        this.loading = false;
      });
  }

  cambiarPagina( pagina: number) {
    pagina = (pagina < 0 ? 0 : pagina);
    this.registroactual = ((pagina - 1) * this.registrosporpagina >=0 ? (pagina - 1) * this.registrosporpagina : 0);
    this.getEvents(this.ultimaBusqueda);
  }

  deleteEvent( uid: string) {
    Swal.fire({
      title: 'Eliminar evento',
      text: `Al eliminar el siguiente evento se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.eventService.deleteEvent(uid)
              .subscribe( resp => {
                this.getEvents(this.ultimaBusqueda);
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  confirmDelete(str:any) {

    Swal.fire({
      title: 'Eliminar eventos',
      text: `Al eliminar los siguiente eventos se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      allowOutsideClick: false,
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.multiDelete(str);
          }
      });
  }

  multiDelete(str:any){
    if(!str._selected){
      return;
    }
    if(str._selected.length == 0){
      return;
    }
    if(str._selected.length > 0){
      for(let i = 0; i < str._selected.length;i++){
        this.eventService.deleteEvent(str._selected[i].uid)
              .subscribe( resp => {
                if(i == str._selected.length - 1){
                  Swal.fire({
                    title: 'Eventos eliminados', text: `Has eliminado los eventos con éxito`, icon: 'success',
                    allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
                  });
                  this.getEvents(this.ultimaBusqueda);
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

@Component({
  selector: 'event-details',
  templateUrl: 'event-details.html',
})
export class EventDetails {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

}


