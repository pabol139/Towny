import { Component, OnInit, Directive, EventEmitter, Input, Output, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { Place } from 'src/app/models/place.model';
import { PlaceService } from 'src/app/services/place.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { ReviewService } from 'src/app/services/review.service';
import {AfterViewInit, ViewChild} from '@angular/core';
import {MatSort, Sort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {MatPaginator} from '@angular/material/paginator';
import {animate, state, style, transition, trigger} from '@angular/animations';
import Swal from 'sweetalert2';
import { UploadsService } from 'src/app/services/uploads.service';
import Chart from 'chart.js/auto';


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
import { Review } from 'src/app/models/review.model';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-comercios',
  templateUrl: './comercios.component.html',
  styleUrls: ['./comercios.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],

})

export class ComerciosComponent implements AfterViewInit {
arr = Array;
  public loading = true;
  public namefile = "";
  public totalplaces = 0;
  public actual_position = 0;
  public records_per_page = environment.records_per_page;
  public listaLugares: Place[] = [];
  public listaValoraciones: Review[] = [];
  private ultimaBusqueda = '';
  public expandedElement: Place | null;
  //displayedColumns: string[] = ['select','name','town','description','pictures','visits','status', 'actions'];
  displayedColumns = ['select','name','register', 'tipo','status','factura','actions'];
  dataSource = new MatTableDataSource([]);

  public cargar_imagen = false;
  public numFoto = 1;
  public totalFotos: number = 0;
  public iconoAtras = false;
  public iconoAlante = true;
  public tipo: string = 'fotoplace';
  public visitas = [0,0,0,0,0,0,0,0,0,0,0,0];
  public myChart;
  data = Object.values(this.listaLugares);
  public usuario: string;
  public cif: string;

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


  constructor( private placeservice: PlaceService, private userservice: UserService, private _liveAnnouncer: LiveAnnouncer,private domSanitizer: DomSanitizer,
    private modalGalleryService: ModalGalleryService,private uploadservice: UploadsService,private reviewservice:ReviewService, private router: Router) {
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator, {static : true}) paginator: MatPaginator;
  private subjectKeyUp = new Subject<any>();
  ngAfterViewInit() {
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
    this.placeservice.getPlaces( this.actual_position, textoBuscar)
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
            this.totalplaces = 0;
          }
        } else {
          this.listaLugares = res['places'];

          this.dataSource = new MatTableDataSource(this.listaLugares);
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


        }
        this.loading = false;
      }, (err) => {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
        //console.warn('error:', err);
        this.loading = false;
      });
  }

  openpdf(tipo){
    let pdf = new jsPDF('p','mm','a4');

    var img = "https://i.postimg.cc/BbzczfjW/towny.png";

    pdf.addImage(img, 'png', 13, 3, 60, 40);

    pdf.setFontSize(20);

    pdf.text("Factura de modelado", 125,20);

    pdf.setFontSize(15);
    pdf.text("Cliente: "+ this.userservice.name, 129,35);
    pdf.text("CIF: "+ this.userservice.cif, 129,42);

    var canti= "";
    if(tipo){
      canti= "45 €";
    }
    else{
      canti="30 €";
    }
    pdf.setFontSize(12);
    pdf.text("Cantidad", 10,82);
    pdf.text("Concepto", 47,82);
    pdf.text("Tipo de modelo", 87,82);
    pdf.text("Precio/ud.", 157,82);
    pdf.text("Total", 183,82);
    
    pdf.text("1", 16, 105);
    pdf.text("Modelo Tonwy", 42,105);
    
    var tip= "";
    if(tipo){
      tip="Premium";
    }
    else{
      tip= "Estandar";
    }
    pdf.text(tip, 90,105);
    pdf.text(canti, 162,105);
    pdf.text(canti, 186,105);


    pdf.text("+ IVA(21%)", 175,115);

    var dinero= "";
    if(tipo){
      dinero="54,45 €";
    }
    else{
      dinero="36,30 €";
    }

    pdf.text("TOTAL: "+dinero, 173, 127);

    pdf.roundedRect(5, 70, 200, 50, 3, 3);
    pdf.roundedRect(170, 120, 35, 10, 3, 3);

    pdf.line(5, 90, 205, 90);

    window.open(URL.createObjectURL(pdf.output("blob")));
  }

  downloadpdf(tipo){
    let pdf = new jsPDF('p','mm','a4');

    var img = "https://i.postimg.cc/BbzczfjW/towny.png";

    pdf.addImage(img, 'png', 13, 3, 60, 40);

    pdf.setFontSize(20);

    pdf.text("Factura de modelado", 125,20);

    pdf.setFontSize(15);
    pdf.text("Cliente: "+ this.userservice.name, 129,35);
    pdf.text("CIF: "+ this.userservice.cif, 129,42);

    var canti= "";
    if(tipo){
      canti= "45 €";
    }
    else{
      canti="30 €";
    }
    pdf.setFontSize(12);
    pdf.text("Cantidad", 10,82);
    pdf.text("Concepto", 47,82);
    pdf.text("Tipo de modelo", 87,82);
    pdf.text("Precio/ud.", 157,82);
    pdf.text("Total", 183,82);
    
    pdf.text("1", 16, 105);
    pdf.text("Modelo Tonwy", 42,105);
    
    var tip= "";
    if(tipo){
      tip="Premium";
    }
    else{
      tip= "Estandar";
    }
    pdf.text(tip, 90,105);
    pdf.text(canti, 162,105);
    pdf.text(canti, 186,105);


    pdf.text("+ IVA(21%)", 175,115);

    var dinero= "";
    if(tipo){
      dinero="54,45 €";
    }
    else{
      dinero="36,30 €";
    }

    pdf.text("TOTAL: "+dinero, 173, 127);

    pdf.roundedRect(5, 70, 200, 50, 3, 3);
    pdf.roundedRect(170, 120, 35, 10, 3, 3);

    pdf.line(5, 90, 205, 90);

    pdf.save("facturatowny.pdf");
  }

  changePage( page: number ){
    page = (page < 0 ? 0 : page);
    this.actual_position = ((page - 1) * this.records_per_page >=0 ? (page - 1) * this.records_per_page : 0);
    this.getPlaces(this.ultimaBusqueda);
  }

  deletePlace( uid: string, name: string) {
    // Comprobar que no me borro a mi mismo
   /* if (uid === this.placeservice.uid) {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No puedes eliminar tu propio usuario',});
      return;
    }*/
    // Solo los admin pueden borrar lugares
    if (this.userservice.rol !== 'ROL_ADMIN' && this.userservice.rol !== 'ROL_COMMERCE') {
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
                Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  deactivate( uid: string, name: string) {
    // Comprobar que no me borro a mi mismo
   /* if (uid === this.placeservice.uid) {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No puedes eliminar tu propio usuario',});
      return;
    }*/
    // Solo los admin pueden borrar lugares
    if (this.userservice.rol !== 'ROL_ADMIN' && this.userservice.rol !== 'ROL_COMMERCE') {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No tienes permisos para realizar esta acción',});
      return;
    }

    Swal.fire({
      title: 'Desactivar',
      text: `Al desactivar el lugar ${name} no aparecerá en el mapa hasta que lo vuelva a activar. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
          if (result.value) {
            this.placeservice.deactivate(uid)
              .subscribe( resp => {
                this.getPlaces(this.ultimaBusqueda);
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }


  activate( uid: string, name: string, paid: number) {
    // Comprobar que no me borro a mi mismo
   /* if (uid === this.placeservice.uid) {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No puedes eliminar tu propio usuario',});
      return;
    }*/
    // Solo los admin pueden borrar lugares
    if (this.userservice.rol !== 'ROL_ADMIN' && this.userservice.rol !== 'ROL_COMMERCE') {
      Swal.fire({icon: 'warning', title: 'Oops...', text: 'No tienes permisos para realizar esta acción',});
      return;
    }

    var fechas: string[];
    var fecha: string[];

    if(paid >= 1){
        this.userservice.getUser(this.userservice.uid)
          .subscribe ((res: any) => {
            if(res['users']['bills'].length!=0){
              var ayuda = res['users']['bills'][res['users']['bills'].length-1];
              fechas = ayuda.split(" ");
              fecha =fechas[3].split("/");              
            }
            else{
              var ayuda1 = "00 00 00 01/01/2000";              
              fechas = ayuda1.split(" ");  
              fecha =fechas[3].split("/");  
            }

            var dia = Number(fecha[0]);
            var mes = Number(fecha[1]);
            var ano = Number(fecha[2]);

            var pepo = ano + '-' + mes + '-' + dia;

            var kka = new Date(pepo);
            
            var today = new Date();  
            if(today > kka){
              Swal.fire({icon: 'warning', title: 'Suscripción mensual', text: 'Debes tener la suscripción al corriente de pagos para poder activar el comercio',});
              return;
            }
            else{
              this.placeservice.activate(uid)
                .subscribe( resp => {
                  this.getPlaces(this.ultimaBusqueda);
                }
                ,(err) =>{
                  Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
                })
            }
        });
    }
    else{

    Swal.fire({
      title: 'Activar',
      text: `Al activar el lugar ${name} serás redirigido a la pasarela de pago. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result) => {
          if (result.value) {

            this.router.navigateByUrl(`commerce/pagoslugar/${uid}`);

          }
      });
    }
  }



  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
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

  cargarImagen(str:any) {

    this.cargar_imagen = true;
    this.uploadservice.getPhotos(this.tipo, str, this.numFoto).subscribe((res:any) =>{

      if(res.ok){
        this.namefile = res['nombrefoto'];
        this.totalFotos = res['long'];
        if(this.totalFotos == 1){
          this.iconoAlante = false;
        }
        this.cargar_imagen = false;
        this.namefile = this.placeservice.crearImagenUrl(this.namefile);
      }

    }, (err) => {
      this.cargar_imagen = false;
      this.namefile="";
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      if(msgerror !== 'No hay imágenes en el array')
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });


}



  cambiarFotosAtras(str:any,i){


    document.getElementsByClassName('image-wrapper')[i].animate([
      // fotogramas clave
      {opacity: 0 },
      {opacity: 1 },
    ], {
      // opciones de sincronización
      duration: 500,
      iterations: 1
    });

    if(this.numFoto > 1){
      this.numFoto--;
      this.cargarImagen(str);
    }
    this.iconoAlante = true;

    if(this.numFoto == 1){
      this.iconoAtras = false;
    }
    else{
      this.iconoAtras = true;
    }

  }

  cambiarFotosAlante(str:any,i){

    document.getElementsByClassName('image-wrapper')[i].animate([
      // fotogramas clave
      {opacity: 0 },
      {opacity: 1 }
    ], {
      // opciones de sincronización
      duration: 500,
      iterations: 1
    });

    if(this.numFoto < this.totalFotos){
      this.numFoto++;
      this.cargarImagen(str);
    }
    if(this.numFoto == this.totalFotos){
      this.iconoAlante = false;
    }
    if(this.numFoto == 1){
      this.iconoAtras = false;
    }
    else{
      this.iconoAtras = true;
    }
  }s

//FUNCIÓN PARA CARGAR LA COLUMNA

  cargarColumna(str:any,i) {
    this.numFoto = 1;

    this.iconoAtras = false;
  this.iconoAlante = true;



  //SI HAY UNA GRÁFICA CARGADA LA BORRAMOS
    if(this.myChart){

      this.myChart.destroy();

    }

//CARGAMOS LA PRIMERA IMAGEN

    this.cargar_imagen = true;
    this.uploadservice.getPhotos(this.tipo, str, this.numFoto).subscribe((res:any) =>{

      if(res.ok){
        this.namefile = res['nombrefoto'];
        this.totalFotos = res['long'];
        if(this.totalFotos == 1){
          this.iconoAlante = false;
        }
        this.cargar_imagen = false;
        this.namefile = this.placeservice.crearImagenUrl(this.namefile);
      }

    }, (err) => {
      this.cargar_imagen = false;

      this.namefile="";
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      if(msgerror !== 'No hay imágenes en el array')
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });


//CARGAMOS LAS REVIEWS

    this.reviewservice.cargarReviews(0,"",str).subscribe((res:any) =>{

      if(res.ok){

          this.listaValoraciones = res['allreviews'];
        this.listaValoraciones = this.listaValoraciones.slice(-3);

      }

    }, (err) => {

      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';

        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });


//CARGAMOS EL GRÁFICO DE VISITAS MENSUALES

     this.placeservice.getPlace(str).subscribe((res:any) =>{

      if(res.ok){

        this.visitas = res['places'].visits;



        const ch1 = <HTMLCanvasElement> document.getElementById('mychart'+i);
        const ctx = ch1.getContext('2d');
         this.myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre","Octubre","Noviembre","Diciembre"],
                datasets: [{
                    label: 'Visitas',
                    data: [this.visitas[0], this.visitas[1], this.visitas[2], this.visitas[3], this.visitas[4], this.visitas[5], this.visitas[6], this.visitas[7], this.visitas[8],this.visitas[9],this.visitas[10],this.visitas[11]],
                    borderRadius: 15,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });



      }

    }, (err) => {
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';

        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });



}


}

