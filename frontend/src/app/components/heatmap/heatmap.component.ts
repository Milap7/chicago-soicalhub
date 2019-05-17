import { Component, OnInit } from '@angular/core';

import { google } from 'google-maps';
import { PlacesService } from 'src/app/places.service';
import { Router } from '@angular/router';
import {HttpClient} from "@angular/common/http";

import {Station} from "../../station";
declare var google:any
var coordinates = [];

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css'],
  // styles:['agm-map:{ width:1682px; height:700px;']
})
export class HeatmapComponent implements OnInit {
  chicagoLatitude = 41.882607;
  chicagoLongitude = -87.643548;
  constructor(private placesService: PlacesService, private router: Router, private http: HttpClient) { }
  map: google.maps.Map;
  heatmap : google.maps.visualization.HeatmapLayer = null;
  zoom: number=14;
  mapType ='roadmap';
  coordinates_actual = [];
  numHours = 1;
  currenTime: String
  
  
  ngOnInit() {
    console.log("Start Heat Map\n");
    console.log("Coordinates array " + coordinates.length);
    this.map = null;
    coordinates = [];
    this.placesService.find_divvyHeatMap(this.numHours).subscribe((data: Station[]) => {
      this.currenTime = data[data.length-1].lastCommunicationTime;
      document.getElementById('timestamp').style.color = 'white';
      document.getElementById('timestamp').innerText = this.currenTime.toString();
      setTimeout(function() {
        document.getElementById('timestamp').style.color = 'black';
      }, 200);
      for(var i = 0; i<data.length; i++) {
        let locationArray = {
          location: new google.maps.LatLng(data[i].latitude, data[i].longitude), weight:data[i].availabledocks
        }
        coordinates.push(locationArray);
      }
      this.heatmap = new google.maps.visualization.HeatmapLayer({
        map:this.map,
        data:coordinates
      });
    });
    var _this = this;
      setTimeout(function() {
        
        _this.ngOnInit();
        
        
      }, 126000);
  }

  changeInterval(numHours) {
    if(numHours == 1) {
      this.numHours = 1;
      this.ngOnInit();
    } else if(numHours == 24) {
      this.numHours = 24;
      this.ngOnInit();
    }else {
      this.numHours = 168;
      this.ngOnInit();
    }
    
  }

  onMapLoad(mapInstance: google.maps.Map) {
    this.map=mapInstance;
  }

  sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

}
