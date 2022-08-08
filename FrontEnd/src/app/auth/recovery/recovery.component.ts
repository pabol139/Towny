import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';

import {Title} from "@angular/platform-browser";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html',
  styleUrls: ['./recovery.component.css']
})
export class RecoveryComponent implements OnInit {
  private uid: string = '';
  public formSubmint = false;
  public waiting = false;
  public auth2: any;
  public visible = false;
  public valid_password = false;
  public invalid_password = false;
  public passwordtrue = false;
  public lengthrepasword = false;

  /* variables to check password */
  public mayuss_check: boolean = false;
  public minus_chec: boolean = false;
  public length_password: boolean = false;
  public numbers_check: boolean = false;
  public characters_check: boolean = false;
  public recoveryForm = this.fb.group({
    password: ['', Validators.required ],
    password2: ['', Validators.required]
  }); //Objeto de tipo formbuilder

  constructor(  private fb: FormBuilder,
                private userService: UserService,
                private route: ActivatedRoute,
                private router: Router,
                private titleService:Title) { this.titleService.setTitle("Recovery - Towny") }

  ngOnInit(): void {
    this.uid = sessionStorage.getItem('id');
  }

  borrarModal(){
    if(!this.waiting){
      let rrrr = document.getElementsByClassName("cdk-overlay-container");;
      rrrr[0].innerHTML = "";
      sessionStorage.clear();
    }
  }

  equalPwd(){
    if(this.recoveryForm.value.password == this.recoveryForm.value.password2) this.valid_password = true;
    else this.valid_password = false;

    if(this.recoveryForm.value.password2.length > 0 && this.recoveryForm.value.password.length > 0){ this.lengthrepasword = true;}
    else {this.lengthrepasword = false; }
  }

  recovery() {
    this.formSubmint = true;
    if (!this.recoveryForm.valid) {
      console.warn('Errores en le formulario');
      return;
    }
  }

  updatePassword(form:any){
    let pass1 = this.recoveryForm.get('password')?.value;
    let pass2 = this.recoveryForm.get('password2')?.value;
    if(pass1==pass2){
      this.userService.recoverPass(this.uid,form)
      .subscribe((res:any) => {
        swal.fire({icon: 'success', backdrop:false, title: 'Contraseña actualizada', text: 'Se ha cambiado tu contraseña',})
      }, (err) => {
        Swal.fire({icon: 'error', backdrop:false, title: 'Oops...', text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',});
        //console.warn('error:', err);
      });

    }else{
      swal.fire({icon: 'error', title: 'Oops...', text: 'Las contraseñas deben coincidir', });

    }

  }

  campoValidoLogin( campo: string){
    let campoo = this.recoveryForm.get(campo);
    if(campoo!=null){
      return campoo.valid || !this.formSubmint;
    }else{
      return true;
    }
  }

  passwordRepeat(){
    let pass1 = this.recoveryForm.get('password');
    let pass2 = this.recoveryForm.get('password2');

    if(pass1?.value!=pass2?.value){
      return false;
    }
    else{
      return true;
    }
  }

  checkLongitud(){
    let pwd = this.recoveryForm.get('password').value;
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
    let pwd = this.recoveryForm.get('password').value;
    var separator = pwd.split('');

    for(let i = 0; i<separator.length && !contain_number; i++){
      if(separator[i].charCodeAt(0) >= 48 && separator[i].charCodeAt(0) <= 57){ contain_number = true; }
    }
    if(!contain_number){ this.numbers_check = false; }
    else{ this.numbers_check = true; }

  }

  checkMayus(){
    var contain_mayus = false;
    let pwd = this.recoveryForm.get('password').value;
    var separator = pwd.split('');

    for(let i = 0; i<separator.length && !contain_mayus; i++){
      if(separator[i].charCodeAt(0) >= 65 && separator[i].charCodeAt(0) <= 90){ contain_mayus = true; }
    }

    if(!contain_mayus){ this.mayuss_check = false; }
    else if(contain_mayus){ this.mayuss_check = true; }
  }

  checkMinus(){
    let contain_minus = false;
    let pwd = this.recoveryForm.get('password').value;
    let separator = pwd.split('');

    for(let i = 0; i<separator.length && !contain_minus; i++){
      if(separator[i].charCodeAt(0) >= 97 && separator[i].charCodeAt(0) <= 122){ contain_minus = true; }
    }

    if(!contain_minus){ this.minus_chec = false; }
    else if(contain_minus){ this.minus_chec = true; }

  }

  checkCaracter(){
    var characters_ascii = '!¡¿?_->%&·"@#][.';
    var separator = characters_ascii.split('');
    var special_character = false
    let pwd = this.recoveryForm.get('password').value;
    for(let i = 0; i < separator.length && !special_character; i++){
      if(pwd.includes(separator[i])) special_character = true;
    }
    if(!special_character){ this.characters_check = false; }
    else if(special_character){ this.characters_check = true; }
  }

  hacerVisible(){
    if(!this.characters_check || !this.minus_chec || !this.mayuss_check ||
       !this.numbers_check || !this.length_password){
        this.visible = true;
        this.lengthrepasword = false;
        this.recoveryForm.get('password2').setValue('');
        this.recoveryForm.get('password2').disable();
       }
  }

  hacerInvisible(){
    if(this.recoveryForm.get('password').value.length == 0) this.visible = false;
  }

  comprobarTodosChecks(){
    this.checkMayus();
    this.checkCaracter();
    this.checkLongitud();
    this.checkNumber();
    this.checkMinus();

    if(this.characters_check && this.minus_chec && this.mayuss_check && this.numbers_check && this.length_password)
    { this.visible = false; this.recoveryForm.get('password2').enable();}

  }

}
