import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SidebarLayoutComponent } from '../layouts/sidebar-layout/sidebar-layout.component';

import { FaqComponent } from './faq/faq.component';
import { DashboardAdminComponent } from './Admin/dashboardAdmin/dashboardAdmin.component';
import { AuthGuard } from '../guards/auth.guard';
import { AuthNotLoggedGuard } from '../guards/authnotlogged.guard';
import { NoauthGuard } from '../guards/noauth.guard';
import { ProvinciasComponent } from './Admin/provincias/provincias.component';
import { UsersComponent } from './Admin/users/users.component';
import { PueblosComponent } from './Admin/pueblos/pueblos.component';
import { ProvinciaComponent } from './Admin/provincia/provincia.component';
import { UserComponent } from './Admin/user/user.component';
import { ReviewsComponent } from './Admin/reviews/reviews.component';
import { PlaceComponent } from './Admin/place/place.component';
import { PlacesComponent } from './Admin/places/places.component';
import { TravelsComponent } from './Admin/travels/travels.component';
import { TravelComponent } from './Admin/travel/travel.component';
import { PuebloComponent } from './Admin/pueblo/pueblo.component';
import { EventsComponent } from './Admin/events/events.component';
import { PagosLugarComponent } from './Admin/pagosLugar/pagosLugar.component';
import { PagosSuscripcionComponent } from './Admin/pagosSuscripcion/pagosSuscripcion.component';
import { EventComponent } from './Admin/event/event.component';
import { ReviewComponent } from './Admin/review/review.component';
import { RequestsComponent } from './Admin/requests/requests.component';
import { HomeComponent } from '../home/home.component';
import { VerificationPageComponent } from './User/verification-page/verification-page.component';
import { DashboardCommerceComponent } from './Commerce/dashboard-commerce/dashboard-commerce.component';
import { ComerciosComponent } from './Commerce/comercios/comercios.component';
import { PagosComponent } from './Commerce/pagos/pagos.component';
import { BillComponent } from './Commerce/bill/bill.component';
import { ProfileComponent } from './Commerce/profile/profile.component';
import { HomeLayoutComponent } from '../layouts/home-layout/home-layout.component';
import { ComercioComponent } from './Commerce/comercio/comercio.component';
import { ReviewsComComponent } from './Commerce/reviews/reviews.component';
import { UserprofileComponent } from './User/userprofile/userprofile.component';
import { ComparacionComponent } from './comparacion/comparacion.component';
import { UpdatepasswordadminComponent } from './Admin/updatepasswordadmin/updatepasswordadmin.component';
import { RenovarComponent } from './Commerce/renovar/renovar.component';
import { PagoslugarComponent } from './Commerce/pagoslugar/pagoslugar.component';



