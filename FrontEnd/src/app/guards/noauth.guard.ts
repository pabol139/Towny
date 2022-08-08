import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoauthGuard implements CanActivate {
  constructor( private userservice: UserService,
    private router: Router) {}

canActivate(
            next: ActivatedRouteSnapshot,
            state: RouterStateSnapshot) {
  return this.userservice.validateNoToken()
    .pipe(tap( resp => {
        if(!resp){
          switch (this.userservice.rol) {
            case 'ROL_ADMIN':
              this.router.navigateByUrl('/admin');
              break;
            case 'ROL_USER':
              this.router.navigateByUrl('./');
              break;
            case 'ROL_COMMERCE':
              this.router.navigateByUrl('/commerce');
              break;
          }
          /*if(!this.userservice.rol){
            this.router.navigateByUrl('./');
          }*/
        }
      })
    );
  }
}

/*
canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      return this.usuarioService.validarNoToken()
              .pipe(
                tap( resp => {
                  if (!resp) {
                    switch (this.usuarioService.rol) {
                      case 'ROL_ADMIN':
                        this.router.navigateByUrl('/admin/dashboard');
                        break;
                      case 'ROL_ALUMNO':
                        this.router.navigateByUrl('/alu/dashboard');
                        break;
                      case 'ROL_PROFESOR':
                        this.router.navigateByUrl('/prof/dashboard');
                        break;
                    }
                    //this.router.navigateByUrl('/dashboard');
                  }
                })
              );
  }

*/
