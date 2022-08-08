import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProvinciaService } from '../../../services/provincia.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-provincia',
  templateUrl: './provincia.component.html',
  styleUrls: ['./provincia.component.css']
})
export class ProvinciaComponent implements OnInit {

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    name: ['', Validators.required ],
    cod: ['', Validators.required]
  });
  public submited = false;
  public uid: string = 'nuevo';
  public waiting = false;
  public wait_form = false;

  constructor( private fb: FormBuilder,
               private provinciaService: ProvinciaService,
               private route: ActivatedRoute,
               private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['uid'];
    this.datosForm.get('uid')?.setValue(this.uid);
    if(this.uid !== 'nuevo') { this.wait_form = true; }
    this.cargarDatos(this.uid);
  }

  cargarDatos( uid: string ) {
    this.submited = false;
    if (this.uid !== 'nuevo') {
      this.provinciaService.cargarProvincia(this.uid)
        .subscribe( (res:any) => {
          if (!res['provinces']) {
            this.router.navigateByUrl('/admin/provincias');
            return;
          };
          this.datosForm.get('name')?.setValue(res['provinces'].name);
          this.datosForm.get('cod')?.setValue(res['provinces'].cod);
          this.datosForm.markAsPristine();
          this.submited = true;
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
          this.router.navigateByUrl('/admin/provincias');
          Swal.fire({icon: 'error', title: 'Oops...', html: error_midle,});
          return;
        });
    } else {
      this.datosForm.get('name')?.setValue('');
      this.datosForm.markAsPristine();
    }

  }

  enviar() {
    this.submited = true;
    if (this.datosForm.invalid) { return; }
    this.waiting = true;
    // Si estamos creando uno nuevo
    if (this.datosForm.get('uid')?.value === 'nuevo') {
      this.provinciaService.crearProvincia( this.datosForm.value )
        .subscribe( (res:any) => {
         // this.datosForm.get('uid')?.setValue( res['provinces'].uid );
          this.datosForm.markAsPristine();
          this.waiting = false;
          Swal.fire({icon: 'success', title: 'Provincia Creada', text:('La provincia '+ this.datosForm.get('name')?.value+' se ha creado'),});
        }, (err) => {
          this.waiting = false;
          const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
          Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
        })
    } else {
      this.provinciaService.actualizarProvincia( this.datosForm.get('uid')?.value, this.datosForm.value)
        .subscribe( res => {
          this.datosForm.markAsPristine();
          this.waiting = false;
          Swal.fire({icon: 'success', title: 'Provincia Actualizada', text:('La provincia '+ this.datosForm.get('name')?.value+' se ha actualizado'),});
        }, (err) => {
          this.waiting = false;
          const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
          Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
        })
    }

  }

  nuevo() {
    this.uid = 'nuevo';
    this.datosForm.reset();
    this.datosForm.get('uid')?.setValue('nuevo');
    this.submited = false;
    this.datosForm.markAsPristine();
  }

  cancelar() {
    if (this.uid === 'nuevo') {
      this.router.navigateByUrl('/admin/provincias');
    } else {
      this.cargarDatos(this.uid);
    }
  }

  campoNoValido( campo: string) {
    return this.datosForm.get(campo)?.invalid && this.submited;
  }

  esnuevo(): boolean {
    if (this.datosForm.get('uid')?.value === 'nuevo') { return true; }
    return false;
  }

}

