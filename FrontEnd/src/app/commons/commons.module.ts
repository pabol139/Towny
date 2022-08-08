import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UsericonComponent} from './usericon/usericon.component';
import { chatbotComponent} from './chatbot/chatbot.component';
import { AppRoutingModule } from '../app-routing.module';
import { PaginationComponent } from './pagination/pagination.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ModalModule } from './modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiltersbarComponent } from './filtersbar/filtersbar.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatSliderModule} from '@angular/material/slider';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { FusionChartsModule } from 'angular-fusioncharts';
import { MatNativeDateModule } from '@angular/material/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ViajesComponent } from '../pages/User/viajes/viajes.component';
import { PagesModule } from '../pages/pages.module';
import { UserModule } from '../pages/User/user.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CardinfoComponent } from './cardinfo/cardinfo.component';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReviewsLugarComponent } from './reviews-lugar/reviews-lugar.component';
import { ListaLugaresComponent } from './lista-lugares/lista-lugares.component';
import { ListaEventosComponent } from './lista-eventos/lista-eventos.component';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    UsericonComponent,
    PaginationComponent,
    BreadcrumbComponent,
    FiltersbarComponent,
    chatbotComponent,
    CardinfoComponent,
    ReviewsLugarComponent,
    ListaLugaresComponent,
    ListaEventosComponent,
    ReviewsLugarComponent
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    UsericonComponent,
    PaginationComponent,
    BreadcrumbComponent,
    FiltersbarComponent,
    chatbotComponent,
    CardinfoComponent,
    ReviewsLugarComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    ModalModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatSliderModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    FusionChartsModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule

  ],
  bootstrap: [UsericonComponent]
})
export class CommonsModule { }
