import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthModule } from './auth/auth.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PagesModule } from './pages/pages.module';
import { CommonsModule } from './commons/commons.module';
import { HomeModule } from './home/home.module';
import { MessageService } from './services/message.service';
import { FormsModule } from '@angular/forms';
import { NgSelect2Component, NgSelect2Module } from 'ng-select2';
import { CardComponent, NgxChartsModule } from '@swimlane/ngx-charts';
import { MotorModule } from './motor/motor.module';
import { ModalModule } from './commons/modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UiComponent } from './motor/ui/ui.component';
import { UsericonComponent } from './commons/usericon/usericon.component';
import { CardinfoComponent } from './commons/cardinfo/cardinfo.component';
import { FavoritosComponent } from './pages/User/favoritos/favoritos.component';
import { ReviewsLugarComponent } from './commons/reviews-lugar/reviews-lugar.component';
import { ValoracionComponent } from './pages/User/valoracion/valoracion.component';
import { FiltersbarComponent } from './commons/filtersbar/filtersbar.component';
import { ListaEventosComponent } from './commons/lista-eventos/lista-eventos.component';
import { ListaLugaresComponent } from './commons/lista-lugares/lista-lugares.component';




@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    PagesModule,
    CommonsModule,
    HomeModule,
    FormsModule,
    NgSelect2Module,
    NgxChartsModule,
    MotorModule,
    ModalModule,
    BrowserAnimationsModule,

  ],
  providers: [MessageService,UiComponent, UsericonComponent, CardinfoComponent, FavoritosComponent, ValoracionComponent, FiltersbarComponent, ListaEventosComponent, ListaLugaresComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
