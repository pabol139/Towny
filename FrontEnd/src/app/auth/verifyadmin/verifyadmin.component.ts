import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
import { VerifyadmincomponentComponent } from '../verifyadmincomponent/verifyadmincomponent.component';

@Component({
  selector: 'app-verifyadmin',
  templateUrl: './verifyadmin.component.html',
  styleUrls: ['./verifyadmin.component.css']
})
export class VerifyadminComponent implements OnInit {
  public formSubmint = false;
  public waiting = false;
  public req_password = false;
  public valid_password = false;
  public invalid_password = false;

  public validateAdminForm = this.fb.group({
    password: ['', Validators.required ],
    repassword: ['', Validators.required ]
  });

  public uid = '';
  public token = '';
  public code = '';
  constructor(private router: Router,
              private userservice: UserService,
              private route: ActivatedRoute,
              private fb:FormBuilder,
              public dialog: MatDialog,
              private titleService: Title) { }

  ngOnInit(): void {
      this.getLink();
  }

  getLink(){

    if(localStorage.getItem('x-token') || sessionStorage.getItem('x-token')){
      this.router.navigateByUrl('./');
      Swal.fire({icon: 'error', backdrop:false, title: 'Oops...', text: 'No puedes completar la acción por que ya estás logueado',});
      return;
    }

    this.uid = this.route.snapshot.queryParams['id'];
    this.code = this.route.snapshot.queryParams['code'];
    this.token = this.route.snapshot.params['token'];

    if(this.token != undefined){
      this.userservice.verifyLink(this.token, this.code, this.uid)
        .subscribe( (res:any) => {
          sessionStorage.setItem('tok', this.token);
          sessionStorage.setItem('code', this.code);
          sessionStorage.setItem('id', this.uid);
          this.openDialogAdminComponent();
        }, (err) => {
          this.router.navigateByUrl('./');
          Swal.fire({icon: 'error', backdrop:false, title: 'Oops...', text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',});
          //console.warn('error:', err);
        });
    }
  }

  openDialogAdminComponent() {
    this.router.navigateByUrl('./');
    const dialogRef = this.dialog.open(

      VerifyadmincomponentComponent,{
        data: {
          },
       });

    dialogRef.afterClosed().subscribe(result => {
      this.titleService.setTitle("Towny");
      sessionStorage.clear();
    });
  }

}
