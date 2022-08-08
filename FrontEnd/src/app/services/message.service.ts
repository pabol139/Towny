import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment  } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private _http: HttpClient) {
  }

  sendMessageRecu(body:any){
    return this._http.post(`${environment.base_url}/recu` , body);
  }
  sendMessageSoli(body:any){
    return this._http.post(`${environment.base_url}/requestReject` , body);
  }

  /*messageConfirmationRegister(body:any, token:any){
    console.log(token);
    return this._http.post(`${environment.base_url}/register`, body, token);
  }*/
}
