import { Injectable } from '@angular/core';
import { sidebarItem } from '../interfaces/sidebar.interface';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  menuAdmin: sidebarItem[] =[
    { title: 'Dashboard', icon: 'fa fa-home', sub: false, url: '/admin'},
    { title: 'Usuarios', icon: 'fa fa-users', sub: false, url: '/admin/users'},
    { title: 'Pueblos', icon: 'fas fa-city', sub: false, url: '/admin/towns'},
    { title: 'Provincias', icon: 'fas fa-route-interstate', sub: false, url: '/admin/provincias'},

    { title: 'Lugares', icon: 'far fa-map-marker-times', sub: false, url: '/admin/places'},
    { title: 'Solicitudes', icon: 'far fa-calendar-check', sub: false, url: '/admin/requests'},
    { title: 'Valoraciones', icon: 'fas fa-star', sub: false, url: '/admin/reviews'},
    { title: 'Rutas', icon: 'fa fa-route', sub: false, url: '/admin/travels'},
    { title: 'Eventos', icon: 'fas fa-calendar-star', sub: false, url: '/admin/events'},
    { title: 'Recibos lug.', icon: 'fas fa-money-check', sub: false, url: '/admin/pagosLugar'},
    { title: 'Recibos sus.', icon: 'zmdi zmdi-money', sub: false, url: '/admin/pagosSuscripcion'},

  ];
  menuUser: sidebarItem[]=[
    { title: 'Dashboard', icon: 'fa fa-tachometer-alt', sub: false, url: ''},
    { title: 'Prueba pa que bien', icon: 'fas fa-cog', sub: false, url: ''},
    { title: 'Configuración', icon: 'fas fa-cog', sub: false, url: '/admin/settings'}
  ];
  menuCommerce: sidebarItem[]=[
    { title: 'Dashboard', icon: 'fa fa-home', sub: false, url: '/commerce'},
    { title: 'Mis comercios', icon: 'zmdi zmdi-shopping-cart', sub: false, url: '/commerce/comercios'},
    { title: 'Mis valoraciones', icon: 'fas fa-star', sub: false, url: '/commerce/reviews'},
    { title: 'Suscripción', icon: 'zmdi zmdi-money', sub: false, url: '/commerce/payment'},
    { title: 'Mis facturas', icon: 'fas fa-money-bill', sub: false, url: '/commerce/bill'},
    { title: 'Mi perfil', icon: 'fa fa-users', sub: false, url: '/commerce/profile'},
  ];
  none: sidebarItem[]=[
    { title: 'error', icon: 'fa fa-exclamation-triangle', sub: false, url: '/error'}
  ]

  constructor(private userservice: UserService) { }

  getMenu(){
    //console.log(this.userservice);
    //console.log(this.userservice.rol);
    switch (this.userservice.rol) {
      case 'ROL_ADMIN':
        return this.menuAdmin;
      case 'ROL_COMMERCE':
        return this.menuCommerce;
      case 'ROL_USER' || '':
        return this.menuUser;
    }

    return this.none;
  }
}
