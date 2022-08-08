import { Component, Injectable, OnInit } from '@angular/core';
import {NgZone, AfterViewInit, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import {View, Feature, Map, VectorTile } from 'ol';
import {Coordinate} from 'ol/coordinate';
import { ScaleLine, defaults as DefaultControls, Control, Zoom} from 'ol/control';
import proj4 from 'proj4';
import Projection from 'ol/proj/Projection';
import {register}  from 'ol/proj/proj4';
import {fromLonLat, get as GetProjection, toLonLat} from 'ol/proj'
import {Extent} from 'ol/extent';

import Point from 'ol/geom/Point';

import {
  Pointer as PointerInteraction,
  defaults as defaultInteractions,
} from 'ol/interaction';

import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import {Circle as CircleStyle, Fill, Icon, Stroke, Style, Text} from 'ol/style';
import OSM from 'ol/source/OSM';
import { PuebloService } from 'src/app/services/pueblo.service';
import { Pueblo } from 'src/app/models/pueblo.model';
import Swal from 'sweetalert2';
import MVT from 'ol/format/MVT';
import TileGrid from 'ol/tilegrid/TileGrid';
import {get as getProjection} from 'ol/proj';
import { environment } from 'src/environments/environment';

import { Select } from 'ol/interaction'
import {pointerMove} from 'ol/events/condition';
import {boundingExtent} from 'ol/extent';
import olms from 'ol-mapbox-style';
import {applyStyle} from 'ol-mapbox-style';
import { MapService } from 'src/app/services/map.service';
import { CardinfoComponent } from 'src/app/commons/cardinfo/cardinfo.component';


import {
  Action,
  ButtonEvent,
  ButtonType,
  Image,
  ImageModalEvent,
  ModalGalleryService,
  ModalGalleryRef,
  ModalGalleryConfig,
  ModalLibConfig
} from '@ks89/angular-modal-gallery';

import { DomSanitizer } from '@angular/platform-browser';

import { EventService } from 'src/app/services/event.service';
import { PlaceService } from 'src/app/services/place.service';

import { UiComponent } from '../ui/ui.component';
import { Console } from 'console';
import { EngineService } from '../../services/engine.service';
import { HomeComponent } from 'src/app/home/home.component';
import { CardinfoService } from 'src/app/services/cardinfo.service';

class Drag extends PointerInteraction {
  cursor_: any;
  previousCursor_: any;
  constructor() {
    //Pointer mouse event
    const handleMoveEvent = (evt) => {
      if (this.cursor_) {
        const map = evt.map;
        const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
          return feature;
        });
        const element = evt.map.getTargetElement();
        if (feature!= undefined && feature.geometryName_) {
          if (element.style.cursor != this.cursor_) {
            this.previousCursor_ = element.style.cursor;
            element.style.cursor = this.cursor_;
          }
        } else if (this.previousCursor_ !== undefined) {
          element.style.cursor = this.previousCursor_;
          this.previousCursor_ = undefined;
        }
      }
    }

    super({
      handleMoveEvent: handleMoveEvent,
    });

    this.cursor_ = 'pointer';
    this.previousCursor_ = undefined;

  }
}

@Injectable({providedIn: 'root'})

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

export class MapComponent implements AfterViewInit {

  santomera;
  vectorSource;
  vectorLayerr;
  rasterLayer;
  prueba;
  public listaRegistros: Pueblo[] = [];

  resolutions = [];

  nombre;
  descripcion;
  poblacion;
  provincia;
  visitas;
  fotos = ["http://towny.ovh/api/upload/fototown/4b1e6da4-7d61-4a4a-aa71-50af21b6f08a.png"];
  public eventos = [];
  public lugares = [];

  public cerdaId = document.getElementById("mapSalirZoom");
  public observer;

  idActualPueblo = "";

  @Input() center: Coordinate;
  @Input() zoom: number;
  view: View;
  projection: Projection;
  //extent: Extent = [-20026376.39, -20048966.10,
//20026376.39, 20048966.10];
  Map: Map;
  @Output() mapReady = new EventEmitter<Map>();

  constructor(private zone: NgZone, private cd: ChangeDetectorRef, private puebloservice:PuebloService, private mapService:MapService, private domSanitizer: DomSanitizer,
    private modalGalleryService: ModalGalleryService, private eventService:EventService, private placeService:PlaceService, private uiTypescript:UiComponent, private Cardinfo:CardinfoComponent, private engine: EngineService, private homeComponent: HomeComponent, private engineservice:EngineService,private cardinfoService:CardinfoService) { }

