import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgSelect2Module } from 'ng-select2';

import { CommonsModule } from 'src/app/commons/commons.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';

import { UserService } from '../../services/user.service';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { ViajesComponent } from './viajes/viajes.component';
import { ViajeComponent } from './viaje/viaje.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModalModule, ModalService } from 'src/app/commons/modal';
import { ValoracionesComponent } from './valoraciones/valoraciones.component';

import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { FavoritosComponent } from './favoritos/favoritos.component';
import { MatSelectModule } from '@angular/material/select';
import { ValoracionComponent } from './valoracion/valoracion.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { EdituserprofileComponent } from './edituserprofile/edituserprofile.component';

@NgModule({
  declarations: [

    UserprofileComponent,
    ViajesComponent,
    ViajeComponent,
    ValoracionesComponent,
    FavoritosComponent,
    ValoracionComponent,
    UpdatePasswordComponent,
    EdituserprofileComponent

  ],

  exports: [
    MatDialogModule,
    UserprofileComponent,
    ViajesComponent,
    ViajeComponent,
    ValoracionesComponent,
    FavoritosComponent,
    EdituserprofileComponent

  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonsModule,
    NgSelect2Module,
    MatDialogModule,
    NgMultiSelectDropDownModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    ModalModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule

  ]

})
export class UserModule { }
