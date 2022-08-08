import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthRoutingModule } from './auth/auth.routing';
import { HomeRoutingModule } from './home/home.routing';
import { SidebarLayoutComponent } from './layouts/sidebar-layout/sidebar-layout.component';

import { PagesRoutingModule } from './pages/pages.routing';


const routes: Routes = [

  // /login & /recovery  -->  AuthRoutingModule
  // /dashboard/*        --> PagesRoutingModule

  { path: '**', redirectTo: '' } //te redirige si la página no existe /dashboard

];

@NgModule({
  imports: [RouterModule.forRoot(routes),
            AuthRoutingModule,
            PagesRoutingModule,
            HomeRoutingModule
          ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