  ngAfterViewInit():void {
    if (! this.Map) {
      for (let i = 0; i <= 8; ++i) {
        this.resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
      }
      this.zone.runOutsideAngular(() => this.initMap())
    }
    setTimeout(()=>this.mapReady.emit(this.Map));

    this.observer = new MutationObserver(mutations => {
      //this.mostrarLugarCard(document.getElementById("accionadorEnviarReview").getAttribute('value'));
      this.salirZoomPueblo();

    });
    var config = { attributes: true, childList: true, characterData: true };
    this.cerdaId = document.getElementById("mapSalirZoom");
    this.observer.observe(this.cerdaId, config);
  }

  salirZoomPueblo(){

     this.Map.getView().setZoom(13);
     document.getElementById('map').classList.add('active');
     document.getElementById('engine-wrapper').classList.remove('active');
  }

  openLugarCard(uid){
    this.uiTypescript.openLugarVista(uid);
  }

  cerrarCard(){

    let doc = document.getElementById('tarLug');
    doc.classList.remove('active');
    let docClose = document.getElementById('cerrarTarLug');
    docClose.classList.remove('active');

  }

  mostrarCard(uid){

    let doc = document.getElementById('tarLug');
    let docClose = document.getElementById('cerrarTarLug');
    doc.classList.remove('active');
    docClose.classList.remove('active');
    //document.getElementById('listaEventos').innerHTML = "";

    this.puebloservice.cargarPueblo(uid).subscribe((res:any) => {

      for(let i=0;i<this.fotos.length;i++){
        this.fotos.pop();
      }
      for(let ii=0;ii<this.eventos.length;ii++){
        this.eventos.pop();
      }
      for(let iii=0;iii<this.lugares.length;iii++){
        this.lugares.pop();

      }

      this.nombre = res['towns'].name;
      this.descripcion = res['towns'].description;
      this.poblacion = res['towns'].population;
      this.provincia = res['towns'].province.name;
      this.visitas = res['towns'].visits;


      for(let i=0;i<res['towns'].pictures.length-1;i++){
        this.fotos.push(environment.picturesDir+'/fototown/'+res['towns'].pictures[i+1]);
      }

      document.getElementById("eventosMas").innerText = '';
      document.getElementById("lugaresMas").innerText = '';

      let html = "";

      //document.getElementById("tarLugFotsEve").innerText = (res['towns'].events.length).toString();
      document.getElementById("eventosNum").innerText = 'Eventos: '+(res['towns'].events.length).toString();


      if(res['towns'].events.length > 3){
        document.getElementById("eventosMas").innerText = 'Ver más';
      }

      //document.getElementById("tarLugFotsLuga").innerText = (res['towns'].places.length).toString();
      /*document.getElementById("lugaresNum").innerText = 'Lugares: '+(res['towns'].places.length).toString();

      if(res['towns'].places.length > 3){
        document.getElementById("lugaresMas").innerText = 'Ver más';
      }

      if(res['towns'].places.length > 0){
        document.getElementById("containerlugares").style.display = 'block';
      }else{
        document.getElementById("containerlugares").style.display = 'none';
      }*/
      document.getElementById("containerlugares").style.display = 'none';

      if(res['towns'].events.length > 0){
        document.getElementById("containereventos").style.display = 'block';
      }else{
        document.getElementById("containereventos").style.display = 'none';
      }

      for(let ii=0;ii<res['towns'].events.length;ii++){
        if(ii<=2){
          this.eventService.getEvent(res['towns'].events[ii])
          .subscribe( (ress:any) => {
            this.eventos.push(ress['events']);


            html += `<div class="itemLista">
            <img src="`+environment.picturesDir+'/fotoevento/'+ress['events'].pictures[0]+`">
            <p>`+ress['events'].name+`</p>
        </div>`;

          if(ii <= 2){
            document.getElementById('listaEventos').innerHTML = html;
          }

          }, (err) => {

          });
        }
      }

      let html2 = "";
      //Solo lugares activos
      let contador = 0;
      for(let iii=0;iii<res['towns'].places.length;iii++){
        //if(contador<=3){

          this.placeService.getPlace(res['towns'].places[iii])
          .subscribe( (resss:any) => {

            if(resss['places'].status == "Activo"){
              document.getElementById("containerlugares").style.display = 'block';
              contador++;

              this.lugares.push(resss['places'].uid);


              html2 += `<div class="itemLista" id="itemListaLugares" (click)="loadLugar();">
              <img src="`+environment.picturesDir+'/fotoplace/'+resss['places'].pictures[0]+`">
              <p>`+resss['places'].name+`</p>
              <p id="listaValoracionLugar">`+resss['places'].media_reviews+`<i class="fa fa-star"></i></p>
          </div>`;
            }


            if(contador <= 3){
              document.getElementById('listaLugares').innerHTML = html2;
              let gg = document.querySelectorAll('#itemListaLugares');


              for(let iiii=0;iiii<gg.length;iiii++){

                gg[iiii].addEventListener('click', (event) =>{

                  let uidd = "";
                  if((<MouseEvent>event).clientX>10 && (<MouseEvent>event).clientX<125){
                    uidd = this.lugares[0];
                  }else if((<MouseEvent>event).clientX>125 && (<MouseEvent>event).clientX<235){
                    uidd = this.lugares[1];
                  }else if((<MouseEvent>event).clientX>235 && (<MouseEvent>event).clientX<345){
                    uidd = this.lugares[2];
                  }
                  this.openLugarCard(uidd);
                });
              }
            }else if(contador>3){
              document.getElementById("lugaresMas").innerText = 'Ver más';
            }

            document.getElementById("lugaresNum").innerText = 'Lugares: '+contador;

          }, (err) => {

          });
        //}
      }



      //(<HTMLImageElement>document.getElementById("tarLugImg")).src = this.fotos[0];
      document.getElementById("tarLugImg").style.backgroundImage = "url("+environment.picturesDir+'/fototown/'+res['towns'].pictures[1]+")";
      document.getElementById("tarLugProv").innerText = this.provincia;
      document.getElementById("tarLugNom").innerText = this.nombre;
      document.getElementById("tarLugFotsNum").innerText = this.fotos.length+"+";
      document.getElementById("tarLugFotsPob").innerText = this.poblacion;
      document.getElementById("tarLugFotsVisit").innerText = this.visitas;
      document.getElementById("tarLugFotsDescrip").innerText = this.descripcion;
      //var imagen = document.getElementById("tarLugFots");
      //imagen.style.backgroundImage = "url('tuUrl')";
      document.getElementById("tarLugFots").style.backgroundImage = "url("+this.fotos[0]+")";


      doc.classList.add('active');
      docClose.classList.add('active');

    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo',});
      //console.warn('error:', err);
    });

  }

