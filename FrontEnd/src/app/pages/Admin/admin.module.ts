import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardAdminComponent } from './dashboardAdmin/dashboardAdmin.component';
import { ProvinciasComponent } from './provincias/provincias.component';
import { ReviewsComponent, ReviewDetails } from './reviews/reviews.component';
import { PaginationComponent } from 'src/app/commons/pagination/pagination.component';
import { CommonsModule } from 'src/app/commons/commons.module';
import { UsersComponent, UserDetails } from './users/users.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PueblosComponent, PuebloDetails } from './pueblos/pueblos.component';
import { ProvinciaComponent } from './provincia/provincia.component';
import { PlaceDetails, PlacesComponent } from './places/places.component';
import { UserComponent } from './user/user.component';
import { TravelsComponent, TravelDetails } from './travels/travels.component';
import { TravelComponent } from './travel/travel.component';
import { PuebloComponent } from './pueblo/pueblo.component';
import { EventsComponent, EventDetails } from './events/events.component';
import { NgSelect2Module } from 'ng-select2';
import { EventComponent } from './event/event.component';
import { PlaceComponent } from './place/place.component';
import { PagosSuscripcionComponent } from './pagosSuscripcion/pagosSuscripcion.component';
import { PagosLugarComponent } from './pagosLugar/pagosLugar.component';
import { ReviewComponent } from './review/review.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RequestsComponent, RequestDetails } from './requests/requests.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';
import {MatSortModule} from '@angular/material/sort';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table'
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';

import { UpdatepasswordadminComponent } from './updatepasswordadmin/updatepasswordadmin.component';
import { PaginacionDirective } from '../directivas/paginacion.directive';

import { BrowserModule } from '@angular/platform-browser';
import { FusionChartsModule } from 'angular-fusioncharts';

// Load FusionCharts
import * as FusionCharts from 'fusioncharts';
// Load Charts module
import * as Charts from 'fusioncharts/fusioncharts.charts';
// Load fusion theme
import * as Fusion from 'fusioncharts/themes/fusioncharts.theme.fusion'

// Add dependencies to FusionChartsModule
FusionChartsModule.fcRoot(FusionCharts, Charts, Fusion);


@NgModule({
  schemas:[NO_ERRORS_SCHEMA],
  declarations: [
    DashboardAdminComponent,
    ProvinciasComponent,
    ReviewsComponent,
    UsersComponent,
    UserDetails,
    PueblosComponent,
    PuebloDetails,
    ProvinciaComponent,
    PlacesComponent,
    UserComponent,
    TravelsComponent,
    TravelComponent,
    TravelDetails,
    PuebloComponent,
    EventsComponent,
    EventComponent,
    EventDetails, 
    PlaceComponent,
    PlaceDetails,
    ReviewComponent,
    ReviewDetails,
    RequestsComponent,
    RequestDetails,
    UpdatepasswordadminComponent,
    PaginacionDirective,
    PagosLugarComponent,
    PagosSuscripcionComponent

  ],
  exports: [
    DashboardAdminComponent,
    ProvinciasComponent,
    UsersComponent,
    UserComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonsModule,
    NgSelect2Module,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatSliderModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    FusionChartsModule

  ]
})
export class AdminModule { }
