import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { passwordForm } from 'src/app/interfaces/password-form.interface';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-updatepasswordadmin',
  templateUrl: './updatepasswordadmin.component.html',
  styleUrls: ['./updatepasswordadmin.component.css']
})
export class UpdatepasswordadminComponent implements OnInit {

  private formSubmited = false;
  private uid: string = '';
  public enablepass: boolean = true;
  public showOKP: boolean = false;
  public waiting = false;
  public valid_password = false;
  public invalid_password = false;

  public nuevoPassword = this.fb.group({
    //email: ['', Validators.required],
    old_password: ['', Validators.required],
    password: ['', Validators.required],
    repassword: ['', Validators.required],
  });


  constructor(private fb: FormBuilder,
              private usuarioService: UserService,
              //private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.usuarioService.uid;
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
          const data:passwordForm = {
            email: this.usuarioService.email,
            old_password : this.nuevoPassword.get('old_password').value,
            password: this.nuevoPassword.get('password').value,
            repassword: this.nuevoPassword.get('repassword').value
          };
          this.usuarioService.changePassword(this.uid, data)
          .subscribe( (res:any) => {
            if(res.ok){
              this.waiting = false;
              this.nuevoPassword.reset();
              this.showOKP = true;
              this.nuevoPassword.markAsPristine();
              this.invalid_password = false;
              this.valid_password = false;
              Swal.fire({
                title: 'Contraseña actualizada', text: `Has actualizado la contraseña con éxito`, icon: 'success',
                allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
              });
            }
          }, (err) => {
            this.waiting = false;
            const errtext = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo.';
            Swal.fire({icon: 'error', title: 'Oops...', text: errtext});
            return;
          });
        }
      }, (err) => {
        this.waiting = false;
        this.nuevoPassword.markAsPristine();
        this.invalid_password = true;
        console.warn('Error respueta api:',err);
      });
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

}
