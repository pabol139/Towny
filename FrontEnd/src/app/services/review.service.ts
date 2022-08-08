import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment  } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(private http: HttpClient) { }

  cargarReview( uid: string): Observable<object> {
    if (!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/reviews?id=${uid}` , this.cabeceras);
  }

  getAllReviews(){
    return this.http.get(`${environment.base_url}/reviews/all` , this.cabeceras);
  }


  getAllReviewsbyCommerce(user:string,place:string,text:string){
    if (!user) { user = '';}
    if (!place) { place = '';}else{
      place = `&place=${place}`;
    }
    if (!text) { text = '';}else{
      text = `&text=${text}`;
    }

    return this.http.get(`${environment.base_url}/reviews/bycommerce?user=${user}${place}${text}` , this.cabeceras);
  }


  cargarReviews( desde: number, texto?: string, place?: string): Observable<object> {
    if (!desde) { desde = 0; }
    //if (!hasta) { hasta = '10';}
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
    return this.http.get(`${environment.base_url}/reviews?desde=${desde}${texto}${place}` , this.cabeceras);
  }

  cargarReviewsUser( desde: number, user: string, texto?: string, review?: number, province?: string, order?: string): Observable<object> {
    if (!desde) { desde = 0; }
    //if (!hasta) { hasta = '10';}
    let revw = ''; let prov = ''; let ord = '';
    if (!user) { user = ''; } else { user = `&user=${user}`; }
    if (!texto) { texto = ''; } else { texto = `&texto=${texto}`; }
    if (!review) { revw = ''; } else { revw = `&review=${review}`; }
    if (!province) { prov = ''; } else { prov = `&province=${province}`; }
    if(!order) { ord = ''; } else { ord = `&order=${order}`; }

    return this.http.get(`${environment.base_url}/reviews?desde=${desde}${user}${texto}${revw}${prov}${ord}` , this.cabeceras);
  }

  cargarReviewsPlace( desde: number, place: string, texto?: string, review?: number, order?: string): Observable<object> {
    if (!desde) { desde = 0; }
    //if (!hasta) { hasta = '10';}
    let revw = ''; let prov = ''; let ord = '';
    if (!place) { place = ''; } else { place = `&place=${place}`; }
    if (!texto) { texto = ''; } else { texto = `&texto=${texto}`; }
    if (!review) { revw = ''; } else { revw = `&review=${review}`; }
    if(!order) { ord = ''; } else { ord = `&order=${order}`; }

    return this.http.get(`${environment.base_url}/reviews/byplace?desde=${desde}${place}${texto}${revw}${ord}` , this.cabeceras);
  }

  cargarAllReviews(  ): Observable<object> {

    return this.http.get(`${environment.base_url}/reviews/all` , this.cabeceras);
  }

  eliminarReview (uid:string) {
    return this.http.delete(`${environment.base_url}/reviews/${uid}`, this.cabeceras);
  }
  crearReview( data: Review ): Observable<object> {
    return this.http.post(`${environment.base_url}/reviews/`, data, this.cabeceras);
  }

  actualizarReview(uid: string, data: Review, user?: string): Observable<object> {

    if(!user){
      user = '';
    } else{
      user= `&user=${user}`
    }

    return this.http.put(`${environment.base_url}/reviews/${uid}?${user}`, data, this.cabeceras);
  }

  crearImagenUrl( imagen: string) {

    const token = localStorage.getItem('x-token') || sessionStorage.getItem('x-token') || '';
    //console.log(imagen);
    if (!imagen) {
      return `${environment.base_url}/upload/fotoreview/no-imagen?token=${token}`;
    }
    return `${environment.base_url}/upload/fotoreview/${imagen}?token=${token}`;
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
