import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Place } from 'src/app/models/place.model';
import { Review } from 'src/app/models/review.model';
import { PlaceService } from 'src/app/services/place.service';
import { ReviewService } from 'src/app/services/review.service';
import { UploadsService } from 'src/app/services/uploads.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    comment: ['', Validators.required ],
    review: ['',Validators.required],
    place: ['', Validators.required], //CAMBIAR A LISTA DE PUEBLOS
    //pictures: [''], //ARREGLAR OBJETO FOTOS
  });

  public datosFormNew = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    comment: ['', Validators.required ],
    review: ['',Validators.required],
    place: ['', Validators.required], //CAMBIAR A LISTA DE PUEBLOS
    pictures: ['', Validators.required], //ARREGLAR OBJETO FOTOS
  });

  public listPlaces: Place[] = [];
  public filterPlaces = new FormControl();
  public filteredOptions: Observable<Place[]>;
  public nameLugar:string = '';
  public submited = false;
  public uid: string = 'nuevo';
  public tipo: string = 'fotoreview';
  public waiting: boolean = false;
  public waiting_pictures: boolean = false;
  public totalFotos = 0;
  public numFoto = 1;
  public namefile = '';
  public nameFileForm = 'Seleccione ficheros';
  public iconoAtras = false;
  public iconoAlante = true;
  public cargar_imagen = false;
  public wait_form = false;
  public select_province = false;
  public uploadedFiles: Array <File> = [];

  constructor(private fb:FormBuilder,
              private reviewService:ReviewService,
              private uploadservice: UploadsService,
              private route: ActivatedRoute,
              private place: PlaceService,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['uid'];
    this.datosForm.get('uid')?.setValue(this.uid);
    this.cargarLugares();
    this.cargarDatos();
    if(this.uid !== 'nuevo') { this.wait_form = true; }
  }

  cargarLugares() {
    this.place.getAllPlaces()
      .subscribe((res:any) => {
          this.listPlaces = res['places'];
          if(this.uid === 'nuevo'){
            this.filteredOptions = this.filterPlaces.valueChanges.pipe(
              startWith(''),
              map(value => this.filtro()),
            );
          }
          else{
            this.filteredOptions = this.filterPlaces.valueChanges.pipe(
              startWith(''),
              map(value => this.filtroEdit()),
            );
          }
      }, (err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });
      });
  }

  private filtro(): Place[] {
    //const filterValue = value.province.toLowerCase();
    return this.listPlaces.filter(option => option.name.toLowerCase().includes(this.datosFormNew.value.place.toLowerCase()));
  }

  private filtroEdit(): Place[] {
    //const filterValue = value.province.toLowerCase();
    return this.listPlaces.filter(option => option.name.toLowerCase().includes(this.datosForm.value.place.toLowerCase()));
  }

  cargarDatos( ) {
    this.submited = false;
    if (this.uid !== 'nuevo') {
      this.reviewService.cargarReview(this.uid)
        .subscribe( (res:any) => {

          if (!res['revws']) {

            this.router.navigateByUrl('/admin/reviews');
            return;
          };

          this.datosForm.get('comment')?.setValue(res['revws'].comment);
          this.datosForm.get('review')?.setValue(res['revws'].review);
          //this.datosForm.get('place')?.setValue(res['revws'].place._id);
          //this.nameLugar= res['revws'].place.name;
          for(let x = 0; x < this.listPlaces.length; x++){
            if(this.listPlaces[x].uid === res['revws'].place._id){
              this.datosForm.get('place')?.setValue(this.listPlaces[x].name);
              break;
            }
          }

          if(res['revws'].pictures.length > 0) { this.getPhoto(); }

          if(this.iconoAlante == true && this.totalFotos === this.numFoto) { this.iconoAlante = false; }

          else if(this.totalFotos > 1 && this.totalFotos !== this.numFoto) { this.iconoAlante = true; }
          //this.datosForm.get('pictures')?.setValue(res['rvws'].pictures);
          this.datosForm.markAsPristine();
          this.submited = true;
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
          this.router.navigateByUrl('/admin/reviews');
          Swal.fire({icon: 'error', title: 'Oops...', html: error_midle,});
          return;
        });
    } else {
      this.datosForm.get('revws')?.setValue('');
      this.datosForm.markAsPristine();
    }

  }

  uploadForNewReview(idReview: string) {
    this.uid = this.route.snapshot.params['uid'];
    let formData = new FormData();
    for (var i = 0; i < this.uploadedFiles.length; i++) {
      formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
    }
    this.uploadservice.uploadPhotos(formData, this.tipo, idReview).subscribe((res)=> {
      this.uploadedFiles = [];
      Swal.fire({
        title: 'Valoración creada', text: `Has creado la valoración con éxito`, icon: 'success',
        allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
      });
      this.datosFormNew.markAsPristine();
      this.waiting = false;
    }, (err) => {
      this.reviewService.eliminarReview(idReview).subscribe();
      this.waiting = false;
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });

  }

  newReview(){
    this.submited = true;
    if (this.datosFormNew.invalid) { return; }
    this.waiting = true;
    for(let i = 0; i < this.listPlaces.length; i++){
      if(this.listPlaces[i].name === this.datosFormNew.value.place){
        this.datosFormNew.value.place = this.listPlaces[i].uid;
        break;
      }
    }
      this.reviewService.crearReview( this.datosFormNew.value )
        .subscribe( (res:any) => {
          if(this.uploadedFiles != undefined){
            if(this.uploadedFiles.length > 0){
              this.uploadForNewReview(res['revw'].uid);
            }
            else{
              Swal.fire({
                title: 'Valoración creada', text: `Has creado la valoración con éxito`, icon: 'success',
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
            error_midle += '<p> Los errores son los siguientes: ';
            if(err.error.err.review){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.review.msg}`;
            }
            error_midle += '</p>';
          }
          if(error_midle === ''){
            error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
          }
          const msgerror = err.error.msg || error_midle;
          Swal.fire({icon: 'error', title: 'Oops...', html: msgerror,});
        });

  }

  enviar() {
    this.submited = true;
    if (this.datosForm.invalid) { return; }
    this.waiting = true;

    // Enviamos el identificador del nombre del lugar de interes
    for(let i = 0; i < this.listPlaces.length; i++){
      if(this.listPlaces[i].name === this.datosForm.value.place){
        this.datosForm.value.place = this.listPlaces[i].uid;
        break;
      }
    }
      // ACtualizamos

    this.reviewService.actualizarReview( this.datosForm.get('uid')?.value, this.datosForm.value)
      .subscribe( res => {
        this.datosForm.markAsPristine();
        this.waiting = false;
      }, (err) => {
        this.waiting = false;
        let error_midle = '';
          if(err.error.err){
            error_midle += '<p> Los errores son los siguientes: ';
            if(err.error.err.review){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.review.msg}`;
            }
            error_midle += '</p>';
          }
          if(error_midle === ''){
            error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
          }
          const msgerror = err.error.msg || error_midle;
        Swal.fire({icon: 'error', title: 'Oops...', html: msgerror,});
      });

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
      this.router.navigateByUrl('/admin/reviews');
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
    if(this.datosFormNew.get('place')?.value.length > 0 || this.datosForm.get('place')?.value.length > 0){
      this.select_province =true;
    }
  }

  selectProvinceTrue(){
    let value_province = this.datosFormNew.get('place')?.value || this.datosForm.get('place')?.value || '';
    for(let i = 0; i < this.listPlaces.length; i++){
      if(this.listPlaces[i].name == value_province){
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
          this.namefile = this.reviewService.crearImagenUrl(this.namefile);
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

}
