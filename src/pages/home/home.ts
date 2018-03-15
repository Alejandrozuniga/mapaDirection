import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  pointA: any;
  pointB: any;
  responseRoutesGoogle: any;
  steps: any ;

  constructor(public navCtrl: NavController, public geolocation: Geolocation, private _ngZone: NgZone) {
    this.pointA = { lat: 2.449015, lng: -76.594653 };
    this.pointB = { lat: 2.450601, lng: -76.590726 };
  }

  ionViewDidLoad() {
    this.loadMap();
  }

  loadMap() {
    this.geolocation.getCurrentPosition().then((position) => {
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.eventClickMap();
      this.startNavigating();
    }, (err) => {
      console.log(err);
    });
  }

  /**
   * Agrega marcador en el centro del mapa
   */
  addMarker() {
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });
    let content = "<h4>Information!</h4>";
    this.addInfoWindow(marker, content);
  }

  /**
   * Añade evento click al marcardor cuando se da click
   * @param marker 
   * @param content Html que se muestra en el marker 
   */
  addInfoWindow(marker, content) {
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  /**
   * Se traza la ruta entre dos puntos 
   * 
   */
  startNavigating() {
    let directionsService = new google.maps.DirectionsService;
    directionsService.route({
      origin: this.pointA,
      destination: this.pointB,
      travelMode: google.maps.TravelMode['DRIVING']
    }, (res, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        this.steps=res.routes[0].legs[0].steps;
        this._ngZone.run(()=>{}); //actualiza view
        this.responseRoutesGoogle = res.routes[0].overview_path;
        this.drawRoute(this.responseRoutesGoogle);
      } else {
        console.warn(status);
      }
    });
  }

  /**
   * 
   * @param arrayPointRoute Array de cooredenadas brindadas por google maps para trazar ruta
   */
  drawRoute(arrayPointRoute: any[]) {
    let coordenadas: any[] = [];
    for (let point of arrayPointRoute) {
      coordenadas.push({ lat: point.lat(), lng: point.lng() });
    }
    var flightPath = new google.maps.Polyline({
      path: coordenadas,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    flightPath.setMap(this.map);
    this.eventClickPolyline(flightPath);
  }

  evaluatePoint(pointToEvaluate) {
    let evaluation = false;
    var polyline = new google.maps.Polyline({
      path: this.responseRoutesGoogle
    });
    this.promiseLocationOnEdge(pointToEvaluate, polyline).then((res) => {
      if (res) {
        alert("Pasa sobre la ruta")
      } else {
        alert("No pasa sobre la ruta")
      }
    });
  }

  promiseLocationOnEdge(pointToEvaluate, polyline) {
    let promise = new Promise((resolve, reject) => {
      let evaluation = google.maps.geometry.poly.isLocationOnEdge(pointToEvaluate, polyline, 0.000065);
      resolve(evaluation);
    });
    return promise;
  }


  eventClickMap() {
    let self = this;
    google.maps.event.addListener(this.map, 'click', function (event) {
      let pointToEvaluate = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
      self.evaluatePoint(pointToEvaluate);
    });
  }

  eventClickPolyline(polilyne:any){
    google.maps.event.addListener(polilyne, 'click', function (event) {
      alert("Pasa por la ruta");
    });
  }

}