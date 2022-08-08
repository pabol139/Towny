import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-comparacion',
  templateUrl: './comparacion.component.html',
  styleUrls: ['./comparacion.component.css']
})
export class ComparacionComponent implements OnInit {


  public ganador = "-"
  public p1 = "-"
  public p2 = "-"

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  public datosForm = this.fb.group({
    kw1: [''],
    kw2: [ ''],
    precision: ['100'],
  });

  async enviar(): Promise<void> {
    
    const kw1 = this.datosForm.get('kw1').value
    const kw2 = this.datosForm.get('kw2').value
    const precision = this.datosForm.get('precision').value
    const requestHeaders: HeadersInit = new Headers();
    
    const url = 'https://towny.ovh/puntuacion?keyword1='+kw1+'&keyword2='+kw2+'&precision='+precision;


    const response = await fetch(url, {
        method: 'GET',
        headers: requestHeaders
      });


    const data = await response.json();

    this.ganador = data['win']
    this.p1 = data['kw1']
    this.p2 = data['kw2']


    return data

  }


}
