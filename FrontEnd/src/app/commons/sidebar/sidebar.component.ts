import { Component, OnInit } from '@angular/core';
import {ActivationEnd, Router } from '@angular/router';
import { sidebarItem } from 'src/app/interfaces/sidebar.interface';
import { SidebarService } from 'src/app/services/sidebar.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from '../../../environments/environment';

import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';


let btn = document.querySelector("#btn");
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  menu: sidebarItem[] = [];
  public username = '';
  public imagenUrl = '';
  public rol = '';
  public email = '';
  public titulo: string = '';
  private subs$: Subscription;
  public nocheModo = false;

  constructor(
    private userservice: UserService,
    private router: Router,
    private sidebar: SidebarService,
  ) {
    this.subs$ = this.getData()
                      .subscribe( data => {
                        this.titulo = data.titulo;
                      });
  }

  ngOnInit(): void {

    setTimeout(() =>{
      if(this.titulo == "Pagos lugar"){
        this.titulo = "Recibos lug.";
      }else if(this.titulo == "Pagos suscripcion"){
        this.titulo = "Recibos sus.";
      }else if(this.titulo == "Perfil - Comerciante"){
        this.titulo = "Mi perfil";
      }else if(this.titulo == "Mi suscripción"){
        this.titulo = "Suscripción";
      }else if(this.titulo == "Valoraciones"){
        this.titulo = "Mis valoraciones";
      }else if(this.titulo == "Comercios"){
        this.titulo = "Mis comercios";
      }
      var element = document.getElementById(this.titulo);
      element.classList.add('selected-li');
     }, 1000);

     /*var checkExist = setInterval(() => {
      var element = document.getElementById(this.titulo);
      console.log(element);
      if (document.querySelector("#"+this.titulo)) {
        console.log('termina');
         clearInterval(checkExist);
      }
    }, 500);*/

    this.username = this.userservice.name;
    this.rol = this.userservice.rol;
    this.email = this.userservice.email;
    this.menu = this.sidebar.getMenu();
    if(this.rol=='ROL_ADMIN'){
      this.rol='Administrador';

    }
    else if(this.rol=='ROL_USER'){
      this.rol='Usuario';
    }
    else if(this.rol=='ROL_COMMERCE'){
      this.rol='Comerciante';
    }

    this.userservice.getUser(this.userservice.uid)
    .subscribe(res => {
      this.imagenUrl = this.userservice.imagenURL;
    });
  }

  cambiarSelectedLi(id){

    var ul = document.getElementById("listaullis");
    var items = ul.getElementsByTagName("li");
    for (var i = 0; i < items.length; ++i) {
      items[i].classList.remove('selected-li');
    }

    var element = document.getElementById(id.title);
    element.classList.add('selected-li');

    let sidebar = document.querySelector(".sidebar");
    if(sidebar.classList.contains("active") && window.innerWidth<725){
      this.btnClick();
    }

  }

  ngOnDestroy() {
    this.subs$.unsubscribe();
  }

  getData() {
    return this.router.events
      .pipe(
        filter( (event): event is ActivationEnd => event instanceof ActivationEnd ),
        filter( (event: ActivationEnd) => event.snapshot.firstChild === null),
        map( (event: ActivationEnd) => event.snapshot.data)
      );
  }

  btnClick(){
    let sidebar = document.querySelector(".sidebar");
    let home_content = document.querySelector(".home-content");
    let blackBackground = document.querySelector(".fondoNegro");
    if(sidebar!=null && home_content!=null){
      sidebar.classList.toggle("active");
      home_content.classList.toggle("active");
      blackBackground.classList.toggle("active");
    }
  }

  logout(){
    this.userservice.logout();
    /*window.location.href="./";*/
  }

  mandarPassword(){
    window.location.href = `/admin/updatepasswordadmin/${this.userservice.uid}`;
  }

  cambiarModo(){

    if(this.nocheModo){
      this.nocheModo = false;
      document.documentElement.setAttribute("data-theme", "light");
    }else{
      this.nocheModo = true;
      document.documentElement.setAttribute("data-theme", "dark");
    }

  }

}




