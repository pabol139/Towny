import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../auth/login/login.component';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor( private userservice: UserService,private router: Router,public dialog: MatDialog) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      return this.userservice.validateToken()
              .pipe(
                tap( resp => {
                  // Si devuelve falso, el token no es bueno, salimos a login
                  if (!resp) {
                    this.router.navigateByUrl('./');

                      const dialogRef = this.dialog.open(
                        LoginComponent,{
                          data: {
                            },
                            //disableClose: true,
                         });
                      dialogRef.afterClosed().subscribe(result => {
                      });

                  } else {
                    // Si la ruta no es para el rol del token, reenviamos a ruta base de rol del token
                    if ((next.data.rol !== '*') && (this.userservice.rol !== next.data.rol)) {
                      switch (this.userservice.rol) {
                        case 'ROL_ADMIN':
                          window.location.href = '/admin';
                          //this.router.navigateByUrl('/admin/users');
                          break;
                        case 'ROL_USER':
                          window.location.href = './';
                          break;
                        case 'ROL_COMMERCE':
                          window.location.href = '/commerce';
                          //this.router.navigateByUrl('/commerce');
                          break;
                      }
                   }
                  }
                })
              );
  }

}