const routes: Routes = [

 /* { path: 'admin', component: AdminLayoutComponent, canActivate: [ AuthGuard], data: {rol: 'ROL_ADMIN'},
    children: [
    { path: 'dashboard', component: DashboardComponent, canActivate: [ AuthGuard ], data: {
                                                        rol: 'ROL_ADMIN',
                                                        titulo: 'Dashboard Admin',
                                                        breadcrums: []
                                                      },},
    { path: 'usuarios', component: UsuariosComponent, canActivate: [ AuthGuard ], data: {
                                                        rol: 'ROL_ADMIN',
                                                        titulo: 'Usuarios',
                                                        breadcrums: [ ],
                                                      },},*/

  /*{ path: 'dashboard', component: SidebarLayoutComponent, canActivate: [AuthGuard],
    children: [
      //{ path: '', component: DashboardUserComponent },
      { path: '', component: DashboardAdminComponent, data:{titulo: 'Dashboard'} },
      //{ path: '', component: DashboardUserComponent, canActivate: [AuthGuard], data: {rol:'ROL_USER'} },
      //{ path: 'admin', component: DashboardAdminComponent,canActivate: [AuthGuard], data: {rol:'ROL_ADMIN'}  },
      { path: '**', redirectTo: '' }
    ]
  },*/
  { path: 'admin', component: SidebarLayoutComponent, canActivate: [AuthGuard], data: {rol: 'ROL_ADMIN'},
  children: [
    //{ path: '', component: DashboardUserComponent },
    { path: '', component: DashboardAdminComponent, data: {
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Dashboard',
                                                    breadcrums: [ /*{titulo: 'Dashboard', url: '/admin'}*/ ],}
                                                  },
    { path: 'provincias', component: ProvinciasComponent, canActivate: [AuthGuard], data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Provincias',
                                                    breadcrums: [ /*{titulo: 'Provincias', url: '/admin/provincias'}*/ ],},
                                                  },
     { path: 'provincias/provincia/:uid', component: ProvinciaComponent, canActivate: [AuthGuard], data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Provincia',
                                                    breadcrums: [ {titulo: 'Provincias', url: '/admin/provinces/provincia'} ],},
     },
    { path: 'users', component: UsersComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Usuarios',
                                                    breadcrums: [ /*{titulo: 'Usuarios', url: '/admin/users'} */],},
                                                  },
    { path: 'users/user/:uid', component: UserComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Usuario',
                                                    breadcrums: [ {titulo: 'Usuarios', url: '/admin/users'} ],},
                                                  },
   { path: 'places', component: PlacesComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Lugares',
                                                    breadcrums: [ /*{titulo: 'Lugares', url: '/admin/places'} */],},
                                                  },
  { path: 'places/place/:uid', component: PlaceComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Lugar',
                                                    breadcrums: [ {titulo: 'Lugar', url: '/admin/places'} ],},
                                                  },
    { path: 'travels', component: TravelsComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Viajes',
                                                    breadcrums: [ /*{titulo: 'Viajes', url: '/admin/travels'}*/ ],},
    },
    { path: 'travels/travel/:uid', component: TravelComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Viaje',
                                                    breadcrums: [ {titulo: 'Viaje', url: '/admin/travels'} ],},
    },
   { path: 'reviews', component: ReviewsComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Valoraciones',
                                                    breadcrums: [ /*{titulo: 'Valoraciones', url: '/admin/reviews'}*/ ],},
                                                  },
    { path: 'reviews/review/:uid', component: ReviewComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Valoracion',
                                                    breadcrums: [ {titulo: 'Valoracion', url: '/admin/reviews'} ],},},
    { path: 'towns', component: PueblosComponent, data:{
                                                  rol: 'ROL_ADMIN',
                                                  titulo: 'Pueblos',
                                                  breadcrums: [ /*{titulo: 'Provincias', url: '/admin/provincias'}*/ ],},},
    { path: 'towns/town/:uid', component: PuebloComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Pueblo',
                                                    breadcrums: [ {titulo: 'Pueblo', url: '/admin/towns/town'} ],},
     },/*
    { path: 'towns/town/:uid', component: PuebloComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Pueblo',
                                                    breadcrums: [ {titulo: 'Pueblo', url: '/admin/towns/town'} ],},
     },*/
     { path: 'events', component: EventsComponent, data:{
                                                    rol: 'ROL_ADMIN',
                                                    titulo: 'Eventos',
                                                    breadcrums: [ /*{titulo: 'Eventos', url: '/admin/events'}*/ ],},},
    { path: 'pagosLugar', component: PagosLugarComponent, data:{
                                                      rol: 'ROL_ADMIN',
                                                      titulo: 'Pagos lugar',
                                                      breadcrums: [ /*{titulo: 'Eventos', url: '/admin/events'}*/ ],},},
    { path: 'pagosSuscripcion', component: PagosSuscripcionComponent, data:{
                                                        rol: 'ROL_ADMIN',
                                                        titulo: 'Pagos suscripcion',
                                                        breadcrums: [ /*{titulo: 'Eventos', url: '/admin/events'}*/ ],},},                                                
     { path: 'events/event/:uid', component: EventComponent, data:{
                                                      rol: 'ROL_ADMIN',
                                                      titulo: 'Evento',
                                                      breadcrums: [ {titulo: 'Evento', url: '/admin/events/event'} ],},},
     { path: 'requests', component: RequestsComponent, data:{
                                                        rol: 'ROL_ADMIN',
                                                        titulo: 'Solicitudes',
                                                        breadcrums: [ /*{titulo: 'Solicitudes', url: '/admin/requests'}*/ ],},},
     { path: 'updatepasswordadmin/:uid', component: UpdatepasswordadminComponent, data:{
                                                          rol: 'ROL_ADMIN',
                                                          titulo: 'Cambiar contraseña',
                                                          breadcrums: [ /*{titulo: 'Solicitudes', url: '/admin/requests'}*/ ],},},
    { path: '**', redirectTo: '/' }
  ]
},


