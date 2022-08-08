import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { loginForm  } from '../interfaces/login-form.interface';
import { environment } from '../../environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { registerForm } from '../interfaces/register-form.interface';
import { passwordForm } from '../interfaces/password-form.interface';

//Comunicación con la API - Usuarios
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user: User = new User('', '');

  constructor( private http: HttpClient ) {  }

  updateUser ( uid: string, data: any) {
    return this.http.put(`${environment.base_url}/users/${uid}`, data, this.cabeceras);
  }

  payFactura(uid: string, data:Object){
    return this.http.post(`${environment.base_url}/users/bill/${uid}`,data, this.cabeceras);
  }

  upPhoto( uid: string, foto: File) {
    const url = `${environment.base_url}/upload/fotoperfil/${uid}`;
    const datos: FormData = new FormData();
    datos.append('file', foto, foto.name);
    return this.http.post(`${environment.base_url}/upload/fotoperfil/${uid}`, datos, this.cabeceras);
  }

  addPlaceToFavourites(uid:string, place:string){
    const token = localStorage.getItem('x-token') || sessionStorage.getItem('x-token')
    return this.http.put(`${environment.base_url}/users/updatefavouriteplaces/${uid}/${place}/${token}`, this.cabeceras);
  }

  removePlaceToFavourites(uid:string, place:string){
    //console.log(uid);
    //console.log(place);
    //console.log(this.cabeceras);
    //console.log(this.token);
    const token = sessionStorage.getItem('x-token') || localStorage.getItem('x-token')
    return this.http.put(`${environment.base_url}/users/deletefavouriteplaces/${uid}/${place}/${token}`, this.cabeceras);
  }

  getUser( uid: string) {
    if (!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/users/?id=${uid}` , this.cabeceras);
  }
  getUserByEmail( email: string) {
    if (!email) { email = '';}
    return this.http.get(`${environment.base_url}/login/userReco/?email=${email}` , this.cabeceras);
  }

  getUsers( since: number, texto?: string, rol?: string ): Observable<object> {
      if (!since) { since = 0;}
      if (!texto) {texto = '';}
      if(!rol) {rol =''};
      return this.http.get(`${environment.base_url}/users/?since=${since}&texto=${texto}&role=${rol}` , this.cabeceras);
  }

  getPlacesFavourites( since: number, uid: string, texto?: string, review?: number, province?: string, order?: string ): Observable<object> {
    let revw = ''; let prov = ''; let ord = '';let text = '';
    if (!since) { since = 0;}
    if(texto) { text = `&texto=${texto}`; }
    if (!review) { revw = ''; } else { revw = `&review=${review}`; }
    if (!province) { prov = ''; } else { prov = `&province=${province}`; }
    if(!order) { ord = ''; } else { ord = `&order=${order}`; }
    /*if(restaurant){
      rest=`&rest=${restaurant}`;
    }
    if(province){
      prov=`&province=${province}`;
    }*/

    return this.http.get(`${environment.base_url}/users/favourites?since=${since}&id=${uid}${text}${revw}${prov}${ord}` , this.cabeceras);
  }

  getAllUsers(){
    return this.http.get(`${environment.base_url}/users/` , this.cabeceras);
  }

  verifyLink(token:any, code: string, uid: string){
    return this.http.get(`${environment.base_url}/users/validate/verifyadmin/${token}?code=${code}&id=${uid}`);
  }

  verifyLinkRecuperacion(token:any, code: string, uid: string){
    return this.http.get(`${environment.base_url}/users/validate/verifylinkrecovery/${uid}?code=${code}&token=${token}`);
  }

  verifyAdmin(token:any, code: string, uid: string, data: any){
    return this.http.put(`${environment.base_url}/users/validate/verifyadmin/${token}?code=${code}&id=${uid}`, data);
  }

  logout(): void {
    this.cleanLocalStore();
    //cuando pase la presentacion se pasa a ./
    window.location.href = './';
    //window.location.href = '/login';
  }

  login( formData: loginForm) {
    //console.log(formData);
    return this.http.post(`${environment.base_url}/login`, formData).pipe(
      tap( (res : any) => {
        //console.log(res);
        if(formData.remember)localStorage.setItem('x-token', res['token']);
        else sessionStorage.setItem('x-token', res['token']);
        /*localStorage.setItem('name', res['name']);
        localStorage.setItem('rol', res['rol']);
        localStorage.setItem('picture', res['picture']);
        localStorage.setItem('uid', res['uid']);*/
        const {uid, rol} = res;
        this.user = new User(uid, rol);
      })
    );
  }

  loginGoogle( tokenGoogle: any ) {

    return this.http.post(`${environment.base_url}/login/google`, {token: tokenGoogle}).pipe(
      tap( (res : any) => {
        localStorage.setItem('x-token', res['token']);
        /*localStorage.setItem('name', res['name']);
        localStorage.setItem('rol', res['rol']);
        localStorage.setItem('picture', res['picture']);
        localStorage.setItem('uid', res['uid']);*/
        const {uid, rol} = res;
        this.user = new User(uid, rol);
      })
    );
  }

  deleteUser( uid: string) {
    if (!uid || uid === null) {uid = 'a'; }
    return this.http.delete(`${environment.base_url}/users/${uid}` , this.cabeceras);
  }

  verifyUser(code: string, uid: string){
    return this.http.put(`${environment.base_url}/users/validate/validar_normal?code=${code}&id=${uid}`, this.cabeceras);
  }
  //
  newUser ( formData: registerForm) {
    return this.http.post(`${environment.base_url}/users/`, formData, this.cabeceras);
  }

  changePasswordAdmin( uid: string, data) {
    return this.http.put(`${environment.base_url}/users/newpassword/${uid}`, data, this.cabeceras);
  }

  changePassword( uid: string, data: passwordForm) {
    return this.http.put(`${environment.base_url}/users/newpassword/${uid}`, data, this.cabeceras);
  }

  newCommerce ( formData: registerForm) {
    return this.http.post(`${environment.base_url}/users/singupcommerce`, formData, this.cabeceras);
  }

  getPWD ( formData: registerForm) {
    return this.http.post(`${environment.base_url}/users/getpwd`, formData);
  }

  newAdmin(data: User){
    return this.http.post(`${environment.base_url}/users/admin`, data, this.cabeceras);
  }

  validate(correcto: boolean, incorrecto: boolean): Observable<boolean> {

    if (this.token === '') {
      this.cleanLocalStore();
      return of(incorrecto);
    }

    return this.http.get(`${environment.base_url}/login/token`, this.cabeceras)
      .pipe(
        tap( (res: any) => {
          // extaemos los datos que nos ha devuelto y los guardamos en el usurio y en localstore o sessionstorage
          const { uid, rol, name, networks, email, registerDate, active, picture, commercePlace, favorites, reviews, travels, activation_code, CIF, token} = res;
          if(localStorage.getItem('x-token')){
            localStorage.setItem('x-token', token);
          }
          if(sessionStorage.getItem('x-token')){
            sessionStorage.setItem('x-token', token);
          }
          this.user = new User(uid, rol, name, networks, email, registerDate, active, picture, commercePlace, favorites, reviews, travels, activation_code, CIF);
        }),
        map ( res => {
          return correcto;
        }),
        catchError ( err => {
          console.warn(err);
          this.cleanLocalStore();
          return of(incorrecto);
        })
      );
  }

  validateNotLogged(correcto: boolean, incorrecto: boolean): Observable<boolean> {
    if(this.user.exists){
      return of(correcto);
    }
    if (this.token === '') {
      // Esta condicion esta puesta para
      if((
            (sessionStorage.getItem('tok') && (!sessionStorage.getItem('id') || !sessionStorage.getItem('code')))
         || (sessionStorage.getItem('id') && (!sessionStorage.getItem('tok') || !sessionStorage.getItem('code')))
         || (sessionStorage.getItem('code') && (!sessionStorage.getItem('id') || !sessionStorage.getItem('tok')))
         )
         || (!sessionStorage.getItem('tok') && !sessionStorage.getItem('id') && !sessionStorage.getItem('code'))
      ){
        this.cleanLocalStore();
      }

      return of(correcto);
    }

      return this.http.get(`${environment.base_url}/login/token`, this.cabeceras)
        .pipe(
          tap( (res: any) => {
            // extaemos los datos que nos ha devuelto y los guardamos en el usurio y en localstore o sesion storage
            const { uid, rol, name, networks, email, registerDate, active, picture, commercePlace, favorites, reviews, travels, activation_code, CIF, token} = res;
            if(localStorage.getItem('x-token')){
              localStorage.setItem('x-token', token);
            }
            if(sessionStorage.getItem('x-token')){
              sessionStorage.setItem('x-token', token);
            }
            this.user = new User(uid, rol, name, networks, email, registerDate, active, picture, commercePlace, favorites, reviews, travels, activation_code, CIF);
            this.user.exists = true;
          }),
          map ( res => {
            return correcto;
          }),
          catchError ( err => {
            console.warn(err);
            this.cleanLocalStore();
            return of(incorrecto);
          })
        );

  }

  validateTokenNotLogged(): Observable<boolean> {
    return this.validateNotLogged(true, false);
  }

  validateToken(): Observable<boolean> {
    return this.validate(true, false);
  }

  validateNoToken(): Observable<boolean> {
    return this.validate(false, true);
  }

  cleanLocalStore(): void{
    //localStorage.removeItem('x-token');
    localStorage.clear();
    sessionStorage.clear();
  }

  createDataCommer(name: string, email: string, cif: string): void {
    this.user.name = name;
    this.user.email = email;
    this.user.CIF = cif;
  }

  recoverPass ( uid: string, data: any) {
    return this.http.put(`${environment.base_url}/login/userRecoPass/${uid}`, data);
  }

  establecerimagen(nueva: string): void {
    this.user.picture = nueva;
  }

  createPictureUrl(picture: string){
    // Devolvemos la imagen en forma de peticilon a la API
    const token = localStorage.getItem('x-token') || sessionStorage.getItem('x-token') || '';
    if (!picture) {
        return `${environment.base_url}/upload/fotoperfil/no-imagen?token=${token}`;
    }
    return `${environment.base_url}/upload/fotoperfil/${picture}?token=${token}`;
}

  get cabeceras() {
    return {
      headers: {
        'x-token': this.token
      }};
  }

  get token(): string {
    return  localStorage.getItem('x-token') || sessionStorage.getItem('x-token') || '';
  }

 get uid(): string {
    return this.user.uid;
  }

  get rol(): string {
    return this.user.rol;
  }

  get registerDate(): Date {
    return this.user.registerDate;
  }

  get code(): string{
    return this.user.activation_code;
  }

  get name(): string{
    return this.user.name;
  }

  get email(): string{
    return this.user.email;
  }

  get comerce(): string{
    return this.comerce;
  }

  get cif(): string{
    return this.user.CIF;
  }

  get imagenURL(): string{
    return this.user.imagenUrl;
  }

  get picture(): string{
    return this.user.picture;
  }

  get reviews() {
      return this.user.reviews;
  }

}
