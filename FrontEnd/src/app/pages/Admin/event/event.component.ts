import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Pueblo } from 'src/app/models/pueblo.model';
import { EventService } from 'src/app/services/event.service';
import { PuebloService } from 'src/app/services/pueblo.service';
import { UploadsService } from 'src/app/services/uploads.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {

  public datosForm = this.fb.group({
    uid: [{value: '', disabled: true}, Validators.required],
    name: ['', Validators.required ],
    description: ['',Validators.required],
    date: ['', Validators.required],
    town: ['', Validators.required]
  });

  public datosFormNew = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    name: ['', Validators.required ],
    description: ['',Validators.required],
    date: ['',Validators.required],
    pictures: ['', Validators.required],
    town: ['', Validators.required],
  });

  //public listaRegistros: Provincia[] = [];
  public numFoto = 1;
  public totalFotos: number = 0;
  public submited = false;
  public listaPueblos: Pueblo[] = [];
  public filterTowns = new FormControl();
  public filteredOptions: Observable<Pueblo[]>;
  public uid: string = 'nuevo';
  public tipo: string = 'fotoevento';
  public namefile = '';
  public nameFileForm = 'Seleccione ficheros';
  public waiting = false;
  public waiting_picture = false;
  public iconoAtras = false;
  public iconoAlante = true;
  public cargar_imagen = false;
  public wait_form = false;
  public select_province = false;
  public uploadedFiles: Array <File> = [];

  constructor(private fb:FormBuilder,
              private eventService:EventService,
              private route: ActivatedRoute,
              private router: Router,
              private uploadservice: UploadsService,
              private puebloService: PuebloService) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['uid'];
    this.datosForm.get('uid')?.setValue(this.uid);
    if(this.uid !== 'nuevo') { this.wait_form = true; }
    //this.cargarDatos();
    this.cargarPueblos();
    this.cargarDatos();
  }

  private filtro(): Pueblo[] {
    //const filterValue = value.province.toLowerCase();
    return this.listaPueblos.filter(option => option.name.toLowerCase().includes(this.datosFormNew.value.town.toLowerCase()));
  }

  private filtroEdit(): Pueblo[] {
    //const filterValue = value.province.toLowerCase();
    return this.listaPueblos.filter(option => option.name.toLowerCase().includes(this.datosForm.value.town.toLowerCase()));
  }

  cargarPueblos() {
    this.puebloService.cargarAllPueblos()
      .subscribe((res:any) => {
        if (res['towns'].length > 0) {
          this.listaPueblos = res['towns'];
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

  cargarDatos() {
    this.submited = false;
    if (this.uid !== 'nuevo') {
      this.eventService.getEvent(this.uid)
        .subscribe( (res:any) => {
          if (!res['events']) {
            this.router.navigateByUrl('/admin/events');
            return;
          };
          var dt = new Date(res['events'].date);
          this.datosForm.get('name')?.setValue(res['events'].name);
          var splits = res['events'].date.split('-');
          var splits2 = splits[2].split('T');
          var year = splits[0];
          var month = splits[1];
          var day = splits2[0];

          this.datosForm.get('date')?.setValue(year+'-'+month+'-'+day);
          this.datosForm.get('description')?.setValue(res['events'].description);
          this.datosForm.get('pictures')?.setValue(res['events'].pictures);
          for(let x = 0; x < this.listaPueblos.length; x++){
            if(this.listaPueblos[x].uid === res['events'].town._id){
              this.datosForm.get('town')?.setValue(this.listaPueblos[x].name);
              break;
            }
          }
          this.datosForm.markAsPristine();
          this.submited = true;
          if(res['events'].pictures.length > 0)
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
          this.router.navigateByUrl('/admin/events');
          Swal.fire({icon: 'error', title: 'Oops...', html: error_midle,});
          return;
        });
    } else {
      this.datosFormNew.get('events')?.setValue('');
      this.datosFormNew.markAsPristine();
    }

  }

  newEvent(){
    this.submited = true;
    if (this.select_province) { return; }
    if (this.datosFormNew.invalid) { return; }
    this.waiting = true;
    for(let i = 0; i < this.listaPueblos.length; i++){
      if(this.listaPueblos[i].name === this.datosFormNew.value.town){
        this.datosFormNew.value.town = this.listaPueblos[i].uid;
        break;
      }
    }

    this.eventService.createEvent( this.datosFormNew.value )
        .subscribe( (res:any) => {

          if(this.uploadedFiles != undefined){
            if(this.uploadedFiles.length > 0){
              this.uploadForNewEvent(res['event'].uid, res['event'].name);
            }
            else{
              Swal.fire({
                title: 'Evento creado', text: `Has creado el evento "${res['event'].name}" con éxito`, icon: 'success',
                allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
              });
              this.datosFormNew.markAsPristine();
              this.waiting = false;
            }
          }

        }, (err) => {
          let error_midle = '';
          if(err.error.err){
            error_midle += '<p> Los errores del formulario son los siguientes: ';
            if(err.error.err.date){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.date.msg}`;
            }
            if(err.error.err.description){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.description.msg} `;
            }
            error_midle += '</p>';
          }
          if(error_midle === ''){
            error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
          }
          this.waiting = false;
          const msgerror = err.error.msg || error_midle;
          Swal.fire({icon: 'error', title: 'Oops...', html: msgerror,});
        });

  }

  uploadForNewEvent(idEvent: string, nameEvent: string) {
    this.uid = this.route.snapshot.params['uid'];
    let formData = new FormData();
    for (var i = 0; i < this.uploadedFiles.length; i++) {
      formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
    }
    this.uploadservice.uploadPhotos(formData, this.tipo, idEvent).subscribe((res)=> {
      this.uploadedFiles = [];
      Swal.fire({
        title: 'Evento creado', text: `Has creado el evento "${nameEvent}" con éxito`, icon: 'success',
        allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
      });
      document.getElementById('fotosubidas').innerHTML = 'Seleccione los ficheros';
      this.datosFormNew.markAsPristine();
      this.waiting = false;
    }, (err) => {
      this.eventService.deleteEvent(idEvent).subscribe();

      this.waiting = false;
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });

  }

  updateEvent() {
    this.submited = true;
    if (this.select_province) { return; }
    if (this.datosForm.invalid) { return; }
    this.waiting = true;
    // Si estamos creando uno nuevo
    //Enviar el identificador del pueblo y no el nombre
      for(let i = 0; i < this.listaPueblos.length; i++){
        if(this.listaPueblos[i].name === this.datosForm.value.town){
          this.datosForm.value.town = this.listaPueblos[i].uid;
          break;
        }
      }
      // ACtualizamos
      this.eventService.updateEvent( this.datosForm.get('uid')?.value, this.datosForm.value)
        .subscribe( res => {
          this.datosForm.markAsPristine();
          this.waiting = false;
        }, (err) => {
          let error_midle = '';
          if(err.error.err){
            error_midle += '<p> Los errores del formulario son los siguientes: ';
            if(err.error.err.date){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.date.msg}`;
            }
            if(err.error.err.description){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.description.msg} `;
            }
            error_midle += '</p>';
          }
          if(error_midle === ''){
            error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
          }
          this.waiting = false;
          const msgerror = err.error.msg || error_midle;
          Swal.fire({icon: 'error', title: 'Oops...', html: msgerror,});
        })

  }

  nuevo() {
    this.uid = 'nuevo';
    this.datosFormNew.reset();
    this.datosFormNew.get('uid')?.setValue('nuevo');
    this.submited = false;
    this.datosFormNew.markAsPristine();
  }

  cancelar() {
    if (this.uid === 'nuevo') {
      this.router.navigateByUrl('/admin/events');
    } else {
      this.cargarDatos();
    }
  }

  campoNoValido( campo: string) {
    return this.datosForm.get(campo)?.invalid && this.submited;
  }

  campoNoValidoNew( campo: string) {
    return this.datosFormNew.get(campo)?.invalid && this.submited;
  }

  selectProvince(){
    if(this.datosFormNew.get('town')?.value.length > 0 || this.datosForm.get('town')?.value.length > 0){
      this.select_province =true;
    }
  }

  selectProvinceTrue(){
    let value_province = this.datosFormNew.get('town')?.value || this.datosForm.get('town')?.value || '';
    for(let i = 0; i < this.listaPueblos.length; i++){
      if(this.listaPueblos[i].name == value_province){
        this.select_province = false;
        //document.getElementById('province').classList.remove('is-invalid2');
      }
    }
  }

  selectProvinceTrueKey(event){
    if(event.keyCode == 13 || event.code == 'Enter'){
      this.selectProvinceTrue();
    }
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
          this.namefile = this.eventService.crearImagenUrl(this.namefile);
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
      this.waiting_picture = true;
      this.uid = this.route.snapshot.params['uid'];
      let formData = new FormData();
      if(this.uploadedFiles != undefined){
        if(this.uploadedFiles.length === 0){ this.waiting_picture = false; return; }
        for (var i = 0; i < this.uploadedFiles.length; i++) {
          formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
        }

        this.uploadservice.uploadPhotos(formData, this.tipo, this.uid).subscribe((res)=> {
          this.waiting_picture = false;
          this.totalFotos += this.uploadedFiles.length;
          this.uploadedFiles = [];
          this.nameFileForm = 'Seleccione ficheros';
          if(this.numFoto == 0) { this.numFoto = 1; }
          this.cargarDatos();
        }, (err)=> {
          this.waiting_picture = false;
        });
      }
      else{
        this.waiting_picture = false;
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

}
