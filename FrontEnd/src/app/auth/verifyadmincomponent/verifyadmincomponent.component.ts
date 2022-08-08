import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verifyadmincomponent',
  templateUrl: './verifyadmincomponent.component.html',
  styleUrls: ['./verifyadmincomponent.component.css']
})
export class VerifyadmincomponentComponent implements OnInit {

  public formSubmint = false;
  public waiting = false;
  public req_password = false;
  public valid_password = false;
  public invalid_password = false;
  public visible = false;
  public passwordtrue = false;
  public lengthrepasword = false;

  /* variables to check password */
  public mayuss_check: boolean = false;
  public minus_chec: boolean = false;
  public length_password: boolean = false;
  public numbers_check: boolean = false;
  public characters_check: boolean = false;

  public uid = '';
  public token = '';
  public code = '';
  public validateAdminForm = this.fb.group({
    password: ['', Validators.required ],
    repassword: ['', Validators.required ]
  });

  constructor(private router: Router,
    private userservice: UserService,
    private route: ActivatedRoute,
    private fb:FormBuilder,
    public dialog: MatDialog,
    private titleService: Title) { }

  ngOnInit(): void {
    this.validateAdminForm.get('repassword').disable();
  }

  equalPwd(){
    if(this.validateAdminForm.value.password == this.validateAdminForm.value.repassword) this.valid_password = true;
    else this.valid_password = false;

    if(this.validateAdminForm.value.repassword.length > 0 && this.validateAdminForm.value.password.length > 0){ this.lengthrepasword = true;}
    else {this.lengthrepasword = false; }
  }

  checkLongitud(){
    let pwd = this.validateAdminForm.get('password').value;
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
    let pwd = this.validateAdminForm.get('password').value;
    var separator = pwd.split('');

    for(let i = 0; i<separator.length && !contain_number; i++){
      if(separator[i].charCodeAt(0) >= 48 && separator[i].charCodeAt(0) <= 57){ contain_number = true; }
    }
    if(!contain_number){ this.numbers_check = false; }
    else{ this.numbers_check = true; }

  }

  checkMayus(){
    var contain_mayus = false;
    let pwd = this.validateAdminForm.get('password').value;
    var separator = pwd.split('');

    for(let i = 0; i<separator.length && !contain_mayus; i++){
      if(separator[i].charCodeAt(0) >= 65 && separator[i].charCodeAt(0) <= 90){ contain_mayus = true; }
    }

    if(!contain_mayus){ this.mayuss_check = false; }
    else if(contain_mayus){ this.mayuss_check = true; }
  }

  checkMinus(){
    let contain_minus = false;
    let pwd = this.validateAdminForm.get('password').value;
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
    let pwd = this.validateAdminForm.get('password').value;
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
        this.validateAdminForm.get('repassword').setValue('');
        this.validateAdminForm.get('repassword').disable();
       }
  }

  hacerInvisible(){
    if(this.validateAdminForm.get('password').value.length == 0) this.visible = false;
  }

  campoValidoRegister( campo: string){
    let campoo = this.validateAdminForm.get(campo);
    if(campoo!=null){
      return campoo.valid || !this.formSubmint;
    }else{
      return true;
    }
  }

  validateAdmin(){
    this.formSubmint = true;
    if (!this.validateAdminForm.valid) {
      console.warn('Errores en le formulario');
      return;
    }
    this.waiting = true;
    this.userservice.getPWD(this.validateAdminForm.value)
    .subscribe((res:any) =>{
      if(res.ok){
        this.token = sessionStorage.getItem('tok');
        this.uid = sessionStorage.getItem('id');
        this.code = sessionStorage.getItem('code');
        this.userservice.verifyAdmin(this.token, this.code, this.uid, this.validateAdminForm.value)
        .subscribe((res:any) => {
          if(res.ok){
            this.waiting = false;
            this.validateAdminForm.markAsPristine();
            sessionStorage.clear();
            Swal.fire({
              title: 'Administrador validado',
              text: `Enhorabuena has validado tu administrador con éxito, logueate en la página de
              login y podrás administrar la web`,
              icon: 'success',
              backdrop:false,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar'
            }).then((result) => {
                  if (result.value) {
                      this.borrarModal();
                  }
              });
          }
        }, (err) => {
          this.waiting = false;
          Swal.fire({
            title: 'Error!',
            text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',
            icon: 'error',
            backdrop:false,
            confirmButtonText: 'Ok',
            allowOutsideClick: false
          });
          console.warn('Error respueta api:',err);
        });
        this.validateAdminForm.markAsPristine();
        this.waiting = false;
      }
    }, (err) => {
      this.waiting = false;
      console.warn('Error respueta api:',err);
    });

  }

  campoValidoVerify( campo: string){
    let campoo = this.validateAdminForm.get(campo);
    if(campoo!=null){
      return campoo.valid || !this.formSubmint;
    }else{
      return true;
    }
  }

  comprobarTodosChecks(){
    this.checkMayus();
    this.checkCaracter();
    this.checkLongitud();
    this.checkNumber();
    this.checkMinus();

    if(this.characters_check && this.minus_chec && this.mayuss_check && this.numbers_check && this.length_password)
    { this.visible = false; this.validateAdminForm.get('repassword').enable();}

  }

  borrarModal(){
    if(!this.waiting){
      let rrrr = document.getElementsByClassName("cdk-overlay-container");;
      rrrr[0].innerHTML = "";
      sessionStorage.clear();
    }
  }

}
