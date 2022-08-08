import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthNotLoggedGuard implements CanActivate {

  constructor( private userservice: UserService,private router: Router) {}
  //este guard se activa unicamente en las plantillas del homecomponent
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      return this.userservice.validateTokenNotLogged()
              .pipe(
                tap( resp => {
                  // Si devuelve falso, el token no es bueno, salimos a login
                  if (!resp) {
                    this.router.navigateByUrl('./');
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
