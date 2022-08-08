import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { loginForm  } from '../interfaces/login-form.interface';
import { environment } from '../../environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Place } from '../models/place.model';
import { FormGroup } from '@angular/forms';

//Comunicación con la API - Usuarios
@Injectable({
  providedIn: 'root'
})
export class PlaceService {

  private place: Place;

  constructor( private http: HttpClient,
               private router:Router,
              ) { this.place=new Place('','') }


  getAllPlaces(){
    return this.http.get(`${environment.base_url}/places/all` , this.cabeceras);
  }

  getPlace( uid: string): Observable<object> {
  if (!uid) { uid = '';}
  return this.http.get(`${environment.base_url}/places?id=${uid}` , this.cabeceras);
  }

  payLugar(uid: string, data:Object){
    return this.http.post(`${environment.base_url}/places/pay/${uid}`,data, this.cabeceras);
  }

  getPlacesByFilterSearch( since: number, population?: number, review?: number,
    culto?: boolean, monument?: boolean, green_zone?: boolean, entertainment?: boolean,
    commerce?: boolean, art_and_cult?: boolean, restaurant?: boolean, province?: string): Observable<object> {
    if (!since) { since = 0;}
    let pop = ''; let rev = ''; let formC = ''; let mon = ''; let green = '';
    let enter = ''; let com = ''; let art = ''; let rest = ''; let prov = '';

    if(population){
      pop = `&population=${population}`;
    }
    if(review){
      rev = `&review=${review}`;
    }
    if(culto){
      formC = `&cult=${culto}`;
    }
    if(monument){
      mon = `&mon=${monument}`;
    }
    if(green_zone){
      green = `&green=${green_zone}`;
    }
    if(entertainment){
      enter=`&enter=${entertainment}`;
    }
    if(commerce){
      com=`&com=${commerce}`;
    }
    if(art_and_cult){
      art=`&art=${art_and_cult}`;
    }
    if(restaurant){
      rest=`&rest=${restaurant}`;
    }
    if(province){
      prov=`&province=${province}`;
    }

    return this.http.get(`${environment.base_url}/places/filterBar?since=${since}${pop}${rev}${formC}${mon}${green}${enter}${com}${art}${rest}${prov}`, this.cabeceras);
}

getPlacesByCommerce( order?: string ): Observable<object> {
  let ord = '';
  if(order) ord = `order=${order}`;
  return this.http.get(`${environment.base_url}/places/bycommerce?order=${order}` , this.cabeceras);
}

getPlaces( since: number, textoBusqueda?: string ): Observable<object> {
  if (!since) { since = 0;}
  if (!textoBusqueda) {textoBusqueda = '';}
  return this.http.get(`${environment.base_url}/places/?since=${since}&texto=${textoBusqueda}` , this.cabeceras);
}

  updatePlace( uid: string, data: Place) {


    return this.http.put(`${environment.base_url}/places/${uid}`, data, this.cabeceras);
  }

  denyPlace( uid: string, fb: string) {



    return this.http.put(`${environment.base_url}/places/deny/${uid}/${fb}` , this.cabeceras);
  }


  deletePlace( uid: string) {
    if (!uid || uid === null) {uid = 'a'; }
    return this.http.delete(`${environment.base_url}/places/${uid}` , this.cabeceras);
  }
  acceptPlace( uid: string) {
    if (!uid || uid === null) {uid = 'a'; }
    return this.http.put(`${environment.base_url}/places/accept/${uid}`, this.cabeceras);
  }
  activate( uid: string) {
    if (!uid || uid === null) {uid = 'a'; }
    return this.http.put(`${environment.base_url}/places/activate/${uid}`, this.cabeceras);
  }
  deactivate( uid: string) {
    if (!uid || uid === null) {uid = 'a'; }
    return this.http.put(`${environment.base_url}/places/deactivate/${uid}`, this.cabeceras);
  }


  newPlace ( data: Place){


    return this.http.post(`${environment.base_url}/places/`, data, this.cabeceras);

  }

  cleanLocalStore(): void{
    localStorage.removeItem('x-token');
    sessionStorage.removeItem('x-token');
  }

  crearImagenUrl( imagen: string) {
    const token = localStorage.getItem('x-token') || sessionStorage.getItem('x-token') || '';
    if (!imagen) {
      return `${environment.base_url}/upload/fotoplace/no-imagen?token=${token}`;
    }
    return `${environment.base_url}/upload/fotoplace/${imagen}?token=${token}`;
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

 get uid(): string {
    return this.place?.uid;
    //return 'hola';
  }

  get name(): string{
    return this.name;
  }

  get location(): string{
    return this.location;
  }

  /*
  get pictures(): string{
    return this.pictures;
  }
  */

  get mobile_number(): number{
    return this.mobile_number;
  }

  get description(): string{
    return this.description;
  }

  get type(): string{
    return this.type;
  }

  get web(): string{
    return this.web;
  }

  get status(): string{
    return this.status;
  }

  get visits(): number{
    return this.visits;
  }

  /*
  get province(): string{
    return this.province;
  }
  */
  /*get email(): string{
    return this.user.email;
  }

  get picture(): string{
    return this.user.picture;
  }*/

}
