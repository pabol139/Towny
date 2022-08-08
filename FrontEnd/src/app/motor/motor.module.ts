import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from '../app-routing.module';
import { EngineComponent } from './engine/engine.component';
import { UiComponent } from './ui/ui.component';
import { MapComponent } from './map/map.component';





@NgModule({
  declarations: [
    EngineComponent,
    UiComponent,
    MapComponent

  ],
  exports: [
    EngineComponent,
    UiComponent,
    MapComponent

  ],
  imports: [
    CommonModule,
    AppRoutingModule,


  ]
})
export class MotorModule { }
