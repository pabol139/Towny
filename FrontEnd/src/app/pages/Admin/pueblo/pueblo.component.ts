import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PuebloService } from 'src/app/services/pueblo.service';
import { UploadsService } from 'src/app/services/uploads.service';
import Swal from 'sweetalert2';
import { Provincia } from '../../../models/provincia.model';
import { ProvinciaService } from '../../../services/provincia.service';
import * as geocoder from 'ol-geocoder';

import {View, Feature, Map, VectorTile } from 'ol';
import {transform}  from 'ol/proj';
import {Tile as TileLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import Point from 'ol/geom/Point';
import { Vector } from 'ol/layer';
import { Icon, Style } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
@Component({
  selector: 'app-pueblo',
  templateUrl: './pueblo.component.html',
  styleUrls: ['./pueblo.component.css']
})
export class PuebloComponent implements OnInit {
  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    name: ['', Validators.required ],
    location: ['',Validators.required],
    surface: ['',Validators.required],
    description: [''],
    population: ['',Validators.required],
    province: ['', Validators.required]
  });

  public datosFormNew = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    name: ['', Validators.required ],
    location: ['',Validators.required],
    surface: ['',Validators.required],
    description: [''],
    population: ['',Validators.required],
    pictures: ['', Validators.required],
    province: ['', Validators.required]
  });

  public filterProvince = new FormControl();
  public listaRegistros: Provincia[] = [];
  public filteredOptions: Observable<Provincia[]>;
  public numFoto = 1;
  public totalFotos: number = 0;
  public submited = false;
  public uid: string = 'nuevo';
  public tipo: string = 'fototown';
  public namefile = '';
  public nameFileForm = 'Seleccione ficheros';
  public waiting: boolean = false;
  public waiting_picture: boolean = false;
  public iconoAtras = false;
  public iconoAlante = true;
  public uploadedFiles: Array <File> =[];
  public cargar_imagen = false;
  public wait_form = false;
  public select_province = false;

  public coordss = "Ningunas";
  public coordssOrig = null;
  public vectorSource = new VectorSource({});


  Map: Map;

  constructor(private fb:FormBuilder,
              private puebloService:PuebloService,
              private route: ActivatedRoute,
              private router: Router,
              private provinciaService:ProvinciaService,
              private uploadservice: UploadsService) { }

  ngOnInit() {
    this.uid = this.route.snapshot.params['uid'];
    this.datosForm.get('uid')?.setValue(this.uid);
    if(this.uid !== 'nuevo') { this.wait_form = true; }
    this.cargarProvincias();
    this.cargarDatos();
  }

    cargarProvincias(){
    this.provinciaService.cargarAllProvincias()
      .subscribe((res:any) => {
        if (res['provinces'].length > 0) {
          this.listaRegistros = res['provinces'];
          if(this.uid === 'nuevo'){
            this.filteredOptions = this.filterProvince.valueChanges.pipe(
              startWith(''),
              map(value => this.filtro()),
            );
          }
          else{
            this.filteredOptions = this.filterProvince.valueChanges.pipe(
              startWith(''),
              map(value => this.filtroEdit()),
            );
          }
          //this.cargarDatos();
          //this.cargarProvincias();
        }
      }, (err)=> {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'No se pudo completar la acción, vuelva a intentarlo', });
      });
  }

  private filtro(): Provincia[] {
    //const filterValue = value.province.toLowerCase();
    return this.listaRegistros.filter(option => option.name.toLowerCase().includes(this.datosFormNew.value.province.toLowerCase()));
  }

  private filtroEdit(): Provincia[] {
    //const filterValue = value.province.toLowerCase();
    return this.listaRegistros.filter(option => option.name.toLowerCase().includes(this.datosForm.value.province.toLowerCase()));
  }

  cargarDatos() {
    this.submited = false;
    if (this.uid !== 'nuevo') {
      this.puebloService.cargarPueblo(this.uid)
        .subscribe( (res:any) => {
          if (!res['towns']) {
            this.router.navigateByUrl('/admin/towns');
            return;
          };
          this.datosForm.get('name')?.setValue(res['towns'].name);
          this.datosForm.get('description')?.setValue(res['towns'].description);
          this.datosForm.get('surface')?.setValue(res['towns'].surface);
          this.datosForm.get('location')?.setValue(res['towns'].location);
          this.datosForm.get('population')?.setValue(res['towns'].population);
          for(let x = 0; x < this.listaRegistros.length; x++){
            if(this.listaRegistros[x].uid === res['towns'].province._id){
              this.datosForm.get('province')?.setValue(this.listaRegistros[x].name);
              break;
            }
          }
          if(res['towns'].pictures.length > 0)
              this.getPhoto();

          if(this.iconoAlante == true && this.totalFotos === this.numFoto) { this.iconoAlante = false; }

          else if(this.totalFotos > 1 && this.totalFotos !== this.numFoto) { this.iconoAlante = true; }

          this.wait_form = false;
          this.datosForm.markAsPristine();
          this.submited = true;
        }, (err) => {
          let error_midle = '';
          if(err.error.err){
            error_midle += '<p> Los errores son los siguientes: ';
            if(err.error.err.id){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.id.msg}`;
            }
            error_midle += '</p>';
          }
          if(error_midle === ''){
            error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
          }
          this.router.navigateByUrl('/admin/towns');
          Swal.fire({icon: 'error', title: 'Oops...', html: error_midle,});
          return;
        });
    } else {
      this.datosForm.get('name')?.setValue('');
      this.datosForm.markAsPristine();
    }

  }

  uploadForNewTown(idTown: string, nameTown: string) {
    this.uid = this.route.snapshot.params['uid'];
    let formData = new FormData();
    for (var i = 0; i < this.uploadedFiles.length; i++) {
      formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
    }
    this.uploadservice.uploadPhotos(formData, this.tipo, idTown).subscribe((res)=> {
      this.uploadedFiles = [];
      Swal.fire({
        title: 'Pueblo creado', text: `Has creado el pueblo ${nameTown} con éxito`, icon: 'success',
        allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
      });
      this.datosFormNew.markAsPristine();
      this.waiting = false;
    }, (err) => {
      this.puebloService.eliminarPueblo(idTown).subscribe();
      this.waiting = false;
      const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
      Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
    });

  }

  newTown(){
    this.submited = true;
    if(this.select_province) { return; }
    if (this.datosFormNew.invalid) { return; }
    this.waiting = true;
    // Si estamos creando uno nuevo
    for(let i = 0; i < this.listaRegistros.length; i++){
      if(this.listaRegistros[i].name === this.datosFormNew.value.province){
        this.datosFormNew.value.province = this.listaRegistros[i].uid;
        break;
      }
    }

    this.puebloService.crearPueblo( this.datosFormNew.value )
      .subscribe( (res:any) => {
        if(this.uploadedFiles != undefined){
          if(this.uploadedFiles.length > 0){
            this.uploadForNewTown(res['town'].uid, res['town'].name);
          }
          else{
            Swal.fire({
              title: 'Pueblo Creado', text: `Has creado el pueblo ${res['town'].name} con éxito`, icon: 'success',
              allowOutsideClick: false, confirmButtonColor: '#3085d6', confirmButtonText: 'Aceptar'
            });
            this.datosFormNew.markAsPristine();
            this.waiting = false;
          }
        }

      }, (err) => {
        this.waiting = false;
        let error_midle = '';
          if(err.error.err){
            error_midle += '<p> Los errores son los siguientes: ';
            if(err.error.err.population){
              error_midle += '<br><br>';
              error_midle += `${err.error.err.population.msg}`;
            }
            error_midle += '</p>';
          }
          if(error_midle === ''){
            error_midle = 'No se pudo completar la acción, vuelva a intentarlo';
          }
        const msgerror = err.error.msg || error_midle;
        Swal.fire({icon: 'error', title: 'Oops...', html: msgerror,});
      });
  }

  enviar() {
    this.submited = true;
    if (this.select_province) { return; }
    if (this.datosForm.invalid) { return; }
    this.waiting = true;

    for(let i = 0; i < this.listaRegistros.length; i++){
      if(this.listaRegistros[i].name === this.datosForm.value.province){
        this.datosForm.value.province = this.listaRegistros[i].uid;
        break;
      }
    }

      // ACtualizamos
    this.puebloService.actualizarPueblo( this.datosForm.get('uid')?.value, this.datosForm.value)
        .subscribe( res => {
        this.datosForm.markAsPristine();
        this.waiting = false;
        Swal.fire({icon: 'success', title: 'Pueblo Actualizado', text:('El pueblo '+ this.datosForm.get('name')?.value+' se ha actualizado'),});
      }, (err) => {
        this.waiting = false;
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      });

  }

  nuevo() {
    this.uid = 'nuevo';
    this.datosFormNew.reset();
    this.datosFormNew.get('uid')?.setValue('nuevo');
    this.submited = false;
    this.datosFormNew.markAsPristine();
  }

  cancelar() {
    if (this.uid === 'nuevo') {
      this.router.navigateByUrl('/admin/towns');
    } else {
      this.cargarDatos();
    }
  }

  campoNoValido( campo: string) {
    return this.datosForm.get(campo)?.invalid && this.submited;
  }

  campoNoValidoNew( campo: string) {
    return this.datosFormNew.get(campo)?.invalid && this.submited;
  }

  selectProvince(){

    if(this.datosFormNew.get('province')?.value.length > 0 || this.datosForm.get('province')?.value.length > 0){
      this.select_province =true;
    }
  }

  selectProvinceTrue(){
    let value_province = this.datosFormNew.get('province')?.value || this.datosForm.get('province')?.value || '';
    for(let i = 0; i < this.listaRegistros.length; i++){
      if(this.listaRegistros[i].name == value_province){
        this.select_province = false;
        //document.getElementById('province').classList.remove('is-invalid2');
      }
    }
  }

  selectProvinceTrueKey(event){
    if(event.keyCode == 13 || event.code == 'Enter'){
      this.selectProvinceTrue();
    }
  }

  esnuevo(): boolean {
    if (this.datosFormNew.get('uid')?.value === 'nuevo') { return true; }
    return false;
  }

  getPhoto(){
      this.cargar_imagen = true;
      this.uploadservice.getPhotos(this.tipo, this.uid, this.numFoto).subscribe((res:any) =>{
        if(res.ok){
          this.namefile = res['nombrefoto'];
          this.totalFotos = res['long'];
          if(this.totalFotos == 1){
            this.iconoAlante = false;
          }
          this.cargar_imagen = false;
          this.namefile = this.puebloService.crearImagenUrl(this.namefile);
        }
      }, (err) => {
        this.cargar_imagen = false;
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        if(msgerror !== 'No hay imágenes en el array')
          Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      });

  }


  cambiarFotosAtras(){
    if(this.numFoto > 1){
      this.numFoto--;
      this.getPhoto();
    }
    this.iconoAlante = true;

    if(this.numFoto == 1){
      this.iconoAtras = false;
    }
    else{
      this.iconoAtras = true;
    }

  }

  cambiarFotosAlante(){
    if(this.numFoto < this.totalFotos){
      this.numFoto++;
      this.getPhoto();
    }
    if(this.numFoto == this.totalFotos){
      this.iconoAlante = false;
    }
    if(this.numFoto == 1){
      this.iconoAtras = false;
    }
    else{
      this.iconoAtras = true;
    }
  }

  fileChange(element) {
    this.uploadedFiles = element.target.files;
    if(this.uploadedFiles.length > 1){
      this.nameFileForm = this.uploadedFiles.length + ' archivos seleccionados';
    }
    else if (this.uploadedFiles.length == 1){
      this.nameFileForm = this.uploadedFiles[0].name;
    }
    else{
      this.nameFileForm = 'Seleccione los ficheros'
    }
  }

  upload() {
      this.waiting_picture = true;
      this.uid = this.route.snapshot.params['uid'];
      let formData = new FormData();
      if(this.uploadedFiles != undefined){
        if(this.uploadedFiles.length === 0){ this.waiting_picture = false; return; }
        for (var i = 0; i < this.uploadedFiles.length; i++) {
          formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
        }
        this.uploadservice.uploadPhotos(formData, this.tipo, this.uid).subscribe((res)=> {
          this.waiting_picture = false;
          this.totalFotos += this.uploadedFiles.length;
          this.uploadedFiles = [];
          this.nameFileForm = 'Seleccione ficheros';
          if(this.numFoto == 0) { this.numFoto = 1; }
          this.cargarDatos();
        }, (err)=> {
          this.nameFileForm = 'Seleccione ficheros';
          this.uploadedFiles = [];
          this.waiting_picture = false;
        });
      }
      else{
        return;
      }
    }

    confirmDeletePhoto(){
      Swal.fire({
        title: 'Eliminar imagen',
        text: `¿Estás seguro de que quieres eliminar esta imagen?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        allowOutsideClick: false,
        confirmButtonText: 'Si, borrar'
      }).then((result) => {
            if (result.value) {
              this.deletePhoto();
            }
        });
    }

    deletePhoto(){
      this.cargar_imagen = true;
      this.uploadservice.deletePhoto(this.tipo, this.uid, this.numFoto)
      .subscribe( res =>{
        if(this.numFoto === this.totalFotos){
          this.numFoto -= 1;
          this.iconoAlante = false;
        }
        this.totalFotos -= 1;
        if(this.totalFotos == 1){
          this.iconoAtras = false;
          this.iconoAlante = false;
        }
        this.cargar_imagen = false;
        this.cargarDatos();
      },(err) =>{
        this.cargar_imagen = false;
        const msgerror = err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo';
        Swal.fire({icon: 'error', title: 'Oops...', text: msgerror,});
      });
    }

  cancelUpdatePictures(){
    this.uploadedFiles = [];
    this.nameFileForm = 'Seleccione ficheros';
  }

  mapaCoordenadas(){

    Swal.fire({
      html:
      '<style>.swal2-popup{border-radius: 1.75rem !important;}.swal2-confirm{}.swal2-styled{border-radius:12px !important;}</style><h4>Coordenadas seleccionadas: </h4>'+'<h5 id="coordS">'+this.coordss+'</h5>'+'<div id="mapp" class="map-container" style="width: 600px; height: 300px; z-index: 88888;"></div>',
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonColor: "var(--azulOscuroSidebar)",
      cancelButtonColor: "#d84141",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        if(this.uid == 'nuevo'){
          this.datosFormNew.get('location')?.setValue(this.coordss);
          this.datosFormNew.controls.location.markAsDirty();
        }else{
          //this.datosForm.get('location')?.setValue(this.coordss);
          this.datosForm.controls.location.setValue(this.coordss);
          this.datosForm.controls.location.markAsDirty();
        }
      }
    })

    var vLayer = new VectorLayer({
      source: this.vectorSource
  })

    var checkExist = setInterval(() => {
      var mapaa = document.getElementById('mapp');
      if (mapaa) {

        var olview = new View({ center: [-412281,4920000], zoom: 1, maxZoom: 100,
          extent:  [-1280625.5346, 4057554.2271,
            902204.1819, 5514906.0575] }),
        baseLayer = new TileLayer({ source: new OSM() }),
        map = new Map({
          target: 'mapp',
          view: olview,
          layers: [baseLayer, vLayer]
        });

        //Instantiate with some options and add the Control
        var geocoderr = new geocoder('nominatim', {
          provider: 'bing',
          lang: 'es',
          placeholder: 'Buscar lugar...',
          key: 'AhLGQ1690S_nBOr_qnQ8E-3vSSWNH3hQ5fcxTV6opAmWyGqailuua_hf8aggwZ3r',
          limit: 5,
          debug: false,
          autoComplete: true,
          keepOpen: true
        });
        map.addControl(geocoderr);

        //Listen when an address is chosen
        geocoderr.on('addresschosen', function (evt) {
          window.setTimeout(function () {
          }, 3000);
        });

        var note = document.querySelector('.ol-attribution') as HTMLElement;
        note.style.display = "none";

        map.on('singleclick',  (evt) => {
          var converted = transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
          this.coordss = converted[0]+" "+converted[1];
          let myContainer = document.getElementById('coordS') as HTMLInputElement;
          myContainer.value = this.coordss;
          this.coordssOrig = evt.coordinate;
          if(this.coordssOrig!=null){
            addMarker(this.coordssOrig);
          }
          this.mapaCoordenadas();
        });

        clearInterval(checkExist);
      }
   }, 100); // check every 100ms

  const addMarker = (coordinates) => {
    this.vectorSource.removeFeature(this.vectorSource.getFeatures()[0]);
    var marker = new Feature(new Point(coordinates));
    var zIndex = 1;
    marker.setStyle(new Style({
      image: new Icon(({
        anchor: [0.5, 1],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        scale: [.04,.04],
        opacity: 1,
        src: "../../../../assets/images/markers/mark.png"
      })),
      zIndex: zIndex
    }));
    this.vectorSource.addFeature(marker);
    //vectorSource.addFeature(marker);
  }

  }

}


