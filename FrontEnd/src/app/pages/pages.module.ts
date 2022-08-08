import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarLayoutComponent } from '../layouts/sidebar-layout/sidebar-layout.component';
import { HomeLayoutComponent } from '../layouts/home-layout/home-layout.component';
import { SidebarComponent } from '../commons/sidebar/sidebar.component';
import { NavbarComponent } from '../commons/navbar/navbar.component';
import { FaqComponent } from './faq/faq.component';
import { User } from '../models/user.model';
import { AdminModule } from './Admin/admin.module';
import { CommonsModule } from '../commons/commons.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AppComponent } from '../app.component';
import { VerificationPageComponent } from './User/verification-page/verification-page.component';
import { CommerceModule } from './Commerce/commerce.module';
import { UserModule } from './User/user.module';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ComparacionComponent } from './comparacion/comparacion.component';
import { UserComponent } from './Admin/user/user.component';




@NgModule({
  declarations: [
    SidebarLayoutComponent,
    HomeLayoutComponent,
    FaqComponent,
    VerificationPageComponent,
    ComparacionComponent,
    
    



  ],
  exports: [
    SidebarLayoutComponent,
    FaqComponent,

  ],
  imports: [
    CommonModule,
    RouterModule,
    AdminModule,
    CommonsModule,
    CommerceModule,
    UserModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
  ],
  entryComponents: []

})
export class PagesModule { }
