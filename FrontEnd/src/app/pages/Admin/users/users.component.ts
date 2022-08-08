import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {MatPaginator} from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { DecimalPipe } from '@angular/common';
import {SelectionModel} from '@angular/cdk/collections';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';

import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UsersComponent implements OnInit {

  public loading = true;

  public totalusers = 0;
  public actual_position = 0;
  public records_per_page = environment.records_per_page;

  private ultimaBusqueda = '';
  public listaUsuarios: User[] = [];
  public listaTodosUsuarios: User[] = [];

  displayedColumns: string[] = ['select','name','email','registerDate', 'rol','active','actions'];
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

  data = Object.values(this.listaTodosUsuarios);

  public searchForm = this.fb.group({
    text: [''],
    rol: ['']
  });

  public subs$: Subscription;

  constructor( private userservice: UserService,
               private fb: FormBuilder,
               public dialog: MatDialog) {
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;



   openDetails(uid: string){

    this.userservice.getUser(uid).subscribe((res:any) => {

      const user = res['users']

      this.dialog.open(UserDetails, {
        data: {
          user,
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
    this.getUsers();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getUsers();
      });
  }

  borrar() {
    this.searchForm.controls['text'].reset();
    this.searchForm.controls['rol'].setValue('');
  }

  getUsers() {
    const text = this.searchForm.get('text').value || '';
    const role = this.searchForm.get('rol').value || '';
    this.loading = true;
    this.userservice.getUsers( this.actual_position, text, role )
      .subscribe( (res:any) => {
        // Lo que nos llega lo asignamos a lista usuarios para renderizar la tabla
        // Comprobamos si estamos en un apágina vacia, si es así entonces retrocedemos una página si se puede
        if (res['users'].length === 0) {
          if (this.actual_position > 0) {
            this.actual_position = this.actual_position - this.records_per_page;
            if (this.actual_position < 0) { this.actual_position = 0};
            this.getUsers();
          } else {
            this.listaUsuarios = [];
            this.listaTodosUsuarios = [];
            this.dataSource = new MatTableDataSource(this.listaTodosUsuarios);
            this.totalusers = 0;
          }
        } else {
          this.listaUsuarios = res['users'];
          this.listaTodosUsuarios = res['allusers'];
          this.listaTodosUsuarios.map(function name(object) {

          })
          this.dataSource = new MatTableDataSource(this.listaTodosUsuarios);
          this.dataSource.sort = this.sort
          this.dataSource.paginator = this.paginator;

          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {

              /* case 'name':

                return item[property].normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase('en-US');
*/
               default:

                if (typeof item[property] === 'string') {

                  return item[property].normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase('en-US');

                }

                return item[property];
            }
          };



          this.data = Object.values(this.listaUsuarios);
          this.totalusers = res['page'].total;

        }
        this.loading = false;
      }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        //console.warn('error:', err);
        this.loading = false;
      });
  }

  createPictureUrl(picture: string) {
    return this.userservice.createPictureUrl(picture);
  }

  changePage( page: number ){
    page = (page < 0 ? 0 : page);
    this.actual_position = ((page - 1) * this.records_per_page >=0 ? (page - 1) * this.records_per_page : 0);
    this.getUsers();
  }

  changeActive( uid: string, name: string) {
    // Comprobar que no me desactivo yo mismo
    if (uid === this.userservice.uid) {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No puedes desactivar tu propio usuario',});
      return;
    }
    // Solo los admin pueden desactivar usuarios
    if (this.userservice.rol !== 'ROL_ADMIN') {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No tienes permisos para realizar esta acción',});
      return;
    }

    let user: User = new User('', '');


    this.userservice.getUser(uid)
        .subscribe( (res:any) => {
          //this.cargaDatosForm(res);
          user = res['users'];
          if(user.active == true){
            user.active = false;
          }else{
            user.active = true;
          }

          let accion = user.active ? "activar" : "desactivar"

          Swal.fire({
            title: `${accion.charAt(0).toUpperCase() + accion.slice(1)} usuario`,
            text: `Al ${accion} al usuario ${name} se modificará su estado. ¿Desea continuar?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, cambiar su estado'
          }).then((result) => {
            if (result.value) {
              this.userservice.updateUser(uid, user)
                .subscribe( resp => {
                  window.location.href = '/admin/users';
                }
                ,(err) =>{
                  Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
                })
            }
        });


        });

  }

  deleteUser( uid: string, name: string) {
    // Comprobar que no me borro a mi mismo
    if (uid === this.userservice.uid) {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No puedes eliminar tu propio usuario',});
      return;
    }
    // Solo los admin pueden borrar usuarios
    if (this.userservice.rol !== 'ROL_ADMIN') {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No tienes permisos para realizar esta acción',});
      return;
    }

    Swal.fire({
      title: 'Eliminar usuario',
      text: `Al eliminar al usuario ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.userservice.deleteUser(uid)
              .subscribe( resp => {
                this.getUsers();
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  confirmMultiDelete(str: any) {
    // Comprobar que no me borro a mi mismo
    /*if (uid === this.userservice.uid) {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No puedes eliminar tu propio usuario',});
      return;
    }*/
    // Solo los admin pueden borrar usuarios
    if (this.userservice.rol !== 'ROL_ADMIN') {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No tienes permisos para realizar esta acción',});
      return;
    }

    Swal.fire({
      title: 'Eliminar usuario',
      text: `Al eliminar al usuario ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.multiDeleteUsers(str);
          }
      });
  }

  //hacer el multidelete de usuario
  multiDeleteUsers(str:any){
    if(!str._selected){
      return;
    }
    if(str._selected.length == 0){
      return;
    }
    if(str._selected.length > 0){
      for(let i = 0; i < str._selected.length;i++){
        if(str._selected[i].uid != this.userservice.uid){
          this.userservice.deleteUser(str._selected[i].uid)
                .subscribe( resp => {
                  if(i == str._selected.length - 1){
                    Swal.fire({
                      title: 'Usuarios eliminados', text: `Has eliminado los usuarios seleccionados con éxito`, icon: 'success',
                      allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
                    });
                  }
                  this.getUsers();
                  this.selection.clear()

                }
                ,(err) =>{
                  Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
                })
        }
        else{
          //Swal.fire({icon: 'error', title: 'Oops...', text: 'No puedes eliminar tu propio administrador',});
        }
      }
    }
  }

}

@Component({
  selector: 'user-details',
  templateUrl: 'user-details.html',
  styleUrls: ['./users.component.css']
})
export class UserDetails {

  constructor(@Inject(MAT_DIALOG_DATA) public data) {}

}
