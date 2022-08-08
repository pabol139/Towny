import { Component } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';

import {NavigationEnd, Router} from '@angular/router';

import {environment} from '../environments/environment.prod';

declare let gtag: (property: string, value: any, configs: any) => {};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

  constructor(public router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {

      }
    });
}
}
