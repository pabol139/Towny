import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; //Formulario reactivo
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home.component';
import { CommonsModule } from '../commons/commons.module';
import { MotorModule } from '../motor/motor.module';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { UserModule } from '../pages/User/user.module';




@NgModule({
  declarations: [
    HomeComponent,
  ],
  exports:[
    HomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonsModule,
    MotorModule,
    MatSidenavModule,
    UserModule

  ]
})
export class HomeModule { }
