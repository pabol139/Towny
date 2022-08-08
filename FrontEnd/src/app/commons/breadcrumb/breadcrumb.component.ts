import { Component, OnInit } from '@angular/core';
import {ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {

  public titulo: string = '';
  public breadcrums: any[] = [];
  private subs$: Subscription;

  constructor(private router: Router) {
    this.subs$ = this.getData()
                      .subscribe( data => {
                        this.titulo = data.titulo;
                        this.breadcrums = data.breadcrums;
                      });
   }

  ngOnInit(): void {
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

}
