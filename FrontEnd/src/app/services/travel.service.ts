import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment  } from '../../environments/environment';
import { Observable} from 'rxjs';
import { Travel } from '../models/travel.model';
@Injectable({
  providedIn: 'root'
})
export class TravelService {

    private travel: Travel = new Travel('', '');

    constructor(private http: HttpClient,
                private router:Router,) { }

    updateTravel ( uid: string, data: Travel): Observable<object> {
        return this.http.put(`${environment.base_url}/travels/${uid}`, data, this.cabeceras);
    }

    newTravel ( data: Travel): Observable<object> {
       return this.http.post(`${environment.base_url}/travels/`, data, this.cabeceras);
    }

    cargarTravel( uid: string): Observable<object> {
        if (!uid) { uid = '';}
        return this.http.get(`${environment.base_url}/travels?id=${uid}` , this.cabeceras);
    }

    cargarTravels( desde: number, texto?: string, place?: string): Observable<object> {
      if (!desde) { desde = 0; }
      if (!texto) {
        texto = '';
      } else {
        texto = `&texto=${texto}`;
      }
      if (!place) {
        place = '';
      } else {
        place = `&place=${place}`;
      }
      return this.http.get(`${environment.base_url}/travels?desde=${desde}${texto}${place}` , this.cabeceras);
    }

    cargarAllTravels(  ): Observable<object> {
      return this.http.get(`${environment.base_url}/travels/all` , this.cabeceras);
    }


    eliminarTravel (uid:string) {
        return this.http.delete(`${environment.base_url}/travels/${uid}`, this.cabeceras);
    }

    crearImagenUrl( imagen: string) {

      const token = localStorage.getItem('x-token') || sessionStorage.getItem('x-token') || '';
      //console.log(imagen);
      if (!imagen) {
        return `${environment.base_url}/upload/fototravel/no-imagen?token=${token}`;
      }
      return `${environment.base_url}/upload/fototravel/${imagen}?token=${token}`;
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
