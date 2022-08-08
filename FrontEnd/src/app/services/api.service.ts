import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment  } from '../../environments/environment';
import { Observable } from 'rxjs';

import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
private key='eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbGVqYW5kcm9hbGNhcmF6OTY4QGdtYWlsLmNvbSIsImp0aSI6IjMzM2VhZmJiLTc4MTctNDJmZS05Y2JiLWI2OGZhOTUxZjQ5ZSIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNjUyNzAxNTE0LCJ1c2VySWQiOiIzMzNlYWZiYi03ODE3LTQyZmUtOWNiYi1iNjhmYTk1MWY0OWUiLCJyb2xlIjoiIn0.gA4bTcfUXXdS5HGVPkIztr-L9F1am1-gJjm3QsIQGbU';
  constructor(private http: HttpClient) { }

  getINEdata( uid: string): Observable<object> {
    if (!uid) { uid = '';}
    return this.http.get(`https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/${uid}?nult=1` );
  }
  getOcupacionHostelera( cod: string ): Observable<object> {
    //cod 2066 para las series y 39364 para el mio
    return this.http.get(`https://servicios.ine.es/wstempus/js/ES/SERIES_TABLA/${cod}?page=1` );
  }
  getTotalViviendas(cod: string): Observable<object> {
    return this.http.get(`https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/${cod}?nult=1`);
  }

  getTiempo(cod: string): Observable<object> {
    return this.http.get(`https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${cod}?api_key=${this.key}`);
  }

  getDataTiempo(peticion: string): Observable<object> {
    return this.http.get(peticion);
  }


}

