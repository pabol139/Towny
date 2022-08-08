import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EngineService} from 'src/app/services/engine.service';

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html',
  styleUrls: ['./engine.component.css']
})
export class EngineComponent implements OnInit {

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas: ElementRef<HTMLCanvasElement> | undefined;

  public constructor(private engServ: EngineService) {
  }

  public ngOnInit(): void {

    this.engServ.createScene(this.rendererCanvas);
    this.engServ.animate();
  }

  public loadPueblo(name){
    this.engServ.loadMesh(name);
  }

}

