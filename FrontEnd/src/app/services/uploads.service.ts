import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment  } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploadsService {

  constructor(private http: HttpClient) { }

  uploadPhotos(formData:any, tipo:string, uid:string){
    return this.http.post(`${environment.base_url}/upload/${tipo}/${uid}`, formData, this.cabeceras);
  }

  getPhotos( tipo:string, uid: string, photo: number){
    return this.http.get(`${environment.base_url}/upload/multifiles/${tipo}/${uid}?photo=${photo}`, this.cabeceras);
  }

  deletePhoto( tipo:string, uid: string, photo: number ){
    return this.http.delete(`${environment.base_url}/upload/deletefile/${tipo}/${uid}?photo=${photo}`, this.cabeceras);
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
