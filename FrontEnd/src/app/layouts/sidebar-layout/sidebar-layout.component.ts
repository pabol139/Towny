import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar-layout',
  templateUrl: './sidebar-layout.component.html',
  styleUrls: ['./sidebar-layout.component.css']
})
export class SidebarLayoutComponent implements OnInit {
  lista: string[] = ['hola', 'ey', 'como estas', 'adasd'];
  constructor() { }

  ngOnInit(): void {
  }

}
