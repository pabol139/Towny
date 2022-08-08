import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verification-page',
  templateUrl: './verification-page.component.html',
  styleUrls: ['./verification-page.component.css']
})
export class VerificationPageComponent implements OnInit {

  //private user: User = new User('', '');
  public uid = '';
  public code = '';
  constructor(private userservice: UserService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.verifyUser();
  }


  verifyUser() {
    this.uid = this.route.snapshot.queryParams['id'];
    this.code = this.route.snapshot.queryParams['code'];
    this.userservice.verifyUser(this.code, this.uid)
      .subscribe( (res:any) => {
        this.router.navigateByUrl('./');
        Swal.fire({
          title: 'Cuenta activada',
          text: `Enhorabuena ${res['usuario'].name} has activado tu cuenta con éxito, pulsa click en aceptar
                 y ya podrás loguearte como usuario`,
          icon: 'success',
          backdrop: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar'
        })
      }, (err) => {
        this.router.navigateByUrl('./');
        Swal.fire({icon: 'error', backdrop: false, title: 'Oops...', text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',});
        //console.warn('error:', err);
      });
  }

}
