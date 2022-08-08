import { Injectable } from '@angular/core';
import { sidebarItem } from '../interfaces/sidebar.interface';
import { UserService } from './user.service';
import {View, Feature, Map, VectorTile } from 'ol';
import {Coordinate} from 'ol/coordinate';
import { ScaleLine, defaults as DefaultControls} from 'ol/control';
import proj4 from 'proj4';
import Projection from 'ol/proj/Projection';
import {register}  from 'ol/proj/proj4';
import {fromLonLat, get as GetProjection} from 'ol/proj'
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
import {Circle, Circle as CircleStyle, Fill, Icon, Stroke, Style, Text} from 'ol/style';
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
import LineString from 'ol/geom/LineString';
import { TravelService } from './travel.service';
import { async } from 'rxjs/internal/scheduler/async';



@Injectable({
  providedIn: 'root'
})
export class MapService {
  public map:Map;
  public locations=[];
  public ready:boolean;
  public x= 0;
  public placesSize=0;
  public VectorPueblos:any;
  public VectorViajes:any;

  public constructor(private travelservice:TravelService,
   private townService:PuebloService, ) {
     this.ready=true;


  }

  public saveVectorPueblos(){
    this.VectorPueblos=this.map.getLayers().getArray()[0];

  }



  public addPueblos(){


  }



  public zoomInMarker(coor){


    var view= this.map.getView();
    var split= coor.split(' ');
    var location= fromLonLat([parseFloat(split[0]),parseFloat(split[1]) ]);

    const duration = 2000;
  const zoom = 14.03;

  let parts = 2;
  let called = false;
  function callback(complete) {
    --parts;
    if (called) {
      return;
    }
    if (parts === 0 || !complete) {
      called = true;
     // done(complete);
    }
  }
  view.animate(
    {
      center: location,
      duration: duration,
    },
    callback
  );
  view.animate(
    {
      zoom: 8,
      duration: duration/2 ,
    },
    {
      zoom: zoom ,
      duration: duration/2 ,
    },
    callback
  );


  }

  public async  mostrarRuta(id){

     this.travelservice.cargarTravel(id).subscribe(res=>{
    var viaje= res['travels'];
    this.placesSize=viaje['places'].length;


      for (let index = 0; index < viaje['places'].length; index++) {
        const element = viaje['places'][index];


      this.townService.cargarPueblo(element.town).subscribe(res=>{
        this.x++;
        var town= res['towns'];

        var split= town['location'].split(' ');

      this.locations.push([parseFloat(split[0]),parseFloat(split[1])]);
        if(this.x==this.placesSize){
          this.x=0;
          this.mostrarLine();
        }
      });

    }




  });

  }

public async mostrarLine(){


  this.locations.forEach(element => {
    element[0]+=Math.random()*0.1;
    element[1]+=Math.random()*0.1;
  });

  var polyline = new LineString(this.locations);

   var route= polyline.transform('EPSG:4326', 'EPSG:3857');

  var routeCoords = route['flatCoordinates'];

  var routeLength = routeCoords.length;

  var routeFeature = new Feature({
  type: 'route',
  geometry: route
});
var geoMarker = new Feature({
  type: 'geoMarker',
  geometry: new Point(fromLonLat(this.locations[0]))
});
var startMarker = new Feature({
  type: 'icon',
  geometry: new Point(fromLonLat(this.locations[0]))
});


var styles = {
  'route': new Style({
    stroke: new Stroke({
      width: 6,
      color: [237, 212, 0, 0.8]
    })
  }),
  'icon': new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'https://openlayers.org/en/v3.20.1/examples/data/icon.png'
    })
  }),
  'geoMarker': new Style({
    image: new Circle({
      radius: 7,
      //snapToPixel: false,
      fill: new Fill({
        color: 'black'
      }),
      stroke: new Stroke({
        color: 'white',
        width: 2
      })
    })
  })
};

var vectorsource = new VectorSource({
  features: [routeFeature, geoMarker, startMarker]
});

for (let index = 0; index < this.locations.length; index++) {
  const element = this.locations[index];

 vectorsource.addFeature(new Feature({

  geometry: new Point(fromLonLat(element)),
  type:'icon'
}))

}

var animating = false;
var speed, now;
var speedInput = document.getElementById('speed');
var startButton = document.getElementById('start-animation');

var vectorLayer = new VectorLayer({
  source: vectorsource ,
  style: function(feature) {
    // hide geoMarker if animation is active
    if (animating && feature.get('type') === 'geoMarker') {
      return null;
    }
    return styles[feature.get('type')];
  }
});

if(this.map.getLayers().getArray().length<=2){
  vectorLayer.setZIndex(12);
  this.map.addLayer(vectorLayer);
}




  }



public ocultarRuta(){
 for (let index = 0; index <= this.map.getLayers().getArray().length; index++) {
   const element = this.map.getLayers().getArray()[index];
   if(index!=0 && index!=1){
      this.map.removeLayer(element);
   }


 }
  //this.locations=;
  for (let i = this.locations.length; i > 0; i--) {
    this.locations.pop();
  }


  }

  public getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }


}
