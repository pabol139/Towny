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
//import { jsPDF } from "jspdf";

import {
  Image,
  ModalGalleryService,
  ModalGalleryRef,
  ModalGalleryConfig,
} from '@ks89/angular-modal-gallery';
import { DomSanitizer } from '@angular/platform-browser';
import { User } from 'src/app/models/user.model';
import { forEach } from 'gl-matrix-ts/dist/vec3';
import { __await } from 'tslib';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-places',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit {
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
  public listaUsuarios: User[] = [];
  public listaFacturasFinal: Object[] = [];
  public finplanactual: '';
  public diasfinplan: any;
  public numbero: number;
  public ayuda: number;
  public user: string;
  public usuario: string;
  public cif: string;
 
  displayedColumns: string[] = ['numero','fechapago','fechainicio','fechafin','cantidad','ver','descargar'];

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
    public dialog: MatDialog) {
  }

@ViewChild(MatSort) sort: MatSort;
@ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    this.numbero=0;
    this.ayuda=0;

    this.getBills(this.ultimaBusqueda);
  }

  getBills(textoBuscar : string){


      this.userservice.getUser(this.userservice.uid)
      .subscribe( async (res:any) => {
        if (!res['users']) {
          return;
        }
        else{
          var factura = new Object();
          
          this.usuario = res['users']['name'];
          this.cif = res['users']['CIF']

          this.listaFacturas = res['users']['bills'];
          for(let i=0;i<this.listaFacturas.length;i++){
              var linea = this.listaFacturas[i].toString();
              var tipos = linea.split(" ");
              this.numbero+=1;

              var fecha=tipos[0];
              fecha = tipos[0].substr(0,2)+"/"+tipos[0].substr(2,2)+"/"+tipos[0].substr(4,4);

              factura['numero']= this.numbero;
              factura['fechapago']=fecha;
              factura['fechainicio'] = tipos[2]; //new Date(tipos[2]);
              factura['fechafin'] = tipos[3];//new Date(tipos[3]);
              factura['cantidad'] = tipos[4];

              this.listaFacturasFinal.push(factura);
              if(i<this.listaFacturas.length-1){
                factura = new Object();
              }
          }

          this.finplanactual = factura['fechafin'];
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          var yyyy = today.getFullYear();
          var today1 = dd + '/' + mm + '/' + yyyy;
          if(factura['fechafin']!=null ){
            this.diasfinplan = this.restaFechas(factura['fechafin'],today1).toString();

          }

          this.dataSource = new MatTableDataSource(this.listaFacturasFinal);


        }
      }, (err) => {
        let error_midle = '';
        if(err.error.err){
          error_midle += '<p> Los errores son los siguientes: ';
          if(err.error.err.id){
            error_midle += '<br><br>';
            error_midle += `${err.error.err.id.msg}`;
          }
          error_midle += '</p>';
        }
        if(error_midle === ''){
          error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
        }
        Swal.fire({icon: 'error', title: 'Oops...', html: error_midle,});
        return;
      });
  }

  restaFechas = function(f1,f2){
    var aFecha1 = f1.split('/');
    var aFecha2 = f2.split('/');
    var fFecha1 = Date.UTC(aFecha1[2],aFecha1[1]-1,aFecha1[0]);
    var fFecha2 = Date.UTC(aFecha2[2],aFecha2[1]-1,aFecha2[0]);
    var dif = fFecha1 - fFecha2;
    var dias = Math.floor(dif / (1000 * 60 * 60 * 24));
    return dias;
  }

  openpdf(fechapago: string, fechainicio: string, fechafin: string, cantidad: string){
   let pdf = new jsPDF('p','mm','a4');

    var img = "https://i.postimg.cc/BbzczfjW/towny.png";

    pdf.addImage(img, 'png', 13, 3, 60, 40);

    pdf.setFontSize(20);

    pdf.text("Factura de suscripción", 125,20);

    pdf.setFontSize(15);
    pdf.text("Cliente: "+ this.usuario, 129,35);
    pdf.text("CIF: "+ this.cif, 129,42);
    pdf.text("Fecha emisión: "+ fechapago, 129,49);

    pdf.setFontSize(12);
    pdf.text("Cantidad", 10,82);
    pdf.text("Concepto", 47,82);
    pdf.text("Fecha de inicio", 87,82);
    pdf.text("Fecha de fin", 127,82);
    pdf.text("Precio/ud.", 157,82);
    pdf.text("Total", 183,82);


    
    pdf.text("1", 16, 105);
    pdf.text("Suscripción mensual Tonwy", 29,105);
    pdf.text(fechainicio, 89,105);
    pdf.text(fechafin, 127,105);
    pdf.text(cantidad+" €", 162,105);
    pdf.text(cantidad+ " €", 186,105);


    pdf.text("+ IVA(21%)", 175,115);

    pdf.text("TOTAL: 24,20 €", 173, 127);

    pdf.roundedRect(5, 70, 200, 50, 3, 3);
    pdf.roundedRect(170, 120, 35, 10, 3, 3);

    pdf.line(5, 90, 205, 90);

    window.open(URL.createObjectURL(pdf.output("blob")));
  }

  downpdf(fechapago: string, fechainicio: string, fechafin: string, cantidad: string){
    let pdf = new jsPDF('p','mm','a4');

    var img = "https://i.postimg.cc/BbzczfjW/towny.png";

    pdf.addImage(img, 'png', 13, 3, 60, 40);

    pdf.setFontSize(20);

    pdf.text("Factura de suscripción", 125,20);

    pdf.setFontSize(15);
    pdf.text("Cliente: "+ this.usuario, 129,35);
    pdf.text("CIF: "+ this.cif, 129,42);
    pdf.text("Fecha emisión: "+ fechapago, 129,49);

    pdf.setFontSize(12);
    pdf.text("Cantidad", 10,82);
    pdf.text("Concepto", 47,82);
    pdf.text("Fecha de inicio", 87,82);
    pdf.text("Fecha de fin", 127,82);
    pdf.text("Precio/ud.", 157,82);
    pdf.text("Total", 183,82);


    
    pdf.text("1", 16, 105);
    pdf.text("Suscripción mensual Tonwy", 29,105);
    pdf.text(fechainicio, 89,105);
    pdf.text(fechafin, 127,105);
    pdf.text(cantidad+ " €", 162,105);
    pdf.text(cantidad+ " €", 186,105);


    pdf.text("+ IVA(21%)", 175,115);

    pdf.text("TOTAL: 24,20 €", 173, 127);

    pdf.roundedRect(5, 70, 200, 50, 3, 3);
    pdf.roundedRect(170, 120, 35, 10, 3, 3);

    pdf.line(5, 90, 205, 90);
 
     pdf.save("facturatowny.pdf");
   }


  changePage( page: number ){
    page = (page < 0 ? 0 : page);
    this.actual_position = ((page - 1) * this.records_per_page >=0 ? (page - 1) * this.records_per_page : 0);
    this.getBills(this.ultimaBusqueda);
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
                this.getBills(this.ultimaBusqueda);
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
                  this.getBills(this.ultimaBusqueda);
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