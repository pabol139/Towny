import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css']
})
export class UpdatePasswordComponent implements OnInit {

  public nuevoPassword = this.fb.group({
    email: ['', Validators.required],
    old_password: ['', Validators.required],
    password: ['', Validators.required],
    repassword: ['', Validators.required],
  });

  public valid_password = false;
  public invalid_password = false;
  public waiting = false;
  public uid = this.usuarioService.uid;
  public formSubmited = false;

  public mayuss_check: boolean = false;
  public minus_chec: boolean = false;
  public length_password: boolean = false;
  public numbers_check: boolean = false;
  public characters_check: boolean = false;
  public visible = false;
  public passwordtrue = false;
  public lengthrepasword = false;
  public equalPWD = false;


  constructor(private fb: FormBuilder,
              private usuarioService: UserService) { }

  ngOnInit(): void {
    this.nuevoPassword.get('repassword').disable();
  }

  comprobarValidPWD(){
    if(this.nuevoPassword.get('old_password').value == this.nuevoPassword.get('password').value){
      this.equalPWD = true;
      this.nuevoPassword.get('repassword').disable();
    }
    else{
      this.equalPWD = false;
      if(this.characters_check && this.minus_chec && this.mayuss_check && this.numbers_check && this.length_password){
        this.nuevoPassword.get('repassword').enable();
      }
    }
  }

  validPassword(){
    this.valid_password = false;
    this.invalid_password = false;

    this.usuarioService.getPWD(this.nuevoPassword.value)
    .subscribe((res:any) =>{
      if(res.ok) {
        if(this.nuevoPassword.get('password').value == this.nuevoPassword.get('repassword').value){
          this.valid_password = false;
          this.invalid_password = true;
        }
        else{
          this.valid_password = true;
          this.invalid_password = false;
        }
      }
    }, (err) => {
      //this.nuevoPassword.markAsPristine();
      this.invalid_password = true;
      console.warn('Error respueta api:',err);
    });
  }

  changePassword(): void {
    this.formSubmited = true;
    if (this.nuevoPassword.invalid) { return; }
    if(this.equalPWD){
      return;
    }
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
              this.invalid_password = false;
              this.valid_password = false;
              this.lengthrepasword = false;
              this.nuevoPassword.markAsPristine();
              Swal.fire({
                title: 'Contraseña actualizada', text: `Has actualizado la contraseña con éxito`, icon: 'success',
                allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar', backdrop: false
              });
            }

          }, (err) => {
            this.invalid_password = false;
            //this.valid_password = false;
            this.waiting = false;
            const errtext = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo.';
            Swal.fire({icon: 'error', title: 'Oops...', text: errtext, backdrop: false});
            return;
          });
        }
      }, (err) => {
        this.waiting = false;
        //this.nuevoPassword.markAsPristine();
        const errtext = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo.';
        Swal.fire({icon: 'error', title: 'Oops...', text: errtext, backdrop: false});
        this.invalid_password = true;
        console.warn('Error respueta api:',err);
      });
  }

  equalPwd(){
    if(this.nuevoPassword.value.password == this.nuevoPassword.value.repassword) this.valid_password = true;
    else this.valid_password = false;

    if(this.nuevoPassword.value.repassword.length > 0 && this.nuevoPassword.value.password.length > 0){ this.lengthrepasword = true;}
    else {this.lengthrepasword = false; }
  }

  hacerVisible(){
    if(!this.characters_check || !this.minus_chec || !this.mayuss_check ||
       !this.numbers_check || !this.length_password){
        this.visible = true;
        this.lengthrepasword = false;
        this.nuevoPassword.get('repassword').setValue('');
        this.nuevoPassword.get('repassword').disable();
       }
  }

  hacerInvisible(){
    if(this.nuevoPassword.get('password').value.length == 0) this.visible = false;
  }

  checkLongitud(){
    let pwd = this.nuevoPassword.get('password').value;
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
    let pwd = this.nuevoPassword.get('password').value;
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
    let pwd = this.nuevoPassword.get('password').value;
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
    let pwd = this.nuevoPassword.get('password').value;
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
    let pwd = this.nuevoPassword.get('password').value;

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
    { this.visible = false; this.nuevoPassword.get('repassword').enable();}

  }

}
