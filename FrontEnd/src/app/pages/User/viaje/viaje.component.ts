import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Place } from 'src/app/models/place.model';
import { Travel } from 'src/app/models/travel.model';
import { PlaceService } from 'src/app/services/place.service';
import { TravelService } from 'src/app/services/travel.service';
import { UserService } from 'src/app/services/user.service';
import { ModalService } from '../../../commons/modal';

import Swal from 'sweetalert2';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { UploadsService } from 'src/app/services/uploads.service';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-viaje',
  templateUrl: './viaje.component.html',
  styleUrls: ['./viaje.component.scss']
})
export class ViajeComponent implements OnInit {
  public listaRegistros: Place[] = [];
  public listaRegistrosSel: Place[] = [];
  public listaRutas: Travel[] = [];
  public listaFavoritos: Place[] = [];
  public listaFavoritosSeleccionables: Place[] = [];
  public fileTravels: File [] = [];
  public imagenUrlTravels = [];
  public waiting = false;
  public formPictures = false;

  dropdownSettings = {};

  public submited = false;
  public username = this.userservice.name;
  public rol = this.userservice.rol;
  public email = this.userservice.email;
  public uidUser = this.userservice.uid;
  public uid = 'nuevo';
  public editar = false;

  public datosFormNew = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    name: ['', Validators.required ],
    pictures: ['', Validators.required],
    description: ['', Validators.required ],
    places: ['', Validators.required],
  });

  public datosForm = this.fb.group({
    name: ['', Validators.required ],
    description: ['', Validators.required ],
    places: ['', Validators.required],
  });

  public wait_form: boolean;
  public selectedItems = [];
  public imagenUrl = [];
  public file: File [] = [];
  public numFoto = 1;
  public totalFotos: number = 0;
  public iconoAtras = false;
  public iconoAlante = true;
  public waiting_pictures = false;
  public wait_send_pictures = false;
  public cargar_imagen = false;
  public namefile = '';
  public nameFileForm = '';
  public uploadedFiles: Array <File> = [];

  notificarCargaCompleta = new Subject();

  constructor(
    private fb: FormBuilder,
    private travelservice: TravelService,
    private placeService: PlaceService,
    private userservice: UserService,
    public dialog: MatDialog,
    public uploadService: UploadsService,
    private viajeService: TravelService,
    private uploadservice: UploadsService,
    @Inject(MAT_DIALOG_DATA) public data: any) {


   }

  ngOnInit(): void {

    this.formPictures = this.data.image.images;
    this.cargarLugares();
    this.cargarDatos();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'uid',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      limitSelection: 5
    };


  }

  cargarDatos(): void {
    if (this.data.viaje.id !== 'nuevo') {
      this.travelservice.cargarTravel(this.data.viaje.id)
        .subscribe( (res:any) => {
          if (!res['travels']) {
            return;
          };
          //this.cargarLugares("yes");
          this.uid = res['travels'].uid;
          //this.datosFormNew.get('uid')?.setValue(res['travels'].uid);
          this.editar = true;
          this.datosForm.get('name')?.setValue(res['travels'].name);
          this.datosForm.get('description')?.setValue(res['travels'].description);
          this.datosForm.markAsPristine();
          this.listaRegistrosSel = res['travels'].places;

          for(let i=0;i<this.listaRegistros.length;i++){
            for(let ii=0;ii<this.listaRegistrosSel.length;ii++){
              if(this.listaRegistros[i].name == this.listaRegistrosSel[ii].name){
                this.listaRegistrosSel[ii].uid = this.listaRegistros[i].uid;
              }
            }
          }
          this.selectedItems = this.listaRegistrosSel;

          if(res['travels'].pictures.length > 0)
              this.getPhoto();

          if(this.iconoAlante == true && this.totalFotos === this.numFoto) { this.iconoAlante = false; }

          else if(this.totalFotos > 1 && this.totalFotos !== this.numFoto) { this.iconoAlante = true; }

          this.wait_form = false;
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

          Swal.fire({icon: 'error',backdrop:false, title: 'Oops...', html: error_midle,});
          return;
        });
    }

  }

  cargarLugares() {
    this.placeService.getAllPlaces()
      .subscribe((res:any) => {
          this.listaRegistros = res['places'];
          this.userservice.getUser(this.uidUser).subscribe((res:any) => {
            this.listaFavoritos = res['users'].favorites;
            for (var i = 0; i < this.listaRegistros.length; i++) {
              var igual=false;
              for (var j = 0; j < res['users'].favorites.length && !igual; j++) {
                  if(this.listaRegistros[i]['uid'] === res['users'].favorites[j]['_id']){
                        igual=true;
                  }
                }
              if(!igual)this.listaFavoritosSeleccionables.push(this.listaRegistros[i]);
          }
          }, (err)=> {
            Swal.fire({icon: 'error',backdrop:false, title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

          });

      }, (err)=> {
        Swal.fire({icon: 'error', backdrop:false,title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });
  }

  editarViaje(): void{
    let soloIdsPlaces = [];
    for(let i=0;i<this.listaRegistrosSel.length;i++){
      soloIdsPlaces[i] = this.listaRegistrosSel[i].uid;
    }
    this.datosForm.value.places= this.listaRegistrosSel;

    this.travelservice.updateTravel( this.uid, this.datosForm.value)
      .subscribe( res => {
        this.datosForm.markAsPristine();

        Swal.fire({
          title: 'Viaje editado',backdrop:false, text: `Has editado el viaje ${res['travel'].name} con éxito`, icon: 'success',
          allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
        });
      }, (err) => {

        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', backdrop:false,title: 'Oops...', text: msgerror,});
      });
  }

  crearViaje(): void {

    this.submited = true;
    if (this.datosFormNew.invalid) { return; }

    // Si estamos creando uno nuevo
    if (this.datosFormNew.get('uid')?.value === 'nuevo') {
      this.datosFormNew.value.places= this.listaRegistrosSel;
      this.travelservice.newTravel( this.datosFormNew.value)
        .subscribe( (res:any) => {
          if(this.file && this.file.length > 0){
            let formData = new FormData();
            for(let i = 0; i < this.file.length;i++)
              formData.append("file", this.file[i]);

            this.uploadService.uploadPhotos(formData, 'fototravel', res['travel'].uid).subscribe( res => {
              //this.wait_form = false;
              this.file = []; this.imagenUrl = [];
            }, (err) => {
              this.travelservice.eliminarTravel(res['travel'].uid).subscribe();
              const errtext = err.error.msg || 'No se pudo cargar la imagen';
              Swal.fire({icon: 'error',backdrop:false, title: 'Oops...', text: errtext});
              return;
            });
          }
          this.datosFormNew.markAsPristine();
          Swal.fire({icon: 'success', backdrop:false, title: 'Viaje creado con exito', text: 'Se creo el viaje',});

        }, (err) => {

          const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
          Swal.fire({icon: 'error', backdrop:false,title: 'Oops...', text: msgerror,});
        })
    }
  }

  deleteTravel( uid: string) {

    Swal.fire({
      title: 'Borrar viaje',
      text: `Al eliminar el viaje se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {

          if (result.value) {
            this.travelservice.eliminarTravel(uid)
              .subscribe( resp => {
                this.cargarRutas();
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  cargarRutas( ) {
    this.listaRutas=[];
    this.travelservice.cargarAllTravels()
      .subscribe((res:any) => {

          for (let index = 0; index < res['travels'].length; index++) {
            const element = res['travels'][index];
            if(element.user.name==this.username){
              this.listaRutas.push(element);
            }

          }

      }, (err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });
  }

  onItemSelect(item:any){
    this.listaRegistrosSel.push(item.uid);
  }

  onItemDeSelect(item:any){
    this.removeItemFromArr(this.listaRegistrosSel,item.uid);
  }

  removeItemFromArr ( arr: Place [], item: string ) {
    var x = -2
    for(let i = 0; i<arr.length; i++){
      if(arr[i].uid == item){
        x = i;
        break;
      }
    }

    if (x !== -1) {
        arr.splice(x, 1);
    }

  }

campoNoValidoNew( campo: string) {
  return this.datosFormNew.get(campo)?.invalid && this.submited ;
}

campoNoValidoEdit( campo: string) {
  return this.datosForm.get(campo)?.invalid && this.submited ;
}

cancelar() {
}

deleteFileUploadTravels(event: number){
  var x = -1;
  var arr = [];

  for(let i = 0; i< this.file.length; i++){
    if(i != event) {
      arr.push(this.file[i]);
    }
    else if( i == event){
      x = i;
    }
  }

  if(x !== -1){
    this.imagenUrl.splice(x, 1);
    this.file = arr;
  }

}

async fileChangeTravels(element: any) {
  var file_length = this.file.length + element.target.files.length;
  var arr = element.target.files;
  this.waiting_pictures = false;
  if (arr.length > 0) {
    const extensiones = ['jpeg','jpg','png'];
    let names = [];
    let nombrecortado = [];
    let extension = [];
    for(let i = 0; i < arr.length; i++){
      names.push(arr[i].name);
      nombrecortado.push(names[i].split('.'));
      extension.push(nombrecortado[i][nombrecortado[i].length - 1]);
    }

    for(let i = 0; i < extension.length; i++){
      if(!extensiones.includes(extension[i])){
        this.file = [];
        this.waiting_pictures = false;
        return;
      }
    }

    for(let i = 0; i < arr.length; i++){
      this.file.push(arr[i]);
    }

    this.imagenUrl = [];

    for(let i = 0; i < this.file.length; i++){
      let reader = new FileReader();
      reader.readAsDataURL(this.file[i]);
      reader.onload = (event) => {
        this.imagenUrl[i] = event.target.result.toString();
      };
      if (this.imagenUrl.length == file_length) {
        this.notificarCargaCompleta.next();
      }
    }
    await new Promise(f => setTimeout(f, 600));
    this.waiting_pictures = true;
  }
}

async fileUpdateTravels(element: any) {
  var file_length = this.uploadedFiles.length + element.target.files.length;
  var arr = element.target.files;
  this.waiting_pictures = true;
  if (arr.length > 0) {
    const extensiones = ['jpeg','jpg','png'];
    let names = [];
    let nombrecortado = [];
    let extension = [];
    for(let i = 0; i < arr.length; i++){
      names.push(arr[i].name);
      nombrecortado.push(names[i].split('.'));
      extension.push(nombrecortado[i][nombrecortado[i].length - 1]);
    }

    for(let i = 0; i < extension.length; i++){
      if(!extensiones.includes(extension[i])){
        this.uploadedFiles = [];
        this.waiting_pictures = false;
        return;
      }
    }

    for(let i = 0; i < arr.length; i++){
      this.uploadedFiles.push(arr[i]);
    }

    this.imagenUrl = [];

    for(let i = 0; i < this.uploadedFiles.length; i++){
      let reader = new FileReader();
      reader.readAsDataURL(this.uploadedFiles[i]);
      reader.onload = (event) => {
        this.imagenUrl[i] = event.target.result.toString();
      };
      if (this.imagenUrl.length == file_length) {
        this.notificarCargaCompleta.next();
      }
    }
    await new Promise(f => setTimeout(f, 600));
    this.waiting_pictures = false;
  }
}

deleteFileTravels(event: number){
  var x = -1;
  var arr = [];

  for(let i = 0; i< this.uploadedFiles.length; i++){
    if(i != event) {
      arr.push(this.file[i]);
    }
    else if( i == event){
      x = i;
    }
  }

  if(x !== -1){
    this.imagenUrl.splice(x, 1);
    this.uploadedFiles = arr;
  }

}

  /* Ficheros para editar fotos */

  getPhoto(){
      this.cargar_imagen = true;

      this.uploadservice.getPhotos('fototravel', this.uid, this.numFoto).subscribe((res:any) =>{
        if(res.ok){
          this.namefile = res['nombrefoto'];
          this.totalFotos = res['long'];
          if(this.totalFotos == 1){
            this.iconoAlante = false;
          }
          this.cargar_imagen = false;
          this.namefile = this.viajeService.crearImagenUrl(this.namefile);
        }
      }, (err) => {
        this.cargar_imagen = false;
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        if(msgerror !== 'No hay imágenes en el array')
          Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      });

  }

  cambiarFotosAtras(){
    if(this.numFoto > 1){
      this.numFoto--;
      this.getPhoto();
    }
    this.iconoAlante = true;

    if(this.numFoto == 1){
      this.iconoAtras = false;
    }
    else{
      this.iconoAtras = true;
    }

  }

  cambiarFotosAlante(){
    if(this.numFoto < this.totalFotos){
      this.numFoto++;
      this.getPhoto();
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
  }

  fileChange(element) {
    this.uploadedFiles = element.target.files;
    if(this.uploadedFiles.length > 1){
      this.nameFileForm = this.uploadedFiles.length + ' archivos seleccionados';
    }
    else if (this.uploadedFiles.length == 1){
      this.nameFileForm = this.uploadedFiles[0].name;
    }
    else{
      this.nameFileForm = 'Seleccione los ficheros';
    }
  }

  upload() {
    this.wait_send_pictures = true;
    let formData = new FormData();
    if(this.uploadedFiles != undefined){
      for (var i = 0; i < this.uploadedFiles.length; i++) {
        formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
      }
      this.uploadservice.uploadPhotos(formData, 'fototravel', this.uid).subscribe((res)=> {
        this.wait_send_pictures = false;
        this.totalFotos += this.uploadedFiles.length;
        this.uploadedFiles = [];
        this.nameFileForm = 'Seleccione ficheros';
        if(this.numFoto == 0) { this.numFoto = 1; }
        this.cargarDatos();
      }, (err)=> {
        this.wait_send_pictures = false;
      });
    }
    else{
      return;
    }
  }

  deletePhoto(){
    this.cargar_imagen = true;
    this.uploadservice.deletePhoto('fototravel', this.uid, this.numFoto)
    .subscribe( res =>{
      if(this.numFoto === this.totalFotos){
        this.numFoto -= 1;
        this.iconoAlante = false;
      }
      this.totalFotos -= 1;
      if(this.totalFotos == 1){
        this.iconoAtras = false;
        this.iconoAlante = false;
      }
      this.cargar_imagen = false;
      this.cargarDatos();
    },(err) =>{
      this.cargar_imagen = false;
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });
  }

  confirmDeletePhoto(){
    Swal.fire({
      title: 'Eliminar imagen',
      text: `¿Estás seguro de que quieres eliminar esta imagen?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      allowOutsideClick: false,
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.deletePhoto();
          }
      });
  }

  cancelUpdatePictures(){
    this.uploadedFiles = [];
    this.nameFileForm = 'Seleccione ficheros';
  }

}
