import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from '../layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './login/login.component';
import { RecoveryComponent } from './recovery/recovery.component';
import { RegisterComponent } from './register/register.component';
import { NoauthGuard } from '../guards/noauth.guard';
import { SendmailComponent } from './sendmail/sendmail.component';
import { RegisterCommerceComponent } from './register-commerce/register-commerce.component';
import { VerifyadminComponent } from './verifyadmin/verifyadmin.component';
import { VeryfylinkrecoveryComponent } from './veryfylinkrecovery/veryfylinkrecovery.component';


const routes: Routes = [

  /*{
    path: 'login', component: AuthLayoutComponent, canActivate: [NoauthGuard],
    children: [
      { path: '', component: LoginComponent },
      { path: '**', redirectTo: '' } //da igual que pongas /login/perro que te lleva a /login
    ]
  },
  {
    path: 'recovery', component: AuthLayoutComponent, canActivate: [NoauthGuard],
    children: [
      { path: '', component: SendmailComponent },
      { path: ':uid', component: RecoveryComponent },
      { path: '**', redirectTo: '' }
    ]
  },
  {
    path: 'register', component: AuthLayoutComponent, canActivate: [NoauthGuard],
    children: [
      { path: '', component: RegisterComponent, canActivate: [NoauthGuard] },
      { path: '**', redirectTo: '' }
    ]
  },*/
  {
    path: 'registercommerce', component: AuthLayoutComponent, canActivate: [NoauthGuard],
    children: [
      { path: '', component:RegisterCommerceComponent, canActivate: [NoauthGuard]},
      { path: '**', redirectTo: '' }
    ]
  },
  {
    path: 'users/validate/verifyadmin/:token', component: AuthLayoutComponent, canActivate: [NoauthGuard],
    children: [
      { path: '', component: VerifyadminComponent},
      { path: '**', redirectTo: '' }
    ]
  },
  {
    path: 'users/validate/verifylinkrecovery/:uid', component: AuthLayoutComponent, canActivate: [NoauthGuard],
    children: [
      { path: '', component: VeryfylinkrecoveryComponent},
      { path: '**', redirectTo: '' }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
