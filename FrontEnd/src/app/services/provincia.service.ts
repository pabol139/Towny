import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment  } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Provincia } from '../models/provincia.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {

  constructor(private http: HttpClient) { }

  cargarProvincia( uid: string): Observable<object> {
    if (!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/provinces?id=${uid}` , this.cabeceras);
  }

  cargarProvincias( desde: number, textoBusqueda?: string, hasta?:string ): Observable<object> {
    if (!desde) { desde = 0; }
    if (!textoBusqueda) { textoBusqueda = ''; }
    if (!hasta) { hasta = '10'; }
    return this.http.get(`${environment.base_url}/provinces?desde=${desde}&name=${textoBusqueda}&hasta=${hasta}` , this.cabeceras);
  }
  cargarAllProvincias(  ): Observable<object> {

    return this.http.get(`${environment.base_url}/provinces/all` , this.cabeceras);
  }

  eliminarProvincia (uid:string) {
    return this.http.delete(`${environment.base_url}/provinces/${uid}`, this.cabeceras);
  }
  crearProvincia( data: Provincia ): Observable<object> {
    return this.http.post(`${environment.base_url}/provinces/`, data, this.cabeceras);
  }

  actualizarProvincia(uid: string, data: Provincia): Observable<object> {
    return this.http.put(`${environment.base_url}/provinces/${uid}`, data, this.cabeceras);
  }


  get cabeceras() {
    return {
      headers: {
        'x-token': this.token
      }};
  }

  get token(): string {
    return localStorage.getItem('x-token') || sessionStorage.getItem('x-token') || '';
  }

}
