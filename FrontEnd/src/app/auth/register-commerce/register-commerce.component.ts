import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-register-commerce',
  templateUrl: './register-commerce.component.html',
  styleUrls: ['./register-commerce.component.css']
})
export class RegisterCommerceComponent implements OnInit {

  public formSubmint = false;
  public waiting = false;
  public termsandconditions = false;
  public auth2: any;
  public req_password = false;
  public valid_password = false;
  public invalid_password = false;

  /*** checkear campos */
  public mayuss_check: boolean = false;
  public minus_chec: boolean = false;
  public length_password: boolean = false;
  public numbers_check: boolean = false;
  public characters_check: boolean = false;
  public visible = false;
  public lengthrepasword = false;

  public registerFormCommerce = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    repassword: ['', Validators.required ],
    cif: ['', Validators.required],
    accept:[false, Validators.required]
  }); //Objeto de tipo formbuilder

  constructor(  private fb: FormBuilder,
    public _MessageService: MessageService,
    private userService: UserService,
    private router: Router,
    public dialog: MatDialog,
    private titleService:Title) { this.titleService.setTitle("Register Commerce - Towny") }

  ngOnInit(): void {
    this.registerFormCommerce.get('repassword').disable();
  }

  requerirPassword(){
    this.req_password = true;
  }

  notRequiredPassword(){
    this.req_password = false;
  }

  borrarModal(){
    if(!this.waiting){
      let rrrr = document.getElementsByClassName("cdk-overlay-container");;
      rrrr[0].innerHTML = "";
    }
  }

  validPassword(){
    this.valid_password = false;
    this.invalid_password = false;

    this.userService.getPWD(this.registerFormCommerce.value)
    .subscribe((res:any) =>{
      if(res.ok) {this.valid_password = true;}
      this.registerFormCommerce.markAsPristine();
    }, (err) => {
      this.invalid_password = true;
      console.warn('Error respueta api:',err);
    });
  }

  recuForm(form:any) {
        this._MessageService.sendMessageRecu(form).subscribe(() => {
          Swal.fire({icon: 'success', backdrop:false, title: 'Mensaje Enviado', text: 'Te llegara un mensaje a tu correo para restablecer la contraseña',});
        });
    }


  register(){
    this.formSubmint = true;
    if (!this.registerFormCommerce.valid) {
      console.warn('Errores en le formulario');
      return;
    }

    if(!this.registerFormCommerce.get('accept')?.value){ this.termsandconditions = true; return;}
    else this.termsandconditions = false;

    this.waiting = true;

    this.userService.getPWD(this.registerFormCommerce.value)
    .subscribe((res:any) =>{
      if(res.ok){
        this.userService.newCommerce(this.registerFormCommerce.value)
        .subscribe( (res:any) => {
            if(res.ok){
              /*this._MessageService.messageConfirmationRegister(this.registerForm.value, res.token).subscribe(() => {
                //Swal.fire({icon: 'success', title: 'Mensaje Enviado', text: 'Te llegara un mensaje a tu correo para restablecer la contraseña',});
              });*/
              this.registerFormCommerce.markAsPristine();
              this.waiting = false;
              Swal.fire({
                title: 'Comerciante creado',
                text: `Enhorabuena te has registrado con éxito,
                revisa tu correo para encontrar el mensaje de confirmación de usuario`,
                icon: 'success',
                backdrop:false,
                confirmButtonColor: '#3085d6',
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
      Swal.fire({
        title: 'Error!',
        text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',
        icon: 'error',
        confirmButtonText: 'Ok',
        allowOutsideClick: false
      });
    });
  }

  campoValidoRegister( campo: string){
    let campoo = this.registerFormCommerce.get(campo);
    if(campoo!=null){
      return campoo.valid || !this.formSubmint;
    }else{
      return true;
    }
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
      this.titleService.setTitle("Towny");
    });
  }


  acceptTerms(campo: boolean){
    if(!campo) return false;
    else return true;
  }

  /* Comprobamos los campos de la contraseña */

  equalPwd(){
    if(this.registerFormCommerce.value.password == this.registerFormCommerce.value.repassword) this.valid_password = true;
    else this.valid_password = false;

    if(this.registerFormCommerce.value.repassword.length > 0 && this.registerFormCommerce.value.password.length > 0){ this.lengthrepasword = true;}
    else {this.lengthrepasword = false;}
  }

  hacerVisible(){
    if(!this.characters_check || !this.minus_chec || !this.mayuss_check ||
       !this.numbers_check || !this.length_password){
        this.visible = true;
        this.lengthrepasword = false;
        this.registerFormCommerce.get('repassword').setValue('');
        this.registerFormCommerce.get('repassword').disable();
       }
  }

  hacerInvisible(){
    if(this.registerFormCommerce.get('password').value.length == 0) this.visible = false;
  }

  checkLongitud(){
    let pwd = this.registerFormCommerce.get('password').value;
    if(pwd.length == 0){
      document.addEventListener("DOMContentLoaded", function () {
        document.getElementById('longt_check').style.color = 'black';
      });
      this.length_password = false;
    }
    if((pwd.length > 0) && (pwd.length < 8 || pwd.length > 15) ){
      document.addEventListener("DOMContentLoaded", function () {
        document.getElementById('longt_check').style.color = 'red';
      });
      this.length_password = false;
    }
    else if(pwd.length >= 8 && pwd.length <= 15){
      this.length_password = true;
      document.addEventListener("DOMContentLoaded", function () {
        document.getElementById('longt_check').style.color = 'green';
      });
    }
  }

  checkNumber(){
    var contain_number = false;
    let pwd = this.registerFormCommerce.get('password').value;
    var separator = pwd.split('');

    for(let i = 0; i<separator.length && !contain_number; i++){
      if(separator[i].charCodeAt(0) >= 48 && separator[i].charCodeAt(0) <= 57){
          contain_number = true;
      }
    }

    if(!contain_number){
      this.numbers_check = false;
      document.addEventListener("DOMContentLoaded", function () {
        document.getElementById('number_check').style.color = 'red';
      });
    }
    else{
      this.numbers_check = true;
      document.addEventListener("DOMContentLoaded", function () {
        document.getElementById('number_check').style.color = 'green';
      });
    }
    if(pwd.length == 0){
      document.addEventListener("DOMContentLoaded", function () {
        document.getElementById('number_check').style.color = 'black';
      });
    }
    }

    checkMayus(){
      var contain_mayus = false;
      let pwd = this.registerFormCommerce.get('password').value;
      var separator = pwd.split('');

      for(let i = 0; i<separator.length && !contain_mayus; i++){
        if(separator[i].charCodeAt(0) >= 65 && separator[i].charCodeAt(0) <= 90){
            contain_mayus = true;
        }
      }

      if(!contain_mayus){
        this.mayuss_check = false;
        document.addEventListener("DOMContentLoaded", function () {
          document.getElementById('mayus_check').style.color = 'red';
        });
      }
      else if(contain_mayus){
        this.mayuss_check = true;
        document.addEventListener("DOMContentLoaded", function () {
          document.getElementById('mayus_check').style.color = 'green';
        });
      }

      if(pwd.length == 0){
        document.addEventListener("DOMContentLoaded", function () {
          document.getElementById('mayus_check').style.color = 'black';
        });
      }

    }

    checkMinus(){
      let contain_minus = false;
      let pwd = this.registerFormCommerce.get('password').value;
      let separator = pwd.split('');

      for(let i = 0; i<separator.length && !contain_minus; i++){
        if(separator[i].charCodeAt(0) >= 97 && separator[i].charCodeAt(0) <= 122){
            contain_minus = true;
        }
      }

      if(!contain_minus){
        this.minus_chec = false;
        document.addEventListener("DOMContentLoaded", function () {
          document.getElementById('minus_check').style.color = 'red';
        });
      }
      else if(contain_minus){
        this.minus_chec = true;
        document.addEventListener("DOMContentLoaded", function () {
          document.getElementById('minus_check').style.color = 'green';
        });
      }

      if(pwd.length === 0){
        document.addEventListener("DOMContentLoaded", function () {
          document.getElementById('minus_check').style.color = 'black';
        });
      }
    }

    checkCaracter = () =>{
      var characters_ascii = '!¡¿?_->%&·"@#][.';
      var separator = characters_ascii.split('');
      var special_character = false
      let pwd = this.registerFormCommerce.get('password').value;

      for(let i = 0; i < separator.length && !special_character; i++){
        if(pwd.includes(separator[i])) special_character = true;
      }

        if(!special_character){
          this.characters_check = false;
          document.addEventListener("DOMContentLoaded", function () {
            document.getElementById('caracter_check').style.color = 'red';
          });
        }
        else if(special_character){
          this.characters_check = true;
          document.addEventListener("DOMContentLoaded", function () {
            document.getElementById('caracter_check').style.color = 'green';
          });
        }

      document.addEventListener("DOMContentLoaded", function () {
        if(pwd.length === 0) {
          document.getElementById('caracter_check').style.color = 'black';
        }
      });
    }

    comprobarTodosChecks(){
      this.checkMayus();
      this.checkCaracter();
      this.checkLongitud();
      this.checkNumber();
      this.checkMinus();

      if(this.characters_check && this.minus_chec && this.mayuss_check && this.numbers_check && this.length_password)
      { this.visible = false; this.registerFormCommerce.get('repassword').enable();}

    }

}
