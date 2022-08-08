import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from 'src/app/commons/pagination/pagination.component';
import { CommonsModule } from 'src/app/commons/commons.module';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelect2Module } from 'ng-select2';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardCommerceComponent } from './dashboard-commerce/dashboard-commerce.component';
import { PagosComponent } from './pagos/pagos.component';
import { BillComponent } from './bill/bill.component';
import { RenovarComponent } from './renovar/renovar.component';
import { ProfileComponent } from './profile/profile.component';
import { ComerciosComponent } from './comercios/comercios.component';
import { ComercioComponent } from './comercio/comercio.component';
import { MatSliderModule } from '@angular/material/slider';
import {MatSortModule} from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table'
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReviewsComComponent } from './reviews/reviews.component';

import {MatTabsModule} from '@angular/material/tabs';



@NgModule({
  declarations: [
  DashboardCommerceComponent,
  PagosComponent,
  BillComponent,
  RenovarComponent,
  ProfileComponent,
  ComerciosComponent,
  ComercioComponent,
  ReviewsComComponent

  ],
  exports: [
    DashboardCommerceComponent,
    PagosComponent,
    BillComponent,
    RenovarComponent,
    ProfileComponent,
    ComerciosComponent,
    ReviewsComComponent

  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonsModule,
    NgSelect2Module,
    MatSliderModule,
    MatSortModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatRadioModule,
    //borrar si hace falta debajo
    NgMultiSelectDropDownModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatTabsModule
  ]
})
export class CommerceModule { }
