import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { RecoveryComponent } from '../recovery/recovery.component';

@Component({
  selector: 'app-veryfylinkrecovery',
  templateUrl: './veryfylinkrecovery.component.html',
  styleUrls: ['./veryfylinkrecovery.component.css']
})
export class VeryfylinkrecoveryComponent implements OnInit {
  public uid = '';
  public token = '';
  public code = '';
  constructor(private userservice: UserService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getLink();
  }

  getLink(){

    if(localStorage.getItem('x-token') || sessionStorage.getItem('x-token')){
      this.router.navigateByUrl('./');
      Swal.fire({icon: 'error', backdrop:false, title: 'Oops...', text: 'No puedes completar la acción por que ya estás logueado',});
      return;
    }
    this.uid = this.route.snapshot.params['uid'];
    this.code = this.route.snapshot.queryParams['code'];
    this.token = this.route.snapshot.queryParams['token'];

    if(this.token != undefined){
      this.userservice.verifyLinkRecuperacion(this.token, this.code, this.uid)
        .subscribe( (res:any) => {
          sessionStorage.setItem('tok', this.token);
          sessionStorage.setItem('code', this.code);
          sessionStorage.setItem('id', this.uid);
          this.router.navigateByUrl('./');
          this.openDialogRecovery();
        }, (err) => {
          this.router.navigateByUrl('./');
          Swal.fire({icon: 'error', backdrop:false, title: 'Oops...', text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',});
          //console.warn('error:', err);
        });
    }
  }

  openDialogRecovery() {
    const dialogRef = this.dialog.open(

      RecoveryComponent,{
        data: {
          },
       });

    dialogRef.afterClosed().subscribe(result => {
      sessionStorage.clear();
    });
  }

}
