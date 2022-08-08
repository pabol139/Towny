import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-sendmail',
  templateUrl: './sendmail.component.html',
  styleUrls: ['./sendmail.component.css']
})
export class SendmailComponent implements OnInit {
  public listaRegistros: User[] = [];
  public formSubmint = false;

  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email] ],
  });

  constructor(public _MessageService: MessageService,
                private usuarioService: UserService,
                private fb: FormBuilder,
                private titleService:Title,
                ) { this.titleService.setTitle("Recuperar contraseña - Towny") }

  ngOnInit(): void {

     }

     campoValidoLogin( campo: string){
      let campoo = this.loginForm.get(campo);
      if(campoo!=null){
        return campoo.valid || !this.formSubmint;
      }else{
        return true;
      }
    }

     recuForm() {
       this.formSubmint = true;

      this.usuarioService.getUserByEmail(this.loginForm.value.email)
      .subscribe((res:any) => {
        this.listaRegistros=res['usuario'];
        if(this.listaRegistros.length>0){

          var data = {
            uid: this.listaRegistros[0]['uid'],
            name: this.listaRegistros[0]['name'],
            email: this.loginForm.value.email,
            code: this.listaRegistros[0]['activation_code'],
            rol: this.listaRegistros[0]['rol']
          }
          this._MessageService.sendMessageRecu(data).subscribe(() => {
            swal.fire({icon: 'success', title: 'Mensaje Enviado', backdrop:false, text: 'Te llegara un mensaje a tu correo para restablecer la contraseña',});
          });
        }else{
          swal.fire({icon: 'error', title: 'Oops...', backdrop:false, text: 'No hay un usuario asociado al correo escrito', });
        }
      },(err)=> {
        swal.fire({icon: 'error', title: 'Oops...', backdrop:false, text: 'Error de conexión', });

      });

      }
  }


