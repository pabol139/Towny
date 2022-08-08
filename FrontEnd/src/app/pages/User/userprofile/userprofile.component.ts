import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { UpdatePasswordComponent } from '../update-password/update-password.component';
import { EdituserprofileComponent } from '../edituserprofile/edituserprofile.component';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css']
})
export class UserprofileComponent implements OnInit {

  constructor( private userservice: UserService,
               private dialog: MatDialog) { }


    public id = this.userservice.uid
    public name = this.userservice.name
    public registerDate = this.userservice.registerDate
    public email = this.userservice.email
    public reviewsNumber = 0
    public travelsNumber = 0
    public favoriteNumber = 0
    public imagenUrl = '';
    
  ngOnInit(): void {

    if(this.id != ""){
      this.cargarDatos();
      this.imagenUrl = this.userservice.imagenURL;
    }

  }

  ngAfterViewInit() {
    if(this.id != ""){
      this.cargarDatos();
    }
  }

  openDialog() {

    this.dialog.open(
      EdituserprofileComponent,
      {
      width: '65%',
      maxWidth: '500px',
        data:{
          usuario:{
            id:this.id
          }
        }
      });
  }

  openModalChangePassword(){
      const dialogRef = this.dialog.open(

        UpdatePasswordComponent,{
        });


      dialogRef.afterClosed().subscribe(result => {
        //this.titleService.setTitle("Towny");

      });

  }

    cargarDatos(){

      this.userservice.getUser(this.id).subscribe(res => {

        if (!res['users']) {
          //this.router.navigateByUrl('/admin/users');
          return;
        };

        this.favoriteNumber = res['users'].favorites.length;
        this.reviewsNumber = res['users'].reviews.length;
        this.travelsNumber = res['users'].travels.length;

      }, (err) => {
        const errtext = err.error.msg || 'No se pudo guardar los datos';
        Swal.fire({icon: 'error', title: 'Oops...', text: errtext});
      });
      

    }


}