{ path: 'commerce', component: SidebarLayoutComponent, canActivate: [AuthGuard], data: {rol: 'ROL_COMMERCE'},
children: [
  //{ path: '', component: DashboardUserComponent },
  { path: '', component: DashboardCommerceComponent, data: {
                                                  rol: 'ROL_COMMERCE',
                                                  titulo: 'Dashboard',
                                                  breadcrums: [ {titulo: 'Dashboard', url: '/commerce'} ],}
                                                },
  { path: 'comercios', component: ComerciosComponent, canActivate: [AuthGuard], data:{
                                                  rol: 'ROL_COMMERCE',
                                                  titulo: 'Comercios',
                                                  breadcrums: [ /*{titulo: 'Provincias', url: '/admin/provincias'}*/ ],},
                                                },
    { path: 'comercios/comercio/:uid', component: ComercioComponent, canActivate: [AuthGuard], data:{
                                                  rol: 'ROL_COMMERCE',
                                                  titulo: 'Comercios',
                                                  breadcrums: [ {titulo: 'Lugar', url: '/admin/commerces/comercio'} ],},
                                                },
    { path: 'reviews', component: ReviewsComComponent, canActivate: [AuthGuard], data:{
                                                  rol: 'ROL_COMMERCE',
                                                  titulo: 'Valoraciones',
                                                 }},
   { path: 'reviews/:uid', component: ReviewsComComponent, canActivate: [AuthGuard], data:{
    rol: 'ROL_COMMERCE',
    titulo: 'Valoraciones',
    }},
   { path: 'payment', component: PagosComponent, canActivate: [AuthGuard], data:{
                                                  rol: 'ROL_COMMERCE',
                                                  titulo: 'Mi suscripción',
                                                  breadcrums: [ {titulo: 'Suscripciones', url: '/commerce/payment'} ],},
   },
   { path: 'bill', component: BillComponent, canActivate: [AuthGuard], data:{
                                                  rol: 'ROL_COMMERCE',
                                                  titulo: 'Mis facturas',
                                                  breadcrums: [ {titulo: 'Facturación', url: '/commerce/bill'} ],},
    },
    { path: 'renovar/:finplanactual', component: RenovarComponent, canActivate: [AuthGuard], data:{
      rol: 'ROL_COMMERCE',
      titulo: 'Renovar cuota',
      breadcrums: [ {titulo: 'Facturación', url: '/commerce/renovar'} ],},
    },{ path: 'pagoslugar/:tipo', component: PagoslugarComponent, canActivate: [AuthGuard], data:{
      rol: 'ROL_COMMERCE',
      titulo: 'Dar de alta lugar',
      breadcrums: [ {titulo: 'Facturación', url: '/commerce/pagoslugar'} ],},
    },
   { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data:{
     rol: 'ROL_COMMERCE',
     titulo: 'Perfil - Comerciante',
     breadcrums: [ {titulo: 'Perfil', url: '/commerce/Profile'} ],},
},

  { path: '**', redirectTo: '/' }
]
},


{ path: '', component: HomeLayoutComponent, canActivate: [AuthNotLoggedGuard],  data: {rol: '*'},
  children: [
    //{ path: '', component: DashboardUserComponent },
    { path: '', component: HomeComponent, data: {
                                                    rol: '*',
                                                    //titulo: 'Dashboard',
                                                    //breadcrums: [ {titulo: 'Dashboard', url: '/user'} ],
                                                  }
                                                  },
    { path: 'profile', component: UserprofileComponent, data: {
                                                    rol: 'ROL_USER',
                                                    //titulo: 'Dashboard',
                                                    //breadcrums: [ {titulo: 'Dashboard', url: '/user'} ],
                                                  }
                                                  },
    { path: 'users/validate/validar_normal',  component: VerificationPageComponent, data:{
                                                    //rol: 'ROL_USER',
                                                    titulo: 'Confirmed',
                                                    },},
    { path: 'faq', component: FaqComponent },
    { path: 'comparacion', component: ComparacionComponent },

    { path: '**', redirectTo: '/' }
  ]
},




];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
