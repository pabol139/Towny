import { Component, OnInit, } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalService } from 'src/app/commons/modal';
import { ReviewService } from 'src/app/services/review.service';
import { UploadsService } from 'src/app/services/uploads.service';
import Swal from 'sweetalert2';
//import { EventEmitter } from 'stream';
//import { EventEmitter } from 'events';

@Component({
  selector: 'test-valoracion',
  templateUrl: './valoracion.component.html',
  styleUrls: ['./valoracion.component.css']
})
export class ValoracionComponent implements OnInit {

  /* Crear review */

  public createReview = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    comment: ['', Validators.required ],
    //review: ['',Validators.required],
    //place: ['', Validators.required]
  });

  public imagenUrl = [];
  public waiting: boolean = false;
  public submited = false;
  public valueReview = 1;
  public file: File [] = [];
  public waiting_pictures = false;
  public uid_place: string = '';

  constructor(private fb: FormBuilder,
              private reviewService: ReviewService,
              private uploadService: UploadsService,
              private modalService :ModalService
             ) {




             }

  ngOnInit(): void {
    this.updateStars(1);
    /*setTimeout(() => {
      this.newReview();
    }, 1000);*/
  }

  closeModal() {
    this.cancelar();
    this.modalService.close('newValoracion');
  }

  cancelar(){
    this.createReview.get('comment').setValue('');
    this.file = [];
    this.updateStars(1);
  }

  deleteFileUpload(event: number){

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

  campoNoValidoNew( campo: string) {
    return this.createReview.get(campo)?.invalid && this.submited;
  }

  async fileChange(element: any) {

    var arr = element.target.files;
    this.waiting_pictures = false;
    //this.file = element.target.files;
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
          this.waiting_pictures = false;
        };
        //this.file.push(arr[i]);
      }
      await new Promise(f => setTimeout(f, 600));
      this.waiting_pictures = true;
    }
  }

  updateStars(val: number) {
    this.valueReview = val;
    for(var ii=1;ii<=5;ii++){
      var second = document.querySelector(".starsReview .starss_update:nth-child("+ii+")")
      second.classList.remove('active');
    }
    for(var i=val;i>0;i--){
      var second = document.querySelector(".starsReview .starss_update:nth-child("+i+")")
      second.classList.add('active');
    }
  }

  newReview(){
    this.submited = true;
    this.uid_place = document.getElementById('custId').getAttribute('value');
    if (this.createReview.invalid) { return; }
      if(this.uid_place == null){
        return;
      }

      this.waiting = true;

      this.createReview.value.place = this.uid_place;

      var createData: any = {
        uid: 'nuevo',
        comment: this.createReview.value.comment,
        review: this.valueReview,
        place: this.uid_place
      }

      this.reviewService.crearReview( createData )
        .subscribe( (res:any) => {
            if(this.file && this.file.length > 0){
              let formData = new FormData();
              for(let i = 0; i < this.file.length;i++)
                formData.append("file", this.file[i]);
              this.uploadService.uploadPhotos(formData, 'fotoreview', res['revw'].uid).subscribe( res => {
                this.file = []; this.imagenUrl = [];
              }, (err) => {
                this.reviewService.eliminarReview(res['revw'].uid).subscribe();
                const errtext = err.error.msg || 'No se pudo cargar la imagen';
                Swal.fire({icon: 'error', title: 'Oops...', backdrop: false, text: errtext});
                return;
              });
            }
            this.submited = false;
            this.updateStars(1);
            this.createReview.reset();
            this.createReview.markAsPristine();
            this.waiting = false;
            //Accionar recargar valoraciones y tarjeta lugar
            document.getElementById('accionadorEnviarReview').setAttribute('value', this.uid_place);


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
          Swal.fire({icon: 'error', title: 'Oops...', backdrop: false, html: msgerror,});
        });
    }

    public setUID_PLACE(id){
      this.uid_place = id;
      document.getElementById('custId').setAttribute('value', this.uid_place);
    }
}
