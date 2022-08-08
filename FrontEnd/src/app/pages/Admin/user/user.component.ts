

import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { FormControl } from '@angular/forms';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  private formSubmited = false;
  private uid: string = '';
  public enablepass: boolean = true;
  public showOKP: boolean = false;
  public waiting = false;
  public valid_password = false;
  public invalid_password = false;
  public wait_form = false;

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    email: [ '', [Validators.required, Validators.email] ],
    name: ['', Validators.required ],
    password: ['', Validators.required ],
    rol: ['ROL_USER', Validators.required ],
    active: [true, Validators.required ],
  });

  public datosFormAdmin = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rol: ['ROL_ADMIN', Validators.required],
    active: [{value: false, disabled: true}, Validators.required ],
  });

  public nuevoPassword = this.fb.group({
    //email: ['', Validators.required],
    //old_password: ['', Validators.required],
    password: ['', Validators.required],
    repassword: ['', Validators.required],
  });

  constructor( private fb: FormBuilder,
               private usuarioService: UserService,
               private route: ActivatedRoute,
               private router: Router) { }

  ngOnInit(): void {
  // recogemos el parametro
    this.uid = this.route.snapshot.params['uid'];
    if(this.uid !== 'nuevo'){
      this.datosForm.get('uid')?.setValue(this.uid);
      this.wait_form = true;
    }
    if (this.uid !== 'nuevo') {
      this.usuarioService.getUser(this.uid)
        .subscribe( (res:any) => {
          if (!res['users']) {
            this.router.navigateByUrl('/admin/users');
            return;
          };
          this.cargaDatosForm(res);
          this.wait_form = false;
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
          this.router.navigateByUrl('/admin/users');
          Swal.fire({icon: 'error', title: 'Oops...', html: error_midle,});
          return;
        });
    }
  }

  nuevo(): void {
    this.formSubmited = false;
    this.datosFormAdmin.reset();
    this.showOKP = false;
    this.uid = 'nuevo';
    this.datosFormAdmin.get('uid')?.setValue('nuevo');
    this.datosFormAdmin.get('rol')?.setValue('ROL_ADMIN');
    this.enablepass = true;
    this.router.navigateByUrl('/admin/users/user/nuevo');
  }

  esnuevo(): boolean {
    if (this.datosForm.get('uid')?.value==='nuevo') return true;
    return false;
  }

  getUID(){
    return this.uid;
  }

  cargaDatosForm( res: any): void {
    this.datosForm.get('uid')?.setValue(res['users'].uid);
    this.datosForm.get('name')?.setValue(res['users'].name);
    this.datosForm.get('email')?.setValue(res['users'].email);
    this.datosForm.get('rol')?.setValue(res['users'].rol);
    this.datosForm.get('active')?.setValue(res['users'].active);
    this.datosForm.get('password')?.setValue('afsaffasafafss');
    this.datosForm.get('password')?.disable();
    this.enablepass = false;
    this.datosForm.markAsPristine();
  }

  cancelar(): void {
    // Si estamos creando uno nuevo, vamos a la lista
    if (this.datosForm.get('uid')?.value === 'nuevo') {
      this.router.navigateByUrl('/admin/users');
      return;
    } else {
      this.usuarioService.getUser(this.datosForm.get('uid')?.value)
      .subscribe( (res:any) => {
        // Si al tratar de cargar de nuevo los datos no hay, vamos a lista
        if (!res['users']) {
          this.router.navigateByUrl('/admin/users');
          return;
        };
        // Restablecemos los datos del formulario en el formulario
        this.cargaDatosForm(res);
      }, (err) => {
        this.router.navigateByUrl('/admin/users');
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
      });
    }
  }

  enviarAdmin(): void{
    this.formSubmited = true;
    if (this.datosFormAdmin.invalid) { return; }

    this.waiting = true;

    if (this.datosFormAdmin.get('uid')?.value === 'nuevo') {
      this.usuarioService.newAdmin( this.datosFormAdmin.value )
        .subscribe( (res:any) => {
          if(res.ok){
            this.waiting = false;
            let nombre = res.usuario.name;
            if(nombre == undefined) nombre = 'Administrador';
            Swal.fire({
              title: 'Usuario creado',
              text: `El ${nombre} ha sido creado con éxito`,
              icon: 'success',
              //showCancelButton: true,
              confirmButtonColor: '#3085d6',
              //cancelButtonColor: '#d33',
              confirmButtonText: 'Aceptar'
            }).then((result) => {
                  if (result.value) {
                    this.router.navigateByUrl('admin/users');
                  }
              });
          }
        }, (err) => {
          this.waiting = false;
          const errtext = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo.';
          Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
          return;
        });
    }
  }

  enviar(): void {
    this.formSubmited = true;
    if (this.datosForm.invalid) { return; }
    // Diferenciar entre dar de alta uno nuevo o actualizar uno que ya existe
    // Alta de uno nuevo

    this.waiting = true;

     if(this.datosForm.get('uid')?.value !== 'nuevo') {
      // actualizar el usuario
      this.usuarioService.updateUser( this.datosForm.get('uid')?.value, this.datosForm.value )
        .subscribe( (res:any) => {
          if(res.ok){
            this.waiting = false;
            let mail = res.user.email;
            Swal.fire({
              title: 'Usuario actualizado',
              text: `El usuario ${mail} ha sido actualizado con éxito`,
              icon: 'success',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar'
            }).then((result) => {
                  if (result.value) {
                    this.router.navigateByUrl('admin/users');
                  }
              });
          }

          this.datosForm.markAsPristine();

        }, (err) => {
          this.waiting = false;
          const errtext = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo.';
          Swal.fire({icon: 'error', title: 'Oops...', text: errtext});
          return;
        });
    }

  }

  campoNoValido( campo: string) {
    return this.datosForm.get(campo)?.invalid && this.formSubmited;
  }

  campoNoValidoAdmin( campo: string) {
    return this.datosFormAdmin.get(campo)?.invalid && this.formSubmited;
  }

  emaill = new FormControl('', [Validators.required, Validators.email]);

  getErrorMessage() {
    if (this.emaill.hasError('required')) {
      return 'Este campo es obligatorio y, además debe de ser un email';
    }

    return this.emaill.hasError('email') ? 'Not a valid email' : '';
  }

}




