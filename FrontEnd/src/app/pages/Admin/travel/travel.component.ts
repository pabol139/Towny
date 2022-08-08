import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//import { Console } from 'console';
import { TravelService } from 'src/app/services/travel.service';
import { UserService } from 'src/app/services/user.service';
import { Place } from 'src/app/models/place.model';
import { User } from 'src/app/models/user.model';
import { PlaceService } from 'src/app/services/place.service';
import Swal from 'sweetalert2';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { UploadsService } from 'src/app/services/uploads.service';
import { Console } from 'console';
import { runInThisContext } from 'vm';

@Component({
  selector: 'app-travel',
  templateUrl: './travel.component.html',
  styleUrls: ['./travel.component.css']
})
export class TravelComponent implements OnInit {

  public selectedItems = [];

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    name: ['', Validators.required ],
    description: [''],
    places: [[]],
  });

  public datosFormNew = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    name: ['', Validators.required ],
    pictures: ['', Validators.required],
    description: ['', Validators.required],
    places: [[]],
  });

  public listaRegistros: Place[] = [];
  public listaRegistrosSel: Place[] = [];
  public listaRegistros1: User[] = [];
  public submited = false;
  public uid: string = 'nuevo';
  public tipo: string = 'fototravel';
  public namefile = '';
  public nameFileForm = '';
  public waiting = false;
  public waiting_pictures = false;
  dropdownSettings = {};
  public numFoto = 1;
  public totalFotos: number = 0;
  public iconoAtras = false;
  public iconoAlante = true;
  public cargar_imagen = false;
  public wait_form = false;
  public uploadedFiles: Array <File> = [];

  constructor( private fb: FormBuilder,
               private viajeService: TravelService,
               private route: ActivatedRoute,
               private router: Router,
               private userService: UserService,
               private placeService: PlaceService,
               private uploadservice: UploadsService) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['uid'];
    this.datosForm.get('uid')?.setValue(this.uid);
    //this.cargarUser('');
    //this.cargarLugares('');
    this.nameFileForm = 'Seleccione ficheros';
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'uid',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      limitSelection: 5
    };

    // recogemos el parametro
    this.uid = this.route.snapshot.params['uid'];
    if(this.uid !== 'nuevo') { this.wait_form = true; }

    this.placeService.getAllPlaces()
      .subscribe((res:any) => {

        if (res['places'].length === 0) {

        } else {
          this.listaRegistros = res['places'];

          this.cargarDatos();
        }

      }, (err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });
      });
  }

  nuevo(): void {
    this.uid = 'nuevo';
    this.datosForm.reset();
    this.datosForm.get('uid')?.setValue('nuevo');
    this.submited = false;
    this.datosForm.markAsPristine();
  }

  esnuevo(): boolean {
    if (this.datosForm.get('uid')?.value==='nuevo') return true;
    return false;
  }

  getUID(){
    return this.uid;
  }

  cargarDatos(): void {
    if(this.uid !== 'nuevo'){
      this.datosForm.get('uid')?.setValue(this.uid);
    }
    if (this.uid !== 'nuevo') {
      this.viajeService.cargarTravel(this.uid)
        .subscribe( (res:any) => {
          if (!res['travels']) {
            this.router.navigateByUrl('/admin/travels');
            return;
          };
          this.datosForm.get('uid')?.setValue(res['travels'].uid);
          this.datosForm.get('name')?.setValue(res['travels'].name);
          this.datosForm.get('pictures')?.setValue(res['travels'].pictures);
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
          this.router.navigateByUrl('/admin/travels');
          Swal.fire({icon: 'error', title: 'Oops...', html: error_midle,});
          return;
        });
    }

  }

  cancelar() {
    if (this.uid === 'nuevo') {
      this.router.navigateByUrl('/admin/travels');
    } else {
    }
  }

  createNewTravel(): void{
    this.submited = true;
    if (this.datosFormNew.invalid) { return; }
    this.waiting = true;
    // Si estamos creando uno nuevo

    this.datosFormNew.value.places= this.listaRegistrosSel;
    this.viajeService.newTravel( this.datosFormNew.value)
      .subscribe( (res:any) => {
        if(this.uploadedFiles != undefined){
          if(this.uploadedFiles.length > 0){
            this.uploadForNewTravel(res['travel'].uid, res['travel'].name);
          }
          else{
            Swal.fire({
              title: 'Viaje creado', text: `Has creado el viaje ${res['travel'].name} con éxito`, icon: 'success',
              allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
            });
            this.datosFormNew.markAsPristine();
            this.waiting = false;
          }
        }
      }, (err) => {
        this.waiting = false;
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      });

  }

  uploadForNewTravel(idtravel: string, nombretravel: string) {
    this.uid = this.route.snapshot.params['uid'];
    let formData = new FormData();
    for (var i = 0; i < this.uploadedFiles.length; i++) {
      formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
    }
    this.uploadservice.uploadPhotos(formData, this.tipo, idtravel).subscribe((res)=> {
      this.uploadedFiles = [];
      Swal.fire({
        title: 'Viaje creado', text: `Has creado el viaje ${nombretravel} con éxito`, icon: 'success',
        allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
      });
      this.datosFormNew.markAsPristine();
      this.waiting = false;
    }, (err) => {
      this.viajeService.eliminarTravel(idtravel).subscribe();
      this.waiting = false;
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });

  }

  enviar(): void {
    this.submited = true;
    if (this.datosForm.invalid) { return; }
    this.waiting = true;
    // Si estamos creando uno nuevo
    // ACtualizamos
    let soloIdsPlaces = [];
    for(let i=0;i<this.listaRegistrosSel.length;i++){
      soloIdsPlaces[i] = this.listaRegistrosSel[i].uid;
    }
    this.datosForm.value.places= this.listaRegistrosSel;

    this.viajeService.updateTravel( this.datosForm.get('uid')?.value, this.datosForm.value)
      .subscribe( res => {
        this.datosForm.markAsPristine();
        this.waiting = false;
        Swal.fire({
          title: 'Viaje editado', text: `Has editado el viaje ${res['travel'].name} con éxito`, icon: 'success',
          allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
        });
      }, (err) => {
        this.waiting = false;
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      });
  }

  campoNoValido( campo: string) {
    return this.datosForm.get(campo)?.invalid && this.submited;
  }

  campoNoValidoNew( campo: string) {
    return this.datosFormNew.get(campo)?.invalid && this.submited;
  }

  cargarLugares( texto: string ) {
    this.placeService.getAllPlaces()
      .subscribe((res:any) => {

        if (res['places'].length === 0) {

        } else {
          this.listaRegistros = res['places'];
        }

      }, (err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });
      });
  }

  getPhoto(){
      this.cargar_imagen = true;

      this.uploadservice.getPhotos(this.tipo, this.uid, this.numFoto).subscribe((res:any) =>{
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
    this.waiting_pictures = true;
    this.uid = this.route.snapshot.params['uid'];
    let formData = new FormData();
    if(this.uploadedFiles != undefined){
      for (var i = 0; i < this.uploadedFiles.length; i++) {
        formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
      }
      this.uploadservice.uploadPhotos(formData, this.tipo, this.uid).subscribe((res)=> {
        this.waiting_pictures = false;
        this.totalFotos += this.uploadedFiles.length;
        this.uploadedFiles = [];
        this.nameFileForm = 'Seleccione ficheros';
        if(this.numFoto == 0) { this.numFoto = 1; }
        this.cargarDatos();
      }, (err)=> {
        this.waiting_pictures = false;
      });
    }
    else{
      return;
    }
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

  deletePhoto(){
    this.cargar_imagen = true;
    this.uploadservice.deletePhoto(this.tipo, this.uid, this.numFoto)
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

  cancelUpdatePictures(){
    this.uploadedFiles = [];
    this.nameFileForm = 'Seleccione ficheros';
  }

  cargarUser( texto: string ) {
    this.userService.getAllUsers()
      .subscribe((res:any) => {

        if (res['users'].length === 0) {

        } else {
          this.listaRegistros1 = res['users'];

        }

      }, (err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });
  }

  onItemSelect(item:any){
    this.listaRegistrosSel.push(item.uid);
  }

  onItemDeSelect(item:any){
    if(this.uid != 'nuevo'){
      this.placeService.getPlaces(0, item.name).subscribe( res => {
        //CAMBIAR ESTO
        this.removeItemFromArr(this.listaRegistrosSel, res['places'][0].uid);
      });
    }
    else{
      for(let i = 0; i< this.listaRegistrosSel.length;i++){
        if(this.listaRegistrosSel[i].toString() == item.uid){
          this.listaRegistrosSel.splice(i, 1);
          break;
        }
      }
    }
    //this.removeItemFromArr(this.listaRegistrosSel,item.uid);
  }

  removeItemFromArr ( arr, item ) {
    var i = -1;
    for (let j = 0; j < arr.length; j++){
      if(arr[j]._id == item){
        i = j;
        break;
      }
    }
    if ( i !== -1 ) {
        arr.splice( i, 1 );
    }
}

}

