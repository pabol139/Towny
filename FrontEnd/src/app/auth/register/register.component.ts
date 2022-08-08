import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {Title} from "@angular/platform-browser";
import { MessageService } from 'src/app/services/message.service';
import { UsericonComponent } from 'src/app/commons/usericon/usericon.component';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { RegisterCommerceComponent } from '../register-commerce/register-commerce.component';

declare const gapi: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public formSubmint = false;
  public waiting = false;
  public termsandconditions = false;
  public auth2: any;
  public valid_password = false;
  public invalid_password = false;
  public visible = false;
  public passwordtrue = false;
  public lengthrepasword = false;
  public userIcon: UsericonComponent;

  /* variables to check password */
  public mayuss_check: boolean = false;
  public minus_chec: boolean = false;
  public length_password: boolean = false;
  public numbers_check: boolean = false;
  public characters_check: boolean = false;



  public registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    repassword: ['', Validators.required ],
    accept:[false, Validators.required]
  }); //Objeto de tipo formbuilder

  constructor(  private fb: FormBuilder,
    public _MessageService: MessageService,
    private userService: UserService,
    public dialog: MatDialog,
    private titleService:Title) { this.titleService.setTitle("Register - Towny") }

  ngOnInit(): void {
    this.startApp();
    this.registerForm.get('repassword').disable();
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
          alert(JSON.stringify(error, undefined, 2));
        });
  }
  //TERMINA API GOOGLE

  equalPwd(){
    if(this.registerForm.value.password == this.registerForm.value.repassword) this.valid_password = true;
    else this.valid_password = false;

    if(this.registerForm.value.repassword.length > 0 && this.registerForm.value.password.length > 0){ this.lengthrepasword = true;}
    else {this.lengthrepasword = false; }
  }

  recuForm(form:any) {
        this._MessageService.sendMessageRecu(form).subscribe(() => {
          Swal.fire({icon: 'success', title: 'Mensaje Enviado', backdrop:false, text: 'Te llegara un mensaje a tu correo para restablecer la contraseña',});
        });
    }


  register(){
    this.formSubmint = true;
    if (!this.registerForm.valid) {
      console.warn('Errores en le formulario');
      return;
    }

    if(!this.registerForm.get('accept')?.value){
      this.termsandconditions = true;
      return;
    }
    if(!this.registerForm.get('accept')?.value) this.termsandconditions = true;
    else this.termsandconditions = false;

    this.waiting = true;

    this.userService.getPWD(this.registerForm.value)
    .subscribe((res:any) =>{
    if(res.ok){
      this.userService.newUser(this.registerForm.value)
      .subscribe( (res:any) => {
          if(res.ok){
            this.registerForm.markAsPristine();
            this.waiting = false;
            Swal.fire({
              title: 'Usuario creado',
              text: `Enhorabuena te has registrado con éxito,
              revisa tu correo para encontrar el mensaje de confirmación de usuario`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
              backdrop: false,
              confirmButtonText: 'Aceptar'
            }).then((result) => {
                  if (result.value) {
                    window.location.href = './';
                  }
              });
          }
      }, (err) => {
        console.warn('Error respueta api:',err);
        Swal.fire({
          title: 'Error!',
          text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',
          icon: 'error',
          confirmButtonText: 'Ok',
          backdrop:false,
          allowOutsideClick: false
        });
        this.waiting = false;
      });
    }
    }, (err) => {
      this.waiting = false;
      console.warn('Error respueta api:',err);
    });
  }

  hacerVisible(){
    if(!this.characters_check || !this.minus_chec || !this.mayuss_check ||
       !this.numbers_check || !this.length_password){
        this.visible = true;
        this.lengthrepasword = false;
        this.registerForm.get('repassword').setValue('');
        this.registerForm.get('repassword').disable();
       }
  }

  hacerInvisible(){
    if(this.registerForm.get('password').value.length == 0) this.visible = false;
  }

  campoValidoRegister( campo: string){
    let campoo = this.registerForm.get(campo);
    if(campoo!=null){
      return campoo.valid || !this.formSubmint;
    }else{
      return true;
    }
  }

  acceptTerms(campo: boolean){
    if(!campo) return false;
    else return true;
  }

  AbrirLogin(){
    if(!this.waiting){
      this.borrarModal();
      this.openDialogLogin();
    }
  }

  openDialogLogin() {
    const dialogRef = this.dialog.open(
      LoginComponent,{
        data: {
          },
       });
    dialogRef.afterClosed().subscribe(result => {
      this.titleService.setTitle("Towny");
    });
  }

  abrirCommerce(){
    if(!this.waiting){
      this.borrarModal();
      this.openDialogCommerce();
    }
  }

  openDialogCommerce() {
    const dialogRef = this.dialog.open(
      RegisterCommerceComponent,{
        data: {
          },
       });
    dialogRef.afterClosed().subscribe(result => {
      this.titleService.setTitle("Towny");
    });
  }

  borrarModal(){
    if(!this.waiting){
      let rrrr = document.getElementsByClassName("cdk-overlay-container");;
      rrrr[0].innerHTML = "";
    }
  }

  checkLongitud(){
    let pwd = this.registerForm.get('password').value;
    if(pwd.length == 0){
      this.length_password = false;
    }
    if((pwd.length > 0) && (pwd.length < 8 || pwd.length > 15) ){
      this.length_password = false;
    }
    else if(pwd.length >= 8 && pwd.length <= 15){
      this.length_password = true;
    }
  }

  checkNumber(){
    var contain_number = false;
    let pwd = this.registerForm.get('password').value;
    var separator = pwd.split('');

    for(let i = 0; i<separator.length && !contain_number; i++){
      if(separator[i].charCodeAt(0) >= 48 && separator[i].charCodeAt(0) <= 57){
          contain_number = true;
      }
    }
    if(!contain_number){
      this.numbers_check = false;
    }
    else{
      this.numbers_check = true;
    }
    if(pwd.length == 0){
    }
  }

  checkMayus(){
    var contain_mayus = false;
    let pwd = this.registerForm.get('password').value;
    var separator = pwd.split('');

    for(let i = 0; i<separator.length && !contain_mayus; i++){
      if(separator[i].charCodeAt(0) >= 65 && separator[i].charCodeAt(0) <= 90){
          contain_mayus = true;
      }
    }

    if(!contain_mayus){
      this.mayuss_check = false;
    }
    else if(contain_mayus){
      this.mayuss_check = true;
    }
    if(pwd.length == 0){
    }

  }

  checkMinus(){
    let contain_minus = false;
    let pwd = this.registerForm.get('password').value;
    let separator = pwd.split('');

    for(let i = 0; i<separator.length && !contain_minus; i++){
      if(separator[i].charCodeAt(0) >= 97 && separator[i].charCodeAt(0) <= 122){
          contain_minus = true;
      }
    }

    if(!contain_minus){
      this.minus_chec = false;
    }
    else if(contain_minus){
      this.minus_chec = true;
    }

    if(pwd.length === 0){

    }
  }

  checkCaracter(){
    var characters_ascii = '!¡¿?_->%&·"@#][.';
    var separator = characters_ascii.split('');
    var special_character = false
    let pwd = this.registerForm.get('password').value;

    for(let i = 0; i < separator.length && !special_character; i++){
      if(pwd.includes(separator[i])) special_character = true;
    }

      if(!special_character){
        this.characters_check = false;
      }
      else if(special_character){
        this.characters_check = true;
      }
  }

  comprobarTodosChecks(){
    this.checkMayus();
    this.checkCaracter();
    this.checkLongitud();
    this.checkNumber();
    this.checkMinus();

    if(this.characters_check && this.minus_chec && this.mayuss_check && this.numbers_check && this.length_password)
    { this.visible = false; this.registerForm.get('repassword').enable();}

  }

}
