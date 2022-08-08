import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edituserprofile',
  templateUrl: './edituserprofile.component.html',
  styleUrls: ['./edituserprofile.component.css']
})
export class EdituserprofileComponent implements OnInit {


  public submited = false;
  public waiting = false;
  public fileText = 'Seleccione archivo';
  public imagenUrl = '';
  public foto: File = null;
  public emailError = 0;

  constructor(  private fb: FormBuilder,
               @Inject(MAT_DIALOG_DATA) public data: any,
               private userservice: UserService
               ) { }

  public datosForm = this.fb.group({
    name: ['', Validators.required ],
    email: ['', [Validators.required, Validators.email]],
    picture: ['']
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  comprobarCheck(){
    let em = this.datosForm.get('email');
    if(em.hasError('required'))
      return this.emailError = 1;
    else if(em.hasError('email'))
      return this.emailError = 2;
    else
      return this.emailError = 0;
  }

  editarUsuario(){

    this.submited = true;

    if (this.datosForm.invalid) { return; }

    var data = {
      email: this.datosForm.get('email').value,
      name: this.datosForm.get('name').value,
    }

    // Actualizamos los datos del formulario y si va bien actualizamos foto
    this.userservice.updateUser( this.userservice.uid, data )
    .subscribe( res => {
      this.datosForm.get('name')?.setValue(res['user'].name);
      this.datosForm.get('email')?.setValue(res['user'].email);
      //this.userservice.createDataCommer( res['user'].name, res['user'].email);
      //this.nameUser = res['user'].name;
      //document.getElementById('emailComerc').innerHTML = this.usuarioService.email;
      // Si la actualización de datos ha ido bien, entonces actualizamso foto si hay
      if (this.foto ) {
        this.userservice.upPhoto( this.userservice.uid, this.foto)
        .subscribe( res => {
          // Cambiamos la foto del navbar, para eso establecemos la imagen (el nombre de archivo) en le servicio
          this.userservice.establecerimagen(res['fileName']);
          this.foto = null;
          // cambiamos el DOM el objeto que contiene la foto
          //document.getElementById('fotoperfilnavbar').setAttribute('src', this.usuarioService.imagenURL);
        }, (err) => {
          const errtext = err.error.msg || 'No se pudo cargar la imagen';
          Swal.fire({icon: 'error', title: 'Oops...', text: errtext});
          return;
        });
      }
      this.fileText = 'Seleccione archivo';
      this.datosForm.markAsPristine(); // marcamos reiniciado de cambios

        Swal.fire({
          title: 'Perfil Modificado',
          text: `Tu perfil ha sido modificado correctamente.`,
          icon: 'success',
          backdrop:false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar'
        }).then((result) => {
              if (result.value) {
                window.location.href = './';
              }
          });
      
      
    }, (err) => {
      const errtext = err.error.msg || 'No se pudo guardar los datos';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext});
    });
  }

  cargarDatos(){

    this.userservice.getUser(this.data.usuario.id)
    .subscribe( (res:any) => {
    this.datosForm.get('name')?.setValue(res['users'].name);
    this.datosForm.get('email')?.setValue(res['users'].email);
    this.imagenUrl = this.userservice.imagenURL;

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



  campoNoValido( campo: string) {

    return this.datosForm.get(campo)?.invalid && this.submited ;
  }

  changePicture( evento ): void {
    if (evento.target.files && evento.target.files[0]) {
      // Comprobamos si es una imagen jpg, jpet, png
      const extensiones = ['jpeg','jpg','png'];
      const nombre: string = evento.target.files[0].name;
      const nombrecortado: string[] = nombre.split('.');
      const extension = nombrecortado[nombrecortado.length - 1];
      if (!extensiones.includes(extension)) {
        // Si no teniamos ningúna foto ya seleccionada antes, dejamos el campo pristine
        if (this.foto === null) {
          this.datosForm.get('picture').markAsPristine();
        }
        Swal.fire({icon: 'error', title: 'Oops...', text: 'El archivo debe ser una imagen jpeg, jpg o png'});
        return;
      }

      let reader = new FileReader();
      // cargamos el archivo en la variable foto que servirá para enviarla al servidor
      this.foto = evento.target.files[0];
      // leemos el archivo desde el dispositivo
      reader.readAsDataURL(evento.target.files[0]);
      // y cargamos el archivo en la imagenUrl que es lo que se inserta en el src de la imagen
      reader.onload = (event) => {
        this.imagenUrl = event.target.result.toString();
        this.fileText = nombre;
      };
    } else {
    }
  }

}
