import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RecoveryComponent } from './recovery/recovery.component';
import { AuthLayoutComponent } from '../layouts/auth-layout/auth-layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; //Formulario reactivo
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';
import { SendmailComponent } from './sendmail/sendmail.component';
import { CommonsModule } from '../commons/commons.module';
import { RegisterCommerceComponent } from './register-commerce/register-commerce.component';
import { VerifyadminComponent } from './verifyadmin/verifyadmin.component';
import { VerifyadmincomponentComponent } from './verifyadmincomponent/verifyadmincomponent.component';
import { VeryfylinkrecoveryComponent } from './veryfylinkrecovery/veryfylinkrecovery.component';


@NgModule({
  declarations: [
    LoginComponent,
    RecoveryComponent,
    AuthLayoutComponent,
    RegisterComponent,
    SendmailComponent,
    RegisterCommerceComponent,
    VerifyadminComponent,
    VerifyadmincomponentComponent,
    VeryfylinkrecoveryComponent
  ],
  exports:[
    LoginComponent,
    RecoveryComponent,
    AuthLayoutComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    CommonsModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class AuthModule { }
