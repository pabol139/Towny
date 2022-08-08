import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {Title} from "@angular/platform-browser";
import { RegisterComponent } from '../register/register.component';
import { MatDialog } from '@angular/material/dialog';
import { RecoveryComponent } from '../recovery/recovery.component';
import { SendmailComponent } from '../sendmail/sendmail.component';

declare const gapi: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public formSubmint = false;
  public waiting = false;
  public auth2: any;
  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    remember: [ false ]
  }); //Objeto de tipo formbuilder

  constructor(  private fb: FormBuilder,
                private userService: UserService,
                private router: Router,
                public dialog: MatDialog,
                private titleService:Title) { this.titleService.setTitle("Login - Towny") }

  ngOnInit(): void {
    this.startApp();
  }


  //EMPIEZA LOGIN GOOGLE
  startApp() {
    gapi.load('auth2', ()=>{
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      this.auth2 = gapi.auth2.init({
        client_id: '237699318726-erdi4og2k4qlui8o8ele1aebhl0gejca.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin'
      });
      this.attachSignin(document.getElementById('googleSignIn'));
    });
  };

  attachSignin(element:any) {
    this.auth2.attachClickHandler(element, {},
        (googleUser:any) => {
          var id_token = googleUser.getAuthResponse().id_token;
          this.userService.loginGoogle(id_token).subscribe(
            res => {
              window.location.href = './';
            }, (err) => {
            console.warn('Error respueta api:',err);
            Swal.fire({
              title: 'Error!',
              text: 'Identificación google incorrecta',
              icon: 'error',
              confirmButtonText: 'Ok',
              backdrop:false,
              allowOutsideClick: false
            });
          });
        }, (error: any) => {
          //alert(JSON.stringify(error, undefined, 2));
        });
  }
  //TERMINA API GOOGLE


  login() {
    this.formSubmint = true;
    if (!this.loginForm.valid) {
      console.warn('Errores en le formulario');
      return;
    }
    this.waiting = true;
    this.userService.login(this.loginForm.value).subscribe( res => {
      this.waiting = false;
      switch (this.userService.rol) {
        case 'ROL_ADMIN':
          //this.router.navigateByUrl('/admin');
          window.location.href = '/admin';
          break;
        case 'ROL_USER':
          window.location.href = './';
          break;
        case 'ROL_COMMERCE':
          window.location.href = '/commerce';
          //this.router.navigateByUrl('/prof/dashboard');
          break;
      }
    }, (err) => {
      console.warn('Error respueta api:',err);
      if(err.error.msg == "Try google login"){
        Swal.fire({
          title: 'Error!',
          text: 'Usuario vinculado a una cuenta de google, intenta iniciar sesión mediante Google',
          icon: 'error',
          confirmButtonText: 'Ok',
          backdrop:false,
          allowOutsideClick: false
        });
      }else{
        Swal.fire({
          title: 'Error!',
          text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',
          icon: 'error',
          confirmButtonText: 'Ok',
          backdrop:false,
          allowOutsideClick: false
        });
      }
      this.waiting = false;
    });
  }

  abrirRecovery(){
    if(!this.waiting){
      this.borrarModal();
      this.openDialogRecovery();
    }
  }

  openDialogRecovery() {
    const dialogRef = this.dialog.open(

      SendmailComponent,{

        data: {
          },
       });

    dialogRef.afterClosed().subscribe(result => {
      this.titleService.setTitle("Towny")
    });
  }

  abrirRegister(){
    if(!this.waiting){
      this.borrarModal();
      this.openDialogRegister();
    }
  }

  openDialogRegister() {
    const dialogRef = this.dialog.open(

      RegisterComponent,{

        data: {
          },
       });

    dialogRef.afterClosed().subscribe(result => {
      this.titleService.setTitle("Towny")
    });
  }

  campoValidoLogin( campo: string){
    let campoo = this.loginForm.get(campo);
    if(campoo!=null){
      return campoo.valid || !this.formSubmint;
    }else{
      return true;
    }
  }

  borrarModal(){
    if(!this.waiting){
      let rrrr = document.getElementsByClassName("cdk-overlay-container");;
      rrrr[0].innerHTML = "";
    }
  }

}
