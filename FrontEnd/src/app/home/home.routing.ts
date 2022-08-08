import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SidebarComponent } from '../commons/sidebar/sidebar.component';


import { NoauthGuard } from '../guards/noauth.guard';
import { HomeLayoutComponent } from '../layouts/home-layout/home-layout.component';
import { HomeComponent } from './home.component';


const routes: Routes = [

  {
    path: '', component: HomeLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: '**', redirectTo: '' } //da igual que pongas /login/perro que te lleva a /login
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
