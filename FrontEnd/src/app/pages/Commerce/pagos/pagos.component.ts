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
import { forEach } from 'gl-matrix-ts/dist/vec3';
@Component({
  selector: 'app-places',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss']
})
export class PagosComponent implements OnInit {

  public loading = true;

  public totalplaces = 0;
  public actual_position = 0;
  public records_per_page = environment.records_per_page;

  private ultimaBusqueda = '';
  public listaLugares: Place[] = [];
  public listaTodosLugares: Place[] = [];
  public listaLugaresNoPen: Place[] = [];
  public listaLugaresDesac: Place[] = [];
  public listaFacturas: Object[] = [];
  public finplanactual: string;
  public fechapago: string;

  displayedColumns: string[] = ['select','name','town','description','pictures','visits','status', 'actions'];
  displayedColumns1: string[] = ['name','fecha','bton'];
  displayedColumns2: string[] = ['lugar','fechainicio','fechafin','estado'];
  dataSource = new MatTableDataSource([]);
  dataSource1 = new MatTableDataSource([]);
  dataSource2 = new MatTableDataSource([]);

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
    public dialog: MatDialog) {
  }

@ViewChild(MatSort) sort: MatSort;
@ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;

  ngOnInit(): void {

    this.dataSource.sort = this.sort;

    this.getPlaces(this.ultimaBusqueda);
  }

  getPlaces( textoBuscar: string ) {
    this.ultimaBusqueda = textoBuscar;
    this.loading = true;
    
    this.userservice.getUser(this.userservice.uid)
      .subscribe( (res:any) => {
        if(res['users']['bills'].length != 0){
          var numero = res['users']['bills'].length;
          var linea = res['users']['bills'][numero-1];
          var fecha = linea.split(" ");
          var fecha1 = fecha[0];
          var final = fecha1.slice(0,2) + "/" + fecha1.slice(2,4)+ "/"+ fecha1.slice(4,8);
          this.fechapago = final;
        }
      }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
        //console.warn('error:', err);
        this.loading = false;
      });
  }


};
