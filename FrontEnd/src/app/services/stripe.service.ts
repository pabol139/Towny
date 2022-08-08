import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment  } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(private http: HttpClient) {}

  charge(cantidad, tokenId){
    return this.http.post(`${environment.base_url}/stripe_checkout`,{
      stripeToken: tokenId,
      cantidad: cantidad
    }).toPromise();
  }
}
