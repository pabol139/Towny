import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment  } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private http: HttpClient) { }

  getEvent( uid: string): Observable<object> {
    if (!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/events?id=${uid}` , this.cabeceras);
  }

  getEvents( desde: number, textoBusqueda?: string, hasta?:string ): Observable<object> {
    if (!desde) { desde = 0; }
    if (!textoBusqueda) { textoBusqueda = ''; }
    if (!hasta) { hasta = '10'; }
    return this.http.get(`${environment.base_url}/events?desde=${desde}&name=${textoBusqueda}&hasta=${hasta}` , this.cabeceras);
  }

  deleteEvent (uid:string) {
    return this.http.delete(`${environment.base_url}/events/${uid}`, this.cabeceras);
  }
  createEvent( data: Event ): Observable<object> {
    return this.http.post(`${environment.base_url}/events/`, data, this.cabeceras);
  }

  updateEvent(uid: string, data: Event): Observable<object> {
    return this.http.put(`${environment.base_url}/events/${uid}`, data, this.cabeceras);
  }


  crearImagenUrl( imagen: string) {

    const token = localStorage.getItem('x-token') || sessionStorage.getItem('x-token') || '';
    //console.log(imagen);
    if (!imagen) {
      return `${environment.base_url}/upload/fotoevento/no-imagen?token=${token}`;
    }
    return `${environment.base_url}/upload/fotoevento/${imagen}?token=${token}`;
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
