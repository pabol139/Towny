/// <reference path="../../../../assets/types/MicrosoftMaps/Microsoft.Maps.d.ts" />

import { Component, ElementRef, OnInit, ViewChild, NgZone, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Pueblo } from 'src/app/models/pueblo.model';
import { PlaceService } from 'src/app/services/place.service';
import { PuebloService } from 'src/app/services/pueblo.service';
import { UploadsService } from 'src/app/services/uploads.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comercio',
  templateUrl: './comercio.component.html',
  styleUrls: ['./comercio.component.css']
})
export class ComercioComponent implements AfterViewInit {

  public estado = '';

  public datosForm = this.fb.group({
    uid: [{value: '', disabled: true}, Validators.required],
    fb: [{value: '', disabled: true}],
    name: ['', Validators.required ],
    location: ['',Validators.required],
    mobile_number: ['',Validators.required],
    description: ['', Validators.required],
    type: ['', Validators.required],
    web: [''],
    status: [''],
    schedule: [''],
    model: ['', Validators.required],
    town: ['', Validators.required],
    premium: ['', Validators.required]
  });

  public datosFormNew = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    name: ['', Validators.required ],
    location: ['',Validators.required],
    mobile_number: ['',Validators.required],
    description: [''],
    type: ['',Validators.required],
    web: [''],
    status: [''],
    schedule: [''],
    model: [0],
    pictures:['', Validators.required],
    town: ['', Validators.required],
    premium: ['', Validators.required]
  });

  public numFoto = 1;
  public totalFotos: number = 0;
  public submited = false;
  public uid: string = 'nuevo';
  public listaRegistros: Pueblo[] = [];
  public filterTowns = new FormControl();
  public filteredOptions: Observable<Pueblo[]>;
  public tipo: string = 'fotoplace';
  public namefile = '';
  public nameFileForm = 'Seleccione ficheros';
  public selectedOption = '';
  public selectedOption2 = '';
  public waiting = false;
  public waiting_pictures = false;
  public iconoAtras = false;
  public iconoAlante = true;
  public uploadedFiles: Array <File> = [];
  public cargar_imagen = false;
  public wait_form = false;
  public name_model: string [];
  public number_model = 0;
  public numbermodel = 0;

  constructor(private fb:FormBuilder,
              private placeService:PlaceService,
              private route: ActivatedRoute,
              private router: Router,
              private puebloService:PuebloService,
              private uploadservice: UploadsService,
              private NgZone: NgZone,) { }

  ngAfterViewInit(): void {

    // recogemos el parametro
    this.uid = this.route.snapshot.params['uid'];
    this.datosForm.get('uid')?.setValue(this.uid);
    if(this.uid === 'nuevo'){
      this.datosFormNew.get('premium').disable();
      this.datosFormNew.get('model').disable();
    }
    if(this.uid !== 'nuevo') { this.wait_form = true; }
    this.cargarPueblos();
    this.cargarDatos();

      const onLoadBingMaps = () => {
        var options = { maxResults: 5, businessSuggestions: true};
        var manager = new Microsoft.Maps.AutosuggestManager(options);
        if(this.uid!='nuevo' && this.uid!=undefined && this.uid!=''){
          var checkExist = setInterval(() => {
            if (document.querySelector("#searchBoxContainer2")) {
              manager.attachAutosuggest('#location2', '#searchBoxContainer2', selectedSuggestion);
               clearInterval(checkExist);
            }
          }, 100);
        }else{
          manager.attachAutosuggest('#location', '#searchBoxContainer', selectedSuggestion);
        }
      }

      function onErrorBingMaps(message) {
      }

      const selectedSuggestion = (suggestionResult) => {
        let calle = suggestionResult.address.addressLine + ', ' + suggestionResult.address.postalCode;
        if(this.uid!='nuevo' && this.uid!=undefined && this.uid!=''){
          this.datosForm.get('location')?.setValue(calle);
        }else{
          this.datosFormNew.get('location')?.setValue(calle);
        }
      }

      Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', {
        callback: onLoadBingMaps,
        errorCallback: onErrorBingMaps
      });
  }

  changeOptions(){
    this.datosFormNew.get('premium').enable();
    this.datosFormNew.get('model').enable();
    this.choseModels(this.datosFormNew.get('type').value);
  }

  changeOptions2(){
    this.choseModels(this.datosForm.get('type').value);
  }

  choseModels(str: string){
    //../../../../assets/models_picture/${ART_AND_CULTURE}_model_1.jpeg
    switch (str) {
      case 'ART_AND_CULTURE':
        this.name_model = ['', '', ''];
        for(let i = 0; i< 3; i++){
          var x = i + 1;
          this.name_model[i] = `/../../../../assets/models_picture/${str}_model_${x}.jpg`;
        }
        break;

      case 'CHURCH_PLACES':
        this.name_model = [''];
        for(let i = 0; i< 1; i++){
          var x = i + 1;
          this.name_model[i] = `/../../../../assets/models_picture/${str}_model_${x}.jpg`;
        }
        break;

      case 'COMMERCES':
        this.name_model = ['', ''];
        for(let i = 0; i< 2; i++){
          var x = i + 1;
          this.name_model[i] = `/../../../../assets/models_picture/${str}_model_${x}.jpg`;
        }
        break;

      case 'ENTERTAINMENT':
        this.name_model = ['', ''];
        for(let i = 0; i< 2; i++){
          var x = i + 1;
          this.name_model[i] = `/../../../../assets/models_picture/${str}_model_${x}.jpg`;
        }
        break;

      case 'GREEN_ZONE':
        this.name_model = ['', ''];
        for(let i = 0; i< 2; i++){
          var x = i + 1;
          this.name_model[i] = `/../../../../assets/models_picture/${str}_model_${x}.jpg`;
        }
        break;

      case 'MONUMENTS':
        this.name_model = ['', ''];
        for(let i = 0; i< 2; i++){
          var x = i + 1;
          this.name_model[i] = `/../../../../assets/models_picture/${str}_model_${x}.jpg`;
        }
        break;

      case 'RESTAURANT':
        this.name_model = ['', '', '', ''];
        for(let i = 0; i< 4; i++){
          var x = i + 1;
          this.name_model[i] = `/../../../../assets/models_picture/${str}_model_${x}.jpg`;
        }
        break;

      default:
        break;
    }

  }

  private filtro(): Pueblo[] {
    return this.listaRegistros.filter(option => option.name.toLowerCase().includes(this.datosFormNew.value.town.toLowerCase()));
  }

  private filtroEdit(): Pueblo[] {
    return this.listaRegistros.filter(option => option.name.toLowerCase().includes(this.datosForm.value.town.toLowerCase()));
  }

  cargarPueblos() {
    this.puebloService.cargarAllPueblos()
      .subscribe((res:any) => {
        if (res['towns'].length > 0) {
          this.listaRegistros = res['towns'];
          if(this.uid === 'nuevo'){
            this.filteredOptions = this.filterTowns.valueChanges.pipe(
              startWith(''),
              map(value => this.filtro()),
            );
          }
          else{
            this.filteredOptions = this.filterTowns.valueChanges.pipe(
              startWith(''),
              map(value => this.filtroEdit()),
            );
          }
        }
      }, (err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });

      });
  }

  cargarDatos(): void {
    this.submited = false;
    if (this.uid !== 'nuevo') {
      this.placeService.getPlace(this.uid)
          .subscribe( (res:any) => {
            if (!res['places']) {
              this.router.navigateByUrl('/commerce/comercios');
              return;
            };
            //this.datosForm.get('uid')?.setValue(res['places'].uid);
            this.datosForm.get('fb')?.setValue(res['places'].fb);
            this.datosForm.get('name')?.setValue(res['places'].name);
            this.datosForm.get('user')?.setValue(res['places'].user);
            this.datosForm.get('location')?.setValue(res['places'].location);
            this.datosForm.get('mobile_number')?.setValue(res['places'].mobile_number);
            this.datosForm.get('description')?.setValue(res['places'].description);
            this.selectedOption = res['places'].type;
            this.selectedOption2 = res['places'].premium;
            this.numbermodel = res['places'].model;
            this.datosForm.get('model')?.setValue(res['places'].model);
            this.datosForm.get('type')?.setValue(res['places'].type);
            this.changeOptions2();
            this.datosForm.get('premium')?.setValue(res['places'].premium);
            this.datosForm.get('web')?.setValue(res['places'].web);
            this.datosForm.get('status')?.setValue(res['places'].status);
            this.estado = (res['places'].status);
            this.datosForm.get('schedule')?.setValue(res['places'].schedule);
            this.datosForm.get('visits')?.setValue(res['places'].visits);
            for(let x = 0; x < this.listaRegistros.length; x++){
              if(this.listaRegistros[x].uid === res['places'].town._id){
                this.datosForm.get('town')?.setValue(this.listaRegistros[x].name);
                break;
              }
            }
            this.datosForm.get('visits')?.disable();
            this.datosForm.markAsPristine();

            if(res['places'].pictures.length > 0)
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
        this.router.navigateByUrl('/commerce/comercios');
        Swal.fire({icon: 'error', title: 'Oops...', html: error_midle,});
        return;
      });
    }
  }

  newPlace(){
    this.submited = true;

    if (this.datosFormNew.invalid) { return; }
    // Diferenciar entre dar de alta uno nuevo o actualizar uno que ya existe
    this.waiting = true;

    for(let i = 0; i < this.listaRegistros.length; i++){
      if(this.listaRegistros[i].name === this.datosFormNew.value.town){
        this.datosFormNew.value.town = this.listaRegistros[i].uid;
        break;
      }
    }

    this.placeService.newPlace(this.datosFormNew.value )
      .subscribe( (res: any) => {
        if(res.ok && this.uploadedFiles != undefined){
          if(this.uploadedFiles.length > 0){
            this.uploadForNewPlace(res['place'].uid, res['place'].name);
          }
          else{
            Swal.fire({
              title: 'Lugar creado', text: `Has creado el lugar "${res['place'].name}" con éxito`, icon: 'success',
              allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
            });
            this.datosFormNew.markAsPristine();
            this.waiting = false;
          }
        }
      }, (err) => {
        this.waiting = false;
        let error_midle = '';
          if(err.error.err){
            error_midle += '<p> Los errores del formulario son los siguientes: ';
            if(err.error.err.mobile_number){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.mobile_number.msg}`;
            }
            error_midle += '</p>';
          }
          if(error_midle === ''){
            error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
          }
        const errtext = err.error.msg || error_midle;
        Swal.fire({icon: 'error', title: 'Oops...', html: errtext});
        return;
      });

}

  uploadForNewPlace(idPlace: string, namePlace) {
    this.uid = this.route.snapshot.params['uid'];
    let formData = new FormData();
    for (var i = 0; i < this.uploadedFiles.length; i++) {
      formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
    }
    this.uploadservice.uploadPhotos(formData, this.tipo, idPlace).subscribe((res)=> {
      this.uploadedFiles = [];
      Swal.fire({
        title: 'Lugar creado', text: `Has creado el lugar "${namePlace}" con éxito`, icon: 'success',
        allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
      });
      this.datosFormNew.markAsPristine();
      this.waiting = false;
    }, (err) => {
      this.placeService.deletePlace(idPlace).subscribe();
      this.waiting = false;
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });

  }

  enviar(): void {
    this.submited = true;

    if (this.datosForm.invalid) { return; }
    // Diferenciar entre dar de alta uno nuevo o actualizar uno que ya existe
    this.waiting = true;
    //Enviar el identificador del pueblo y no el nombre
    for(let i = 0; i < this.listaRegistros.length; i++){
      if(this.listaRegistros[i].name === this.datosForm.value.town){
        this.datosForm.value.town = this.listaRegistros[i].uid;
        break;
      }
    }

    // Alta de uno nuevo
     if(this.datosForm.get('uid')?.value !== 'nuevo') {
      // actualizar el usuario
      this.placeService.updatePlace( this.datosForm.get('uid')?.value, this.datosForm.value )
        .subscribe( res => {
          this.datosForm.markAsPristine();
          this.waiting = false;
        }, (err) => {
          this.waiting = false;
          let error_midle = '';
          if(err.error.err){
            error_midle += '<p> Los errores del formulario son los siguientes: ';
            if(err.error.err.mobile_number){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.mobile_number.msg}`;
            }
            error_midle += '</p>';
          }
          if(error_midle === ''){
            error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
          }
        const errtext = err.error.msg || error_midle;
          Swal.fire({icon: 'error', title: 'Oops...', html: errtext});
          return;
        });
    }

  }

  nuevo() {
    this.submited = false;
    this.datosFormNew.reset();
    this.uid = 'nuevo';
    this.datosFormNew.get('uid')?.setValue('nuevo');
    this.router.navigateByUrl('/commerce/comercios/comercio/nuevo');
  }

  cancelar(): void {
    // Si estamos creando uno nuevo, vamos a la lista
    if (this.datosFormNew.get('uid')?.value === 'nuevo') {
      this.router.navigateByUrl('/commerce/comercios');
      return;
    } else {
      this.placeService.getPlace(this.datosForm.get('uid')?.value)
      .subscribe( (res:any) => {
        // Si al tratar de cargar de nuevo los datos no hay, vamos a lista
        if (!res['places']) {
          this.router.navigateByUrl('/commerce/comercios');
          return;
        };
        // Restablecemos los datos del formulario en el formulario
        this.cargarDatos();
      }, (err) => {
        this.router.navigateByUrl('/commerce/comercios');
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
      });
    }
  }

  campoNoValido( campo: string) {
    return this.datosForm.get(campo)?.invalid && this.submited;
  }

  campoNoValidoNew( campo: string) {
    return this.datosFormNew.get(campo)?.invalid && this.submited;
  }

  esnuevo(): boolean {
    if (this.datosForm.get('uid')?.value === 'nuevo') { return true; }
    return false;
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
          this.namefile = this.placeService.crearImagenUrl(this.namefile);
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
      this.nameFileForm = 'Seleccione los ficheros'
    }
  }

  upload() {
      this.waiting_pictures = true;
      this.uid = this.route.snapshot.params['uid'];
      let formData = new FormData();
      if(this.uploadedFiles != undefined){
        if(this.uploadedFiles.length === 0){ this.waiting_pictures = false; return; }
        for (var i = 0; i < this.uploadedFiles.length; i++) {
          formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
          this.namefile += this.uploadedFiles[i].name;
        }
        this.uploadservice.uploadPhotos(formData, this.tipo, this.uid).subscribe((res)=> {
          this.totalFotos += this.uploadedFiles.length;
          this.nameFileForm = 'Seleccione ficheros';
          if(this.numFoto == 0) { this.numFoto = 1; }
          this.cargarDatos();
          this.uploadedFiles = [];
          this.waiting_pictures = false;
        }, (err)=> {
          this.waiting_pictures = false;
        });
      }
      else{
        return;
      }
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
      });
    }

    cancelUpdatePictures(){
      this.uploadedFiles = [];
      this.nameFileForm = 'Seleccione ficheros';
    }

}


