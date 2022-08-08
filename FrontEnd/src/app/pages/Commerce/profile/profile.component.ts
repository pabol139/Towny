import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

import Swal from 'sweetalert2';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public comercForm = this.fb.group({
    email: [ {value: '', disabled: true}, [Validators.required, Validators.email] ],
    name: [{value: '', disabled: true}, Validators.required ],
    ciff: [{value: '', disabled: true}, Validators.required ],
    picture: [{value: '', disabled:true}]
  });

  public nuevoPassword = this.fb.group({
    email: ['', Validators.required],
    old_password: ['', Validators.required],
    password: ['', Validators.required],
    repassword: ['', Validators.required],
  });

  public editando = false;
  public fileText = 'Seleccione archivo';
  public imagenUrl = '';
  public foto: File = null;
  public showOKD = false;
  public showOKP = false;
  public valid_password = false;
  public invalid_password = false;
  public waiting = false;
  public uid = this.usuarioService.uid;
  public formSubmited = false;
  public nameUser = this.usuarioService.name;
  public emailUser = this.usuarioService.email;

  constructor(private usuarioService: UserService,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    this.cargarUsuario();
  }

  onClick(event) {
    if(event.__ngContext__[13][13][23].__ngContext__[23].innerHTML.includes("john_doe12@bbb.com")){
    }else{
    }

    if(document.getElementsByClassName('mat-tab-body-wrapper')[0].firstElementChild.nextElementSibling.innerHTML.includes("john_doe12@bbb.com")){
    }else{
    }

  }

  validPassword(){
    this.valid_password = false;
    this.invalid_password = false;

    this.usuarioService.getPWD(this.nuevoPassword.value)
    .subscribe((res:any) =>{
      if(res.ok) {this.valid_password = true;}
    }, (err) => {
      this.invalid_password = true;
      console.warn('Error respueta api:',err);
    });
  }

  cargarUsuario():void {
    this.comercForm.get('name').setValue(this.usuarioService.name);
    this.comercForm.get('email').setValue(this.usuarioService.email);
    this.comercForm.get('ciff').setValue(this.usuarioService.cif);
    this.comercForm.get('picture').setValue('');
    this.imagenUrl = this.usuarioService.imagenURL;
  }

  quitarDisabled(): void{
    this.comercForm.get('name').enable();
    this.comercForm.get('email').enable();
    this.comercForm.get('ciff').enable();
    this.comercForm.get('picture').enable();
  }

  sendCommercData(): void {

    if (this.comercForm.invalid) { return; }

    var data = {
      email: this.comercForm.get('email').value,
      name: this.comercForm.get('name').value,
      ciff: this.comercForm.get('ciff').value,
      CIF: this.comercForm.get('ciff').value
    }

    // Actualizamos los datos del formulario y si va bien actualizamos foto
    this.usuarioService.updateUser( this.usuarioService.uid, data )
    .subscribe( res => {
      this.usuarioService.createDataCommer( res['user'].name, res['user'].email, this.comercForm.value.ciff);
      this.nameUser = res['user'].name;
      //document.getElementById('emailComerc').innerHTML = this.usuarioService.email;
      // Si la actualización de datos ha ido bien, entonces actualizamso foto si hay
      if (this.foto ) {
        this.usuarioService.upPhoto( this.usuarioService.uid, this.foto)
        .subscribe( res => {
          // Cambiamos la foto del navbar, para eso establecemos la imagen (el nombre de archivo) en le servicio
          this.usuarioService.establecerimagen(res['fileName']);
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
      this.comercForm.markAsPristine(); // marcamos reiniciado de cambios
      this.showOKD = true;
    }, (err) => {
      const errtext = err.error.msg || 'No se pudo guardar los datos';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext});
    });
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
          this.comercForm.get('picture').markAsPristine();
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

  ponerDisabled(): void{
    this.comercForm.get('name').disable();
    this.comercForm.get('email').disable();
    this.comercForm.get('ciff').disable();
    this.comercForm.get('picture').disable();
  }

  changePassword(): void {
    this.formSubmited = true;
    if (this.nuevoPassword.invalid) { return; }
    // Diferenciar entre dar de alta uno nuevo o actualizar uno que ya existe
    // Alta de uno nuevo
    this.waiting = true;
      // cambiamos la contraseña si todo ha ido bien
    this.usuarioService.getPWD(this.nuevoPassword.value)
      .subscribe((res:any) =>{
        if(res.ok) {
      this.usuarioService.changePassword(this.uid, this.nuevoPassword.value )
        .subscribe( (res:any) => {
          if(res.ok){
              this.waiting = false;
              this.nuevoPassword.reset();
              this.showOKP = true;
              this.invalid_password = false;
              this.valid_password = false;
              this.nuevoPassword.markAsPristine();
              Swal.fire({
                title: 'Contraseña actualizada', text: `Has actualizado la contraseña con éxito`, icon: 'success',
                allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
              });
            }

          }, (err) => {
            this.invalid_password = false;
            this.valid_password = false;
            this.waiting = false;
            const errtext = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo.';
            Swal.fire({icon: 'error', title: 'Oops...', text: errtext});
            return;
          });
        }
      }, (err) => {
        this.waiting = false;
        this.invalid_password = true;
      });
  }

  activarPerfilPestana(){
    document.getElementById('account-tab').classList.add('active');
    document.getElementById('accountPestana').classList.add('active');
    document.getElementById('accountPestana').classList.add('show');
    document.getElementById('password-tab').classList.remove('active');
    document.getElementById('securityPestana').classList.remove('active');
    document.getElementById('securityPestana').classList.remove('show');
  }

  activarSeguridadPestana(){
    document.getElementById('account-tab').classList.remove('active');
    document.getElementById('accountPestana').classList.remove('active');
    document.getElementById('accountPestana').classList.remove('show');
    document.getElementById('password-tab').classList.add('active');
    document.getElementById('securityPestana').classList.add('active');
    document.getElementById('securityPestana').classList.add('show');
  }

}
