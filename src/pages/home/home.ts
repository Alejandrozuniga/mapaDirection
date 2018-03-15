import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('directionsPanel') directionsPanel: ElementRef;
  map: any;

  constructor(public navCtrl: NavController, public geolocation: Geolocation) {

  }

  ionViewDidLoad() {
    this.loadMap();

  }

  loadMap() {

    this.geolocation.getCurrentPosition().then((position) => {

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.startNavigating();
    }, (err) => {
      console.log(err);
    });

  }

  addMarker() {

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<h4>Information!</h4>";

    this.addInfoWindow(marker, content);

  }

  addInfoWindow(marker, content) {

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }


  startNavigating() {

    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;

    directionsDisplay.setMap(this.map);
    directionsDisplay.setPanel(this.directionsPanel.nativeElement);

    directionsService.route({
      origin: { lat: 2.449015, lng: -76.594653 },
      destination: { lat: 2.450601, lng: -76.590726 },
      travelMode: google.maps.TravelMode['DRIVING']
    }, (res, status) => {

      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(res);
        this.armarArregloRoutes(res);
      } else {
        console.warn(status);
      }

    });

  }

  armarArregloRoutes(res: any) {
    let overview_path = res.routes[0].overview_path;
    let arrayPoints = [];
    for (let point of overview_path) {
      arrayPoints.push(new google.maps.LatLng(point.lat(), point.lng()));
    }
    this.evaluatePoint(overview_path);
  }

  evaluatePoint(arrayRoutes) {
    var polyline = new google.maps.Polyline({
      path: arrayRoutes
    })

    let myPosition = new google.maps.LatLng(2.448737, -76.593889);
   //  google.maps.event.addListener(this.map,'bounds_changed', function() {
       if (google.maps.geometry.poly.isLocationOnEdge(myPosition, polyline, 10e-1)) {
         alert("Relocate!");
       }
       
   //  });

  }

}