  llamarCardPueblo(uid){

    this.homeComponent.cerrarCardViaj();
    this.Cardinfo.cerrarTodasCard();
    this.Cardinfo.mostrarPuebloCard(uid);
  }

  private initMap(): void{

    this.puebloservice.cargarAllPueblos()
      .subscribe((res:any) => {
        this.vectorSource= new VectorSource({
          //features:[this.santomera]
        });
        this.listaRegistros = res['towns'];

        for (let index = 0; index < this.listaRegistros.length; index++) {
          const element = this.listaRegistros[index];
          var split=element.location.split(' ')


          var pueblo;
          pueblo= new Feature({

            geometry: new Point(fromLonLat([parseFloat(split[0]),parseFloat(split[1]) ])),
            id: this.listaRegistros[index].uid
          });

          if(element.pictures.length>0){
            pueblo.setStyle(new Style({
              zIndex:500,
              image: new Icon(({
                color: [255, 255, 255],
                crossOrigin: 'anonymous',
                src:  environment.picturesDir+'/fototown/'+element.pictures[0],
                size: [50, 50]
              })),
              text:new Text(({
                font:'sans 12px serif',
                text:element.name,
                overflow:true,
                fill: new Fill({
                  color:'white'
                }),
                stroke:new Stroke({
                  color:'black'
                }),
                scale: 1.5,
                offsetY: -25
              }))
            }));
          }
          else{
            pueblo.setStyle(new Style({

              image: new Icon(({
                color: [255, 255, 255],
                crossOrigin: 'anonymous',
                src:'assets/images/markers/no-imagen-icon.png',
                imgSize: [50, 50]
              })),
              text:new Text(({
                font:'sans 12px serif',
                text:element.name,
                overflow:true,
                fill: new Fill({
                  color:'white'
                }),
                stroke:new Stroke({
                  color:'black'
                }),
                scale: 1.5,
                offsetY: -25
              }))
            }));
          }


          this.vectorSource.addFeature(pueblo);

        }

        let clusterSource = new Cluster({
          distance: 50,
          minDistance: 25,
          source: this.vectorSource
        });


    var lista: any[]= []
    lista=this.vectorSource.getFeatures();


    const styleCache = {};
    const vsc = this.vectorSource;
    /*this.vectorLayer = new VectorLayer({
      source: vsc,
    });*/

    this.vectorLayerr = new VectorLayer({
      source: clusterSource,
      style: function (feature: any) {

        const size = feature.get('features').length;
        let style = styleCache[size];

        if(size==1){
          lista.forEach(element => {
            if(feature.values_.geometry.flatCoordinates[0] == element.values_.geometry.flatCoordinates[0] && feature.values_.geometry.flatCoordinates[1] == element.values_.geometry.flatCoordinates[1])
              style = element.style_;
          });

        }else{

        if (!style) {
          style = new Style({
            image: new Icon(({
              color: [255, 255, 255],
              crossOrigin: 'anonymous',
              src:'assets/images/markers/more-towns-2.png',
              imgSize: [75, 75]
            })),

          });
          styleCache[size] = style;
        }
        }
        return style;
      },
    });

    this.rasterLayer= new TileLayer({
      source: new OSM({
        attributions:'© Halfy.',
      })
    });

    var styleJson:any = 'https://api.maptiler.com/maps/db72965d-5375-4542-862a-647641f9e55c/style.json?key=0Pc760O3RtQBmzws4vvc';

    proj4.defs("EPSG:3857","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
    register(proj4)
    this.projection = GetProjection('EPSG:3857');
   // this.projection.setExtent(this.extent);
    this.view = new View({
      center: this.center,
      zoom: this.zoom,
      projection: this.projection,
      maxZoom: 100,

    extent:  [-2526376.39, 2500000.10,
      956376.39, 5488966.10]

    });



    this.Map = new Map({
      interactions: defaultInteractions().extend([new Drag()]),
      /*layers: [],*/
      layers: [],
      target: 'map',
      view: this.view,
      controls: [],

    });

    /* CLICK ZOOM A UN GRUPO */
    this.Map.on('click', (e) => {
      this.vectorLayerr.getFeatures(e.pixel).then((clickedFeatures) => {
        if (clickedFeatures.length) {
          // Get clustered Coordinates
          const features = clickedFeatures[0].get('features');
          if (features.length > 1) {
            const extent = boundingExtent(
              features.map((r) => r.getGeometry().getCoordinates())
            );
            this.Map.getView().fit(extent, {duration: 1000, padding: [50, 50, 50, 50]});
          }else if(features.length == 1){

            this.idActualPueblo = features[0].values_.id;
            //this.mostrarCard(features[0].values_.id);
            this.llamarCardPueblo(features[0].values_.id);
          }
        }
      });
    });

    this.Map.on('moveend', (e) => {
    var newZoom = this.Map.getView().getZoom();
    var centerPos=toLonLat(this.Map.getView().getCenterInternal());
    var puebloSelected:any;
    var distance= 50000000000000000;

    for (let index = 0; index < this.listaRegistros.length; index++) {
      const element = this.listaRegistros[index];
      var split= element.location.split(' ');
      var ubiTown= ([parseFloat(split[0]),parseFloat(split[1])])

      var dist= Math.sqrt(Math.pow(ubiTown[0]-centerPos[0],2)+Math.pow(ubiTown[1]-centerPos[1],2))
      if(dist<distance){
        distance=dist;
        puebloSelected=element;
      }

    }

if(newZoom>14 && this.Cardinfo.entrando==true){
  var split2= puebloSelected.surface.split(' ');


   document.getElementById('map').classList.remove('active');
   document.getElementById('engine-wrapper').classList.add('active');
   this.engine.resizeCanvasToDisplaySize(document.getElementById('renderCanvas'));
}
});

    this.vectorLayerr.setZIndex(10);
    this.Map.addLayer(this.vectorLayerr);

    olms(this.Map,styleJson);
    this.Map.addControl(new Zoom({
      className:'custom-zoom'
    }));
    this.mapService.map = this.Map;
    this.mapService.saveVectorPueblos();


    },(err)=> {
          Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo cargar la base de datos de pueblos', });

          this.rasterLayer= new TileLayer({
            source: new OSM({
              attributions:'© Halfy.',

            })

          });



          proj4.defs("EPSG:3857","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
          register(proj4)
          this.projection = GetProjection('EPSG:3857');

          this.view = new View({
            center: this.center,
            zoom: this.zoom,
            projection: this.projection,
            maxZoom: 100,
            extent:  [-2526376.39, 2500000.10,
            956376.39, 5488966.10]
          });

          this.Map = new Map({
            layers: [this.rasterLayer],
            target: 'map',
            view: this.view,
            controls: [],
          });

        });
        this.mapService.map= this.Map;
    //38.0611, -1.0492

  }

  loadPictures(){

    this.puebloservice.cargarPueblo(this.idActualPueblo).subscribe((res:any) =>{

      if(res.ok){
        var town = res['towns'];
        var imagenesList= town['pictures'];
        var images:Image[]=[];

        for (let index = 0; index < imagenesList.length-1; index++) {
          const element = imagenesList[index+1];
          var namefilenew= this.domSanitizer.bypassSecurityTrustResourceUrl( environment.picturesDir+'/fototown/'+element);
        images.push(new Image(index,{img:namefilenew}));

        }




        const dialogRef: ModalGalleryRef = this.modalGalleryService.open({
          id: 22,
          images: images,
          currentImage: images[0],
          libConfig: {
            currentImageConfig: {
              downloadable: true,
              visible: true,
              size: {
                width: '150px',
                height: 'auto'
              }
            }


        }
        } as ModalGalleryConfig) as ModalGalleryRef;


      }
    }, (err) => {

      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      if(msgerror !== 'No hay imágenes en el array')
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });

  }



}



