import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css'],
  encapsulation: ViewEncapsulation.None //AÑADE EL CSS A LOS ESTILOS GENERALES, PUEDES CAMBIAR EL BACKGROUND COLOR DE BODY (general)
})
export class AuthLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
