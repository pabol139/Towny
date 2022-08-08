import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment  } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Pueblo } from '../models/pueblo.model';
@Injectable({
  providedIn: 'root'
})
export class PuebloService {

  constructor(private http: HttpClient) { }

  cargarPueblo( uid: string): Observable<object> {
    if (!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/towns?id=${uid}` , this.cabeceras);
  }

  cargarPueblos( desde: number, texto?: string, province?: string ): Observable<object> {
    if (!desde) { desde = 0; }
    //if (!hasta) { hasta = '10';}
    if (!texto) {
      texto = '';
    } else {
      texto = `&texto=${texto}`;
    }
    if (!province) {
      province = '';
    } else {
      province = `&province=${province}`;
    }

    return this.http.get(`${environment.base_url}/towns?desde=${desde}${texto}${province}` , this.cabeceras);
  }

  cargarLugaresByTown( desde: number, town: string, texto?: string, review?: number, order?: string): Observable<object> {
    if (!desde) { desde = 0; }
    let revw = ''; let prov = ''; let ord = '';
    if (!town) { town = ''; } else { town = `&town=${town}`; }
    if (!texto) { texto = ''; } else { texto = `&texto=${texto}`; }
    if (!review) { revw = ''; } else { revw = `&review=${review}`; }
    if(!order) { ord = ''; } else { ord = `&order=${order}`; }

    return this.http.get(`${environment.base_url}/places/bytown?since=${desde}${town}${texto}${revw}${ord}`, this.cabeceras);
  }

  cargarAllPueblos(): Observable<object> {
    return this.http.get(`${environment.base_url}/towns/all` , this.cabeceras);
  }
  cargarPueblosPorVisitas(  ): Observable<object> {

    return this.http.get(`${environment.base_url}/towns/visits` , this.cabeceras);
  }


  eliminarPueblo (uid:string) {
    return this.http.delete(`${environment.base_url}/towns/${uid}`, this.cabeceras);
  }

  crearPueblo( data: Pueblo ): Observable<object> {
    return this.http.post(`${environment.base_url}/towns/`, data, this.cabeceras);
  }

  actualizarPueblo(uid: string, data: Pueblo): Observable<object> {
    return this.http.put(`${environment.base_url}/towns/${uid}`, data, this.cabeceras);
  }

  crearImagenUrl( imagen: string) {
    const token = localStorage.getItem('x-token') || sessionStorage.getItem('x-token') || '';
    //console.log(imagen);
    if (!imagen) {
      return `${environment.base_url}/upload/fototown/no-imagen?token=${token}`;
    }
    return `${environment.base_url}/upload/fototown/${imagen}?token=${token}`;
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

